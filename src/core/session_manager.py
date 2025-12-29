"""
Session Management System
Quản lý phiên chat và context của người dùng
"""

import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from loguru import logger
import asyncio

from .config import settings
from ..database.models import ChatSession
from ..database.database import async_session
from sqlalchemy import text

# Try to import Redis
try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available, using in-memory storage")

class SessionManager:
    """Manages chat sessions and user context"""
    
    def __init__(self):
        self.redis_client = None
        self.is_initialized = False
        self._memory_sessions = {}  # Fallback storage
        
    async def initialize(self):
        """Initialize Redis connection or use in-memory storage"""
        if settings.USE_REDIS and REDIS_AVAILABLE:
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # Test connection
                await self.redis_client.ping()
            
            self.is_initialized = True
                logger.info("Session manager initialized with Redis")
            
        except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}. Using in-memory storage.")
            self.redis_client = None
                self.is_initialized = True
        else:
            logger.info("Using in-memory session storage")
            self.is_initialized = True
    
    async def get_or_create_session(
        self, 
        user_id: str, 
        session_id: Optional[str] = None
    ) -> ChatSession:
        """
        Get existing session or create new one
        
        Args:
            user_id: ID của học viên
            session_id: ID phiên chat (optional)
            
        Returns:
            ChatSession object
        """
        try:
            # If session_id provided, try to get existing session
            if session_id:
                session = await self._get_session_by_id(session_id)
                if session and session.is_active:
                    return session
            
            # Create new session
            new_session_id = str(uuid.uuid4())
            session = ChatSession(
                id=new_session_id,
                user_id=user_id,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                is_active=True,
                context_data=json.dumps({
                    "user_preferences": {},
                    "topics_discussed": [],
                    "last_message": None
                })
            )
            
            # Save to database
            async with async_session() as db:
                db.add(session)
                await db.commit()
                await db.refresh(session)
            
            # Cache in Redis or memory
            await self._cache_session(session)
            
            logger.info(f"Created new session {new_session_id} for user {user_id}")
            return session
            
        except Exception as e:
            logger.error(f"Error getting/creating session: {e}")
            raise
    
    async def _get_session_by_id(self, session_id: str) -> Optional[ChatSession]:
        """Get session by ID"""
        try:
            # Try cache first
            cached = await self._get_cached_session(session_id)
            if cached:
                return cached
            
            # Query database using ORM
            async with async_session() as db:
                from sqlalchemy import select
                result = await db.execute(
                    select(ChatSession).where(
                        ChatSession.id == session_id,
                        ChatSession.is_active == True
                    )
                )
                session = result.scalar_one_or_none()
                if session:
                    await self._cache_session(session)
                return session
                
            return None
            
        except Exception as e:
            logger.error(f"Error getting session by ID: {e}")
            return None
    
    async def update_session_context(
        self, 
        session_id: str, 
        message: str, 
        response: Dict[str, Any],
        user_profile: Optional[Dict[str, Any]] = None
    ):
        """Update session context"""
        try:
            session = await self._get_session_by_id(session_id)
            if not session:
                return
            
            # Parse existing context
            try:
                context = json.loads(session.context_data) if session.context_data else {}
            except:
                context = {}
            
            # Update context
            context["last_message"] = message
            context["last_response"] = response.get("text", "")
            context["last_updated"] = datetime.now().isoformat()
            
            if user_profile:
                context["user_profile"] = user_profile
            
            # Update topics discussed
            if "topics_discussed" not in context:
                context["topics_discussed"] = []
            
            # Simple topic extraction (có thể cải thiện)
            keywords = ["khóa học", "học tập", "thanh toán", "chứng chỉ", "giảng viên"]
            for keyword in keywords:
                if keyword in message.lower() and keyword not in context["topics_discussed"]:
                    context["topics_discussed"].append(keyword)
            
            # Save to database
            session.context_data = json.dumps(context)
            session.updated_at = datetime.now()
            
            async with async_session() as db:
                from sqlalchemy import update
                await db.execute(
                    update(ChatSession)
                    .where(ChatSession.id == session_id)
                    .values(
                        context_data=session.context_data,
                        updated_at=session.updated_at
                    )
                )
                await db.commit()
            
            # Update cache
            await self._cache_session(session)
            
        except Exception as e:
            logger.error(f"Error updating session context: {e}")
    
    async def get_user_sessions(self, user_id: str) -> List[ChatSession]:
        """Get all active sessions for a user"""
        try:
            async with async_session() as db:
                from sqlalchemy import select
                result = await db.execute(
                    select(ChatSession).where(
                        ChatSession.user_id == user_id,
                        ChatSession.is_active == True
                    ).order_by(ChatSession.updated_at.desc())
                )
                sessions = result.scalars().all()
                return list(sessions)
                
        except Exception as e:
            logger.error(f"Error getting user sessions: {e}")
            return []
    
    async def end_session(self, session_id: str):
        """End a session"""
        try:
            async with async_session() as db:
                from sqlalchemy import update
                await db.execute(
                    update(ChatSession)
                    .where(ChatSession.id == session_id)
                    .values(is_active=False)
                )
                await db.commit()
            
            # Remove from cache
            await self._remove_cached_session(session_id)
            
            logger.info(f"Ended session {session_id}")
            
        except Exception as e:
            logger.error(f"Error ending session: {e}")
    
    async def get_session_context(self, session_id: str) -> Dict[str, Any]:
        """Get session context"""
        try:
            session = await self._get_session_by_id(session_id)
            if session and session.context_data:
                return json.loads(session.context_data)
                return {}
        except Exception as e:
            logger.error(f"Error getting session context: {e}")
            return {}
    
    async def _cache_session(self, session: ChatSession):
        """Cache session in Redis or memory"""
        try:
            if self.redis_client:
                await self.redis_client.setex(
                    f"session:{session.id}",
                    settings.SESSION_TIMEOUT,
                    json.dumps({
                        "id": session.id,
                        "user_id": session.user_id,
                        "context_data": session.context_data,
                        "created_at": session.created_at.isoformat(),
                        "updated_at": session.updated_at.isoformat(),
                        "is_active": session.is_active
                    })
                )
            else:
                self._memory_sessions[session.id] = {
                    "session": session,
                    "expires_at": datetime.now() + timedelta(seconds=settings.SESSION_TIMEOUT)
                }
        except Exception as e:
            logger.error(f"Error caching session: {e}")
    
    async def _get_cached_session(self, session_id: str) -> Optional[ChatSession]:
        """Get cached session"""
        try:
            if self.redis_client:
                cached = await self.redis_client.get(f"session:{session_id}")
                if cached:
                    data = json.loads(cached)
                    return ChatSession(
                        id=data["id"],
                        user_id=data["user_id"],
                        created_at=datetime.fromisoformat(data["created_at"]),
                        updated_at=datetime.fromisoformat(data["updated_at"]),
                        is_active=data["is_active"],
                        context_data=data["context_data"]
                    )
            else:
                if session_id in self._memory_sessions:
                    cached_data = self._memory_sessions[session_id]
                    if datetime.now() < cached_data["expires_at"]:
                        return cached_data["session"]
                    else:
                        del self._memory_sessions[session_id]
            
            return None
        except Exception as e:
            logger.error(f"Error getting cached session: {e}")
            return None
    
    async def _remove_cached_session(self, session_id: str):
        """Remove session from cache"""
        try:
            if self.redis_client:
                await self.redis_client.delete(f"session:{session_id}")
            else:
                self._memory_sessions.pop(session_id, None)
        except Exception as e:
            logger.error(f"Error removing cached session: {e}")

"""
Session Management System
Quản lý phiên chat và context của người dùng
"""

import redis
import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from loguru import logger
import asyncio

from .config import settings
from ..database.models import ChatSession
from ..database.database import get_db_session

class SessionManager:
    """Manages chat sessions and user context"""
    
    def __init__(self):
        self.redis_client = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # Test connection
            await asyncio.to_thread(self.redis_client.ping)
            
            self.is_initialized = True
            logger.info("Session manager initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize session manager: {e}")
            # Fallback to in-memory storage for development
            self.redis_client = None
            self._memory_sessions = {}
            self.is_initialized = True
            logger.warning("Using in-memory session storage")
    
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
                if session:
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
                    "conversation_topics": [],
                    "last_activity": datetime.now().isoformat()
                })
            )
            
            # Save to database
            async with get_db_session() as db:
                db.add(session)
                await db.commit()
                await db.refresh(session)
            
            # Cache in Redis
            await self._cache_session(session)
            
            logger.info(f"Created new session {new_session_id} for user {user_id}")
            return session
            
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            raise
    
    async def _get_session_by_id(self, session_id: str) -> Optional[ChatSession]:
        """Get session by ID from cache or database"""
        try:
            # Try Redis cache first
            if self.redis_client:
                cached_session = await asyncio.to_thread(
                    self.redis_client.get, 
                    f"session:{session_id}"
                )
                if cached_session:
                    session_data = json.loads(cached_session)
                    return ChatSession(**session_data)
            
            # Fallback to database
            async with get_db_session() as db:
                session = await db.query(ChatSession)\
                    .filter(ChatSession.id == session_id)\
                    .filter(ChatSession.is_active == True)\
                    .first()
                
                if session:
                    await self._cache_session(session)
                
                return session
                
        except Exception as e:
            logger.error(f"Error getting session: {e}")
            return None
    
    async def _cache_session(self, session: ChatSession):
        """Cache session in Redis"""
        if not self.redis_client:
            return
        
        try:
            session_data = {
                "id": session.id,
                "user_id": session.user_id,
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat(),
                "is_active": session.is_active,
                "context_data": session.context_data
            }
            
            await asyncio.to_thread(
                self.redis_client.setex,
                f"session:{session.id}",
                settings.SESSION_TIMEOUT,
                json.dumps(session_data)
            )
            
        except Exception as e:
            logger.error(f"Error caching session: {e}")
    
    async def update_session_context(
        self, 
        session_id: str, 
        user_message: str, 
        bot_response: str
    ):
        """Update session context with new conversation"""
        try:
            session = await self._get_session_by_id(session_id)
            if not session:
                return
            
            # Parse existing context
            context = json.loads(session.context_data)
            
            # Update context
            context["last_activity"] = datetime.now().isoformat()
            
            # Add conversation topics (simple keyword extraction)
            topics = self._extract_topics(user_message)
            context["conversation_topics"].extend(topics)
            
            # Keep only recent topics
            context["conversation_topics"] = list(set(context["conversation_topics"]))[-10:]
            
            # Update user preferences based on conversation
            self._update_user_preferences(context, user_message, bot_response)
            
            # Update session in database
            session.context_data = json.dumps(context)
            session.updated_at = datetime.now()
            
            async with get_db_session() as db:
                await db.merge(session)
                await db.commit()
            
            # Update cache
            await self._cache_session(session)
            
        except Exception as e:
            logger.error(f"Error updating session context: {e}")
    
    def _extract_topics(self, message: str) -> List[str]:
        """Extract topics from user message"""
        topics = []
        
        # Simple keyword-based topic extraction
        topic_keywords = {
            "khóa học": "courses",
            "giảng viên": "instructors", 
            "học tập": "learning",
            "thanh toán": "payment",
            "kỹ thuật": "technical",
            "đăng ký": "registration",
            "mật khẩu": "password",
            "video": "video",
            "bài tập": "assignments",
            "chứng chỉ": "certificates"
        }
        
        message_lower = message.lower()
        for keyword, topic in topic_keywords.items():
            if keyword in message_lower:
                topics.append(topic)
        
        return topics
    
    def _update_user_preferences(
        self, 
        context: Dict[str, Any], 
        user_message: str, 
        bot_response: str
    ):
        """Update user preferences based on conversation"""
        preferences = context.get("user_preferences", {})
        
        # Extract preferences from conversation
        if "khóa học" in user_message.lower():
            preferences["interested_in_courses"] = True
        
        if "giảng viên" in user_message.lower():
            preferences["interested_in_instructors"] = True
        
        if "thanh toán" in user_message.lower():
            preferences["has_payment_questions"] = True
        
        context["user_preferences"] = preferences
    
    async def get_user_sessions(self, user_id: str) -> List[ChatSession]:
        """Get all active sessions for a user"""
        try:
            async with get_db_session() as db:
                sessions = await db.query(ChatSession)\
                    .filter(ChatSession.user_id == user_id)\
                    .filter(ChatSession.is_active == True)\
                    .order_by(ChatSession.updated_at.desc())\
                    .limit(10)\
                    .all()
                
                return sessions
                
        except Exception as e:
            logger.error(f"Error getting user sessions: {e}")
            return []
    
    async def end_session(self, session_id: str):
        """End a chat session"""
        try:
            session = await self._get_session_by_id(session_id)
            if not session:
                return
            
            # Mark as inactive
            session.is_active = False
            session.updated_at = datetime.now()
            
            async with get_db_session() as db:
                await db.merge(session)
                await db.commit()
            
            # Remove from cache
            if self.redis_client:
                await asyncio.to_thread(
                    self.redis_client.delete, 
                    f"session:{session_id}"
                )
            
            logger.info(f"Ended session {session_id}")
            
        except Exception as e:
            logger.error(f"Error ending session: {e}")
    
    async def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        try:
            cutoff_time = datetime.now() - timedelta(seconds=settings.SESSION_TIMEOUT)
            
            async with get_db_session() as db:
                expired_sessions = await db.query(ChatSession)\
                    .filter(ChatSession.updated_at < cutoff_time)\
                    .filter(ChatSession.is_active == True)\
                    .all()
                
                for session in expired_sessions:
                    session.is_active = False
                    await db.merge(session)
                
                await db.commit()
                
                logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
                
        except Exception as e:
            logger.error(f"Error cleaning up expired sessions: {e}")
    
    async def get_session_context(self, session_id: str) -> Dict[str, Any]:
        """Get session context data"""
        try:
            session = await self._get_session_by_id(session_id)
            if not session:
                return {}
            
            return json.loads(session.context_data)
            
        except Exception as e:
            logger.error(f"Error getting session context: {e}")
            return {}
    
    async def update_session_preferences(
        self, 
        session_id: str, 
        preferences: Dict[str, Any]
    ):
        """Update user preferences for a session"""
        try:
            session = await self._get_session_by_id(session_id)
            if not session:
                return
            
            context = json.loads(session.context_data)
            context["user_preferences"].update(preferences)
            
            session.context_data = json.dumps(context)
            session.updated_at = datetime.now()
            
            async with get_db_session() as db:
                await db.merge(session)
                await db.commit()
            
            await self._cache_session(session)
            
        except Exception as e:
            logger.error(f"Error updating session preferences: {e}")
    
    def get_session_stats(self) -> Dict[str, Any]:
        """Get session statistics"""
        try:
            if self.redis_client:
                # Get Redis stats
                info = self.redis_client.info()
                return {
                    "redis_connected": True,
                    "redis_memory_used": info.get("used_memory_human", "Unknown"),
                    "redis_connected_clients": info.get("connected_clients", 0)
                }
            else:
                return {
                    "redis_connected": False,
                    "memory_sessions": len(getattr(self, '_memory_sessions', {}))
                }
                
        except Exception as e:
            logger.error(f"Error getting session stats: {e}")
            return {"error": str(e)}

"""
API Dependencies
"""

from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Generator, Optional
import httpx
from loguru import logger
from jose import JWTError, jwt

from ..core.chatbot import GeminiChatbot as ElearningChatbot
from ..core.session_manager import SessionManager
from ..core.config import settings

# Security
security = HTTPBearer(auto_error=False)

# Global instances
_chatbot_instance = None
_session_manager_instance = None

# Rate limiting storage (in-memory, có thể chuyển sang Redis)
_rate_limit_storage = {}

async def get_chatbot() -> ElearningChatbot:
    """Get chatbot instance"""
    global _chatbot_instance
    
    if _chatbot_instance is None:
        from ..core.chatbot import GeminiChatbot
        _chatbot_instance = GeminiChatbot()
        await _chatbot_instance.initialize()
    
    return _chatbot_instance

async def get_session_manager() -> SessionManager:
    """Get session manager instance"""
    global _session_manager_instance
    
    if _session_manager_instance is None:
        _session_manager_instance = SessionManager()
        await _session_manager_instance.initialize()
    
    return _session_manager_instance

async def verify_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    authorization: Optional[str] = Header(None)
) -> str:
    """Verify JWT token and return user_id"""
    try:
        # Get token from Bearer or Header
        token = None
        if credentials:
            token = credentials.credentials
        elif authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
        
        if not token:
            # For development, allow requests without token (return mock user_id)
            logger.warning("No token provided, using mock user_id")
            return "user_1"  # Mock user for testing
        
        # Verify JWT token
        try:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            user_id = payload.get("id") or payload.get("sub") or payload.get("user_id")
            
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            return str(user_id)
            
        except JWTError as e:
            logger.warning(f"JWT decode error: {e}. Trying to verify with Java backend...")
            
            # Try to verify with Java backend
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.get(
                        f"{settings.JAVA_BACKEND_URL}/api/user/profile",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    
                    if response.status_code == 200:
                        user_data = response.json()
                        user_id = user_data.get("id") or user_data.get("userId")
                        if user_id:
                            return str(user_id)
            except Exception as backend_error:
                logger.error(f"Backend verification failed: {backend_error}")
            
            # If all verification fails, return mock for development
            logger.warning("Token verification failed, using mock user_id for development")
            return "user_1"
        
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        # For development, return mock user_id instead of raising error
        return "user_1"

async def get_java_backend_context(user_id: str) -> dict:
    """Get user context from Java backend"""
    try:
        async with httpx.AsyncClient(timeout=settings.JAVA_BACKEND_TIMEOUT) as client:
            response = await client.get(
                f"{settings.JAVA_BACKEND_URL}/api/chat/context",
                params={"userId": user_id}
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to get context from Java backend: {response.status_code}")
                return {}
                
    except Exception as e:
        logger.error(f"Error getting context from Java backend: {e}")
        return {}

def rate_limit_check(user_id: str) -> bool:
    """Check if user has exceeded rate limit"""
    import time
    
    current_time = time.time()
    minute_key = f"{user_id}:minute"
    hour_key = f"{user_id}:hour"
    
    # Check minute limit
    if minute_key in _rate_limit_storage:
        count, window_start = _rate_limit_storage[minute_key]
        if current_time - window_start < 60:
            if count >= settings.RATE_LIMIT_PER_MINUTE:
                return False
            _rate_limit_storage[minute_key] = (count + 1, window_start)
        else:
            _rate_limit_storage[minute_key] = (1, current_time)
    else:
        _rate_limit_storage[minute_key] = (1, current_time)
    
    # Check hour limit
    if hour_key in _rate_limit_storage:
        count, window_start = _rate_limit_storage[hour_key]
        if current_time - window_start < 3600:
            if count >= settings.RATE_LIMIT_PER_HOUR:
                return False
            _rate_limit_storage[hour_key] = (count + 1, window_start)
        else:
            _rate_limit_storage[hour_key] = (1, current_time)
    else:
        _rate_limit_storage[hour_key] = (1, current_time)
    
    return True

async def get_elearning_courses() -> list:
    """Get courses from Elearning backend"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {settings.ELEARNING_API_KEY}",
                "Content-Type": "application/json"
            }
            
            response = await client.get(
                f"{settings.ELEARNING_API_BASE_URL}/courses",
                headers=headers,
                timeout=10.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to get courses: {response.status_code}")
                return []
                
    except Exception as e:
        logger.error(f"Error getting courses: {e}")
        return []

def rate_limit_check(user_id: str) -> bool:
    """Check if user has exceeded rate limit"""
    # Implement rate limiting logic here
    # For now, always return True
    return True

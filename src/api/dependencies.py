"""
API Dependencies
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Generator
import httpx
from loguru import logger

from ..core.chatbot import ElearningChatbot
from ..core.session_manager import SessionManager
from ..core.config import settings

# Security
security = HTTPBearer()

# Global instances
_chatbot_instance = None
_session_manager_instance = None

async def get_chatbot() -> ElearningChatbot:
    """Get chatbot instance"""
    global _chatbot_instance
    
    if _chatbot_instance is None:
        _chatbot_instance = ElearningChatbot()
        await _chatbot_instance.initialize()
    
    return _chatbot_instance

async def get_session_manager() -> SessionManager:
    """Get session manager instance"""
    global _session_manager_instance
    
    if _session_manager_instance is None:
        _session_manager_instance = SessionManager()
        await _session_manager_instance.initialize()
    
    return _session_manager_instance

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify JWT token and return user_id"""
    try:
        # In production, implement proper JWT verification
        # For now, return a mock user_id
        token = credentials.credentials
        
        # Mock token verification
        if token == "test_token":
            return "user_123"
        
        # In real implementation, decode JWT and extract user_id
        # user_id = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])["user_id"]
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_elearning_user_data(user_id: str) -> dict:
    """Get user data from Elearning backend"""
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {settings.ELEARNING_API_KEY}",
                "Content-Type": "application/json"
            }
            
            response = await client.get(
                f"{settings.ELEARNING_API_BASE_URL}/users/{user_id}",
                headers=headers,
                timeout=10.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Failed to get user data: {response.status_code}")
                return {}
                
    except Exception as e:
        logger.error(f"Error getting user data: {e}")
        return {}

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

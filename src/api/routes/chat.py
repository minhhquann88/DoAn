"""
Chat API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from loguru import logger

from ..core.chatbot import ElearningChatbot
from ..core.session_manager import SessionManager
from .dependencies import get_chatbot, get_session_manager, verify_token, rate_limit_check

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str
    confidence: float
    sources: List[str]
    suggestions: List[str]

class SessionInfo(BaseModel):
    session_id: str
    user_id: str
    created_at: str
    updated_at: str
    is_active: bool
    context_data: Dict[str, Any]

@router.post("/send", response_model=ChatResponse)
async def send_message(
    chat_message: ChatMessage,
    chatbot: ElearningChatbot = Depends(get_chatbot),
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Gửi tin nhắn đến chatbot và nhận phản hồi
    """
    try:
        # Check rate limit
        if not rate_limit_check(user_id):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        
        # Process message
        result = await chatbot.process_message(
            user_id=user_id,
            message=chat_message.message,
            session_id=chat_message.session_id
        )
        
        return ChatResponse(**result)
        
    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process message"
        )

@router.get("/sessions", response_model=List[SessionInfo])
async def get_user_sessions(
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Lấy danh sách phiên chat của người dùng
    """
    try:
        sessions = await session_manager.get_user_sessions(user_id)
        
        return [
            SessionInfo(
                session_id=session.id,
                user_id=session.user_id,
                created_at=session.created_at.isoformat(),
                updated_at=session.updated_at.isoformat(),
                is_active=session.is_active,
                context_data=session.context_data
            )
            for session in sessions
        ]
        
    except Exception as e:
        logger.error(f"Error getting user sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get sessions"
        )

@router.post("/sessions/{session_id}/end")
async def end_session(
    session_id: str,
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Kết thúc phiên chat
    """
    try:
        await session_manager.end_session(session_id)
        return {"message": "Session ended successfully"}
        
    except Exception as e:
        logger.error(f"Error ending session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to end session"
        )

@router.get("/sessions/{session_id}/context")
async def get_session_context(
    session_id: str,
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Lấy context của phiên chat
    """
    try:
        context = await session_manager.get_session_context(session_id)
        return {"context": context}
        
    except Exception as e:
        logger.error(f"Error getting session context: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get session context"
        )

@router.post("/sessions/{session_id}/preferences")
async def update_session_preferences(
    session_id: str,
    preferences: Dict[str, Any],
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Cập nhật preferences của phiên chat
    """
    try:
        await session_manager.update_session_preferences(session_id, preferences)
        return {"message": "Preferences updated successfully"}
        
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update preferences"
        )

@router.get("/suggestions")
async def get_suggestions(
    query: str,
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Lấy gợi ý dựa trên query
    """
    try:
        suggestions = await chatbot.suggest_courses(user_id, query)
        return {"suggestions": suggestions}
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get suggestions"
        )

@router.get("/profile")
async def get_user_profile(
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Lấy profile học tập của người dùng
    """
    try:
        profile = await chatbot.get_user_learning_profile(user_id)
        return {"profile": profile}
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )

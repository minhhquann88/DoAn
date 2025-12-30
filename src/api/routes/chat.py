"""
Chat API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from loguru import logger
import json

from ..dependencies import (
    get_chatbot, 
    get_session_manager, 
    verify_token, 
    rate_limit_check
)
from ...core.chatbot import GeminiChatbot
from ...core.session_manager import SessionManager

# Alias for backward compatibility with other routes
ElearningChatbot = GeminiChatbot

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

@router.post("/message", response_model=ChatResponse)
@router.post("/send", response_model=ChatResponse)
async def send_message(
    chat_message: ChatMessage,
    chatbot: ElearningChatbot = Depends(get_chatbot),
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Gửi tin nhắn đến chatbot và nhận phản hồi
    
    Request:
    {
        "message": "Tôi muốn học lập trình Java",
        "session_id": "optional-session-id"
    }
    
    Response:
    {
        "response": "Chào bạn! Tôi có thể giúp bạn tìm khóa học lập trình Java...",
        "session_id": "uuid",
        "timestamp": "2025-01-22T10:00:00",
        "confidence": 0.85,
        "sources": ["Knowledge Base", "Course: Java Basics"],
        "suggestions": ["Khóa học Java cơ bản", "Khóa học Java nâng cao"]
    }
    """
    try:
        # Check rate limit
        if not rate_limit_check(user_id):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Bạn đã gửi quá nhiều tin nhắn. Vui lòng đợi một chút rồi thử lại."
            )
        
        # Process message
        result = await chatbot.process_message(
            user_id=user_id,
            message=chat_message.message,
            session_id=chat_message.session_id
        )
        
        return ChatResponse(
            response=result.get("response", ""),
            session_id=result.get("session_id", ""),
            timestamp=result.get("timestamp", datetime.now().isoformat()),
            confidence=result.get("confidence", 0.0),
            sources=result.get("sources", []),
            suggestions=result.get("suggestions", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi xử lý tin nhắn: {str(e)}"
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
                context_data=json.loads(session.context_data) if session.context_data else {}
            )
            for session in sessions
        ]
        
    except Exception as e:
        logger.error(f"Error getting user sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi khi lấy danh sách phiên chat"
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
        return {"message": "Phiên chat đã được kết thúc thành công"}
        
    except Exception as e:
        logger.error(f"Error ending session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi khi kết thúc phiên chat"
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
            detail="Lỗi khi lấy context"
        )

@router.get("/history/{session_id}")
async def get_conversation_history(
    session_id: str,
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Lấy lịch sử hội thoại của một session
    """
    try:
        history = await chatbot._get_conversation_history(session_id)
        return {"session_id": session_id, "history": history}
        
    except Exception as e:
        logger.error(f"Error getting conversation history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi khi lấy lịch sử hội thoại"
        )

@router.delete("/history/{session_id}")
async def delete_conversation_history(
    session_id: str,
    user_id: str = Depends(verify_token)
):
    """
    Xóa lịch sử hội thoại của một session
    """
    try:
        from sqlalchemy import delete
        from ...database.database import async_session
        from ...database.models import ChatMessage
        
        async with async_session() as db:
            await db.execute(
                delete(ChatMessage).where(ChatMessage.session_id == session_id)
            )
            await db.commit()
        
        return {"message": "Đã xóa lịch sử hội thoại thành công"}
        
    except Exception as e:
        logger.error(f"Error deleting conversation history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Lỗi khi xóa lịch sử hội thoại"
        )

@router.get("/context")
async def get_chat_context(
    user_id: str = Depends(verify_token)
):
    """
    Lấy context cho chatbot (tích hợp với Java backend)
    """
    from ..dependencies import get_java_backend_context
    context = await get_java_backend_context(user_id)
    return context

    try:
        profile = await chatbot.get_user_learning_profile(user_id)
        return {"profile": profile}
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )

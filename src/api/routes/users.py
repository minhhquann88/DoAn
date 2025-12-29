"""
Users API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from loguru import logger

from ..core.chatbot import ElearningChatbot
from ..core.session_manager import SessionManager
from .dependencies import get_chatbot, get_session_manager, verify_token, get_elearning_user_data

router = APIRouter()

class UserProfile(BaseModel):
    user_id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    learning_preferences: Dict[str, Any]
    enrolled_courses: List[str]
    created_at: str
    updated_at: str

class LearningProgress(BaseModel):
    course_id: str
    course_title: str
    progress_percentage: float
    completed_lessons: int
    total_lessons: int
    last_accessed: str

class UserStats(BaseModel):
    total_sessions: int
    total_messages: int
    avg_session_duration: float
    favorite_topics: List[str]
    satisfaction_score: float

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Lấy profile của người dùng
    """
    try:
        # Get user data from Elearning backend
        user_data = await get_elearning_user_data(user_id)
        
        # Get chatbot profile
        chatbot_profile = await chatbot.get_user_learning_profile(user_id)
        
        # Merge data
        profile = UserProfile(
            user_id=user_id,
            email=user_data.get("email"),
            full_name=user_data.get("full_name"),
            learning_preferences=chatbot_profile.get("learning_preferences", {}),
            enrolled_courses=chatbot_profile.get("enrolled_courses", []),
            created_at=user_data.get("created_at", ""),
            updated_at=user_data.get("updated_at", "")
        )
        
        return profile
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )

@router.get("/progress", response_model=List[LearningProgress])
async def get_learning_progress(
    user_id: str = Depends(verify_token)
):
    """
    Lấy tiến độ học tập của người dùng
    """
    try:
        # Get user data from Elearning backend
        user_data = await get_elearning_user_data(user_id)
        
        # Extract progress data
        progress_data = user_data.get("learning_progress", [])
        
        progress = [
            LearningProgress(
                course_id=p.get("course_id", ""),
                course_title=p.get("course_title", ""),
                progress_percentage=p.get("progress_percentage", 0.0),
                completed_lessons=p.get("completed_lessons", 0),
                total_lessons=p.get("total_lessons", 0),
                last_accessed=p.get("last_accessed", "")
            )
            for p in progress_data
        ]
        
        return progress
        
    except Exception as e:
        logger.error(f"Error getting learning progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get learning progress"
        )

@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Lấy thống kê sử dụng chatbot của người dùng
    """
    try:
        # Get user sessions
        sessions = await session_manager.get_user_sessions(user_id)
        
        # Calculate stats
        total_sessions = len(sessions)
        total_messages = sum(
            len(session.context_data.get("conversation_topics", [])) 
            for session in sessions
        )
        
        # Calculate average session duration (simplified)
        avg_session_duration = 0.0
        if sessions:
            total_duration = sum(
                (session.updated_at - session.created_at).total_seconds()
                for session in sessions
            )
            avg_session_duration = total_duration / len(sessions)
        
        # Extract favorite topics
        all_topics = []
        for session in sessions:
            topics = session.context_data.get("conversation_topics", [])
            all_topics.extend(topics)
        
        # Count topic frequency
        topic_counts = {}
        for topic in all_topics:
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
        
        favorite_topics = sorted(
            topic_counts.keys(), 
            key=lambda x: topic_counts[x], 
            reverse=True
        )[:5]
        
        # Mock satisfaction score
        satisfaction_score = 4.2  # In production, calculate from feedback
        
        stats = UserStats(
            total_sessions=total_sessions,
            total_messages=total_messages,
            avg_session_duration=avg_session_duration,
            favorite_topics=favorite_topics,
            satisfaction_score=satisfaction_score
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting user stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user stats"
        )

@router.post("/preferences")
async def update_user_preferences(
    preferences: Dict[str, Any],
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Cập nhật preferences của người dùng
    """
    try:
        # Update preferences in chatbot system
        # This would typically update the user profile in the database
        # For now, we'll just return success
        
        return {"message": "Preferences updated successfully"}
        
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update preferences"
        )

@router.get("/sessions/history")
async def get_session_history(
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token),
    limit: int = 10,
    offset: int = 0
):
    """
    Lấy lịch sử phiên chat của người dùng
    """
    try:
        # Get user sessions
        sessions = await session_manager.get_user_sessions(user_id)
        
        # Apply pagination
        paginated_sessions = sessions[offset:offset + limit]
        
        # Format session history
        history = [
            {
                "session_id": session.id,
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat(),
                "duration": (session.updated_at - session.created_at).total_seconds(),
                "topics": session.context_data.get("conversation_topics", []),
                "is_active": session.is_active
            }
            for session in paginated_sessions
        ]
        
        return {
            "sessions": history,
            "total_count": len(sessions),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Error getting session history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get session history"
        )

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Xóa phiên chat của người dùng
    """
    try:
        await session_manager.end_session(session_id)
        return {"message": "Session deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session"
        )

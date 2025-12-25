"""
Admin API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
from loguru import logger

from ..core.chatbot import ElearningChatbot
from ..core.session_manager import SessionManager
from ..core.rag_system import RAGSystem
from .dependencies import get_chatbot, get_session_manager, verify_token

router = APIRouter()

class SystemStats(BaseModel):
    total_sessions: int
    active_sessions: int
    total_messages: int
    avg_confidence: float
    knowledge_base_size: int
    faq_count: int
    course_count: int

class ChatAnalytics(BaseModel):
    date: str
    total_sessions: int
    total_messages: int
    avg_session_duration: float
    satisfaction_score: float
    top_topics: List[str]

class FAQItem(BaseModel):
    id: str
    question: str
    answer: str
    category: str
    tags: List[str]
    is_active: bool

class KnowledgeBaseItem(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    source: str

@router.get("/stats/system", response_model=SystemStats)
async def get_system_stats(
    chatbot: ElearningChatbot = Depends(get_chatbot),
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Lấy thống kê hệ thống chatbot
    """
    try:
        # Get RAG system stats
        rag_stats = chatbot.rag_system.get_collection_stats()
        
        # Get session manager stats
        session_stats = session_manager.get_session_stats()
        
        # Mock additional stats (in production, get from database)
        stats = SystemStats(
            total_sessions=1000,  # Mock data
            active_sessions=50,
            total_messages=5000,
            avg_confidence=0.85,
            knowledge_base_size=rag_stats.get("knowledge_base", {}).get("total_documents", 0),
            faq_count=rag_stats.get("faq", {}).get("total_faqs", 0),
            course_count=rag_stats.get("courses", {}).get("total_courses", 0)
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting system stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get system stats"
        )

@router.get("/analytics/chat", response_model=List[ChatAnalytics])
async def get_chat_analytics(
    days: int = 7,
    user_id: str = Depends(verify_token)
):
    """
    Lấy phân tích chat theo ngày
    """
    try:
        # Mock analytics data (in production, get from database)
        analytics = []
        
        for i in range(days):
            date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            date = date.replace(day=date.day - i)
            
            analytics.append(ChatAnalytics(
                date=date.isoformat(),
                total_sessions=50 + i * 10,
                total_messages=200 + i * 20,
                avg_session_duration=300.0 + i * 10,
                satisfaction_score=4.0 + i * 0.1,
                top_topics=["courses", "technical", "payment"]
            ))
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting chat analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get chat analytics"
        )

@router.post("/faq", response_model=FAQItem)
async def add_faq(
    question: str,
    answer: str,
    category: str = "general",
    tags: List[str] = [],
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Thêm FAQ mới
    """
    try:
        # Add FAQ to RAG system
        await chatbot.rag_system.add_faq(question, answer, category)
        
        # Return created FAQ
        faq = FAQItem(
            id=f"faq_{hash(question)}",
            question=question,
            answer=answer,
            category=category,
            tags=tags,
            is_active=True
        )
        
        return faq
        
    except Exception as e:
        logger.error(f"Error adding FAQ: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add FAQ"
        )

@router.get("/faq", response_model=List[FAQItem])
async def get_faqs(
    category: Optional[str] = None,
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Lấy danh sách FAQ
    """
    try:
        # Mock FAQ data (in production, get from database)
        faqs = [
            FAQItem(
                id="faq_1",
                question="Làm thế nào để đăng ký khóa học?",
                answer="Bạn có thể đăng ký khóa học bằng cách tạo tài khoản và thanh toán học phí.",
                category="registration",
                tags=["đăng ký", "khóa học"],
                is_active=True
            ),
            FAQItem(
                id="faq_2",
                question="Tôi quên mật khẩu thì làm sao?",
                answer="Bạn có thể nhấn vào 'Quên mật khẩu' trên trang đăng nhập để khôi phục.",
                category="account",
                tags=["mật khẩu", "đăng nhập"],
                is_active=True
            )
        ]
        
        # Filter by category if provided
        if category:
            faqs = [faq for faq in faqs if faq.category == category]
        
        return faqs
        
    except Exception as e:
        logger.error(f"Error getting FAQs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get FAQs"
        )

@router.post("/knowledge/add")
async def add_knowledge_item(
    content: str,
    metadata: Dict[str, Any],
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Thêm item vào knowledge base
    """
    try:
        # Add to RAG system
        await chatbot.rag_system.add_document(content, metadata)
        
        return {"message": "Knowledge item added successfully"}
        
    except Exception as e:
        logger.error(f"Error adding knowledge item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add knowledge item"
        )

@router.post("/courses/sync")
async def sync_courses(
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Đồng bộ khóa học vào knowledge base
    """
    try:
        # Get courses from Elearning backend
        from .dependencies import get_elearning_courses
        courses = await get_elearning_courses()
        
        # Update knowledge base for each course
        for course in courses:
            await chatbot.rag_system.update_course_knowledge(course)
        
        return {
            "message": f"Synced {len(courses)} courses to knowledge base",
            "courses_count": len(courses)
        }
        
    except Exception as e:
        logger.error(f"Error syncing courses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync courses"
        )

@router.post("/sessions/cleanup")
async def cleanup_expired_sessions(
    session_manager: SessionManager = Depends(get_session_manager),
    user_id: str = Depends(verify_token)
):
    """
    Dọn dẹp các phiên chat hết hạn
    """
    try:
        await session_manager.cleanup_expired_sessions()
        return {"message": "Expired sessions cleaned up successfully"}
        
    except Exception as e:
        logger.error(f"Error cleaning up sessions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cleanup sessions"
        )

@router.get("/logs/recent")
async def get_recent_logs(
    limit: int = 100,
    user_id: str = Depends(verify_token)
):
    """
    Lấy log gần đây của hệ thống
    """
    try:
        # Mock log data (in production, get from log files)
        logs = [
            {
                "timestamp": datetime.now().isoformat(),
                "level": "INFO",
                "message": "Chatbot initialized successfully",
                "user_id": "system"
            },
            {
                "timestamp": datetime.now().isoformat(),
                "level": "INFO", 
                "message": "New chat session created",
                "user_id": "user_123"
            }
        ]
        
        return {"logs": logs[:limit]}
        
    except Exception as e:
        logger.error(f"Error getting logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get logs"
        )

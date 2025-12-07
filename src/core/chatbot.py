"""
Core Chatbot Implementation using Gemini Pro API
"""

import google.generativeai as genai
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import asyncio
from loguru import logger

from .config import settings
from .rag_system import RAGSystem
from .session_manager import SessionManager
from ..database.models import ChatSession, ChatMessage
from ..database.database import get_db_session

class ElearningChatbot:
    """Main chatbot class using Gemini Pro API with RAG"""
    
    def __init__(self):
        self.model = None
        self.rag_system = None
        self.session_manager = SessionManager()
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the chatbot with Gemini Pro API"""
        try:
            # Configure Gemini Pro API
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
            
            # Initialize RAG system
            self.rag_system = RAGSystem()
            await self.rag_system.initialize()
            
            self.is_initialized = True
            logger.info("Chatbot initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize chatbot: {e}")
            raise
    
    async def process_message(
        self, 
        user_id: str, 
        message: str, 
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process user message and generate response
        
        Args:
            user_id: ID của học viên
            message: Tin nhắn từ học viên
            session_id: ID phiên chat (optional)
            
        Returns:
            Dict chứa response và metadata
        """
        if not self.is_initialized:
            await self.initialize()
        
        try:
            # Get or create session
            session = await self.session_manager.get_or_create_session(
                user_id=user_id, 
                session_id=session_id
            )
            
            # Retrieve relevant context using RAG
            relevant_context = await self.rag_system.retrieve_context(message)
            
            # Get conversation history
            conversation_history = await self._get_conversation_history(session.id)
            
            # Generate response using Gemini Pro
            response = await self._generate_response(
                message=message,
                context=relevant_context,
                history=conversation_history,
                user_id=user_id
            )
            
            # Save message and response to database
            await self._save_conversation(session.id, user_id, message, response)
            
            # Update session context
            await self.session_manager.update_session_context(session.id, message, response)
            
            return {
                "response": response["text"],
                "session_id": session.id,
                "timestamp": datetime.now().isoformat(),
                "confidence": response.get("confidence", 0.8),
                "sources": response.get("sources", []),
                "suggestions": response.get("suggestions", [])
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "response": "Xin lỗi, tôi gặp lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.",
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def _generate_response(
        self, 
        message: str, 
        context: List[Dict], 
        history: List[Dict],
        user_id: str
    ) -> Dict[str, Any]:
        """Generate response using Gemini Pro API"""
        
        # Build prompt with context and history
        prompt = self._build_prompt(message, context, history, user_id)
        
        try:
            # Generate response using Gemini Pro
            response = await asyncio.to_thread(
                self.model.generate_content, 
                prompt
            )
            
            # Parse response
            response_text = response.text
            
            # Extract structured information if available
            suggestions = self._extract_suggestions(response_text)
            confidence = self._calculate_confidence(response_text, context)
            
            return {
                "text": response_text,
                "confidence": confidence,
                "sources": [ctx.get("source", "") for ctx in context],
                "suggestions": suggestions
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                "text": "Tôi không thể tạo phản hồi lúc này. Vui lòng thử lại sau.",
                "confidence": 0.0,
                "sources": [],
                "suggestions": []
            }
    
    def _build_prompt(
        self, 
        message: str, 
        context: List[Dict], 
        history: List[Dict],
        user_id: str
    ) -> str:
        """Build prompt for Gemini Pro API"""
        
        prompt = f"""
Bạn là một chatbot AI chuyên hỗ trợ học viên trong hệ thống Elearning. Nhiệm vụ của bạn là:

1. Tư vấn và giải đáp về khóa học, giảng viên, nội dung học tập
2. Hướng dẫn sử dụng hệ thống Elearning
3. Hỗ trợ kỹ thuật và xử lý các vấn đề phổ biến
4. Đề xuất lộ trình học phù hợp

THÔNG TIN NGỮ CẢNH:
"""
        
        if context:
            prompt += "\nThông tin liên quan từ cơ sở dữ liệu:\n"
            for ctx in context:
                prompt += f"- {ctx.get('content', '')}\n"
        
        if history:
            prompt += "\nLịch sử cuộc hội thoại:\n"
            for h in history[-3:]:  # Chỉ lấy 3 tin nhắn gần nhất
                prompt += f"Người dùng: {h.get('user_message', '')}\n"
                prompt += f"Bot: {h.get('bot_response', '')}\n"
        
        prompt += f"""
CÂU HỎI HIỆN TẠI: {message}

HƯỚNG DẪN TRẢ LỜI:
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Sử dụng thông tin từ ngữ cảnh để đưa ra câu trả lời chính xác
- Nếu không có thông tin, hãy đề xuất cách tìm hiểu thêm
- Đề xuất các khóa học hoặc tính năng liên quan khi phù hợp
- Nếu cần hỗ trợ kỹ thuật phức tạp, hướng dẫn liên hệ admin

Phản hồi:
"""
        
        return prompt
    
    def _extract_suggestions(self, response_text: str) -> List[str]:
        """Extract suggestions from response text"""
        suggestions = []
        
        # Simple keyword-based suggestion extraction
        suggestion_keywords = [
            "bạn có thể", "tôi khuyên bạn", "đề xuất", 
            "nên thử", "có thể quan tâm"
        ]
        
        for keyword in suggestion_keywords:
            if keyword in response_text.lower():
                # Extract suggestion text (simplified)
                suggestions.append(f"Tìm hiểu thêm về {keyword}")
        
        return suggestions[:3]  # Limit to 3 suggestions
    
    def _calculate_confidence(self, response_text: str, context: List[Dict]) -> float:
        """Calculate confidence score for response"""
        base_confidence = 0.7
        
        # Increase confidence if context is available
        if context:
            base_confidence += 0.2
        
        # Increase confidence for specific response patterns
        if any(keyword in response_text.lower() for keyword in [
            "khóa học", "giảng viên", "nội dung", "học tập"
        ]):
            base_confidence += 0.1
        
        return min(base_confidence, 1.0)
    
    async def _get_conversation_history(self, session_id: str) -> List[Dict]:
        """Get conversation history for session"""
        try:
            async with get_db_session() as db:
                messages = await db.query(ChatMessage)\
                    .filter(ChatMessage.session_id == session_id)\
                    .order_by(ChatMessage.created_at.desc())\
                    .limit(settings.MAX_CONTEXT_HISTORY)\
                    .all()
                
                return [
                    {
                        "user_message": msg.user_message,
                        "bot_response": msg.bot_response,
                        "timestamp": msg.created_at.isoformat()
                    }
                    for msg in reversed(messages)
                ]
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []
    
    async def _save_conversation(
        self, 
        session_id: str, 
        user_id: str, 
        user_message: str, 
        bot_response: Dict[str, Any]
    ):
        """Save conversation to database"""
        try:
            async with get_db_session() as db:
                chat_message = ChatMessage(
                    session_id=session_id,
                    user_id=user_id,
                    user_message=user_message,
                    bot_response=bot_response["text"],
                    confidence=bot_response.get("confidence", 0.0),
                    sources=json.dumps(bot_response.get("sources", [])),
                    created_at=datetime.now()
                )
                
                db.add(chat_message)
                await db.commit()
                
        except Exception as e:
            logger.error(f"Error saving conversation: {e}")
    
    async def get_user_learning_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user learning profile for personalization"""
        try:
            # This would integrate with Elearning backend API
            # For now, return basic profile
            return {
                "user_id": user_id,
                "enrolled_courses": [],
                "learning_preferences": {},
                "progress": {}
            }
        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return {}
    
    async def suggest_courses(self, user_id: str, query: str) -> List[Dict[str, Any]]:
        """Suggest relevant courses based on query"""
        try:
            # Use RAG system to find relevant courses
            relevant_courses = await self.rag_system.search_courses(query)
            return relevant_courses
        except Exception as e:
            logger.error(f"Error suggesting courses: {e}")
            return []

"""
Core Chatbot Implementation using Google Gemini API
"""

        import google.generativeai as genai
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import asyncio
import time
from loguru import logger

from .config import settings
from .session_manager import SessionManager
from ..database.models import ChatSession, ChatMessage
import httpx

# Try to import RAG system, but make it optional
try:
    from .rag_system import RAGSystem
    RAG_AVAILABLE = True
except ImportError:
    RAG_AVAILABLE = False
    logger.warning("RAG system not available (chromadb not installed). Chatbot will work without RAG.")

class GeminiChatbot:
    """Main chatbot class using Gemini API with RAG"""
    
    def __init__(self):
        self.model = None
        self.rag_system = None
        self.session_manager = SessionManager()
        self.is_initialized = False
        self.last_request_time = 0
        self.request_count = 0
        self.request_window_start = time.time()
        
    async def initialize(self):
        """Initialize the chatbot with Gemini API"""
        try:
            # Configure Gemini API
                genai.configure(api_key=settings.GEMINI_API_KEY)
            
            # Initialize model
            try:
                # Thử model mới nhất trước
                self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
                logger.info(f"Using Gemini model: {settings.GEMINI_MODEL}")
            except Exception as e:
                logger.warning(f"Failed to load {settings.GEMINI_MODEL}, trying gemini-pro: {e}")
                try:
                    self.model = genai.GenerativeModel("gemini-pro")
                    logger.info("Using fallback model: gemini-pro")
                except Exception as e2:
                    logger.error(f"Failed to initialize any Gemini model: {e2}")
                    raise
            
            # Initialize RAG system (optional)
            if RAG_AVAILABLE:
                try:
            self.rag_system = RAGSystem()
            await self.rag_system.initialize()
                    logger.info("RAG system initialized successfully")
                except Exception as e:
                    logger.warning(f"Failed to initialize RAG system: {e}. Continuing without RAG.")
                    self.rag_system = None
            else:
                self.rag_system = None
                logger.info("RAG system disabled (chromadb not available)")
            
            # Initialize session manager
            await self.session_manager.initialize()
            
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
            # Rate limiting check
            if not self._check_rate_limit():
                return {
                    "response": "Xin lỗi, bạn đã gửi quá nhiều tin nhắn. Vui lòng đợi một chút rồi thử lại.",
                    "session_id": session_id or "",
                    "timestamp": datetime.now().isoformat(),
                    "confidence": 0.0,
                    "sources": [],
                    "suggestions": [],
                    "error": "rate_limit_exceeded"
                }
            
            # Get or create session
            session = await self.session_manager.get_or_create_session(
                user_id=user_id, 
                session_id=session_id
            )
            
            # Retrieve relevant context using RAG (if available)
            relevant_context = []
            if self.rag_system:
                try:
                    relevant_context = await self.rag_system.retrieve_context(message, top_k=5)
                except Exception as e:
                    logger.warning(f"Error retrieving RAG context: {e}")
                    relevant_context = []
            
            # Get conversation history
            conversation_history = await self._get_conversation_history(session.id)
            
            # Get user profile from Java backend
            user_profile = await self._get_user_profile_from_backend(user_id)
            
            # Generate response using Gemini
            response = await self._generate_response(
                message=message,
                context=relevant_context,
                history=conversation_history,
                user_profile=user_profile,
                user_id=user_id
            )
            
            # Save message and response to database
            await self._save_conversation(session.id, user_id, message, response)
            
            # Update session context
            await self.session_manager.update_session_context(
                session.id, 
                message, 
                response,
                user_profile
            )
            
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
                "session_id": session_id or "",
                "timestamp": datetime.now().isoformat(),
                "confidence": 0.0,
                "sources": [],
                "suggestions": [],
                "error": str(e)
            }
    
    async def _generate_response(
        self, 
        message: str, 
        context: List[Dict], 
        history: List[Dict],
        user_profile: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """Generate response using Gemini API"""
        
        # Build prompt with context and history
        prompt = self._build_prompt(message, context, history, user_profile)
        
        try:
            # Generate response with retry logic
            response_text = await self._call_gemini_with_retry(prompt)
            
            # Extract structured information
            suggestions = self._extract_suggestions(response_text)
            confidence = self._calculate_confidence(response_text, context)
            sources = [ctx.get("source", "") for ctx in context if ctx.get("source")]
            
            return {
                "text": response_text,
                "confidence": confidence,
                "sources": sources,
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
    
    async def _call_gemini_with_retry(self, prompt: str) -> str:
        """Call Gemini API with retry logic for rate limiting"""
        last_error = None
        
        for attempt in range(settings.MAX_RETRIES):
            try:
                # Throttle requests để tránh rate limit
                current_time = time.time()
                time_since_last = current_time - self.last_request_time
                if time_since_last < 0.5:  # Tối thiểu 0.5s giữa các request
                    await asyncio.sleep(0.5 - time_since_last)
                
                # Generate content
                response = await asyncio.to_thread(
                    self.model.generate_content,
                    prompt,
                    generation_config={
                        "temperature": 0.7,
                        "top_p": 0.8,
                        "top_k": 40,
                        "max_output_tokens": 1024,
                    }
                )
                
                self.last_request_time = time.time()
                self.request_count += 1
                
                return response.text
                
            except Exception as e:
                error_str = str(e).lower()
                last_error = e
                
                # Check if it's a rate limit error (429)
                if "429" in error_str or "quota" in error_str or "rate limit" in error_str:
                    wait_time = settings.RETRY_DELAY * (attempt + 1)
                    logger.warning(f"Rate limit hit, waiting {wait_time}s before retry {attempt + 1}/{settings.MAX_RETRIES}")
                    await asyncio.sleep(wait_time)
                    continue
                
                # Check if it's a timeout error
                if "timeout" in error_str or "timed out" in error_str:
                    logger.warning(f"Timeout error, retrying {attempt + 1}/{settings.MAX_RETRIES}")
                    await asyncio.sleep(settings.RETRY_DELAY)
                    continue
                
                # For other errors, log and retry
                logger.warning(f"Error calling Gemini API (attempt {attempt + 1}/{settings.MAX_RETRIES}): {e}")
                if attempt < settings.MAX_RETRIES - 1:
                    await asyncio.sleep(settings.RETRY_DELAY)
        
        # If all retries failed
        raise Exception(f"Failed to get response from Gemini after {settings.MAX_RETRIES} attempts: {last_error}")
    
    def _check_rate_limit(self) -> bool:
        """Check if request is within rate limit"""
        current_time = time.time()
        
        # Reset counter every minute
        if current_time - self.request_window_start >= 60:
            self.request_count = 0
            self.request_window_start = current_time
        
        # Check limit
        if self.request_count >= settings.RATE_LIMIT_PER_MINUTE:
            return False
        
        return True
    
    def _build_prompt(
        self, 
        message: str, 
        context: List[Dict], 
        history: List[Dict],
        user_profile: Dict[str, Any]
    ) -> str:
        """Build prompt for Gemini API"""
        
        prompt = """Bạn là một chatbot AI chuyên nghiệp hỗ trợ học viên trong hệ thống Elearning. Nhiệm vụ của bạn là:

1. Tư vấn và giải đáp về khóa học, giảng viên, nội dung học tập
2. Hướng dẫn sử dụng hệ thống Elearning
3. Hỗ trợ kỹ thuật và xử lý các vấn đề phổ biến
4. Đề xuất lộ trình học phù hợp dựa trên profile học tập của học viên

"""
        
        # Add user profile information
        if user_profile:
            prompt += "THÔNG TIN HỌC VIÊN:\n"
            if user_profile.get("userName"):
                prompt += f"- Tên: {user_profile['userName']}\n"
            if user_profile.get("summary"):
                summary = user_profile["summary"]
                prompt += f"- Số khóa học đã đăng ký: {summary.get('totalCourses', 0)}\n"
                prompt += f"- Số khóa học đã hoàn thành: {summary.get('completedCourses', 0)}\n"
                prompt += f"- Điểm trung bình: {summary.get('averageScore', 0):.1f}\n"
                prompt += f"- Tỷ lệ hoàn thành: {summary.get('completionRate', 0):.1f}%\n"
            prompt += "\n"
        
        # Add context from RAG
        if context:
            prompt += "THÔNG TIN LIÊN QUAN TỪ CƠ SỞ DỮ LIỆU:\n"
            for i, ctx in enumerate(context[:5], 1):
                content = ctx.get("content", "")
                source = ctx.get("source", "")
                if content:
                    prompt += f"{i}. {content}\n"
                    if source:
                        prompt += f"   (Nguồn: {source})\n"
            prompt += "\n"
        
        # Add conversation history
        if history:
            prompt += "LỊCH SỬ CUỘC HỘI THOẠI:\n"
            for h in history[-3:]:  # Chỉ lấy 3 tin nhắn gần nhất
                user_msg = h.get("user_message", "")
                bot_msg = h.get("bot_response", "")
                if user_msg:
                    prompt += f"Người dùng: {user_msg}\n"
                if bot_msg:
                    prompt += f"Bot: {bot_msg}\n"
            prompt += "\n"
        
        # Add current message
        prompt += f"""CÂU HỎI HIỆN TẠI: {message}

HƯỚNG DẪN TRẢ LỜI:
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Sử dụng thông tin từ ngữ cảnh để đưa ra câu trả lời chính xác
- Nếu không có thông tin trong ngữ cảnh, hãy đề xuất cách tìm hiểu thêm hoặc liên hệ Admin
- Đề xuất các khóa học hoặc tính năng liên quan khi phù hợp
- Nếu cần hỗ trợ kỹ thuật phức tạp, hướng dẫn liên hệ admin qua email hoặc hotline
- Luôn khuyến khích học viên tiếp tục học tập và đạt mục tiêu

Phản hồi:"""
        
        return prompt
    
    def _extract_suggestions(self, response_text: str) -> List[str]:
        """Extract suggestions from response text"""
        suggestions = []
        
        # Simple keyword-based suggestion extraction
        suggestion_keywords = [
            "bạn có thể", "tôi khuyên bạn", "đề xuất", 
            "nên thử", "có thể quan tâm", "bạn nên"
        ]
        
        sentences = response_text.split(".")
        for sentence in sentences:
            sentence_lower = sentence.lower().strip()
        for keyword in suggestion_keywords:
                if keyword in sentence_lower and len(sentence) > 20:
                    suggestions.append(sentence.strip())
                    break
        
        return suggestions[:3]  # Limit to 3 suggestions
    
    def _calculate_confidence(self, response_text: str, context: List[Dict]) -> float:
        """Calculate confidence score for response"""
        base_confidence = 0.7
        
        # Increase confidence if we have relevant context
        if context:
            base_confidence += min(len(context) * 0.05, 0.2)
        
        # Check for uncertainty indicators
        uncertainty_keywords = [
            "không chắc", "có thể", "có lẽ", 
            "không rõ", "không biết", "không có thông tin"
        ]
        
        response_lower = response_text.lower()
        for keyword in uncertainty_keywords:
            if keyword in response_lower:
                base_confidence -= 0.1
        
        return min(max(base_confidence, 0.0), 1.0)
    
    async def _get_conversation_history(self, session_id: str) -> List[Dict]:
        """Get conversation history for session"""
        try:
            from sqlalchemy import select, desc
            from ..database.database import async_session
            from ..database.models import ChatMessage
            
            async with async_session() as db:
                result = await db.execute(
                    select(ChatMessage)
                    .where(ChatMessage.session_id == session_id)
                    .order_by(desc(ChatMessage.created_at))
                    .limit(settings.MAX_CONTEXT_HISTORY)
                )
                messages = result.scalars().all()
                
                return [
                    {
                        "user_message": msg.user_message,
                        "bot_response": msg.bot_response,
                        "timestamp": msg.created_at.isoformat() if hasattr(msg.created_at, 'isoformat') else str(msg.created_at)
                    }
                    for msg in reversed(messages)
                ]
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []
    
    async def _get_user_profile_from_backend(self, user_id: str) -> Dict[str, Any]:
        """Get user profile from Java backend"""
        try:
            async with httpx.AsyncClient(timeout=settings.JAVA_BACKEND_TIMEOUT) as client:
                response = await client.get(
                    f"{settings.JAVA_BACKEND_URL}/api/chat/context",
                    params={"userId": user_id}
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.warning(f"Failed to get user profile: {response.status_code}")
                    return {}
        except Exception as e:
            logger.error(f"Error getting user profile from backend: {e}")
            return {}
    
    async def _save_conversation(
        self, 
        session_id: str, 
        user_id: str, 
        user_message: str, 
        bot_response: Dict[str, Any]
    ):
        """Save conversation to database"""
        try:
            from ..database.database import async_session
            
            async with async_session() as db:
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

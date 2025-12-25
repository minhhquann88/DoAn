"""
Test Suite for Elearning Chatbot
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient
import json

from main import app
from src.core.chatbot import ElearningChatbot
from src.core.session_manager import SessionManager
from src.core.rag_system import RAGSystem

# Test client
client = TestClient(app)

class TestChatbotCore:
    """Test cases for core chatbot functionality"""
    
    @pytest.fixture
    async def chatbot(self):
        """Create chatbot instance for testing"""
        chatbot = ElearningChatbot()
        # Mock initialization to avoid API calls
        chatbot.is_initialized = True
        chatbot.model = Mock()
        chatbot.rag_system = Mock()
        chatbot.session_manager = Mock()
        return chatbot
    
    @pytest.mark.asyncio
    async def test_chatbot_initialization(self, chatbot):
        """Test chatbot initialization"""
        assert chatbot.is_initialized == True
        assert chatbot.model is not None
        assert chatbot.rag_system is not None
    
    @pytest.mark.asyncio
    async def test_process_message(self, chatbot):
        """Test message processing"""
        # Mock dependencies
        chatbot.rag_system.retrieve_context = AsyncMock(return_value=[
            {"content": "Test context", "source": "test"}
        ])
        chatbot.session_manager.get_or_create_session = AsyncMock()
        chatbot._get_conversation_history = AsyncMock(return_value=[])
        chatbot._generate_response = AsyncMock(return_value={
            "text": "Test response",
            "confidence": 0.9,
            "sources": ["test"],
            "suggestions": []
        })
        chatbot._save_conversation = AsyncMock()
        chatbot.session_manager.update_session_context = AsyncMock()
        
        # Test message processing
        result = await chatbot.process_message(
            user_id="test_user",
            message="Test message"
        )
        
        assert result["response"] == "Test response"
        assert result["confidence"] == 0.9
        assert "session_id" in result
    
    @pytest.mark.asyncio
    async def test_generate_response(self, chatbot):
        """Test response generation"""
        # Mock Gemini Pro API response
        mock_response = Mock()
        mock_response.text = "Generated response"
        chatbot.model.generate_content = Mock(return_value=mock_response)
        
        result = await chatbot._generate_response(
            message="Test message",
            context=[{"content": "Test context"}],
            history=[],
            user_id="test_user"
        )
        
        assert result["text"] == "Generated response"
        assert result["confidence"] > 0
        assert "sources" in result
        assert "suggestions" in result

class TestRAGSystem:
    """Test cases for RAG system"""
    
    @pytest.fixture
    async def rag_system(self):
        """Create RAG system instance for testing"""
        rag = RAGSystem()
        # Mock ChromaDB client
        rag.chroma_client = Mock()
        rag.collection = Mock()
        rag.embedding_model = Mock()
        rag.is_initialized = True
        return rag
    
    @pytest.mark.asyncio
    async def test_retrieve_context(self, rag_system):
        """Test context retrieval"""
        # Mock ChromaDB query response
        mock_results = {
            "documents": [["Test document content"]],
            "metadatas": [[{"source": "test_source"}]],
            "distances": [[0.1]]
        }
        rag_system.collection.query = Mock(return_value=mock_results)
        rag_system.embedding_model.encode = Mock(return_value=[[0.1, 0.2, 0.3]])
        
        contexts = await rag_system.retrieve_context("test query")
        
        assert len(contexts) == 1
        assert contexts[0]["content"] == "Test document content"
        assert contexts[0]["source"] == "test_source"
        assert contexts[0]["relevance_score"] > 0
    
    @pytest.mark.asyncio
    async def test_add_document(self, rag_system):
        """Test document addition"""
        rag_system.embedding_model.encode = Mock(return_value=[[0.1, 0.2, 0.3]])
        rag_system.collection.add = Mock()
        
        await rag_system.add_document(
            content="Test content",
            metadata={"title": "Test"},
            doc_id="test_id"
        )
        
        rag_system.collection.add.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_search_courses(self, rag_system):
        """Test course search"""
        # Mock course collection
        course_collection = Mock()
        rag_system.chroma_client.get_or_create_collection = Mock(return_value=course_collection)
        
        mock_results = {
            "documents": [["Course description"]],
            "metadatas": [[{"course_id": "1", "title": "Test Course"}]],
            "distances": [[0.2]]
        }
        course_collection.query = Mock(return_value=mock_results)
        rag_system.embedding_model.encode = Mock(return_value=[[0.1, 0.2, 0.3]])
        
        courses = await rag_system.search_courses("test query")
        
        assert len(courses) == 1
        assert courses[0]["course_id"] == "1"
        assert courses[0]["title"] == "Test Course"

class TestSessionManager:
    """Test cases for session management"""
    
    @pytest.fixture
    async def session_manager(self):
        """Create session manager instance for testing"""
        manager = SessionManager()
        # Mock Redis client
        manager.redis_client = Mock()
        manager.is_initialized = True
        return manager
    
    @pytest.mark.asyncio
    async def test_create_session(self, session_manager):
        """Test session creation"""
        # Mock database operations
        with patch('src.core.session_manager.get_db_session') as mock_db:
            mock_session = Mock()
            mock_db.return_value.__aenter__.return_value = mock_session
            
            session = await session_manager.get_or_create_session("test_user")
            
            assert session.user_id == "test_user"
            assert session.is_active == True
    
    def test_extract_topics(self, session_manager):
        """Test topic extraction"""
        message = "Tôi muốn tìm hiểu về khóa học lập trình"
        topics = session_manager._extract_topics(message)
        
        assert "courses" in topics
    
    def test_update_user_preferences(self, session_manager):
        """Test user preference updates"""
        context = {"user_preferences": {}}
        session_manager._update_user_preferences(
            context, 
            "Tôi quan tâm đến khóa học", 
            "Bot response"
        )
        
        assert context["user_preferences"]["interested_in_courses"] == True

class TestAPIEndpoints:
    """Test cases for API endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    @patch('src.api.dependencies.verify_token')
    def test_send_message_endpoint(self, mock_verify):
        """Test send message endpoint"""
        mock_verify.return_value = "test_user"
        
        # Mock chatbot dependencies
        with patch('src.api.dependencies.get_chatbot') as mock_chatbot:
            mock_chatbot_instance = AsyncMock()
            mock_chatbot_instance.process_message = AsyncMock(return_value={
                "response": "Test response",
                "session_id": "test_session",
                "timestamp": "2024-01-01T00:00:00Z",
                "confidence": 0.9,
                "sources": [],
                "suggestions": []
            })
            mock_chatbot.return_value = mock_chatbot_instance
            
            response = client.post(
                "/api/v1/chat/send",
                json={"message": "Test message"}
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["response"] == "Test response"
    
    @patch('src.api.dependencies.verify_token')
    def test_get_courses_endpoint(self, mock_verify):
        """Test get courses endpoint"""
        mock_verify.return_value = "test_user"
        
        with patch('src.api.routes.courses.get_elearning_courses') as mock_courses:
            mock_courses.return_value = [
                {
                    "id": "1",
                    "title": "Test Course",
                    "description": "Test Description",
                    "instructor": "Test Instructor",
                    "price": 100.0,
                    "duration": "10 hours",
                    "rating": 4.5,
                    "category": "programming"
                }
            ]
            
            response = client.get("/api/v1/courses/")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["title"] == "Test Course"

class TestIntegration:
    """Integration tests"""
    
    @pytest.mark.asyncio
    async def test_full_chat_flow(self):
        """Test complete chat flow"""
        # This would test the full integration
        # from message input to response output
        pass
    
    @pytest.mark.asyncio
    async def test_session_persistence(self):
        """Test session persistence across requests"""
        # This would test that sessions are properly
        # maintained across multiple API calls
        pass

# Test configuration
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])

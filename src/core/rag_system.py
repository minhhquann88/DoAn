"""
RAG (Retrieval-Augmented Generation) System Implementation
Sử dụng ChromaDB và sentence-transformers để tìm kiếm thông tin liên quan
"""

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import json
import asyncio
from loguru import logger
import numpy as np

from .config import settings

class RAGSystem:
    """RAG system for retrieving relevant context"""
    
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self.embedding_model = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize RAG system with ChromaDB and embedding model"""
        try:
            # Initialize ChromaDB client
            self.chroma_client = chromadb.PersistentClient(
                path=settings.CHROMA_PERSIST_DIRECTORY,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Initialize embedding model
            self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
            
            # Get or create collection
            self.collection = self.chroma_client.get_or_create_collection(
                name="elearning_knowledge",
                metadata={"description": "Elearning course and system knowledge base"}
            )
            
            # Load initial knowledge base if empty
            if self.collection.count() == 0:
                await self._load_initial_knowledge()
            
            self.is_initialized = True
            logger.info("RAG system initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize RAG system: {e}")
            raise
    
    async def retrieve_context(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve relevant context for a query
        
        Args:
            query: Câu hỏi từ người dùng
            top_k: Số lượng kết quả trả về
            
        Returns:
            List các context liên quan
        """
        if not self.is_initialized:
            await self.initialize()
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])[0].tolist()
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            contexts = []
            for i, (doc, metadata, distance) in enumerate(zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0]
            )):
                contexts.append({
                    "content": doc,
                    "metadata": metadata,
                    "relevance_score": 1 - distance,  # Convert distance to relevance
                    "source": metadata.get("source", "unknown")
                })
            
            logger.info(f"Retrieved {len(contexts)} contexts for query: {query[:50]}...")
            return contexts
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return []
    
    async def add_document(
        self, 
        content: str, 
        metadata: Dict[str, Any], 
        doc_id: Optional[str] = None
    ):
        """Add document to knowledge base"""
        if not self.is_initialized:
            await self.initialize()
        
        try:
            # Generate embedding
            embedding = self.embedding_model.encode([content])[0].tolist()
            
            # Add to collection
            self.collection.add(
                documents=[content],
                embeddings=[embedding],
                metadatas=[metadata],
                ids=[doc_id] if doc_id else None
            )
            
            logger.info(f"Added document to knowledge base: {metadata.get('title', 'Unknown')}")
            
        except Exception as e:
            logger.error(f"Error adding document: {e}")
    
    async def search_courses(self, query: str) -> List[Dict[str, Any]]:
        """Search for relevant courses"""
        try:
            # Search in course-specific collection
            course_collection = self.chroma_client.get_or_create_collection(
                name="courses",
                metadata={"description": "Course information"}
            )
            
            query_embedding = self.embedding_model.encode([query])[0].tolist()
            
            results = course_collection.query(
                query_embeddings=[query_embedding],
                n_results=10,
                include=["documents", "metadatas", "distances"]
            )
            
            courses = []
            for doc, metadata, distance in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0]
            ):
                courses.append({
                    "course_id": metadata.get("course_id"),
                    "title": metadata.get("title"),
                    "description": doc,
                    "instructor": metadata.get("instructor"),
                    "price": metadata.get("price"),
                    "duration": metadata.get("duration"),
                    "rating": metadata.get("rating"),
                    "relevance_score": 1 - distance
                })
            
            return courses
            
        except Exception as e:
            logger.error(f"Error searching courses: {e}")
            return []
    
    async def _load_initial_knowledge(self):
        """Load initial knowledge base with common Elearning information"""
        
        initial_knowledge = [
            {
                "content": """
                Hệ thống Elearning cho phép học viên đăng ký các khóa học trực tuyến, 
                xem video bài giảng, làm bài tập và theo dõi tiến độ học tập. 
                Để đăng ký khóa học, học viên cần tạo tài khoản và thanh toán học phí.
                """,
                "metadata": {
                    "title": "Giới thiệu hệ thống Elearning",
                    "category": "system_overview",
                    "source": "system_docs"
                }
            },
            {
                "content": """
                Khi gặp lỗi không thể truy cập video bài giảng, học viên có thể:
                1. Kiểm tra kết nối internet
                2. Thử refresh trang web
                3. Xóa cache trình duyệt
                4. Liên hệ hỗ trợ kỹ thuật nếu vấn đề vẫn tiếp diễn
                """,
                "metadata": {
                    "title": "Xử lý lỗi video không phát được",
                    "category": "technical_support",
                    "source": "troubleshooting_guide"
                }
            },
            {
                "content": """
                Để quên mật khẩu, học viên có thể:
                1. Nhấn vào "Quên mật khẩu" trên trang đăng nhập
                2. Nhập email đã đăng ký
                3. Kiểm tra email để nhận link đặt lại mật khẩu
                4. Làm theo hướng dẫn trong email
                """,
                "metadata": {
                    "title": "Khôi phục mật khẩu",
                    "category": "account_management",
                    "source": "user_guide"
                }
            },
            {
                "content": """
                Học viên có thể theo dõi tiến độ học tập thông qua:
                1. Dashboard cá nhân hiển thị % hoàn thành khóa học
                2. Danh sách bài học đã hoàn thành
                3. Điểm số các bài kiểm tra
                4. Chứng chỉ hoàn thành khóa học
                """,
                "metadata": {
                    "title": "Theo dõi tiến độ học tập",
                    "category": "learning_progress",
                    "source": "user_guide"
                }
            },
            {
                "content": """
                Để thanh toán học phí, học viên có thể sử dụng:
                1. Thẻ tín dụng/ghi nợ quốc tế
                2. Ví điện tử (MoMo, ZaloPay, ViettelPay)
                3. Chuyển khoản ngân hàng
                4. Thanh toán trả góp (nếu có)
                """,
                "metadata": {
                    "title": "Phương thức thanh toán",
                    "category": "payment",
                    "source": "payment_guide"
                }
            }
        ]
        
        # Add each knowledge item to the collection
        for i, item in enumerate(initial_knowledge):
            await self.add_document(
                content=item["content"],
                metadata=item["metadata"],
                doc_id=f"initial_knowledge_{i}"
            )
        
        logger.info(f"Loaded {len(initial_knowledge)} initial knowledge items")
    
    async def update_course_knowledge(self, course_data: Dict[str, Any]):
        """Update knowledge base with new course information"""
        try:
            course_content = f"""
            Khóa học: {course_data.get('title', '')}
            Giảng viên: {course_data.get('instructor', '')}
            Mô tả: {course_data.get('description', '')}
            Thời lượng: {course_data.get('duration', '')}
            Giá: {course_data.get('price', '')}
            Đánh giá: {course_data.get('rating', '')}
            """
            
            await self.add_document(
                content=course_content,
                metadata={
                    "title": course_data.get('title', ''),
                    "course_id": course_data.get('id'),
                    "category": "course_info",
                    "source": "course_database",
                    "instructor": course_data.get('instructor', ''),
                    "price": course_data.get('price', ''),
                    "duration": course_data.get('duration', ''),
                    "rating": course_data.get('rating', '')
                },
                doc_id=f"course_{course_data.get('id')}"
            )
            
        except Exception as e:
            logger.error(f"Error updating course knowledge: {e}")
    
    async def get_similar_questions(self, question: str, top_k: int = 3) -> List[str]:
        """Get similar questions from FAQ database"""
        try:
            faq_collection = self.chroma_client.get_or_create_collection(
                name="faq",
                metadata={"description": "Frequently Asked Questions"}
            )
            
            if faq_collection.count() == 0:
                return []
            
            query_embedding = self.embedding_model.encode([question])[0].tolist()
            
            results = faq_collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                include=["documents", "metadatas"]
            )
            
            return results["documents"][0]
            
        except Exception as e:
            logger.error(f"Error getting similar questions: {e}")
            return []
    
    async def add_faq(self, question: str, answer: str, category: str = "general"):
        """Add FAQ to knowledge base"""
        try:
            faq_collection = self.chroma_client.get_or_create_collection(
                name="faq",
                metadata={"description": "Frequently Asked Questions"}
            )
            
            content = f"Câu hỏi: {question}\nTrả lời: {answer}"
            
            await self.add_document(
                content=content,
                metadata={
                    "question": question,
                    "answer": answer,
                    "category": category,
                    "source": "faq_database"
                },
                doc_id=f"faq_{hash(question)}"
            )
            
        except Exception as e:
            logger.error(f"Error adding FAQ: {e}")
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about knowledge base collections"""
        try:
            stats = {}
            
            # Main knowledge collection
            stats["knowledge_base"] = {
                "total_documents": self.collection.count(),
                "collection_name": "elearning_knowledge"
            }
            
            # Course collection
            try:
                course_collection = self.chroma_client.get_collection("courses")
                stats["courses"] = {
                    "total_courses": course_collection.count(),
                    "collection_name": "courses"
                }
            except:
                stats["courses"] = {"total_courses": 0, "collection_name": "courses"}
            
            # FAQ collection
            try:
                faq_collection = self.chroma_client.get_collection("faq")
                stats["faq"] = {
                    "total_faqs": faq_collection.count(),
                    "collection_name": "faq"
                }
            except:
                stats["faq"] = {"total_faqs": 0, "collection_name": "faq"}
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {}

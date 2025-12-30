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
from datetime import datetime
from loguru import logger
import os

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
            
            # Initialize embedding model (local, không tốn quota API)
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
            self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info("Embedding model loaded successfully")
            
            # Get or create collection
            self.collection = self.chroma_client.get_or_create_collection(
                name="elearning_knowledge",
                metadata={"description": "Elearning course and system knowledge base"}
            )
            
            # Load initial knowledge base if empty
            if self.collection.count() == 0:
                await self._load_initial_knowledge()
            
            self.is_initialized = True
            logger.info(f"RAG system initialized successfully. Collection has {self.collection.count()} documents")
            
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
            query_embedding = await asyncio.to_thread(
                self.embedding_model.encode,
                [query],
                convert_to_numpy=True
            )
            query_embedding = query_embedding[0].tolist()
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, 10),
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            contexts = []
            if results["documents"] and len(results["documents"]) > 0:
                documents = results["documents"][0]
                metadatas = results["metadatas"][0] if results["metadatas"] else [{}] * len(documents)
                distances = results["distances"][0] if results["distances"] else [1.0] * len(documents)
                
                for doc, metadata, distance in zip(documents, metadatas, distances):
                    # Filter by similarity threshold (lower distance = more similar)
                    if distance < 1.5:  # Threshold có thể điều chỉnh
                        contexts.append({
                            "content": doc,
                            "source": metadata.get("source", "Knowledge Base"),
                            "type": metadata.get("type", "general"),
                            "distance": distance,
                            "metadata": metadata
                        })
            
            logger.info(f"Retrieved {len(contexts)} relevant contexts for query: {query[:50]}")
            return contexts
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return []
    
    async def _load_initial_knowledge(self):
        """Load initial knowledge base into ChromaDB"""
        try:
            logger.info("Loading initial knowledge base...")
            
            # Sample knowledge base data
            knowledge_items = [
                {
                    "content": "Hệ thống Elearning cho phép học viên đăng ký khóa học, theo dõi tiến độ học tập, và nhận chứng chỉ sau khi hoàn thành.",
                    "metadata": {"type": "system_info", "source": "System Documentation"}
                },
                {
                    "content": "Để đăng ký khóa học, học viên cần đăng nhập vào hệ thống, chọn khóa học mong muốn, và thực hiện thanh toán.",
                    "metadata": {"type": "faq", "source": "FAQ", "category": "enrollment"}
                },
                {
                    "content": "Học viên có thể xem tiến độ học tập của mình trong phần 'Khóa học của tôi' và theo dõi số phần trăm đã hoàn thành.",
                    "metadata": {"type": "faq", "source": "FAQ", "category": "progress"}
                },
                {
                    "content": "Sau khi hoàn thành 100% khóa học, học viên sẽ tự động nhận được chứng chỉ hoàn thành khóa học dưới dạng PDF.",
                    "metadata": {"type": "faq", "source": "FAQ", "category": "certificate"}
                },
                {
                    "content": "Hệ thống hỗ trợ thanh toán online qua VNPay. Sau khi thanh toán thành công, khóa học sẽ được kích hoạt tự động.",
                    "metadata": {"type": "faq", "source": "FAQ", "category": "payment"}
                },
                {
                    "content": "Giảng viên có thể tạo khóa học mới, quản lý nội dung (chương, bài học), và xem thống kê học viên của mình.",
                    "metadata": {"type": "system_info", "source": "System Documentation"}
                },
                {
                    "content": "Admin có quyền phê duyệt khóa học, quản lý danh mục, quản lý giảng viên, và xem báo cáo thống kê toàn hệ thống.",
                    "metadata": {"type": "system_info", "source": "System Documentation"}
                },
            ]
            
            # Generate embeddings and add to collection
            documents = [item["content"] for item in knowledge_items]
            metadatas = [item["metadata"] for item in knowledge_items]
            ids = [f"kb_{i}" for i in range(len(knowledge_items))]
            
            # Generate embeddings
            embeddings = await asyncio.to_thread(
                self.embedding_model.encode,
                documents,
                convert_to_numpy=True
            )
            embeddings = embeddings.tolist()
            
            # Add to collection
            self.collection.add(
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Loaded {len(knowledge_items)} knowledge items into ChromaDB")
            
        except Exception as e:
            logger.error(f"Error loading initial knowledge: {e}")
    
    async def add_knowledge(
        self, 
        content: str, 
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Add new knowledge to the knowledge base"""
        try:
            if not self.is_initialized:
                await self.initialize()
            
            # Generate embedding
            embedding = await asyncio.to_thread(
                self.embedding_model.encode,
                [content],
                convert_to_numpy=True
            )
            embedding = embedding[0].tolist()
            
            # Add to collection
            doc_id = f"kb_{int(datetime.now().timestamp())}"
            self.collection.add(
                embeddings=[embedding],
                documents=[content],
                metadatas=[metadata or {}],
                ids=[doc_id]
            )
            
            logger.info(f"Added new knowledge item: {content[:50]}...")
            
        except Exception as e:
            logger.error(f"Error adding knowledge: {e}")

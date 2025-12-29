"""
Database Models for Elearning Chatbot
"""

from sqlalchemy import Column, String, DateTime, Boolean, Text, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime
import uuid

Base = declarative_base()

class ChatSession(Base):
    """Model for chat sessions"""
    __tablename__ = "chat_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    context_data = Column(Text)  # JSON string for storing context
    
    def __repr__(self):
        return f"<ChatSession(id='{self.id}', user_id='{self.user_id}')>"

class ChatMessage(Base):
    """Model for chat messages"""
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    confidence = Column(Float, default=0.0)
    sources = Column(Text)  # JSON string for storing sources
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<ChatMessage(id='{self.id}', session_id='{self.session_id}')>"

class Course(Base):
    """Model for course information"""
    __tablename__ = "courses"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text)
    instructor = Column(String(100))
    price = Column(Float)
    duration = Column(String(50))  # e.g., "10 hours", "4 weeks"
    rating = Column(Float)
    category = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Course(id='{self.id}', title='{self.title}')>"

class UserProfile(Base):
    """Model for user profiles"""
    __tablename__ = "user_profiles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(100), nullable=False, unique=True, index=True)
    email = Column(String(200))
    full_name = Column(String(200))
    learning_preferences = Column(Text)  # JSON string
    enrolled_courses = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<UserProfile(id='{self.id}', user_id='{self.user_id}')>"

class FAQ(Base):
    """Model for Frequently Asked Questions"""
    __tablename__ = "faqs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100))
    tags = Column(Text)  # JSON string for tags
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<FAQ(id='{self.id}', question='{self.question[:50]}...')>"

class ChatAnalytics(Base):
    """Model for chat analytics"""
    __tablename__ = "chat_analytics"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(100), nullable=False, index=True)
    message_count = Column(Integer, default=0)
    avg_confidence = Column(Float, default=0.0)
    topics_discussed = Column(Text)  # JSON string
    session_duration = Column(Integer)  # in seconds
    satisfaction_score = Column(Float)  # 1-5 rating
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<ChatAnalytics(id='{self.id}', session_id='{self.session_id}')>"

"""
Configuration settings for Elearning Chatbot
"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Gemini Pro API Configuration
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-pro"
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./elearning_chatbot.db"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Vector Database Configuration
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_VERSION: str = "v1"
    
    # Elearning Backend Integration
    ELEARNING_API_BASE_URL: str = "http://localhost:3000/api"
    ELEARNING_API_KEY: Optional[str] = None
    
    # Session Configuration
    SESSION_TIMEOUT: int = 3600  # 1 hour in seconds
    MAX_CONTEXT_HISTORY: int = 10
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/chatbot.log"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()

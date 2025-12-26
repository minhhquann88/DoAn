"""
Configuration settings for Elearning Chatbot
"""

from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional
import os

class Settings(BaseSettings):
    # Gemini Pro API Configuration
    # SECURITY: API key MUST be loaded from environment variables or .env file
    # DO NOT hardcode API keys in source code
    GEMINI_API_KEY: str = Field(default="", description="Gemini API Key - Must be set in environment or .env file")
    GEMINI_MODEL: str = "gemini-2.0-flash-exp"  # Hoặc "gemini-pro" nếu không có flash
    
    @field_validator('GEMINI_API_KEY')
    @classmethod
    def validate_api_key(cls, v: str) -> str:
        """Validate that API key is provided from environment"""
        if not v or v.strip() == "":
            raise ValueError(
                "GEMINI_API_KEY is required! "
                "Please set it in environment variables or .env file. "
                "Example: export GEMINI_API_KEY='your_api_key_here' or add to .env file"
            )
        return v
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./elearning_chatbot.db"
    REDIS_URL: str = "redis://localhost:6379"
    USE_REDIS: bool = False  # Set True nếu có Redis
    
    # Vector Database Configuration
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_VERSION: str = "v1"
    
    # Java Backend Integration
    JAVA_BACKEND_URL: str = "http://localhost:8080"
    JAVA_BACKEND_TIMEOUT: int = 10
    
    # Session Configuration
    SESSION_TIMEOUT: int = 3600  # 1 hour in seconds
    MAX_CONTEXT_HISTORY: int = 5  # Số tin nhắn lịch sử tối đa
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/chatbot.log"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_ALGORITHM: str = "HS256"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 30  # Giảm cho Gemini Free Tier
    RATE_LIMIT_PER_HOUR: int = 500
    
    # Gemini API Settings
    MAX_RETRIES: int = 3
    RETRY_DELAY: int = 2  # seconds
    REQUEST_TIMEOUT: int = 30  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

# Global settings instance
settings = Settings()

# Tạo thư mục logs nếu chưa có
os.makedirs("./logs", exist_ok=True)
os.makedirs("./chroma_db", exist_ok=True)

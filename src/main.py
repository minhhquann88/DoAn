"""
Main FastAPI application for E-learning Chatbot
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from src.api.routes import chat, courses, users, admin
from src.database.database import init_database, close_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events: startup and shutdown"""
    # Startup
    logger.info("Starting up...")
    try:
        await init_database()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await close_database()

app = FastAPI(
    title="E-learning Chatbot API",
    description="API cho chatbot hỗ trợ học tập với Gemini AI",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["Courses"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {
        "message": "E-learning Chatbot API",
        "status": "running",
        "version": "2.0.0",
        "features": [
            "Gemini AI Integration",
            "RAG System with ChromaDB",
            "Session Management",
            "Java Backend Integration"
        ]
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "chatbot-api"}

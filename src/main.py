"""
Main FastAPI application for E-learning Chatbot
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import chat, courses, users, admin

app = FastAPI(
    title="E-learning Chatbot API",
    description="API cho chatbot hỗ trợ học tập",
    version="1.0.0"
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
    return {"message": "E-learning Chatbot API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}


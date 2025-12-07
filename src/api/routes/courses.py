"""
Courses API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from loguru import logger

from ..core.chatbot import ElearningChatbot
from ..core.rag_system import RAGSystem
from .dependencies import get_chatbot, verify_token, get_elearning_courses

router = APIRouter()

class Course(BaseModel):
    id: str
    title: str
    description: str
    instructor: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[str] = None
    rating: Optional[float] = None
    category: Optional[str] = None

class CourseSearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None

class CourseSearchResponse(BaseModel):
    courses: List[Course]
    total_count: int
    search_query: str

@router.get("/", response_model=List[Course])
async def get_courses(
    limit: int = 20,
    offset: int = 0,
    category: Optional[str] = None,
    user_id: str = Depends(verify_token)
):
    """
    Lấy danh sách khóa học
    """
    try:
        # Get courses from Elearning backend
        courses_data = await get_elearning_courses()
        
        # Filter by category if provided
        if category:
            courses_data = [c for c in courses_data if c.get("category") == category]
        
        # Apply pagination
        courses_data = courses_data[offset:offset + limit]
        
        # Convert to Course objects
        courses = [
            Course(
                id=course.get("id", ""),
                title=course.get("title", ""),
                description=course.get("description", ""),
                instructor=course.get("instructor"),
                price=course.get("price"),
                duration=course.get("duration"),
                rating=course.get("rating"),
                category=course.get("category")
            )
            for course in courses_data
        ]
        
        return courses
        
    except Exception as e:
        logger.error(f"Error getting courses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get courses"
        )

@router.post("/search", response_model=CourseSearchResponse)
async def search_courses(
    search_request: CourseSearchRequest,
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Tìm kiếm khóa học dựa trên query
    """
    try:
        # Use RAG system to search courses
        courses_data = await chatbot.suggest_courses(user_id, search_request.query)
        
        # Apply filters
        filtered_courses = courses_data
        
        if search_request.category:
            filtered_courses = [
                c for c in filtered_courses 
                if c.get("category") == search_request.category
            ]
        
        if search_request.max_price:
            filtered_courses = [
                c for c in filtered_courses 
                if c.get("price", 0) <= search_request.max_price
            ]
        
        if search_request.min_rating:
            filtered_courses = [
                c for c in filtered_courses 
                if c.get("rating", 0) >= search_request.min_rating
            ]
        
        # Convert to Course objects
        courses = [
            Course(
                id=course.get("course_id", ""),
                title=course.get("title", ""),
                description=course.get("description", ""),
                instructor=course.get("instructor"),
                price=course.get("price"),
                duration=course.get("duration"),
                rating=course.get("rating"),
                category=course.get("category")
            )
            for course in filtered_courses
        ]
        
        return CourseSearchResponse(
            courses=courses,
            total_count=len(courses),
            search_query=search_request.query
        )
        
    except Exception as e:
        logger.error(f"Error searching courses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search courses"
        )

@router.get("/{course_id}", response_model=Course)
async def get_course_detail(
    course_id: str,
    user_id: str = Depends(verify_token)
):
    """
    Lấy chi tiết khóa học
    """
    try:
        # Get courses from Elearning backend
        courses_data = await get_elearning_courses()
        
        # Find specific course
        course_data = next(
            (c for c in courses_data if c.get("id") == course_id), 
            None
        )
        
        if not course_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        return Course(
            id=course_data.get("id", ""),
            title=course_data.get("title", ""),
            description=course_data.get("description", ""),
            instructor=course_data.get("instructor"),
            price=course_data.get("price"),
            duration=course_data.get("duration"),
            rating=course_data.get("rating"),
            category=course_data.get("category")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting course detail: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get course detail"
        )

@router.get("/categories/list")
async def get_course_categories(
    user_id: str = Depends(verify_token)
):
    """
    Lấy danh sách categories khóa học
    """
    try:
        # Get courses from Elearning backend
        courses_data = await get_elearning_courses()
        
        # Extract unique categories
        categories = list(set(
            course.get("category") 
            for course in courses_data 
            if course.get("category")
        ))
        
        return {"categories": categories}
        
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get categories"
        )

@router.get("/recommendations/personalized")
async def get_personalized_recommendations(
    chatbot: ElearningChatbot = Depends(get_chatbot),
    user_id: str = Depends(verify_token)
):
    """
    Lấy gợi ý khóa học cá nhân hóa
    """
    try:
        # Get user profile
        profile = await chatbot.get_user_learning_profile(user_id)
        
        # Get enrolled courses
        enrolled_courses = profile.get("enrolled_courses", [])
        
        # Get learning preferences
        preferences = profile.get("learning_preferences", {})
        
        # Generate recommendations based on profile
        # This is a simplified version - in production, use ML algorithms
        recommendations = []
        
        if preferences.get("interested_in_courses"):
            # Get courses similar to enrolled ones
            courses_data = await get_elearning_courses()
            recommendations = courses_data[:5]  # Simplified
        
        return {"recommendations": recommendations}
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get recommendations"
        )

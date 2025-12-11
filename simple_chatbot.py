"""
Elearning Chatbot AI - Simple Test Version (Updated for new Gemini API)
"""

import time
try:
    from google import genai as genai_new
    USE_NEW_API = True
except ImportError:
    USE_NEW_API = False
    try:
        import google.generativeai as genai_old
        USE_OLD_API = True
    except ImportError:
        USE_OLD_API = False
        genai_old = None

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Cau hinh Gemini Pro API - Doc tu bien moi truong
# IMPORTANT: Khong hardcode API key trong code!
# Set GEMINI_API_KEY trong file .env hoac bien moi truong
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError(
        "GEMINI_API_KEY chua duoc cau hinh! "
        "Vui long tao file .env hoac set bien moi truong GEMINI_API_KEY. "
        "Xem file .env.example de biet cach cau hinh."
    )

# Dùng Gemini 2.5 Flash - model mới nhất
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Tao FastAPI app
app = FastAPI(title="Elearning Chatbot AI")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    status: str

@app.get("/")
async def root():
    return {
        "message": "Elearning Chatbot AI - Test Version",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

def call_gemini_api_with_retry(prompt, max_retries=3):
    """Gọi Gemini API với retry logic để xử lý rate limit"""
    
    for attempt in range(max_retries):
        try:
            # Thử dùng API mới trước (cách mới từ Google)
            if USE_NEW_API:
                try:
                    client = genai_new.Client(api_key=GEMINI_API_KEY)
                    response = client.models.generate_content(
                        model=GEMINI_MODEL,
                        contents=prompt
                    )
                    # API mới trả về response có thuộc tính text
                    if hasattr(response, 'text'):
                        return response.text
                    elif hasattr(response, 'candidates') and len(response.candidates) > 0:
                        # Fallback: lấy từ candidates
                        return response.candidates[0].content.parts[0].text
                    else:
                        return str(response)
                except Exception as e:
                    print(f"New API failed, falling back to old API: {e}")
            
            # Dùng API cũ (fallback)
            if USE_OLD_API and genai_old:
                genai_old.configure(api_key=GEMINI_API_KEY)
                model = genai_old.GenerativeModel(GEMINI_MODEL)
                response = model.generate_content(prompt)
                return response.text
            else:
                raise Exception("Không tìm thấy package google-generativeai hoặc google-genai")
            
        except Exception as e:
            error_str = str(e).lower()
            
            # Kiểm tra các loại lỗi
            if "429" in error_str or "resource_exhausted" in error_str:
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) * 2  # Exponential backoff: 2s, 4s, 8s
                    print(f"Rate limit hit, waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception("API key đã hết quota hoặc bị giới hạn rate limit. Vui lòng thử lại sau hoặc dùng API key khác.")
            
            elif "503" in error_str or "unavailable" in error_str:
                if attempt < max_retries - 1:
                    wait_time = 3
                    print(f"Service unavailable, waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                    time.sleep(wait_time)
                    continue
                else:
                    raise Exception("Service tạm thời không khả dụng. Vui lòng thử lại sau.")
            
            else:
                # Lỗi khác - không retry
                raise e
    
    raise Exception("Không thể kết nối sau nhiều lần thử")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_message: ChatMessage):
    try:
        prompt = f"""
Bạn là trợ lý AI chuyên nghiệp cho hệ thống học liệu trực tuyến.

NHIỆM VỤ CỦA BẠN:
1. Giải thích bài học, khái niệm, và nội dung học tập một cách dễ hiểu
2. Gợi ý tài liệu, khóa học phù hợp với nhu cầu học viên
3. Theo dõi và phân tích tiến độ học tập của học viên
4. Hướng dẫn sử dụng các tính năng của hệ thống
5. Hỗ trợ kỹ thuật và giải đáp thắc mắc về khóa học

QUY TẮC TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt, giọng điệu thân thiện và chuyên nghiệp
- Format câu trả lời rõ ràng, có thể dùng bullet points hoặc số thứ tự khi cần
- Khuyến khích và động viên học viên trong quá trình học tập
- Nếu không có thông tin, hãy đề xuất cách tìm hiểu thêm hoặc liên hệ admin

CHUYÊN MÔN:
- Giải thích các khái niệm lập trình, công nghệ, và kỹ năng mềm
- Phân tích tiến độ học tập và đưa ra gợi ý cải thiện
- Tư vấn lộ trình học phù hợp với mục tiêu của học viên

CÂU HỎI CỦA HỌC VIÊN: {chat_message.message}

Hãy trả lời câu hỏi trên một cách chi tiết và hữu ích:

"""
        
        # Gọi API với retry logic
        response_text = call_gemini_api_with_retry(prompt)
        
        # Kiểm tra response
        if not response_text:
            raise Exception("Phản hồi từ Gemini API rỗng")
        
        return ChatResponse(
            response=response_text,
            status="success"
        )
        
    except Exception as e:
        error_msg = str(e)
        # Log lỗi để debug
        print(f"ERROR in chat endpoint: {error_msg}")
        
        # Trả về thông báo thân thiện hơn
        if "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            friendly_msg = "Xin lỗi, hệ thống đang quá tải. Vui lòng thử lại sau vài phút. 🙏"
        elif "unavailable" in error_msg.lower():
            friendly_msg = "Xin lỗi, dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau. ⏳"
        else:
            friendly_msg = f"Xin lỗi, tôi gặp lỗi: {error_msg}"
        
        return ChatResponse(
            response=friendly_msg,
            status="error"
        )

@app.get("/courses")
async def get_sample_courses():
    courses = [
        {
            "id": "1",
            "title": "Lap trinh Python tu co ban den nang cao",
            "instructor": "Nguyen Van A",
            "price": 299000,
            "duration": "40 gio",
            "rating": 4.8,
            "category": "programming"
        },
        {
            "id": "2", 
            "title": "Web Development voi React va Node.js",
            "instructor": "Tran Thi B",
            "price": 499000,
            "duration": "60 gio",
            "rating": 4.9,
            "category": "web_development"
        },
        {
            "id": "3",
            "title": "Data Science va Machine Learning",
            "instructor": "Le Van C", 
            "price": 799000,
            "duration": "80 gio",
            "rating": 4.7,
            "category": "data_science"
        }
    ]
    
    return {"courses": courses}

if __name__ == "__main__":
    print("=" * 50)
    print("Khoi chay Elearning Chatbot AI - Test Version")
    print("=" * 50)
    # Không in API key ra console để bảo mật
    print(f"API Key: {'*' * 20}... (đã được cấu hình)")
    print(f"Model: {GEMINI_MODEL}")
    print(f"API Type: {'New (google-genai)' if USE_NEW_API else 'Old (google-generativeai)'}")
    print("Server se chay tai: http://localhost:8000")
    print("API docs: http://localhost:8000/docs")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

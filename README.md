"""
README.md - Elearning Chatbot AI

## Tổng quan

Chatbot AI cho hệ thống Elearning sử dụng Gemini Pro API và kiến trúc RAG (Retrieval-Augmented Generation) để hỗ trợ học viên 24/7.

## Tính năng chính

### 1. Tư vấn & Giải đáp
- Trả lời câu hỏi về khóa học, giảng viên, nội dung học tập
- Hướng dẫn sử dụng hệ thống Elearning
- Tư vấn lộ trình học phù hợp

### 2. Hỗ trợ kỹ thuật
- Xử lý các lỗi phổ biến (video không phát, quên mật khẩu)
- Hướng dẫn cài đặt và sử dụng tính năng
- Chuyển tiếp vấn đề phức tạp cho admin

### 3. Tương tác thông minh
- Ghi nhớ ngữ cảnh cuộc hội thoại
- Cá nhân hóa phản hồi dựa trên lịch sử học viên
- Đề xuất khóa học liên quan

## Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI       │    │   Gemini Pro    │
│   (Web/Mobile)  │◄──►│   Backend       │◄──►│   API           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   RAG System    │
                       │   (ChromaDB +    │
                       │   Embeddings)    │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Elearning     │
                       │   Backend API   │
                       └─────────────────┘
```

## Cài đặt

### 1. Yêu cầu hệ thống
- Python 3.8+
- Redis (cho session management)
- SQLite (cho database)

### 2. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 3. Cấu hình môi trường
```bash
cp config.env.example .env
# Chỉnh sửa file .env với thông tin của bạn
```

### 4. Khởi chạy ứng dụng
```bash
python main.py
```

## Cấu hình

### Gemini Pro API
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
```

### Database
```env
DATABASE_URL=sqlite:///./elearning_chatbot.db
REDIS_URL=redis://localhost:6379
```

### Elearning Backend
```env
ELEARNING_API_BASE_URL=http://localhost:3000/api
ELEARNING_API_KEY=your_elearning_api_key
```

## API Endpoints

### Chat Endpoints
- `POST /api/v1/chat/send` - Gửi tin nhắn
- `GET /api/v1/chat/sessions` - Lấy danh sách phiên chat
- `POST /api/v1/chat/sessions/{session_id}/end` - Kết thúc phiên chat
- `GET /api/v1/chat/sessions/{session_id}/context` - Lấy context phiên chat

### Course Endpoints
- `GET /api/v1/courses/` - Lấy danh sách khóa học
- `POST /api/v1/courses/search` - Tìm kiếm khóa học
- `GET /api/v1/courses/{course_id}` - Lấy chi tiết khóa học
- `GET /api/v1/courses/categories/list` - Lấy danh sách categories

### User Endpoints
- `GET /api/v1/users/profile` - Lấy profile người dùng
- `GET /api/v1/users/progress` - Lấy tiến độ học tập
- `GET /api/v1/users/stats` - Lấy thống kê sử dụng chatbot

### Admin Endpoints
- `GET /api/v1/admin/stats/system` - Thống kê hệ thống
- `GET /api/v1/admin/analytics/chat` - Phân tích chat
- `POST /api/v1/admin/faq` - Thêm FAQ
- `POST /api/v1/admin/courses/sync` - Đồng bộ khóa học

## Sử dụng

### 1. Gửi tin nhắn
```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/chat/send",
    headers={"Authorization": "Bearer your_token"},
    json={"message": "Tôi muốn tìm hiểu về khóa học lập trình"}
)

print(response.json())
```

### 2. Tìm kiếm khóa học
```python
response = requests.post(
    "http://localhost:8000/api/v1/courses/search",
    headers={"Authorization": "Bearer your_token"},
    json={
        "query": "lập trình Python",
        "category": "programming",
        "max_price": 500000
    }
)
```

## Testing

Chạy test suite:
```bash
pytest tests/ -v
```

## Monitoring

### Logs
Logs được lưu trong `./logs/chatbot.log`

### Metrics
- Số lượng phiên chat
- Số lượng tin nhắn
- Độ tin cậy trung bình
- Thời gian phản hồi

## Triển khai Production

### 1. Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

### 2. Environment Variables
```env
# Production settings
GEMINI_API_KEY=your_production_key
DATABASE_URL=postgresql://user:pass@localhost/chatbot
REDIS_URL=redis://redis-server:6379
LOG_LEVEL=INFO
```

### 3. Security
- Sử dụng HTTPS
- Cấu hình CORS properly
- Implement proper JWT authentication
- Rate limiting

## Troubleshooting

### Lỗi thường gặp

1. **Gemini API không hoạt động**
   - Kiểm tra API key
   - Kiểm tra quota và billing

2. **Redis connection failed**
   - Kiểm tra Redis server
   - Fallback về in-memory storage

3. **Database errors**
   - Kiểm tra database connection
   - Chạy migration nếu cần

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License

## Liên hệ

- Email: support@elearning.com
- Documentation: https://docs.elearning.com/chatbot

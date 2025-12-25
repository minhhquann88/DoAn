# KIẾN TRÚC HỆ THỐNG ELEARNING CHATBOT AI

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  Web App (React/Vue)  │  Mobile App  │  Admin Dashboard        │
└─────────────────┬─────────────────┬─────────────────┬───────────┘
                  │                 │                 │
                  ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                             │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Server (Port 8000)  │  Authentication  │  Rate Limit │
└─────────────────┬─────────────────┬─────────────────┬───────────┘
                  │                 │                 │
                  ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CORE SERVICES                           │
├─────────────────────────────────────────────────────────────────┤
│  Chatbot Core    │  Session Mgmt  │  RAG System    │  Admin API │
│  (Gemini Pro)    │  (Redis)       │  (ChromaDB)    │            │
└─────────────────┬─────────────────┬─────────────────┬───────────┘
                  │                 │                 │
                  ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  SQLite DB      │  Redis Cache   │  Vector DB      │  File Logs │
│  (Sessions)     │  (Sessions)    │  (Knowledge)    │  (Logs)    │
└─────────────────┬─────────────────┬─────────────────┬───────────┘
                  │                 │                 │
                  ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────────┤
│  Gemini Pro API  │  Elearning API │  Payment Gateway │  Email   │
│  (AI/LLM)       │  (Courses)     │  (Stripe)        │  (SMTP)  │
└─────────────────────────────────────────────────────────────────┘
```

## Luồng xử lý tin nhắn

```
1. User gửi tin nhắn
   ↓
2. API Gateway nhận request
   ↓
3. Authentication & Rate Limiting
   ↓
4. Session Manager tìm/tao session
   ↓
5. RAG System tìm context liên quan
   ↓
6. Chatbot Core tạo prompt với context
   ↓
7. Gemini Pro API generate response
   ↓
8. Lưu conversation vào database
   ↓
9. Update session context
   ↓
10. Trả response về user
```

## Các thành phần chính

### 1. Chatbot Core (`src/core/chatbot.py`)
- **Chức năng**: Xử lý tin nhắn và tạo phản hồi
- **Công nghệ**: Gemini Pro API
- **Tính năng**:
  - Xử lý tin nhắn người dùng
  - Tạo prompt với context
  - Generate response thông minh
  - Tính toán confidence score

### 2. RAG System (`src/core/rag_system.py`)
- **Chức năng**: Tìm kiếm thông tin liên quan
- **Công nghệ**: ChromaDB + Sentence Transformers
- **Tính năng**:
  - Vector search trong knowledge base
  - Embedding documents và queries
  - Tìm kiếm khóa học
  - Quản lý FAQ

### 3. Session Manager (`src/core/session_manager.py`)
- **Chức năng**: Quản lý phiên chat và context
- **Công nghệ**: Redis + SQLite
- **Tính năng**:
  - Tạo và quản lý session
  - Cache session data
  - Track conversation topics
  - User preferences

### 4. API Endpoints (`src/api/routes/`)
- **Chat API**: Xử lý tin nhắn và session
- **Course API**: Tìm kiếm và quản lý khóa học
- **User API**: Profile và thống kê người dùng
- **Admin API**: Quản lý hệ thống và analytics

### 5. Database Models (`src/database/models.py`)
- **ChatSession**: Thông tin phiên chat
- **ChatMessage**: Tin nhắn và phản hồi
- **Course**: Thông tin khóa học
- **UserProfile**: Profile người dùng
- **FAQ**: Câu hỏi thường gặp

## Data Flow

### 1. Knowledge Base Flow
```
Course Data → RAG System → Vector Embeddings → ChromaDB
FAQ Data → RAG System → Vector Embeddings → ChromaDB
User Query → Embedding → Vector Search → Relevant Context
```

### 2. Chat Flow
```
User Message → Session Lookup → Context Retrieval → Prompt Building
→ Gemini Pro → Response Generation → Database Storage → User Response
```

### 3. Session Flow
```
User Login → Session Creation → Redis Cache → Context Tracking
→ Conversation History → Preference Learning → Personalized Responses
```

## Scalability & Performance

### Horizontal Scaling
- **Load Balancer**: Nginx/HAProxy
- **Multiple Instances**: Docker containers
- **Database Sharding**: By user_id or session_id
- **Cache Distribution**: Redis Cluster

### Vertical Scaling
- **CPU**: Gemini Pro API calls
- **Memory**: Vector embeddings cache
- **Storage**: Database và logs
- **Network**: API requests

### Performance Optimization
- **Connection Pooling**: Database connections
- **Caching**: Redis cho sessions
- **Async Processing**: FastAPI async/await
- **Batch Processing**: Bulk operations

## Security & Monitoring

### Security
- **Authentication**: JWT tokens
- **Authorization**: Role-based access
- **Rate Limiting**: Per user/IP
- **Input Validation**: Pydantic models
- **HTTPS**: SSL/TLS encryption

### Monitoring
- **Logging**: Structured logs với Loguru
- **Metrics**: Response time, success rate
- **Health Checks**: API endpoints
- **Error Tracking**: Exception handling
- **Performance**: Database queries, API calls

## Deployment Architecture

### Development
```
Local Machine → Python Virtual Env → SQLite → In-Memory Cache
```

### Staging
```
Docker Container → PostgreSQL → Redis → External APIs
```

### Production
```
Kubernetes Cluster → Managed Database → Redis Cluster → CDN
```

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Cache**: Redis
- **Vector DB**: ChromaDB
- **AI/LLM**: Gemini Pro API

### Frontend (Optional)
- **Web**: React/Vue.js
- **Mobile**: React Native/Flutter
- **Admin**: Vue.js/React Admin

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose / Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

## Configuration Management

### Environment Variables
```bash
# Core Configuration
GEMINI_API_KEY=your_api_key
DATABASE_URL=sqlite:///./chatbot.db
REDIS_URL=redis://localhost:6379

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO

# External Services
ELEARNING_API_BASE_URL=http://localhost:3000/api
ELEARNING_API_KEY=your_elearning_key
```

### Feature Flags
- **RAG_ENABLED**: Bật/tắt RAG system
- **REDIS_ENABLED**: Bật/tắt Redis cache
- **ANALYTICS_ENABLED**: Bật/tắt analytics
- **RATE_LIMITING**: Bật/tắt rate limiting

## Error Handling & Recovery

### Error Types
- **API Errors**: Gemini Pro API failures
- **Database Errors**: Connection issues
- **Cache Errors**: Redis failures
- **Network Errors**: External API timeouts

### Recovery Strategies
- **Fallback Responses**: Khi AI API fails
- **Graceful Degradation**: Khi cache fails
- **Retry Logic**: Exponential backoff
- **Circuit Breaker**: Prevent cascade failures

## Future Enhancements

### Short Term
- **Multi-language Support**: Vietnamese + English
- **Voice Interface**: Speech-to-text integration
- **Rich Media**: Image/video support
- **Advanced Analytics**: User behavior tracking

### Long Term
- **ML Pipeline**: Custom model training
- **Personalization**: Advanced recommendation engine
- **Integration**: CRM, LMS systems
- **Mobile App**: Native mobile application

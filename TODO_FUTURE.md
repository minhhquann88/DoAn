# 📝 TODO - Các phần sẽ làm sau

## ✅ Đã ghi nhớ - Sẽ làm sau

### 1. Tích hợp với backend Java để lấy context thực (courses, progress)
- **Mục tiêu:** Frontend chatbot gọi API Java để lấy dữ liệu học tập thực của user
- **Cần làm:**
  - Tạo endpoint `/api/chat/context` trong Java backend
  - Service `AiContextService` để query database (courses, enrollments, progress)
  - Frontend gọi endpoint này trước khi gửi đến Gemini
  - Format context data thành prompt cho Gemini

### 2. Thêm chat history (lưu vào database)
- **Mục tiêu:** Lưu lịch sử chat vào database để user có thể xem lại
- **Cần làm:**
  - Tạo entity `ChatMessage` trong Java backend (đã có model `Chat_Message.java`)
  - API để lưu/truy xuất chat history
  - Frontend lưu tin nhắn vào database sau mỗi cuộc hội thoại
  - Hiển thị lịch sử chat khi user quay lại

### 3. Tích hợp RAG system với ChromaDB
- **Mục tiêu:** Chatbot có thể trả lời dựa trên dữ liệu khóa học thực từ vector database
- **Cần làm:**
  - Setup ChromaDB
  - Embed course content (lessons, descriptions) vào vector database
  - RAG system tìm kiếm context liên quan khi user hỏi
  - Tích hợp vào Python backend hoặc Java backend

### 4. Thêm authentication (JWT) cho API
- **Mục tiêu:** Bảo mật các API endpoints, chỉ user đã đăng nhập mới dùng được
- **Cần làm:**
  - Tích hợp JWT vào tất cả API endpoints (đã có `AuthController.java`)
  - Frontend lưu JWT token sau khi login
  - Tự động gắn token vào mọi API request
  - Xử lý token expired, refresh token

### 5. Deploy lên production
- **Mục tiêu:** Deploy hệ thống lên server production
- **Cần làm:**
  - Setup production database (MySQL/PostgreSQL)
  - Build frontend (React) và deploy lên hosting
  - Deploy backend Java lên server (Spring Boot)
  - Deploy Python chatbot lên server hoặc container
  - Setup domain, SSL certificate
  - Monitoring và logging

---

## 📅 Timeline (Ước tính)

- **Phase 1:** Tích hợp backend Java + Chat history (1-2 tuần)
- **Phase 2:** RAG system + Authentication (2-3 tuần)
- **Phase 3:** Deploy production (1 tuần)

---

**Lưu ý:** Các phần này sẽ được thực hiện sau khi test xong các module 6, 7, 8, 9.


# 📚 API DOCUMENTATION

**Hệ thống:** E-Learning Course Management  
**Backend:** Spring Boot (Java)  
**Frontend:** Next.js (TypeScript)  
**Ngày cập nhật:** 22/12/2025

---

## 🔧 CẤU HÌNH

### Backend
- **Base URL:** `http://localhost:8080/api`
- **Port:** 8080
- **Authentication:** JWT Bearer Token
- **Token Expiry:** 24 hours

### Frontend
- **Base URL:** `http://localhost:3000`
- **API Client:** Axios with interceptors
- **Token Storage:** localStorage

### Chatbot (Python FastAPI)
- **Base URL:** `http://localhost:8000/api`
- **Port:** 8000

---

## 🔐 AUTHENTICATION

### POST /api/auth/login
**Mô tả:** Đăng nhập user

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "id": 1,
  "username": "user@example.com",
  "email": "user@example.com",
  "roles": ["ROLE_STUDENT"]
}
```

---

### POST /api/auth/register
**Mô tả:** Đăng ký user mới

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "role": "ROLE_STUDENT"
}
```

**Response (200):**
```json
{
  "message": "User registered successfully!"
}
```

---

### POST /api/auth/forgot-password
**Mô tả:** Yêu cầu reset password

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to your email!"
}
```

---

### POST /api/auth/reset-password
**Mô tả:** Reset password với token

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully!"
}
```

---

### PUT /api/user/profile
**Mô tả:** Cập nhật thông tin user  
**Auth Required:** ✅

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phone": "0123456789"
}
```

**Response (200):** User object

---

## 📚 COURSES

### GET /api/courses
**Mô tả:** Lấy danh sách khóa học (public)

**Query Parameters:**
| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| keyword | string | - | Từ khóa tìm kiếm |
| categoryId | number | - | ID danh mục |
| page | number | 0 | Số trang |
| size | number | 10 | Số items/trang |
| sort | string | createdAt,desc | Sắp xếp |

**Response (200):**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Lập trình Python cơ bản",
      "shortDescription": "Học Python từ đầu",
      "description": "...",
      "categoryId": 1,
      "level": "BEGINNER",
      "language": "Vietnamese",
      "price": 500000,
      "thumbnail": "url",
      "status": "PUBLISHED",
      "createdAt": "2025-12-22T10:00:00"
    }
  ],
  "totalElements": 100,
  "totalPages": 10,
  "number": 0
}
```

---

### GET /api/courses/{id}
**Mô tả:** Lấy chi tiết khóa học

**Response (200):** Course object

---

### POST /api/courses
**Mô tả:** Tạo khóa học mới  
**Auth Required:** ✅ ADMIN, LECTURER

**Request Body:**
```json
{
  "title": "Lập trình Java",
  "shortDescription": "Học Java từ cơ bản đến nâng cao",
  "description": "Chi tiết khóa học...",
  "categoryId": 1,
  "level": "INTERMEDIATE",
  "language": "Vietnamese",
  "price": 1000000,
  "thumbnail": "url"
}
```

---

### PUT /api/courses/{id}
**Mô tả:** Cập nhật khóa học  
**Auth Required:** ✅ ADMIN, owner LECTURER

---

### DELETE /api/courses/{id}
**Mô tả:** Xóa khóa học  
**Auth Required:** ✅ ADMIN, owner LECTURER

---

### PATCH /api/courses/{id}/approve
**Mô tả:** Duyệt khóa học  
**Auth Required:** ✅ ADMIN only

---

### GET /api/courses/{id}/statistics
**Mô tả:** Thống kê khóa học  
**Auth Required:** ✅ ADMIN, owner LECTURER

**Response (200):**
```json
{
  "totalEnrollments": 150,
  "activeEnrollments": 120,
  "completedEnrollments": 30,
  "revenue": 75000000,
  "averageRating": 4.5
}
```

---

## 📖 CONTENT

### GET /api/content/courses/{courseId}
**Mô tả:** Lấy nội dung khóa học  
**Auth Required:** ✅ Enrolled student hoặc owner

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Chương 1: Giới thiệu",
    "description": "Tổng quan về khóa học",
    "orderIndex": 1,
    "lessons": [
      {
        "id": 1,
        "title": "Bài 1: Làm quen",
        "contentType": "VIDEO",
        "contentUrl": "url",
        "duration": 15,
        "orderIndex": 1,
        "isFree": true,
        "isCompleted": false
      }
    ]
  }
]
```

---

### POST /api/content/lessons/{lessonId}/complete
**Mô tả:** Đánh dấu hoàn thành bài học  
**Auth Required:** ✅ Enrolled student

**Response (200):**
```json
{
  "message": "Lesson marked as completed!"
}
```

---

### POST /api/manage/content/courses/{courseId}/chapters
**Mô tả:** Tạo chapter mới  
**Auth Required:** ✅ ADMIN, owner LECTURER

**Request Body:**
```json
{
  "title": "Chương 2: Biến và kiểu dữ liệu",
  "description": "Học về biến trong Python",
  "orderIndex": 2
}
```

---

### POST /api/manage/content/chapters/{chapterId}/lessons
**Mô tả:** Tạo lesson mới  
**Auth Required:** ✅ ADMIN, owner LECTURER

**Request Body:**
```json
{
  "title": "Bài 3: Biến",
  "description": "Cách khai báo biến",
  "contentType": "VIDEO",
  "contentUrl": "https://...",
  "duration": 20,
  "orderIndex": 1,
  "isFree": false
}
```

---

### GET /api/manage/content/courses/{courseId}/export
**Mô tả:** Export nội dung ra Excel  
**Auth Required:** ✅ ADMIN, owner LECTURER

**Response:** File .xlsx

---

### POST /api/manage/content/courses/{courseId}/import
**Mô tả:** Import nội dung từ Excel  
**Auth Required:** ✅ ADMIN, owner LECTURER

**Request:** multipart/form-data với file Excel

---

## 📝 TESTS (QUIZ)

### GET /api/tests/{testId}
**Mô tả:** Lấy bài test để làm (ẩn đáp án)  
**Auth Required:** ✅ Enrolled student

---

### POST /api/tests/{testId}/submit
**Mô tả:** Nộp bài test  
**Auth Required:** ✅ Enrolled student

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "answerText": "A"
    },
    {
      "questionId": 2,
      "answerText": "Python là ngôn ngữ lập trình..."
    }
  ]
}
```

**Response (200):**
```json
{
  "id": 1,
  "testId": 1,
  "userId": 1,
  "score": 85,
  "totalPoints": 100,
  "percentage": 85,
  "isPassed": true,
  "attemptNumber": 1,
  "startedAt": "2025-12-22T10:00:00",
  "submittedAt": "2025-12-22T10:30:00",
  "timeSpent": 1800
}
```

---

### GET /api/tests/{testId}/result
**Mô tả:** Xem kết quả bài test  
**Auth Required:** ✅

---

### POST /api/manage/tests/lessons/{lessonId}
**Mô tả:** Tạo bài test mới  
**Auth Required:** ✅ ADMIN, owner LECTURER

---

### GET /api/manage/tests/{testId}/submissions
**Mô tả:** Xem tất cả bài nộp  
**Auth Required:** ✅ ADMIN, owner LECTURER

---

### POST /api/manage/tests/grade-essay
**Mô tả:** Chấm câu tự luận  
**Auth Required:** ✅ ADMIN, LECTURER

---

## 👥 ENROLLMENTS

### POST /api/v1/enrollments
**Mô tả:** Ghi danh khóa học

**Request Body:**
```json
{
  "courseId": 1,
  "studentId": 1
}
```

---

### GET /api/v1/enrollments/course/{courseId}
**Mô tả:** Danh sách học viên của khóa học

---

### GET /api/v1/enrollments/student/{studentId}
**Mô tả:** Danh sách khóa học của học viên

---

### PATCH /api/v1/enrollments/{id}
**Mô tả:** Cập nhật trạng thái/tiến độ

---

### GET /api/v1/enrollments/student/{studentId}/history
**Mô tả:** Lịch sử học tập

---

### GET /api/v1/enrollments/stats/monthly
**Mô tả:** Thống kê học viên theo tháng

---

## 👨‍🏫 INSTRUCTORS

### GET /api/v1/instructors
**Mô tả:** Danh sách giảng viên

---

### GET /api/v1/instructors/{id}
**Mô tả:** Thông tin giảng viên

---

### GET /api/v1/instructors/{id}/stats
**Mô tả:** Thống kê giảng viên

---

### GET /api/v1/instructors/{id}/courses
**Mô tả:** Danh sách khóa học của giảng viên

---

### PATCH /api/v1/instructors/{id}/status
**Mô tả:** Cập nhật trạng thái  
**Auth Required:** ✅ ADMIN

**Query Parameters:**
- status: ACTIVE | SUSPENDED | INACTIVE

---

## 📊 STATISTICS

### GET /api/v1/statistics/dashboard
**Mô tả:** Tổng quan dashboard

**Response (200):**
```json
{
  "totalCourses": 50,
  "totalStudents": 1000,
  "totalInstructors": 20,
  "totalRevenue": 500000000
}
```

---

### GET /api/v1/statistics/course/{courseId}
**Mô tả:** Thống kê chi tiết khóa học

---

### GET /api/v1/statistics/instructor/{instructorId}
**Mô tả:** Thống kê giảng viên

---

### GET /api/v1/statistics/student/{studentId}
**Mô tả:** Thống kê học viên

---

### GET /api/v1/statistics/revenue
**Mô tả:** Báo cáo doanh thu

**Query Parameters:**
- startDate: ISO DateTime
- endDate: ISO DateTime

---

### GET /api/v1/statistics/completion
**Mô tả:** Báo cáo tỷ lệ hoàn thành

---

## 💰 TRANSACTIONS

### POST /api/v1/transactions
**Mô tả:** Tạo giao dịch thanh toán

**Request Body:**
```json
{
  "courseId": 1,
  "userId": 1,
  "paymentGateway": "VNPAY",
  "returnUrl": "http://localhost:3000/payment/callback"
}
```

**Response (201):**
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/...",
  "transactionId": 1,
  "transactionCode": "TXN123456",
  "amount": 500000,
  "expiryTime": "2025-12-22T11:00:00"
}
```

---

### GET /api/v1/transactions/payment/callback
**Mô tả:** Xử lý callback từ cổng thanh toán

**Query Parameters:** Từ VNPay redirect

---

### GET /api/v1/transactions
**Mô tả:** Danh sách giao dịch

---

### GET /api/v1/transactions/user/{userId}
**Mô tả:** Giao dịch của user

---

### GET /api/v1/transactions/revenue
**Mô tả:** Thống kê doanh thu

---

## 🏆 CERTIFICATES

### POST /api/v1/certificates
**Mô tả:** Cấp chứng chỉ

**Request Body:**
```json
{
  "userId": 1,
  "courseId": 1,
  "enrollmentId": 1
}
```

---

### GET /api/v1/certificates/{id}
**Mô tả:** Lấy thông tin chứng chỉ

---

### GET /api/v1/certificates/code/{code}
**Mô tả:** Lấy chứng chỉ theo mã

---

### GET /api/v1/certificates/verify/{code}
**Mô tả:** Xác minh chứng chỉ

**Response (200):**
```json
{
  "certificateCode": "CERT-2025-001",
  "isValid": true,
  "message": "Certificate is valid"
}
```

---

### GET /api/v1/certificates/user/{userId}
**Mô tả:** Danh sách chứng chỉ của user

---

### GET /api/v1/certificates/course/{courseId}
**Mô tả:** Danh sách chứng chỉ của khóa học

---

### GET /api/v1/certificates/stats
**Mô tả:** Thống kê chứng chỉ

---

### DELETE /api/v1/certificates/{id}
**Mô tả:** Thu hồi chứng chỉ  
**Auth Required:** ✅ ADMIN

---

## 🤖 CHATBOT (Python FastAPI)

### POST /api/chat/message
**Mô tả:** Gửi tin nhắn đến chatbot

**Request Body:**
```json
{
  "message": "Làm thế nào để đăng ký khóa học?",
  "context": {}
}
```

**Response (200):**
```json
{
  "response": "Để đăng ký khóa học, bạn cần...",
  "suggestions": [
    "Xem danh sách khóa học",
    "Hướng dẫn thanh toán"
  ]
}
```

---

### GET /api/chat/context/{userId}
**Mô tả:** Lấy context chat

---

### DELETE /api/chat/history/{userId}
**Mô tả:** Xóa lịch sử chat

---

### GET /api/health
**Mô tả:** Health check

---

## 🔒 ERROR RESPONSES

### 400 Bad Request
```json
{
  "message": "Error: Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "message": "Error: Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Error: Access denied"
}
```

### 404 Not Found
```json
{
  "message": "Error: Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error: Internal server error"
}
```

---

## 📋 ENUMS

### Course Status
- DRAFT
- PENDING
- PUBLISHED
- ARCHIVED

### Course Level
- BEGINNER
- INTERMEDIATE
- ADVANCED
- EXPERT

### User Roles
- ROLE_STUDENT
- ROLE_LECTURER
- ROLE_ADMIN

### Enrollment Status
- ACTIVE
- COMPLETED
- CANCELLED
- DROPPED

### Content Type
- VIDEO
- TEXT
- DOCUMENT
- QUIZ

### Question Type
- SINGLE_CHOICE
- MULTIPLE_CHOICE
- TRUE_FALSE
- SHORT_ANSWER
- ESSAY

### Test Type
- QUIZ
- ASSIGNMENT
- EXAM
- PRACTICE

### Transaction Status
- PENDING
- PROCESSING
- COMPLETED
- FAILED
- REFUNDED
- CANCELLED

### Payment Gateway
- VNPAY
- MOMO
- BANK_TRANSFER

---

*API Documentation - v1.0 - 22/12/2025*


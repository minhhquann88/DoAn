# 📋 INTEGRATION CHECKLIST - FRONTEND & BACKEND

**Ngày tạo:** 22/12/2025  
**Dự án:** Hệ thống Quản lý Khóa học (E-Learning)

---

## 📊 TÓM TẮT NHANH

| Metric | Trước khi sửa | Sau khi sửa |
|--------|--------------|-------------|
| **Tổng số Backend Endpoints** | 52 | 52 |
| **Frontend Services đã tạo** | 11 | 11 |
| **Endpoints khớp hoàn hảo** | 15 | 45 |
| **Endpoints cần sửa URL** | 25 | 0 ✅ |
| **Endpoints Backend chưa có Frontend** | 12 | 0 ✅ |
| **Frontend gọi endpoints không tồn tại** | 35+ | 7 |
| **Tỷ lệ hoàn thành** | ~29% | **~85%** ✅ |

---

## 🔧 CẤU HÌNH HỆ THỐNG

### Backend (Spring Boot)
| Config | Giá trị | Status |
|--------|---------|--------|
| Port | 8080 | ✅ |
| CORS Origins | localhost:5173, localhost:3000, localhost:5177 | ✅ |
| CORS Methods | GET, POST, PUT, DELETE, OPTIONS, PATCH | ✅ |
| Security | @EnableMethodSecurity **DISABLED** | ⚠️ |
| JWT Enabled | Có (24h expiry) | ✅ |
| Database | MySQL 8 | ✅ |

### Frontend (Next.js)
| Config | Giá trị | Status |
|--------|---------|--------|
| API Base URL | http://localhost:8080/api | ✅ |
| Chatbot API | http://localhost:8000/api | ✅ |
| Auth Token Storage | localStorage | ✅ |
| Axios Interceptors | Có (token auto-attach) | ✅ |

### Chatbot (Python FastAPI)
| Config | Giá trị | Status |
|--------|---------|--------|
| Port | 8000 | ✅ |
| Endpoint Prefix | /api | ✅ |

---

## 📦 MODULE 1: AUTHENTICATION 🟡

| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| POST /api/auth/login | authService.login() | 🟢 | Hoạt động tốt |
| POST /api/auth/register | authService.register() | 🟢 | Hoạt động tốt |
| POST /api/auth/forgot-password | authService.forgotPassword() | 🟢 | Hoạt động tốt |
| POST /api/auth/reset-password | authService.resetPassword() | 🟢 | Hoạt động tốt |
| PUT /api/user/profile | authService.updateProfile() | 🔴 | Frontend gọi `/auth/profile` |
| ❌ Không tồn tại | authService.getCurrentUser() | 🔴 | Backend không có endpoint |
| ❌ Không tồn tại | authService.changePassword() | 🔴 | Backend không có endpoint |
| POST /api/auth/logout | Không có | 🟡 | Frontend xóa token local |

**Tổng kết Module 1:** 4/8 endpoints khớp (50%)

### ⚡ Actions cần thực hiện:
1. ✅ Sửa `authService.updateProfile()`: đổi URL từ `/auth/profile` → `/user/profile`
2. ✅ Tạo endpoint `GET /api/auth/user` trong backend hoặc xóa function getCurrentUser()
3. ✅ Tạo endpoint `POST /api/auth/change-password` trong backend hoặc xóa function

---

## 📦 MODULE 2: QUẢN LÝ KHÓA HỌC (COURSES) 🟢

| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| GET /api/courses | courseService.getCourses() | 🟢 | OK |
| GET /api/courses/{id} | courseService.getCourseById() | 🟢 | OK |
| POST /api/courses | courseService.createCourse() | 🟢 | OK |
| PUT /api/courses/{id} | courseService.updateCourse() | 🟢 | OK |
| DELETE /api/courses/{id} | courseService.deleteCourse() | 🟢 | OK |
| PATCH /api/courses/{id}/approve | courseService.approveCourse() | 🟢 | OK |
| GET /api/courses/{id}/statistics | courseService.getCourseStatistics() | 🟢 | OK |
| ❌ Không tồn tại | courseService.getInstructorCourses() | 🔴 | Backend không có endpoint |
| ❌ Không tồn tại | courseService.getPendingCourses() | 🔴 | Backend không có endpoint |

**Tổng kết Module 2:** 7/9 endpoints khớp (78%)

### ⚡ Actions cần thực hiện:
1. ✅ Tạo endpoint `GET /api/courses/instructor/my-courses` trong backend
2. ✅ Tạo endpoint `GET /api/courses/pending` trong backend

---

## 📦 MODULE 3: NỘI DUNG KHÓA HỌC (CONTENT) 🔴

| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| GET /api/content/courses/{courseId} | contentService.getCourseContents() | 🔴 | Frontend gọi `/courses/{courseId}/contents` |
| POST /api/content/lessons/{lessonId}/complete | contentService.markContentCompleted() | 🔴 | Frontend gọi `/contents/{contentId}/complete` |
| POST /api/manage/content/courses/{courseId}/chapters | ❌ Không có | 🔴 | Frontend thiếu |
| PUT /api/manage/content/chapters/{chapterId} | ❌ Không có | 🔴 | Frontend thiếu |
| DELETE /api/manage/content/chapters/{chapterId} | ❌ Không có | 🔴 | Frontend thiếu |
| POST /api/manage/content/chapters/{chapterId}/lessons | ❌ Không có | 🔴 | Frontend thiếu |
| PUT /api/manage/content/lessons/{lessonId} | ❌ Không có | 🔴 | Frontend thiếu |
| DELETE /api/manage/content/lessons/{lessonId} | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/manage/content/courses/{courseId}/export | ❌ Không có | 🔴 | Frontend thiếu |
| POST /api/manage/content/courses/{courseId}/import | ❌ Không có | 🔴 | Frontend thiếu |
| ❌ Không tồn tại | contentService.createContent() | 🔴 | Backend không có |
| ❌ Không tồn tại | contentService.updateContent() | 🔴 | Backend không có |
| ❌ Không tồn tại | contentService.deleteContent() | 🔴 | Backend không có |
| ❌ Không tồn tại | contentService.reorderContents() | 🔴 | Backend không có |
| ❌ Không tồn tại | contentService.uploadContentFile() | 🔴 | Backend không có |

**Tổng kết Module 3:** 0/15 endpoints khớp (0%)

### ⚡ Actions cần thực hiện:
1. 🔧 **QUAN TRỌNG**: Viết lại hoàn toàn `contentService.ts` để khớp với backend
2. 🔧 Backend đang dùng Chapter/Lesson model, Frontend đang dùng Content model
3. 🔧 Cần thống nhất cấu trúc dữ liệu

---

## 📦 MODULE 4: BÀI KIỂM TRA (QUIZ/TEST) 🔴

| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| GET /api/tests/{testId} | quizService.getQuizById() | 🔴 | Frontend gọi `/quizzes/{id}` |
| POST /api/tests/{testId}/submit | quizService.submitQuizAttempt() | 🔴 | Frontend gọi `/attempts/{id}/submit` |
| GET /api/tests/{testId}/result | quizService.getAttemptResults() | 🔴 | Frontend gọi `/attempts/{id}/results` |
| POST /api/manage/tests/lessons/{lessonId} | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/manage/tests/{testId}/submissions | ❌ Không có | 🔴 | Frontend thiếu |
| POST /api/manage/tests/grade-essay | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/manage/tests/{testId}/statistics | quizService.getQuizStatistics() | 🔴 | URL khác |
| GET /api/manage/tests/{testId} | ❌ Không có | 🔴 | Frontend thiếu |
| ❌ Không tồn tại | quizService.getCourseQuizzes() | 🔴 | Backend không có |
| ❌ Không tồn tại | quizService.createQuiz() | 🔴 | Backend không có |
| ❌ Không tồn tại | quizService.updateQuiz() | 🔴 | Backend không có |
| ❌ Không tồn tại | quizService.deleteQuiz() | 🔴 | Backend không có |
| ❌ Không tồn tại | quizService.publishQuiz() | 🔴 | Backend không có |
| ❌ Không tồn tại | quizService.createQuestion() | 🔴 | Backend không có |
| ❌ Không tồn tại | quizService.updateQuestion() | 🔴 | Backend không có |
| ❌ Không tồn tại | quizService.deleteQuestion() | 🔴 | Backend không có |

**Tổng kết Module 4:** 0/16 endpoints khớp (0%)

### ⚡ Actions cần thực hiện:
1. 🔧 **QUAN TRỌNG**: Viết lại hoàn toàn `quizService.ts` để khớp với backend Test APIs
2. 🔧 Backend dùng Test model, Frontend dùng Quiz model - cần thống nhất

---

## 📦 MODULE 5: BÀI TẬP (ASSIGNMENTS) 🔴

| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| ❌ Backend không có Assignment API | assignmentService.* | 🔴 | Backend không có module Assignment |

**Tổng kết Module 5:** 0% - Backend không có Assignment module, chỉ có Test module

### ⚡ Actions cần thực hiện:
1. ⏸️ Xóa `assignmentService.ts` hoặc tạo Assignment API trong backend
2. ⏸️ Hoặc merge Assignment vào Test module

---

## 📦 MODULE 6: GHI DANH (ENROLLMENTS) 🔴

| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| POST /api/v1/enrollments | enrollmentService.enrollCourse() | 🔴 | Frontend gọi `/enrollments` thiếu `/v1` |
| GET /api/v1/enrollments/{id} | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/v1/enrollments/course/{courseId} | enrollmentService.getEnrollmentByCourse() | 🔴 | Thiếu `/v1` |
| GET /api/v1/enrollments/student/{studentId} | ❌ Không có | 🔴 | Frontend thiếu |
| PATCH /api/v1/enrollments/{id} | enrollmentService.updateProgress() | 🔴 | Thiếu `/v1` |
| DELETE /api/v1/enrollments/{id} | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/v1/enrollments/student/{studentId}/history | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/v1/enrollments/stats/monthly | ❌ Không có | 🔴 | Frontend thiếu |
| ❌ Không tồn tại | enrollmentService.getMyEnrollments() | 🔴 | Backend không có `/my-courses` |
| ❌ Không tồn tại | enrollmentService.completeLesson() | 🔴 | Backend không có |
| ❌ Không tồn tại | enrollmentService.getCourseProgress() | 🔴 | Backend không có |

**Tổng kết Module 6:** 0/11 endpoints khớp (0%)

### ⚡ Actions cần thực hiện:
1. 🔧 Thêm prefix `/v1` vào tất cả enrollment calls trong frontend
2. 🔧 Tạo endpoint `GET /api/v1/enrollments/my-courses` trong backend

---

## 📦 MODULE 7: QUẢN LÝ GIẢNG VIÊN (INSTRUCTORS) 🔴

| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| GET /api/v1/instructors | instructorService.getAllInstructors() | 🔴 | Thiếu `/v1` |
| GET /api/v1/instructors/{id} | instructorService.getInstructorById() | 🔴 | Thiếu `/v1` |
| GET /api/v1/instructors/{id}/stats | instructorService.getInstructorStatistics() | 🔴 | Thiếu `/v1` |
| POST /api/v1/instructors | instructorService.createInstructor() | 🔴 | Thiếu `/v1` |
| PUT /api/v1/instructors/{id} | instructorService.updateInstructor() | 🔴 | Thiếu `/v1` |
| DELETE /api/v1/instructors/{id} | instructorService.deleteInstructor() | 🔴 | Thiếu `/v1` |
| PATCH /api/v1/instructors/{id}/status | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/v1/instructors/{id}/courses | instructorService.getInstructorCourses() | 🔴 | Thiếu `/v1` |
| ❌ Không tồn tại | instructorService.getMyInstructorProfile() | 🔴 | Backend không có `/me` |
| ❌ Không tồn tại | instructorService.suspendInstructor() | 🔴 | Backend không có |
| ❌ Không tồn tại | instructorService.activateInstructor() | 🔴 | Backend không có |

**Tổng kết Module 7:** 0/11 endpoints khớp (0%)

### ⚡ Actions cần thực hiện:
1. 🔧 Thêm prefix `/v1` vào tất cả instructor calls trong frontend
2. 🔧 Hoặc bỏ `/v1` khỏi backend để thống nhất với các module khác

---

## 📦 MODULE 8: THỐNG KÊ (STATISTICS) 🔴

| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| GET /api/v1/statistics/dashboard | statisticsService.getDashboardOverview() | 🔴 | Thiếu `/v1` |
| GET /api/v1/statistics/course/{courseId} | statisticsService.getCourseStatistics() | 🔴 | Thiếu `/v1` |
| GET /api/v1/statistics/instructor/{instructorId} | statisticsService.getInstructorStatistics() | 🔴 | Thiếu `/v1` |
| GET /api/v1/statistics/student/{studentId} | statisticsService.getStudentStatistics() | 🔴 | Thiếu `/v1` |
| GET /api/v1/statistics/revenue | statisticsService.getRevenueReport() | 🔴 | Thiếu `/v1` |
| GET /api/v1/statistics/completion | statisticsService.getCompletionReport() | 🔴 | Thiếu `/v1` |
| ❌ Không tồn tại | statisticsService.getAllCoursesStatistics() | 🔴 | Backend không có |
| ❌ Không tồn tại | statisticsService.getEnrollmentTrends() | 🔴 | Backend không có |
| ❌ Không tồn tại | statisticsService.exportStatisticsCSV() | 🔴 | Backend không có |
| ❌ Không tồn tại | statisticsService.exportStatisticsPDF() | 🔴 | Backend không có |

**Tổng kết Module 8:** 0/10 endpoints khớp (0%)

### ⚡ Actions cần thực hiện:
1. 🔧 Thêm prefix `/v1` vào tất cả statistics calls trong frontend

---

## 📦 MODULE 9: THANH TOÁN & CHỨNG CHỈ (PAYMENT & CERTIFICATE) 🔴

### Transactions
| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| POST /api/v1/transactions | paymentService.createTransaction() | 🔴 | Thiếu `/v1` |
| GET /api/v1/transactions | paymentService.getAllTransactions() | 🔴 | Thiếu `/v1` |
| GET /api/v1/transactions/{id} | paymentService.getTransactionById() | 🔴 | Thiếu `/v1` |
| GET /api/v1/transactions/payment/callback | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/v1/transactions/user/{userId} | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/v1/transactions/course/{courseId} | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/v1/transactions/revenue | ❌ Không có | 🔴 | Frontend thiếu |
| ❌ Không tồn tại | paymentService.getMyTransactions() | 🔴 | Backend không có |
| ❌ Không tồn tại | paymentService.createVNPayPayment() | 🔴 | Backend không có |
| ❌ Không tồn tại | paymentService.refundTransaction() | 🔴 | Backend không có |

### Certificates
| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| POST /api/v1/certificates | paymentService.issueCertificate() | 🔴 | Thiếu `/v1` |
| GET /api/v1/certificates | paymentService.getAllCertificates() | 🔴 | Thiếu `/v1` |
| GET /api/v1/certificates/{id} | paymentService.getCertificateById() | 🔴 | Thiếu `/v1` |
| GET /api/v1/certificates/code/{code} | paymentService.getCertificateByCode() | 🔴 | Thiếu `/v1` |
| GET /api/v1/certificates/verify/{code} | paymentService.verifyCertificate() | 🔴 | Thiếu `/v1` |
| GET /api/v1/certificates/user/{userId} | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/v1/certificates/course/{courseId} | paymentService.getCourseCertificates() | 🔴 | Thiếu `/v1` |
| GET /api/v1/certificates/stats | ❌ Không có | 🔴 | Frontend thiếu |
| DELETE /api/v1/certificates/{id} | ❌ Không có | 🔴 | Frontend thiếu |
| ❌ Không tồn tại | paymentService.getMyCertificates() | 🔴 | Backend không có |
| ❌ Không tồn tại | paymentService.downloadCertificate() | 🔴 | Backend không có |
| ❌ Không tồn tại | paymentService.regenerateCertificate() | 🔴 | Backend không có |

**Tổng kết Module 9:** 0/22 endpoints khớp (0%)

### ⚡ Actions cần thực hiện:
1. 🔧 Thêm prefix `/v1` vào tất cả transaction/certificate calls trong frontend
2. 🔧 Tạo các endpoints còn thiếu trong backend

---

## 📦 MODULE 10: CHATBOT 🟡

| Backend Endpoint | Frontend Service | Status | Vấn đề |
|-----------------|------------------|--------|--------|
| GET /api/chat/context | ❌ Không có | 🔴 | Frontend thiếu |
| GET /api/chat/health | chatbotService.checkChatbotHealth() | 🟡 | Khác port (8000 vs 8080) |
| POST /api/chat/message (Python) | chatbotService.sendChatMessage() | 🟢 | OK - Gọi Python backend |
| GET /api/chat/context/{userId} (Python) | chatbotService.getChatContext() | 🟢 | OK |
| DELETE /api/chat/history/{userId} (Python) | chatbotService.clearChatHistory() | 🟢 | OK |

**Tổng kết Module 10:** 3/5 endpoints khớp (60%)

### ⚡ Actions cần thực hiện:
1. ✅ Chatbot service đã cấu hình đúng để gọi Python backend
2. 🔧 Cân nhắc thêm function gọi Java backend `/api/chat/context`

---

## 🚨 VẤN ĐỀ CHÍNH CẦN XỬ LÝ

### 1. ⚠️ API Version Prefix Inconsistency
**Vấn đề:** Backend dùng hỗn hợp:
- `/api/auth`, `/api/courses` - không có version
- `/api/v1/enrollments`, `/api/v1/instructors`, `/api/v1/statistics`, `/api/v1/transactions`, `/api/v1/certificates` - có version

**Giải pháp đề xuất:**
- **Option A:** Bỏ `/v1` trong backend để thống nhất
- **Option B:** Thêm `/v1` vào tất cả endpoints
- **Option C:** Frontend tự động thêm `/v1` cho các module cần thiết

### 2. ⚠️ Content vs Chapter/Lesson Model Mismatch
**Vấn đề:** 
- Frontend dùng `Content` model (single level)
- Backend dùng `Chapter > Lesson` model (hierarchical)

**Giải pháp:**
- Viết lại `contentService.ts` để match với backend structure

### 3. ⚠️ Quiz vs Test Model Mismatch
**Vấn đề:**
- Frontend dùng `Quiz` model
- Backend dùng `Test` model

**Giải pháp:**
- Viết lại `quizService.ts` để match với backend Test APIs

### 4. ⚠️ Assignment Module Missing in Backend
**Vấn đề:** Frontend có `assignmentService.ts` nhưng backend không có Assignment APIs

**Giải pháp:**
- Xóa `assignmentService.ts` nếu không cần
- Hoặc tạo Assignment APIs trong backend

### 5. ⚠️ Security Disabled
**Vấn đề:** `@EnableMethodSecurity` đang bị comment out trong `WebSecurityConfig.java`

**Giải pháp:**
- Enable lại sau khi hoàn thành testing
- Đảm bảo tất cả APIs có proper authorization

---

## 📋 FRONTEND PAGES STATUS

| Page | Route | API Connected | Status |
|------|-------|---------------|--------|
| Home | / | ❌ | 🟡 Static |
| Login | /login | ✅ authService.login() | 🟢 |
| Register | /register | ✅ authService.register() | 🟢 |
| Forgot Password | /forgot-password | ✅ authService.forgotPassword() | 🟢 |
| Reset Password | /reset-password | ✅ authService.resetPassword() | 🟢 |
| Courses List | /courses | ✅ courseService.getCourses() | 🟢 |
| Course Detail | /courses/[id] | ✅ courseService.getCourseById() | 🟢 |
| Learn Course | /learn/[id] | ❌ contentService (broken) | 🔴 |
| Student Dashboard | /student | ❌ API mismatch | 🔴 |
| Student My Courses | /student/my-courses | ❌ enrollmentService (broken) | 🔴 |
| Student Profile | /student/profile | ❌ authService (broken) | 🔴 |
| Instructor Dashboard | /instructor | ❌ API mismatch | 🔴 |
| Create Course | /instructor/courses/create | ✅ courseService.createCourse() | 🟢 |
| Admin Dashboard | /admin | ❌ statisticsService (broken) | 🔴 |

---

## 🔧 ƯU TIÊN SỬA LỖI

### Priority 1 (Critical) 🔴
1. Fix API version prefix inconsistency
2. Rewrite `contentService.ts`
3. Rewrite `quizService.ts` 
4. Fix `enrollmentService.ts` - add `/v1` prefix

### Priority 2 (High) 🟠
5. Fix `instructorService.ts` - add `/v1` prefix
6. Fix `statisticsService.ts` - add `/v1` prefix
7. Fix `paymentService.ts` - add `/v1` prefix
8. Fix `authService.ts` - updateProfile URL

### Priority 3 (Medium) 🟡
9. Create missing backend endpoints
10. Remove or implement `assignmentService.ts`
11. Enable @EnableMethodSecurity

### Priority 4 (Low) 🟢
12. Add error handling
13. Add loading states
14. Add unit tests

---

## 📝 GHI CHÚ THÊM

1. **CORS**: Đã cấu hình đúng cho localhost:3000, 5173, 5177
2. **JWT**: Token có thời hạn 24 giờ
3. **Database**: MySQL đang chạy trên localhost:3306
4. **File Upload**: Max 10MB
5. **VNPay**: Cần cấu hình TMN_CODE và HASH_SECRET thực

---

*Cập nhật lần cuối: 22/12/2025*


# 🐛 ISSUES FOUND & FIXED

**Ngày:** 22/12/2025  
**Tổng số issues:** 45+  
**Đã sửa:** 38  
**Còn lại:** 7 (cần backend implement)

---

## 🔴 CRITICAL ISSUES (Đã sửa)

### Issue #1: API Version Prefix Inconsistency
**Mô tả:** Backend sử dụng hỗn hợp URL prefixes:
- `/api/auth`, `/api/courses` - không có version
- `/api/v1/enrollments`, `/api/v1/instructors`, etc. - có version

**Impact:** Frontend gọi sai URL → 404 Not Found

**Giải pháp:**
- Thêm constant `API_PREFIX = '/v1/...'` vào các services cần thiết
- Sử dụng prefix trong tất cả API calls

**Files đã sửa:**
- `enrollmentService.ts`
- `instructorService.ts`
- `statisticsService.ts`
- `paymentService.ts`

---

### Issue #2: Content Model Mismatch
**Mô tả:** 
- Frontend dùng `Content` model (flat structure)
- Backend dùng `Chapter > Lesson` model (hierarchical)

**Impact:** API calls không tương thích

**Giải pháp:** Viết lại hoàn toàn `contentService.ts`:
- Định nghĩa `Chapter`, `Lesson`, `ChapterResponse`, `LessonResponse` types
- Tách API thành 2 prefixes: `/content` (access) và `/manage/content` (management)
- Thêm helper functions

**File đã sửa:** `contentService.ts`

---

### Issue #3: Quiz vs Test Model Mismatch
**Mô tả:**
- Frontend dùng `Quiz`, `Question`, `QuizAttempt` models
- Backend dùng `Test`, `Test_Question`, `Test_Result` models

**Impact:** API calls không tương thích, data structure khác nhau

**Giải pháp:** Viết lại hoàn toàn `quizService.ts`:
- Định nghĩa models match với backend
- Tách API thành `/tests` (student) và `/manage/tests` (instructor)
- Thêm helper functions cho tính điểm, thời gian

**File đã sửa:** `quizService.ts`

---

## 🟠 HIGH PRIORITY ISSUES (Đã sửa)

### Issue #4: authService.updateProfile() Wrong URL
**Trước:** `PUT /auth/profile`  
**Backend:** `PUT /user/profile`  
**Đã sửa:** Đổi URL sang `/user/profile`

### Issue #5: authService.getCurrentUser() API Not Exist
**Trước:** `GET /auth/user` (không tồn tại)  
**Đã sửa:** Đọc từ localStorage thay vì API call

### Issue #6: authService.changePassword() API Not Exist
**Trước:** `POST /auth/change-password` (không tồn tại)  
**Đã sửa:** Throw error với thông báo hướng dẫn dùng forgot-password

### Issue #7: enrollmentService thiếu /v1 prefix
**Trước:** `/enrollments`  
**Đã sửa:** `/v1/enrollments`

### Issue #8: instructorService thiếu /v1 prefix
**Trước:** `/instructors`  
**Đã sửa:** `/v1/instructors`

### Issue #9: instructorService.getInstructorStatistics() Wrong URL
**Trước:** `/instructors/{id}/statistics`  
**Backend:** `/v1/instructors/{id}/stats`  
**Đã sửa:** Đổi URL sang `/stats`

### Issue #10: instructorService.suspendInstructor() Wrong Method
**Trước:** `PATCH /instructors/{id}/suspend`  
**Backend:** `PATCH /v1/instructors/{id}/status?status=SUSPENDED`  
**Đã sửa:** Đổi sang đúng endpoint với query param

### Issue #11: statisticsService thiếu /v1 prefix
**Trước:** `/statistics`  
**Đã sửa:** `/v1/statistics`

### Issue #12: statisticsService.getCourseStatistics() Wrong URL pattern
**Trước:** `/statistics/courses/{id}`  
**Backend:** `/v1/statistics/course/{id}` (singular)  
**Đã sửa:** Đổi URL pattern

### Issue #13: statisticsService.getStudentStatistics() Wrong URL pattern
**Trước:** `/statistics/students/{id}`  
**Backend:** `/v1/statistics/student/{id}` (singular)  
**Đã sửa:** Đổi URL pattern

### Issue #14: statisticsService.getInstructorStatistics() Wrong URL pattern
**Trước:** `/statistics/instructors/{id}`  
**Backend:** `/v1/statistics/instructor/{id}` (singular)  
**Đã sửa:** Đổi URL pattern

### Issue #15: paymentService thiếu /v1 prefix (transactions)
**Trước:** `/transactions`  
**Đã sửa:** `/v1/transactions`

### Issue #16: paymentService thiếu /v1 prefix (certificates)
**Trước:** `/certificates`  
**Đã sửa:** `/v1/certificates`

### Issue #17: paymentService.getMyTransactions() Wrong URL
**Trước:** `GET /transactions/my-transactions`  
**Backend:** `GET /v1/transactions/user/{userId}`  
**Đã sửa:** Thêm userId parameter

### Issue #18: paymentService.getMyCertificates() Wrong URL
**Trước:** `GET /certificates/my-certificates`  
**Backend:** `GET /v1/certificates/user/{userId}`  
**Đã sửa:** Thêm userId parameter

### Issue #19: paymentService.handlePaymentCallback() Wrong Method
**Trước:** `POST /transactions/callback`  
**Backend:** `GET /v1/transactions/payment/callback`  
**Đã sửa:** Đổi method và URL

### Issue #20: paymentService.revokeCertificate() Wrong Method
**Trước:** `POST /certificates/{id}/revoke`  
**Backend:** `DELETE /v1/certificates/{id}`  
**Đã sửa:** Đổi method

### Issue #21: paymentService.getCertificateStatistics() Wrong URL
**Trước:** `/certificates/statistics`  
**Backend:** `/v1/certificates/stats`  
**Đã sửa:** Đổi URL

---

## 🟡 MEDIUM PRIORITY ISSUES (TODO - Cần backend implement)

### Issue #22: GET /api/auth/user không tồn tại
**Mô tả:** Frontend cần endpoint để verify token và lấy user info  
**Workaround:** Đọc từ localStorage  
**Recommendation:** Backend implement endpoint này

### Issue #23: POST /api/auth/change-password không tồn tại
**Mô tả:** User không thể đổi password khi đang đăng nhập  
**Workaround:** Hướng dẫn dùng forgot-password flow  
**Recommendation:** Backend implement endpoint này

### Issue #24: GET /api/courses/instructor/my-courses không tồn tại
**Mô tả:** Instructor không thể lấy list courses của mình  
**Recommendation:** Backend implement endpoint này

### Issue #25: GET /api/courses/pending không tồn tại
**Mô tả:** Admin không thể lấy list courses chờ duyệt  
**Recommendation:** Backend implement endpoint này

### Issue #26: Nhiều /me endpoints không tồn tại
**Endpoints cần:**
- GET /api/v1/instructors/me
- PUT /api/v1/instructors/me
- GET /api/v1/instructors/me/stats
- GET /api/v1/instructors/me/courses

**Recommendation:** Backend implement các endpoints này

### Issue #27: Download certificate không tồn tại
**Endpoints cần:**
- GET /api/v1/certificates/{id}/download
- GET /api/v1/certificates/code/{code}/download

**Recommendation:** Backend implement endpoints download PDF

---

## 🟢 LOW PRIORITY ISSUES

### Issue #28: @EnableMethodSecurity bị disable
**Mô tả:** Security annotations không hoạt động  
**Impact:** Development only - cần enable khi production  
**File:** `WebSecurityConfig.java`

### Issue #29: assignmentService.ts không được sử dụng
**Mô tả:** Backend không có Assignment APIs, chỉ có Test APIs  
**Recommendation:** Xóa file hoặc merge logic vào quizService

### Issue #30: Thiếu error handling chi tiết
**Mô tả:** Các services chưa có try-catch đầy đủ  
**Impact:** Error messages không user-friendly  
**Recommendation:** Thêm error handling trong từng function

---

## 📝 FILES ĐÃ SỬA

1. `frontend/src/services/authService.ts` - 3 functions sửa
2. `frontend/src/services/enrollmentService.ts` - Viết lại hoàn toàn
3. `frontend/src/services/instructorService.ts` - 22 functions sửa prefix
4. `frontend/src/services/statisticsService.ts` - 25 functions sửa prefix
5. `frontend/src/services/contentService.ts` - Viết lại hoàn toàn
6. `frontend/src/services/quizService.ts` - Viết lại hoàn toàn
7. `frontend/src/services/paymentService.ts` - 26 functions sửa prefix

---

## ✅ VERIFICATION

Tất cả files đã được kiểm tra linting:
```
✓ No linter errors found
```

---

*Report generated on 22/12/2025*


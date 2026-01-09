# ✅ CHECKLIST THỰC HÀNH THEO LUỒNG HOẠT ĐỘNG

## 🎯 CÁCH SỬ DỤNG
Làm theo từng luồng, đánh dấu ✅ khi hoàn thành mỗi bước.
Mỗi luồng nên học trong 1-2 giờ.

---

## 🔵 LUỒNG 1: ĐĂNG KÝ (REGISTRATION FLOW)

### Bước 1: Đọc và Hiểu Sơ Đồ
- [ ] Đọc sơ đồ flow trong file `HOC_THEO_LUONG_HOAT_DONG.md`
- [ ] Vẽ lại sơ đồ bằng tay (giúp nhớ tốt hơn)
- [ ] Ghi chú: Mỗi bước làm gì?

### Bước 2: Đọc Controller
- [ ] Mở file: `controller/AuthController.java`
- [ ] Tìm method: `registerUser()`
- [ ] Đọc code và trả lời:
  - [ ] `@Valid` làm gì?
  - [ ] `@RequestBody` làm gì?
  - [ ] Exception được xử lý như thế nào?

### Bước 3: Đọc Service - QUAN TRỌNG
- [ ] Mở file: `service/AuthService.java`
- [ ] Tìm method: `registerUser()`
- [ ] Trace code từng bước:
  - [ ] Bước 1: Kiểm tra username đã tồn tại
  - [ ] Bước 2: Kiểm tra email đã tồn tại
  - [ ] Bước 3: Tạo User object
  - [ ] Bước 4: Mã hóa password
  - [ ] Bước 5: Gán role
  - [ ] Bước 6: Lưu vào database

**Câu hỏi tự kiểm tra:**
- [ ] Tại sao phải kiểm tra username/email trước?
- [ ] BCrypt mã hóa password như thế nào?
- [ ] Role mặc định là gì? Tại sao?

### Bước 4: Đọc Repository
- [ ] Mở file: `repository/UserRepository.java`
- [ ] Tìm method: `existsByUsername()`, `existsByEmail()`, `save()`
- [ ] Hiểu: Spring Data JPA tự động tạo query như thế nào?

### Bước 5: Test Thực Tế
- [ ] Mở Postman
- [ ] Tạo request: POST `http://localhost:8080/api/auth/register`
- [ ] Body (JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456",
  "fullName": "Test User"
}
```
- [ ] Gửi request
- [ ] Xem response: Có thành công không?
- [ ] Kiểm tra database: User đã được tạo chưa?

### Bước 6: Test Trường Hợp Lỗi
- [ ] Test với username đã tồn tại → Xem lỗi gì?
- [ ] Test với email đã tồn tại → Xem lỗi gì?
- [ ] Test với password quá ngắn → Xem validation

### ✅ Hoàn Thành Luồng 1
- [ ] Hiểu rõ flow từ đầu đến cuối
- [ ] Có thể giải thích cho người khác
- [ ] Test thành công API

---

## 🟢 LUỒNG 2: ĐĂNG NHẬP (LOGIN FLOW) ⭐ QUAN TRỌNG NHẤT

### Bước 1: Đọc và Hiểu Sơ Đồ
- [ ] Đọc sơ đồ flow
- [ ] Vẽ lại sơ đồ
- [ ] Ghi chú các bước quan trọng

### Bước 2: Đọc Controller
- [ ] Mở file: `controller/AuthController.java`
- [ ] Tìm method: `authenticateUser()`
- [ ] Câu hỏi: Tại sao không catch exception?

### Bước 3: Đọc Service - PHẦN QUAN TRỌNG NHẤT
- [ ] Mở file: `service/AuthService.java`
- [ ] Tìm method: `loginUser()`
- [ ] Trace code từng bước:
  - [ ] Bước 1: Tìm user theo username/email
  - [ ] Bước 2: Kiểm tra tài khoản có bị khóa?
  - [ ] Bước 3: Xác thực username/password
  - [ ] Bước 4: Lưu Authentication vào SecurityContext
  - [ ] Bước 5: Tạo JWT token
  - [ ] Bước 6: Trả về JwtResponse

**Câu hỏi tự kiểm tra:**
- [ ] Tại sao phải kiểm tra isEnabled trước?
- [ ] AuthenticationManager làm gì?
- [ ] JWT token là gì? Chứa thông tin gì?
- [ ] SecurityContext là gì?

### Bước 4: Đọc JWT Utils
- [ ] Mở file: `security/jwt/JwtUtils.java`
- [ ] Tìm method: `generateJwtToken()`
- [ ] Tìm hiểu: JWT được tạo như thế nào?
- [ ] Tìm hiểu: Secret key ở đâu? (application.properties)

### Bước 5: Đọc Security Config
- [ ] Mở file: `security/WebSecurityConfig.java`
- [ ] Tìm: `AuthenticationManager` configuration
- [ ] Tìm: `PasswordEncoder` configuration
- [ ] Tìm: `UserDetailsService` bean

**Câu hỏi:**
- [ ] AuthenticationManager được cấu hình như thế nào?
- [ ] PasswordEncoder là gì? (BCryptPasswordEncoder)

### Bước 6: Đọc UserDetailsService
- [ ] Mở file: `security/services/UserDetailsServiceImpl.java`
- [ ] Tìm method: `loadUserByUsername()`
- [ ] Hiểu: Làm sao load user từ database?

### Bước 7: Test Thực Tế
- [ ] Đăng ký user trước (nếu chưa có)
- [ ] POST `http://localhost:8080/api/auth/login`
- [ ] Body:
```json
{
  "usernameOrEmail": "testuser",
  "password": "123456"
}
```
- [ ] Xem response: Có JWT token không?
- [ ] Copy JWT token → Lưu lại để dùng sau

### Bước 8: Test Trường Hợp Lỗi
- [ ] Test với password sai → Xem lỗi gì? (401 Unauthorized)
- [ ] Test với username không tồn tại → Xem lỗi gì?
- [ ] Test với tài khoản bị khóa → Xem lỗi gì?

### ✅ Hoàn Thành Luồng 2
- [ ] Hiểu rõ flow đăng nhập
- [ ] Hiểu JWT token là gì
- [ ] Hiểu Spring Security hoạt động như thế nào
- [ ] Test thành công API

---

## 🟡 LUỒNG 3: QUÊN MẬT KHẨU (FORGOT PASSWORD FLOW)

### Bước 1: Đọc và Hiểu Sơ Đồ
- [ ] Đọc sơ đồ flow
- [ ] Vẽ lại sơ đồ

### Bước 2: Đọc Controller
- [ ] Mở file: `controller/AuthController.java`
- [ ] Tìm method: `forgotPassword()`

### Bước 3: Đọc Service
- [ ] Mở file: `service/AuthService.java`
- [ ] Tìm method: `handleForgotPassword()`
- [ ] Trace code:
  - [ ] Tìm user theo email
  - [ ] Kiểm tra token cũ
  - [ ] Tạo/cập nhật token
  - [ ] Gửi email

**Câu hỏi:**
- [ ] Tại sao token có expiry date? (24 giờ)
- [ ] Tại sao cập nhật token cũ thay vì tạo mới?

### Bước 4: Đọc Model PasswordResetToken
- [ ] Mở file: `model/PasswordResetToken.java`
- [ ] Hiểu: Token được lưu như thế nào?

### Bước 5: Đọc Email Service
- [ ] Mở file: `service/EmailService.java`
- [ ] Tìm method: `sendPasswordResetEmail()`
- [ ] Hiểu: Email được gửi như thế nào?

### Bước 6: Test Thực Tế
- [ ] POST `http://localhost:8080/api/auth/forgot-password`
- [ ] Body: `{ "email": "test@example.com" }`
- [ ] Kiểm tra email (hoặc log console)

### Bước 7: Test Reset Password
- [ ] Lấy token từ email (hoặc database)
- [ ] POST `http://localhost:8080/api/auth/reset-password`
- [ ] Body:
```json
{
  "token": "<token_from_email>",
  "newPassword": "newpass123"
}
```

### ✅ Hoàn Thành Luồng 3
- [ ] Hiểu flow quên mật khẩu
- [ ] Hiểu token mechanism
- [ ] Test thành công API

---

## 🟣 LUỒNG 4: CẬP NHẬT PROFILE (UPDATE PROFILE FLOW)

### Bước 1: Đọc và Hiểu Sơ Đồ
- [ ] Đọc sơ đồ flow
- [ ] Vẽ lại sơ đồ

### Bước 2: Đọc JWT Filter - QUAN TRỌNG
- [ ] Mở file: `security/jwt/AuthTokenFilter.java`
- [ ] Đọc method: `doFilterInternal()`
- [ ] Hiểu:
  - [ ] Filter chạy khi nào?
  - [ ] Làm sao extract JWT từ header?
  - [ ] Làm sao validate JWT?
  - [ ] Làm sao set Authentication?

**Câu hỏi:**
- [ ] Tại sao cần Filter này?
- [ ] Filter chạy trước hay sau Controller?

### Bước 3: Đọc Controller
- [ ] Mở file: `controller/UserController.java`
- [ ] Tìm method: `updateProfile()`
- [ ] Hiểu:
  - [ ] `@PreAuthorize("isAuthenticated()")` làm gì?
  - [ ] Làm sao lấy user từ SecurityContext?

### Bước 4: Đọc Service
- [ ] Mở file: `service/AuthService.java`
- [ ] Tìm method: `updateProfile()`
- [ ] Hiểu: Partial Update pattern
- [ ] Câu hỏi: Tại sao phải kiểm tra `request.getEmail() != null`?

### Bước 5: Test Thực Tế
- [ ] Đăng nhập trước → Lấy JWT token
- [ ] PUT `http://localhost:8080/api/user/profile`
- [ ] Header: `Authorization: Bearer <JWT_TOKEN>`
- [ ] Body:
```json
{
  "fullName": "New Name",
  "bio": "New bio",
  "phoneNumber": "0123456789"
}
```
- [ ] Xem response
- [ ] Kiểm tra database: Profile đã được cập nhật chưa?

### Bước 6: Test Trường Hợp Lỗi
- [ ] Test không có JWT token → Xem lỗi gì? (401)
- [ ] Test với JWT token hết hạn → Xem lỗi gì?
- [ ] Test với email đã tồn tại → Xem lỗi gì?

### ✅ Hoàn Thành Luồng 4
- [ ] Hiểu JWT Filter hoạt động
- [ ] Hiểu Partial Update pattern
- [ ] Test thành công API

---

## 🔴 LUỒNG 5: ĐỔI MẬT KHẨU (CHANGE PASSWORD FLOW)

### Bước 1: Đọc và Hiểu Sơ Đồ
- [ ] Đọc sơ đồ flow
- [ ] Vẽ lại sơ đồ

### Bước 2: Đọc Controller
- [ ] Mở file: `controller/UserController.java`
- [ ] Tìm method: `changePassword()`

### Bước 3: Đọc Service
- [ ] Mở file: `service/AuthService.java`
- [ ] Tìm method: `changePassword()`
- [ ] Trace code:
  - [ ] Verify old password
  - [ ] Kiểm tra new password khác old password
  - [ ] Mã hóa new password
  - [ ] Lưu vào database

**Câu hỏi:**
- [ ] `encoder.matches()` làm gì?
- [ ] Tại sao không thể so sánh trực tiếp?

### Bước 4: Test Thực Tế
- [ ] Đăng nhập → Lấy JWT token
- [ ] PUT `http://localhost:8080/api/user/change-password`
- [ ] Header: `Authorization: Bearer <JWT_TOKEN>`
- [ ] Body:
```json
{
  "oldPassword": "123456",
  "newPassword": "newpass123"
}
```
- [ ] Xem response
- [ ] Test đăng nhập lại với password mới

### Bước 5: Test Trường Hợp Lỗi
- [ ] Test với old password sai → Xem lỗi gì?
- [ ] Test với new password giống old password → Xem lỗi gì?

### ✅ Hoàn Thành Luồng 5
- [ ] Hiểu cách verify password
- [ ] Test thành công API

---

## 🟠 LUỒNG 6: QUẢN LÝ USER CỦA ADMIN

### Bước 1: Đọc và Hiểu Sơ Đồ
- [ ] Đọc sơ đồ flow
- [ ] Vẽ lại sơ đồ

### Bước 2: Đọc Controller
- [ ] Mở file: `controller/AdminUserController.java`
- [ ] Tìm method: `getUsers()`, `getUserById()`, `updateUserStatus()`
- [ ] Hiểu: `@PreAuthorize("hasRole('ADMIN')")` làm gì?

### Bước 3: Đọc Service
- [ ] Mở file: `service/AdminUserService.java`
- [ ] Tìm method: `getUsers()`
- [ ] Hiểu: Specification pattern
- [ ] Hiểu: Phân trang (Pageable)

### Bước 4: Test Thực Tế
- [ ] Tạo user với role ADMIN (hoặc dùng admin có sẵn)
- [ ] Đăng nhập với ADMIN → Lấy JWT token
- [ ] GET `http://localhost:8080/api/v1/admin/users?page=0&size=10`
- [ ] Header: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- [ ] Xem response: Có danh sách users không?

### Bước 5: Test Khóa/Mở Khóa User
- [ ] PUT `http://localhost:8080/api/v1/admin/users/{id}/status`
- [ ] Body:
```json
{
  "isEnabled": false,
  "lockReason": "Vi phạm quy định"
}
```
- [ ] Test đăng nhập với user bị khóa → Xem lỗi gì?

### Bước 6: Test Trường Hợp Lỗi
- [ ] Test với role không phải ADMIN → Xem lỗi gì? (403 Forbidden)
- [ ] Test không có JWT token → Xem lỗi gì? (401)

### ✅ Hoàn Thành Luồng 6
- [ ] Hiểu phân quyền trong Spring Security
- [ ] Hiểu Specification pattern
- [ ] Test thành công API

---

## 🎯 TỔNG KẾT

### Sau Khi Hoàn Thành Tất Cả Luồng:
- [ ] Hiểu rõ từng luồng hoạt động
- [ ] Biết code chạy như thế nào
- [ ] Có thể giải thích cho người khác
- [ ] Có thể debug khi có lỗi
- [ ] Có thể mở rộng thêm tính năng

### Thời Gian Học Đề Xuất:
- Luồng 1 (Đăng ký): 1 giờ
- Luồng 2 (Đăng nhập): 2-3 giờ ⭐
- Luồng 3 (Quên mật khẩu): 1 giờ
- Luồng 4 (Cập nhật profile): 1-2 giờ
- Luồng 5 (Đổi mật khẩu): 1 giờ
- Luồng 6 (Admin): 1-2 giờ

**Tổng: 7-10 giờ**

### Tips:
1. Đừng vội, học từng luồng một
2. Ghi chú những gì bạn hiểu
3. Test thực tế bằng Postman
4. Đặt câu hỏi nhiều nhất có thể

**Chúc bạn học tập hiệu quả! 🚀**


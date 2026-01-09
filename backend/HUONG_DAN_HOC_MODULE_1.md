# 📚 HƯỚNG DẪN HỌC MODULE 1: XÁC THỰC & QUẢN LÝ NGƯỜI DÙNG

## 🎯 MỤC TIÊU
Hiểu rõ cách hệ thống xử lý đăng nhập, đăng ký, quản lý người dùng và bảo mật.

---

## 📖 BƯỚC 1: HIỂU CẤU TRÚC DỮ LIỆU (MODEL)

### Bắt đầu với:
1. **`model/User.java`** - Đọc kỹ từng field:
   - `id`, `username`, `email`, `password` - Thông tin cơ bản
   - `roles` - Quan hệ Many-to-Many với Role
   - `isEnabled`, `lockReason` - Quản lý trạng thái tài khoản
   - `createdAt`, `avatarUrl`, `bio` - Thông tin profile

2. **`model/Role.java`** - Hiểu vai trò trong hệ thống
3. **`model/ERole.java`** - Enum định nghĩa các role (ADMIN, LECTURER, STUDENT)
4. **`model/PasswordResetToken.java`** - Token reset mật khẩu

**Cách học:**
- Đọc từng field và tự hỏi: "Field này dùng để làm gì?"
- Vẽ sơ đồ quan hệ giữa User và Role
- Ghi chú: User có thể có nhiều Role không?

---

## 📖 BƯỚC 2: HIỂU CÁCH TRUY VẤN DATABASE (REPOSITORY)

### Đọc các file:
1. **`repository/UserRepository.java`**
   - Xem các method: `findByUsername()`, `findByEmail()`, `existsByEmail()`
   - Hiểu Spring Data JPA tự động tạo query từ tên method

2. **`repository/RoleRepository.java`**
3. **`repository/PasswordResetTokenRepository.java`**

**Cách học:**
- Tìm hiểu: Tên method như thế nào sẽ tạo query gì?
- Ví dụ: `findByEmail()` → `SELECT * FROM users WHERE email = ?`
- Thử tưởng tượng: Nếu muốn tìm user theo username HOẶC email, method sẽ tên gì?

---

## 📖 BƯỚC 3: HIỂU BUSINESS LOGIC (SERVICE) - QUAN TRỌNG NHẤT

### Đọc theo thứ tự này:

#### 3.1. **`service/AuthService.java`** - Bắt đầu với method đơn giản nhất:

**a) `getUserById()`** - Đơn giản nhất:
```java
public User getUserById(Long userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new UsernameNotFoundException("User not found!"));
}
```
- Hỏi: Tại sao dùng `orElseThrow()` thay vì `get()`?
- Học: Exception handling pattern

**b) `loginUser()`** - Logic đăng nhập:
1. Kiểm tra tài khoản có bị khóa không
2. Xác thực username/password với Spring Security
3. Tạo JWT token
4. Trả về thông tin user + token

**Cách học:**
- Vẽ flowchart: User gửi request → Kiểm tra gì? → Làm gì tiếp?
- Đặt câu hỏi: Tại sao phải kiểm tra `isEnabled` trước khi authenticate?
- Tìm hiểu: JWT token là gì? Tại sao dùng JWT?

**c) `registerUser()`** - Logic đăng ký:
1. Kiểm tra username/email đã tồn tại chưa
2. Mã hóa password bằng BCrypt
3. Gán role mặc định (STUDENT)
4. Lưu vào database

**Cách học:**
- Tại sao phải mã hóa password? BCrypt là gì?
- Tại sao không cho đăng ký role ADMIN?
- Thử trace: Nếu email đã tồn tại, chuyện gì xảy ra?

**d) `updateProfile()`** - Cập nhật profile:
- Học pattern: Partial Update (chỉ update field có giá trị)
- Tại sao phải kiểm tra `request.getEmail() != null`?

**e) `changePassword()`** - Đổi mật khẩu:
- Tại sao phải verify old password?
- Tại sao không cho đặt mật khẩu mới giống mật khẩu cũ?

**f) `handleForgotPassword()` và `handleResetPassword()`**:
- Flow: Quên mật khẩu → Tạo token → Gửi email → Reset mật khẩu
- Tại sao token có expiry date?

#### 3.2. **`service/AdminUserService.java`** - Quản lý user cho Admin:
- `getUsers()` - Tìm kiếm và phân trang
- `updateUserStatus()` - Khóa/mở khóa tài khoản

**Cách học:**
- Tìm hiểu: Specification pattern trong Spring Data JPA
- Tại sao Admin có thể khóa user?

---

## 📖 BƯỚC 4: HIỂU API ENDPOINTS (CONTROLLER)

### Đọc theo thứ tự:

#### 4.1. **`controller/AuthController.java`** - API công khai:

**a) `POST /api/auth/login`**:
- Nhận `LoginRequest` → Gọi `authService.loginUser()` → Trả `JwtResponse`
- Học: Request/Response pattern

**b) `POST /api/auth/register`**:
- Nhận `RegisterRequest` → Gọi `authService.registerUser()`
- Xử lý exception như thế nào?

**c) `POST /api/auth/forgot-password`** và `POST /api/auth/reset-password`:
- Flow hoàn chỉnh: Request → Service → Email → Response

**Cách học:**
- Vẽ sơ đồ: Frontend → Controller → Service → Repository → Database
- Đặt câu hỏi: Tại sao Controller chỉ gọi Service, không xử lý logic?

#### 4.2. **`controller/UserController.java`** - API cần đăng nhập:

**a) `GET /api/user/profile`**:
- `@PreAuthorize("isAuthenticated()")` - Bảo vệ endpoint
- Lấy user từ SecurityContext
- Tại sao phải lấy từ SecurityContext?

**b) `PUT /api/user/profile`**:
- Cập nhật profile của chính mình
- Exception handling: IllegalArgumentException vs RuntimeException

**c) `POST /api/user/avatar`**:
- Upload file
- Tại sao dùng `MultipartFile`?

**d) `PUT /api/user/change-password`**:
- Đổi mật khẩu của chính mình

#### 4.3. **`controller/AdminUserController.java`** - API chỉ Admin:

- `@PreAuthorize("hasRole('ADMIN')")` - Chỉ Admin mới được truy cập
- Tại sao cần phân quyền?

---

## 📖 BƯỚC 5: HIỂU BẢO MẬT (SECURITY)

### Đọc các file:

1. **`security/WebSecurityConfig.java`**:
   - Cấu hình Spring Security
   - CORS, JWT filter, Password encoder
   - Tại sao cần cấu hình này?

2. **`security/jwt/JwtUtils.java`**:
   - Tạo và validate JWT token
   - Học: JWT gồm những gì? (Header, Payload, Signature)

3. **`security/jwt/AuthTokenFilter.java`**:
   - Filter kiểm tra JWT trong mỗi request
   - Flow: Request → Filter → Controller

4. **`security/services/UserDetailsServiceImpl.java`**:
   - Load user từ database cho Spring Security
   - Tại sao cần implement `UserDetailsService`?

**Cách học:**
- Vẽ sơ đồ: Request → JWT Filter → Security → Controller
- Tìm hiểu: Authentication vs Authorization

---

## 🎯 PHƯƠNG PHÁP HỌC HIỆU QUẢ

### 1. **Đọc Code → Đặt Câu Hỏi → Tìm Câu Trả Lời**
- Đừng chỉ đọc, hãy hỏi: "Tại sao code này làm như vậy?"
- Ví dụ: Tại sao dùng `@Transactional`? → Tìm hiểu Transaction

### 2. **Vẽ Sơ Đồ Flow**
- Vẽ flowchart cho mỗi chức năng
- Ví dụ: Flow đăng nhập từ đầu đến cuối

### 3. **Trace Code Thủ Công**
- Chọn 1 request cụ thể (ví dụ: đăng nhập)
- Trace từ Controller → Service → Repository → Database
- Ghi chú: Mỗi bước làm gì?

### 4. **Thử Sửa Code Nhỏ**
- Thử comment 1 dòng code → Xem lỗi gì?
- Thử thêm validation → Xem có hoạt động không?
- **Lưu ý**: Backup code trước khi sửa!

### 5. **Đọc Documentation**
- Spring Security: https://spring.io/projects/spring-security
- JWT: https://jwt.io/introduction
- Spring Data JPA: https://spring.io/projects/spring-data-jpa

### 6. **Viết Code Tương Tự**
- Thử viết 1 API đơn giản tương tự
- Ví dụ: API lấy danh sách user (không dùng code có sẵn)

---

## 📝 CHECKLIST HỌC TẬP

### Sau khi học xong, bạn phải trả lời được:

- [ ] User entity có những field gì? Mỗi field dùng để làm gì?
- [ ] Quan hệ giữa User và Role là gì? (1-n, n-1, n-n?)
- [ ] Flow đăng nhập hoạt động như thế nào?
- [ ] JWT token là gì? Tại sao dùng JWT?
- [ ] BCrypt là gì? Tại sao phải mã hóa password?
- [ ] `@PreAuthorize` làm gì? Khi nào dùng?
- [ ] `@Transactional` làm gì? Khi nào cần?
- [ ] Exception được xử lý ở đâu? (Controller hay Service?)
- [ ] Spring Security hoạt động như thế nào?
- [ ] Flow quên mật khẩu hoạt động ra sao?

---

## 🚀 BƯỚC TIẾP THEO

Sau khi hiểu Module 1:
1. Thử chạy code và test các API bằng Postman
2. Đọc code Module 2 (Quản lý Khóa học)
3. So sánh pattern giữa các module

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Đừng cố nhớ code**, hãy hiểu **logic** và **pattern**
2. **Đặt câu hỏi** nhiều nhất có thể
3. **Thực hành** bằng cách trace code và test API
4. **Kiên nhẫn** - Học từng phần một, đừng vội

**Chúc bạn học tập hiệu quả! 🎓**


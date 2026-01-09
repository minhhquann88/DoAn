# 🔄 HỌC THEO LUỒNG HOẠT ĐỘNG - MODULE 1

## 🎯 PHƯƠNG PHÁP HỌC
Học theo từng **luồng hoạt động** (workflow) từ đầu đến cuối, thay vì học từng file riêng lẻ.
Mỗi luồng sẽ đi qua: **Frontend → Controller → Service → Repository → Database → Response**

---

## 📋 DANH SÁCH CÁC LUỒNG HOẠT ĐỘNG

1. **Luồng Đăng Ký** (Registration Flow)
2. **Luồng Đăng Nhập** (Login Flow) ⭐ QUAN TRỌNG NHẤT
3. **Luồng Quên Mật Khẩu** (Forgot Password Flow)
4. **Luồng Cập Nhật Profile** (Update Profile Flow)
5. **Luồng Đổi Mật Khẩu** (Change Password Flow)
6. **Luồng Quản Lý User của Admin** (Admin User Management Flow)

---

## 🔵 LUỒNG 1: ĐĂNG KÝ (REGISTRATION FLOW)

### 📊 Sơ Đồ Luồng
```
Frontend (Form đăng ký)
  ↓ POST /api/auth/register
  { username, email, password, fullName }
  ↓
AuthController.registerUser()
  ↓
AuthService.registerUser()
  ↓ Kiểm tra username đã tồn tại?
  ↓ Kiểm tra email đã tồn tại?
  ↓ Mã hóa password (BCrypt)
  ↓ Gán role mặc định (STUDENT)
  ↓
UserRepository.save()
  ↓
Database (Lưu User mới)
  ↓
Response: "User registered successfully!"
```

### 📝 CÁCH HỌC

#### Bước 1: Đọc Controller
**File:** `controller/AuthController.java`
**Method:** `registerUser()`

```java
@PostMapping("/register")
public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
    try {
        authService.registerUser(registerRequest);
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
    }
}
```

**Câu hỏi:**
- `@Valid` làm gì? → Validate dữ liệu đầu vào
- `@RequestBody` làm gì? → Convert JSON → Java Object
- Tại sao catch `RuntimeException`? → Xử lý lỗi business logic

#### Bước 2: Đọc Service
**File:** `service/AuthService.java`
**Method:** `registerUser()`

**Trace code từng bước:**

1. **Kiểm tra username đã tồn tại:**
```java
if (userRepository.existsByUsername(registerRequest.getUsername())) {
    throw new RuntimeException("Error: Username is already taken!");
}
```
- `existsByUsername()` → Query: `SELECT COUNT(*) FROM users WHERE username = ?`
- Nếu > 0 → Username đã tồn tại → Throw exception

2. **Kiểm tra email đã tồn tại:**
```java
if (userRepository.existsByEmail(registerRequest.getEmail())) {
    throw new RuntimeException("Error: Email is already in use!");
}
```

3. **Tạo User mới:**
```java
User user = new User();
user.setUsername(registerRequest.getUsername());
user.setEmail(registerRequest.getEmail());
user.setPassword(encoder.encode(registerRequest.getPassword())); // ⚠️ Mã hóa password
user.setFullName(registerRequest.getFullName());
user.setCreatedAt(LocalDateTime.now());
user.setIsEnabled(true);
```
- **Tại sao phải mã hóa password?** → Bảo mật, không lưu plain text
- **BCrypt là gì?** → Thuật toán mã hóa một chiều, không thể giải mã

4. **Gán Role:**
```java
Set<String> strRoles = registerRequest.getRoles();
Set<Role> roles = new HashSet<>();

if (strRoles == null || strRoles.isEmpty()) {
    // Mặc định: STUDENT
    Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
        .orElseThrow(() -> new RuntimeException("Error: Role 'STUDENT' is not found."));
    roles.add(userRole);
}
```
- **Tại sao mặc định là STUDENT?** → Người dùng thường là học viên

5. **Lưu vào Database:**
```java
return userRepository.save(user);
```
- `save()` → INSERT INTO users ...

#### Bước 3: Đọc Repository
**File:** `repository/UserRepository.java`

**Các method được gọi:**
- `existsByUsername()` → Kiểm tra username
- `existsByEmail()` → Kiểm tra email
- `save()` → Lưu user mới

**Tìm hiểu:**
- Spring Data JPA tự động tạo query từ tên method
- `existsBy...` → `SELECT COUNT(*) > 0`

#### Bước 4: Test Thực Tế
1. Mở Postman
2. POST `http://localhost:8080/api/auth/register`
3. Body (JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456",
  "fullName": "Test User"
}
```
4. Xem response
5. Kiểm tra database: User đã được tạo chưa?

### ✅ Checklist
- [ ] Hiểu flow từ Frontend → Database
- [ ] Biết tại sao phải kiểm tra username/email
- [ ] Hiểu BCrypt mã hóa password như thế nào
- [ ] Test thành công API đăng ký

---

## 🟢 LUỒNG 2: ĐĂNG NHẬP (LOGIN FLOW) ⭐ QUAN TRỌNG NHẤT

### 📊 Sơ Đồ Luồng
```
Frontend (Form đăng nhập)
  ↓ POST /api/auth/login
  { usernameOrEmail, password }
  ↓
AuthController.authenticateUser()
  ↓
AuthService.loginUser()
  ↓
UserRepository.findByUsernameOrEmail()
  ↓ Kiểm tra tài khoản có bị khóa? (isEnabled)
  ↓ Có → Throw DisabledException
  ↓ Không
AuthenticationManager.authenticate()
  ↓ Xác thực username/password
  ↓ Đúng → Tạo Authentication object
  ↓ Sai → Throw BadCredentialsException
  ↓
SecurityContextHolder.setAuthentication()
  ↓
JwtUtils.generateJwtToken()
  ↓ Tạo JWT token
  ↓
Trả về JwtResponse (token + user info)
```

### 📝 CÁCH HỌC

#### Bước 1: Đọc Controller
**File:** `controller/AuthController.java`
**Method:** `authenticateUser()`

```java
@PostMapping("/login")
public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    JwtResponse jwtResponse = authService.loginUser(loginRequest);
    return ResponseEntity.ok(jwtResponse);
}
```

**Câu hỏi:**
- Tại sao không catch exception ở đây? → Để GlobalExceptionHandler xử lý (trả 401)

#### Bước 2: Đọc Service - PHẦN QUAN TRỌNG
**File:** `service/AuthService.java`
**Method:** `loginUser()`

**Trace code từng bước:**

1. **Kiểm tra tài khoản có bị khóa:**
```java
Optional<User> userOptional = userRepository.findByUsernameOrEmail(
    loginRequest.getUsernameOrEmail(), 
    loginRequest.getUsernameOrEmail()
);

if (userOptional.isPresent()) {
    User user = userOptional.get();
    if (user.getIsEnabled() != null && !user.getIsEnabled()) {
        String lockMessage = user.getLockReason() != null && !user.getLockReason().trim().isEmpty()
            ? user.getLockReason()
            : "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.";
        throw new DisabledException(lockMessage);
    }
}
```
- **Tại sao kiểm tra trước khi authenticate?** → Tránh lãng phí tài nguyên
- **DisabledException là gì?** → Exception của Spring Security

2. **Xác thực username/password:**
```java
Authentication authentication = authenticationManager.authenticate(
    new UsernamePasswordAuthenticationToken(
        loginRequest.getUsernameOrEmail(),
        loginRequest.getPassword()
    )
);
```
- **AuthenticationManager làm gì?** → Xác thực credentials
- **UsernamePasswordAuthenticationToken là gì?** → Wrapper cho username/password
- **Nếu sai password?** → Throw `BadCredentialsException`

3. **Lưu Authentication vào SecurityContext:**
```java
SecurityContextHolder.getContext().setAuthentication(authentication);
```
- **Tại sao cần?** → Để các request sau biết user đã đăng nhập
- **SecurityContext là gì?** → Context chứa thông tin authentication

4. **Tạo JWT Token:**
```java
String jwt = jwtUtils.generateJwtToken(authentication);
```
- **JWT token là gì?** → JSON Web Token, chứa thông tin user
- **JWT gồm 3 phần:** Header.Payload.Signature
- **Payload chứa gì?** → username, roles, expiry time

5. **Trả về Response:**
```java
UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
List<String> roles = userDetails.getAuthorities().stream()
    .map(item -> item.getAuthority())
    .collect(Collectors.toList());

return new JwtResponse(jwt,
    userDetails.getId(),
    userDetails.getUsername(),
    userDetails.getEmail(),
    roles);
```

#### Bước 3: Đọc JWT Utils
**File:** `security/jwt/JwtUtils.java`
**Method:** `generateJwtToken()`

**Tìm hiểu:**
- JWT được tạo như thế nào?
- Secret key ở đâu?
- Token có thời hạn bao lâu?

#### Bước 4: Đọc Security Config
**File:** `security/WebSecurityConfig.java`

**Tìm hiểu:**
- `AuthenticationManager` được cấu hình như thế nào?
- `PasswordEncoder` là gì?
- `UserDetailsService` làm gì?

#### Bước 5: Test Thực Tế
1. Đăng ký user trước (nếu chưa có)
2. POST `http://localhost:8080/api/auth/login`
3. Body:
```json
{
  "usernameOrEmail": "testuser",
  "password": "123456"
}
```
4. Xem response: Có JWT token không?
5. Copy JWT token → Dùng cho các request sau

### ✅ Checklist
- [ ] Hiểu flow đăng nhập từ đầu đến cuối
- [ ] Biết tại sao phải kiểm tra isEnabled
- [ ] Hiểu JWT token là gì và cách tạo
- [ ] Hiểu AuthenticationManager hoạt động như thế nào
- [ ] Test thành công API đăng nhập

---

## 🟡 LUỒNG 3: QUÊN MẬT KHẨU (FORGOT PASSWORD FLOW)

### 📊 Sơ Đồ Luồng
```
Frontend (Form quên mật khẩu)
  ↓ POST /api/auth/forgot-password
  { email }
  ↓
AuthController.forgotPassword()
  ↓
AuthService.handleForgotPassword()
  ↓
UserRepository.findByEmail()
  ↓ Tìm user theo email
  ↓ Không tìm thấy → Throw exception
  ↓ Tìm thấy
PasswordResetTokenRepository.findByUser()
  ↓ Kiểm tra có token cũ không?
  ↓ Có → Cập nhật token cũ
  ↓ Không → Tạo token mới
  ↓
Tạo token (UUID)
  ↓ Set expiry (24 giờ)
  ↓
PasswordResetTokenRepository.save()
  ↓
EmailService.sendPasswordResetEmail()
  ↓ Gửi email chứa link reset
  ↓
Response: "Password reset link sent to your email!"
```

### 📝 CÁCH HỌC

#### Bước 1: Đọc Controller
**File:** `controller/AuthController.java`
**Method:** `forgotPassword()`

#### Bước 2: Đọc Service
**File:** `service/AuthService.java`
**Method:** `handleForgotPassword()`

**Câu hỏi:**
- Tại sao token có expiry date? → Bảo mật, tránh token vĩnh viễn
- Tại sao cập nhật token cũ thay vì tạo mới? → Tránh duplicate key

#### Bước 3: Đọc Email Service
**File:** `service/EmailService.java`
**Method:** `sendPasswordResetEmail()`

**Tìm hiểu:**
- Email được gửi như thế nào?
- Link reset password trỏ về đâu? → Frontend

#### Bước 4: Test Thực Tế
1. POST `http://localhost:8080/api/auth/forgot-password`
2. Body: `{ "email": "test@example.com" }`
3. Kiểm tra email (hoặc log)

### ✅ Checklist
- [ ] Hiểu flow quên mật khẩu
- [ ] Biết token được tạo và lưu như thế nào
- [ ] Hiểu tại sao token có expiry

---

## 🟣 LUỒNG 4: CẬP NHẬT PROFILE (UPDATE PROFILE FLOW)

### 📊 Sơ Đồ Luồng
```
Frontend (Form cập nhật profile)
  ↓ PUT /api/user/profile
  Header: Authorization: Bearer <JWT_TOKEN>
  Body: { fullName, email, bio, ... }
  ↓
AuthTokenFilter
  ↓ Kiểm tra JWT token
  ↓ Hợp lệ → Set Authentication
  ↓
UserController.updateProfile()
  ↓ @PreAuthorize("isAuthenticated()")
  ↓ Lấy user từ SecurityContext
  ↓
AuthService.updateProfile()
  ↓ Kiểm tra email đã tồn tại? (nếu đổi email)
  ↓ Cập nhật các field (Partial Update)
  ↓
UserRepository.save()
  ↓
Database (Update user)
  ↓
Response: "Cập nhật hồ sơ thành công"
```

### 📝 CÁCH HỌC

#### Bước 1: Đọc JWT Filter
**File:** `security/jwt/AuthTokenFilter.java`

**Tìm hiểu:**
- Filter chạy khi nào? → Trước mọi request
- Làm sao extract JWT từ header?
- Làm sao validate JWT?

#### Bước 2: Đọc Controller
**File:** `controller/UserController.java`
**Method:** `updateProfile()`

**Câu hỏi:**
- `@PreAuthorize("isAuthenticated()")` làm gì? → Chỉ cho phép user đã đăng nhập
- Tại sao lấy user từ `SecurityContextHolder`? → Đảm bảo user đã authenticate

#### Bước 3: Đọc Service
**File:** `service/AuthService.java`
**Method:** `updateProfile()`

**Tìm hiểu:**
- Pattern: Partial Update (chỉ update field có giá trị)
- Tại sao phải kiểm tra `request.getEmail() != null`?

#### Bước 4: Test Thực Tế
1. Đăng nhập trước → Lấy JWT token
2. PUT `http://localhost:8080/api/user/profile`
3. Header: `Authorization: Bearer <JWT_TOKEN>`
4. Body:
```json
{
  "fullName": "New Name",
  "bio": "New bio"
}
```

### ✅ Checklist
- [ ] Hiểu JWT Filter hoạt động như thế nào
- [ ] Hiểu Partial Update pattern
- [ ] Test thành công API cập nhật profile

---

## 🔴 LUỒNG 5: ĐỔI MẬT KHẨU (CHANGE PASSWORD FLOW)

### 📊 Sơ Đồ Luồng
```
Frontend (Form đổi mật khẩu)
  ↓ PUT /api/user/change-password
  Header: Authorization: Bearer <JWT_TOKEN>
  Body: { oldPassword, newPassword }
  ↓
AuthTokenFilter (Kiểm tra JWT)
  ↓
UserController.changePassword()
  ↓
AuthService.changePassword()
  ↓ Verify old password (encoder.matches())
  ↓ Không đúng → Throw exception
  ↓ Đúng
  ↓ Kiểm tra new password khác old password?
  ↓ Giống → Throw exception
  ↓ Khác
  ↓ Mã hóa new password (BCrypt)
  ↓
UserRepository.save()
  ↓
Database (Update password)
  ↓
Response: "Đổi mật khẩu thành công"
```

### 📝 CÁCH HỌC

#### Bước 1: Đọc Service
**File:** `service/AuthService.java`
**Method:** `changePassword()`

**Câu hỏi:**
- `encoder.matches()` làm gì? → So sánh plain password với hashed password
- Tại sao không thể so sánh trực tiếp? → Password đã được mã hóa

#### Bước 2: Test Thực Tế
1. Đăng nhập → Lấy JWT token
2. PUT `http://localhost:8080/api/user/change-password`
3. Header: `Authorization: Bearer <JWT_TOKEN>`
4. Body:
```json
{
  "oldPassword": "123456",
  "newPassword": "newpass123"
}
```

### ✅ Checklist
- [ ] Hiểu cách verify old password
- [ ] Hiểu tại sao phải mã hóa new password
- [ ] Test thành công API đổi mật khẩu

---

## 🟠 LUỒNG 6: QUẢN LÝ USER CỦA ADMIN (ADMIN USER MANAGEMENT FLOW)

### 📊 Sơ Đồ Luồng
```
Frontend (Admin Dashboard)
  ↓ GET /api/v1/admin/users
  Header: Authorization: Bearer <JWT_TOKEN> (Admin)
  ↓
AuthTokenFilter (Kiểm tra JWT)
  ↓
AdminUserController.getUsers()
  ↓ @PreAuthorize("hasRole('ADMIN')")
  ↓ Kiểm tra role ADMIN
  ↓ Không phải Admin → 403 Forbidden
  ↓ Là Admin
  ↓
AdminUserService.getUsers()
  ↓ Tạo Specification (tìm kiếm)
  ↓
UserRepository.findAll(spec, pageable)
  ↓ Query database với filter
  ↓
Convert to DTO
  ↓
Response: Page<AdminUserDTO>
```

### 📝 CÁCH HỌC

#### Bước 1: Đọc Controller
**File:** `controller/AdminUserController.java`
**Method:** `getUsers()`

**Câu hỏi:**
- `@PreAuthorize("hasRole('ADMIN')")` làm gì? → Chỉ Admin mới được truy cập
- Tại sao cần phân quyền? → Bảo mật

#### Bước 2: Đọc Service
**File:** `service/AdminUserService.java`
**Method:** `getUsers()`

**Tìm hiểu:**
- Specification pattern là gì?
- Phân trang (Pageable) hoạt động như thế nào?

#### Bước 3: Test Thực Tế
1. Đăng nhập với role ADMIN
2. GET `http://localhost:8080/api/v1/admin/users?page=0&size=10`
3. Header: `Authorization: Bearer <ADMIN_JWT_TOKEN>`

### ✅ Checklist
- [ ] Hiểu phân quyền trong Spring Security
- [ ] Hiểu Specification pattern
- [ ] Test thành công API quản lý user

---

## 🎯 TỔNG KẾT

### Thứ Tự Học Đề Xuất:
1. **Luồng Đăng Ký** (Dễ nhất, làm quen)
2. **Luồng Đăng Nhập** (Quan trọng nhất, học kỹ)
3. **Luồng Cập Nhật Profile** (Hiểu JWT Filter)
4. **Luồng Đổi Mật Khẩu** (Hiểu password verification)
5. **Luồng Quên Mật Khẩu** (Hiểu token mechanism)
6. **Luồng Admin** (Hiểu phân quyền)

### Phương Pháp Học Mỗi Luồng:
1. **Đọc sơ đồ** → Hiểu flow tổng thể
2. **Trace code** → Đi từng bước trong code
3. **Đặt câu hỏi** → Tại sao làm như vậy?
4. **Test thực tế** → Dùng Postman test API
5. **Ghi chú** → Viết lại những gì hiểu

### Mục Tiêu Sau Khi Học:
- ✅ Hiểu rõ từng luồng hoạt động
- ✅ Biết code chạy như thế nào
- ✅ Có thể giải thích cho người khác
- ✅ Có thể debug khi có lỗi

**Chúc bạn học tập hiệu quả! 🚀**


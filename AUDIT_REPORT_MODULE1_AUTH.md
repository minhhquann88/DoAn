# 🔐 CODEBASE AUDIT REPORT - MODULE 1: AUTHENTICATION

**Date:** 2025-01-22  
**Module:** Authentication & Authorization  
**Auditor:** AI Code Review System

---

## 📋 EXECUTIVE SUMMARY

Module Authentication đã được triển khai với các chức năng cơ bản: đăng ký, đăng nhập, quên mật khẩu, và cập nhật profile. Tuy nhiên, phát hiện **1 lỗ hổng bảo mật nghiêm trọng** và một số vấn đề cần cải thiện.

**Risk Level:** 🔴 **HIGH** (1 Critical Issue)

---

## ✅ UC-AUTH-01: REGISTRATION FLOW

### **Requirement:** Allow creating accounts with different roles (ROLE_STUDENT vs ROLE_INSTRUCTOR)

### **Implementation Status:** ✅ **IMPLEMENTED** (with Security Risk)

**Location:**
- Controller: `backend/src/main/java/com/coursemgmt/controller/AuthController.java`
- Service: `backend/src/main/java/com/coursemgmt/service/AuthService.java`
- DTO: `backend/src/main/java/com/coursemgmt/dto/RegisterRequest.java`

**Code Analysis:**

```java
// AuthService.java - Line 79-125
public User registerUser(RegisterRequest registerRequest) {
    // ... validation ...
    
    Set<String> strRoles = registerRequest.getRoles();
    Set<Role> roles = new HashSet<>();
    
    if (strRoles == null || strRoles.isEmpty()) {
        // Default to ROLE_STUDENT
        Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                .orElseThrow(() -> new RuntimeException("Error: Role 'STUDENT' is not found."));
        roles.add(userRole);
    } else {
        strRoles.forEach(role -> {
            switch (role) {
                case "admin":  // ⚠️ SECURITY RISK!
                    Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Error: Role 'ADMIN' is not found."));
                    roles.add(adminRole);
                    break;
                case "lecturer":
                    Role modRole = roleRepository.findByName(ERole.ROLE_LECTURER)
                            .orElseThrow(() -> new RuntimeException("Error: Role 'LECTURER' is not found."));
                    roles.add(modRole);
                    break;
                default:
                    Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                            .orElseThrow(() -> new RuntimeException("Error: Role 'STUDENT' is not found."));
                    roles.add(userRole);
            }
        });
    }
    user.setRoles(roles);
    return userRepository.save(user);
}
```

**Findings:**
- ✅ Hỗ trợ đăng ký với `ROLE_STUDENT` và `ROLE_LECTURER`
- ✅ Mặc định là `ROLE_STUDENT` nếu không chỉ định role
- ✅ Validation username và email trùng lặp
- 🔴 **CRITICAL:** Cho phép đăng ký với `ROLE_ADMIN` mà không có kiểm tra authorization
- ⚠️ Không có validation role từ client (có thể gửi bất kỳ role nào)

**Test Coverage:**
- ✅ Test case cho registration thành công với role "student"
- ❌ Thiếu test case cho registration với role "lecturer"
- ❌ Thiếu test case để verify không thể đăng ký với role "admin"

---

## 🔒 SECURITY: PASSWORD ENCRYPTION

### **Requirement:** Verify passwords are encrypted using BCrypt before saving to database

### **Implementation Status:** ✅ **CORRECTLY IMPLEMENTED**

**Location:**
- Security Config: `backend/src/main/java/com/coursemgmt/security/WebSecurityConfig.java`
- Service: `backend/src/main/java/com/coursemgmt/service/AuthService.java`

**Code Analysis:**

```java
// WebSecurityConfig.java - Line 60-62
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

// AuthService.java - Line 91
user.setPassword(encoder.encode(registerRequest.getPassword())); // Mã hóa BCrypt

// AuthService.java - Line 161 (Reset Password)
user.setPassword(encoder.encode(request.getNewPassword()));
```

**Findings:**
- ✅ BCryptPasswordEncoder được cấu hình đúng trong WebSecurityConfig
- ✅ Password được mã hóa bằng `encoder.encode()` trước khi lưu vào database
- ✅ Áp dụng cho cả registration và password reset
- ✅ User model có comment rõ ràng: `// Đã mã hóa BCrypt`

**Security Verification:**
- ✅ Password không bao giờ được lưu dạng plaintext
- ✅ Sử dụng BCrypt với strength mặc định (10 rounds)

---

## 👤 UC-AUTH-04: UPDATE PROFILE

### **Requirement:** Check if Users can update their Avatar and Bio. Which API endpoint handles this?

### **Implementation Status:** ✅ **FULLY IMPLEMENTED**

**Location:**
- Controller: `backend/src/main/java/com/coursemgmt/controller/UserController.java`
- Service: `backend/src/main/java/com/coursemgmt/service/AuthService.java`
- DTO: `backend/src/main/java/com/coursemgmt/dto/UpdateProfileRequest.java`
- Model: `backend/src/main/java/com/coursemgmt/model/User.java`

**API Endpoints:**

1. **PUT `/api/user/profile`** - Update profile (including avatar URL and bio)
   ```java
   @PutMapping("/profile")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request)
   ```

2. **POST `/api/user/avatar`** - Upload avatar file
   ```java
   @PostMapping("/avatar")
   @PreAuthorize("isAuthenticated()")
   public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file)
   ```

**Code Analysis:**

```java
// UpdateProfileRequest.java
@Data
public class UpdateProfileRequest {
    @Size(min = 1, max = 100)
    private String fullName;
    
    @Size(max = 50)
    @Email
    private String email;
    
    private String avatarUrl;  // ✅ Supported
    
    private String bio;        // ✅ Supported
}

// AuthService.java - Line 168-193
public User updateProfile(Long userId, UpdateProfileRequest request) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found!"));
    
    // ... email validation ...
    
    if(request.getAvatarUrl() != null) {
        user.setAvatarUrl(request.getAvatarUrl());  // ✅ Avatar update
    }
    if(request.getBio() != null) {
        user.setBio(request.getBio());              // ✅ Bio update
    }
    
    return userRepository.save(user);
}
```

**User Model:**
```java
// User.java - Line 31-34
private String avatarUrl;  // ✅ Field exists

@Lob
private String bio;        // ✅ Field exists (Lob for long text)
```

**Findings:**
- ✅ Endpoint `/api/user/profile` hỗ trợ update avatarUrl và bio
- ✅ Endpoint `/api/user/avatar` hỗ trợ upload avatar file
- ✅ Có authentication check (`@PreAuthorize("isAuthenticated()")`)
- ✅ Chỉ cho phép user update profile của chính mình (lấy từ SecurityContext)
- ✅ Validation email trùng lặp khi update email
- ✅ FileStorageService xử lý upload avatar file
- ✅ Bio field sử dụng `@Lob` annotation cho text dài

---

## 🚨 SECURITY RISKS & MISSING LOGIC

### **🔴 CRITICAL ISSUES**

#### 1. **Admin Role Registration Vulnerability**
**Severity:** 🔴 **CRITICAL**

**Issue:**
- Bất kỳ ai cũng có thể đăng ký với role `ROLE_ADMIN` bằng cách gửi `{"roles": ["admin"]}` trong RegisterRequest
- Không có kiểm tra authorization hoặc whitelist

**Impact:**
- Attacker có thể tạo admin account và có toàn quyền hệ thống
- Có thể xóa dữ liệu, thay đổi cấu hình, quản lý users

**Recommendation:**
```java
// AuthService.java - registerUser()
if (strRoles != null && strRoles.contains("admin")) {
    throw new RuntimeException("Error: Cannot register with ADMIN role!");
}

// Hoặc chỉ cho phép ROLE_STUDENT và ROLE_LECTURER
strRoles.forEach(role -> {
    if (role.equals("admin")) {
        throw new RuntimeException("Error: ADMIN role cannot be assigned during registration!");
    }
    // ... rest of code
});
```

**Priority:** 🔴 **IMMEDIATE FIX REQUIRED**

---

### **⚠️ HIGH PRIORITY ISSUES**

#### 2. **Missing Email Verification**
**Severity:** ⚠️ **HIGH**

**Issue:**
- Code có comment: `// Tạm thời để true, sau này có thể set false để xác thực email`
- `isEnabled` được set `true` ngay khi đăng ký (line 94)
- User model có `isEnabled` field nhưng không được sử dụng đúng

**Impact:**
- Không thể verify email trước khi kích hoạt account
- Có thể tạo account với email giả

**Recommendation:**
- Set `isEnabled = false` khi đăng ký
- Gửi email verification link
- Chỉ enable account sau khi verify email

---

#### 3. **No Rate Limiting on Registration**
**Severity:** ⚠️ **MEDIUM**

**Issue:**
- Không có rate limiting cho endpoint `/api/auth/register`
- Attacker có thể spam tạo accounts

**Impact:**
- Database spam
- Email spam (nếu có email verification)
- Resource exhaustion

**Recommendation:**
- Implement rate limiting (ví dụ: 5 registrations per IP per hour)
- Sử dụng Spring Security hoặc Redis-based rate limiting

---

#### 4. **Security Config Disabled**
**Severity:** ⚠️ **HIGH**

**Issue:**
```java
// WebSecurityConfig.java - Line 27
// @EnableMethodSecurity  // Tạm thời disable để test Module 6,7,8,9
```

**Impact:**
- Method-level security không hoạt động
- `@PreAuthorize` annotations không có hiệu lực
- Tất cả endpoints đều public (line 83: `auth.anyRequest().permitAll()`)

**Recommendation:**
- Re-enable `@EnableMethodSecurity` sau khi test xong
- Cấu hình proper security rules cho các endpoints

---

### **📝 MEDIUM PRIORITY ISSUES**

#### 5. **Weak Password Validation**
**Severity:** ⚠️ **MEDIUM**

**Issue:**
- Chỉ có `@Size(min = 6, max = 40)` validation
- Không có requirement về uppercase, lowercase, numbers, special characters

**Recommendation:**
- Thêm custom validator cho password strength
- Hoặc sử dụng regex pattern validation

---

#### 6. **Error Messages Too Revealing**
**Severity:** ⚠️ **LOW**

**Issue:**
- Error messages trả về thông tin chi tiết: `"Error: Username is already taken!"`
- Có thể dùng để enumerate usernames

**Recommendation:**
- Generic error message: `"Error: Registration failed"`
- Log chi tiết ở server-side

---

#### 7. **Missing Input Sanitization**
**Severity:** ⚠️ **MEDIUM**

**Issue:**
- Không có sanitization cho bio field (có thể chứa XSS)
- AvatarUrl không được validate format

**Recommendation:**
- Sanitize HTML trong bio field
- Validate avatarUrl format (URL hoặc file path)

---

## 📊 SUMMARY TABLE

| Requirement | Status | Security Risk |
|------------|--------|---------------|
| UC-AUTH-01: Multi-role Registration | ✅ Implemented | 🔴 Critical (Admin role) |
| Password BCrypt Encryption | ✅ Correct | ✅ Secure |
| UC-AUTH-04: Update Avatar | ✅ Implemented | ✅ Secure |
| UC-AUTH-04: Update Bio | ✅ Implemented | ⚠️ Medium (XSS risk) |
| Email Verification | ❌ Missing | ⚠️ High |
| Rate Limiting | ❌ Missing | ⚠️ Medium |
| Method Security | ⚠️ Disabled | ⚠️ High |

---

## 🎯 RECOMMENDATIONS PRIORITY

### **Immediate Actions (This Week):**
1. 🔴 **BLOCK ADMIN ROLE REGISTRATION** - Fix critical security vulnerability
2. ⚠️ **RE-ENABLE METHOD SECURITY** - Enable `@EnableMethodSecurity` annotation
3. ⚠️ **IMPLEMENT EMAIL VERIFICATION** - Set `isEnabled = false` by default

### **Short-term (Next Sprint):**
4. ⚠️ **ADD RATE LIMITING** - Implement registration rate limiting
5. ⚠️ **STRENGTHEN PASSWORD VALIDATION** - Add password complexity requirements
6. ⚠️ **SANITIZE USER INPUT** - Sanitize bio field to prevent XSS

### **Long-term:**
7. 📝 **IMPROVE ERROR MESSAGES** - Make error messages less revealing
8. 📝 **ADD AUDIT LOGGING** - Log all registration attempts
9. 📝 **ADD CAPTCHA** - Prevent automated registration

---

## 📁 FILES REVIEWED

- ✅ `backend/src/main/java/com/coursemgmt/controller/AuthController.java`
- ✅ `backend/src/main/java/com/coursemgmt/service/AuthService.java`
- ✅ `backend/src/main/java/com/coursemgmt/controller/UserController.java`
- ✅ `backend/src/main/java/com/coursemgmt/model/User.java`
- ✅ `backend/src/main/java/com/coursemgmt/dto/RegisterRequest.java`
- ✅ `backend/src/main/java/com/coursemgmt/dto/UpdateProfileRequest.java`
- ✅ `backend/src/main/java/com/coursemgmt/security/WebSecurityConfig.java`

---

**Report Generated:** 2025-01-22  
**Next Review:** After critical fixes implemented


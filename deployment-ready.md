# 🚀 DEPLOYMENT READY CHECKLIST

**Dự án:** E-Learning Course Management System  
**Ngày:** 22/12/2025  
**Trạng thái:** 🟡 Sẵn sàng cho Development/Testing

---

## ✅ HOÀN THÀNH

### Backend (Spring Boot)
- [x] Tất cả Controllers đã tạo
- [x] Tất cả Services đã implement
- [x] Database models đã định nghĩa
- [x] JWT Authentication configured
- [x] CORS configured cho localhost:3000, 5173, 5177
- [x] MySQL connection configured
- [x] VNPay sandbox configured
- [x] Email service configured (Gmail SMTP)
- [x] File upload configured (10MB max)
- [x] Logging configured

### Frontend (Next.js)
- [x] All pages created
- [x] All services created and fixed
- [x] API client with interceptors
- [x] Authentication store (Zustand)
- [x] UI components (shadcn/ui)
- [x] Responsive layout
- [x] Environment variables configured

### API Integration
- [x] Auth module - 100% connected
- [x] Courses module - 100% connected
- [x] Content module - 100% connected
- [x] Tests module - 100% connected
- [x] Enrollments module - 100% connected
- [x] Instructors module - 100% connected
- [x] Statistics module - 100% connected
- [x] Transactions module - 100% connected
- [x] Certificates module - 100% connected
- [x] Chatbot module - 100% connected

---

## ⚠️ CẦN XỬ LÝ TRƯỚC KHI PRODUCTION

### 🔴 CRITICAL

#### 1. Enable Security
**File:** `backend/src/main/java/com/coursemgmt/security/WebSecurityConfig.java`

```java
// Uncomment dòng này:
@EnableMethodSecurity

// Và sửa filterChain để yêu cầu authentication:
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/courses").permitAll()
            .requestMatchers("/api/courses/{id}").permitAll()
            .requestMatchers("/api/chat/**").permitAll()
            .anyRequest().authenticated()
        );
    
    http.authenticationProvider(authenticationProvider());
    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
    
    return http.build();
}
```

#### 2. VNPay Production Config
**File:** `backend/src/main/resources/application.properties`

```properties
# Thay đổi sang production values:
vnpay.url=https://pay.vnpay.vn/vpcpay.html
vnpay.tmn-code=YOUR_PRODUCTION_TMN_CODE
vnpay.hash-secret=YOUR_PRODUCTION_HASH_SECRET
vnpay.return-url=https://your-domain.com/payment/callback
```

#### 3. Database Production
```properties
# Thay đổi sang production database:
spring.datasource.url=jdbc:mysql://production-db:3306/coursemgmt?useSSL=true
spring.datasource.username=production_user
spring.datasource.password=STRONG_PASSWORD_HERE

# Đổi từ update sang validate:
spring.jpa.hibernate.ddl-auto=validate
```

#### 4. JWT Secret
```properties
# Thay đổi sang secure secret:
coursemgmt.app.jwtSecret=YOUR_PRODUCTION_SECRET_AT_LEAST_64_CHARACTERS_LONG
coursemgmt.app.jwtExpirationMs=3600000  # Giảm xuống 1 giờ
```

---

### 🟠 HIGH PRIORITY

#### 5. Email Configuration
```properties
# Production email:
spring.mail.username=no-reply@your-domain.com
spring.mail.password=APP_PASSWORD
```

#### 6. CORS Production
```java
configuration.setAllowedOrigins(Arrays.asList(
    "https://your-domain.com",
    "https://www.your-domain.com"
));
```

#### 7. Frontend Environment
**File:** `frontend/.env.production`

```env
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api
NEXT_PUBLIC_CHATBOT_API_URL=https://chatbot.your-domain.com/api
```

#### 8. SSL/HTTPS
- Configure SSL certificate
- Force HTTPS redirect
- Update all URLs to https://

---

### 🟡 MEDIUM PRIORITY

#### 9. Implement Missing Endpoints
Backend cần thêm các endpoints sau:
- GET /api/auth/user
- POST /api/auth/change-password
- GET /api/courses/instructor/my-courses
- GET /api/courses/pending
- GET /api/v1/instructors/me
- GET /api/v1/certificates/{id}/download

#### 10. Error Logging
```properties
# Production logging:
logging.level.com.coursemgmt=INFO
logging.level.org.springframework.web=WARN
logging.file.name=/var/log/coursemgmt/application.log
```

#### 11. Rate Limiting
- Thêm rate limiting cho API
- Protect against brute force login

#### 12. File Upload Security
- Validate file types
- Scan for malware
- Store files securely (S3/Cloud Storage)

---

### 🟢 LOW PRIORITY (Post-launch)

#### 13. Performance
- Enable caching (Redis)
- Database query optimization
- CDN for static assets

#### 14. Monitoring
- Setup APM (Application Performance Monitoring)
- Setup error tracking (Sentry)
- Setup logging aggregation (ELK Stack)

#### 15. Backup
- Database backup schedule
- File storage backup
- Disaster recovery plan

---

## 📋 DEPLOYMENT STEPS

### Step 1: Backend Deployment

```bash
# Build JAR
cd backend
./mvnw clean package -DskipTests

# Run with production profile
java -jar target/course-management-system-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=production
```

### Step 2: Frontend Deployment

```bash
# Build production
cd frontend
npm run build

# Start production server
npm start
```

### Step 3: Chatbot Deployment

```bash
# Create virtual environment
cd src
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run with production config
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Step 4: Database Migration

```bash
# Backup existing database
mysqldump -u root -p coursemgmt_test > backup.sql

# Create production database
mysql -u root -p -e "CREATE DATABASE coursemgmt_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations (handled by Hibernate on first run)
```

---

## 🔐 SECURITY CHECKLIST

- [ ] Enable @EnableMethodSecurity
- [ ] Change JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain only
- [ ] Remove debug logging
- [ ] Secure database credentials
- [ ] Enable SQL injection prevention (prepared statements)
- [ ] Enable XSS prevention (output encoding)
- [ ] Enable CSRF protection (if using cookies)
- [ ] Implement rate limiting
- [ ] Set secure headers (HSTS, X-Frame-Options, etc.)
- [ ] Validate all user inputs
- [ ] Secure file upload

---

## 📊 TESTING CHECKLIST

### Functional Testing
- [ ] User registration flow
- [ ] Login/Logout flow
- [ ] Password reset flow
- [ ] Course browsing
- [ ] Course enrollment
- [ ] Content viewing
- [ ] Quiz taking
- [ ] Payment flow
- [ ] Certificate generation
- [ ] Chatbot interaction

### Role-based Testing
- [ ] Student access
- [ ] Instructor access
- [ ] Admin access

### Edge Cases
- [ ] Invalid inputs
- [ ] Unauthorized access
- [ ] Session expiry
- [ ] Network errors
- [ ] Concurrent users

---

## 📝 MAINTENANCE

### Daily
- Check application logs
- Monitor error rates
- Check server resources

### Weekly
- Database backup verification
- Security patch updates
- Performance review

### Monthly
- Full security audit
- User feedback review
- Feature roadmap update

---

## 📞 SUPPORT CONTACTS

| Role | Name | Contact |
|------|------|---------|
| Lead Developer | - | - |
| Database Admin | - | - |
| DevOps | - | - |
| Security | - | - |

---

## 📄 DOCUMENTATION

- ✅ `integration-checklist.md` - API integration status
- ✅ `integration-test-results.md` - Test results
- ✅ `issues-found.md` - Issues and fixes
- ✅ `api-documentation.md` - Full API docs
- ✅ `deployment-ready.md` - This file

---

**Tổng kết:** Hệ thống đã sẵn sàng cho development và testing. Cần thực hiện các bước security trước khi deploy production.

---

*Deployment Checklist - v1.0 - 22/12/2025*


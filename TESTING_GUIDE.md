# 🧪 HƯỚNG DẪN KIỂM THỬ HỆ THỐNG E-LEARNING

**Ngày tạo:** 22/12/2025  
**Phiên bản:** v1.0

---

## 📋 TỔNG QUAN

Hệ thống test bao gồm:
- **Backend Tests:** JUnit 5 + Spring Boot Test (Java)
- **Frontend Tests:** Vitest + Testing Library (TypeScript)
- **API Tests:** PowerShell Script
- **E2E Tests:** Manual testing checklist

---

## 🔧 THIẾT LẬP MÔI TRƯỜNG

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8.0+
- PowerShell 7+ (Windows)

### Backend Setup
```bash
cd backend

# Cài đặt dependencies và chạy tests
./mvnw test
```

### Frontend Setup
```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy tests
npm test
```

---

## 🖥️ BACKEND TESTS

### Cấu trúc Test Files
```
backend/src/test/
├── java/com/coursemgmt/
│   ├── controller/
│   │   ├── AuthControllerTest.java
│   │   ├── CourseControllerTest.java
│   │   ├── EnrollmentControllerTest.java
│   │   └── StatisticsControllerTest.java
│   └── service/
│       └── (service tests)
└── resources/
    └── application-test.properties
```

### Chạy Backend Tests

```bash
# Chạy tất cả tests
cd backend
./mvnw test

# Chạy test cụ thể
./mvnw test -Dtest=AuthControllerTest

# Chạy với verbose output
./mvnw test -Dtest=AuthControllerTest -DtrimStackTrace=false

# Chạy và xem coverage
./mvnw test jacoco:report
```

### Test Coverage Goals
| Module | Coverage Target |
|--------|-----------------|
| Controllers | 80%+ |
| Services | 85%+ |
| Security | 90%+ |

---

## 🎨 FRONTEND TESTS

### Cấu trúc Test Files
```
frontend/src/__tests__/
├── setup.ts
├── services/
│   ├── authService.test.ts
│   ├── courseService.test.ts
│   └── enrollmentService.test.ts
└── components/
    ├── CourseCard.test.tsx
    └── Navbar.test.tsx
```

### Chạy Frontend Tests

```bash
cd frontend

# Chạy tất cả tests
npm test

# Chạy với UI
npm run test:ui

# Chạy và xem coverage
npm run test:coverage

# Chạy một lần (CI mode)
npm run test:run
```

### Test Patterns
```typescript
// Service test example
describe('AuthService', () => {
  it('✅ should login successfully', async () => {
    // Arrange
    const mockResponse = { token: 'jwt-token' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });
    
    // Act
    const result = await authService.login('email', 'password');
    
    // Assert
    expect(result.token).toBe('jwt-token');
  });
});
```

---

## 🔌 API TESTS (PowerShell)

### Chạy API Tests

```powershell
# Đảm bảo backend đang chạy trước
cd backend
./mvnw spring-boot:run

# Mở terminal khác và chạy tests
./run-api-tests.ps1

# Với verbose output
./run-api-tests.ps1 -Verbose

# Test với URL khác
./run-api-tests.ps1 -BaseUrl "http://localhost:8081/api"
```

### Output Mẫu
```
═══════════════════════════════════════
  MODULE 1: AUTHENTICATION
═══════════════════════════════════════
✅ Register new user (Status: 200)
✅ Register - Duplicate email (Expected error: 400)
✅ Login with valid credentials (Status: 200)
✅ Login - Wrong password (Expected error: 400)

═══════════════════════════════════════
  TEST SUMMARY
═══════════════════════════════════════
📊 Results:
   Total Tests:  25
   Passed:       23
   Failed:       2
   Success Rate: 92%
```

---

## 📝 MANUAL TESTING CHECKLIST

### User Flow - Student
- [ ] Đăng ký tài khoản mới
- [ ] Xác minh email (nếu có)
- [ ] Đăng nhập
- [ ] Duyệt danh sách khóa học
- [ ] Xem chi tiết khóa học
- [ ] Ghi danh khóa học (miễn phí/có phí)
- [ ] Xem nội dung bài học
- [ ] Làm bài quiz
- [ ] Xem tiến độ học tập
- [ ] Nhận chứng chỉ
- [ ] Đăng xuất

### User Flow - Instructor
- [ ] Đăng nhập với tài khoản giảng viên
- [ ] Tạo khóa học mới
- [ ] Thêm chapters và lessons
- [ ] Upload video/tài liệu
- [ ] Tạo quiz/bài tập
- [ ] Publish khóa học
- [ ] Xem danh sách học viên
- [ ] Chấm bài tập
- [ ] Xem thống kê

### User Flow - Admin
- [ ] Đăng nhập với tài khoản admin
- [ ] Xem dashboard tổng quan
- [ ] Quản lý users
- [ ] Duyệt khóa học
- [ ] Xem báo cáo doanh thu
- [ ] Cấu hình hệ thống

---

## 🔐 SECURITY TESTS

### Checklist
- [ ] SQL Injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] JWT token validation
- [ ] JWT token expiration
- [ ] Role-based access control
- [ ] Rate limiting
- [ ] Input validation

### Test Commands
```bash
# Test SQL Injection
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@test.com OR 1=1", "password": "test"}'

# Test XSS
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "test", "fullName": "<script>alert(1)</script>"}'

# Test invalid token
curl -X GET http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer invalid-token"
```

---

## 📊 PERFORMANCE TESTS

### Load Testing với Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Get courses"
    flow:
      - get:
          url: "/api/courses"
```

```bash
# Chạy load test
artillery run artillery-config.yml
```

### Performance Goals
| Endpoint | Response Time |
|----------|---------------|
| GET /courses | < 200ms |
| POST /auth/login | < 300ms |
| GET /courses/{id} | < 150ms |

---

## 🚀 CI/CD INTEGRATION

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Run backend tests
        run: cd backend && ./mvnw test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run frontend tests
        run: cd frontend && npm run test:run
```

---

## 📈 TEST REPORTS

### Backend Test Report
```bash
# Generate HTML report
cd backend
./mvnw surefire-report:report

# Report location: target/site/surefire-report.html
```

### Frontend Coverage Report
```bash
# Generate coverage report
cd frontend
npm run test:coverage

# Report location: coverage/index.html
```

---

## ❓ TROUBLESHOOTING

### Backend Tests Fail
1. Check MySQL is running
2. Check application-test.properties
3. Run with verbose: `./mvnw test -X`

### Frontend Tests Fail
1. Check node_modules installed
2. Check vitest.config.ts
3. Run: `npm run test -- --reporter=verbose`

### API Tests Fail
1. Check backend is running on correct port
2. Check CORS configuration
3. Check authentication tokens

---

## 📚 TÀI LIỆU THAM KHẢO

- [Spring Boot Testing](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)

---

*Testing Guide - v1.0 - 22/12/2025*


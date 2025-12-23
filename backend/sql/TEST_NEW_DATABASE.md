# ✅ KIỂM TRA DATABASE MỚI

## 🔍 Bước 1: Kiểm tra Kết nối

### Test từ Backend

1. **Start backend:**
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

2. **Kiểm tra logs:**
- Không có lỗi "Table doesn't exist"
- Không có lỗi "Column doesn't exist"
- Hibernate validation thành công

### Test từ MySQL

```sql
USE coursemgmt_optimized;

-- Kiểm tra tables
SHOW TABLES;
-- Kết quả mong đợi: 14 tables

-- Kiểm tra data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM enrollments;
```

---

## 🔍 Bước 2: Test API Endpoints

### 1. Health Check
```bash
curl http://localhost:8080/api/chat/health
```

### 2. Get Courses
```bash
curl http://localhost:8080/api/courses
```

### 3. Test Authentication
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "roles": ["ROLE_STUDENT"]
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "test@example.com",
    "password": "password123"
  }'
```

---

## 🔍 Bước 3: Kiểm tra Triggers

```sql
-- Tạo enrollment mới
INSERT INTO enrollments (user_id, course_id, progress, status)
VALUES (1, 1, 0.00, 'IN_PROGRESS');

-- Kiểm tra course.total_enrollments đã tăng chưa
SELECT id, title, total_enrollments FROM courses WHERE id = 1;
```

---

## 🔍 Bước 4: Kiểm tra Views

```sql
-- Test view active courses
SELECT * FROM v_active_courses LIMIT 5;

-- Test view student enrollments
SELECT * FROM v_student_enrollments LIMIT 5;

-- Test view course statistics
SELECT * FROM v_course_statistics LIMIT 5;
```

---

## 🔍 Bước 5: Kiểm tra Indexes

```sql
-- Kiểm tra indexes đã được sử dụng
EXPLAIN SELECT * FROM courses 
WHERE status = 'PUBLISHED' 
  AND deleted_at IS NULL
ORDER BY average_rating DESC
LIMIT 10;

-- Kiểm tra key column (phải có giá trị, không NULL)
```

---

## ✅ Checklist

- [ ] Backend compile thành công
- [ ] Backend start không lỗi
- [ ] Hibernate validation pass
- [ ] API endpoints hoạt động
- [ ] Triggers hoạt động (auto update stats)
- [ ] Views hoạt động
- [ ] Indexes được sử dụng
- [ ] Data integrity OK

---

## 🆘 Nếu có lỗi

### Lỗi: "Table doesn't exist"
- Kiểm tra database name trong `application.properties`
- Đảm bảo đã chạy `create_optimized_database.sql`

### Lỗi: "Column doesn't exist"
- Kiểm tra mapping trong models
- Đảm bảo `@Column(name = "...")` đúng với database

### Lỗi: "Foreign key constraint fails"
- Kiểm tra data integrity
- Đảm bảo foreign keys có data hợp lệ

---

**Hoàn tất!** 🎉


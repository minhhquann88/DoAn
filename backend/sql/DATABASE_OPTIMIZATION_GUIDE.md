# 🗄️ HƯỚNG DẪN TẠO DATABASE TỐI ƯU

## 📋 Tổng quan

Database schema mới được tối ưu với:
- ✅ Normalization (3NF)
- ✅ Indexes đầy đủ cho tất cả foreign keys và search fields
- ✅ Constraints (NOT NULL, UNIQUE, CHECK)
- ✅ Soft delete (deleted_at)
- ✅ Timestamps (created_at, updated_at)
- ✅ Triggers tự động update stats
- ✅ Views cho common queries
- ✅ Full-text search indexes

---

## 🚀 CÁCH TẠO DATABASE MỚI

### Bước 1: Backup Database Cũ

```bash
mysqldump -u root -p27012003 coursemgmt_test > backup_$(date +%Y%m%d).sql
```

### Bước 2: Tạo Database Mới

**Cách 1: MySQL Workbench**
1. Mở MySQL Workbench
2. Kết nối: `localhost:3306`, user `root`, password `27012003`
3. Mở file `backend/sql/create_optimized_database.sql`
4. Chạy toàn bộ script

**Cách 2: Command Line**
```bash
mysql -u root -p27012003 < backend/sql/create_optimized_database.sql
```

### Bước 3: Migrate Data (Nếu có dữ liệu cũ)

```bash
mysql -u root -p27012003 < backend/sql/migrate_data.sql
```

### Bước 4: Cập nhật Application

Sửa `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/coursemgmt_optimized?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
spring.jpa.hibernate.ddl-auto=validate  # Không auto-update nữa
```

---

## 📊 CẤU TRÚC DATABASE

### Tables

1. **roles** - Vai trò người dùng
2. **users** - Người dùng
3. **user_roles** - Quan hệ user-role (many-to-many)
4. **password_reset_tokens** - Tokens đặt lại mật khẩu
5. **categories** - Danh mục khóa học
6. **courses** - Khóa học
7. **chapters** - Chương (sections)
8. **lessons** - Bài học
9. **enrollments** - Ghi danh
10. **user_progress** - Tiến độ học tập
11. **transactions** - Giao dịch thanh toán
12. **certificates** - Chứng chỉ
13. **chat_messages** - Tin nhắn chatbot
14. **recommendations** - Gợi ý khóa học

### Indexes

**Primary Indexes:**
- Tất cả tables có PRIMARY KEY trên `id`

**Foreign Key Indexes:**
- Tất cả foreign keys đều có INDEX

**Search Indexes:**
- `users`: email, username, full_name (FULLTEXT)
- `courses`: title, description (FULLTEXT), status, price, instructor_id
- `enrollments`: user_id, course_id, status, progress
- `lessons`: chapter_id, content_type, position

**Performance Indexes:**
- `courses`: total_enrollments, average_rating (cho sorting)
- `enrollments`: enrolled_at, completed_at (cho filtering)
- `transactions`: created_at, status (cho reporting)

### Triggers

1. **after_enrollment_insert** - Tự động tăng `total_enrollments` của course
2. **after_enrollment_delete** - Tự động giảm `total_enrollments` của course
3. **after_progress_complete** - Tự động tính `progress` của enrollment
4. **after_lesson_insert** - Tự động cập nhật `total_lessons` của course

### Views

1. **v_active_courses** - Danh sách khóa học đang active với thông tin instructor
2. **v_student_enrollments** - Enrollments của học viên với progress chi tiết
3. **v_course_statistics** - Thống kê tổng quan của từng khóa học

---

## 🔍 KIỂM TRA SAU KHI TẠO

### 1. Kiểm tra Tables

```sql
USE coursemgmt_optimized;
SHOW TABLES;
```

Kết quả mong đợi: 14 tables

### 2. Kiểm tra Indexes

```sql
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'coursemgmt_optimized'
ORDER BY TABLE_NAME, INDEX_NAME;
```

### 3. Kiểm tra Foreign Keys

```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'coursemgmt_optimized'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
```

### 4. Kiểm tra Triggers

```sql
SHOW TRIGGERS FROM coursemgmt_optimized;
```

### 5. Kiểm tra Views

```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
```

### 6. Test Performance

```sql
-- Test query với index
EXPLAIN SELECT * FROM courses 
WHERE status = 'PUBLISHED' 
  AND deleted_at IS NULL
ORDER BY average_rating DESC
LIMIT 10;

-- Kiểm tra sử dụng index (key column không NULL)
```

---

## 📈 SO SÁNH VỚI DATABASE CŨ

| Feature | Database Cũ | Database Mới |
|---------|-------------|--------------|
| **Tables** | 14+ (có test tables) | 14 (không có test) |
| **Indexes** | Thiếu nhiều | Đầy đủ |
| **Soft Delete** | Không có | Có (deleted_at) |
| **Triggers** | Không có | 4 triggers |
| **Views** | Không có | 3 views |
| **Full-text Search** | Không có | Có |
| **Constraints** | Cơ bản | Đầy đủ |
| **Auto Stats Update** | Manual | Automatic |

---

## ⚙️ TỐI ƯU PERFORMANCE

### 1. MySQL Configuration

Thêm vào `my.cnf` hoặc `my.ini`:

```ini
[mysqld]
# InnoDB Settings
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT

# Query Cache (MySQL 5.7)
query_cache_type = 1
query_cache_size = 128M

# Slow Query Log
slow_query_log = 1
long_query_time = 1
slow_query_log_file = /var/log/mysql/slow-query.log
```

### 2. Regular Maintenance

```sql
-- Analyze tables weekly
ANALYZE TABLE users, courses, enrollments, lessons, transactions;

-- Optimize tables monthly
OPTIMIZE TABLE users, courses, enrollments;
```

### 3. Monitor Performance

```sql
-- Check slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- Check table sizes
SELECT 
    TABLE_NAME,
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)',
    TABLE_ROWS
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'coursemgmt_optimized'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

---

## 🔄 MIGRATION CHECKLIST

- [ ] Backup database cũ
- [ ] Tạo database mới (`coursemgmt_optimized`)
- [ ] Chạy `create_optimized_database.sql`
- [ ] Migrate data từ DB cũ (nếu có)
- [ ] Verify data integrity
- [ ] Update `application.properties`
- [ ] Test backend với DB mới
- [ ] Test các API endpoints
- [ ] Monitor performance
- [ ] Switch production (khi ready)

---

## 🆘 TROUBLESHOOTING

### Lỗi: "Table already exists"
```sql
DROP DATABASE IF EXISTS coursemgmt_optimized;
-- Sau đó chạy lại script
```

### Lỗi: "Foreign key constraint fails"
- Kiểm tra data integrity trong DB cũ
- Đảm bảo tất cả foreign keys có data hợp lệ

### Lỗi: "Trigger already exists"
```sql
DROP TRIGGER IF EXISTS after_enrollment_insert;
-- Sau đó chạy lại trigger creation
```

### Performance chậm
- Kiểm tra indexes có được sử dụng: `EXPLAIN SELECT ...`
- Analyze tables: `ANALYZE TABLE ...`
- Kiểm tra slow query log

---

## ✅ KẾT QUẢ MONG ĐỢI

Sau khi tạo database mới:

- ✅ 14 tables được tạo
- ✅ Tất cả indexes được tạo
- ✅ 4 triggers hoạt động
- ✅ 3 views sẵn sàng sử dụng
- ✅ Data migrated thành công (nếu có)
- ✅ Application kết nối được
- ✅ Performance tốt hơn database cũ

---

**Hoàn tất!** 🎉


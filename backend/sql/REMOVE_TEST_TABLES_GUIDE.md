# 🗑️ HƯỚNG DẪN XÓA CÁC BẢNG TEST/QUIZ TỪ DATABASE

## ✅ Thông tin Database

- **Database:** `coursemgmt_test`
- **User:** `root`
- **Password:** `27012003`
- **Host:** `localhost`
- **Port:** `3306`

---

## 📋 Các bảng cần xóa

1. `test_result_answers`
2. `test_results`
3. `test_questions`
4. `test_answer_options`
5. `tests`

---

## 🔧 CÁCH 1: Sử dụng MySQL Workbench (Khuyến nghị)

1. Mở **MySQL Workbench**
2. Kết nối đến database:
   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: `27012003`
3. Chọn database `coursemgmt_test`
4. Mở file `remove_test_tables.sql` hoặc copy SQL commands bên dưới
5. Chạy script SQL

---

## 🔧 CÁCH 2: Sử dụng phpMyAdmin

1. Mở **phpMyAdmin** trong browser: `http://localhost/phpmyadmin`
2. Đăng nhập:
   - Username: `root`
   - Password: `27012003`
3. Chọn database `coursemgmt_test` ở sidebar bên trái
4. Click tab **SQL**
5. Copy và paste SQL commands bên dưới
6. Click **Go** để chạy

---

## 🔧 CÁCH 3: Sử dụng MySQL Command Line

Nếu MySQL đã được thêm vào PATH:

```bash
mysql -u root -p27012003 -h localhost -P 3306 coursemgmt_test < remove_test_tables.sql
```

Hoặc chạy từng lệnh:

```bash
mysql -u root -p27012003 -h localhost -P 3306 coursemgmt_test
```

Sau đó paste SQL commands.

---

## 🔧 CÁCH 4: Sử dụng PowerShell Script

**Lưu ý:** Cần MySQL command line trong PATH hoặc chỉnh sửa script để trỏ đến đường dẫn MySQL.

```powershell
cd backend\sql
.\remove_test_tables.ps1
```

---

## 📝 SQL COMMANDS

Copy và chạy các lệnh sau:

```sql
-- Tắt foreign key checks tạm thời
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa các bảng
DROP TABLE IF EXISTS test_result_answers;
DROP TABLE IF EXISTS test_results;
DROP TABLE IF EXISTS test_questions;
DROP TABLE IF EXISTS test_answer_options;
DROP TABLE IF EXISTS tests;

-- Bật lại foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Kiểm tra kết quả
SHOW TABLES;
```

---

## ✅ KIỂM TRA SAU KHI XÓA

Chạy lệnh sau để xác nhận các bảng đã được xóa:

```sql
SHOW TABLES LIKE 'test%';
```

Kết quả mong đợi: **Empty set** (không có bảng nào)

---

## 📊 DANH SÁCH TABLES CÒN LẠI (Sau khi xóa)

Sau khi xóa, database sẽ còn các tables sau:

- `categories`
- `certificates`
- `chapters`
- `chat_messages`
- `courses`
- `enrollments`
- `lessons`
- `password_reset_tokens`
- `recommendations`
- `roles`
- `transactions`
- `user_progress`
- `user_roles`
- `users`

---

## ⚠️ LƯU Ý

1. **Backup trước khi xóa:** Nếu có dữ liệu quan trọng, hãy backup trước:
   ```bash
   mysqldump -u root -p27012003 coursemgmt_test > backup_$(date +%Y%m%d).sql
   ```

2. **Kiểm tra foreign keys:** Script đã tắt foreign key checks để tránh lỗi

3. **Restart backend:** Sau khi xóa, restart backend để đảm bảo không còn references

---

## 🆘 NẾU GẶP LỖI

### Lỗi: "Table doesn't exist"
- Có thể bảng đã được xóa trước đó
- Không ảnh hưởng, tiếp tục với các bảng khác

### Lỗi: "Cannot delete table"
- Kiểm tra xem có foreign key constraints không
- Đảm bảo đã chạy `SET FOREIGN_KEY_CHECKS = 0;` trước

### Lỗi: "Access denied"
- Kiểm tra username/password
- Đảm bảo user `root` có quyền DROP TABLE

---

**Hoàn tất!** 🎉


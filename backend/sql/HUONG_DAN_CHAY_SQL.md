# Hướng dẫn chạy SQL script để tạo database

## Thông tin kết nối
- **Username**: root
- **Password**: 27012003
- **Database**: coursemgmt_test
- **Host**: localhost:3306

## Cách 1: Sử dụng MySQL Command Line (Khuyến nghị)

### Nếu MySQL đã có trong PATH:
```bash
mysql -u root -p27012003 < create_test_database.sql
```

### Nếu MySQL chưa có trong PATH:
Tìm đường dẫn MySQL (thường là):
- `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`
- `C:\xampp\mysql\bin\mysql.exe`
- `C:\wamp64\bin\mysql\mysql8.0.xx\bin\mysql.exe`

Sau đó chạy:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p27012003 < create_test_database.sql
```

## Cách 2: Sử dụng MySQL Workbench

1. Mở **MySQL Workbench**
2. Kết nối đến MySQL server (localhost, root, password: 27012003)
3. File → Open SQL Script → Chọn file `create_test_database.sql`
4. Click **Execute** (F5) hoặc click nút ⚡

## Cách 3: Sử dụng phpMyAdmin (nếu dùng XAMPP/WAMP)

1. Mở trình duyệt: `http://localhost/phpmyadmin`
2. Đăng nhập với root / 27012003
3. Click tab **SQL**
4. Copy toàn bộ nội dung file `create_test_database.sql`
5. Paste vào ô SQL
6. Click **Go**

## Cách 4: Sử dụng Command Prompt

1. Mở **Command Prompt** (cmd) hoặc **PowerShell**
2. CD vào thư mục chứa file SQL:
   ```bash
   cd C:\Users\Admin\Downloads\ĐATN\backend\sql
   ```
3. Chạy lệnh:
   ```bash
   mysql -u root -p27012003 < create_test_database.sql
   ```

## Kiểm tra kết nối

Sau khi chạy script, kiểm tra database đã được tạo:

```sql
-- Kết nối MySQL
mysql -u root -p27012003

-- Xem danh sách database
SHOW DATABASES;

-- Sử dụng database
USE coursemgmt_test;

-- Xem các bảng
SHOW TABLES;

-- Đếm số bản ghi
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;
```

## Cấu hình Backend

File `application.properties` đã được cấu hình sẵn:
- URL: `jdbc:mysql://localhost:3306/coursemgmt_test`
- Username: `root`
- Password: `27012003`

## Khởi động Backend

Sau khi database đã được tạo:
1. Mở IDE (IntelliJ/Eclipse)
2. Mở project `backend`
3. Chạy `CourseManagementSystemApplication.java`
4. Backend sẽ kết nối đến MySQL và sẵn sàng test

## Test các Module

### Module 6: Quản lý học viên
- API: `http://localhost:8080/api/enrollments/*`
- Test với: student1, student2, student3 (password: 123456)

### Module 7: Quản lý giảng viên
- API: `http://localhost:8080/api/instructors/*`
- Test với: lecturer1, lecturer2 (password: 123456)

### Module 8: Thống kê - Báo cáo
- API: `http://localhost:8080/api/statistics/*`

### Module 9: Thanh toán - Chứng chỉ
- API: `http://localhost:8080/api/transactions/*`
- API: `http://localhost:8080/api/certificates/*`

## Troubleshooting

### Lỗi: "Access denied for user 'root'"
- Kiểm tra password có đúng không
- Thử reset password MySQL

### Lỗi: "Can't connect to MySQL server"
- Kiểm tra MySQL service đã chạy chưa
- Windows: Services → MySQL → Start

### Lỗi: "Unknown database 'coursemgmt_test'"
- Chạy lại script SQL để tạo database

### Lỗi: "Table already exists"
- Database đã được tạo trước đó
- Có thể bỏ qua hoặc drop database và tạo lại:
  ```sql
  DROP DATABASE IF EXISTS coursemgmt_test;
  ```


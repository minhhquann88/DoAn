# Hướng dẫn tạo Database MySQL để test

## Yêu cầu
- MySQL 5.7+ hoặc MySQL 8.0+
- Quyền tạo database

## Cách sử dụng

### 1. Chạy script SQL

```bash
# Cách 1: Sử dụng MySQL Command Line
mysql -u root -p < backend/sql/create_test_database.sql

# Cách 2: Sử dụng MySQL Workbench
# - Mở MySQL Workbench
# - Kết nối đến MySQL server
# - File > Open SQL Script > Chọn file create_test_database.sql
# - Execute (F5)
```

### 2. Cấu hình application.properties

Cập nhật file `backend/src/main/resources/application.properties`:

```properties
# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/coursemgmt_test?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true
```

### 3. Thông tin đăng nhập test

#### Admin
- Username: `admin`
- Password: `123456`
- Role: ROLE_ADMIN

#### Giảng viên
- Username: `lecturer1` hoặc `lecturer2`
- Password: `123456`
- Role: ROLE_LECTURER

#### Học viên
- Username: `student1`, `student2`, hoặc `student3`
- Password: `123456`
- Role: ROLE_STUDENT

## Dữ liệu mẫu

### Users
- 1 Admin
- 2 Lecturers (Giảng viên)
- 3 Students (Học viên)

### Courses
- 5 khóa học đã được tạo
- Trạng thái: PUBLISHED
- Giá từ 500,000 - 700,000 VNĐ

### Enrollments
- Student 1: 3 enrollments (1 completed, 2 in progress)
- Student 2: 2 enrollments (1 completed, 1 in progress)
- Student 3: 2 enrollments (đều in progress)

### Transactions
- 7 transactions với các trạng thái: SUCCESS, PENDING, FAILED
- Payment gateways: VNPAY, MOMO

### Certificates
- 2 certificates đã được cấp cho các enrollment đã hoàn thành

## Test các Module

### Module 6: Quản lý học viên
- API: `/api/enrollments/*`
- Test với: student1, student2, student3

### Module 7: Quản lý giảng viên
- API: `/api/instructors/*`
- Test với: lecturer1, lecturer2

### Module 8: Thống kê - Báo cáo
- API: `/api/statistics/*`
- Test dashboard stats, course stats, revenue stats

### Module 9: Thanh toán - Chứng chỉ
- API: `/api/transactions/*`, `/api/certificates/*`
- Test payment flow và certificate issuance

## Lưu ý

1. **Password**: Tất cả users có password là `123456` (đã được mã hóa BCrypt)
2. **Database**: Tên database là `coursemgmt_test`
3. **Xóa database**: Nếu muốn reset, chạy lại script (sẽ drop và tạo lại)
4. **Backup**: Nên backup trước khi test nếu có dữ liệu quan trọng

## Troubleshooting

### Lỗi kết nối
- Kiểm tra MySQL đã chạy chưa
- Kiểm tra username/password trong application.properties
- Kiểm tra port MySQL (mặc định 3306)

### Lỗi encoding
- Đảm bảo database dùng charset `utf8mb4`
- Kiểm tra connection string có `characterEncoding=UTF-8`

### Lỗi foreign key
- Đảm bảo chạy script theo thứ tự (tạo bảng trước, insert sau)
- Kiểm tra các giá trị ID có tồn tại không


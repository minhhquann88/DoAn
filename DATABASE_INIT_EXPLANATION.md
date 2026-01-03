# Giải thích về Database và Lỗi "Role 'LECTURER' is not found"

## ❓ Vấn đề

Khi bạn đăng ký tài khoản, gặp lỗi:
```
Error: Role 'LECTURER' is not found.
```

## 🔍 Nguyên nhân

**Database trên Aiven chưa có dữ liệu khởi tạo (roles).**

### Giải thích:

1. **Database mới trên Aiven:**
   - Database trên Aiven là database **mới**, chưa có dữ liệu
   - Spring Boot tự động tạo **cấu trúc bảng** (tables) nhưng **KHÔNG tự động tạo dữ liệu** (data)

2. **Roles cần thiết:**
   - Hệ thống cần 3 roles: `ROLE_ADMIN`, `ROLE_LECTURER`, `ROLE_STUDENT`
   - Khi đăng ký, backend tìm role trong database
   - Nếu không tìm thấy → lỗi "Role 'LECTURER' is not found"

3. **DataLoader trước đây:**
   - Chỉ khởi tạo **Categories** (danh mục khóa học)
   - **KHÔNG** khởi tạo **Roles** (vai trò người dùng)

---

## ✅ Giải pháp đã áp dụng

Đã cập nhật `DataLoader.java` để **tự động khởi tạo roles** khi ứng dụng start:

```java
private void initializeRoles() {
    if (roleRepository.count() == 0) {
        // Tạo 3 roles: ROLE_ADMIN, ROLE_LECTURER, ROLE_STUDENT
        ...
    }
}
```

### Cách hoạt động:

1. Khi backend start lần đầu (hoặc database trống)
2. `DataLoader` kiểm tra xem có roles chưa
3. Nếu chưa có → Tự động tạo 3 roles
4. Nếu đã có → Bỏ qua (không tạo trùng)

---

## 🚀 Cách áp dụng

### Bước 1: Commit và Push code

Code đã được cập nhật, cần commit và push:

```bash
git add backend/src/main/java/com/coursemgmt/config/DataLoader.java
git commit -m "fix: Auto-initialize roles in database on startup"
git push origin deploy
```

### Bước 2: Render tự động deploy

- Render sẽ tự động detect code mới
- Tự động build và deploy
- Khi backend start → Roles sẽ được tạo tự động

### Bước 3: Kiểm tra

1. Vào Render Logs
2. Tìm log: `"Roles initialized successfully!"`
3. Thử đăng ký lại → Không còn lỗi

---

## 📊 Database Structure

### Bảng `roles`:

| id | name           |
|----|----------------|
| 1  | ROLE_ADMIN     |
| 2  | ROLE_LECTURER  |
| 3  | ROLE_STUDENT   |

### Bảng `categories`:

| id | name              | description                    |
|----|-------------------|--------------------------------|
| 1  | Lập trình         | Các khóa học về lập trình...   |
| 2  | Web Development   | Phát triển ứng dụng web        |
| ...| ...               | ...                            |

---

## 🔄 Quy trình khởi tạo Database

### Lần đầu deploy:

1. **Spring Boot start** → Kết nối database Aiven
2. **JPA/Hibernate** → Tự động tạo cấu trúc bảng (nếu chưa có)
3. **DataLoader.run()** → Khởi tạo dữ liệu:
   - ✅ Roles (ROLE_ADMIN, ROLE_LECTURER, ROLE_STUDENT)
   - ✅ Categories (10 danh mục)

### Các lần sau:

- Nếu đã có dữ liệu → Bỏ qua (không tạo trùng)
- Log: `"Roles already exist. Skipping initialization."`

---

## 🛠️ Nếu vẫn gặp lỗi

### Cách 1: Restart Render Service

1. Vào Render Dashboard
2. Click **Manual Deploy** → **Deploy latest commit**
3. Đợi deploy xong
4. Kiểm tra Logs có `"Roles initialized successfully!"`

### Cách 2: Chạy SQL trực tiếp trên Aiven

Nếu cần, có thể chạy SQL trực tiếp:

```sql
INSERT INTO roles (name) VALUES 
('ROLE_ADMIN'),
('ROLE_LECTURER'),
('ROLE_STUDENT')
ON DUPLICATE KEY UPDATE name=name;
```

**Cách truy cập Aiven Console:**
1. Vào Aiven Dashboard: https://console.aiven.io/
2. Vào MySQL service `e-learning-db`
3. Click **"Open in browser"** hoặc dùng MySQL client
4. Chạy SQL script

---

## ✅ Checklist

- [x] Đã cập nhật `DataLoader.java` để khởi tạo roles
- [ ] Đã commit và push code
- [ ] Render đã deploy code mới
- [ ] Backend đã start và tạo roles
- [ ] Đã test đăng ký - không còn lỗi

---

## 📝 Lưu ý

1. **Database Aiven:**
   - Database mới → Chưa có dữ liệu
   - Cần khởi tạo roles lần đầu
   - Sau đó tự động có sẵn

2. **DataLoader:**
   - Chạy mỗi khi backend start
   - Chỉ tạo nếu chưa có (idempotent)
   - Không ảnh hưởng dữ liệu hiện có

3. **Roles:**
   - Bắt buộc phải có trong database
   - Không thể đăng ký nếu thiếu roles
   - Tự động tạo khi deploy lần đầu

---

## 🎉 Kết quả

Sau khi deploy code mới:
- ✅ Database tự động có roles
- ✅ Đăng ký tài khoản hoạt động bình thường
- ✅ Không còn lỗi "Role 'LECTURER' is not found"

Chúc bạn deploy thành công! 🚀


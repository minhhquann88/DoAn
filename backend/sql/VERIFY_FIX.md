# ✅ Kiểm tra sau khi fix database

## 🔍 Các bước kiểm tra

### 1. Kiểm tra Backend đã start thành công

**Trong terminal backend, tìm các dòng:**
```
INFO  --- [           main] c.c.CourseManagementSystemApplication    : Started CourseManagementSystemApplication
INFO  --- [           main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080
```

**Không có lỗi:**
- ❌ `Schema-validation: wrong column type`
- ❌ `Unable to build Hibernate SessionFactory`
- ❌ `Failed to initialize JPA EntityManagerFactory`

### 2. Kiểm tra Database Connection

**Trong logs, tìm:**
```
INFO  --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
INFO  --- [           main] org.hibernate.orm.connections.pooling    : HHH10001005: Database info:
        Database version: 8.0
```

### 3. Kiểm tra Schema Validation

**Trong logs, không có:**
```
ERROR --- [           main] j.LocalContainerEntityManagerFactoryBean : Failed to initialize JPA EntityManagerFactory
```

**Có:**
```
INFO  --- [           main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000489: No JTA platform available
```

### 4. Test API Endpoint

**Mở browser hoặc dùng curl:**
```bash
# Health check
curl http://localhost:8080/api/chat/health

# Get courses
curl http://localhost:8080/api/courses
```

**Kết quả mong đợi:**
- Status code: 200 OK
- Có response data (hoặc empty array nếu chưa có data)

### 5. Kiểm tra Database Column Type

**Chạy SQL trong MySQL Workbench:**
```sql
USE coursemgmt_optimized;

DESCRIBE chat_messages;
```

**Kết quả mong đợi:**
- `feedback_rating` column type là `int` (không phải `tinyint unsigned`)

---

## ✅ Checklist

- [ ] Backend start thành công (không có lỗi)
- [ ] Database connection OK
- [ ] Schema validation pass
- [ ] API endpoints hoạt động
- [ ] `feedback_rating` column type là `INT`

---

## 🆘 Nếu vẫn còn lỗi

### Lỗi: "Table doesn't exist"
- Kiểm tra database name: `coursemgmt_optimized`
- Đảm bảo đã chạy `create_optimized_database.sql`

### Lỗi: "Column doesn't exist"
- Kiểm tra đã chạy `fix_feedback_rating_type.sql`
- Verify column type: `DESCRIBE chat_messages;`

### Lỗi: "Connection refused"
- Kiểm tra MySQL service đang chạy
- Kiểm tra credentials trong `application.properties`

---

**Nếu tất cả đều OK, bạn đã fix thành công!** 🎉


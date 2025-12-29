# 🔍 Cách Xem Logs và Debug trên Render

## 📋 Bước 1: Xem Logs Chi Tiết

1. Trong Render dashboard, vào service **"e-learning-backend"**
2. Click tab **"Logs"** (bên trái sidebar)
3. Xem toàn bộ logs để tìm lỗi

---

## 🔍 Các Lỗi Thường Gặp và Cách Fix:

### ❌ Lỗi 1: "Failed to build Docker image"
**Nguyên nhân**: Dockerfile có vấn đề hoặc Maven build failed

**Cách fix**:
- Kiểm tra logs xem lỗi cụ thể ở đâu
- Có thể là Java version không khớp
- Hoặc Maven dependencies không tải được

### ❌ Lỗi 2: "Application failed to start"
**Nguyên nhân**: 
- Thiếu Environment Variables
- Database connection failed
- Port conflict

**Cách fix**:
- Kiểm tra đã thêm đủ 6 biến bắt buộc chưa
- Kiểm tra database connection string đúng chưa

### ❌ Lỗi 3: "Cannot connect to database"
**Nguyên nhân**: 
- Database credentials sai
- SSL mode không đúng
- Firewall block

**Cách fix**:
- Kiểm tra lại SPRING_DATASOURCE_URL có đúng không
- Đảm bảo có `ssl-mode=REQUIRED`
- Kiểm tra Aiven firewall settings

---

## ✅ Đã Sửa:

1. ✅ Cập nhật `application.properties` để đọc từ Environment Variables
2. ✅ Database URL, Username, Password đọc từ env vars
3. ✅ PORT đọc từ env var
4. ✅ JWT_SECRET đọc từ env var
5. ✅ CORS allowed origins đọc từ env var

---

## 🚀 Bước Tiếp Theo:

1. **Commit và push** các thay đổi:
   ```bash
   git add backend/src/main/resources/application.properties
   git commit -m "Update application.properties to read from environment variables"
   git push
   ```

2. **Trên Render**:
   - Vào service → Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Hoặc đợi auto-deploy (nếu đã bật)

3. **Xem logs** để kiểm tra:
   - Vào tab **"Logs"**
   - Xem có lỗi gì không
   - Nếu thành công, sẽ thấy "Started CourseManagementSystemApplication"

---

## 📝 Copy Logs Nếu Vẫn Lỗi:

Nếu vẫn failed, copy toàn bộ logs và gửi cho tôi, tôi sẽ giúp fix!


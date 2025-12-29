# 🔧 Troubleshooting Render Deployment

## ❌ Lỗi: "Exited with status 1 while building your code"

### Cách xem logs chi tiết:

1. Trong Render dashboard, vào service **"e-learning-backend"**
2. Click tab **"Logs"** (bên trái)
3. Xem logs để tìm lỗi cụ thể

---

## 🔍 Các Lỗi Thường Gặp:

### 1. Lỗi Build Docker Image
**Triệu chứng**: Build failed ngay từ đầu

**Nguyên nhân có thể**:
- Dockerfile không đúng
- Java version không khớp
- Maven build failed

**Cách fix**:
- Kiểm tra Dockerfile có đúng không
- Kiểm tra Java version trong pom.xml (21) và Dockerfile (21)

### 2. Lỗi Kết Nối Database
**Triệu chứng**: App start được nhưng crash khi connect DB

**Nguyên nhân**:
- Environment variables chưa đúng
- Database connection string sai

**Cách fix**:
- Kiểm tra lại Environment Variables trên Render
- Đảm bảo có đủ 6 biến bắt buộc

### 3. Lỗi Port
**Triệu chứng**: App không start được

**Nguyên nhân**:
- Port không đúng
- Render tự động set PORT, nhưng app không đọc

**Cách fix**:
- Đảm bảo `server.port=${PORT:8080}` trong application.properties

---

## 📋 Checklist Debug:

1. ✅ Vào tab **"Logs"** xem lỗi cụ thể
2. ✅ Kiểm tra Environment Variables đã đủ chưa
3. ✅ Kiểm tra Dockerfile có đúng không
4. ✅ Kiểm tra Root Directory = `backend`
5. ✅ Kiểm tra Language = `Docker`

---

## 🆘 Nếu Vẫn Lỗi:

Copy toàn bộ logs và gửi cho tôi, tôi sẽ giúp fix!


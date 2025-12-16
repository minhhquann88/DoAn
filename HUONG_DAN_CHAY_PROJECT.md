# 🚀 HƯỚNG DẪN CHẠY PROJECT

## 📋 Yêu cầu hệ thống

- ✅ Java JDK 17+ (hoặc 21)
- ✅ Node.js 18+ và npm
- ✅ Python 3.10+
- ✅ MySQL đang chạy

---

## 🔧 CÁCH CHẠY ĐẦY ĐỦ (3 SERVICES)

### **Bước 1: Chạy Backend (Spring Boot)**

Mở **Terminal 1**:

```powershell
cd backend
.\start_simple.bat
```

Hoặc thủ công:
```powershell
cd backend
.\mvnw.cmd clean package -DskipTests
java -jar target\course-management-system-0.0.1-SNAPSHOT.jar
```

✅ Backend chạy tại: **http://localhost:8080**

---

### **Bước 2: Chạy Chatbot Python (FastAPI)**

Mở **Terminal 2**:

```powershell
# Tạo venv (chỉ lần đầu)
python -m venv .venv

# Activate venv
.\.venv\Scripts\activate

# Cài dependencies (chỉ lần đầu)
pip install -r requirements.txt

# Chạy server
uvicorn src.main:app --reload --port 8000
```

✅ Chatbot API chạy tại: **http://localhost:8000**

---

### **Bước 3: Chạy Frontend (React + Vite)**

Mở **Terminal 3**:

```powershell
# Cài dependencies (chỉ lần đầu)
npm install

# Chạy dev server
npm run dev
```

✅ Frontend chạy tại: **http://localhost:5173**

---

## 🌐 TRUY CẬP CÁC TRANG

- **Chatbot AI**: http://localhost:5173/
- **API Test Dashboard**: http://localhost:5173/module-test
- **Test Modules**: http://localhost:5173/test-modules
- **Backend API**: http://localhost:8080/api/v1
- **Chatbot API**: http://localhost:8000

---

## 🔐 CẤU HÌNH API KEY

### ✅ Đã được cấu hình tự động!

- **Backend Python**: File `.env` (đã tạo tự động)
- **Frontend**: File `.env.local` (đã tạo tự động)

**Lưu ý**: Các file `.env` và `.env.local` đã được gitignore, **KHÔNG commit lên GitHub**.

---

## 🛠️ TROUBLESHOOTING

### Backend không chạy được?
- Kiểm tra MySQL đang chạy
- Kiểm tra port 8080 chưa bị chiếm
- Xem log trong terminal

### Frontend không kết nối được Backend?
- Đảm bảo Backend đã chạy trước
- Kiểm tra CORS trong `WebSecurityConfig.java`

### Chatbot không hoạt động?
- Kiểm tra file `.env` có đúng key không
- Kiểm tra Python venv đã activate chưa
- Xem log trong terminal

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Thứ tự khởi động**: Backend → Chatbot → Frontend
2. **API Key**: Đã được cấu hình tự động trong `.env` files
3. **Database**: Đảm bảo MySQL đã setup và chạy
4. **Ports**: 
   - Backend: 8080
   - Frontend: 5173
   - Chatbot: 8000

---

## ✅ KIỂM TRA HỆ THỐNG

Sau khi chạy cả 3 services, test các API:

1. **Backend**: http://localhost:8080/api/v1/statistics/dashboard
2. **Chatbot**: http://localhost:8000/docs (Swagger UI)
3. **Frontend**: Mở browser và test UI

---

**Chúc bạn code vui vẻ! 🎉**


# 🚀 MANUAL STARTUP GUIDE

## ⚠️ Lưu ý về Path Encoding

Do tên thư mục chứa ký tự tiếng Việt "Đ" (ĐATN), một số shell commands có thể gặp lỗi encoding. 

**Giải pháp:** Khởi động thủ công trong 3 terminal riêng biệt.

---

## 🎯 KHỞI ĐỘNG TỪNG SERVICE

### **Terminal 1: Frontend (Next.js)**

```powershell
# Mở PowerShell, chạy lần lượt:
cd "C:\Users\Admin\Downloads\ĐATN\frontend"
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.10 (Turbopack)
- Local:   http://localhost:3000
- Network: http://192.168.1.6:3000
✓ Ready in 2s
```

**Status:** ✅ **ĐANG CHẠY** tại http://localhost:3000

---

### **Terminal 2: Backend (Spring Boot)**

```powershell
# Mở PowerShell MỚI, chạy lần lượt:
cd "C:\Users\Admin\Downloads\ĐATN\backend"
.\mvnw spring-boot:run
```

**Expected output:**
```
Started CourseManagementSystemApplication in X.XXX seconds
```

**URL:** http://localhost:8080

---

### **Terminal 3: Chatbot (Python FastAPI)**

```powershell
# Mở PowerShell MỚI, chạy lần lượt:
cd "C:\Users\Admin\Downloads\ĐATN"
.\.venv\Scripts\Activate.ps1
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

**URL:** http://localhost:8000

---

## ✅ KIỂM TRA SERVICES

### **Check Frontend:**
```bash
curl http://localhost:3000
# Hoặc mở browser: http://localhost:3000
```

### **Check Backend:**
```bash
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}
```

### **Check Chatbot:**
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

---

## 🧪 QUICK API TEST

Sau khi cả 3 services đang chạy, mở browser console (F12) tại http://localhost:3000 và chạy:

```javascript
async function quickTest() {
  console.log('🧪 Testing API connections...\n');
  
  // Test Backend
  try {
    const res = await fetch('http://localhost:8080/api/courses?page=0&size=5');
    console.log('Backend:', res.ok ? '✅ Connected' : '❌ Error');
  } catch (e) {
    console.log('Backend: ❌ Not running');
  }
  
  // Test Chatbot
  try {
    const res = await fetch('http://localhost:8000/health');
    console.log('Chatbot:', res.ok ? '✅ Connected' : '❌ Error');
  } catch (e) {
    console.log('Chatbot: ❌ Not running');
  }
  
  console.log('\n🎉 Test complete!');
}

quickTest();
```

---

## 📋 CHECKLIST

### **Trước khi khởi động:**
- [ ] MySQL đang chạy (port 3306)
- [ ] Database `course_management` đã tạo
- [ ] Node.js installed
- [ ] Java 17+ installed
- [ ] Python 3.8+ installed
- [ ] Virtual environment created (`.venv`)

### **Sau khi khởi động:**
- [ ] Frontend: http://localhost:3000 ✅
- [ ] Backend: http://localhost:8080 ⏳
- [ ] Chatbot: http://localhost:8000 ⏳

---

## 🐛 TROUBLESHOOTING

### **Backend không start:**
```bash
# Check if Java is installed
java -version

# Check if Maven wrapper exists
cd backend
ls mvnw*

# If missing, install Maven wrapper
mvn -N io.takari:maven:wrapper
```

### **Chatbot không start:**
```bash
# Check virtual environment
cd "C:\Users\Admin\Downloads\ĐATN"
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Check module path
python -c "import src.main"
```

### **Frontend không start:**
```bash
# Check Node.js version
node -v

# Reinstall dependencies
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### **CORS errors:**
Backend đã config CORS cho tất cả origins:
```java
@CrossOrigin(origins = "*", maxAge = 3600)
```

Nếu vẫn lỗi, check frontend `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:8000/api
```

---

## 🎯 TEST PAGES

Sau khi tất cả services chạy:

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Homepage |
| http://localhost:3000/login | Login |
| http://localhost:3000/register | Register |
| http://localhost:3000/courses | Course Listing |
| http://localhost:3000/student | Student Dashboard |
| http://localhost:3000/instructor | Instructor Dashboard |
| http://localhost:3000/admin | Admin Dashboard |
| http://localhost:8080/api/courses | Backend API Test |
| http://localhost:8000/docs | Chatbot API Docs |

---

## 📊 CURRENT STATUS

```
Frontend (Next.js):    ✅ RUNNING (Port 3000)
Backend (Spring Boot): ⏳ NEED MANUAL START (Port 8080)
Chatbot (FastAPI):     ⏳ NEED MANUAL START (Port 8000)
MySQL Database:        ⏳ CHECK IF RUNNING (Port 3306)
```

---

## 🚀 QUICK START COMMAND

Để khởi động nhanh, chạy script:

```powershell
cd "C:\Users\Admin\Downloads\ĐATN"
.\START_SERVICES.ps1
```

Script sẽ mở 3 terminal tự động cho mỗi service.

---

**🎊 Ready to test when all services are running!**

*Guide created: December 22, 2025*


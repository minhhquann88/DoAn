# 🚀 HƯỚNG DẪN CHẠY HỆ THỐNG

## 📋 YÊU CẦU

- **Java:** JDK 21+
- **Node.js:** 18+ 
- **MySQL:** 8.0+
- **Maven:** (đã có trong `mvnw` wrapper)

---

## 🔧 1. BACKEND (Spring Boot)

### Cách 1: Sử dụng Maven Wrapper (Khuyến nghị)

**Windows:**
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
cd backend
./mvnw spring-boot:run
```

### Cách 2: Sử dụng Maven đã cài đặt

```bash
cd backend
mvn spring-boot:run
```

### Cách 3: Build JAR và chạy

```bash
cd backend
.\mvnw.cmd clean package -DskipTests
java -jar target/course-management-system-0.0.1-SNAPSHOT.jar
```

### Cấu hình Backend

**File:** `backend/src/main/resources/application.properties`

Đảm bảo cấu hình database đúng:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/coursemgmt
spring.datasource.username=root
spring.datasource.password=your_password
```

**Port mặc định:** `http://localhost:8080`

**API Base URL:** `http://localhost:8080/api`

---

## 🎨 2. FRONTEND (Next.js)

### Development Mode (Khuyến nghị)

```bash
cd frontend
npm install          # Chỉ cần chạy lần đầu hoặc khi có dependencies mới
npm run dev
```

**Port mặc định:** `http://localhost:3000`

### Production Mode

```bash
cd frontend
npm run build       # Build production
npm start           # Chạy production server
```

### Cấu hình Frontend

**File:** `frontend/.env.local` (tạo nếu chưa có)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 🤖 3. CHATBOT SERVICE (Python FastAPI)

**Lưu ý:** Chatbot là một service riêng biệt, chạy độc lập với backend và frontend.

### Cài đặt Dependencies

```bash
# Cài đặt Python dependencies
pip install -r requirements.txt
```

### Chạy Chatbot

**Windows:**
```bash
# Cách 1: Sử dụng script có sẵn
.\start_chatbot.ps1

# Cách 2: Chạy trực tiếp
cd src
python main.py
```

**Linux/Mac:**
```bash
cd src
python3 main.py
```

**Hoặc sử dụng uvicorn:**
```bash
uvicorn src.main:app --reload --port 8000
```

**Chatbot sẽ chạy tại:** `http://localhost:8000`

**API Documentation:** `http://localhost:8000/docs`

### Cấu hình Chatbot

**File:** `.env` (tạo nếu chưa có)

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
DATABASE_URL=sqlite:///./chatbot.db
```

---

## 🔄 4. CHẠY CẢ BA SERVICES CÙNG LÚC

### Windows PowerShell

**Terminal 1 - Backend:**
```powershell
cd C:\Users\Admin\Downloads\DATN\backend
.\mvnw.cmd spring-boot:run
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\Admin\Downloads\DATN\frontend
npm run dev
```

**Terminal 3 - Chatbot:**
```powershell
cd C:\Users\Admin\Downloads\DATN
.\start_chatbot.ps1
```

### Windows CMD

**Terminal 1 - Backend:**
```cmd
cd C:\Users\Admin\Downloads\DATN\backend
mvnw.cmd spring-boot:run
```

**Terminal 2 - Frontend:**
```cmd
cd C:\Users\Admin\Downloads\DATN\frontend
npm run dev
```

### Linux/Mac

**Terminal 1 - Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Chatbot:**
```bash
cd src
python3 main.py
# hoặc
uvicorn src.main:app --reload --port 8000
```

---

## 📝 4. SCRIPTS TIỆN ÍCH

### Windows PowerShell Script

Tạo file `start-all.ps1`:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\mvnw.cmd spring-boot:run"

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start Chatbot
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot; .\start_chatbot.ps1"
```

Chạy:
```powershell
.\start-all.ps1
```

### Linux/Mac Bash Script

Tạo file `start-all.sh`:

```bash
#!/bin/bash

# Start Backend in background
cd backend && ./mvnw spring-boot:run &
BACKEND_PID=$!

# Wait 5 seconds
sleep 5

# Start Frontend in background
cd frontend && npm run dev &
FRONTEND_PID=$!

# Wait 5 seconds
sleep 5

# Start Chatbot in background
cd src && python3 main.py &
CHATBOT_PID=$!

echo "Backend PID: $BACKEND_PID (port 8080)"
echo "Frontend PID: $FRONTEND_PID (port 3000)"
echo "Chatbot PID: $CHATBOT_PID (port 8000)"
echo "Press Ctrl+C to stop all"

# Wait for user interrupt
wait
```

Chạy:
```bash
chmod +x start-all.sh
./start-all.sh
```

---

## ✅ 5. KIỂM TRA HỆ THỐNG

### Backend Health Check

Mở browser hoặc dùng curl:
```bash
curl http://localhost:8080/api/courses
```

Hoặc mở: `http://localhost:8080/api/courses`

### Frontend Check

Mở browser: `http://localhost:3000`

### Chatbot Health Check

Mở browser hoặc dùng curl:
```bash
curl http://localhost:8000/api/health
```

Hoặc mở: `http://localhost:8000/docs` (API documentation)

### Tất cả Services

| Service | URL | Status Check |
|---------|-----|--------------|
| Backend | http://localhost:8080 | `/api/courses` |
| Frontend | http://localhost:3000 | Home page |
| Chatbot | http://localhost:8000 | `/api/health` |

---

## 🛑 6. DỪNG HỆ THỐNG

### Dừng từng Service
- **Backend:** Nhấn `Ctrl + C` trong terminal backend
- **Frontend:** Nhấn `Ctrl + C` trong terminal frontend
- **Chatbot:** Nhấn `Ctrl + C` trong terminal chatbot

### Dừng tất cả (Windows PowerShell)
```powershell
Get-Process | Where-Object {
    $_.ProcessName -like "*java*" -or 
    $_.ProcessName -like "*node*" -or 
    $_.ProcessName -like "*python*" -or
    $_.ProcessName -like "*uvicorn*"
} | Stop-Process
```

### Dừng tất cả (Linux/Mac)
```bash
pkill -f "spring-boot:run"
pkill -f "next dev"
pkill -f "uvicorn"
pkill -f "python.*main.py"
```

---

## 🔍 7. TROUBLESHOOTING

### Backend không chạy được

1. **Kiểm tra Java version:**
   ```bash
   java -version  # Phải là Java 21+
   ```

2. **Kiểm tra database:**
   - MySQL đang chạy?
   - Database `coursemgmt` đã tạo chưa?
   - Username/password đúng chưa?

3. **Kiểm tra port 8080:**
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # Linux/Mac
   lsof -i :8080
   ```

### Frontend không chạy được

1. **Kiểm tra Node.js:**
   ```bash
   node -v  # Phải là Node 18+
   ```

2. **Cài đặt dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Kiểm tra port 3000:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

### CORS Error

Nếu gặp CORS error, kiểm tra:
- Backend đã cấu hình CORS trong `WebSecurityConfig.java`
- Frontend đang gọi đúng API URL
- Chatbot đã cấu hình CORS trong FastAPI

### Chatbot không chạy được

1. **Kiểm tra Python version:**
   ```bash
   python --version  # Phải là Python 3.8+
   ```

2. **Kiểm tra dependencies:**
   ```bash
   pip list | grep fastapi
   pip list | grep uvicorn
   ```

3. **Kiểm tra .env file:**
   - Có file `.env` trong root directory?
   - `GEMINI_API_KEY` đã được set chưa?

4. **Kiểm tra port 8000:**
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Linux/Mac
   lsof -i :8000
   ```

---

## 📚 8. CÁC LỆNH HỮU ÍCH KHÁC

### Backend

```bash
# Clean và compile
.\mvnw.cmd clean compile

# Chạy tests
.\mvnw.cmd test

# Build JAR
.\mvnw.cmd clean package

# Xem dependencies
.\mvnw.cmd dependency:tree
```

### Frontend

```bash
# Lint code
npm run lint

# Chạy tests
npm test

# Build production
npm run build

# Chạy production server
npm start
```

---

## 🎯 QUICK START

**Nhanh nhất để chạy hệ thống:**

1. **Terminal 1 - Backend:**
   ```bash
   cd backend && .\mvnw.cmd spring-boot:run
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Terminal 3 - Chatbot:**
   ```bash
   .\start_chatbot.ps1
   ```

4. **Mở browser:** 
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8080/api/courses`
   - Chatbot API: `http://localhost:8000/docs`

**Hoặc sử dụng script tự động:**
```powershell
.\start-all.ps1
```

---

**Chúc bạn code vui vẻ! 🚀**


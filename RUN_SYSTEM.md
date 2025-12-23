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

## 🔄 3. CHẠY CẢ HAI CÙNG LÚC

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

---

## 📝 4. SCRIPTS TIỆN ÍCH

### Windows PowerShell Script

Tạo file `start-dev.ps1`:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\mvnw.cmd spring-boot:run"

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

Chạy:
```powershell
.\start-dev.ps1
```

### Linux/Mac Bash Script

Tạo file `start-dev.sh`:

```bash
#!/bin/bash

# Start Backend in background
cd backend && ./mvnw spring-boot:run &
BACKEND_PID=$!

# Wait 5 seconds
sleep 5

# Start Frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both"

# Wait for user interrupt
wait
```

Chạy:
```bash
chmod +x start-dev.sh
./start-dev.sh
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

---

## 🛑 6. DỪNG HỆ THỐNG

### Dừng Backend
- Nhấn `Ctrl + C` trong terminal backend

### Dừng Frontend
- Nhấn `Ctrl + C` trong terminal frontend

### Dừng tất cả (Windows PowerShell)
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*node*"} | Stop-Process
```

### Dừng tất cả (Linux/Mac)
```bash
pkill -f "spring-boot:run"
pkill -f "next dev"
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

1. **Terminal 1:**
   ```bash
   cd backend && .\mvnw.cmd spring-boot:run
   ```

2. **Terminal 2:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Mở browser:** `http://localhost:3000`

---

**Chúc bạn code vui vẻ! 🚀**


# 🧪 Hướng Dẫn Test Local Trước Khi Deploy

## 🎯 Tại sao test local?

Thay vì:
- ❌ Sửa code → Commit → Đợi Render deploy (5-10 phút) → Test → Phát hiện lỗi → Sửa → Commit lại → Đợi deploy lại...

Làm:
- ✅ Sửa code → Test local (30 giây) → Sửa lỗi → Test lại → Commit → Deploy một lần

**Tiết kiệm thời gian: 80-90%!**

---

## 🚀 Quick Start

### Bước 1: Setup Local Environment

#### 1.1. Tạo file `application.properties`

```bash
cd backend/src/main/resources
copy application.properties.example application.properties
```

#### 1.2. Cấu hình Database

Sửa `application.properties`:
```properties
# Dùng database local hoặc production (nếu cho phép)
spring.datasource.url=jdbc:mysql://localhost:3306/coursemgmt_test?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

#### 1.3. Cấu hình VNPay (cho test local)

```properties
vnpay.return-url=http://localhost:3000/payment/vnpay-return
vnpay.tmn-code=PISGV29M
vnpay.hash-secret=DRC0V9AAYA651P2SID7SVYRY46HND1H4
```

### Bước 2: Start Backend

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

Đợi đến khi thấy: `Started CourseManagementSystemApplication`

### Bước 3: Test Nhanh

#### Option A: Dùng Script (Khuyến nghị)

```powershell
.\test-local.ps1
```

#### Option B: Test Thủ Công

```powershell
# Test 1: Health check
curl http://localhost:8080/api/v1/courses

# Test 2: Featured courses
curl http://localhost:8080/api/v1/courses/featured

# Test 3: VNPay IPN (test call)
curl http://localhost:8080/api/v1/vnpay/ipn
```

**Kết quả mong đợi:**
- Test 1 & 2: Trả về JSON array hoặc object
- Test 3: Trả về `{"RspCode":"00","Message":"Test call received successfully"}`

---

## 📋 Test Checklist Chi Tiết

### ✅ 1. Backend Startup

- [ ] Backend start không lỗi
- [ ] Database connection thành công
- [ ] Không có exception trong logs

**Cách test:**
```powershell
# Xem logs khi start
cd backend
.\mvnw.cmd spring-boot:run
# Đợi đến khi thấy "Started CourseManagementSystemApplication"
```

### ✅ 2. API Endpoints

#### Public Endpoints:
```powershell
# Courses
curl http://localhost:8080/api/v1/courses
curl http://localhost:8080/api/v1/courses/featured

# Categories
curl http://localhost:8080/api/v1/categories
```

#### Auth Endpoints:
```powershell
# Register
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"test","password":"test123"}'
```

### ✅ 3. VNPay Integration

#### Test 1: Tạo Payment URL

```powershell
# Cần token từ login trước
$token = "YOUR_JWT_TOKEN"
curl -X POST http://localhost:8080/api/v1/payment/create `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"courseId":1,"paymentGateway":"VNPAY"}'
```

**Kiểm tra:**
- Response có `paymentUrl`
- `paymentUrl` bắt đầu bằng `https://sandbox.vnpayment.vn/...`
- URL có đầy đủ params (vnp_TxnRef, vnp_Amount, vnp_SecureHash, etc.)

#### Test 2: IPN Endpoint

```powershell
curl http://localhost:8080/api/v1/vnpay/ipn
```

**Kết quả mong đợi:**
```json
{"RspCode":"00","Message":"Test call received successfully"}
```

#### Test 3: Signature Verification

Test với params hợp lệ (cần tạo từ VNPay thực tế hoặc mock):
```powershell
# Example (cần params thực tế từ VNPay)
curl "http://localhost:8080/api/v1/vnpay/ipn?vnp_TxnRef=TEST123&vnp_ResponseCode=00&..."
```

### ✅ 4. File Upload

#### Test Upload Avatar:

```powershell
# Cần token và file thực tế
$token = "YOUR_JWT_TOKEN"
curl -X POST http://localhost:8080/api/v1/users/profile/avatar `
  -H "Authorization: Bearer $token" `
  -F "file=@path/to/image.jpg"
```

**Kiểm tra:**
- Upload thành công
- Response có `avatarUrl`
- File được lưu trong `backend/uploads/avatars/`
- Có thể access: `http://localhost:8080/api/files/avatars/{filename}`

### ✅ 5. Code Quality

```bash
cd backend
.\mvnw.cmd clean compile
```

**Kiểm tra:**
- Compile thành công (exit code 0)
- Không có lỗi compilation
- Không có warning nghiêm trọng

---

## 🔧 Troubleshooting

### Backend không start

**Lỗi:** `Port 8080 already in use`
**Giải pháp:**
```powershell
# Tìm process đang dùng port 8080
netstat -ano | findstr :8080
# Kill process (thay PID bằng process ID)
taskkill /PID <PID> /F
```

### Database connection failed

**Lỗi:** `Communications link failure`
**Giải pháp:**
- Kiểm tra MySQL có chạy không
- Kiểm tra username/password trong `application.properties`
- Kiểm tra database có tồn tại không

### VNPay signature verification failed

**Lỗi:** `Checksum failed`
**Giải pháp:**
- Kiểm tra `vnpay.hash-secret` trong `application.properties`
- Đảm bảo params được encode đúng (URL encoding)

---

## 📊 So Sánh: Test Local vs Deploy

| Aspect | Test Local | Deploy Production |
|--------|-----------|-------------------|
| **Thời gian** | 30 giây | 5-10 phút |
| **Database** | Local hoặc Production | Production |
| **VNPay IPN** | Test call only | Real callback |
| **CORS** | Localhost | Real domains |
| **File Storage** | Local disk | Render disk |

**Kết luận:** Test local catch 90% lỗi, 10% còn lại cần test trên production.

---

## 🎯 Workflow Tối Ưu

```
1. Sửa code
   ↓
2. Test local (test-local.ps1)
   ↓
3. Có lỗi? → Sửa → Quay lại bước 2
   ↓
4. Tất cả test pass? → Commit
   ↓
5. Push → Render/Vercel deploy
   ↓
6. Kiểm tra logs production
   ↓
7. Test production (nếu cần)
```

**Thời gian tiết kiệm:** 
- Trước: 10-15 phút/lần sửa (đợi deploy)
- Sau: 1-2 phút/lần sửa (test local)

---

## ✅ Kết Luận

Test local trước khi commit giúp:
- ⏱️ **Tiết kiệm thời gian** (80-90%)
- 🐛 **Catch lỗi sớm** (trước khi deploy)
- 🚀 **Deploy tự tin** (biết chắc code hoạt động)
- 💰 **Tiết kiệm tài nguyên** (ít deploy = ít tốn tài nguyên)

**Hãy luôn test local trước khi commit!** 🎯


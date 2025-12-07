# MODULE 9: THANH TOÁN - CẤP CHỨNG CHỈ (PAYMENT & CERTIFICATE)

## 📋 Tổng quan

Module quản lý thanh toán và cấp chứng chỉ cho hệ thống Elearning.

### Tính năng chính:

✅ **Thanh toán:**
- Tích hợp VNPay Payment Gateway
- Hỗ trợ nhiều phương thức thanh toán (VNPay, MoMo, Bank Transfer)
- Lưu lịch sử giao dịch
- Tự động kích hoạt khóa học sau thanh toán
- Thống kê doanh thu

✅ **Chứng chỉ:**
- Tự động cấp chứng chỉ khi hoàn thành khóa học
- Generate PDF certificate
- Verify certificate
- Thống kê số chứng chỉ đã cấp
- Thu hồi chứng chỉ (Admin)

---

## 📁 Cấu trúc Files

```
DoAn-main/src/main/java/com/coursemgmt/
├── dto/
│   ├── TransactionDTO.java
│   ├── TransactionCreateRequest.java
│   ├── PaymentResponse.java
│   ├── CertificateDTO.java
│   └── CertificateRequest.java
├── repository/
│   ├── TransactionRepository.java
│   ├── CertificateRepository.java
│   ├── UserRepository.java
│   └── EnrollmentRepository.java
├── service/
│   ├── TransactionService.java
│   ├── VNPayService.java
│   ├── CertificateService.java
│   └── PdfGeneratorService.java
└── controller/
    ├── TransactionController.java
    └── CertificateController.java
```

---

## 🔌 API Endpoints

### Transaction APIs

#### 1. Tạo giao dịch thanh toán

```http
POST /api/v1/transactions
Content-Type: application/json

{
  "userId": 1,
  "courseId": 5,
  "amount": 299000,
  "paymentGateway": "VNPAY",
  "bankCode": "NCB",
  "returnUrl": "http://localhost:3000/payment/success"
}
```

**Response:**
```json
{
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...",
  "transactionCode": "TXN1234567890",
  "message": "Payment created successfully",
  "status": "SUCCESS"
}
```

#### 2. Payment Callback (VNPay redirect)

```http
GET /api/v1/transactions/payment/callback?vnp_ResponseCode=00&vnp_TxnRef=TXN123...
```

#### 3. Lấy tất cả giao dịch

```http
GET /api/v1/transactions?page=0&size=10&sortBy=createdAt&sortDir=DESC
```

#### 4. Lấy giao dịch của user

```http
GET /api/v1/transactions/user/1
```

#### 5. Thống kê doanh thu

```http
GET /api/v1/transactions/revenue?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59
```

**Response:**
```json
{
  "startDate": "2025-01-01T00:00:00",
  "endDate": "2025-12-31T23:59:59",
  "totalRevenue": 15000000.0
}
```

---

### Certificate APIs

#### 1. Cấp chứng chỉ

```http
POST /api/v1/certificates
Content-Type: application/json

{
  "enrollmentId": 10,
  "finalScore": 95
}
```

**Response:**
```json
{
  "id": 5,
  "certificateCode": "CERT-A1B2C3D4",
  "userId": 1,
  "userFullName": "Nguyen Van A",
  "userEmail": "user@example.com",
  "courseId": 5,
  "courseTitle": "Lập trình Python cơ bản",
  "instructorName": "Tran Van B",
  "issuedAt": "2025-11-13T10:30:00",
  "pdfUrl": "http://localhost:8080/certificates/certificate_CERT-A1B2C3D4.pdf",
  "finalScore": 95
}
```

#### 2. Lấy certificate theo code

```http
GET /api/v1/certificates/code/CERT-A1B2C3D4
```

#### 3. Verify certificate

```http
GET /api/v1/certificates/verify/CERT-A1B2C3D4
```

**Response:**
```json
{
  "certificateCode": "CERT-A1B2C3D4",
  "isValid": true,
  "message": "Certificate is valid"
}
```

#### 4. Lấy certificate của user

```http
GET /api/v1/certificates/user/1
```

#### 5. Thống kê certificate

```http
GET /api/v1/certificates/stats?startDate=2025-01-01T00:00:00&endDate=2025-12-31T23:59:59
```

**Response:**
```json
{
  "startDate": "2025-01-01T00:00:00",
  "endDate": "2025-12-31T23:59:59",
  "totalCertificates": 150
}
```

---

## 🔧 Setup & Configuration

### 1. Cấu hình VNPay

Truy cập https://sandbox.vnpayment.vn để đăng ký tài khoản test.

Cập nhật trong `application.properties`:

```properties
vnpay.tmn-code=YOUR_TMN_CODE
vnpay.hash-secret=YOUR_HASH_SECRET
vnpay.return-url=http://localhost:3000/payment/callback
```

### 2. Database

Các bảng sẽ tự động được tạo khi chạy ứng dụng (JPA auto-create).

### 3. Certificate Storage

Tạo thư mục để lưu PDF certificates:

```bash
mkdir certificates
```

---

## 🔄 Luồng xử lý

### Luồng Thanh toán:

```
1. User chọn khóa học → Frontend gọi POST /api/v1/transactions
2. Backend tạo Transaction (status=PENDING) → Generate payment URL
3. Frontend redirect user đến VNPay payment page
4. User thanh toán trên VNPay
5. VNPay redirect về GET /api/v1/transactions/payment/callback
6. Backend verify payment → Update Transaction (status=SUCCESS)
7. Tự động tạo Enrollment cho user
8. Frontend hiển thị thanh toán thành công
```

### Luồng Cấp chứng chỉ:

```
1. User hoàn thành khóa học (progress=100%)
2. System/Admin gọi POST /api/v1/certificates
3. Backend kiểm tra điều kiện → Tạo Certificate
4. Generate PDF certificate (async)
5. Lưu PDF URL vào database
6. User có thể download certificate
```

---

## 🧪 Testing

### Test Thanh toán (Postman)

```bash
# 1. Create transaction
POST http://localhost:8080/api/v1/transactions
Body: {
  "userId": 1,
  "courseId": 1,
  "amount": 299000,
  "paymentGateway": "VNPAY",
  "returnUrl": "http://localhost:3000/payment/success"
}

# 2. Copy paymentUrl từ response và mở trong browser
# 3. Thanh toán trên VNPay sandbox
# 4. Sau khi redirect, check transaction status
GET http://localhost:8080/api/v1/transactions/1
```

### Test Chứng chỉ

```bash
# 1. Issue certificate
POST http://localhost:8080/api/v1/certificates
Body: {
  "enrollmentId": 1,
  "finalScore": 90
}

# 2. Verify certificate
GET http://localhost:8080/api/v1/certificates/verify/CERT-XXXXXXXX

# 3. Download PDF
GET http://localhost:8080/certificates/certificate_CERT-XXXXXXXX.pdf
```

---

## 📊 Database Schema

### Transaction Table

```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    payment_gateway VARCHAR(50),
    status VARCHAR(50),
    transaction_code VARCHAR(100) UNIQUE,
    bank_code VARCHAR(50),
    card_type VARCHAR(50),
    created_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

### Certificate Table

```sql
CREATE TABLE certificates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id BIGINT NOT NULL UNIQUE,
    certificate_code VARCHAR(50) UNIQUE,
    issued_at DATETIME,
    completed_at DATETIME,
    pdf_url VARCHAR(500),
    final_score INTEGER,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
);
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Update VNPay config với production credentials
- [ ] Setup HTTPS cho payment callbacks
- [ ] Configure proper file storage (S3, Cloud Storage)
- [ ] Add email notification sau thanh toán
- [ ] Add webhook để notify admin
- [ ] Setup monitoring cho payment failures
- [ ] Add retry logic cho failed payments
- [ ] Implement refund functionality
- [ ] Add transaction reports
- [ ] Setup certificate template với company logo

---

## 🔐 Security

### Payment Security:
- ✅ HMAC SHA512 signature verification
- ✅ Transaction code unique và random
- ✅ Verify callback từ VNPay
- ✅ HTTPS required cho production

### Certificate Security:
- ✅ Unique certificate code (UUID)
- ✅ Cannot issue duplicate certificate
- ✅ Public verification endpoint
- ✅ Admin-only revoke

---

## 📚 Dependencies cần thêm

```xml
<!-- PDF Generation (Optional) -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13.3</version>
</dependency>

<!-- Flying Saucer (HTML to PDF) -->
<dependency>
    <groupId>org.xhtmlrenderer</groupId>
    <artifactId>flying-saucer-pdf</artifactId>
    <version>9.1.22</version>
</dependency>
```

---

## 💡 Next Steps

1. **Testing**: Test toàn bộ flow thanh toán
2. **Frontend**: Tạo payment UI
3. **Email**: Gửi email sau thanh toán thành công
4. **Refund**: Implement refund functionality
5. **MoMo**: Tích hợp MoMo payment
6. **Reports**: Tạo báo cáo doanh thu chi tiết

---

## 🐛 Troubleshooting

### Lỗi thanh toán không thành công:
- Check VNPay credentials
- Verify callback URL accessible
- Check transaction log

### Certificate PDF không generate:
- Check storage path exists
- Check write permissions
- Check PDF library installed

### Transaction stuck ở PENDING:
- Check callback được gọi chưa
- Manual update status nếu cần
- Add timeout để auto-cancel

---

## 📞 Support

- VNPay Docs: https://sandbox.vnpayment.vn/apis/docs/
- iText PDF: https://itextpdf.com/
- Flying Saucer: https://github.com/flyingsaucerproject/flyingsaucer

---

**Module hoàn thành! 🎉**

Các file đã tạo:
- ✅ 5 DTOs
- ✅ 4 Repositories  
- ✅ 4 Services
- ✅ 2 Controllers
- ✅ Documentation

**Next**: Tích hợp với Frontend React!


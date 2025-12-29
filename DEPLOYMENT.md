# 🚀 Hướng Dẫn Deploy E-learning Platform

## 📋 Tổng Quan

Dự án được deploy trên:
- **Frontend (Next.js)**: Vercel
- **Backend (Spring Boot)**: Render.com
- **Database (MySQL)**: Aiven

## 🔧 Bước 1: Tạo Database trên Aiven

1. Đăng ký tài khoản tại [Aiven.io](https://aiven.io) (Free)
2. Tạo service mới:
   - Chọn **MySQL**
   - Cloud: **Google Cloud**
   - Region: **Singapore** (gần Việt Nam)
   - Plan: **Free**
3. Sau khi tạo xong, copy các thông tin:
   - **Host**
   - **Port**
   - **Database name**
   - **Username**
   - **Password**
   - **Service URI** (dạng: `mysql://user:pass@host:port/db`)

## 🐳 Bước 2: Deploy Backend lên Render

### 2.1. Chuẩn bị code

Đảm bảo bạn đã có:
- ✅ `Dockerfile` trong thư mục `backend/`
- ✅ Code đã push lên GitHub

### 2.2. Tạo Web Service trên Render

1. Đăng ký tài khoản tại [Render.com](https://render.com) (Free)
2. Chọn **New +** → **Web Service**
3. Kết nối với GitHub repository của bạn
4. Chọn branch và thư mục `backend/`
5. Cấu hình:
   - **Name**: `e-learning-backend` (hoặc tên bạn muốn)
   - **Environment**: `Docker`
   - **Region**: `Singapore` (hoặc gần nhất)
   - **Branch**: `main` (hoặc branch của bạn)

### 2.3. Environment Variables

Thêm các biến môi trường sau trong Render:

```bash
# Database (từ Aiven)
SPRING_DATASOURCE_URL=jdbc:mysql://<HOST>:<PORT>/<DB_NAME>?ssl-mode=REQUIRED&serverTimezone=UTC&characterEncoding=UTF-8
SPRING_DATASOURCE_USERNAME=<USERNAME>
SPRING_DATASOURCE_PASSWORD=<PASSWORD>

# Server Port (Render tự động set PORT, nhưng có thể override)
PORT=8080

# JWT Secret (tạo một chuỗi ngẫu nhiên mạnh)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS (sẽ cập nhật sau khi có link Vercel)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000

# VNPay (nếu có)
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=https://your-frontend.vercel.app/payment/callback
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret

# Email (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Gemini API (nếu có)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_API_MODEL=gemini-2.5-flash

# File Storage Paths
CERTIFICATE_STORAGE_PATH=/app/certificates
AVATAR_STORAGE_PATH=/app/uploads/avatars
```

### 2.4. Deploy

1. Bấm **Create Web Service**
2. Render sẽ tự động build Docker image và deploy
3. Đợi khoảng 5-10 phút để build xong
4. Copy link backend: `https://your-backend.onrender.com`

⚠️ **Lưu ý**: Render Free tier có sleep mode. Server sẽ sleep sau 15 phút không có request. Request đầu tiên sau đó sẽ mất ~30-50s để wake up.

## ⚡ Bước 3: Deploy Frontend lên Vercel

### 3.1. Cấu hình Environment Variables

1. Tạo file `.env.local` trong thư mục `frontend/`:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

2. Hoặc cập nhật `frontend/src/lib/constants.ts`:

```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
```

### 3.2. Deploy trên Vercel

1. Đăng ký tài khoản tại [Vercel.com](https://vercel.com) (Free)
2. Chọn **Add New Project**
3. Import GitHub repository
4. Cấu hình:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com`
5. Bấm **Deploy**
6. Đợi 1-2 phút để build và deploy
7. Copy link frontend: `https://your-frontend.vercel.app`

### 3.3. Cập nhật CORS trên Render

Quay lại Render, cập nhật biến môi trường:

```bash
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

Sau đó restart service trên Render.

## ✅ Bước 4: Kiểm Tra

1. Truy cập frontend: `https://your-frontend.vercel.app`
2. Kiểm tra kết nối API:
   - Mở DevTools → Network tab
   - Thử đăng nhập hoặc load dữ liệu
   - Xem có request đến backend không

## 🔄 Cập Nhật Code

Mỗi khi push code lên GitHub:
- **Vercel**: Tự động deploy trong 1-2 phút
- **Render**: Cần vào dashboard và bấm **Manual Deploy** (hoặc cấu hình auto-deploy)

## 📝 Lưu Ý Quan Trọng

1. **Render Sleep Mode**: 
   - Server sẽ sleep sau 15 phút không có request
   - Có thể dùng [UptimeRobot](https://uptimerobot.com) (free) để ping mỗi 5 phút

2. **File Uploads**:
   - Files upload lên Render sẽ bị mất khi restart
   - Cân nhắc dùng cloud storage (AWS S3, Cloudinary) cho production

3. **Database Backup**:
   - Aiven free tier có thể export SQL
   - Nên backup định kỳ

4. **Environment Variables**:
   - Không commit file `.env` lên GitHub
   - Chỉ commit `.env.example`

## 🆘 Troubleshooting

### Backend không kết nối được Database
- Kiểm tra Service URI từ Aiven
- Đảm bảo SSL mode đúng: `ssl-mode=REQUIRED`
- Kiểm tra firewall của Aiven (cho phép IP của Render)

### CORS Error
- Kiểm tra `ALLOWED_ORIGINS` trên Render
- Đảm bảo có protocol `https://` đầy đủ
- Restart service sau khi thay đổi

### Frontend không gọi được API
- Kiểm tra `NEXT_PUBLIC_API_URL` trên Vercel
- Xem Network tab trong DevTools
- Kiểm tra CORS settings trên backend

## 📚 Tài Liệu Tham Khảo

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Aiven Documentation](https://aiven.io/docs)


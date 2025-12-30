# 🚀 Hướng Dẫn Deploy Chi Tiết - Step by Step

## 📋 Checklist Trước Khi Bắt Đầu

- [x] Code đã push lên GitHub
- [ ] Tài khoản Aiven (Free)
- [ ] Tài khoản Render (Free)
- [ ] Tài khoản Vercel (Free)

---

## 🔵 BƯỚC 1: Tạo Database trên Aiven

### 1.1. Đăng ký tài khoản
1. Truy cập: https://aiven.io
2. Click **"Start Free"** hoặc **"Sign Up"**
3. Đăng ký bằng email hoặc GitHub (khuyến nghị GitHub)
4. Xác thực email nếu cần

### 1.2. Tạo MySQL Service
1. Sau khi đăng nhập, click **"Create service"** hoặc **"+ New service"**
2. Chọn **MySQL**
3. Cấu hình:
   - **Cloud provider**: Chọn **Google Cloud** (hoặc AWS nếu muốn)
   - **Region**: Chọn **asia-southeast1** (Singapore) - gần Việt Nam nhất
   - **Service plan**: Chọn **Free** (hoặc **Hobbyist** nếu có)
   - **Service name**: Đặt tên, ví dụ: `e-learning-db`
4. Click **"Create service"**
5. Đợi 2-3 phút để service được tạo

### 1.3. Lấy thông tin kết nối
1. Sau khi service tạo xong, click vào service name
2. Vào tab **"Overview"** hoặc **"Connection information"**
3. Copy các thông tin sau (QUAN TRỌNG - Lưu vào file tạm):

```
Host: <something>.a.aivencloud.com
Port: <port number>
Database: defaultdb (hoặc tên database bạn chọn)
Username: avnadmin
Password: <password được hiển thị>
```

4. Hoặc copy **Service URI** (dạng: `mysql://avnadmin:password@host:port/defaultdb?ssl-mode=REQUIRED`)

### 1.4. Tạo Database cho ứng dụng
1. Vào tab **"Databases"** trong Aiven dashboard
2. Click **"Create database"**
3. Đặt tên: `coursemgmt` (hoặc tên bạn muốn)
4. Click **"Create"**

**Lưu ý**: Ghi lại tên database này để dùng ở bước sau.

---

## 🟢 BƯỚC 2: Deploy Backend lên Render

### 2.1. Đăng ký tài khoản Render
1. Truy cập: https://render.com
2. Click **"Get Started for Free"**
3. Đăng ký bằng GitHub (khuyến nghị) hoặc email
4. Xác thực email nếu cần

### 2.2. Tạo Web Service
1. Trong Render dashboard, click **"New +"** → **"Web Service"**
2. Kết nối GitHub repository:
   - Nếu chưa kết nối, click **"Connect account"** và authorize
   - Chọn repository: `minhhquann88/DoAn`
   - Chọn branch: `feature/e-learning-rebrand` (hoặc branch bạn đang dùng)
3. Cấu hình service:
   - **Name**: `e-learning-backend` (hoặc tên bạn muốn)
   - **Environment**: Chọn **Docker**
   - **Region**: Chọn **Singapore** (hoặc gần nhất)
   - **Branch**: `feature/e-learning-rebrand`
   - **Root Directory**: `backend` (QUAN TRỌNG!)

### 2.3. Cấu hình Environment Variables
Trong phần **"Environment Variables"**, thêm các biến sau:

#### Database (từ Aiven):
```
SPRING_DATASOURCE_URL=jdbc:mysql://<HOST>:<PORT>/<DATABASE_NAME>?ssl-mode=REQUIRED&serverTimezone=UTC&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=avnadmin
SPRING_DATASOURCE_PASSWORD=<PASSWORD_TỪ_AIVEN>
```

**Ví dụ cụ thể:**
```
SPRING_DATASOURCE_URL=jdbc:mysql://mysql-12345.a.aivencloud.com:12345/coursemgmt?ssl-mode=REQUIRED&serverTimezone=UTC&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=avnadmin
SPRING_DATASOURCE_PASSWORD=AVNS_abc123xyz
```

#### Server & Security:
```
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string-min-32-chars
ALLOWED_ORIGINS=http://localhost:3000
```

**Lưu ý**: `ALLOWED_ORIGINS` sẽ được cập nhật sau khi có link Vercel.

#### Email (Gmail - Optional):
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**Cách lấy Gmail App Password:**
1. Vào Google Account → Security
2. Bật 2-Step Verification
3. Tạo App Password cho "Mail"
4. Copy password 16 ký tự

#### Gemini API (Optional):
```
GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_API_MODEL=gemini-2.5-flash
```

#### VNPay (Optional - nếu có):
```
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/callback
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
```

### 2.4. Deploy
1. Scroll xuống và click **"Create Web Service"**
2. Render sẽ bắt đầu build Docker image
3. Đợi 5-10 phút để build và deploy
4. Xem logs để kiểm tra quá trình build

### 2.5. Kiểm tra Deploy
1. Sau khi deploy xong, bạn sẽ có link: `https://e-learning-backend.onrender.com`
2. Test API: Truy cập `https://e-learning-backend.onrender.com/api/v1/auth/health` (nếu có endpoint này)
3. Copy link backend này để dùng ở bước 3

**⚠️ Lưu ý**: 
- Render Free tier có sleep mode (15 phút không dùng sẽ sleep)
- Request đầu tiên sau khi sleep sẽ mất ~30-50s để wake up
- Có thể dùng UptimeRobot (free) để ping mỗi 5 phút

---

## 🟡 BƯỚC 3: Deploy Frontend lên Vercel

### 3.1. Đăng ký tài khoản Vercel
1. Truy cập: https://vercel.com
2. Click **"Sign Up"**
3. Đăng ký bằng GitHub (khuyến nghị)
4. Authorize Vercel truy cập GitHub repositories

### 3.2. Import Project
1. Trong Vercel dashboard, click **"Add New..."** → **"Project"**
2. Chọn repository: `minhhquann88/DoAn`
3. Import project

### 3.3. Cấu hình Project
1. **Framework Preset**: Chọn **Next.js** (tự động detect)
2. **Root Directory**: Chọn `frontend` (QUAN TRỌNG!)
3. **Build Command**: Để mặc định (`next build`)
4. **Output Directory**: Để mặc định (`.next`)
5. **Install Command**: Để mặc định (`npm install`)

### 3.4. Environment Variables
Trong phần **"Environment Variables"**, thêm:

```
NEXT_PUBLIC_API_BASE_URL=https://e-learning-backend.onrender.com/api
```

**Lưu ý**: 
- Thay `e-learning-backend.onrender.com` bằng link backend thực tế của bạn
- Phải có prefix `NEXT_PUBLIC_` để Next.js expose ra client-side

### 3.5. Deploy
1. Click **"Deploy"**
2. Đợi 1-2 phút để build và deploy
3. Vercel sẽ tự động tạo link: `https://your-project.vercel.app`

### 3.6. Cập nhật CORS trên Render
1. Quay lại Render dashboard
2. Vào service backend của bạn
3. Vào **"Environment"** tab
4. Cập nhật biến `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-project.vercel.app,http://localhost:3000
   ```
5. Click **"Save Changes"**
6. Render sẽ tự động restart service

---

## ✅ BƯỚC 4: Chạy Database Migration

### 4.1. Kết nối Database và chạy SQL
1. Vào Aiven dashboard → Service của bạn
2. Vào tab **"Databases"** → Click vào database name
3. Vào tab **"Query"** hoặc dùng MySQL client
4. Copy nội dung file `backend/sql/full_project_db.sql`
5. Paste và chạy SQL script để tạo tables

**Hoặc dùng MySQL Workbench/Command Line:**
```bash
mysql -h <HOST> -P <PORT> -u avnadmin -p <DATABASE_NAME> < backend/sql/full_project_db.sql
```

---

## 🧪 BƯỚC 5: Kiểm Tra

### 5.1. Test Frontend
1. Truy cập link Vercel: `https://your-project.vercel.app`
2. Kiểm tra:
   - [ ] Trang chủ load được
   - [ ] Đăng ký/Đăng nhập hoạt động
   - [ ] API calls thành công (mở DevTools → Network tab)

### 5.2. Test Backend
1. Test API endpoint:
   ```
   GET https://your-backend.onrender.com/api/v1/courses
   ```
2. Kiểm tra logs trên Render dashboard

### 5.3. Test Database
1. Kiểm tra data đã được tạo trong Aiven
2. Test CRUD operations qua API

---

## 🔧 Troubleshooting

### Backend không kết nối được Database
- ✅ Kiểm tra `SPRING_DATASOURCE_URL` có đúng format không
- ✅ Kiểm tra SSL mode: `ssl-mode=REQUIRED`
- ✅ Kiểm tra firewall của Aiven (cho phép IP của Render)

### CORS Error
- ✅ Kiểm tra `ALLOWED_ORIGINS` trên Render có đúng link Vercel không
- ✅ Đảm bảo có protocol `https://`
- ✅ Restart service sau khi thay đổi

### Frontend không gọi được API
- ✅ Kiểm tra `NEXT_PUBLIC_API_BASE_URL` trên Vercel
- ✅ Xem Network tab trong DevTools
- ✅ Kiểm tra CORS settings trên backend

### Build Failed trên Render
- ✅ Kiểm tra Dockerfile có đúng không
- ✅ Kiểm tra logs để xem lỗi cụ thể
- ✅ Đảm bảo `pom.xml` và Java version đúng

---

## 📝 Notes

1. **Render Sleep Mode**: Server sẽ sleep sau 15 phút. Có thể dùng [UptimeRobot](https://uptimerobot.com) để ping mỗi 5 phút (free).

2. **File Uploads**: Files upload lên Render sẽ bị mất khi restart. Cân nhắc dùng cloud storage (AWS S3, Cloudinary) cho production.

3. **Database Backup**: Aiven free tier có thể export SQL. Nên backup định kỳ.

4. **Environment Variables**: Không commit file `.env` lên GitHub. Chỉ dùng trên platform.

---

## 🎉 Hoàn Thành!

Sau khi hoàn thành tất cả các bước, bạn sẽ có:
- ✅ Frontend: `https://your-project.vercel.app`
- ✅ Backend: `https://your-backend.onrender.com`
- ✅ Database: MySQL trên Aiven

Chúc bạn deploy thành công! 🚀


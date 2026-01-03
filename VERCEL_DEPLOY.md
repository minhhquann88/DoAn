# 🚀 Hướng Dẫn Deploy Frontend lên Vercel

## 📋 Checklist Trước Khi Deploy

- [x] Backend đã deploy thành công trên Render
- [x] Backend URL: `https://e-learning-backend-hchr.onrender.com`
- [x] Code đã push lên GitHub (nhánh `deploy`)
- [ ] Vercel account đã được tạo

---

## Bước 1: Tạo Project trên Vercel

1. Truy cập: https://vercel.com/
2. Đăng nhập (có thể dùng GitHub account)
3. Click **"Add New..."** → **"Project"**
4. Click **"Import Git Repository"**
5. Chọn repository: `minhhquann88/DoAn`
6. Click **"Import"**

---

## Bước 2: Cấu hình Project

### Basic Settings

**Project Name:**
```
e-learning-frontend
```
(hoặc tên bạn muốn)

**Framework Preset:**
```
Next.js
```
(Vercel sẽ tự động detect)

**Root Directory:**
```
frontend
```
⚠️ **QUAN TRỌNG** - Phải set `frontend`

**Build Command:**
```
npm run build
```
(hoặc để trống, Vercel sẽ tự động detect)

**Output Directory:**
```
.next
```
(hoặc để trống, Vercel sẽ tự động detect)

**Install Command:**
```
npm install
```
(hoặc để trống, Vercel sẽ tự động detect)

---

## Bước 3: Cấu hình Environment Variables

Click **"Environment Variables"** và thêm:

### API Configuration

**Key:** `NEXT_PUBLIC_API_BASE_URL`  
**Value:** `https://e-learning-backend-hchr.onrender.com/api`

**Lưu ý:**
- Phải có prefix `NEXT_PUBLIC_` để Next.js expose ra client-side
- URL phải có `/api` ở cuối vì frontend code sử dụng `API_BASE_URL` trực tiếp

---

## Bước 4: Deploy

1. Click **"Deploy"**
2. Vercel sẽ tự động:
   - Clone code từ GitHub
   - Install dependencies
   - Build Next.js app
   - Deploy
3. Đợi 2-5 phút

---

## Bước 5: Lấy URL Vercel

Sau khi deploy xong, bạn sẽ có URL dạng:
```
https://e-learning-frontend.vercel.app
```
(hoặc URL tùy chỉnh nếu bạn đã set)

---

## Bước 6: Cập nhật Backend CORS (QUAN TRỌNG)

Sau khi có URL Vercel, quay lại **Render Dashboard**:

1. Vào Web Service: `e-learning-backend`
2. Vào tab **"Environment"**
3. Cập nhật `ALLOWED_ORIGINS`:
   ```
   https://your-app.vercel.app,http://localhost:3000
   ```
   (Thay `your-app.vercel.app` bằng URL Vercel thực tế)

4. Cập nhật `VNPAY_RETURN_URL`:
   ```
   https://your-app.vercel.app/payment/vnpay-return
   ```

5. Cập nhật `CERTIFICATE_BASE_URL`:
   ```
   https://e-learning-backend-hchr.onrender.com/certificates
   ```

6. Cập nhật `AVATAR_BASE_URL`:
   ```
   https://e-learning-backend-hchr.onrender.com/api/files/avatars
   ```

7. Click **"Save Changes"**
8. Chọn **"Save, rebuild, and deploy"** để redeploy backend

---

## Bước 7: Cập nhật VNPay IPN URL

1. Đăng nhập VNPay Sandbox: https://sandbox.vnpayment.vn/merchantv2/
2. Vào **"Cấu hình"** → **"Cấu hình IPN"**
3. Cập nhật IPN URL:
   ```
   https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn
   ```
4. Click **"Lưu"**

---

## ✅ Test Sau Khi Deploy

### 1. Test Frontend
Mở trình duyệt và truy cập:
```
https://your-app.vercel.app
```

### 2. Test API Connection
- Mở Developer Tools (F12)
- Vào tab **Network**
- Xem các API calls có thành công không
- Kiểm tra xem có lỗi CORS không

### 3. Test Authentication
- Thử đăng nhập/đăng ký
- Kiểm tra xem token có được lưu không

### 4. Test VNPay Payment
- Chọn một khóa học và thanh toán
- Kiểm tra redirect đến VNPay gateway
- Test thanh toán và kiểm tra return về frontend

---

## 🔧 Troubleshooting

### Lỗi Build trên Vercel

**Lỗi:** `Module not found` hoặc `Cannot find module`

**Giải pháp:**
1. Kiểm tra `package.json` có đầy đủ dependencies không
2. Kiểm tra Root Directory có đúng `frontend` không
3. Xem build logs trên Vercel để biết chi tiết

### Lỗi CORS

**Lỗi:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Giải pháp:**
1. Kiểm tra `ALLOWED_ORIGINS` trên Render có đúng URL Vercel không
2. Đảm bảo không có trailing slash
3. Restart service trên Render

### API không kết nối được

**Lỗi:** `Network Error` hoặc `Failed to fetch`

**Giải pháp:**
1. Kiểm tra `NEXT_PUBLIC_API_BASE_URL` trên Vercel có đúng không
2. Kiểm tra backend có đang chạy không (test URL backend trực tiếp)
3. Kiểm tra Network tab trong Developer Tools

---

## 📝 Checklist Hoàn Thành

- [ ] Vercel project đã được tạo
- [ ] Root Directory đã set: `frontend`
- [ ] `NEXT_PUBLIC_API_BASE_URL` đã được set
- [ ] Frontend đã deploy thành công
- [ ] URL Vercel đã được lấy
- [ ] `ALLOWED_ORIGINS` đã được cập nhật trên Render
- [ ] `VNPAY_RETURN_URL` đã được cập nhật trên Render
- [ ] Backend đã được redeploy với CORS mới
- [ ] VNPay IPN URL đã được cập nhật
- [ ] Frontend đã được test và hoạt động

---

## 🎉 Hoàn Thành!

Sau khi hoàn thành tất cả các bước, ứng dụng của bạn sẽ chạy trên:
- **Frontend**: Vercel (https://your-app.vercel.app)
- **Backend**: Render (https://e-learning-backend-hchr.onrender.com)
- **Database**: Aiven MySQL

Chúc bạn deploy thành công! 🚀


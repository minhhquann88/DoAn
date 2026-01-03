# Hướng dẫn Deploy lại Vercel từ đầu

## Bước 1: Xóa Project cũ trên Vercel

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Tìm project `e-learning` trong danh sách
3. Click vào project
4. Vào **Settings** (cài đặt)
5. Scroll xuống cuối trang
6. Tìm section **"Danger Zone"**
7. Click **"Delete Project"**
8. Nhập tên project để xác nhận: `e-learning`
9. Click **"Delete"**

---

## Bước 2: Tạo Project mới

1. Trên Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Chọn repository: `s1cko271/e-learning`
3. Click **"Import"**

---

## Bước 3: Cấu hình Project

### 3.1. Project Settings

- **Project Name**: `e-learning`
- **Framework Preset**: Chọn **"Next.js"** (KHÔNG phải FastAPI!)
- **Root Directory**: Click **"Edit"** và nhập: `frontend`

### 3.2. Build Settings

Sau khi set Root Directory = `frontend`, Vercel sẽ tự động detect Next.js và set:
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

**Lưu ý:** Nếu Vercel không tự detect, hãy set thủ công:
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/.next`
- **Install Command**: `cd frontend && npm install`

---

## Bước 4: Thêm Environment Variables

Click vào section **"Environment Variables"** và thêm:

### 4.1. API URL

```
NEXT_PUBLIC_API_URL=https://e-learning-backend-hchr.onrender.com/api
```

**Lưu ý:** 
- URL backend của bạn: `https://e-learning-backend-hchr.onrender.com`
- Nếu URL khác, thay bằng URL thực tế từ Render Dashboard

### 4.2. Các biến khác (nếu cần)

Nếu frontend cần các biến môi trường khác, thêm vào đây.

---

## Bước 5: Deploy

1. Click **"Deploy"** ở cuối trang
2. Đợi build hoàn thành (thường mất 2-3 phút)
3. Kiểm tra logs để đảm bảo không có lỗi

---

## Bước 6: Kiểm tra Deployment

### 6.1. Kiểm tra Build Logs

1. Vào tab **"Deployments"**
2. Click vào deployment mới nhất
3. Xem **"Build Logs"** để đảm bảo:
   - ✅ `✓ Compiled successfully`
   - ✅ `✓ Linting and checking validity of types`
   - ✅ `✓ Collecting page data`
   - ✅ `✓ Generating static pages`
   - ✅ `✓ Finalizing page optimization`

### 6.2. Kiểm tra URL

1. Vercel sẽ tự động tạo URL: `https://e-learning-xxxxx.vercel.app`
2. Truy cập URL này để test
3. Nếu có custom domain, có thể thêm sau

---

## Bước 7: Cập nhật Backend (Render)

Sau khi có URL Vercel, cần cập nhật trên Render:

1. Vào Render Dashboard
2. Vào Web Service của backend
3. Vào **Environment** tab
4. Cập nhật `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://e-learning-xxxxx.vercel.app,http://localhost:3000
   ```
5. Cập nhật `VNPAY_RETURN_URL`:
   ```
   VNPAY_RETURN_URL=https://e-learning-xxxxx.vercel.app/payment/vnpay-return
   ```
6. Click **"Save Changes"**
7. Render sẽ tự động restart service

---

## Bước 8: Cập nhật VNPay Dashboard

1. Đăng nhập VNPay Sandbox: https://sandbox.vnpayment.vn/merchantv2/
2. Vào **"Cấu hình"** → **"Cấu hình IPN"**
3. IPN URL đã đúng: `https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn`
4. Return URL sẽ được set tự động từ backend

---

## ✅ Checklist

- [ ] Đã xóa project cũ trên Vercel
- [ ] Đã tạo project mới
- [ ] Framework Preset = **Next.js** (KHÔNG phải FastAPI)
- [ ] Root Directory = `frontend`
- [ ] Build Command = `npm run build` (hoặc `cd frontend && npm run build`)
- [ ] Output Directory = `.next` (hoặc `frontend/.next`)
- [ ] Install Command = `npm install` (hoặc `cd frontend && npm install`)
- [ ] Đã thêm `NEXT_PUBLIC_API_URL` environment variable
- [ ] Build thành công trên Vercel
- [ ] Đã cập nhật `ALLOWED_ORIGINS` trên Render
- [ ] Đã cập nhật `VNPAY_RETURN_URL` trên Render
- [ ] Đã test frontend hoạt động

---

## 🔧 Troubleshooting

### Lỗi: Framework Preset = FastAPI

**Nguyên nhân:** Vercel detect sai framework

**Giải pháp:**
1. Set **Root Directory** = `frontend` trước
2. Sau đó Vercel sẽ tự detect Next.js
3. Nếu vẫn sai, chọn thủ công: **Framework Preset** = **Next.js**

### Lỗi: Build failed - "No Next.js version detected"

**Nguyên nhân:** Root Directory chưa đúng

**Giải pháp:**
1. Kiểm tra **Root Directory** = `frontend` (không có dấu `/` ở đầu)
2. Đảm bảo `frontend/package.json` có `next` trong dependencies

### Lỗi: TypeScript errors

**Giải pháp:**
- Đã sửa tất cả lỗi TypeScript trong code
- Nếu còn lỗi, gửi log để sửa tiếp

---

## 🎉 Hoàn thành!

Sau khi hoàn thành, frontend sẽ chạy trên Vercel và kết nối với backend trên Render!


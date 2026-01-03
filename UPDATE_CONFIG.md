# Hướng dẫn Cập nhật Cấu hình sau khi Deploy Vercel

## URL Vercel của bạn:
```
https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app
```

## URL Backend Render của bạn:
```
https://e-learning-backend-hchr.onrender.com
```

---

## Bước 1: Cập nhật Environment Variables trên Vercel

1. Vào Vercel Dashboard: https://vercel.com/dashboard
2. Vào project `e-learning`
3. Vào **Settings** → **Environment Variables**
4. Thêm/Sửa biến sau:

### NEXT_PUBLIC_API_URL
```
Key: NEXT_PUBLIC_API_URL
Value: https://e-learning-backend-hchr.onrender.com/api
Environment: Production, Preview, Development (chọn tất cả)
```

5. Click **Save**
6. Vercel sẽ tự động redeploy với biến mới

---

## Bước 2: Cập nhật Environment Variables trên Render

1. Vào Render Dashboard: https://dashboard.render.com/
2. Vào Web Service `e-learning-backend`
3. Vào tab **Environment**
4. Tìm và sửa các biến sau:

### ALLOWED_ORIGINS
```
Key: ALLOWED_ORIGINS
Value: https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app,http://localhost:3000
```

### VNPAY_RETURN_URL
```
Key: VNPAY_RETURN_URL
Value: https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app/payment/vnpay-return
```

### VNPAY_IPN_URL (nếu chưa có)
```
Key: VNPAY_IPN_URL
Value: https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn
```

### CERTIFICATE_BASE_URL (nếu chưa có)
```
Key: CERTIFICATE_BASE_URL
Value: https://e-learning-backend-hchr.onrender.com/certificates
```

### AVATAR_BASE_URL (nếu chưa có)
```
Key: AVATAR_BASE_URL
Value: https://e-learning-backend-hchr.onrender.com/api/files/avatars
```

5. Click **Save Changes** ở cuối trang
6. Render sẽ tự động restart service

---

## Bước 3: Kiểm tra Backend đã nhận cấu hình mới

1. Vào tab **Logs** trên Render
2. Kiểm tra xem service đã restart chưa
3. Tìm log: `Application started successfully`
4. Kiểm tra log có hiển thị `ALLOWED_ORIGINS` mới không

---

## Bước 4: Test kết nối

### Test Backend API:
```bash
curl https://e-learning-backend-hchr.onrender.com/api/v1/courses
```

### Test Frontend:
1. Truy cập: https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app
2. Kiểm tra xem frontend có load được không
3. Thử đăng nhập/đăng ký
4. Kiểm tra console (F12) xem có lỗi CORS không

---

## Bước 5: Cập nhật VNPay Dashboard (nếu cần)

1. Đăng nhập VNPay Sandbox: https://sandbox.vnpayment.vn/merchantv2/
2. Vào **"Cấu hình"** → **"Cấu hình IPN"**
3. IPN URL đã đúng: `https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn`
4. Return URL sẽ được set tự động từ backend (không cần set trên VNPay Dashboard)

---

## ✅ Checklist

- [ ] Đã thêm `NEXT_PUBLIC_API_URL` trên Vercel
- [ ] Đã cập nhật `ALLOWED_ORIGINS` trên Render
- [ ] Đã cập nhật `VNPAY_RETURN_URL` trên Render
- [ ] Render service đã restart thành công
- [ ] Đã test frontend hoạt động
- [ ] Đã test backend API hoạt động
- [ ] Đã test thanh toán VNPay (nếu có)

---

## 🔧 Troubleshooting

### Lỗi CORS trên Frontend

**Triệu chứng:** Console hiển thị `Access to fetch at '...' has been blocked by CORS policy`

**Giải pháp:**
1. Kiểm tra `ALLOWED_ORIGINS` trên Render có đúng URL Vercel không
2. Đảm bảo không có trailing slash (`/`) ở cuối URL
3. Restart service trên Render
4. Clear cache và reload trang

### Frontend không kết nối được Backend

**Triệu chứng:** Frontend hiển thị lỗi kết nối

**Giải pháp:**
1. Kiểm tra `NEXT_PUBLIC_API_URL` trên Vercel có đúng không
2. Kiểm tra backend có đang chạy không (test URL backend trực tiếp)
3. Kiểm tra firewall/security rules trên Render

---

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước, ứng dụng của bạn sẽ chạy trên:
- **Frontend**: https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app
- **Backend**: https://e-learning-backend-hchr.onrender.com
- **Database**: Aiven MySQL

Chúc bạn deploy thành công! 🚀


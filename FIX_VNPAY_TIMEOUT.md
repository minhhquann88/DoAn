# 🔧 Sửa lỗi VNPay Timeout

## ❌ Lỗi hiện tại

Khi thanh toán VNPay, gặp lỗi:
```
Giao dịch đã quá thời gian chờ thanh toán. 
Quý khách vui lòng thực hiện lại giao dịch.
```

## ✅ Các bước sửa

### 1. Cập nhật biến môi trường trên Render

Vào Render Dashboard → Web Service `e-learning-backend` → Environment:

**Cập nhật `VNPAY_RETURN_URL`:**
```
VNPAY_RETURN_URL=https://e-learning-git-main-s1cko271s-projects.vercel.app/payment/vnpay-return
```

**Lưu ý:** Thay URL trên bằng URL Vercel thực tế của bạn.

### 2. Kiểm tra IPN URL trên VNPay Dashboard

**QUAN TRỌNG:** IPN URL phải được cấu hình đúng trên VNPay Dashboard.

#### Các bước:

1. **Đăng nhập VNPay Dashboard:**
   - URL: https://sandbox.vnpayment.vn/merchantv2/
   - Email: baophuc2712003@gmail.com

2. **Tìm cấu hình IPN URL:**
   - Vào **"Thông tin tài khoản"** (góc trên bên phải)
   - Chọn Terminal có **TmnCode: PISGV29M**
   - Click **chỉnh sửa** (biểu tượng cây bút ✏️)
   - Tìm phần **"URL IPN"** hoặc **"IPN URL"**

3. **Nhập IPN URL:**
   ```
   https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn
   ```
   
   **Lưu ý:** 
   - Thay `e-learning-backend-hchr.onrender.com` bằng URL backend thực tế của bạn trên Render
   - URL phải bắt đầu bằng `https://`
   - Phải có endpoint `/api/v1/vnpay/ipn` ở cuối

4. **Lưu cấu hình**

5. **Test IPN:**
   - Click nút **"Test call IPN"** (nếu có)
   - Kiểm tra logs trên Render xem có nhận được request không

### 3. Kiểm tra Return URL

Return URL phải trỏ về frontend Vercel, không phải localhost:

```
https://e-learning-git-main-s1cko271s-projects.vercel.app/payment/vnpay-return
```

### 4. Các thay đổi đã thực hiện

✅ **Code đã được cập nhật:**
- `VNPayService`: Đọc `VNPAY_RETURN_URL` từ biến môi trường
- `PaymentService`: Dùng return URL từ `VNPayService` thay vì hardcode
- `CartService`: Dùng return URL từ `VNPayService` thay vì hardcode
- Timeout tăng từ 15 phút lên 30 phút

### 5. Sau khi cập nhật

1. **Restart backend trên Render:**
   - Vào Render Dashboard
   - Click **Manual Deploy** → **Deploy latest commit**

2. **Kiểm tra logs:**
   - Xem logs trên Render để đảm bảo không có lỗi
   - Kiểm tra xem Return URL có đúng không

3. **Test lại thanh toán:**
   - Thử mua khóa học
   - Chọn thanh toán VNPay
   - Kiểm tra xem có còn lỗi timeout không

## 📝 Checklist

- [ ] Đã cập nhật `VNPAY_RETURN_URL` trên Render với URL Vercel đúng
- [ ] Đã kiểm tra IPN URL trên VNPay Dashboard
- [ ] IPN URL trỏ đến: `https://your-backend.onrender.com/api/v1/vnpay/ipn`
- [ ] Đã test IPN call (nếu có nút test)
- [ ] Đã restart backend trên Render
- [ ] Đã test lại thanh toán

## ⚠️ Lưu ý

- **IPN URL** phải là HTTPS (Render tự động cung cấp HTTPS)
- **Return URL** phải là URL Vercel thực tế, không phải localhost
- Nếu vẫn lỗi, kiểm tra logs trên Render để xem có lỗi gì khác không


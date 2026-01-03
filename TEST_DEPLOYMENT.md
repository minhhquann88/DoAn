# Hướng dẫn Test Deployment sau khi cập nhật cấu hình

## ✅ Checklist cấu hình đã hoàn thành

- [x] Đã cập nhật Render Environment Variables với URL Vercel
- [ ] Đã cập nhật Vercel Environment Variables với URL Render
- [ ] Đã test kết nối frontend ↔ backend
- [ ] Đã test chức năng đăng nhập/đăng ký
- [ ] Đã test thanh toán VNPay (nếu có)

---

## Bước 1: Kiểm tra Vercel Environment Variables

### ⚠️ QUAN TRỌNG: Frontend sử dụng `NEXT_PUBLIC_API_BASE_URL` (không phải `NEXT_PUBLIC_API_URL`)

1. Vào Vercel Dashboard: https://vercel.com/dashboard
2. Vào project `e-learning`
3. Vào **Settings** → **Environment Variables**
4. Kiểm tra xem có biến sau chưa:

```
Key: NEXT_PUBLIC_API_BASE_URL
Value: https://e-learning-backend-hchr.onrender.com/api
Environment: Production, Preview, Development (chọn tất cả)
```

**Nếu chưa có hoặc giá trị sai:**
- Thêm/Sửa biến này
- Click **Save**
- Vercel sẽ tự động redeploy

---

## Bước 2: Kiểm tra Render Service đã restart

1. Vào Render Dashboard: https://dashboard.render.com/
2. Vào Web Service `e-learning-backend`
3. Vào tab **Logs**
4. Kiểm tra:
   - Service đã restart sau khi cập nhật environment variables
   - Log hiển thị: `Application started successfully`
   - Không có lỗi CORS hoặc database connection

---

## Bước 3: Test Backend API trực tiếp

### Test 1: Health Check
```bash
curl https://e-learning-backend-hchr.onrender.com/api/v1/courses
```

**Kết quả mong đợi:**
- Status code: 200
- Response: JSON array hoặc object

### Test 2: Kiểm tra CORS Headers
Mở browser console và chạy:
```javascript
fetch('https://e-learning-backend-hchr.onrender.com/api/v1/courses')
  .then(r => {
    console.log('Status:', r.status);
    console.log('CORS Headers:', {
      'access-control-allow-origin': r.headers.get('access-control-allow-origin'),
      'access-control-allow-credentials': r.headers.get('access-control-allow-credentials')
    });
    return r.json();
  })
  .then(data => console.log('Data:', data))
  .catch(err => console.error('Error:', err));
```

**Kết quả mong đợi:**
- `access-control-allow-origin` phải chứa URL Vercel của bạn
- Không có lỗi CORS trong console

---

## Bước 4: Test Frontend

### Test 1: Truy cập trang chủ
1. Mở: https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app
2. Kiểm tra:
   - Trang load được không
   - Không có lỗi trong console (F12)
   - Không có lỗi network (tab Network trong DevTools)

### Test 2: Test API Connection
1. Mở DevTools (F12) → Console
2. Chạy lệnh:
```javascript
fetch('/api/v1/courses')
  .then(r => r.json())
  .then(data => console.log('Courses:', data))
  .catch(err => console.error('Error:', err));
```

**Lưu ý:** Lệnh này sẽ gọi API thông qua frontend, nên cần kiểm tra xem `NEXT_PUBLIC_API_BASE_URL` đã được set đúng chưa.

### Test 3: Test đăng nhập
1. Vào trang đăng nhập
2. Thử đăng nhập với tài khoản test
3. Kiểm tra:
   - Đăng nhập thành công
   - Redirect đến dashboard
   - Token được lưu trong localStorage

### Test 4: Test đăng ký
1. Vào trang đăng ký
2. Điền form và submit
3. Kiểm tra:
   - Đăng ký thành công
   - Nhận được email xác nhận (nếu có)
   - Có thể đăng nhập với tài khoản mới

---

## Bước 5: Test thanh toán VNPay (nếu có)

### Test 1: Tạo giao dịch thanh toán
1. Đăng nhập vào tài khoản
2. Vào trang khóa học
3. Click "Mua khóa học" hoặc "Thanh toán"
4. Kiểm tra:
   - Redirect đến VNPay gateway
   - URL chứa các tham số VNPay

### Test 2: Test Return URL
1. Sau khi thanh toán (hoặc cancel), VNPay sẽ redirect về:
   `https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app/payment/vnpay-return`
2. Kiểm tra:
   - Trang hiển thị kết quả thanh toán
   - Không có lỗi trong console
   - Transaction được cập nhật trong database

### Test 3: Test IPN Callback
1. Vào VNPay Sandbox Dashboard: https://sandbox.vnpayment.vn/merchantv2/
2. Vào **"Cấu hình"** → **"Cấu hình IPN"**
3. Kiểm tra IPN URL: `https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn`
4. Click **"Test call IPN"**
5. Vào Render Logs và kiểm tra:
   - IPN request được nhận
   - Response trả về `RspCode: "00"` hoặc `RspCode: "02"`

---

## Bước 6: Kiểm tra các chức năng chính

### ✅ Checklist chức năng

- [ ] **Trang chủ**: Load được, hiển thị danh sách khóa học
- [ ] **Đăng nhập**: Hoạt động, lưu token
- [ ] **Đăng ký**: Hoạt động, gửi email
- [ ] **Dashboard**: Load được, hiển thị thống kê
- [ ] **Khóa học**: Xem được danh sách, chi tiết
- [ ] **Thanh toán**: Tạo được giao dịch, redirect VNPay
- [ ] **VNPay Return**: Hiển thị kết quả thanh toán
- [ ] **Chat**: Kết nối WebSocket (nếu có)
- [ ] **Upload file**: Upload avatar, video (nếu có)

---

## 🔧 Troubleshooting

### Lỗi: Frontend không kết nối được Backend

**Triệu chứng:**
- Console hiển thị: `Failed to fetch` hoặc `Network Error`
- API calls trả về 404 hoặc CORS error

**Giải pháp:**
1. Kiểm tra `NEXT_PUBLIC_API_BASE_URL` trên Vercel có đúng không
2. Kiểm tra backend có đang chạy không: https://e-learning-backend-hchr.onrender.com/api/v1/courses
3. Kiểm tra `ALLOWED_ORIGINS` trên Render có chứa URL Vercel không
4. Clear cache và reload trang

### Lỗi: CORS Error

**Triệu chứng:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Giải pháp:**
1. Kiểm tra `ALLOWED_ORIGINS` trên Render:
   ```
   https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app,http://localhost:3000
   ```
2. Đảm bảo không có trailing slash (`/`) ở cuối URL
3. Restart service trên Render
4. Clear browser cache

### Lỗi: 404 Not Found

**Triệu chứng:**
- API calls trả về 404
- Backend logs không hiển thị request

**Giải pháp:**
1. Kiểm tra URL backend có đúng không
2. Kiểm tra route API có tồn tại không
3. Kiểm tra `NEXT_PUBLIC_API_BASE_URL` có đúng format không (phải kết thúc bằng `/api`)

### Lỗi: VNPay Return URL không hoạt động

**Triệu chứng:**
- Sau khi thanh toán, redirect về trang lỗi
- Console hiển thị lỗi khi load `/payment/vnpay-return`

**Giải pháp:**
1. Kiểm tra `VNPAY_RETURN_URL` trên Render có đúng không
2. Kiểm tra route `/payment/vnpay-return` có tồn tại trong frontend không
3. Kiểm tra backend endpoint `/api/v1/vnpay/return` có hoạt động không

---

## 📊 Kiểm tra Performance

### Test Load Time
1. Mở DevTools → Network tab
2. Reload trang
3. Kiểm tra:
   - Time to First Byte (TTFB) < 1s
   - Total load time < 3s
   - API calls < 500ms

### Test Mobile Responsive
1. Mở DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Test trên các kích thước màn hình khác nhau
3. Kiểm tra UI hiển thị đúng

---

## 🎉 Hoàn thành!

Sau khi test tất cả các bước trên, ứng dụng của bạn đã sẵn sàng để demo!

**URLs:**
- **Frontend**: https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app
- **Backend**: https://e-learning-backend-hchr.onrender.com
- **Database**: Aiven MySQL

**Lưu ý:**
- Render free tier có thể sleep sau 15 phút không có traffic
- Lần đầu truy cập sau khi sleep có thể mất 30-60 giây để wake up
- Vercel có giới hạn bandwidth cho free tier

Chúc bạn demo thành công! 🚀


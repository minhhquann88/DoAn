# 🔍 Debug VNPay Timeout - Hướng dẫn chi tiết

## ❌ Vấn đề

VNPay vẫn báo lỗi timeout sau khi đã cập nhật Return URL và timeout.

## 🔍 Nguyên nhân có thể

Lỗi timeout thường xảy ra khi:
1. **IPN URL chưa được cấu hình** trên VNPay Dashboard
2. **IPN URL không accessible** từ VNPay server
3. **IPN callback trả về lỗi** (RspCode != "00")
4. **Backend không nhận được IPN callback** do firewall/CORS

## ✅ Các bước kiểm tra và sửa

### Bước 1: Kiểm tra IPN URL trên VNPay Dashboard

**QUAN TRỌNG NHẤT:** IPN URL phải được cấu hình đúng trên VNPay Dashboard.

#### 1.1. Đăng nhập VNPay Dashboard

1. Truy cập: https://sandbox.vnpayment.vn/merchantv2/
2. Đăng nhập với:
   - Email: baophuc2712003@gmail.com
   - Password: (password của bạn)

#### 1.2. Tìm cấu hình IPN URL

**Cách 1: Qua "Thông tin tài khoản"**
1. Click vào **"Thông tin tài khoản"** (góc trên bên phải)
2. Tìm Terminal có **TmnCode: PISGV29M**
3. Click **biểu tượng chỉnh sửa** (✏️) ở bên phải
4. Tìm phần **"URL IPN"** hoặc **"IPN URL"**

**Cách 2: Qua "Cài đặt thông báo"**
1. Vào menu bên trái: **CÔNG CỤ** → **Cài đặt thông báo**
2. Tìm phần **"IPN URL"** hoặc **"URL thông báo kết quả"**

#### 1.3. Kiểm tra IPN URL hiện tại

IPN URL phải là:
```
https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn
```

**Kiểm tra:**
- ✅ Bắt đầu bằng `https://` (KHÔNG phải `http://`)
- ✅ Có domain Render: `e-learning-backend-hchr.onrender.com`
- ✅ Có endpoint: `/api/v1/vnpay/ipn`
- ✅ KHÔNG có trailing slash ở cuối
- ✅ KHÔNG có khoảng trắng

**Nếu chưa có hoặc sai:**
1. Nhập/sửa IPN URL: `https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn`
2. **Lưu ý:** Thay `e-learning-backend-hchr.onrender.com` bằng URL backend thực tế của bạn
3. Click **"Lưu"** hoặc **"Hoàn thành"**

#### 1.4. Test IPN URL (nếu có nút test)

1. Click nút **"Test call IPN"** hoặc **"Kiểm tra IPN"** (nếu có)
2. Kiểm tra logs trên Render xem có nhận được request không

### Bước 2: Kiểm tra Backend có nhận được IPN callback không

#### 2.1. Xem logs trên Render

1. Vào Render Dashboard: https://dashboard.render.com/
2. Vào Web Service `e-learning-backend`
3. Vào tab **Logs**
4. Tìm các log sau khi thực hiện thanh toán:
   ```
   VNPay IPN Callback Received
   ```

**Nếu KHÔNG thấy log này:**
- IPN URL chưa được cấu hình đúng trên VNPay Dashboard
- Hoặc VNPay không thể gọi đến IPN URL (firewall/network issue)

**Nếu THẤY log nhưng có lỗi:**
- Kiểm tra lỗi trong logs
- Có thể là lỗi signature verification hoặc database update

### Bước 3: Kiểm tra Return URL trên Render

1. Vào Render Dashboard → Web Service `e-learning-backend` → Environment
2. Kiểm tra biến `VNPAY_RETURN_URL`:
   ```
   VNPAY_RETURN_URL=https://e-learning-git-main-s1cko271s-projects.vercel.app/payment/vnpay-return
   ```
3. **Lưu ý:** Thay bằng URL Vercel thực tế của bạn

### Bước 4: Test IPN URL trực tiếp

#### 4.1. Test bằng curl

```bash
curl "https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn"
```

**Kết quả mong đợi:**
```json
{"RspCode":"00","Message":"Test call received successfully"}
```

**Nếu không có response hoặc lỗi:**
- Backend không accessible
- Kiểm tra logs trên Render

#### 4.2. Test với tham số (simulate VNPay callback)

```bash
curl "https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn?vnp_TxnRef=TEST123&vnp_ResponseCode=00&vnp_Amount=1000000&vnp_SecureHash=test"
```

**Lưu ý:** SecureHash này sẽ fail verification, nhưng endpoint phải trả về response.

### Bước 5: Kiểm tra cấu hình VNPay trong code

Đảm bảo các biến môi trường đã được cấu hình:

```
VNPAY_TMN_CODE=PISGV29M
VNPAY_HASH_SECRET=DRC0V9AAYA651P2SID7SVYRY46HND1H4
VNPAY_RETURN_URL=https://your-vercel-url.vercel.app/payment/vnpay-return
```

### Bước 6: Restart Backend

Sau khi cập nhật cấu hình:
1. Vào Render Dashboard
2. Click **Manual Deploy** → **Deploy latest commit**
3. Hoặc click **Restart** service

## 🔍 Debug Checklist

- [ ] Đã kiểm tra IPN URL trên VNPay Dashboard
- [ ] IPN URL = `https://your-backend.onrender.com/api/v1/vnpay/ipn`
- [ ] Đã test IPN URL bằng curl → trả về `{"RspCode":"00",...}`
- [ ] Đã kiểm tra logs trên Render → thấy "VNPay IPN Callback Received"
- [ ] Đã kiểm tra `VNPAY_RETURN_URL` trên Render
- [ ] Đã restart backend sau khi cập nhật
- [ ] Đã test lại thanh toán

## ⚠️ Lưu ý quan trọng

1. **IPN URL là BẮT BUỘC:**
   - VNPay sẽ gọi IPN URL để thông báo kết quả thanh toán
   - Nếu IPN URL không được cấu hình hoặc không accessible → timeout

2. **IPN URL phải trả về RspCode "00":**
   - Nếu trả về lỗi (RspCode != "00"), VNPay sẽ retry
   - Nếu retry nhiều lần vẫn lỗi → timeout

3. **Return URL vs IPN URL:**
   - **Return URL**: Browser redirect → có thể dùng localhost (development)
   - **IPN URL**: Server-to-server → PHẢI là public URL (HTTPS)

4. **Timeout 30 phút:**
   - Đã tăng timeout lên 30 phút trong code
   - Nhưng nếu IPN URL không hoạt động, vẫn sẽ timeout

## 🎯 Giải pháp nhanh

**Nếu vẫn timeout sau khi kiểm tra tất cả:**

1. **Kiểm tra lại IPN URL trên VNPay Dashboard:**
   - Đảm bảo đã nhập đúng: `https://your-backend.onrender.com/api/v1/vnpay/ipn`
   - Click "Lưu" để lưu cấu hình

2. **Test IPN URL:**
   ```bash
   curl "https://your-backend.onrender.com/api/v1/vnpay/ipn"
   ```
   Phải trả về: `{"RspCode":"00","Message":"Test call received successfully"}`

3. **Xem logs trên Render:**
   - Thực hiện thanh toán
   - Xem logs có "VNPay IPN Callback Received" không
   - Nếu không có → IPN URL chưa được cấu hình đúng

4. **Liên hệ VNPay Support:**
   - Nếu đã kiểm tra tất cả nhưng vẫn lỗi
   - Email: hotrovnpay@vnpay.vn
   - Hotline: *3388 / 024 38 291 291

## 📞 Thông tin liên hệ VNPay

- **Email:** hotrovnpay@vnpay.vn
- **Hotline:** *3388 / 024 38 291 291
- **Dashboard:** https://sandbox.vnpayment.vn/merchantv2/


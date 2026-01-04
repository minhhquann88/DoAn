# ✅ Checklist Test Trước Khi Commit và Deploy

## 🎯 Mục đích

Test tất cả các chức năng quan trọng **trên local** trước khi commit và deploy lên Render/Vercel để tránh phải đợi redeploy nhiều lần.

---

## 📋 Checklist Test

### 1. ✅ Backend - Khởi động và kết nối

- [ ] Backend khởi động thành công (port 8080)
- [ ] Kết nối database thành công
- [ ] Không có lỗi trong logs khi start
- [ ] Health check: `http://localhost:8080/api/v1/courses` trả về 200

### 2. ✅ API Endpoints - Test các endpoint quan trọng

#### Public Endpoints (không cần auth):
- [ ] `GET /api/v1/courses` - Lấy danh sách khóa học
- [ ] `GET /api/v1/courses/featured` - Lấy khóa học nổi bật
- [ ] `GET /api/v1/categories` - Lấy danh sách danh mục
- [ ] `GET /api/v1/vnpay/ipn` - Test IPN endpoint (trả về `{"RspCode":"00",...}`)

#### Auth Endpoints:
- [ ] `POST /api/auth/login` - Đăng nhập
- [ ] `POST /api/auth/register` - Đăng ký
- [ ] `GET /api/auth/me` - Lấy thông tin user (cần token)

#### Protected Endpoints (cần auth):
- [ ] `GET /api/v1/users/profile` - Lấy profile
- [ ] `POST /api/v1/payment/create` - Tạo payment
- [ ] `GET /api/v1/transactions` - Lấy danh sách giao dịch

### 3. ✅ VNPay Integration

- [ ] Tạo payment URL thành công
- [ ] Payment URL có đúng format VNPay
- [ ] Return URL đúng (từ biến môi trường hoặc default)
- [ ] IPN endpoint accessible và trả về đúng format
- [ ] Signature verification hoạt động (test với params hợp lệ)

### 4. ✅ File Upload

- [ ] Upload avatar thành công
- [ ] Upload course image thành công
- [ ] File được lưu đúng path
- [ ] File URL trả về đúng format
- [ ] Có thể access file qua URL: `/api/files/avatars/{filename}`

### 5. ✅ Frontend (nếu test full stack)

- [ ] Frontend khởi động thành công (port 3000)
- [ ] Kết nối được với backend API
- [ ] Đăng nhập/đăng ký hoạt động
- [ ] Hiển thị danh sách khóa học
- [ ] Upload ảnh hoạt động
- [ ] Thanh toán redirect đến VNPay (test local với ngrok)

### 6. ✅ Code Quality

- [ ] Code compile không lỗi: `mvnw clean compile`
- [ ] Không có lỗi linter nghiêm trọng
- [ ] Không có unused imports
- [ ] Không có hardcoded values (dùng biến môi trường)

### 7. ✅ Database

- [ ] Database migration chạy thành công
- [ ] Không có lỗi constraint violation
- [ ] Data seeding (nếu có) chạy thành công

---

## 🚀 Cách Test Nhanh

### Option 1: Dùng Script PowerShell

```powershell
.\test-local.ps1
```

Script sẽ tự động:
- Kiểm tra backend/frontend có chạy không
- Test các endpoint quan trọng
- Kiểm tra compile
- Báo kết quả tổng thể

### Option 2: Test Thủ Công

1. **Start Backend:**
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

2. **Test Endpoints:**
   ```powershell
   # Test courses
   curl http://localhost:8080/api/v1/courses
   
   # Test IPN
   curl http://localhost:8080/api/v1/vnpay/ipn
   ```

3. **Check Logs:**
   - Xem logs backend có lỗi không
   - Kiểm tra database connection

---

## 📝 Workflow Đề Xuất

### 1. Development Phase
```
1. Sửa code
2. Test local (chạy test-local.ps1)
3. Sửa lỗi nếu có
4. Lặp lại cho đến khi tất cả test pass
```

### 2. Commit Phase
```
1. Review code changes
2. Chạy test-local.ps1 lần cuối
3. Commit với message rõ ràng
4. Push lên repo
```

### 3. Deploy Phase
```
1. Render/Vercel tự động deploy
2. Kiểm tra logs trên Render
3. Test trên production (nếu cần)
```

---

## ⚠️ Lưu Ý

1. **Test Local ≠ Production:**
   - Một số thứ chỉ test được trên production (VD: VNPay IPN thực tế)
   - Nhưng test local giúp catch 90% lỗi trước khi deploy

2. **Environment Variables:**
   - Đảm bảo có file `application.properties` với config đúng
   - Hoặc set biến môi trường trước khi chạy

3. **Database:**
   - Có thể dùng database local hoặc database production (nếu cho phép)
   - Nhưng cẩn thận khi test với production DB!

4. **VNPay:**
   - Test local cần ngrok để test IPN callback thực tế
   - Hoặc chỉ test tạo payment URL và signature verification

---

## 🎯 Kết Quả Mong Đợi

Sau khi chạy checklist này:
- ✅ Tất cả test pass → **An toàn để commit và deploy**
- ❌ Có test fail → **Sửa lỗi trước khi commit**

Điều này giúp:
- ⏱️ Tiết kiệm thời gian (không phải đợi redeploy nhiều lần)
- 🐛 Catch lỗi sớm (trước khi deploy)
- 🚀 Deploy tự tin hơn (biết chắc code hoạt động)


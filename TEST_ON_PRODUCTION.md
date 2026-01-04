# 🧪 Test Trên Môi Trường Deploy (Production)

## 🎯 Mục đích

Test trực tiếp trên môi trường production (Render/Vercel) để phát hiện lỗi thực tế, nhưng **không commit liên tục** để tránh phải đợi redeploy nhiều lần.

---

## 🚀 Workflow Đề Xuất

### Option 1: Dùng Feature Branch (Khuyến nghị)

```bash
# 1. Tạo branch mới cho feature/fix
git checkout -b feature/fix-vnpay-timeout

# 2. Sửa code (có thể sửa nhiều lần)
# ... sửa code ...

# 3. Test local nhanh (compile, syntax check)
cd backend
mvnw clean compile

# 4. Commit tất cả thay đổi một lần
git add .
git commit -m "fix: VNPay timeout và image upload issues"

# 5. Push lên branch
git push origin feature/fix-vnpay-timeout

# 6. Merge vào deploy branch
git checkout deploy
git merge feature/fix-vnpay-timeout

# 7. Push để trigger deploy
git push origin deploy
```

**Lợi ích:**
- ✅ Sửa nhiều lần nhưng chỉ commit 1 lần
- ✅ Test trên production sau khi deploy
- ✅ Có thể rollback dễ dàng nếu cần

### Option 2: Commit Tất Cả Một Lần

```bash
# 1. Sửa code (có thể sửa nhiều file, nhiều lần)
# ... sửa code ...

# 2. Khi đã sửa xong tất cả, commit một lần
git add .
git commit -m "fix: Multiple fixes - VNPay, image upload, security"

# 3. Push và deploy
git push origin deploy
```

**Lưu ý:** 
- Sửa code nhiều lần nhưng **KHÔNG commit** cho đến khi sẵn sàng
- Chỉ commit khi đã sửa xong tất cả hoặc đã test đủ

### Option 3: Dùng Git Stash

```bash
# 1. Sửa code lần 1
# ... sửa code ...

# 2. Stash thay đổi
git stash save "WIP: Fix VNPay timeout"

# 3. Sửa code lần 2
# ... sửa code ...

# 4. Stash tiếp
git stash save "WIP: Fix image upload"

# 5. Khi đã sửa xong tất cả, apply tất cả stash
git stash pop
git stash pop

# 6. Commit một lần
git add .
git commit -m "fix: VNPay timeout và image upload"

# 7. Push và deploy
git push origin deploy
```

---

## 📋 Checklist Trước Khi Commit

Trước khi commit và push, đảm bảo:

- [ ] Đã sửa xong tất cả các lỗi cần sửa
- [ ] Code compile không lỗi (ít nhất syntax check)
- [ ] Đã review code changes
- [ ] Commit message rõ ràng, mô tả đúng thay đổi
- [ ] Sẵn sàng để test trên production

**KHÔNG commit nếu:**
- ❌ Chưa sửa xong
- ❌ Code còn lỗi syntax rõ ràng
- ❌ Chưa chắc chắn về thay đổi

---

## 🧪 Test Trên Production

Sau khi deploy lên Render/Vercel:

### 1. Kiểm Tra Logs

```bash
# Vào Render Dashboard → Logs
# Kiểm tra:
- Backend start thành công
- Không có exception nghiêm trọng
- Database connection OK
```

### 2. Test Các Endpoint Quan Trọng

```bash
# Test IPN endpoint
curl https://e-learning-backend-hchr.onrender.com/api/v1/vnpay/ipn

# Test courses
curl https://e-learning-backend-hchr.onrender.com/api/v1/courses/featured
```

### 3. Test Chức Năng Thực Tế

- [ ] Đăng nhập/đăng ký
- [ ] Xem danh sách khóa học
- [ ] Upload ảnh
- [ ] Thanh toán VNPay (nếu có thể test)

### 4. Nếu Có Lỗi

```bash
# Option 1: Sửa tiếp và commit lại (nếu lỗi nhỏ)
# ... sửa code ...
git add .
git commit -m "fix: Additional fix for [lỗi cụ thể]"
git push origin deploy

# Option 2: Rollback nếu lỗi nghiêm trọng
git revert HEAD
git push origin deploy
```

---

## ⚠️ Lưu Ý

1. **Không commit liên tục:**
   - Sửa code nhiều lần nhưng chỉ commit khi đã sửa xong
   - Mỗi lần commit = 1 lần deploy = đợi 5-10 phút

2. **Test trên production:**
   - Một số lỗi chỉ phát hiện trên production (CORS, environment variables, etc.)
   - Test trên production là cần thiết

3. **Commit message rõ ràng:**
   - Mô tả đúng thay đổi
   - Dễ dàng rollback nếu cần

4. **Sử dụng branch:**
   - Feature branch giúp test riêng biệt
   - Có thể merge khi đã test OK

---

## 🎯 Workflow Tối Ưu

```
1. Sửa code (có thể nhiều lần, KHÔNG commit)
   ↓
2. Khi đã sửa xong tất cả → Commit một lần
   ↓
3. Push → Deploy (đợi 5-10 phút)
   ↓
4. Test trên production
   ↓
5. Nếu OK → Done ✅
   Nếu có lỗi → Quay lại bước 1
```

**Thời gian:**
- Sửa code: Tùy
- Commit + Deploy: 1 lần (5-10 phút)
- Test: 2-3 phút
- **Tổng: ~10-15 phút cho 1 cycle thay vì 30-40 phút nếu commit nhiều lần**

---

## ✅ Kết Luận

- ✅ Sửa code nhiều lần nhưng **chỉ commit khi đã sửa xong**
- ✅ Test trên **production** để phát hiện lỗi thực tế
- ✅ Sử dụng **feature branch** hoặc **stash** để quản lý thay đổi
- ✅ **KHÔNG commit liên tục** để tránh đợi deploy nhiều lần


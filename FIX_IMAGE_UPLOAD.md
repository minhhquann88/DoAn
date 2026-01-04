# 🔧 Sửa lỗi không load được ảnh upload

## ❌ Lỗi hiện tại

Ảnh upload không hiển thị được trên frontend.

## ✅ Các thay đổi đã thực hiện

### 1. Cập nhật FileStorageService

Đã sửa để đọc biến môi trường từ Render:
- `AVATAR_BASE_URL` → cho avatar images
- `COURSE_IMAGE_BASE_URL` → cho course images

### 2. Cập nhật Next.js Config

Đã thêm Render URL vào `remotePatterns` để Next.js có thể load ảnh từ Render backend.

## 📝 Cần làm tiếp

### Bước 1: Cập nhật biến môi trường trên Render

Vào Render Dashboard → Web Service `e-learning-backend` → Environment:

**1. Thêm/Sửa `AVATAR_BASE_URL`:**
```
Key: AVATAR_BASE_URL
Value: https://e-learning-backend-hchr.onrender.com/api/files/avatars
```

**2. Thêm/Sửa `COURSE_IMAGE_BASE_URL`:**
```
Key: COURSE_IMAGE_BASE_URL
Value: https://e-learning-backend-hchr.onrender.com/api/files/courses
```

**Lưu ý:** Thay `e-learning-backend-hchr.onrender.com` bằng URL backend thực tế của bạn trên Render.

### Bước 2: Kiểm tra Storage Path

Đảm bảo các biến storage path đã được cấu hình:

```
AVATAR_STORAGE_PATH=/app/uploads/avatars
COURSE_IMAGE_STORAGE_PATH=/app/uploads/courses
```

### Bước 3: Restart Backend

Sau khi cập nhật biến môi trường:
1. Click **Save Changes** trên Render
2. Render sẽ tự động restart service
3. Đợi 1-2 phút để service restart xong

### Bước 4: Redeploy Frontend (nếu cần)

Nếu frontend chưa có cấu hình mới:
1. Vào Vercel Dashboard
2. Click **Redeploy** để deploy lại với config mới

## ✅ Checklist

- [ ] Đã cập nhật `AVATAR_BASE_URL` trên Render
- [ ] Đã cập nhật `COURSE_IMAGE_BASE_URL` trên Render
- [ ] Đã kiểm tra `AVATAR_STORAGE_PATH` và `COURSE_IMAGE_STORAGE_PATH`
- [ ] Đã restart backend trên Render
- [ ] Đã test upload ảnh mới
- [ ] Đã test hiển thị ảnh đã upload

## 🔍 Kiểm tra

### Test 1: Upload ảnh mới

1. Đăng nhập vào frontend
2. Upload ảnh (avatar hoặc course image)
3. Kiểm tra xem ảnh có được lưu và hiển thị không

### Test 2: Kiểm tra URL ảnh

Sau khi upload, kiểm tra URL ảnh trong response:
- Avatar: `https://e-learning-backend-hchr.onrender.com/api/files/avatars/[filename]`
- Course: `https://e-learning-backend-hchr.onrender.com/api/files/courses/[filename]`

### Test 3: Truy cập trực tiếp URL ảnh

Mở URL ảnh trong browser để kiểm tra:
- Nếu load được → Backend đã serve ảnh đúng
- Nếu không load → Kiểm tra logs trên Render

## ⚠️ Lưu ý

1. **Storage Path:**
   - Trên Render, storage path phải là `/app/uploads/...` (absolute path)
   - Không dùng relative path như `./uploads/...`

2. **Base URL:**
   - Phải là URL đầy đủ với `https://`
   - Phải có endpoint `/api/files/...` ở cuối

3. **CORS:**
   - Đảm bảo `ALLOWED_ORIGINS` đã bao gồm URL Vercel
   - Endpoint `/api/files/**` đã được permitAll trong WebSecurityConfig

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước, ảnh upload sẽ hiển thị bình thường trên frontend.


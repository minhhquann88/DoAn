# Sửa lỗi Environment Variable trên Vercel

## ❌ Vấn đề

Bạn đã set biến môi trường với tên **SAI**:
- ❌ `NEXT_PUBLIC_API_URL` (sai)
- ✅ `NEXT_PUBLIC_API_BASE_URL` (đúng)

## ✅ Cách sửa

### Cách 1: Sửa tên biến hiện có (Khuyến nghị)

1. Vào Vercel Dashboard: https://vercel.com/dashboard
2. Vào project `e-learning`
3. Vào **Settings** → **Environment Variables**
4. Click vào biến `NEXT_PUBLIC_API_URL`
5. Sửa **Name** từ `NEXT_PUBLIC_API_URL` thành `NEXT_PUBLIC_API_BASE_URL`
6. Giữ nguyên **Value**: `https://e-learning-backend-hchr.onrender.com/api`
7. Click **Save**

### Cách 2: Xóa và tạo mới

1. Xóa biến `NEXT_PUBLIC_API_URL` cũ
2. Click **"Create new"**
3. Điền:
   - **Key**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://e-learning-backend-hchr.onrender.com/api`
   - **Environments**: Chọn "All Environments"
4. Click **Save**

## 🔄 Sau khi sửa

1. Vercel sẽ tự động **redeploy** với biến mới
2. Đợi 2-3 phút để deploy xong
3. Test lại frontend: https://e-learning-3yk718cx4-s1cko271s-projects.vercel.app
4. Kiểm tra console (F12) xem có lỗi kết nối API không

## ✅ Kiểm tra

Sau khi sửa, trong Vercel Environment Variables phải có:
- ✅ `NEXT_PUBLIC_API_BASE_URL` = `https://e-learning-backend-hchr.onrender.com/api`

Không còn:
- ❌ `NEXT_PUBLIC_API_URL`

## 📝 Lưu ý

Frontend code sử dụng:
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
```

Vì vậy **BẮT BUỘC** phải dùng tên `NEXT_PUBLIC_API_BASE_URL` (không phải `NEXT_PUBLIC_API_URL`).


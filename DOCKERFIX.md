# 🔧 Đã Sửa Dockerfile

## ❌ Lỗi:
```
error: failed to solve: openjdk:21-jdk-slim: failed to resolve source metadata
```

## ✅ Đã Sửa:

1. **Build Stage**: 
   - Từ: `maven:3.8.5-openjdk-21` 
   - Thành: `maven:3.9-eclipse-temurin-21` ✅

2. **Run Stage**:
   - Từ: `openjdk:21-jdk-slim`
   - Thành: `eclipse-temurin:21-jre` ✅

## 📝 Lý do:

- `openjdk:21-jdk-slim` không tồn tại trên Docker Hub
- `eclipse-temurin` là image chính thức và phổ biến cho Java 21
- Dùng `jre` thay vì `jdk` để giảm kích thước image (chỉ cần runtime, không cần compile)

## 🚀 Bước Tiếp Theo:

1. **Commit và push**:
   ```bash
   git add backend/Dockerfile
   git commit -m "Fix Dockerfile: Use eclipse-temurin images instead of openjdk"
   git push
   ```

2. **Trên Render**:
   - Vào service → Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Hoặc đợi auto-deploy

3. **Kiểm tra logs**:
   - Build sẽ thành công
   - App sẽ start và connect database


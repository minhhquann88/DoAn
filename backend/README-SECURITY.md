# 🔒 Bảo mật API Keys và Thông tin nhạy cảm

## ⚠️ QUAN TRỌNG: Không push API keys lên GitHub!

File `application.properties` chứa các thông tin nhạy cảm:
- Google Gemini API Key
- Database password
- JWT Secret
- Email credentials
- VNPay credentials

## ✅ File đã được bảo vệ

File `application.properties` đã được thêm vào `.gitignore` và **KHÔNG** được commit lên GitHub.

## 📝 Cách setup cho người mới

1. Copy file template:
   ```bash
   cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
   ```

2. Điền các thông tin cần thiết vào `application.properties`:
   - `gemini.api.key`: Lấy từ [Google AI Studio](https://ai.google.dev/)
   - `spring.datasource.password`: Password MySQL của bạn
   - `coursemgmt.app.jwtSecret`: JWT secret key (có thể generate random)
   - Các thông tin khác...

## 🔑 Lấy Gemini API Key

1. Truy cập: https://ai.google.dev/
2. Đăng nhập với Google account
3. Click "Get API key"
4. Tạo API key mới hoặc sử dụng key có sẵn
5. Copy key và paste vào `application.properties`

## 🚨 Nếu đã vô tình push API key lên GitHub

1. **NGAY LẬP TỨC**: Revoke API key cũ trên Google AI Studio
2. Tạo API key mới
3. Cập nhật trong `application.properties`
4. Xóa file khỏi git history (nếu cần):
   ```bash
   git filter-branch --force --index-filter "git rm --cached --ignore-unmatch backend/src/main/resources/application.properties" --prune-empty --tag-name-filter cat -- --all
   ```

## 📋 Checklist trước khi push

- [ ] `application.properties` không có trong `git status`
- [ ] `.gitignore` đã có `backend/src/main/resources/application.properties`
- [ ] Không có API key trong code (chỉ dùng `@Value("${gemini.api.key}")`)
- [ ] `application.properties.example` không chứa key thật


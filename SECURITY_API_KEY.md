# 🔒 Hướng dẫn Bảo mật API Key

## ⚠️ QUAN TRỌNG: Không bao giờ commit API key lên GitHub!

File này hướng dẫn cách cấu hình API key một cách an toàn.

## 📋 Các file đã được sửa

1. **`simple_chatbot.py`**
   - ✅ Đã sửa để đọc API key từ biến môi trường
   - ✅ Không còn hardcode API key trong code

2. **`my_config.env`**
   - ✅ Đã xóa API key thực tế
   - ✅ Thay bằng placeholder `YOUR_GEMINI_API_KEY_HERE`

3. **`.env.example`**
   - ✅ File template mới, không chứa API key thực tế
   - ✅ Có thể commit lên GitHub an toàn

## 🚀 Cách sử dụng

### Bước 1: Tạo file `.env`

```bash
# Copy file template
cp .env.example .env

# Hoặc trên Windows PowerShell:
Copy-Item .env.example .env
```

### Bước 2: Thêm API key vào file `.env`

Mở file `.env` và thay `your_gemini_api_key_here` bằng API key thực tế của bạn:

```env
GEMINI_API_KEY=AIzaSy...your_actual_api_key_here
```

### Bước 3: Lấy Gemini API Key

1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập với tài khoản Google
3. Tạo API key mới hoặc sử dụng API key hiện có
4. Copy API key và paste vào file `.env`

### Bước 4: Cài đặt python-dotenv (nếu chưa có)

```bash
pip install python-dotenv
```

### Bước 5: Chạy ứng dụng

```bash
python simple_chatbot.py
```

Ứng dụng sẽ tự động đọc API key từ file `.env`.

## ✅ Kiểm tra .gitignore

Đảm bảo các file sau đã có trong `.gitignore`:

```
.env
.env.local
.env.*.local
my_config.env
```

**Lưu ý:** File `.env.example` có thể commit lên GitHub vì nó chỉ là template, không chứa API key thực tế.

## 🔄 Nếu API key đã bị lộ

Nếu bạn đã vô tình commit API key lên GitHub:

1. **Xóa commit chứa API key** (nếu có thể):
   ```bash
   git reset HEAD~1  # Xóa commit cuối cùng
   git push --force  # Cẩn thận với force push!
   ```

2. **Revoke API key cũ** trên Google Cloud Console:
   - Truy cập: https://console.cloud.google.com/apis/credentials
   - Tìm API key đã bị lộ
   - Click "Revoke" hoặc "Delete"

3. **Tạo API key mới** và cập nhật vào file `.env`

4. **Kiểm tra lại** tất cả các file trước khi commit:
   ```bash
   git diff  # Xem các thay đổi
   grep -r "AIzaSy" .  # Tìm API key trong code
   ```

## 📝 Best Practices

1. ✅ **LUÔN** dùng biến môi trường cho API key
2. ✅ **LUÔN** thêm file `.env` vào `.gitignore`
3. ✅ **LUÔN** dùng `.env.example` làm template
4. ❌ **KHÔNG BAO GIỜ** hardcode API key trong code
5. ❌ **KHÔNG BAO GIỜ** commit file `.env` lên GitHub
6. ❌ **KHÔNG BAO GIỜ** chia sẻ API key trong chat, email, hoặc tin nhắn

## 🛡️ Bảo mật bổ sung

- Sử dụng API key riêng cho môi trường development và production
- Giới hạn API key theo domain/IP nếu có thể
- Thường xuyên rotate (thay đổi) API key
- Monitor usage của API key để phát hiện lạm dụng


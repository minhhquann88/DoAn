# 📝 Template Điền Thông Tin Deploy

Copy và điền thông tin vào đây khi deploy:

---

## 🔵 AIVEN DATABASE

```
Host: _________________________________
Port: _________________________________
Database Name: ________________________
Username: _____________________________
Password: _____________________________
Service URI: mysql://_________________
```

---

## 🟢 RENDER BACKEND

```
Service Name: e-learning-backend
Service URL: https://_________________.onrender.com
Region: Singapore

Environment Variables:
SPRING_DATASOURCE_URL=jdbc:mysql://<HOST>:<PORT>/<DATABASE>?ssl-mode=REQUIRED&serverTimezone=UTC&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=avnadmin
SPRING_DATASOURCE_PASSWORD=<PASSWORD>
PORT=8080
JWT_SECRET=<GENERATE_RANDOM_32_CHARS>
ALLOWED_ORIGINS=http://localhost:3000
```

**Lưu ý**: `ALLOWED_ORIGINS` sẽ cập nhật sau khi có link Vercel.

---

## 🟡 VERCEL FRONTEND

```
Project Name: ________________________
Project URL: https://_________________.vercel.app

Environment Variables:
NEXT_PUBLIC_API_BASE_URL=https://<RENDER_URL>/api
```

---

## ✅ SAU KHI CÓ LINK VERCEL

Cập nhật trên Render:
```
ALLOWED_ORIGINS=https://<VERCEL_URL>,http://localhost:3000
```

---

## 🔑 JWT_SECRET Generator

Tạo JWT secret ngẫu nhiên (tối thiểu 32 ký tự):
- Online: https://www.random.org/strings/
- Hoặc dùng: `openssl rand -base64 32`


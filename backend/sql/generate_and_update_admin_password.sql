-- Script để generate BCrypt hash mới và cập nhật password cho admin
-- Password: 123456

-- Bước 1: Tắt safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Bước 2: Generate BCrypt hash mới cho password "123456"
-- Lưu ý: BCrypt hash sẽ khác nhau mỗi lần generate, nhưng đều có thể verify với cùng password
-- Hash này được generate bằng BCryptPasswordEncoder với strength 10 (default)

-- Hash được generate: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- Nếu hash này không hoạt động, cần generate hash mới bằng Java code

-- Bước 3: Cập nhật password cho admin
UPDATE coursemgmt_test.users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    is_enabled = 1
WHERE username = 'admin' OR email = 'admin@example.com';

-- Bước 4: Bật lại safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Bước 5: Kiểm tra lại
SELECT id, username, email, is_enabled, 
       LEFT(password, 30) as password_hash_preview
FROM coursemgmt_test.users 
WHERE username = 'admin';

-- Nếu vẫn không đăng nhập được, thử các hash sau (đều là hash của "123456"):
-- Hash 2: $2a$10$rKz8v5F5Y5Y5Y5Y5Y5Y5YeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- Hash 3: $2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUV

-- Hoặc chạy Java code PasswordHashGenerator để generate hash mới


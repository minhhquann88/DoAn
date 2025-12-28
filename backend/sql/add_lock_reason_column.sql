-- Thêm cột lock_reason vào bảng users để lưu lý do khóa tài khoản
ALTER TABLE coursemgmt_test.users 
ADD COLUMN lock_reason VARCHAR(500) NULL 
COMMENT 'Lý do khóa tài khoản';


-- ============================================
-- Script xóa các bảng liên quan đến Test/Quiz/Assignment
-- Database: coursemgmt_test
-- User: root
-- ============================================

-- Tắt foreign key checks tạm thời để tránh lỗi khi xóa
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa các bảng liên quan đến Test/Quiz
-- Lưu ý: Xóa theo thứ tự để tránh lỗi foreign key

-- 1. Xóa bảng test_result_answers (bảng con)
DROP TABLE IF EXISTS test_result_answers;

-- 2. Xóa bảng test_results (bảng con)
DROP TABLE IF EXISTS test_results;

-- 3. Xóa bảng test_questions (bảng con)
DROP TABLE IF EXISTS test_questions;

-- 4. Xóa bảng test_answer_options (bảng con)
DROP TABLE IF EXISTS test_answer_options;

-- 5. Xóa bảng tests (bảng cha)
DROP TABLE IF EXISTS tests;

-- Bật lại foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Kiểm tra kết quả
SELECT 'Các bảng test đã được xóa thành công!' AS Status;

-- Hiển thị danh sách tables còn lại
SHOW TABLES;


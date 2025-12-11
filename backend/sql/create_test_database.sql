-- ============================================
-- SCRIPT TẠO DATABASE MYSQL TẠM THỜI
-- Để test các Module 6, 7, 8, 9
-- ============================================

-- Tạo database mới
DROP DATABASE IF EXISTS coursemgmt_test;
CREATE DATABASE coursemgmt_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coursemgmt_test;

-- ============================================
-- TẠO CÁC BẢNG
-- ============================================

-- Bảng Roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- Bảng Users
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt encoded',
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_enabled BOOLEAN DEFAULT FALSE
);

-- Bảng User_Roles (Many-to-Many)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Bảng Categories
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

-- Bảng Courses
CREATE TABLE courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    image_url VARCHAR(500),
    total_duration_in_hours INT,
    status VARCHAR(30) DEFAULT 'DRAFT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    instructor_id BIGINT,
    category_id BIGINT,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Bảng Chapters
CREATE TABLE chapters (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    position INT,
    course_id BIGINT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Bảng Lessons
CREATE TABLE lessons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(20),
    video_url VARCHAR(500),
    document_url VARCHAR(500),
    content TEXT,
    position INT,
    duration_in_minutes INT,
    chapter_id BIGINT NOT NULL,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Bảng Enrollments
CREATE TABLE enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    progress DOUBLE DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, course_id)
);

-- Bảng Transactions
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    amount DOUBLE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_gateway VARCHAR(20),
    transaction_code VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Bảng Certificates
CREATE TABLE certificates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    certificate_code VARCHAR(255) UNIQUE NOT NULL,
    pdf_url VARCHAR(500),
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    enrollment_id BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- Bảng User_Progress
CREATE TABLE user_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at DATETIME,
    enrollment_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- ============================================
-- INSERT DỮ LIỆU MẪU
-- ============================================

-- Insert Roles
INSERT INTO roles (name) VALUES
('ROLE_ADMIN'),
('ROLE_LECTURER'),
('ROLE_STUDENT');

-- Insert Users (password = "123456" được mã hóa bằng BCrypt)
-- BCrypt hash của "123456": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO users (username, password, email, full_name, avatar_url, bio, created_at, is_enabled) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@example.com', 'Quản trị viên', NULL, 'Quản trị hệ thống', NOW(), TRUE),
('lecturer1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'lecturer1@example.com', 'Nguyễn Văn A', NULL, 'Giảng viên Lập trình Java', NOW(), TRUE),
('lecturer2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'lecturer2@example.com', 'Trần Thị B', NULL, 'Giảng viên Web Development', NOW(), TRUE),
('student1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student1@example.com', 'Lê Văn C', NULL, 'Học viên', NOW(), TRUE),
('student2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student2@example.com', 'Phạm Thị D', NULL, 'Học viên', NOW(), TRUE),
('student3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student3@example.com', 'Hoàng Văn E', NULL, 'Học viên', NOW(), TRUE);

-- Insert User_Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- admin -> ROLE_ADMIN
(2, 2), -- lecturer1 -> ROLE_LECTURER
(3, 2), -- lecturer2 -> ROLE_LECTURER
(4, 3), -- student1 -> ROLE_STUDENT
(5, 3), -- student2 -> ROLE_STUDENT
(6, 3); -- student3 -> ROLE_STUDENT

-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Lập trình', 'Các khóa học về lập trình và phát triển phần mềm'),
('Web Development', 'Phát triển ứng dụng web'),
('Mobile Development', 'Phát triển ứng dụng di động'),
('Data Science', 'Khoa học dữ liệu và phân tích');

-- Insert Courses
INSERT INTO courses (title, description, price, image_url, total_duration_in_hours, status, created_at, instructor_id, category_id) VALUES
('Java Spring Boot Cơ bản', 'Khóa học về Spring Boot framework cho Java', 500000, NULL, 40, 'PUBLISHED', DATE_SUB(NOW(), INTERVAL 30 DAY), 2, 1),
('React.js từ Zero đến Hero', 'Học React.js từ cơ bản đến nâng cao', 600000, NULL, 50, 'PUBLISHED', DATE_SUB(NOW(), INTERVAL 25 DAY), 3, 2),
('Node.js Backend Development', 'Xây dựng backend với Node.js và Express', 550000, NULL, 45, 'PUBLISHED', DATE_SUB(NOW(), INTERVAL 20 DAY), 3, 2),
('Python cho Data Science', 'Phân tích dữ liệu với Python', 700000, NULL, 60, 'PUBLISHED', DATE_SUB(NOW(), INTERVAL 15 DAY), 2, 4),
('Flutter Mobile App', 'Phát triển ứng dụng di động với Flutter', 650000, NULL, 55, 'PUBLISHED', DATE_SUB(NOW(), INTERVAL 10 DAY), 3, 3);

-- Insert Chapters
INSERT INTO chapters (title, position, course_id) VALUES
-- Course 1: Java Spring Boot
('Giới thiệu Spring Boot', 1, 1),
('Spring Boot Core', 2, 1),
('Spring Data JPA', 3, 1),
('Spring Security', 4, 1),
-- Course 2: React.js
('React Fundamentals', 1, 2),
('Components & Props', 2, 2),
('State & Hooks', 3, 2),
('Routing & Navigation', 4, 2),
-- Course 3: Node.js
('Node.js Basics', 1, 3),
('Express Framework', 2, 3),
('Database Integration', 3, 3),
-- Course 4: Python Data Science
('Python Basics', 1, 4),
('NumPy & Pandas', 2, 4),
('Data Visualization', 3, 4),
-- Course 5: Flutter
('Flutter Introduction', 1, 5),
('Widgets & Layouts', 2, 5),
('State Management', 3, 5);

-- Insert Lessons
INSERT INTO lessons (title, content_type, video_url, document_url, content, position, duration_in_minutes, chapter_id) VALUES
-- Chapter 1: Giới thiệu Spring Boot
('Bài 1: Tổng quan Spring Boot', 'VIDEO', NULL, NULL, 'Nội dung bài học về Spring Boot', 1, 30, 1),
('Bài 2: Cài đặt môi trường', 'TEXT', NULL, NULL, 'Hướng dẫn cài đặt JDK, Maven, IDE', 2, 20, 1),
-- Chapter 2: Spring Boot Core
('Bài 3: Dependency Injection', 'VIDEO', NULL, NULL, 'Tìm hiểu về DI trong Spring', 1, 45, 2),
('Bài 4: Configuration', 'TEXT', NULL, NULL, 'Cấu hình ứng dụng Spring Boot', 2, 25, 2),
-- Chapter 1: React Fundamentals
('Bài 1: Giới thiệu React', 'VIDEO', NULL, NULL, 'Tổng quan về React.js', 1, 40, 5),
('Bài 2: JSX Syntax', 'TEXT', NULL, NULL, 'Học về JSX trong React', 2, 30, 5),
-- Chapter 1: Node.js Basics
('Bài 1: Node.js là gì?', 'VIDEO', NULL, NULL, 'Giới thiệu Node.js', 1, 35, 9),
('Bài 2: NPM và Modules', 'TEXT', NULL, NULL, 'Quản lý packages với NPM', 2, 25, 9);

-- Insert Enrollments
INSERT INTO enrollments (enrolled_at, progress, status, user_id, course_id) VALUES
-- Student 1 enrollments
(DATE_SUB(NOW(), INTERVAL 20 DAY), 45.5, 'IN_PROGRESS', 4, 1),
(DATE_SUB(NOW(), INTERVAL 15 DAY), 100.0, 'COMPLETED', 4, 2),
(DATE_SUB(NOW(), INTERVAL 10 DAY), 30.0, 'IN_PROGRESS', 4, 3),
-- Student 2 enrollments
(DATE_SUB(NOW(), INTERVAL 18 DAY), 75.0, 'IN_PROGRESS', 5, 1),
(DATE_SUB(NOW(), INTERVAL 12 DAY), 100.0, 'COMPLETED', 5, 4),
-- Student 3 enrollments
(DATE_SUB(NOW(), INTERVAL 8 DAY), 20.0, 'IN_PROGRESS', 6, 2),
(DATE_SUB(NOW(), INTERVAL 5 DAY), 10.0, 'IN_PROGRESS', 6, 5);

-- Insert Transactions
INSERT INTO transactions (amount, status, payment_gateway, transaction_code, created_at, user_id, course_id) VALUES
-- Student 1 transactions
(500000, 'SUCCESS', 'VNPAY', 'VNPAY123456', DATE_SUB(NOW(), INTERVAL 20 DAY), 4, 1),
(600000, 'SUCCESS', 'MOMO', 'MOMO789012', DATE_SUB(NOW(), INTERVAL 15 DAY), 4, 2),
(550000, 'PENDING', 'VNPAY', 'VNPAY345678', DATE_SUB(NOW(), INTERVAL 10 DAY), 4, 3),
-- Student 2 transactions
(500000, 'SUCCESS', 'VNPAY', 'VNPAY901234', DATE_SUB(NOW(), INTERVAL 18 DAY), 5, 1),
(700000, 'SUCCESS', 'MOMO', 'MOMO567890', DATE_SUB(NOW(), INTERVAL 12 DAY), 5, 4),
-- Student 3 transactions
(600000, 'SUCCESS', 'VNPAY', 'VNPAY111222', DATE_SUB(NOW(), INTERVAL 8 DAY), 6, 2),
(650000, 'FAILED', 'MOMO', 'MOMO333444', DATE_SUB(NOW(), INTERVAL 5 DAY), 6, 5);

-- Insert Certificates (cho các enrollment đã hoàn thành)
INSERT INTO certificates (certificate_code, pdf_url, issued_at, enrollment_id) VALUES
('CERT-2024-001', '/certificates/cert-2024-001.pdf', DATE_SUB(NOW(), INTERVAL 5 DAY), 2), -- Student 1 completed Course 2
('CERT-2024-002', '/certificates/cert-2024-002.pdf', DATE_SUB(NOW(), INTERVAL 2 DAY), 5); -- Student 2 completed Course 4

-- Insert User_Progress
INSERT INTO user_progress (is_completed, completed_at, enrollment_id, lesson_id) VALUES
-- Student 1 progress in Course 1
(TRUE, DATE_SUB(NOW(), INTERVAL 18 DAY), 1, 1),
(TRUE, DATE_SUB(NOW(), INTERVAL 17 DAY), 1, 2),
(TRUE, DATE_SUB(NOW(), INTERVAL 16 DAY), 1, 3),
(FALSE, NULL, 1, 4),
-- Student 1 progress in Course 2 (completed)
(TRUE, DATE_SUB(NOW(), INTERVAL 12 DAY), 2, 5),
(TRUE, DATE_SUB(NOW(), INTERVAL 11 DAY), 2, 6),
-- Student 2 progress in Course 1
(TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY), 4, 1),
(TRUE, DATE_SUB(NOW(), INTERVAL 14 DAY), 4, 2),
(TRUE, DATE_SUB(NOW(), INTERVAL 13 DAY), 4, 3),
(TRUE, DATE_SUB(NOW(), INTERVAL 12 DAY), 4, 4);

-- ============================================
-- TẠO INDEX ĐỂ TỐI ƯU HIỆU SUẤT
-- ============================================

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_course ON transactions(course_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_user_progress_enrollment ON user_progress(enrollment_id);
CREATE INDEX idx_user_progress_lesson ON user_progress(lesson_id);

-- ============================================
-- XEM DỮ LIỆU ĐÃ TẠO
-- ============================================

SELECT 'Roles' as TableName, COUNT(*) as Count FROM roles
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Chapters', COUNT(*) FROM chapters
UNION ALL
SELECT 'Lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'Enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Certificates', COUNT(*) FROM certificates
UNION ALL
SELECT 'User_Progress', COUNT(*) FROM user_progress;

-- ============================================
-- THÔNG TIN ĐĂNG NHẬP TEST
-- ============================================
-- Admin: admin / 123456
-- Lecturer: lecturer1 / 123456 hoặc lecturer2 / 123456
-- Student: student1 / 123456, student2 / 123456, student3 / 123456


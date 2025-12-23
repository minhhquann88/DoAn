-- ============================================
-- E-LEARNING OPTIMIZED DATABASE SCHEMA
-- Version: 2.0
-- Date: 2025-12-23
-- Based on: Current system models (without Test/Quiz)
-- ============================================

DROP DATABASE IF EXISTS coursemgmt_optimized;
CREATE DATABASE coursemgmt_optimized 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE coursemgmt_optimized;

-- ============================================
-- 1. ROLES & AUTHENTICATION
-- ============================================

-- Roles table
CREATE TABLE roles (
    id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB;

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('ROLE_STUDENT', 'Regular student'),
('ROLE_LECTURER', 'Course instructor'),
('ROLE_ADMIN', 'System administrator');

-- Users table (optimized)
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hashed password',
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    bio TEXT,
    
    -- Status & verification
    is_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_is_enabled (is_enabled),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (full_name, email, username)
) ENGINE=InnoDB;

-- User roles (many-to-many)
CREATE TABLE user_roles (
    user_id BIGINT UNSIGNED NOT NULL,
    role_id TINYINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB;

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB;

-- ============================================
-- 2. CATEGORIES
-- ============================================

CREATE TABLE categories (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_name (name),
    INDEX idx_deleted_at (deleted_at),
    FULLTEXT idx_search (name, description)
) ENGINE=InnoDB;

-- ============================================
-- 3. COURSES
-- ============================================

CREATE TABLE courses (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Basic info
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Classification
    category_id BIGINT UNSIGNED NOT NULL,
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Media
    image_url VARCHAR(500),
    
    -- Duration
    total_duration_in_hours INT UNSIGNED DEFAULT 0,
    
    -- Instructor
    instructor_id BIGINT UNSIGNED NOT NULL,
    
    -- Status
    status ENUM('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED') DEFAULT 'DRAFT',
    
    -- Stats (denormalized for performance)
    total_enrollments INT UNSIGNED DEFAULT 0,
    total_lessons INT UNSIGNED DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT UNSIGNED DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (instructor_id) REFERENCES users(id),
    
    -- Indexes
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_price (price),
    INDEX idx_created_at (created_at),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_total_enrollments (total_enrollments),
    INDEX idx_average_rating (average_rating),
    FULLTEXT idx_search (title, description)
) ENGINE=InnoDB;

-- ============================================
-- 4. COURSE CONTENT
-- ============================================

-- Chapters (Sections)
CREATE TABLE chapters (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_position (position)
) ENGINE=InnoDB;

-- Lessons
CREATE TABLE lessons (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    chapter_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    
    -- Content
    content_type ENUM('VIDEO', 'TEXT', 'DOCUMENT') NOT NULL,
    video_url VARCHAR(1000),
    document_url VARCHAR(1000),
    content LONGTEXT,
    
    -- Duration (in minutes)
    duration_in_minutes INT UNSIGNED DEFAULT 0,
    
    -- Order
    position INT NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_content_type (content_type),
    INDEX idx_position (position)
) ENGINE=InnoDB;

-- ============================================
-- 5. ENROLLMENTS & PROGRESS
-- ============================================

CREATE TABLE enrollments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    
    -- Progress
    progress DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Percentage 0-100',
    
    -- Status
    status ENUM('IN_PROGRESS', 'COMPLETED') DEFAULT 'IN_PROGRESS',
    
    -- Timestamps
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    UNIQUE KEY unique_enrollment (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_enrolled_at (enrolled_at),
    INDEX idx_progress (progress),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB;

-- Lesson Progress (User_Progress)
CREATE TABLE user_progress (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    enrollment_id BIGINT UNSIGNED NOT NULL,
    lesson_id BIGINT UNSIGNED NOT NULL,
    
    -- Progress
    is_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_progress (enrollment_id, lesson_id),
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_is_completed (is_completed)
) ENGINE=InnoDB;

-- ============================================
-- 6. PAYMENTS & TRANSACTIONS
-- ============================================

CREATE TABLE transactions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    
    -- Parties
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    
    -- Amount
    amount DECIMAL(10,2) NOT NULL,
    
    -- Payment Gateway
    payment_gateway ENUM('VNPAY', 'MOMO') NOT NULL,
    transaction_code VARCHAR(255) COMMENT 'Mã giao dịch từ cổng thanh toán',
    
    -- Status
    status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    
    INDEX idx_transaction_code (transaction_code),
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_payment_gateway (payment_gateway)
) ENGINE=InnoDB;

-- ============================================
-- 7. CERTIFICATES
-- ============================================

CREATE TABLE certificates (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    certificate_code VARCHAR(50) NOT NULL UNIQUE,
    
    -- References
    enrollment_id BIGINT UNSIGNED NOT NULL UNIQUE,
    
    -- Certificate info
    pdf_url VARCHAR(1000),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    
    INDEX idx_certificate_code (certificate_code),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_issued_at (issued_at)
) ENGINE=InnoDB;

-- ============================================
-- 8. CHAT MESSAGES (Chatbot)
-- ============================================

CREATE TABLE chat_messages (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    session_id VARCHAR(255),
    message_content LONGTEXT NOT NULL,
    response_content LONGTEXT,
    feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================
-- 9. RECOMMENDATIONS
-- ============================================

CREATE TABLE recommendations (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    recommendation_score DECIMAL(5,2) DEFAULT 0.00,
    reason TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_score (recommendation_score),
    INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB;

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE STATS
-- ============================================

DELIMITER //

-- Update course total_enrollments when enrollment is created
CREATE TRIGGER after_enrollment_insert
AFTER INSERT ON enrollments
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET total_enrollments = total_enrollments + 1
    WHERE id = NEW.course_id;
END//

-- Update course total_enrollments when enrollment is deleted
CREATE TRIGGER after_enrollment_delete
AFTER DELETE ON enrollments
FOR EACH ROW
BEGIN
    UPDATE courses 
    SET total_enrollments = GREATEST(total_enrollments - 1, 0)
    WHERE id = OLD.course_id;
END//

-- Update enrollment progress when lesson is completed
CREATE TRIGGER after_progress_complete
AFTER UPDATE ON user_progress
FOR EACH ROW
BEGIN
    IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
        -- Calculate progress percentage
        UPDATE enrollments e
        SET progress = (
            SELECT ROUND((COUNT(*) * 100.0 / 
                (SELECT COUNT(*) FROM lessons l 
                 JOIN chapters c ON l.chapter_id = c.id 
                 WHERE c.course_id = e.course_id)), 2)
            FROM user_progress up
            JOIN lessons l ON up.lesson_id = l.id
            JOIN chapters c ON l.chapter_id = c.id
            WHERE up.enrollment_id = e.id 
              AND up.is_completed = TRUE
              AND c.course_id = e.course_id
        )
        WHERE e.id = NEW.enrollment_id;
        
        -- Update enrollment status to COMPLETED if all lessons done
        UPDATE enrollments e
        SET status = 'COMPLETED', completed_at = NOW()
        WHERE e.id = NEW.enrollment_id
          AND e.progress >= 100.00;
    END IF;
END//

-- Update course total_lessons when lesson is added
CREATE TRIGGER after_lesson_insert
AFTER INSERT ON lessons
FOR EACH ROW
BEGIN
    UPDATE courses c
    JOIN chapters ch ON ch.course_id = c.id
    SET c.total_lessons = (
        SELECT COUNT(*) 
        FROM lessons l 
        JOIN chapters ch2 ON l.chapter_id = ch2.id 
        WHERE ch2.course_id = c.id
    )
    WHERE ch.id = NEW.chapter_id;
END//

DELIMITER ;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Active courses with instructor info
CREATE VIEW v_active_courses AS
SELECT 
    c.id,
    c.title,
    c.description,
    c.price,
    c.image_url,
    c.status,
    c.total_enrollments,
    c.average_rating,
    c.total_reviews,
    c.created_at,
    u.id as instructor_id,
    u.full_name as instructor_name,
    u.email as instructor_email,
    cat.id as category_id,
    cat.name as category_name
FROM courses c
JOIN users u ON c.instructor_id = u.id
JOIN categories cat ON c.category_id = cat.id
WHERE c.status = 'PUBLISHED' 
  AND c.deleted_at IS NULL
  AND u.is_enabled = TRUE
  AND u.deleted_at IS NULL;

-- Student enrollments with progress
CREATE VIEW v_student_enrollments AS
SELECT 
    e.id,
    e.user_id,
    e.course_id,
    e.progress,
    e.status,
    e.enrolled_at,
    e.completed_at,
    c.title as course_title,
    c.image_url as course_thumbnail,
    c.price as course_price,
    u.full_name as student_name,
    u.email as student_email,
    i.full_name as instructor_name,
    cat.name as category_name,
    (SELECT COUNT(*) FROM user_progress up 
     JOIN lessons l ON up.lesson_id = l.id 
     JOIN chapters ch ON l.chapter_id = ch.id 
     WHERE up.enrollment_id = e.id AND up.is_completed = TRUE 
       AND ch.course_id = e.course_id) as completed_lessons,
    (SELECT COUNT(*) FROM lessons l 
     JOIN chapters ch ON l.chapter_id = ch.id 
     WHERE ch.course_id = e.course_id) as total_lessons
FROM enrollments e
JOIN courses c ON e.course_id = c.id
JOIN users u ON e.user_id = u.id
JOIN users i ON c.instructor_id = i.id
JOIN categories cat ON c.category_id = cat.id
WHERE e.status = 'IN_PROGRESS' OR e.status = 'COMPLETED';

-- Course statistics
CREATE VIEW v_course_statistics AS
SELECT 
    c.id,
    c.title,
    c.total_enrollments,
    COUNT(DISTINCT e.id) as active_enrollments,
    COUNT(DISTINCT CASE WHEN e.status = 'COMPLETED' THEN e.id END) as completed_enrollments,
    AVG(e.progress) as average_progress,
    COUNT(DISTINCT t.id) as total_transactions,
    SUM(CASE WHEN t.status = 'SUCCESS' THEN t.amount ELSE 0 END) as total_revenue,
    c.average_rating,
    c.total_reviews
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN transactions t ON c.id = t.course_id AND t.status = 'SUCCESS'
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.title, c.total_enrollments, c.average_rating, c.total_reviews;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create default admin user (password: admin123 - needs to be hashed with BCrypt)
-- Note: In production, use proper BCrypt hash
INSERT INTO users (email, username, password, full_name, is_enabled) VALUES
('admin@coursemgmt.com', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', TRUE);

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 3); -- ROLE_ADMIN

-- Sample categories
INSERT INTO categories (name, description) VALUES
('Programming', 'Learn programming languages and software development'),
('Design', 'UI/UX design and graphic design courses'),
('Business', 'Business and management courses'),
('Marketing', 'Digital marketing and advertising'),
('Data Science', 'Data analysis and machine learning'),
('Web Development', 'Frontend and backend web development');

-- ============================================
-- PERFORMANCE OPTIMIZATION
-- ============================================

-- Analyze tables for query optimization
ANALYZE TABLE users;
ANALYZE TABLE courses;
ANALYZE TABLE enrollments;
ANALYZE TABLE lessons;
ANALYZE TABLE transactions;

-- ============================================
-- DONE
-- ============================================

SELECT 'Database coursemgmt_optimized created successfully!' AS Status;
SELECT 'Total tables created:' AS Info, COUNT(*) AS Count FROM information_schema.tables WHERE table_schema = 'coursemgmt_optimized';


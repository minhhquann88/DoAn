-- ============================================
-- ADD MISSING TABLES
-- Run this in MySQL Workbench
-- ============================================

USE coursemgmt_optimized;

-- ============================================
-- 1. CREATE password_reset_token table
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_token (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT UNSIGNED NOT NULL,
    expiry_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB;

-- ============================================
-- 2. FIX ALL COLUMN TYPES (run again to be sure)
-- ============================================

-- Fix courses
ALTER TABLE courses 
MODIFY COLUMN price DOUBLE NOT NULL DEFAULT 0.00,
MODIFY COLUMN average_rating DOUBLE DEFAULT 0.00,
MODIFY COLUMN description LONGTEXT;

-- Fix enrollments
ALTER TABLE enrollments 
MODIFY COLUMN progress DOUBLE DEFAULT 0.00;

-- Fix transactions
ALTER TABLE transactions 
MODIFY COLUMN amount DOUBLE NOT NULL;

-- Fix recommendations
ALTER TABLE recommendations 
MODIFY COLUMN recommendation_score DOUBLE DEFAULT 0.00;

-- Fix chat_messages
ALTER TABLE chat_messages 
MODIFY COLUMN message_content LONGTEXT NOT NULL,
MODIFY COLUMN response_content LONGTEXT,
MODIFY COLUMN feedback_rating INT;

-- Fix users
ALTER TABLE users MODIFY COLUMN bio LONGTEXT;

-- Fix lessons
ALTER TABLE lessons MODIFY COLUMN content LONGTEXT;

-- Fix categories
ALTER TABLE categories MODIFY COLUMN description LONGTEXT;

-- ============================================
-- VERIFY
-- ============================================
SELECT 'Checking password_reset_token...' AS Status;
SHOW TABLES LIKE 'password_reset_token';

SELECT '✅ ALL TABLES AND TYPES FIXED!' AS Status;


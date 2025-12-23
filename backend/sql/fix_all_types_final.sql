-- ============================================
-- FIX ALL COLUMN TYPE MISMATCHES - FINAL
-- Run this in MySQL Workbench to fix all issues
-- ============================================

USE coursemgmt_optimized;

-- ============================================
-- 1. FIX courses table
-- ============================================
ALTER TABLE courses 
MODIFY COLUMN price DOUBLE NOT NULL DEFAULT 0.00,
MODIFY COLUMN average_rating DOUBLE DEFAULT 0.00,
MODIFY COLUMN description LONGTEXT;

-- ============================================
-- 2. FIX enrollments table
-- ============================================
ALTER TABLE enrollments 
MODIFY COLUMN progress DOUBLE DEFAULT 0.00;

-- ============================================
-- 3. FIX transactions table
-- ============================================
ALTER TABLE transactions 
MODIFY COLUMN amount DOUBLE NOT NULL;

-- ============================================
-- 4. FIX recommendations table
-- ============================================
ALTER TABLE recommendations 
MODIFY COLUMN recommendation_score DOUBLE DEFAULT 0.00;

-- ============================================
-- 5. FIX chat_messages table
-- ============================================
ALTER TABLE chat_messages 
MODIFY COLUMN message_content LONGTEXT NOT NULL,
MODIFY COLUMN response_content LONGTEXT,
MODIFY COLUMN feedback_rating INT;

-- ============================================
-- 6. FIX users table
-- ============================================
ALTER TABLE users 
MODIFY COLUMN bio LONGTEXT;

-- ============================================
-- 7. FIX lessons table
-- ============================================
ALTER TABLE lessons 
MODIFY COLUMN content LONGTEXT;

-- ============================================
-- 8. FIX categories table
-- ============================================
ALTER TABLE categories 
MODIFY COLUMN description LONGTEXT;

-- ============================================
-- VERIFY ALL CHANGES
-- ============================================
SELECT 'Checking courses table...' AS Status;
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'coursemgmt_optimized' AND TABLE_NAME = 'courses'
AND COLUMN_NAME IN ('price', 'average_rating', 'description');

SELECT 'Checking enrollments table...' AS Status;
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'coursemgmt_optimized' AND TABLE_NAME = 'enrollments'
AND COLUMN_NAME = 'progress';

SELECT 'Checking transactions table...' AS Status;
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'coursemgmt_optimized' AND TABLE_NAME = 'transactions'
AND COLUMN_NAME = 'amount';

SELECT 'Checking recommendations table...' AS Status;
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'coursemgmt_optimized' AND TABLE_NAME = 'recommendations'
AND COLUMN_NAME = 'recommendation_score';

SELECT 'Checking chat_messages table...' AS Status;
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'coursemgmt_optimized' AND TABLE_NAME = 'chat_messages'
AND COLUMN_NAME IN ('message_content', 'response_content', 'feedback_rating');

SELECT '✅ ALL COLUMN TYPES FIXED!' AS Status;


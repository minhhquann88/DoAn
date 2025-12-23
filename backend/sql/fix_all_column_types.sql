-- ============================================
-- FIX ALL COLUMN TYPE MISMATCHES
-- Run this script to fix all type issues
-- ============================================

USE coursemgmt_optimized;

-- ============================================
-- 1. FIX chat_messages table
-- ============================================
ALTER TABLE chat_messages 
MODIFY COLUMN message_content LONGTEXT NOT NULL,
MODIFY COLUMN response_content LONGTEXT,
MODIFY COLUMN feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5);

-- ============================================
-- 2. FIX users table - bio column
-- ============================================
ALTER TABLE users 
MODIFY COLUMN bio LONGTEXT;

-- ============================================
-- 3. FIX courses table - description column
-- ============================================
ALTER TABLE courses 
MODIFY COLUMN description LONGTEXT;

-- ============================================
-- 4. FIX lessons table - content column
-- ============================================
ALTER TABLE lessons 
MODIFY COLUMN content LONGTEXT;

-- ============================================
-- 5. FIX categories table - description column
-- ============================================
ALTER TABLE categories 
MODIFY COLUMN description LONGTEXT;

-- ============================================
-- VERIFY CHANGES
-- ============================================

SELECT 'Verifying column types...' AS Status;

-- Check chat_messages
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'coursemgmt_optimized' 
  AND TABLE_NAME = 'chat_messages'
  AND COLUMN_NAME IN ('message_content', 'response_content', 'feedback_rating');

-- Check users.bio
SELECT 
    COLUMN_NAME, 
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'coursemgmt_optimized' 
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'bio';

-- Check courses.description
SELECT 
    COLUMN_NAME, 
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'coursemgmt_optimized' 
  AND TABLE_NAME = 'courses'
  AND COLUMN_NAME = 'description';

-- Check lessons.content
SELECT 
    COLUMN_NAME, 
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'coursemgmt_optimized' 
  AND TABLE_NAME = 'lessons'
  AND COLUMN_NAME = 'content';

SELECT 'All column types fixed!' AS Status;


-- Fix feedback_rating column type to match Hibernate expectations
-- Hibernate maps Integer to INTEGER, not TINYINT UNSIGNED

USE coursemgmt_optimized;

ALTER TABLE chat_messages 
MODIFY COLUMN feedback_rating INT CHECK (feedback_rating BETWEEN 1 AND 5);


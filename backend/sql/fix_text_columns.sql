-- Fix TEXT columns to LONGTEXT for @Lob annotation compatibility
-- Hibernate @Lob maps to LONGTEXT in MySQL, not TEXT

USE coursemgmt_optimized;

ALTER TABLE chat_messages 
MODIFY COLUMN message_content LONGTEXT NOT NULL,
MODIFY COLUMN response_content LONGTEXT;


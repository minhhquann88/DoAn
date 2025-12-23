-- ============================================
-- MIGRATION SCRIPT: coursemgmt_test -> coursemgmt_optimized
-- ============================================

USE coursemgmt_optimized;

-- ============================================
-- 1. MIGRATE ROLES
-- ============================================

INSERT INTO roles (id, name, description)
SELECT id, name, NULL as description
FROM coursemgmt_test.roles
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- 2. MIGRATE USERS
-- ============================================

INSERT INTO users (
    id, email, username, password, full_name, 
    phone, avatar_url, bio, is_enabled, 
    created_at, updated_at, deleted_at
)
SELECT 
    id, email, username, password, full_name,
    NULL as phone, avatar_url, bio, 
    COALESCE(is_enabled, FALSE) as is_enabled,
    created_at, 
    COALESCE(updated_at, created_at) as updated_at,
    NULL as deleted_at
FROM coursemgmt_test.users
WHERE deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00';

-- ============================================
-- 3. MIGRATE USER ROLES
-- ============================================

INSERT INTO user_roles (user_id, role_id)
SELECT user_id, role_id
FROM coursemgmt_test.user_roles
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = user_roles.user_id)
  AND EXISTS (SELECT 1 FROM roles r WHERE r.id = user_roles.role_id);

-- ============================================
-- 4. MIGRATE PASSWORD RESET TOKENS
-- ============================================

INSERT INTO password_reset_tokens (id, token, user_id, expiry_date, created_at)
SELECT 
    id, token, user_id, expiry_date, 
    COALESCE(created_at, NOW()) as created_at
FROM coursemgmt_test.password_reset_tok
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = password_reset_tok.user_id);

-- ============================================
-- 5. MIGRATE CATEGORIES
-- ============================================

INSERT INTO categories (id, name, description, created_at, updated_at)
SELECT 
    id, name, description,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM coursemgmt_test.categories;

-- ============================================
-- 6. MIGRATE COURSES
-- ============================================

INSERT INTO courses (
    id, title, description, category_id, price,
    image_url, total_duration_in_hours, instructor_id,
    status, total_enrollments, total_lessons,
    average_rating, total_reviews,
    created_at, updated_at, deleted_at
)
SELECT 
    id, title, description, category_id, 
    COALESCE(price, 0.00) as price,
    image_url, 
    COALESCE(total_duration_in_hours, 0) as total_duration_in_hours,
    instructor_id,
    CASE 
        WHEN status = 'PUBLISHED' THEN 'PUBLISHED'
        WHEN status = 'PENDING_APPROVAL' THEN 'PENDING_APPROVAL'
        ELSE 'DRAFT'
    END as status,
    0 as total_enrollments, -- Will be updated by trigger
    0 as total_lessons, -- Will be updated by trigger
    0.00 as average_rating,
    0 as total_reviews,
    created_at,
    COALESCE(updated_at, created_at) as updated_at,
    NULL as deleted_at
FROM coursemgmt_test.courses
WHERE deleted_at IS NULL OR deleted_at = '0000-00-00 00:00:00';

-- ============================================
-- 7. MIGRATE CHAPTERS
-- ============================================

INSERT INTO chapters (id, course_id, title, position, created_at, updated_at)
SELECT 
    id, course_id, title,
    COALESCE(position, 0) as position,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM coursemgmt_test.chapters
WHERE EXISTS (SELECT 1 FROM courses c WHERE c.id = chapters.course_id);

-- ============================================
-- 8. MIGRATE LESSONS
-- ============================================

INSERT INTO lessons (
    id, chapter_id, title, content_type,
    video_url, document_url, content,
    duration_in_minutes, position,
    created_at, updated_at
)
SELECT 
    id, chapter_id, title,
    CASE 
        WHEN content_type = 'VIDEO' THEN 'VIDEO'
        WHEN content_type = 'TEXT' THEN 'TEXT'
        WHEN content_type = 'DOCUMENT' THEN 'DOCUMENT'
        ELSE 'TEXT'
    END as content_type,
    video_url, document_url, content,
    COALESCE(duration_in_minutes, 0) as duration_in_minutes,
    COALESCE(position, 0) as position,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM coursemgmt_test.lessons
WHERE EXISTS (SELECT 1 FROM chapters ch WHERE ch.id = lessons.chapter_id);

-- ============================================
-- 9. MIGRATE ENROLLMENTS
-- ============================================

INSERT INTO enrollments (
    id, user_id, course_id, progress, status,
    enrolled_at, updated_at, completed_at
)
SELECT 
    id, user_id, course_id,
    COALESCE(progress, 0.00) as progress,
    CASE 
        WHEN status = 'COMPLETED' THEN 'COMPLETED'
        ELSE 'IN_PROGRESS'
    END as status,
    COALESCE(enrolled_at, NOW()) as enrolled_at,
    COALESCE(updated_at, enrolled_at) as updated_at,
    CASE 
        WHEN status = 'COMPLETED' THEN updated_at
        ELSE NULL
    END as completed_at
FROM coursemgmt_test.enrollments
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = enrollments.user_id)
  AND EXISTS (SELECT 1 FROM courses c WHERE c.id = enrollments.course_id);

-- ============================================
-- 10. MIGRATE USER PROGRESS
-- ============================================

INSERT INTO user_progress (
    id, enrollment_id, lesson_id, is_completed,
    completed_at, created_at, updated_at
)
SELECT 
    id, enrollment_id, lesson_id,
    COALESCE(is_completed, FALSE) as is_completed,
    completed_at,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM coursemgmt_test.user_progress
WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.id = user_progress.enrollment_id)
  AND EXISTS (SELECT 1 FROM lessons l WHERE l.id = user_progress.lesson_id);

-- ============================================
-- 11. MIGRATE TRANSACTIONS
-- ============================================

INSERT INTO transactions (
    id, user_id, course_id, amount,
    payment_gateway, transaction_code, status,
    created_at, updated_at
)
SELECT 
    id, user_id, course_id,
    COALESCE(amount, 0.00) as amount,
    CASE 
        WHEN payment_gateway = 'VNPAY' THEN 'VNPAY'
        WHEN payment_gateway = 'MOMO' THEN 'MOMO'
        ELSE 'VNPAY'
    END as payment_gateway,
    transaction_code,
    CASE 
        WHEN status = 'SUCCESS' THEN 'SUCCESS'
        WHEN status = 'FAILED' THEN 'FAILED'
        ELSE 'PENDING'
    END as status,
    created_at,
    COALESCE(updated_at, created_at) as updated_at
FROM coursemgmt_test.transactions
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = transactions.user_id)
  AND EXISTS (SELECT 1 FROM courses c WHERE c.id = transactions.course_id);

-- ============================================
-- 12. MIGRATE CERTIFICATES
-- ============================================

INSERT INTO certificates (
    id, certificate_code, enrollment_id, pdf_url, issued_at, created_at
)
SELECT 
    id, certificate_code, enrollment_id, pdf_url,
    COALESCE(issued_at, NOW()) as issued_at,
    COALESCE(created_at, NOW()) as created_at
FROM coursemgmt_test.certificates
WHERE EXISTS (SELECT 1 FROM enrollments e WHERE e.id = certificates.enrollment_id);

-- ============================================
-- 13. MIGRATE CHAT MESSAGES
-- ============================================

INSERT INTO chat_messages (
    id, user_id, session_id, message_content,
    response_content, feedback_rating, created_at
)
SELECT 
    id, user_id, session_id, message_content,
    response_content, feedback_rating,
    COALESCE(created_at, NOW()) as created_at
FROM coursemgmt_test.chat_messages
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = chat_messages.user_id);

-- ============================================
-- 14. MIGRATE RECOMMENDATIONS
-- ============================================

INSERT INTO recommendations (
    id, user_id, course_id, recommendation_score,
    reason, generated_at
)
SELECT 
    id, user_id, course_id,
    COALESCE(recommendation_score, 0.00) as recommendation_score,
    reason,
    COALESCE(generated_at, NOW()) as generated_at
FROM coursemgmt_test.recommendations
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = recommendations.user_id)
  AND EXISTS (SELECT 1 FROM courses c WHERE c.id = recommendations.course_id);

-- ============================================
-- 15. UPDATE STATISTICS
-- ============================================

-- Update course total_enrollments
UPDATE courses c
SET total_enrollments = (
    SELECT COUNT(*) 
    FROM enrollments e 
    WHERE e.course_id = c.id
);

-- Update course total_lessons
UPDATE courses c
SET total_lessons = (
    SELECT COUNT(*) 
    FROM lessons l 
    JOIN chapters ch ON l.chapter_id = ch.id 
    WHERE ch.course_id = c.id
);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Migration completed!' AS Status;

SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'certificates', COUNT(*) FROM certificates;


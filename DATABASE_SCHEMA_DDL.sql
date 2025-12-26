# Database Schema DDL - E-Learning Platform

**Generated from JPA Entity Classes**

---

## ENUM Types

```sql
-- Note: MySQL 8.0+ supports ENUM, but for portability, we'll use VARCHAR with CHECK constraints
-- Alternatively, you can use ENUM types directly in MySQL

-- ERole: ROLE_STUDENT, ROLE_LECTURER, ROLE_ADMIN
-- ECourseStatus: DRAFT, PENDING_APPROVAL, PUBLISHED
-- EEnrollmentStatus: IN_PROGRESS, COMPLETED
-- EContentType: VIDEO, TEXT, DOCUMENT
-- ETransactionStatus: PENDING, SUCCESS, FAILED
-- EPaymentGateway: VNPAY, MOMO
-- EQuestionType: SINGLE_CHOICE, MULTIPLE_CHOICE, ESSAY
-- ETestType: MULTIPLE_CHOICE, ESSAY
-- ESubmissionStatus: PENDING_GRADING, GRADED
```

---

## CREATE TABLE Statements

```sql
-- ============================================
-- 1. ROLES TABLE
-- ============================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    CONSTRAINT chk_role_name CHECK (name IN ('ROLE_STUDENT', 'ROLE_LECTURER', 'ROLE_ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt encrypted',
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio LONGTEXT,
    created_at DATETIME,
    is_enabled BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. USER_ROLES (Junction Table - Many-to-Many)
-- ============================================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. COURSES TABLE
-- ============================================
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description LONGTEXT,
    price DOUBLE NOT NULL,
    image_url VARCHAR(500),
    total_duration_in_hours INT,
    status VARCHAR(30),
    created_at DATETIME,
    updated_at DATETIME,
    instructor_id BIGINT,
    category_id BIGINT,
    CONSTRAINT chk_course_status CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED')),
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. CHAPTERS TABLE
-- ============================================
CREATE TABLE chapters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    position INT,
    course_id BIGINT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. LESSONS TABLE
-- ============================================
CREATE TABLE lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(20),
    video_url VARCHAR(500),
    document_url VARCHAR(500),
    content LONGTEXT,
    position INT,
    duration_in_minutes INT,
    chapter_id BIGINT NOT NULL,
    CONSTRAINT chk_content_type CHECK (content_type IN ('VIDEO', 'TEXT', 'DOCUMENT')),
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    INDEX idx_chapter_id (chapter_id),
    INDEX idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. ENROLLMENTS TABLE
-- ============================================
CREATE TABLE enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enrolled_at DATETIME,
    progress DOUBLE DEFAULT 0.0,
    status VARCHAR(20),
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    CONSTRAINT chk_enrollment_status CHECK (status IN ('IN_PROGRESS', 'COMPLETED')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    UNIQUE KEY uk_user_course (user_id, course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. USER_PROGRESS TABLE
-- ============================================
CREATE TABLE user_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at DATETIME,
    last_watched_time INT COMMENT 'Last watched time in seconds',
    total_duration INT COMMENT 'Total video duration in seconds',
    enrollment_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_is_completed (is_completed),
    UNIQUE KEY uk_enrollment_lesson (enrollment_id, lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    amount DOUBLE NOT NULL,
    status VARCHAR(20),
    payment_gateway VARCHAR(20),
    transaction_code VARCHAR(255),
    created_at DATETIME,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    CONSTRAINT chk_transaction_status CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    CONSTRAINT chk_payment_gateway CHECK (payment_gateway IN ('VNPAY', 'MOMO')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_status (status),
    INDEX idx_transaction_code (transaction_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. CERTIFICATES TABLE
-- ============================================
CREATE TABLE certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    certificate_code VARCHAR(255) NOT NULL UNIQUE,
    pdf_url VARCHAR(500),
    issued_at DATETIME,
    enrollment_id BIGINT NOT NULL UNIQUE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    INDEX idx_certificate_code (certificate_code),
    INDEX idx_enrollment_id (enrollment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. TESTS TABLE
-- ============================================
CREATE TABLE tests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20),
    time_limit_in_minutes INT,
    open_time DATETIME,
    close_time DATETIME,
    lesson_id BIGINT NOT NULL,
    CONSTRAINT chk_test_type CHECK (type IN ('MULTIPLE_CHOICE', 'ESSAY')),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. TEST_QUESTIONS TABLE
-- ============================================
CREATE TABLE test_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_text LONGTEXT NOT NULL,
    question_type VARCHAR(20),
    test_id BIGINT NOT NULL,
    CONSTRAINT chk_question_type CHECK (question_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'ESSAY')),
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    INDEX idx_test_id (test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. TEST_ANSWER_OPTIONS TABLE
-- ============================================
CREATE TABLE test_answer_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    option_text LONGTEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    question_id BIGINT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 15. TEST_RESULTS TABLE
-- ============================================
CREATE TABLE test_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submitted_at DATETIME,
    score DOUBLE,
    status VARCHAR(20),
    feedback LONGTEXT,
    user_id BIGINT NOT NULL,
    test_id BIGINT NOT NULL,
    CONSTRAINT chk_submission_status CHECK (status IN ('PENDING_GRADING', 'GRADED')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_test_id (test_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 16. TEST_RESULT_ANSWERS TABLE
-- ============================================
CREATE TABLE test_result_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    essay_answer LONGTEXT,
    test_result_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    chosen_option_id BIGINT,
    FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (chosen_option_id) REFERENCES test_answer_options(id) ON DELETE SET NULL,
    INDEX idx_test_result_id (test_result_id),
    INDEX idx_question_id (question_id),
    INDEX idx_chosen_option_id (chosen_option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 17. PASSWORD_RESET_TOKEN TABLE
-- ============================================
CREATE TABLE password_reset_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 18. CHAT_MESSAGES TABLE
-- ============================================
CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255),
    message_content LONGTEXT NOT NULL,
    response_content LONGTEXT,
    feedback_rating INT COMMENT '1-5 stars',
    created_at DATETIME,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 19. RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recommendation_score DOUBLE,
    reason TEXT,
    generated_at DATETIME,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_course_id (course_id),
    INDEX idx_score (recommendation_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Foreign Key Relationships Summary

```
users
  ├── user_roles (Many-to-Many with roles)
  ├── courses (as instructor)
  ├── enrollments (as student)
  ├── transactions
  ├── test_results
  ├── password_reset_token
  ├── chat_messages
  └── recommendations

roles
  └── user_roles (Many-to-Many with users)

categories
  └── courses

courses
  ├── chapters
  ├── enrollments
  ├── transactions
  └── recommendations

chapters
  └── lessons

lessons
  ├── user_progress
  └── tests

enrollments
  ├── user_progress
  └── certificates (One-to-One)

tests
  ├── test_questions
  └── test_results

test_questions
  ├── test_answer_options
  └── test_result_answers

test_results
  └── test_result_answers

test_answer_options
  └── test_result_answers (optional)
```

---

## Key Column Names Reference

| Entity | Table Name | Primary Key | Key Foreign Keys |
|--------|------------|-------------|------------------|
| User | `users` | `id` | - |
| Role | `roles` | `id` | - |
| User_Roles | `user_roles` | `user_id`, `role_id` | `user_id`, `role_id` |
| Category | `categories` | `id` | - |
| Course | `courses` | `id` | `instructor_id`, `category_id` |
| Chapter | `chapters` | `id` | `course_id` |
| Lesson | `lessons` | `id` | `chapter_id` |
| Enrollment | `enrollments` | `id` | `user_id`, `course_id` |
| User_Progress | `user_progress` | `id` | `enrollment_id`, `lesson_id` |
| Transaction | `transactions` | `id` | `user_id`, `course_id` |
| Certificate | `certificates` | `id` | `enrollment_id` |
| Test | `tests` | `id` | `lesson_id` |
| Test_Question | `test_questions` | `id` | `test_id` |
| Test_AnswerOption | `test_answer_options` | `id` | `question_id` |
| Test_Result | `test_results` | `id` | `user_id`, `test_id` |
| Test_Result_Answer | `test_result_answers` | `id` | `test_result_id`, `question_id`, `chosen_option_id` |
| PasswordResetToken | `password_reset_token` | `id` | `user_id` |
| Chat_Message | `chat_messages` | `id` | `user_id` |
| Recommendation | `recommendations` | `id` | `user_id`, `course_id` |

---

## Enum Values Reference

| Enum | Values |
|------|--------|
| `ERole` | `ROLE_STUDENT`, `ROLE_LECTURER`, `ROLE_ADMIN` |
| `ECourseStatus` | `DRAFT`, `PENDING_APPROVAL`, `PUBLISHED` |
| `EEnrollmentStatus` | `IN_PROGRESS`, `COMPLETED` |
| `EContentType` | `VIDEO`, `TEXT`, `DOCUMENT` |
| `ETransactionStatus` | `PENDING`, `SUCCESS`, `FAILED` |
| `EPaymentGateway` | `VNPAY`, `MOMO` |
| `EQuestionType` | `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `ESSAY` |
| `ETestType` | `MULTIPLE_CHOICE`, `ESSAY` |
| `ESubmissionStatus` | `PENDING_GRADING`, `GRADED` |

---

## Notes

1. **Data Types:**
   - `BIGINT` for IDs (Long in Java)
   - `INT` for Role ID (Integer in Java)
   - `DOUBLE` for prices, amounts, scores, progress
   - `VARCHAR` for strings with length constraints
   - `LONGTEXT` for `@Lob` fields (descriptions, content)
   - `DATETIME` for `LocalDateTime` fields
   - `BOOLEAN` for boolean fields

2. **Cascade Behavior:**
   - `ON DELETE CASCADE`: When parent is deleted, children are deleted
   - `ON DELETE SET NULL`: When parent is deleted, foreign key is set to NULL (for optional relationships)

3. **Unique Constraints:**
   - `users.username` - Unique
   - `users.email` - Unique
   - `roles.name` - Unique
   - `categories.name` - Unique
   - `certificates.certificate_code` - Unique
   - `certificates.enrollment_id` - Unique (One-to-One)
   - `enrollments(user_id, course_id)` - Unique (prevent duplicate enrollments)
   - `user_progress(enrollment_id, lesson_id)` - Unique (one progress record per enrollment-lesson)

4. **Indexes:**
   - Foreign keys are automatically indexed
   - Additional indexes on frequently queried columns (status, email, username, etc.)

5. **Naming Convention:**
   - Table names: snake_case (e.g., `user_progress`, `test_questions`)
   - Column names: snake_case (e.g., `user_id`, `created_at`)
   - Foreign key columns: `{entity_name}_id` (e.g., `user_id`, `course_id`)

---

**Schema Version:** Generated from JPA Entities  
**Database:** MySQL 8.0+  
**Engine:** InnoDB  
**Charset:** utf8mb4  
**Collation:** utf8mb4_unicode_ci


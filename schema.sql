-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;


-- 1. Institutes Table (Coaching Institute Tenants)
CREATE TABLE IF NOT EXISTS institutes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    logo_url VARCHAR(255) NULL,
    contact_email VARCHAR(255) NOT NULL,
    address TEXT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'institute_admin', 'user') DEFAULT 'user',
    institute_id INT NULL,
    firebase_uid VARCHAR(255) UNIQUE NULL,
    phone_number VARCHAR(20) NULL,
    reset_token VARCHAR(255) NULL,
    reset_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL,
    KEY idx_users_inst_role (institute_id, role, id),
    KEY idx_users_search (full_name(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Categories Table (Hierarchical tree structure)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'folder',
    institute_id INT NULL,
    is_global BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    institute_id INT NULL,
    is_global BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT NULL,
    institute_id INT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    is_all_batches BOOLEAN DEFAULT TRUE,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5b. Quiz-Tags Mapping Table
CREATE TABLE IF NOT EXISTS quiz_tags (
    quiz_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (quiz_id, tag_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5b-2. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5c. Quiz-Batches Mapping Table
CREATE TABLE IF NOT EXISTS quiz_batches (
    quiz_id INT NOT NULL,
    batch_id INT NOT NULL,
    PRIMARY KEY (quiz_id, batch_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5d. Student-Batches Mapping Table
CREATE TABLE IF NOT EXISTS student_batches (
    user_id INT NOT NULL,
    batch_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, batch_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5e. Exam-Batches Mapping Table
CREATE TABLE IF NOT EXISTS exam_batches (
    exam_id INT NOT NULL,
    batch_id INT NOT NULL,
    PRIMARY KEY (exam_id, batch_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options_json JSON NOT NULL,
    correct_answer_index INT NOT NULL,
    explanation TEXT,
    tags_json JSON NULL,
    image_path VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Question Activity Logs Table (Per-question telemetry)
CREATE TABLE IF NOT EXISTS question_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    question_id INT NOT NULL,
    quiz_id INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_sec INT DEFAULT 0,
    selected_option_index INT NOT NULL,
    attempt_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Quiz Attempts Table (Overall completed session metrics)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    accuracy_pct INT NOT NULL,
    time_taken_sec INT NOT NULL,
    mastery_level INT DEFAULT 1,
    details_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═════════════════════════════════════════════════════════════════
-- 9. Dedicated SSC Multi-Section Exam Tables (Phase 2 & Phase 3)
-- ═════════════════════════════════════════════════════════════════

-- Comprehension Passages
CREATE TABLE IF NOT EXISTS passages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    passage_text_en LONGTEXT NOT NULL,
    passage_text_hi LONGTEXT NULL,
    passage_image_url VARCHAR(500) NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Multi-Section Exams
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    category_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    instructions TEXT NULL,
    exam_type ENUM('COMPETITIVE', 'ENTRANCE', 'SELECTION', 'ACADEMIC', 'MOCK_TEST', 'CUSTOM') DEFAULT 'COMPETITIVE',
    mode ENUM('practice', 'actual') DEFAULT 'actual',
    total_duration_mins INT NOT NULL DEFAULT 60,
    positive_marks DECIMAL(5,2) DEFAULT 2.00,
    negative_marks DECIMAL(5,2) DEFAULT 0.50,
    scheduled_start DATETIME NULL,
    scheduled_end DATETIME NULL,
    is_published BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    is_all_batches BOOLEAN DEFAULT TRUE,
    allow_section_switch BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exam-Tags Mapping Table
CREATE TABLE IF NOT EXISTS exam_tags (
    exam_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (exam_id, tag_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exam Sections (Reasoning, GA, Quant, English, etc.)
CREATE TABLE IF NOT EXISTS exam_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    section_order INT DEFAULT 1,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master Question Bank Table (Independent Repository of Questions)
CREATE TABLE IF NOT EXISTS question_bank (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    category_id INT NULL,
    passage_id INT NULL,
    question_text_en LONGTEXT NOT NULL,
    question_text_hi LONGTEXT NULL,
    options_en_json JSON NOT NULL,
    options_hi_json JSON NULL,
    options_images_json JSON NULL,
    correct_option_index INT NOT NULL,
    explanation_en LONGTEXT NULL,
    explanation_hi LONGTEXT NULL,
    explanation_image_url VARCHAR(500) NULL,
    image_url VARCHAR(500) NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    is_global BOOLEAN DEFAULT FALSE,
    tags_json JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL,
    KEY idx_qb_inst_global (institute_id, is_global, id),
    KEY idx_qb_cat (category_id, id),
    KEY idx_qb_diff (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Question Bank Tags Mapping Table
CREATE TABLE IF NOT EXISTS question_bank_tags (
    question_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES question_bank(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exam Section to Master Question Mapping (Many-to-Many Linking)
CREATE TABLE IF NOT EXISTS exam_section_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    question_id INT NOT NULL,
    question_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_sec_q (section_id, question_id),
    FOREIGN KEY (section_id) REFERENCES exam_sections(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES question_bank(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legacy Exam Questions (Retained for backwards compatibility)
CREATE TABLE IF NOT EXISTS exam_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    institute_id INT NOT NULL,
    passage_id INT NULL,
    question_text_en LONGTEXT NOT NULL,
    question_text_hi LONGTEXT NULL,
    options_en_json JSON NOT NULL,
    options_hi_json JSON NULL,
    options_images_json JSON NULL,
    correct_option_index INT NOT NULL,
    explanation_en LONGTEXT NULL,
    explanation_hi LONGTEXT NULL,
    image_url VARCHAR(255) NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    question_order INT DEFAULT 1,
    FOREIGN KEY (section_id) REFERENCES exam_sections(id) ON DELETE CASCADE,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exam Attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    user_id INT NOT NULL,
    institute_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    submit_time DATETIME NULL,
    status ENUM('in_progress', 'completed', 'auto_submitted') DEFAULT 'in_progress',
    total_score DECIMAL(7,2) DEFAULT 0.00,
    correct_count INT DEFAULT 0,
    wrong_count INT DEFAULT 0,
    unattempted_count INT DEFAULT 0,
    accuracy_pct DECIMAL(5,2) DEFAULT 0.00,
    percentile DECIMAL(5,2) NULL,
    institute_rank INT NULL,
    details_json JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exam Item Telemetry Logs (Per-question response)
CREATE TABLE IF NOT EXISTS exam_item_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    exam_question_id INT NOT NULL,
    section_id INT NOT NULL,
    palette_state TINYINT NOT NULL DEFAULT 1,
    selected_option INT NULL,
    is_correct BOOLEAN NULL,
    marks_awarded DECIMAL(5,2) DEFAULT 0.00,
    time_spent_sec INT DEFAULT 0,
    language_used ENUM('en', 'hi') DEFAULT 'en',
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_question_id) REFERENCES exam_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES exam_sections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;



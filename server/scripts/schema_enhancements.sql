-- ==============================================================================
-- EDUTOR AI LMS ENHANCEMENT SCHEMA
-- 1. Study Materials & Batches Mapping (Cloudflare R2)
-- 2. Video Lectures, Batches Mapping & Watch Progress (Bunny.net Stream VOD)
-- 3. Live Classes, Batches Mapping & Live Polls (Bunny Stream Live + WebSockets)
-- ==============================================================================

-- 1. Study Materials Table
CREATE TABLE IF NOT EXISTS study_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    created_by INT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    chapter VARCHAR(150) NULL,
    category ENUM('notes', 'assignment', 'pyq', 'formula_sheet', 'other') DEFAULT 'notes',
    description TEXT NULL,
    file_r2_key VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    is_all_batches BOOLEAN DEFAULT FALSE,
    is_downloadable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1b. Study Material Batches Mapping Table
CREATE TABLE IF NOT EXISTS study_material_batches (
    material_id INT NOT NULL,
    batch_id INT NOT NULL,
    PRIMARY KEY (material_id, batch_id),
    FOREIGN KEY (material_id) REFERENCES study_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Video Lectures Table
CREATE TABLE IF NOT EXISTS video_lectures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    created_by INT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    chapter VARCHAR(150) NULL,
    description TEXT NULL,
    bunny_video_id VARCHAR(100) NOT NULL,
    duration_seconds INT DEFAULT 0,
    thumbnail_url VARCHAR(500) NULL,
    status ENUM('uploading', 'processing', 'ready', 'failed') DEFAULT 'uploading',
    is_all_batches BOOLEAN DEFAULT FALSE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2b. Video Lecture Batches Mapping Table
CREATE TABLE IF NOT EXISTS video_lecture_batches (
    video_id INT NOT NULL,
    batch_id INT NOT NULL,
    PRIMARY KEY (video_id, batch_id),
    FOREIGN KEY (video_id) REFERENCES video_lectures(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2c. Video Watch History / Progress Table
CREATE TABLE IF NOT EXISTS video_watch_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    video_id INT NOT NULL,
    last_position_seconds INT DEFAULT 0,
    total_watched_seconds INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_video (user_id, video_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES video_lectures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Live Classes Table
CREATE TABLE IF NOT EXISTS live_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    instructor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    subject VARCHAR(100) NOT NULL,
    scheduled_start_time DATETIME NOT NULL,
    scheduled_end_time DATETIME NOT NULL,
    actual_start_time DATETIME NULL,
    actual_end_time DATETIME NULL,
    status ENUM('scheduled', 'live', 'completed', 'cancelled') DEFAULT 'scheduled',
    stream_id VARCHAR(100) NULL,
    stream_key VARCHAR(255) NULL,
    rtmp_url VARCHAR(500) NULL,
    hls_playback_url VARCHAR(500) NULL,
    replay_video_id VARCHAR(100) NULL,
    is_all_batches BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3b. Live Class Batches Mapping Table
CREATE TABLE IF NOT EXISTS live_class_batches (
    live_class_id INT NOT NULL,
    batch_id INT NOT NULL,
    PRIMARY KEY (live_class_id, batch_id),
    FOREIGN KEY (live_class_id) REFERENCES live_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3c. Live Polls Table
CREATE TABLE IF NOT EXISTS live_polls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    live_class_id INT NOT NULL,
    question TEXT NOT NULL,
    options_json JSON NOT NULL,
    correct_option INT NOT NULL DEFAULT -1,
    duration_seconds INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (live_class_id) REFERENCES live_classes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3d. Live Poll Responses Table
CREATE TABLE IF NOT EXISTS live_poll_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    poll_id INT NOT NULL,
    user_id INT NOT NULL,
    selected_option INT NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_poll_user (poll_id, user_id),
    FOREIGN KEY (poll_id) REFERENCES live_polls(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Multi-Tenant Bunny Video Library Columns on Institutes Table
ALTER TABLE institutes
    ADD COLUMN IF NOT EXISTS bunny_library_id INT NULL,
    ADD COLUMN IF NOT EXISTS bunny_api_key VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS bunny_token_key VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS bunny_cdn_hostname VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS video_quota_gb INT DEFAULT 50;

import pool from './db.js';

async function migratePhase2() {
  console.log('Starting Phase 2 database migration (SSC Exam Engine)...');

  try {
    // 1. Passages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS passages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          institute_id INT NOT NULL,
          passage_text_en LONGTEXT NOT NULL,
          passage_text_hi LONGTEXT NULL,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Passages table created/verified.');

    // 2. Exams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exams (
          id INT AUTO_INCREMENT PRIMARY KEY,
          institute_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NULL,
          exam_type ENUM('SSC_CGL', 'SSC_CHSL', 'SSC_MTS', 'SSC_CPO', 'CUSTOM') DEFAULT 'SSC_CGL',
          mode ENUM('practice', 'actual') DEFAULT 'actual',
          total_duration_mins INT NOT NULL DEFAULT 60,
          positive_marks DECIMAL(5,2) DEFAULT 2.00,
          negative_marks DECIMAL(5,2) DEFAULT 0.50,
          scheduled_start DATETIME NULL,
          scheduled_end DATETIME NULL,
          is_published BOOLEAN DEFAULT FALSE,
          allow_section_switch BOOLEAN DEFAULT TRUE,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Exams table created/verified.');

    // 3. Exam Sections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          exam_id INT NOT NULL,
          section_name VARCHAR(100) NOT NULL,
          section_order INT DEFAULT 1,
          FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Exam Sections table created/verified.');

    // 4. Exam Questions table
    await pool.query(`
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
    `);
    console.log('✓ Exam Questions table created/verified.');

    // 5. Exam Attempts table
    await pool.query(`
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
    `);
    console.log('✓ Exam Attempts table created/verified.');

    // 6. Exam Item Logs table
    await pool.query(`
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
    `);
    console.log('✓ Exam Item Logs table created/verified.');

    console.log('🚀 Phase 2 Database Migration Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  }
}

migratePhase2();

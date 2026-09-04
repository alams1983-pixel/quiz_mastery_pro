import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'edutor_quiz_db';

export async function runMigrations() {
  console.log('🚀 Starting Master Database Migration...');
  console.log(`📡 Connecting to MySQL host: ${DB_HOST}, DB: ${DB_NAME}`);

  // 1. Ensure Database exists
  const sysConn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS
  });
  await sysConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await sysConn.end();

  // 2. Connect to target database
  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME
  });

  try {
    // Utility to safely add columns to existing tables
    const addColumnSafely = async (table, column, definition) => {
      try {
        const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
        if (cols.length === 0) {
          await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
          console.log(`  ➕ Added column ${column} to ${table}`);
        }
      } catch (err) {
        console.warn(`  ⚠️ Failed adding column ${column} to ${table}:`, err.message);
      }
    };

    // Utility to safely add indexes
    const addIndexSafely = async (table, indexName, columns) => {
      try {
        const [indexes] = await conn.query(`SHOW INDEX FROM \`${table}\` WHERE Key_name = ?`, [indexName]);
        if (indexes.length === 0) {
          await conn.query(`CREATE INDEX \`${indexName}\` ON \`${table}\` (${columns})`);
          console.log(`  ➕ Index created: ${indexName} on ${table}(${columns})`);
        }
      } catch (err) {
        // Skip if table or column doesn't exist yet
      }
    };

    // -------------------------------------------------------------
    // TABLES DEFINITION & UPDATES
    // -------------------------------------------------------------

    // Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NULL,
        password_hash VARCHAR(255) NULL,
        firebase_uid VARCHAR(255) UNIQUE NULL,
        role ENUM('super_admin', 'institute_admin', 'admin', 'user') DEFAULT 'user',
        institute_id INT NULL,
        phone_number VARCHAR(20) NULL,
        reset_token VARCHAR(255) NULL,
        reset_expires DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await addColumnSafely('users', 'firebase_uid', 'VARCHAR(255) UNIQUE NULL');
    await addColumnSafely('users', 'phone_number', 'VARCHAR(20) NULL');
    await addColumnSafely('users', 'reset_token', 'VARCHAR(255) NULL');
    await addColumnSafely('users', 'reset_expires', 'DATETIME NULL');
    await conn.query("ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL");
    await conn.query("ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL");

    // Institutes table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS institutes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NULL,
        logo_url VARCHAR(500) NULL,
        primary_color VARCHAR(20) DEFAULT '#4f46e5',
        secondary_color VARCHAR(20) DEFAULT '#7c3aed',
        welcome_title VARCHAR(255) NULL,
        welcome_subtitle TEXT NULL,
        banner_url VARCHAR(500) NULL,
        allow_global_content BOOLEAN DEFAULT TRUE,
        contact_email VARCHAR(255) NOT NULL,
        address TEXT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await addColumnSafely('institutes', 'slug', 'VARCHAR(100) UNIQUE NULL');
    await addColumnSafely('institutes', 'primary_color', "VARCHAR(20) DEFAULT '#4f46e5'");
    await addColumnSafely('institutes', 'secondary_color', "VARCHAR(20) DEFAULT '#7c3aed'");
    await addColumnSafely('institutes', 'welcome_title', 'VARCHAR(255) NULL');
    await addColumnSafely('institutes', 'welcome_subtitle', 'TEXT NULL');
    await addColumnSafely('institutes', 'banner_url', 'VARCHAR(500) NULL');
    await addColumnSafely('institutes', 'allow_global_content', 'BOOLEAN DEFAULT TRUE');
    await addColumnSafely('institutes', 'logo_url', 'VARCHAR(500) NULL');

    // Institute Memberships table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS institute_memberships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        institute_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('institute_admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_institute (institute_id, user_id),
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Uploaded Assets table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS uploaded_assets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        institute_id INT NULL,
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Categories table
    await conn.query(`
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
    `);

    // Tags table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        institute_id INT NULL,
        is_global BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Quizzes table
    await conn.query(`
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
    `);

    await addColumnSafely('quizzes', 'is_published', 'BOOLEAN DEFAULT TRUE');
    await addColumnSafely('quizzes', 'is_all_batches', 'BOOLEAN DEFAULT TRUE');

    // Quiz Batches table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS quiz_batches (
        quiz_id INT NOT NULL,
        batch_id INT NOT NULL,
        PRIMARY KEY (quiz_id, batch_id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Passages table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS passages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NULL,
        content LONGTEXT NOT NULL,
        passage_text_en LONGTEXT NULL,
        passage_text_hi LONGTEXT NULL,
        passage_json LONGTEXT NULL,
        passage_image_url VARCHAR(500) NULL,
        institute_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await addColumnSafely('passages', 'passage_json', 'LONGTEXT NULL');
    await addColumnSafely('passages', 'passage_image_url', 'VARCHAR(500) NULL');
    await addColumnSafely('passages', 'passage_text_en', 'LONGTEXT NULL');
    await addColumnSafely('passages', 'passage_text_hi', 'LONGTEXT NULL');

    // Question Bank table
    await conn.query(`
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
        image_url VARCHAR(255) NULL,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        tags_json JSON NULL,
        translations_json LONGTEXT NULL,
        is_global BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await addColumnSafely('question_bank', 'explanation_image_url', 'VARCHAR(500) NULL');
    await addColumnSafely('question_bank', 'is_global', 'BOOLEAN DEFAULT FALSE');
    await addColumnSafely('question_bank', 'tags_json', 'JSON NULL');
    await addColumnSafely('question_bank', 'translations_json', 'LONGTEXT NULL');

    // Question Bank Tags table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS question_bank_tags (
        question_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (question_id, tag_id),
        FOREIGN KEY (question_id) REFERENCES question_bank(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Exams table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        institute_id INT NULL,
        category_id INT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructions TEXT NULL,
        exam_type ENUM('COMPETITIVE', 'ENTRANCE', 'SELECTION', 'ACADEMIC', 'MOCK_TEST', 'CUSTOM', 'SSC_CGL', 'SSC_CHSL', 'SSC_MTS', 'SSC_CPO') DEFAULT 'COMPETITIVE',
        duration_minutes INT DEFAULT 60,
        total_marks DECIMAL(10,2) DEFAULT 100.00,
        pass_marks DECIMAL(10,2) DEFAULT 40.00,
        positive_marks DECIMAL(10,2) DEFAULT 1.00,
        negative_marks DECIMAL(10,2) DEFAULT 0.00,
        is_published BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT FALSE,
        is_all_batches BOOLEAN DEFAULT TRUE,
        allow_section_switch BOOLEAN DEFAULT TRUE,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await addColumnSafely('exams', 'is_all_batches', 'BOOLEAN DEFAULT TRUE');
    await addColumnSafely('exams', 'allow_section_switch', 'BOOLEAN DEFAULT TRUE');
    await addColumnSafely('exams', 'category_id', 'INT NULL');

    // Exam Sections table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS exam_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        section_order INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Exam Questions table
    await conn.query(`
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
        translations_json LONGTEXT NULL,
        question_order INT DEFAULT 1,
        FOREIGN KEY (section_id) REFERENCES exam_sections(id) ON DELETE CASCADE,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
        FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await addColumnSafely('exam_questions', 'translations_json', 'LONGTEXT NULL');

    // Exam Section Questions mapping table
    await conn.query(`
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
    `);

    // Exam Attempts table
    await conn.query(`
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

    // Exam Item Logs table
    await conn.query(`
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

    // Batches tables
    await conn.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        institute_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(50) NULL,
        target_exam VARCHAR(150) NULL,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await addColumnSafely('batches', 'code', 'VARCHAR(50) NULL');
    await addColumnSafely('batches', 'target_exam', 'VARCHAR(150) NULL');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS student_batches (
        user_id INT NOT NULL,
        batch_id INT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, batch_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await addColumnSafely('student_batches', 'status', "ENUM('pending', 'approved', 'rejected') DEFAULT 'approved'");

    // -------------------------------------------------------------
    // PERFORMANCE INDEXES
    // -------------------------------------------------------------
    console.log('⚡ Applying Database Performance Indexes...');
    await addIndexSafely('users', 'idx_users_role', 'role');
    await addIndexSafely('users', 'idx_users_institute', 'institute_id');
    await addIndexSafely('users', 'idx_users_firebase_uid', 'firebase_uid');
    await addIndexSafely('quizzes', 'idx_quizzes_institute', 'institute_id');
    await addIndexSafely('quizzes', 'idx_quizzes_category', 'category_id');
    await addIndexSafely('question_bank', 'idx_qb_institute', 'institute_id');
    await addIndexSafely('question_bank', 'idx_qb_category', 'category_id');
    await addIndexSafely('exam_section_questions', 'idx_esq_sec_q', 'section_id, question_id');
    await addIndexSafely('student_batches', 'idx_sb_user_batch', 'user_id, batch_id');
    await addIndexSafely('uploaded_assets', 'idx_asset_user', 'user_id');
    await addIndexSafely('uploaded_assets', 'idx_asset_inst', 'institute_id');

    console.log('✅ Master Database Migration Completed Successfully!');
  } finally {
    await conn.end();
  }
}

// Execute when run directly via CLI (e.g. node server/scripts/migrate.js)
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations().catch(err => {
    console.error('❌ Migration Failed:', err);
    process.exit(1);
  });
}

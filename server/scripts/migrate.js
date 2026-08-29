import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'edutor_quiz_db';

async function runMigrations() {
  console.log('🚀 Starting Database Migration...');
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
    // Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NULL,
        password_hash VARCHAR(255) NULL,
        firebase_uid VARCHAR(128) UNIQUE NULL,
        role ENUM('super_admin', 'institute_admin', 'admin', 'user') DEFAULT 'user',
        institute_id INT NULL,
        phone_number VARCHAR(20) NULL,
        reset_token VARCHAR(255) NULL,
        reset_expires DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Safely add firebase_uid column if missing in existing users table
    const [cols] = await conn.query("SHOW COLUMNS FROM users LIKE 'firebase_uid'");
    if (cols.length === 0) {
      await conn.query("ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(128) UNIQUE NULL AFTER password_hash");
      console.log("  ➕ Added firebase_uid column to users table.");
    }
    // Safely modify email and password_hash to allow NULL for phone-only logins
    await conn.query("ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL");
    await conn.query("ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL");

    // Institutes table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS institutes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NULL,
        logo_url VARCHAR(255) NULL,
        primary_color VARCHAR(20) DEFAULT '#4f46e5',
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

    // Safely add any missing columns to institutes table for existing installations
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

    await addColumnSafely('institutes', 'slug', 'VARCHAR(100) UNIQUE NULL');
    await addColumnSafely('institutes', 'primary_color', "VARCHAR(20) DEFAULT '#4f46e5'");
    await addColumnSafely('institutes', 'welcome_title', 'VARCHAR(255) NULL');
    await addColumnSafely('institutes', 'welcome_subtitle', 'TEXT NULL');
    await addColumnSafely('institutes', 'banner_url', 'VARCHAR(500) NULL');
    await addColumnSafely('institutes', 'allow_global_content', 'BOOLEAN DEFAULT TRUE');
    await addColumnSafely('student_batches', 'status', "ENUM('pending', 'approved', 'rejected') DEFAULT 'approved'");

    // Institute Memberships table (Multi-Institute enrollment)
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

    // Passages table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS passages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NULL,
        content LONGTEXT NOT NULL,
        institute_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

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
        image_url VARCHAR(255) NULL,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        tags_json JSON NULL,
        is_global BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL
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
        exam_type ENUM('COMPETITIVE', 'ENTRANCE', 'SELECTION', 'ACADEMIC', 'MOCK_TEST', 'CUSTOM') DEFAULT 'COMPETITIVE',
        duration_minutes INT DEFAULT 60,
        total_marks DECIMAL(10,2) DEFAULT 100.00,
        pass_marks DECIMAL(10,2) DEFAULT 40.00,
        positive_marks DECIMAL(10,2) DEFAULT 1.00,
        negative_marks DECIMAL(10,2) DEFAULT 0.00,
        is_published BOOLEAN DEFAULT FALSE,
        is_public BOOLEAN DEFAULT FALSE,
        is_all_batches BOOLEAN DEFAULT TRUE,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

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

    // Batches tables
    await conn.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        institute_id INT NOT NULL,
        name VARCHAR(150) NOT NULL,
        code VARCHAR(50) NULL,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

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

    // 3. Add Performance Indexes safely
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

    console.log('⚡ Applying Database Performance Indexes...');
    await addIndexSafely('users', 'idx_users_role', 'role');
    await addIndexSafely('users', 'idx_users_institute', 'institute_id');
    await addIndexSafely('users', 'idx_users_firebase_uid', 'firebase_uid');
    await addIndexSafely('quizzes', 'idx_quizzes_institute', 'institute_id');
    await addIndexSafely('quizzes', 'idx_quizzes_category', 'category_id');
    await addIndexSafely('questions', 'idx_questions_quiz', 'quiz_id');
    await addIndexSafely('question_bank', 'idx_qb_institute', 'institute_id');
    await addIndexSafely('question_bank', 'idx_qb_category', 'category_id');
    await addIndexSafely('exam_section_questions', 'idx_esq_sec_q', 'section_id, question_id');
    await addIndexSafely('quiz_attempts', 'idx_attempts_user_quiz', 'user_id, quiz_id');
    await addIndexSafely('student_batches', 'idx_sb_user_batch', 'user_id, batch_id');

    console.log('✅ Database Migration Completed Successfully!');
  } finally {
    await conn.end();
  }
}

runMigrations().catch(err => {
  console.error('❌ Migration Failed:', err);
  process.exit(1);
});

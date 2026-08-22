import pool from './db.js';

async function migratePhase1() {
  console.log('Starting Phase 1 database migration...');

  try {
    // 1. Create institutes table
    await pool.query(`
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
    `);
    console.log('✓ Institutes table created/verified.');

    // 2. Add columns to users table safely
    const [userCols] = await pool.query('SHOW COLUMNS FROM users');
    const userColNames = userCols.map(c => c.Field);

    if (!userColNames.includes('institute_id')) {
      await pool.query('ALTER TABLE users ADD COLUMN institute_id INT NULL AFTER role');
      console.log('✓ Added institute_id column to users table.');
    }

    if (!userColNames.includes('firebase_uid')) {
      await pool.query('ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE NULL AFTER institute_id');
      console.log('✓ Added firebase_uid column to users table.');
    }

    if (!userColNames.includes('phone_number')) {
      await pool.query('ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL AFTER firebase_uid');
      console.log('✓ Added phone_number column to users table.');
    }

    // Update role ENUM to include institute_admin and super_admin
    await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'institute_admin', 'admin', 'user') DEFAULT 'user'");
    // Map legacy 'admin' role to 'institute_admin' if any
    await pool.query("UPDATE users SET role = 'institute_admin' WHERE role = 'admin'");
    await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'institute_admin', 'user') DEFAULT 'user'");
    console.log('✓ Updated users role ENUM.');

    // Add foreign key constraint if not existing
    try {
      await pool.query('ALTER TABLE users ADD CONSTRAINT fk_user_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL');
      console.log('✓ Foreign key constraint fk_user_institute added.');
    } catch (fkErr) {
      if (!fkErr.message.includes('already exists') && !fkErr.message.includes('Duplicate constraint')) {
        console.log('FK note:', fkErr.message);
      }
    }

    // 3. Add institute_id to quizzes table
    const [quizCols] = await pool.query('SHOW COLUMNS FROM quizzes');
    const quizColNames = quizCols.map(c => c.Field);

    if (!quizColNames.includes('institute_id')) {
      await pool.query('ALTER TABLE quizzes ADD COLUMN institute_id INT NULL AFTER category_id');
      await pool.query('ALTER TABLE quizzes ADD CONSTRAINT fk_quiz_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL');
      console.log('✓ Added institute_id column to quizzes table.');
    }

    console.log('🚀 Phase 1 Database Migration Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  }
}

migratePhase1();

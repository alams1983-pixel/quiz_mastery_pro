import pool from './db.js';

async function migrateQuizzesAccess() {
  console.log('Starting Quizzes Access Control Database Migration...');

  try {
    const [quizCols] = await pool.query('SHOW COLUMNS FROM quizzes');
    const quizColNames = quizCols.map(c => c.Field);

    if (!quizColNames.includes('is_published')) {
      await pool.query('ALTER TABLE quizzes ADD COLUMN is_published BOOLEAN DEFAULT TRUE AFTER is_public');
      console.log('✓ Added is_published column to quizzes table.');
    }

    if (!quizColNames.includes('is_all_batches')) {
      await pool.query('ALTER TABLE quizzes ADD COLUMN is_all_batches BOOLEAN DEFAULT TRUE AFTER is_published');
      console.log('✓ Added is_all_batches column to quizzes table.');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_batches (
          quiz_id INT NOT NULL,
          batch_id INT NOT NULL,
          PRIMARY KEY (quiz_id, batch_id),
          FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
          FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ Verified quiz_batches mapping table.');

    console.log('🚀 Quizzes Access Control Database Migration Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  }
}

migrateQuizzesAccess();

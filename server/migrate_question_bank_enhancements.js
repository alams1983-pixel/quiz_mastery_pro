import pool from './db.js';

async function migrate() {
  try {
    console.log('Running question_bank & passages migration...');

    try {
      await pool.query('ALTER TABLE passages ADD COLUMN passage_image_url VARCHAR(500) NULL AFTER passage_text_hi');
      console.log('Added passage_image_url to passages table.');
    } catch (e) {
      if (!e.message.includes("Duplicate column name")) console.warn(e.message);
    }

    try {
      await pool.query('ALTER TABLE question_bank ADD COLUMN explanation_image_url VARCHAR(500) NULL AFTER explanation_hi');
      console.log('Added explanation_image_url to question_bank table.');
    } catch (e) {
      if (!e.message.includes("Duplicate column name")) console.warn(e.message);
    }

    try {
      await pool.query('ALTER TABLE question_bank ADD COLUMN is_global BOOLEAN DEFAULT FALSE AFTER difficulty');
      console.log('Added is_global to question_bank table.');
    } catch (e) {
      if (!e.message.includes("Duplicate column name")) console.warn(e.message);
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_bank_tags (
        question_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (question_id, tag_id),
        FOREIGN KEY (question_id) REFERENCES question_bank(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Verified question_bank_tags table.');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

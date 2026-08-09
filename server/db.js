import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'edutor_quiz_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initDatabase() {
  try {
    // 1. Ensure DB exists
    const tempConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || ''
    });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'edutor_quiz_db'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConn.end();

    // 2. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'user') DEFAULT 'user',
        reset_token VARCHAR(255) NULL,
        reset_expires DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        parent_id INT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT 'folder',
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INT NULL,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_tags (
        quiz_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (quiz_id, tag_id),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
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
    `);

    await pool.query(`
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
    `);

    await pool.query(`
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
    `);

    // 3. Seed Super Admin
    const superAdminEmail = 'alams1983@gmail.com';
    const [existingSuper] = await pool.query('SELECT id FROM users WHERE email = ?', [superAdminEmail]);
    if (existingSuper.length === 0) {
      const hash = await bcrypt.hash('vanilamaam@2026', 10);
      await pool.query(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Super Administrator', superAdminEmail, hash, 'super_admin']
      );
      console.log('✅ Super Admin seeded: alams1983@gmail.com');
    }

    // 4. Seed Default Categories & Sample Quiz
    const [cats] = await pool.query('SELECT id FROM categories LIMIT 1');
    if (cats.length === 0) {
      const [catRes] = await pool.query(
        'INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)',
        ['General Science', 'Physics, Chemistry, Biology & Geography', 'atom']
      );
      const catId = catRes.insertId;

      const [subCatRes] = await pool.query(
        'INSERT INTO categories (name, parent_id, description, icon) VALUES (?, ?, ?, ?)',
        ['Physics & General Knowledge', catId, 'Core scientific fundamentals', 'flask']
      );
      const subCatId = subCatRes.insertId;

      // Seed Tag
      const [tagRes] = await pool.query(
        'INSERT INTO tags (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)',
        ['Science Fundamentals']
      );
      const tagId = tagRes.insertId;

      // Seed Sample Quiz
      const [quizRes] = await pool.query(
        'INSERT INTO quizzes (title, description, category_id) VALUES (?, ?, ?)',
        ['General Knowledge & Science Mastery', 'Master key scientific concepts by repetition.', subCatId]
      );
      const quizId = quizRes.insertId;

      await pool.query('INSERT IGNORE INTO quiz_tags (quiz_id, tag_id) VALUES (?, ?)', [quizId, tagId]);

      // Seed Questions from quiz_logic.html
      const sampleQuestions = [
        {
          question_text: 'SI unit of Force is?',
          options_json: JSON.stringify(['Joule', 'Newton', 'Pascal', 'Watt', 'Dyne']),
          correct_answer_index: 1,
          explanation: 'Newton is the SI unit of force.',
          tags_json: JSON.stringify(['Physics', 'Units'])
        },
        {
          question_text: 'Which planet is known as the Red Planet?',
          options_json: JSON.stringify(['Venus', 'Mars', 'Jupiter', 'Saturn', 'Mercury']),
          correct_answer_index: 1,
          explanation: 'Mars appears reddish due to iron oxide on its surface.',
          tags_json: JSON.stringify(['Astronomy', 'Planets'])
        },
        {
          question_text: 'What is the chemical symbol for Gold?',
          options_json: JSON.stringify(['Go', 'Gd', 'Au', 'Ag', 'Fe']),
          correct_answer_index: 2,
          explanation: 'Gold\'s chemical symbol Au comes from the Latin word "aurum".',
          tags_json: JSON.stringify(['Chemistry', 'Elements'])
        },
        {
          question_text: 'How many bones are in the adult human body?',
          options_json: JSON.stringify(['206', '208', '204', '210', '202']),
          correct_answer_index: 0,
          explanation: 'The adult human skeleton typically has 206 bones.',
          tags_json: JSON.stringify(['Biology', 'Anatomy'])
        },
        {
          question_text: 'What is the Einstein Mass-Energy equivalence formula?',
          options_json: JSON.stringify(['$E = mc^2$', '$F = ma$', '$PV = nRT$', '$v = u + at$', '$\\int x dx$']),
          correct_answer_index: 0,
          explanation: 'Mass-energy equivalence states that energy ($E$) equals mass ($m$) times the speed of light ($c$) squared.',
          tags_json: JSON.stringify(['Physics', 'LaTeX'])
        },
        {
          question_text: 'What is the speed of light approximately in km/s?',
          options_json: JSON.stringify(['300,000', '150,000', '500,000', '100,000', '250,000']),
          correct_answer_index: 0,
          explanation: 'Light travels at about 299,792 km/s in a vacuum.',
          tags_json: JSON.stringify(['Physics', 'Speed'])
        }
      ];

      for (const q of sampleQuestions) {
        await pool.query(
          'INSERT INTO questions (quiz_id, question_text, options_json, correct_answer_index, explanation, tags_json) VALUES (?, ?, ?, ?, ?, ?)',
          [quizId, q.question_text, q.options_json, q.correct_answer_index, q.explanation, q.tags_json]
        );
      }
      console.log('✅ Sample categories, tags, and quiz seeded.');
    }
  } catch (err) {
    console.error('❌ Database Initialization Error:', err);
  }
}

export default pool;

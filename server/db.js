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
    // 1. Verify Pool Connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified.');

    // 2. Automatically ensure missing columns exist on existing production tables
    const addColumnSafely = async (table, column, definition) => {
      try {
        const [cols] = await pool.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
        if (cols.length === 0) {
          await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
          console.log(`  ➕ Auto-added missing column ${column} to ${table}`);
        }
      } catch (err) {
        console.warn(`  ⚠️ Column check ${column} on ${table}:`, err.message);
      }
    };

    await addColumnSafely('institutes', 'slug', 'VARCHAR(255) UNIQUE NULL');
    await addColumnSafely('institutes', 'primary_color', "VARCHAR(20) DEFAULT '#0d9488'");
    await addColumnSafely('institutes', 'secondary_color', "VARCHAR(20) DEFAULT '#7c3aed'");
    await addColumnSafely('institutes', 'welcome_title', 'VARCHAR(255) NULL');
    await addColumnSafely('institutes', 'welcome_subtitle', 'TEXT NULL');
    await addColumnSafely('institutes', 'logo_url', 'VARCHAR(500) NULL');
    await addColumnSafely('student_batches', 'status', "ENUM('pending', 'approved', 'rejected') DEFAULT 'approved'");

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

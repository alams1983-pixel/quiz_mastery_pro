import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function safeParseJSON(str, fallback = null) {
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    try {
      const cleaned = str
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\')
        .replace(/,(\s*[\}\]])/g, '$1');
      return JSON.parse(cleaned);
    } catch (e2) {
      return fallback;
    }
  }
}

function fromBase64Utf8(str) {
  if (typeof str !== 'string') return null;
  try {
    const raw = Buffer.from(str, 'base64').toString('utf8');
    const jsonStr = decodeURIComponent(raw.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return safeParseJSON(jsonStr, null);
  } catch (e) {
    try {
      const direct = Buffer.from(str, 'base64').toString('utf8');
      return safeParseJSON(direct, null);
    } catch (e2) {
      return null;
    }
  }
}

// Setup Multer for image upload
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// 1. Get Quizzes (Catalog view with category and tag filters)
router.get('/', async (req, res) => {
  try {
    const { category_id, tag_id, search } = req.query;

    let sql = `
      SELECT q.*, c.name as category_name, c.icon as category_icon,
             COUNT(DISTINCT quest.id) as question_count,
             GROUP_CONCAT(DISTINCT t.name) as tag_names
      FROM quizzes q
      LEFT JOIN categories c ON q.category_id = c.id
      LEFT JOIN questions quest ON quest.quiz_id = q.id
      LEFT JOIN quiz_tags qt ON qt.quiz_id = q.id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      sql += ` AND q.category_id = ?`;
      params.push(category_id);
    }
    if (tag_id) {
      sql += ` AND qt.tag_id = ?`;
      params.push(tag_id);
    }
    if (search) {
      sql += ` AND (q.title LIKE ? OR q.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` GROUP BY q.id ORDER BY q.created_at DESC`;

    const [quizzes] = await pool.query(sql, params);
    res.json({ quizzes });
  } catch (err) {
    console.error('Fetch Quizzes Error:', err);
    res.status(500).json({ error: 'Error fetching quizzes.' });
  }
});

// 2. Get Single Quiz Details
router.get('/:id', async (req, res) => {
  try {
    const quizId = req.params.id;
    const [quizzes] = await pool.query(`
      SELECT q.*, c.name as category_name
      FROM quizzes q
      LEFT JOIN categories c ON q.category_id = c.id
      WHERE q.id = ?
    `, [quizId]);

    if (quizzes.length === 0) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    const [questions] = await pool.query('SELECT COUNT(*) as total FROM questions WHERE quiz_id = ?', [quizId]);
    res.json({ quiz: quizzes[0], questionCount: questions[0].total });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching quiz details.' });
  }
});

// 3. Get Questions for a Quiz
router.get('/:id/questions', async (req, res) => {
  try {
    const quizId = req.params.id;
    const [questions] = await pool.query('SELECT * FROM questions WHERE quiz_id = ? ORDER BY id ASC', [quizId]);

    const formatted = questions.map(q => ({
      ...q,
      options: safeParseJSON(q.options_json, []),
      tags: safeParseJSON(q.tags_json, [])
    }));

    res.json({ questions: formatted });
  } catch (err) {
    console.error('Fetch Questions Error:', err);
    res.status(500).json({ error: 'Error fetching questions.' });
  }
});

// 4. Create Quiz (Admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description, category_id, tag_ids } = req.body;
    if (!title) return res.status(400).json({ error: 'Quiz title is required.' });

    const [result] = await pool.query(
      'INSERT INTO quizzes (title, description, category_id, created_by) VALUES (?, ?, ?, ?)',
      [title, description || '', category_id || null, req.user.id]
    );

    const quizId = result.insertId;

    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await pool.query('INSERT IGNORE INTO quiz_tags (quiz_id, tag_id) VALUES (?, ?)', [quizId, tagId]);
      }
    }

    res.status(201).json({ message: 'Quiz created successfully.', quizId });
  } catch (err) {
    res.status(500).json({ error: 'Error creating quiz.' });
  }
});

// 5. Update Quiz (Admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const quizId = req.params.id;
    const { title, description, category_id, tag_ids } = req.body;

    await pool.query(
      'UPDATE quizzes SET title = ?, description = ?, category_id = ? WHERE id = ?',
      [title, description || '', category_id || null, quizId]
    );

    if (Array.isArray(tag_ids)) {
      await pool.query('DELETE FROM quiz_tags WHERE quiz_id = ?', [quizId]);
      for (const tagId of tag_ids) {
        await pool.query('INSERT IGNORE INTO quiz_tags (quiz_id, tag_id) VALUES (?, ?)', [quizId, tagId]);
      }
    }

    res.json({ message: 'Quiz updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating quiz.' });
  }
});

// 6. Delete Quiz (Admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Quiz deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting quiz.' });
  }
});

// 7. Add Question to Quiz (Admin - with optional image upload)
router.post('/:id/questions', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const quizId = req.params.id;
    const { question_text, options, correct_answer_index, explanation, tags } = req.body;

    if (!question_text || !options) {
      return res.status(400).json({ error: 'Question text and options are required.' });
    }

    let parsedOptions = options;
    if (typeof options === 'string') {
      try { parsedOptions = JSON.parse(options); } catch (e) { parsedOptions = options.split(','); }
    }

    let parsedTags = tags;
    if (typeof tags === 'string') {
      try { parsedTags = JSON.parse(tags); } catch (e) { parsedTags = tags ? tags.split(',') : []; }
    }

    const image_path = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      'INSERT INTO questions (quiz_id, question_text, options_json, correct_answer_index, explanation, tags_json, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [quizId, question_text, JSON.stringify(parsedOptions), parseInt(correct_answer_index, 10) || 0, explanation || '', JSON.stringify(parsedTags || []), image_path]
    );

    res.status(201).json({ message: 'Question added.', questionId: result.insertId });
  } catch (err) {
    console.error('Add Question Error:', err);
    res.status(500).json({ error: 'Error adding question.' });
  }
});

// 8. Bulk Add Questions (Admin)
router.post('/:id/questions/bulk', requireAdmin, async (req, res) => {
  try {
    const quizId = req.params.id;
    let { questions, encodedPayload } = req.body;

    if (encodedPayload) {
      const decoded = fromBase64Utf8(encodedPayload);
      if (Array.isArray(decoded)) {
        questions = decoded;
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'No questions provided for bulk upload.' });
    }

    let count = 0;
    for (const q of questions) {
      if (!q.question_text || !q.options) continue;

      const opts = Array.isArray(q.options) ? q.options : safeParseJSON(q.options, [String(q.options)]);
      const tags = Array.isArray(q.tags) ? q.tags : safeParseJSON(q.tags, []);

      await pool.query(
        'INSERT INTO questions (quiz_id, question_text, options_json, correct_answer_index, explanation, tags_json) VALUES (?, ?, ?, ?, ?, ?)',
        [
          quizId,
          q.question_text,
          JSON.stringify(opts),
          parseInt(q.correct_answer_index, 10) || 0,
          q.explanation || '',
          JSON.stringify(tags)
        ]
      );
      count++;
    }

    res.json({ message: `Successfully inserted ${count} questions.` });
  } catch (err) {
    console.error('Bulk Upload Error:', err);
    res.status(500).json({ error: 'Error processing bulk upload.' });
  }
});

// 9. Update Single Question (Admin)
router.put('/questions/:qId', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const qId = req.params.qId;
    const { question_text, options, correct_answer_index, explanation, tags } = req.body;

    let parsedOptions = options;
    if (typeof options === 'string') {
      try { parsedOptions = JSON.parse(options); } catch (e) { parsedOptions = options.split(','); }
    }

    let parsedTags = tags;
    if (typeof tags === 'string') {
      try { parsedTags = JSON.parse(tags); } catch (e) { parsedTags = tags ? tags.split(',') : []; }
    }

    let sql = 'UPDATE questions SET question_text = ?, options_json = ?, correct_answer_index = ?, explanation = ?, tags_json = ?';
    const params = [question_text, JSON.stringify(parsedOptions), parseInt(correct_answer_index, 10) || 0, explanation || '', JSON.stringify(parsedTags || [])];

    if (req.file) {
      sql += ', image_path = ?';
      params.push(req.file.filename);
    }

    sql += ' WHERE id = ?';
    params.push(qId);

    await pool.query(sql, params);
    res.json({ message: 'Question updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating question.' });
  }
});

// 10. Delete Single Question (Admin)
router.delete('/questions/:qId', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE id = ?', [req.params.qId]);
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting question.' });
  }
});

export default router;

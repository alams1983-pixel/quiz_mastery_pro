import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

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
  if (typeof str !== 'string' || !str.trim()) return null;
  try {
    const raw = Buffer.from(str, 'base64').toString('utf8');
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p)) return p;
    } catch (e1) {}

    try {
      const p = JSON.parse(decodeURIComponent(escape(raw)));
      if (Array.isArray(p)) return p;
    } catch (e2) {}

    try {
      const jsonStr = decodeURIComponent(raw.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const p = JSON.parse(jsonStr);
      if (Array.isArray(p)) return p;
    } catch (e3) {}

    return safeParseJSON(raw, null);
  } catch (e) {
    console.error('[SERVER] Base64 decode failed:', e);
    return null;
  }
}

function unescapeUnicode(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
}

function deepUnescape(val) {
  if (typeof val === 'string') return unescapeUnicode(val);
  if (Array.isArray(val)) return val.map(deepUnescape);
  if (val && typeof val === 'object') {
    const res = {};
    for (const key of Object.keys(val)) {
      res[key] = deepUnescape(val[key]);
    }
    return res;
  }
  return val;
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

// Helper: Verify Admin ownership/permission for a Quiz
async function verifyQuizOwnership(req, quizId) {
  if (!req.user) return false;
  if (req.user.role === 'super_admin') return true;

  const [rows] = await pool.query('SELECT institute_id, created_by FROM quizzes WHERE id = ?', [quizId]);
  if (rows.length === 0) return false;

  const quiz = rows[0];
  if (req.user.institute_id && quiz.institute_id && req.user.institute_id === quiz.institute_id) {
    return true;
  }
  if (quiz.created_by && quiz.created_by === req.user.id) {
    return true;
  }
  return false;
}

// Helper: Verify Student/User access permission for a Quiz
async function verifyQuizStudentAccess(user, quizId) {
  const [rows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
  if (rows.length === 0) return { allowed: false, error: 'Quiz not found.', status: 404 };

  const quiz = rows[0];

  // 1. Draft check
  if (!quiz.is_published && (!user || (user.role !== 'super_admin' && user.role !== 'institute_admin' && user.id !== quiz.created_by))) {
    return { allowed: false, error: 'This practice quiz is currently in draft mode.', status: 403 };
  }

  // 2. Super Admin or Creator
  if (user && (user.role === 'super_admin' || user.id === quiz.created_by)) {
    return { allowed: true, quiz };
  }

  // 3. Public Quiz check
  if (quiz.is_public) {
    // Check if user's institute disables global content
    const instId = user ? (user.institute_id || 0) : 0;
    if (instId > 0) {
      const [insts] = await pool.query('SELECT allow_global_content FROM institutes WHERE id = ?', [instId]);
      if (insts.length > 0 && insts[0].allow_global_content === 0 && quiz.institute_id !== instId) {
        return { allowed: false, error: 'Global public quizzes are disabled by your coaching institute.', status: 403 };
      }
    }
    return { allowed: true, quiz };
  }

  // 4. Private Institute Quiz check
  if (!user) {
    return { allowed: false, error: 'Sign in to access this coaching quiz.', status: 401 };
  }

  // Direct user.institute_id match if quiz is available to all batches
  if (quiz.is_all_batches && user.institute_id && quiz.institute_id && user.institute_id === quiz.institute_id) {
    return { allowed: true, quiz };
  }

  // Multi-Institute Memberships check if quiz is available to all batches
  if (quiz.is_all_batches && quiz.institute_id) {
    const [mems] = await pool.query(
      'SELECT id FROM institute_memberships WHERE user_id = ? AND institute_id = ? AND status = "active"',
      [user.id, quiz.institute_id]
    );
    if (mems.length > 0) {
      return { allowed: true, quiz };
    }
  }

  // Student Batches check (Must be approved)
  const [batches] = await pool.query(`
    SELECT qb.batch_id FROM quiz_batches qb
    JOIN student_batches sb ON qb.batch_id = sb.batch_id
    WHERE qb.quiz_id = ? AND sb.user_id = ? AND (sb.status = 'approved' OR sb.status IS NULL)
  `, [quizId, user.id]);

  if (batches.length > 0) {
    return { allowed: true, quiz };
  }

  return { allowed: false, error: 'Access denied to this coaching practice quiz. Approved batch membership required.', status: 403 };
}

// 1. Get Quizzes (Scoped by role, institute, student batch, and publication status)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category_id, tag_id, search } = req.query;
    const user = req.user;

    let sql = `
      SELECT q.*, c.name as category_name, c.icon as category_icon,
             COUNT(DISTINCT quest.id) as question_count,
             GROUP_CONCAT(DISTINCT t.name) as tag_names,
             GROUP_CONCAT(DISTINCT t.id) as tag_ids,
             GROUP_CONCAT(DISTINCT qb.batch_id) as batch_ids
      FROM quizzes q
      LEFT JOIN categories c ON q.category_id = c.id
      LEFT JOIN questions quest ON quest.quiz_id = q.id
      LEFT JOIN quiz_tags qt ON qt.quiz_id = q.id
      LEFT JOIN tags t ON qt.tag_id = t.id
      LEFT JOIN quiz_batches qb ON qb.quiz_id = q.id
      WHERE 1=1
    `;
    const params = [];

    // Multitenant & Role Scoping
    if (!user || user.role === 'user') {
      let allowGlobal = 1;
      const instId = user ? (user.institute_id || 0) : 0;
      if (instId > 0) {
        const [instInfo] = await pool.query('SELECT allow_global_content FROM institutes WHERE id = ?', [instId]);
        if (instInfo.length > 0 && instInfo[0].allow_global_content === 0) {
          allowGlobal = 0;
        }
      }

      sql += ` AND q.is_published = 1 AND (
        (q.is_public = 1 AND ${allowGlobal === 1 ? '1=1' : '1=0'}) OR (
          q.institute_id = ? AND (
            q.is_all_batches = 1 OR q.id IN (
              SELECT qb_sub.quiz_id FROM quiz_batches qb_sub
              JOIN student_batches sb_sub ON qb_sub.batch_id = sb_sub.batch_id
              WHERE sb_sub.user_id = ? AND (sb_sub.status = 'approved' OR sb_sub.status IS NULL)
            )
          )
        )
      )`;
      params.push(instId, user ? user.id : -1);
    } else if (user.role === 'institute_admin' || user.role === 'admin') {
      sql += ` AND (q.institute_id = ? OR q.is_public = 1)`;
      params.push(user.institute_id || -1);
    }

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
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const quizId = req.params.id;
    const access = await verifyQuizStudentAccess(req.user, quizId);
    if (!access.allowed) {
      return res.status(access.status || 403).json({ error: access.error });
    }

    const [quizzes] = await pool.query(`
      SELECT q.*, c.name as category_name,
             GROUP_CONCAT(DISTINCT qb.batch_id) as batch_ids
      FROM quizzes q
      LEFT JOIN categories c ON q.category_id = c.id
      LEFT JOIN quiz_batches qb ON qb.quiz_id = q.id
      WHERE q.id = ?
      GROUP BY q.id
    `, [quizId]);

    const quiz = quizzes[0];
    const [questions] = await pool.query('SELECT COUNT(*) as total FROM questions WHERE quiz_id = ?', [quizId]);
    res.json({ quiz, questionCount: questions[0].total });
  } catch (err) {
    console.error('Fetch Quiz Error:', err);
    res.status(500).json({ error: 'Error fetching quiz details.' });
  }
});

// 3. Get Questions for a Quiz
router.get('/:id/questions', optionalAuth, async (req, res) => {
  try {
    const quizId = req.params.id;
    const access = await verifyQuizStudentAccess(req.user, quizId);
    if (!access.allowed) {
      return res.status(access.status || 403).json({ error: access.error });
    }

    const [questions] = await pool.query('SELECT * FROM questions WHERE quiz_id = ? ORDER BY id ASC', [quizId]);

    const formatted = questions.map(q => ({
      ...q,
      question_text: unescapeUnicode(q.question_text),
      explanation: unescapeUnicode(q.explanation),
      options: deepUnescape(safeParseJSON(q.options_json, [])),
      tags: deepUnescape(safeParseJSON(q.tags_json, []))
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
    const { title, description, category_id, tag_ids, is_public, is_published, is_all_batches, batch_ids } = req.body;
    if (!title) return res.status(400).json({ error: 'Quiz title is required.' });

    const instId = req.user.role === 'super_admin' ? (req.body.institute_id || req.user.institute_id || null) : req.user.institute_id;
    if (req.user.role !== 'super_admin' && !instId) {
      return res.status(400).json({ error: 'Institute ID is required to create a quiz.' });
    }

    // Global Master Category Validation: Globally public quizzes MUST use Super Admin Global Master Category
    if (is_public && category_id) {
      const [cats] = await pool.query('SELECT is_global, institute_id FROM categories WHERE id = ?', [category_id]);
      if (cats.length > 0 && cats[0].institute_id !== null && !cats[0].is_global) {
        return res.status(400).json({ error: 'To publish a quiz globally, you must select a standardized Global Master Category (created by Super Admin).' });
      }
    }

    const isAllBatchesVal = is_all_batches !== undefined ? !!is_all_batches : (!Array.isArray(batch_ids) || batch_ids.length === 0);
    const isPublishedVal = is_published !== undefined ? (is_published ? 1 : 0) : 1;

    const [result] = await pool.query(
      'INSERT INTO quizzes (title, description, category_id, institute_id, is_public, is_published, is_all_batches, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title.trim(), description || '', category_id || null, instId || null, is_public ? 1 : 0, isPublishedVal, isAllBatchesVal ? 1 : 0, req.user.id]
    );

    const quizId = result.insertId;

    // Attach tags
    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await pool.query('INSERT IGNORE INTO quiz_tags (quiz_id, tag_id) VALUES (?, ?)', [quizId, tagId]);
      }
    }

    // Attach batches
    if (!isAllBatchesVal && Array.isArray(batch_ids) && batch_ids.length > 0) {
      for (const bId of batch_ids) {
        await pool.query('INSERT IGNORE INTO quiz_batches (quiz_id, batch_id) VALUES (?, ?)', [quizId, bId]);
      }
    }

    res.status(201).json({ message: 'Quiz created successfully.', quizId });
  } catch (err) {
    console.error('Create Quiz Error:', err);
    res.status(500).json({ error: 'Error creating quiz.' });
  }
});

// 5. Update Quiz (Admin - with strict ownership check)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const quizId = req.params.id;
    const isAllowed = await verifyQuizOwnership(req, quizId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to modify this practice quiz.' });
    }

    const { title, description, category_id, tag_ids, is_public, is_published, is_all_batches, batch_ids } = req.body;

    if (is_public && category_id) {
      const [cats] = await pool.query('SELECT is_global, institute_id FROM categories WHERE id = ?', [category_id]);
      if (cats.length > 0 && cats[0].institute_id !== null && !cats[0].is_global) {
        return res.status(400).json({ error: 'To publish a quiz globally, you must select a standardized Global Master Category.' });
      }
    }

    const isAllBatchesVal = is_all_batches !== undefined ? !!is_all_batches : (!Array.isArray(batch_ids) || batch_ids.length === 0);
    const isPublishedVal = is_published !== undefined ? (is_published ? 1 : 0) : 1;

    await pool.query(
      'UPDATE quizzes SET title = ?, description = ?, category_id = ?, is_public = ?, is_published = ?, is_all_batches = ? WHERE id = ?',
      [title.trim(), description || '', category_id || null, is_public ? 1 : 0, isPublishedVal, isAllBatchesVal ? 1 : 0, quizId]
    );

    // Update Tags
    if (Array.isArray(tag_ids)) {
      await pool.query('DELETE FROM quiz_tags WHERE quiz_id = ?', [quizId]);
      for (const tagId of tag_ids) {
        await pool.query('INSERT IGNORE INTO quiz_tags (quiz_id, tag_id) VALUES (?, ?)', [quizId, tagId]);
      }
    }

    // Update Batches
    await pool.query('DELETE FROM quiz_batches WHERE quiz_id = ?', [quizId]);
    if (!isAllBatchesVal && Array.isArray(batch_ids) && batch_ids.length > 0) {
      for (const bId of batch_ids) {
        await pool.query('INSERT IGNORE INTO quiz_batches (quiz_id, batch_id) VALUES (?, ?)', [quizId, bId]);
      }
    }

    res.json({ message: 'Quiz updated successfully.' });
  } catch (err) {
    console.error('Update Quiz Error:', err);
    res.status(500).json({ error: 'Error updating quiz.' });
  }
});

// 6. Delete Quiz (Admin - with strict ownership check)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const quizId = req.params.id;
    const isAllowed = await verifyQuizOwnership(req, quizId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to delete this practice quiz.' });
    }

    await pool.query('DELETE FROM quizzes WHERE id = ?', [quizId]);
    res.json({ message: 'Quiz deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting quiz.' });
  }
});

// 7. Add Question to Quiz (Admin - with ownership check)
router.post('/:id/questions', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const quizId = req.params.id;
    const isAllowed = await verifyQuizOwnership(req, quizId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to add questions to this practice quiz.' });
    }

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

// 8. Bulk Add Questions (Admin - with ownership check)
router.post('/:id/questions/bulk', requireAdmin, async (req, res) => {
  try {
    const quizId = req.params.id;
    const isAllowed = await verifyQuizOwnership(req, quizId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to import questions to this practice quiz.' });
    }

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
    const skippedDetails = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qText = unescapeUnicode(q.question_text_en || q.question_en || q.question_text || q.question || '');
      
      let optsArray = q.options_en;
      if (!optsArray || !Array.isArray(optsArray) || optsArray.length === 0) {
        optsArray = Array.isArray(q.options) ? q.options : safeParseJSON(q.options, []);
      }

      if (!qText || !optsArray || !Array.isArray(optsArray) || optsArray.length === 0) {
        const reason = `Question #${i + 1} missing text or options`;
        skippedDetails.push(reason);
        continue;
      }

      const correctIdx = q.correct_option_index !== undefined
        ? parseInt(q.correct_option_index, 10)
        : (q.answer !== undefined
            ? parseInt(q.answer, 10)
            : (q.correct_answer !== undefined ? parseInt(q.correct_answer, 10) : (parseInt(q.correct_answer_index, 10) || 0)));

      const qExpl = unescapeUnicode(q.explanation_en || q.explanation || '');

      await pool.query(
        'INSERT INTO questions (quiz_id, question_text, options_json, correct_answer_index, explanation, tags_json) VALUES (?, ?, ?, ?, ?, ?)',
        [
          quizId,
          qText,
          JSON.stringify(optsArray),
          correctIdx,
          qExpl,
          '[]'
        ]
      );
      count++;
    }

    if (count === 0) {
      return res.status(400).json({ 
        error: `0 out of ${questions.length} questions could be inserted. Sample skip reasons: ${skippedDetails.slice(0, 3).join('; ')}`
      });
    }

    res.json({ message: `Successfully inserted ${count} questions.` });
  } catch (err) {
    console.error('Bulk Upload Error:', err);
    res.status(500).json({ error: `Error processing bulk upload: ${err.message}` });
  }
});

// 9. Update Single Question (Admin - with ownership check)
router.put('/questions/:qId', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const qId = req.params.qId;

    // Get parent quiz ID
    const [qRows] = await pool.query('SELECT quiz_id FROM questions WHERE id = ?', [qId]);
    if (qRows.length === 0) return res.status(404).json({ error: 'Question not found.' });

    const isAllowed = await verifyQuizOwnership(req, qRows[0].quiz_id);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to edit this question.' });
    }

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

// 10. Delete Single Question (Admin - with ownership check)
router.delete('/questions/:qId', requireAdmin, async (req, res) => {
  try {
    const qId = req.params.qId;

    const [qRows] = await pool.query('SELECT quiz_id FROM questions WHERE id = ?', [qId]);
    if (qRows.length === 0) return res.status(404).json({ error: 'Question not found.' });

    const isAllowed = await verifyQuizOwnership(req, qRows[0].quiz_id);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to delete this question.' });
    }

    await pool.query('DELETE FROM questions WHERE id = ?', [qId]);
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting question.' });
  }
});

export default router;

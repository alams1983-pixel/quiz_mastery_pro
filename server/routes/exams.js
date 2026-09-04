import express from 'express';
import pool from '../db.js';
import { requireAuth, requireInstituteAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

function safeJSONParse(str, fallback = []) {
  if (!str) return fallback;
  if (typeof str !== 'string') return str;
  try { return JSON.parse(str); } catch (e) { return fallback; }
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/uploads/')) return trimmed;
  if (trimmed.startsWith('uploads/')) return '/' + trimmed;
  if (trimmed.startsWith('/api/images/')) return trimmed.replace('/api/images/', '/uploads/');
  if (trimmed.startsWith('api/images/')) return '/' + trimmed.replace('api/images/', 'uploads/');
  if (/^img_\d+_\d+\.(jpg|jpeg|png|webp|gif)$/i.test(trimmed)) return `/uploads/${trimmed}`;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
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

    return safeJSONParse(raw, null);
  } catch (e) {
    console.error('[SERVER] Base64 decode failed:', e);
    return null;
  }
}

function formatMySQLDatetime(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// 0. Batch / Class / Group Management Endpoints
router.get('/batches/all', requireAuth, async (req, res) => {
  try {
    const instId = req.user.role === 'super_admin' ? (req.query.institute_id || req.user.institute_id) : req.user.institute_id;
    if (!instId) return res.json({ batches: [] });

    const [batches] = await pool.query(`
      SELECT b.*, COUNT(DISTINCT sb.user_id) as student_count
      FROM batches b
      LEFT JOIN student_batches sb ON b.id = sb.batch_id
      WHERE b.institute_id = ?
      GROUP BY b.id
      ORDER BY b.id DESC
    `, [instId]);

    res.json({ batches });
  } catch (err) {
    console.error('Fetch Batches Error:', err);
    res.status(500).json({ error: 'Error fetching batches.' });
  }
});

router.post('/batches', requireInstituteAdmin, async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Batch/Class name is required.' });

    const instId = req.user.role === 'super_admin' ? (req.body.institute_id || 1) : req.user.institute_id;

    const [result] = await pool.query(`
      INSERT INTO batches (institute_id, name, code, description)
      VALUES (?, ?, ?, ?)
    `, [instId, name.trim(), code ? code.trim() : null, description || '']);

    res.status(201).json({ message: 'Batch created successfully.', batchId: result.insertId });
  } catch (err) {
    console.error('Create Batch Error:', err);
    res.status(500).json({ error: 'Error creating batch.' });
  }
});

router.delete('/batches/:id', requireInstituteAdmin, async (req, res) => {
  try {
    const batchId = req.params.id;
    const [rows] = await pool.query('SELECT institute_id FROM batches WHERE id = ?', [batchId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Batch not found.' });

    if (req.user.role !== 'super_admin' && rows[0].institute_id !== req.user.institute_id) {
      return res.status(403).json({ error: 'Access denied. You can only delete batches belonging to your institute.' });
    }

    await pool.query('DELETE FROM batches WHERE id = ?', [batchId]);
    res.json({ message: 'Batch deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting batch.' });
  }
});

// 0b. Get Pending Student Batch Join Requests for Teacher's Institute
router.get('/batches/pending-requests', requireInstituteAdmin, async (req, res) => {
  try {
    const instId = req.user.role === 'super_admin' ? (req.query.institute_id || req.user.institute_id) : req.user.institute_id;
    if (!instId) return res.json({ requests: [] });

    const [requests] = await pool.query(`
      SELECT sb.user_id, sb.batch_id, sb.status, sb.created_at,
             u.full_name as student_name, u.email as student_email, u.phone_number,
             b.name as batch_name, b.code as batch_code
      FROM student_batches sb
      JOIN batches b ON sb.batch_id = b.id
      JOIN users u ON sb.user_id = u.id
      WHERE b.institute_id = ? AND sb.status = 'pending'
      ORDER BY sb.created_at DESC
    `, [instId]);

    res.json({ requests });
  } catch (err) {
    console.error('Fetch Pending Batch Requests Error:', err);
    res.status(500).json({ error: 'Error fetching pending batch requests.' });
  }
});

// 0c. Approve, Reject, or Revoke Student Batch Access
router.post('/batches/approve-request', requireInstituteAdmin, async (req, res) => {
  try {
    const { user_id, batch_id, action } = req.body; // action: 'approve', 'reject', or 'revoke'
    if (!user_id || !batch_id || !action) {
      return res.status(400).json({ error: 'user_id, batch_id, and action are required.' });
    }

    const instId = req.user.role === 'super_admin' ? (req.body.institute_id || req.user.institute_id) : req.user.institute_id;
    const [batches] = await pool.query('SELECT institute_id FROM batches WHERE id = ?', [batch_id]);
    if (batches.length === 0) return res.status(404).json({ error: 'Batch not found.' });

    if (req.user.role !== 'super_admin' && batches[0].institute_id !== instId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await pool.query(`
      UPDATE student_batches
      SET status = ?
      WHERE user_id = ? AND batch_id = ?
    `, [newStatus, user_id, batch_id]);

    res.json({ message: `Student batch membership ${action === 'revoke' ? 'revoked' : newStatus} successfully.`, status: newStatus });
  } catch (err) {
    console.error('Approve/Revoke Batch Request Error:', err);
    res.status(500).json({ error: 'Error updating batch request.' });
  }
});

// 0d. Get Enrolled/Associated Students for a Specific Batch (Institute Admin or Super Admin)
router.get('/batches/:batchId/enrolled-students', requireInstituteAdmin, async (req, res) => {
  try {
    const batchId = parseInt(req.params.batchId, 10);
    if (!batchId) return res.status(400).json({ error: 'Valid Batch ID is required.' });

    const [batches] = await pool.query('SELECT institute_id, name FROM batches WHERE id = ?', [batchId]);
    if (batches.length === 0) return res.status(404).json({ error: 'Batch not found.' });

    const instId = req.user.role === 'super_admin' ? (req.query.institute_id || req.user.institute_id) : req.user.institute_id;
    if (req.user.role !== 'super_admin' && batches[0].institute_id !== instId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const [students] = await pool.query(`
      SELECT sb.user_id, sb.batch_id, sb.status, sb.created_at as enrolled_at,
             u.full_name as student_name, u.email as student_email, u.phone_number,
             b.name as batch_name, b.code as batch_code
      FROM student_batches sb
      JOIN users u ON sb.user_id = u.id
      JOIN batches b ON sb.batch_id = b.id
      WHERE sb.batch_id = ?
      ORDER BY FIELD(sb.status, 'approved', 'pending', 'rejected'), sb.created_at DESC
    `, [batchId]);

    res.json({ batchName: batches[0].name, students });
  } catch (err) {
    console.error('Fetch Batch Enrolled Students Error:', err);
    res.status(500).json({ error: 'Error fetching batch enrolled students.' });
  }
});

// Helper: Verify Student/User access permission for a CBT Exam
async function verifyExamStudentAccess(user, examId) {
  const [rows] = await pool.query('SELECT * FROM exams WHERE id = ?', [examId]);
  if (rows.length === 0) return { allowed: false, error: 'Exam not found.', status: 404 };

  const exam = rows[0];

  // 1. Draft check
  if (!exam.is_published && (!user || (user.role !== 'super_admin' && user.role !== 'institute_admin' && user.id !== exam.created_by))) {
    return { allowed: false, error: 'This CBT exam is currently draft and unpublished.', status: 403 };
  }

  // 2. Super Admin or Creator or Institute Admin of exam's institute
  if (user && (user.role === 'super_admin' || user.id === exam.created_by || (user.role === 'institute_admin' && user.institute_id === exam.institute_id))) {
    return { allowed: true, exam };
  }

  // 3. Public Exam check
  if (exam.is_public) {
    const instId = user ? (user.institute_id || 0) : 0;
    if (instId > 0) {
      const [insts] = await pool.query('SELECT allow_global_content FROM institutes WHERE id = ?', [instId]);
      if (insts.length > 0 && insts[0].allow_global_content === 0 && exam.institute_id !== instId) {
        return { allowed: false, error: 'Global public exams are disabled by your coaching institute.', status: 403 };
      }
    }
    return { allowed: true, exam };
  }

  // 4. Private Institute Exam check
  if (!user) {
    return { allowed: false, error: 'Sign in to access this CBT exam.', status: 401 };
  }

  // Direct user.institute_id match if exam is available to all batches
  if (exam.is_all_batches && user.institute_id && exam.institute_id && user.institute_id === exam.institute_id) {
    return { allowed: true, exam };
  }

  // Multi-Institute Memberships check if exam is available to all batches
  if (exam.is_all_batches && exam.institute_id) {
    const [mems] = await pool.query(
      'SELECT id FROM institute_memberships WHERE user_id = ? AND institute_id = ? AND status = "active"',
      [user.id, exam.institute_id]
    );
    if (mems.length > 0) {
      return { allowed: true, exam };
    }
  }

  // Student Batches check (Must be approved)
  const [batches] = await pool.query(`
    SELECT eb.batch_id FROM exam_batches eb
    JOIN student_batches sb ON eb.batch_id = sb.batch_id
    WHERE eb.exam_id = ? AND sb.user_id = ? AND (sb.status = 'approved' OR sb.status IS NULL)
  `, [examId, user.id]);

  if (batches.length > 0) {
    return { allowed: true, exam };
  }

  return { allowed: false, error: 'Access denied to this coaching CBT exam. Approved batch membership required.', status: 403 };
}

// 1. Get List of Exams (Scoped by role, institute, and student batch)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const user = req.user;
    let sql = `
      SELECT e.*, i.name as institute_name, c.name as category_name, c.icon as category_icon,
             COUNT(DISTINCT es.id) as section_count,
             COUNT(DISTINCT esq.question_id) as total_questions,
             GROUP_CONCAT(DISTINCT t.name) as tag_names,
             GROUP_CONCAT(DISTINCT t.id) as tag_ids,
             GROUP_CONCAT(DISTINCT eb.batch_id) as batch_ids
      FROM exams e
      JOIN institutes i ON e.institute_id = i.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN exam_sections es ON es.exam_id = e.id
      LEFT JOIN exam_section_questions esq ON esq.section_id = es.id
      LEFT JOIN exam_tags et ON et.exam_id = e.id
      LEFT JOIN tags t ON et.tag_id = t.id
      LEFT JOIN exam_batches eb ON eb.exam_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (!user || user.role === 'user') {
      let allowGlobal = 1;
      let userInstIds = [user ? (user.institute_id || 0) : 0];
      if (user) {
        const [mems] = await pool.query('SELECT institute_id FROM institute_memberships WHERE user_id = ? AND status = "active"', [user.id]);
        mems.forEach(m => userInstIds.push(m.institute_id));
      }
      userInstIds = [...new Set(userInstIds.filter(id => id > 0))];
      if (userInstIds.length === 0) userInstIds = [0];

      const primaryInstId = user ? (user.institute_id || userInstIds[0]) : 0;
      if (primaryInstId > 0) {
        const [instInfo] = await pool.query('SELECT allow_global_content FROM institutes WHERE id = ?', [primaryInstId]);
        if (instInfo.length > 0 && instInfo[0].allow_global_content === 0) {
          allowGlobal = 0;
        }
      }

      sql += ` AND e.is_published = 1 AND (
        (e.is_public = 1 AND ${allowGlobal === 1 ? '1=1' : '1=0'}) OR (
          e.institute_id IN (${userInstIds.join(',')}) AND (
            e.is_all_batches = 1 OR e.id IN (
              SELECT eb_sub.exam_id FROM exam_batches eb_sub
              JOIN student_batches sb_sub ON eb_sub.batch_id = sb_sub.batch_id
              WHERE sb_sub.user_id = ? AND (sb_sub.status = 'approved' OR sb_sub.status IS NULL)
            )
          )
        )
      )`;
      params.push(user ? user.id : -1);
    } else if (user.role === 'institute_admin' || user.role === 'admin') {
      sql += ` AND (e.institute_id = ? OR e.is_public = 1)`;
      params.push(user.institute_id || -1);
    }

    // Parse pagination parameters
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    // Count Total Matching Query
    let countSql = `
      SELECT COUNT(DISTINCT e.id) AS total
      FROM exams e
      JOIN institutes i ON e.institute_id = i.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN exam_sections es ON es.exam_id = e.id
      LEFT JOIN exam_section_questions esq ON esq.section_id = es.id
      LEFT JOIN exam_tags et ON et.exam_id = e.id
      LEFT JOIN tags t ON et.tag_id = t.id
      LEFT JOIN exam_batches eb ON eb.exam_id = e.id
      WHERE 1=1
    `;
    const countParams = [...params];

    const [countRows] = await pool.query(countSql + sql.substring(sql.indexOf(' WHERE 1=1') + 10), countParams);
    const totalCount = countRows[0] ? countRows[0].total : 0;

    sql += ` GROUP BY e.id ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const [exams] = await pool.query(sql, params);
    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.json({
      exams,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error('Fetch Exams Error:', err);
    res.status(500).json({ error: 'Error fetching exams.' });
  }
});

// 2. Get Single Exam Metadata & Sections
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const examId = req.params.id;
    const access = await verifyExamStudentAccess(req.user, examId);
    if (!access.allowed) {
      return res.status(access.status || 403).json({ error: access.error });
    }

    const [exams] = await pool.query(`
      SELECT e.*, i.name as institute_name, c.name as category_name, c.icon as category_icon,
             GROUP_CONCAT(DISTINCT t.name) as tag_names,
             GROUP_CONCAT(DISTINCT t.id) as tag_ids,
             GROUP_CONCAT(DISTINCT eb.batch_id) as batch_ids
      FROM exams e
      JOIN institutes i ON e.institute_id = i.id
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN exam_tags et ON et.exam_id = e.id
      LEFT JOIN tags t ON et.tag_id = t.id
      LEFT JOIN exam_batches eb ON eb.exam_id = e.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [examId]);

    if (exams.length === 0) {
      return res.status(404).json({ error: 'Exam not found.' });
    }

    const [sections] = await pool.query('SELECT * FROM exam_sections WHERE exam_id = ? ORDER BY section_order ASC', [examId]);

    res.json({ exam: exams[0], sections });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching exam details.' });
  }
});

// 3. Create Exam (Institute Admin or Super Admin)
router.post('/', requireInstituteAdmin, async (req, res) => {
  try {
    const {
      title, description, category_id, instructions, exam_type, mode, total_duration_mins,
      positive_marks, negative_marks, scheduled_start, scheduled_end,
      is_published, is_public, allow_section_switch, is_all_batches, batch_ids, sections, tag_ids
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Exam title is required.' });

    const instId = req.user.role === 'super_admin' ? (req.body.institute_id || 1) : req.user.institute_id;
    if (!instId) return res.status(400).json({ error: 'Institute ID is required.' });

    // Global Master Category Validation: Globally public exams MUST use Super Admin Global Master Category
    if (is_public && category_id) {
      const [cats] = await pool.query('SELECT is_global, institute_id FROM categories WHERE id = ?', [category_id]);
      if (cats.length > 0 && cats[0].institute_id !== null && !cats[0].is_global) {
        return res.status(400).json({ error: 'To publish an exam globally, you must select a standardized Global Master Category (created by Super Admin).' });
      }
    }

    const isAllBatchesVal = is_all_batches !== undefined ? !!is_all_batches : (!Array.isArray(batch_ids) || batch_ids.length === 0);

    const [result] = await pool.query(`
      INSERT INTO exams (
        institute_id, category_id, title, description, instructions, exam_type, mode, total_duration_mins,
        positive_marks, negative_marks, scheduled_start, scheduled_end,
        is_published, is_public, allow_section_switch, is_all_batches, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      instId, category_id || null, title, description || '', instructions || null, exam_type || 'COMPETITIVE', mode || 'actual',
      parseInt(total_duration_mins, 10) || 60, parseFloat(positive_marks) || 2.00,
      parseFloat(negative_marks) || 0.50, formatMySQLDatetime(scheduled_start), formatMySQLDatetime(scheduled_end),
      !!is_published, !!is_public, allow_section_switch !== false, isAllBatchesVal, req.user.id
    ]);

    const examId = result.insertId;

    // Link Batch IDs if specified
    if (!isAllBatchesVal && Array.isArray(batch_ids) && batch_ids.length > 0) {
      for (const bId of batch_ids) {
        await pool.query('INSERT IGNORE INTO exam_batches (exam_id, batch_id) VALUES (?, ?)', [examId, bId]);
      }
    }

    // Save exam tags
    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await pool.query('INSERT IGNORE INTO exam_tags (exam_id, tag_id) VALUES (?, ?)', [examId, tagId]);
      }
    }

    // Create default sections if provided (1 to 10 sections allowed)
    let sectionList = Array.isArray(sections) && sections.length > 0
      ? sections.map(s => String(s).trim()).filter(Boolean)
      : ['General'];

    if (sectionList.length > 10) {
      return res.status(400).json({ error: 'An exam cannot have more than 10 sections.' });
    }

    let order = 1;
    for (const secName of sectionList) {
      await pool.query('INSERT INTO exam_sections (exam_id, section_name, section_order) VALUES (?, ?, ?)', [examId, secName, order++]);
    }

    res.status(201).json({ message: 'Exam created successfully.', examId });
  } catch (err) {
    console.error('Create Exam Error:', err);
    res.status(500).json({ error: 'Error creating exam.' });
  }
});

// Helper: Verify Admin ownership/permission for an Exam
async function verifyExamOwnership(req, examId) {
  if (!req.user) return false;
  if (req.user.role === 'super_admin') return true;

  const [rows] = await pool.query('SELECT institute_id, created_by FROM exams WHERE id = ?', [examId]);
  if (rows.length === 0) return false;

  const exam = rows[0];
  if (req.user.institute_id && exam.institute_id && req.user.institute_id === exam.institute_id) {
    return true;
  }
  if (exam.created_by && exam.created_by === req.user.id) {
    return true;
  }
  return false;
}

// Helper: Verify Admin ownership/permission for an Exam Section
async function verifySectionOwnership(req, sectionId) {
  if (!req.user) return false;
  if (req.user.role === 'super_admin') return true;

  const [rows] = await pool.query(`
    SELECT e.institute_id, e.created_by
    FROM exam_sections es
    JOIN exams e ON es.exam_id = e.id
    WHERE es.id = ?
  `, [sectionId]);

  if (rows.length === 0) return false;

  const exam = rows[0];
  if (req.user.institute_id && exam.institute_id && req.user.institute_id === exam.institute_id) {
    return true;
  }
  if (exam.created_by && exam.created_by === req.user.id) {
    return true;
  }
  return false;
}

// 4. Update Exam Details
router.put('/:id', requireInstituteAdmin, async (req, res) => {
  try {
    const examId = req.params.id;
    const isAllowed = await verifyExamOwnership(req, examId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to modify this exam.' });
    }

    // Fetch existing exam to support partial updates (e.g., publish/unpublish toggle)
    const [existing] = await pool.query('SELECT * FROM exams WHERE id = ?', [examId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Exam not found.' });
    }
    const current = existing[0];

    const {
      title, description, category_id, instructions, exam_type, mode, total_duration_mins,
      positive_marks, negative_marks, scheduled_start, scheduled_end,
      is_published, is_public, allow_section_switch, is_all_batches, batch_ids, tag_ids
    } = req.body;

    const targetTitle = title !== undefined ? title : current.title;
    const targetDesc = description !== undefined ? description : current.description;
    const targetCat = category_id !== undefined ? (category_id ? parseInt(category_id, 10) : null) : current.category_id;
    const targetInst = instructions !== undefined ? instructions : current.instructions;
    const targetType = exam_type !== undefined ? exam_type : current.exam_type;
    const targetMode = mode !== undefined ? mode : current.mode;
    const targetDuration = total_duration_mins !== undefined ? parseInt(total_duration_mins, 10) : current.total_duration_mins;
    const targetPos = positive_marks !== undefined ? parseFloat(positive_marks) : current.positive_marks;
    const targetNeg = negative_marks !== undefined ? parseFloat(negative_marks) : current.negative_marks;
    const targetStart = scheduled_start !== undefined ? formatMySQLDatetime(scheduled_start) : current.scheduled_start;
    const targetEnd = scheduled_end !== undefined ? formatMySQLDatetime(scheduled_end) : current.scheduled_end;
    const targetIsPub = is_published !== undefined ? !!is_published : current.is_published;
    const targetIsPublic = is_public !== undefined ? !!is_public : current.is_public;
    const targetSecSwitch = allow_section_switch !== undefined ? !!allow_section_switch : current.allow_section_switch;
    const targetAllBatches = is_all_batches !== undefined ? !!is_all_batches : (batch_ids !== undefined ? (batch_ids.length === 0) : current.is_all_batches);

    if (targetIsPublic && targetCat) {
      const [cats] = await pool.query('SELECT is_global, institute_id FROM categories WHERE id = ?', [targetCat]);
      if (cats.length > 0 && cats[0].institute_id !== null && !cats[0].is_global) {
        return res.status(400).json({ error: 'To publish an exam globally, you must select a standardized Global Master Category (created by Super Admin).' });
      }
    }

    await pool.query(`
      UPDATE exams SET
        title = ?, description = ?, category_id = ?, instructions = ?, exam_type = ?, mode = ?,
        total_duration_mins = ?, positive_marks = ?, negative_marks = ?,
        scheduled_start = ?, scheduled_end = ?, is_published = ?, is_public = ?, allow_section_switch = ?,
        is_all_batches = ?
      WHERE id = ?
    `, [
      targetTitle, targetDesc || '', targetCat, targetInst, targetType, targetMode,
      targetDuration, targetPos, targetNeg, targetStart, targetEnd,
      targetIsPub, targetIsPublic, targetSecSwitch, targetAllBatches, examId
    ]);

    // Sync batches if provided
    if (batch_ids !== undefined) {
      await pool.query('DELETE FROM exam_batches WHERE exam_id = ?', [examId]);
      if (!targetAllBatches && Array.isArray(batch_ids) && batch_ids.length > 0) {
        for (const bId of batch_ids) {
          await pool.query('INSERT IGNORE INTO exam_batches (exam_id, batch_id) VALUES (?, ?)', [examId, bId]);
        }
      }
    }

    // Update tags if provided
    if (Array.isArray(tag_ids)) {
      await pool.query('DELETE FROM exam_tags WHERE exam_id = ?', [examId]);
      for (const tagId of tag_ids) {
        await pool.query('INSERT IGNORE INTO exam_tags (exam_id, tag_id) VALUES (?, ?)', [examId, tagId]);
      }
    }

    res.json({ message: 'Exam updated successfully.' });
  } catch (err) {
    console.error('Update Exam Error:', err);
    res.status(500).json({ error: 'Error updating exam.' });
  }
});

// 5. Delete Exam
router.delete('/:id', requireInstituteAdmin, async (req, res) => {
  try {
    const isAllowed = await verifyExamOwnership(req, req.params.id);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to delete this exam.' });
    }

    await pool.query('DELETE FROM exams WHERE id = ?', [req.params.id]);
    res.json({ message: 'Exam deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting exam.' });
  }
});

// 5b. Add a Section to an Exam
router.post('/:id/sections', requireInstituteAdmin, async (req, res) => {
  try {
    const examId = req.params.id;
    const isAllowed = await verifyExamOwnership(req, examId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to modify this exam.' });
    }

    const { section_name } = req.body;
    const cleanName = (section_name || '').trim();
    if (!cleanName) {
      return res.status(400).json({ error: 'Section name is required.' });
    }

    const [existingSections] = await pool.query('SELECT id FROM exam_sections WHERE exam_id = ?', [examId]);
    if (existingSections.length >= 10) {
      return res.status(400).json({ error: 'Maximum of 10 sections allowed per exam.' });
    }

    const nextOrder = existingSections.length + 1;
    const [result] = await pool.query(
      'INSERT INTO exam_sections (exam_id, section_name, section_order) VALUES (?, ?, ?)',
      [examId, cleanName, nextOrder]
    );

    res.status(201).json({ message: 'Section added successfully.', sectionId: result.insertId });
  } catch (err) {
    console.error('Add Section Error:', err);
    res.status(500).json({ error: 'Error adding section.' });
  }
});

// 5c. Rename Exam Section
router.put('/sections/:sectionId', requireInstituteAdmin, async (req, res) => {
  try {
    const sectionId = req.params.sectionId;
    const isAllowed = await verifySectionOwnership(req, sectionId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to modify this exam section.' });
    }

    const { section_name, section_order } = req.body;
    const cleanName = (section_name || '').trim();
    if (!cleanName) {
      return res.status(400).json({ error: 'Section name is required.' });
    }

    if (section_order !== undefined) {
      await pool.query('UPDATE exam_sections SET section_name = ?, section_order = ? WHERE id = ?', [cleanName, parseInt(section_order, 10), sectionId]);
    } else {
      await pool.query('UPDATE exam_sections SET section_name = ? WHERE id = ?', [cleanName, sectionId]);
    }

    res.json({ message: 'Section updated successfully.' });
  } catch (err) {
    console.error('Update Section Error:', err);
    res.status(500).json({ error: 'Error updating section.' });
  }
});

// 5d. Delete Exam Section
router.delete('/sections/:sectionId', requireInstituteAdmin, async (req, res) => {
  try {
    const sectionId = req.params.sectionId;
    const isAllowed = await verifySectionOwnership(req, sectionId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to delete this exam section.' });
    }

    const [rows] = await pool.query('SELECT exam_id FROM exam_sections WHERE id = ?', [sectionId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Section not found.' });
    }
    const examId = rows[0].exam_id;

    const [existingSections] = await pool.query('SELECT id FROM exam_sections WHERE exam_id = ?', [examId]);
    if (existingSections.length <= 1) {
      return res.status(400).json({ error: 'An exam must have at least 1 section. Cannot delete the only section.' });
    }

    await pool.query('DELETE FROM exam_sections WHERE id = ?', [sectionId]);
    res.json({ message: 'Section deleted successfully.' });
  } catch (err) {
    console.error('Delete Section Error:', err);
    res.status(500).json({ error: 'Error deleting section.' });
  }
});

// 5e. Reorder Exam Sections
router.put('/:id/sections/reorder', requireInstituteAdmin, async (req, res) => {
  try {
    const examId = req.params.id;
    const isAllowed = await verifyExamOwnership(req, examId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to modify this exam.' });
    }

    const { section_orders } = req.body;
    if (!Array.isArray(section_orders) || section_orders.length === 0) {
      return res.status(400).json({ error: 'Invalid section_orders array.' });
    }

    for (const item of section_orders) {
      await pool.query('UPDATE exam_sections SET section_order = ? WHERE id = ? AND exam_id = ?', [parseInt(item.order, 10), item.id, examId]);
    }

    res.json({ message: 'Sections reordered successfully.' });
  } catch (err) {
    console.error('Reorder Sections Error:', err);
    res.status(500).json({ error: 'Error reordering sections.' });
  }
});

// 6. Manage Exam Sections & Questions (Linked via exam_section_questions + question_bank)
router.get('/:id/sections-questions', requireAuth, async (req, res) => {
  try {
    const examId = req.params.id;
    const access = await verifyExamStudentAccess(req.user, examId);
    if (!access.allowed) {
      return res.status(access.status || 403).json({ error: access.error });
    }

    const [sections] = await pool.query('SELECT * FROM exam_sections WHERE exam_id = ? ORDER BY section_order ASC', [examId]);

    const result = [];
    for (const sec of sections) {
      // Query question_bank via exam_section_questions mapping
      let [questions] = await pool.query(`
        SELECT qb.*, esq.question_order, p.passage_text_en, p.passage_text_hi, p.passage_image_url
        FROM exam_section_questions esq
        JOIN question_bank qb ON esq.question_id = qb.id
        LEFT JOIN passages p ON qb.passage_id = p.id
        WHERE esq.section_id = ?
        ORDER BY esq.question_order ASC, qb.id ASC
      `, [sec.id]);

      // Fallback to legacy exam_questions if no mapping exists yet
      if (questions.length === 0) {
        [questions] = await pool.query('SELECT * FROM exam_questions WHERE section_id = ? ORDER BY question_order ASC, id ASC', [sec.id]);
      }

      result.push({
        ...sec,
        questions: questions.map(q => ({
          ...q,
          options_en: safeJSONParse(q.options_en_json),
          options_hi: safeJSONParse(q.options_hi_json),
          options_images: safeJSONParse(q.options_images_json)
        }))
      });
    }

    res.json({ sections: result });
  } catch (err) {
    console.error('Error fetching sections and questions:', err);
    res.status(500).json({ error: 'Error fetching sections and questions.' });
  }
});

// 6b. Attach Master Questions to an Exam Section
router.post('/sections/:sectionId/attach-questions', requireInstituteAdmin, async (req, res) => {
  try {
    const sectionId = req.params.sectionId;
    const { question_ids } = req.body;

    if (!Array.isArray(question_ids) || question_ids.length === 0) {
      return res.status(400).json({ error: 'No question IDs provided for attachment.' });
    }

    let attachedCount = 0;
    for (const qId of question_ids) {
      const [resIns] = await pool.query(`
        INSERT IGNORE INTO exam_section_questions (section_id, question_id)
        VALUES (?, ?)
      `, [sectionId, qId]);
      if (resIns.affectedRows > 0) attachedCount++;
    }

    res.json({ message: `Successfully attached ${attachedCount} question(s) to exam section.` });
  } catch (err) {
    console.error('Attach Questions Error:', err);
    res.status(500).json({ error: 'Error attaching questions to exam section.' });
  }
});

// 6c. Detach (Unlink) Master Question from an Exam Section
router.delete('/sections/:sectionId/detach-questions/:questionId', requireInstituteAdmin, async (req, res) => {
  try {
    const { sectionId, questionId } = req.params;
    const isAllowed = await verifySectionOwnership(req, sectionId);
    if (!isAllowed) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to modify this exam section.' });
    }

    await pool.query('DELETE FROM exam_section_questions WHERE section_id = ? AND question_id = ?', [sectionId, questionId]);
    res.json({ message: 'Question detached from exam section successfully.' });
  } catch (err) {
    console.error('Detach Question Error:', err);
    res.status(500).json({ error: 'Error detaching question from exam section.' });
  }
});

// 7. Add New Question to Master Question Bank & Optionally Attach to Section
router.post('/sections/:sectionId/questions', requireInstituteAdmin, async (req, res) => {
  try {
    const sectionId = req.params.sectionId;
    const {
      question_text_en, question_text_hi, options_en, options_hi,
      correct_option_index, explanation_en, explanation_hi, image_url, difficulty, category_id, is_global
    } = req.body;

    if (!question_text_en || !options_en) {
      return res.status(400).json({ error: 'Question text and English options are required.' });
    }

    const [sec] = await pool.query('SELECT exam_id FROM exam_sections WHERE id = ?', [sectionId]);
    if (sec.length === 0) return res.status(404).json({ error: 'Section not found.' });

    const [exam] = await pool.query('SELECT institute_id FROM exams WHERE id = ?', [sec[0].exam_id]);
    const instId = exam[0].institute_id;

    // 1. Create in Master Question Bank
    const [result] = await pool.query(`
      INSERT INTO question_bank (
        institute_id, category_id, question_text_en, question_text_hi,
        options_en_json, options_hi_json, correct_option_index,
        explanation_en, explanation_hi, image_url, difficulty, is_global
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      instId, category_id || null, question_text_en, question_text_hi || '',
      JSON.stringify(Array.isArray(options_en) ? options_en : [options_en]),
      JSON.stringify(Array.isArray(options_hi) ? options_hi : []),
      parseInt(correct_option_index, 10) || 0, explanation_en || '', explanation_hi || '',
      image_url || '', difficulty || 'medium', is_global ? 1 : 0
    ]);

    const qId = result.insertId;

    // 2. Attach to Exam Section
    await pool.query(`
      INSERT IGNORE INTO exam_section_questions (section_id, question_id)
      VALUES (?, ?)
    `, [sectionId, qId]);

    res.status(201).json({ message: 'Question created in Master Bank & attached to section successfully.', questionId: qId });
  } catch (err) {
    console.error('Add Question Error:', err);
    res.status(500).json({ error: 'Error adding question.' });
  }
});

// Helper function to resolve all descendant category IDs recursively for hierarchy filtering
async function getAllCategoryDescendantIds(categoryId) {
  if (!categoryId) return [];
  const targetId = parseInt(categoryId, 10);
  if (isNaN(targetId)) return [];

  const [allCats] = await pool.query('SELECT id, parent_id FROM categories');
  const descendantIds = new Set([targetId]);
  let added = true;

  while (added) {
    added = false;
    for (const c of allCats) {
      if (c.parent_id && descendantIds.has(c.parent_id) && !descendantIds.has(c.id)) {
        descendantIds.add(c.id);
        added = true;
      }
    }
  }
  return Array.from(descendantIds);
}

// Helper function to auto-create and link tags to master question
async function saveQuestionTags(questionId, tagsInput, instId) {
  if (!questionId) return [];
  let tagList = [];
  if (Array.isArray(tagsInput)) {
    tagList = tagsInput.map(t => typeof t === 'string' ? t.trim() : '').filter(Boolean);
  } else if (typeof tagsInput === 'string' && tagsInput.trim()) {
    tagList = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
  }

  await pool.query('DELETE FROM question_bank_tags WHERE question_id = ?', [questionId]);
  const cleanTagNames = [];

  for (const rawTag of tagList) {
    const tagName = rawTag.trim();
    if (!tagName) continue;
    if (!cleanTagNames.includes(tagName)) cleanTagNames.push(tagName);

    // 1. Try finding existing tag (case-insensitive) across global/institute tags
    let [existing] = await pool.query('SELECT id FROM tags WHERE LOWER(name) = LOWER(?) LIMIT 1', [tagName]);
    let tagId = null;

    if (existing.length > 0) {
      tagId = existing[0].id;
    } else {
      // 2. Insert with IGNORE to avoid unique constraint conflicts
      try {
        const [newTagRes] = await pool.query('INSERT IGNORE INTO tags (name, institute_id) VALUES (?, ?)', [tagName, instId]);
        tagId = newTagRes.insertId;
        if (!tagId) {
          const [refetch] = await pool.query('SELECT id FROM tags WHERE LOWER(name) = LOWER(?) LIMIT 1', [tagName]);
          if (refetch.length > 0) tagId = refetch[0].id;
        }
      } catch (insertErr) {
        const [refetch] = await pool.query('SELECT id FROM tags WHERE LOWER(name) = LOWER(?) LIMIT 1', [tagName]);
        if (refetch.length > 0) tagId = refetch[0].id;
      }
    }

    if (tagId) {
      await pool.query('INSERT IGNORE INTO question_bank_tags (question_id, tag_id) VALUES (?, ?)', [questionId, tagId]);
    }
  }

  await pool.query('UPDATE question_bank SET tags_json = ? WHERE id = ?', [JSON.stringify(cleanTagNames), questionId]);
  return cleanTagNames;
}

// 7a-1. Create Standalone Master Question (Master Bank Repository)
router.post('/questions', requireInstituteAdmin, async (req, res) => {
  try {
    const {
      question_text_en, question_text_hi, options_en, options_hi, options_images,
      correct_option_index, explanation_en, explanation_hi, explanation_image_url,
      image_url, difficulty, category_id, is_global, passage_text_en, passage_text_hi, passage_image_url,
      tags, tag_names
    } = req.body;

    if (!question_text_en || !options_en) {
      return res.status(400).json({ error: 'Question text and English options are required.' });
    }

    const isSuper = req.user.role === 'super_admin';
    const instId = isSuper ? (req.body.institute_id || req.user.institute_id || 1) : req.user.institute_id;
    if (!instId) return res.status(400).json({ error: 'Institute ID is required.' });

    let passageId = null;
    const pTextEn = passage_text_en || '';
    const pImgUrl = normalizeImageUrl(passage_image_url || '');

    if (pTextEn.trim() || pImgUrl.trim()) {
      const [existP] = await pool.query('SELECT id FROM passages WHERE institute_id = ? AND passage_text_en = ? LIMIT 1', [instId, pTextEn.trim()]);
      if (existP.length > 0) {
        passageId = existP[0].id;
      } else {
        const [pRes] = await pool.query('INSERT INTO passages (institute_id, passage_text_en, passage_text_hi, passage_image_url, created_by) VALUES (?, ?, ?, ?, ?)', [
          instId, pTextEn.trim(), passage_text_hi || '', pImgUrl || null, req.user.id
        ]);
        passageId = pRes.insertId;
      }
    }

    const finalIsGlobal = isSuper ? (is_global ? 1 : 0) : 0;
    const normOptImgs = (Array.isArray(options_images) ? options_images : []).map(normalizeImageUrl);

    const [result] = await pool.query(`
      INSERT INTO question_bank (
        institute_id, category_id, passage_id, question_text_en, question_text_hi,
        options_en_json, options_hi_json, options_images_json, correct_option_index,
        explanation_en, explanation_hi, explanation_image_url, image_url, difficulty, is_global
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      instId, category_id || null, passageId, question_text_en, question_text_hi || '',
      JSON.stringify(Array.isArray(options_en) ? options_en : [options_en]),
      JSON.stringify(Array.isArray(options_hi) ? options_hi : []),
      JSON.stringify(normOptImgs),
      parseInt(correct_option_index, 10) || 0,
      explanation_en || '', explanation_hi || '',
      normalizeImageUrl(explanation_image_url) || null,
      normalizeImageUrl(image_url) || null, difficulty || 'medium', finalIsGlobal
    ]);

    const questionId = result.insertId;
    await saveQuestionTags(questionId, tags || tag_names, instId);

    res.status(201).json({ message: 'Question created in Master Question Bank.', questionId });
  } catch (err) {
    console.error('Create Standalone Question Error:', err);
    res.status(500).json({ error: 'Error creating master question.' });
  }
});

// 7a-2. Fetch All Master Questions (For Master Question Bank & Exam Selector)
router.get('/questions/all', requireInstituteAdmin, async (req, res) => {
  try {
    const { exam_id, section_id, category_id, search, difficulty, scope, tag } = req.query;
    const instId = req.user.role === 'super_admin' ? (req.query.institute_id || req.user.institute_id) : req.user.institute_id;

    let sql = `
      SELECT qb.*,
             c.name as category_name, c.icon as category_icon,
             p.passage_text_en, p.passage_text_hi, p.passage_image_url,
             GROUP_CONCAT(DISTINCT t.name) as tag_names,
             ${section_id ? 'IF(esq_filter.question_id IS NOT NULL, 1, 0) as is_attached' : '0 as is_attached'}
      FROM question_bank qb
      LEFT JOIN categories c ON qb.category_id = c.id
      LEFT JOIN passages p ON qb.passage_id = p.id
      LEFT JOIN question_bank_tags qbt ON qb.id = qbt.question_id
      LEFT JOIN tags t ON qbt.tag_id = t.id
    `;

    if (section_id) {
      sql += ` LEFT JOIN exam_section_questions esq_filter ON (qb.id = esq_filter.question_id AND esq_filter.section_id = ${parseInt(section_id, 10)})`;
    }

    if (exam_id) {
      sql += ` LEFT JOIN exam_section_questions esq ON qb.id = esq.question_id
               LEFT JOIN exam_sections es ON esq.section_id = es.id`;
    }

    sql += ` WHERE 1=1`;
    const params = [];

    if (req.user.role === 'super_admin') {
      if (scope === 'global') {
        sql += ` AND qb.is_global = 1`;
      } else if (scope === 'mine' && instId) {
        sql += ` AND qb.institute_id = ? AND (qb.is_global = 0 OR qb.is_global IS NULL)`;
        params.push(instId);
      } else if (instId) {
        sql += ` AND (qb.institute_id = ? OR qb.is_global = 1)`;
        params.push(instId);
      }
    } else {
      if (scope === 'global') {
        sql += ` AND qb.is_global = 1`;
      } else if (scope === 'mine') {
        sql += ` AND qb.institute_id = ? AND (qb.is_global = 0 OR qb.is_global IS NULL)`;
        params.push(instId);
      } else {
        sql += ` AND (qb.institute_id = ? OR qb.is_global = 1)`;
        params.push(instId);
      }
    }

    if (exam_id) {
      sql += ` AND es.exam_id = ?`;
      params.push(exam_id);
    }

    // Hierarchy-aware category filtering (includes target category + all descendant sub-categories)
    if (category_id) {
      const descCatIds = await getAllCategoryDescendantIds(category_id);
      if (descCatIds.length > 0) {
        sql += ` AND qb.category_id IN (${descCatIds.map(() => '?').join(',')})`;
        params.push(...descCatIds);
      }
    }

    if (difficulty) {
      sql += ` AND qb.difficulty = ?`;
      params.push(difficulty);
    }

    if (tag) {
      sql += ` AND qb.id IN (SELECT qbt2.question_id FROM question_bank_tags qbt2 JOIN tags t2 ON qbt2.tag_id = t2.id WHERE LOWER(t2.name) = LOWER(?))`;
      params.push(tag.trim());
    }

    if (search) {
      sql += ` AND (
        qb.question_text_en LIKE ? OR qb.question_text_hi LIKE ? OR
        qb.explanation_en LIKE ? OR qb.explanation_hi LIKE ? OR
        p.passage_text_en LIKE ? OR p.passage_text_hi LIKE ? OR
        qb.options_en_json LIKE ? OR qb.options_hi_json LIKE ? OR
        t.name LIKE ?
      )`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s, s, s, s);
    }

    // Parse pagination parameters
    const pageNum = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitNum = Math.max(1, Math.min(500, parseInt(req.query.limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Build matching Count Query for total pages calculation
    let countSql = `
      SELECT COUNT(DISTINCT qb.id) AS total
      FROM question_bank qb
      LEFT JOIN categories c ON qb.category_id = c.id
      LEFT JOIN passages p ON qb.passage_id = p.id
      LEFT JOIN question_bank_tags qbt ON qb.id = qbt.question_id
      LEFT JOIN tags t ON qbt.tag_id = t.id
    `;
    if (section_id) {
      countSql += ` LEFT JOIN exam_section_questions esq_filter ON (qb.id = esq_filter.question_id AND esq_filter.section_id = ${parseInt(section_id, 10)})`;
    }
    if (exam_id) {
      countSql += ` LEFT JOIN exam_section_questions esq ON qb.id = esq.question_id LEFT JOIN exam_sections es ON esq.section_id = es.id`;
    }
    countSql += ` WHERE 1=1`;
    // The params array matches both countSql WHERE clauses and main sql WHERE clauses up to LIMIT
    const countParams = [...params];

    const [countRows] = await pool.query(countSql + sql.substring(sql.indexOf(' WHERE 1=1') + 10), countParams);
    const totalCount = countRows[0] ? countRows[0].total : 0;

    sql += ` GROUP BY qb.id ORDER BY qb.id DESC LIMIT ? OFFSET ?`;
    params.push(limitNum, offset);

    const [rows] = await pool.query(sql, params);

    const questions = rows.map(q => {
      const tagsArr = safeJSONParse(q.tags_json) || (q.tag_names ? q.tag_names.split(',').map(t => t.trim()) : []);
      return {
        ...q,
        options_en: safeJSONParse(q.options_en_json),
        options_hi: safeJSONParse(q.options_hi_json),
        options_images: safeJSONParse(q.options_images_json),
        tags: tagsArr
      };
    });

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.json({
      questions,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error('Fetch Master Question Bank Error:', err);
    res.status(500).json({ error: 'Error fetching master question bank.' });
  }
});

// 7a-3. Update Master Question in Question Bank
router.put('/questions/:questionId', requireInstituteAdmin, async (req, res) => {
  try {
    const qId = req.params.questionId;
    const {
      category_id, question_text_en, question_text_hi, options_en, options_hi, options_images,
      correct_option_index, explanation_en, explanation_hi, explanation_image_url, image_url,
      passage_text_en, passage_text_hi, passage_image_url, difficulty, is_global,
      tags, tag_names
    } = req.body;

    if (!question_text_en || !options_en) {
      return res.status(400).json({ error: 'Question text and English options are required.' });
    }

    const normOptImgs = (Array.isArray(options_images) ? options_images : []).map(normalizeImageUrl);
    const normPImgUrl = normalizeImageUrl(passage_image_url || '');

    // Check ownership
    const [existingQ] = await pool.query('SELECT passage_id, institute_id FROM question_bank WHERE id = ?', [qId]);
    if (existingQ.length === 0) return res.status(404).json({ error: 'Question not found.' });

    const instId = existingQ[0].institute_id || req.user.institute_id || 1;

    // Handle passage update if present
    if (passage_text_en || normPImgUrl) {
      const passId = existingQ[0].passage_id;
      if (passId) {
        await pool.query('UPDATE passages SET passage_text_en = ?, passage_text_hi = ?, passage_image_url = ? WHERE id = ?', [
          passage_text_en || '', passage_text_hi || '', normPImgUrl || null, passId
        ]);
      } else {
        const [pRes] = await pool.query('INSERT INTO passages (institute_id, passage_text_en, passage_text_hi, passage_image_url, created_by) VALUES (?, ?, ?, ?, ?)', [
          instId, passage_text_en || '', passage_text_hi || '', normPImgUrl || null, req.user.id
        ]);
        await pool.query('UPDATE question_bank SET passage_id = ? WHERE id = ?', [pRes.insertId, qId]);
      }
    }

    await pool.query(`
      UPDATE question_bank SET
        category_id = COALESCE(?, category_id),
        question_text_en = ?,
        question_text_hi = ?,
        options_en_json = ?,
        options_hi_json = ?,
        options_images_json = ?,
        correct_option_index = ?,
        explanation_en = ?,
        explanation_hi = ?,
        explanation_image_url = ?,
        image_url = ?,
        difficulty = ?,
        is_global = ?
      WHERE id = ?
    `, [
      category_id || null,
      question_text_en,
      question_text_hi || '',
      JSON.stringify(Array.isArray(options_en) ? options_en : [options_en]),
      JSON.stringify(Array.isArray(options_hi) ? options_hi : []),
      JSON.stringify(normOptImgs),
      parseInt(correct_option_index, 10) || 0,
      explanation_en || '',
      explanation_hi || '',
      normalizeImageUrl(explanation_image_url) || null,
      normalizeImageUrl(image_url) || null,
      difficulty || 'medium',
      is_global ? 1 : 0,
      qId
    ]);

    await saveQuestionTags(qId, tags || tag_names, instId);

    res.json({ message: 'Master question updated successfully in Question Bank.' });
  } catch (err) {
    console.error('Update Master Question Error:', err);
    res.status(500).json({ error: 'Error updating master question.' });
  }
});

// 7a-4. Delete Master Question from Question Bank
router.delete('/questions/:questionId', requireInstituteAdmin, async (req, res) => {
  try {
    const qId = req.params.questionId;
    const [qRows] = await pool.query('SELECT institute_id, is_global FROM question_bank WHERE id = ?', [qId]);
    if (qRows.length === 0) return res.status(404).json({ error: 'Question not found.' });

    const q = qRows[0];
    if (req.user.role !== 'super_admin') {
      if (q.is_global || q.institute_id === null) {
        return res.status(403).json({ error: 'Access denied. Only Super Admins can delete Global Master questions.' });
      }
      if (q.institute_id !== req.user.institute_id) {
        return res.status(403).json({ error: 'Access denied. You do not have permission to delete this question.' });
      }
    }

    await pool.query('DELETE FROM question_bank WHERE id = ?', [qId]);
    await pool.query('DELETE FROM exam_questions WHERE id = ?', [qId]);
    res.json({ message: 'Master question deleted successfully from Question Bank.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting master question.' });
  }
});

// 7a-0. Validate Category and Tag Existence before Bulk Upload (Only Categories are Blocking)
router.post('/questions/validate-bulk', requireInstituteAdmin, async (req, res) => {
  try {
    let { questions, encodedPayload } = req.body;

    if (encodedPayload) {
      const decoded = fromBase64Utf8(encodedPayload);
      if (Array.isArray(decoded)) {
        questions = decoded;
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'No questions provided for validation.' });
    }

    const instId = req.user.role === 'super_admin' ? (req.body.institute_id || req.user.institute_id || 1) : req.user.institute_id;

    // Collect all requested category names
    const requestedCatNames = new Set();
    const requestedTagNames = new Set();

    questions.forEach(q => {
      const cName = q.category_name || q.category;
      if (cName && typeof cName === 'string' && cName.trim()) {
        requestedCatNames.add(cName.trim().toLowerCase());
      }
      const tNames = q.tag_names || q.tags;
      if (tNames) {
        let tagsList = Array.isArray(tNames) ? tNames : (typeof tNames === 'string' ? tNames.split(',') : []);
        tagsList.forEach(t => {
          if (typeof t === 'string' && t.trim()) {
            requestedTagNames.add(t.trim().toLowerCase());
          }
        });
      }
    });

    // Fetch existing categories
    const [existingCats] = await pool.query(
      'SELECT id, name FROM categories WHERE institute_id = ? OR institute_id IS NULL OR is_global = 1',
      [instId]
    );
    const existingCatNamesMap = new Map();
    existingCats.forEach(c => existingCatNamesMap.set(c.name.trim().toLowerCase(), c.id));

    // Fetch existing tags (informational notice only)
    const [existingTags] = await pool.query(
      'SELECT id, name FROM tags WHERE institute_id = ? OR institute_id IS NULL',
      [instId]
    );
    const existingTagNamesMap = new Map();
    existingTags.forEach(t => existingTagNamesMap.set(t.name.trim().toLowerCase(), t.id));

    const missingCategories = [];
    requestedCatNames.forEach(catNameLower => {
      if (!existingCatNamesMap.has(catNameLower)) {
        const orig = questions.find(q => (q.category_name || q.category) && (q.category_name || q.category).trim().toLowerCase() === catNameLower);
        missingCategories.push(orig ? (orig.category_name || orig.category) : catNameLower);
      }
    });

    const newTagsToCreate = [];
    requestedTagNames.forEach(tagNameLower => {
      if (!existingTagNamesMap.has(tagNameLower)) {
        newTagsToCreate.push(tagNameLower);
      }
    });

    // Only Category matching is a blocking prerequisite. New tags will be auto-created on the fly.
    const isValid = missingCategories.length === 0;

    res.json({
      valid: isValid,
      missingCategories,
      newTagsToCreate,
      missingTags: newTagsToCreate
    });
  } catch (err) {
    console.error('Validate Bulk Error:', err);
    res.status(500).json({ error: 'Error validating taxonomy in bulk upload.' });
  }
});

// 7a-1. Bulk Add Questions directly to Master Question Bank (question_bank table)
router.post('/questions/bulk', requireInstituteAdmin, async (req, res) => {
  try {
    let { questions, encodedPayload, category_id, section_id, is_global } = req.body;

    if (encodedPayload) {
      const decoded = fromBase64Utf8(encodedPayload);
      if (Array.isArray(decoded)) {
        questions = decoded;
      }
    }

    const isSuper = req.user.role === 'super_admin';
    const instId = isSuper ? (req.body.institute_id || req.user.institute_id || 1) : req.user.institute_id;
    if (!instId) return res.status(400).json({ error: 'Institute ID is required.' });

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'No questions provided for bulk upload.' });
    }

    const [catsRows] = await pool.query('SELECT id, name FROM categories WHERE institute_id = ? OR institute_id IS NULL OR is_global = 1', [instId]);
    const catNameMap = new Map();
    catsRows.forEach(c => catNameMap.set(c.name.trim().toLowerCase(), c.id));

    let insertedCount = 0;
    const passageCache = new Map();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qEn = q.question_text_en || q.question_en || q.question_text || q.question || '';
      const optsEn = Array.isArray(q.options_en) ? q.options_en : (Array.isArray(q.options) ? q.options : []);

      if (!qEn || !optsEn || optsEn.length === 0) {
        continue;
      }

      let passageId = null;
      const pTextEn = q.passage_text_en || q.passage_en || q.passage || '';
      const pTextHi = q.passage_text_hi || q.passage_hi || '';
      const pImgUrl = normalizeImageUrl(q.passage_image_url || q.passage_image || '');

      if (pTextEn.trim() || pImgUrl.trim()) {
        const pKey = (pTextEn.trim() + '||' + pImgUrl.trim());
        if (passageCache.has(pKey)) {
          passageId = passageCache.get(pKey);
        } else {
          const [existP] = await pool.query('SELECT id FROM passages WHERE institute_id = ? AND passage_text_en = ? LIMIT 1', [instId, pTextEn.trim()]);
          if (existP.length > 0) {
            passageId = existP[0].id;
          } else {
            const [pRes] = await pool.query('INSERT INTO passages (institute_id, passage_text_en, passage_text_hi, passage_image_url, created_by) VALUES (?, ?, ?, ?, ?)', [
              instId, pTextEn.trim(), pTextHi.trim(), pImgUrl || null, req.user.id
            ]);
            passageId = pRes.insertId;
          }
          passageCache.set(pKey, passageId);
        }
      }

      const optsHi = Array.isArray(q.options_hi) ? q.options_hi : [];
      const rawOptsImgs = Array.isArray(q.options_images) ? q.options_images : [];
      const optsImgs = rawOptsImgs.map(normalizeImageUrl);
      
      let targetCatId = category_id || q.category_id || null;
      const qCatName = q.category_name || q.category;
      if (qCatName && typeof qCatName === 'string' && catNameMap.has(qCatName.trim().toLowerCase())) {
        targetCatId = catNameMap.get(qCatName.trim().toLowerCase());
      }

      const finalIsGlobal = isSuper ? (is_global || q.is_global ? 1 : 0) : 0;

      const [qbRes] = await pool.query(`
        INSERT INTO question_bank (
          institute_id, category_id, passage_id, question_text_en, question_text_hi,
          options_en_json, options_hi_json, options_images_json, correct_option_index,
          explanation_en, explanation_hi, explanation_image_url, image_url, difficulty, is_global
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        instId, targetCatId, passageId, qEn, q.question_text_hi || '',
        JSON.stringify(optsEn), JSON.stringify(optsHi), JSON.stringify(optsImgs),
        parseInt(q.correct_option_index, 10) || 0,
        q.explanation_en || q.explanation || '', q.explanation_hi || '',
        normalizeImageUrl(q.explanation_image_url || q.explanation_image) || null,
        normalizeImageUrl(q.image_url || q.image) || null,
        q.difficulty || 'medium', finalIsGlobal
      ]);

      const questionId = qbRes.insertId;

      // Auto-save & create tags for this question
      const rawTags = q.tag_names || q.tags;
      if (rawTags) {
        await saveQuestionTags(questionId, rawTags, instId);
      }

      // 2. Link to section if section_id provided
      if (section_id) {
        await pool.query('INSERT IGNORE INTO exam_section_questions (section_id, question_id) VALUES (?, ?)', [section_id, questionId]);
        await pool.query(`
          INSERT INTO exam_questions (
            section_id, institute_id, passage_id, question_text_en, question_text_hi,
            options_en_json, options_hi_json, options_images_json, correct_option_index,
            explanation_en, explanation_hi, image_url, difficulty
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          section_id, instId, passageId, qEn, q.question_text_hi || '',
          JSON.stringify(optsEn), JSON.stringify(optsHi), JSON.stringify(optsImgs),
          parseInt(q.correct_option_index, 10) || 0, q.explanation_en || '', q.explanation_hi || '',
          q.image_url || '', q.difficulty || 'medium'
        ]);
      }

      insertedCount++;
    }

    res.json({ message: `Successfully imported ${insertedCount} master questions into Question Bank.`, insertedCount });
  } catch (err) {
    console.error('Bulk Master Questions Upload Error:', err);
    res.status(500).json({ error: `Error processing bulk question bank upload: ${err.message}` });
  }
});

// 7b. Bulk Add Questions to Exam Section (With Passage & Multi-Language Support)
router.post('/sections/:sectionId/questions/bulk', requireInstituteAdmin, async (req, res) => {
  try {
    const sectionId = req.params.sectionId;
    const { questions } = req.body;

    console.log(`[DEBUG EXAM SERVER] Bulk import for Section ID: ${sectionId}, Count: ${questions?.length}`);

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'No questions provided for bulk upload.' });
    }

    const [sec] = await pool.query('SELECT exam_id FROM exam_sections WHERE id = ?', [sectionId]);
    if (sec.length === 0) return res.status(404).json({ error: 'Section not found.' });

    const [exam] = await pool.query('SELECT institute_id FROM exams WHERE id = ?', [sec[0].exam_id]);
    const instId = exam[0].institute_id;

    let insertedCount = 0;
    const passageCache = new Map(); // passageText -> passageId

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qEn = q.question_text_en || q.question_en || q.question_text || q.question || '';
      const optsEn = Array.isArray(q.options_en) ? q.options_en : (Array.isArray(q.options) ? q.options : []);

      if (!qEn || !optsEn || optsEn.length === 0) {
        console.warn(`[DEBUG EXAM SERVER] Skipping Question #${i + 1} due to missing text or options:`, { qEn, optsEn, q });
        continue;
      }

      let passageId = null;
      if (q.passage_text_en && q.passage_text_en.trim()) {
        const pKey = q.passage_text_en.trim();
        if (passageCache.has(pKey)) {
          passageId = passageCache.get(pKey);
        } else {
          // Check DB for existing passage with same text for this institute
          const [existP] = await pool.query('SELECT id FROM passages WHERE institute_id = ? AND passage_text_en = ? LIMIT 1', [instId, pKey]);
          if (existP.length > 0) {
            passageId = existP[0].id;
          } else {
            const [pRes] = await pool.query('INSERT INTO passages (institute_id, passage_text_en, passage_text_hi, created_by) VALUES (?, ?, ?, ?)', [
              instId, pKey, q.passage_text_hi || '', req.user.id
            ]);
            passageId = pRes.insertId;
          }
          passageCache.set(pKey, passageId);
        }
      }

      const optsHi = Array.isArray(q.options_hi) ? q.options_hi : [];
      const optsImgs = Array.isArray(q.options_images) ? q.options_images : [];

      // 1. Insert into Master Question Bank (question_bank)
      const [qbRes] = await pool.query(`
        INSERT INTO question_bank (
          institute_id, category_id, passage_id, question_text_en, question_text_hi,
          options_en_json, options_hi_json, options_images_json, correct_option_index,
          explanation_en, explanation_hi, image_url, difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        instId, q.category_id || null, passageId, qEn, q.question_text_hi || '',
        JSON.stringify(optsEn), JSON.stringify(optsHi), JSON.stringify(optsImgs),
        parseInt(q.correct_option_index, 10) || 0, q.explanation_en || '', q.explanation_hi || '',
        q.image_url || '', q.difficulty || 'medium'
      ]);

      const questionId = qbRes.insertId;

      // 2. Link in exam_section_questions
      await pool.query('INSERT IGNORE INTO exam_section_questions (section_id, question_id) VALUES (?, ?)', [sectionId, questionId]);

      // 3. Insert into exam_questions (legacy support)
      await pool.query(`
        INSERT INTO exam_questions (
          section_id, institute_id, passage_id, question_text_en, question_text_hi,
          options_en_json, options_hi_json, options_images_json, correct_option_index,
          explanation_en, explanation_hi, image_url, difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sectionId, instId, passageId, qEn, q.question_text_hi || '',
        JSON.stringify(optsEn), JSON.stringify(optsHi), JSON.stringify(optsImgs),
        parseInt(q.correct_option_index, 10) || 0, q.explanation_en || '', q.explanation_hi || '',
        q.image_url || '', q.difficulty || 'medium'
      ]);

      insertedCount++;
    }

    res.json({ message: `Successfully imported ${insertedCount} exam questions.`, insertedCount });
  } catch (err) {
    console.error('Bulk Exam Questions Upload Error:', err);
    res.status(500).json({ error: 'Error processing bulk question upload.' });
  }
});

// 8. Start Candidate Exam Session
router.post('/:id/start', requireAuth, async (req, res) => {
  try {
    const examId = req.params.id;
    const userId = req.user.id;

    const access = await verifyExamStudentAccess(req.user, examId);
    if (!access.allowed) {
      return res.status(access.status || 403).json({ error: access.error });
    }

    const exam = access.exam;

    // Mode check for Actual Exam scheduling window
    if (exam.mode === 'actual' && req.user.role === 'user') {
      const now = new Date();
      if (exam.scheduled_start && now < new Date(exam.scheduled_start)) {
        return res.status(403).json({ error: `Exam has not started yet. Scheduled start: ${new Date(exam.scheduled_start).toLocaleString()}` });
      }
      if (exam.scheduled_end && now > new Date(exam.scheduled_end)) {
        return res.status(403).json({ error: 'Exam submission window has ended.' });
      }
    }

    // Check existing attempt
    const [existingAttempts] = await pool.query(`
      SELECT * FROM exam_attempts
      WHERE exam_id = ? AND user_id = ? AND status = 'in_progress'
      ORDER BY id DESC LIMIT 1
    `, [examId, userId]);

    let attempt;
    if (existingAttempts.length > 0) {
      attempt = existingAttempts[0];
    } else {
      // Check if student already completed actual mode exam
      if (exam.mode === 'actual' && req.user.role === 'user') {
        const [completed] = await pool.query('SELECT id FROM exam_attempts WHERE exam_id = ? AND user_id = ? AND status IN ("completed", "auto_submitted")', [examId, userId]);
        if (completed.length > 0) {
          return res.status(403).json({ error: 'You have already submitted this exam.' });
        }
      }

      // Create new in_progress attempt
      const [attemptRes] = await pool.query(`
        INSERT INTO exam_attempts (exam_id, user_id, institute_id, start_time, status)
        VALUES (?, ?, ?, NOW(), 'in_progress')
      `, [examId, userId, exam.institute_id]);

      const [newAttempt] = await pool.query('SELECT * FROM exam_attempts WHERE id = ?', [attemptRes.insertId]);
      attempt = newAttempt[0];
    }

    // Fetch all sections & questions formatted for the candidate dashboard
    const [sections] = await pool.query('SELECT * FROM exam_sections WHERE exam_id = ? ORDER BY section_order ASC', [examId]);

    const formattedSections = [];
    for (const sec of sections) {
      let [questions] = await pool.query(`
        SELECT qb.id, esq.section_id, qb.passage_id, qb.question_text_en, qb.question_text_hi,
               qb.options_en_json, qb.options_hi_json, qb.options_images_json,
               qb.image_url, qb.difficulty, esq.question_order,
               p.passage_text_en, p.passage_text_hi, p.passage_image_url
        FROM exam_section_questions esq
        JOIN question_bank qb ON esq.question_id = qb.id
        LEFT JOIN passages p ON qb.passage_id = p.id
        WHERE esq.section_id = ?
        ORDER BY esq.question_order ASC, qb.id ASC
      `, [sec.id]);

      if (questions.length === 0) {
        [questions] = await pool.query(`
          SELECT q.id, q.section_id, q.passage_id, q.question_text_en, q.question_text_hi,
                 q.options_en_json, q.options_hi_json, q.options_images_json,
                 q.image_url, q.difficulty, q.question_order,
                 p.passage_text_en, p.passage_text_hi, p.passage_image_url
          FROM exam_questions q
          LEFT JOIN passages p ON q.passage_id = p.id
          WHERE q.section_id = ?
          ORDER BY q.question_order ASC, q.id ASC
        `, [sec.id]);
      }

      formattedSections.push({
        id: sec.id,
        section_name: sec.section_name,
        section_order: sec.section_order,
        questions: questions.map(q => ({
          id: q.id,
          section_id: q.section_id,
          passage_id: q.passage_id,
          question_text_en: q.question_text_en,
          question_text_hi: q.question_text_hi,
          options_en: safeJSONParse(q.options_en_json),
          options_hi: safeJSONParse(q.options_hi_json),
          options_images: safeJSONParse(q.options_images_json),
          image_url: q.image_url,
          passage_text_en: q.passage_text_en,
          passage_text_hi: q.passage_text_hi,
          passage_image_url: q.passage_image_url
        }))
      });
    }

    res.json({
      attempt,
      exam,
      sections: formattedSections
    });
  } catch (err) {
    console.error('Start Exam Error:', err);
    res.status(500).json({ error: 'Error starting exam session.' });
  }
});

// 9. Auto-save Candidate Exam Progress
router.put('/attempts/:attemptId/save', requireAuth, async (req, res) => {
  try {
    const attemptId = req.params.attemptId;
    const { details_json } = req.body;

    await pool.query('UPDATE exam_attempts SET details_json = ? WHERE id = ? AND user_id = ?', [
      JSON.stringify(details_json || {}), attemptId, req.user.id
    ]);

    res.json({ message: 'Progress saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Error saving progress.' });
  }
});

// 10. Final Submit & Score Evaluation
router.post('/attempts/:attemptId/submit', requireAuth, async (req, res) => {
  try {
    const attemptId = req.params.attemptId;
    const userId = req.user.id;
    const { responses, is_auto_submit } = req.body; // responses: array of { question_id, section_id, palette_state, selected_option, time_spent_sec, language }

    const [attempts] = await pool.query('SELECT * FROM exam_attempts WHERE id = ? AND user_id = ?', [attemptId, userId]);
    if (attempts.length === 0) return res.status(404).json({ error: 'Attempt not found.' });

    const attempt = attempts[0];
    const [exams] = await pool.query('SELECT * FROM exams WHERE id = ?', [attempt.exam_id]);
    const exam = exams[0];

    const posMarks = parseFloat(exam.positive_marks) || 2.00;
    const negMarks = parseFloat(exam.negative_marks) || 0.50;

    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    let totalScore = 0;

    // Fetch all answer keys for this exam
    let [questions] = await pool.query(`
      SELECT qb.id, esq.section_id, qb.correct_option_index
      FROM exam_section_questions esq
      JOIN question_bank qb ON esq.question_id = qb.id
      JOIN exam_sections es ON esq.section_id = es.id
      WHERE es.exam_id = ?
    `, [exam.id]);

    if (questions.length === 0) {
      [questions] = await pool.query(`
        SELECT eq.id, eq.section_id, eq.correct_option_index
        FROM exam_questions eq
        JOIN exam_sections es ON eq.section_id = es.id
        WHERE es.exam_id = ?
      `, [exam.id]);
    }

    const answerKeyMap = new Map();
    questions.forEach(q => answerKeyMap.set(q.id, q.correct_option_index));

    // Clear previous item logs if re-evaluating
    await pool.query('DELETE FROM exam_item_logs WHERE attempt_id = ?', [attemptId]);

    if (Array.isArray(responses)) {
      for (const item of responses) {
        const questionId = item.question_id || item.id || 0;
        const sectionId = item.section_id || 0;
        const correctIndex = answerKeyMap.get(questionId);
        const state = parseInt(item.palette_state, 10) || 1;
        const selected = item.selected_option !== null && item.selected_option !== undefined ? parseInt(item.selected_option, 10) : null;

        // SSC Rule: Palette State 3 (Answered) and 5 (Answered & Marked) are evaluated
        const isEvaluated = (state === 3 || state === 5) && selected !== null;
        let isCorrect = null;
        let marksAwarded = 0;

        if (isEvaluated) {
          if (selected === correctIndex) {
            isCorrect = true;
            correctCount++;
            marksAwarded = posMarks;
            totalScore += posMarks;
          } else {
            isCorrect = false;
            wrongCount++;
            marksAwarded = -negMarks;
            totalScore -= negMarks;
          }
        } else {
          unattemptedCount++;
        }

        // Safely log item attempt (resilient to missing foreign key tables)
        if (questionId && sectionId) {
          try {
            await pool.query(`
              INSERT INTO exam_item_logs (
                attempt_id, exam_question_id, section_id, palette_state,
                selected_option, is_correct, marks_awarded, time_spent_sec, language_used
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              attemptId, questionId, sectionId, state,
              selected, isCorrect, marksAwarded, parseInt(item.time_spent_sec, 10) || 0, item.language || 'en'
            ]);
          } catch (logErr) {
            console.warn(`[EXAM SUBMIT LOG WARNING] Skipped log for question #${questionId}:`, logErr.message);
          }
        }
      }
    }

    const totalEvaluated = correctCount + wrongCount;
    const accuracyPct = totalEvaluated > 0 ? (correctCount / totalEvaluated) * 100 : 0;
    const finalStatus = is_auto_submit ? 'auto_submitted' : 'completed';

    await pool.query(`
      UPDATE exam_attempts SET
        submit_time = NOW(), status = ?, total_score = ?,
        correct_count = ?, wrong_count = ?, unattempted_count = ?,
        accuracy_pct = ?, details_json = ?
      WHERE id = ?
    `, [
      finalStatus, totalScore, correctCount, wrongCount, unattemptedCount,
      accuracyPct.toFixed(2), JSON.stringify(req.body.details_json || {}), attemptId
    ]);

    res.json({
      message: 'Exam submitted successfully.',
      attemptId,
      totalScore,
      correctCount,
      wrongCount,
      unattemptedCount,
      accuracyPct: Math.round(accuracyPct)
    });
  } catch (err) {
    console.error('Submit Exam Error:', err);
    res.status(500).json({ error: 'Error submitting exam.' });
  }
});

// 11. Detailed Candidate Exam Analysis with Item-Level Analytics & Option Distribution %
router.get('/attempts/:attemptId/analysis', requireAuth, async (req, res) => {
  try {
    const attemptId = req.params.attemptId;

    const [attempts] = await pool.query(`
      SELECT ea.*, u.full_name as candidate_name, u.email as candidate_email,
             e.title as exam_title, e.exam_type, e.positive_marks, e.negative_marks, e.total_duration_mins,
             i.name as institute_name
      FROM exam_attempts ea
      JOIN users u ON ea.user_id = u.id
      JOIN exams e ON ea.exam_id = e.id
      LEFT JOIN institutes i ON ea.institute_id = i.id
      WHERE ea.id = ?
    `, [attemptId]);

    if (attempts.length === 0) return res.status(404).json({ error: 'Attempt not found.' });

    const attempt = attempts[0];
    const examId = attempt.exam_id;

    // Rank & Percentile Calculation
    const [allAttempts] = await pool.query(`
      SELECT id, user_id, total_score, accuracy_pct, TIMESTAMPDIFF(SECOND, start_time, submit_time) as duration_sec
      FROM exam_attempts
      WHERE exam_id = ? AND status IN ('completed', 'auto_submitted')
      ORDER BY total_score DESC, accuracy_pct DESC, duration_sec ASC
    `, [examId]);

    const totalCandidates = allAttempts.length;
    const rankIndex = allAttempts.findIndex(a => a.id == attemptId);
    const candidateRank = rankIndex !== -1 ? rankIndex + 1 : 1;
    const percentile = totalCandidates > 1 ? Math.round(((totalCandidates - candidateRank) / (totalCandidates - 1)) * 100) : 100;

    // Section-wise Breakdown
    const [sections] = await pool.query('SELECT * FROM exam_sections WHERE exam_id = ? ORDER BY section_order ASC', [examId]);
    const [itemLogs] = await pool.query(`
      SELECT eil.*, 
             COALESCE(qb.question_text_en, eq.question_text_en) as question_text_en,
             COALESCE(qb.question_text_hi, eq.question_text_hi) as question_text_hi,
             COALESCE(qb.options_en_json, eq.options_en_json) as options_en_json,
             COALESCE(qb.options_hi_json, eq.options_hi_json) as options_hi_json,
             COALESCE(qb.options_images_json, eq.options_images_json) as options_images_json,
             COALESCE(qb.correct_option_index, eq.correct_option_index) as correct_option_index,
             COALESCE(qb.explanation_en, eq.explanation_en) as explanation_en,
             COALESCE(qb.explanation_hi, eq.explanation_hi) as explanation_hi,
             COALESCE(qb.image_url, eq.image_url) as image_url,
             COALESCE(p1.passage_text_en, p2.passage_text_en) as passage_text_en,
             COALESCE(p1.passage_text_hi, p2.passage_text_hi) as passage_text_hi,
             COALESCE(p1.passage_image_url, p2.passage_image_url) as passage_image_url,
             es.section_name
      FROM exam_item_logs eil
      LEFT JOIN question_bank qb ON eil.exam_question_id = qb.id
      LEFT JOIN exam_questions eq ON eil.exam_question_id = eq.id
      JOIN exam_sections es ON eil.section_id = es.id
      LEFT JOIN passages p1 ON qb.passage_id = p1.id
      LEFT JOIN passages p2 ON eq.passage_id = p2.id
      WHERE eil.attempt_id = ?
      ORDER BY es.section_order ASC, eil.id ASC
    `, [attemptId]);

    // Compute Item-Level Aggregates across ALL candidates for this exam
    const [avgTimeRows] = await pool.query(`
      SELECT exam_question_id, AVG(time_spent_sec) as avg_time_sec, COUNT(*) as total_responses
      FROM exam_item_logs
      WHERE section_id IN (SELECT id FROM exam_sections WHERE exam_id = ?)
      GROUP BY exam_question_id
    `, [examId]);

    const avgTimeMap = new Map();
    avgTimeRows.forEach(r => avgTimeMap.set(r.exam_question_id, Math.round(parseFloat(r.avg_time_sec) || 0)));

    // Compute Option Selection % for each question across ALL candidates
    const [optionDistRows] = await pool.query(`
      SELECT exam_question_id, selected_option, COUNT(*) as count
      FROM exam_item_logs
      WHERE section_id IN (SELECT id FROM exam_sections WHERE exam_id = ?) AND selected_option IS NOT NULL
      GROUP BY exam_question_id, selected_option
    `, [examId]);

    const optionDistMap = new Map(); // qId -> { optIndex: count }
    const optionTotalMap = new Map(); // qId -> totalSelectedCount

    optionDistRows.forEach(r => {
      const qId = r.exam_question_id;
      const opt = r.selected_option;
      const count = parseInt(r.count, 10);

      if (!optionDistMap.has(qId)) optionDistMap.set(qId, {});
      optionDistMap.get(qId)[opt] = count;
      optionTotalMap.set(qId, (optionTotalMap.get(qId) || 0) + count);
    });

    const itemAnalysisList = itemLogs.map(log => {
      const qId = log.exam_question_id;
      const optsEn = safeJSONParse(log.options_en_json);
      const optsHi = safeJSONParse(log.options_hi_json);
      const totalSelected = optionTotalMap.get(qId) || 1;
      const distObj = optionDistMap.get(qId) || {};

      const optionStatsPct = (optsEn || []).map((_, idx) => {
        const count = distObj[idx] || 0;
        return Math.round((count / totalSelected) * 100);
      });

      return {
        question_id: qId,
        section_name: log.section_name,
        question_text_en: log.question_text_en,
        question_text_hi: log.question_text_hi,
        passage_text_en: log.passage_text_en,
        passage_text_hi: log.passage_text_hi,
        options_en: optsEn,
        options_hi: optsHi,
        correct_option_index: log.correct_option_index,
        selected_option: log.selected_option,
        palette_state: log.palette_state,
        is_correct: log.is_correct,
        marks_awarded: parseFloat(log.marks_awarded),
        time_spent_sec: log.time_spent_sec,
        avg_time_sec: avgTimeMap.get(qId) || log.time_spent_sec,
        explanation_en: log.explanation_en,
        explanation_hi: log.explanation_hi,
        image_url: log.image_url
      };
    });

    // Calculate Section-Wise Benchmark Analytics (My Score vs Cohort Avg vs Topper Score)
    const [cohortSectionRows] = await pool.query(`
      SELECT eil.section_id, eil.attempt_id,
             SUM(eil.marks_awarded) as sec_score,
             SUM(CASE WHEN eil.is_correct = 1 THEN 1 ELSE 0 END) as sec_correct,
             SUM(CASE WHEN eil.is_correct = 0 THEN 1 ELSE 0 END) as sec_wrong,
             SUM(CASE WHEN eil.is_correct IS NULL THEN 1 ELSE 0 END) as sec_unatt,
             SUM(eil.time_spent_sec) as sec_time
      FROM exam_item_logs eil
      JOIN exam_attempts ea ON eil.attempt_id = ea.id
      WHERE ea.exam_id = ? AND ea.status IN ('completed', 'auto_submitted')
      GROUP BY eil.section_id, eil.attempt_id
    `, [examId]);

    // Map cohort statistics per section
    const cohortSecStats = new Map();
    cohortSectionRows.forEach(r => {
      const secId = r.section_id;
      if (!cohortSecStats.has(secId)) {
        cohortSecStats.set(secId, { scores: [], accuracies: [], times: [] });
      }
      const score = parseFloat(r.sec_score) || 0;
      const corr = parseInt(r.sec_correct, 10) || 0;
      const wrg = parseInt(r.sec_wrong, 10) || 0;
      const acc = (corr + wrg) > 0 ? Math.round((corr / (corr + wrg)) * 100) : 0;
      const time = parseInt(r.sec_time, 10) || 0;

      const stat = cohortSecStats.get(secId);
      stat.scores.push(score);
      stat.accuracies.push(acc);
      stat.times.push(time);
    });

    const posMarks = parseFloat(attempt.positive_marks) || 2.0;

    const sectionAnalysis = sections.map(sec => {
      const secLogs = itemLogs.filter(log => log.section_id === sec.id);
      let studentCorrect = 0, studentWrong = 0, studentUnatt = 0, studentScore = 0, studentTime = 0;

      secLogs.forEach(log => {
        if (log.is_correct === 1 || log.is_correct === true) studentCorrect++;
        else if (log.is_correct === 0 || log.is_correct === false) studentWrong++;
        else studentUnatt++;
        studentScore += parseFloat(log.marks_awarded) || 0;
        studentTime += parseInt(log.time_spent_sec, 10) || 0;
      });

      const studentAccuracy = (studentCorrect + studentWrong) > 0
        ? Math.round((studentCorrect / (studentCorrect + studentWrong)) * 100)
        : 0;

      const totalQs = secLogs.length;
      const maxScore = totalQs * posMarks;

      const stat = cohortSecStats.get(sec.id) || { scores: [studentScore], accuracies: [studentAccuracy], times: [studentTime] };
      const topScore = stat.scores.length > 0 ? Math.max(...stat.scores) : studentScore;
      const avgScore = stat.scores.length > 0 ? Math.round((stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length) * 100) / 100 : studentScore;
      const avgAccuracy = stat.accuracies.length > 0 ? Math.round(stat.accuracies.reduce((a, b) => a + b, 0) / stat.accuracies.length) : studentAccuracy;
      const avgTimeSec = stat.times.length > 0 ? Math.round(stat.times.reduce((a, b) => a + b, 0) / stat.times.length) : studentTime;

      return {
        section_id: sec.id,
        section_name: sec.section_name,
        section_order: sec.section_order,
        total_questions: totalQs,
        max_score: maxScore,
        score: Math.round(studentScore * 100) / 100,
        accuracy_pct: studentAccuracy,
        correct_count: studentCorrect,
        wrong_count: studentWrong,
        unattempted_count: studentUnatt,
        time_spent_sec: studentTime,
        top_score: Math.round(topScore * 100) / 100,
        cohort_avg_score: avgScore,
        cohort_avg_accuracy: avgAccuracy,
        cohort_avg_time_sec: avgTimeSec
      };
    });

    res.json({
      attempt,
      rank: candidateRank,
      totalCandidates,
      percentile,
      sections,
      sectionAnalysis,
      itemAnalysis: itemAnalysisList
    });
  } catch (err) {
    console.error('Exam Analysis Error:', err);
    res.status(500).json({ error: 'Error generating detailed exam analysis.' });
  }
});

// 12. Exam Leaderboard Endpoint
router.get('/:id/leaderboard', requireAuth, async (req, res) => {
  try {
    const examId = req.params.id;

    const [rows] = await pool.query(`
      SELECT ea.id as attempt_id, ea.user_id, ea.total_score, ea.correct_count, ea.wrong_count,
             ea.accuracy_pct, ea.submit_time,
             TIMESTAMPDIFF(SECOND, ea.start_time, ea.submit_time) as duration_sec,
             u.full_name, u.email, i.name as institute_name
      FROM exam_attempts ea
      JOIN users u ON ea.user_id = u.id AND u.role = 'user'
      LEFT JOIN institutes i ON ea.institute_id = i.id
      WHERE ea.exam_id = ? AND ea.status IN ('completed', 'auto_submitted')
      ORDER BY ea.total_score DESC, ea.accuracy_pct DESC, duration_sec ASC
      LIMIT 100
    `, [examId]);

    const leaderboard = rows.map((r, idx) => ({
      rank: idx + 1,
      attempt_id: r.attempt_id,
      user_id: r.user_id,
      full_name: r.full_name,
      email: r.email,
      institute_name: r.institute_name || 'Independent',
      total_score: parseFloat(r.total_score),
      accuracy_pct: Math.round(r.accuracy_pct),
      correct_count: r.correct_count,
      duration_mins: Math.round((r.duration_sec || 0) / 60)
    }));

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching exam leaderboard.' });
  }
});

// 13. Teacher / Institute Class Analytics Endpoint
router.get('/:id/teacher-analytics', requireInstituteAdmin, async (req, res) => {
  try {
    const examId = req.params.id;

    const [attempts] = await pool.query(`
      SELECT ea.total_score, ea.accuracy_pct, ea.correct_count, ea.wrong_count, ea.unattempted_count,
             TIMESTAMPDIFF(SECOND, ea.start_time, ea.submit_time) as duration_sec
      FROM exam_attempts ea
      WHERE ea.exam_id = ? AND ea.status IN ('completed', 'auto_submitted')
    `, [examId]);

    if (attempts.length === 0) {
      return res.json({
        totalStudents: 0, avgScore: 0, maxScore: 0, minScore: 0, avgAccuracy: 0, avgTimeMins: 0
      });
    }

    let sumScore = 0, maxScore = -999, minScore = 999, sumAcc = 0, sumTime = 0;
    attempts.forEach(a => {
      const sc = parseFloat(a.total_score);
      sumScore += sc;
      if (sc > maxScore) maxScore = sc;
      if (sc < minScore) minScore = sc;
      sumAcc += parseFloat(a.accuracy_pct);
      sumTime += parseInt(a.duration_sec || 0, 10);
    });

    const count = attempts.length;

    res.json({
      totalStudents: count,
      avgScore: (sumScore / count).toFixed(2),
      maxScore: maxScore.toFixed(2),
      minScore: minScore.toFixed(2),
      avgAccuracy: Math.round(sumAcc / count),
      avgTimeMins: Math.round((sumTime / count) / 60)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching teacher analytics.' });
  }
});

// 14. Student Exam Attempts History
router.get('/my-attempts/history', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT ea.*, e.title as exam_title, e.exam_type, e.mode
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id = e.id
      WHERE ea.user_id = ? AND ea.status IN ('completed', 'auto_submitted')
      ORDER BY ea.submit_time DESC
    `, [userId]);

    res.json({ attempts: rows });
  } catch (err) {
    console.error('Fetch Exam Attempts History Error:', err);
    res.status(500).json({ error: 'Error fetching exam attempts history.' });
  }
});

export default router;


import express from 'express';
import pool from '../db.js';
import { requireAuth, requireSuperAdmin, requireInstituteAdmin } from '../middleware/auth.js';
import { slugify, generateUniqueSlug } from '../utils/slugify.js';

const router = express.Router();

// Helper to generate unique institute code (e.g. EDUTOR-82F1)
function generateInstituteCode(prefix = 'EDU') {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}

// 0a. PUBLIC: Get Institute Public Branding (by slug or code or ID)
router.get('/public-branding/:slugOrCode', async (req, res) => {
  try {
    const param = req.params.slugOrCode.trim();
    let query = `
      SELECT id, name, code, slug, logo_url, primary_color, welcome_title, welcome_subtitle, banner_url, allow_global_content
      FROM institutes
      WHERE (slug = ? OR code = ? OR id = ?) AND status = 'active'
    `;
    const instIdNum = parseInt(param, 10) || 0;
    const [rows] = await pool.query(query, [param, param.toUpperCase(), instIdNum]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Institute portal not found or inactive.' });
    }

    res.json({ institute: rows[0] });
  } catch (err) {
    console.error('Public Branding Fetch Error:', err);
    res.status(500).json({ error: 'Error fetching institute branding.' });
  }
});

// 0b. Get Student's Enrolled Institutes list (Auth user)
router.get('/my-enrollments', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all institutes the user is connected to via institute_memberships or users.institute_id
    const [rows] = await pool.query(`
      SELECT DISTINCT i.id, i.name, i.code, i.slug, i.logo_url, i.primary_color,
                      b.id as batch_id, b.name as batch_name
      FROM institutes i
      LEFT JOIN institute_memberships im ON im.institute_id = i.id AND im.user_id = ?
      LEFT JOIN users u ON u.id = ? AND u.institute_id = i.id
      LEFT JOIN student_batches sb ON sb.user_id = ?
      LEFT JOIN batches b ON sb.batch_id = b.id AND b.institute_id = i.id
      WHERE (im.user_id = ? OR u.id IS NOT NULL) AND i.status = 'active'
    `, [userId, userId, userId, userId]);

    res.json({ enrollments: rows });
  } catch (err) {
    console.error('Fetch Enrollments Error:', err);
    res.status(500).json({ error: 'Error fetching enrolled institutes.' });
  }
});

// 0c. Enroll Student in an Institute (Auth user)
router.post('/enroll', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { institute_id, batch_id, institute_slug } = req.body;

    let targetInstId = institute_id;

    if (!targetInstId && institute_slug) {
      const [insts] = await pool.query('SELECT id FROM institutes WHERE slug = ? OR code = ?', [institute_slug, institute_slug]);
      if (insts.length > 0) {
        targetInstId = insts[0].id;
      }
    }

    if (!targetInstId) {
      return res.status(400).json({ error: 'Institute identifier is required.' });
    }

    // Insert membership if not existing
    await pool.query(`
      INSERT INTO institute_memberships (institute_id, user_id, role)
      VALUES (?, ?, 'student')
      ON DUPLICATE KEY UPDATE status = 'active'
    `, [targetInstId, userId]);

    // If user's primary institute_id is NULL, set it to this institute
    await pool.query(`
      UPDATE users SET institute_id = ? WHERE id = ? AND (institute_id IS NULL OR institute_id = 0)
    `, [targetInstId, userId]);

    // If batch_id provided, add student_batches
    if (batch_id) {
      await pool.query(`
        INSERT INTO student_batches (user_id, batch_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE batch_id = VALUES(batch_id)
      `, [userId, batch_id]);
    }

    res.json({ message: 'Successfully enrolled in institute!', institute_id: targetInstId });
  } catch (err) {
    console.error('Enroll Student Error:', err);
    res.status(500).json({ error: 'Error enrolling in institute.' });
  }
});

// 0d. Update Institute Portal Branding & Customization (Institute Admin or Super Admin)
router.put('/my-branding', requireInstituteAdmin, async (req, res) => {
  try {
    const instId = req.user.institute_id;
    if (!instId && req.user.role !== 'super_admin') {
      return res.status(400).json({ error: 'No associated institute found.' });
    }

    const targetId = req.body.institute_id || instId;
    const { name, slug, logo_url, primary_color, welcome_title, welcome_subtitle, banner_url, allow_global_content } = req.body;

    // Fetch existing institute details
    const [existing] = await pool.query('SELECT * FROM institutes WHERE id = ?', [targetId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Institute not found.' });
    }

    const currentInst = existing[0];
    const newName = name && name.trim() ? name.trim() : currentInst.name;

    // Handle unique slug generation
    let finalSlug = currentInst.slug;
    if (slug && slug.trim() && slug.trim() !== currentInst.slug) {
      finalSlug = await generateUniqueSlug(pool, slug.trim(), targetId);
    } else if (!finalSlug) {
      finalSlug = await generateUniqueSlug(pool, newName, targetId);
    }

    const updatedLogo = logo_url !== undefined ? logo_url : currentInst.logo_url;
    const updatedColor = primary_color || currentInst.primary_color || '#4f46e5';
    const updatedTitle = welcome_title !== undefined ? welcome_title : currentInst.welcome_title;
    const updatedSubtitle = welcome_subtitle !== undefined ? welcome_subtitle : currentInst.welcome_subtitle;
    const updatedBanner = banner_url !== undefined ? banner_url : currentInst.banner_url;
    const updatedAllowGlobal = allow_global_content !== undefined ? (allow_global_content ? 1 : 0) : currentInst.allow_global_content;

    await pool.query(`
      UPDATE institutes 
      SET name = ?, slug = ?, logo_url = ?, primary_color = ?, 
          welcome_title = ?, welcome_subtitle = ?, banner_url = ?, allow_global_content = ?
      WHERE id = ?
    `, [newName, finalSlug, updatedLogo, updatedColor, updatedTitle, updatedSubtitle, updatedBanner, updatedAllowGlobal, targetId]);

    const [updated] = await pool.query('SELECT * FROM institutes WHERE id = ?', [targetId]);

    res.json({
      message: 'Institute branding updated successfully!',
      institute: updated[0]
    });
  } catch (err) {
    console.error('Update Branding Error:', err);
    res.status(500).json({ error: 'Error updating institute portal branding.' });
  }
});

// 1. Get All Institutes (Super Admin only)
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const [institutes] = await pool.query(`
      SELECT i.*, 
             COUNT(DISTINCT u.id) as student_count,
             COUNT(DISTINCT q.id) as quiz_count
      FROM institutes i
      LEFT JOIN users u ON u.institute_id = i.id AND u.role = 'user'
      LEFT JOIN quizzes q ON q.institute_id = i.id
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `);
    res.json({ institutes });
  } catch (err) {
    console.error('Fetch Institutes Error:', err);
    res.status(500).json({ error: 'Error fetching institutes.' });
  }
});

// 2. Get Single Institute Details & Metrics (Super Admin or Institute Admin of that institute)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const instId = parseInt(req.params.id, 10);

    // Permission check: Super admin OR institute admin of this institute
    if (req.user.role !== 'super_admin' && (req.user.role !== 'institute_admin' || req.user.institute_id !== instId)) {
      return res.status(403).json({ error: 'Access denied to this institute details.' });
    }

    const [institutes] = await pool.query('SELECT * FROM institutes WHERE id = ?', [instId]);
    if (institutes.length === 0) {
      return res.status(404).json({ error: 'Institute not found.' });
    }

    const [students] = await pool.query('SELECT COUNT(*) as total FROM users WHERE institute_id = ? AND role = "user"', [instId]);
    const [admins] = await pool.query('SELECT id, full_name, email FROM users WHERE institute_id = ? AND role = "institute_admin"', [instId]);

    res.json({
      institute: institutes[0],
      studentCount: students[0].total,
      admins
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching institute details.' });
  }
});

// 3. Create Coaching Institute (Super Admin)
router.post('/', requireSuperAdmin, async (req, res) => {
  try {
    const { name, contact_email, address, logo_url, admin_name, admin_email, admin_password } = req.body;

    if (!name || !contact_email) {
      return res.status(400).json({ error: 'Institute name and contact email are required.' });
    }

    const code = generateInstituteCode(name.substring(0, 3).toUpperCase());

    const [result] = await pool.query(
      'INSERT INTO institutes (name, code, contact_email, address, logo_url) VALUES (?, ?, ?, ?, ?)',
      [name, code, contact_email, address || '', logo_url || '']
    );

    const instituteId = result.insertId;

    // Optional: create institute admin user immediately if credentials provided
    let adminId = null;
    if (admin_email && admin_password) {
      const bcrypt = (await import('bcryptjs')).default;
      const hash = await bcrypt.hash(admin_password, 10);

      const [userResult] = await pool.query(
        'INSERT INTO users (full_name, email, password_hash, role, institute_id) VALUES (?, ?, ?, ?, ?)',
        [admin_name || `${name} Admin`, admin_email, hash, 'institute_admin', instituteId]
      );
      adminId = userResult.insertId;
    }

    res.status(201).json({
      message: 'Coaching Institute created successfully.',
      instituteId,
      code,
      adminId
    });
  } catch (err) {
    console.error('Create Institute Error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Institute code or Admin Email already exists.' });
    }
    res.status(500).json({ error: 'Error creating institute.' });
  }
});

// 4. Update Institute (Super Admin or Institute Admin of that institute)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const instId = parseInt(req.params.id, 10);
    const { name, contact_email, address, logo_url, status } = req.body;

    if (req.user.role !== 'super_admin' && (req.user.role !== 'institute_admin' || req.user.institute_id !== instId)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Only super admin can change institute status (active/inactive)
    let sql = 'UPDATE institutes SET name = ?, contact_email = ?, address = ?, logo_url = ?';
    const params = [name, contact_email, address || '', logo_url || ''];

    if (req.user.role === 'super_admin' && status) {
      sql += ', status = ?';
      params.push(status);
    }

    sql += ' WHERE id = ?';
    params.push(instId);

    await pool.query(sql, params);
    res.json({ message: 'Institute updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating institute.' });
  }
});

// 5. Get Roster of Students in an Institute (Institute Admin or Super Admin)
router.get('/:id/students', requireAuth, async (req, res) => {
  try {
    const instId = parseInt(req.params.id, 10);

    if (req.user.role !== 'super_admin' && (req.user.role !== 'institute_admin' || req.user.institute_id !== instId)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const [students] = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.phone_number, u.created_at,
             COUNT(DISTINCT qa.id) as attempts_count,
             AVG(qa.accuracy_pct) as avg_accuracy
      FROM users u
      LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
      WHERE u.institute_id = ? AND u.role = 'user'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, [instId]);

    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching institute students.' });
  }
});

// 6. Get Available Batches for an Institute + Student Status
router.get('/:instId/batches-status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const instId = parseInt(req.params.instId, 10);

    const [batches] = await pool.query(`
      SELECT b.id, b.name, b.name as batch_name, b.code, b.code as batch_code, b.target_exam, b.description, b.created_at,
             sb.status as student_status
      FROM batches b
      LEFT JOIN student_batches sb ON sb.batch_id = b.id AND sb.user_id = ?
      WHERE b.institute_id = ?
      ORDER BY b.id DESC
    `, [userId, instId]);

    res.json({ batches });
  } catch (err) {
    console.error('Fetch Batches Status Error:', err);
    res.status(500).json({ error: 'Error fetching institute batches.' });
  }
});

// 7. Student Request to Join Batch
router.post('/batches/join-request', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { batch_id } = req.body;
    if (!batch_id) return res.status(400).json({ error: 'Batch ID is required.' });

    // Verify batch exists
    const [batches] = await pool.query('SELECT institute_id FROM batches WHERE id = ?', [batch_id]);
    if (batches.length === 0) return res.status(404).json({ error: 'Batch not found.' });

    const instId = batches[0].institute_id;

    // Ensure student membership in institute
    await pool.query(`
      INSERT INTO institute_memberships (institute_id, user_id, role, status)
      VALUES (?, ?, 'student', 'active')
      ON DUPLICATE KEY UPDATE status = 'active'
    `, [instId, userId]);

    // Submit batch request with status = 'pending'
    await pool.query(`
      INSERT INTO student_batches (user_id, batch_id, status)
      VALUES (?, ?, 'pending')
      ON DUPLICATE KEY UPDATE status = 'pending'
    `, [userId, batch_id]);

    res.json({ message: 'Batch join request submitted successfully. Awaiting teacher approval.', status: 'pending' });
  } catch (err) {
    console.error('Batch Join Request Error:', err);
    res.status(500).json({ error: 'Error submitting batch join request.' });
  }
});

// 8. Delete Institute (Super Admin only)
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM institutes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Institute deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting institute.' });
  }
});

export default router;

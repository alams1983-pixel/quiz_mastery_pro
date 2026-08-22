import express from 'express';
import pool from '../db.js';
import { requireAuth, requireSuperAdmin, requireInstituteAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate unique institute code (e.g. EDUTOR-82F1)
function generateInstituteCode(prefix = 'EDU') {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}

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

// 6. Delete Institute (Super Admin only)
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM institutes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Institute deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting institute.' });
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db.js';
import logger from '../logger.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'edutorai_mastery_quiz_secret_key_2026';

// Helper to generate unique institute code
function generateInstituteCode(prefix = 'EDU') {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${rand}`;
}

// 1. User Registration (Student vs Teacher/Coaching Owner)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, account_type, coaching_name, phone_number, institute_code } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const isTeacher = account_type === 'teacher' || account_type === 'institute_admin';

    let userRole = 'user';
    let instituteId = null;

    if (isTeacher) {
      if (!coaching_name || !coaching_name.trim()) {
        return res.status(400).json({ error: 'Coaching Institute Name is required for teacher registration.' });
      }

      userRole = 'institute_admin';
      const instCode = generateInstituteCode(coaching_name.trim().substring(0, 3).toUpperCase());

      const [instResult] = await pool.query(
        'INSERT INTO institutes (name, code, contact_email) VALUES (?, ?, ?)',
        [coaching_name.trim(), instCode, email]
      );
      instituteId = instResult.insertId;

    } else {
      // Student registration
      if (institute_code) {
        const [insts] = await pool.query('SELECT id FROM institutes WHERE code = ? AND status = "active"', [institute_code.trim().toUpperCase()]);
        if (insts.length > 0) {
          instituteId = insts[0].id;
        }
      }
    }

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, institute_id, phone_number) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, password_hash, userRole, instituteId, phone_number || null]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, full_name, email, role: userRole, institute_id: instituteId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: isTeacher ? 'Coaching Institute registered successfully!' : 'Registration successful.',
      token,
      user: { id: userId, full_name, email, role: userRole, institute_id: instituteId }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// 2. User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, full_name: user.full_name, email: user.email, role: user.role, institute_id: user.institute_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        institute_id: user.institute_id
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// 3a. Get Current Profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.institute_id, u.created_at,
             i.name as institute_name, i.code as institute_code,
             b.id as batch_id, b.name as batch_name
      FROM users u
      LEFT JOIN institutes i ON u.institute_id = i.id
      LEFT JOIN student_batches sb ON u.id = sb.user_id
      LEFT JOIN batches b ON sb.batch_id = b.id
      WHERE u.id = ?
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user profile.' });
  }
});

// 3b-1. Public: Get Institute Active Batches by Institute Code
router.get('/institute-batches/:code', async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const [insts] = await pool.query('SELECT id, name, code FROM institutes WHERE code = ? AND status = "active"', [code]);
    if (insts.length === 0) {
      return res.status(404).json({ error: 'Invalid or inactive institute code.' });
    }

    const inst = insts[0];
    const [batches] = await pool.query('SELECT id, name, description FROM batches WHERE institute_id = ? ORDER BY id DESC', [inst.id]);

    res.json({ institute: inst, batches });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching institute batches.' });
  }
});

// 3b-2. Join Institute & Select Batch via Code
router.post('/join-institute', requireAuth, async (req, res) => {
  try {
    const { code, batch_id } = req.body;
    if (!code) return res.status(400).json({ error: 'Institute code is required.' });

    const [insts] = await pool.query('SELECT id, name FROM institutes WHERE code = ? AND status = "active"', [code.trim().toUpperCase()]);
    if (insts.length === 0) {
      return res.status(404).json({ error: 'Invalid or inactive institute code.' });
    }

    const institute = insts[0];
    await pool.query('UPDATE users SET institute_id = ? WHERE id = ?', [institute.id, req.user.id]);

    let batchName = null;
    if (batch_id) {
      // Clear old student batches for this user and assign new batch
      await pool.query('DELETE FROM student_batches WHERE user_id = ?', [req.user.id]);
      await pool.query('INSERT INTO student_batches (user_id, batch_id) VALUES (?, ?)', [req.user.id, batch_id]);

      const [b] = await pool.query('SELECT name FROM batches WHERE id = ?', [batch_id]);
      if (b.length > 0) batchName = b[0].name;
    }

    // Issue updated token
    const token = jwt.sign(
      { id: req.user.id, full_name: req.user.full_name, email: req.user.email, role: req.user.role, institute_id: institute.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: `Successfully enrolled in ${institute.name}${batchName ? ` (${batchName})` : ''}!`,
      institute,
      batch_name: batchName,
      token
    });
  } catch (err) {
    console.error('Join Institute Error:', err);
    res.status(500).json({ error: 'Error joining institute.' });
  }
});

// 4. Forgot Password Request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ message: 'If that email is registered, password reset instructions have been generated.' });
    }

    const user = users[0];
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Password reset is disabled for Super Admin.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', [hashedToken, expires, user.id]);

    if (process.env.NODE_ENV !== 'production') {
      logger.info(`[DEV ONLY] Password reset token for ${email}: ${rawToken}`);
    }

    res.json({
      message: 'If that email is registered, password reset instructions have been generated.'
    });
  } catch (err) {
    logger.error('Error requesting password reset', err);
    res.status(500).json({ error: 'Error requesting password reset.' });
  }
});

// 5. Reset Password Confirmation
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const [users] = await pool.query('SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()', [hashedToken]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const user = users[0];
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Password reset is disabled for Super Admin.' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?', [password_hash, user.id]);

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (err) {
    logger.error('Error resetting password', err);
    res.status(500).json({ error: 'Error resetting password.' });
  }
});

// 6. Super Admin: List All Users
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.institute_id, u.created_at,
             i.name as institute_name
      FROM users u
      LEFT JOIN institutes i ON u.institute_id = i.id
      ORDER BY u.created_at DESC
    `);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Error listing users.' });
  }
});

// 7. Super Admin: Change User Role & Institute
router.put('/users/:id/role', requireSuperAdmin, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { role, institute_id } = req.body;

    if (!['institute_admin', 'admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "institute_admin" or "user".' });
    }

    const mappedRole = role === 'admin' ? 'institute_admin' : role;

    const [targetUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [targetUserId]);
    if (targetUsers.length === 0) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (targetUsers[0].role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot modify Super Admin role.' });
    }

    await pool.query('UPDATE users SET role = ?, institute_id = ? WHERE id = ?', [mappedRole, institute_id || null, targetUserId]);

    res.json({ message: `User role updated to ${mappedRole}.` });
  } catch (err) {
    res.status(500).json({ error: 'Error updating user role.' });
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'edutorai_mastery_quiz_secret_key_2026';

// 1. User Registration
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, "user")',
      [full_name, email, password_hash]
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { id: userId, full_name, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: userId, full_name, email, role: 'user' }
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
      { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
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
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// 3. Current User Profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user profile.' });
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

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await pool.query('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', [resetToken, expires, user.id]);

    res.json({
      message: 'Reset token generated successfully.',
      resetToken // Returned for testing / mock convenience
    });
  } catch (err) {
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

    const [users] = await pool.query('SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()', [token]);
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
    res.status(500).json({ error: 'Error resetting password.' });
  }
});

// 6. Super Admin: List All Users
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Error listing users.' });
  }
});

// 7. Super Admin: Change User Role
router.put('/users/:id/role', requireSuperAdmin, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either "admin" or "user".' });
    }

    const [targetUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [targetUserId]);
    if (targetUsers.length === 0) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    if (targetUsers[0].role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot modify Super Admin role.' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, targetUserId]);

    res.json({ message: `User role updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ error: 'Error updating user role.' });
  }
});

export default router;

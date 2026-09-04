import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db.js';
import logger from '../logger.js';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';
import { generateUniqueSlug } from '../utils/slugify.js';

import { verifyFirebaseIdToken } from '../firebaseAdmin.js';

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
    const { full_name, email, password, account_type, coaching_name, phone_number, institute_code, institute_slug } = req.body;
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
      const instSlug = await generateUniqueSlug(pool, coaching_name.trim());

      const [instResult] = await pool.query(
        'INSERT INTO institutes (name, code, slug, contact_email) VALUES (?, ?, ?, ?)',
        [coaching_name.trim(), instCode, instSlug, email]
      );
      instituteId = instResult.insertId;

    } else {
      // Student registration
      const lookupParam = institute_slug || institute_code;
      if (lookupParam) {
        const [insts] = await pool.query(
          'SELECT id FROM institutes WHERE (code = ? OR slug = ?) AND status = "active"',
          [lookupParam.trim().toUpperCase(), lookupParam.trim()]
        );
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

    // Create initial institute membership if instituteId exists
    if (instituteId) {
      const membershipRole = isTeacher ? 'institute_admin' : 'student';
      await pool.query(`
        INSERT INTO institute_memberships (institute_id, user_id, role)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE status = 'active'
      `, [instituteId, userId, membershipRole]);
    }

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
    const { email, password, firebaseIdToken, institute_slug, institute_code } = req.body;

    let user = null;
    let isAuthenticated = false;

    // 1. Authenticate via Firebase ID Token if provided (Firebase Email / Social Auth)
    if (firebaseIdToken) {
      try {
        const decoded = await verifyFirebaseIdToken(firebaseIdToken);
        const tokenEmail = decoded.email || email;
        if (tokenEmail) {
          const [users] = await pool.query(
            'SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))',
            [tokenEmail.trim()]
          );
          if (users.length > 0) {
            user = users[0];
            isAuthenticated = true;
          }
        }
      } catch (fbErr) {
        console.warn('[AUTH] Firebase ID Token verification warning during login:', fbErr.message);
      }
    }

    // 2. Fallback to direct Email + Password comparison if not authenticated via Firebase Token
    if (!isAuthenticated) {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const cleanEmail = email.trim();
      const [users] = await pool.query(
        'SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))',
        [cleanEmail]
      );
      if (users.length === 0) {
        console.warn(`[AUTH LOGIN FAILED] No account found for email: "${cleanEmail}"`);
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      user = users[0];

      if (user.password_hash && typeof user.password_hash === 'string') {
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
          isAuthenticated = true;
        } else {
          console.warn(`[AUTH LOGIN FAILED] Password mismatch for User ID ${user.id} (${user.email}).`);
        }
      } else {
        console.warn(`[AUTH LOGIN FAILED] User ID ${user.id} (${user.email}) has no password hash set.`);
      }
    }

    if (!isAuthenticated || !user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check target portal institute (if logging in via specific portal link)
    const lookupParam = institute_slug || institute_code;
    let targetInstitute = null;
    let requiresEnrollmentConfirmation = false;

    if (lookupParam && user.role === 'user') {
      const [insts] = await pool.query(
        'SELECT id, name, code, slug, logo_url FROM institutes WHERE (slug = ? OR code = ?) AND status = "active"',
        [lookupParam.trim(), lookupParam.trim().toUpperCase()]
      );
      if (insts.length > 0) {
        targetInstitute = insts[0];

        // Check if user is already enrolled in target institute
        const [mem] = await pool.query(
          'SELECT id FROM institute_memberships WHERE user_id = ? AND institute_id = ?',
          [user.id, targetInstitute.id]
        );

        if (mem.length === 0 && user.institute_id && user.institute_id !== targetInstitute.id) {
          // User is enrolled in another institute, but not yet in targetInstitute
          // Get primary/existing institute name for the prompt modal
          const [prevInst] = await pool.query('SELECT id, name FROM institutes WHERE id = ?', [user.institute_id]);
          requiresEnrollmentConfirmation = true;

          return res.json({
            requires_enrollment_confirmation: true,
            user_id: user.id,
            email: user.email,
            previous_institute_name: prevInst.length > 0 ? prevInst[0].name : 'another coaching institute',
            target_institute: targetInstitute
          });
        } else if (mem.length === 0) {
          // Auto-enroll if user had no previous institute
          await pool.query(
            'INSERT INTO institute_memberships (institute_id, user_id, role) VALUES (?, ?, "student") ON DUPLICATE KEY UPDATE status="active"',
            [targetInstitute.id, user.id]
          );
          if (!user.institute_id) {
            await pool.query('UPDATE users SET institute_id = ? WHERE id = ?', [targetInstitute.id, user.id]);
            user.institute_id = targetInstitute.id;
          }
        }
      }
    }

    const activeInstId = (targetInstitute && targetInstitute.id) ? targetInstitute.id : user.institute_id;

    const token = jwt.sign(
      { id: user.id, full_name: user.full_name, email: user.email, role: user.role, institute_id: activeInstId },
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
        institute_id: activeInstId
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// 2b. Firebase Auth Handler (Supports Email/Password, Google OAuth, and Phone OTP Sync & Linking)
router.post('/firebase-login', async (req, res) => {
  try {
    const { idToken, account_type, coaching_name, phone_number, full_name, institute_slug, institute_code } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required.' });
    }

    const decodedToken = await verifyFirebaseIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email || null;
    const phone = decodedToken.phone_number || phone_number || null;
    const displayName = decodedToken.name || full_name || (email ? email.split('@')[0] : 'Student User');

    let user = null;

    // 1. Try matching by firebase_uid
    const [byUid] = await pool.query('SELECT * FROM users WHERE firebase_uid = ?', [firebaseUid]);
    if (byUid.length > 0) {
      user = byUid[0];
    } else {
      // 2. Account Linking: Try matching by email
      if (email) {
        const [byEmail] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (byEmail.length > 0) {
          user = byEmail[0];
          await pool.query('UPDATE users SET firebase_uid = ? WHERE id = ?', [firebaseUid, user.id]);
          user.firebase_uid = firebaseUid;
          logger.info(`Linked existing user #${user.id} (${email}) to Firebase UID ${firebaseUid}`);
        }
      }

      // 3. Account Linking: Try matching by phone_number
      if (!user && phone) {
        const [byPhone] = await pool.query('SELECT * FROM users WHERE phone_number = ?', [phone]);
        if (byPhone.length > 0) {
          user = byPhone[0];
          await pool.query('UPDATE users SET firebase_uid = ? WHERE id = ?', [firebaseUid, user.id]);
          user.firebase_uid = firebaseUid;
          logger.info(`Linked existing user #${user.id} (Phone: ${phone}) to Firebase UID ${firebaseUid}`);
        }
      }
    }

    // 4. Register new user if no match found
    if (!user) {
      const isTeacher = account_type === 'teacher' || account_type === 'institute_admin';
      let userRole = isTeacher ? 'institute_admin' : 'user';
      let instituteId = null;

      if (isTeacher) {
        if (coaching_name && coaching_name.trim()) {
          const instName = coaching_name.trim();
          const instCode = generateInstituteCode(instName.substring(0, 3).toUpperCase());
          const instSlug = await generateUniqueSlug(pool, instName);

          const [instResult] = await pool.query(
            'INSERT INTO institutes (name, code, slug, contact_email) VALUES (?, ?, ?, ?)',
            [instName, instCode, instSlug, email || '']
          );
          instituteId = instResult.insertId;
        }
      } else {
        const lookupParam = institute_slug || institute_code;
        if (lookupParam) {
          const [insts] = await pool.query(
            'SELECT id FROM institutes WHERE (code = ? OR slug = ?) AND status = "active"',
            [lookupParam.trim().toUpperCase(), lookupParam.trim()]
          );
          if (insts.length > 0) {
            instituteId = insts[0].id;
          }
        }
      }

      const [insertResult] = await pool.query(
        'INSERT INTO users (full_name, email, firebase_uid, role, institute_id, phone_number) VALUES (?, ?, ?, ?, ?, ?)',
        [displayName, email, firebaseUid, userRole, instituteId, phone]
      );

      const newUserId = insertResult.insertId;

      if (instituteId) {
        const membershipRole = isTeacher ? 'institute_admin' : 'student';
        await pool.query(`
          INSERT INTO institute_memberships (institute_id, user_id, role)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE status = 'active'
        `, [instituteId, newUserId, membershipRole]);
      }

      const [newUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [newUserId]);
      user = newUsers[0];
      logger.info(`Registered new user #${newUserId} (${userRole}) via Firebase Auth`);
    }

    // Check multi-coaching portal enrollment switch
    const lookupParam = institute_slug || institute_code;
    let targetInstitute = null;

    if (lookupParam && user.role === 'user') {
      const [insts] = await pool.query(
        'SELECT id, name, code, slug, logo_url FROM institutes WHERE (slug = ? OR code = ?) AND status = "active"',
        [lookupParam.trim(), lookupParam.trim().toUpperCase()]
      );
      if (insts.length > 0) {
        targetInstitute = insts[0];
        const [mem] = await pool.query(
          'SELECT id FROM institute_memberships WHERE user_id = ? AND institute_id = ?',
          [user.id, targetInstitute.id]
        );

        if (mem.length === 0 && user.institute_id && user.institute_id !== targetInstitute.id) {
          const [prevInst] = await pool.query('SELECT id, name FROM institutes WHERE id = ?', [user.institute_id]);
          return res.json({
            requires_enrollment_confirmation: true,
            user_id: user.id,
            email: user.email,
            previous_institute_name: prevInst.length > 0 ? prevInst[0].name : 'another coaching institute',
            target_institute: targetInstitute
          });
        } else if (mem.length === 0) {
          await pool.query(
            'INSERT INTO institute_memberships (institute_id, user_id, role) VALUES (?, ?, "student") ON DUPLICATE KEY UPDATE status="active"',
            [targetInstitute.id, user.id]
          );
          if (!user.institute_id) {
            await pool.query('UPDATE users SET institute_id = ? WHERE id = ?', [targetInstitute.id, user.id]);
            user.institute_id = targetInstitute.id;
          }
        }
      }
    }

    const activeInstId = (targetInstitute && targetInstitute.id) ? targetInstitute.id : user.institute_id;
    const isTeacherRole = user.role === 'institute_admin' || account_type === 'teacher';
    const requiresTeacherSetup = isTeacherRole && !activeInstId;

    const token = jwt.sign(
      { id: user.id, full_name: user.full_name, email: user.email, role: user.role, institute_id: activeInstId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Firebase login successful.',
      token,
      requires_teacher_setup: requiresTeacherSetup,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        institute_id: activeInstId
      }
    });
  } catch (err) {
    console.error('Firebase Login Error:', err);
    res.status(500).json({ error: err.message || 'Server error during Firebase login.' });
  }
});

// Complete Teacher Onboarding (Setup Coaching & Owner Name after Google/Phone login)
router.post('/complete-teacher-onboarding', requireAuth, async (req, res) => {
  try {
    const { coaching_name, teacher_name } = req.body;
    if (!coaching_name || !coaching_name.trim()) {
      return res.status(400).json({ error: 'Coaching / Institute name is required.' });
    }

    const cleanCoaching = coaching_name.trim();
    const cleanTeacher = teacher_name ? teacher_name.trim() : req.user.full_name;

    const instCode = generateInstituteCode(cleanCoaching.substring(0, 3).toUpperCase());
    const instSlug = await generateUniqueSlug(pool, cleanCoaching);

    const [instResult] = await pool.query(
      'INSERT INTO institutes (name, code, slug, contact_email) VALUES (?, ?, ?, ?)',
      [cleanCoaching, instCode, instSlug, req.user.email || '']
    );
    const instituteId = instResult.insertId;

    // Update user profile to institute_admin role & link institute_id
    await pool.query(
      'UPDATE users SET full_name = ?, role = "institute_admin", institute_id = ? WHERE id = ?',
      [cleanTeacher, instituteId, req.user.id]
    );

    // Create institute_memberships record
    await pool.query(`
      INSERT INTO institute_memberships (institute_id, user_id, role)
      VALUES (?, ?, 'institute_admin')
      ON DUPLICATE KEY UPDATE role = 'institute_admin', status = 'active'
    `, [instituteId, req.user.id]);

    const updatedUser = {
      ...req.user,
      full_name: cleanTeacher,
      role: 'institute_admin',
      institute_id: instituteId
    };

    const token = jwt.sign(
      { id: updatedUser.id, full_name: updatedUser.full_name, email: updatedUser.email, role: updatedUser.role, institute_id: updatedUser.institute_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Coaching portal setup completed successfully!',
      token,
      user: updatedUser
    });
  } catch (err) {
    console.error('Teacher Onboarding Error:', err);
    res.status(500).json({ error: err.message || 'Server error during coaching setup.' });
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

// 5b. Authenticated User Change Password (for Student Settings page)
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const match = await bcrypt.compare(current_password, users[0].password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    res.json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ error: 'Error updating password.' });
  }
});

// 6. Super Admin: List All Users (Paginated & Filtered)
router.get('/users', requireSuperAdmin, async (req, res) => {
  try {
    const { page, limit, role, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // 1. Fetch Role Breakdown Stats
    const [statsRows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(IF(role = 'super_admin', 1, 0)) as super_admin,
        SUM(IF(role = 'institute_admin', 1, 0)) as institute_admin,
        SUM(IF(role = 'admin', 1, 0)) as admin,
        SUM(IF(role = 'user', 1, 0)) as user
      FROM users
    `);
    const stats = statsRows[0] || { total: 0, super_admin: 0, institute_admin: 0, admin: 0, user: 0 };

    // 2. Build Count & Data Queries with filters
    let whereSql = ` WHERE 1=1`;
    const params = [];

    if (role) {
      whereSql += ` AND u.role = ?`;
      params.push(role);
    }

    if (search) {
      whereSql += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone_number LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    const [countRows] = await pool.query(`SELECT COUNT(DISTINCT u.id) AS total FROM users u ${whereSql}`, params);
    const filteredTotal = countRows[0] ? countRows[0].total : 0;

    let dataSql = `
      SELECT u.id, u.full_name, u.email, u.phone_number, u.role, u.institute_id, u.created_at,
             i.name as institute_name
      FROM users u
      LEFT JOIN institutes i ON u.institute_id = i.id
      ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [users] = await pool.query(dataSql, [...params, limitNum, offset]);
    const totalPages = Math.ceil(filteredTotal / limitNum) || 1;

    res.json({
      users,
      stats,
      pagination: {
        total: filteredTotal,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error('Error listing users:', err);
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

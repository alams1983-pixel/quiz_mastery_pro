import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

let JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === 'edutorai_mastery_quiz_secret_key_2026') {
  if (process.env.NODE_ENV === 'production') {
    JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️ [SECURITY WARNING] JWT_SECRET is not configured in production environment variables! Generated a temporary 256-bit random key for this session.');
  } else {
    JWT_SECRET = 'edutorai_mastery_quiz_secret_key_2026';
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore token decode error for guests
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && (req.user.role === 'institute_admin' || req.user.role === 'admin' || req.user.role === 'super_admin')) {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
  });
}

export function requireInstituteAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && (req.user.role === 'institute_admin' || req.user.role === 'super_admin')) {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Coaching Institute Admin privileges required.' });
    }
  });
}

export function requireSuperAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'super_admin') {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Super Admin privileges required.' });
    }
  });
}

export function requireInstituteAccess(targetInstituteIdParam = 'id') {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!req.user) return res.status(401).json({ error: 'Authentication required.' });
      if (req.user.role === 'super_admin') return next();

      const requestedInstituteId = parseInt(req.params[targetInstituteIdParam] || req.body.institute_id, 10);
      if (req.user.institute_id && req.user.institute_id === requestedInstituteId) {
        return next();
      }
      return res.status(403).json({ error: 'Access denied. You do not have permission for this institute.' });
    });
  };
}

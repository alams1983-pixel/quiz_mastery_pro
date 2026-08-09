import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'edutorai_mastery_quiz_secret_key_2026';

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
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
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

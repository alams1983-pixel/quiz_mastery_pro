import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage with 3-Way Organization (Sub-directories & Prefixed Filenames)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user ? req.user.id : 0;
    const instId = req.user ? (req.user.institute_id || 0) : 0;
    const userDir = path.join(uploadDir, `inst_${instId}`, `usr_${userId}`);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user.id : 0;
    const instId = req.user ? (req.user.institute_id || 0) : 0;
    const ext = path.extname(file.originalname) || '.png';
    const name = `u${userId}_i${instId}_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB Limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WEBP image files are allowed.'));
    }
  }
});

// POST /api/images/upload - Upload Image & Audit Log
router.post('/upload', requireAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  const userId = req.user ? req.user.id : 0;
  const instId = req.user ? (req.user.institute_id || null) : null;
  const relativePath = `inst_${instId || 0}/usr_${userId}/${req.file.filename}`;
  const imageUrl = `/uploads/${relativePath}`;

  try {
    // DB Audit Trail Logging
    await pool.query(`
      INSERT INTO uploaded_assets (user_id, institute_id, original_name, stored_name, file_path, file_size, mime_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      instId,
      req.file.originalname || 'unknown',
      req.file.filename,
      imageUrl,
      req.file.size || 0,
      req.file.mimetype || 'image/png'
    ]);
  } catch (dbErr) {
    console.warn('Audit Log Image Insert Warning:', dbErr.message);
  }

  const host = req.headers.host || '';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const fullUrl = host ? `${protocol}://${host}${imageUrl}` : imageUrl;

  res.json({
    message: 'Image uploaded successfully.',
    imageUrl,
    fullUrl,
    filename: req.file.filename,
    relativePath
  });
});

// GET /api/images/* - Serve images with cache controls
router.get('/*', (req, res) => {
  const reqPath = req.params[0] || '';
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  
  // Try relative path first
  let filePath = path.join(uploadDir, safePath);

  if (!fs.existsSync(filePath)) {
    // Fallback: search flat in uploadDir if filename was provided directly
    const filename = path.basename(safePath);
    filePath = path.join(uploadDir, filename);
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image file not found.' });
  }

  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  res.sendFile(filePath);
});

export default router;

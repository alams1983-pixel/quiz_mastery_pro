import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
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

router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  const host = req.headers.host || '';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const fullUrl = host ? `${protocol}://${host}${imageUrl}` : imageUrl;
  res.json({ message: 'Image uploaded successfully.', imageUrl, fullUrl, filename: req.file.filename });
});

router.get('/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image file not found.' });
  }

  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  res.sendFile(filePath);
});

export default router;

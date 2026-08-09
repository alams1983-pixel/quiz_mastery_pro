import express from 'express';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');

router.get('/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image file not found.' });
  }

  res.sendFile(filePath);
});

export default router;

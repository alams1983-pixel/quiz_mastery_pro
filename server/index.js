import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { initDatabase } from './db.js';

import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import tagRoutes from './routes/tags.js';
import quizRoutes from './routes/quizzes.js';
import imageRoutes from './routes/images.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// API ROUTES
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/analytics', analyticsRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// ==========================================
// VITE FRONTEND
// ==========================================

const frontendPath = path.join(__dirname, '../dist');
const frontendIndex = path.join(frontendPath, 'index.html');

console.log('📁 Server directory:', __dirname);
console.log('📁 Frontend directory:', frontendPath);
console.log('📄 Frontend index:', frontendIndex);
console.log('📦 Frontend exists:', fs.existsSync(frontendPath));
console.log('📄 index.html exists:', fs.existsSync(frontendIndex));

// Serve Vite static files
app.use(express.static(frontendPath));

// SPA fallback
app.use((req, res, next) => {
  // Don't interfere with API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // If frontend exists, serve index.html
  if (fs.existsSync(frontendIndex)) {
    return res.sendFile(frontendIndex);
  }

  // Otherwise show useful error
  res.status(500).send(
    'Frontend build not found. Expected: ' + frontendIndex
  );
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
  try {
    await initDatabase();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
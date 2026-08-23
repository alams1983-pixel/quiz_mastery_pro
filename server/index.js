import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import pool, { initDatabase } from './db.js';
import logger from './logger.js';

import authRoutes from './routes/auth.js';
import instituteRoutes from './routes/institutes.js';
import examRoutes from './routes/exams.js';
import categoryRoutes from './routes/categories.js';
import tagRoutes from './routes/tags.js';
import quizRoutes from './routes/quizzes.js';
import imageRoutes from './routes/images.js';
import analyticsRoutes from './routes/analytics.js';
import passageRoutes from './routes/passages.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ==========================================
// SECURITY & PERFORMANCE MIDDLEWARE
// ==========================================

app.use(helmet({
  contentSecurityPolicy: false, // Adapted for Vite local script execution
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for Auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication requests from this IP. Please try again after 15 minutes.' }
});
app.use('/api/auth', authLimiter);

// ==========================================
// API ROUTES
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/passages', passageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/analytics', analyticsRoutes);

// Expose public static uploads route
const uploadFolder = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}
app.use('/uploads', express.static(uploadFolder));

// ==========================================
// DYNAMIC HEALTH CHECK
// ==========================================

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error('Health check failed: DB connection error', err);
    res.status(503).json({
      status: 'error',
      database: 'unreachable',
      timestamp: new Date().toISOString()
    });
  }
});

// ==========================================
// VITE FRONTEND & STATIC FILES
// ==========================================

const frontendPath = path.join(__dirname, '../dist');
const frontendIndex = path.join(frontendPath, 'index.html');

logger.info('📁 Server directory:', { dirname: __dirname });
logger.info('📁 Frontend directory:', { frontendPath });

// Serve Vite static files
app.use(express.static(frontendPath, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    // Disable caching for index.html so browser always fetches fresh bundle links
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// SPA fallback
app.use((req, res, next) => {
  // Do not serve index.html for missing API routes or missing static assets (.js, .css, .woff2, images)
  if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || req.path.startsWith('/uploads/') || /\.(js|css|json|woff2?|ttf|png|jpe?g|webp|svg|ico)$/i.test(req.path)) {
    return res.status(404).send('Asset not found');
  }

  if (fs.existsSync(frontendIndex)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(frontendIndex);
  }

  res.status(500).send('Frontend build not found. Expected: ' + frontendIndex);
});

// ==========================================
// CENTRAL ERROR HANDLER MIDDLEWARE
// ==========================================

app.use((err, req, res, next) => {
  logger.error('Unhandled API Error', err, { path: req.path, method: req.method });
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Process safety handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
});

// Export app for integration testing
export { app };

// ==========================================
// START SERVER
// ==========================================

if (process.env.NODE_ENV !== 'test') {
  async function startServer() {
    try {
      await initDatabase();
    } catch (error) {
      logger.error('❌ Database initialization failed', error);
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  }

  startServer();
}
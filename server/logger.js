import dotenv from 'dotenv';
dotenv.config();

const IS_PROD = process.env.NODE_ENV === 'production';

export const logger = {
  info: (msg, meta = {}) => {
    if (IS_PROD) {
      console.log(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message: msg, ...meta }));
    } else {
      console.log(`[INFO ${new Date().toLocaleTimeString()}] ${msg}`, Object.keys(meta).length ? meta : '');
    }
  },
  warn: (msg, meta = {}) => {
    if (IS_PROD) {
      console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), message: msg, ...meta }));
    } else {
      console.warn(`[WARN ${new Date().toLocaleTimeString()}] ${msg}`, Object.keys(meta).length ? meta : '');
    }
  },
  error: (msg, error = null, meta = {}) => {
    const errorDetails = error ? { errorMsg: error.message, stack: error.stack } : {};
    if (IS_PROD) {
      console.error(JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), message: msg, ...errorDetails, ...meta }));
    } else {
      console.error(`[ERROR ${new Date().toLocaleTimeString()}] ${msg}`, error ? error.message : '', Object.keys(meta).length ? meta : '');
    }
  }
};

export default logger;

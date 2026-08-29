import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

let isInitialized = false;

function initFirebaseAdmin() {
  if (isInitialized && getApps().length > 0) {
    return true;
  }

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const googleAppCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;

    if (serviceAccountJson) {
      let serviceAccount = null;
      let rawStr = serviceAccountJson.trim();

      if ((rawStr.startsWith("'") && rawStr.endsWith("'")) || (rawStr.startsWith('"') && rawStr.endsWith('"'))) {
        rawStr = rawStr.slice(1, -1).trim();
      }

      try {
        if (!rawStr.startsWith('{') && fs.existsSync(rawStr)) {
          const fileContent = fs.readFileSync(rawStr, 'utf8');
          serviceAccount = JSON.parse(fileContent);
        } else {
          serviceAccount = JSON.parse(rawStr);
        }

        initializeApp({
          credential: cert(serviceAccount)
        });
        isInitialized = true;
        logger.info('✅ Firebase Admin SDK initialized using FIREBASE_SERVICE_ACCOUNT_JSON');
      } catch (jsonErr) {
        logger.warn(`⚠️ FIREBASE_SERVICE_ACCOUNT_JSON parsing skipped (${jsonErr.message}). Check .env formatting.`);
      }
    }

    if (!isInitialized && projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      isInitialized = true;
      logger.info('✅ Firebase Admin SDK initialized using environment keys');
    } else if (!isInitialized && googleAppCreds) {
      try {
        if (fs.existsSync(googleAppCreds)) {
          const fileContent = fs.readFileSync(googleAppCreds, 'utf8');
          const serviceAccount = JSON.parse(fileContent);
          initializeApp({
            credential: cert(serviceAccount)
          });
          isInitialized = true;
          logger.info('✅ Firebase Admin SDK initialized using GOOGLE_APPLICATION_CREDENTIALS JSON file');
        } else {
          initializeApp({
            credential: applicationDefault()
          });
          isInitialized = true;
          logger.info('✅ Firebase Admin SDK initialized using applicationDefault()');
        }
      } catch (gErr) {
        logger.warn(`⚠️ GOOGLE_APPLICATION_CREDENTIALS initialization skipped: ${gErr.message}`);
      }
    } else if (!isInitialized && projectId) {
      initializeApp({
        projectId
      });
      isInitialized = true;
      logger.info(`⚠️ Firebase Admin SDK initialized with project ID (${projectId}) - token verification enabled.`);
    } else if (!isInitialized) {
      logger.warn('⚠️ Firebase Admin SDK credentials not configured in .env. ID token verification will run in dev fallback mode.');
    }
  } catch (err) {
    logger.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
  }

  return isInitialized;
}

// Initialize on module load
initFirebaseAdmin();

/**
 * Verify Firebase ID Token passed from client
 * @param {string} idToken 
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
export async function verifyFirebaseIdToken(idToken) {
  if (!idToken) {
    throw new Error('No Firebase ID token provided.');
  }

  const apps = getApps();
  if (apps.length > 0) {
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      return decodedToken;
    } catch (err) {
      logger.error('Firebase ID token verification failed:', err.message);
      throw new Error(`Invalid or expired Firebase authentication token: ${err.message}`);
    }
  }

  // Dev fallback / mock mode if credentials are not configured in local environment
  if (process.env.NODE_ENV !== 'production' && idToken.startsWith('mock_')) {
    logger.warn('⚠️ Dev Fallback: Processing mock Firebase token');
    const mockEmail = idToken.split('mock_')[1] || 'dev@example.com';
    return {
      uid: `dev_uid_${mockEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email: mockEmail,
      email_verified: true,
      auth_time: Math.floor(Date.now() / 1000)
    };
  }

  throw new Error('Firebase Admin SDK is not initialized and no mock token provided.');
}

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

/**
 * Login with Email and Password using Firebase Auth
 */
export async function loginWithEmailPassword(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
}

/**
 * Register with Email and Password using Firebase Auth
 */
export async function registerWithEmailPassword(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
}

/**
 * Sign in with Google Provider (Supports Popup with automatic Redirect fallback)
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();
    return { user: userCredential.user, idToken };
  } catch (err) {
    if (
      err.code === 'auth/popup-closed-by-user' ||
      err.code === 'auth/popup-blocked' ||
      err.code === 'auth/cancelled-popup-request'
    ) {
      console.warn('⚠️ Popup authentication interrupted or blocked by cross-origin policy. Falling back to Google Redirect Flow...');
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
}

/**
 * Check for pending Google Redirect authentication result on page load
 */
export async function checkGoogleRedirectResult() {
  try {
    const userCredential = await getRedirectResult(auth);
    if (userCredential && userCredential.user) {
      const idToken = await userCredential.user.getIdToken();
      return { user: userCredential.user, idToken };
    }
  } catch (err) {
    console.error('Google Redirect Result Error:', err);
  }
  return null;
}

/**
 * Setup Recaptcha Verifier for Phone OTP Auth
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {}
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {}
  });

  return window.recaptchaVerifier;
}

/**
 * Send Phone OTP
 */
export async function sendPhoneOtp(phoneNumber, appVerifier) {
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return confirmationResult;
}

/**
 * Confirm Phone OTP Code
 */
export async function confirmPhoneOtp(confirmationResult, code) {
  const userCredential = await confirmationResult.confirm(code);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
}

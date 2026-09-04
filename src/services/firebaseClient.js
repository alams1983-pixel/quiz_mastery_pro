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
 * Initiate Google Sign-In via Redirect Flow
 */
export async function loginWithGoogleRedirect() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithRedirect(auth, provider);
}

/**
 * Process Google Redirect Result on Page Mount
 */
export async function checkGoogleRedirectResult() {
  try {
    const userCredential = await getRedirectResult(auth);
    if (userCredential && userCredential.user) {
      const idToken = await userCredential.user.getIdToken();
      return { user: userCredential.user, idToken };
    }
  } catch (err) {
    console.error('🔴 Google Redirect Result Auth Error:', err);
    alert('Google Redirect Authentication failed: ' + (err.message || 'Unknown error'));
  }
  return null;
}

/**
 * Sign in with Google Provider (Popup Flow with Account Selector)
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const userCredential = await signInWithPopup(auth, provider);
    const idToken = await userCredential.user.getIdToken();
    return { user: userCredential.user, idToken };
  } catch (err) {
    console.error('🔴 Firebase loginWithGoogle popup error:', err.code, err.message);
    throw err;
  }
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
  const verifier = appVerifier || window.recaptchaVerifier || setupRecaptcha();
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
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

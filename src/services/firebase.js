// Firebase configuration for California Probate App
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase configuration (loaded from environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize Firebase (only if configured)
let app = null;
let auth = null;
let db = null;
let storage = null;
let functions = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'us-central1');
  // Local testing only (never set in production): VITE_EMULATOR_BASE points Auth and Firestore at an emulator
  const EMU = import.meta.env.DEV && import.meta.env.VITE_EMULATOR_BASE ? Number(import.meta.env.VITE_EMULATOR_BASE) : 0;
  if (EMU) {
    connectFirestoreEmulator(db, '127.0.0.1', EMU);
    connectAuthEmulator(auth, `http://127.0.0.1:${EMU + 2}`, { disableWarnings: true });
  }
} else {
  console.warn('Firebase is not configured. Please set environment variables.');
}

export { auth, db, storage, functions, isFirebaseConfigured };

// Stripe publishable key
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Probate form automation URL
export const PROBATE_FORMS_URL = import.meta.env.VITE_PROBATE_FORMS_URL || 'https://probatepetition.netlify.app';

export default app;

// Bot protection (Firebase App Check, reCAPTCHA Enterprise score; W1-security item 9). Loaded only
// right before a public request (booking, account set-up, password email, cancel link), so normal
// pages never load reCAPTCHA. The site key is public by design.
const APPCHECK_SITE_KEY = '6Ldcs-gtAAAAACZ4U5b56iIsO_Daqw-hq92oriMU';
let appCheckReady = null;
export function ensureAppCheck() {
  if (!appCheckReady) {
    appCheckReady = import('firebase/app-check')
      .then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) => {
        initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(APPCHECK_SITE_KEY), isTokenAutoRefreshEnabled: true });
      })
      .catch((err) => { console.warn('App Check unavailable'); appCheckReady = null; });
  }
  return appCheckReady;
}

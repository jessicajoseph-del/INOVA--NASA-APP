/**
 * RIDGE Space Mission Architecture
 * Firebase Configuration & Connection Initializer
 * 
 * Dual-Mode Resilience Architecture:
 * 1. Cloud Mode: Connects to Google Cloud Firestore & Firebase Auth when VITE_FIREBASE_* env vars are present.
 * 2. Offline / Local Mode: Uses high-performance local NoSQL persistence (localStorage / IndexedDB)
 *    when keys are not yet pasted, ensuring banking-grade reliability with zero runtime crashes.
 */

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Checks whether live Firebase project credentials have been configured in .env
 */
export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.length > 5
  );
}

/**
 * Google Identity & Cloud Firestore REST Base URLs (Used for direct, lightweight, zero-dependency sync)
 */
export const FIRESTORE_BASE_URL = firebaseConfig.projectId
  ? `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`
  : '';

export const AUTH_BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

export default firebaseConfig;

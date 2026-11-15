/**
 * Firebase Firestore & Authentication Service for RIDGE Astronaut Application
 * Dual-Mode Offline-First Architecture:
 * - 100% functional offline with local NoSQL document storage (localStorage / IndexedDB)
 * - Automatic real-time synchronization with Cloud Firestore & Firebase Auth when online
 */

// Load config from localStorage (for dynamic runtime configuration) or Vite env
function getFirebaseConfig() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('ridge_firebase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.projectId && parsed.apiKey) return parsed;
      }
    } catch {}
  }
  return {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  };
}

let CURRENT_CONFIG = getFirebaseConfig();

export function setRuntimeFirebaseConfig(config) {
  CURRENT_CONFIG = { ...CURRENT_CONFIG, ...config };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('ridge_firebase_config', JSON.stringify(CURRENT_CONFIG));
    } catch {}
  }
}

export function isFirebaseOnline() {
  return Boolean(
    typeof navigator !== 'undefined' &&
    navigator.onLine &&
    CURRENT_CONFIG.projectId &&
    CURRENT_CONFIG.apiKey
  );
}

const FIRESTORE_BASE = () =>
  `https://firestore.googleapis.com/v1/projects/${CURRENT_CONFIG.projectId}/databases/(default)/documents`;

const AUTH_BASE = () =>
  `https://identitytoolkit.googleapis.com/v1/accounts`;

// ── FIRESTORE FIELD SERIALIZATION (NoSQL Documents) ──────────────────────────
function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      fields[key] = { doubleValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      fields[key] = { mapValue: { fields: toFirestoreFields(value) } };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((v) =>
            typeof v === 'object'
              ? { mapValue: { fields: toFirestoreFields(v) } }
              : { stringValue: String(v) }
          ),
        },
      };
    }
  }
  return fields;
}

function fromFirestoreDocument(doc) {
  if (!doc || !doc.fields) return null;
  const parseFields = (fields) => {
    const result = {};
    for (const [k, v] of Object.entries(fields)) {
      if ('stringValue' in v) result[k] = v.stringValue;
      else if ('doubleValue' in v) result[k] = Number(v.doubleValue);
      else if ('integerValue' in v) result[k] = Number(v.integerValue);
      else if ('booleanValue' in v) result[k] = v.booleanValue;
      else if ('nullValue' in v) result[k] = null;
      else if ('mapValue' in v && v.mapValue.fields) result[k] = parseFields(v.mapValue.fields);
      else if ('arrayValue' in v && v.arrayValue.values) {
        result[k] = v.arrayValue.values.map((item) =>
          item.mapValue ? parseFields(item.mapValue.fields) : item.stringValue || Object.values(item)[0]
        );
      }
    }
    return result;
  };
  return parseFields(doc.fields);
}

// ── 1. FIREBASE AUTHENTICATION (EMAIL/CALLSIGN & PASSWORD) ───────────────────

/**
 * Standardize callsign into email format for Firebase Auth
 */
function toAuthEmail(identifier) {
  const clean = identifier.trim().toLowerCase();
  if (clean.includes('@')) return clean;
  return `${clean.replace(/[^a-z0-9_-]/g, '')}@ridge.nasa.gov`;
}

/**
 * Authenticate astronaut with Firebase Auth + Offline Fallback
 */
export async function firebaseAuthSignIn(callsignOrEmail, password, localCrew = []) {
  const email = toAuthEmail(callsignOrEmail);
  const targetId = callsignOrEmail.trim().toLowerCase();

  // 1. Try Firebase Auth if online and configured
  if (isFirebaseOnline()) {
    try {
      const url = `${AUTH_BASE()}:signInWithPassword?key=${CURRENT_CONFIG.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      });

      if (res.ok) {
        const authData = await res.json();
        // Save session token in localStorage
        try {
          localStorage.setItem('ridge_auth_token', authData.idToken);
          localStorage.setItem('ridge_auth_uid', authData.localId);
        } catch {}

        // Fetch user profile from Firestore or local
        const cloudAstro = await getAstronautByIdFromFirebase(authData.localId) ||
          await getAstronautByIdFromFirebase(callsignOrEmail.toUpperCase());

        if (cloudAstro) {
          return { success: true, astronaut: cloudAstro, mode: 'cloud' };
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.warn('[Firebase Auth] Sign in failed on cloud:', errorData?.error?.message);
      }
    } catch (err) {
      console.warn('[Firebase Auth] Network error, falling back to local NoSQL:', err);
    }
  }

  // 2. Offline NoSQL Fallback (search local crew cache)
  const found = localCrew.find(
    (a) =>
      (a.id?.toLowerCase() === targetId || a.email?.toLowerCase() === email) &&
      a.password === password
  );

  if (found) {
    return { success: true, astronaut: found, mode: 'offline' };
  }

  return {
    success: false,
    error: 'Invalid Callsign ID or Password. Verify your credentials.',
  };
}

/**
 * Register astronaut with Firebase Auth and save NoSQL profile to Cloud Firestore
 */
export async function firebaseAuthSignUp(astronautData) {
  const callsign = (astronautData.id || `ASTRO-${Date.now().toString().slice(-4)}`).toUpperCase();
  const email = toAuthEmail(callsign);
  const password = astronautData.password || 'password123';

  let firebaseUid = null;

  // 1. If online and configured, register in Firebase Auth
  if (isFirebaseOnline()) {
    try {
      const url = `${AUTH_BASE()}:signUp?key=${CURRENT_CONFIG.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName: astronautData.name,
          returnSecureToken: true,
        }),
      });

      if (res.ok) {
        const authData = await res.json();
        firebaseUid = authData.localId;
        try {
          localStorage.setItem('ridge_auth_token', authData.idToken);
          localStorage.setItem('ridge_auth_uid', authData.localId);
        } catch {}
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn('[Firebase Auth] Sign up warning:', err?.error?.message);
      }
    } catch (err) {
      console.warn('[Firebase Auth] Offline during sign up:', err);
    }
  }

  // Merged astronaut document
  const finalAstronaut = {
    ...astronautData,
    id: callsign,
    email,
    firebaseUid,
    updatedAt: new Date().toISOString(),
  };

  // 2. Persist to Cloud Firestore (if online)
  if (isFirebaseOnline()) {
    saveAstronautToFirebase(finalAstronaut).catch((e) =>
      console.warn('[Firebase] Background cloud save error:', e)
    );
  }

  return { success: true, astronaut: finalAstronaut, mode: firebaseUid ? 'cloud' : 'offline' };
}

// ── 2. CLOUD FIRESTORE NOSQL DOCUMENT OPERATIONS ─────────────────────────────

/**
 * Fetch all astronaut profiles from Firestore
 */
export async function getAstronautsFromFirebase() {
  if (!isFirebaseOnline()) {
    return null;
  }
  try {
    const url = `${FIRESTORE_BASE()}/astronauts?key=${CURRENT_CONFIG.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (!data.documents) return [];

    const astronauts = data.documents.map(fromFirestoreDocument).filter(Boolean);
    return astronauts;
  } catch (err) {
    console.warn('[Firebase] Offline / fetch error:', err);
    return null;
  }
}

/**
 * Fetch a single astronaut by callsign or uid
 */
export async function getAstronautByIdFromFirebase(id) {
  if (!isFirebaseOnline() || !id) return null;
  try {
    const url = `${FIRESTORE_BASE()}/astronauts/${encodeURIComponent(id)}?key=${CURRENT_CONFIG.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return fromFirestoreDocument(data);
  } catch {
    return null;
  }
}

/**
 * Save or update astronaut profile in Firestore
 */
export async function saveAstronautToFirebase(astronaut) {
  if (!isFirebaseOnline()) {
    return false;
  }
  try {
    const docId = (astronaut.id || `ASTRO-${Date.now()}`).toUpperCase();
    const url = `${FIRESTORE_BASE()}/astronauts/${encodeURIComponent(docId)}?key=${CURRENT_CONFIG.apiKey}`;

    const payload = {
      fields: toFirestoreFields({
        ...astronaut,
        id: docId,
        updatedAt: new Date().toISOString(),
      }),
    };

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.warn('[Firebase] Firestore document write error:', err);
    return false;
  }
}

/**
 * Save flight task roadmap status to Firestore
 */
export async function syncTasksToFirebase(tasks, astronautId = 'ASTRO-01') {
  if (!isFirebaseOnline() || !Array.isArray(tasks)) return false;
  try {
    const url = `${FIRESTORE_BASE()}/flight_roadmaps/${encodeURIComponent(astronautId)}?key=${CURRENT_CONFIG.apiKey}`;
    const payload = {
      fields: toFirestoreFields({
        astronautId,
        tasks,
        syncedAt: new Date().toISOString(),
      }),
    };
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export { CURRENT_CONFIG as FIREBASE_CONFIG };

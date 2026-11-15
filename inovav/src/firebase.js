/**
 * Firebase Firestore & Authentication Service for RIDGE Astronaut DB
 * Uses Firestore REST API with offline caching & automatic fallback
 */

const FIREBASE_CONFIG = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
};

const isFirebaseConfigured = Boolean(FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.apiKey);
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

// Helper: Convert JS object to Firestore document format
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
          values: value.map((v) => ({ stringValue: String(v) })),
        },
      };
    }
  }
  return fields;
}

// Helper: Parse Firestore document back to regular JS object
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
        result[k] = v.arrayValue.values.map((item) => item.stringValue || Object.values(item)[0]);
      }
    }
    return result;
  };
  return parseFields(doc.fields);
}

// ── 1. FETCH ALL REGISTERED ASTRONAUTS FROM FIREBASE ────────────────────────
export async function getAstronautsFromFirebase() {
  if (!isFirebaseConfigured) {
    return null;
  }
  try {
    const url = `${FIRESTORE_BASE}/astronauts?key=${FIREBASE_CONFIG.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('[Firebase] Firestore response not ok, using cached astronauts');
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

// ── 2. SAVE OR UPDATE ASTRONAUT IN FIREBASE ─────────────────────────────────
export async function saveAstronautToFirebase(astronaut) {
  if (!isFirebaseConfigured) {
    return false;
  }
  try {
    const docId = (astronaut.id || `ASTRO-${Date.now()}`).toUpperCase();
    const url = `${FIRESTORE_BASE}/astronauts/${encodeURIComponent(docId)}?key=${FIREBASE_CONFIG.apiKey}`;

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

    if (!res.ok) {
      console.warn('[Firebase] Failed to write to Firestore, saved to local store');
      return false;
    }
    console.log('[Firebase] Astronaut biometric profile saved:', docId);
    return true;
  } catch (err) {
    console.warn('[Firebase] Network write error:', err);
    return false;
  }
}

export { FIREBASE_CONFIG };


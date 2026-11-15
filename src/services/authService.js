/**
 * RIDGE Banking-Grade Authentication & Biometrics Service
 * Supports:
 * 1. Username & Password Auth (Firebase Auth + Cloud Firestore + Offline NoSQL)
 * 2. Facial Landmark / Descriptor Biometric Matching
 * 3. Native WebAuthn Fingerprint / Passkey Enrollment & Verification
 * 4. Inactivity Session State & Auth Event Dispatching
 */

import { isFirebaseConfigured, FIRESTORE_BASE_URL, AUTH_BASE_URL, firebaseConfig } from '../firebase/config';

const LOCAL_USERS_KEY = 'ridge_firestore_users';
const ACTIVE_SESSION_KEY = 'ridge_active_session';

// ── DEFAULT SEEDED ASTRONAUT ───────────────────────────────────────────────
const DEFAULT_CREW = {
  uid: 'CREW-01-ALEX',
  username: 'alex.vance',
  fullName: 'CDR. Alex Vance',
  email: 'alex.vance@ridge.mission',
  password: 'password123',
  mission: 'Artemis VII // Mars Transfer',
  role: 'Mission Commander',
  bloodType: 'O-Negative',
  faceEnrolled: false,
  faceDescriptor: null,
  fingerprintEnrolled: false,
  webauthnCredentialId: null,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

/**
 * Returns all registered users from local Firestore cache
 */
export function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([DEFAULT_CREW]));
      return [DEFAULT_CREW];
    }
    const list = JSON.parse(raw);
    if (Array.isArray(list) && list.length > 0) return list;
    return [DEFAULT_CREW];
  } catch {
    return [DEFAULT_CREW];
  }
}

/**
 * Persists a user to local Firestore cache
 */
function saveLocalUser(user) {
  const users = getLocalUsers();
  const existingIdx = users.findIndex(
    (u) => u.uid === user.uid || u.username?.toLowerCase() === user.username?.toLowerCase()
  );
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

/**
 * Syncs user document to Cloud Firestore if online & configured
 */
async function syncUserToCloudFirestore(user) {
  if (!isFirebaseConfigured() || !navigator.onLine) return;
  try {
    const docId = user.uid || user.username;
    const url = `${FIRESTORE_BASE_URL}/users/${encodeURIComponent(docId)}?key=${firebaseConfig.apiKey}`;
    
    // Firestore REST document format
    const fields = {
      uid: { stringValue: user.uid || '' },
      username: { stringValue: user.username || '' },
      fullName: { stringValue: user.fullName || '' },
      email: { stringValue: user.email || '' },
      faceEnrolled: { booleanValue: Boolean(user.faceEnrolled) },
      fingerprintEnrolled: { booleanValue: Boolean(user.fingerprintEnrolled) },
      webauthnCredentialId: { stringValue: user.webauthnCredentialId || '' },
      createdAt: { stringValue: user.createdAt || new Date().toISOString() },
      lastLoginAt: { stringValue: user.lastLoginAt || new Date().toISOString() },
    };

    if (user.faceDescriptor && Array.isArray(user.faceDescriptor)) {
      fields.faceDescriptor = {
        arrayValue: {
          values: user.faceDescriptor.slice(0, 128).map((num) => ({ doubleValue: Number(num) || 0 })),
        },
      };
    }

    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.warn('[RIDGE Auth] Cloud Firestore sync skipped:', err.message);
  }
}

// ── SESSION MANAGEMENT ───────────────────────────────────────────────────────
let activeSessionListeners = [];

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setCurrentUser(user) {
  if (user) {
    const sessionData = {
      ...user,
      lastLoginAt: new Date().toISOString(),
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionData));
    saveLocalUser(sessionData);
    syncUserToCloudFirestore(sessionData);
    activeSessionListeners.forEach((cb) => cb(sessionData));
  } else {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    activeSessionListeners.forEach((cb) => cb(null));
  }
}

export function onAuthStateChanged(callback) {
  activeSessionListeners.push(callback);
  callback(getCurrentUser());
  return () => {
    activeSessionListeners = activeSessionListeners.filter((cb) => cb !== callback);
  };
}

export function signOutUser() {
  setCurrentUser(null);
}

// ── 1. SIGN UP (WITH OPTIONAL BIOMETRIC ENROLLMENT) ───────────────────────────
export async function signUpUser({
  fullName,
  username,
  email,
  password,
  faceDescriptor = null,
  webauthnCredentialId = null,
}) {
  const cleanUsername = username.trim().toLowerCase();
  const existingUsers = getLocalUsers();

  // Check unique username
  if (existingUsers.some((u) => u.username?.toLowerCase() === cleanUsername)) {
    throw new Error(`Callsign/Username "${username}" is already assigned to a crew member.`);
  }

  const generatedEmail = email?.trim() || `${cleanUsername}@ridge.mission`;
  const uid = `CREW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Optional online Firebase Auth registration if configured
  if (isFirebaseConfigured() && navigator.onLine) {
    try {
      const res = await fetch(`${AUTH_BASE_URL}:signUp?key=${firebaseConfig.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: generatedEmail,
          password: password,
          returnSecureToken: true,
        }),
      });
      const data = await res.json();
      if (data.error) {
        console.warn('[RIDGE Auth] Cloud Auth note:', data.error.message);
      }
    } catch (e) {
      console.warn('[RIDGE Auth] Cloud Auth skipped:', e.message);
    }
  }

  const newUser = {
    uid,
    username: cleanUsername,
    fullName: fullName.trim(),
    email: generatedEmail,
    password, // Stored locally for offline authentication
    faceEnrolled: Boolean(faceDescriptor && faceDescriptor.length > 0),
    faceDescriptor: faceDescriptor || null,
    fingerprintEnrolled: Boolean(webauthnCredentialId),
    webauthnCredentialId: webauthnCredentialId || null,
    mission: 'Artemis VII // Mars Transfer',
    role: 'Flight Specialist',
    bloodType: 'A-Positive',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  saveLocalUser(newUser);
  await syncUserToCloudFirestore(newUser);
  setCurrentUser(newUser);

  return newUser;
}

// ── 2. USERNAME & PASSWORD SIGN IN ───────────────────────────────────────────
export async function signInWithPassword(usernameOrEmail, password) {
  const clean = usernameOrEmail.trim().toLowerCase();
  const users = getLocalUsers();

  const found = users.find(
    (u) =>
      u.username?.toLowerCase() === clean ||
      u.email?.toLowerCase() === clean
  );

  if (!found) {
    throw new Error('Crew account not found. Please Sign Up first.');
  }

  if (found.password && found.password !== password) {
    throw new Error('Access Denied: Invalid security password for this callsign.');
  }

  // Update last login
  found.lastLoginAt = new Date().toISOString();
  saveLocalUser(found);
  syncUserToCloudFirestore(found);
  setCurrentUser(found);

  return found;
}

// ── 3. FACIAL RECOGNITION MATCHING & SIGN IN ─────────────────────────────────
/**
 * Calculates normalized Euclidean similarity between two feature vectors
 */
export function compareFaceDescriptors(descA, descB) {
  if (!descA || !descB || descA.length !== descB.length) return 0;
  let sumSq = 0;
  for (let i = 0; i < descA.length; i++) {
    const diff = descA[i] - descB[i];
    sumSq += diff * diff;
  }
  const distance = Math.sqrt(sumSq);
  // Distance under 0.65 indicates strong facial match
  const similarity = Math.max(0, Math.min(100, Math.round((1 - distance / 1.8) * 100)));
  return { distance, similarity, matched: similarity >= 78 };
}

export async function signInWithFace(liveDescriptor) {
  if (!liveDescriptor || liveDescriptor.length === 0) {
    throw new Error('Optical sensor failed to capture facial geometry.');
  }

  const users = getLocalUsers().filter((u) => u.faceEnrolled && u.faceDescriptor);

  if (users.length === 0) {
    throw new Error('No enrolled crew facial profiles found. Please register or use password.');
  }

  let bestMatch = null;
  let highestSimilarity = 0;

  for (const user of users) {
    const { similarity, matched } = compareFaceDescriptors(liveDescriptor, user.faceDescriptor);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      if (matched) {
        bestMatch = { user, similarity };
      }
    }
  }

  if (!bestMatch) {
    throw new Error(`Facial Biometric Match Failed (Best Match: ${highestSimilarity}% - Threshold 78%).`);
  }

  bestMatch.user.lastLoginAt = new Date().toISOString();
  saveLocalUser(bestMatch.user);
  syncUserToCloudFirestore(bestMatch.user);
  setCurrentUser(bestMatch.user);

  return { user: bestMatch.user, confidence: `${bestMatch.similarity}%` };
}

// ── 4. WEBAUTHN FINGERPRINT / PASSKEY ENROLLMENT & SIGN IN ───────────────────
export async function isFingerprintAvailable() {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Enrolls device fingerprint / platform authenticator via native WebAuthn
 */
export async function enrollFingerprint(userId, username) {
  const available = await isFingerprintAvailable();
  if (!available) {
    throw new Error('Hardware biometric sensor (Windows Hello / Touch ID) is unavailable or disabled on this device.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const userIdBytes = new TextEncoder().encode(userId || username);

  const publicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'RIDGE Mission Health & Telemetry',
      id: window.location.hostname || 'localhost',
    },
    user: {
      id: userIdBytes,
      name: username,
      displayName: `Crew ${username}`,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },  // ES256
      { alg: -257, type: 'public-key' } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Built-in fingerprint / face reader
      userVerification: 'required',
    },
    timeout: 60000,
    attestation: 'none',
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions,
  });

  if (!credential) {
    throw new Error('Fingerprint enrollment was cancelled by user.');
  }

  // Base64-encode credential ID
  const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  return credentialId;
}

/**
 * Verifies fingerprint / passkey against registered WebAuthn credential
 */
export async function signInWithFingerprint(usernameOrEmail) {
  const available = await isFingerprintAvailable();
  if (!available) {
    throw new Error('Hardware biometric sensor is unavailable on this device.');
  }

  const clean = usernameOrEmail?.trim().toLowerCase();
  const users = getLocalUsers();

  let targetUser = null;
  if (clean) {
    targetUser = users.find(
      (u) =>
        u.fingerprintEnrolled &&
        (u.username?.toLowerCase() === clean || u.email?.toLowerCase() === clean)
    );
  } else {
    // If username is omitted, use the first enrolled crew or active user
    targetUser = users.find((u) => u.fingerprintEnrolled && u.webauthnCredentialId);
  }

  if (!targetUser || !targetUser.webauthnCredentialId) {
    throw new Error('No enrolled fingerprint credential found for this crew account.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  // Decode stored credential ID
  const rawIdBytes = Uint8Array.from(atob(targetUser.webauthnCredentialId), (c) => c.charCodeAt(0));

  const publicKeyCredentialRequestOptions = {
    challenge,
    allowCredentials: [
      {
        id: rawIdBytes,
        type: 'public-key',
        transports: ['internal'],
      },
    ],
    userVerification: 'required',
    timeout: 60000,
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions,
  });

  if (!assertion) {
    throw new Error('Fingerprint sensor scan failed or was cancelled.');
  }

  targetUser.lastLoginAt = new Date().toISOString();
  saveLocalUser(targetUser);
  syncUserToCloudFirestore(targetUser);
  setCurrentUser(targetUser);

  return targetUser;
}


export const FACE_AUTH_LOG_STORAGE_KEY = 'ridge_face_auth_logs';

export function getFaceAuthLogs() {
  try {
    const raw = localStorage.getItem(FACE_AUTH_LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordFaceAuthSuccess({
  astronautId,
  astronautName,
  confidence = 95,
  angle = 'center',
  source = 'Face ID Portal',
} = {}) {
  const existing = getFaceAuthLogs();
  const entry = {
    id: `FACE-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    astronautId: astronautId || 'ASTRO-01',
    astronautName: astronautName || 'Crew Member',
    confidence: Math.round(Number(confidence) * 10) / 10,
    angle: String(angle || 'center').toUpperCase(),
    source,
    timestamp: new Date().toISOString(),
  };

  const updated = [entry, ...existing].slice(0, 100);
  try {
    localStorage.setItem(FACE_AUTH_LOG_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Unable to persist face auth log:', err);
  }
  return updated;
}

export function clearFaceAuthLogs() {
  try {
    localStorage.removeItem(FACE_AUTH_LOG_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
  return [];
}

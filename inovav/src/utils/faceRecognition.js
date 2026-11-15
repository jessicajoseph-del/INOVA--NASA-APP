/**
 * Client-side Facial Feature Extraction & Multi-Angle Recognition Utility
 * Compares live webcam frames against stored 3-side (center, left, right) face snapshots
 * using normalized luminance, Sobel-like edge gradients, and color histogram descriptors.
 */

const GRID_SIZE = 24;

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Extracts a normalized feature vector from a centered crop of an HTMLVideoElement or HTMLImageElement.
 */
export function extractDescriptorFromSource(source) {
  const srcW = source.videoWidth || source.naturalWidth || source.width || 0;
  const srcH = source.videoHeight || source.naturalHeight || source.height || 0;
  if (!srcW || !srcH) return null;

  const canvas = document.createElement('canvas');
  canvas.width = GRID_SIZE;
  canvas.height = GRID_SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Center-crop 65% of the frame where the face sits inside the reticle
  const cropSize = Math.min(srcW, srcH) * 0.65;
  const sx = (srcW - cropSize) / 2;
  const sy = (srcH - cropSize) / 2;

  ctx.drawImage(source, sx, sy, cropSize, cropSize, 0, 0, GRID_SIZE, GRID_SIZE);
  const { data } = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE);

  const count = GRID_SIZE * GRID_SIZE;
  const luma = new Float32Array(count);
  const chromaRG = new Float32Array(count);
  const chromaBY = new Float32Array(count);

  let sum = 0;
  for (let i = 0; i < count; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    luma[i] = y;
    chromaRG[i] = (r - g) / 255;
    chromaBY[i] = (0.5 * (r + g) - b) / 255;
    sum += y;
  }

  const mean = sum / count;
  let varianceSum = 0;
  for (let i = 0; i < count; i++) {
    const d = luma[i] - mean;
    varianceSum += d * d;
  }
  const std = Math.sqrt(varianceSum / count);

  // Reject blank/covered camera frames
  if (std < 4) {
    return null;
  }

  // Build feature vector: normalized luminance + horizontal/vertical edge gradients + soft chroma
  const features = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const idx = y * GRID_SIZE + x;
      const normLuma = (luma[idx] - mean) / std;
      const gx = x < GRID_SIZE - 1 ? (luma[idx + 1] - luma[idx]) / std : 0;
      const gy = y < GRID_SIZE - 1 ? (luma[idx + GRID_SIZE] - luma[idx]) / std : 0;
      features.push(normLuma, gx * 0.7, gy * 0.7, chromaRG[idx] * 0.6, chromaBY[idx] * 0.6);
    }
  }

  // L2-normalize the descriptor
  let normSq = 0;
  for (let i = 0; i < features.length; i++) {
    normSq += features[i] * features[i];
  }
  const norm = Math.sqrt(normSq) || 1;
  for (let i = 0; i < features.length; i++) {
    features[i] /= norm;
  }

  return features;
}

/**
 * Computes mirrored and non-mirrored descriptors from a video element so selfie-mirror differences match cleanly.
 */
export function extractVideoDescriptors(video) {
  if (!video || video.readyState < 2) return [];
  const descriptors = [];

  const direct = extractDescriptorFromSource(video);
  if (direct) descriptors.push(direct);

  // Also check horizontally mirrored orientation
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (w && h) {
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext('2d');
    tctx.translate(w, 0);
    tctx.scale(-1, 1);
    tctx.drawImage(video, 0, 0, w, h);
    const mirrored = extractDescriptorFromSource(tmp);
    if (mirrored) descriptors.push(mirrored);
  }

  return descriptors;
}

export async function extractDescriptorFromUrl(url) {
  if (!url) return null;
  try {
    const img = await loadImageFromUrl(url);
    return extractDescriptorFromSource(img);
  } catch {
    return null;
  }
}

export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

/**
 * Builds pre-extracted descriptors for all 3 face angles of an astronaut.
 */
export async function buildAstronautFaceDescriptors(faceSnaps) {
  if (!faceSnaps) return {};
  const angles = ['center', 'left', 'right'];
  const result = {};
  await Promise.all(
    angles.map(async (ang) => {
      if (faceSnaps[ang]) {
        const desc = await extractDescriptorFromUrl(faceSnaps[ang]);
        if (desc) result[ang] = desc;
      }
    })
  );
  return result;
}

/**
 * Matches a live video frame against all registered astronauts' 3-side face snapshots.
 * Returns { matched, astronaut, angle, confidence, score } or null if no profiles have face data.
 */
export async function matchLiveFaceAgainstCrew(videoElement, astronauts = []) {
  const liveDescriptors = extractVideoDescriptors(videoElement);
  if (liveDescriptors.length === 0) {
    return { error: 'Camera feed has no visible facial detail yet. Ensure lighting is clear.' };
  }

  let bestAstronaut = null;
  let bestAngle = 'center';
  let bestScore = -1;
  let profilesWithFaces = 0;

  for (const astro of astronauts) {
    const snaps = astro?.faceSnaps;
    if (!snaps) continue;

    const cached = astro.faceDescriptors || {};
    const angles = ['center', 'left', 'right'];
    let astroHasFace = false;

    for (const ang of angles) {
      let refDesc = cached[ang];
      if (!refDesc && snaps[ang]) {
        refDesc = await extractDescriptorFromUrl(snaps[ang]);
      }
      if (!refDesc) continue;
      astroHasFace = true;

      for (const liveDesc of liveDescriptors) {
        const sim = cosineSimilarity(liveDesc, refDesc);
        if (sim > bestScore) {
          bestScore = sim;
          bestAstronaut = astro;
          bestAngle = ang;
        }
      }
    }

    if (astroHasFace) profilesWithFaces += 1;
  }

  if (profilesWithFaces === 0) {
    return {
      noProfiles: true,
      error: 'No stored 3-side face profiles found. Please Sign Up and capture all 3 face angles first.',
    };
  }

  // Map cosine similarity (~0.45..0.98) to intuitive confidence percentage (0..99.9%)
  const confidence = Math.max(0, Math.min(99.9, Math.round(((bestScore + 0.25) / 1.18) * 1000) / 10));
  const matched = bestScore >= 0.58;

  return {
    matched,
    astronaut: bestAstronaut,
    angle: bestAngle,
    score: bestScore,
    confidence,
  };
}

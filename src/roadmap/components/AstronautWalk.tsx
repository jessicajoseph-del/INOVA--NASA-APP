import React, { useEffect, useState } from 'react';

interface AstronautWalkProps {
  triggerKey: number;
  reducedMotion: boolean;
}

const ASTRO_SRC = '/assets/aistudio/astro1_a9fd8e9b.jpg';

/**
 * Flood-fills the connected exterior white background from all four edges
 * so the white spacesuit itself stays 100% intact while the backdrop becomes transparent.
 */
function removeWhiteBackdrop(img: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement('canvas');
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return null;

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const total = w * h;
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const isNearWhite = (idx: number) => {
      const p = idx * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      return r >= 240 && g >= 240 && b >= 240;
    };

    const enqueue = (idx: number) => {
      if (idx < 0 || idx >= total || visited[idx]) return;
      if (!isNearWhite(idx)) return;
      visited[idx] = 1;
      queue[tail++] = idx;
    };

    for (let x = 0; x < w; x++) {
      enqueue(x);
      enqueue((h - 1) * w + x);
    }
    for (let y = 1; y < h - 1; y++) {
      enqueue(y * w);
      enqueue(y * w + (w - 1));
    }

    while (head < tail) {
      const idx = queue[head++];
      data[idx * 4 + 3] = 0;

      const x = idx % w;
      const y = (idx - x) / w;

      if (x > 0) enqueue(idx - 1);
      if (x < w - 1) enqueue(idx + 1);
      if (y > 0) enqueue(idx - w);
      if (y < h - 1) enqueue(idx + w);
    }

    // Soften 1px fringe bordering the transparent background
    for (let i = 0; i < total; i++) {
      if (visited[i]) continue;
      const x = i % w;
      const y = (i - x) / w;
      const touchesBg =
        (x > 0 && visited[i - 1]) ||
        (x < w - 1 && visited[i + 1]) ||
        (y > 0 && visited[i - w]) ||
        (y < h - 1 && visited[i + w]);
      if (touchesBg) {
        const p = i * 4;
        const avg = (data[p] + data[p + 1] + data[p + 2]) / 3;
        if (avg > 215) {
          data[p + 3] = Math.round(data[p + 3] * 0.45);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

export const AstronautWalk: React.FC<AstronautWalkProps> = ({
  triggerKey,
  reducedMotion,
}) => {
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<number>(0);

  // Preload & process transparent cutout once on mount
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const processed = removeWhiteBackdrop(img);
      if (processed && !cancelled) {
        setCutoutUrl(processed);
      }
    };
    img.src = ASTRO_SRC;
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (triggerKey <= 0 || reducedMotion) return;
    setActiveKey(triggerKey);
    const timer = window.setTimeout(() => {
      setActiveKey(0);
    }, 3550);
    return () => window.clearTimeout(timer);
  }, [triggerKey, reducedMotion]);

  if (activeKey === 0 || reducedMotion) return null;

  return (
    <div
      key={activeKey}
      aria-live="polite"
      className="pointer-events-none absolute -left-4 sm:-left-8 -bottom-3 z-[60] flex flex-col items-start sm:items-center animate-astro-walk"
    >
      {/* Oat-ivory & gold luminous message bubble — always on top and uncovered */}
      <div className="relative z-40 mb-2.5 rounded-md border-2 border-white bg-[#FFFDF7] px-3.5 py-2 text-center shadow-[0_0_26px_rgba(255,255,255,0.75),0_10px_22px_rgba(0,0,0,0.55)] whitespace-nowrap">
        <span className="font-display text-xs sm:text-sm font-extrabold text-[#06132B]">
          You are ready for the day!
        </span>
      </div>

      {/* Trailing confetti sparks behind boots */}
      <div className="relative z-20">
        <div className="absolute right-1 bottom-5 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[1px] bg-[#FDE047] animate-astro-spark" />
          <span
            className="h-2 w-2 rounded-full bg-[#7DD3FC] animate-astro-spark"
            style={{ animationDelay: '0.18s' }}
          />
          <span
            className="h-2 w-2 rounded-[1px] bg-[#4ADE80] animate-astro-spark"
            style={{ animationDelay: '0.35s' }}
          />
        </div>

        {/* Card-sized Astronaut Image facing left with bouncy walk stride */}
        <div className="animate-astro-bob drop-shadow-[0_14px_24px_rgba(0,0,0,0.6)]">
          {cutoutUrl ? (
            <img
              src={cutoutUrl}
              alt="Astronaut walking out celebrating completion"
              referrerPolicy="no-referrer"
              className="h-44 w-44 sm:h-52 sm:w-52 lg:h-56 lg:w-56 object-contain -scale-x-100 select-none"
            />
          ) : (
            <div className="h-44 w-44 sm:h-52 sm:w-52 lg:h-56 lg:w-56 overflow-hidden rounded-lg border-2 border-white bg-white shadow-md">
              <img
                src={ASTRO_SRC}
                alt="Astronaut walking out celebrating completion"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain -scale-x-100 select-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

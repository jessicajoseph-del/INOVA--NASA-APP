import React, { useEffect, useRef } from 'react';

interface MilestoneParticlesProps {
  progressRatio: number; // 0..1
  reducedMotion: boolean;
}

interface LocalMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  color: string;
  isBurst: boolean;
}

const HALFWAY_COLORS = ['#FFFDF7', '#FDE047', '#BAE6FD', '#F7F3E9'];
const FULL_COLORS = ['#FDE047', '#FFFFFF', '#22D3EE', '#F5B82E', '#F472B6'];

export const MilestoneParticles: React.FC<MilestoneParticlesProps> = ({
  progressRatio,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevRatioRef = useRef<number>(progressRatio);
  const burstQueueRef = useRef<Array<'half' | 'full'>>([]);

  useEffect(() => {
    const prev = prevRatioRef.current;
    if (prev < 0.5 && progressRatio >= 0.5 && progressRatio < 1) {
      burstQueueRef.current.push('half');
    } else if (prev < 1 && progressRatio >= 1) {
      burstQueueRef.current.push('full');
    }
    prevRatioRef.current = progressRatio;
  }, [progressRatio]);

  useEffect(() => {
    const tier: 'none' | 'half' | 'full' =
      progressRatio >= 1 ? 'full' : progressRatio >= 0.5 ? 'half' : 'none';

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tier === 'none' || reducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let rafId = 0;
    const motes: LocalMote[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const spawnBurst = (mode: 'half' | 'full') => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width * 0.5;
      const cy = rect.height * 0.5;
      const count = mode === 'full' ? 46 : 26;
      const palette = mode === 'full' ? FULL_COLORS : HALFWAY_COLORS;

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
        const speed = (mode === 'full' ? 1.6 : 1.0) + Math.random() * (mode === 'full' ? 2.4 : 1.4);
        // Spawn along an oval perimeter around the card center
        const ox = cx + Math.cos(angle) * (rect.width * 0.24);
        const oy = cy + Math.sin(angle) * (rect.height * 0.18);
        motes.push({
          x: ox,
          y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.35,
          radius: (mode === 'full' ? 2.0 : 1.5) + Math.random() * 1.9,
          alpha: 0,
          maxAlpha: 0.78 + Math.random() * 0.22,
          life: 0,
          maxLife: 46 + Math.random() * 28,
          color: palette[Math.floor(Math.random() * palette.length)],
          isBurst: true,
        });
      }
    };

    const spawnAmbientMote = (mode: 'half' | 'full') => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const palette = mode === 'full' ? FULL_COLORS : HALFWAY_COLORS;
      const angle = Math.random() * Math.PI * 2;
      const rx = rect.width * (0.28 + Math.random() * 0.16);
      const ry = rect.height * (0.22 + Math.random() * 0.18);

      motes.push({
        x: rect.width * 0.5 + Math.cos(angle) * rx,
        y: rect.height * 0.52 + Math.sin(angle) * ry,
        vx: (Math.random() - 0.5) * 0.32,
        vy: -(0.35 + Math.random() * (mode === 'full' ? 0.65 : 0.4)),
        radius: 1.2 + Math.random() * (mode === 'full' ? 2.0 : 1.4),
        alpha: 0,
        maxAlpha: mode === 'full' ? 0.75 : 0.52,
        life: 0,
        maxLife: 70 + Math.random() * 45,
        color: palette[Math.floor(Math.random() * palette.length)],
        isBurst: false,
      });
    };

    const maxAmbient = tier === 'full' ? 22 : 12;

    const tick = () => {
      while (burstQueueRef.current.length > 0) {
        const nextBurst = burstQueueRef.current.shift();
        if (nextBurst) spawnBurst(nextBurst);
      }

      const ambientCount = motes.filter((m) => !m.isBurst).length;
      if (ambientCount < maxAmbient && Math.random() < (tier === 'full' ? 0.35 : 0.2)) {
        spawnAmbientMote(tier);
      }

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life += 1;
        m.x += m.vx;
        m.y += m.vy;

        if (m.isBurst) {
          m.vx *= 0.96;
          m.vy *= 0.96;
        }

        const progress = m.life / m.maxLife;
        if (progress < 0.2) {
          m.alpha = (progress / 0.2) * m.maxAlpha;
        } else {
          m.alpha = (1 - (progress - 0.2) / 0.8) * m.maxAlpha;
        }

        if (m.life >= m.maxLife) {
          motes.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, m.alpha);
        ctx.fillStyle = m.color;
        ctx.shadowColor = m.color;
        ctx.shadowBlur = m.isBurst ? 8 : 5;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [progressRatio, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute -inset-16 z-0 h-[calc(100%+8rem)] w-[calc(100%+8rem)]"
    />
  );
};

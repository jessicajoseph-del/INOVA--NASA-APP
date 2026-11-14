import React, { useEffect, useRef } from 'react';

interface ConfettiBurstProps {
  triggerKey: number;
  reducedMotion: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  aspect: number;
  color: string;
  rotation: number;
  vr: number;
  tilt: number;
  vtilt: number;
  gravity: number;
  drag: number;
  opacity: number;
  shape: 'rect' | 'ribbon' | 'spark';
}

const PALETTE = [
  '#FDE047', // Solar Gold
  '#F5B82E', // Rich Amber Gold
  '#FFFFFF', // Bright Luminous White
  '#22D3EE', // Electric Fiber Cyan
  '#F472B6', // Vivid Coral-Magenta
  '#F7F3E9', // Oat Ivory
];

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
  triggerKey,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (triggerKey <= 0 || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const particles: Particle[] = [];

    const spawnBurst = (
      originX: number,
      originY: number,
      count: number,
      angleMin: number,
      angleMax: number,
      speedMin: number,
      speedMax: number
    ) => {
      const shapes: Array<'rect' | 'ribbon' | 'spark'> = ['rect', 'ribbon', 'spark'];
      for (let i = 0; i < count; i++) {
        const angle = angleMin + Math.random() * (angleMax - angleMin);
        const speed = speedMin + Math.random() * (speedMax - speedMin);
        particles.push({
          x: originX + (Math.random() - 0.5) * 24,
          y: originY + (Math.random() - 0.5) * 24,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 6 + Math.random() * 6,
          aspect: 0.45 + Math.random() * 0.45,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.24,
          tilt: Math.random() * Math.PI * 2,
          vtilt: 0.08 + Math.random() * 0.14,
          gravity: 0.28 + Math.random() * 0.14,
          drag: 0.982,
          opacity: 1,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }
    };

    // Main celebratory center-lower burst + twin angled side cannons
    spawnBurst(w * 0.5, h * 0.58, 95, -Math.PI * 0.92, -Math.PI * 0.08, 7, 17);
    spawnBurst(w * 0.14, h * 0.78, 50, -Math.PI * 0.48, -Math.PI * 0.15, 10, 19);
    spawnBurst(w * 0.86, h * 0.78, 50, -Math.PI * 0.85, -Math.PI * 0.52, 10, 19);

    const startTime = performance.now();
    const maxDuration = 3600;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx + Math.sin(p.tilt) * 0.6;
        p.y += p.vy;
        p.rotation += p.vr;
        p.tilt += p.vtilt;

        if (elapsed > maxDuration - 900) {
          p.opacity = Math.max(0, p.opacity - 0.025);
        }

        if (p.y < window.innerHeight + 60 && p.opacity > 0.01) {
          aliveCount++;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          const scaleY = Math.cos(p.tilt);
          ctx.scale(1, Math.abs(scaleY) < 0.15 ? 0.15 : scaleY);
          ctx.fillStyle = p.color;

          if (p.shape === 'spark') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'ribbon') {
            ctx.fillRect(-p.size * 0.7, -p.size * 0.22, p.size * 1.4, p.size * 0.44);
          } else {
            ctx.fillRect(-p.size * 0.5, -p.size * p.aspect * 0.5, p.size, p.size * p.aspect);
          }
          ctx.restore();
        }
      }

      if (aliveCount > 0 && elapsed < maxDuration + 400) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [triggerKey, reducedMotion]);

  if (triggerKey <= 0 || reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-20 h-full w-full"
    />
  );
};

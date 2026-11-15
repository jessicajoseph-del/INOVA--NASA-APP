import React, { useState, useRef, useMemo } from 'react';
import ThreeDFaceMesh from '../inovav/components/ThreeDFaceMesh';

interface AstronautVisorCardProps {
  astronautName?: string;
  role?: string;
  mission?: string;
  onOpenFaceStudio?: () => void;
  className?: string;
}

export const AstronautVisorCard: React.FC<AstronautVisorCardProps> = ({
  astronautName = 'CDR. Alex Vance',
  role = 'Mission Commander',
  mission = 'Artemis VII // Mars Transfer // USER 3D FACE ACTIVE',
  onOpenFaceStudio,
  className = '',
}) => {
  const [visorMouseX, setVisorMouseX] = useState<number>(0);
  const [visorMouseY, setVisorMouseY] = useState<number>(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Normalize to [-1, 1]
    const normX = (x - 0.5) * 2;
    const normY = (y - 0.5) * 2;
    setVisorMouseX(Math.max(-1, Math.min(1, normX)));
    setVisorMouseY(Math.max(-1, Math.min(1, normY)));
  };

  const handleMouseLeave = () => {
    setVisorMouseX(0);
    setVisorMouseY(0);
  };

  return (
    <div
      className={`w-full bg-[#0B1736] border border-[#2A3F6D] rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col justify-between text-left ${className}`}
    >
      {/* 1. TOP HEADER RIBBON */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-blue-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse flex-shrink-0" />
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#F7F4EE] font-mono tracking-wide">
              {astronautName} • <span className="text-cyan-300 font-medium">{role}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider">
              {mission}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFaceStudio && (
            <button
              type="button"
              onClick={onOpenFaceStudio}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-white/10 hover:bg-white/20 text-[#EDE8DE] border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>👤 3D Face Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. LOCKED 3:2 ASTRONAUT STAGE */}
      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden my-3.5 shadow-2xl bg-[#040C1C] select-none group cursor-crosshair"
      >
        <img
          src="/astro.jpg"
          alt="Astronaut Spacesuit Helmet Visor"
          className="w-full h-full object-cover block pointer-events-none"
        />

        {/* Radial vignette blending into dark helmet field */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 51% 48%, rgba(6,19,43,0) 44%, rgba(6,19,43,0.72) 78%, rgba(6,19,43,1) 100%)',
            zIndex: 2,
          }}
        />

        {/* 3D Visor Face Sphere Mesh precisely fitted inside helmet visor */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: '50%',
            top: '36.2%',
            width: '25.5%',
            aspectRatio: '1.09 / 1',
            transform: 'translate(-50%, -50%)',
            borderRadius: '48% 48% 46% 46%',
            background:
              'radial-gradient(circle at 50% 48%, rgba(10, 28, 63, 0.88) 0%, rgba(6, 19, 43, 0.96) 85%, rgba(4, 12, 28, 0.99) 100%)',
            boxShadow:
              'inset 0 0 24px rgba(4, 12, 28, 0.95), inset 0 0 14px rgba(246, 238, 219, 0.2)',
            zIndex: 5,
          }}
        >
          <ThreeDFaceMesh
            mouseX={visorMouseX}
            mouseY={visorMouseY}
            mode="textured"
            style={{ position: 'absolute', inset: 0 }}
          />

          {/* Curved helmet visor specular glass sheen */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '48% 48% 46% 46%',
              background:
                'linear-gradient(132deg, rgba(246,238,219,0.18) 0%, rgba(246,238,219,0.04) 34%, transparent 56%, rgba(234,217,178,0.12) 100%)',
              boxShadow: 'inset 0 0 18px rgba(4, 12, 28, 0.88)',
            }}
          />
        </div>

        {/* Overlay hover prompt */}
        <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded text-[9px] font-mono bg-black/60 text-slate-300 border border-white/10 backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Move cursor to steer visor
        </div>
      </div>

      {/* 3. VISOR ANGLE & RETICLE TELEMETRY CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#07132F] border border-[#1E2F5A] text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px] font-bold">VISOR ANGLE:</span>
          {(['left', 'center', 'right'] as const).map((ang) => {
            const isActive =
              (ang === 'left' && visorMouseX < -0.2) ||
              (ang === 'right' && visorMouseX > 0.2) ||
              (ang === 'center' && Math.abs(visorMouseX) <= 0.2);
            return (
              <button
                key={ang}
                type="button"
                onClick={() => {
                  if (ang === 'left') setVisorMouseX(-0.6);
                  else if (ang === 'right') setVisorMouseX(0.6);
                  else setVisorMouseX(0);
                }}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#F5B82E] text-[#0B1736] border-[#F5B82E] shadow-sm'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {ang}
              </button>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-400">
          RETICLE: <strong className="text-white">ACTIVE 30°</strong> • O₂:{' '}
          <strong className="text-emerald-400">0.38 L/min</strong>
        </div>
      </div>
    </div>
  );
};

export default AstronautVisorCard;

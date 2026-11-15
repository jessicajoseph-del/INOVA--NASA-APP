import React, { useRef, useEffect } from 'react';
import {
  Box,
  TrendingUp,
  Activity,
  Gamepad2,
  HeartPulse,
  Utensils,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export const MODULES = [
  {
    id: 'aura',
    index: '01',
    title: '3D ISS Station Twin',
    subtitle: 'EDGE_COMPUTE // Digital Twin',
    icon: Box,
    accent: '#0284C7', // Cerulean Blue
  },
  {
    id: 'overview',
    index: '02',
    title: 'Trends & Telemetry',
    subtitle: 'AstroCare 2.0 // 180-Day Vitals',
    icon: TrendingUp,
    accent: '#0F2557', // Deep Orbital Navy
  },
  {
    id: 'portal',
    index: '03',
    title: '3D Human Vital',
    subtitle: 'VITAL // Anatomical Observatory',
    icon: Activity,
    accent: '#E06D06', // Solar Amber
  },
  {
    id: 'roadmap',
    index: '04',
    title: 'Roadmap',
    subtitle: 'Lumina Quest // Daily Protocol',
    icon: Gamepad2,
    accent: '#F59E0B', // Amber
  },
  {
    id: 'behavioral',
    index: '05',
    title: 'Behavioral Health',
    subtitle: 'CrewMind // Mood & ABC Trajectory',
    icon: HeartPulse,
    accent: '#10B981', // Emerald
  },
  {
    id: 'mealplan',
    index: '06',
    title: 'Meal Plan',
    subtitle: 'NutriOrbit // Microgravity Nutrition',
    icon: Utensils,
    accent: '#E06D06', // Solar Amber
  },
];

export default function OrbitalSideDial({ activeModuleId, onSelectModule }) {
  const activeIdx = MODULES.findIndex((m) => m.id === activeModuleId);
  const safeActiveIdx = activeIdx >= 0 ? activeIdx : 0;
  const dialRef = useRef(null);

  // Wheel listener to rotate/navigate smoothly
  useEffect(() => {
    const el = dialRef.current;
    if (!el) return;

    let lastWheelTime = 0;
    const handleWheel = (e) => {
      const now = Date.now();
      if (now - lastWheelTime < 240) return; // Debounce wheel
      if (Math.abs(e.deltaY) < 15) return;

      lastWheelTime = now;
      if (e.deltaY > 0) {
        // Next module
        const next = Math.min(MODULES.length - 1, safeActiveIdx + 1);
        onSelectModule(MODULES[next].id);
      } else {
        // Prev module
        const prev = Math.max(0, safeActiveIdx - 1);
        onSelectModule(MODULES[prev].id);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: true });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [safeActiveIdx, onSelectModule]);

  return (
    <aside
      ref={dialRef}
      className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 h-[540px] w-72 pointer-events-none select-none items-center justify-end pr-3"
      aria-label="Mission Module Orbital Navigation"
    >
      {/* ── BACKGROUND CURVED SVG ARC (PASSES THROUGH THE ICONS) ── */}
      <svg
        className="absolute right-0 top-0 h-full w-full pointer-events-none overflow-visible"
        viewBox="0 0 288 540"
        fill="none"
      >
        {/* Subtle guide track */}
        <path
          d="M 264 30 Q 190 270 264 510"
          stroke="#DCD5C7"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.8"
        />
        {/* Highlighted active arc segment around center */}
        <path
          d="M 235 210 Q 215 270 235 330"
          stroke="#0F2557"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>

      {/* ── FIXED CENTER INDICATOR NOTCH (NAVY RECTANGLE ON RIGHT EDGE) ── */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-2 rounded-l-full bg-[#0F2557] shadow-sm z-30"
        title="Active Module Indicator"
      />

      {/* ── ROTARY MODULE ITEMS ALONG THE CURVED ARC ── */}
      <div className="relative w-full h-full flex items-center justify-end">
        {MODULES.map((mod, idx) => {
          const delta = idx - safeActiveIdx;
          const isActive = delta === 0;

          // Parabolic curvature: x moves further right as |delta| increases
          const slotSpacing = 68; // px vertical distance between items
          const y = delta * slotSpacing;
          const x = Math.pow(delta, 2) * 5.2; // Curve depth

          // Visual scaling & fading based on distance from center
          let scale = 1.0;
          let opacity = 1.0;
          let zIndex = 20;

          if (isActive) {
            scale = 1.1;
            opacity = 1.0;
            zIndex = 25;
          } else if (Math.abs(delta) === 1) {
            scale = 0.94;
            opacity = 0.72;
            zIndex = 15;
          } else if (Math.abs(delta) === 2) {
            scale = 0.84;
            opacity = 0.48;
            zIndex = 10;
          } else {
            scale = 0.74;
            opacity = 0.28;
            zIndex = 5;
          }

          const IconComponent = mod.icon;

          return (
            <div
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              style={{
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                opacity,
                zIndex,
                transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 380ms ease',
              }}
              className="absolute right-6 flex items-center justify-end gap-3 pointer-events-auto cursor-pointer group"
            >
              {/* Label Pill (Warm Alabaster with soft shadow) */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-300 flex items-center gap-1.5 shadow-sm whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FFFFFF] border border-[#0F2557]/40 text-[#0F2557] font-bold shadow-md shadow-blue-950/10'
                    : 'bg-[#FFFFFF]/70 border border-[#DCD5C7] text-[#5A657D] group-hover:text-[#0B1736] group-hover:bg-[#FFFFFF]'
                }`}
              >
                <span className={`text-[10px] font-extrabold ${isActive ? 'text-[#E06D06]' : 'text-[#5A657D]'}`}>
                  {mod.index}
                </span>
                <span className="font-sans font-semibold tracking-tight text-xs">
                  {mod.title}
                </span>
              </div>

              {/* Icon Badge aligned right on the orbital arc line */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 ${
                  isActive
                    ? 'bg-[#FFFFFF] border-2 border-[#E06D06] text-[#0F2557] shadow-md shadow-orange-500/20 rotate-0'
                    : 'bg-[#FFFFFF]/85 border border-[#DCD5C7] text-[#5A657D] group-hover:border-[#0F2557]/40 group-hover:text-[#0F2557]'
                }`}
              >
                <IconComponent className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#E06D06]' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SUBTLE DIAL STEP CONTROLLERS (TOP & BOTTOM CHVRONS) ── */}
      <div className="absolute right-12 top-4 pointer-events-auto">
        <button
          type="button"
          onClick={() => onSelectModule(MODULES[Math.max(0, safeActiveIdx - 1)].id)}
          disabled={safeActiveIdx === 0}
          className="w-7 h-7 rounded-full bg-[#FFFFFF]/80 border border-[#DCD5C7] flex items-center justify-center text-[#5A657D] hover:text-[#0F2557] hover:bg-[#FFFFFF] disabled:opacity-20 cursor-pointer shadow-xs transition-all active:scale-95"
          title="Previous Module"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute right-12 bottom-4 pointer-events-auto">
        <button
          type="button"
          onClick={() => onSelectModule(MODULES[Math.min(MODULES.length - 1, safeActiveIdx + 1)].id)}
          disabled={safeActiveIdx === MODULES.length - 1}
          className="w-7 h-7 rounded-full bg-[#FFFFFF]/80 border border-[#DCD5C7] flex items-center justify-center text-[#5A657D] hover:text-[#0F2557] hover:bg-[#FFFFFF] disabled:opacity-20 cursor-pointer shadow-xs transition-all active:scale-95"
          title="Next Module"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

    </aside>
  );
}

import React, { useEffect } from 'react';
import TopNavPill from './TopNavPill';
import OrbitalSideDial, { MODULES } from './OrbitalSideDial';

export default function AppShell({
  activeModuleId,
  onSelectModule,
  isARHandActive,
  onToggleARHand,
  activeAstronaut,
  onOpenProfile,
  onLogoutClick,
  children,
}) {
  const currentMod = MODULES.find((m) => m.id === activeModuleId) || MODULES[0];

  // Optional Keyboard navigation: ArrowUp/ArrowDown to switch orbital modules
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      const currentIdx = MODULES.findIndex((m) => m.id === activeModuleId);
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        const next = Math.min(MODULES.length - 1, currentIdx + 1);
        if (next !== currentIdx) {
          onSelectModule(MODULES[next].id);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        const prev = Math.max(0, currentIdx - 1);
        if (prev !== currentIdx) {
          onSelectModule(MODULES[prev].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModuleId, onSelectModule]);

  return (
    <div className="min-h-screen w-full relative bg-[#F7F4EE] text-[#0B1736] font-sans overflow-x-hidden selection:bg-[#0B1736] selection:text-[#F7F4EE]">
      {/* ── BACKGROUND AMBIENT OAT GRID ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,23,54,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,23,54,0.035)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-900/5 rounded-full blur-[140px] pointer-events-none" />

      {/* ── 1. FLOATING GLASS PILL TOP NAVIGATION BAR ── */}
      <TopNavPill
        activeModuleId={currentMod.id}
        activeModuleTitle={currentMod.title}
        activeModuleIndex={currentMod.index}
        onSelectModule={onSelectModule}
        isARHandActive={isARHandActive}
        onToggleARHand={onToggleARHand}
        activeAstronaut={activeAstronaut}
        onOpenProfile={onOpenProfile}
        onLogoutClick={onLogoutClick}
      />

      {/* ── 2. DESKTOP RIGHT-EDGE CURVED ORBITAL SIDEBAR ── */}
      <OrbitalSideDial
        activeModuleId={activeModuleId}
        onSelectModule={onSelectModule}
      />

      {/* ── 3. VIEWPORT WITH RIGHTWARD SWIPE PAGE TRANSITION (FULL WIDTH, NO SQUEEZING) ── */}
      <div className="w-full min-h-screen flex flex-col justify-between pt-20 relative z-10">
        <div
          key={activeModuleId}
          className="w-full flex-1"
          style={{
            animation: 'flightDeckSwipeRight 380ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        >
          {children}
        </div>
      </div>

      {/* Inline styles for keyframe swipe right */}
      <style>{`
        @keyframes flightDeckSwipeRight {
          0% {
            opacity: 0;
            transform: translate3d(-72px, 0, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}


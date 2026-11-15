import React, { useState, useEffect } from 'react';
import {
  Layers,
  Hand,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  LogOut,
  Eye,
  EyeOff,
  Sparkles,
  Box,
  TrendingUp,
  Activity,
  Gamepad2,
  HeartPulse,
  Utensils
} from 'lucide-react';

const MODULE_LIST = [
  { id: 'aura', index: '01', title: '3D ISS Station Twin', short: 'ISS Twin', icon: Box },
  { id: 'overview', index: '02', title: 'Trends & Telemetry', short: 'Trends', icon: TrendingUp },
  { id: 'portal', index: '03', title: '3D Human Vital', short: 'Vitals', icon: Activity },
  { id: 'roadmap', index: '04', title: 'Roadmap', short: 'Roadmap', icon: Gamepad2 },
  { id: 'behavioral', index: '05', title: 'Behavioral Health', short: 'CrewMind', icon: HeartPulse },
  { id: 'mealplan', index: '06', title: 'Meal Plan', short: 'Nutrition', icon: Utensils },
];

export default function TopNavPill({
  activeModuleId = 'aura',
  activeModuleTitle = '3D ISS Station Twin',
  activeModuleIndex = '01',
  onSelectModule,
  isARHandActive = false,
  onToggleARHand,
  activeAstronaut = { name: 'CDR. Alex Vance', role: 'Mission Commander', callsign: 'Vance' },
  onOpenProfile,
  onLogoutClick,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfilePopover, setShowProfilePopover] = useState(false);

  const currentIdx = MODULE_LIST.findIndex((m) => m.id === activeModuleId);
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;

  // Loop navigation helper: wraps around infinitely
  const navigateLoop = (step) => {
    if (!onSelectModule) return;
    const total = MODULE_LIST.length;
    const nextIdx = (safeIdx + step + total) % total;
    onSelectModule(MODULE_LIST[nextIdx].id);
  };

  // Keyboard shortcut 'h' to toggle hide/unhide
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'h' || e.key === 'H') {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initials = (activeAstronaut.name || 'Alex Vance')
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  // Compute 3 visible looped tabs: previous, active, next
  const prevMod = MODULE_LIST[(safeIdx - 1 + MODULE_LIST.length) % MODULE_LIST.length];
  const activeMod = MODULE_LIST[safeIdx];
  const nextMod = MODULE_LIST[(safeIdx + 1) % MODULE_LIST.length];

  return (
    <>
      {/* ── 1. COLLAPSED FLOATING SEMICIRCLE MINI-TRIGGER (VISIBLE WHEN HIDDEN) ── */}
      {isCollapsed && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-2 px-5 py-2 rounded-b-2xl bg-white/90 backdrop-blur-xl border-x border-b border-[#DCD5C7] shadow-[0_8px_30px_rgba(11,23,54,0.15)] text-[#0F2557] hover:bg-white text-xs font-mono font-bold transition-all cursor-pointer group hover:pt-2.5 active:scale-95"
            title="Expand RIDGE Top Navigation Bar (Press 'H')"
          >
            <div className="w-5 h-5 rounded-full bg-[#0F2557] flex items-center justify-center text-white text-[10px]">
              <Layers className="w-3 h-3 text-cyan-300 group-hover:rotate-45 transition-transform" />
            </div>
            <span>RIDGE // {activeMod.short}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#E06D06] animate-bounce" />
          </button>
        </div>
      )}

      {/* ── 2. EXPANDED FLOATING SEMICIRCULAR DOME TOP NAVIGATION ── */}
      <header
        style={{
          transform: isCollapsed ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
          transition: 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="fixed top-0 left-1/2 z-50 w-[95%] max-w-4xl rounded-b-[40px] border-x border-b border-[#DCD5C7]/90 bg-white/85 backdrop-blur-2xl shadow-[0_16px_50px_rgba(11,23,54,0.15)] px-4 sm:px-7 pt-2.5 pb-3 flex flex-col items-center pointer-events-auto select-none"
      >
        {/* Top Control Bar: Brand (Left), Module Title (Center), Controls (Right) */}
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* Brand Left */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#0F2557] flex items-center justify-center text-white shadow-md shadow-blue-950/20 group">
              <Layers className="w-4 h-4 text-cyan-300 group-hover:rotate-45 transition-transform" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="font-extrabold text-base tracking-wider text-[#0F2557]">
                RIDGE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E06D06]" />
            </div>
          </div>

          {/* Center Looping Mission Modules Track */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Loop Left Arrow */}
            <button
              type="button"
              onClick={() => navigateLoop(-1)}
              className="w-7 h-7 rounded-full bg-[#EDE8DE] hover:bg-[#DCD5C7] text-[#0B1736] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Previous Module in Loop"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Loop Visible Tabs: Prev, Active, Next */}
            <div className="flex items-center gap-1.5 bg-[#EDE8DE]/60 border border-[#DCD5C7] p-1 rounded-full">
              {/* Prev Module (Looping) */}
              <button
                type="button"
                onClick={() => onSelectModule && onSelectModule(prevMod.id)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-[#5A657D] hover:text-[#0B1736] hover:bg-white/70 transition-all cursor-pointer"
                title={`Switch to ${prevMod.title}`}
              >
                <span className="text-[10px] opacity-70">{prevMod.index}</span>
                <span className="font-sans font-medium">{prevMod.short}</span>
              </button>

              {/* Active Center Semicircle Module */}
              <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#0F2557] text-white shadow-md shadow-blue-950/20 transition-all font-mono text-xs">
                <span className="text-[#E06D06] font-extrabold">{activeMod.index}</span>
                <span className="text-cyan-300/60">//</span>
                <span className="font-sans font-bold tracking-tight text-white whitespace-nowrap">
                  {activeMod.title}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </div>

              {/* Next Module (Looping) */}
              <button
                type="button"
                onClick={() => onSelectModule && onSelectModule(nextMod.id)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-[#5A657D] hover:text-[#0B1736] hover:bg-white/70 transition-all cursor-pointer"
                title={`Switch to ${nextMod.title}`}
              >
                <span className="font-sans font-medium">{nextMod.short}</span>
                <span className="text-[10px] opacity-70">{nextMod.index}</span>
              </button>
            </div>

            {/* Loop Right Arrow */}
            <button
              type="button"
              onClick={() => navigateLoop(1)}
              className="w-7 h-7 rounded-full bg-[#EDE8DE] hover:bg-[#DCD5C7] text-[#0B1736] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Next Module in Loop"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Utility Controls: AR Hand, Profile, Log Out */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* AR Hand Toggle */}
            <button
              type="button"
              onClick={onToggleARHand}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border ${
                isARHandActive
                  ? 'bg-[#0284C7]/15 border-[#0284C7] text-[#0284C7] shadow-xs'
                  : 'bg-[#EDE8DE]/70 border-[#DCD5C7] text-[#5A657D] hover:text-[#0B1736]'
              }`}
              title="Toggle MediaPipe PalmMouse Controller"
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">AR Hand</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isARHandActive ? 'bg-[#0284C7] animate-pulse' : 'bg-slate-400'
                }`}
              />
            </button>

            {/* Profile Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                  else setShowProfilePopover(!showProfilePopover);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#DCD5C7] bg-[#FFFFFF] hover:bg-[#EDE8DE] text-xs font-medium text-[#0B1736] transition-all cursor-pointer shadow-xs active:scale-95"
                title="Astronaut Profile & Visor Studio"
              >
                <div className="w-5 h-5 rounded-full bg-[#0F2557] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {initials}
                </div>
                <span className="font-semibold text-xs hidden lg:inline max-w-[90px] truncate">
                  {activeAstronaut.name || 'Alex Vance'}
                </span>
              </button>

              {/* Popover */}
              {showProfilePopover && (
                <div className="absolute right-0 top-11 w-60 bg-[#FFFFFF] border border-[#DCD5C7] rounded-2xl p-4 shadow-[0_12px_40px_rgba(11,23,54,0.15)] z-50 text-left animate-fadeIn">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-[#DCD5C7]">
                    <div className="w-9 h-9 rounded-full bg-[#0F2557] text-white flex items-center justify-center font-bold text-xs">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-[#0B1736]">{activeAstronaut.name || 'Alex Vance'}</h4>
                      <span className="text-[10px] font-mono text-[#5A657D]">{activeAstronaut.role || 'Mission Commander'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfilePopover(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full mt-2 py-1.5 rounded-lg bg-[#EDE8DE] hover:bg-[#DCD5C7] text-xs font-mono font-bold text-[#0B1736] transition-all cursor-pointer"
                  >
                    Open Visor Studio
                  </button>
                </div>
              )}
            </div>

            {/* Log Out */}
            <button
              type="button"
              onClick={onLogoutClick}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#0F2557] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Sign Out of Mission Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* ── LOWER ARC: LOOP POSITION DOTS & HIDE/UNHIDE TOGGLE NOTCH ── */}
        <div className="w-full mt-2 pt-1 border-t border-[#DCD5C7]/50 flex items-center justify-between px-2 text-[10px] font-mono text-[#5A657D]">
          
          {/* Loop Orbit Indicators */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-wider text-[#5A657D]">ORBIT LOOP:</span>
            {MODULE_LIST.map((mod, idx) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => onSelectModule && onSelectModule(mod.id)}
                className={`transition-all cursor-pointer rounded-full ${
                  mod.id === activeModuleId
                    ? 'w-5 h-2 bg-[#E06D06] rounded-full shadow-xs'
                    : 'w-2 h-2 bg-[#DCD5C7] hover:bg-[#0F2557]/60'
                }`}
                title={`Module ${mod.index}: ${mod.title}`}
              />
            ))}
          </div>

          {/* Semicircle Bottom Hide / Unhide Toggle Pill */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#5A657D] hover:text-[#0F2557] transition-colors cursor-pointer px-2 py-0.5 rounded-full hover:bg-[#EDE8DE]"
            title="Hide Navigation Bar (Press 'H')"
          >
            <span>HIDE</span>
            <ChevronUp className="w-3 h-3 text-[#0F2557]" />
          </button>

        </div>
      </header>
    </>
  );
}

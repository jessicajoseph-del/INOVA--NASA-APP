import React, { useState } from 'react';
import {
  Layers,
  Hand,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Activity,
  Heart,
  Settings,
  Sparkles
} from 'lucide-react';

export default function TopNavPill({
  activeModuleId = 'aura',
  activeModuleTitle = '3D ISS Station Twin',
  activeModuleIndex = '01',
  isARHandActive = false,
  onToggleARHand,
  activeAstronaut = { name: 'CDR. Alex Vance', role: 'Mission Commander', callsign: 'Vance' },
  onOpenProfile,
  onLogoutClick,
}) {
  const [showProfilePopover, setShowProfilePopover] = useState(false);

  // Astronaut display initials
  const initials = (activeAstronaut.name || 'Alex Vance')
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl rounded-full border border-[#DCD5C7]/80 bg-white/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(11,23,54,0.12)] px-4 sm:px-6 py-2.5 flex items-center justify-between pointer-events-auto transition-all select-none">
      
      {/* ── LEFT SECTION: BRAND IDENTITY & ACTIVE MODULE BREADCRUMB ── */}
      <div className="flex items-center space-x-4">
        {/* Emblem & Brand */}
        <div className="flex items-center space-x-3 pr-4 border-r border-[#DCD5C7]">
          <div className="w-9 h-9 rounded-full bg-[#0F2557] flex items-center justify-center text-white shadow-md shadow-blue-950/25 shrink-0 group">
            <Layers className="w-4 h-4 text-cyan-300 group-hover:rotate-45 transition-transform" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="font-extrabold text-lg tracking-wider text-[#0F2557]">
              RIDGE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E06D06]" />
          </div>
        </div>

        {/* Active Module Breadcrumb Pill */}
        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE8DE]/70 border border-[#DCD5C7] text-xs font-mono font-bold text-[#0F2557] tracking-wider uppercase">
          <span className="text-[#E06D06] font-extrabold">{activeModuleIndex}</span>
          <span className="text-[#5A657D]">//</span>
          <span className="truncate max-w-[200px]">{activeModuleTitle}</span>
        </div>
      </div>

      {/* ── RIGHT SECTION: AR HAND, PROFILE, & LOG OUT ── */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* 1. AR Hand Gesture Toggle */}
        <button
          type="button"
          onClick={onToggleARHand}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer active:scale-95 border ${
            isARHandActive
              ? 'bg-[#0284C7]/10 border-[#0284C7] text-[#0284C7] shadow-xs'
              : 'bg-[#EDE8DE]/70 border-[#DCD5C7] text-[#5A657D] hover:text-[#0B1736]'
          }`}
          title="Toggle MediaPipe PalmMouse Gesture HUD"
        >
          <Hand className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AR Hand</span>
          <span className="flex items-center gap-1 text-[10px]">
            <span
              className={`w-2 h-2 rounded-full ${
                isARHandActive ? 'bg-[#0284C7] animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{isARHandActive ? 'ACTIVE' : 'OFF'}</span>
          </span>
        </button>

        {/* 2. Astronaut Profile Popover Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (onOpenProfile) onOpenProfile();
              else setShowProfilePopover(!showProfilePopover);
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DCD5C7] bg-[#FFFFFF] hover:bg-[#EDE8DE] text-xs font-medium text-[#0B1736] transition-all cursor-pointer shadow-xs active:scale-95"
            title="Astronaut Telemetry & Biometric Profile"
          >
            <div className="w-5 h-5 rounded-full bg-[#0F2557] text-white text-[10px] font-mono font-bold flex items-center justify-center">
              {initials}
            </div>
            <span className="font-semibold text-xs hidden lg:inline max-w-[120px] truncate">
              {activeAstronaut.name || 'Alex Vance'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#5A657D]" />
          </button>

          {/* Quick Profile Popover */}
          {showProfilePopover && (
            <div className="absolute right-0 top-12 w-64 bg-[#FFFFFF] border border-[#DCD5C7] rounded-2xl p-4 shadow-[0_12px_40px_rgba(11,23,54,0.15)] z-50 text-left animate-fadeIn">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCD5C7]">
                <div className="w-10 h-10 rounded-full bg-[#0F2557] text-white flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#0B1736]">{activeAstronaut.name || 'CDR. Alex Vance'}</h4>
                  <span className="text-[11px] font-mono text-[#5A657D] block">{activeAstronaut.role || 'Mission Commander'}</span>
                </div>
              </div>
              <div className="py-2.5 space-y-1.5 text-[11px] font-mono text-[#5A657D]">
                <div className="flex justify-between">
                  <span>CALLSIGN:</span>
                  <strong className="text-[#0B1736]">{activeAstronaut.callsign || 'VANCE-01'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>BLOOD TYPE:</span>
                  <strong className="text-[#0B1736]">{activeAstronaut.bloodType || 'O-NEG'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>MISSION:</span>
                  <strong className="text-[#0B1736]">ARTEMIS VII</strong>
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

        {/* 3. Log Out Button */}
        <button
          type="button"
          onClick={onLogoutClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0F2557] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          title="Sign Out of Active Session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log Out</span>
        </button>

      </div>
    </header>
  );
}

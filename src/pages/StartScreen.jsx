import React, { useState, useEffect, Suspense } from 'react';
import { ArrowRight, Layers, ShieldCheck, Activity } from 'lucide-react';
import { AstrodynamicAnimation } from '../assets/astrodynamic_calculator';

export default function StartScreen({ onEnter }) {
  const [countdown, setCountdown] = useState(8);

  // 8-second automatic timeout smoothly transitioning to Welcome Screen
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onEnter();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onEnter]);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#020612] text-[#F7F4EE] p-6 overflow-hidden select-none">
      {/* 1. 3D ASTRODYNAMIC PARTICLE SWARM ANIMATION (HOHMANN ORBITAL TRANSFER) */}
      <Suspense fallback={<div className="absolute inset-0 bg-[#020612]" />}>
        <AstrodynamicAnimation />
      </Suspense>

      {/* Radial fade & subtle grid overlay blending the 3D particles with UI */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#020612]/35 to-[#020612]/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Security & Architecture Badge */}
      <div className="absolute top-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/30 bg-[#0B1736]/70 backdrop-blur-md shadow-lg font-mono text-xs text-cyan-200 z-20">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
        <span>RIDGE ARCHITECTURE // ASTRODYNAMIC TRAJECTORY & TELEMETRY</span>
      </div>

      {/* Center RIDGE Hero Card (Floating in the middle of the 3D Astrodynamic Model) */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-xl w-full p-8 rounded-3xl bg-[#0B1736]/65 border border-cyan-500/25 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Glowing 3D Emblem */}
        <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-900/60 border border-cyan-400/40 flex items-center justify-center text-white shadow-[0_0_30px_rgba(6,182,212,0.35)] mb-6 group hover:scale-105 transition-transform">
          <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-300 animate-pulse" />
        </div>

        {/* Title */}
        <h1
          className="font-tech text-5xl sm:text-7xl font-extrabold text-[#F7F4EE] tracking-[0.32em] text-indent-[0.32em] leading-none drop-shadow-[0_4px_30px_rgba(56,189,248,0.35)]"
        >
          RIDGE
        </h1>

        {/* Subtitle */}
        <span className="font-mono text-xs sm:text-sm font-semibold text-cyan-300 tracking-[0.24em] uppercase mt-4">
          Astrodynamic Health Monitoring System
        </span>

        {/* 8-Second Timeout Progress Indicator */}
        <div className="w-64 sm:w-72 flex flex-col items-center gap-2.5 mt-8">
          <div className="w-full h-1.5 bg-[#061026] border border-cyan-500/30 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-[#F5B82E] rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_#38bdf8]"
              style={{ width: `${((8 - countdown) / 8) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between w-full font-mono text-[11px] text-slate-400">
            <span>SYSTEM INITIALIZATION</span>
            <span className="font-bold text-[#F5B82E]">0{countdown}S</span>
          </div>
        </div>

        {/* Primary Manual Action: Enter System */}
        <button
          type="button"
          onClick={onEnter}
          className="mt-8 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#F5B82E] hover:from-amber-300 hover:to-amber-500 text-[#0B1736] font-extrabold text-sm shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer pointer-events-auto"
        >
          <span>Enter System</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Footer Verification Stamp */}
      <div className="absolute bottom-6 flex items-center gap-4 text-[11px] font-mono text-slate-400 z-20">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>ZERO-TRUST IDENTITY GATE</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>HOHMANN ASTRODYNAMIC TRAJECTORY</span>
        </div>
      </div>
    </div>
  );
}

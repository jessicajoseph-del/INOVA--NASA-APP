import React, { useState, useEffect } from 'react';
import { ArrowRight, Layers, ShieldCheck, Activity } from 'lucide-react';

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
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#F7F4EE] text-[#0B1736] p-6 overflow-hidden select-none">
      {/* Background Subtle Oat Grid & Ambient Light */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,23,54,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,23,54,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-blue-900/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Security & Architecture Badge */}
      <div className="absolute top-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#DCD5C7] bg-[#FFFFFF] shadow-sm font-mono text-xs text-[#5A657D]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>RIDGE ARCHITECTURE // MISSION TELEMETRY HANDSHAKE</span>
      </div>

      {/* Center Hero Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
        {/* Emblem */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0F2557] border border-[#DCD5C7] flex items-center justify-center text-white shadow-xl mb-6">
          <Layers className="w-9 h-9 sm:w-11 sm:h-11 text-cyan-300" />
        </div>

        {/* Title */}
        <h1
          className="font-tech text-5xl sm:text-7xl font-extrabold text-[#0B1736] tracking-[0.32em] text-indent-[0.32em] leading-none"
          style={{ textShadow: '0 4px 30px rgba(11, 23, 54, 0.12)' }}
        >
          RIDGE
        </h1>

        {/* Subtitle */}
        <span className="font-mono text-xs sm:text-sm font-semibold text-[#5A657D] tracking-[0.24em] uppercase mt-4">
          Health Monitoring System
        </span>

        {/* 8-Second Timeout Progress Indicator */}
        <div className="w-64 flex flex-col items-center gap-2.5 mt-8">
          <div className="w-full h-1.5 bg-[#EDE8DE] border border-[#DCD5C7] rounded-full overflow-hidden shadow-xs">
            <div
              className="h-full bg-[#0F2557] rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((8 - countdown) / 8) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between w-full font-mono text-[11px] text-[#5A657D]">
            <span>SYSTEM INITIALIZATION</span>
            <span className="font-bold text-[#0B1736]">0{countdown}S</span>
          </div>
        </div>

        {/* Primary Manual Action: Enter System */}
        <button
          type="button"
          onClick={onEnter}
          className="mt-9 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#0F2557] hover:bg-[#1A3B8B] text-white font-bold text-sm shadow-lg shadow-blue-950/20 active:scale-95 transition-all cursor-pointer"
        >
          <span>Enter System</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Footer Verification Stamp */}
      <div className="absolute bottom-6 flex items-center gap-4 text-[11px] font-mono text-[#5A657D]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ZERO-TRUST IDENTITY GATE</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-600" />
          <span>16-CHANNEL TELEMETRY</span>
        </div>
      </div>
    </div>
  );
}

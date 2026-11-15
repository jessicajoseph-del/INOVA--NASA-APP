import React from 'react';
import { ArrowRight, UserPlus, LogIn, Shield, HeartPulse, Sparkles, Orbit } from 'lucide-react';

export default function WelcomeScreen({ onContinue, onNavigateToSignUp }) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[#F7F4EE] text-[#0B1736] p-4 sm:p-6 overflow-hidden">
      {/* Background Subtle Oat Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,23,54,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,23,54,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-900/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Elevated Warm Alabaster Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#FFFFFF] border border-[#DCD5C7] rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(11,23,54,0.08)] flex flex-col items-center text-center">
        
        {/* Emblem Badge */}
        <div className="w-16 h-16 rounded-2xl bg-[#EDE8DE] border border-[#DCD5C7] flex items-center justify-center text-[#0F2557] shadow-sm mb-5">
          <Orbit className="w-8 h-8 text-[#0F2557]" />
        </div>

        {/* Header Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE8DE] border border-[#DCD5C7] text-xs font-mono font-semibold text-[#5A657D] uppercase tracking-wider mb-3">
          <Shield className="w-3.5 h-3.5 text-[#0F2557]" />
          <span>Secured Mission Portal</span>
        </div>

        {/* Welcome Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1736] tracking-tight leading-snug">
          Welcome to RIDGE
        </h2>
        <p className="text-xs sm:text-sm text-[#5A657D] font-normal mt-2 leading-relaxed max-w-md">
          Autonomous Crew Health, Real-Time Biometric Monitoring & 3D Mission Telemetry Environment.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 w-full my-6 font-mono text-[11px] text-[#5A657D]">
          <div className="p-3 rounded-xl bg-[#EDE8DE]/60 border border-[#DCD5C7] text-left flex items-start gap-2">
            <HeartPulse className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B1736] block">Suit Vitals</span>
              <span>1 Hz telemetry stream</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#EDE8DE]/60 border border-[#DCD5C7] text-left flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B1736] block">Zero-Trust</span>
              <span>Face & Fingerprint ID</span>
            </div>
          </div>
        </div>

        {/* Primary Action: Continue to Login (Strict Auth Gate) */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#0F2557] hover:bg-[#1A3B8B] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Continue to Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Secondary Action: Create Account */}
        <div className="mt-5 pt-4 border-t border-[#DCD5C7] w-full flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <span className="text-[#5A657D]">First time on mission?</span>
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="inline-flex items-center gap-1.5 font-bold text-[#0F2557] hover:underline cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Crew Account (Sign Up)</span>
          </button>
        </div>

      </div>

      {/* Security Footer Notice */}
      <div className="relative z-10 mt-6 text-[11px] font-mono text-[#5A657D] text-center">
        <span>ENCRYPTED PROTOCOL • COMPLIANT WITH NASA MISSION DEFENSE DIRECTIVE 44</span>
      </div>
    </div>
  );
}

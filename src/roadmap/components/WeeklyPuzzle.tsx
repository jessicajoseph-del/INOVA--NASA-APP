import React from 'react';
import { Droplets, Leaf, Lock, Sprout, Unlock } from 'lucide-react';

interface WeeklyPuzzleProps {
  streakDays: number; // 0 to 7
}

export const WeeklyPuzzle: React.FC<WeeklyPuzzleProps> = ({ streakDays }) => {
  const isComplete = streakDays >= 7;

  return (
    <div className="mx-auto w-full max-w-[900px] bg-gradient-to-br from-[#06132B] via-[#09251F] to-[#06132B] rounded-xl border border-emerald-400/25 p-5 sm:p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] text-center relative overflow-hidden">
      <Leaf
        aria-hidden="true"
        className="absolute -left-7 top-16 h-28 w-28 -rotate-45 text-emerald-400/10"
      />
      <Leaf
        aria-hidden="true"
        className="absolute -right-7 bottom-10 h-32 w-32 rotate-45 text-lime-300/10"
      />

      <div className="relative z-10 mb-6 flex items-center justify-center gap-2">
        <Leaf className="h-5 w-5 text-emerald-300" aria-hidden="true" />
        <h2 className="font-display text-xl font-extrabold text-[#F7F3E9]">
          Weekly Consistency Puzzle
        </h2>
        <Leaf className="h-5 w-5 -scale-x-100 text-lime-300" aria-hidden="true" />
      </div>

      <p className="relative z-10 text-sm text-emerald-50/85 mb-8 max-w-lg mx-auto">
        Complete each day&apos;s roadmap tasks to grow your plant. Reveal all 7 leaves to unlock your watering opportunity!
      </p>

      {/* 7-Piece Puzzle Grid */}
      <div className="relative mx-auto w-full max-w-md h-64 sm:h-72 rounded-lg border-2 border-emerald-300/30 bg-[#071B1C] overflow-hidden flex shadow-[0_0_28px_rgba(34,197,94,0.12)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 700 280"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="weekly-leaf-gradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#BEF264" />
              <stop offset="55%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <linearGradient id="weekly-pot-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#D69E67" />
              <stop offset="100%" stopColor="#8B4F2F" />
            </linearGradient>
          </defs>
          <path
            d="M350 230 C350 195 346 156 350 119 C353 83 359 57 362 33 M350 187 C321 158 294 145 259 137 M352 153 C387 128 415 111 451 103 M354 116 C330 91 310 73 283 61 M357 91 C381 68 400 52 426 42"
            fill="none"
            stroke="#4ADE80"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="7"
          />
          <g fill="url(#weekly-leaf-gradient)" stroke="#BBF7D0" strokeOpacity=".65" strokeWidth="2">
            <path d="M350 189 C307 145 267 147 247 171 C273 203 315 211 350 189Z" />
            <path d="M351 182 C393 140 434 139 456 163 C433 197 392 207 351 182Z" />
            <path d="M352 151 C310 111 274 113 254 137 C279 169 318 174 352 151Z" />
            <path d="M354 137 C396 96 435 98 455 122 C430 154 391 161 354 137Z" />
            <path d="M356 109 C327 69 296 63 276 82 C291 112 323 125 356 109Z" />
            <path d="M360 91 C382 53 415 42 438 58 C425 89 394 104 360 91Z" />
          </g>
          <g fill="none" stroke="#166534" strokeLinecap="round" strokeWidth="2">
            <path d="M350 189 260 172 M351 182 447 164 M352 151 266 138 M354 137 446 123 M356 109 282 83 M360 91 430 60" />
          </g>
          <ellipse cx="350" cy="228" rx="74" ry="12" fill="#A3E635" fillOpacity=".25" />
          <path d="M289 226 H411 L398 273 H302Z" fill="url(#weekly-pot-gradient)" />
          <path d="M284 219 Q350 208 416 219 L411 233 Q350 243 289 233Z" fill="#E5B47B" />
          <path d="M307 249 H393" stroke="#FDE68A" strokeOpacity=".65" strokeLinecap="round" strokeWidth="4" />
        </svg>

        {Array.from({ length: 7 }).map((_, i) => {
          const isRevealed = i < streakDays;
          return (
            <div
              key={`puzzle-piece-${i}`}
              aria-label={`Day ${i + 1} ${isRevealed ? 'completed' : 'locked'}`}
              className="relative z-[1] h-full flex-1 border-r border-emerald-100/20 last:border-r-0 transition-all duration-700"
            >
              {!isRevealed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#06132B]/80 backdrop-blur-[2px]">
                  <Leaf className="h-5 w-5 text-emerald-100/20" aria-hidden="true" />
                  <span className="font-mono text-sm font-bold text-white/35">
                    DAY {i + 1}
                  </span>
                </div>
              )}
              {isRevealed && (
                <div className="absolute inset-x-0 bottom-2 flex justify-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#052E1B]/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-lime-100">
                    <Leaf className="h-3 w-3" aria-hidden="true" />
                    {i + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className={`relative z-10 mx-auto mt-4 flex w-full max-w-md items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-500 ${
          isComplete
            ? 'border-emerald-300/50 bg-emerald-950/70 text-emerald-50'
            : 'border-slate-400/25 bg-[#06132B]/80 text-slate-200'
        }`}
        aria-live="polite"
      >
        {isComplete ? (
          <Unlock className="h-7 w-7 shrink-0 text-lime-300" aria-hidden="true" />
        ) : (
          <Lock className="h-7 w-7 shrink-0 text-slate-400" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold">
            {isComplete ? 'Watering opportunity unlocked!' : 'Plant watering is locked'}
          </p>
          <p className="mt-0.5 text-xs opacity-80">
            {isComplete
              ? 'Your 7-day streak opened the lock.'
              : 'Complete all 7 days of roadmap tasks to unlock it.'}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wider ${
            isComplete ? 'bg-lime-300/15 text-lime-200' : 'bg-slate-400/10 text-slate-400'
          }`}
        >
          {isComplete ? 'OPEN' : 'LOCKED'}
        </span>
      </div>

      <div className="mt-6 font-mono text-sm font-bold text-amber-400">
        {streakDays}/7 Days Completed
      </div>

      {isComplete && (
        <div className="relative z-10 mx-auto mt-4 w-full max-w-md animate-in fade-in duration-700">
          <div className="rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-emerald-400/15 via-lime-300/10 to-amber-300/15 p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-center gap-3">
              <Sprout className="h-10 w-10 text-lime-300" aria-hidden="true" />
              <Droplets className="h-9 w-9 text-sky-300" aria-hidden="true" />
            </div>
            <h3 className="font-display text-xl font-extrabold text-white mb-2">
              Time to water your plant!
            </h3>
            <p className="text-sm text-emerald-100 font-semibold">
              You completed all 7 days. Enjoy your well-earned plant-care moment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
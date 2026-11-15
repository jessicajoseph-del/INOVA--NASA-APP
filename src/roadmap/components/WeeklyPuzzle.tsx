import React from 'react';
import { Sprout } from 'lucide-react';

interface WeeklyPuzzleProps {
  streakDays: number; // 0 to 7
}

export const WeeklyPuzzle: React.FC<WeeklyPuzzleProps> = ({ streakDays }) => {
  const isComplete = streakDays >= 7;

  // Placeholder URL for the plant. Replace with your actual asset.
  const PLANT_IMG = 'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="mx-auto w-full max-w-[900px] mt-8 mb-16 bg-[#06132B] rounded-xl border border-amber-400/20 p-5 sm:p-8 shadow-[0_0_30px_rgba(250,204,21,0.05)] text-center relative overflow-hidden">
      
      <div className="mb-6 flex items-center justify-center gap-2">
        <Sprout className="h-6 w-6 text-amber-400" />
        <h2 className="font-display text-xl font-extrabold text-[#F7F3E9]">
          Weekly Consistency Puzzle
        </h2>
      </div>

      <p className="text-sm text-sky-100/80 mb-8 max-w-lg mx-auto">
        Complete all daily roadmap stages to reveal a puzzle piece. Build a 7-day streak to uncover the full picture!
      </p>

      {/* 7-Piece Puzzle Grid */}
      <div className="relative mx-auto w-full max-w-md h-64 sm:h-72 rounded-lg border-2 border-sky-400/20 bg-white/5 overflow-hidden flex">
        {Array.from({ length: 7 }).map((_, i) => {
          const isRevealed = i < streakDays;
          return (
            <div
              key={`puzzle-piece-${i}`}
              className="h-full flex-1 border-r border-sky-400/20 last:border-r-0 relative transition-all duration-700"
              style={{
                backgroundImage: isRevealed ? `url(${PLANT_IMG})` : 'none',
                backgroundSize: '700% 100%',
                backgroundPosition: `${(i / 6) * 100}% center`,
              }}
            >
              {!isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B1F47]/80 backdrop-blur-sm">
                  <span className="font-mono text-xl font-extrabold text-white/20">{i + 1}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 font-mono text-sm font-bold text-amber-400">
        {streakDays}/7 Days Completed
      </div>

      {isComplete && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#06132B]/85 backdrop-blur-md animate-in fade-in duration-700">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-400/20 to-green-500/20 border border-amber-400/50 shadow-2xl">
            <Sprout className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <h3 className="font-display text-2xl font-extrabold text-white mb-2">
              Got a chance to water the plant at your home!
            </h3>
            <p className="text-sm text-amber-200 font-semibold">
              You maintained a perfect 7-day streak.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
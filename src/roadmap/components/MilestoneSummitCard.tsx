import React from 'react';
import { Award, CheckCircle2, Lock, RotateCcw, Sparkles } from 'lucide-react';
import { NodePosition } from '../types';
import { MilestoneParticles } from './MilestoneParticles';
import { AstronautWalk } from './AstronautWalk';

interface MilestoneSummitCardProps {
  position: NodePosition;
  viewBoxWidth: number;
  viewBoxHeight: number;
  completedCount: number;
  totalCount: number;
  allCompleted: boolean;
  celebrateKey: number;
  reducedMotion: boolean;
  onResetProgress: () => void;
}

export const MilestoneSummitCard: React.FC<MilestoneSummitCardProps> = ({
  position,
  viewBoxWidth,
  viewBoxHeight,
  completedCount,
  totalCount,
  allCompleted,
  celebrateKey,
  reducedMotion,
  onResetProgress,
}) => {
  const leftPercent = (position.x / viewBoxWidth) * 100;
  const topPercent = (position.y / viewBoxHeight) * 100;
  const remaining = Math.max(0, totalCount - completedCount);
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const isHalfway = progressRatio >= 0.5 && !allCompleted;

  return (
    <div
      id="milestone-summit"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className="absolute z-30 w-[192px] sm:w-[244px] lg:w-[264px]"
    >
      {/* Subtle Localized Particle System triggered at 50% and 100% */}
      <MilestoneParticles
        progressRatio={progressRatio}
        reducedMotion={reducedMotion}
      />

      {/* Astronaut stepping out of the Grand Trophy Vault to the left & disappearing with confetti */}
      <AstronautWalk triggerKey={celebrateKey} reducedMotion={reducedMotion} />

      {allCompleted && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2.5 rounded-xl border-2 border-amber-300/75 bg-amber-300/25 blur-[10px] animate-gold-aura"
        />
      )}

      {isHalfway && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1.5 rounded-xl border border-amber-200/45 bg-sky-300/10 blur-[8px] animate-gold-aura"
        />
      )}

      <div
        className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
          allCompleted
            ? 'oat-completed-surface border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.65),0_0_40px_rgba(250,204,21,0.5)]'
            : isHalfway
              ? 'bg-white/[0.15] backdrop-blur-md bg-gradient-to-br from-amber-200/[0.2] via-white/[0.1] to-sky-200/[0.06] border-[1.5px] border-white shadow-[0_0_26px_rgba(255,255,255,0.44),0_0_22px_rgba(250,204,21,0.28),inset_0_1px_0_rgba(255,255,255,0.55)]'
              : 'bg-white/[0.11] backdrop-blur-md bg-gradient-to-br from-white/[0.18] via-white/[0.07] to-white/[0.03] border-[1.5px] border-white/85 shadow-[0_0_22px_rgba(255,255,255,0.34),inset_0_1px_0_rgba(255,255,255,0.48)]'
        }`}
      >
        {allCompleted && (
          <>
            <div
              aria-hidden="true"
              className="h-[3px] w-full bg-gradient-to-r from-[#F59E0B] via-[#FEF08A] to-[#F59E0B]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-amber-300/35 to-transparent animate-gold-sheen"
            />
          </>
        )}

        <div className="relative p-3 sm:p-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 ${
                allCompleted
                  ? 'border-[#B45309] bg-[#F5B82E] text-[#06132B]'
                  : isHalfway
                    ? 'border-[#FDE047]/80 bg-amber-300/20 text-[#FEF08A]'
                    : 'border-white/70 bg-white/15 text-white'
              }`}
            >
              {allCompleted ? (
                <Award className="h-5 w-5" aria-hidden="true" />
              ) : isHalfway ? (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Lock className="h-4 w-4" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <div
                className={`font-mono text-[11px] font-extrabold ${
                  allCompleted
                    ? 'text-[#B45309]'
                    : isHalfway
                      ? 'text-[#FDE047]'
                      : 'text-sky-100'
                }`}
              >
                {completedCount}/{totalCount} CLEARED
              </div>
              <h2
                className={`font-display text-sm sm:text-base font-extrabold truncate ${
                  allCompleted ? 'text-[#07142E]' : 'text-white'
                }`}
              >
                Grand Trophy Vault
              </h2>
            </div>
          </div>

          <p
            className={`mt-2 text-xs leading-relaxed ${
              allCompleted ? 'text-[#07142E] font-semibold' : 'text-white/85'
            }`}
          >
            {allCompleted
              ? 'You are ready for the day! All stages are complete and blazing with shooting fiber power.'
              : isHalfway
                ? `Halfway charge reached — ${remaining} ${remaining === 1 ? 'stage' : 'stages'} left to unlock.`
                : `${remaining} ${remaining === 1 ? 'stage' : 'stages'} left to unlock the golden trophy.`}
          </p>

          {allCompleted && (
            <div className="mt-3 flex items-center justify-between gap-2 pt-2.5 border-t border-[#07142E]/15">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#B45309]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Unlocked!</span>
              </span>
              <button
                type="button"
                onClick={onResetProgress}
                className="inline-flex items-center gap-1 rounded-[5px] bg-[#0B1F47] px-2.5 py-1.5 text-[11px] font-bold text-[#FFFDF7] hover:bg-[#132E63] transition-colors cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Play Again</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

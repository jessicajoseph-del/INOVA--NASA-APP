import React from 'react';
import { Check, Lock, Star, Sparkles, ArrowRight } from 'lucide-react';
import { NodePosition, TaskNode } from '../types';

interface TaskRectCardProps {
  task: TaskNode;
  index: number;
  position: NodePosition;
  viewBoxWidth: number;
  viewBoxHeight: number;
  isSelected: boolean;
  isActiveFrontier: boolean;
  justUnlocked: boolean;
  freeUnlockMode: boolean;
  onSelect: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onSetStars: (taskId: string, stars: number) => void;
  onUnlockDirect: (taskId: string) => void;
}

export const TaskRectCard: React.FC<TaskRectCardProps> = ({
  task,
  index,
  position,
  viewBoxWidth,
  viewBoxHeight,
  isSelected,
  isActiveFrontier,
  justUnlocked,
  freeUnlockMode,
  onSelect,
  onToggleComplete,
  onSetStars,
  onUnlockDirect,
}) => {
  const leftPercent = (position.x / viewBoxWidth) * 100;
  const topPercent = (position.y / viewBoxHeight) * 100;

  const isLocked = task.status === 'locked';
  const isUnlocked = task.status === 'unlocked';
  const isCompleted = task.status === 'completed';

  const completedSubtasks = task.subtasks.filter((s) => s.done).length;
  const totalSubtasks = task.subtasks.length;
  const stageNumber = String(index + 1).padStart(2, '0');

  return (
    <div
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className="absolute z-10 w-[170px] sm:w-[222px] lg:w-[244px]"
    >
      {/* Subtle Breathing Gold + White Luminous Aura on Unlocked Stage */}
      {isUnlocked && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2.5 rounded-xl border-2 border-amber-300/75 bg-amber-300/20 blur-[10px] animate-gold-aura"
        />
      )}

      {/* Bouncing Active Marker */}
      {isActiveFrontier && (
        <div className="pointer-events-none absolute -top-7 left-3 z-20 flex items-center gap-1 rounded-[5px] border border-white/90 bg-[#F5B82E] px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-[#06132B] shadow-[0_0_16px_rgba(255,255,255,0.45)] animate-marker-bob">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          <span>NEXT UP</span>
        </div>
      )}

      {/* Main Rectangular Card: All rectangles feature bright white luminous borders & glow */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(task.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(task.id);
          }
        }}
        aria-label={`Stage ${index + 1}: ${task.title}, status ${task.status}`}
        className={`group relative overflow-hidden rounded-lg text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer ${
          justUnlocked ? 'animate-unlock-pop' : ''
        } ${
          isUnlocked
            ? 'bg-[#FFFDF7] border-2 border-[#FACC15] ring-2 ring-white/95 shadow-[0_0_24px_rgba(255,255,255,0.6),0_0_38px_rgba(250,204,21,0.55),inset_0_0_14px_rgba(255,255,255,0.7)] hover:-translate-y-0.5'
            : isCompleted
              ? 'oat-completed-surface border-2 border-white/95 shadow-[0_0_24px_rgba(255,255,255,0.52),inset_0_0_18px_rgba(255,255,255,0.48)] hover:-translate-y-0.5'
              : 'bg-white/[0.11] backdrop-blur-md bg-gradient-to-br from-white/[0.18] via-white/[0.07] to-white/[0.03] border-[1.5px] border-white/85 shadow-[0_0_20px_rgba(255,255,255,0.34),inset_0_1px_0_rgba(255,255,255,0.48)] hover:bg-white/[0.16]'
        } ${isSelected ? 'outline-2 outline-offset-3 outline-sky-300' : ''}`}
      >
        {/* Subtle Gold + White Sheen Sweep across Unlocked Card */}
        {isUnlocked && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-amber-300/35 to-transparent animate-gold-sheen"
          />
        )}

        {/* Top Gold Highlight Bar for Unlocked */}
        {isUnlocked && (
          <div
            aria-hidden="true"
            className="h-[3px] w-full bg-gradient-to-r from-[#F59E0B] via-[#FEF08A] to-[#F59E0B]"
          />
        )}

        <div className="relative p-2.5 sm:p-3.5">
          {/* Row 1: Stage Number + 3 Interactive Stars */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-mono text-xs font-extrabold tracking-tight ${
                isUnlocked
                  ? 'text-[#B45309]'
                  : isCompleted
                    ? 'text-[#07142E]'
                    : 'text-white'
              }`}
            >
              STAGE {stageNumber}
            </span>

            <div
              className="flex items-center gap-0.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {[1, 2, 3].map((starNum) => {
                const filled = task.stars >= starNum;
                return (
                  <button
                    key={starNum}
                    type="button"
                    disabled={isLocked}
                    onClick={() => onSetStars(task.id, starNum)}
                    aria-label={`Set ${starNum} of 3 stars for ${task.title}`}
                    className={`p-0.5 rounded transition-transform duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 ${
                      isLocked
                        ? 'cursor-not-allowed opacity-65'
                        : 'hover:scale-125 cursor-pointer'
                    }`}
                  >
                    <Star
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                        filled
                          ? 'fill-[#F59E0B] text-[#B45309]'
                          : isLocked
                            ? 'fill-white/15 text-white/70'
                            : 'fill-[#EFE8D5] text-[#9A8B6F]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Task Title */}
          <h3
            className={`mt-1.5 font-display text-[13px] sm:text-[15px] font-bold leading-snug line-clamp-2 ${
              isLocked ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]' : 'text-[#07142E]'
            }`}
          >
            {task.title}
          </h3>

          {/* Row 3: Step Count */}
          <div
            className={`mt-1 font-mono text-[11px] font-semibold ${
              isLocked ? 'text-sky-100/85' : 'text-[#2C3C5B]'
            }`}
          >
            {completedSubtasks}/{totalSubtasks} steps
          </div>

          {/* Row 4: Direct On-Map Progress Action Button */}
          <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
            {isUnlocked && (
              <button
                type="button"
                onClick={() => onToggleComplete(task.id)}
                className="flex w-full items-center justify-center gap-1.5 rounded-[5px] bg-[#F5B82E] hover:bg-[#FACC15] border border-[#D97706] border-b-[3px] border-b-[#B45309] px-3 py-1.5 text-xs font-extrabold text-[#06132B] transition-all duration-100 active:translate-y-[1px] active:border-b-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06132B] cursor-pointer whitespace-nowrap"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                <span>Mark Done</span>
              </button>
            )}

            {isCompleted && (
              <button
                type="button"
                onClick={() => onToggleComplete(task.id)}
                className="flex w-full items-center justify-center gap-1.5 rounded-[5px] bg-[#0B1F47] hover:bg-[#132E63] border border-white/40 border-b-[3px] border-b-[#040B1B] px-3 py-1.5 text-xs font-bold text-[#FFFDF7] transition-all duration-100 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer whitespace-nowrap"
              >
                <Check className="h-3.5 w-3.5 text-[#FDE047] stroke-[3]" aria-hidden="true" />
                <span>Completed</span>
              </button>
            )}

            {isLocked && (
              <button
                type="button"
                disabled={!freeUnlockMode}
                onClick={() => {
                  if (freeUnlockMode) onUnlockDirect(task.id);
                }}
                className={`flex w-full items-center justify-center gap-1.5 rounded-[5px] border px-3 py-1.5 text-xs font-bold transition-colors duration-150 whitespace-nowrap ${
                  freeUnlockMode
                    ? 'bg-white/20 border-white/75 text-white hover:bg-white/30 cursor-pointer'
                    : 'bg-white/10 border-white/40 text-white/85 cursor-not-allowed'
                }`}
              >
                {freeUnlockMode ? (
                  <>
                    <ArrowRight className="h-3.5 w-3.5 text-[#FDE047]" aria-hidden="true" />
                    <span>Unlock Stage</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    <span>Locked</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

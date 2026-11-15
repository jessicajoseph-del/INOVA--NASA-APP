import React from 'react';
import {
  Award,
  Check,
  Clock,
  Lock,
  RotateCcw,
  Star,
  Unlock,
  Volume2,
  VolumeX,
  FileBarChart2,
  ArrowRight,
} from 'lucide-react';
import { TaskNode } from '../types';

interface TaskInspectorRailProps {
  tasks: TaskNode[];
  selectedTask: TaskNode | null;
  selectedIndex: number;
  freeUnlockMode: boolean;
  soundEnabled: boolean;
  onToggleFreeUnlock: () => void;
  onToggleSound: () => void;
  onResetProgress: () => void;
  onToggleComplete: (taskId: string) => void;
  onUnlockDirect: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenReport?: () => void;
}

export const TaskInspectorRail: React.FC<TaskInspectorRailProps> = ({
  tasks,
  selectedTask,
  selectedIndex,
  freeUnlockMode,
  soundEnabled,
  onToggleFreeUnlock,
  onToggleSound,
  onResetProgress,
  onToggleComplete,
  onUnlockDirect,
  onToggleSubtask,
  onOpenReport,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalStars = tasks.reduce((acc, t) => acc + t.stars, 0);
  const maxStars = totalTasks * 3;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isSelectedLocked = selectedTask?.status === 'locked';
  const isSelectedCompleted = selectedTask?.status === 'completed';

  const formattedCompletedAt = (() => {
    if (!selectedTask?.completedAt) return null;
    const parsed = new Date(selectedTask.completedAt);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  })();

  return (
    <aside className="w-full lg:w-[376px] xl:w-[396px] shrink-0 p-4 sm:p-5 lg:p-6 bg-[#06132B] lg:border-l border-white/15 flex flex-col gap-5">
      {/* Oat Ivory Game Score & Controls Panel with Bright White Luminous Border */}
      <div className="rounded-lg bg-[#F7F3E9] border-[1.5px] border-white shadow-[0_0_22px_rgba(255,255,255,0.32)] p-5 text-[#07142E]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#0B1F47] text-[#FDE047]">
              <Award className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 className="font-display text-base font-extrabold text-[#07142E]">
              Journey Score
            </h2>
          </div>
          <span className="font-mono text-base font-extrabold text-[#B45309]">
            {completionPct}%
          </span>
        </div>

        {/* Playful Game Progress Bar */}
        <div className="mt-3.5 h-3 w-full overflow-hidden rounded-[4px] bg-[#DFD7C5] border border-[#C7BDA8]">
          <div
            className="h-full bg-gradient-to-r from-[#22D3EE] via-[#FACC15] to-[#F472B6] transition-all duration-300"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Unboxed Tabular Stats */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono font-bold text-[#334155]">
          <span>
            {completedTasks}/{totalTasks} Stages
          </span>
          <span className="inline-flex items-center gap-1 text-[#B45309]">
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#B45309]" aria-hidden="true" />
            {totalStars}/{maxStars} Stars
          </span>
        </div>

        {/* Game Controls */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onToggleFreeUnlock}
            aria-pressed={freeUnlockMode}
            className={`flex items-center justify-center gap-1 rounded-[5px] border px-2 py-2 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              freeUnlockMode
                ? 'bg-[#F5B82E] border-[#B45309] border-b-[3px] text-[#06132B]'
                : 'bg-[#EDE6D6] border-[#C5B9A2] border-b-[3px] border-b-[#ACA088] text-[#1E293B] hover:bg-[#E5DEC9]'
            }`}
          >
            <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{freeUnlockMode ? 'Free Play' : 'In Order'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            className="flex items-center justify-center gap-1 rounded-[5px] bg-[#EDE6D6] border border-[#C5B9A2] border-b-[3px] border-b-[#ACA088] px-2 py-2 text-[11px] font-bold text-[#1E293B] hover:bg-[#E5DEC9] transition-all cursor-pointer whitespace-nowrap"
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-[#0B1F47]" aria-hidden="true" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-[#64748B]" aria-hidden="true" />
            )}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          <button
            type="button"
            onClick={onResetProgress}
            className="flex items-center justify-center gap-1 rounded-[5px] bg-[#EDE6D6] border border-[#C5B9A2] border-b-[3px] border-b-[#ACA088] px-2 py-2 text-[11px] font-bold text-[#1E293B] hover:bg-[#E5DEC9] hover:text-[#991B1B] transition-all cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Selected Stage Quest Card matching map state aesthetics */}
      {selectedTask && (
        <div
          className={`rounded-lg p-5 transition-all ${
            selectedTask.status === 'unlocked'
              ? 'bg-[#FFFDF7] border-2 border-[#FACC15] ring-2 ring-white/95 shadow-[0_0_24px_rgba(255,255,255,0.45),0_0_32px_rgba(250,204,21,0.4)] text-[#07142E]'
              : isSelectedCompleted
                ? 'oat-completed-surface border-2 border-white/95 shadow-[0_0_24px_rgba(255,255,255,0.45)] text-[#07142E]'
                : 'bg-[#FFFDF7] border-[1.5px] border-[#06132B]/20 shadow-[0_4px_20px_rgba(6,19,43,0.08)] text-[#06132B]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-mono text-xs font-extrabold ${
                isSelectedLocked ? 'text-[#1E3A8A]' : 'text-[#B45309]'
              }`}
            >
              STAGE {String(selectedIndex + 1).padStart(2, '0')}
            </span>

            <span
              className={`font-mono text-xs font-bold ${
                isSelectedLocked ? 'text-[#1E3A8A]' : 'text-[#334155]'
              }`}
            >
              {selectedTask.status === 'unlocked'
                ? 'Active Now'
                : isSelectedCompleted
                  ? 'Cleared'
                  : 'Locked'}
            </span>
          </div>

          <h3
            className={`mt-1.5 font-display text-lg font-extrabold ${
              isSelectedLocked ? 'text-[#06132B]' : 'text-[#07142E]'
            }`}
          >
            {selectedTask.title}
          </h3>

          <p
            className={`mt-1.5 text-xs leading-relaxed ${
              isSelectedLocked ? 'text-[#1E3A8A]' : 'text-[#1E293B]'
            }`}
          >
            {selectedTask.description}
          </p>

          {isSelectedCompleted && formattedCompletedAt && (
            <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#92400E]">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Completed {formattedCompletedAt}</span>
            </div>
          )}

          {/* Clickable Game Objectives */}
          <div
            className={`mt-4 pt-3.5 border-t ${
              isSelectedLocked ? 'border-[#06132B]/15' : 'border-[#07142E]/15'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-extrabold ${
                  isSelectedLocked ? 'text-[#06132B]' : 'text-[#07142E]'
                }`}
              >
                Stage Objectives
              </span>
              <span
                className={`font-mono text-[11px] font-bold ${
                  isSelectedLocked ? 'text-[#1E3A8A]' : 'text-[#334155]'
                }`}
              >
                {(selectedTask.subtasks || []).filter((s) => s.done).length}/
                {(selectedTask.subtasks || []).length}
              </span>
            </div>

            <div className="space-y-2">
              {(selectedTask.subtasks || []).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  disabled={isSelectedLocked}
                  onClick={() => onToggleSubtask(selectedTask.id, sub.id)}
                  className={`flex w-full items-center gap-2.5 rounded-[5px] border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    isSelectedLocked
                      ? 'bg-[#06132B]/8 border-[#06132B]/20 text-[#06132B]/80 cursor-not-allowed'
                      : sub.done
                        ? 'bg-[#EFE8D6]/90 border-[#D4C8AE] text-[#334155] cursor-pointer'
                        : 'bg-[#FFFDF8]/95 border-[#D8CEB8] text-[#07142E] hover:border-[#EAB308] cursor-pointer'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                      sub.done
                        ? 'border-[#B45309] bg-[#F5B82E] text-[#06132B]'
                        : isSelectedLocked
                          ? 'border-[#06132B]/30 bg-[#06132B]/10'
                          : 'border-[#94A3B8] bg-white'
                    }`}
                  >
                    {sub.done && (
                      <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                    )}
                  </span>
                  <span className={sub.done ? 'line-through text-[#64748B]' : 'text-[#07142E]'}>{sub.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Stage Action */}
          <div className="mt-4">
            {isSelectedLocked ? (
              <button
                type="button"
                disabled={!freeUnlockMode}
                onClick={() => {
                  if (freeUnlockMode) onUnlockDirect(selectedTask.id);
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-[5px] border px-4 py-2.5 text-sm font-extrabold transition-all whitespace-nowrap ${
                  freeUnlockMode
                    ? 'bg-[#06132B]/15 border-[#06132B]/40 text-[#06132B] hover:bg-[#06132B]/25 cursor-pointer'
                    : 'bg-[#06132B]/10 border-[#06132B]/25 text-[#06132B]/80 cursor-not-allowed'
                }`}
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                <span>
                  {freeUnlockMode ? 'Unlock Stage Now' : 'Clear Previous Stage First'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleComplete(selectedTask.id)}
                className={`flex w-full items-center justify-center gap-2 rounded-[5px] px-4 py-2.5 text-sm font-extrabold transition-all active:translate-y-[1px] cursor-pointer whitespace-nowrap ${
                  selectedTask.status === 'unlocked'
                    ? 'bg-[#F5B82E] hover:bg-[#FACC15] border border-[#D97706] border-b-[4px] border-b-[#B45309] text-[#06132B]'
                    : 'bg-[#0B1F47] hover:bg-[#132E63] border border-white/45 border-b-[4px] border-b-[#040B1B] text-[#FFFDF7]'
                }`}
              >
                <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                <span>
                  {selectedTask.status === 'unlocked' ? 'Complete Stage' : 'Replay Stage'}
                </span>
              </button>
            )}

            {/* Direct Link to Assessment Report */}
            {onOpenReport &&
              (selectedTask.id === 'stage-8' ||
                selectedTask.description.toLowerCase().includes('assessment') ||
                selectedTask.title.toLowerCase().includes('medical support')) && (
                <button
                  type="button"
                  onClick={onOpenReport}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#145252] hover:bg-[#0F3F3F] border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <FileBarChart2 className="h-4 w-4 text-[#FDE047]" aria-hidden="true" />
                  <span>Click to Open Assessment Report</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
          </div>
        </div>
      )}
    </aside>
  );
};

import React, { useMemo } from 'react';
import { AlertCircle, CheckCircle2, Lock, Star } from 'lucide-react';
import { TaskNode } from '../types';

interface CollapsedRoadmapViewProps {
  tasks: TaskNode[];
  onSelectTask: (taskId: string) => void;
}

export const CollapsedRoadmapView: React.FC<CollapsedRoadmapViewProps> = ({ tasks, onSelectTask }) => {
  const highestCompletedIndex = tasks.reduce(
    (max, task, idx) => (task.status === 'completed' ? Math.max(max, idx) : max),
    -1
  );

  // Generate deterministic "random" transforms for each card to create a scattered pile
  const cardTransforms = useMemo(() => {
    return tasks.map((_, i) => {
      // Deterministic pseudo-randomness using sine/cosine of the index
      const rotate = Math.sin(i * 12.9898) * 45; // -45deg to 45deg
      const offsetX = Math.cos(i * 78.233) * 160; // -160px to 160px spread X
      const offsetY = Math.sin(i * 43.111) * 80; // -80px to 80px spread Y
      return { rotate, offsetX, offsetY };
    });
  }, [tasks.length]);

  return (
    <div className="mx-auto w-full max-w-[900px] relative z-10 flex flex-col items-center">
      <h2 className="font-display text-[22px] font-extrabold text-white mb-12 tracking-wide text-center">
        Task Deck
      </h2>

      {/* Scattered Deck Container */}
      <div className="relative w-full max-w-[600px] h-[350px] flex items-center justify-center">
        {tasks.map((task, index) => {
          const transform = cardTransforms[index];
          const isMissed = index < highestCompletedIndex && task.status !== 'completed';
          const isCompleted = task.status === 'completed';
          const isLocked = task.status === 'locked';

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className="group absolute cursor-pointer transition-all duration-300 ease-out hover:z-50"
              style={{
                transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) rotate(${transform.rotate}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {/* Playing Card Shape */}
              <div
                className={`w-[140px] h-[196px] sm:w-[160px] sm:h-[224px] rounded-xl border-2 flex flex-col p-3 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-[${transform.rotate}deg] ${
                  isMissed
                    ? 'bg-[#1a0808] border-red-500/80 shadow-red-900/40'
                    : isCompleted
                    ? 'bg-[#FFFDF7] border-[#FACC15]'
                    : isLocked
                    ? 'bg-[#0B1F47] border-[#1C325A]'
                    : 'bg-[#FFFDF7] border-sky-400/80 shadow-sky-900/30'
                }`}
                style={{
                  // Counter-rotate on hover to straighten the card out
                  transform: 'rotate(0deg)',
                }}
                // Injecting dynamic counter-rotation via hover relies on the wrapper handling the base transform
                // and the inner div resetting its own visual angle via a CSS trick or standard group-hover.
                // We handle the straighten-out effect by neutralizing the wrapper's rotation via a negative rotation inside,
                // but standard CSS approach:
              >
                {/* Inner counter-rotation wrapper for hover */}
                <div
                  className="absolute inset-0 rounded-xl transition-transform duration-300 ease-out flex flex-col p-3"
                  style={{ transform: 'rotate(0deg)' }}
                  onMouseEnter={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.style.transform = `translate(${transform.offsetX}px, ${transform.offsetY - 20}px) rotate(0deg) scale(1.15)`;
                      parent.style.zIndex = '50';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.style.transform = `translate(${transform.offsetX}px, ${transform.offsetY}px) rotate(${transform.rotate}deg) scale(1)`;
                      parent.style.zIndex = String(index);
                    }
                  }}
                >
                  {/* Card Corner (Top Left) */}
                  <div className="flex flex-col items-center self-start">
                    <span className={`text-[10px] font-mono font-extrabold ${isMissed ? 'text-red-400' : isCompleted || !isLocked ? 'text-[#07142E]' : 'text-sky-200/50'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {isMissed ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" strokeWidth={3} />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5" strokeWidth={3} />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-sky-200/40 mt-0.5" strokeWidth={2} />
                    ) : (
                      <Star className="w-3.5 h-3.5 text-sky-500 mt-0.5" strokeWidth={3} />
                    )}
                  </div>

                  {/* Card Center Content */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
                    {isMissed && (
                      <span className="text-[9px] font-extrabold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider mb-2">
                        Missed
                      </span>
                    )}
                    <h3 className={`font-display text-[13px] sm:text-[14px] font-bold leading-tight line-clamp-4 ${
                      isMissed ? 'text-red-100' : isLocked ? 'text-white/60' : 'text-[#07142E]'
                    }`}>
                      {task.title}
                    </h3>
                  </div>

                  {/* Card Corner (Bottom Right - Inverted) */}
                  <div className="flex flex-col items-center self-end rotate-180">
                    <span className={`text-[10px] font-mono font-extrabold ${isMissed ? 'text-red-400' : isCompleted || !isLocked ? 'text-[#07142E]' : 'text-sky-200/50'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {isMissed ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" strokeWidth={3} />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B] mt-0.5" strokeWidth={3} />
                    ) : isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-sky-200/40 mt-0.5" strokeWidth={2} />
                    ) : (
                      <Star className="w-3.5 h-3.5 text-sky-500 mt-0.5" strokeWidth={3} />
                    )}
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
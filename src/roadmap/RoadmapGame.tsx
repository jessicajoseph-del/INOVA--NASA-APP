import React, { useEffect, useMemo, useRef, useState } from 'react';
import { INITIAL_TASKS } from './data/initialTasks';
import { TaskNode } from './types';
import { buildMapGeometry } from './utils/pathGeometry';
import { playStepTick, playUnlockChime, playVictoryFanfare } from './utils/soundFx';
import { FiberOpticRoad } from './components/FiberOpticRoad';
import { TaskRectCard } from './components/TaskRectCard';
import { MilestoneSummitCard } from './components/MilestoneSummitCard';
import { TaskInspectorRail } from './components/TaskInspectorRail';
import { ConfettiBurst } from './components/ConfettiBurst';
import { CollapsedRoadmapView } from './components/CollapsedRoadmapView';
import { WeeklyPuzzle } from './components/WeeklyPuzzle';

const STORAGE_KEY = 'lumina-quest-stages-v3';

function isValidTaskNode(node: unknown): node is TaskNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'id' in node &&
    'title' in node &&
    'status' in node
  );
}

function loadInitialTasks(): TaskNode[] {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length === INITIAL_TASKS.length &&
      parsed.every(isValidTaskNode) &&
      typeof parsed[0]?.title === 'string' &&
      parsed[0].title.includes('Urine Test')
    ) {
      return parsed.map((t: TaskNode) => ({
        ...t,
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
      }));
    }
  } catch {
    // Fallback to initial stages
  }
  return INITIAL_TASKS;
}

interface RoadmapGameProps {
  onBack?: () => void;
  isEmbedded?: boolean;
  onOpenReport?: () => void;
}

export default function RoadmapGame({
  onBack,
  isEmbedded = false,
  onOpenReport,
}: RoadmapGameProps = {}) {
  const [tasks, setTasks] = useState<TaskNode[]>(loadInitialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(() => {
    const initial = loadInitialTasks();
    const firstUnlocked = initial.find((t) => t.status === 'unlocked');
    return firstUnlocked?.id ?? initial[0]?.id ?? '';
  });

  const [freeUnlockMode, setFreeUnlockMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [surgingSegment, setSurgingSegment] = useState<number | null>(null);
  const [justUnlockedId, setJustUnlockedId] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('lumina-streak-days');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const surgeTimerRef = useRef<number | null>(null);
  const unlockAnimTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (surgeTimerRef.current) window.clearTimeout(surgeTimerRef.current);
      if (unlockAnimTimerRef.current) window.clearTimeout(unlockAnimTimerRef.current);
    };
  }, []);

  const geometry = useMemo(() => buildMapGeometry(tasks.length), [tasks.length]);

  const activeFrontierIndex = useMemo(() => {
    const firstUnlocked = tasks.findIndex((t) => t.status === 'unlocked');
    if (firstUnlocked !== -1) return firstUnlocked;
    const firstLocked = tasks.findIndex((t) => t.status === 'locked');
    return firstLocked !== -1 ? firstLocked : tasks.length - 1;
  }, [tasks]);

  useEffect(() => {
    const container = mapViewportRef.current;
    const pos = geometry.taskPositions[activeFrontierIndex];
    if (!container || !pos) return;
    const timer = window.setTimeout(() => {
      const ratio = pos.y / geometry.viewBoxHeight;
      if (container.scrollHeight > container.clientHeight + 20) {
        const targetTop = ratio * container.scrollHeight - container.clientHeight * 0.42;
        container.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'auto',
        });
      }
    }, 60);
    return () => window.clearTimeout(timer);
    // Center on initial active stage on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedIndex = useMemo(
    () => tasks.findIndex((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const selectedTask = selectedIndex >= 0 ? tasks[selectedIndex] : tasks[0] ?? null;

  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === 'completed').length,
    [tasks]
  );
  const totalStars = useMemo(
    () => tasks.reduce((acc, t) => acc + t.stars, 0),
    [tasks]
  );
  const allCompleted = tasks.length > 0 && completedCount === tasks.length;

  const triggerUnlockEffects = (segmentIdx: number, unlockedId: string | null) => {
    if (surgeTimerRef.current) window.clearTimeout(surgeTimerRef.current);
    if (unlockAnimTimerRef.current) window.clearTimeout(unlockAnimTimerRef.current);

    setSurgingSegment(segmentIdx);
    surgeTimerRef.current = window.setTimeout(() => {
      setSurgingSegment(null);
    }, 700);

    if (unlockedId) {
      setJustUnlockedId(unlockedId);
      unlockAnimTimerRef.current = window.setTimeout(() => {
        setJustUnlockedId(null);
      }, 650);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;
    const target = tasks[idx];
    if (target.status === 'locked') return;

    if (target.status === 'unlocked') {
      let newlyUnlockedId: string | null = null;
      const nextTasks = tasks.map((t, i) => {
        if (i === idx) {
          return {
            ...t,
            status: 'completed' as const,
            stars: Math.max(t.stars, 3),
            subtasks: (t.subtasks || []).map((s) => ({ ...s, done: true })),
            completedAt: new Date().toISOString(),
          };
        }
        if (i === idx + 1 && t.status === 'locked') {
          newlyUnlockedId = t.id;
          return { ...t, status: 'unlocked' as const };
        }
        return t;
      });

      const allDoneNow = nextTasks.length > 0 && nextTasks.every((t) => t.status === 'completed');

      setTasks(nextTasks);
      if (newlyUnlockedId) {
        setSelectedTaskId(newlyUnlockedId);
      } else {
        setSelectedTaskId(target.id);
      }

      if (allDoneNow) {
        if (!allCompleted) {
          setStreakDays((prev) => {
            const next = Math.min(prev + 1, 7);
            try { localStorage.setItem('lumina-streak-days', String(next)); } catch {}
            return next;
          });
        }
        setConfettiTrigger((c) => c + 1);
        playVictoryFanfare(soundEnabled);
        window.setTimeout(() => {
          if (mapViewportRef.current) {
            mapViewportRef.current.scrollTo({
              top: mapViewportRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }
        }, 120);
      } else {
        playUnlockChime(soundEnabled);
      }
      triggerUnlockEffects(idx, newlyUnlockedId);
    } else if (target.status === 'completed') {
      const nextTasks = tasks.map((t, i) => {
        if (i === idx) {
          return {
            ...t,
            status: 'unlocked' as const,
            completedAt: undefined,
          };
        }
        return t;
      });
      setTasks(nextTasks);
      setSelectedTaskId(target.id);
      playStepTick(soundEnabled);
    }
  };

  const handleUnlockDirect = (taskId: string) => {
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'unlocked' } : t))
    );
    setSelectedTaskId(taskId);
    playUnlockChime(soundEnabled);
    triggerUnlockEffects(Math.max(0, idx - 1), taskId);
  };

  const handleSetStars = (taskId: string, stars: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || t.status === 'locked') return t;
        const nextStars = t.stars === stars ? Math.max(0, stars - 1) : stars;
        return { ...t, stars: nextStars };
      })
    );
    playStepTick(soundEnabled);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || t.status === 'locked') return t;
        const updatedSubs = (t.subtasks || []).map((s) =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        );
        const doneCount = updatedSubs.filter((s) => s.done).length;
        const ratioStars =
          updatedSubs.length > 0
            ? Math.round((doneCount / updatedSubs.length) * 3)
            : t.stars;
        return {
          ...t,
          subtasks: updatedSubs,
          stars: t.status === 'completed' ? Math.max(t.stars, 3) : ratioStars,
        };
      })
    );
    playStepTick(soundEnabled);
  };

  const handleResetProgress = () => {
    const resetTasks = tasks.map((t, idx) => ({
      ...t,
      status: idx === 0 ? ('unlocked' as const) : ('locked' as const),
      stars: 0,
      subtasks: (t.subtasks || []).map((s) => ({ ...s, done: false })),
      completedAt: undefined,
    }));
    setTasks(resetTasks);
    if (resetTasks[0]) {
      setSelectedTaskId(resetTasks[0].id);
    }
    playStepTick(soundEnabled);
    window.setTimeout(() => {
      if (mapViewportRef.current) {
        mapViewportRef.current.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }, 60);
  };

  const scrollToStage = (stageIndex: number) => {
    const pos = geometry.taskPositions[stageIndex];
    if (!pos) return;

    const mapCanvas = mapViewportRef.current;
    if (mapCanvas) {
      const mapRect = mapCanvas.getBoundingClientRect();
      const ratio = pos.y / geometry.viewBoxHeight;
      const targetScrollY =
        window.scrollY + mapRect.top + ratio * mapCanvas.offsetHeight - window.innerHeight * 0.4;
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth',
      });
      return;
    }

    const container = mapViewportRef.current;
    if (!container) return;
    if (container.scrollHeight > container.clientHeight + 20) {
      const ratio = pos.y / geometry.viewBoxHeight;
      const targetTop = ratio * container.scrollHeight - container.clientHeight * 0.45;
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });
    }
  };

  const scrollToSummit = () => {
    const summit = document.getElementById('milestone-summit');
    if (summit) {
      summit.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const scrollToBase = () => {
    const base = document.getElementById('map-canvas');
    if (base) {
      base.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToCurrent = () => {
    const currentTask = tasks[activeFrontierIndex];
    if (currentTask) {
      setSelectedTaskId(currentTask.id);
    }
    scrollToStage(activeFrontierIndex);
  };

  return (
    <div className={isEmbedded ? "w-full flex flex-col bg-[#F7F4EE] text-[#0B1736] rounded-2xl border border-[#DCD5C7] shadow-xl" : "min-h-screen flex flex-col bg-[#F7F4EE] text-[#0B1736]"}>
      <ConfettiBurst triggerKey={confettiTrigger} reducedMotion={reducedMotion} />
      {/* 3-Zone Playful Game Top Bar (Ink Blue Header on Oat Ivory Canvas) */}
      <header className={`${isEmbedded ? 'relative' : 'sticky top-0'} z-30 flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 h-16 border-b border-[#DCD5C7] bg-[#0B1736] text-[#F7F4EE] backdrop-blur-md`}>
        {/* Zone 1: Game Wordmark & Optional Standalone Return Navigation */}
        <div className="flex items-center gap-3 shrink-0">
          {!isEmbedded && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95"
              title="Return to Telemetry Dashboard"
            >
              <span>← Back to Telemetry</span>
            </button>
          )}
          <a
            href="#map-canvas"
            onClick={(e) => {
              e.preventDefault();
              handleJumpToCurrent();
            }}
            className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#F7F3E9] whitespace-nowrap shrink-0 hover:text-[#FDE047] transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Lumina Quest Roadmap</span>
          </a>
        </div>

        {/* Zone 2: Clean Game Navigation & Live Tabular HUD */}
        <nav
          aria-label="Game map navigation"
          className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#F7F3E9]/85"
        >
          <button
            type="button"
            onClick={scrollToBase}
            className="whitespace-nowrap shrink-0 hover:text-[#FDE047] transition-colors cursor-pointer"
          >
            Start Base
          </button>
          <button
            type="button"
            onClick={scrollToSummit}
            className="whitespace-nowrap shrink-0 hover:text-[#FDE047] transition-colors cursor-pointer"
          >
            Trophy Vault
          </button>
          <span className="font-mono text-xs text-sky-200/90 whitespace-nowrap shrink-0">
            Stages {completedCount}/{tasks.length}
          </span>
          <span className="font-mono text-xs text-[#FDE047] whitespace-nowrap shrink-0">
            Stars {totalStars}/{tasks.length * 3}
          </span>
        </nav>

        {/* Zone 3: Primary Game Focus CTA */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleJumpToCurrent}
            className="rounded-[5px] bg-[#F5B82E] hover:bg-[#FACC15] border border-[#D97706] border-b-[3px] border-b-[#B45309] px-4 py-1.5 text-xs font-extrabold text-[#06132B] transition-all active:translate-y-[1px] whitespace-nowrap shrink-0 cursor-pointer shadow-sm hover:shadow-amber-500/30"
          >
            Jump to Active
          </button>
        </div>
      </header>

      {/* Main 2-Column Game Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 items-start">
        {/* Ink-Blue Winding Fiber-Optic Game Map */}
        <main
          id="map-canvas"
          ref={mapViewportRef}
          className="relative flex-1 ink-canvas-bg w-full px-2 sm:px-6 lg:px-10 py-6 sm:py-10"
        >
          {/* Playful Header Banner */}
          <div className="mx-auto max-w-[900px] mb-5 flex flex-wrap items-center justify-between gap-3 px-2">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-[#06132B]">
                Starlight Circuit Map
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#1E3A8A]">
                Start at the unlocked top stage and mark progress directly on the map to fire shooting fiber currents downward.
              </p>
            </div>

            {/* Crisp Luminous Key */}
            <div className="flex items-center gap-4 text-xs font-semibold text-[#06132B]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-4 rounded-[3px] border-2 border-[#FACC15] ring-1 ring-white bg-[#FFFDF7] shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                Unlocked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-4 rounded-[3px] border border-white oat-completed-surface shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                Completed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-4 rounded-[3px] border border-white/85 bg-white/15 backdrop-blur-sm shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                Locked
              </span>
            </div>
          </div>

            {/* Pre Flight Recommendation */}
          <div className="mx-auto max-w-[900px] mb-8 px-2">
            <div className="bg-white/40 backdrop-blur-sm border border-[#06132B]/10 rounded-xl p-4 shadow-sm">
              <h2 className="font-display text-[15px] sm:text-base font-bold text-[#06132B] mb-2 uppercase tracking-wide">
                Pre Flight Recommendation
              </h2>
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#1E3A8A] font-medium">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#F5B82E] shadow-[0_0_4px_#F5B82E]"></span>
                  Multivitamin
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#F5B82E] shadow-[0_0_4px_#F5B82E]"></span>
                  Nutrient-food
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#F5B82E] shadow-[0_0_4px_#F5B82E]"></span>
                  Prescribed drugs
                </li>
              </ul>
            </div>
          </div>

          {/* Winding Map Stage */}
          <div
            className="relative mx-auto w-full max-w-[900px]"
            style={{
              aspectRatio: `${geometry.viewBoxWidth} / ${geometry.viewBoxHeight}`,
              minHeight: `${(tasks.length + 1) * 144}px`,
            }}
          >
            {/* High-Intensity Fast Fiber-Optic Road */}
            <FiberOpticRoad
              geometry={geometry}
              tasks={tasks}
              surgingSegment={surgingSegment}
              reducedMotion={reducedMotion}
            />

            {/* Bottom Summit Trophy Vault */}
            <MilestoneSummitCard
              position={geometry.milestonePosition}
              viewBoxWidth={geometry.viewBoxWidth}
              viewBoxHeight={geometry.viewBoxHeight}
              completedCount={completedCount}
              totalCount={tasks.length}
              allCompleted={allCompleted}
              celebrateKey={confettiTrigger}
              reducedMotion={reducedMotion}
              onResetProgress={handleResetProgress}
            />

            {/* Rectangular Oat-Ivory Game Stage Cards */}
            {tasks.map((task, idx) => {
              const pos = geometry.taskPositions[idx];
              if (!pos) return null;

              return (
                <TaskRectCard
                  key={task.id}
                  task={task}
                  index={idx}
                  position={pos}
                  viewBoxWidth={geometry.viewBoxWidth}
                  viewBoxHeight={geometry.viewBoxHeight}
                  isSelected={selectedTask?.id === task.id}
                  isActiveFrontier={idx === activeFrontierIndex && task.status === 'unlocked'}
                  justUnlocked={justUnlockedId === task.id}
                  freeUnlockMode={freeUnlockMode}
                  onSelect={setSelectedTaskId}
                  onToggleComplete={handleToggleComplete}
                  onSetStars={handleSetStars}
                  onUnlockDirect={handleUnlockDirect}
                />
              );
            })}

            {geometry.taskPositions[0] && (
              <aside
                aria-label="Stage 1 briefing"
                className="absolute z-20 hidden flex-col gap-3 rounded-xl border border-amber-400/50 bg-[#F7F3E9]/95 p-3 text-[#12233B] shadow-lg md:flex lg:hidden xl:flex"
                style={{
                  left: `calc(${(geometry.taskPositions[0].x / geometry.viewBoxWidth) * 100}% + 134px)`,
                  right: '12px',
                  top: `${(geometry.taskPositions[0].y / geometry.viewBoxHeight) * 100}%`,
                  transform: 'translateY(-50%)',
                }}
              >
                <h2 className="font-display text-xs font-extrabold tracking-wide text-[#12233B]">
                  STAGE 01 BRIEF
                </h2>
                <dl className="space-y-2.5 text-[11px] leading-snug">
                  <div>
                    <dt className="font-extrabold text-[#9A5B00]">WHY</dt>
                    <dd>Monitor hydration and electrolyte biomarkers in microgravity.</dd>
                  </div>
                  <div>
                    <dt className="font-extrabold text-[#9A5B00]">HOW</dt>
                    <dd>
                      Collect a midstream sample, check specific gravity, and transmit the results.{' '}
                      <a
                        href="/assets/aistudio/INOVA_Astronaut_Health_Monitoring_SOP_Manual_v0.1.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-800 underline underline-offset-2 hover:text-blue-600"
                      >
                        Open the SOP manual (PDF)
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-extrabold text-[#9A5B00]">WHAT</dt>
                    <dd>Complete the morning urine test between 06:00 and 06:10 AM.</dd>
                  </div>
                </dl>
              </aside>
            )}
          </div>
        </main>

        {/* Oat Ivory Companion Game Quest Panel */}
        <div
          className="w-full lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-sky-300/15 lg:sticky lg:top-24 self-start"
        >
          <TaskInspectorRail
            tasks={tasks}
            selectedTask={selectedTask}
            selectedIndex={selectedIndex}
            freeUnlockMode={freeUnlockMode}
            soundEnabled={soundEnabled}
            onToggleFreeUnlock={() => setFreeUnlockMode((v) => !v)}
            onToggleSound={() => setSoundEnabled((v) => !v)}
            onResetProgress={handleResetProgress}
            onToggleComplete={handleToggleComplete}
            onUnlockDirect={handleUnlockDirect}
            onToggleSubtask={handleToggleSubtask}
            onOpenReport={onOpenReport}
          />
        </div>
      </div>

      {/* Single Task Tracker (Task Deck) & Weekly Consistency Puzzle Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 border-t border-white/10 bg-[#06132B]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-start gap-8 xl:gap-12">
          <div className="relative z-20 min-w-0 w-full flex justify-center">
            <CollapsedRoadmapView
              tasks={tasks}
              onSelectTask={(id) => {
                setSelectedTaskId(id);
                const idx = tasks.findIndex((t) => t.id === id);
                if (idx >= 0) scrollToStage(idx);
              }}
            />
          </div>
          <div className="relative z-10 min-w-0 w-full flex justify-center">
            <WeeklyPuzzle streakDays={streakDays} />
          </div>
        </div>
      </section>
    </div>
  );
}
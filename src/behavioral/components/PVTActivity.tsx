import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Play, RotateCcw, Save, Square, Trash2 } from 'lucide-react';
import { PVTResult, PVTTrial } from '../types/assessment';

type Phase = 'idle' | 'waiting' | 'stimulus' | 'feedback' | 'finished';

const DURATION_MS = 180_000;
const LAPSE_MS = 355;
const FALSE_START_MS = 100;
const RESPONSE_TIMEOUT_MS = 10_000;

interface PVTActivityProps {
  savedResults: PVTResult[];
  onSaveResult: (result: PVTResult) => void;
  onDeleteResult: (id: string) => void;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export const PVTActivity: React.FC<PVTActivityProps> = ({
  savedResults,
  onSaveResult,
  onDeleteResult,
}) => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [remaining, setRemaining] = useState(180);
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState<PVTResult | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

  const phaseRef = useRef<Phase>('idle');
  const activeRef = useRef(false);
  const startedRef = useRef(0);
  const stimulusRef = useRef(0);
  const interruptedRef = useRef(false);
  const trialsRef = useRef<PVTTrial[]>([]);

  const trialTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clockTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef<number | null>(null);

  const respondRef = useRef<() => void>(() => {});
  const finishRef = useRef<() => void>(() => {});

  function changePhase(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
  }

  function clearTrial() {
    if (trialTimer.current !== null) {
      clearTimeout(trialTimer.current);
      trialTimer.current = null;
    }
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }

  function clearTimers() {
    clearTrial();
    if (clockTimer.current !== null) {
      clearInterval(clockTimer.current);
      clockTimer.current = null;
    }
    if (endTimer.current !== null) {
      clearTimeout(endTimer.current);
      endTimer.current = null;
    }
  }

  function finish() {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimers();

    const trials = [...trialsRef.current];
    const times = trials
      .filter(
        (trial) => trial.outcome === 'response' && trial.reactionTimeMs !== null
      )
      .map((trial) => trial.reactionTimeMs as number);

    const nextResult: PVTResult = {
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
      durationSeconds: Math.min(
        180,
        Math.round((performance.now() - startedRef.current) / 1000)
      ),
      medianReactionTimeMs: median(times),
      lapses: times.filter((time) => time >= LAPSE_MS).length,
      falseStarts: trials.filter((trial) => trial.outcome === 'false-start').length,
      misses: trials.filter((trial) => trial.outcome === 'miss').length,
      validResponses: times.length,
      lapseThresholdMs: LAPSE_MS,
      interrupted: interruptedRef.current,
      trials,
    };

    setResult(nextResult);
    setRemaining(0);
    changePhase('finished');
  }

  function scheduleTrial() {
    if (!activeRef.current) return;
    clearTrial();
    changePhase('waiting');
    setFeedback('');

    const delay = 2000 + Math.random() * 3000;
    trialTimer.current = setTimeout(() => {
      if (!activeRef.current) return;

      frame.current = requestAnimationFrame(() => {
        if (!activeRef.current) return;
        stimulusRef.current = performance.now();
        changePhase('stimulus');

        trialTimer.current = setTimeout(() => {
          if (!activeRef.current) return;
          trialsRef.current.push({
            reactionTimeMs: null,
            outcome: 'miss',
          });
          showFeedback('No response recorded');
        }, RESPONSE_TIMEOUT_MS);
      });
    }, delay);
  }

  function showFeedback(text: string) {
    clearTrial();
    changePhase('feedback');
    setFeedback(text);

    trialTimer.current = setTimeout(() => {
      scheduleTrial();
    }, 1000);
  }

  function respond() {
    if (!activeRef.current) return;

    if (performance.now() - startedRef.current >= DURATION_MS) {
      finish();
      return;
    }

    const currentPhase = phaseRef.current;

    if (currentPhase === 'waiting') {
      trialsRef.current.push({
        reactionTimeMs: null,
        outcome: 'false-start',
      });
      showFeedback('Too early — wait for TAP');
      return;
    }

    if (currentPhase !== 'stimulus') return;

    const reactionTime = performance.now() - stimulusRef.current;

    if (reactionTime < FALSE_START_MS) {
      trialsRef.current.push({
        reactionTimeMs: reactionTime,
        outcome: 'false-start',
      });
      showFeedback('Too early');
      return;
    }

    trialsRef.current.push({
      reactionTimeMs: reactionTime,
      outcome: 'response',
    });

    showFeedback(`${Math.round(reactionTime)} ms`);
  }

  function start() {
    clearTimers();

    trialsRef.current = [];
    interruptedRef.current = false;
    startedRef.current = performance.now();
    activeRef.current = true;

    setResult(null);
    setSaveMessage('');
    setRemaining(180);

    clockTimer.current = setInterval(() => {
      const elapsed = performance.now() - startedRef.current;
      setRemaining(Math.max(0, Math.ceil((DURATION_MS - elapsed) / 1000)));
    }, 200);

    endTimer.current = setTimeout(() => {
      finish();
    }, DURATION_MS);

    scheduleTrial();
  }

  function stop() {
    if (!activeRef.current) return;
    activeRef.current = false;
    clearTimers();
    changePhase('idle');
    setRemaining(180);
    setFeedback('');
    setSaveMessage('Activity cancelled. No result was saved.');
  }

  function handleSaveCurrent() {
    if (!result || result.interrupted) return;
    onSaveResult(result);
    setSaveMessage('Result saved in this browser.');
  }

  useEffect(() => {
    respondRef.current = respond;
    finishRef.current = finish;
  });

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.code !== 'Space' || !activeRef.current) return;
      event.preventDefault();
      if (!event.repeat) {
        respondRef.current();
      }
    }

    function handleVisibility() {
      if (document.hidden && activeRef.current) {
        interruptedRef.current = true;
        finishRef.current();
      }
    }

    window.addEventListener('keydown', handleKey);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('visibilitychange', handleVisibility);
      activeRef.current = false;
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const running =
    phase === 'waiting' || phase === 'stimulus' || phase === 'feedback';

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[#F7F0DC] text-[#12233B] rounded-[28px] p-5 sm:p-8 shadow-2xl shadow-[#060E1B]/45 space-y-6">
        <div className="space-y-1.5">
          <div className="text-xs text-[#4A5C75]">
            CrewMind · 3-Minute Attention Activity
          </div>
          <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#12233B]">
            PVT-Inspired Reaction Time Check
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5C75] leading-relaxed">
            A 3-minute sustained attention task pairing response speed with daily mood and sleep load.
          </p>
        </div>

        {/* Experimental notice */}
        <div className="rounded-2xl p-4 bg-[#FCF9F0] border border-[#12233B]/12 text-xs text-[#4A5C75] leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
          <p>
            Experimental browser prototype, not a validated NASA test or mental-health diagnosis. Device, display, browser, and input latency affect results. Do not use this to decide fitness for duty.
          </p>
        </div>

        {/* Idle / Instructions */}
        {phase === 'idle' && (
          <div className="pt-4 border-t border-[#12233B]/10 space-y-5">
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
                Instructions
              </h3>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-[#2B405E] leading-relaxed">
                <li>Use a quiet setting and the same device each time.</li>
                <li>Wait while the response area says WAIT.</li>
                <li>When it turns deep spruce and says TAP, respond as quickly as possible.</li>
                <li>Press Space or tap the response area. Do not respond early.</li>
                <li>Keep this tab visible. Switching tabs ends and invalidates the attempt.</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={start}
              className="w-full sm:w-auto min-h-[50px] px-7 py-3 rounded-full bg-[#145252] hover:bg-[#0F3F3F] text-[#FCF9F0] font-display font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-[#145252]/25 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Start 3-Minute Activity</span>
            </button>
          </div>
        )}

        {/* Active Trial Area */}
        {running && (
          <div className="pt-4 border-t border-[#12233B]/10 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#4A5C75]">Time remaining</span>
              <span className="font-mono tabular-nums font-semibold text-[#12233B]">
                {minutes}:{seconds}
              </span>
            </div>

            <button
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                respond();
              }}
              aria-label="Response area. Tap when TAP appears."
              className={`flex h-64 sm:h-72 w-full touch-manipulation select-none items-center justify-center rounded-[24px] border-2 font-display text-3xl sm:text-4xl font-bold tracking-tight transition-colors cursor-pointer ${
                phase === 'stimulus'
                  ? 'border-[#145252] bg-[#145252] text-[#FCF9F0] shadow-lg shadow-[#145252]/30'
                  : phase === 'feedback'
                    ? 'border-[#1D3E6E]/30 bg-[#1D3E6E] text-[#FCF9F0]'
                    : 'border-[#12233B]/15 bg-[#FCF9F0] text-[#4A5C75]'
              }`}
            >
              {phase === 'stimulus'
                ? 'TAP'
                : phase === 'feedback'
                  ? feedback
                  : 'WAIT'}
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#4A5C75]">
                Press Space or tap the pad above.
              </p>
              <button
                type="button"
                onClick={stop}
                className="min-h-[40px] px-4 py-1.5 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 text-xs font-medium text-[#991B1B] hover:border-[#991B1B]/40 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Cancel Activity</span>
              </button>
            </div>
          </div>
        )}

        {/* Finished Summary */}
        {phase === 'finished' && result && (
          <div className="pt-4 border-t border-[#12233B]/10 space-y-5">
            <h3 className="font-display text-xl font-bold text-[#12233B]">
              {result.interrupted ? 'Attempt Interrupted' : 'Activity Complete'}
            </h3>

            {result.interrupted ? (
              <p className="text-sm text-[#9A3412] bg-[#FFF0E5] border border-[#C2410C]/25 rounded-2xl p-4">
                The tab became hidden during the run. This attempt cannot be saved—start again when you can keep the page visible.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-[#FCF9F0] border border-[#12233B]/10 p-4">
                    <div className="text-xs text-[#566A86]">Median RT</div>
                    <div className="mt-1.5 text-2xl font-mono tabular-nums font-bold text-[#1D3E6E]">
                      {result.medianReactionTimeMs === null
                        ? '—'
                        : `${Math.round(result.medianReactionTimeMs)} ms`}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#FCF9F0] border border-[#12233B]/10 p-4">
                    <div className="text-xs text-[#566A86]">Slow ≥355 ms</div>
                    <div className="mt-1.5 text-2xl font-mono tabular-nums font-bold text-[#12233B]">
                      {result.lapses}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#FCF9F0] border border-[#12233B]/10 p-4">
                    <div className="text-xs text-[#566A86]">False starts</div>
                    <div className="mt-1.5 text-2xl font-mono tabular-nums font-bold text-[#12233B]">
                      {result.falseStarts}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#FCF9F0] border border-[#12233B]/10 p-4">
                    <div className="text-xs text-[#566A86]">Misses</div>
                    <div className="mt-1.5 text-2xl font-mono tabular-nums font-bold text-[#12233B]">
                      {result.misses}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#4A5C75] leading-relaxed">
                  Median includes all responses ≥ 100 ms, including slow responses. Misses are reported separately. No clinical risk score is calculated.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveCurrent}
                    className="min-h-[46px] px-6 py-2.5 rounded-full bg-[#145252] hover:bg-[#0F3F3F] text-[#FCF9F0] text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Result Locally</span>
                  </button>
                  <button
                    type="button"
                    onClick={start}
                    className="min-h-[46px] px-5 py-2.5 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 text-sm font-medium text-[#12233B] hover:border-[#1D3E6E]/40 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                </div>
              </>
            )}

            {result.interrupted && (
              <button
                type="button"
                onClick={start}
                className="min-h-[46px] px-6 py-2.5 rounded-full bg-[#1D3E6E] text-[#FCF9F0] text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Start New Attempt</span>
              </button>
            )}
          </div>
        )}

        {saveMessage && (
          <p role="status" className="text-xs sm:text-sm font-medium text-[#145252]">
            {saveMessage}
          </p>
        )}
      </div>

      {/* Saved PVT Results History */}
      {savedResults.length > 0 && (
        <div className="bg-[#F7F0DC] text-[#12233B] rounded-[28px] p-5 sm:p-7 shadow-2xl shadow-[#060E1B]/45 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-[#12233B]">
              Saved Attention Sessions
            </h3>
            <span className="text-xs font-mono tabular-nums text-[#566A86]">
              {savedResults.length} recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#12233B]/10 text-[#566A86]">
                  <th className="py-2.5 pr-3 font-medium">Completed</th>
                  <th className="py-2.5 px-3 font-medium">Median RT</th>
                  <th className="py-2.5 px-3 font-medium">Slow ≥355</th>
                  <th className="py-2.5 px-3 font-medium">False Starts</th>
                  <th className="py-2.5 pl-3 font-medium text-right">Remove</th>
                </tr>
              </thead>
              <tbody>
                {savedResults.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#12233B]/8 last:border-b-0"
                  >
                    <td className="py-3 pr-3 font-mono tabular-nums text-[#2B405E] whitespace-nowrap">
                      {new Date(item.completedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold text-[#12233B]">
                      {item.medianReactionTimeMs === null
                        ? '—'
                        : `${Math.round(item.medianReactionTimeMs)} ms`}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      {item.lapses}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      {item.falseStarts}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteResult(item.id)}
                        aria-label="Delete saved PVT result"
                        className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-full text-[#566A86] hover:text-[#991B1B] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "waiting" | "stimulus" | "feedback" | "finished";

type Trial = {
  reactionTimeMs: number | null;
  outcome: "response" | "false-start" | "miss";
};

type Result = {
  id: string;
  completedAt: string;
  durationSeconds: number;
  medianReactionTimeMs: number | null;
  lapses: number;
  falseStarts: number;
  misses: number;
  validResponses: number;
  lapseThresholdMs: number;
  interrupted: boolean;
  trials: Trial[];
};

const STORAGE_KEY = "crewmind-pvt-results-v1";
const DURATION_MS = 180_000;
const LAPSE_MS = 355;
const FALSE_START_MS = 100;
const RESPONSE_TIMEOUT_MS = 10_000;

function median(values: number[]) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

export default function PVTPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(180);
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  const phaseRef = useRef<Phase>("idle");
  const activeRef = useRef(false);
  const startedRef = useRef(0);
  const stimulusRef = useRef(0);
  const interruptedRef = useRef(false);
  const trialsRef = useRef<Trial[]>([]);

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
        (trial) =>
          trial.outcome === "response" &&
          trial.reactionTimeMs !== null
      )
      .map((trial) => trial.reactionTimeMs as number);

    const nextResult: Result = {
      id: crypto.randomUUID(),
      completedAt: new Date().toISOString(),
      durationSeconds: Math.min(
        180,
        Math.round((performance.now() - startedRef.current) / 1000)
      ),
      medianReactionTimeMs: median(times),
      lapses: times.filter((time) => time >= LAPSE_MS).length,
      falseStarts: trials.filter(
        (trial) => trial.outcome === "false-start"
      ).length,
      misses: trials.filter((trial) => trial.outcome === "miss").length,
      validResponses: times.length,
      lapseThresholdMs: LAPSE_MS,
      interrupted: interruptedRef.current,
      trials,
    };

    setResult(nextResult);
    setRemaining(0);
    changePhase("finished");
  }

  function scheduleTrial() {
    if (!activeRef.current) return;

    clearTrial();
    changePhase("waiting");
    setFeedback("");

    const delay = 2000 + Math.random() * 3000;

    trialTimer.current = setTimeout(() => {
      if (!activeRef.current) return;

      // Keep the visual change and timestamp close together.
      frame.current = requestAnimationFrame(() => {
        if (!activeRef.current) return;

        stimulusRef.current = performance.now();
        changePhase("stimulus");

        trialTimer.current = setTimeout(() => {
          if (!activeRef.current) return;

          trialsRef.current.push({
            reactionTimeMs: null,
            outcome: "miss",
          });

          showFeedback("No response recorded");
        }, RESPONSE_TIMEOUT_MS);
      });
    }, delay);
  }

  function showFeedback(text: string) {
    clearTrial();
    changePhase("feedback");
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

    if (currentPhase === "waiting") {
      trialsRef.current.push({
        reactionTimeMs: null,
        outcome: "false-start",
      });
      showFeedback("Too early — wait for TAP");
      return;
    }

    if (currentPhase !== "stimulus") return;

    const reactionTime = performance.now() - stimulusRef.current;

    if (reactionTime < FALSE_START_MS) {
      trialsRef.current.push({
        reactionTimeMs: reactionTime,
        outcome: "false-start",
      });
      showFeedback("Too early");
      return;
    }

    trialsRef.current.push({
      reactionTimeMs: reactionTime,
      outcome: "response",
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
    setSaveMessage("");
    setRemaining(180);

    clockTimer.current = setInterval(() => {
      const elapsed = performance.now() - startedRef.current;

      setRemaining(
        Math.max(0, Math.ceil((DURATION_MS - elapsed) / 1000))
      );
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
    changePhase("idle");
    setRemaining(180);
    setFeedback("");
    setSaveMessage("Test cancelled. No result was saved.");
  }

  function saveResult() {
    if (!result || result.interrupted) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid saved results");
      }

      const next = [
        result,
        ...parsed.filter(
          (item) =>
            !item ||
            typeof item !== "object" ||
            item.id !== result.id
        ),
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaveMessage("Result saved in this browser.");
    } catch {
      setSaveMessage(
        "Could not save the result. Browser storage may be unavailable."
      );
    }
  }

  useEffect(() => {
    respondRef.current = respond;
    finishRef.current = finish;
  });

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.code !== "Space" || !activeRef.current) return;

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

    window.addEventListener("keydown", handleKey);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      activeRef.current = false;
      clearTimers();
    };
    // Event callbacks read the latest handlers through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const running =
    phase === "waiting" ||
    phase === "stimulus" ||
    phase === "feedback";

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");

  return (
    <main className="min-h-screen w-full bg-slate-950 px-5 py-10 font-sans text-slate-100">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-teal-300 hover:underline"
        >
          Back to CrewMind
        </Link>

        <h1 className="mt-6 text-3xl font-semibold">
          Attention activity
        </h1>
        <p className="mt-2 leading-7 text-slate-400">
          A 3-minute PVT-inspired reaction-time activity.
        </p>

        <aside className="mt-5 rounded-xl border border-amber-900 bg-amber-950/40 p-4 text-sm leading-6 text-amber-100">
          Experimental browser prototype, not a validated NASA test or
          mental-health diagnosis. Device, display, browser, and input
          latency affect results. Do not use this to decide fitness for
          duty.
        </aside>

        {phase === "idle" && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Instructions</h2>

            <ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-300">
              <li>Use a quiet setting and the same device each time.</li>
              <li>Wait while the response area says WAIT.</li>
              <li>
                When it turns teal and says TAP, respond as quickly as
                possible.
              </li>
              <li>
                Press Space or tap the response area. Do not respond early.
              </li>
              <li>
                Keep this tab visible. Switching tabs ends and invalidates
                the attempt.
              </li>
            </ol>

            <button
              type="button"
              onClick={start}
              className="mt-6 rounded-xl bg-teal-300 px-6 py-3 font-semibold text-slate-950"
            >
              Start 3-minute activity
            </button>
          </section>
        )}

        {running && (
          <section className="mt-6">
            <div className="mb-4 flex justify-between text-sm">
              <span>Time remaining</span>
              <span className="font-mono">
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
              className={`flex h-72 w-full touch-manipulation select-none items-center justify-center rounded-3xl border-2 text-4xl font-semibold ${
                phase === "stimulus"
                  ? "border-teal-200 bg-teal-300 text-slate-950"
                  : "border-slate-700 bg-slate-900 text-slate-400"
              }`}
            >
              {phase === "stimulus"
                ? "TAP"
                : phase === "feedback"
                  ? feedback
                  : "WAIT"}
            </button>

            <p className="mt-4 text-center text-sm text-slate-400">
              Use Space or tap the area above.
            </p>

            <button
              type="button"
              onClick={stop}
              className="mt-6 text-sm text-rose-300 hover:underline"
            >
              Cancel activity
            </button>
          </section>
        )}

        {phase === "finished" && result && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              {result.interrupted
                ? "Attempt interrupted"
                : "Activity complete"}
            </h2>

            {result.interrupted ? (
              <p className="mt-4 text-amber-200">
                The tab became hidden. This attempt cannot be saved.
                Start again when you can keep the page visible.
              </p>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <ResultCard
                    label="Median reaction time"
                    value={
                      result.medianReactionTimeMs === null
                        ? "No valid responses"
                        : `${Math.round(
                            result.medianReactionTimeMs
                          )} ms`
                    }
                  />

                  <ResultCard
                    label="Slow responses ≥355 ms"
                    value={String(result.lapses)}
                  />

                  <ResultCard
                    label="False starts"
                    value={String(result.falseStarts)}
                  />

                  <ResultCard
                    label="Missed responses"
                    value={String(result.misses)}
                  />
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-400">
                  Median includes all responses of at least 100 ms,
                  including slow responses. Misses are reported separately.
                  No stress, mood, or clinical risk score is calculated.
                </p>

                <button
                  type="button"
                  onClick={saveResult}
                  className="mt-6 rounded-xl bg-teal-300 px-6 py-3 font-semibold text-slate-950"
                >
                  Save result locally
                </button>
              </>
            )}

            <button
              type="button"
              onClick={start}
              className="ml-4 mt-6 rounded-xl border border-slate-600 px-5 py-3"
            >
              Try again
            </button>
          </section>
        )}

        {saveMessage && (
          <p role="status" className="mt-5 text-sm text-teal-200">
            {saveMessage}
          </p>
        )}

        <p className="mt-8 text-xs leading-6 text-slate-500">
          Saved activity results use a separate browser-storage key from
          your check-ins. CrewMind’s existing export and delete-all buttons
          do not include these results yet. No data is uploaded by this
          page.
        </p>
      </div>
    </main>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-teal-200">
        {value}
      </p>
    </div>
  );
}
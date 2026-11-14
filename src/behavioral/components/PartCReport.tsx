import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, FileText } from 'lucide-react';
import { BaselineMetrics, PartAResult, ScoredDay } from '../types/assessment';
import { formatPlainTextReport } from '../utils/scoring';
import { TrendChart } from './TrendChart';

interface PartCReportProps {
  scoredDays: ScoredDay[];
  baseline: BaselineMetrics;
  partAResult: PartAResult;
  selectedDayNumber: number;
  onSelectDay: (day: number) => void;
  isLivePreview?: boolean;
}

export const PartCReport: React.FC<PartCReportProps> = ({
  scoredDays,
  baseline,
  partAResult,
  selectedDayNumber,
  onSelectDay,
  isLivePreview = false,
}) => {
  const [copied, setCopied] = useState(false);

  const activeDay =
    scoredDays.find((d) => d.day === selectedDayNumber) ??
    scoredDays[scoredDays.length - 1];

  if (!activeDay) {
    return (
      <div className="bg-[#F7F0DC] text-[#12233B] rounded-[28px] p-6 sm:p-8 shadow-2xl shadow-[#060E1B]/45">
        <p className="text-sm text-[#4A5C75]">
          Log your first daily check in Part B to generate the Part C Output Sheet.
        </p>
      </div>
    );
  }

  const recentSelectorDays = scoredDays.slice(-7);

  const statusMeta = {
    'On track': {
      glyph: '●',
      label: 'ON TRACK',
      tone: 'bg-[#E6F4EE] text-[#115E46] border-[#115E46]/20',
    },
    Watch: {
      glyph: '▲',
      label: 'WATCH — 1-day shift',
      tone: 'bg-[#FEF6E0] text-[#8A5300] border-[#B45309]/25',
    },
    Drift: {
      glyph: '◆',
      label: `DRIFT — ${activeDay.consecutiveDriftDays} consecutive days`,
      tone: 'bg-[#FFF0E5] text-[#9A3412] border-[#C2410C]/30',
    },
    Alert: {
      glyph: '■',
      label: 'ALERT — Threshold crossed',
      tone: 'bg-[#FEECEC] text-[#991B1B] border-[#B91C1C]/30',
    },
  }[activeDay.status];

  const handleCopyReport = async () => {
    const plain = formatPlainTextReport(activeDay, baseline, partAResult);
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="bg-[#F7F0DC] text-[#12233B] rounded-[28px] p-5 sm:p-8 shadow-2xl shadow-[#060E1B]/45 space-y-6">
      {/* Header & Day Switcher */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-[#4A5C75]">
            Part C · Output Sheet {isLivePreview ? '· Live Draft Preview' : ''}
          </div>
          <button
            type="button"
            onClick={handleCopyReport}
            className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 hover:border-[#1D3E6E]/40 text-xs font-medium text-[#12233B] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#145252]" />
                <span>Copied Sheet</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#365073]" />
                <span>Copy Report</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl sm:text-[26px] font-bold tracking-tight text-[#12233B]">
            Behavioural Check · Day {activeDay.day}
          </h2>
          <span className="text-xs font-mono tabular-nums text-[#566A86]">
            Baseline ({baseline.daysUsed}d): Neg {baseline.negativeMean.toFixed(1)} · Pos{' '}
            {baseline.positiveMean.toFixed(1)}
          </span>
        </div>

        {/* Horizontal day scroller for quick inspection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {recentSelectorDays.map((d) => {
            const selected = d.day === activeDay.day;
            return (
              <button
                key={d.day}
                type="button"
                onClick={() => onSelectDay(d.day)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-mono tabular-nums font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  selected
                    ? 'bg-[#1D3E6E] text-[#FCF9F0] shadow-sm'
                    : 'bg-[#FCF9F0] text-[#365073] border border-[#12233B]/12 hover:border-[#1D3E6E]/40'
                }`}
              >
                FD {d.day}
              </button>
            );
          })}
        </div>
      </div>

      {/* STATUS & Plain-Language Interpretation */}
      <div className="space-y-3">
        <div
          className={`rounded-2xl px-4 py-3.5 border flex flex-col gap-1.5 ${statusMeta.tone}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-mono font-semibold tracking-wide">
              {statusMeta.glyph} {statusMeta.label}
            </span>
            <span className="text-xs font-medium">{activeDay.flagAction}</span>
          </div>
          <p className="text-sm font-medium leading-relaxed">
            “{activeDay.interpretationText}”
          </p>
        </div>

        {partAResult.isContaminated && (
          <div className="rounded-2xl px-4 py-3 bg-[#FCF9F0] border border-[#12233B]/15 text-xs text-[#2B405E] flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#4A5C75] shrink-0" />
            <span>
              <strong>○ Part A Contaminated:</strong> Social desirability ≥ 3 — baseline traits marked inflated; trust Part B daily trajectory only.
            </span>
          </div>
        )}
      </div>

      {/* 7-Day Dual-Line Trend Chart */}
      <div className="pt-4 border-t border-[#12233B]/10 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
          7-Day Mood Trajectory
        </h3>
        <TrendChart
          days={scoredDays}
          baseline={baseline}
          selectedDay={activeDay.day}
          onSelectDay={onSelectDay}
        />
      </div>

      {/* MOOD & LOAD Readout Grid (unboxed hairline typography) */}
      <div className="pt-5 border-t border-[#12233B]/10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
            Mood (3–15 Stream)
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-[#365073]">Negative</span>
              <span className="font-mono tabular-nums font-semibold text-[#12233B]">
                {activeDay.negativeScore}/15{' '}
                <span className="text-xs font-normal text-[#566A86]">
                  (dev {activeDay.negDeviation >= 0 ? '+' : ''}
                  {activeDay.negDeviation.toFixed(1)} · base {baseline.negativeMean.toFixed(1)})
                </span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[#365073]">Positive</span>
              <span className="font-mono tabular-nums font-semibold text-[#12233B]">
                {activeDay.positiveScore}/15{' '}
                <span className="text-xs font-normal text-[#566A86]">
                  (dev {activeDay.posDeviation >= 0 ? '+' : ''}
                  {activeDay.posDeviation.toFixed(1)} · base {baseline.positiveMean.toFixed(1)})
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
            Load &amp; Sleep
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-[#365073]">Sleep</span>
              <span className="font-mono tabular-nums font-semibold text-[#12233B]">
                {activeDay.hoursSlept.toFixed(1)} h{' '}
                <span className="text-xs font-normal text-[#566A86]">
                  ({activeDay.sleepDebt > 0
                    ? `debt ${activeDay.sleepDebt.toFixed(1)} h`
                    : `surplus +${activeDay.sleepSurplus.toFixed(1)} h`})
                </span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[#365073]">Workload · Index</span>
              <span className="font-mono tabular-nums font-semibold text-[#12233B]">
                {activeDay.workload}/5 · {activeDay.loadIndex.toFixed(1)}{' '}
                <span className="text-xs font-normal text-[#566A86]">
                  ({activeDay.loadTier})
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PATTERN (from B3) */}
      {activeDay.b3Triggered && (
        <div className="pt-5 border-t border-[#12233B]/10 space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
            Pattern (from B3)
          </h3>
          <dl className="grid grid-cols-[88px_1fr] gap-y-1.5 gap-x-3 text-sm">
            <dt className="text-[#566A86]">Before</dt>
            <dd className="font-medium text-[#12233B]">
              {activeDay.b3.before ?? 'Not selected'}
            </dd>
            <dt className="text-[#566A86]">Behaviour</dt>
            <dd className="font-medium text-[#12233B]">
              {activeDay.b3.behaviours.length > 0
                ? activeDay.b3.behaviours.join(', ')
                : 'None selected'}
            </dd>
            <dt className="text-[#566A86]">After</dt>
            <dd className="font-medium text-[#12233B]">
              {activeDay.b3.after ?? 'Not selected'}
            </dd>
          </dl>
          {activeDay.b3Hypothesis && (
            <p className="text-xs sm:text-sm text-[#1D3E6E] font-medium pt-1">
              → Hypothesis: {activeDay.b3Hypothesis}
            </p>
          )}
        </div>
      )}

      {/* CONVERGENCE (The Divergence Rule) */}
      <div className="pt-5 border-t border-[#12233B]/10 space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
          Convergence
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-[#2B405E]">
            Self-report: <strong className="text-[#12233B]">“{activeDay.selfReportLabel}”</strong>
          </span>
          <span className="text-[#2B405E]">
            Crew rating:{' '}
            <strong className="text-[#12233B]">
              “{activeDay.crewObservation.toLowerCase()}”
            </strong>
          </span>
        </div>
        {activeDay.isDiscordant ? (
          <div className="rounded-2xl p-3.5 bg-[#FFF0E5] border border-[#C2410C]/30 text-xs sm:text-sm text-[#9A3412] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>DISCORDANT — treat as a finding, not an error.</strong> Self-report and crew observation disagree; do not average them. Bring directly to conference.
            </span>
          </div>
        ) : (
          <p className="text-xs text-[#145252] font-medium">
            ✓ Concordant — self-report aligns with daily crew observation.
          </p>
        )}
      </div>

      {/* RECOMMENDED ACTIONS */}
      <div className="pt-5 border-t border-[#12233B]/10 space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
          Recommended
        </h3>
        <ol className="space-y-1.5 text-sm text-[#12233B] list-decimal list-inside">
          {activeDay.recommendedActions.map((action, idx) => (
            <li key={idx} className="leading-relaxed">
              {action}
            </li>
          ))}
        </ol>
      </div>

      {/* Mandatory clinical boundary */}
      <div className="pt-4 border-t border-[#12233B]/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tracking-wider text-[#566A86]">
        <span>THIS IS A SCREEN, NOT A DIAGNOSIS.</span>
        {activeDay.note && <span className="font-sans italic">Note: {activeDay.note}</span>}
      </div>
    </div>
  );
};

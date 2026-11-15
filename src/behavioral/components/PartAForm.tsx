import React from 'react';
import { AlertTriangle, CheckCircle2, Info, FileBarChart2, ArrowRight } from 'lucide-react';
import {
  PART_A_ICE_ITEMS,
  PART_A_SOCIAL_DESIRABILITY,
  PART_A_TRAIT_ITEMS,
  TRAIT_SCALE_LABELS,
} from '../data/assessmentData';
import { PartAAnswers, PartAResult } from '../types/assessment';

interface PartAFormProps {
  answers: PartAAnswers;
  result: PartAResult;
  onChange: (updated: PartAAnswers) => void;
  onSaveProfile: () => void;
  onOpenReport?: () => void;
  savedToast: boolean;
}

export const PartAForm: React.FC<PartAFormProps> = ({
  answers,
  result,
  onChange,
  onSaveProfile,
  onOpenReport,
  savedToast,
}) => {
  const updateTrait = (id: number, value: number) => {
    onChange({
      ...answers,
      traits: { ...answers.traits, [id]: value },
    });
  };

  const updateSocialDesirability = (id: number, val: boolean) => {
    onChange({
      ...answers,
      socialDesirability: { ...answers.socialDesirability, [id]: val },
    });
  };

  const updateIceNote = (id: number, text: string) => {
    onChange({
      ...answers,
      iceNotes: { ...answers.iceNotes, [id]: text },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Complete Part A Questionnaire inside Oat Yellow rounded card */}
      <div className="lg:col-span-7 bg-[#F7F0DC] text-[#12233B] rounded-[28px] p-5 sm:p-8 shadow-2xl shadow-[#060E1B]/45 space-y-8">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A5C75]">
            <span>Part A · Baseline Profile</span>
            <span>L-90 days · Repeated every 30 days</span>
          </div>
          <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#12233B]">
            Baseline Personality &amp; ICE Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5C75] leading-relaxed">
            Rate each statement from 1 (very inaccurate) to 7 (very accurate). Items marked (R) are reverse-scored automatically.
          </p>
        </div>

        {/* A1. Trait Items (1..25) */}
        <div className="pt-5 border-t border-[#12233B]/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
              A1 · Trait Items (25 Items · 1–7 Scale)
            </h3>
            <span className="text-xs font-mono tabular-nums text-[#365073]">
              {Object.keys(answers.traits).length}/25
            </span>
          </div>

          <div className="space-y-5">
            {PART_A_TRAIT_ITEMS.map((item) => {
              const currentVal = answers.traits[item.id] ?? 4;
              return (
                <div
                  key={item.id}
                  className="pb-4 border-b border-[#12233B]/8 last:border-b-0 last:pb-0 space-y-2.5"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm sm:text-[15px] font-medium text-[#12233B]">
                      {item.id}. {item.statement}
                    </span>
                    <span className="text-xs font-mono text-[#566A86] whitespace-nowrap shrink-0">
                      {item.factor}
                      {item.reversed ? ' (R)' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {TRAIT_SCALE_LABELS.map((opt) => {
                      const selected = currentVal === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          title={opt.label}
                          aria-label={`Item ${item.id}: ${opt.label}`}
                          aria-pressed={selected}
                          onClick={() => updateTrait(item.id, opt.value)}
                          className={`min-h-[42px] rounded-2xl text-xs sm:text-sm font-mono tabular-nums font-semibold transition-all cursor-pointer ${
                            selected
                              ? 'bg-[#1D3E6E] text-[#FCF9F0] shadow-sm'
                              : 'bg-[#FCF9F0] text-[#365073] border border-[#12233B]/12 hover:border-[#1D3E6E]/40'
                          }`}
                        >
                          {opt.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* A2. Social Desirability Check (26..30) */}
        <div className="pt-6 border-t border-[#12233B]/10 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
              A2 · Social Desirability Check (True / False)
            </h3>
            <p className="text-xs text-[#4A5C75]">
              3 or more True responses indicates guarded responding and flags Part A scores as inflated.
            </p>
          </div>

          <div className="space-y-3">
            {PART_A_SOCIAL_DESIRABILITY.map((item) => {
              const val = answers.socialDesirability[item.id];
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-b border-[#12233B]/8 last:border-b-0"
                >
                  <span className="text-sm text-[#12233B]">
                    {item.id}. {item.statement}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      aria-pressed={val === true}
                      onClick={() => updateSocialDesirability(item.id, true)}
                      className={`min-h-[40px] px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        val === true
                          ? 'bg-[#1D3E6E] text-[#FCF9F0]'
                          : 'bg-[#FCF9F0] text-[#365073] border border-[#12233B]/15'
                      }`}
                    >
                      True
                    </button>
                    <button
                      type="button"
                      aria-pressed={val === false}
                      onClick={() => updateSocialDesirability(item.id, false)}
                      className={`min-h-[40px] px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        val === false
                          ? 'bg-[#145252] text-[#FCF9F0]'
                          : 'bg-[#FCF9F0] text-[#365073] border border-[#12233B]/15'
                      }`}
                    >
                      False
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* A3. Prior ICE Experience (31..35) */}
        <div className="pt-6 border-t border-[#12233B]/10 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
              A3 · Prior ICE Experience
            </h3>
            <p className="text-xs text-[#4A5C75]">
              Scored 0–3 for useful evidence (25+ days confined, concrete coping strategy, conflict described honestly without blaming).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label
              htmlFor="ice-days-input"
              className="text-sm font-medium text-[#12233B]"
            >
              Longest confined posting duration (days)
            </label>
            <div className="flex items-center gap-2 bg-[#FCF9F0] border border-[#12233B]/15 rounded-full px-4 py-1.5 w-fit">
              <input
                id="ice-days-input"
                type="number"
                min={0}
                max={1000}
                value={answers.iceDays}
                onChange={(e) => {
                  const daysVal = e.target.value;
                  const parsed = Number(daysVal);
                  onChange({
                    ...answers,
                    iceDays: daysVal,
                    iceEvidence: {
                      ...answers.iceEvidence,
                      confined25Plus: !Number.isNaN(parsed) && parsed >= 25,
                    },
                  });
                }}
                className="w-16 bg-transparent text-sm font-mono tabular-nums font-semibold text-[#12233B] focus:outline-none"
              />
              <span className="text-xs text-[#566A86]">days</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {PART_A_ICE_ITEMS.map((item) => (
              <div key={item.id} className="space-y-1.5">
                <label
                  htmlFor={`ice-${item.id}`}
                  className="block text-sm font-medium text-[#12233B]"
                >
                  {item.id}. {item.question}
                </label>
                <input
                  id={`ice-${item.id}`}
                  type="text"
                  value={answers.iceNotes[item.id] ?? ''}
                  onChange={(e) => updateIceNote(item.id, e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#FCF9F0] border border-[#12233B]/15 text-sm text-[#12233B] placeholder:text-[#6B7E98] focus:outline-none focus:border-[#1D3E6E]"
                />
              </div>
            ))}
          </div>

          {/* Evidence toggles (0-3) */}
          <div className="pt-2 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
              Evidence Record (0–3)
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  key: 'confined25Plus' as const,
                  label: '25+ days confined (1)',
                },
                {
                  key: 'concreteCoping' as const,
                  label: 'Named concrete coping strategy (1)',
                },
                {
                  key: 'honestConflict' as const,
                  label: 'Conflict described without blaming (1)',
                },
              ].map((ev) => {
                const active = answers.iceEvidence[ev.key];
                return (
                  <button
                    key={ev.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      onChange({
                        ...answers,
                        iceEvidence: {
                          ...answers.iceEvidence,
                          [ev.key]: !active,
                        },
                      })
                    }
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-[#145252] text-[#FCF9F0]'
                        : 'bg-[#FCF9F0] text-[#365073] border border-[#12233B]/15'
                    }`}
                  >
                    {ev.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onSaveProfile}
            className="w-full min-h-[52px] px-6 py-3.5 rounded-full bg-[#145252] hover:bg-[#0F3F3F] text-[#FCF9F0] font-display font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#145252]/25 transition-all cursor-pointer"
          >
            {savedToast ? (
              <>
                <span>Part A Baseline Saved</span>
                <CheckCircle2 className="w-5 h-5" />
              </>
            ) : (
              <span>Save Part A Baseline Profile</span>
            )}
          </button>

          {onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              className="w-full min-h-[46px] px-5 py-2.5 rounded-full bg-white hover:bg-[#FCF9F0] border border-[#12233B]/20 text-[#12233B] font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <FileBarChart2 className="w-4 h-4 text-[#145252]" />
              <span>Click to Open Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Live Scored Part A Summary */}
      <div className="lg:col-span-5 bg-[#F7F0DC] text-[#12233B] rounded-[28px] p-5 sm:p-7 shadow-2xl shadow-[#060E1B]/45 space-y-6 lg:sticky lg:top-6">
        <div className="space-y-1">
          <div className="text-xs text-[#4A5C75]">Baseline Readout · Live Score</div>
          <h3 className="font-display text-xl font-bold text-[#12233B]">
            Five-Factor Summary
          </h3>
        </div>

        {/* Social Desirability Contamination Banner */}
        <div
          className={`rounded-2xl p-4 border text-xs sm:text-sm leading-relaxed flex items-start gap-3 ${
            result.isContaminated
              ? 'bg-[#FEF2F2] border-[#B91C1C]/25 text-[#7F1D1D]'
              : 'bg-[#FCF9F0] border-[#12233B]/10 text-[#2B405E]'
          }`}
        >
          {result.isContaminated ? (
            <AlertTriangle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#145252] shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-semibold">
              {result.isContaminated
                ? `○ Contaminated — Guarded Responding (${result.socialDesirabilityScore}/5 True)`
                : `● Valid Responding (${result.socialDesirabilityScore}/5 True)`}
            </div>
            <p className="mt-0.5 text-xs opacity-90">
              {result.isContaminated
                ? 'Part A scores read as inflated. Do not treat trait means as accurate — trust Part B daily trend only.'
                : 'Social desirability is below the ≥ 3 contamination threshold.'}
            </p>
          </div>
        </div>

        {/* Factor Means */}
        <div className="space-y-4">
          {result.factors.map((f) => {
            const pct = ((f.mean - 1) / 6) * 100;
            return (
              <div
                key={f.factor}
                className="pb-3.5 border-b border-[#12233B]/10 last:border-b-0 last:pb-0 space-y-1.5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-[#12233B]">{f.label}</span>
                  <span className="text-sm font-mono tabular-nums font-bold text-[#1D3E6E]">
                    {f.mean.toFixed(1)} · {f.band}
                  </span>
                </div>

                {/* Clean rounded progress bar */}
                <div className="h-2.5 w-full rounded-full bg-[#E5D8B6] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      result.isContaminated ? 'bg-[#8D99AE]' : 'bg-[#1D3E6E]'
                    }`}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#4A5C75]">
                  <span>{f.bandMeaning}</span>
                  <span className="font-mono tabular-nums">Sum {f.rawSum}/35</span>
                </div>
                <p className="text-xs text-[#566A86]">{f.contextNote}</p>
              </div>
            );
          })}
        </div>

        {/* ICE Evidence Score */}
        <div className="pt-4 border-t border-[#12233B]/10 space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
            Prior ICE Evidence
          </div>
          <div className="text-sm font-semibold text-[#12233B]">
            {result.iceSummaryLabel}
          </div>
        </div>

        {/* Honest Limit Note */}
        <div className="pt-4 border-t border-[#12233B]/10 flex items-start gap-2.5 text-xs text-[#566A86] leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#365073]" />
          <p>
            Honest limit: Part A is a 25-item short form modelled on the 120-item IPIP-NEO-120 NASA uses for Standard Measures—enough to flag a band, not to place someone precisely within it.
          </p>
        </div>
      </div>
    </div>
  );
};

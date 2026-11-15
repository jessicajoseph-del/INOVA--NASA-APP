import React, { useState } from 'react';
import {
  Plus,
  NotebookPen,
  Users,
  Check,
  ArrowUpRight,
  Trash2,
  Feather,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  ListFilter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  CREW_OBSERVATION_OPTIONS,
  MOOD_SCALE_LABELS,
  PART_B_MOOD_ITEMS,
} from '../data/assessmentData';
import { B3FollowUp, CrewObservation, PartBEntry } from '../types/assessment';
import { B3StepModal } from './B3StepModal';
import { TactileScaleControl } from './TactileScaleControl';
import { VoiceDictationButton } from './VoiceDictationButton';

interface PartBFormProps {
  draft: PartBEntry;
  onChange: (updated: PartBEntry) => void;
  onSubmit: () => void;
  justSavedDay: number | null;
  onOpenExpressionModal?: () => void;
  expressionStatus?: 'idle' | 'starting' | 'active' | 'error' | 'skipped';
}

export const PartBForm: React.FC<PartBFormProps> = ({
  draft,
  onChange,
  onSubmit,
  justSavedDay,
  onOpenExpressionModal,
  expressionStatus,
}) => {
  const [isB3ModalOpen, setIsB3ModalOpen] = useState(false);
  const [skippedB3ForDay, setSkippedB3ForDay] = useState<number | null>(null);
  const [showReflectionBox, setShowReflectionBox] = useState<boolean>(
    Boolean(draft.reflection && draft.reflection.trim().length > 0)
  );

  // 1-by-1 Step-by-Step Questionnaire State (Default: Step-by-Step, Question 1)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'step' | 'all'>('step');

  const negSum = (draft.mood[1] || 1) + (draft.mood[2] || 1) + (draft.mood[3] || 1);
  const posSum = (draft.mood[4] || 3) + (draft.mood[5] || 3) + (draft.mood[6] || 3);
  const b3Triggered = negSum >= 9;

  const hasB3Data =
    Boolean(draft.b3.before) ||
    draft.b3.behaviours.length > 0 ||
    Boolean(draft.b3.after);

  const reflectionType = draft.reflectionType ?? 'journal';
  const reflectionText = draft.reflection ?? '';

  const TOTAL_QUESTIONS = 11;

  const handleAppendTranscript = (transcript: string) => {
    const existing = reflectionText;
    let nextValue: string;
    if (!existing.trim()) {
      nextValue = transcript;
    } else if (reflectionType === 'poem' || existing.endsWith('\n')) {
      const separator = existing.endsWith('\n') ? '' : '\n\n';
      nextValue = `${existing}${separator}${transcript}`;
    } else {
      const separator = existing.endsWith(' ') ? '' : ' ';
      nextValue = `${existing}${separator}${transcript}`;
    }
    onChange({
      ...draft,
      reflection: nextValue.slice(0, 10000),
    });
  };

  const updateMood = (itemId: number, value: number) => {
    const nextMood = {
      ...draft.mood,
      [itemId]: value,
    };
    const nextNegSum =
      (nextMood[1] || 1) + (nextMood[2] || 1) + (nextMood[3] || 1);

    onChange({
      ...draft,
      mood: nextMood,
    });

    // Trigger guided 3-step modal when negative mood crosses threshold (>= 9)
    if (negSum < 9 && nextNegSum >= 9) {
      setSkippedB3ForDay(null);
      setIsB3ModalOpen(true);
    }
  };

  const handleSaveB3 = (b3: B3FollowUp) => {
    onChange({
      ...draft,
      b3,
    });
    setSkippedB3ForDay(null);
  };

  const handleClearB3 = () => {
    onChange({
      ...draft,
      b3: { before: null, behaviours: [], after: null },
    });
  };

  const handleCloseModal = () => {
    setIsB3ModalOpen(false);
    if (b3Triggered && !hasB3Data) {
      setSkippedB3ForDay(draft.day);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (b3Triggered && !hasB3Data && skippedB3ForDay !== draft.day) {
      setIsB3ModalOpen(true);
      return;
    }
    onSubmit();
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(TOTAL_QUESTIONS + 1, prev + 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Step Category Labels
  const getStepCategory = (stepNum: number) => {
    if (stepNum <= 3) return 'B1 · Negative Affect Stream';
    if (stepNum <= 6) return 'B1 · Positive Vitality Stream';
    if (stepNum === 7) return 'B2 · Circadian & Sleep Duration';
    if (stepNum === 8) return 'B2 · Subjective Sleep Quality';
    if (stepNum === 9) return 'B2 · Cognitive & Operational Load';
    if (stepNum === 10) return 'B2 · Mission Events & Anecdotes';
    if (stepNum === 11) return 'B2 / B3 · Crew Observation & Reflection';
    return 'Summary & Assessment Submission';
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-[#F7F0DC] text-[#12233B] rounded-[28px] p-5 sm:p-8 shadow-2xl shadow-[#060E1B]/45 transition-all"
      >
        {/* Header matching calm conversational framing */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A5C75]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#12233B]">Part B · Daily Check</span>
              <span>·</span>
              <span className="font-mono tabular-nums">Flight Day {draft.day}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Optional Camera Expression Privacy Pill */}
              {onOpenExpressionModal && (
                <button
                  type="button"
                  onClick={onOpenExpressionModal}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FCF9F0] border border-[#12233B]/15 text-[#12233B] hover:bg-[#12233B]/5 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Configure private camera expression check"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      expressionStatus === 'active'
                        ? 'bg-emerald-600 animate-pulse'
                        : expressionStatus === 'skipped'
                        ? 'bg-slate-400'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>
                    Expression Check:{' '}
                    {expressionStatus === 'active'
                      ? 'Active'
                      : expressionStatus === 'skipped'
                      ? 'Skipped'
                      : 'Configure'}
                  </span>
                </button>
              )}

              {/* View Mode Switcher */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'step' ? 'all' : 'step')}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#12233B]/10 hover:bg-[#12233B]/20 text-[#12233B] inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ListFilter className="w-3 h-3" />
                <span>{viewMode === 'step' ? 'Switch to All' : 'One-by-One'}</span>
              </button>
            </div>
          </div>

          <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#12233B]">
            How are you feeling today?
          </h2>

          <p className="text-xs sm:text-sm text-[#4A5C75]">
            {viewMode === 'step'
              ? 'Answer each question one by one to complete today&apos;s behavioral assessment.'
              : 'Tap a circle or drag the slider for each statement over the last 24 hours.'}
          </p>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP-BY-STEP (ONE-BY-ONE) MODE */}
        {/* ───────────────────────────────────────────────────────────── */}
        {viewMode === 'step' ? (
          <div className="mt-6 space-y-6">
            {/* Step Progress Tracker Bar */}
            <div className="space-y-2 pb-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#145252]">
                  {currentStep <= TOTAL_QUESTIONS
                    ? `Question ${currentStep} of ${TOTAL_QUESTIONS}`
                    : 'Assessment Complete'}
                </span>
                <span className="font-mono text-[#566A86] text-[11px]">
                  {getStepCategory(currentStep)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#12233B]/10 overflow-hidden">
                <div
                  className="h-full bg-[#145252] transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, Math.round(((currentStep - 1) / TOTAL_QUESTIONS) * 100))}%`,
                  }}
                />
              </div>

              {/* Clickable Question Chips */}
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
                {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => {
                  const stepNum = i + 1;
                  const isActive = currentStep === stepNum;
                  return (
                    <button
                      key={stepNum}
                      type="button"
                      onClick={() => setCurrentStep(stepNum)}
                      className={`min-w-[28px] sm:min-w-[32px] h-7 sm:h-8 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#12233B] text-[#FCF9F0] shadow-md scale-105'
                          : 'bg-[#FCF9F0] text-[#4A5C75] border border-[#12233B]/15 hover:border-[#12233B]/40'
                      }`}
                      title={`Jump to Question ${stepNum}`}
                    >
                      {stepNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCurrentStep(TOTAL_QUESTIONS + 1)}
                  className={`min-w-[32px] h-7 sm:h-8 px-2.5 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    currentStep > TOTAL_QUESTIONS
                      ? 'bg-[#145252] text-[#FCF9F0] shadow-md'
                      : 'bg-[#FCF9F0] text-[#145252] border border-[#145252]/30 hover:border-[#145252]'
                  }`}
                  title="Review & Submit"
                >
                  Done
                </button>
              </div>
            </div>

            {/* ── QUESTION 1..6: B1 MOOD ITEMS (TACTILE SCALE) ── */}
            {currentStep >= 1 && currentStep <= 6 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FCF9F0] border border-[#12233B]/15 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs text-[#566A86]">
                  <span className="font-semibold uppercase tracking-wider">
                    {PART_B_MOOD_ITEMS[currentStep - 1].stream} Affect Stream
                  </span>
                  <span className="font-mono">
                    Item {currentStep} of 6
                  </span>
                </div>

                <TactileScaleControl
                  id={`step-mood-${PART_B_MOOD_ITEMS[currentStep - 1].id}`}
                  label={`${PART_B_MOOD_ITEMS[currentStep - 1].id}. ${PART_B_MOOD_ITEMS[currentStep - 1].statement}`}
                  value={draft.mood[PART_B_MOOD_ITEMS[currentStep - 1].id] ?? 3}
                  min={1}
                  max={5}
                  valueLabels={MOOD_SCALE_LABELS}
                  showFaces
                  invertMoodFaces={PART_B_MOOD_ITEMS[currentStep - 1].stream === 'Negative'}
                  onChange={(val) => updateMood(PART_B_MOOD_ITEMS[currentStep - 1].id, val)}
                />

                {currentStep === 3 && b3Triggered && (
                  <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3">
                    <div className="text-xs text-[#854D0E]">
                      <span className="font-bold block">A-B-C Protocol Triggered</span>
                      Negative affect sum is {negSum}/15 (≥ 9). Follow-up check recommended.
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsB3ModalOpen(true)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1D3E6E] text-white hover:bg-[#12233B] shrink-0"
                    >
                      Open 3-Step Check
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── QUESTION 7: HOURS SLEPT ── */}
            {currentStep === 7 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FCF9F0] border border-[#12233B]/15 shadow-sm space-y-5">
                <div className="flex items-center justify-between text-xs text-[#566A86]">
                  <span className="font-semibold uppercase tracking-wider">Sleep &amp; Circadian Countermeasure</span>
                  <span className="font-mono">Target: 7.0 h</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="step-hours-slept"
                    className="text-base sm:text-lg font-bold text-[#12233B]"
                  >
                    7. Hours slept last night
                  </label>
                  <div className="flex items-center gap-1.5 bg-white border border-[#12233B]/20 rounded-full px-4 py-2 shadow-inner">
                    <input
                      id="step-hours-slept"
                      type="number"
                      min={0}
                      max={14}
                      step={0.1}
                      value={draft.hoursSlept}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        onChange({
                          ...draft,
                          hoursSlept: Number.isNaN(parsed)
                            ? 0
                            : Math.max(0, Math.min(14, parsed)),
                        });
                      }}
                      className="w-14 text-right bg-transparent text-base font-mono tabular-nums font-bold text-[#12233B] focus:outline-none"
                    />
                    <span className="text-sm font-mono text-[#566A86]">h</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.1}
                  value={Math.min(12, draft.hoursSlept)}
                  onChange={(e) =>
                    onChange({ ...draft, hoursSlept: parseFloat(e.target.value) })
                  }
                  className="lumina-slider w-full"
                  aria-label="Hours slept last night slider"
                />

                <div className="flex items-center justify-between text-xs text-[#566A86]">
                  <span>0 h (Severe Deficit)</span>
                  <span className="font-semibold text-[#145252]">7.0 h Standard Flight Target</span>
                  <span>12 h</span>
                </div>
              </div>
            )}

            {/* ── QUESTION 8: SLEEP QUALITY ── */}
            {currentStep === 8 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FCF9F0] border border-[#12233B]/15 shadow-sm space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#566A86]">
                  Sleep Architecture &amp; Subjective Rest
                </span>
                <TactileScaleControl
                  id="step-sleep-quality"
                  label="8. How was the quality of your sleep?"
                  value={draft.sleepQuality}
                  min={1}
                  max={5}
                  valueLabels={['Very poor', 'Poor', 'Fair', 'Good', 'Restorative']}
                  leftHint="1 = very poor"
                  rightHint="5 = restorative"
                  onChange={(val) => onChange({ ...draft, sleepQuality: val })}
                />
              </div>
            )}

            {/* ── QUESTION 9: WORKLOAD TODAY ── */}
            {currentStep === 9 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FCF9F0] border border-[#12233B]/15 shadow-sm space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#566A86]">
                  Operational &amp; Physical Load
                </span>
                <TactileScaleControl
                  id="step-workload"
                  label="9. Workload expected or experienced today"
                  value={draft.workload}
                  min={1}
                  max={5}
                  valueLabels={['Very light', 'Light', 'Moderate', 'Heavy', 'Overwhelming']}
                  leftHint="1 = very light"
                  rightHint="5 = overwhelming"
                  onChange={(val) => onChange({ ...draft, workload: val })}
                />
              </div>
            )}

            {/* ── QUESTION 10: NOTABLE EVENT & NOTES ── */}
            {currentStep === 10 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FCF9F0] border border-[#12233B]/15 shadow-sm space-y-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#566A86]">
                  Mission Events &amp; Anomalies
                </span>
                <TactileScaleControl
                  id="step-notable-event"
                  label="10. Did anything notable or stressful happen?"
                  value={draft.notableEvent}
                  min={1}
                  max={5}
                  valueLabels={['Nothing', 'Minor', 'Moderate', 'Significant', 'Major']}
                  leftHint="1 = no"
                  rightHint="5 = major"
                  onChange={(val) => onChange({ ...draft, notableEvent: val })}
                />

                <div className="pt-2 space-y-2">
                  <label htmlFor="step-note-input" className="text-xs font-semibold text-[#4A5C75]">
                    Context Note (Optional)
                  </label>
                  <div className="relative">
                    <NotebookPen
                      className="w-4 h-4 text-[#566A86] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="step-note-input"
                      type="text"
                      value={draft.note}
                      onChange={(e) => onChange({ ...draft, note: e.target.value })}
                      placeholder="Add brief mission context or explanation..."
                      className="w-full min-h-[46px] pl-11 pr-4 py-2.5 rounded-full bg-white border border-[#12233B]/15 text-sm text-[#12233B] placeholder:text-[#6B7E98] focus:outline-none focus:border-[#1D3E6E] focus:ring-2 focus:ring-[#1D3E6E]/15 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── QUESTION 11: CREW OBSERVATION & REFLECTION ── */}
            {currentStep === 11 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FCF9F0] border border-[#12233B]/15 shadow-sm space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
                    <Users className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>11. Crew Observation Rating (Divergence Check)</span>
                  </div>
                  <p className="text-xs text-[#566A86]">
                    How do you perceive today&apos;s collective engagement and social atmosphere?
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {CREW_OBSERVATION_OPTIONS.map((obs: CrewObservation) => {
                      const active = draft.crewObservation === obs;
                      return (
                        <button
                          key={obs}
                          type="button"
                          aria-pressed={active}
                          onClick={() => onChange({ ...draft, crewObservation: obs })}
                          className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#12233B] text-[#FCF9F0] shadow-md scale-102'
                              : 'bg-white text-[#2B405E] border border-[#12233B]/15 hover:border-[#12233B]/40'
                          }`}
                        >
                          {obs}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional CrewMind Journal / Poetry Reflection */}
                <div className="pt-3 border-t border-[#12233B]/10 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#4A5C75]">
                      <Feather className="w-3.5 h-3.5 text-[#145252]" aria-hidden="true" />
                      <span>Journal or poetry reflection (Optional)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReflectionBox((v) => !v)}
                      className="min-h-[34px] px-3 py-1 rounded-full text-xs font-semibold text-[#1D3E6E] bg-white border border-[#12233B]/15 hover:border-[#1D3E6E]/40 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showReflectionBox ? (
                        <>
                          <span>Hide</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Write</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {showReflectionBox && (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {(['journal', 'poem'] as const).map((type) => {
                            const active = reflectionType === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                aria-pressed={active}
                                onClick={() =>
                                  onChange({ ...draft, reflectionType: type })
                                }
                                className={`min-h-[36px] px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                                  active
                                    ? 'bg-[#1D3E6E] text-[#FCF9F0]'
                                    : 'bg-white text-[#365073] border border-[#12233B]/15'
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                        <VoiceDictationButton
                          mode={reflectionType}
                          onTranscript={handleAppendTranscript}
                        />
                      </div>

                      <textarea
                        id="step-daily-reflection"
                        rows={4}
                        maxLength={10000}
                        value={reflectionText}
                        onChange={(e) =>
                          onChange({ ...draft, reflection: e.target.value })
                        }
                        placeholder={
                          reflectionType === 'journal'
                            ? 'Something that stayed with me today...'
                            : 'Between the quiet stars...'
                        }
                        className={`w-full rounded-2xl bg-white border border-[#12233B]/15 p-3.5 text-sm text-[#12233B] placeholder:text-[#6B7E98] leading-relaxed focus:outline-none focus:border-[#1D3E6E] focus:ring-2 focus:ring-[#1D3E6E]/15 ${
                          reflectionType === 'poem' ? 'font-serif text-base' : ''
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 12: ASSESSMENT COMPLETE / REVIEW ── */}
            {currentStep > TOTAL_QUESTIONS && (
              <div className="p-6 rounded-2xl bg-[#FCF9F0] border border-[#145252]/30 shadow-md space-y-5 text-center">
                <div className="w-14 h-14 rounded-full bg-[#145252]/15 text-[#145252] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-2xl font-bold text-[#12233B]">
                    Daily Assessment Ready
                  </h3>
                  <p className="text-sm text-[#4A5C75] max-w-md mx-auto">
                    You have answered all 11 behavioral and workload questions for Flight Day {draft.day}.
                    Submit now to generate and inspect your full assessment report.
                  </p>
                </div>

                {/* Score Preview Pill */}
                <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-white border border-[#12233B]/15 text-xs font-mono text-[#12233B]">
                  <span>Neg Affect: {negSum}/15</span>
                  <span>·</span>
                  <span>Pos Vitality: {posSum}/15</span>
                  <span>·</span>
                  <span>Sleep: {draft.hoursSlept}h</span>
                </div>

                {b3Triggered && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 max-w-md mx-auto text-xs text-[#854D0E] text-left">
                    <span className="font-bold block">A-B-C Guided Protocol Status:</span>
                    {hasB3Data ? 'Custom A-B-C behavioral data recorded.' : 'Not recorded yet (Optional).'}
                    <button
                      type="button"
                      onClick={() => setIsB3ModalOpen(true)}
                      className="mt-1.5 underline block font-semibold cursor-pointer"
                    >
                      {hasB3Data ? 'Edit A-B-C steps' : 'Open 3-step check'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step Navigation Controls (Previous / Next / Submit) */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`min-h-[46px] px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-all ${
                  currentStep === 1
                    ? 'opacity-40 cursor-not-allowed text-[#6B7E98]'
                    : 'bg-[#FCF9F0] border border-[#12233B]/20 text-[#12233B] hover:bg-[#12233B]/5 cursor-pointer'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentStep <= TOTAL_QUESTIONS ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="min-h-[46px] px-6 py-2.5 rounded-full bg-[#12233B] hover:bg-[#1C3558] text-[#FCF9F0] font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="min-h-[48px] px-7 py-3 rounded-full bg-[#145252] hover:bg-[#0F3F3F] text-[#FCF9F0] font-display font-semibold text-sm sm:text-base inline-flex items-center gap-2 shadow-lg shadow-[#145252]/25 transition-all cursor-pointer active:scale-95"
                >
                  {justSavedDay === draft.day ? (
                    <>
                      <span>Day {draft.day} Logged</span>
                      <Check className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <span>Submit &amp; View Assessment</span>
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ───────────────────────────────────────────────────────────── */
          /* ALL QUESTIONS (CLASSIC VIEW) MODE */
          /* ───────────────────────────────────────────────────────────── */
          <div className="mt-6 space-y-7">
            {/* B1. Mood (6 sliders / tactile circular face controls) */}
            <div className="pt-4 border-t border-[#12233B]/10 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
                  B1 · Mood (Last 24 Hours)
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-[#365073]">
                  <span>Neg {negSum}/15</span>
                  <span aria-hidden="true">·</span>
                  <span>Pos {posSum}/15</span>
                </div>
              </div>

              <div className="space-y-5">
                {PART_B_MOOD_ITEMS.map((item) => (
                  <TactileScaleControl
                    key={item.id}
                    id={`mood-${item.id}`}
                    label={`${item.id}. ${item.statement}`}
                    value={draft.mood[item.id] ?? 3}
                    min={1}
                    max={5}
                    valueLabels={MOOD_SCALE_LABELS}
                    showFaces
                    invertMoodFaces={item.stream === 'Negative'}
                    onChange={(val) => updateMood(item.id, val)}
                  />
                ))}
              </div>
            </div>

            {/* B2. Load and Sleep */}
            <div className="pt-6 border-t border-[#12233B]/10 space-y-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
                B2 · Load &amp; Sleep
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="hours-slept-num-all"
                    className="text-sm sm:text-[15px] font-medium text-[#12233B]"
                  >
                    7. Hours slept last night
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#FCF9F0] border border-[#12233B]/15 rounded-full px-3.5 py-1.5">
                    <input
                      id="hours-slept-num-all"
                      type="number"
                      min={0}
                      max={14}
                      step={0.1}
                      value={draft.hoursSlept}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        onChange({
                          ...draft,
                          hoursSlept: Number.isNaN(parsed)
                            ? 0
                            : Math.max(0, Math.min(14, parsed)),
                        });
                      }}
                      className="w-12 text-right bg-transparent text-sm font-mono tabular-nums font-semibold text-[#12233B] focus:outline-none"
                    />
                    <span className="text-xs font-mono text-[#566A86]">h</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.1}
                  value={Math.min(12, draft.hoursSlept)}
                  onChange={(e) =>
                    onChange({ ...draft, hoursSlept: parseFloat(e.target.value) })
                  }
                  className="lumina-slider w-full"
                  aria-label="Hours slept last night slider"
                />
                <div className="flex items-center justify-between text-[11px] text-[#566A86]">
                  <span>0 h</span>
                  <span>7.0 h target</span>
                  <span>12 h</span>
                </div>
              </div>

              <TactileScaleControl
                id="sleep-quality-all"
                label="8. Sleep quality"
                value={draft.sleepQuality}
                min={1}
                max={5}
                valueLabels={['Very poor', 'Poor', 'Fair', 'Good', 'Restorative']}
                leftHint="1 = very poor"
                rightHint="5 = restorative"
                onChange={(val) => onChange({ ...draft, sleepQuality: val })}
              />

              <TactileScaleControl
                id="workload-all"
                label="9. Workload today"
                value={draft.workload}
                min={1}
                max={5}
                valueLabels={['Very light', 'Light', 'Moderate', 'Heavy', 'Overwhelming']}
                leftHint="1 = very light"
                rightHint="5 = overwhelming"
                onChange={(val) => onChange({ ...draft, workload: val })}
              />

              <TactileScaleControl
                id="notable-event-all"
                label="10. Did anything notable happen?"
                value={draft.notableEvent}
                min={1}
                max={5}
                valueLabels={['Nothing', 'Minor', 'Moderate', 'Significant', 'Major']}
                leftHint="1 = no"
                rightHint="5 = major"
                onChange={(val) => onChange({ ...draft, notableEvent: val })}
              />

              <div className="relative">
                <NotebookPen
                  className="w-4 h-4 text-[#566A86] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={draft.note}
                  onChange={(e) => onChange({ ...draft, note: e.target.value })}
                  placeholder="Add a note (Optional)"
                  className="w-full min-h-[46px] pl-11 pr-4 py-2.5 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 text-sm text-[#12233B] placeholder:text-[#6B7E98] focus:outline-none focus:border-[#1D3E6E] focus:ring-2 focus:ring-[#1D3E6E]/15 transition-colors"
                />
              </div>

              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#4A5C75]">
                    <Feather className="w-3.5 h-3.5 text-[#145252]" aria-hidden="true" />
                    <span>Journal or poetry reflection (Optional · not analyzed)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReflectionBox((v) => !v)}
                    className="min-h-[36px] px-3 py-1 rounded-full text-xs font-medium text-[#1D3E6E] bg-[#FCF9F0] border border-[#12233B]/15 hover:border-[#1D3E6E]/40 inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {showReflectionBox ? (
                      <>
                        <span>Hide</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Write</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {showReflectionBox && (
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {(['journal', 'poem'] as const).map((type) => {
                          const active = reflectionType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              aria-pressed={active}
                              onClick={() =>
                                onChange({ ...draft, reflectionType: type })
                              }
                              className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                                active
                                  ? 'bg-[#1D3E6E] text-[#FCF9F0]'
                                  : 'bg-[#FCF9F0] text-[#365073] border border-[#12233B]/15'
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>

                      <VoiceDictationButton
                        mode={reflectionType}
                        onTranscript={handleAppendTranscript}
                      />
                    </div>

                    <textarea
                      id="daily-reflection-all"
                      rows={4}
                      maxLength={10000}
                      value={reflectionText}
                      onChange={(e) =>
                        onChange({ ...draft, reflection: e.target.value })
                      }
                      placeholder={
                        reflectionType === 'journal'
                          ? 'Something that stayed with me today...'
                          : 'Between the quiet stars...'
                      }
                      className={`w-full rounded-2xl bg-[#FCF9F0] border border-[#12233B]/15 p-3.5 text-sm text-[#12233B] placeholder:text-[#6B7E98] leading-relaxed focus:outline-none focus:border-[#1D3E6E] focus:ring-2 focus:ring-[#1D3E6E]/15 ${
                        reflectionType === 'poem' ? 'font-serif text-base' : ''
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* B3. Guided A-B-C Modal Trigger */}
            <div className="pt-6 border-t border-[#12233B]/10 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
                    B3 · Antecedent–Behaviour–Consequence
                  </h3>
                  <p className="text-xs text-[#4A5C75] mt-0.5">
                    {b3Triggered
                      ? `Triggered (#1–#3 total is ${negSum}/15 ≥ 9). Guided 3-step check.`
                      : `Auto-triggers when items #1–#3 total ≥ 9 (currently ${negSum}/15).`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasB3Data && (
                    <button
                      type="button"
                      onClick={handleClearB3}
                      aria-label="Clear A-B-C pattern"
                      className="min-h-[38px] min-w-[38px] rounded-full text-xs text-[#566A86] bg-[#FCF9F0] border border-[#12233B]/12 hover:text-[#991B1B] hover:border-[#991B1B]/30 inline-flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsB3ModalOpen(true)}
                    className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                      b3Triggered && !hasB3Data
                        ? 'bg-[#1D3E6E] text-[#FCF9F0] shadow-sm'
                        : 'bg-[#FCF9F0] text-[#1D3E6E] border border-[#12233B]/15 hover:border-[#1D3E6E]/45'
                    }`}
                  >
                    <span>{hasB3Data ? 'Edit A-B-C Steps' : 'Open 3-Step Check'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {hasB3Data && (
                <dl className="grid grid-cols-[84px_1fr] gap-y-1.5 gap-x-3 text-xs sm:text-sm pt-1">
                  <dt className="text-[#566A86]">Before</dt>
                  <dd className="font-medium text-[#12233B]">
                    {draft.b3.before ?? '—'}
                  </dd>
                  <dt className="text-[#566A86]">Behaviour</dt>
                  <dd className="font-medium text-[#12233B]">
                    {draft.b3.behaviours.length > 0
                      ? draft.b3.behaviours.join(', ')
                      : '—'}
                  </dd>
                  <dt className="text-[#566A86]">After</dt>
                  <dd className="font-medium text-[#12233B]">
                    {draft.b3.after ?? '—'}
                  </dd>
                </dl>
              )}
            </div>

            {/* Crew Observation Rating */}
            <div className="pt-6 border-t border-[#12233B]/10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Crew Observation Rating (Divergence Check)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CREW_OBSERVATION_OPTIONS.map((obs: CrewObservation) => {
                  const active = draft.crewObservation === obs;
                  return (
                    <button
                      key={obs}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange({ ...draft, crewObservation: obs })}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-[#12233B] text-[#FCF9F0] shadow-sm'
                          : 'bg-[#FCF9F0] text-[#2B405E] border border-[#12233B]/15 hover:border-[#12233B]/40'
                      }`}
                    >
                      {obs}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit button on All Questions mode */}
            <div className="mt-8 space-y-2">
              <button
                type="submit"
                className="w-full min-h-[52px] px-6 py-3.5 rounded-full bg-[#145252] hover:bg-[#0F3F3F] active:scale-[0.99] text-[#FCF9F0] font-display font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#145252]/25 transition-all cursor-pointer focus-visible:outline-none"
              >
                {justSavedDay === draft.day ? (
                  <>
                    <span>Day {draft.day} Logged</span>
                    <Check className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <span>Submit &amp; View Assessment (Day {draft.day})</span>
                    <Plus className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      <B3StepModal
        isOpen={isB3ModalOpen}
        initialB3={draft.b3}
        negSum={negSum}
        dayNumber={draft.day}
        onClose={handleCloseModal}
        onSave={handleSaveB3}
      />
    </>
  );
};

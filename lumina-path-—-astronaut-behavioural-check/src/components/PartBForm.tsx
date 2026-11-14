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
}

export const PartBForm: React.FC<PartBFormProps> = ({
  draft,
  onChange,
  onSubmit,
  justSavedDay,
}) => {
  const [isB3ModalOpen, setIsB3ModalOpen] = useState(false);
  const [skippedB3ForDay, setSkippedB3ForDay] = useState<number | null>(null);
  const [showReflectionBox, setShowReflectionBox] = useState<boolean>(
    Boolean(draft.reflection && draft.reflection.trim().length > 0)
  );

  const negSum = (draft.mood[1] || 1) + (draft.mood[2] || 1) + (draft.mood[3] || 1);
  const posSum = (draft.mood[4] || 3) + (draft.mood[5] || 3) + (draft.mood[6] || 3);
  const b3Triggered = negSum >= 9;

  const hasB3Data =
    Boolean(draft.b3.before) ||
    draft.b3.behaviours.length > 0 ||
    Boolean(draft.b3.after);

  const reflectionType = draft.reflectionType ?? 'journal';
  const reflectionText = draft.reflection ?? '';

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

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-[#F7F0DC] text-[#12233B] rounded-[28px] p-5 sm:p-8 shadow-2xl shadow-[#060E1B]/45"
      >
        {/* Header matching the calm conversational framing of the reference card */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A5C75]">
            <span>Part B · Daily Check</span>
            <span className="font-mono tabular-nums">
              Flight Day {draft.day} · 2 min
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#12233B]">
            How are you feeling today?
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5C75]">
            Tap a circle or drag the slider for each statement over the last 24 hours.
          </p>
        </div>

        {/* B1. Mood (6 sliders / tactile circular face controls) */}
        <div className="mt-6 pt-5 border-t border-[#12233B]/10 space-y-5">
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
        <div className="mt-7 pt-6 border-t border-[#12233B]/10 space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
            B2 · Load &amp; Sleep
          </h3>

          {/* #7 Hours slept last night: 1 number + 1 slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="hours-slept-num"
                className="text-sm sm:text-[15px] font-medium text-[#12233B]"
              >
                7. Hours slept last night
              </label>
              <div className="flex items-center gap-1.5 bg-[#FCF9F0] border border-[#12233B]/15 rounded-full px-3.5 py-1.5">
                <input
                  id="hours-slept-num"
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
            id="sleep-quality"
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
            id="workload"
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
            id="notable-event"
            label="10. Did anything notable happen?"
            value={draft.notableEvent}
            min={1}
            max={5}
            valueLabels={['Nothing', 'Minor', 'Moderate', 'Significant', 'Major']}
            leftHint="1 = no"
            rightHint="5 = major"
            onChange={(val) => onChange({ ...draft, notableEvent: val })}
          />

          {/* Rounded pill note input matching the reference design */}
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

          {/* Optional CrewMind Journal / Poetry Reflection */}
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

                <label
                  htmlFor="daily-reflection"
                  className="block text-xs text-[#4A5C75]"
                >
                  {reflectionType === 'journal'
                    ? 'What did today feel like?'
                    : 'If your feelings were a landscape, what would it look like?'}
                </label>

                <textarea
                  id="daily-reflection"
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
                <div className="text-right text-[11px] font-mono tabular-nums text-[#566A86]">
                  {reflectionText.length.toLocaleString()}/10,000 characters
                </div>
              </div>
            )}
          </div>
        </div>

        {/* B3. Guided A-B-C Modal Trigger & Captured Summary */}
        <div className="mt-7 pt-6 border-t border-[#12233B]/10 space-y-3.5">
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

        {/* Crew Observation Rating (supports the Divergence Rule) */}
        <div className="mt-7 pt-6 border-t border-[#12233B]/10 space-y-2.5">
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

        {/* Primary full-width rounded pill CTA matching reference card */}
        <div className="mt-8 space-y-2">
          <button
            type="submit"
            className="w-full min-h-[52px] px-6 py-3.5 rounded-full bg-[#145252] hover:bg-[#0F3F3F] active:scale-[0.99] text-[#FCF9F0] font-display font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#145252]/25 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12233B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F0DC]"
          >
            {justSavedDay === draft.day ? (
              <>
                <span>Day {draft.day} Logged</span>
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                <span>Log Daily Check (Day {draft.day})</span>
                <Plus className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
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

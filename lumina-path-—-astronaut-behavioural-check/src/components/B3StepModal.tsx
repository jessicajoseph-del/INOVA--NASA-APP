import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import {
  B3_AFTER_OPTIONS,
  B3_BEHAVIOUR_OPTIONS,
  B3_BEFORE_OPTIONS,
} from '../data/assessmentData';
import { B3FollowUp } from '../types/assessment';

interface B3StepModalProps {
  isOpen: boolean;
  initialB3: B3FollowUp;
  negSum: number;
  dayNumber: number;
  onClose: () => void;
  onSave: (b3: B3FollowUp) => void;
}

type StepIndex = 0 | 1 | 2;

const STEPS = [
  {
    key: 'A',
    short: 'A · Before',
    title: 'What was happening just before you felt this way?',
    subtitle: 'Select the primary antecedent or context that preceded the shift.',
  },
  {
    key: 'B',
    short: 'B · Behaviour',
    title: 'Count the observable behaviour.',
    subtitle: 'Select all that occurred today, or choose "none of these".',
  },
  {
    key: 'C',
    short: 'C · After',
    title: 'What did it get you?',
    subtitle: 'Identify the immediate consequence or outcome that followed.',
  },
] as const;

export const B3StepModal: React.FC<B3StepModalProps> = ({
  isOpen,
  initialB3,
  negSum,
  dayNumber,
  onClose,
  onSave,
}) => {
  const [step, setStep] = useState<StepIndex>(0);
  const [localB3, setLocalB3] = useState<B3FollowUp>(initialB3);

  // Reset modal step & sync draft whenever opened
  useEffect(() => {
    if (isOpen) {
      setLocalB3(initialB3);
      setStep(0);
    }
  }, [isOpen, initialB3]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStep = STEPS[step];

  const toggleBehaviour = (option: string) => {
    const current = localB3.behaviours;
    if (option === 'none of these') {
      const next = current.includes('none of these') ? [] : ['none of these'];
      setLocalB3({ ...localB3, behaviours: next });
      return;
    }
    const withoutNone = current.filter((b) => b !== 'none of these');
    const exists = withoutNone.includes(option);
    const next = exists
      ? withoutNone.filter((b) => b !== option)
      : [...withoutNone, option];
    setLocalB3({ ...localB3, behaviours: next });
  };

  const handleSave = () => {
    onSave(localB3);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#071121]/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="b3-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg bg-[#F7F0DC] text-[#12233B] rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-7 shadow-2xl shadow-[#050C18]/60 max-h-[90vh] overflow-y-auto">
        {/* Top Metadata & Close */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-mono tabular-nums text-[#4A5C75]">
            B3 Pattern Check · Day {dayNumber} · Neg {negSum}/15
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close A-B-C modal"
            className="min-h-[40px] min-w-[40px] rounded-full bg-[#FCF9F0] border border-[#12233B]/12 text-[#365073] hover:text-[#12233B] hover:border-[#12233B]/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Navigation Pills */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {STEPS.map((s, idx) => {
            const index = idx as StepIndex;
            const active = step === index;
            const completed =
              (index === 0 && Boolean(localB3.before)) ||
              (index === 1 && localB3.behaviours.length > 0) ||
              (index === 2 && Boolean(localB3.after));

            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStep(index)}
                className={`min-h-[40px] px-2.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#1D3E6E] text-[#FCF9F0] shadow-sm'
                    : completed
                      ? 'bg-[#E6F0EC] text-[#145252] border border-[#145252]/20'
                      : 'bg-[#FCF9F0] text-[#4A5C75] border border-[#12233B]/12'
                }`}
              >
                {completed && !active && <Check className="w-3 h-3 shrink-0" />}
                <span>{s.short}</span>
              </button>
            );
          })}
        </div>

        {/* Question Header */}
        <div className="mt-6 space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
            Step {step + 1} of 3 · {currentStep.key === 'A' ? 'Antecedent' : currentStep.key === 'B' ? 'Behaviour' : 'Consequence'}
          </div>
          <h3
            id="b3-modal-title"
            className="font-display text-xl sm:text-2xl font-bold text-[#12233B] leading-snug"
          >
            {currentStep.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5C75]">{currentStep.subtitle}</p>
        </div>

        {/* Step Options */}
        <div className="mt-5 min-h-[150px]">
          {step === 0 && (
            <div className="flex flex-wrap gap-2.5">
              {B3_BEFORE_OPTIONS.map((option) => {
                const active = localB3.before === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setLocalB3({
                        ...localB3,
                        before: active ? null : option,
                      })
                    }
                    className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-[#1D3E6E] text-[#FCF9F0] shadow-sm'
                        : 'bg-[#FCF9F0] text-[#2B405E] border border-[#12233B]/15 hover:border-[#1D3E6E]/45'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-wrap gap-2.5">
              {B3_BEHAVIOUR_OPTIONS.map((option) => {
                const active = localB3.behaviours.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleBehaviour(option)}
                    className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-[#A14424] text-[#FCF9F0] shadow-sm'
                        : 'bg-[#FCF9F0] text-[#2B405E] border border-[#12233B]/15 hover:border-[#A14424]/45'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2.5">
                {B3_AFTER_OPTIONS.map((option) => {
                  const active = localB3.after === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        setLocalB3({
                          ...localB3,
                          after: active ? null : option,
                        })
                      }
                      className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-[#145252] text-[#FCF9F0] shadow-sm'
                          : 'bg-[#FCF9F0] text-[#2B405E] border border-[#12233B]/15 hover:border-[#145252]/45'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Clean Pattern Summary before committing */}
              <div className="pt-4 border-t border-[#12233B]/10 space-y-1.5 text-xs sm:text-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#4A5C75]">
                  Captured Sequence
                </div>
                <div className="grid grid-cols-[84px_1fr] gap-y-1 gap-x-2">
                  <span className="text-[#566A86]">Before</span>
                  <span className="font-medium text-[#12233B]">
                    {localB3.before ?? '—'}
                  </span>
                  <span className="text-[#566A86]">Behaviour</span>
                  <span className="font-medium text-[#12233B]">
                    {localB3.behaviours.length > 0
                      ? localB3.behaviours.join(', ')
                      : '—'}
                  </span>
                  <span className="text-[#566A86]">After</span>
                  <span className="font-medium text-[#12233B]">
                    {localB3.after ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="mt-7 pt-4 border-t border-[#12233B]/10 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as StepIndex)}
              className="min-h-[46px] px-4 py-2 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 text-sm font-medium text-[#2B405E] hover:border-[#12233B]/35 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[46px] px-4 py-2 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 text-sm font-medium text-[#4A5C75] hover:text-[#12233B] cursor-pointer"
            >
              Skip for now
            </button>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as StepIndex)}
              className="min-h-[46px] px-6 py-2 rounded-full bg-[#1D3E6E] hover:bg-[#152E54] text-[#FCF9F0] text-sm font-semibold inline-flex items-center gap-1.5 shadow-md shadow-[#10213B]/20 cursor-pointer"
            >
              <span>Next: {STEPS[step + 1].short}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="min-h-[46px] px-6 py-2 rounded-full bg-[#145252] hover:bg-[#0F3F3F] text-[#FCF9F0] text-sm font-semibold inline-flex items-center gap-1.5 shadow-md shadow-[#145252]/25 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save A-B-C Pattern</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

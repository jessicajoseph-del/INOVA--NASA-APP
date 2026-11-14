import React from 'react';
import { MoodFaceIcon } from './MoodFaceIcon';

interface TactileScaleControlProps {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  valueLabels?: string[];
  showFaces?: boolean;
  invertMoodFaces?: boolean;
  leftHint?: string;
  rightHint?: string;
}

export const TactileScaleControl: React.FC<TactileScaleControlProps> = ({
  id,
  label,
  value,
  min = 1,
  max = 5,
  onChange,
  valueLabels,
  showFaces = false,
  invertMoodFaces = false,
  leftHint,
  rightHint,
}) => {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const currentLabel = valueLabels?.[value - min] ?? `${value}/${max}`;

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-sm sm:text-[15px] font-medium text-[#12233B] leading-snug"
        >
          {label}
        </label>
        <span className="text-xs font-mono tabular-nums font-medium text-[#365073] whitespace-nowrap shrink-0">
          {currentLabel}
        </span>
      </div>

      {/* Tactile circular tap nodes (44px+ touch targets on mobile) */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
        {steps.map((step) => {
          const isSelected = value === step;
          const faceLevel = (
            invertMoodFaces ? max - step + 1 : step
          ) as 1 | 2 | 3 | 4 | 5;

          return (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              aria-label={`${label}: ${valueLabels?.[step - min] ?? step}`}
              aria-pressed={isSelected}
              className={`min-h-[44px] flex-1 flex items-center justify-center rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173054] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F0DC] cursor-pointer ${
                isSelected
                  ? 'bg-[#1D3E6E] text-[#FCF9F0] shadow-md shadow-[#10213B]/20 scale-[1.03]'
                  : 'bg-[#FCF9F0] text-[#455B7A] border border-[#12233B]/12 hover:border-[#1D3E6E]/40 hover:text-[#12233B]'
              }`}
            >
              {showFaces && max === 5 ? (
                <MoodFaceIcon level={faceLevel} active={isSelected} className="w-6 h-6" />
              ) : (
                <span className="text-sm font-mono tabular-nums font-semibold">
                  {step}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Paired fast-drag slider rail */}
      <div className="pt-0.5">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="lumina-slider w-full"
          aria-label={label}
        />
        {(leftHint || rightHint) && (
          <div className="flex items-center justify-between text-[11px] text-[#566A86] mt-1">
            <span>{leftHint}</span>
            <span>{rightHint}</span>
          </div>
        )}
      </div>
    </div>
  );
};

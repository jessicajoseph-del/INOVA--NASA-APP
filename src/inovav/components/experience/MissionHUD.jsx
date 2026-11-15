import React, { useState, useEffect, useCallback } from 'react';
import PalmMouse from '../ar/PalmMouse';
import HumanAnatomy3D from '../vital/HumanAnatomy3D';
import {
  Heart,
  Bone,
  Shield,
  Apple,
  Moon,
  ChevronLeft,
  ChevronRight,
  Hand,
  X,
  Maximize2,
  RefreshCw,
  Sparkles,
  Radio,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const BRIEFING_STEPS = [
  {
    id: 'cardiovascular',
    stepNumber: 1,
    title: 'Cardiovascular Dynamics',
    subtitle: 'Primary Hemodynamic Regulation',
    organLabel: 'Heart Core',
    icon: Heart,
    color: '#f6eedb',
    metrics: [
      { label: 'HEART RATE', value: '72 BPM', status: 'Optimal', change: '+2%' },
      { label: 'BLOOD PRESSURE', value: '118/76 mmHg', status: 'Nominal', change: '±0' },
      { label: 'CARDIAC OUTPUT', value: '5.2 L/min', status: 'Stable', change: '+1%' },
      { label: 'O2 SATURATION', value: '98.5%', status: 'Nominal', change: '+0.5%' },
    ],
    briefing:
      'Arterial elasticity shows zero stiffening during current EVA rotation. Microgravity fluid shift remains compensated by lower-body negative pressure protocol. Cardiac chamber geometry is symmetric with normal ejection fraction.',
    advisory: 'Maintain daily 45-min interval ergometer training to prevent orthostatic deconditioning.',
  },
  {
    id: 'skeletal',
    stepNumber: 2,
    title: 'Skeletal Density & Spine',
    subtitle: 'Microgravity Osteo-Telemetry',
    organLabel: 'Spine & Cranium',
    icon: Bone,
    color: '#ead9b2',
    metrics: [
      { label: 'BONE MINERAL DENSITY', value: 'T-Score +0.8', status: 'Nominal', change: '-0.1%' },
      { label: 'CALCIUM RESORPTION', value: '2.1 mmol/d', status: 'Normal', change: 'Stable' },
      { label: 'SPINAL ELONGATION', value: '+2.8 cm', status: 'Monitored', change: '+0.3cm' },
      { label: 'TRABECULAR INDEX', value: '94.2%', status: 'Optimal', change: 'Stable' },
    ],
    briefing:
      'Spinal elongation stabilized at +2.8 cm with zero intervertebral impingement reported. Osteoclast / osteoblast metabolic balance is maintained through resistive ARED exercise sets. Cranial bone suture stress is within baseline bounds.',
    advisory: 'Recommend scheduled 30-minute lumbar compression axial loading prior to orbital sleep cycle.',
  },
  {
    id: 'immune',
    stepNumber: 3,
    title: 'Immune & Lymphatic Shield',
    subtitle: 'Cytokine & Radiation Resilience',
    organLabel: 'Lymphatic Array',
    icon: Shield,
    color: '#f6eedb',
    metrics: [
      { label: 'WBC COUNT', value: '6.4 x10³/µL', status: 'Optimal', change: '±0' },
      { label: 'CYTOKINE BALANCE', value: 'Homeostatic', status: 'Nominal', change: 'Ideal' },
      { label: 'COSMIC RAD EXPOSURE', value: '0.42 mSv/d', status: 'Protected', change: 'Low' },
      { label: 'T-CELL ACTIVATION', value: '91.8%', status: 'Vibrant', change: '+1.2%' },
    ],
    briefing:
      'Radiation dosimetry confirms passive shielding efficiency at 99.1%. Natural killer (NK) cell cytotoxicity and helper T-cell ratios remain unaffected by high-energy solar particle flux. Latent viral reactivations remain below detection thresholds.',
    advisory: 'Anti-oxidant polyphenol hydration pack active. No therapeutic immunomodulation needed.',
  },
  {
    id: 'nutrition',
    stepNumber: 4,
    title: 'Hepatic & Metabolic Systems',
    subtitle: 'Liver, Spleen & Glycemic Reserve',
    organLabel: 'Liver & Pancreas',
    icon: Apple,
    color: '#ead9b2',
    metrics: [
      { label: 'FASTING GLUCOSE', value: '88 mg/dL', status: 'Nominal', change: 'Stable' },
      { label: 'HEPATIC ENZYMES', value: 'ALT 21 / AST 19', status: 'Optimal', change: 'Stable' },
      { label: 'HYDRATION INDEX', value: '62.4%', status: 'Hydrated', change: '+1.1%' },
      { label: 'SERUM ELECTROLYTES', value: 'K: 4.2 | Na: 140', status: 'Balanced', change: 'Nominal' },
    ],
    briefing:
      'Hepatic glycogen reserves are fully replenished following EVA nutrient packet absorption. Glucagon-insulin feedback curve exhibits sharp postprandial return to baseline. Spleen erythrocyte filtering performance is within target parameters.',
    advisory: 'Replenish magnesium and potassium complex during post-exercise meal rotation.',
  },
  {
    id: 'sleep',
    stepNumber: 5,
    title: 'Circadian & Neuro-Cognitive',
    subtitle: 'REM Architecture & Alertness',
    organLabel: 'Neural Core',
    icon: Moon,
    color: '#f6eedb',
    metrics: [
      { label: 'SLEEP DURATION', value: '7h 42m', status: 'Optimal', change: '+20m' },
      { label: 'DEEP SLEEP / REM', value: '28% / 24%', status: 'Restorative', change: '+3%' },
      { label: 'COGNITIVE READINESS', value: '97 / 100', status: 'Peak', change: '+4 pts' },
      { label: 'CORTISOL PEAK', value: 'Phase Aligned', status: 'Nominal', change: 'Aligned' },
    ],
    briefing:
      'Sleep architecture confirms complete delta-wave physical recovery with zero micro-awakenings. Cognitive latency tests indicate instantaneous reaction times. Melatonin production is rhythmically synchronized to cabin spectrum LED circadian shifting.',
    advisory: 'Maintain cabin blue-light attenuation 60 minutes prior to scheduled crew rest.',
  },
];

export default function MissionHUD({ astronaut, onClose, globalArEnabled = false }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [palmEnabled, setPalmEnabled] = useState(false);
  const [showGestureGuide, setShowGestureGuide] = useState(false);

  const currentStep = BRIEFING_STEPS[currentStepIndex];

  useEffect(() => {
    if (globalArEnabled) setPalmEnabled(false);
  }, [globalArEnabled]);

  // Step navigation
  const handleNextStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev + 1) % BRIEFING_STEPS.length);
  }, []);

  const handlePrevStep = useCallback(() => {
    setCurrentStepIndex((prev) => (prev - 1 + BRIEFING_STEPS.length) % BRIEFING_STEPS.length);
  }, []);

  // Keyboard navigation fallback (matching swipe keyboard events)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNextStep();
      if (e.key === 'ArrowLeft') handlePrevStep();
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextStep, handlePrevStep, onClose]);

  return (
    <div
      data-theme="orbit"
      className="fixed inset-0 z-[9990] flex flex-col bg-base-100 text-base-content select-none overflow-hidden font-sans"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 30%, rgba(14, 40, 89, 0.72) 0%, rgba(6, 19, 43, 0.98) 85%),
          linear-gradient(rgba(246, 238, 219, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(246, 238, 219, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
      }}
    >
      {/* ── 1. TOP MISSION HUD APEX BAR ── */}
      <header className="relative z-50 flex h-16 items-center justify-between border-b border-primary/20 bg-base-200/75 px-6 backdrop-blur-xl">
        {/* Brand & Callsign */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
            </span>
            <span className="font-tech text-xl font-bold tracking-widest text-primary drop-shadow-[0_0_12px_rgba(246,238,219,0.5)]">
              RIDGE
            </span>
          </div>
          <span className="h-4 w-[1px] bg-primary/30" />
          <div className="flex flex-col">
            <span className="font-mono text-xs tracking-wider text-base-content/90 font-semibold uppercase">
              MISSION HUD // 5-STEP CREW HEALTH BRIEFING
            </span>
            <span className="font-mono text-[10px] text-secondary">
              ASTRONAUT: {astronaut?.name || 'CDR. Alex Vance'} • {astronaut?.id || 'ASTRO-01'}
            </span>
          </div>
        </div>

        {/* Center: AR Palm Gesture Controls & Tooltip */}
        <div className="flex items-center gap-3">
          {/* Hands-Free AR Palm Sensor Toggle */}
          <button
            type="button"
            id="btn-toggle-palm"
            onClick={() => setPalmEnabled((prev) => !prev)}
            disabled={globalArEnabled}
            title={globalArEnabled ? 'Global hand controls are active' : 'Toggle local palm controls'}
            className={`btn btn-sm gap-2 font-mono tracking-wider transition-all duration-200 ${
              globalArEnabled
                ? 'btn-outline border-primary/40 text-primary opacity-70'
                : palmEnabled
                ? 'btn-primary shadow-[0_0_18px_rgba(246,238,219,0.35)] border-primary'
                : 'btn-outline border-primary/40 text-primary hover:bg-primary/20'
            }`}
          >
            <Hand size={16} className={palmEnabled && !globalArEnabled ? 'animate-bounce' : ''} />
            <span>
              AR PALM GESTURES: {globalArEnabled ? 'GLOBAL' : palmEnabled ? 'ONLINE' : 'OFFLINE'}
            </span>
          </button>

          {/* Gesture Guide Quick Button */}
          <button
            type="button"
            onClick={() => setShowGestureGuide((prev) => !prev)}
            className="btn btn-ghost btn-sm btn-circle border border-primary/20 text-secondary hover:bg-primary/10"
            title="AR Gesture Controls Guide"
          >
            ?
          </button>

          {/* Close HUD Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle border border-primary/20 text-base-content/80 hover:bg-error/20 hover:text-error"
              title="Close Mission HUD"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ── GESTURE GUIDE TOOLTIP OVERLAY ── */}
      {showGestureGuide && (
        <div className="absolute top-18 right-8 z-[9995] w-80 rounded-2xl border border-primary/30 bg-base-200/90 p-4 shadow-2xl backdrop-blur-2xl">
          <div className="mb-2 flex items-center justify-between border-b border-primary/20 pb-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
              AR PALM GESTURE PROTOCOLS
            </span>
            <button
              type="button"
              onClick={() => setShowGestureGuide(false)}
              className="btn btn-ghost btn-xs btn-circle"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2.5 font-mono text-[11px] text-base-content/90">
            <div className="flex items-start gap-2.5">
              <span className="badge badge-primary badge-sm mt-0.5">🖐️ OPEN PALM</span>
              <span>Point & move cursor across 3D organs and buttons smoothly.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="badge badge-accent badge-sm mt-0.5">✊ CLOSED FIST</span>
              <span>Trigger instant click on targeted buttons, steps, or 3D organs.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="badge badge-secondary badge-sm mt-0.5">↔️ PALM SWIPE</span>
              <span>Swipe left or right in front of camera to navigate briefing steps!</span>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-primary/20 bg-base-300/60 p-2 text-[10px] text-secondary">
            ⚡ 100% Offline via local MediaPipe WASM & GPU delegate.
          </div>
        </div>
      )}

      {/* ── 2. DAISYUI 5-STEP PROGRESS BAR ── */}
      <div className="relative z-40 border-b border-primary/10 bg-base-300/40 px-6 py-2.5 backdrop-blur-md">
        <ul className="steps steps-horizontal w-full font-mono text-xs">
          {BRIEFING_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const Icon = step.icon;

            return (
              <li
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`step cursor-pointer transition-all ${
                  isCurrent
                    ? 'step-accent font-bold text-accent'
                    : isCompleted
                    ? 'step-primary text-primary'
                    : 'text-base-content/50'
                }`}
                data-content={isCompleted ? '✓' : idx + 1}
              >
                <div className="flex items-center gap-1.5 px-2 py-0.5">
                  <Icon size={13} style={{ color: isCurrent ? step.color : 'currentColor' }} />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── 3. MAIN COCKPIT VIEWPORT: 3D ANATOMY (LEFT) + SCIENTIFIC BRIEFING CARD (RIGHT) ── */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* ── 3A. LEFT/CENTER: 3D HUMAN ANATOMY ORGAN STAGE ── */}
        <div className="relative flex-1">
          {/* Real Three.js 3D Human Anatomy Organ Stage */}
          <HumanAnatomy3D
            activeSystem={currentStep.id}
            onSelectSystem={(sysId) => {
              const foundIdx = BRIEFING_STEPS.findIndex((s) => s.id === sysId);
              if (foundIdx !== -1) setCurrentStepIndex(foundIdx);
            }}
          />

          {/* Subtle Reticles & Step Badge in 3D Viewport */}
          <div className="pointer-events-none absolute top-4 left-6 z-20 flex flex-col gap-1">
            <span className="badge badge-outline badge-primary font-mono text-[11px] tracking-widest">
              ORGAN FOCUS // {currentStep.organLabel.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] text-base-content/60">
              [ 🖐️ POINT AT ORGANS • ✊ FIST CLICK TO INSPECT ]
            </span>
          </div>

          {/* Quick Step Pager Overlay at Bottom-Center */}
          <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-primary/20 bg-base-200/80 px-4 py-1.5 shadow-xl backdrop-blur-xl">
            <button
              type="button"
              onClick={handlePrevStep}
              className="btn btn-circle btn-ghost btn-xs text-primary hover:bg-primary/20"
              title="Previous Step (or Swipe Left)"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs tracking-wider text-base-content/90">
              STEP <span className="font-bold text-accent">{currentStepIndex + 1}</span> / {BRIEFING_STEPS.length}
            </span>
            <button
              type="button"
              onClick={handleNextStep}
              className="btn btn-circle btn-ghost btn-xs text-primary hover:bg-primary/20"
              title="Next Step (or Swipe Right)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── 3B. RIGHT: DAISYUI SCIENTIFIC BRIEFING PANEL ── */}
        <aside className="custom-scroll relative z-30 flex w-full max-w-[430px] flex-col justify-between overflow-y-auto border-l border-primary/15 bg-base-200/85 p-6 backdrop-blur-2xl">
          <div className="space-y-4">
            {/* Header Badge & Title */}
            <div>
              <div className="flex items-center justify-between">
                <span
                  className="badge badge-sm font-mono tracking-widest uppercase font-bold"
                  style={{
                    backgroundColor: `${currentStep.color}22`,
                    color: currentStep.color,
                    border: `1px solid ${currentStep.color}66`,
                  }}
                >
                  STEP 0{currentStep.stepNumber} // {currentStep.id.toUpperCase()}
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-success">
                  <CheckCircle2 size={12} /> NOMINAL
                </span>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-base-content font-tech">
                {currentStep.title}
              </h2>
              <p className="font-mono text-xs text-secondary">{currentStep.subtitle}</p>
            </div>

            {/* 4-Stat Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {currentStep.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-primary/15 bg-base-300/50 p-2.5 transition-all hover:border-primary/40"
                >
                  <div className="font-mono text-[9px] uppercase tracking-wider text-base-content/60">
                    {m.label}
                  </div>
                  <div className="mt-0.5 text-base font-bold font-tech text-primary">{m.value}</div>
                  <div className="mt-1 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-secondary">{m.status}</span>
                    <span className="text-accent">{m.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Deep Scientific Physiological Briefing */}
            <div className="rounded-xl border border-primary/20 bg-base-100/60 p-3.5 shadow-inner">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                <Activity size={12} /> CLINICAL STATUS & ASSESSMENT
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-base-content/80">
                {currentStep.briefing}
              </p>
            </div>

            {/* Medical Flight Surgeon Advisory */}
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
              <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
                <AlertTriangle size={12} /> FLIGHT SURGEON ADVISORY
              </div>
              <p className="font-mono text-[11px] leading-relaxed text-base-content/90">
                {currentStep.advisory}
              </p>
            </div>
          </div>

          {/* Bottom Step Actions */}
          <div className="mt-6 flex flex-col gap-2 border-t border-primary/15 pt-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn btn-outline btn-sm flex-1 font-mono tracking-wider text-xs border-primary/30"
              >
                ← PREV STEP
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="btn btn-primary btn-sm flex-1 font-mono tracking-wider text-xs shadow-[0_0_15px_rgba(246,238,219,0.35)]"
              >
                NEXT STEP →
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-base-content/60 px-1">
              <span>SWIPE LEFT / RIGHT OR USE PALM TO NAVIGATE</span>
              <span className="text-accent">100% OFFLINE</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ── 4. OFFLINE AR PALM MOUSE RETICLE & OPTICAL SENSOR ── */}
      <PalmMouse
        enabled={palmEnabled && !globalArEnabled}
        onSwipeNext={handleNextStep}
        onSwipePrev={handlePrevStep}
      />
    </div>
  );
}


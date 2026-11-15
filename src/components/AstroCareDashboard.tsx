import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Moon,
  Smile,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronRight,
  ShieldAlert,
  User,
  Radio,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Dumbbell,
  Plus,
  X,
  Check,
  Flame
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid
} from 'recharts';

/**
 * 3 Astronaut Profiles with Distinct Telemetry Modifiers
 */
export interface AstronautProfile {
  id: string;
  code: string;
  name: string;
  role: string;
  expedition: string;
  avatarSeed: string;
  hrOffset: number;
  bpOffset: number;
  sleepOffset: number;
  moodOffset: number;
  exerciseOffset: number;
  aredOffset: number;
}

export const ASTRONAUTS: AstronautProfile[] = [
  {
    id: 'mercer',
    code: 'SM-ISS-042',
    name: 'CDR. Alex Mercer',
    role: 'Expedition Commander',
    expedition: 'Expedition 75',
    avatarSeed: 'AM',
    hrOffset: 0,
    bpOffset: 0,
    sleepOffset: 0,
    moodOffset: 0,
    exerciseOffset: 0,
    aredOffset: 0,
  },
  {
    id: 'lin',
    code: 'FE-ISS-043',
    name: 'Dr. Sarah Lin',
    role: 'Flight Surgeon & Biomedical Officer',
    expedition: 'Expedition 75',
    avatarSeed: 'SL',
    hrOffset: -4,
    bpOffset: -5,
    sleepOffset: 0.4,
    moodOffset: 0.3,
    exerciseOffset: -8,
    aredOffset: -260,
  },
  {
    id: 'rostova',
    code: 'MS-ISS-044',
    name: 'Spc. Elena Rostova',
    role: 'EVA Lead Specialist',
    expedition: 'Expedition 75',
    avatarSeed: 'ER',
    hrOffset: 3,
    bpOffset: 4,
    sleepOffset: -0.3,
    moodOffset: -0.2,
    exerciseOffset: 8,
    aredOffset: 140,
  },
];

export interface MissionRecord {
  day: number;
  date: string;
  phase: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  bloodPressure: string;
  spo2: number;
  temperature: number;
  sleepHours: number;
  moodScore: number;
  exerciseMinutes: number;
  aredLoadKg: number;
  cardioMinutes: number;
  cardioBpm: number;
  journal?: string;
  alert?: {
    type: 'nominal' | 'advisory' | 'critical';
    message: string;
  };
}

/**
 * Generate synthetic 180-day telemetry records calibrated for long-duration microgravity
 */
function generateMissionRecords(astronaut: AstronautProfile): MissionRecord[] {
  const records: MissionRecord[] = [];
  const start = new Date('2026-03-01T00:00:00Z');

  for (let i = 1; i <= 180; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + (i - 1));

    // Mathematical model for microgravity cardiovascular adaptation
    const launchSpike = 16 * Math.exp(-i / 8);
    const circadianSine = Math.sin(i / 7) * 3;
    const hr = Math.round(63 + astronaut.hrOffset + launchSpike + circadianSine);

    const bpSpike = 10 * Math.exp(-i / 12);
    const bpCos = Math.cos(i / 8) * 3;
    const sys = Math.round(112 + astronaut.bpOffset + bpSpike + bpCos);
    const dia = Math.round(sys * 0.63);

    const temp = parseFloat((36.6 + Math.sin(i / 15) * 0.22).toFixed(1));
    const sleep = Math.min(
      9.6,
      Math.max(
        5.1,
        parseFloat((7.3 + astronaut.sleepOffset + Math.cos(i / 7) * 0.78).toFixed(1))
      )
    );
    const mood = Math.min(
      10,
      Math.max(
        4.8,
        parseFloat((8.1 + astronaut.moodOffset + Math.sin(i / 10) * 1.15).toFixed(1))
      )
    );

    // Exercise countermeasure telemetry
    let exerciseMin = Math.round(
      132 + astronaut.exerciseOffset + Math.sin(i / 6) * 8 + Math.cos(i / 13) * 4
    );
    let aredKg = Math.round(
      1820 + astronaut.aredOffset + Math.sin(i / 5) * 90
    );
    let cardioMin = 45;
    let cardioBpm = 138;

    if (i === 112 && astronaut.id === 'mercer') {
      exerciseMin = 135;
      aredKg = 1840;
      cardioMin = 45;
      cardioBpm = 138;
    } else if (i === 1) {
      exerciseMin = 25;
      aredKg = 350;
      cardioMin = 20;
      cardioBpm = 118;
    } else if (i === 42) {
      exerciseMin = 90;
      aredKg = 1100;
      cardioMin = 30;
      cardioBpm = 144;
    } else if (i === 135) {
      exerciseMin = 65;
      aredKg = 850;
      cardioMin = 35;
      cardioBpm = 126;
    } else if (i >= 175) {
      exerciseMin = Math.min(150, 144 + astronaut.exerciseOffset);
      aredKg = 2080 + astronaut.aredOffset;
      cardioMin = 50;
      cardioBpm = 142;
    }

    let phase = 'In-Flight Adaptation';
    if (i <= 5) phase = 'Launch & Insertion';
    else if (i === 42) phase = 'Extravehicular Activity (EVA)';
    else if (i >= 88 && i <= 92) phase = 'Mid-Mission Evaluation';
    else if (i === 135) phase = 'Solar Event Shelter Protocol';
    else if (i > 165) phase = 'Pre-Return Preparation';

    // Mission log journal notes
    let journal = undefined;
    let alert: { type: 'nominal' | 'advisory' | 'critical'; message: string } | undefined = undefined;

    if (i === 1) {
      journal = 'Successful liftoff from Kennedy LC-39A. Microgravity acclimation initiated. Telemetry nominal.';
      alert = { type: 'nominal', message: 'T+0 Insertion nominal. Vestibular adaptation underway.' };
    } else if (i === 14) {
      journal = 'Routine cycle testing on ARED resistance trainer. Core vitals stabilized to microgravity baseline.';
    } else if (i === 42) {
      journal = '6.4-hour spacewalk (EVA) on Columbus exterior module. Elevated heart rate observed during hatch ingress.';
      alert = { type: 'advisory', message: 'Post-EVA fatigue noted. Supplementary hydration prescribed.' };
    } else if (i === 90) {
      journal = 'Mid-mission milestone reached (Day 90/180). Cognitive PVT reaction latency within top 5th percentile.';
      alert = { type: 'nominal', message: 'All biological telemetry metrics meeting NASA benchmark criteria.' };
    } else if (i === 135) {
      journal = 'Class M2 solar flare precaution. Crew assembled in aft shielded wardroom. Moderate sleep shift.';
      alert = { type: 'advisory', message: 'Dosimeter radiation levels logged well below quarterly safety threshold.' };
    } else if (i === 175) {
      journal = 'Centrifuge re-adaptation simulations and high-load lower-body negative pressure (LBNP) runs.';
    } else if (i === 180) {
      journal = 'Pre-departure cargo packing & Dragon hatch seal verification. Crew readiness evaluated at 98.4%.';
      alert = { type: 'nominal', message: 'Landing readiness certificate approved by Flight Control Houston.' };
    }

    records.push({
      day: i,
      date: d.toISOString().split('T')[0],
      phase,
      heartRate: hr,
      systolic: sys,
      diastolic: dia,
      bloodPressure: `${sys}/${dia}`,
      spo2: 98,
      temperature: temp,
      sleepHours: sleep,
      moodScore: mood,
      exerciseMinutes: exerciseMin,
      aredLoadKg: aredKg,
      cardioMinutes: cardioMin,
      cardioBpm: cardioBpm,
      journal,
      alert,
    });
  }

  return records;
}

/**
 * Semi-Circular Gauge Component in Oat Yellow & Ink Blue
 */
interface SemiGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  targetText: string;
  colorHex?: string;
  formatFn?: (v: number) => string;
  showGlowDot?: boolean;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footerContent?: React.ReactNode;
  cardClassName?: string;
}

export function SemiCircularGauge({
  label,
  value,
  max,
  unit,
  targetText,
  colorHex = '#F5B82E',
  formatFn,
  showGlowDot = true,
  subtitle,
  headerAction,
  footerContent,
  cardClassName = 'bg-[#0B152C]/90 border border-slate-700/40 rounded-xl p-4 sm:p-5',
}: SemiGaugeProps) {
  const radius = 56;
  const cx = 75;
  const cy = 70;
  const circumference = Math.PI * radius; // ~175.929
  const clampedVal = Math.max(0, Math.min(value, max));
  const progressRatio = clampedVal / max;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Exact endpoint coordinates for the glowing endpoint dot
  const angleRad = Math.PI * progressRatio;
  const dotX = cx - radius * Math.cos(angleRad);
  const dotY = cy - radius * Math.sin(angleRad);

  const displayVal = formatFn ? formatFn(value) : value.toFixed(1);

  return (
    <div
      className={`${cardClassName} flex flex-col items-center justify-between shadow-lg relative overflow-hidden group hover:border-[#FACC15]/40 transition-all duration-300 w-full`}
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-[#FACC15]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Row: Label & Optional Action */}
      <div className="w-full flex items-center justify-between gap-2 mb-1.5 relative z-10">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold text-center flex-1">
          {label}
        </span>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Semicircular SVG Meter */}
      <div className="relative w-[150px] h-[85px] flex items-center justify-center my-0.5">
        <svg width="150" height="85" viewBox="0 0 150 85" className="overflow-visible">
          {/* Background Track Arc */}
          <path
            d="M 19 70 A 56 56 0 0 1 131 70"
            fill="none"
            stroke="#162752"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Active Gradient Arc in Oat Yellow */}
          <path
            d="M 19 70 A 56 56 0 0 1 131 70"
            fill="none"
            stroke={colorHex}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${colorHex}88)`,
            }}
          />

          {/* Target tick marker at 80% */}
          <circle cx="106" cy="27" r="2.5" fill="#FFFDF7" opacity="0.6" />

          {/* Glowing White Endpoint Dot at tip of active arc */}
          {showGlowDot && progressRatio > 0.02 && (
            <g className="transition-all duration-500 ease-out">
              <circle
                cx={dotX}
                cy={dotY}
                r="4.5"
                fill="#FFFFFF"
                style={{
                  filter: `drop-shadow(0 0 6px ${colorHex}) drop-shadow(0 0 10px #FFFFFF)`,
                }}
              />
              <circle cx={dotX} cy={dotY} r="2.5" fill={colorHex} />
            </g>
          )}
        </svg>

        {/* Numeric Readout Centered at Bottom */}
        <div className="absolute bottom-1 flex flex-col items-center text-center">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-[#FFFDF7] font-sans drop-shadow-sm">
              {displayVal}
            </span>
            <span className="text-[11px] text-[#FACC15] font-mono font-bold">
              {unit}
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-amber-200/80 font-mono font-semibold">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Yellow-dot baseline caption */}
      <p className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1.5 text-center">
        <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></span>
        <span>{targetText}</span>
      </p>

      {/* Optional Compact Footer Content / Pills */}
      {footerContent && <div className="w-full mt-2 relative z-10">{footerContent}</div>}
    </div>
  );
}

/**
 * Main AstroCare ISS Monitor Dashboard
 */
interface AstroCareDashboardProps {
  onBack?: () => void;
  isEmbedded?: boolean;
}

export default function AstroCareDashboard({
  onBack,
  isEmbedded = false,
}: AstroCareDashboardProps) {
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('mercer');
  const [currentDay, setCurrentDay] = useState<number>(112);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [activeMetrics, setActiveMetrics] = useState({
    hr: true,
    bp: true,
    temp: true,
  });

  // User-logged exercise sessions state
  const [loggedSessions, setLoggedSessions] = useState<
    Record<string, { minutes: number; aredKg: number }>
  >({});
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [logForm, setLogForm] = useState({
    type: 'ARED Resistive',
    duration: 30,
    volume: 250,
    avgBpm: 140,
  });
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const selectedAstronaut = useMemo(
    () => ASTRONAUTS.find((a) => a.id === selectedAstronautId) || ASTRONAUTS[0],
    [selectedAstronautId]
  );

  const dataset = useMemo(
    () => generateMissionRecords(selectedAstronaut),
    [selectedAstronaut]
  );

  const currentRecord = useMemo(
    () => dataset[currentDay - 1] || dataset[0],
    [dataset, currentDay]
  );

  // Dynamic user-logged modifiers
  const sessionKey = `${selectedAstronaut.id}-${currentDay}`;
  const extraExercise = loggedSessions[sessionKey] || { minutes: 0, aredKg: 0 };
  const effectiveExerciseMin = Math.min(
    180,
    currentRecord.exerciseMinutes + extraExercise.minutes
  );
  const effectiveAredLoad = currentRecord.aredLoadKg + extraExercise.aredKg;

  // Auto-replay timer
  const playIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        setCurrentDay((prev) => {
          if (prev >= 180) {
            setIsPlaying(false);
            return 180;
          }
          return prev + 1;
        });
      }, 500 / playSpeed);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playSpeed]);

  const jumpToDay = (day: number) => {
    const clamped = Math.max(1, Math.min(180, day));
    setCurrentDay(clamped);
  };

  const handleLogExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedSessions((prev) => {
      const existing = prev[sessionKey] || { minutes: 0, aredKg: 0 };
      return {
        ...prev,
        [sessionKey]: {
          minutes: existing.minutes + logForm.duration,
          aredKg:
            existing.aredKg +
            (logForm.type.includes('ARED') ? logForm.volume : 0),
        },
      };
    });

    setIsLogModalOpen(false);
    setSaveToast(`+${logForm.duration}m ${logForm.type} logged on Day ${currentDay}!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  return (
    <div
      className={
        isEmbedded
          ? 'w-full flex flex-col bg-[#060D21] text-slate-100 rounded-2xl border border-blue-400/20 shadow-2xl overflow-hidden relative'
          : 'min-h-screen flex flex-col bg-[#060D21] bg-[radial-gradient(ellipse_at_top,_#0F214D_0%,_#060D21_70%)] text-slate-100 font-sans relative'
      }
    >
      {/* Toast Notification */}
      {saveToast && (
        <div className="absolute top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-500/90 text-slate-950 font-mono text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 1. DASHBOARD TOP HEADER & MISSION MET IDENTIFIER */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 py-3.5 bg-[#07112E]/95 border-b border-blue-400/15 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-400/20 text-xs font-semibold text-cyan-300 transition-all cursor-pointer active:scale-95"
              >
                <span>← Back</span>
              </button>
            )}

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-[#F5B82E] p-0.5 shadow-lg shadow-amber-400/20 flex items-center justify-center text-slate-950 font-black text-lg">
              🛰️
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/10 border border-amber-400/30 text-[#FDE047]">
                  ASTROCARE 2.0
                </span>
                <span className="text-xs font-mono text-cyan-300 tracking-wider font-semibold">
                  NASA EXPEDITION 75 TELEMETRY REPLAY
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                Long-Duration ISS Crew Health & Vitals Monitor
              </h1>
            </div>
          </div>

          {/* Crew Selector Pill & Status */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-mono text-slate-400 hidden lg:inline-block">
              Astronaut Profile:
            </span>
            <div className="flex items-center bg-[#0B1736] p-1 rounded-xl border border-blue-400/20">
              {ASTRONAUTS.map((astro) => (
                <button
                  key={astro.id}
                  type="button"
                  onClick={() => setSelectedAstronautId(astro.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedAstronautId === astro.id
                      ? 'bg-gradient-to-r from-amber-400 to-[#F5B82E] text-slate-950 font-bold shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {astro.name.split(' ')[1]} ({astro.avatarSeed})
                </button>
              ))}
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Telemetry Lock</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. TIMELINE SCRUBBER & SUBJECT CONTROLS BANNER */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 w-full">
        <div className="bg-[#0B1736]/90 border border-blue-400/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col lg:flex-row items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-40 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          {/* Subject Badge & Current MET */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-[#07112E] border-2 border-amber-400/40 flex items-center justify-center font-mono font-extrabold text-[#FDE047] text-lg shadow-inner">
              {selectedAstronaut.avatarSeed}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {selectedAstronaut.name}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 rounded">
                  {selectedAstronaut.code}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-400/10 text-[#FDE047] border border-amber-400/30 rounded">
                  {selectedAstronaut.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 font-mono">
                <span>Timeline Position:</span>
                <span className="text-[#FDE047] font-bold">
                  Day {currentRecord.day} ({currentRecord.date})
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-300 font-semibold">{currentRecord.phase}</span>
              </p>
            </div>
          </div>

          {/* Preset Quick-Jump Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
            <button
              type="button"
              onClick={() => jumpToDay(1)}
              className="px-3 py-1.5 bg-[#060F28] hover:bg-blue-900/60 border border-blue-400/20 text-xs font-semibold rounded-lg text-slate-300 transition-all cursor-pointer active:scale-95"
            >
              Launch (D-1)
            </button>
            <button
              type="button"
              onClick={() => jumpToDay(42)}
              className="px-3 py-1.5 bg-[#060F28] hover:bg-blue-900/60 border border-blue-400/20 text-xs font-semibold rounded-lg text-slate-300 transition-all cursor-pointer active:scale-95"
            >
              EVA Spacewalk (D-42)
            </button>
            <button
              type="button"
              onClick={() => jumpToDay(90)}
              className="px-3 py-1.5 bg-[#060F28] hover:bg-blue-900/60 border border-blue-400/20 text-xs font-semibold rounded-lg text-slate-300 transition-all cursor-pointer active:scale-95"
            >
              Mid-Mission (D-90)
            </button>
            <button
              type="button"
              onClick={() => jumpToDay(135)}
              className="px-3 py-1.5 bg-[#060F28] hover:bg-blue-900/60 border border-blue-400/20 text-xs font-semibold rounded-lg text-slate-300 transition-all cursor-pointer active:scale-95"
            >
              Solar Shelter (D-135)
            </button>
            <button
              type="button"
              onClick={() => jumpToDay(180)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-[#F5B82E] hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer active:scale-95"
            >
              Landing Prep (D-180)
            </button>
          </div>
        </div>

        {/* 3. 4 CORE VITALS CARDS (SPACE TELEMETRY OBSIDIAN THEME MATCHING REFERENCE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Heart Rate Card */}
          <div className="bg-[#0B1736]/80 border border-blue-400/15 rounded-2xl p-4 shadow-xl hover:border-blue-400/35 transition-all group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                Heart Rate (HR)
              </span>
              <Heart className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-black text-cyan-300 font-sans tracking-tight">
                {currentRecord.heartRate}
              </h3>
              <span className="text-xs font-mono text-slate-400 font-bold">BPM</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-mono flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Resting Pace</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">Baseline: 64 BPM</span>
            </div>
          </div>

          {/* Blood Pressure Card */}
          <div className="bg-[#0B1736]/80 border border-blue-400/15 rounded-2xl p-4 shadow-xl hover:border-yellow-400/35 transition-all group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                Blood Pressure
              </span>
              <Activity className="w-4 h-4 text-[#FDE047] group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-black text-[#FDE047] font-sans tracking-tight">
                {currentRecord.bloodPressure}
              </h3>
              <span className="text-xs font-mono text-slate-400 font-bold">mmHg</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="text-cyan-300 font-mono font-semibold">Microgravity Reg.</span>
              <span className="text-slate-400 font-mono text-[10px]">Sys/Dia</span>
            </div>
          </div>

          {/* Core Temperature Card */}
          <div className="bg-[#0B1736]/80 border border-blue-400/15 rounded-2xl p-4 shadow-xl hover:border-yellow-400/35 transition-all group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                Core Temperature
              </span>
              <Thermometer className="w-4 h-4 text-[#FDE047] group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-black text-[#FDE047] font-sans tracking-tight">
                {currentRecord.temperature}
              </h3>
              <span className="text-xs font-mono text-slate-400 font-bold">°C</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-mono font-semibold">Thermoregulated</span>
              <span className="text-slate-400 font-mono text-[10px]">Optimal 36.6°C</span>
            </div>
          </div>

          {/* Blood Oxygen (SpO2) Card */}
          <div className="bg-[#0B1736]/80 border border-blue-400/15 rounded-2xl p-4 shadow-xl hover:border-emerald-400/35 transition-all group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
                Blood Oxygen (SpO2)
              </span>
              <Wind className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <h3 className="text-3xl font-black text-emerald-400 font-sans tracking-tight">
                {currentRecord.spo2}%
              </h3>
              <span className="text-xs font-mono text-slate-400 font-bold">O₂ Sat</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-mono font-semibold">Cabin Norm: 21.0 kPa</span>
              <span className="text-slate-400 font-mono text-[10px]">Nominal</span>
            </div>
          </div>

        </div>

        {/* 4. CHARTS & WELLBEING GAUGES DUAL COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Multi-Metric Trend Chart (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-[#0B1736]/90 border border-blue-400/20 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    180-Day Mission Vitals & Adaptation Trajectory
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
                    Interactive
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Click any point along the curve or scrub the slider to jump timeline coordinates.
                </p>
              </div>

              {/* Metric Toggle Filters */}
              <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMetrics((prev) => ({ ...prev, hr: !prev.hr }))
                  }
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    activeMetrics.hr
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-500'
                  }`}
                >
                  ● HR
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveMetrics((prev) => ({ ...prev, bp: !prev.bp }))
                  }
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    activeMetrics.bp
                      ? 'bg-amber-400/20 border-amber-400 text-[#FDE047]'
                      : 'bg-slate-800/60 border-slate-700 text-slate-500'
                  }`}
                >
                  ● BP
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveMetrics((prev) => ({ ...prev, temp: !prev.temp }))
                  }
                  className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    activeMetrics.temp
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-500'
                  }`}
                >
                  ● Temp
                </button>
              </div>
            </div>

            {/* Recharts Multi-Metric Chart Canvas (Reduced compact height) */}
            <div className="h-48 sm:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={dataset}
                  onClick={(e) => {
                    if (e && e.activePayload && e.activePayload.length > 0) {
                      const clickedDay = e.activePayload[0].payload.day;
                      if (clickedDay) jumpToDay(clickedDay);
                    }
                  }}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="astroAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2F5A" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `D-${val}`}
                    interval={25}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[50, 130]}
                    tickCount={5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#07112E',
                      borderColor: '#38BDF8',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                    }}
                    labelFormatter={(label) => `Mission Day ${label}`}
                  />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    iconType="circle"
                    formatter={(val) => <span className="text-xs text-slate-300 font-mono">{val}</span>}
                  />

                  {/* Vertical Reference Line at Current MET */}
                  <ReferenceLine
                    x={currentDay}
                    stroke="#F5B82E"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{
                      value: `Selected: D-${currentDay}`,
                      fill: '#FDE047',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />

                  {activeMetrics.hr && (
                    <Area
                      type="monotone"
                      dataKey="heartRate"
                      name="Heart Rate (BPM)"
                      stroke="#38BDF8"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#astroAreaGradient)"
                      dot={false}
                    />
                  )}

                  {activeMetrics.bp && (
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      name="Systolic BP (mmHg)"
                      stroke="#F5B82E"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  )}

                  {activeMetrics.temp && (
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      name="Core Temp (°C)"
                      stroke="#FB7185"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Interactive Timeline Slider & Play/Pause Controls */}
            <div className="mt-4 pt-3.5 border-t border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-[#F5B82E] text-slate-950 font-bold text-xs shadow-md hover:from-amber-300 hover:to-amber-500 transition-all cursor-pointer active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Replay</span>
                    </>
                  )}
                </button>

                {/* Speed Toggle */}
                <div className="flex items-center bg-[#060F28] border border-blue-400/20 rounded-lg p-0.5">
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaySpeed(spd)}
                      className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-colors cursor-pointer ${
                        playSpeed === spd
                          ? 'bg-blue-800 text-cyan-300'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => jumpToDay(1)}
                  className="p-1.5 text-slate-400 hover:text-white bg-[#060F28] border border-blue-400/20 rounded-lg transition-colors cursor-pointer"
                  title="Reset to Day 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Timeline Slider Track */}
              <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 max-w-md">
                <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                  Scrub:
                </span>
                <input
                  type="range"
                  min="1"
                  max="180"
                  value={currentDay}
                  onChange={(e) => jumpToDay(parseInt(e.target.value, 10))}
                  className="w-full accent-[#F5B82E] cursor-pointer h-2 bg-[#060F28] rounded-lg"
                />
                <span className="text-xs font-mono font-bold text-[#FDE047] whitespace-nowrap min-w-[56px] text-right">
                  Day {currentDay}
                </span>
              </div>
            </div>
          </div>

          {/* Oat Yellow Wellbeing Gauges & Mission Journal (Spans 1 column) */}
          <div className="bg-[#0B1736]/90 border border-blue-400/20 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Crew Wellbeing Gauges
                </h2>
                <span className="text-[10px] font-mono text-[#FDE047] font-semibold">
                  OAT YELLOW METRICS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Restorative sleep, countermeasure exercise & cognitive readiness.
              </p>
            </div>

            {/* 3 Semi-Circular Gauges: Sleep, Exercise, and Mood */}
            <div className="flex flex-col gap-3.5">
              
              {/* 1. Daily Restorative Sleep */}
              <SemiCircularGauge
                label="DAILY RESTORATIVE SLEEP"
                value={currentRecord.sleepHours}
                max={10}
                unit="h"
                targetText="Target: 8.0h Rest Baseline"
                colorHex="#F5B82E"
                cardClassName="bg-[#0B152C]/90 border border-slate-700/40 rounded-xl p-4 sm:p-5"
              />

              {/* 2. NEW: Daily Exercise Countermeasure (Directly Below Sleep) */}
              <SemiCircularGauge
                label="DAILY EXERCISE COUNTERMEASURE"
                value={effectiveExerciseMin}
                max={150}
                unit="min"
                targetText="• Target: 150m ARED / T2 Baseline"
                colorHex="#FACC15"
                showGlowDot={true}
                subtitle={`${Math.round((effectiveExerciseMin / 150) * 100)}% of Daily Target`}
                headerAction={
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#FACC15]/10 hover:bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/35 transition-all cursor-pointer active:scale-95 shadow-sm"
                    title="Log ARED or T2 Workout Session"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Log Session</span>
                  </button>
                }
                cardClassName="bg-[#0B152C]/90 border border-slate-700/40 rounded-xl p-4 sm:p-5 hover:border-[#FACC15]/50 transition-all"
                footerContent={
                  <div className="flex items-center gap-2 mt-2 w-full justify-center flex-wrap pt-2 border-t border-slate-800/60">
                    <div className="px-2.5 py-1 rounded-lg bg-[#060F28] border border-blue-400/20 font-mono text-[10px] text-slate-300 flex items-center gap-1.5 shadow-sm">
                      <Dumbbell className="w-3 h-3 text-[#FACC15]" />
                      <span className="text-slate-400">ARED LOAD:</span>
                      <span className="font-bold text-[#FFFDF7]">
                        {effectiveAredLoad.toLocaleString()} kg
                      </span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-[#060F28] border border-blue-400/20 font-mono text-[10px] text-slate-300 flex items-center gap-1.5 shadow-sm">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span className="text-slate-400">T2 / CEVIS:</span>
                      <span className="font-bold text-[#FFFDF7]">
                        {currentRecord.cardioMinutes} min • {currentRecord.cardioBpm} bpm
                      </span>
                    </div>
                  </div>
                }
              />

              {/* 3. Psychological Readiness Index */}
              <SemiCircularGauge
                label="PSYCHOLOGICAL READINESS INDEX"
                value={currentRecord.moodScore}
                max={10}
                unit="/10"
                targetText="Behavioral Stability Normal"
                colorHex="#FDE047"
                cardClassName="bg-[#0B152C]/90 border border-slate-700/40 rounded-xl p-4 sm:p-5"
              />
            </div>

            {/* 4. Contextual Daily Flight Journal Entry */}
            <div className="bg-[#060F28] border border-blue-400/15 rounded-xl p-3.5 text-left">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 mb-1">
                <Radio className="w-3.5 h-3.5 text-[#F5B82E]" />
                <span>Mission Journal Log: Day {currentRecord.day}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {currentRecord.journal ||
                  `Standard orbital shift. Physical countermeasure workout complete on ARED. Microgravity vitals logged in accordance with Flight Rule 4.2.`}
              </p>
              {currentRecord.alert && (
                <div
                  className={`mt-2.5 p-2 rounded-lg text-[11px] font-mono flex items-center gap-1.5 ${
                    currentRecord.alert.type === 'critical'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      : currentRecord.alert.type === 'advisory'
                      ? 'bg-amber-500/10 text-[#FDE047] border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{currentRecord.alert.message}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* 5. QUICK-LOG EXERCISE SESSION MODAL DIALOG */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0B152C] border border-[#FACC15]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15]">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Log Exercise Countermeasure</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedAstronaut.name} • Day {currentDay} ({currentRecord.date})
                </p>
              </div>
            </div>

            <form onSubmit={handleLogExerciseSubmit} className="space-y-4 mt-5">
              {/* Protocol Type Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase tracking-wider font-semibold">
                  Exercise Countermeasure Protocol
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'ARED Resistive',
                    'T2 Treadmill',
                    'CEVIS Cycle',
                  ].map((proto) => (
                    <button
                      key={proto}
                      type="button"
                      onClick={() => setLogForm({ ...logForm, type: proto })}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                        logForm.type === proto
                          ? 'bg-[#FACC15]/20 border-[#FACC15] text-[#FACC15] font-bold shadow-md shadow-[#FACC15]/10'
                          : 'bg-[#060F28] border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {proto.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Duration */}
              <div>
                <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1">
                  <span className="uppercase tracking-wider font-semibold">Session Duration</span>
                  <span className="text-[#FACC15] font-bold">{logForm.duration} minutes</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={logForm.duration}
                  onChange={(e) =>
                    setLogForm({ ...logForm, duration: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-[#FACC15] h-2 bg-[#060F28] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>15m Quick</span>
                  <span>45m Nominal</span>
                  <span>90m High-Load</span>
                </div>
              </div>

              {/* ARED Volume or Cardio Output */}
              {logForm.type.includes('ARED') ? (
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1">
                    <span className="uppercase tracking-wider font-semibold">ARED Resistance Load Volume</span>
                    <span className="text-[#FACC15] font-bold">+{logForm.volume} kg</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="600"
                    step="50"
                    value={logForm.volume}
                    onChange={(e) =>
                      setLogForm({ ...logForm, volume: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-[#FACC15] h-2 bg-[#060F28] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>+100 kg</span>
                    <span>+350 kg</span>
                    <span>+600 kg</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-300 mb-1">
                    <span className="uppercase tracking-wider font-semibold">Average Aerobic Heart Rate</span>
                    <span className="text-cyan-400 font-bold">{logForm.avgBpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="115"
                    max="165"
                    step="1"
                    value={logForm.avgBpm}
                    onChange={(e) =>
                      setLogForm({ ...logForm, avgBpm: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-cyan-400 h-2 bg-[#060F28] rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>115 BPM (Endurance)</span>
                    <span>140 BPM (Target)</span>
                    <span>165 BPM (Sprint)</span>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-[#FACC15] hover:from-amber-300 hover:to-yellow-400 shadow-lg shadow-[#FACC15]/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Commit Session to Telemetry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

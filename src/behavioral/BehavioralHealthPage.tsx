import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardCheck,
  Feather,
  FileBarChart2,
  RotateCcw,
  Timer,
  UserCheck,
} from 'lucide-react';
import { PartAForm } from './components/PartAForm';
import { PartBForm } from './components/PartBForm';
import { PartCReport } from './components/PartCReport';
import { PVTActivity } from './components/PVTActivity';
import { ReflectionsView } from './components/ReflectionsView';
import {
  DEFAULT_DAY_24_DRAFT,
  DEFAULT_PART_A,
  INITIAL_MISSION_LOG,
} from './data/assessmentData';
import { PartAAnswers, PartBEntry, PVTResult } from './types/assessment';
import { scoreMissionEntries, scorePartA } from './utils/scoring';

type NavSection = 'daily' | 'baseline' | 'report' | 'pvt' | 'reflections';

const STORAGE_KEY = 'lumina_path_behavioural_v1';
const PVT_STORAGE_KEY = 'lumina_path_pvt_v1';

interface StoredState {
  partA: PartAAnswers;
  missionLog: PartBEntry[];
  draft: PartBEntry;
}

function createBlankDayEntry(day: number): PartBEntry {
  return {
    day,
    dateLabel: `FD ${day}`,
    mood: { 1: 1, 2: 1, 3: 1, 4: 4, 5: 4, 6: 4 },
    hoursSlept: 7.0,
    sleepQuality: 3,
    workload: 3,
    notableEvent: 1,
    note: '',
    reflectionType: 'journal',
    reflection: '',
    b3: { before: null, behaviours: [], after: null },
    crewObservation: 'Engaged',
  };
}

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      if (parsed.partA && Array.isArray(parsed.missionLog) && parsed.draft) {
        return parsed;
      }
    }
  } catch {
    // Fallback to realistic seeded Day 24 mission state
  }
  return {
    partA: DEFAULT_PART_A,
    missionLog: INITIAL_MISSION_LOG,
    draft: DEFAULT_DAY_24_DRAFT,
  };
}

function loadInitialPvtResults(): PVTResult[] {
  try {
    const raw = localStorage.getItem(PVT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PVTResult[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return [];
}

interface BehavioralHealthPageProps {
  onBack?: () => void;
}

export default function BehavioralHealthPage({ onBack }: BehavioralHealthPageProps = {}) {
  const [initial] = useState<StoredState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<NavSection>('daily');
  const [partA, setPartA] = useState<PartAAnswers>(initial.partA);
  const [missionLog, setMissionLog] = useState<PartBEntry[]>(initial.missionLog);
  const [draft, setDraft] = useState<PartBEntry>(initial.draft);
  const [pvtResults, setPvtResults] = useState<PVTResult[]>(() =>
    loadInitialPvtResults()
  );
  const [selectedReportDay, setSelectedReportDay] = useState<number>(initial.draft.day);
  const [justSavedDay, setJustSavedDay] = useState<number | null>(null);
  const [savedPartAToast, setSavedPartAToast] = useState(false);
  const [editSessionKey, setEditSessionKey] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ partA, missionLog, draft })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [partA, missionLog, draft]);

  useEffect(() => {
    try {
      localStorage.setItem(PVT_STORAGE_KEY, JSON.stringify(pvtResults));
    } catch {
      // Ignore storage quota errors
    }
  }, [pvtResults]);

  const partAResult = useMemo(() => scorePartA(partA), [partA]);

  // Combine logged entries with the live draft (unless that day is already logged and user isn't editing it)
  const combinedEntries = useMemo(() => {
    const withoutDraftDay = missionLog.filter((e) => e.day !== draft.day);
    return [...withoutDraftDay, draft];
  }, [missionLog, draft]);

  const { baseline, scoredDays } = useMemo(
    () => scoreMissionEntries(combinedEntries, partAResult),
    [combinedEntries, partAResult]
  );

  const isEditingLoggedDay = missionLog.some((e) => e.day === draft.day);
  const isLivePreview = selectedReportDay === draft.day && !isEditingLoggedDay;

  const handleLogDailyCheck = () => {
    const updatedLog = [
      ...missionLog.filter((e) => e.day !== draft.day),
      draft,
    ].sort((a, b) => a.day - b.day);

    setMissionLog(updatedLog);
    setJustSavedDay(draft.day);
    setSelectedReportDay(draft.day);

    const maxLoggedDay = updatedLog.reduce((max, e) => Math.max(max, e.day), 0);
    const nextDayNum = maxLoggedDay + 1;
    setDraft(createBlankDayEntry(nextDayNum));

    setTimeout(() => {
      setJustSavedDay(null);
    }, 2400);

    // On mobile/tablet single-column view, jump straight to Part C report after logging
    if (window.innerWidth < 1024) {
      setActiveTab('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSavePartA = () => {
    setSavedPartAToast(true);
    setTimeout(() => setSavedPartAToast(false), 2200);
  };

  const handleSavePvtResult = (result: PVTResult) => {
    setPvtResults((prev) => [result, ...prev]);
  };

  const handleDeletePvtResult = (id: string) => {
    setPvtResults((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditDayReflection = (day: number) => {
    const target = missionLog.find((e) => e.day === day);
    if (!target) return;
    setDraft({
      ...target,
      reflectionType: target.reflectionType ?? 'journal',
      reflection: target.reflection ?? '',
    });
    setSelectedReportDay(target.day);
    setEditSessionKey((n) => n + 1);
    setActiveTab('daily');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReflection = (day: number) => {
    setMissionLog((prev) =>
      prev.map((entry) =>
        entry.day === day ? { ...entry, reflection: '' } : entry
      )
    );
    if (draft.day === day) {
      setDraft((prev) => ({ ...prev, reflection: '' }));
    }
  };

  const handleSaveGalleryReflection = (
    type: 'journal' | 'poem',
    text: string
  ) => {
    const updatedEntry: PartBEntry = {
      ...draft,
      reflectionType: type,
      reflection: text,
    };
    setDraft(updatedEntry);
    setEditSessionKey((n) => n + 1);
    setMissionLog((prev) => {
      const existing = prev.find((e) => e.day === draft.day);
      const nextEntry: PartBEntry = existing
        ? { ...existing, reflectionType: type, reflection: text }
        : updatedEntry;
      return [...prev.filter((e) => e.day !== draft.day), nextEntry].sort(
        (a, b) => a.day - b.day
      );
    });
  };

  const handleReturnToNextDay = () => {
    const maxLoggedDay = missionLog.reduce((max, e) => Math.max(max, e.day), 0);
    const nextDayNum = maxLoggedDay + 1;
    setDraft(createBlankDayEntry(nextDayNum));
    setSelectedReportDay(nextDayNum);
    setEditSessionKey((n) => n + 1);
  };

  const handleExportJson = () => {
    const payload = {
      app: 'Lumina Path & CrewMind',
      exportedAt: new Date().toISOString(),
      partA,
      missionLog,
      pvtResults,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina-path-crewmind-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = () => {
    setMissionLog([]);
    setPvtResults([]);
    const freshDay1 = createBlankDayEntry(1);
    setDraft(freshDay1);
    setSelectedReportDay(1);
    setJustSavedDay(null);
    setEditSessionKey((n) => n + 1);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PVT_STORAGE_KEY);
  };

  const handleResetDemo = () => {
    setPartA(DEFAULT_PART_A);
    setMissionLog(INITIAL_MISSION_LOG);
    setDraft(DEFAULT_DAY_24_DRAFT);
    setPvtResults([]);
    setSelectedReportDay(DEFAULT_DAY_24_DRAFT.day);
    setJustSavedDay(null);
    setEditSessionKey((n) => n + 1);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PVT_STORAGE_KEY);
  };

  const navItems: { id: NavSection; label: string }[] = [
    { id: 'daily', label: 'Daily Check' },
    { id: 'baseline', label: 'Part A Baseline' },
    { id: 'report', label: 'Part C Report' },
    { id: 'pvt', label: 'Attention (PVT)' },
    { id: 'reflections', label: 'Journal & Poetry' },
  ];

  return (
    <div className="min-h-screen flex flex-col text-[#F5EEDB] pb-20 lg:pb-10">
      {/* Three-Zone Top Bar on Shaded Ink Blue Canvas */}
      <header className="w-full border-b border-white/10 bg-[#0D1C33]/65 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand Title & Return Navigation */}
          <div className="flex items-center gap-3 shrink-0">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95"
                title="Return to Telemetry Dashboard"
              >
                <span>← Back to Telemetry</span>
              </button>
            )}
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('daily');
              }}
              className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#F7F0DC] whitespace-nowrap shrink-0 hover:text-[#FDE047] transition-colors"
            >
              CrewMind Behavioral
            </a>
          </div>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav
            aria-label="Assessment sections"
            className="hidden md:flex items-center gap-4 lg:gap-6 text-xs lg:text-sm font-medium"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                    active
                      ? 'text-[#F7F0DC] border-[#E2D1A8]'
                      : 'text-[#A9BCD6] border-transparent hover:text-[#F7F0DC]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Header Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleResetDemo}
              className="min-h-[38px] px-4 py-1.5 rounded-full text-xs font-medium text-[#12233B] bg-[#F7F0DC] hover:bg-[#FCF9F0] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Sample</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Responsive Stage */}
      <main id="top" className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-9">
        {/* Quiet context intro line */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FCF9F0]">
              Astronaut Behavioural Check
            </h1>
            <p className="text-sm text-[#B4C6DF] mt-1">
              Baseline profile · Daily mood &amp; load check · 3-min attention activity · Unscored journal &amp; poetry
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums text-[#A9BCD6] whitespace-nowrap shrink-0">
            Logged Days: {missionLog.length} · Baseline: {baseline.daysUsed}/7d · PVT: {pvtResults.length}
          </div>
        </div>

        {/* Desktop Daily Check shows Part B Form alongside Live Part C Report; mobile shows focused single view */}
        {activeTab === 'daily' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7 items-start">
            <div className="lg:col-span-6 space-y-3">
              {isEditingLoggedDay && (
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#162C4E]/80 border border-white/10 text-xs text-[#E2D1A8]">
                  <span>
                    Editing logged entry for Flight Day {draft.day}
                  </span>
                  <button
                    type="button"
                    onClick={handleReturnToNextDay}
                    className="font-semibold text-[#FCF9F0] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Switch to new day
                  </button>
                </div>
              )}

              <PartBForm
                key={`partb-${draft.day}-${editSessionKey}`}
                draft={draft}
                onChange={(updated) => {
                  setDraft(updated);
                  setSelectedReportDay(updated.day);
                }}
                onSubmit={handleLogDailyCheck}
                justSavedDay={justSavedDay}
              />
            </div>

            <div className="hidden lg:block lg:col-span-6 lg:sticky lg:top-22">
              <PartCReport
                scoredDays={scoredDays}
                baseline={baseline}
                partAResult={partAResult}
                selectedDayNumber={selectedReportDay}
                onSelectDay={setSelectedReportDay}
                isLivePreview={isLivePreview}
              />
            </div>
          </div>
        )}

        {activeTab === 'baseline' && (
          <PartAForm
            answers={partA}
            result={partAResult}
            onChange={setPartA}
            onSaveProfile={handleSavePartA}
            savedToast={savedPartAToast}
          />
        )}

        {activeTab === 'report' && (
          <div className="max-w-3xl mx-auto">
            <PartCReport
              scoredDays={scoredDays}
              baseline={baseline}
              partAResult={partAResult}
              selectedDayNumber={selectedReportDay}
              onSelectDay={setSelectedReportDay}
              isLivePreview={isLivePreview}
            />
          </div>
        )}

        {activeTab === 'pvt' && (
          <PVTActivity
            savedResults={pvtResults}
            onSaveResult={handleSavePvtResult}
            onDeleteResult={handleDeletePvtResult}
          />
        )}

        {activeTab === 'reflections' && (
          <div className="max-w-4xl mx-auto">
            <ReflectionsView
              entries={missionLog}
              currentDraftDay={draft.day}
              onSaveReflection={handleSaveGalleryReflection}
              onEditDayReflection={handleEditDayReflection}
              onDeleteReflection={handleDeleteReflection}
              onGoToDaily={() => {
                setActiveTab('daily');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExportJson={handleExportJson}
              onClearAllData={handleClearAllData}
            />
          </div>
        )}
      </main>

      {/* Mobile & Tablet Thumb-Zone Bottom Navigation (compact <= 64px, < 15% mobile height) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B172A]/95 backdrop-blur-md border-t border-white/10"
      >
        <div className="grid grid-cols-5 h-16">
          <button
            type="button"
            onClick={() => {
              setActiveTab('daily');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'daily' ? 'text-[#F7F0DC]' : 'text-[#8DA4C4]'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>Daily</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('baseline');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'baseline' ? 'text-[#F7F0DC]' : 'text-[#8DA4C4]'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span>Part A</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'report' ? 'text-[#F7F0DC]' : 'text-[#8DA4C4]'
            }`}
          >
            <FileBarChart2 className="w-5 h-5" />
            <span>Report</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('pvt');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'pvt' ? 'text-[#F7F0DC]' : 'text-[#8DA4C4]'
            }`}
          >
            <Timer className="w-5 h-5" />
            <span>PVT</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('reflections');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'reflections' ? 'text-[#F7F0DC]' : 'text-[#8DA4C4]'
            }`}
          >
            <Feather className="w-5 h-5" />
            <span>Journal</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

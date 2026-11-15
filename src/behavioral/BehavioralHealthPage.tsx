import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ClipboardCheck,
  Feather,
  FileBarChart2,
  RotateCcw,
  Timer,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import { PartAForm } from './components/PartAForm';
import { PartBForm } from './components/PartBForm';
import { PartCReport } from './components/PartCReport';
import { ExpressionConsentModal } from './components/ExpressionConsentModal';
import {
  ExpressionMonitor,
  ExpressionSample,
  ExpressionSummary,
  summarizeExpressionSamples,
} from './components/ExpressionMonitor';
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
type ExpressionCollectionStatus = 'idle' | 'starting' | 'active' | 'error' | 'skipped';

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
  const [expressionCollectionEnabled, setExpressionCollectionEnabled] = useState(false);
  const [expressionCollectionStatus, setExpressionCollectionStatus] =
    useState<ExpressionCollectionStatus>('idle');
  const [expressionCollectionError, setExpressionCollectionError] = useState('');
  const [expressionSummary, setExpressionSummary] = useState<ExpressionSummary | null>(null);
  const [shareChoice, setShareChoice] = useState<'yes' | 'no' | null>(null);
  const [consultationChoice, setConsultationChoice] = useState<'yes' | 'no' | null>(null);
  const [expressionMatchChoice, setExpressionMatchChoice] = useState<'yes' | 'no' | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [completedAssessmentData, setCompletedAssessmentData] = useState<{
    day: number;
    negSum: number;
    posSum: number;
    hoursSlept: number;
    status: string;
  } | null>(null);
  const hasPromptedModalRef = useRef(false);
  const expressionSamplesRef = useRef<ExpressionSample[]>([]);

  useEffect(() => {
    if (
      activeTab === 'daily' &&
      expressionCollectionStatus === 'idle' &&
      !hasPromptedModalRef.current
    ) {
      hasPromptedModalRef.current = true;
      setIsConsentModalOpen(true);
    }
  }, [activeTab, expressionCollectionStatus]);

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

  const handleExpressionSample = useCallback((sample: ExpressionSample) => {
    expressionSamplesRef.current.push(sample);
  }, []);

  const handleExpressionMonitoringChange = useCallback((active: boolean) => {
    setExpressionCollectionStatus(active ? 'active' : 'idle');
  }, []);

  const handleExpressionError = useCallback((message: string) => {
    expressionSamplesRef.current = [];
    setExpressionCollectionError(message);
    setExpressionCollectionEnabled(false);
    setExpressionCollectionStatus('error');
  }, []);

  const handleStartExpressionCollection = () => {
    expressionSamplesRef.current = [];
    setExpressionCollectionError('');
    setExpressionCollectionStatus('starting');
    setExpressionCollectionEnabled(true);
  };

  const handleStopExpressionCollection = () => {
    expressionSamplesRef.current = [];
    setExpressionCollectionEnabled(false);
    setExpressionCollectionError('');
    setExpressionCollectionStatus('idle');
  };

  const handleCloseExpressionSummary = () => {
    setExpressionSummary(null);
    setShareChoice(null);
    setConsultationChoice(null);
    setExpressionMatchChoice(null);
  };

  const handleLogDailyCheck = () => {
    const completedDayNumber = draft.day;
    const completedExpressionSummary = summarizeExpressionSamples(
      expressionSamplesRef.current
    );
    expressionSamplesRef.current = [];
    setExpressionCollectionEnabled(false);
    setExpressionCollectionStatus('idle');
    setExpressionCollectionError('');
    setShareChoice(null);
    setConsultationChoice(null);
    setExpressionMatchChoice(null);
    setExpressionSummary(completedExpressionSummary);

    const updatedLog = [
      ...missionLog.filter((e) => e.day !== draft.day),
      draft,
    ].sort((a, b) => a.day - b.day);

    setMissionLog(updatedLog);
    setJustSavedDay(draft.day);
    setSelectedReportDay(draft.day);

    const currentNegSum = (draft.mood[1] || 1) + (draft.mood[2] || 1) + (draft.mood[3] || 1);
    const currentPosSum = (draft.mood[4] || 3) + (draft.mood[5] || 3) + (draft.mood[6] || 3);
    const dayHoursSlept = draft.hoursSlept;

    const maxLoggedDay = updatedLog.reduce((max, e) => Math.max(max, e.day), 0);
    const nextDayNum = maxLoggedDay + 1;
    setDraft(createBlankDayEntry(nextDayNum));

    setTimeout(() => {
      setJustSavedDay(null);
    }, 4000);

    // Compute status for the completion modal
    const completedScored = scoredDays.find((d) => d.day === completedDayNumber);
    const completedStatus = completedScored?.status || (currentNegSum >= 9 ? 'Watch' : 'On track');

    // Trigger Assessment Done Modal with prominent "Click to Open Report" button
    setCompletedAssessmentData({
      day: completedDayNumber,
      negSum: currentNegSum,
      posSum: currentPosSum,
      hoursSlept: dayHoursSlept,
      status: completedStatus,
    });
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
    handleStopExpressionCollection();
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
    handleStopExpressionCollection();
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
    handleStopExpressionCollection();
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
    handleStopExpressionCollection();
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
  const shouldOfferConsultation =
    expressionSummary !== null &&
    expressionSummary.frequency >= 0.5 &&
    ['sad', 'angry', 'fearful', 'disgusted'].includes(
      expressionSummary.expression.toLowerCase()
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#F6EEDB] text-[#06132B] pb-20 lg:pb-10">
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
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#12233B]">
              Astronaut Behavioural Check
            </h1>
            <p className="text-sm text-[#4A5C75] mt-1">
              Baseline profile · Daily mood &amp; load check · 3-min attention activity · Unscored journal &amp; poetry
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums text-[#4A5C75] whitespace-nowrap shrink-0">
            Logged Days: {missionLog.length} · Baseline: {baseline.daysUsed}/7d · PVT: {pvtResults.length}
          </div>
        </div>

        {expressionCollectionEnabled && (
          <ExpressionMonitor
            enabled={expressionCollectionEnabled}
            onSample={handleExpressionSample}
            onMonitoringChange={handleExpressionMonitoringChange}
            onError={handleExpressionError}
          />
        )}

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
                onOpenReport={(day) => {
                  setSelectedReportDay(day);
                  setActiveTab('report');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                justSavedDay={justSavedDay}
                onOpenExpressionModal={() => setIsConsentModalOpen(true)}
                expressionStatus={expressionCollectionStatus}
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
            onOpenReport={() => {
              setActiveTab('report');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
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

      {expressionSummary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071121]/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="expression-summary-title"
        >
          <section className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FCF9F0] p-5 text-[#12233B] shadow-2xl sm:p-7">
            <h2
              id="expression-summary-title"
              className="font-display text-xl font-bold sm:text-2xl"
            >
              Today&apos;s private check-in
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#4A5C75]">
              The local model most often labeled your facial expression as{' '}
              <strong className="capitalize text-[#12233B]">{expressionSummary.expression}</strong>
              . It appeared in {Math.round(expressionSummary.frequency * 100)}% of the{' '}
              {expressionSummary.sampleCount} sampled frames, with an average model score of{' '}
              {Math.round(expressionSummary.averageProbability * 100)}%.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#4A5C75]">
              Facial expressions cannot reliably tell us how you feel. This is not a diagnosis.
              Does this estimate feel like a fair reflection of how you feel today?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={expressionMatchChoice === 'yes'}
                onClick={() => setExpressionMatchChoice('yes')}
                className={`min-h-10 rounded-full px-4 py-2 text-sm font-semibold ${
                  expressionMatchChoice === 'yes'
                    ? 'bg-[#145252] text-white'
                    : 'border border-[#12233B]/25 text-[#12233B] hover:bg-[#12233B]/5'
                }`}
              >
                Yes, it fits
              </button>
              <button
                type="button"
                aria-pressed={expressionMatchChoice === 'no'}
                onClick={() => setExpressionMatchChoice('no')}
                className={`min-h-10 rounded-full px-4 py-2 text-sm font-semibold ${
                  expressionMatchChoice === 'no'
                    ? 'bg-[#145252] text-white'
                    : 'border border-[#12233B]/25 text-[#12233B] hover:bg-[#12233B]/5'
                }`}
              >
                No, it doesn&apos;t
              </button>
            </div>
            {expressionMatchChoice === 'no' && (
              <p className="mt-2 text-sm text-[#4A5C75]">
                Thanks for letting us know. The estimate can be wrong and does not override your
                own experience.
              </p>
            )}

            {shouldOfferConsultation && (
              <div className="mt-5 rounded-xl bg-[#F7F0DC] p-4">
                <p className="text-sm font-semibold text-[#12233B]">
                  Some samples leaned toward a {expressionSummary.expression} expression. Would
                  you like to explore speaking with someone?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={consultationChoice === 'yes'}
                    onClick={() => setConsultationChoice('yes')}
                    className="min-h-10 rounded-full bg-[#12233B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#243D5F]"
                  >
                    Yes, I would
                  </button>
                  <button
                    type="button"
                    aria-pressed={consultationChoice === 'no'}
                    onClick={() => setConsultationChoice('no')}
                    className="min-h-10 rounded-full border border-[#12233B]/25 px-4 py-2 text-sm font-semibold text-[#12233B] hover:bg-white/60"
                  >
                    No, thanks
                  </button>
                </div>
                {consultationChoice === 'yes' && (
                  <p className="mt-3 text-sm leading-relaxed text-[#4A5C75]">
                    RIDGE does not have a consultation service connected yet. If you want
                    professional support, contact your organization&apos;s health service or a
                    qualified local provider.
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 border-t border-[#12233B]/10 pt-4">
              <p className="text-sm font-semibold text-[#12233B]">
                Would you like to share this estimate with your Firebase account?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#4A5C75]">
                Sharing is paused until Firestore security rules are confirmed. Nothing will be
                uploaded or saved to your account now. This summary stays in page memory and is
                cleared when you close this check-in.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={shareChoice === 'yes'}
                  onClick={() => setShareChoice('yes')}
                  className="min-h-10 rounded-full bg-[#12233B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#243D5F]"
                >
                  Yes, when secure sharing is available
                </button>
                <button
                  type="button"
                  aria-pressed={shareChoice === 'no'}
                  onClick={() => setShareChoice('no')}
                  className="min-h-10 rounded-full border border-[#12233B]/25 px-4 py-2 text-sm font-semibold text-[#12233B] hover:bg-[#12233B]/5"
                >
                  No, keep it private
                </button>
              </div>
              {shareChoice === 'yes' && (
                <p className="mt-2 text-sm text-[#4A5C75]" role="status">
                  Your choice applies only to this check-in. No data was uploaded; you&apos;ll be
                  asked again once secure account sharing is enabled.
                </p>
              )}
              {shareChoice === 'no' && (
                <p className="mt-2 text-sm text-[#4A5C75]" role="status">
                  Nothing will be shared. Close this check-in to clear the temporary summary.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  handleCloseExpressionSummary();
                  setActiveTab('report');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="min-h-11 flex-1 rounded-full bg-[#145252] hover:bg-[#0F3F3F] px-5 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <FileBarChart2 className="w-4 h-4 text-[#FDE047]" />
                <span>Click to Open Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCloseExpressionSummary}
                className="min-h-11 rounded-full border border-[#12233B]/25 hover:bg-[#12233B]/5 px-5 py-2.5 text-sm font-semibold text-[#12233B] cursor-pointer transition-colors"
              >
                Close Summary
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Assessment Completed Modal with prominent "Click to Open Report" button */}
      {completedAssessmentData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071121]/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-complete-title"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#FCF9F0] border-2 border-[#145252]/30 p-6 text-[#12233B] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#145252]/15 text-[#145252] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#145252] font-bold">
                    Telemetry Synced
                  </span>
                  <h3 id="assessment-complete-title" className="font-display text-xl font-bold text-[#12233B]">
                    Assessment Done!
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletedAssessmentData(null)}
                className="w-8 h-8 rounded-full bg-[#12233B]/5 hover:bg-[#12233B]/10 flex items-center justify-center text-[#566A86] transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-[#4A5C75] leading-relaxed">
              Flight Day <strong className="text-[#12233B] font-bold">{completedAssessmentData.day}</strong> behavioural check, mood ratings, and sleep metrics have been recorded successfully.
            </p>

            {/* Score summary cards */}
            <div className="grid grid-cols-3 gap-2.5 py-1">
              <div className="rounded-xl bg-white border border-[#12233B]/10 p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase text-[#566A86]">Neg Affect</span>
                <span className="font-mono text-base font-bold text-[#12233B]">
                  {completedAssessmentData.negSum}<span className="text-xs text-[#566A86]">/15</span>
                </span>
              </div>
              <div className="rounded-xl bg-white border border-[#12233B]/10 p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase text-[#566A86]">Vitality</span>
                <span className="font-mono text-base font-bold text-[#12233B]">
                  {completedAssessmentData.posSum}<span className="text-xs text-[#566A86]">/15</span>
                </span>
              </div>
              <div className="rounded-xl bg-white border border-[#12233B]/10 p-2.5 text-center">
                <span className="block text-[10px] font-semibold uppercase text-[#566A86]">Status</span>
                <span className="font-mono text-xs font-bold text-[#145252] capitalize">
                  {completedAssessmentData.status}
                </span>
              </div>
            </div>

            {/* Main Action: Click to Open Report */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedReportDay(completedAssessmentData.day);
                  setActiveTab('report');
                  setCompletedAssessmentData(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full min-h-[50px] px-6 py-3 rounded-full bg-[#145252] hover:bg-[#0F3F3F] text-white font-display font-semibold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#145252]/25 transition-all cursor-pointer active:scale-95"
              >
                <FileBarChart2 className="w-5 h-5 text-[#FDE047]" />
                <span>Click to Open Report</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                type="button"
                onClick={() => setCompletedAssessmentData(null)}
                className="w-full min-h-[42px] px-4 py-2 rounded-full border border-[#12233B]/20 hover:bg-[#12233B]/5 text-xs font-semibold text-[#12233B] transition-colors cursor-pointer"
              >
                Stay on Daily Check
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Expression Privacy & Consent Modal */}
      <ExpressionConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onAgree={handleStartExpressionCollection}
        onSkip={() => {
          handleStopExpressionCollection();
          setExpressionCollectionStatus('skipped');
        }}
        onStop={handleStopExpressionCollection}
        status={expressionCollectionStatus}
        enabled={expressionCollectionEnabled}
        error={expressionCollectionError}
      />
    </div>
  );
}

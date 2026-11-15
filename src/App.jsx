import React, { useState } from 'react';
import {
  ArrowRight,
  Layers,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Activity,
  Gauge,
  ExternalLink,
  Gamepad2,
  Compass,
  ArrowLeft,
  HeartPulse,
  Brain,
  ClipboardCheck,
  Radio,
  Box,
  Rocket,
  UserCheck,
  Dna,
  LogIn,
  LogOut,
  Settings,
  Glasses,
  User,
  Clock
} from 'lucide-react';
import TrendAnalytics from './components/TrendAnalytics';
import LogoMarquee from './components/LogoMarquee';
import RoadmapGame from './roadmap/RoadmapGame';
import BehavioralHealthPage from './behavioral/BehavioralHealthPage';
import AstroCareDashboard from './components/AstroCareDashboard';
import AuraDashboard from './pages/AuraDashboard';
import InovavPortal from './inovav/App';
import VitalObservatory from './inovav/VitalObservatory';
import JarvisTouchlessHud from './inovav/JarvisTouchlessHud';
import ThreeDFaceStudioModal from './inovav/components/ThreeDFaceStudioModal';
import AstriChatbot from './components/AstriChatbot';
import StartScreen from './pages/StartScreen';
import WelcomeScreen from './pages/WelcomeScreen';
import SignUpScreen from './pages/SignUpScreen';
import LoginScreen from './pages/LoginScreen';
import useIdleTimeout from './hooks/useIdleTimeout';
import { getCurrentUser, signOutUser } from './services/authService';
import AppShell from './components/AppShell';
import MealPlanPage from './pages/MealPlanPage';
import HandTracker from './components/HandTracker';

/**
 * TOPIC & EXECUTIVE KPI DATA CONFIGURATION:
 * Customize the title, mission description, and top-line KPI values below.
 */
export const TOPIC_DATA = {
  eyebrow: 'TRUSTED AI GOVERNANCE & MISSION TELEMETRY // TREND ANALYSIS',
  title: 'Comparative Mission Telemetry & Sovereignty Benchmarks',
  subtitle:
    'Real-time comparative evaluation of telemetry stream throughput, multi-regional latency variance, and autonomous policy compliance across operational cycles.',
  kpis: [
    {
      id: 'kpi-1',
      title: 'Telemetry Throughput',
      metricLabel: 'Observed vs. Baseline',
      currentValue: '142.8 GB/s',
      baselineValue: '124.0 GB/s',
      delta: '+15.2%',
      isPositive: true,
      deltaLabel: 'vs. baseline',
      icon: Activity,
      accentColor: 'text-[#FF7300]',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Peak streaming telemetry rate across multi-constellation relays',
    },
    {
      id: 'kpi-2',
      title: 'Latency Variance Delta',
      metricLabel: 'Consensus Roundtrip',
      currentValue: '0.68 ms',
      baselineValue: '0.95 ms',
      delta: '-28.4%',
      isPositive: true,
      deltaLabel: 'reduction',
      icon: Gauge,
      accentColor: 'text-cyan-400',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      description: 'p99 distributed microgateway consensus roundtrip latency',
    },
    {
      id: 'kpi-3',
      title: 'Compliance & Stability Index',
      metricLabel: 'Policy Enforcement',
      currentValue: '99.98%',
      baselineValue: '99.60%',
      delta: '+0.38%',
      isPositive: true,
      deltaLabel: 'stability gain',
      icon: ShieldCheck,
      accentColor: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Zero-trust cryptographic verification & data residency adherence',
    },
  ],
};

export default function App() {
  // Navigation State: 'portal' (Suit & Vitals continuous flow) | 'aura' | 'overview' | 'behavioral' | 'roadmap' | 'astri'
  const [activeView, setActiveView] = useState('portal');
  const [portalInitialScreen, setPortalInitialScreen] = useState('dashboard');
  const [showARVisor, setShowARVisor] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [isARHandActive, setIsARHandActive] = useState(false);
  const [handCursor, setHandCursor] = useState({ x: 0, y: 0, isPinching: false, active: false });

  // Banking-grade Authentication & Route Visibility State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [authScreen, setAuthScreen] = useState(() => (getCurrentUser() ? 'dashboard' : 'start'));
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(null);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);

  const [activeAstronaut, setActiveAstronaut] = useState(() => {
    const user = getCurrentUser();
    if (user) {
      return {
        id: user.uid || 'ASTRO-01',
        name: user.fullName || user.username || 'CDR. Alex Vance',
        mission: user.mission || 'Artemis VII // Mars Transfer',
        role: user.role || 'Mission Commander',
        bloodType: user.bloodType || 'O-Negative',
        faceSnaps: user.faceSnaps || { center: null, left: null, right: null },
      };
    }
    return {
      id: 'ASTRO-01',
      name: 'CDR. Alex Vance',
      mission: 'Artemis VII // Mars Transfer',
      role: 'Mission Commander',
      bloodType: 'O-Negative',
      faceSnaps: { center: null, left: null, right: null },
    };
  });

  // Handle successful login or signup
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setSessionExpiredMessage(null);
    setAuthScreen('dashboard');
    setActiveView('portal');
    setPortalInitialScreen('dashboard');
    if (user) {
      setActiveAstronaut({
        id: user.uid || 'ASTRO-01',
        name: user.fullName || user.username || 'CDR. Alex Vance',
        mission: user.mission || 'Artemis VII // Mars Transfer',
        role: user.role || 'Mission Commander',
        bloodType: user.bloodType || 'O-Negative',
        faceSnaps: user.faceSnaps || { center: null, left: null, right: null },
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Inactivity timeout handler
  const handleSessionTimeout = React.useCallback(() => {
    signOutUser();
    setCurrentUser(null);
    setAuthScreen('login');
    setSessionExpiredMessage('Session terminated due to inactivity. Please log in again.');
  }, []);

  // 3-minute inactivity monitor with 30s countdown warning
  const { isWarning, secondsRemaining, resetTimer } = useIdleTimeout({
    isAuthenticated: Boolean(currentUser && authScreen === 'dashboard'),
    timeoutMs: 180000,
    warningMs: 30000,
    onTimeout: handleSessionTimeout,
  });

  const handleLogout = () => {
    setShowLogoutConfirmModal(true);
  };

  const handleConfirmLogout = () => {
    signOutUser();
    setCurrentUser(null);
    setShowLogoutConfirmModal(false);
    setAuthScreen('login');
    setSessionExpiredMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToRoadmap = () => {
    if (activeView !== 'overview') {
      setActiveView('overview');
      setTimeout(() => {
        document.getElementById('roadmap-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('roadmap-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAstroCare = () => {
    if (activeView !== 'overview') {
      setActiveView('overview');
      setTimeout(() => {
        document.getElementById('astrocare-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('astrocare-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F7F4EE] text-[#0B1736] selection:bg-[#0B1736] selection:text-[#F7F4EE] font-sans relative overflow-x-hidden">

      {/* Background Ambient Oat Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,23,54,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,23,54,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none" />



      {/* ── PRE-AUTH BANKING-GRADE ENTRY FLOW (NAVBAR & DASHBOARDS STRICTLY HIDDEN) ── */}
      {(!currentUser || authScreen !== 'dashboard') && (
        <main className="flex-1 w-full relative z-10 flex flex-col justify-center">
          {authScreen === 'start' && (
            <StartScreen onEnter={() => setAuthScreen('welcome')} />
          )}

          {authScreen === 'welcome' && (
            <WelcomeScreen
              onContinue={() => setAuthScreen('login')}
              onNavigateToSignUp={() => setAuthScreen('signup')}
            />
          )}

          {authScreen === 'signup' && (
            <SignUpScreen
              onSignUpSuccess={handleAuthSuccess}
              onNavigateToLogin={() => setAuthScreen('login')}
            />
          )}

          {(authScreen === 'login' || authScreen === 'logged-out') && (
            <LoginScreen
              onLoginSuccess={handleAuthSuccess}
              onNavigateToSignUp={() => setAuthScreen('signup')}
              sessionExpiredMessage={sessionExpiredMessage}
            />
          )}
        </main>
      )}

      {/* ── AUTHENTICATED DASHBOARD APPLICATION VIEWS INSIDE APPSHELL ── */}
      {currentUser && authScreen === 'dashboard' && (
        <AppShell
          activeModuleId={activeView}
          onSelectModule={(id) => {
            setActiveView(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isARHandActive={isARHandActive}
          onToggleARHand={() => setIsARHandActive((prev) => !prev)}
          activeAstronaut={activeAstronaut}
          onOpenProfile={() => setShowProfileSettings(true)}
          onLogoutClick={handleLogout}
        >
          {/* 2. DYNAMIC PAGE CONTENT: OVERVIEW, ROADMAP GAME, OR BEHAVIORAL HEALTH */}
          {activeView === 'overview' && (
            <main className="flex-1 w-full relative z-10">

              {/* ASTROCARE ISS MISSION TELEMETRY MONITOR (INK BLUE + OAT YELLOW THEME) */}
              <section id="astrocare-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-6 relative z-10">
                <AstroCareDashboard isEmbedded={true} />
              </section>

              {/* 3. ANIMATION RIBBON: WSO2-STYLE INFINITE LOGO MARQUEE (INTACT) */}
              <section className="w-full my-6 relative z-10">
                <LogoMarquee />
              </section>

              {/* 4. INTERACTIVE ROAD MAP GAME: DIRECTLY AFTER THE ANIMATION RIBBON */}
              <section id="roadmap-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-10 relative z-10">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#DCD5C7] bg-[#EDE8DE] text-[#0B1736] font-mono text-xs uppercase tracking-wider mb-2">
                      <Compass className="w-3.5 h-3.5 text-[#0B1736]" />
                      <span>Interactive Mission Circuit</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1736] tracking-tight">
                      Lumina Path — Interactive Road Map Game
                    </h2>
                    <p className="text-sm text-[#5A657D] mt-1 max-w-2xl leading-relaxed">
                      Start at the unlocked stage and mark progress directly on the circuit to trigger shooting fiber currents downward. Complete all mission checkpoints to unlock the Grand Trophy Vault!
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView('roadmap');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-400/25 text-xs font-semibold text-cyan-300 transition-all cursor-pointer shadow-md active:scale-95"
                      title="Expand to Fullscreen View"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Fullscreen Game Mode</span>
                    </button>
                  </div>
                </div>

                {/* Embedded Road Map Game Container */}
                <RoadmapGame
                  isEmbedded={true}
                  onOpenReport={() => {
                    setActiveView('behavioral');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </section>

            </main>
          )}

          {/* ── 1. SUIT & VITALS FLOW: START -> LOGIN/SIGNUP -> SUIT TELEMETRY -> MONITOR HEALTH DIRECTLY BELOW ── */}
          {activeView === 'portal' && (
            <main className="flex-1 w-full relative z-10">
              <InovavPortal
                initialScreen={portalInitialScreen}
                onBackToOverview={() => setActiveView('overview')}
                onNavigateView={(view) => setActiveView(view)}
                activeAstronaut={activeAstronaut}
                onAstronautChange={setActiveAstronaut}
                onLogout={handleLogout}
                showARVisor={showARVisor}
                onCloseARVisor={() => setShowARVisor(false)}
                showProfileSettings={showProfileSettings}
                onCloseProfileSettings={() => setShowProfileSettings(false)}
              />
            </main>
          )}

          {/* AURA 3D ISS DASHBOARD VIEW */}
          {activeView === 'aura' && (
            <main className="flex-1 w-full relative z-10">
              <AuraDashboard onBackToHome={() => setActiveView('overview')} />
            </main>
          )}

          {/* ASTROCARE ISS MONITOR VIEW (FULLSCREEN STANDALONE MODE) */}
          {activeView === 'astrocare' && (
            <main className="flex-1 w-full relative z-10">
              <AstroCareDashboard onBack={() => setActiveView('overview')} />
            </main>
          )}

          {/* ROADMAP GAME VIEW (FULLSCREEN STANDALONE MODE) */}
          {activeView === 'roadmap' && (
            <main className="flex-1 w-full relative z-10">
              <RoadmapGame
                onBack={() => setActiveView('overview')}
                onOpenReport={() => {
                  setActiveView('behavioral');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </main>
          )}

          {/* BEHAVIORAL HEALTH VIEW */}
          {activeView === 'behavioral' && (
            <main className="flex-1 w-full relative z-10">
              <BehavioralHealthPage onBack={() => setActiveView('overview')} />
            </main>
          )}

          {/* ── 6. ASTRONAUT MEAL PLAN & HYDRATION TAB ── */}
          {activeView === 'mealplan' && (
            <main className="flex-1 w-full relative z-10">
              <MealPlanPage />
            </main>
          )}

          {/* ASTRI AI CHATBOT VIEW WITH 3D ASTRONAUT IN THE MIDDLE */}
          {activeView === 'astri' && (
            <main className="flex-1 w-full relative z-10">
              <AstriChatbot
                onBackToOverview={() => setActiveView('overview')}
                astronautName={activeAstronaut.name}
                astronautRole={activeAstronaut.role}
              />
            </main>
          )}

          {/* GLOBAL AR VISOR HUD (JARVIS TOUCHLESS DESKTOP HUD) */}
          {showARVisor && (
            <JarvisTouchlessHud
              onClose={() => setShowARVisor(false)}
              onLaunchObservatory={() => {
                setShowARVisor(false);
                setActiveView('portal');
                setPortalInitialScreen('dashboard');
                setTimeout(() => {
                  document.getElementById('monitor-health-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              }}
            />
          )}

          {/* GLOBAL PROFILE SETTINGS & 3D FACE VISOR STUDIO MODAL */}
          <ThreeDFaceStudioModal
            isOpen={showProfileSettings}
            onClose={() => setShowProfileSettings(false)}
            activeAstronaut={activeAstronaut}
            onSaveFaceData={(snaps) => {
              setActiveAstronaut((prev) => {
                const updated = {
                  ...prev,
                  faceSnaps: { ...(prev.faceSnaps || {}), ...snaps },
                };
                try {
                  const raw = localStorage.getItem('ridge_astronaut_db') || localStorage.getItem('inova_astronaut_db');
                  const current = raw ? JSON.parse(raw) : [];
                  const list = Array.isArray(current) ? current : [];
                  const updatedList = [
                    ...list.filter((a) => a.id?.toLowerCase() !== updated.id?.toLowerCase()),
                    updated,
                  ];
                  localStorage.setItem('ridge_astronaut_db', JSON.stringify(updatedList));
                } catch (err) {
                  console.warn(err);
                }
                return updated;
              });
            }}
            onLoginSuccess={(astro) => {
              setActiveAstronaut(astro);
              setShowProfileSettings(false);
              setActiveView('portal');
              setPortalInitialScreen('dashboard');
            }}
          />

          {/* 5. BOTTOM CREDITS / STATUS BAR (INK BLUE BAR ON OAT IVORY PAGE) */}
          <footer className="w-full mt-auto relative z-10 border-t border-[#DCD5C7] bg-[#0B1736] text-[#F7F4EE] py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#EDE8DE] gap-2">
              <p>© {new Date().getFullYear()} Ridge Aerospace & Digital Sovereignty. All telemetry verified.</p>
              <div className="flex items-center space-x-6">
                <a href="#privacy" className="hover:text-amber-300 transition-colors">Security Policy</a>
                <a href="#terms" className="hover:text-amber-300 transition-colors">Mission Protocol</a>
                <a href="#status" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <span>Relay Mesh Active</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </a>
              </div>
            </div>
          </footer>
        </AppShell>
      )}

      {/* GLOBAL AR HAND GESTURE RETICLE CURSOR */}
      {isARHandActive && (
        <>
          <HandTracker onHandUpdate={setHandCursor} />
          {handCursor.active && (
            <div
              className="fixed z-[9999] pointer-events-none transition-transform duration-75 ease-out select-none"
              style={{
                left: `${handCursor.x}px`,
                top: `${handCursor.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${handCursor.isPinching
                    ? 'border-[#0284C7] bg-[#0284C7]/30 scale-125 shadow-[0_0_20px_#0284C7]'
                    : 'border-[#0284C7] bg-white/50 scale-100 shadow-[0_0_10px_rgba(2,132,199,0.5)]'
                  }`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-[#0284C7] bg-white/95 px-1.5 py-0.5 rounded shadow-xs border border-[#0284C7]/30">
                {handCursor.isPinching ? 'PINCH' : 'PALM'}
              </span>
            </div>
          )}
        </>
      )}

      {/* 30-SECOND INACTIVITY TIMEOUT WARNING BANNER */}
      {currentUser && authScreen === 'dashboard' && isWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] max-w-lg w-[92%] bg-[#0B1736] text-[#F7F4EE] border border-amber-400/50 rounded-2xl px-5 py-3.5 shadow-2xl flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 animate-spin" />
            </div>
            <div className="text-left text-xs">
              <span className="font-bold text-amber-400 block">Security Alert: Inactivity Timeout</span>
              <span className="text-slate-300">
                Session will terminate in <strong className="text-white font-mono">{secondsRemaining}s</strong>.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={resetTimer}
            className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#0B1736] text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            Extend Session
          </button>
        </div>
      )}

      {/* BANKING-GRADE LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#DCD5C7] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(11,23,54,0.3)] text-[#0B1736] flex flex-col items-center text-center animate-scaleIn">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-[#0B1736]">
              Confirm Log Out
            </h3>
            <p className="text-xs sm:text-sm text-[#5A657D] mt-2 mb-6 leading-relaxed">
              Are you sure you want to exit your active RIDGE session? All unsaved telemetry streams and mission buffers will be sealed.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowLogoutConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-[#DCD5C7] bg-[#EDE8DE] hover:bg-[#DCD5C7] text-[#0B1736] font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-rose-600/30 transition-all cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

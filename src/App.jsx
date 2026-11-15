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

      {/* 1. HEADER / FLOATING CAPSULE NAVIGATION BAR (STRICTLY HIDDEN ON PRE-AUTH SCREENS) */}
      {currentUser && authScreen === 'dashboard' && (
      <header className="sticky top-0 z-50 w-full px-3 py-2.5 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto bg-[#0B1736] text-[#F7F4EE] backdrop-blur-2xl border border-[#DCD5C7]/30 shadow-[0_12px_40px_rgba(11,23,54,0.35)] rounded-2xl sm:rounded-full px-3 sm:px-4 py-2">
          
          {/* Brand Pill (Emblem pill inspired by side bar.jpg) */}
          <div 
            onClick={() => { setActiveView('portal'); setPortalInitialScreen('dashboard'); }}
            className="flex items-center space-x-2.5 shrink-0 cursor-pointer group"
            title="Return to Suit & Vitals Dashboard"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                RIDGE<span className="text-amber-400">.</span>
              </span>
              <span className="ml-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-300/80">
                NASA
              </span>
            </div>
          </div>

          {/* Primary View Switcher Navigation Tabs (Pill cutout active state matching side bar.jpg) */}
          <nav className="flex items-center p-1 rounded-xl sm:rounded-full bg-blue-950/70 border border-blue-900/40 backdrop-blur-md overflow-x-auto gap-1">
            {/* Tab 1: Start / Suit & Vitals (Continuous Start -> Login/Signup -> Suit Telemetry -> Health Monitor below) */}
            <button
              type="button"
              onClick={() => {
                setActiveView('portal');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'portal'
                  ? 'bg-[#F7F4EE] text-[#0B1736] shadow-md shadow-white/20 font-bold scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Suit & Vitals</span>
              <span className={`h-1.5 w-1.5 rounded-full ${activeView === 'portal' ? 'bg-amber-600' : 'bg-amber-400 animate-pulse'} hidden md:inline-block`} />
            </button>

            {/* Tab 2: 3D ISS Station Twin */}
            <button
              type="button"
              onClick={() => {
                setActiveView('aura');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'aura'
                  ? 'bg-[#F7F4EE] text-[#0B1736] shadow-md shadow-white/20 font-bold scale-[1.02]'
                  : 'text-slate-300 hover:text-purple-300 hover:bg-white/10'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-purple-400" />
              <span>3D ISS Station Twin</span>
            </button>

            {/* Tab 3: Trend & Telemetry */}
            <button
              type="button"
              onClick={() => {
                setActiveView('overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'overview'
                  ? 'bg-[#F7F4EE] text-[#0B1736] shadow-md shadow-white/20 font-bold scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trend & Telemetry</span>
            </button>

            {/* Tab 4: Behavioural */}
            <button
              type="button"
              onClick={() => {
                setActiveView('behavioral');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'behavioral'
                  ? 'bg-[#F7F4EE] text-[#0B1736] shadow-md shadow-white/20 font-bold scale-[1.02]'
                  : 'text-slate-300 hover:text-emerald-300 hover:bg-white/10'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span>Behavioural</span>
            </button>

            {/* Tab 5: Road Map */}
            <button
              type="button"
              onClick={() => {
                setActiveView('roadmap');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'roadmap'
                  ? 'bg-[#F7F4EE] text-[#0B1736] shadow-md shadow-white/20 font-bold scale-[1.02]'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-white/10'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Road Map</span>
            </button>

            {/* Tab 6: ASTRI AI Chatbot */}
            <button
              type="button"
              onClick={() => {
                setActiveView('astri');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'astri'
                  ? 'bg-[#F7F4EE] text-[#0B1736] shadow-md shadow-white/20 font-bold scale-[1.02]'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>ASTRI AI</span>
              <span className={`h-1.5 w-1.5 rounded-full ${activeView === 'astri' ? 'bg-cyan-600' : 'bg-cyan-400 animate-pulse'} hidden md:inline-block`} />
            </button>
          </nav>

          {/* Right Header Utility Controls (inspired by side bar.jpg): AR Visor, Profile Settings, Log Out */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Action 1: AR Visor Toggle */}
            <button
              type="button"
              onClick={() => setShowARVisor(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-950/80 border border-cyan-400/30 hover:border-cyan-400 text-xs text-cyan-200 hover:bg-cyan-500/15 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              title="Open Jarvis Touchless AR Visor HUD"
            >
              <Glasses className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">AR Visor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse hidden sm:inline-block" />
            </button>

            {/* Action 2: Profile Settings */}
            <button
              type="button"
              onClick={() => setShowProfileSettings(true)}
              className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-blue-950/80 border border-[#f6eedb]/20 hover:border-[#f6eedb]/60 text-xs text-[#f6eedb] transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
              title="Astronaut Profile & 3D Face Visor Studio"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] font-semibold hidden md:inline">{activeAstronaut.name || 'Alex Vance'}</span>
              <Settings className="w-3.5 h-3.5 text-[#ead9b2]" />
            </button>

            {/* Action 3: Log Out */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/40 hover:border-rose-400 hover:bg-rose-900/60 text-xs font-bold text-rose-300 transition-all cursor-pointer active:scale-95 whitespace-nowrap shadow-xs"
              title="Sign Out of Astronaut Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>
      )}

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

      {/* ── AUTHENTICATED DASHBOARD APPLICATION VIEWS ── */}
      {currentUser && authScreen === 'dashboard' && (
        <>
      {/* 2. DYNAMIC PAGE CONTENT: OVERVIEW, ROADMAP GAME, OR BEHAVIORAL HEALTH */}
      {activeView === 'overview' && (
        <main className="flex-1 w-full relative z-10">
          
          {/* Executive Topic Header */}
          <section className="pt-10 md:pt-14 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="max-w-4xl space-y-4 text-left">
              
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-[#DCD5C7] bg-[#EDE8DE] text-[#0B1736] font-mono text-xs uppercase tracking-wider shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B1736] animate-ping"></span>
                <span>{TOPIC_DATA.eyebrow}</span>
              </div>

              {/* Main Topic Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B1736] leading-[1.15]">
                {TOPIC_DATA.title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#5A657D] font-normal leading-relaxed max-w-3xl">
                {TOPIC_DATA.subtitle}
              </p>
            </div>

            {/* 3 Compact Comparison KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
              {TOPIC_DATA.kpis.map((kpi) => {
                const IconComponent = kpi.icon;
                return (
                  <div
                    key={kpi.id}
                    className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-2xl p-5 shadow-[0_4px_20px_rgba(11,23,54,0.06)] hover:border-[#0B1736]/30 hover:shadow-[0_8px_30px_rgba(11,23,54,0.12)] transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-mono text-[#5A657D] tracking-wider uppercase font-semibold">
                          {kpi.title}
                        </span>
                        <div className="text-2xl sm:text-3xl font-extrabold text-[#0B1736] tracking-tight">
                          {kpi.currentValue}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#EDE8DE] border border-[#DCD5C7] text-[#0B1736] group-hover:bg-[#DCD5C7]/50 transition-colors">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#DCD5C7] flex items-center justify-between text-xs">
                      <div className="text-[#5A657D]">
                        <span>Baseline: </span>
                        <span className="font-mono font-semibold text-[#0B1736]">
                          {kpi.baselineValue}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md border text-[11px] ${kpi.badgeColor}`}
                      >
                        {kpi.isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{kpi.delta}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5A657D] mt-2 leading-tight">
                      {kpi.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Middle Section: Interactive Trend Comparison Charts */}
          <TrendAnalytics />

          {/* ASTROCARE ISS MISSION TELEMETRY MONITOR (INK BLUE + OAT YELLOW THEME) */}
          <section id="astrocare-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-8 relative z-10">
            <AstroCareDashboard isEmbedded={true} />
          </section>

          {/* Two Side-by-Side Interactive Feature Portals: AURA 3D ISS & Behavioral Health */}
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Feature 1: AURA 3D ISS Interactive Twin */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900/90 to-blue-950/90 border border-purple-400/30 p-6 sm:p-7 backdrop-blur-md shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-700" />
                
                <div className="space-y-3 text-left relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/30 text-purple-300 font-mono text-xs uppercase tracking-wider">
                    <Box className="w-3.5 h-3.5" />
                    <span>Three.js 3D Interactive ISS</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    AURA 3D Digital Twin & ECLSS
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Explore the photorealistic 3D International Space Station model. Inspect pressurized modules, live NASA ECLSS atmosphere telemetry, radiation shielding bunkers, and AR hand gesture controls.
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-blue-900/40 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('aura');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Launch 3D ISS Digital Twin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Feature 2: Astronaut Behavioral Health & CrewMind */}
              <div className="rounded-2xl bg-gradient-to-br from-teal-950/90 via-slate-900/90 to-blue-950/90 border border-emerald-400/30 p-6 sm:p-7 backdrop-blur-md shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-400/20 transition-all duration-700" />
                
                <div className="space-y-3 text-left relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 font-mono text-xs uppercase tracking-wider">
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Astronaut Health Assessment</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    CrewMind Astronaut Behavioral Check
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Comprehensive astronaut assessment suite: Part A personality baseline, daily mood & sleep logs (Part B), Part C readiness scoring, and Psychomotor Vigilance (PVT) testing.
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-blue-900/40 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('behavioral');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-400 to-teal-500 text-[#06132B] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Open Behavioral Health Check</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* INOVA RIDGE CREW LAUNCHPAD: START, LOGIN & 3D VITAL SUITE */}
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#5A657D] font-semibold">
                  // RIDGE BIOMETRIC & 3D PHYSIOLOGY SUITE
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B1736] tracking-tight">
                  Astronaut Portal & 3D Vital Observatory
                </h3>
              </div>
              <span className="text-xs text-[#5A657D] font-mono hidden sm:inline-block">
                OAT IVORY // INK BLUE TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Mission Start */}
              <div 
                onClick={() => {
                  setPortalInitialScreen('intro');
                  setActiveView('portal');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-2xl bg-[#FFFFFF] border border-[#DCD5C7] p-6 shadow-[0_4px_20px_rgba(11,23,54,0.06)] hover:border-[#0B1736]/30 hover:shadow-[0_8px_30px_rgba(11,23,54,0.12)] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE8DE] border border-[#DCD5C7] flex items-center justify-center text-[#0B1736] group-hover:scale-110 transition-transform">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-[#0B1736] group-hover:text-blue-900 transition-colors">
                    Mission Start & Swarm
                  </h4>
                  <p className="text-xs text-[#5A657D] leading-relaxed">
                    3D Hohmann transfer particle trajectory simulation, RIDGE system countdown, and real-time mission telemetry handshake.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#DCD5C7] flex items-center justify-between text-xs font-bold text-[#0B1736]">
                  <span>Enter Mission Start</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Crew Login & Biometrics */}
              <div 
                onClick={() => {
                  setActiveView('login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-2xl bg-[#FFFFFF] border border-[#DCD5C7] p-6 shadow-[0_4px_20px_rgba(11,23,54,0.06)] hover:border-[#0B1736]/30 hover:shadow-[0_8px_30px_rgba(11,23,54,0.12)] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE8DE] border border-[#DCD5C7] flex items-center justify-center text-[#0B1736] group-hover:scale-110 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-[#0B1736] group-hover:text-blue-900 transition-colors">
                    Sliding Login & 3D Visor
                  </h4>
                  <p className="text-xs text-[#5A657D] leading-relaxed">
                    Dual-panel sliding sign-in & registration, 3D face camera biometrics, helmet visor face mesh reflection, and suit telemetry.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#DCD5C7] flex items-center justify-between text-xs font-bold text-[#0B1736]">
                  <span>Open Crew Login</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: 3D Vital Observatory */}
              <div 
                onClick={() => {
                  setActiveView('vital');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-2xl bg-[#FFFFFF] border border-[#DCD5C7] p-6 shadow-[0_4px_20px_rgba(11,23,54,0.06)] hover:border-[#0B1736]/30 hover:shadow-[0_8px_30px_rgba(11,23,54,0.12)] transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EDE8DE] border border-[#DCD5C7] flex items-center justify-center text-[#0B1736] group-hover:scale-110 transition-transform">
                    <Dna className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-[#0B1736] group-hover:text-blue-900 transition-colors">
                    3D Vital Human Observatory
                  </h4>
                  <p className="text-xs text-[#5A657D] leading-relaxed">
                    Interactive 3D anatomical model, beating heart, crystal skull, internal organ zoom (liver, spleen), and touchless AR palm controls.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#DCD5C7] flex items-center justify-between text-xs font-bold text-[#0B1736]">
                  <span>Launch 3D Vital Observatory</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
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
            <RoadmapGame isEmbedded={true} />
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
          <RoadmapGame onBack={() => setActiveView('overview')} />
        </main>
      )}

      {/* BEHAVIORAL HEALTH VIEW */}
      {activeView === 'behavioral' && (
        <main className="flex-1 w-full relative z-10">
          <BehavioralHealthPage onBack={() => setActiveView('overview')} />
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

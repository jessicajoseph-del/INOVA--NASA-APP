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
  User
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
  // Navigation State: 'portal' (Suit & Vitals continuous flow) | 'aura' | 'overview' | 'behavioral' | 'roadmap'
  const [activeView, setActiveView] = useState('portal');
  const [portalInitialScreen, setPortalInitialScreen] = useState('intro');
  const [showARVisor, setShowARVisor] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [activeAstronaut, setActiveAstronaut] = useState({
    id: 'ASTRO-01',
    name: 'CDR. Alex Vance',
    mission: 'Artemis VII // Mars Transfer',
    role: 'Mission Commander',
    bloodType: 'O-Negative',
  });

  const handleLogout = () => {
    setActiveAstronaut({
      id: 'ASTRO-01',
      name: 'CDR. Alex Vance',
      mission: 'Artemis VII // Mars Transfer',
      role: 'Mission Commander',
      bloodType: 'O-Negative',
    });
    setPortalInitialScreen('intro');
    setActiveView('portal');
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
    <div className="min-h-screen flex flex-col justify-between bg-[#060D21] bg-[radial-gradient(ellipse_at_top,_#0F214D_0%,_#060D21_70%)] text-slate-100 selection:bg-[#FF7300] selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Background Ambient Grid & Glow Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B0a_1px,transparent_1px),linear-gradient(to_bottom,#1E293B0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. HEADER / FLOATING CAPSULE NAVIGATION BAR (INSPIRED BY side bar.jpg) */}
      <header className="sticky top-0 z-50 w-full px-3 py-2.5 sm:px-6 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto bg-[#06132b]/85 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-2xl sm:rounded-full px-3 sm:px-4 py-2">
          
          {/* Brand Pill (Emblem pill inspired by side bar.jpg) */}
          <div 
            onClick={() => { setActiveView('portal'); setPortalInitialScreen('intro'); }}
            className="flex items-center space-x-2.5 shrink-0 cursor-pointer group"
            title="Return to Mission Start"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                INOVA<span className="text-amber-400">.</span>
              </span>
              <span className="ml-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-300/80">
                NASA
              </span>
            </div>
          </div>

          {/* Primary View Switcher Navigation Tabs (Pill cutout active state matching side bar.jpg) */}
          <nav className="flex items-center p-1 rounded-xl sm:rounded-full bg-blue-950/60 border border-blue-800/40 backdrop-blur-md overflow-x-auto gap-1">
            {/* Tab 1: Start / Suit & Vitals (Continuous Start -> Login/Signup -> Suit Telemetry -> Health Monitor below) */}
            <button
              type="button"
              onClick={() => {
                setActiveView('portal');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'portal'
                  ? 'bg-[#f6eedb] text-[#06132b] shadow-md shadow-white/20 font-bold scale-[1.02]'
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
                  ? 'bg-[#f6eedb] text-[#06132b] shadow-md shadow-white/20 font-bold scale-[1.02]'
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
                  ? 'bg-[#f6eedb] text-[#06132b] shadow-md shadow-white/20 font-bold scale-[1.02]'
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
                  ? 'bg-[#f6eedb] text-[#06132b] shadow-md shadow-white/20 font-bold scale-[1.02]'
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
                  ? 'bg-[#f6eedb] text-[#06132b] shadow-md shadow-white/20 font-bold scale-[1.02]'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-white/10'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Road Map</span>
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
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30 hover:border-rose-400 hover:bg-rose-900/50 text-xs text-rose-300 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              title="Sign Out of Astronaut Session & Return to Start"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC PAGE CONTENT: OVERVIEW, ROADMAP GAME, OR BEHAVIORAL HEALTH */}
      {activeView === 'overview' && (
        <main className="flex-1 w-full relative z-10">
          
          {/* Executive Topic Header */}
          <section className="pt-10 md:pt-14 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="max-w-4xl space-y-4 text-left">
              
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 font-mono text-xs uppercase tracking-wider shadow-sm shadow-cyan-950/50">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>{TOPIC_DATA.eyebrow}</span>
              </div>

              {/* Main Topic Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
                {TOPIC_DATA.title}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl">
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
                    className="bg-[#0B1736]/80 border border-blue-400/15 backdrop-blur-md rounded-2xl p-5 shadow-xl hover:border-cyan-400/30 hover:shadow-cyan-950/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-mono text-slate-400 tracking-wider uppercase font-semibold">
                          {kpi.title}
                        </span>
                        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                          {kpi.currentValue}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-blue-900/30 border border-blue-400/10 text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-400/20 transition-colors">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-blue-900/30 flex items-center justify-between text-xs">
                      <div className="text-slate-400">
                        <span>Baseline: </span>
                        <span className="font-mono font-semibold text-slate-200">
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

                    <p className="text-[11px] text-slate-400 mt-2 leading-tight">
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
                <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-semibold">
                  // RIDGE BIOMETRIC & 3D PHYSIOLOGY SUITE
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Astronaut Portal & 3D Vital Observatory
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                OAT YELLOW // INK BLUE TELEMETRY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Mission Start */}
              <div 
                onClick={() => {
                  setActiveView('start');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-2xl bg-gradient-to-b from-[#0e2859]/90 to-[#06132b]/95 border border-amber-400/30 p-6 backdrop-blur-md shadow-xl hover:border-amber-400 hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-[#f6eedb] group-hover:text-amber-300 transition-colors">
                    Mission Start & Swarm
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    3D Hohmann transfer particle trajectory simulation, RIDGE system countdown, and real-time mission telemetry handshake.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-blue-900/40 flex items-center justify-between text-xs font-bold text-amber-300">
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
                className="rounded-2xl bg-gradient-to-b from-[#0e2859]/90 to-[#06132b]/95 border border-cyan-400/30 p-6 backdrop-blur-md shadow-xl hover:border-cyan-400 hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-[#f6eedb] group-hover:text-cyan-300 transition-colors">
                    Sliding Login & 3D Visor
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dual-panel sliding sign-in & registration, 3D face camera biometrics, helmet visor face mesh reflection, and suit telemetry.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-blue-900/40 flex items-center justify-between text-xs font-bold text-cyan-300">
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
                className="rounded-2xl bg-gradient-to-b from-[#0e2859]/90 to-[#06132b]/95 border border-rose-400/30 p-6 backdrop-blur-md shadow-xl hover:border-rose-400 hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-400/10 border border-rose-400/30 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform">
                    <Dna className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-[#f6eedb] group-hover:text-rose-300 transition-colors">
                    3D Vital Human Observatory
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Interactive 3D anatomical model, beating heart, crystal skull, internal organ zoom (liver, spleen), and touchless AR palm controls.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-blue-900/40 flex items-center justify-between text-xs font-bold text-rose-300">
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 font-mono text-xs uppercase tracking-wider mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Interactive Mission Circuit</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Lumina Path — Interactive Road Map Game
                </h2>
                <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
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
          setActiveAstronaut((prev) => ({
            ...prev,
            faceSnaps: { ...(prev.faceSnaps || {}), ...snaps },
          }));
        }}
        onLoginSuccess={(astro) => {
          setActiveAstronaut(astro);
          setShowProfileSettings(false);
          setActiveView('portal');
          setPortalInitialScreen('dashboard');
        }}
      />

      {/* 5. BOTTOM CREDITS / STATUS BAR */}
      <footer className="w-full mt-auto relative z-10 border-t border-blue-900/30 bg-[#040816]/70 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} INOVA Aerospace & Digital Sovereignty. All telemetry verified.</p>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-cyan-300 transition-colors">Security Policy</a>
            <a href="#terms" className="hover:text-cyan-300 transition-colors">Mission Protocol</a>
            <a href="#status" className="hover:text-cyan-300 transition-colors flex items-center gap-1.5">
              <span>Relay Mesh Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

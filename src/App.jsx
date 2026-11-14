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
  ClipboardCheck
} from 'lucide-react';
import TrendAnalytics from './components/TrendAnalytics';
import LogoMarquee from './components/LogoMarquee';
import RoadmapGame from './roadmap/RoadmapGame';
import BehavioralHealthPage from './behavioral/BehavioralHealthPage';

/**
 * ============================================================================
 * TOPIC & EXECUTIVE KPI DATA CONFIGURATION:
 * Customize the title, mission description, and top-line KPI values below.
 * ============================================================================
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
  // Navigation State: 'overview' | 'roadmap' | 'behavioral'
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900 selection:bg-[#FF7300] selection:text-white font-sans">
      {/* 1. HEADER / NAVIGATION BAR */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7300] to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#0F172A]">
                INOVA<span className="text-[#FF7300]">.</span>
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-[#FF7300] border border-orange-200/60 hidden sm:inline-block">
                Enterprise Cloud
              </span>
            </div>
          </div>

          {/* Primary View Switcher Navigation Tabs */}
          <nav className="flex items-center p-1 rounded-xl bg-blue-950/60 border border-blue-800/40 backdrop-blur-md overflow-x-auto">
            {/* Tab 1: Overview */}
            <button
              type="button"
              onClick={() => {
                setActiveView('overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'overview'
                  ? 'bg-gradient-to-r from-[#FF7300] to-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry & Trends</span>
            </button>

            {/* Tab 2: Roadmap Game */}
            <button
              type="button"
              onClick={() => {
                setActiveView('roadmap');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'roadmap'
                  ? 'bg-gradient-to-r from-amber-400 to-[#F5B82E] text-slate-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Roadmap Quest</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping hidden sm:inline-block" />
            </button>

            {/* Tab 3: Behavioral Health */}
            <button
              type="button"
              onClick={() => {
                setActiveView('behavioral');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'behavioral'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-400/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Behavioral Health</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline-block" />
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2 shrink-0">
            {activeView === 'overview' ? (
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setActiveView('roadmap');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hidden sm:inline-flex items-center justify-center text-xs font-semibold text-[#06132B] bg-gradient-to-r from-amber-400 to-[#F5B82E] hover:from-amber-300 hover:to-amber-500 px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Gamepad2 className="w-3.5 h-3.5 mr-1" />
                  <span>Roadmap</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setActiveView('behavioral');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hidden md:inline-flex items-center justify-center text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <HeartPulse className="w-3.5 h-3.5 mr-1" />
                  <span>Health Check</span>
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  setActiveView('overview');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center text-xs font-semibold text-white bg-blue-900/60 hover:bg-blue-800/80 border border-blue-700/50 px-3.5 py-2 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Return to Overview</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE / HERO */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
              <span className="flex h-2 w-2 rounded-full bg-[#FF7300] animate-pulse"></span>
              <span>Open, flexible & secure enterprise integration</span>
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.12]">
              Architecting resilient systems with <span className="text-[#FF7300]">complete autonomy</span>.
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed">
              Connect mission-critical data, orchestrate enterprise APIs, and maintain 
              strict data governance across hybrid and sovereign clouds with zero vendor lock-in.
            </p>

            {/* CTA Button Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                type="button" 
                onClick={() => setActiveView('dashboard')}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-[#FF7300] hover:bg-[#e66800] transition-all shadow-lg shadow-orange-500/25 active:scale-98 cursor-pointer"
              >
                <span>Open ISS Telemetry Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button 
                type="button" 
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all active:scale-98 cursor-pointer"
              >
                <span>Schedule Architecture Review</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-4 grid grid-cols-3 gap-6 border-t border-slate-100 max-w-xl">
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">99.999%</p>
                <p className="text-xs text-slate-500 font-medium">Uptime Guarantee</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">60B+</p>
                <p className="text-xs text-slate-500 font-medium">Daily API Calls</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">100%</p>
                <p className="text-xs text-slate-500 font-medium">Sovereign Compliant</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Minimalist Workspace Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">inova-runtime ~ cluster-ready</span>
                </div>
                <div className="flex items-center text-xs font-mono text-[#FF7300] bg-orange-950/40 px-2 py-0.5 rounded border border-orange-900/50">
                  v4.3.0-prod
                </div>
              </div>

              <div className="font-mono text-xs space-y-2 text-slate-300">
                <p className="text-slate-500">// Sovereign microgateway orchestration</p>
                <p><span className="text-[#FF7300]">import</span> &#123; createSecureMesh &#125; <span className="text-[#FF7300]">from</span> <span className="text-emerald-400">'@inova/sovereign'</span>;</p>
                <div className="p-3 my-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center text-emerald-400 space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Multi-region data isolation: Active</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Middle Section: Interactive Trend Comparison Charts */}
          <TrendAnalytics />

          {/* Two Side-by-Side Interactive Feature Portals */}
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Feature 1: Lumina Quest Roadmap Game */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-950/90 via-indigo-950/80 to-slate-900/90 border border-cyan-400/30 p-6 sm:p-7 backdrop-blur-md shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-700" />
                
                <div className="space-y-3 text-left relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Interactive Starlight Circuit</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    Lumina Quest Roadmap
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Navigate the fiber-optic roadmap path. Complete orbital challenge nodes, trigger shooting current surges, collect achievement stars, and reach the Grand Trophy Vault.
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-blue-900/40 relative z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('roadmap');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-[#F5B82E] text-[#06132B] shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Launch Roadmap Game</span>
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
                    CrewMind Behavioral Check
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Comprehensive astronaut behavioral health suite: Part A personality baseline, daily mood & sleep logs (Part B), Part C readiness scoring, and Psychomotor Vigilance (PVT) testing.
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

        </div>
      </main>

      {/* ROADMAP GAME VIEW */}
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

      {/* ====================================================================
          3. BOTTOM SECTION: WSO2-STYLE INFINITE LOGO MARQUEE (INTACT)
          ==================================================================== */}
      <footer className="w-full mt-auto relative z-10">
        <LogoMarquee />

        {/* Minimal Bottom Baseline / Credits Bar */}
        <div className="border-t border-blue-900/30 bg-[#040816]/70 py-4">
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
        </div>
      </footer>
    </div>
  );
}
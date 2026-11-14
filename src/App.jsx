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
  ArrowLeft
} from 'lucide-react';
import TrendAnalytics from './components/TrendAnalytics';
import LogoMarquee from './components/LogoMarquee';
import RoadmapGame from './roadmap/RoadmapGame';

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
  // Navigation State: 'overview' (Telemetry & Trends) or 'roadmap' (Lumina Path Game)
  const [activeView, setActiveView] = useState('overview');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#060D21] bg-[radial-gradient(ellipse_at_top,_#0F214D_0%,_#060D21_70%)] text-slate-100 selection:bg-[#FF7300] selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Background Ambient Grid & Glow Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B0a_1px,transparent_1px),linear-gradient(to_bottom,#1E293B0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ====================================================================
          1. HEADER / NAVIGATION BAR WITH MULTI-PAGE SWITCHER
          ==================================================================== */}
      <header className="border-b border-blue-900/40 bg-[#060D21]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF7300] to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                INOVA<span className="text-[#FF7300]">.</span>
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950/80 text-cyan-300 border border-cyan-500/30 hidden sm:inline-block">
                Mission Telemetry
              </span>
            </div>
          </div>

          {/* Primary View Switcher Navigation Tabs */}
          <nav className="flex items-center p-1 rounded-xl bg-blue-950/60 border border-blue-800/40 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setActiveView('overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeView === 'overview'
                  ? 'bg-gradient-to-r from-[#FF7300] to-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry & Trends</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('roadmap');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeView === 'roadmap'
                  ? 'bg-gradient-to-r from-amber-400 to-[#F5B82E] text-slate-950 shadow-md shadow-amber-400/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Lumina Roadmap Quest</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping hidden sm:inline-block" />
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            {activeView === 'overview' ? (
              <button 
                type="button" 
                onClick={() => {
                  setActiveView('roadmap');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hidden sm:inline-flex items-center justify-center text-xs font-semibold text-[#06132B] bg-gradient-to-r from-amber-400 to-[#F5B82E] hover:from-amber-300 hover:to-amber-500 px-3.5 py-2 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>Launch Roadmap Game</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
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

      {/* ====================================================================
          2. DYNAMIC PAGE CONTENT: OVERVIEW OR ROADMAP GAME
          ==================================================================== */}
      {activeView === 'overview' ? (
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
                      <div>
                        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                          {kpi.title}
                        </span>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                            {kpi.currentValue}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-950/70 border border-blue-800/40 text-cyan-300 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-blue-900/40 flex items-center justify-between text-xs">
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

          {/* Next Page Interactive Roadmap Game Banner */}
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full my-8">
            <div className="rounded-2xl bg-gradient-to-r from-blue-950/90 via-indigo-950/80 to-slate-900/90 border border-cyan-400/30 p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-700" />
              
              <div className="space-y-2.5 text-left relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Next Page: Interactive Circuit</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Lumina Quest: Starlight Circuit Roadmap
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Navigate the interactive fiber-optic roadmap path. Complete orbital challenge nodes, trigger shooting current surges, collect achievement stars, and reach the Grand Trophy Vault.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveView('roadmap');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-[#F5B82E] text-[#06132B] shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap relative z-10 shrink-0"
              >
                <span>Launch Roadmap Game</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

        </main>
      ) : (
        /* ROADMAP GAME VIEW */
        <main className="flex-1 w-full relative z-10">
          <RoadmapGame onBack={() => setActiveView('overview')} />
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

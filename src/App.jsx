import React from 'react';
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
  ExternalLink 
} from 'lucide-react';
import TrendAnalytics from './components/TrendAnalytics';
import LogoMarquee from './components/LogoMarquee';

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
      isPositive: true, // Lower latency is positive
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
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#060D21] bg-[radial-gradient(ellipse_at_top,_#0F214D_0%,_#060D21_70%)] text-slate-100 selection:bg-[#FF7300] selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Background Ambient Grid & Glow Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B0a_1px,transparent_1px),linear-gradient(to_bottom,#1E293B0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ====================================================================
          1. HEADER / NAVIGATION BAR
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

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#overview" className="text-white hover:text-cyan-400 transition-colors">Overview</a>
            <a href="#trends" className="hover:text-cyan-400 transition-colors">Trend Comparison</a>
            <a href="#benchmarks" className="hover:text-cyan-400 transition-colors">Cohort Benchmarks</a>
            <a href="#governance" className="hover:text-cyan-400 transition-colors">Sovereignty</a>
          </nav>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Constellation Active</span>
            </div>
            <button 
              type="button" 
              className="inline-flex items-center justify-center text-sm font-semibold text-white bg-gradient-to-r from-[#FF7300] to-orange-500 hover:from-orange-600 hover:to-[#FF7300] px-4 py-2 rounded-lg transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <span>Export Telemetry</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================================
          2. TOP SECTION: TOPIC HEADER & SUMMARY KPI STRIP
          ==================================================================== */}
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

                  {/* Baseline & Delta Comparison Row */}
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

        {/* ====================================================================
            3. MIDDLE SECTION: INTERACTIVE TREND COMPARISON CHARTS
            ==================================================================== */}
        <TrendAnalytics />

      </main>

      {/* ====================================================================
          4. BOTTOM SECTION: WSO2-STYLE INFINITE LOGO MARQUEE (INTACT)
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

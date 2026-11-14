import React, { useState } from 'react';
import { ArrowRight, Layers, Sparkles, CheckCircle2, ShieldCheck, Globe2, Cpu, Terminal } from 'lucide-react';
import LogoMarquee from './components/LogoMarquee';
import AuraDashboard from './pages/AuraDashboard';

export default function App() {
  // Toggle between 'landing' (teammate's page) and 'dashboard' (your 3D ISS dashboard)
  const [activeView, setActiveView] = useState('landing');

  if (activeView === 'dashboard') {
    return <AuraDashboard onBackToHome={() => setActiveView('landing')} />;
  }

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

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#platform" className="hover:text-[#FF7300] transition-colors">Platform</a>
            <a href="#solutions" className="hover:text-[#FF7300] transition-colors">Solutions</a>
            <a href="#architecture" className="hover:text-[#FF7300] transition-colors">Architecture</a>
            <a href="#developers" className="hover:text-[#FF7300] transition-colors">Developers</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button 
              type="button" 
              className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              type="button" 
              onClick={() => setActiveView('dashboard')}
              className="inline-flex items-center justify-center text-sm font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Launch AURA 3D</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
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
                  <div className="flex items-center text-emerald-400 space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Zero-trust mTLS proxy: Enforced</span>
                  </div>
                  <div className="flex items-center text-cyan-400 space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Latency overhead: &lt; 0.8ms p99</span>
                  </div>
                </div>
                <p className="text-slate-400"><span className="text-purple-400">const</span> mesh = <span className="text-sky-400">createSecureMesh</span>(&#123; policy: <span className="text-emerald-400">'strict-local'</span> &#125;);</p>
                <p className="text-slate-400"><span className="text-purple-400">await</span> mesh.<span className="text-sky-400">deploy</span>(&#123; target: <span className="text-amber-400">'eu-central-sovereign'</span> &#125;);</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-5 mt-5 border-t border-slate-800 text-center">
                <div className="p-2 rounded bg-slate-900/50">
                  <Globe2 className="w-4 h-4 mx-auto text-[#FF7300] mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Federation</span>
                </div>
                <div className="p-2 rounded bg-slate-900/50">
                  <Cpu className="w-4 h-4 mx-auto text-[#FF7300] mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Low Latency</span>
                </div>
                <div className="p-2 rounded bg-slate-900/50">
                  <Terminal className="w-4 h-4 mx-auto text-[#FF7300] mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">GitOps Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 3. LOGO MARQUEE SECTION */}
      <footer className="w-full mt-auto">
        <LogoMarquee />

        <div className="border-t border-slate-100 bg-slate-50/60 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} INOVA Technologies. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-slate-800 transition-colors">Terms of Service</a>
              <a href="#security" className="hover:text-slate-800 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
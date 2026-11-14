import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
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

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#platform" className="hover:text-[#FF7300] transition-colors">Platform</a>
          <a href="#solutions" className="hover:text-[#FF7300] transition-colors">Solutions</a>
          <a href="#architecture" className="hover:text-[#FF7300] transition-colors">Architecture</a>
          <a href="#developers" className="hover:text-[#FF7300] transition-colors">Developers</a>
          <a href="#docs" className="hover:text-[#FF7300] transition-colors">Docs</a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-2 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button 
            type="button"
            className="inline-flex items-center justify-center text-sm font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import LogoMarquee from './LogoMarquee';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto">
      {/* WSO2-Style Infinite Logo Marquee Component */}
      <LogoMarquee />

      {/* Minimal Bottom Baseline / Credits Bar */}
      <div className="border-t border-slate-100 bg-slate-50/60 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {currentYear} INOVA Technologies. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-800 transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-slate-800 transition-colors">Security Center</a>
            <a href="#status" className="hover:text-slate-800 transition-colors flex items-center">
              <span>System Status</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1.5"></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

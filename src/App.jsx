import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';

/**
 * Root Application Component
 * Structured as a full-height flex column with:
 * - Navbar sticky at top
 * - Hero/Main workspace sitting cleanly above in the center
 * - Logo Marquee section anchored at the bottom of the page
 */
export default function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-slate-900 selection:bg-[#FF7300] selection:text-white font-sans">
      {/* 1. Header Navigation */}
      <Navbar />

      {/* 2. Hero / Main Workspace Section */}
      <Hero />

      {/* 3. WSO2-Style Infinite Logo Marquee & Footer (Anchored at Bottom) */}
      <Footer />
    </div>
  );
}

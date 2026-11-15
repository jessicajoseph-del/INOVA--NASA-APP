import React, { useState } from 'react';

/**
 * FUNCTIONING STATUS MEDICAL MONITORING SENSOR CARDS:
 * 4 bordered sensor cards loaded cleanly from public/
 */
export const STATUS_CARDS = [
  {
    id: 1,
    topLabel: 'Heart Rate',
    src: '/holter_recorder.jpg',
    fallbackSrc: '/holtar_monitor.png',
    alt: 'Heart Rate Holter Recorder',
    defaultFrequency: 'Daily',
  },
  {
    id: 2,
    topLabel: 'Blood pressure',
    src: '/istat-system.png',
    fallbackSrc: '/blood_presure.png',
    alt: 'Blood Pressure i-STAT System',
    defaultFrequency: 'Weekly',
  },
  {
    id: 3,
    topLabel: 'Blood sugar',
    src: '/images.jpeg',
    fallbackSrc: '/blood_sugar.png',
    alt: 'Blood Sugar Glucose Monitor',
    defaultFrequency: 'Weekly',
  },
  {
    id: 4,
    topLabel: 'Body temperature',
    src: '/thernmzl.jpg',
    fallbackSrc: '/thermal.jpg',
    alt: 'Body Temperature Thermal Sensor',
    defaultFrequency: 'Daily', // Updated to Daily as requested
  },
];

export const LOGOS = STATUS_CARDS;

// Repeat cards in each track so it seamlessly spans any viewport width without gaps
const REPEATED_CARDS = [...STATUS_CARDS, ...STATUS_CARDS];

export default function LogoMarquee() {
  // Dynamic per-card schedule frequency state: 1: Daily, 2: Weekly, 3: Weekly, 4: Daily
  const [frequencies, setFrequencies] = useState({
    1: 'Daily', // Heart Rate
    2: 'Weekly', // Blood pressure
    3: 'Weekly', // Blood sugar
    4: 'Daily', // Body temperature (Changed to Daily)
  });

  const handleSetFrequency = (cardId, freq) => {
    setFrequencies((prev) => ({
      ...prev,
      [cardId]: freq,
    }));
  };

  const renderCard = (card, trackKey) => {
    const currentFreq = frequencies[card.id] || card.defaultFrequency;
    const isDaily = currentFreq === 'Daily';
    const nextFrequency = isDaily ? 'Weekly' : 'Daily';

    return (
      <div
        key={trackKey}
        className="flex flex-col items-center justify-between w-52 md:w-60 rounded-2xl border border-cyan-400/35 bg-[#0B1736]/90 p-4 sm:p-5 backdrop-blur-md transition-all duration-300 hover:border-cyan-400 hover:scale-105 shrink-0 shadow-lg text-center"
      >
        {/* Top Label */}
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 mb-2.5">
          {card.topLabel}
        </span>

        {/* Center Image Container */}
        <div className="h-20 md:h-24 w-full flex items-center justify-center my-1 bg-white/5 rounded-xl p-2 border border-white/10">
          <img
            src={card.src}
            alt={card.alt}
            title={card.topLabel}
            className="h-full w-auto max-w-full object-contain rounded-md"
            loading="lazy"
            onError={(e) => {
              if (card.fallbackSrc && e.currentTarget.src !== card.fallbackSrc) {
                e.currentTarget.src = card.fallbackSrc;
              }
            }}
          />
        </div>

        {/* Show only the current interval; activate to switch to the other interval. */}
        <div className="mt-3.5 w-full flex items-center justify-center gap-1.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSetFrequency(card.id, nextFrequency);
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 border ${
              isDaily
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)] scale-102 ring-1 ring-emerald-400/50'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-200'
            }`}
            title={`Switch sampling interval to ${nextFrequency}`}
            aria-label={`Current sampling interval: ${currentFreq}. Activate to switch to ${nextFrequency}.`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDaily ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400/60'
              }`}
            />
            <span>{currentFreq}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full py-10 bg-transparent border-t border-[#DCD5C7]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading - Ink Blue for Oat Ivory Theme */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0B1736] mb-2 font-sans">
            Functioning status
          </h2>
          <div className="inline-flex items-center gap-3 text-xs font-mono text-[#5A657D] bg-[#EDE8DE] px-3.5 py-1 rounded-full border border-[#DCD5C7]">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Protocol (Green)
            </span>
          </div>
        </div>

        {/* Outer Scrolling Track Container with Soft Left & Right Edge Fade Mask */}
        <div
          className="overflow-hidden relative w-full py-4 select-none"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          }}
          aria-label="Medical Monitoring Functioning Status Carousel"
        >
          {/* Continuous pure CSS marquee track with pause on hover */}
          <div className="animate-marquee hover:[animation-play-state:paused] flex w-max items-center">
            {/* Primary Track */}
            <div className="flex shrink-0 items-center gap-6 md:gap-10 pr-6 md:pr-10">
              {REPEATED_CARDS.map((card, idx) =>
                renderCard(card, `status-primary-${card.id}-${idx}`)
              )}
            </div>

            {/* Identical Duplicate Track: Zero-jump Seamless Looping */}
            <div
              className="flex shrink-0 items-center gap-6 md:gap-10 pr-6 md:pr-10"
              aria-hidden="true"
            >
              {REPEATED_CARDS.map((card, idx) =>
                renderCard(card, `status-duplicate-${card.id}-${idx}`)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

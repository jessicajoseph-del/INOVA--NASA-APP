import React from 'react';

/**
 * FUNCTIONING STATUS MEDICAL MONITORING SENSOR CARDS:
 * 4 bordered sensor cards loaded cleanly from public/
 */
export const STATUS_CARDS = [
  {
    id: 1,
    topLabel: 'Heart Rate',
    src: '/holtar_monitor.png',
    alt: 'Heart Rate Holter Monitor',
    bottomLabel: 'Daily',
  },
  {
    id: 2,
    topLabel: 'Blood pressure',
    src: '/blood_presure.png',
    alt: 'Blood Pressure Monitor',
    bottomLabel: 'Weekly',
  },
  {
    id: 3,
    topLabel: 'Blood sugar',
    src: '/blood_sugar.png',
    alt: 'Blood Sugar Glucose Monitor',
    bottomLabel: 'Weekly',
  },
  {
    id: 4,
    topLabel: 'Body temperature',
    src: '/body_temp.png',
    alt: 'Body Temperature Sensor',
    bottomLabel: 'Weekly',
  },
];

export const LOGOS = STATUS_CARDS;

// Repeat cards in each track so it seamlessly spans any viewport width without gaps
const REPEATED_CARDS = [...STATUS_CARDS, ...STATUS_CARDS];

export default function LogoMarquee() {
  return (
    <section className="w-full py-12 bg-transparent border-t border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading - Clean White for Ink Blue Theme */}
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white text-center mb-8">
          Functioning status
        </h2>

        {/* Outer Scrolling Track Container with Soft Left & Right Edge Fade Mask */}
        <div
          className="overflow-hidden relative w-full py-6 select-none"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
          }}
          aria-label="Medical Monitoring Functioning Status Carousel"
        >
          {/* Continuous pure CSS marquee track with pause on hover */}
          <div className="animate-marquee hover:[animation-play-state:paused] flex w-max items-center">
            {/* Primary Track */}
            <div className="flex shrink-0 items-center gap-8 md:gap-12 pr-8 md:pr-12">
              {REPEATED_CARDS.map((card, idx) => (
                <div
                  key={`status-primary-${card.id}-${idx}`}
                  className="flex flex-col items-center justify-between w-48 md:w-56 rounded-xl border border-cyan-400/35 bg-[#0B1736]/80 px-5 py-4 backdrop-blur-md transition-all duration-300 hover:border-cyan-400 hover:scale-105 shrink-0"
                >
                  {/* Top Label */}
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 mb-3 text-center">
                    {card.topLabel}
                  </span>

                  {/* Center Image */}
                  <img
                    src={card.src}
                    alt={card.alt}
                    title={card.topLabel}
                    className="h-16 md:h-20 w-auto object-contain my-1"
                    loading="lazy"
                  />

                  {/* Bottom Label */}
                  <span className="mt-3 inline-block rounded-full border border-slate-600/50 bg-slate-900/60 px-3 py-0.5 text-[11px] font-mono uppercase tracking-widest text-slate-300">
                    {card.bottomLabel}
                  </span>
                </div>
              ))}
            </div>

            {/* Identical Duplicate Track: Zero-jump Seamless Looping */}
            <div
              className="flex shrink-0 items-center gap-8 md:gap-12 pr-8 md:pr-12"
              aria-hidden="true"
            >
              {REPEATED_CARDS.map((card, idx) => (
                <div
                  key={`status-duplicate-${card.id}-${idx}`}
                  className="flex flex-col items-center justify-between w-48 md:w-56 rounded-xl border border-cyan-400/35 bg-[#0B1736]/80 px-5 py-4 backdrop-blur-md transition-all duration-300 hover:border-cyan-400 hover:scale-105 shrink-0"
                >
                  {/* Top Label */}
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 mb-3 text-center">
                    {card.topLabel}
                  </span>

                  {/* Center Image */}
                  <img
                    src={card.src}
                    alt={card.alt}
                    title={card.topLabel}
                    className="h-16 md:h-20 w-auto object-contain my-1"
                    loading="lazy"
                  />

                  {/* Bottom Label */}
                  <span className="mt-3 inline-block rounded-full border border-slate-600/50 bg-slate-900/60 px-3 py-0.5 text-[11px] font-mono uppercase tracking-widest text-slate-300">
                    {card.bottomLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

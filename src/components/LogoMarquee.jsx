import React from 'react';

/**
 * ============================================================================
 * LOGOS CONFIGURATION ARRAY:
 * Each entry currently points to the placeholder image "/hum.jpeg" located
 * in the public/ folder (accessible directly at the root URL).
 *
 * HOW TO SWAP REAL LOGOS:
 * 1. Place your company/partner logo files (SVG or PNG) in public/logos/
 * 2. Update the 'src' string below (e.g., src: "/logos/partner1.svg")
 * 3. Update the 'alt' and 'name' attributes accordingly.
 * ============================================================================
 */
export const LOGOS = [
  {
    id: 1,
    name: 'Partner 1',
    alt: 'Partner 1 Logo',
    src: '/hum.jpeg', // <-- Replace with individual logo path (e.g. '/logos/partner1.svg')
  },
  {
    id: 2,
    name: 'Partner 2',
    alt: 'Partner 2 Logo',
    src: '/hum.jpeg', // <-- Replace with individual logo path (e.g. '/logos/partner2.svg')
  },
  {
    id: 3,
    name: 'Partner 3',
    alt: 'Partner 3 Logo',
    src: '/hum.jpeg', // <-- Replace with individual logo path (e.g. '/logos/partner3.svg')
  },
  {
    id: 4,
    name: 'Partner 4',
    alt: 'Partner 4 Logo',
    src: '/hum.jpeg', // <-- Replace with individual logo path (e.g. '/logos/partner4.svg')
  },
  {
    id: 5,
    name: 'Partner 5',
    alt: 'Partner 5 Logo',
    src: '/hum.jpeg', // <-- Replace with individual logo path (e.g. '/logos/partner5.svg')
  },
  {
    id: 6,
    name: 'Partner 6',
    alt: 'Partner 6 Logo',
    src: '/hum.jpeg', // <-- Replace with individual logo path (e.g. '/logos/partner6.svg')
  },
];

export default function LogoMarquee() {
  return (
    <section className="w-full py-12 bg-transparent border-t border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading - Clean White for Ink Blue Theme */}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white text-center mb-10">
          Relied on for <span className="text-[#FF7300]">digital sovereignty</span>
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
          aria-label="Partner and Customer Logos Carousel"
        >
          {/* Continuous pure CSS marquee track with pause on hover */}
          <div className="animate-marquee hover:[animation-play-state:paused] flex w-max items-center">
            {/* Primary Track: Group of 6 Logos */}
            <div className="flex shrink-0 items-center gap-16 md:gap-24 pr-16 md:pr-24">
              {LOGOS.map((logo) => (
                <div
                  key={`logo-primary-${logo.id}`}
                  className="flex items-center justify-center shrink-0"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.name}
                    className="h-12 md:h-16 w-auto object-contain grayscale opacity-80 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105 cursor-pointer"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Identical Duplicate Track: Zero-jump Seamless Looping */}
            <div
              className="flex shrink-0 items-center gap-16 md:gap-24 pr-16 md:pr-24"
              aria-hidden="true"
            >
              {LOGOS.map((logo) => (
                <div
                  key={`logo-duplicate-${logo.id}`}
                  className="flex items-center justify-center shrink-0"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.name}
                    className="h-12 md:h-16 w-auto object-contain grayscale opacity-80 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105 cursor-pointer"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

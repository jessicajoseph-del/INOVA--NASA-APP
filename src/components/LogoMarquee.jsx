import React from 'react';

// ============================================================================
// LOGOS CONFIGURATION:
// All 6 entries are currently set to use the placeholder image '/hum.jpg'
// (and also bundled in 'src/assets/hum.jpg').
//
// HOW TO REPLACE IN THE FUTURE:
// 1. Drop your company logo SVG/PNG files into '/public/logos/' or 'src/assets/'
// 2. Update the 'src' value for each brand below (e.g. src: '/logos/wso2.svg')
// ============================================================================
export const LOGOS = [
  {
    id: 'logo-1',
    name: 'Enterprise Client 1',
    alt: 'Enterprise Client 1 Logo',
    src: '/hum.jpg', // <-- SWAP PATH HERE: e.g. '/logos/client-1.svg'
  },
  {
    id: 'logo-2',
    name: 'Enterprise Client 2',
    alt: 'Enterprise Client 2 Logo',
    src: '/hum.jpg', // <-- SWAP PATH HERE: e.g. '/logos/client-2.svg'
  },
  {
    id: 'logo-3',
    name: 'Enterprise Client 3',
    alt: 'Enterprise Client 3 Logo',
    src: '/hum.jpg', // <-- SWAP PATH HERE: e.g. '/logos/client-3.svg'
  },
  {
    id: 'logo-4',
    name: 'Enterprise Client 4',
    alt: 'Enterprise Client 4 Logo',
    src: '/hum.jpg', // <-- SWAP PATH HERE: e.g. '/logos/client-4.svg'
  },
  {
    id: 'logo-5',
    name: 'Enterprise Client 5',
    alt: 'Enterprise Client 5 Logo',
    src: '/hum.jpg', // <-- SWAP PATH HERE: e.g. '/logos/client-5.svg'
  },
  {
    id: 'logo-6',
    name: 'Enterprise Client 6',
    alt: 'Enterprise Client 6 Logo',
    src: '/hum.jpg', // <-- SWAP PATH HERE: e.g. '/logos/client-6.svg'
  },
];

export default function LogoMarquee() {
  return (
    <section className="w-full py-12 md:py-16 bg-white overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Heading matching exact WSO2 design & typography */}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A] mb-12">
          Relied on for <span className="text-[#FF7300]">digital sovereignty</span>
        </h2>

        {/* Marquee Outer Container with Left & Right Soft Edge Fade-Out Mask */}
        <div
          className="relative w-full overflow-hidden mask-marquee py-3 [mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_15%,black_85%,transparent_100%)]"
          aria-label="Partner and Customer Logos Carousel"
        >
          {/* Continuous pure CSS/Tailwind marquee track */}
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] select-none">
            {/* Primary group of 6 logos */}
            <div className="flex shrink-0 items-center gap-16 md:gap-24 pr-16 md:pr-24">
              {LOGOS.map((logo, index) => (
                <div
                  key={`primary-${logo.id || index}`}
                  className="flex items-center justify-center shrink-0"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.name}
                    className="h-12 md:h-14 w-auto object-contain grayscale opacity-80 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105 cursor-pointer"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Back-to-back duplicate group for zero-jump, seamless infinite looping */}
            <div
              className="flex shrink-0 items-center gap-16 md:gap-24 pr-16 md:pr-24"
              aria-hidden="true"
            >
              {LOGOS.map((logo, index) => (
                <div
                  key={`duplicate-${logo.id || index}`}
                  className="flex items-center justify-center shrink-0"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.name}
                    className="h-12 md:h-14 w-auto object-contain grayscale opacity-80 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-105 cursor-pointer"
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


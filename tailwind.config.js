import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ridge: {
          canvas: '#F7F4EE',    // Oat Ivory (Primary Canvas: Main page background across all modules)
          card: '#FFFFFF',      // Warm Alabaster (Elevated Card / Panel: Telemetry cards, charts, modals)
          surface: '#EDE8DE',   // Soft Flax / Linen (Secondary Surface / Track: Inactive gauge arcs, rows, inputs)
          border: '#DCD5C7',    // Sandstone Hairline (Subtle Border / Divider: Crisp 1px card outlines, gridlines)
          ink: '#0B1736',       // Deep Ink Navy (Primary Text: Headings, biometric values, body text)
          muted: '#5A657D',     // Slate Pewter (Muted / Monospace Label: Upper telemetry labels, axis ticks, timestamps)
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: ["light"],
    darkTheme: "light",
    base: true,
    styled: true,
    utils: true,
  },
}

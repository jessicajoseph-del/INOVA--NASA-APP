import React from 'react';

export default function HealthMetricsPanel({ isVisible = true }) {
  const metrics = [
    { value: '72', unit: 'bpm', label: 'HEART RATE' },
    { value: '118/76', unit: '', label: 'BLOOD PRESSURE' },
    { value: '95', unit: 'mg/dL', label: 'BLOOD GLUCOSE' },
    { value: '36.8', unit: '°C', label: 'TEMPERATURE' },
    { value: '7.5', unit: 'h', label: 'SLEEP' },
    { value: 'Balanced', unit: '', label: 'MOOD' },
  ];

  return (
    <aside
      style={{
        position: 'absolute',
        top: '64px',
        left: 0,
        bottom: 0,
        width: '320px',
        padding: '24px 28px 40px 32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 20,
        pointerEvents: isVisible ? 'auto' : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-40px)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ── LEFT VERTICAL RULER TICK-MARKS ── */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          bottom: '80px',
          left: '12px',
          width: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          opacity: 0.42,
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i % 8 === 0 ? '10px' : i % 4 === 0 ? '6px' : '3px',
              height: '1px',
              backgroundColor: 'rgba(6, 19, 43, 0.35)',
            }}
          />
        ))}
      </div>

      {/* ── METRICS STACK ── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {metrics.map((m, index) => (
          <div
            key={index}
            style={{
              padding: '14px 0',
              borderBottom: '1px solid rgba(6, 19, 43, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 600,
                  color: '#06132b',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {m.value}
              </span>
              {m.unit && (
                <span
                  style={{
                    fontSize: '0.9rem',
                    color: '#1e3a8a',
                    fontWeight: 600,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {m.unit}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: '0.64rem',
                color: '#1e3a8a',
                letterSpacing: '0.18em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 600,
                marginTop: '4px',
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── BOTTOM CALLOUT: EXPLORE WITHIN ── */}
      <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
        <h2
          style={{
            fontSize: '2.3rem',
            fontWeight: 600,
            color: '#06132b',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Explore within.
        </h2>
        <p
          style={{
            fontSize: '0.84rem',
            color: '#1e3a8a',
            margin: 0,
            letterSpacing: '0.01em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Select a system to reveal its data.
        </p>
      </div>
    </aside>
  );
}


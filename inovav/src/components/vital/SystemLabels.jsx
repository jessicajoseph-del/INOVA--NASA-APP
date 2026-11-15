import React, { useState } from 'react';

export default function SystemLabels({ isVisible = true, onSelectSystem, activeSystem }) {
  const [hoveredLabel, setHoveredLabel] = useState(null);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 25,
      }}
    >
      {/* ── 01 / CARDIOVASCULAR (LEFT TO HEART) ── */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '41%',
          transform: 'translate(-100%, -50%)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHoveredLabel('cardiovascular')}
        onMouseLeave={() => setHoveredLabel(null)}
        onClick={() => onSelectSystem('cardiovascular')}
      >
        <div style={{ textAlign: 'right', marginRight: '16px' }}>
          <div
            style={{
              fontSize: '0.72rem',
              color: hoveredLabel === 'cardiovascular' ? '#f6eedb' : '#9fb6da',
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              transition: 'color 0.2s',
            }}
          >
            01 /
          </div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 400,
              color: hoveredLabel === 'cardiovascular' ? '#f6eedb' : '#ead9b2',
              letterSpacing: '0.02em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              transition: 'color 0.2s',
            }}
          >
            Cardiovascular
          </div>
        </div>

        {/* Thin horizontal indicator line connecting to Heart */}
        <div style={{ position: 'relative', width: '130px', height: '1px', backgroundColor: hoveredLabel === 'cardiovascular' ? '#f6eedb' : 'rgba(246, 238, 219, 0.4)', transition: 'background-color 0.2s' }}>
          {/* Dot Anchor on Heart */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translate(50%, -50%)',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#f6eedb',
              boxShadow: hoveredLabel === 'cardiovascular' ? '0 0 12px #f6eedb' : '0 0 6px #ead9b2',
              transition: 'box-shadow 0.2s',
            }}
          />
        </div>
      </div>

      {/* ── 02 / SKELETAL (RIGHT TO SHOULDER / CLAVICLE) ── */}
      <div
        style={{
          position: 'absolute',
          top: '32%',
          left: '73%',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHoveredLabel('skeletal')}
        onMouseLeave={() => setHoveredLabel(null)}
        onClick={() => onSelectSystem('skeletal')}
      >
        {/* Angled indicator line from shoulder */}
        <div style={{ position: 'relative', width: '45px', height: '1px', transform: 'rotate(-35deg)', transformOrigin: 'left center', backgroundColor: hoveredLabel === 'skeletal' ? '#f6eedb' : 'rgba(246, 238, 219, 0.4)', marginRight: '18px' }}>
          {/* Dot Anchor on Shoulder */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#f6eedb',
              boxShadow: hoveredLabel === 'skeletal' ? '0 0 12px #f6eedb' : '0 0 6px #ead9b2',
            }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: '0.72rem',
              color: hoveredLabel === 'skeletal' ? '#f6eedb' : '#9fb6da',
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              transition: 'color 0.2s',
            }}
          >
            02 /
          </div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 400,
              color: hoveredLabel === 'skeletal' ? '#f6eedb' : '#ead9b2',
              letterSpacing: '0.02em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              transition: 'color 0.2s',
            }}
          >
            Skeletal
          </div>
        </div>
      </div>

      {/* ── 03 / METABOLIC (LOWER RIGHT TO ABDOMEN) ── */}
      <div
        style={{
          position: 'absolute',
          top: '67%',
          left: '67%',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'auto',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHoveredLabel('metabolic')}
        onMouseLeave={() => setHoveredLabel(null)}
        onClick={() => onSelectSystem('metabolic')}
      >
        {/* Horizontal line from abdomen */}
        <div style={{ position: 'relative', width: '150px', height: '1px', backgroundColor: hoveredLabel === 'metabolic' ? '#f6eedb' : 'rgba(246, 238, 219, 0.4)', marginRight: '16px', transition: 'background-color 0.2s' }}>
          {/* Dot Anchor on Abdomen */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#f6eedb',
              boxShadow: hoveredLabel === 'metabolic' ? '0 0 12px #f6eedb' : '0 0 6px #ead9b2',
            }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: '0.72rem',
              color: hoveredLabel === 'metabolic' ? '#f6eedb' : '#9fb6da',
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              transition: 'color 0.2s',
            }}
          >
            03 /
          </div>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 400,
              color: hoveredLabel === 'metabolic' ? '#f6eedb' : '#ead9b2',
              letterSpacing: '0.02em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              transition: 'color 0.2s',
            }}
          >
            Metabolic
          </div>
        </div>
      </div>
    </div>
  );
}


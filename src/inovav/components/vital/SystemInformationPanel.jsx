import React, { useState } from 'react';

const SYSTEM_CONFIGS = {
  cardiovascular: {
    systemBadge: 'SYSTEM 01',
    title: 'Cardiovascular',
    metric1: { value: '72 bpm', label: 'Heart rate' },
    metric2: { value: '118/76', unit: 'mmHg', label: 'Blood pressure' },
    graph1Title: 'HEART RATE / ILLUSTRATIVE TREND',
    graph1Time: '10:00 — 13:00',
    graph2Title: 'CARDIOVASCULAR EVENTS',
    graph2Sub: 'No event data',
    // Realistic smoothed curve points for Graph 1
    points1: [
      { x: 0, y: 70 },
      { x: 10, y: 55 },
      { x: 20, y: 50 },
      { x: 30, y: 65 },
      { x: 40, y: 20 },
      { x: 50, y: 35 },
      { x: 60, y: 60 },
      { x: 70, y: 50 },
      { x: 80, y: 25 },
      { x: 90, y: 38 },
      { x: 100, y: 45 },
    ],
    // Area graph waveform for Graph 2
    points2: [
      { x: 0, y: 85 },
      { x: 10, y: 80 },
      { x: 18, y: 65 },
      { x: 22, y: 88 },
      { x: 30, y: 75 },
      { x: 38, y: 50 },
      { x: 45, y: 68 },
      { x: 52, y: 62 },
      { x: 60, y: 72 },
      { x: 65, y: 22 },
      { x: 75, y: 60 },
      { x: 85, y: 80 },
      { x: 92, y: 72 },
      { x: 100, y: 68 },
    ],
  },
  skeletal: {
    systemBadge: 'SYSTEM 02',
    title: 'Skeletal System',
    metric1: { value: '0.02%', label: 'Bone mineral variance' },
    metric2: { value: 'Nominal', unit: '', label: 'Microgravity density' },
    graph1Title: 'BONE MASS RETENTION / 90-DAY TREND',
    graph1Time: 'SOL 01 — SOL 90',
    graph2Title: 'STRUCTURAL LOAD DISTRIBUTION',
    graph2Sub: 'Vertebral spine decompression active',
    points1: [
      { x: 0, y: 40 },
      { x: 20, y: 42 },
      { x: 40, y: 45 },
      { x: 60, y: 43 },
      { x: 80, y: 46 },
      { x: 100, y: 44 },
    ],
    points2: [
      { x: 0, y: 75 },
      { x: 25, y: 68 },
      { x: 50, y: 72 },
      { x: 75, y: 65 },
      { x: 100, y: 70 },
    ],
  },
  immune: {
    systemBadge: 'SYSTEM 03',
    title: 'Immune & Lymphatic',
    metric1: { value: '6.4 k/μL', label: 'WBC count' },
    metric2: { value: '0.4 mg/L', unit: '', label: 'C-reactive protein' },
    graph1Title: 'LEUKOCYTE DIFFERENTIAL PROFILE',
    graph1Time: '06:00 — 18:00',
    graph2Title: 'IMMUNOGLOBULIN TITERS',
    graph2Sub: 'IgG / IgM within mission bounds',
    points1: [
      { x: 0, y: 50 },
      { x: 20, y: 45 },
      { x: 40, y: 60 },
      { x: 60, y: 52 },
      { x: 80, y: 48 },
      { x: 100, y: 55 },
    ],
    points2: [
      { x: 0, y: 80 },
      { x: 20, y: 70 },
      { x: 40, y: 65 },
      { x: 60, y: 75 },
      { x: 80, y: 68 },
      { x: 100, y: 72 },
    ],
  },
  nutrition: {
    systemBadge: 'SYSTEM 04',
    title: 'Metabolic & Nutrition',
    metric1: { value: '95 mg/dL', label: 'Fasting glucose' },
    metric2: { value: '2,450', unit: 'kcal', label: 'Daily intake' },
    graph1Title: 'CONTINUOUS GLUCOSE MONITORING (CGM)',
    graph1Time: '04:00 — 16:00',
    graph2Title: 'KETONE & LACTATE CLEARANCE',
    graph2Sub: 'Aerobic metabolic clearance optimal',
    points1: [
      { x: 0, y: 60 },
      { x: 15, y: 50 },
      { x: 30, y: 70 },
      { x: 45, y: 35 },
      { x: 60, y: 45 },
      { x: 75, y: 65 },
      { x: 90, y: 40 },
      { x: 100, y: 52 },
    ],
    points2: [
      { x: 0, y: 75 },
      { x: 30, y: 60 },
      { x: 60, y: 50 },
      { x: 80, y: 65 },
      { x: 100, y: 58 },
    ],
  },
  sleep: {
    systemBadge: 'SYSTEM 05',
    title: 'Sleep & Mood',
    metric1: { value: '7.5 h', label: 'Total rest sleep' },
    metric2: { value: 'Balanced', unit: '', label: 'Cognitive stability' },
    graph1Title: 'CIRCADIAN DELTA-WAVE ENTRAINMENT',
    graph1Time: '22:00 — 06:00',
    graph2Title: 'REM / DEEP SLEEP CYCLES',
    graph2Sub: 'Phase 3 restorative sleep confirmed',
    points1: [
      { x: 0, y: 65 },
      { x: 20, y: 30 },
      { x: 40, y: 25 },
      { x: 60, y: 45 },
      { x: 80, y: 20 },
      { x: 100, y: 35 },
    ],
    points2: [
      { x: 0, y: 80 },
      { x: 25, y: 45 },
      { x: 50, y: 35 },
      { x: 75, y: 55 },
      { x: 100, y: 40 },
    ],
  },
};

// Generates smooth SVG Catmull-Rom or cubic Bezier path
function generateSmoothSvgPath(points, width, height) {
  if (!points || points.length === 0) return '';
  const pts = points.map((p) => ({
    x: (p.x / 100) * width,
    y: (p.y / 100) * height,
  }));

  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export default function SystemInformationPanel({ activeSystem, isVisible = false }) {
  const [subTab, setSubTab] = useState('overview'); // 'overview' | 'trends'

  if (!isVisible || !activeSystem) return null;

  const data = SYSTEM_CONFIGS[activeSystem] || SYSTEM_CONFIGS.cardiovascular;
  const graphWidth = 400;
  const graphHeight = 110;

  const path1 = generateSmoothSvgPath(data.points1, graphWidth, graphHeight);
  const path2Line = generateSmoothSvgPath(data.points2, graphWidth, graphHeight);
  const path2Area = `${path2Line} L ${graphWidth} ${graphHeight} L 0 ${graphHeight} Z`;

  return (
    <aside
      style={{
        position: 'absolute',
        top: '68px',
        right: '40px',
        width: '450px',
        bottom: '80px',
        zIndex: 30,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 28px',
        background: 'rgba(10, 28, 63, 0.84)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(246, 238, 219, 0.18)',
        borderRadius: '2px',
        boxShadow: '0 20px 50px rgba(3, 10, 24, 0.7)',
        animation: 'fadeInPanel 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* ── RETICLE CORNER BRACKETS ── */}
      <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '12px', height: '12px', borderTop: '1.5px solid #ead9b2', borderLeft: '1.5px solid #ead9b2', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '12px', height: '12px', borderTop: '1.5px solid #ead9b2', borderRight: '1.5px solid #ead9b2', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '12px', height: '12px', borderBottom: '1.5px solid #ead9b2', borderLeft: '1.5px solid #ead9b2', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '12px', height: '12px', borderBottom: '1.5px solid #ead9b2', borderRight: '1.5px solid #ead9b2', pointerEvents: 'none' }} />

      {/* ── TOP BADGE & TITLE ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '0.62rem',
              color: '#ead9b2',
              fontFamily: 'monospace',
              letterSpacing: '0.14em',
              border: '1px solid rgba(246, 238, 219, 0.3)',
              padding: '2px 7px',
              borderRadius: '2px',
            }}
          >
            {data.systemBadge}
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'Cinzel, "Playfair Display", Georgia, serif',
            fontSize: '2.4rem',
            fontWeight: 400,
            color: '#f6eedb',
            margin: '0 0 18px 0',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
          }}
        >
          {data.title}
        </h1>

        {/* ── DUAL PRIMARY BIOMETRICS ── */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '36px', marginBottom: '22px' }}>
          {/* Metric 1 */}
          <div>
            <div style={{ fontSize: '2.1rem', fontWeight: 400, color: '#f6eedb', lineHeight: 1.1 }}>
              {data.metric1.value}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9fb6da', marginTop: '4px', letterSpacing: '0.05em' }}>
              {data.metric1.label}
            </div>
          </div>

          {/* Metric 2 */}
          <div>
            <div style={{ fontSize: '2.1rem', fontWeight: 400, color: '#f6eedb', lineHeight: 1.1 }}>
              {data.metric2.value}{' '}
              {data.metric2.unit && (
                <span style={{ fontSize: '1rem', color: '#ead9b2' }}>{data.metric2.unit}</span>
              )}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#9fb6da', marginTop: '4px', letterSpacing: '0.05em' }}>
              {data.metric2.label}
            </div>
          </div>
        </div>
      </div>

      {/* ── GRAPH 1: HEART RATE / ILLUSTRATIVE TREND ── */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.64rem', color: '#9fb6da', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
            {data.graph1Title}
          </span>
          <span style={{ fontSize: '0.62rem', color: '#ead9b2', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
            {data.graph1Time}
          </span>
        </div>

        {/* Graph 1 SVG Canvas */}
        <div
          style={{
            width: '100%',
            height: '115px',
            background: 'rgba(6, 19, 43, 0.65)',
            border: '1px solid rgba(246, 238, 219, 0.14)',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Grid Lines */}
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', pointerEvents: 'none' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ borderRight: '1px solid rgba(246, 238, 219, 0.06)', borderBottom: '1px solid rgba(246, 238, 219, 0.06)' }} />
            ))}
          </div>

          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} style={{ width: '100%', height: '100%', display: 'block' }}>
            {/* Glowing filter definition */}
            <defs>
              <filter id="glow-oat" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Oat Yellow Line */}
            <path
              d={path1}
              fill="none"
              stroke="#f6eedb"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow-oat)"
            />
          </svg>

          {/* Time axis legend at bottom */}
          <div style={{ position: 'absolute', bottom: '4px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.58rem', color: '#9fb6da', fontFamily: 'monospace' }}>
            <span>10:00</span>
            <span>13:00</span>
          </div>
        </div>
      </div>

      {/* ── GRAPH 2: EVENTS AREA WAVEFORM ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.64rem', color: '#9fb6da', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
            {data.graph2Title}
          </span>
          <span style={{ fontSize: '0.62rem', color: '#ead9b2', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
            {data.graph2Sub}
          </span>
        </div>

        {/* Graph 2 SVG Canvas with Area Gradient */}
        <div
          style={{
            width: '100%',
            height: '100px',
            background: 'rgba(6, 19, 43, 0.65)',
            border: '1px solid rgba(246, 238, 219, 0.14)',
            borderRadius: '2px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Grid */}
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', pointerEvents: 'none' }}>
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} style={{ borderRight: '1px solid rgba(246, 238, 219, 0.05)', borderBottom: '1px solid rgba(246, 238, 219, 0.05)' }} />
            ))}
          </div>

          <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <linearGradient id="oat-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f6eedb" stopOpacity="0.42" />
                <stop offset="100%" stopColor="#ead9b2" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Filled Mountain Area */}
            <path d={path2Area} fill="url(#oat-gradient)" />

            {/* Stroke Line */}
            <path
              d={path2Line}
              fill="none"
              stroke="#ead9b2"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* ── BOTTOM SUB-TABS: OVERVIEW / TRENDS ── */}
      <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid rgba(246, 238, 219, 0.14)', paddingTop: '16px', marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => setSubTab('overview')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0 0 6px 0',
            cursor: 'pointer',
            fontSize: '0.78rem',
            color: subTab === 'overview' ? '#f6eedb' : '#9fb6da',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            position: 'relative',
            outline: 'none',
            transition: 'color 0.2s',
          }}
        >
          Overview
          {subTab === 'overview' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#f6eedb',
                boxShadow: '0 0 8px rgba(246, 238, 219, 0.75)',
              }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('trends')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0 0 6px 0',
            cursor: 'pointer',
            fontSize: '0.78rem',
            color: subTab === 'trends' ? '#f6eedb' : '#9fb6da',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            position: 'relative',
            outline: 'none',
            transition: 'color 0.2s',
          }}
        >
          Trends
          {subTab === 'trends' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#f6eedb',
                boxShadow: '0 0 8px rgba(246, 238, 219, 0.75)',
              }}
            />
          )}
        </button>
      </div>
    </aside>
  );
}


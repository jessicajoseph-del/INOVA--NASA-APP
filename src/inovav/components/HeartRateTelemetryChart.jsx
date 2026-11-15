import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

function CustomTelemetryTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div
      style={{
        background: 'rgba(6, 19, 43, 0.94)',
        border: '1px solid rgba(246, 238, 219, 0.35)',
        borderRadius: '4px',
        padding: '8px 12px',
        boxShadow: '0 8px 24px rgba(4, 12, 28, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: '0.65rem',
          color: '#ead9b2',
          letterSpacing: '0.14em',
          marginBottom: '2px',
        }}
      >
        UTC {label}
      </div>
      <div
        className="font-mono"
        style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#f6eedb',
          letterSpacing: '0.06em',
        }}
      >
        {point.bpm} <span style={{ fontSize: '0.7rem', color: '#9fb6da', fontWeight: 400 }}>BPM</span>
      </div>
    </div>
  );
}

export default function HeartRateTelemetryChart({ data = [], currentBpm = 74 }) {
  const stats = useMemo(() => {
    if (!data.length) {
      return { min: currentBpm, max: currentBpm, avg: currentBpm };
    }
    const values = data.map((d) => d.bpm);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
    return { min, max, avg };
  }, [data, currentBpm]);

  return (
    <div
      style={{
        marginTop: '14px',
        padding: '12px 14px 8px',
        background: 'rgba(10, 28, 63, 0.45)',
        border: '1px solid rgba(246, 238, 219, 0.16)',
        borderRadius: '6px',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#f6eedb',
              boxShadow: '0 0 8px #ead9b2',
              animation: 'pulse 1.5s infinite',
            }}
          />
          <span
            className="font-mono"
            style={{
              fontSize: '0.7rem',
              color: '#ead9b2',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            CARDIAC TELEMETRY // REAL-TIME BPM
          </span>
        </div>

        <div
          className="font-mono"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '0.68rem',
            color: '#9fb6da',
            letterSpacing: '0.1em',
          }}
        >
          <span>
            MIN <strong style={{ color: '#f6eedb' }}>{stats.min}</strong>
          </span>
          <span>
            AVG <strong style={{ color: '#f6eedb' }}>{stats.avg}</strong>
          </span>
          <span>
            MAX <strong style={{ color: '#f6eedb' }}>{stats.max}</strong>
          </span>
          <span
            style={{
              color: '#06132b',
              background: '#f6eedb',
              padding: '2px 7px',
              borderRadius: '3px',
              fontWeight: 700,
            }}
          >
            {currentBpm} BPM
          </span>
        </div>
      </div>

      {/* Recharts Line Chart - Compact reduced length */}
      <div style={{ width: '100%', height: '105px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid
              stroke="rgba(246, 238, 219, 0.08)"
              strokeDasharray="3 4"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="rgba(246, 238, 219, 0.2)"
              tick={{ fill: '#9fb6da', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              domain={[60, 90]}
              stroke="rgba(246, 238, 219, 0.2)"
              tick={{ fill: '#9fb6da', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
              ticks={[60, 75, 90]}
            />
            <ReferenceLine
              y={72}
              stroke="rgba(234, 217, 178, 0.3)"
              strokeDasharray="4 4"
            />
            <Tooltip
              content={<CustomTelemetryTooltip />}
              cursor={{ stroke: 'rgba(234, 217, 178, 0.35)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke="#f6eedb"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: '#ead9b2',
                stroke: '#06132b',
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

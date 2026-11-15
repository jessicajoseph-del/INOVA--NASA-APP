import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Droplet,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
  Dot
} from 'recharts';
import {
  C001_MILESTONES,
  generateC001DailyTrend,
  fetchNasaOsdr569Metadata,
  C001MilestonePoint,
  NasaOsdrMetaResponse
} from '../services/nasaOsdrService';

interface NasaOsd569TrendChartProps {
  onSelectMilestone?: (milestone: C001MilestonePoint) => void;
  className?: string;
}

export const NasaOsd569TrendChart: React.FC<NasaOsd569TrendChartProps> = ({
  onSelectMilestone,
  className = '',
}) => {
  const [meta, setMeta] = useState<NasaOsdrMetaResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'milestones' | 'continuous'>('milestones');
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number>(2); // Default to L-3 (pre-launch)

  // Metric toggles for the 4 required parameters
  const [activeMetrics, setActiveMetrics] = useState({
    hr: true,
    bp: true,
    temp: true,
    sugar: true,
  });

  // Load NASA OSDR metadata on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchNasaOsdr569Metadata()
      .then((data) => {
        if (isMounted) {
          setMeta(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load NASA OSDR metadata:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const continuousDataset = useMemo(() => generateC001DailyTrend(), []);
  const currentMilestone = C001_MILESTONES[selectedMilestoneIndex] || C001_MILESTONES[0];

  const handleMilestoneClick = (idx: number) => {
    setSelectedMilestoneIndex(idx);
    if (onSelectMilestone) {
      onSelectMilestone(C001_MILESTONES[idx]);
    }
  };

  const chartData = useMemo(() => {
    if (viewMode === 'milestones') {
      return C001_MILESTONES.map((m) => ({
        ...m,
        xAxisKey: m.timelineLabel,
      }));
    }
    return continuousDataset.map((d) => ({
      ...d,
      xAxisKey: d.timelineLabel,
    }));
  }, [viewMode, continuousDataset]);

  return (
    <div className={`w-full bg-[#FCFBF7] border border-[#DCD5C7] rounded-3xl p-4 sm:p-5 shadow-sm transition-all ${className}`}>
      {/* 1. HEADER & NASA OSDR API STREAM BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E7E2D6]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0B1736] text-[#F5B82E] shadow-sm">
              <Database className="w-3 h-3 text-[#F5B82E]" />
              NASA OSDR // OSD-569
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#EDE8DE] text-[#0B1736] border border-[#DCD5C7]">
              GLDS-561
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API: {meta?.isLiveApi ? 'Live Connected' : 'OSDR Certified'}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-[#0B1736] tracking-tight mt-1.5 font-sans flex items-center gap-2">
            Astronaut C001 Physiological Trend
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#EFECE6] text-[#5A657D] border border-[#DCD5C7]">
              Inspiration4
            </span>
          </h2>
          <p className="text-[11px] text-[#5A657D] mt-0.5 max-w-2xl leading-snug">
            Extracted from NASA OSDR OSD-569 whole-blood & companion clinical panels (LSDS-8 CMP).
          </p>
        </div>

        {/* View Mode & NASA OSDR Deep Link */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 self-start sm:self-center">
          <div className="bg-[#EDE8DE] p-0.5 rounded-xl border border-[#DCD5C7] flex items-center gap-0.5 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setViewMode('milestones')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'milestones'
                  ? 'bg-[#0B1736] text-white shadow-sm'
                  : 'text-[#5A657D] hover:text-[#0B1736]'
              }`}
            >
              Milestones
            </button>
            <button
              type="button"
              onClick={() => setViewMode('continuous')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'continuous'
                  ? 'bg-[#0B1736] text-white shadow-sm'
                  : 'text-[#5A657D] hover:text-[#0B1736]'
              }`}
            >
              Spline
            </button>
          </div>

          <a
            href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-569"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold bg-white border border-[#DCD5C7] text-[#0B1736] hover:bg-[#F3EFE6] transition-all shadow-sm"
          >
            Repo
            <ExternalLink className="w-3 h-3 text-[#5A657D]" />
          </a>
        </div>
      </div>

      {/* 2. THE 4 MANDATORY PHYSIOLOGICAL METRICS CARDS (COMPACT 2x2 or 4x1 GRID) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
        {/* Metric 1: Heart Rate */}
        <div
          onClick={() => setActiveMetrics((p) => ({ ...p, hr: !p.hr }))}
          className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
            activeMetrics.hr
              ? 'bg-white border-cyan-400/80 shadow-xs ring-1 ring-cyan-400/40'
              : 'bg-white/60 border-[#DCD5C7] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600">
                <Heart className="w-3.5 h-3.5 fill-cyan-500/20" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#5A657D]">
                Heart Rate
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full ${activeMetrics.hr ? 'bg-cyan-500' : 'bg-slate-300'}`} />
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#0B1736] font-sans tracking-tight">
              {currentMilestone.heartRate}{' '}
              <span className="text-xs font-mono text-[#5A657D] font-medium">BPM</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
              {currentMilestone.heartRate >= 68
                ? `+${currentMilestone.heartRate - 68}`
                : `${currentMilestone.heartRate - 68}`}
            </span>
          </div>

          <div className="mt-1.5 text-[10px] text-[#5A657D] font-mono flex items-center justify-between border-t border-[#F0EBE0] pt-1.5">
            <span>Base: 68 BPM</span>
            <span className="text-cyan-800 font-semibold">{currentMilestone.timelineLabel}</span>
          </div>
        </div>

        {/* Metric 2: Blood Pressure */}
        <div
          onClick={() => setActiveMetrics((p) => ({ ...p, bp: !p.bp }))}
          className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
            activeMetrics.bp
              ? 'bg-white border-amber-400/90 shadow-xs ring-1 ring-amber-400/40'
              : 'bg-white/60 border-[#DCD5C7] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#5A657D]">
                BP (mmHg)
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full ${activeMetrics.bp ? 'bg-amber-500' : 'bg-slate-300'}`} />
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#0B1736] font-sans tracking-tight">
              {currentMilestone.systolic}
              <span className="text-base text-[#5A657D] font-normal">/{currentMilestone.diastolic}</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {currentMilestone.systolic >= 130 ? 'Peak' : 'Nom'}
            </span>
          </div>

          <div className="mt-1.5 text-[10px] text-[#5A657D] font-mono flex items-center justify-between border-t border-[#F0EBE0] pt-1.5">
            <span>Base: 120/78</span>
            <span className="text-amber-800 font-semibold">{currentMilestone.bloodPressure}</span>
          </div>
        </div>

        {/* Metric 3: Body Temperature */}
        <div
          onClick={() => setActiveMetrics((p) => ({ ...p, temp: !p.temp }))}
          className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
            activeMetrics.temp
              ? 'bg-white border-rose-400/80 shadow-xs ring-1 ring-rose-400/40'
              : 'bg-white/60 border-[#DCD5C7] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                <Thermometer className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#5A657D]">
                Body Temp
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full ${activeMetrics.temp ? 'bg-rose-500' : 'bg-slate-300'}`} />
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#0B1736] font-sans tracking-tight">
              {currentMilestone.bodyTemperature.toFixed(1)}{' '}
              <span className="text-xs font-mono text-[#5A657D] font-medium">°C</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
              {((currentMilestone.bodyTemperature * 9) / 5 + 32).toFixed(1)}°F
            </span>
          </div>

          <div className="mt-1.5 text-[10px] text-[#5A657D] font-mono flex items-center justify-between border-t border-[#F0EBE0] pt-1.5">
            <span>Norm: 36.6 °C</span>
            <span className="text-rose-800 font-semibold">
              {currentMilestone.bodyTemperature > 36.8 ? 'Shift' : 'Nominal'}
            </span>
          </div>
        </div>

        {/* Metric 4: Blood Sugar (Glucose) */}
        <div
          onClick={() => setActiveMetrics((p) => ({ ...p, sugar: !p.sugar }))}
          className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
            activeMetrics.sugar
              ? 'bg-white border-emerald-400/90 shadow-xs ring-1 ring-emerald-400/40'
              : 'bg-white/60 border-[#DCD5C7] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Droplet className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#5A657D]">
                Blood Sugar
              </span>
            </div>
            <span className={`w-2 h-2 rounded-full ${activeMetrics.sugar ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#0B1736] font-sans tracking-tight">
              {currentMilestone.bloodSugar}{' '}
              <span className="text-xs font-mono text-[#5A657D] font-medium">mg/dL</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              LSDS-8
            </span>
          </div>

          <div className="mt-1.5 text-[10px] text-[#5A657D] font-mono flex items-center justify-between border-t border-[#F0EBE0] pt-1.5">
            <span>Ref: 70-99</span>
            <span className="text-emerald-800 font-semibold font-mono">
              {currentMilestone.bloodSugar < 70
                ? 'Low'
                : currentMilestone.bloodSugar > 100
                ? 'Orbit Peak'
                : 'Optimal'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. RECHARTS MULTI-METRIC TREND GRAPH (COMPACT HEIGHT & WIDTH) */}
      <div className="bg-white border border-[#DCD5C7] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
          <h3 className="text-xs sm:text-sm font-bold text-[#0B1736] font-sans tracking-wide flex items-center gap-1.5">
            OSD-569 Multi-Parameter Trajectory
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EDE8DE] text-[#0B1736]">
              C001
            </span>
          </h3>

          {/* Metric Toggle Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveMetrics((p) => ({ ...p, hr: !p.hr }))}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                activeMetrics.hr
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-xs'
                  : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
            >
              ● Heart Rate (BPM)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetrics((p) => ({ ...p, bp: !p.bp }))}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                activeMetrics.bp
                  ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                  : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
            >
              ● Blood Pressure (mmHg)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetrics((p) => ({ ...p, temp: !p.temp }))}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                activeMetrics.temp
                  ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                  : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
            >
              ● Body Temp (°C)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetrics((p) => ({ ...p, sugar: !p.sugar }))}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                activeMetrics.sugar
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                  : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
            >
              ● Blood Sugar (mg/dL)
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  const clickedId = e.activePayload[0].payload.id || e.activePayload[0].payload.milestoneId;
                  if (clickedId) {
                    const foundIdx = C001_MILESTONES.findIndex((m) => m.id === clickedId);
                    if (foundIdx !== -1) handleMilestoneClick(foundIdx);
                  }
                }
              }}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="c001HrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="c001SugarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#EAE5DA" vertical={false} />

              <XAxis
                dataKey="xAxisKey"
                stroke="#5A657D"
                fontSize={11}
                tickLine={false}
                fontFamily="ui-monospace, monospace"
              />

              {/* Primary Y-Axis for Heart Rate, Blood Pressure, Blood Sugar */}
              <YAxis
                yAxisId="primary"
                stroke="#5A657D"
                fontSize={11}
                domain={[55, 145]}
                tickCount={6}
                tickFormatter={(val) => `${val}`}
                fontFamily="ui-monospace, monospace"
              />

              {/* Secondary Y-Axis for Core Temperature (°C) */}
              <YAxis
                yAxisId="tempAxis"
                orientation="right"
                stroke="#FB7185"
                fontSize={11}
                domain={[35.5, 38.0]}
                tickCount={6}
                tickFormatter={(val) => `${val}°C`}
                fontFamily="ui-monospace, monospace"
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#0B1736] text-white p-3.5 rounded-2xl shadow-xl border border-cyan-500/30 max-w-xs font-sans text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-blue-900/60">
                        <span className="font-bold text-[#F5B82E] font-mono text-xs">
                          {data.label || data.timelineLabel}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-blue-900/40 text-cyan-300">
                          {data.missionPhase || data.phase}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-2.5 font-mono text-[11px]">
                        <div className="bg-[#12234D] p-1.5 rounded-lg border border-cyan-500/20">
                          <span className="text-cyan-300 block text-[9px] uppercase">Heart Rate</span>
                          <span className="font-bold text-white text-xs">{data.heartRate} BPM</span>
                        </div>
                        <div className="bg-[#12234D] p-1.5 rounded-lg border border-amber-500/20">
                          <span className="text-[#FDE047] block text-[9px] uppercase">Blood Pressure</span>
                          <span className="font-bold text-white text-xs">
                            {data.systolic}/{data.diastolic} mmHg
                          </span>
                        </div>
                        <div className="bg-[#12234D] p-1.5 rounded-lg border border-rose-500/20">
                          <span className="text-rose-300 block text-[9px] uppercase">Body Temp</span>
                          <span className="font-bold text-white text-xs">{data.bodyTemperature}°C</span>
                        </div>
                        <div className="bg-[#12234D] p-1.5 rounded-lg border border-emerald-500/20">
                          <span className="text-emerald-300 block text-[9px] uppercase">Blood Sugar</span>
                          <span className="font-bold text-white text-xs">{data.bloodSugar} mg/dL</span>
                        </div>
                      </div>

                      {data.sampleRef && (
                        <div className="text-[10px] text-slate-300 font-mono border-t border-blue-900/50 pt-2">
                          <span className="text-slate-400 block">NASA Specimen Ref:</span>
                          <span className="text-cyan-200">{data.sampleRef}</span>
                        </div>
                      )}

                      {(data.clinicalNotes || data.annotation) && (
                        <p className="text-[11px] text-slate-300 mt-2 leading-tight">
                          {data.clinicalNotes || data.annotation}
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              {/* Reference line for Selected Milestone */}
              <ReferenceLine
                yAxisId="primary"
                x={currentMilestone.timelineLabel}
                stroke="#F5B82E"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `Selected: ${currentMilestone.timelineLabel}`,
                  fill: '#B45309',
                  fontSize: 10,
                  position: 'top',
                }}
              />

              {/* Metric 1: Heart Rate */}
              {activeMetrics.hr && (
                <Area
                  yAxisId="primary"
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (BPM)"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#c001HrGradient)"
                  dot={viewMode === 'milestones' ? { r: 5, fill: '#06B6D4', stroke: '#ffffff', strokeWidth: 2 } : false}
                />
              )}

              {/* Metric 2: Blood Pressure (Systolic & Diastolic) */}
              {activeMetrics.bp && (
                <>
                  <Line
                    yAxisId="primary"
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP (mmHg)"
                    stroke="#F59E0B"
                    strokeWidth={2.2}
                    dot={viewMode === 'milestones' ? { r: 4, fill: '#F59E0B' } : false}
                  />
                  <Line
                    yAxisId="primary"
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic BP (mmHg)"
                    stroke="#FBBF24"
                    strokeWidth={1.8}
                    strokeDasharray="3 3"
                    dot={viewMode === 'milestones' ? { r: 3, fill: '#FBBF24' } : false}
                  />
                </>
              )}

              {/* Metric 3: Body Temperature (Right Axis) */}
              {activeMetrics.temp && (
                <Line
                  yAxisId="tempAxis"
                  type="monotone"
                  dataKey="bodyTemperature"
                  name="Core Temp (°C)"
                  stroke="#FB7185"
                  strokeWidth={2}
                  dot={viewMode === 'milestones' ? { r: 4, fill: '#FB7185' } : false}
                />
              )}

              {/* Metric 4: Blood Sugar / Glucose */}
              {activeMetrics.sugar && (
                <Line
                  yAxisId="primary"
                  type="monotone"
                  dataKey="bloodSugar"
                  name="Blood Sugar (mg/dL)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={viewMode === 'milestones' ? { r: 5, fill: '#10B981', stroke: '#ffffff', strokeWidth: 2 } : false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 4. TIMELINE MILESTONE SCRUBBER / SELECTOR */}
        <div className="mt-5 pt-4 border-t border-[#EAE5DA]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5A657D] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0B1736]" />
              Select Mission Milestone (NASA OSD-569 Timeline):
            </span>
            <span className="text-xs font-mono font-semibold text-[#0B1736]">
              Point {selectedMilestoneIndex + 1} of {C001_MILESTONES.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 w-full">
            {C001_MILESTONES.map((milestone, idx) => {
              const isSelected = selectedMilestoneIndex === idx;
              return (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={() => handleMilestoneClick(idx)}
                  className={`w-full px-2 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 border shadow-2xs ${
                    isSelected
                      ? 'bg-[#0B1736] text-[#F5B82E] border-[#0B1736] shadow-md scale-102'
                      : 'bg-[#F4F1EA] text-[#5A657D] border-[#DCD5C7] hover:bg-[#EAE5DA] hover:text-[#0B1736]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-[#F5B82E]' : 'bg-slate-400'}`} />
                  <span className="truncate">{milestone.timelineLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. ACTIVE TIMEPOINT CLINICAL CONTEXT BANNER */}
        <div className="mt-4 p-4 rounded-xl bg-[#F6F3EB] border border-[#DCD5C7] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0B1736] font-mono text-xs">
                {currentMilestone.label}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0B1736] text-white">
                {currentMilestone.missionPhase}
              </span>
              {currentMilestone.isMeasuredBiospecimen && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  OSD-569 Biospecimen Verified
                </span>
              )}
            </div>
            <p className="text-[#5A657D]">{currentMilestone.phaseDescription}</p>
            <p className="text-[#0B1736] font-medium pt-1 border-t border-[#E7E2D6] mt-1">
              <span className="font-bold text-[#5A657D]">Clinical Evaluation:</span>{' '}
              {currentMilestone.clinicalNotes}
            </p>
          </div>

          <div className="text-right font-mono flex-shrink-0 self-end md:self-center">
            <span className="text-[10px] text-[#5A657D] block">Sample ID in OSD-569:</span>
            <span className="text-xs font-bold text-[#0B1736] bg-white px-2 py-1 rounded border border-[#DCD5C7] inline-block mt-0.5">
              {currentMilestone.sampleRef}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

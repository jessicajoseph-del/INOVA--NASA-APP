import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, BarChart3, Calendar, Layers, ShieldCheck } from 'lucide-react';

/**
 * TREND & COMPARISON DATASET (EASILY CUSTOMIZABLE):
 * Modify these series values or map your API data directly here.
 */
export const TREND_DATA = {
  '7d': [
    { period: 'Day 01', baseline: 82, actual: 88, variance: '+7.3%' },
    { period: 'Day 02', baseline: 84, actual: 86, variance: '+2.4%' },
    { period: 'Day 03', baseline: 83, actual: 91, variance: '+9.6%' },
    { period: 'Day 04', baseline: 86, actual: 95, variance: '+10.5%' },
    { period: 'Day 05', baseline: 85, actual: 92, variance: '+8.2%' },
    { period: 'Day 06', baseline: 88, actual: 98, variance: '+11.4%' },
    { period: 'Day 07', baseline: 87, actual: 104, variance: '+19.5%' },
  ],
  '30d': [
    { period: 'Wk 1', baseline: 80, actual: 84, variance: '+5.0%' },
    { period: 'Wk 2', baseline: 83, actual: 89, variance: '+7.2%' },
    { period: 'Wk 3', baseline: 85, actual: 96, variance: '+12.9%' },
    { period: 'Wk 4', baseline: 88, actual: 108, variance: '+22.7%' },
  ],
  'baseline': [
    { period: 'Phase A', baseline: 75, actual: 79, variance: '+5.3%' },
    { period: 'Phase B', baseline: 82, actual: 88, variance: '+7.3%' },
    { period: 'Phase C', baseline: 86, actual: 97, variance: '+12.8%' },
    { period: 'Phase D', baseline: 90, actual: 102, variance: '+13.3%' },
    { period: 'Phase E', baseline: 92, actual: 110, variance: '+19.6%' },
  ],
};

export const CATEGORY_BENCHMARKS = [
  { category: 'Mesh Routing', previous: 68, current: 89, delta: '+30.8%' },
  { category: 'Auth Verification', previous: 84, current: 96, delta: '+14.2%' },
  { category: 'Telemetry Stream', previous: 72, current: 91, delta: '+26.3%' },
  { category: 'Data Sovereignty', previous: 90, current: 99, delta: '+10.0%' },
  { category: 'Failure Failover', previous: 64, current: 82, delta: '+28.1%' },
  { category: 'Crypto Attest', previous: 88, current: 94, delta: '+6.8%' },
];

// Custom Dark Ink Blue Tooltip Component for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B1736] border border-[#DCD5C7]/40 backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[170px]">
        <p className="font-mono text-cyan-300 font-semibold border-b border-white/10 pb-1 mb-1.5">
          {label}
        </p>
        {payload.map((item, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
              />
              {item.name}:
            </span>
            <span className="font-mono font-bold text-white">
              {item.value} <span className="text-[10px] text-slate-300 font-normal">pts</span>
            </span>
          </div>
        ))}
        {payload[0] && payload[1] && (
          <div className="pt-1.5 mt-1 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-slate-300">Observed Delta:</span>
            <span className="font-mono font-semibold text-emerald-400">
              +{(payload[0].value - payload[1].value).toFixed(1)} pts
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function TrendAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const activeSeries = TREND_DATA[selectedPeriod] || TREND_DATA['7d'];

  return (
    <section className="w-full py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header & Tab Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#DCD5C7]">
          <div>
            <div className="flex items-center gap-2 text-[#5A657D] text-xs font-mono uppercase tracking-wider mb-1">
              <Activity className="w-3.5 h-3.5 text-[#0B1736]" />
              <span>Telemetry Delta & Cohort Variance</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#0B1736] tracking-tight">
              Mission Performance & Comparative Insights
            </h3>
          </div>

          {/* Interactive Period / Metric Filter Tabs */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#EDE8DE] border border-[#DCD5C7] shadow-sm">
            {[
              { id: '7d', label: '7-Day Trend' },
              { id: '30d', label: '30-Day Comparison' },
              { id: 'baseline', label: 'Baseline vs. Actual' },
            ].map((tab) => {
              const isActive = selectedPeriod === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPeriod(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1736] text-[#F7F4EE] shadow-sm font-semibold'
                      : 'text-[#5A657D] hover:text-[#0B1736] hover:bg-white/40'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two Side-by-Side Responsive Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CHART 1: MULTI-SERIES TREND (BASELINE VS. OBSERVED) */}
          <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-2xl p-6 shadow-[0_4px_20px_rgba(11,23,54,0.06)] relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-semibold text-[#0B1736] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#FF7300]" />
                    <span>Expected Baseline vs. Observed Actual</span>
                  </h4>
                  <p className="text-xs text-[#5A657D] mt-0.5">
                    Continuous monitoring over time interval with variance threshold
                  </p>
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +19.5% Peak Delta
                </span>
              </div>

              {/* Chart Container */}
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activeSeries}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF7300" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="#FF7300" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0B1736" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#0B1736" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke="#DCD5C7" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="period"
                      stroke="#5A657D"
                      tick={{ fill: '#5A657D', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: '#DCD5C7' }}
                    />
                    <YAxis
                      stroke="#5A657D"
                      tick={{ fill: '#5A657D', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      domain={['dataMin - 10', 'dataMax + 10']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={36}
                      iconType="plainline"
                      formatter={(value) => (
                        <span className="text-xs text-[#5A657D] font-medium mr-2">{value}</span>
                      )}
                    />

                    {/* Baseline: Dashed Line */}
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Expected Baseline"
                      stroke="#0B1736"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0B1736', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#0B1736', stroke: '#F7F4EE', strokeWidth: 2 }}
                    />

                    {/* Observed Actual: Solid Vibrant Orange with Soft Gradient */}
                    <Area
                      type="monotone"
                      dataKey="actual"
                      name="Observed Actual"
                      stroke="#FF7300"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#actualGradient)"
                      activeDot={{ r: 6, fill: '#FF7300', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Summary Pill Bar */}
            <div className="mt-4 pt-3 border-t border-[#DCD5C7] grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#EDE8DE] rounded-lg p-2 border border-[#DCD5C7]">
                <span className="text-[#5A657D] text-[10px] block">Mean Baseline</span>
                <span className="font-mono font-bold text-[#0B1736]">85.4 pts</span>
              </div>
              <div className="bg-[#EDE8DE] rounded-lg p-2 border border-[#DCD5C7]">
                <span className="text-[#5A657D] text-[10px] block">Mean Actual</span>
                <span className="font-mono font-bold text-[#FF7300]">93.4 pts</span>
              </div>
              <div className="bg-[#EDE8DE] rounded-lg p-2 border border-[#DCD5C7]">
                <span className="text-[#5A657D] text-[10px] block">Avg. Acceleration</span>
                <span className="font-mono font-bold text-emerald-700">+9.4%</span>
              </div>
            </div>
          </div>

          {/* CHART 2: COMPARATIVE BAR CHART (PREVIOUS VS. CURRENT CYCLE) */}
          <div className="bg-[#FFFFFF] border border-[#DCD5C7] rounded-2xl p-6 shadow-[0_4px_20px_rgba(11,23,54,0.06)] relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-semibold text-[#0B1736] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#0B1736]" />
                    <span>Category & Cohort Benchmark</span>
                  </h4>
                  <p className="text-xs text-[#5A657D] mt-0.5">
                    Side-by-side comparison across telemetry architecture pillars
                  </p>
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-[#EDE8DE] text-[#0B1736] border border-[#DCD5C7]">
                  6 Core Vectors
                </span>
              </div>

              {/* Bar Chart Container */}
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={CATEGORY_BENCHMARKS}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    barGap={6}
                  >
                    <CartesianGrid stroke="#DCD5C7" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="category"
                      stroke="#5A657D"
                      tick={{ fill: '#5A657D', fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: '#DCD5C7' }}
                    />
                    <YAxis
                      stroke="#5A657D"
                      tick={{ fill: '#5A657D', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 110]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-[#5A657D] font-medium mr-2">{value}</span>
                      )}
                    />

                    {/* Previous Cycle */}
                    <Bar
                      dataKey="previous"
                      name="Previous Cycle"
                      fill="#0B1736"
                      radius={[4, 4, 0, 0]}
                    />

                    {/* Current Cycle: Orange */}
                    <Bar
                      dataKey="current"
                      name="Current Cycle"
                      fill="#FF7300"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Analytical Insight Strip */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#EDE8DE] border border-[#DCD5C7] flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#0B1736]/10 text-[#0B1736] shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <span className="font-semibold text-[#0B1736]">Key Analytical Insight: </span>
                <span className="text-[#5A657D]">
                  Current operational cycle exhibits a <strong className="text-[#0B1736] font-bold">+30.8% throughput increase</strong> in Mesh Routing and reaches near-perfect <strong className="text-[#FF7300] font-bold">99.0% compliance</strong> in cryptographic Data Sovereignty verification.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}


import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BaselineMetrics, ScoredDay } from '../types/assessment';

interface TrendChartProps {
  days: ScoredDay[];
  baseline: BaselineMetrics;
  selectedDay: number;
  onSelectDay?: (day: number) => void;
}

interface ChartDatum {
  day: number;
  dayLabel: string;
  positiveScore: number;
  negativeScore: number;
  posDeviation: number;
  negDeviation: number;
  status: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
  baseline: BaselineMetrics;
}

const MoodTrendTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  baseline,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;

  const posSign = d.posDeviation >= 0 ? `+${d.posDeviation.toFixed(1)}` : d.posDeviation.toFixed(1);
  const negSign = d.negDeviation >= 0 ? `+${d.negDeviation.toFixed(1)}` : d.negDeviation.toFixed(1);

  return (
    <div className="rounded-2xl bg-[#10213B] text-[#FCF9F0] px-3.5 py-2.5 shadow-xl text-xs space-y-1.5 border border-white/10">
      <div className="flex items-center justify-between gap-4 font-mono tabular-nums">
        <span className="font-semibold">Flight Day {d.day}</span>
        <span className="text-[#E2D1A8]">{d.status}</span>
      </div>
      <div className="space-y-1 font-mono tabular-nums">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#8CE0CE]">Positive</span>
          <span>
            {d.positiveScore}/15 ({posSign} vs {baseline.positiveMean.toFixed(1)})
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#F6B87E]">Negative</span>
          <span>
            {d.negativeScore}/15 ({negSign} vs {baseline.negativeMean.toFixed(1)})
          </span>
        </div>
      </div>
    </div>
  );
};

export const TrendChart: React.FC<TrendChartProps> = ({
  days,
  baseline,
  selectedDay,
  onSelectDay,
}) => {
  const windowDays = days.slice(-7);

  const chartData: ChartDatum[] = windowDays.map((d) => ({
    day: d.day,
    dayLabel: `D${d.day}`,
    positiveScore: d.positiveScore,
    negativeScore: d.negativeScore,
    posDeviation: d.posDeviation,
    negDeviation: d.negDeviation,
    status: d.status,
  }));

  const inspectedDay =
    windowDays.find((d) => d.day === selectedDay) ??
    windowDays[windowDays.length - 1];

  return (
    <div className="space-y-3">
      {/* Legend & selected-day tabular readout */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#2B405E]">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-3 h-0.5 rounded-full bg-[#145252] inline-block" />
            Positive (3–15)
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span className="w-3 h-0.5 rounded-full bg-[#B45309] inline-block" />
            Negative (3–15)
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#566A86]">
            <span className="w-3 border-t border-dashed border-[#566A86] inline-block" />
            Baseline (7d)
          </span>
        </div>

        {inspectedDay && (
          <div className="text-xs font-mono tabular-nums text-[#12233B]">
            FD {inspectedDay.day} · Pos {inspectedDay.positiveScore} (
            {inspectedDay.posDeviation >= 0 ? '+' : ''}
            {inspectedDay.posDeviation.toFixed(1)}) · Neg{' '}
            {inspectedDay.negativeScore} (
            {inspectedDay.negDeviation >= 0 ? '+' : ''}
            {inspectedDay.negDeviation.toFixed(1)})
          </div>
        )}
      </div>

      {/* Recharts 7-Day Time-Series Chart */}
      <div className="w-full rounded-2xl bg-[#FCF9F0] border border-[#12233B]/10 p-2.5 sm:p-3.5">
        <div className="w-full h-[220px] sm:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 14, right: 16, left: -18, bottom: 4 }}
              onClick={(state) => {
                const idx =
                  typeof state?.activeTooltipIndex === 'number'
                    ? state.activeTooltipIndex
                    : -1;
                const datum =
                  (idx >= 0 ? chartData[idx] : undefined) ??
                  chartData.find((d) => d.dayLabel === String(state?.activeLabel ?? ''));
                if (datum?.day && onSelectDay) {
                  onSelectDay(datum.day);
                }
              }}
            >
              <CartesianGrid
                stroke="rgba(18, 35, 59, 0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="dayLabel"
                tick={{
                  fill: '#566A86',
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                axisLine={{ stroke: 'rgba(18, 35, 59, 0.14)' }}
                tickLine={false}
                dy={6}
              />
              <YAxis
                domain={[3, 15]}
                ticks={[3, 6, 9, 12, 15]}
                tick={{
                  fill: '#566A86',
                  fontSize: 11,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={<MoodTrendTooltip baseline={baseline} />}
                cursor={{
                  stroke: 'rgba(23, 48, 84, 0.22)',
                  strokeWidth: 1.5,
                }}
              />

              {/* Static dashed baseline lines for Positive and Negative streams */}
              <ReferenceLine
                y={baseline.positiveMean}
                stroke="#145252"
                strokeOpacity={0.5}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                label={{
                  value: `Pos Base ${baseline.positiveMean.toFixed(1)}`,
                  position: 'insideTopRight',
                  fill: '#145252',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
              <ReferenceLine
                y={baseline.negativeMean}
                stroke="#B45309"
                strokeOpacity={0.5}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                label={{
                  value: `Neg Base ${baseline.negativeMean.toFixed(1)}`,
                  position: 'insideBottomRight',
                  fill: '#B45309',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />

              <Line
                type="monotone"
                dataKey="positiveScore"
                name="Positive"
                stroke="#145252"
                strokeWidth={2.6}
                dot={(props) => {
                  const { cx, cy, payload } = props as {
                    cx?: number;
                    cy?: number;
                    payload?: ChartDatum;
                  };
                  if (cx == null || cy == null || !payload) return <g key="empty" />;
                  const isSelected = payload.day === selectedDay;
                  return (
                    <circle
                      key={`pos-${payload.day}`}
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 5.5 : 4}
                      fill={isSelected ? '#145252' : '#FCF9F0'}
                      stroke="#145252"
                      strokeWidth={2.3}
                      className="cursor-pointer"
                    />
                  );
                }}
                activeDot={{
                  r: 6,
                  fill: '#145252',
                  stroke: '#FCF9F0',
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="negativeScore"
                name="Negative"
                stroke="#B45309"
                strokeWidth={2.6}
                dot={(props) => {
                  const { cx, cy, payload } = props as {
                    cx?: number;
                    cy?: number;
                    payload?: ChartDatum;
                  };
                  if (cx == null || cy == null || !payload) return <g key="empty" />;
                  const isSelected = payload.day === selectedDay;
                  return (
                    <circle
                      key={`neg-${payload.day}`}
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 5.5 : 4}
                      fill={isSelected ? '#B45309' : '#FCF9F0'}
                      stroke="#B45309"
                      strokeWidth={2.3}
                      className="cursor-pointer"
                    />
                  );
                }}
                activeDot={{
                  r: 6,
                  fill: '#B45309',
                  stroke: '#FCF9F0',
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-xs text-[#4A5C75] leading-relaxed">
        Positive falling below its dashed baseline while negative stays flat is the classic early drift—visible three days before crossing a hard threshold.
      </p>
    </div>
  );
};

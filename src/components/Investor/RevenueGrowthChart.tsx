import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

type RevenuePoint = {
  month: string; // YYYY-MM
  monthDisplay: string; // MMM YYYY
  /**
   * Israel revenue = VAT-inclusive revenue (row 1 in the report: "הכנסות חייבות כולל מע\"מ")
   */
  israelRevenue: number;
  /**
   * International revenue = VAT-exempt revenue (row 4 in the report: "הכנסות פטורות")
   */
  internationalRevenue: number;
  totalRevenue?: number;
  cumulativeRevenue?: number;
  specialEvent?: string | null;
};

// Source: user's report screenshots for 2024 + 2025
const revenueData: RevenuePoint[] = [
  // 2024
  { month: '2024-01', monthDisplay: 'Jan 2024', israelRevenue: 20626.85, internationalRevenue: 177.72 },
  { month: '2024-02', monthDisplay: 'Feb 2024', israelRevenue: 18699.76, internationalRevenue: 698.68 },
  { month: '2024-03', monthDisplay: 'Mar 2024', israelRevenue: 26754.31, internationalRevenue: 308.48 },
  { month: '2024-04', monthDisplay: 'Apr 2024', israelRevenue: 25449.02, internationalRevenue: 315.16 },
  { month: '2024-05', monthDisplay: 'May 2024', israelRevenue: 28114.78, internationalRevenue: 0.0 },
  { month: '2024-06', monthDisplay: 'Jun 2024', israelRevenue: 18172.29, internationalRevenue: 220.5 },
  { month: '2024-07', monthDisplay: 'Jul 2024', israelRevenue: 17433.55, internationalRevenue: 2790.72 },
  { month: '2024-08', monthDisplay: 'Aug 2024', israelRevenue: 24715.55, internationalRevenue: 2900.47 },
  { month: '2024-09', monthDisplay: 'Sep 2024', israelRevenue: 24321.2, internationalRevenue: 2742.9 },
  { month: '2024-10', monthDisplay: 'Oct 2024', israelRevenue: 20881.9, internationalRevenue: 4475.75 },
  { month: '2024-11', monthDisplay: 'Nov 2024', israelRevenue: 28568.6, internationalRevenue: 6856.06 },
  { month: '2024-12', monthDisplay: 'Dec 2024', israelRevenue: 30857.01, internationalRevenue: 9748.56 },
  // 2025
  { month: '2025-01', monthDisplay: 'Jan 2025', israelRevenue: 24484.85, internationalRevenue: 6075.82 },
  { month: '2025-02', monthDisplay: 'Feb 2025', israelRevenue: 23685.0, internationalRevenue: 10426.89 },
  {
    month: '2025-03',
    monthDisplay: 'Mar 2025',
    israelRevenue: 21337.6,
    internationalRevenue: 68707.83,
    specialEvent: 'Distributor deal – 50 annual licenses (Portugal)',
  },
  { month: '2025-04', monthDisplay: 'Apr 2025', israelRevenue: 20901.0, internationalRevenue: 15208.93 },
  { month: '2025-05', monthDisplay: 'May 2025', israelRevenue: 22678.0, internationalRevenue: 15304.5 },
  { month: '2025-06', monthDisplay: 'Jun 2025', israelRevenue: 20879.6, internationalRevenue: 18372.3 },
  { month: '2025-07', monthDisplay: 'Jul 2025', israelRevenue: 22769.6, internationalRevenue: 17491.0 },
  { month: '2025-08', monthDisplay: 'Aug 2025', israelRevenue: 24292.6, internationalRevenue: 16628.43 },
  { month: '2025-09', monthDisplay: 'Sep 2025', israelRevenue: 23700.6, internationalRevenue: 15111.34 },
  { month: '2025-10', monthDisplay: 'Oct 2025', israelRevenue: 22353.4, internationalRevenue: 14745.83 },
  { month: '2025-11', monthDisplay: 'Nov 2025', israelRevenue: 25091.0, internationalRevenue: 17307.57 },
  { month: '2025-12', monthDisplay: 'Dec 2025', israelRevenue: 22649.4, internationalRevenue: 22712.16 },
].map((p, idx, arr) => {
  const totalRevenue = p.israelRevenue + p.internationalRevenue;
  const prev = idx > 0 ? arr[idx - 1] : undefined;
  const prevCum = (prev as RevenuePoint | undefined)?.cumulativeRevenue ?? 0;
  return {
    ...p,
    totalRevenue,
    cumulativeRevenue: prevCum + totalRevenue,
    specialEvent: p.specialEvent ?? null,
  };
});

interface RevenueTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const RevenueTooltip: React.FC<RevenueTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 2
      }).format(amount);
    };

    return (
      <div className="bg-black/90 border border-orange-500/40 rounded-lg shadow-xl p-4 backdrop-blur-sm">
        <p className="font-semibold text-white mb-2">{data.monthDisplay}</p>
        {data.specialEvent && (
          <p className="text-orange-400 text-sm mb-2 font-medium">
            {data.specialEvent}
          </p>
        )}
        <div className="space-y-1">
          <p className="text-blue-300 text-sm">
            Israel (VAT-inclusive): {formatCurrency(data.israelRevenue)}
          </p>
          <p className="text-green-300 text-sm">
            International (VAT-exempt): {formatCurrency(data.internationalRevenue)}
          </p>
          <div className="border-t border-white/20 pt-1 mt-2">
            <p className="text-white font-semibold text-sm">
              Total: {formatCurrency(data.totalRevenue)}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueGrowthChart: React.FC = () => {
  // Find March 2025 index
  const march2025Index = revenueData.findIndex(item => item.month === '2025-03');
  const march2025X = revenueData[march2025Index]?.monthDisplay;

  const formatILSCompact = (amount: number) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount);

  const total2024 = revenueData.slice(0, 12).reduce((sum, item) => sum + (item.totalRevenue ?? 0), 0);
  const total2025 = revenueData.slice(12).reduce((sum, item) => sum + (item.totalRevenue ?? 0), 0);
  const yoyPct = total2024 > 0 ? ((total2025 / total2024) - 1) * 100 : 0;

  return (
    <div className="w-full">
      <div className="rounded-2xl bg-black/40 border border-amber-500/40 shadow-lg backdrop-blur-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">
            Spectra CI Revenue Growth
          </h3>
          <p className="text-sm text-white/80 mb-4">
            24-Month Revenue Trajectory (Jan 2024 – Dec 2025)
          </p>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400/70 rounded-sm"></div>
              <span>VAT-inclusive revenue (Israel)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400/70 rounded-sm"></div>
              <span>VAT-exempt revenue = international markets (US & EU)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-orange-400"></div>
              <span>Total revenue growth</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={revenueData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="monthDisplay"
                stroke="rgba(255,255,255,0.7)"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={1}
              />
              <YAxis
                stroke="rgba(255,255,255,0.7)"
                fontSize={11}
                tickFormatter={(value) => `₪${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<RevenueTooltip />} />

              {/* Stacked bars */}
              <Bar
                dataKey="israelRevenue"
                stackId="revenue"
                fill="rgba(59, 130, 246, 0.7)"
                name="Israel (VAT-inclusive)"
              />
              <Bar
                dataKey="internationalRevenue"
                stackId="revenue"
                fill="rgba(16, 185, 129, 0.7)"
                name="International (VAT-exempt)"
              />

              {/* Growth line overlay */}
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#F97316"
                strokeWidth={2}
                dot={false}
                name="Total Revenue"
              />

              {/* Highlight March 2025 */}
              {march2025X && (
                <ReferenceLine
                  x={march2025X}
                  stroke="rgba(249, 115, 22, 0.75)"
                  strokeDasharray="6 6"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* March 2025 annotation */}
        {march2025Index >= 0 && (
          <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <p className="text-orange-300 text-sm font-medium">
              March 2025: Distributor deal – 50 annual licenses (Portugal)
            </p>
          </div>
        )}

        {/* YoY Growth Indicator */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-white/60 mb-1">2024 Total Revenue</p>
            <p className="text-lg font-semibold text-white">
              {formatILSCompact(total2024)}
            </p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-white/60 mb-1">2025 Total Revenue</p>
            <p className="text-lg font-semibold text-green-300">
              {formatILSCompact(total2025)}
              <span className="text-sm text-green-400 ml-2">
                ({yoyPct >= 0 ? '+' : ''}{Math.round(yoyPct)}% YoY)
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Channel, CohortRow, MonthlyAcquisitionPoint } from "./types";
import type { AdminTokens } from "./theme";
import { chartTheme } from "./theme";
import { DASH, EmptyNote, ils, num, pct, Th } from "./ui";

export function CohortDeepDive({
  channels,
  cohorts,
  monthlyAcquisition,
  activeChannelId,
  onSelectChannel,
  at,
  isDark,
}: {
  channels: Channel[];
  cohorts: Record<string, CohortRow[]>;
  monthlyAcquisition: MonthlyAcquisitionPoint[];
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
  at: AdminTokens;
  isDark: boolean;
}) {
  const channel = channels.find((c) => c.id === activeChannelId) || channels[0];
  const rows = channel ? cohorts[channel.id] || [] : [];
  const charts = chartTheme(isDark);

  const curveData = (channel?.revenueCurve || []).map((point) => ({
    label: `M${point.month}`,
    revenue: point.cumulativeRevenuePerCustomerIls,
    cac: channel?.cacIls,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {channels
          .filter((c) => c.paidCustomers > 0)
          .map((c) => {
            const isActive = c.id === channel?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectChannel(c.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? at.filterActive : at.filterInactive
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                {c.label}
                <span className={at.textFaint}>{num(c.paidCustomers)}</span>
              </button>
            );
          })}
      </div>

      <p className={`text-xs ${at.textFaint}`}>
        Each row is the group of customers who first paid in that month.
      </p>

      {!channel || rows.length === 0 ? (
        <EmptyNote at={at}>No monthly cohorts to show for this channel yet.</EmptyNote>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
          <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-sm">
                <thead className={`sticky top-0 ${at.sticky} backdrop-blur`}>
                  <tr className={`border-b ${at.border}`}>
                    <Th at={at}>Cohort</Th>
                    <Th at={at} align="right">New</Th>
                    <Th at={at} align="right">M3</Th>
                    <Th at={at} align="right">M6</Th>
                    <Th at={at} align="right">M12</Th>
                    <Th at={at} align="right">Active</Th>
                    <Th at={at} align="right">Rev / cust 12mo</Th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${at.rowDivide}`}>
                  {rows.map((row) => (
                    <tr key={row.month} className={`${at.rowHover} transition`}>
                      <td className={`whitespace-nowrap px-4 py-2.5 font-medium ${at.textPrimary}`}>
                        {row.monthLabel}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${at.textPrimary}`}>
                        {num(row.newPaidCustomers)}
                      </td>
                      <td className={`px-4 py-2.5 text-right tabular-nums ${at.textSec}`}>
                        {row.m3Retention == null ? <span className={at.textDim}>{DASH}</span> : pct(row.m3Retention)}
                      </td>
                      <td className={`px-4 py-2.5 text-right tabular-nums ${at.textSec}`}>
                        {row.m6Retention == null ? <span className={at.textDim}>{DASH}</span> : pct(row.m6Retention)}
                      </td>
                      <td className={`px-4 py-2.5 text-right tabular-nums ${at.textSec}`}>
                        {row.m12Retention == null ? <span className={at.textDim}>{DASH}</span> : pct(row.m12Retention)}
                      </td>
                      <td className={`px-4 py-2.5 text-right tabular-nums ${at.textSec}`}>{num(row.activeNow)}</td>
                      <td className={`px-4 py-2.5 text-right tabular-nums ${at.textPrimary}`}>
                        {ils(row.revenuePerCustomerM12Ils)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 ${at.card}`}>
            <p className={`text-sm font-semibold ${at.textPrimary}`}>Cumulative revenue per customer</p>
            <div className="mt-3 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curveData} margin={{ top: 4, right: 12, bottom: 4, left: -14 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={charts.grid} vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: charts.tick }} minTickGap={12} />
                  <YAxis tick={{ fontSize: 10, fill: charts.tick }} />
                  <Tooltip formatter={(value: number) => ils(value)} contentStyle={charts.tooltip} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={channel.color}
                    strokeWidth={2}
                    dot={false}
                    name="Revenue / customer"
                  />
                  {channel.cacIls != null && channel.cacIls > 0 && (
                    <Line
                      type="monotone"
                      dataKey="cac"
                      stroke="#dc2626"
                      strokeWidth={1.5}
                      strokeDasharray="5 4"
                      dot={false}
                      name="Cost per customer"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {channel.paybackMonths != null && (
              <p className={`mt-2 text-xs ${at.textFaint}`}>
                Acquisition cost is covered in month {channel.paybackMonths}.
              </p>
            )}
          </div>
        </div>
      )}

      <div className={`rounded-2xl border p-4 ${at.card}`}>
        <p className={`text-sm font-semibold ${at.textPrimary}`}>First payments per month</p>
        <div className="mt-3 h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyAcquisition} margin={{ top: 4, right: 8, bottom: 4, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={charts.grid} vertical={false} />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 10, fill: charts.tick }}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis tick={{ fontSize: 10, fill: charts.tick }} allowDecimals={false} />
              <Tooltip contentStyle={charts.tooltip} />
              <Bar dataKey="il" name="Israel" stackId="a" fill="#0f766e" />
              <Bar dataKey="intl" name="International" stackId="a" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

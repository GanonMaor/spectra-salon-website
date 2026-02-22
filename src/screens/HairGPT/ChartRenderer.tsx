import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useColors } from "./theme";

const COLORS = [
  "#EAB776", "#B18059", "#D4A06A", "#10B981", "#F59E0B",
  "#C8956C", "#EC4899", "#F97316", "#A67C52", "#D4A06A",
  "#84CC16", "#D946EF",
];

export interface ChartSpec {
  type: "bar" | "line" | "pie";
  title: string;
  xKey?: string;
  series?: { dataKey: string; name: string; color?: string }[];
  data: Record<string, any>[];
}

export const ChartRenderer: React.FC<{ spec: ChartSpec }> = ({ spec }) => {
  const cr = useColors().chartRenderer;

  if (!spec || !spec.data?.length) return null;

  const { type, title, xKey = "label", series = [], data } = spec;

  const effectiveSeries =
    series.length > 0
      ? series
      : Object.keys(data[0] || {})
          .filter((k) => k !== xKey)
          .slice(0, 5)
          .map((k, i) => ({ dataKey: k, name: k, color: COLORS[i % COLORS.length] }));

  const tooltipStyle = {
    background: cr.tooltipBg,
    border: `1px solid ${cr.tooltipBorder}`,
    borderRadius: 12,
    color: cr.tooltipColor,
    fontSize: 12,
  };

  return (
    <div className="mt-3 rounded-xl p-4" style={{ background: cr.containerBg, border: `1px solid ${cr.containerBorder}` }}>
      <p className="text-xs font-semibold mb-3 text-center" style={{ color: cr.titleColor }}>{title}</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === "pie" ? (
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie
                data={data}
                dataKey={effectiveSeries[0]?.dataKey || "value"}
                nameKey={xKey}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={11}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: cr.legendColor }} />
            </PieChart>
          ) : type === "line" ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={cr.gridStroke} />
              <XAxis dataKey={xKey} tick={{ fill: cr.axisTick, fontSize: 11 }} />
              <YAxis tick={{ fill: cr.axisTick, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: cr.legendColor }} />
              {effectiveSeries.map((s, i) => (
                <Line
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color || COLORS[i % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: s.color || COLORS[i % COLORS.length] }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={cr.gridStroke} />
              <XAxis dataKey={xKey} tick={{ fill: cr.axisTick, fontSize: 11 }} />
              <YAxis tick={{ fill: cr.axisTick, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: cr.legendColor }} />
              {effectiveSeries.map((s, i) => (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.color || COLORS[i % COLORS.length]}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

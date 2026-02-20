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
  if (!spec || !spec.data?.length) return null;

  const { type, title, xKey = "label", series = [], data } = spec;

  const effectiveSeries =
    series.length > 0
      ? series
      : Object.keys(data[0] || {})
          .filter((k) => k !== xKey)
          .slice(0, 5)
          .map((k, i) => ({ dataKey: k, name: k, color: COLORS[i % COLORS.length] }));

  return (
    <div className="mt-3 rounded-xl bg-[#0d0d0d]/60 border border-[#EAB776]/10 p-4">
      <p className="text-xs font-semibold text-white/70 mb-3 text-center">{title}</p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === "pie" ? (
            <PieChart>
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
              />
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
              <Legend wrapperStyle={{ fontSize: 11, color: "#999999" }} />
            </PieChart>
          ) : type === "line" ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey={xKey} tick={{ fill: "#999999", fontSize: 11 }} />
              <YAxis tick={{ fill: "#999999", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#999999" }} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey={xKey} tick={{ fill: "#999999", fontSize: 11 }} />
              <YAxis tick={{ fill: "#999999", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#999999" }} />
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

import React from "react";

// ── Formatting helpers ──────────────────────────────────────────────

export function formatCurrency(value: number, currency: string = "ILS"): string {
  const locale = currency === "ILS" ? "he-IL" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export function formatDecimal(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

// ── Category colors ─────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, string> = {
  Color:         "#9F8BFF",
  Highlights:    "#DC8239",
  Toner:         "#FCC94D",
  Straightening: "#61C8F4",
  Treatment:     "#A29BFE",
  Others:        "#A8BF6A",
};

export const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  Color:         ["#9F8BFF", "#F88CE8"],
  Highlights:    ["#DC8239", "#C96B3E"],
  Toner:         ["#FCC94D", "#FFB436"],
  Straightening: ["#61C8F4", "#98A9FB"],
  Treatment:     ["#A29BFE", "#C8B6FF"],
  Others:        ["#A8BF6A", "#8DA854"],
};

// ── Glass Panel ─────────────────────────────────────────────────────

export function GlassPanel({
  children,
  className = "",
  variant = "frosted",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "frosted" | "clean" | "chartDark";
}) {
  const bases: Record<string, string> = {
    frosted:   "bg-black/[0.35] backdrop-blur-xl border-white/[0.12]",
    clean:     "bg-white/[0.78] backdrop-blur-lg border-white/[0.35]",
    chartDark: "bg-black/[0.55] backdrop-blur-xl border-white/[0.06]",
  };
  const shadows: Record<string, string> = {
    frosted:   "0 8px 40px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)",
    clean:     "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
    chartDark: "0 10px 50px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)",
  };
  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl border transition-all duration-500 ${bases[variant]} ${className}`}
      style={{ boxShadow: shadows[variant] }}
    >
      {children}
    </div>
  );
}

// ── Chart Tooltip (light – for clean panels) ───────────────────────

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-2xl text-sm">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-gray-600 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}:{" "}
          <span className="font-semibold text-gray-900">
            {typeof p.value === "number"
              ? p.value >= 1000
                ? formatNumber(p.value)
                : formatDecimal(p.value)
              : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ── Dark Chart Tooltip (for chartDark panels) ──────────────────────

export function DarkChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3.5 text-sm border border-white/[0.08]"
      style={{
        background: "rgba(10,10,14,0.88)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.50)",
      }}
    >
      <p className="font-semibold text-white/80 text-[11px] mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-gray-400 flex items-center gap-2 text-[12px]">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}80` }}
          />
          {p.name}:{" "}
          <span className="font-bold text-white">
            {typeof p.value === "number"
              ? p.value >= 1000
                ? formatNumber(p.value)
                : formatDecimal(p.value)
              : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

// ── Shared dark-chart axis / grid style tokens ─────────────────────

export const DARK_AXIS = {
  stroke: "#9CA3AF",
  style: { fontSize: "10px", fontWeight: 500 } as React.CSSProperties,
  axisLine: false as const,
  tickLine: false as const,
};

export const DARK_GRID = {
  strokeDasharray: "3 3",
  stroke: "rgba(255,255,255,0.06)",
};

export const DARK_XAXIS_ANGLED = {
  ...DARK_AXIS,
  angle: -35,
  textAnchor: "end" as const,
  height: 48,
};

// ── Dark legend chip helper ────────────────────────────────────────

export function DarkLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex items-center flex-wrap gap-4">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: it.color, boxShadow: `0 0 8px ${it.color}60` }}
          />
          {it.label}
        </div>
      ))}
    </div>
  );
}

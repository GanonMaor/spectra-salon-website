import React from "react";
import type { Confidence } from "./types";
import type { AdminTokens } from "./theme";

export const DASH = "—";

export function ils(value: number | null | undefined, decimals = 0): string {
  if (value == null) return DASH;
  return `₪${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function usd(value: number | null | undefined, decimals = 0): string {
  if (value == null) return DASH;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function pct(value: number | null | undefined, decimals = 0): string {
  if (value == null) return DASH;
  return `${(value * 100).toFixed(decimals)}%`;
}

export function num(value: number | null | undefined): string {
  if (value == null) return DASH;
  return value.toLocaleString("en-US");
}

export function Card({
  children,
  className = "",
  at,
}: {
  children: React.ReactNode;
  className?: string;
  at: AdminTokens;
}) {
  return <div className={`rounded-2xl border ${at.card} ${className}`}>{children}</div>;
}

export function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  at,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  at: AdminTokens;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-4 ${at.card} ${at.cardHover} transition`}>
      {Icon && <Icon className={`w-4 h-4 mb-2 ${at.textFaint}`} />}
      <p className={`text-2xl font-bold tracking-tight ${at.textPrimary}`}>{value}</p>
      <p className={`text-[11px] font-medium mt-0.5 ${at.textMuted}`}>{label}</p>
      {sublabel && <p className={`text-[10px] mt-0.5 ${at.textFaint}`}>{sublabel}</p>}
    </div>
  );
}

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  high: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  low: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  unknown: "bg-white/[0.04] text-white/50 border-white/[0.08]",
};

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: "Confirmed",
  medium: "Rule-based",
  low: "Inferred",
  unknown: "Unknown",
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${CONFIDENCE_STYLES[level]}`}
    >
      {CONFIDENCE_LABELS[level]}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  at,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "caution" | "info";
  at: AdminTokens;
}) {
  const tones = {
    neutral: `${at.filterInactive}`,
    positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    caution: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function RetentionCell({
  retention,
  eligible,
  color,
  at,
}: {
  retention: number | null;
  eligible?: number;
  color: string;
  at: AdminTokens;
}) {
  if (retention == null) {
    return <span className={`text-sm ${at.textDim}`}>{DASH}</span>;
  }
  return (
    <div className="min-w-[96px]">
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-sm font-semibold tabular-nums ${at.textPrimary}`}>{pct(retention)}</span>
        {eligible != null && <span className={`text-[10px] tabular-nums ${at.textFaint}`}>n={eligible}</span>}
      </div>
      <div className={`mt-1 h-1.5 w-full overflow-hidden rounded-full ${at.expandRow}`}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, retention * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function EmptyNote({
  children,
  at,
}: {
  children: React.ReactNode;
  at: AdminTokens;
}) {
  return (
    <div className={`rounded-xl border border-dashed px-4 py-3 text-sm ${at.subCard} ${at.textMuted}`}>
      {children}
    </div>
  );
}

export function Th({
  children,
  at,
  align = "left",
}: {
  children: React.ReactNode;
  at: AdminTokens;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-3 text-[11px] uppercase tracking-wider font-medium ${at.textFaint} ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

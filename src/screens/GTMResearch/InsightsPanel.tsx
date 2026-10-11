import React from "react";
import type { Insight } from "./types";
import type { AdminTokens } from "./theme";

const KIND: Record<Insight["kind"], { label: string; dot: string }> = {
  evidence: { label: "Evidence", dot: "bg-slate-400" },
  insight: { label: "Insight", dot: "bg-emerald-500" },
  risk: { label: "Risk", dot: "bg-red-500" },
  strategy: { label: "Strategy", dot: "bg-blue-500" },
  caveat: { label: "Caveat", dot: "bg-amber-500" },
};

export function InsightsPanel({ insights, at }: { insights: Insight[]; at: AdminTokens }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
      <div className={`px-4 py-3 border-b ${at.border}`}>
        <p className={`text-sm font-semibold ${at.textPrimary}`}>What we learned</p>
      </div>
      <ul className={`divide-y ${at.rowDivide}`}>
        {insights.map((insight) => {
          const kind = KIND[insight.kind];
          return (
            <li key={insight.id} className={`px-4 py-2.5 ${at.rowHover}`}>
              <div className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${kind.dot}`} />
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${at.textFaint}`}>
                      {kind.label}
                    </span>
                    <span className={`text-sm font-semibold ${at.textPrimary}`}>{insight.title}</span>
                  </div>
                  <p className={`mt-0.5 text-xs leading-snug ${at.textMuted}`}>{insight.text}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

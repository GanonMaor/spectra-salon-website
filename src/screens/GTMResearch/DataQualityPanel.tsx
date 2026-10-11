import React, { useState } from "react";
import type { Confidence, GtmResearchDataset } from "./types";
import type { AdminTokens } from "./theme";
import { ils, num, pct, Th } from "./ui";

const CONFIDENCE_COPY: Record<Confidence, { label: string; color: string }> = {
  high: { label: "Confirmed by hand or CRM", color: "#059669" },
  medium: { label: "Rule-based on payment date", color: "#d97706" },
  low: { label: "Inferred", color: "#ea580c" },
  unknown: { label: "Not attributed", color: "#94a3b8" },
};

const ISSUE_COPY: Record<string, string> = {
  possible_schwarzkopf: "Possibly funded by Henkel",
  no_country: "Country unknown",
  no_channel: "No channel assigned",
};

const SEVERITY_DOT = {
  open: "bg-amber-400",
  caution: "bg-orange-400",
  scope: "bg-slate-400",
} as const;

export function DataQualityPanel({
  data,
  at,
}: {
  data: GtmResearchDataset;
  at: AdminTokens;
}) {
  const { attribution, region, gaps, reviewQueue, reviewCounts } = data.dataQuality;
  const issues = Object.keys(reviewCounts);
  const [activeIssue, setActiveIssue] = useState<string>(issues[0] || "");
  const filtered = reviewQueue.filter((item) => item.issue === activeIssue).slice(0, 40);
  const order: Confidence[] = ["high", "medium", "low", "unknown"];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className={`rounded-2xl border p-4 ${at.card}`}>
          <p className={`text-sm font-semibold ${at.textPrimary}`}>Attribution coverage</p>
          <div className={`mt-3 flex h-2.5 w-full overflow-hidden rounded-full ${at.expandRow}`}>
            {order.map((level) =>
              attribution.counts[level] ? (
                <div
                  key={level}
                  title={`${CONFIDENCE_COPY[level].label}: ${attribution.counts[level]}`}
                  style={{ flex: attribution.counts[level], background: CONFIDENCE_COPY[level].color }}
                />
              ) : null,
            )}
          </div>
          <div className="mt-3 space-y-1.5">
            {order.map((level) => (
              <div key={level} className="flex items-center justify-between text-xs">
                <span className={`inline-flex items-center gap-2 ${at.textSec}`}>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: CONFIDENCE_COPY[level].color }}
                  />
                  {CONFIDENCE_COPY[level].label}
                </span>
                <span className={`tabular-nums ${at.textFaint}`}>{num(attribution.counts[level])}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 ${at.card}`}>
          <p className={`text-sm font-semibold ${at.textPrimary}`}>Geography coverage</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight tabular-nums ${at.textPrimary}`}>
              {pct(region.confirmedShare, 1)}
            </span>
            <span className={`text-xs ${at.textFaint}`}>have a country from a source</span>
          </div>
          <div className={`mt-3 flex h-2.5 w-full overflow-hidden rounded-full ${at.expandRow}`}>
            <div className="h-full bg-emerald-500" style={{ flex: region.confirmed }} />
            <div className="h-full bg-orange-400" style={{ flex: region.inferred }} />
            <div className="h-full bg-slate-400/40" style={{ flex: region.unknown }} />
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 ${at.textSec}`}>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Stated by CRM, admin or dialling code
              </span>
              <span className={`tabular-nums ${at.textFaint}`}>
                {num(region.confirmed)}
                <span className="ml-1.5">{pct(region.confirmedShare, 1)}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 ${at.textSec}`}>
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                Assumed Israeli from a Hebrew name
              </span>
              <span className={`tabular-nums ${at.textFaint}`}>
                {num(region.inferred)}
                <span className="ml-1.5">{pct(region.inferredShare, 1)}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-2 ${at.textSec}`}>
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                No country at all
              </span>
              <span className={`tabular-nums ${at.textFaint}`}>
                {num(region.unknown)}
                <span className="ml-1.5">{pct(region.unknownShare, 1)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
        <ul className={`divide-y ${at.rowDivide}`}>
          {gaps.map((gap) => (
            <li key={gap.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[gap.severity]}`} />
                  <div>
                    <p className={`text-sm font-semibold ${at.textPrimary}`}>{gap.title}</p>
                    <p className={`mt-0.5 text-xs leading-snug ${at.textMuted}`}>{gap.detail}</p>
                  </div>
                </div>
                {gap.affectedCustomers != null && (
                  <span className={`shrink-0 text-[11px] tabular-nums ${at.textFaint}`}>
                    {num(gap.affectedCustomers)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {issues.length > 0 && (
        <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
          <div className={`flex flex-wrap items-center gap-2 px-4 py-3 border-b ${at.border}`}>
            <p className={`mr-2 text-sm font-semibold ${at.textPrimary}`}>Needs a human decision</p>
            {issues.map((issue) => (
              <button
                key={issue}
                type="button"
                onClick={() => setActiveIssue(issue)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  activeIssue === issue ? at.filterActive : at.filterInactive
                }`}
              >
                {ISSUE_COPY[issue] || issue}
                <span className={`ml-1.5 ${at.textFaint}`}>{num(reviewCounts[issue])}</span>
              </button>
            ))}
          </div>
          <div className="max-h-[360px] overflow-auto">
            <table className="w-full text-sm">
              <thead className={`sticky top-0 ${at.sticky} backdrop-blur`}>
                <tr className={`border-b ${at.border}`}>
                  <Th at={at}>Customer</Th>
                  <Th at={at}>First paid</Th>
                  <Th at={at} align="right">Revenue</Th>
                  <Th at={at}>Why it is flagged</Th>
                </tr>
              </thead>
              <tbody className={`divide-y ${at.rowDivide}`}>
                {filtered.map((item, index) => (
                  <tr key={`${item.customerId || item.name}-${index}`} className={`${at.rowHover} transition`}>
                    <td className={`px-4 py-2.5 font-medium ${at.textPrimary}`}>{item.name}</td>
                    <td className={`px-4 py-2.5 tabular-nums ${at.textFaint}`}>{item.firstPaidMonth}</td>
                    <td className={`px-4 py-2.5 text-right tabular-nums ${at.textSec}`}>
                      {ils(item.lifetimeRevenueIls)}
                    </td>
                    <td className={`px-4 py-2.5 text-xs ${at.textMuted}`}>{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reviewCounts[activeIssue] > filtered.length && (
            <div className={`border-t px-4 py-2.5 text-xs ${at.border} ${at.textFaint}`}>
              Showing {filtered.length} of {num(reviewCounts[activeIssue])}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

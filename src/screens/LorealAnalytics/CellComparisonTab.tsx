import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AnalysisCell, AnalyticsFilter, EMPTY_FILTER, PeriodResult, QUALITY_COLOR_CLASSES } from "./types";
import {
  analyticsRequest, israelRawRows, fmtNumber, fmtCompact, fmtPercent, pctChange,
  generateMonthSequence, applyCellFilters, SERVICE_LABELS, ALL_SERVICE_TYPES, SERIES_PRESETS, ALL_COMPANIES,
} from "./data";

// ── Utilities ───────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-7 h-7 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

function computePeriod(
  memberSet: Set<string>,
  periodMonths: Set<string>,
  filters: AnalyticsFilter
): PeriodResult {
  const filtered = applyCellFilters(israelRawRows, filters);
  const period = filtered.filter((r) => memberSet.has(r.uid) && periodMonths.has(r.mk));
  const users = new Set(period.map((r) => r.uid));
  return {
    services: period.reduce((s, r) => s + r.svc, 0),
    visits:   period.reduce((s, r) => s + r.vis, 0),
    grams:    period.reduce((s, r) => s + r.gr,  0),
    revenue:  period.reduce((s, r) => s + r.cost, 0),
    color:    period.reduce((s, r) => s + r.cs, 0),
    highlights: period.reduce((s, r) => s + r.hs, 0),
    toner:    period.reduce((s, r) => s + r.ts, 0),
    straightening: period.reduce((s, r) => s + r.ss, 0),
    others:   period.reduce((s, r) => s + r.os, 0),
    activeUsers: users.size,
  };
}

// ── Filter description ──────────────────────────────────────────────
function filterDesc(filters: AnalyticsFilter): string {
  const parts: string[] = [];
  if (filters.companiesIncluded.length) parts.push(filters.companiesIncluded.map((c) => c.split(" ")[0]).join(", "));
  if (filters.seriesIncluded.length) {
    const names = SERIES_PRESETS.filter((s) => filters.seriesIncluded.includes(s.id)).map((s) => s.name.split(" ")[0]);
    parts.push(names.join(", "));
  }
  if (filters.serviceTypesIncluded.length && filters.serviceTypesIncluded.length < ALL_SERVICE_TYPES.length) {
    parts.push(filters.serviceTypesIncluded.map((t) => SERVICE_LABELS[t] || t).join(", "));
  }
  return parts.length ? parts.join(" · ") : "ללא פילטרים";
}

// ── Apple-to-apple checks ──────────────────────────────────────────
function checkAppleToApple(cells: AnalysisCell[]): string[] {
  if (cells.length < 2) return [];
  const warnings: string[] = [];
  const popIds = cells.map((c) => c.population_id);
  if (new Set(popIds.filter(Boolean)).size > 1) {
    warnings.push("⚠ תאים משתמשים באוכלוסיות שונות — ייתכן שההשוואה אינה תפוח מול תפוח");
  }
  const filterDescs = cells.map((c) => filterDesc(c.filters || EMPTY_FILTER));
  if (new Set(filterDescs).size > 1) {
    warnings.push("⚠ פילטרים שונים בין התאים — ודא שההשוואה הגיונית");
  }
  return warnings;
}

// ── Metric rows config ──────────────────────────────────────────────
interface MetricRow { key: keyof PeriodResult; label: string; fmt: (n: number) => string; }
const METRIC_ROWS: MetricRow[] = [
  { key: "services",     label: "שירותים",     fmt: fmtNumber },
  { key: "visits",       label: "ביקורים",     fmt: fmtNumber },
  { key: "grams",        label: "חומר (גרם)",  fmt: fmtCompact },
  { key: "color",        label: "צבע",          fmt: fmtNumber },
  { key: "highlights",   label: "גוונים",       fmt: fmtNumber },
  { key: "toner",        label: "טונר",         fmt: fmtNumber },
  { key: "straightening",label: "החלקה",        fmt: fmtNumber },
  { key: "others",       label: "אחר",          fmt: fmtNumber },
  { key: "activeUsers",  label: "מספרות פעילות", fmt: fmtNumber },
];

// ── State per cell ─────────────────────────────────────────────────
interface CellState {
  cell: AnalysisCell;
  members: string[];
  periodA: PeriodResult;
  periodB: PeriodResult;
  loading: boolean;
}

// ── Component ───────────────────────────────────────────────────────
export default function CellComparisonTab() {
  const [cells, setCells]           = useState<AnalysisCell[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [cellStates, setCellStates] = useState<Record<number, CellState>>({});

  // ── API ────────────────────────────────────────────────────────────
  const loadCells = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const d = await analyticsRequest("/cells");
      setCells(d.cells || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCells(); }, [loadCells]);

  // When a cell is selected, load its members and compute results
  const loadCellState = useCallback(async (cell: AnalysisCell) => {
    if (cellStates[cell.id]) return; // already loaded
    setCellStates((prev) => ({ ...prev, [cell.id]: { cell, members: [], periodA: emptyPeriod(), periodB: emptyPeriod(), loading: true } }));
    try {
      const members: string[] = cell.population_id
        ? (await analyticsRequest(`/populations/${cell.population_id}/members`)).members || []
        : [];
      const memberSet = new Set(members);
      const filters = cell.filters || EMPTY_FILTER;
      const aMonths = new Set(generateMonthSequence(cell.period_a_start || "", cell.period_a_end || ""));
      const bMonths = new Set(generateMonthSequence(cell.period_b_start || "", cell.period_b_end || ""));
      const periodA = computePeriod(memberSet, aMonths, filters);
      const periodB = computePeriod(memberSet, bMonths, filters);
      setCellStates((prev) => ({ ...prev, [cell.id]: { cell, members, periodA, periodB, loading: false } }));
    } catch {
      setCellStates((prev) => ({ ...prev, [cell.id]: { cell, members: [], periodA: emptyPeriod(), periodB: emptyPeriod(), loading: false } }));
    }
  }, [cellStates]);

  const toggleSelect = (cell: AnalysisCell) => {
    setSelectedIds((prev) => {
      if (prev.includes(cell.id)) return prev.filter((id) => id !== cell.id);
      if (prev.length >= 4) return prev; // max 4 cells
      loadCellState(cell);
      return [...prev, cell.id];
    });
  };

  const selectedCells = selectedIds.map((id) => cells.find((c) => c.id === id)).filter(Boolean) as AnalysisCell[];
  const selectedStates = selectedIds.map((id) => cellStates[id]).filter(Boolean);
  const allLoaded = selectedStates.length === selectedIds.length && selectedStates.every((s) => !s.loading);

  const warnings = useMemo(() => checkAppleToApple(selectedCells), [selectedCells]);

  const handleTableWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, behavior: "auto" });
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">תא מול תא</h2>
        <p className="text-sm text-gray-500 mt-0.5">השוואת תאי ניתוח שמורים אחד מול השני</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Cell picker */}
      {loading ? <Spinner /> : (
        <>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">בחר עד 4 תאים להשוואה</p>
            {cells.length === 0 ? (
              <p className="text-sm text-gray-400">אין תאי ניתוח שמורים. צור תאים בטאב &quot;תאי ניתוח&quot; תחילה.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {cells.map((cell) => {
                  const selected = selectedIds.includes(cell.id);
                  const state = cellStates[cell.id];
                  return (
                    <button
                      key={cell.id}
                      onClick={() => toggleSelect(cell)}
                      disabled={!selected && selectedIds.length >= 4}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                        selected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                    >
                      {selected && state?.loading && (
                        <span className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                      )}
                      {cell.name}
                      {selected && !state?.loading && (
                        <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Apple-to-apple warnings */}
          {warnings.length > 0 && (
            <div className="space-y-1.5">
              {warnings.map((w, i) => (
                <div key={i} className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-700 font-medium">{w}</div>
              ))}
            </div>
          )}

          {/* Comparison grid */}
          {selectedIds.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {!allLoaded ? <Spinner /> : (
                <div className="overflow-x-auto" onWheel={handleTableWheel}>
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs w-32 bg-gray-50/50">מדד</th>
                        {selectedStates.map(({ cell }) => (
                          <th key={cell.id} className="py-3 px-4 text-right bg-gray-50/50 min-w-[180px]">
                            <div className="space-y-1">
                              <p className="font-bold text-gray-900 text-sm">{cell.name}</p>
                              {cell.population_name && (
                                <p className="text-[10px] text-indigo-600">{cell.population_name}</p>
                              )}
                              <div className="flex gap-1 flex-wrap">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                  א׳: {cell.period_a_start}–{cell.period_a_end}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  ב׳: {cell.period_b_start}–{cell.period_b_end}
                                </span>
                              </div>
                              <p className="text-[9px] text-gray-400 truncate">{filterDesc(cell.filters || EMPTY_FILTER)}</p>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {METRIC_ROWS.map(({ key, label, fmt }) => {
                        const vals = selectedStates.map(({ periodA, periodB }) => ({
                          a: periodA[key] as number,
                          b: periodB[key] as number,
                          pct: pctChange(periodA[key] as number, periodB[key] as number),
                        }));
                        const allZero = vals.every((v) => v.a === 0 && v.b === 0);
                        if (allZero) return null;
                        return (
                          <tr key={key} className="border-b border-gray-50 hover:bg-gray-50/40">
                            <td className="py-3 px-4 text-gray-600 font-medium text-xs bg-gray-50/30">{label}</td>
                            {vals.map((v, i) => {
                              const posOrNeg = v.pct >= 0 ? "text-emerald-600" : "text-red-600";
                              return (
                                <td key={i} className="py-3 px-4">
                                  <div className="space-y-0.5">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                      <span className="text-xs text-indigo-500">{fmt(v.a)}</span>
                                      <span className="text-gray-300 text-xs">→</span>
                                      <span className="text-xs text-emerald-600 font-semibold">{fmt(v.b)}</span>
                                    </div>
                                    <div className={`text-xs font-bold ${posOrNeg}`}>
                                      {v.pct >= 0 ? "+" : ""}{v.pct.toFixed(1)}%
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200 bg-gray-50/50">
                        <td className="py-2 px-4 text-xs text-gray-400">חברי אוכלוסייה</td>
                        {selectedStates.map(({ cell }, i) => (
                          <td key={i} className="py-2 px-4 text-xs text-gray-500 font-medium">
                            {fmtNumber(Number(cell.member_count))} מספרות
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {selectedIds.length === 0 && cells.length > 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-sm">בחר שני תאים לפחות כדי להתחיל בהשוואה</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────
function emptyPeriod(): PeriodResult {
  return { services: 0, visits: 0, grams: 0, revenue: 0, color: 0, highlights: 0, toner: 0, straightening: 0, others: 0, activeUsers: 0 };
}

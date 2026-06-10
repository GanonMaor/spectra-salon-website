import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AnalysisCell, AnalyticsFilter, EMPTY_FILTER, PeriodResult, QUALITY_COLOR_CLASSES } from "./types";
import {
  analyticsRequest, fmtNumber, fmtCompact, fmtPercent, pctChange,
  generateMonthSequence, applyCellFilters, SERVICE_LABELS, ALL_SERVICE_TYPES, SERIES_PRESETS, ALL_COMPANIES,
  useIsraelDataset, RawRow,
} from "./data";
import { EN, HE, type AnalyticsCopy, type Locale } from "./locales";

// ── Utilities ───────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-7 h-7 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

function computePeriod(
  israelRawRows: RawRow[],
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
function filterDesc(filters: AnalyticsFilter, t: AnalyticsCopy): string {
  const parts: string[] = [];
  if (filters.companiesIncluded.length) parts.push(filters.companiesIncluded.map((c) => c.split(" ")[0]).join(", "));
  if (filters.seriesIncluded.length) {
    const names = SERIES_PRESETS.filter((s) => filters.seriesIncluded.includes(s.id)).map((s) => s.name.split(" ")[0]);
    parts.push(names.join(", "));
  }
  if (filters.serviceTypesIncluded.length && filters.serviceTypesIncluded.length < ALL_SERVICE_TYPES.length) {
    parts.push(filters.serviceTypesIncluded.map((st) => SERVICE_LABELS[st] || st).join(", "));
  }
  return parts.length ? parts.join(" · ") : t.ccNoFilters;
}

// ── Apple-to-apple checks ──────────────────────────────────────────
function checkAppleToApple(cells: AnalysisCell[], t: AnalyticsCopy): string[] {
  if (cells.length < 2) return [];
  const warnings: string[] = [];
  const popIds = cells.map((c) => c.population_id);
  if (new Set(popIds.filter(Boolean)).size > 1) {
    warnings.push(t.ccWarnDiffPops);
  }
  const descs = cells.map((c) => filterDesc(c.filters || EMPTY_FILTER, t));
  if (new Set(descs).size > 1) {
    warnings.push(t.ccWarnDiffFilters);
  }
  return warnings;
}

// ── State per cell ─────────────────────────────────────────────────
interface CellState {
  cell: AnalysisCell;
  members: string[];
  periodA: PeriodResult;
  periodB: PeriodResult;
  loading: boolean;
}

// ── Component ───────────────────────────────────────────────────────
export default function CellComparisonTab({ locale = "he" }: { locale?: Locale }) {
  const t = locale === "en" ? EN : HE;
  const liveIsrael = useIsraelDataset();
  const israelRawRows = liveIsrael.rawRows;
  const [cells, setCells]           = useState<AnalysisCell[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [cellStates, setCellStates] = useState<Record<number, CellState>>({});

  // Metric rows derived from locale
  const METRIC_ROWS = useMemo(() => [
    { key: "services"      as keyof PeriodResult, label: t.ccMetricServices,     fmt: fmtNumber },
    { key: "visits"        as keyof PeriodResult, label: t.ccMetricVisits,       fmt: fmtNumber },
    { key: "grams"         as keyof PeriodResult, label: t.ccMetricGrams,        fmt: fmtCompact },
    { key: "color"         as keyof PeriodResult, label: t.ccMetricColor,        fmt: fmtNumber },
    { key: "highlights"    as keyof PeriodResult, label: t.ccMetricHighlights,   fmt: fmtNumber },
    { key: "toner"         as keyof PeriodResult, label: t.ccMetricToner,        fmt: fmtNumber },
    { key: "straightening" as keyof PeriodResult, label: t.ccMetricStraightening,fmt: fmtNumber },
    { key: "others"        as keyof PeriodResult, label: t.ccMetricOthers,       fmt: fmtNumber },
    { key: "activeUsers"   as keyof PeriodResult, label: t.ccMetricActiveSalons, fmt: fmtNumber },
  ], [t]);

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
      const periodA = computePeriod(israelRawRows, memberSet, aMonths, filters);
      const periodB = computePeriod(israelRawRows, memberSet, bMonths, filters);
      setCellStates((prev) => ({ ...prev, [cell.id]: { cell, members, periodA, periodB, loading: false } }));
    } catch {
      setCellStates((prev) => ({ ...prev, [cell.id]: { cell, members: [], periodA: emptyPeriod(), periodB: emptyPeriod(), loading: false } }));
    }
  }, [cellStates, israelRawRows]);

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

  const warnings = useMemo(() => checkAppleToApple(selectedCells, t), [selectedCells, t]);

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
        <h2 className="text-xl font-bold text-gray-900">{t.ccTitle}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{t.ccSub}</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Cell picker */}
      {loading ? <Spinner /> : (
        <>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t.ccSelectUp}</p>
            {cells.length === 0 ? (
              <p className="text-sm text-gray-400">{t.ccNoSaved}</p>
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
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs w-32 bg-gray-50/50">{t.ccMetricLabel}</th>
                        {selectedStates.map(({ cell }) => (
                          <th key={cell.id} className="py-3 px-4 text-right bg-gray-50/50 min-w-[180px]">
                            <div className="space-y-1">
                              <p className="font-bold text-gray-900 text-sm">{cell.name}</p>
                              {cell.population_name && (
                                <p className="text-[10px] text-indigo-600">{cell.population_name}</p>
                              )}
                              <div className="flex gap-1 flex-wrap">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                  {t.cellPeriodAShort}: {cell.period_a_start}–{cell.period_a_end}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  {t.cellPeriodBShort}: {cell.period_b_start}–{cell.period_b_end}
                                </span>
                              </div>
                              <p className="text-[9px] text-gray-400 truncate">{filterDesc(cell.filters || EMPTY_FILTER, t)}</p>
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
                        <td className="py-2 px-4 text-xs text-gray-400">{t.ccMembersRow}</td>
                        {selectedStates.map(({ cell }, i) => (
                          <td key={i} className="py-2 px-4 text-xs text-gray-500 font-medium">
                            {t.ccSalonsCount(String(fmtNumber(Number(cell.member_count))))}
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
              <p className="text-gray-400 text-sm">{t.ccSelectAtLeast}</p>
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

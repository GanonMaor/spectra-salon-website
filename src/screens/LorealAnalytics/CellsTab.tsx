import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Population, AnalysisCell, AnalyticsFilter, EMPTY_FILTER, PeriodResult, CellResult,
} from "./types";
import {
  analyticsRequest, israelRawRows, availableMonths, UserDetail,
  fmtNumber, fmtCompact, fmtPercent, pctChange,
  ALL_COMPANIES, SERIES_PRESETS, ALL_SERVICE_TYPES, SERVICE_LABELS, SERVICE_COLORS,
  generateMonthSequence, applyCellFilters,
} from "./data";

// ── Utilities ───────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );
}

function DeltaBadge({ a, b }: { a: number; b: number }) {
  const pct = pctChange(a, b);
  const positive = pct >= 0;
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
      {positive ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function computePeriod(
  allRows: typeof israelRawRows,
  memberSet: Set<string>,
  periodMonths: Set<string>,
  filters: AnalyticsFilter
): PeriodResult {
  const filtered = applyCellFilters(allRows, filters);
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

// ── Active filter summary ───────────────────────────────────────────
function FilterSummary({ filters }: { filters: AnalyticsFilter }) {
  const parts: string[] = [];
  if (filters.companiesIncluded.length) parts.push(`חברות: ${filters.companiesIncluded.join(", ")}`);
  if (filters.seriesIncluded.length) {
    const names = SERIES_PRESETS.filter((s) => filters.seriesIncluded.includes(s.id)).map((s) => s.name);
    parts.push(`סדרות: ${names.join(", ")}`);
  }
  if (filters.serviceTypesIncluded.length && filters.serviceTypesIncluded.length < ALL_SERVICE_TYPES.length) {
    parts.push(`שירותים: ${filters.serviceTypesIncluded.map((t) => SERVICE_LABELS[t] || t).join(", ")}`);
  }
  if (!parts.length) return <span className="text-xs text-gray-400">ללא פילטרים</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {parts.map((p, i) => (
        <span key={i} className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded-md">{p}</span>
      ))}
    </div>
  );
}

// ── Types ───────────────────────────────────────────────────────────
interface Props { allUserDetails: UserDetail[]; }

const defaultStart = availableMonths.length > 1 ? availableMonths[availableMonths.length - 4]?.label || availableMonths[0].label : "Jan 2024";
const defaultEnd   = availableMonths.length > 0 ? availableMonths[availableMonths.length - 1].label : "Jan 2025";

// ── Component ───────────────────────────────────────────────────────
export default function CellsTab({ allUserDetails }: Props) {
  const [populations, setPopulations] = useState<Population[]>([]);
  const [cells, setCells]             = useState<AnalysisCell[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // New cell form
  const [showForm, setShowForm]           = useState(false);
  const [formName, setFormName]           = useState("");
  const [formDesc, setFormDesc]           = useState("");
  const [formPopId, setFormPopId]         = useState<number | "">("");
  const [formAStart, setFormAStart]       = useState(defaultStart);
  const [formAEnd, setFormAEnd]           = useState(defaultEnd);
  const [formBStart, setFormBStart]       = useState(defaultStart);
  const [formBEnd, setFormBEnd]           = useState(defaultEnd);
  const [formFilters, setFormFilters]     = useState<AnalyticsFilter>(EMPTY_FILTER);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState<string | null>(null);

  // Selected cell result
  const [activeCellId, setActiveCellId]       = useState<number | null>(null);
  const [cellMembers, setCellMembers]         = useState<string[]>([]);
  const [cellMembersLoading, setCellMembersLoading] = useState(false);
  const [userSortField, setUserSortField]     = useState<"services" | "pct">("pct");

  const activeCell = useMemo(() => cells.find((c) => c.id === activeCellId) || null, [cells, activeCellId]);

  // ── API ────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [popsData, cellsData] = await Promise.all([
        analyticsRequest("/populations"),
        analyticsRequest("/cells"),
      ]);
      setPopulations(popsData.populations || []);
      setCells(cellsData.cells || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (activeCellId !== null && activeCell?.population_id) {
      setCellMembersLoading(true);
      analyticsRequest(`/populations/${activeCell.population_id}/members`)
        .then((d) => setCellMembers(d.members || []))
        .catch(() => setCellMembers([]))
        .finally(() => setCellMembersLoading(false));
    } else if (activeCellId === null) {
      setCellMembers([]);
    }
  }, [activeCellId, activeCell]);

  // ── Cell result computation ────────────────────────────────────────
  const cellResult = useMemo((): CellResult | null => {
    if (!activeCell || cellMembersLoading) return null;
    const memberSet = new Set(cellMembers);
    const filters = activeCell.filters || EMPTY_FILTER;
    const periodAMonths = new Set(
      generateMonthSequence(activeCell.period_a_start || "", activeCell.period_a_end || "")
    );
    const periodBMonths = new Set(
      generateMonthSequence(activeCell.period_b_start || "", activeCell.period_b_end || "")
    );
    if (!periodAMonths.size && !periodBMonths.size) return null;
    return {
      cell: activeCell,
      memberCount: cellMembers.length,
      periodA: computePeriod(israelRawRows, memberSet, periodAMonths, filters),
      periodB: computePeriod(israelRawRows, memberSet, periodBMonths, filters),
    };
  }, [activeCell, cellMembers, cellMembersLoading]);

  // Per-user breakdown for selected cell
  const perUserBreakdown = useMemo(() => {
    if (!activeCell || !cellMembers.length) return [];
    const filters = activeCell.filters || EMPTY_FILTER;
    const periodAMonths = new Set(generateMonthSequence(activeCell.period_a_start || "", activeCell.period_a_end || ""));
    const periodBMonths = new Set(generateMonthSequence(activeCell.period_b_start || "", activeCell.period_b_end || ""));
    const filteredRows = applyCellFilters(israelRawRows, filters);

    return cellMembers.map((uid) => {
      const userRows = filteredRows.filter((r) => r.uid === uid);
      const aRows = userRows.filter((r) => periodAMonths.has(r.mk));
      const bRows = userRows.filter((r) => periodBMonths.has(r.mk));
      const aServices = aRows.reduce((s, r) => s + r.svc, 0);
      const bServices = bRows.reduce((s, r) => s + r.svc, 0);
      const u = allUserDetails.find((u) => u.userId === uid);
      return { uid, city: u?.city || "—", aServices, bServices, pct: pctChange(aServices, bServices) };
    }).sort((a, b) =>
      userSortField === "pct" ? b.pct - a.pct : b.bServices - a.bServices
    );
  }, [activeCell, cellMembers, allUserDetails, userSortField]);

  // ── Handlers ──────────────────────────────────────────────────────
  const createCell = async () => {
    if (!formName.trim()) { setSaveError("שם תא הוא שדה חובה"); return; }
    setSaving(true); setSaveError(null);
    try {
      await analyticsRequest("/cells", {
        method: "POST",
        body: {
          name: formName.trim(),
          description: formDesc.trim() || null,
          population_id: formPopId || null,
          period_a_start: formAStart, period_a_end: formAEnd,
          period_b_start: formBStart, period_b_end: formBEnd,
          filters: formFilters,
        },
      });
      await load();
      setShowForm(false);
      setFormName(""); setFormDesc(""); setFormPopId(""); setFormFilters(EMPTY_FILTER);
    } catch (e: any) { setSaveError(e.message); }
    finally { setSaving(false); }
  };

  const deleteCell = async (id: number) => {
    if (!confirm("למחוק את תא הניתוח?")) return;
    try {
      await analyticsRequest(`/cells/${id}`, { method: "DELETE" });
      if (activeCellId === id) setActiveCellId(null);
      await load();
    } catch (e: any) { setError(e.message); }
  };

  const toggleCompany = (co: string) => setFormFilters((f) => ({
    ...f,
    companiesIncluded: f.companiesIncluded.includes(co) ? f.companiesIncluded.filter((c) => c !== co) : [...f.companiesIncluded, co],
  }));
  const toggleSeries = (id: string) => setFormFilters((f) => ({
    ...f,
    seriesIncluded: f.seriesIncluded.includes(id) ? f.seriesIncluded.filter((s) => s !== id) : [...f.seriesIncluded, id],
  }));
  const toggleServiceType = (t: string) => setFormFilters((f) => ({
    ...f,
    serviceTypesIncluded: f.serviceTypesIncluded.includes(t)
      ? f.serviceTypesIncluded.filter((s) => s !== t)
      : [...f.serviceTypesIncluded, t],
  }));

  const handleTableWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, behavior: "auto" });
    }
  }, []);

  // ── KPI row ────────────────────────────────────────────────────────
  const KpiPair = ({
    label, a, b, fmt,
  }: { label: string; a: number; b: number; fmt?: (n: number) => string }) => {
    const f = fmt || fmtNumber;
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4">
        <p className="text-xs text-gray-500 mb-1.5 font-medium">{label}</p>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] text-gray-400">תקופה א׳</p>
            <p className="text-lg font-bold text-gray-900">{f(a)}</p>
          </div>
          <DeltaBadge a={a} b={b} />
          <div className="text-right">
            <p className="text-[10px] text-gray-400">תקופה ב׳</p>
            <p className="text-lg font-bold text-gray-900">{f(b)}</p>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">תאי ניתוח</h2>
          <p className="text-sm text-gray-500 mt-0.5">השוואת תקופות על גבי אוכלוסייה שמורה</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          תא חדש
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* New cell form */}
      {showForm && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-5">
          <h3 className="font-semibold text-gray-800 text-base">הגדרת תא ניתוח חדש</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">שם התא</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder='דוגמה: כשרים ינ׳23 vs ינ׳24'
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">אוכלוסייה</label>
              <select
                value={formPopId}
                onChange={(e) => setFormPopId(e.target.value ? parseInt(e.target.value, 10) : "")}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="">בחר אוכלוסייה...</option>
                {populations.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.member_count} חברים)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Periods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-indigo-600 mb-1.5">תקופה א׳ — בסיס</label>
              <div className="flex items-center gap-2">
                <select value={formAStart} onChange={(e) => setFormAStart(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                </select>
                <span className="text-gray-400 text-xs flex-shrink-0">–</span>
                <select value={formAEnd} onChange={(e) => setFormAEnd(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                  {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-600 mb-1.5">תקופה ב׳ — השוואה</label>
              <div className="flex items-center gap-2">
                <select value={formBStart} onChange={(e) => setFormBStart(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-400">
                  {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                </select>
                <span className="text-gray-400 text-xs flex-shrink-0">–</span>
                <select value={formBEnd} onChange={(e) => setFormBEnd(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-400">
                  {availableMonths.map((m) => <option key={m.label} value={m.label}>{m.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">פילטרים פעילים</p>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">חברות (רק אלה יכללו — ריק = כולן)</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_COMPANIES.map((co) => (
                  <button
                    key={co}
                    onClick={() => toggleCompany(co)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      formFilters.companiesIncluded.includes(co)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {co}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">סדרות (ריק = כולן)</p>
              <div className="flex flex-wrap gap-1.5">
                {SERIES_PRESETS.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => toggleSeries(sp.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      formFilters.seriesIncluded.includes(sp.id)
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    {sp.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">סוגי שירות (ריק = כולם)</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SERVICE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleServiceType(t)}
                    style={formFilters.serviceTypesIncluded.includes(t) ? { backgroundColor: SERVICE_COLORS[t], borderColor: SERVICE_COLORS[t], color: "#fff" } : undefined}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      formFilters.serviceTypesIncluded.includes(t)
                        ? ""
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {SERVICE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          <div className="flex gap-2">
            <button
              onClick={createCell}
              disabled={saving || !formName.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {saving ? "שומר..." : "שמור תא"}
            </button>
            <button
              onClick={() => { setShowForm(false); setSaveError(null); }}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Cells list + result */}
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: cell cards */}
          <div className={`space-y-3 ${activeCellId !== null ? "xl:col-span-2" : "xl:col-span-5"}`}>
            {cells.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">אין תאי ניתוח שמורים</p>
                <p className="text-gray-400 text-sm mt-1">צור את התא הראשון שלך</p>
              </div>
            ) : (
              cells.map((cell) => (
                <div
                  key={cell.id}
                  className={`bg-white border rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all ${activeCellId === cell.id ? "border-indigo-400 ring-1 ring-indigo-200" : "border-gray-100 hover:border-gray-200"}`}
                  onClick={() => setActiveCellId(activeCellId === cell.id ? null : cell.id)}
                >
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{cell.name}</h3>
                        {cell.population_name && (
                          <p className="text-xs text-indigo-600 mt-0.5">
                            {cell.population_name}
                            <span className="text-gray-400"> · {fmtNumber(Number(cell.member_count))} מספרות</span>
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCell(cell.id); }}
                        className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Period display */}
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 font-medium">
                        א׳: {cell.period_a_start} – {cell.period_a_end}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 font-medium">
                        ב׳: {cell.period_b_start} – {cell.period_b_end}
                      </span>
                    </div>

                    {/* Filters */}
                    <FilterSummary filters={cell.filters || EMPTY_FILTER} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right: results panel */}
          {activeCellId !== null && (
            <div className="xl:col-span-3 space-y-4">
              {(cellMembersLoading || !cellResult) ? (
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
                  <Spinner />
                </div>
              ) : (
                <>
                  {/* Result header */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
                    <h3 className="font-bold text-gray-900 text-base">{activeCell?.name}</h3>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                        {fmtNumber(cellResult.memberCount)} מספרות בניתוח
                      </span>
                      {activeCell?.population_name && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                          {activeCell.population_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* KPI grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <KpiPair label="שירותים" a={cellResult.periodA.services} b={cellResult.periodB.services} />
                    <KpiPair label="ביקורים" a={cellResult.periodA.visits} b={cellResult.periodB.visits} />
                    <KpiPair label="חומר (גרם)" a={cellResult.periodA.grams} b={cellResult.periodB.grams} fmt={fmtCompact} />
                  </div>

                  {/* Service type breakdown */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
                    <h4 className="font-semibold text-gray-700 text-sm mb-3">פירוט לפי סוג שירות</h4>
                    <div className="space-y-2">
                      {(["color","highlights","toner","straightening","others"] as const).map((key) => {
                        const labels: Record<string, string> = { color: "צבע", highlights: "גוונים", toner: "טונר", straightening: "החלקה", others: "אחר" };
                        const a = cellResult!.periodA[key] as number;
                        const b = cellResult!.periodB[key] as number;
                        if (!a && !b) return null;
                        const pct = pctChange(a, b);
                        return (
                          <div key={key} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                            <span className="text-xs text-gray-600 w-16 flex-shrink-0 font-medium">{labels[key]}</span>
                            <span className="text-xs text-gray-500 w-16 flex-shrink-0">{fmtNumber(a)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 rounded-full bg-gray-100 flex-1 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-indigo-400"
                                    style={{ width: `${Math.min(100, a > 0 ? (a / Math.max(a, b)) * 100 : 0)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 w-16 flex-shrink-0 text-right">{fmtNumber(b)}</span>
                            <span className={`text-[11px] font-semibold w-14 text-right flex-shrink-0 ${pct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-user breakdown */}
                  {perUserBreakdown.length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-700 text-sm">פירוט לפי מספרה</h4>
                        <select
                          value={userSortField}
                          onChange={(e) => setUserSortField(e.target.value as "services" | "pct")}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 focus:outline-none"
                        >
                          <option value="pct">מיון: שינוי %</option>
                          <option value="services">מיון: שירותים ב׳</option>
                        </select>
                      </div>
                      <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5" onWheel={handleTableWheel}>
                        <table className="w-full text-xs min-w-[380px]">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-right pb-2 px-2 text-gray-400 font-medium">מספרה</th>
                              <th className="text-right pb-2 px-2 text-gray-400 font-medium">עיר</th>
                              <th className="text-right pb-2 px-2 text-indigo-500 font-medium">תקופה א׳</th>
                              <th className="text-right pb-2 px-2 text-emerald-600 font-medium">תקופה ב׳</th>
                              <th className="text-right pb-2 px-2 text-gray-400 font-medium">שינוי %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {perUserBreakdown.map((u) => (
                              <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="py-1.5 px-2 font-medium text-gray-700">{u.uid}</td>
                                <td className="py-1.5 px-2 text-gray-500">{u.city}</td>
                                <td className="py-1.5 px-2 text-gray-700">{fmtNumber(u.aServices)}</td>
                                <td className="py-1.5 px-2 text-gray-700">{fmtNumber(u.bServices)}</td>
                                <td className={`py-1.5 px-2 font-semibold ${u.pct >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                  {u.pct >= 0 ? "+" : ""}{u.pct.toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

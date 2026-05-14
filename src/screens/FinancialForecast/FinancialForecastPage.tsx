import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import {
  FORECAST_MONTHS,
  MONTH_LABELS,
  HALF_LABELS,
  HALF_RANGES,
  CATEGORY_RND,
  CATEGORY_MS,
  CATEGORY_OPS,
  CATEGORY_MGMT,
  CATEGORY_ADMIN,
  LINE_CAMPAIGNS,
  LINE_TRIPLE_BUNDLE,
  LINE_VAT,
  buildDefaultState,
  emptyOverrideArr,
  loadLocalState,
  saveLocalState,
  loadRemoteState,
  saveRemoteState,
  computeForecast,
  derivedStartingArpu,
  money,
  money2,
  int,
  dec1,
  pct,
  sum,
} from "./forecast-model";
import type {
  AddExpenseLineInput,
  BudgetState,
  BusinessAssumptions,
  ExpenseLine,
  MonthlyArr,
  SaveStatus,
} from "./forecast-model";

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export const FinancialForecastPage: React.FC = () => {
  const [state, setState] = useState<BudgetState>(() => loadLocalState());
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  // Which expense categories are expanded in the half-year tables.
  // Lives in component state only (not localStorage) so it resets when the user
  // navigates away and re-enters the page, exactly as requested.
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  const toggleCategory = (cat: string) =>
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await loadRemoteState();
        if (cancelled) return;
        const nextState = remote.state ?? buildDefaultState();
        setState(nextState);
        saveLocalState(nextState);
        setSaveStatus(remote.persisted ? "saved" : "local");
      } catch {
        if (cancelled) return;
        setSaveStatus("local");
      } finally {
        if (!cancelled) setHasHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    saveLocalState(state);
    setSaveStatus("saving");
    const timer = window.setTimeout(() => {
      saveRemoteState(state)
        .then((result) => setSaveStatus(result.persisted ? "saved" : "local"))
        .catch(() => {
          // No remote endpoint (e.g. running vite-only in dev) — the local
          // copy is still up to date, so present this as a local-only state
          // rather than a hard failure.
          setSaveStatus("local");
        });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [state, hasHydrated]);

  // Lock body scroll while side panel is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const orig = document.body.style.overflow;
    if (panelOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [panelOpen]);

  const forecast = useMemo(() => computeForecast(state), [state]);

  // ── State mutators ──────────────────────────────────────────────
  const patchBusiness = (p: Partial<BusinessAssumptions>) =>
    setState((prev) => ({ ...prev, business: { ...prev.business, ...p } }));

  const patchLine = (id: string, p: Partial<ExpenseLine>) =>
    setState((prev) => ({
      ...prev,
      expenseLines: prev.expenseLines.map((l) => (l.id === id ? { ...l, ...p } : l)),
    }));

  const createExpenseLine = ({ category, label, amount, startMonth }: AddExpenseLineInput) =>
    setState((prev) => {
      const cleanLabel = label.trim() || "New expense";
      const cleanCategory = category.trim() || CATEGORY_ADMIN;
      const safeAmount = Math.max(0, amount);
      const id = `custom.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 7)}`;
      const line: ExpenseLine = {
        id,
        category: cleanCategory,
        label: cleanLabel,
        kind: "fixedUsd",
        amount: safeAmount,
        protected: false,
      };
      const categories = prev.categories.includes(cleanCategory)
        ? prev.categories
        : [...prev.categories, cleanCategory];
      const arr = emptyOverrideArr();
      if (typeof startMonth === "number") {
        for (let i = 0; i < FORECAST_MONTHS; i++) arr[i] = i < startMonth ? 0 : safeAmount;
      }
      return {
        ...prev,
        categories,
        expenseLines: [...prev.expenseLines, line],
        overrides: {
          ...prev.overrides,
          expenseLines: {
            ...prev.overrides.expenseLines,
            [id]: arr,
          },
        },
      };
    });

  const removeExpenseLine = (lineId: string) =>
    setState((prev) => {
      const target = prev.expenseLines.find((line) => line.id === lineId);
      if (!target || target.protected) return prev;
      const nextExpenseOverrides = { ...prev.overrides.expenseLines };
      delete nextExpenseOverrides[lineId];
      return {
        ...prev,
        expenseLines: prev.expenseLines.filter((line) => line.id !== lineId),
        overrides: {
          ...prev.overrides,
          expenseLines: nextExpenseOverrides,
        },
      };
    });

  const setExpenseOverride = (lineId: string, monthIdx: number, value: number | null) =>
    setState((prev) => {
      const arr = (prev.overrides.expenseLines[lineId] ?? emptyOverrideArr()).slice();
      arr[monthIdx] = value;
      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          expenseLines: { ...prev.overrides.expenseLines, [lineId]: arr },
        },
      };
    });

  const setMonthlyOverride = (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    monthIdx: number,
    value: number | null,
  ) =>
    setState((prev) => {
      const arr = prev.overrides[field].slice();
      arr[monthIdx] = value;
      return { ...prev, overrides: { ...prev.overrides, [field]: arr } };
    });

  // Apply a value to overrides[field][fromMonth..end].
  const setRangeOverride = (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    fromMonth: number,
    value: number,
  ) =>
    setState((prev) => {
      const arr = prev.overrides[field].slice();
      for (let i = fromMonth; i < FORECAST_MONTHS; i++) arr[i] = value;
      return { ...prev, overrides: { ...prev.overrides, [field]: arr } };
    });

  // Copy a value to all months: update default, clear all overrides for the field.
  const copyValueToAll = (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    value: number,
  ) =>
    setState((prev) => {
      let next = { ...prev };
      if (field === "cac") next.growth = { ...prev.growth, defaultCac: value };
      else if (field === "campaignSpend") next.growth = { ...prev.growth, defaultCampaignSpend: value };
      else if (field === "arpu") next.revenue = { ...prev.revenue, defaultArpu: value };
      else if (field === "churnPct") next.business = { ...prev.business, churnRatePct: value };
      next.overrides = { ...prev.overrides, [field]: emptyOverrideArr() };
      return next;
    });

  const setLineRangeOverride = (lineId: string, fromMonth: number, value: number) =>
    setState((prev) => {
      const arr = (prev.overrides.expenseLines[lineId] ?? emptyOverrideArr()).slice();
      for (let i = fromMonth; i < FORECAST_MONTHS; i++) arr[i] = value;
      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          expenseLines: { ...prev.overrides.expenseLines, [lineId]: arr },
        },
      };
    });

  const setLineHalfOverride = (lineId: string, halfIdx: number, value: number) =>
    setState((prev) => {
      const half = HALF_RANGES[halfIdx];
      if (!half) return prev;
      const arr = (prev.overrides.expenseLines[lineId] ?? emptyOverrideArr()).slice();
      for (let i = half.start; i < half.end; i++) arr[i] = value;
      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          expenseLines: { ...prev.overrides.expenseLines, [lineId]: arr },
        },
      };
    });

  const clearLineHalfOverride = (lineId: string, halfIdx: number) =>
    setState((prev) => {
      const half = HALF_RANGES[halfIdx];
      if (!half) return prev;
      const arr = (prev.overrides.expenseLines[lineId] ?? emptyOverrideArr()).slice();
      for (let i = half.start; i < half.end; i++) arr[i] = null;
      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          expenseLines: { ...prev.overrides.expenseLines, [lineId]: arr },
        },
      };
    });

  // Copy a value to all months for an expense line: update default, clear overrides.
  // For VAT the "default" is business.vatPct rather than line.amount.
  const copyLineValueToAll = (lineId: string, value: number) =>
    setState((prev) => {
      const target = prev.expenseLines.find((l) => l.id === lineId);
      const isVat = target?.kind === "calculatedVat";
      const expenseLines = prev.expenseLines.map((l) => (l.id === lineId ? { ...l, amount: value } : l));
      const business = isVat ? { ...prev.business, vatPct: value } : prev.business;
      return {
        ...prev,
        business,
        expenseLines,
        overrides: {
          ...prev.overrides,
          expenseLines: { ...prev.overrides.expenseLines, [lineId]: emptyOverrideArr() },
        },
      };
    });

  const resetAll = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset all assumptions to Spectra defaults?")) return;
    setState(buildDefaultState());
  };

  // ── Derived display helpers ─────────────────────────────────────
  const last = FORECAST_MONTHS - 1;
  const endingSubs = forecast.subscribersEnd[last] ?? state.business.startingSubscribers;
  // Final MRR / ARR are the run-rate at the very end of the forecast:
  // ending subs × final ARPU. This is what the business "exits" with.
  const finalArpu = forecast.arpu[last] ?? state.revenue.defaultArpu;
  const finalMrr = endingSubs * finalArpu;
  const finalArr = finalMrr * 12;
  const annualEbitda = sum(forecast.ebitda);

  const linesByCategory = useMemo(() => {
    const groups: Record<string, ExpenseLine[]> = {};
    for (const c of state.categories) groups[c] = [];
    for (const l of state.expenseLines) {
      if (!groups[l.category]) groups[l.category] = [];
      groups[l.category].push(l);
    }
    return groups;
  }, [state.categories, state.expenseLines]);

  const overrideCount = useMemo(() => {
    let n = 0;
    for (const f of ["cac", "arpu", "campaignSpend", "churnPct"] as const) {
      n += state.overrides[f].filter((v) => v !== null).length;
    }
    for (const lineId in state.overrides.expenseLines) {
      n += state.overrides.expenseLines[lineId].filter((v) => v !== null).length;
    }
    return n;
  }, [state.overrides]);

  const chartData = MONTH_LABELS.map((label, i) => ({
    label,
    subscribers: Math.round(forecast.subscribersEnd[i]),
    mrr: Math.round(forecast.revenue[i]),
    arr: Math.round(forecast.arr[i]),
    ebitda: Math.round(forecast.ebitda[i]),
  }));

  return (
    <div className="min-h-[100dvh] font-sans antialiased text-[#1A1A1A]" style={{ background: "#FAFAF8" }}>
      {/* Soft warm gradient backdrop, like the competitor brief hero. */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at top center, rgba(234,183,118,0.08) 0%, transparent 60%)",
        }}
      />
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-16 pb-20">
        {/* ── Header ────────────────────────────────────────────────── */}
        <header className="mb-12 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 bg-[#EAB776]/70 rounded-full" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#999]">
                Operating Budget
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extralight leading-[1.1] tracking-[-0.02em] text-[#1A1A1A]">
              {FORECAST_MONTHS}-month{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
                Plan
              </span>
            </h1>
            <p className="mt-4 text-base font-light max-w-2xl text-[#777] leading-relaxed">
              Open the assumptions panel to control the entire model. The half-year tables
              below are calculated live from your inputs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetAll}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-black/[0.08] bg-white text-[#777] hover:text-[#1A1A1A] hover:border-black/20 transition"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white shadow-sm transition hover:opacity-95"
              style={{ background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }}
            >
              <span>Open assumptions</span>
              {overrideCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full bg-white/25 text-white text-[10px] font-bold backdrop-blur-sm">
                  {overrideCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ── Headline tiles ───────────────────────────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard label="Ending subscribers" value={int(endingSubs)} sub={`month ${FORECAST_MONTHS}`} />
          <KPICard label="Final MRR" value={money(finalMrr)} sub={`month ${FORECAST_MONTHS}`} />
          <KPICard label="Final ARR" value={money(finalArr)} accent="emerald" sub={`month ${FORECAST_MONTHS}`} />
          <KPICard
            label={`${FORECAST_MONTHS}-mo EBITDA`}
            value={money(annualEbitda)}
            accent={annualEbitda >= 0 ? "emerald" : "rose"}
            sub="cumulative"
          />
        </section>

        {/* Hidden — current assumptions now live in each half-year card header below.
            Page-level reader-aid stays here as a short legend. */}
        <section className="mt-10 rounded-2xl bg-white/70 border border-black/[0.05] px-6 sm:px-7 py-5">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div className="flex items-baseline gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]/80" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#999]">
                How to read the tables below
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="text-xs font-medium text-[#B18059] hover:text-[#8A6540] transition"
            >
              Edit assumptions →
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 text-[12px] text-[#666] leading-relaxed">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#999] mb-1">
                Layout
              </div>
              The {FORECAST_MONTHS}-month plan is split into <span className="text-[#1A1A1A] font-medium">{HALF_RANGES.length} half-year cards</span> stacked vertically — {MONTH_LABELS[0]} → {MONTH_LABELS[FORECAST_MONTHS - 1]}. Each card carries its own working assumptions in the header.
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#999] mb-1">
                Income vs Expenses
              </div>
              Income rows are tinted <span className="text-emerald-700 font-medium">green</span> (Subscription revenue, ARR). Expense categories use <span className="text-[#8A6540] font-medium">warm gold</span> tones. <span className="text-[#1A1A1A] font-medium">EBITDA</span> at the bottom is the result.
            </div>
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#999] mb-1">
                Interaction
              </div>
              Click any expense category row (▶) to expand the line breakdown. Use the assumptions panel to change CAC, ARPU, churn, or any expense — per-month edits live in the month tabs at the top of the panel.
            </div>
          </div>
        </section>

        {/* ── Report tables — one stacked card per half-year ─────────── */}
        <section className="mt-14">
          <div className="flex items-baseline justify-between gap-3 mb-6">
            <div className="flex items-baseline gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]/80" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#999]">
                Half-year breakdown
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#BBB]">
              {HALF_RANGES.length} half-years · stacked vertically
            </span>
          </div>

          {/* Build the unified row list once and pass to every half-year card. */}
          {(() => {
            const rows: ReportRowDef[] = [
              { kind: "categoryHeader", label: "Subscribers", tone: "neutral" },
              {
                kind: "row",
                label: "Subscribers (start)",
                values: forecast.subscribersStart,
                format: dec1,
                aggregator: "last",
                tone: "muted",
              },
              {
                kind: "row",
                label: "Marketing acquisition budget",
                subLabel: "Campaigns + fixed M&S spend",
                values: forecast.marketingAcquisitionSpend,
                format: money,
                aggregator: "sum",
                tone: "muted",
              },
              {
                kind: "row",
                label: "New subscribers",
                subLabel: "Total M&S budget ÷ CAC",
                values: forecast.newSubscribers,
                format: dec1,
                aggregator: "sum",
                accent: "emerald",
              },
              {
                kind: "row",
                label: "Churned subscribers",
                values: forecast.churnedSubscribers,
                format: dec1,
                aggregator: "sum",
                accent: "rose",
              },
              {
                kind: "row",
                label: "Subscribers (end)",
                values: forecast.subscribersEnd,
                format: dec1,
                aggregator: "last",
              },
              { kind: "spacer" },
              { kind: "categoryHeader", label: "Income", tone: "income" },
              {
                kind: "row",
                label: "Subscription revenue",
                subLabel: "Subscribers (end) × ARPU",
                values: forecast.revenue,
                format: money,
                aggregator: "sum",
                accent: "emerald",
                strong: true,
              },
              {
                kind: "row",
                label: "ARR (run-rate at end of month)",
                values: forecast.arr,
                format: money,
                aggregator: "last",
                accent: "emerald",
                tone: "muted",
              },
            ];
            // Single "Expenses" section header above all expense categories.
            const visibleCategories = state.categories.filter(
              (c) => (linesByCategory[c] ?? []).length > 0,
            );
            if (visibleCategories.length > 0) {
              rows.push({ kind: "spacer" });
              rows.push({ kind: "categoryHeader", label: "Expenses", tone: "expense" });
            }
            state.categories.forEach((cat) => {
              const lines = linesByCategory[cat] ?? [];
              if (lines.length === 0) return;
              const catTotals = forecast.expensesByCategory[cat] ?? new Array(FORECAST_MONTHS).fill(0);
              const isOpen = expandedCategories.has(cat);
              // Single clickable row per category — shows the subtotal when
              // collapsed and acts as the expand/collapse toggle.
              rows.push({
                kind: "categoryToggle",
                label: cat,
                subtotalValues: catTotals,
                expanded: isOpen,
                onToggle: () => toggleCategory(cat),
                lineCount: lines.length,
              });
              if (isOpen) {
                for (const line of lines) {
                  const monthly = forecast.expensesByLine[line.id] ?? new Array(FORECAST_MONTHS).fill(0);
                  const tag =
                    line.kind === "linkedCampaigns"
                      ? "→ Campaign spend (drives new subs ÷ CAC)"
                      : line.kind === "calculatedTripleBundle"
                      ? `${money(line.amount)} × new subs`
                      : line.kind === "calculatedVat"
                      ? `${dec1(state.business.vatPct)}% × Israeli MRR`
                      : line.category === CATEGORY_MS && line.kind === "fixedUsd"
                      ? "Marketing budget (drives new subs ÷ CAC)"
                      : undefined;
                  rows.push({
                    kind: "row",
                    label: line.label,
                    subLabel: tag,
                    values: monthly,
                    format: money,
                    aggregator: "sum",
                    indented: true,
                  });
                }
              }
            });
            rows.push({ kind: "spacer" });
            rows.push({ kind: "total", label: "Total expenses", values: forecast.totalExpenses });
            rows.push({ kind: "ebitda", label: "EBITDA / Profit", values: forecast.ebitda });

            return (
              <div className="space-y-10">
                {HALF_RANGES.map((h, i) => {
                  const avgCac = avgRange(forecast.cac, h.start, h.end);
                  const avgArpu = avgRange(forecast.arpu, h.start, h.end);
                  const avgChurn = avgRange(forecast.churnPct, h.start, h.end) * 100;
                  const endMonth = h.end - 1;
                  const startSubscribers = forecast.subscribersStart[h.start] ?? 0;
                  const endingSubscribers = forecast.subscribersEnd[endMonth] ?? 0;
                  const totalNewSubscribers = aggregateRange(
                    forecast.newSubscribers,
                    h.start,
                    h.end,
                    "sum",
                  );
                  const totalChurnedSubscribers = aggregateRange(
                    forecast.churnedSubscribers,
                    h.start,
                    h.end,
                    "sum",
                  );
                  const netSubscriberGrowth = endingSubscribers - startSubscribers;
                  const sixMonthEbitda = aggregateRange(forecast.ebitda, h.start, h.end, "sum");
                  const finalMonthEbitda = forecast.ebitda[endMonth] ?? 0;
                  const finalMrr = endingSubscribers * (forecast.arpu[endMonth] ?? 0);
                  const finalArrForHalf = finalMrr * 12;
                  return (
                    <HalfYearSection
                      key={i}
                      half={h}
                      index={i}
                      rows={rows}
                      pills={[
                        { name: "Cost to Acquire (CAC)", value: money(avgCac) },
                        { name: "Avg Revenue / Sub (ARPU)", value: money2(avgArpu) },
                        { name: "Churn Rate (Churn)", value: pct(avgChurn) },
                      ]}
                      summaryKpis={[
                        {
                          label: "6-mo cash result",
                          value: money(sixMonthEbitda),
                          sub: "Revenue minus expenses",
                          tone: sixMonthEbitda >= 0 ? "positive" : "negative",
                        },
                        {
                          label: "End-month EBITDA",
                          value: money(finalMonthEbitda),
                          sub: `${MONTH_LABELS[endMonth]} profit / loss`,
                          tone: finalMonthEbitda >= 0 ? "positive" : "negative",
                        },
                        {
                          label: "New customers bought",
                          value: int(totalNewSubscribers),
                          sub: "Total M&S budget ÷ CAC",
                          tone: "neutral",
                        },
                        {
                          label: "Net customer growth",
                          value: `${netSubscriberGrowth >= 0 ? "+" : ""}${dec1(netSubscriberGrowth)}`,
                          sub: `${int(totalChurnedSubscribers)} churned in period`,
                          tone: netSubscriberGrowth >= 0 ? "positive" : "negative",
                        },
                        {
                          label: "Ending subscribers",
                          value: int(endingSubscribers),
                          sub: `End of ${MONTH_LABELS[endMonth]}`,
                          tone: "neutral",
                        },
                        {
                          label: "Run-rate ARR",
                          value: money(finalArrForHalf),
                          sub: "Ending subs × ARPU × 12",
                          tone: "positive",
                        },
                      ]}
                    />
                  );
                })}
              </div>
            );
          })()}
        </section>

        {/* ── Trajectory chart ──────────────────────────────────────── */}
        <section className="mt-16">
          <TrajectoryChart
            data={chartData}
            startingMrr={chartData[0]?.mrr ?? 0}
            endingMrr={chartData[chartData.length - 1]?.mrr ?? 0}
            startingSubs={chartData[0]?.subscribers ?? 0}
            endingSubs={chartData[chartData.length - 1]?.subscribers ?? 0}
            totalEbitda={annualEbitda}
            finalArr={finalArr}
          />
        </section>

        <footer className="mt-14 flex items-center justify-center gap-3 text-[11px] text-[#BBB] font-light">
          <SaveStatusBadge status={saveStatus} />
          <span>Full forecast state saves to database when available · local fallback stays active</span>
        </footer>
      </div>

      {/* ── Side panel ───────────────────────────────────────────────── */}
      <AssumptionsSidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        state={state}
        patchBusiness={patchBusiness}
        patchLine={patchLine}
        setMonthlyOverride={setMonthlyOverride}
        setExpenseOverride={setExpenseOverride}
        setRangeOverride={setRangeOverride}
        copyValueToAll={copyValueToAll}
        setLineRangeOverride={setLineRangeOverride}
        setLineHalfOverride={setLineHalfOverride}
        clearLineHalfOverride={clearLineHalfOverride}
        copyLineValueToAll={copyLineValueToAll}
        createExpenseLine={createExpenseLine}
        removeExpenseLine={removeExpenseLine}
        resetAll={resetAll}
        overrideCount={overrideCount}
        saveStatus={saveStatus}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Side panel
// ─────────────────────────────────────────────────────────────────────

interface AssumptionsSidePanelProps {
  open: boolean;
  onClose: () => void;
  state: BudgetState;
  patchBusiness: (p: Partial<BusinessAssumptions>) => void;
  patchLine: (id: string, p: Partial<ExpenseLine>) => void;
  setMonthlyOverride: (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    monthIdx: number,
    value: number | null,
  ) => void;
  setExpenseOverride: (lineId: string, monthIdx: number, value: number | null) => void;
  setRangeOverride: (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    fromMonth: number,
    value: number,
  ) => void;
  copyValueToAll: (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    value: number,
  ) => void;
  setLineRangeOverride: (lineId: string, fromMonth: number, value: number) => void;
  setLineHalfOverride: (lineId: string, halfIdx: number, value: number) => void;
  clearLineHalfOverride: (lineId: string, halfIdx: number) => void;
  copyLineValueToAll: (lineId: string, value: number) => void;
  createExpenseLine: (input: AddExpenseLineInput) => void;
  removeExpenseLine: (lineId: string) => void;
  resetAll: () => void;
  overrideCount: number;
  saveStatus: SaveStatus;
}

const AssumptionsSidePanel: React.FC<AssumptionsSidePanelProps> = ({
  open,
  onClose,
  state,
  patchBusiness,
  patchLine,
  setMonthlyOverride,
  setExpenseOverride,
  setRangeOverride,
  copyValueToAll,
  setLineRangeOverride,
  setLineHalfOverride,
  clearLineHalfOverride,
  copyLineValueToAll,
  createExpenseLine,
  removeExpenseLine,
  resetAll,
  overrideCount,
  saveStatus,
}) => {
  // ESC closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const startingArpu = derivedStartingArpu(state.business);

  // Selected month for focused per-month editing.
  // "all" = global defaults editor (sections 1–5). number = month index 0–23.
  const [selectedMonth, setSelectedMonth] = useState<"all" | number>("all");
  // Which half-year is expanded in the navigator (0–3). Auto-opens when a month is selected.
  const [expandedHalf, setExpandedHalf] = useState<number | null>(null);
  const monthTabsRef = useRef<HTMLDivElement | null>(null);

  // When a month is selected, auto-expand its half-year.
  const selectMonth = (i: number) => {
    setSelectedMonth(i);
    setExpandedHalf(Math.floor(i / 6));
  };

  // Toggle a half-year open/close. If clicking the already-open half, collapse it.
  const toggleHalf = (hi: number) => {
    setExpandedHalf((prev) => (prev === hi ? null : hi));
    // If a month from a different half was selected, stay on "all" defaults view.
    if (typeof selectedMonth === "number" && Math.floor(selectedMonth / 6) !== hi) {
      setSelectedMonth("all");
    }
  };

  // Override helpers.
  const monthHasOverride = (i: number) =>
    state.overrides.cac[i] !== null ||
    state.overrides.arpu[i] !== null ||
    state.overrides.campaignSpend[i] !== null ||
    state.overrides.churnPct[i] !== null ||
    Object.values(state.overrides.expenseLines).some((arr) => arr[i] !== null);

  const halfHasOverride = (start: number, end: number) => {
    for (let i = start; i < end; i++) if (monthHasOverride(i)) return true;
    return false;
  };

  return (
    <>
      {/* Backdrop — subtle, spreadsheet remains visible behind. */}
      <div
        className={`fixed inset-0 z-40 bg-[#1A1A1A]/15 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel. */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[100vw] sm:w-[92vw] lg:w-[85vw] max-w-[1500px]
          shadow-2xl border-l border-black/[0.06]
          transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
          flex flex-col`}
        style={{ background: "#FAFAF8" }}
        role="dialog"
        aria-label="Assumptions"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-black/[0.06] px-7 sm:px-10 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]/80" />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#999]">
                Control center
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extralight tracking-[-0.01em] text-[#1A1A1A]">
              Assumptions
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {overrideCount > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8A6540] bg-[#EAB776]/[0.12] border border-[#EAB776]/30 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]" />
                {overrideCount} override{overrideCount === 1 ? "" : "s"}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold px-5 py-2.5 rounded-full text-white shadow-sm transition hover:opacity-95"
              style={{ background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }}
            >
              Done
            </button>
          </div>
        </div>

        {/* Month navigator — grouped by half-year */}
        <div className="sticky top-[97px] z-[9] bg-white/90 backdrop-blur-sm border-b border-black/[0.06]">
          <div className="px-7 sm:px-10 pt-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-[#999] font-medium">
            Editing for
          </div>

          {/* Row 1: All months + half-year pills (one per H1..Hn) */}
          <div ref={monthTabsRef} className="px-7 sm:px-10 pb-2 pt-1 flex items-center gap-2 flex-wrap">
            {/* All months */}
            <button
              type="button"
              data-active={selectedMonth === "all" ? "true" : "false"}
              onClick={() => { setSelectedMonth("all"); setExpandedHalf(null); }}
              className={`relative inline-flex flex-col items-start text-left px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition ${
                selectedMonth === "all"
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-[#777] border-black/[0.08] hover:border-[#EAB776]/60 hover:text-[#1A1A1A]"
              }`}
              style={selectedMonth === "all" ? { background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" } : undefined}
            >
              <span>All months</span>
              <span className={`text-[10px] font-medium leading-tight ${selectedMonth === "all" ? "text-white/80" : "text-[#BBB]"}`}>
                Edit defaults
              </span>
            </button>

            <div className="w-px h-8 bg-black/[0.08] mx-0.5" />

            {/* Half-year group pills */}
            {HALF_RANGES.map((h, hi) => {
              const isExpanded = expandedHalf === hi;
              const halfActive = typeof selectedMonth === "number" && Math.floor(selectedMonth / 6) === hi;
              const hasOv = halfHasOverride(h.start, h.end);
              const overrideCount = Array.from({ length: 6 }, (_, j) => h.start + j)
                .filter((i) => monthHasOverride(i)).length;
              return (
                <button
                  key={hi}
                  type="button"
                  onClick={() => toggleHalf(hi)}
                  className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold whitespace-nowrap border transition ${
                    halfActive
                      ? "text-white border-transparent shadow-sm"
                      : isExpanded
                      ? "bg-[#EAB776]/[0.1] text-[#8A6540] border-[#EAB776]/40"
                      : "bg-white text-[#777] border-black/[0.08] hover:border-[#EAB776]/50 hover:text-[#1A1A1A]"
                  }`}
                  style={halfActive ? { background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" } : undefined}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${halfActive ? "text-white/70" : "text-[#B18059]"}`}>
                    {h.label}
                  </span>
                  <span>{h.range}</span>
                  {/* override count badge */}
                  {hasOv && (
                    <span className={`ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold tabular-nums ${
                      halfActive ? "bg-white/25 text-white" : "bg-[#EAB776]/30 text-[#8A6540]"
                    }`}>
                      {overrideCount}
                    </span>
                  )}
                  {/* chevron */}
                  <span className={`ml-0.5 text-[10px] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} ${halfActive ? "text-white/70" : "text-[#BBB]"}`}>
                    ▼
                  </span>
                </button>
              );
            })}
          </div>

          {/* Row 2: 6-month drill-down for the expanded half-year */}
          {expandedHalf !== null && (
            <div className="px-7 sm:px-10 pb-3 pt-0">
              <div className="flex items-center gap-1.5 pl-1 border-l-2 border-[#EAB776]/30 ml-1">
                {Array.from({ length: 6 }, (_, j) => {
                  const i = HALF_RANGES[expandedHalf].start + j;
                  const isActive = selectedMonth === i;
                  const hasOv = monthHasOverride(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      data-active={isActive ? "true" : "false"}
                      onClick={() => selectMonth(i)}
                      className={`relative inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap border transition ${
                        isActive
                          ? "text-white border-transparent shadow-sm"
                          : "bg-white text-[#777] border-black/[0.08] hover:border-[#EAB776]/50 hover:text-[#1A1A1A]"
                      }`}
                      style={isActive ? { background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" } : undefined}
                    >
                      {MONTH_LABELS[i] ?? `M${i + 1}`}
                      {hasOv && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/80" : "bg-[#EAB776]"}`} />
                      )}
                    </button>
                  );
                })}
                <span className="ml-2 text-[10px] text-[#BBB]">
                  Select a month to edit its assumptions individually
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-7 sm:px-10 py-8 space-y-10">
          {selectedMonth !== "all" && (
            <MonthFocusBody
              monthIdx={selectedMonth}
              state={state}
              startingArpu={startingArpu}
              setMonthlyOverride={setMonthlyOverride}
              setRangeOverride={setRangeOverride}
              copyValueToAll={copyValueToAll}
              setExpenseOverride={setExpenseOverride}
              setLineRangeOverride={setLineRangeOverride}
              copyLineValueToAll={copyLineValueToAll}
              createExpenseLine={createExpenseLine}
              removeExpenseLine={removeExpenseLine}
              onSwitchToAll={() => { setSelectedMonth("all"); setExpandedHalf(null); }}
            />
          )}
          {selectedMonth === "all" && expandedHalf !== null && (
            <HalfFocusBody
              halfIdx={expandedHalf}
              state={state}
              setMonthlyOverride={setMonthlyOverride}
              setHalfOverride={(field, halfIdx, value) => {
                const start = HALF_RANGES[halfIdx].start;
                const end = HALF_RANGES[halfIdx].end;
                for (let i = start; i < end; i++) setMonthlyOverride(field, i, value);
              }}
              clearHalfOverride={(field, halfIdx) => {
                const start = HALF_RANGES[halfIdx].start;
                const end = HALF_RANGES[halfIdx].end;
                for (let i = start; i < end; i++) setMonthlyOverride(field, i, null);
              }}
              setLineHalfOverride={setLineHalfOverride}
              clearLineHalfOverride={clearLineHalfOverride}
              setExpenseOverride={setExpenseOverride}
              onPickMonth={(i) => selectMonth(i)}
              onSwitchToAll={() => { setExpandedHalf(null); }}
            />
          )}
          {selectedMonth === "all" && expandedHalf === null && (
            <>
          {/* 1. Business */}
          <PanelSection
            number={1}
            title="Business assumptions"
            description="Foundational numbers (USD). Starting ARPU is derived from current MRR ÷ subs."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FieldNumber
                label="Starting subscribers"
                value={state.business.startingSubscribers}
                onChange={(v) => patchBusiness({ startingSubscribers: Math.max(0, v) })}
                step={1}
              />
              <FieldNumber
                label="Current monthly revenue"
                prefix="$"
                value={state.business.currentMrrUsd}
                onChange={(v) => patchBusiness({ currentMrrUsd: Math.max(0, v) })}
                step={500}
              />
              <FieldNumber
                label="Israeli customers"
                value={state.business.israeliCustomers}
                onChange={(v) => patchBusiness({ israeliCustomers: Math.max(0, Math.min(v, 1e9)) })}
                step={1}
              />
              <FieldNumber
                label="VAT (Israel)"
                suffix="%"
                value={state.business.vatPct}
                onChange={(v) => patchBusiness({ vatPct: Math.max(0, v) })}
                step={0.5}
                decimals={1}
              />
              <div>
                <FieldNumber
                  label="Churn rate"
                  suffix="%"
                  value={state.business.churnRatePct}
                  onChange={(v) => copyValueToAll("churnPct", Math.max(0, v))}
                  step={0.5}
                  decimals={2}
                />
                <div className="mt-2 flex gap-2">
                  {[2, 3, 5].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => copyValueToAll("churnPct", q)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition ${
                        Math.abs(state.business.churnRatePct - q) < 0.001
                          ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                          : "bg-white text-[#777] border-black/[0.08] hover:border-black/20 hover:text-[#1A1A1A]"
                      }`}
                    >
                      {q}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DerivedRow
              label="Derived starting ARPU"
              value={`${money2(startingArpu)} / sub / mo`}
              note="Auto: currentMrrUsd ÷ startingSubscribers"
            />
          </PanelSection>

          {/* 2. Subscriber growth */}
          <PanelSection
            number={2}
            title="Subscriber growth"
            description="Total Marketing & Sales budget ÷ CAC = new subscribers each month. Drivers include Campaigns, Campaign manager, Content creation, and any other fixed M&S row you add — the more marketing budget, the more subscribers acquired at the same CAC."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FieldNumber
                label="Global CAC (all months)"
                prefix="$"
                value={state.growth.defaultCac}
                onChange={(v) => copyValueToAll("cac", Math.max(1, v))}
                step={10}
              />
              <FieldNumber
                label="Global campaign spend / mo"
                prefix="$"
                value={state.growth.defaultCampaignSpend}
                onChange={(v) => copyValueToAll("campaignSpend", Math.max(0, v))}
                step={500}
              />
            </div>
            {(() => {
              const fixedMandS = state.expenseLines
                .filter((l) => l.category === CATEGORY_MS && l.kind === "fixedUsd")
                .reduce((s, l) => s + Math.max(0, l.amount), 0);
              const totalMandS = state.growth.defaultCampaignSpend + fixedMandS;
              const impliedSubs =
                state.growth.defaultCac > 0 ? totalMandS / state.growth.defaultCac : 0;
              return (
                <DerivedRow
                  label="Implied new subs / month at defaults"
                  value={dec1(impliedSubs)}
                  note={`(campaignSpend ${money(state.growth.defaultCampaignSpend)} + fixed M&S ${money(fixedMandS)}) ÷ CAC ${money(state.growth.defaultCac)}`}
                />
              );
            })()}
          </PanelSection>

          {/* 3. Revenue */}
          <PanelSection
            number={3}
            title="Revenue"
            description="ARPU is applied to end-of-month subscribers after new acquisition and churn. In short: marketing budget ÷ CAC creates accounts, then active accounts × ARPU creates revenue."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FieldNumber
                label="Global ARPU (all months)"
                prefix="$"
                hint="USD per subscriber / mo"
                value={state.revenue.defaultArpu}
                onChange={(v) => copyValueToAll("arpu", Math.max(0, v))}
                step={0.5}
                decimals={2}
              />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => copyValueToAll("arpu", Math.round(startingArpu * 100) / 100)}
                  className="text-xs font-semibold px-3 py-2 rounded-full border border-black/[0.08] bg-white text-[#777] hover:text-[#1A1A1A] hover:border-black/20 transition"
                >
                  Reset to derived ({money2(startingArpu)})
                </button>
              </div>
            </div>
          </PanelSection>

          {/* 4. Expenses */}
          <PanelSection
            number={4}
            title="Expense assumptions"
            description="Edit the base catalog in USD. Base values apply only where a month does not already have an override; use a month or half-year view for period-specific salaries and expenses."
          >
            <div className="space-y-4">
              {state.categories.map((cat) => {
                const lines = state.expenseLines.filter((l) => l.category === cat);
                if (lines.length === 0) return null;
                return (
                  <div key={cat} className="rounded-2xl border border-black/[0.06] bg-white p-5">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="w-1 h-1 rounded-full bg-[#EAB776]/80" />
                      <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#999]">
                        {cat}
                      </div>
                      <div className="ml-auto text-[10px] uppercase tracking-[0.14em] text-[#BBB]">
                        {lines.length} line{lines.length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {lines.map((line) => (
                        <ExpenseLineEditor
                          key={line.id}
                          line={line}
                          state={state}
                          onChange={(p) => patchLine(line.id, p)}
                          onChangeCampaignSpend={(v) => copyValueToAll("campaignSpend", Math.max(0, v))}
                          onRemove={() => removeExpenseLine(line.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              <AddExpenseLineForm
                categories={state.categories}
                mode="global"
                onAdd={({ category, label, amount }) =>
                  createExpenseLine({ category, label, amount })
                }
              />
            </div>
          </PanelSection>

          {/* Hint pointing the user back at the month tabs above. */}
          <div className="rounded-2xl border border-[#EAB776]/30 bg-[#EAB776]/[0.05] px-5 py-4 text-[12px] text-[#8A6540] leading-relaxed">
            <span className="font-semibold">Tip:</span> for per-month adjustments to CAC,
            ARPU, campaign spend, churn, or any expense line, pick a month from the strip
            at the top of this panel. Each month carries its own overrides and updates the
            forecast immediately.
          </div>
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-black/[0.06] px-7 sm:px-10 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-[#999]">
            <SaveStatusBadge status={saveStatus} />
            <span>{overrideCount} active override{overrideCount === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-black/[0.08] bg-white text-[#777] hover:text-rose-600 hover:border-rose-200 transition"
            >
              Reset to defaults
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2 rounded-full text-white hover:opacity-95 transition"
              style={{ background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }}
            >
              Close panel
            </button>
          </div>
        </div>
      </aside>

    </>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Month switcher + focused per-month editor
// ─────────────────────────────────────────────────────────────────────

const MonthTab: React.FC<{
  label: string;
  description?: string;
  active: boolean;
  hasOverride?: boolean;
  onClick: () => void;
}> = ({ label, description, active, hasOverride, onClick }) => (
  <button
    type="button"
    data-active={active ? "true" : "false"}
    onClick={onClick}
    className={`relative inline-flex flex-col items-start text-left px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap border transition ${
      active
        ? "text-white border-transparent shadow-sm"
        : "bg-white text-[#777] border-black/[0.08] hover:border-[#EAB776]/60 hover:text-[#1A1A1A]"
    }`}
    style={
      active
        ? { background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }
        : undefined
    }
  >
    <span>{label}</span>
    {description && (
      <span className={`text-[10px] font-medium leading-tight ${active ? "text-white/80" : "text-[#BBB]"}`}>
        {description}
      </span>
    )}
    {hasOverride && !active && (
      <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#EAB776]" />
    )}
    {hasOverride && active && (
      <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-white/90" />
    )}
  </button>
);

interface MonthFocusBodyProps {
  monthIdx: number;
  state: BudgetState;
  startingArpu: number;
  setMonthlyOverride: (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    monthIdx: number,
    value: number | null,
  ) => void;
  setRangeOverride: (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    fromMonth: number,
    value: number,
  ) => void;
  copyValueToAll: (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    value: number,
  ) => void;
  setExpenseOverride: (lineId: string, monthIdx: number, value: number | null) => void;
  setLineRangeOverride: (lineId: string, fromMonth: number, value: number) => void;
  copyLineValueToAll: (lineId: string, value: number) => void;
  createExpenseLine: (input: AddExpenseLineInput) => void;
  removeExpenseLine: (lineId: string) => void;
  onSwitchToAll: () => void;
}

const MonthFocusBody: React.FC<MonthFocusBodyProps> = ({
  monthIdx,
  state,
  setMonthlyOverride,
  setRangeOverride,
  copyValueToAll,
  setExpenseOverride,
  setLineRangeOverride,
  copyLineValueToAll,
  createExpenseLine,
  removeExpenseLine,
  onSwitchToAll,
}) => {
  const monthLabel = MONTH_LABELS[monthIdx] ?? `Month ${monthIdx + 1}`;
  const monthsRemaining = FORECAST_MONTHS - monthIdx;

  return (
    <div className="space-y-8">
      {/* Focus header */}
      <div className="rounded-2xl border border-[#EAB776]/25 bg-gradient-to-br from-[#EAB776]/[0.07] to-white px-6 py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]/80" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#999]">
              Editing month
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-extralight tracking-[-0.01em] text-[#1A1A1A] truncate">{monthLabel}</h3>
            <span className="text-[12px] font-medium text-[#999]">
              · month {monthIdx + 1} of {FORECAST_MONTHS}
            </span>
          </div>
          <p className="text-[12px] text-[#777] mt-2 max-w-xl leading-relaxed">
            Edits below apply to this month only. Use the buttons under each field to
            propagate forward, copy to all months, or clear an override.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToAll}
          className="text-[12px] font-semibold text-[#777] hover:text-[#1A1A1A] px-4 py-2 rounded-full border border-black/[0.08] hover:border-black/20 bg-white whitespace-nowrap transition"
        >
          ← All months
        </button>
      </div>

      {/* Subscriber growth */}
      <PanelSection
        number={1}
        title="Subscriber growth"
        description="Cost to acquire and Campaign spend for this month. New subs = total Marketing & Sales budget (campaigns + manager + content + any other fixed M&S row) ÷ CAC. Edit the M&S expense lines below to change the rest of the marketing budget."
      >
        <div className="space-y-4">
          <MonthField
            label="CAC (cost per new subscriber)"
            prefix="$"
            step={10}
            decimals={0}
            defaultValue={state.growth.defaultCac}
            override={state.overrides.cac[monthIdx]}
            monthIdx={monthIdx}
            monthsRemaining={monthsRemaining}
            onSetThis={(v) => setMonthlyOverride("cac", monthIdx, v)}
            onClearThis={() => setMonthlyOverride("cac", monthIdx, null)}
            onApplyFollowing={(v) => setRangeOverride("cac", monthIdx, v)}
            onCopyAll={(v) => copyValueToAll("cac", v)}
          />
          <MonthField
            label="Campaign spend (Marketing → Campaigns)"
            prefix="$"
            step={500}
            decimals={0}
            defaultValue={state.growth.defaultCampaignSpend}
            override={state.overrides.campaignSpend[monthIdx]}
            monthIdx={monthIdx}
            monthsRemaining={monthsRemaining}
            onSetThis={(v) => setMonthlyOverride("campaignSpend", monthIdx, v)}
            onClearThis={() => setMonthlyOverride("campaignSpend", monthIdx, null)}
            onApplyFollowing={(v) => setRangeOverride("campaignSpend", monthIdx, v)}
            onCopyAll={(v) => copyValueToAll("campaignSpend", v)}
          />
        </div>
      </PanelSection>

      {/* Revenue */}
      <PanelSection number={2} title="Revenue" description="ARPU applied to all active subscribers in this month.">
        <MonthField
          label="ARPU (per subscriber, per month)"
          prefix="$"
          step={0.5}
          decimals={2}
          defaultValue={state.revenue.defaultArpu}
          override={state.overrides.arpu[monthIdx]}
          monthIdx={monthIdx}
          monthsRemaining={monthsRemaining}
          onSetThis={(v) => setMonthlyOverride("arpu", monthIdx, v)}
          onClearThis={() => setMonthlyOverride("arpu", monthIdx, null)}
          onApplyFollowing={(v) => setRangeOverride("arpu", monthIdx, v)}
          onCopyAll={(v) => copyValueToAll("arpu", v)}
        />
      </PanelSection>

      {/* Business */}
      <PanelSection number={3} title="Business" description="Monthly churn applied to the start-of-month subscriber base.">
        <MonthField
          label="Churn rate"
          suffix="%"
          step={0.5}
          decimals={2}
          defaultValue={state.business.churnRatePct}
          override={state.overrides.churnPct[monthIdx]}
          monthIdx={monthIdx}
          monthsRemaining={monthsRemaining}
          onSetThis={(v) => setMonthlyOverride("churnPct", monthIdx, v)}
          onClearThis={() => setMonthlyOverride("churnPct", monthIdx, null)}
          onApplyFollowing={(v) => setRangeOverride("churnPct", monthIdx, v)}
          onCopyAll={(v) => copyValueToAll("churnPct", v)}
        />
      </PanelSection>

      {/* Expense rows */}
      <PanelSection
        number={4}
        title="Expense rows"
        description="Edit this month, apply a salary forward, copy to all months, or add a new role from this month forward."
      >
        <div className="space-y-5">
          <AddExpenseLineForm
            categories={state.categories}
            mode="from-month"
            monthLabel={monthLabel}
            onAdd={({ category, label, amount }) =>
              createExpenseLine({ category, label, amount, startMonth: monthIdx })
            }
          />
          {state.categories.map((cat) => {
            const lines = state.expenseLines.filter(
              (l) =>
                l.category === cat &&
                (l.kind === "fixedUsd" || l.kind === "calculatedTripleBundle" || l.kind === "calculatedVat"),
            );
            if (lines.length === 0) return null;
            return (
              <div key={cat} className="rounded-2xl border border-black/[0.06] bg-[#FAFAF8] p-5">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="w-1 h-1 rounded-full bg-[#EAB776]/80" />
                  <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#999]">
                    {cat}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {lines.map((line) => {
                    const isVat = line.kind === "calculatedVat";
                    const isUnit = line.kind === "calculatedTripleBundle";
                    const arr = state.overrides.expenseLines[line.id] ?? emptyOverrideArr();
                    const fallback = isVat ? state.business.vatPct : line.amount;
                    const sub = isVat
                      ? "VAT rate × Israeli MRR"
                      : isUnit
                      ? "USD per new subscriber"
                      : "USD per month";
                    return (
                      <MonthlyExpenseCard
                        key={line.id}
                        line={line}
                        label={line.label}
                        sublabel={sub}
                        prefix={isVat ? undefined : "$"}
                        suffix={isVat ? "%" : undefined}
                        step={isVat ? 0.5 : isUnit ? 1 : 50}
                        decimals={isVat ? 2 : 0}
                        defaultValue={fallback}
                        override={arr[monthIdx]}
                        monthIdx={monthIdx}
                        monthsRemaining={monthsRemaining}
                        onSetThis={(v) => setExpenseOverride(line.id, monthIdx, v)}
                        onClearThis={() => setExpenseOverride(line.id, monthIdx, null)}
                        onApplyFollowing={(v) => setLineRangeOverride(line.id, monthIdx, v)}
                        onCopyAll={(v) => copyLineValueToAll(line.id, v)}
                        onRemove={!line.protected ? () => removeExpenseLine(line.id) : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </PanelSection>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Half-year bulk editor — appears when a half pill is expanded but no
// specific month is selected. Shows the actual H-period values and lets
// the user bulk-set them across all 6 months in one shot, plus per-month
// inputs for fine adjustments.
// ─────────────────────────────────────────────────────────────────────

interface HalfFocusBodyProps {
  halfIdx: number;
  state: BudgetState;
  setMonthlyOverride: (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    monthIdx: number,
    value: number | null,
  ) => void;
  setHalfOverride: (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    halfIdx: number,
    value: number,
  ) => void;
  clearHalfOverride: (
    field: "cac" | "arpu" | "campaignSpend" | "churnPct",
    halfIdx: number,
  ) => void;
  setLineHalfOverride: (lineId: string, halfIdx: number, value: number) => void;
  clearLineHalfOverride: (lineId: string, halfIdx: number) => void;
  setExpenseOverride: (lineId: string, monthIdx: number, value: number | null) => void;
  onPickMonth: (monthIdx: number) => void;
  onSwitchToAll: () => void;
}

const HalfFocusBody: React.FC<HalfFocusBodyProps> = ({
  halfIdx,
  state,
  setMonthlyOverride,
  setHalfOverride,
  clearHalfOverride,
  setLineHalfOverride,
  clearLineHalfOverride,
  setExpenseOverride,
  onPickMonth,
  onSwitchToAll,
}) => {
  const half = HALF_RANGES[halfIdx];
  const monthIdxs = Array.from({ length: half.end - half.start }, (_, j) => half.start + j);

  const fieldRows: {
    field: "cac" | "arpu" | "campaignSpend" | "churnPct";
    label: string;
    sublabel: string;
    prefix?: string;
    suffix?: string;
    step: number;
    decimals: number;
    defaultValue: number;
  }[] = [
    {
      field: "cac",
      label: "Cost to acquire (CAC)",
      sublabel: "USD spent to acquire one new subscriber",
      prefix: "$",
      step: 10,
      decimals: 0,
      defaultValue: state.growth.defaultCac,
    },
    {
      field: "arpu",
      label: "Avg revenue per sub (ARPU)",
      sublabel: "USD per subscriber, per month",
      prefix: "$",
      step: 0.5,
      decimals: 2,
      defaultValue: state.revenue.defaultArpu,
    },
    {
      field: "campaignSpend",
      label: "Campaign spend / mo",
      sublabel: "Marketing → Campaigns. Adds to total M&S budget that drives new subs (÷ CAC)",
      prefix: "$",
      step: 500,
      decimals: 0,
      defaultValue: state.growth.defaultCampaignSpend,
    },
    {
      field: "churnPct",
      label: "Monthly churn rate",
      sublabel: "Applied to start-of-month subs",
      suffix: "%",
      step: 0.5,
      decimals: 2,
      defaultValue: state.business.churnRatePct,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-[#EAB776]/25 bg-gradient-to-br from-[#EAB776]/[0.07] to-white px-6 py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]/80" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#999]">
              Editing half-year
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <h3 className="text-2xl font-extralight tracking-[-0.01em] text-[#1A1A1A]">
              {half.label} <span className="text-[#999] font-light">·</span> {half.range}
            </h3>
            <span className="text-[12px] font-medium text-[#999]">
              · 6 months ({half.start + 1}–{half.end})
            </span>
          </div>
          <p className="text-[12px] text-[#777] mt-2 max-w-2xl leading-relaxed">
            Use the <strong>bulk input</strong> on the left to set a value for all 6
            months of this half-year at once, or edit individual months on the
            right. Pick a single month to access expense-line overrides too.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToAll}
          className="text-[12px] font-semibold text-[#777] hover:text-[#1A1A1A] px-4 py-2 rounded-full border border-black/[0.08] hover:border-black/20 bg-white whitespace-nowrap transition"
        >
          ← All months
        </button>
      </div>

      {/* Bulk + per-month rows */}
      <PanelSection
        number={1}
        title="Half-year assumptions"
        description="Single source of truth for CAC, ARPU, campaign spend and churn over this half-year."
      >
        <div className="space-y-5">
          {fieldRows.map((row) => {
            const arr = state.overrides[row.field];
            const monthValues = monthIdxs.map((i) => arr[i] ?? row.defaultValue);
            const allOverridden = monthIdxs.every((i) => arr[i] !== null);
            const someOverridden = monthIdxs.some((i) => arr[i] !== null);
            const avg = monthValues.reduce((s, v) => s + v, 0) / monthValues.length;
            const min = Math.min(...monthValues);
            const max = Math.max(...monthValues);
            return (
              <HalfBulkRow
                key={row.field}
                label={row.label}
                sublabel={row.sublabel}
                prefix={row.prefix}
                suffix={row.suffix}
                step={row.step}
                decimals={row.decimals}
                avg={avg}
                min={min}
                max={max}
                allOverridden={allOverridden}
                someOverridden={someOverridden}
                monthIdxs={monthIdxs}
                monthValues={monthValues}
                monthOverrides={monthIdxs.map((i) => arr[i])}
                defaultValue={row.defaultValue}
                onBulkApply={(v) => setHalfOverride(row.field, halfIdx, v)}
                onBulkClear={() => clearHalfOverride(row.field, halfIdx)}
                onSetMonth={(i, v) => setMonthlyOverride(row.field, i, v)}
                onClearMonth={(i) => setMonthlyOverride(row.field, i, null)}
                onPickMonth={onPickMonth}
              />
            );
          })}
        </div>
      </PanelSection>

      <PanelSection
        number={2}
        title="Expenses for this half-year"
        description="Bulk-set any salary or expense across this half-year, or adjust individual months in the 6-month grid."
      >
        <div className="space-y-5">
          {state.categories.map((cat) => {
            const lines = state.expenseLines.filter(
              (line) =>
                line.category === cat &&
                (line.kind === "fixedUsd" || line.kind === "calculatedTripleBundle" || line.kind === "calculatedVat"),
            );
            if (lines.length === 0) return null;
            return (
              <div key={cat} className="rounded-2xl border border-black/[0.06] bg-[#FAFAF8] p-5">
                <div className="flex items-baseline justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#EAB776]/80" />
                    <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#999]">
                      {cat}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPickMonth(half.start)}
                    className="text-[11px] font-semibold text-[#B18059] hover:text-[#8A6540] transition"
                  >
                    Add from {MONTH_LABELS[half.start]}
                  </button>
                </div>
                <div className="space-y-3">
                  {lines.map((line) => {
                    const isVat = line.kind === "calculatedVat";
                    const fallback = isVat ? state.business.vatPct : line.amount;
                    const arr = state.overrides.expenseLines[line.id] ?? emptyOverrideArr();
                    const monthValues = monthIdxs.map((i) => arr[i] ?? fallback);
                    const monthOverrides = monthIdxs.map((i) => arr[i]);
                    const avg = monthValues.reduce((s, v) => s + v, 0) / monthValues.length;
                    const min = Math.min(...monthValues);
                    const max = Math.max(...monthValues);
                    const allOverridden = monthIdxs.every((i) => arr[i] !== null);
                    const someOverridden = monthIdxs.some((i) => arr[i] !== null);
                    return (
                      <HalfBulkRow
                        key={line.id}
                        label={line.label}
                        sublabel={
                          isVat
                            ? "VAT rate for each month"
                            : line.kind === "calculatedTripleBundle"
                            ? "USD per new subscriber"
                            : "USD / month"
                        }
                        prefix={isVat ? undefined : "$"}
                        suffix={isVat ? "%" : undefined}
                        step={isVat ? 0.5 : line.kind === "calculatedTripleBundle" ? 1 : 50}
                        decimals={isVat ? 2 : 0}
                        avg={avg}
                        min={min}
                        max={max}
                        allOverridden={allOverridden}
                        someOverridden={someOverridden}
                        monthIdxs={monthIdxs}
                        monthValues={monthValues}
                        monthOverrides={monthOverrides}
                        defaultValue={fallback}
                        onBulkApply={(v) => setLineHalfOverride(line.id, halfIdx, v)}
                        onBulkClear={() => clearLineHalfOverride(line.id, halfIdx)}
                        onSetMonth={(i, v) => setExpenseOverride(line.id, i, v)}
                        onClearMonth={(i) => setExpenseOverride(line.id, i, null)}
                        onPickMonth={onPickMonth}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </PanelSection>
    </div>
  );
};

// One row inside the half-year body — bulk input on the left, 6 per-month
// micro-inputs on the right, each editable inline. The "min … max" badge
// shows whether the half is uniform or varies by month.
const HalfBulkRow: React.FC<{
  label: string;
  sublabel: string;
  prefix?: string;
  suffix?: string;
  step: number;
  decimals: number;
  avg: number;
  min: number;
  max: number;
  allOverridden: boolean;
  someOverridden: boolean;
  monthIdxs: number[];
  monthValues: number[];
  monthOverrides: (number | null)[];
  defaultValue: number;
  onBulkApply: (value: number) => void;
  onBulkClear: () => void;
  onSetMonth: (monthIdx: number, value: number) => void;
  onClearMonth: (monthIdx: number) => void;
  onPickMonth: (monthIdx: number) => void;
}> = ({
  label,
  sublabel,
  prefix,
  suffix,
  step,
  decimals,
  avg,
  min,
  max,
  allOverridden,
  someOverridden,
  monthIdxs,
  monthValues,
  monthOverrides,
  defaultValue,
  onBulkApply,
  onBulkClear,
  onSetMonth,
  onClearMonth,
  onPickMonth,
}) => {
  const initialBulk = Number.isFinite(avg) ? avg.toFixed(decimals) : "";
  const [bulkDraft, setBulkDraft] = useState<string>(initialBulk);
  useEffect(() => {
    setBulkDraft(initialBulk);
  }, [initialBulk]);

  const bulkParsed = (() => {
    const n = parseFloat(bulkDraft);
    return Number.isFinite(n) ? Math.max(0, n) : NaN;
  })();
  const uniform = Math.abs(max - min) < 1e-9;
  const bulkDirty = Number.isFinite(bulkParsed) && (!uniform || Math.abs(bulkParsed - avg) > 1e-9);

  const fmt = (v: number) =>
    `${prefix ?? ""}${decimals > 0 ? v.toFixed(decimals) : Math.round(v)}${suffix ?? ""}`;

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      {/* Label + status */}
      <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-[#1A1A1A]">{label}</div>
          <div className="text-[11px] text-[#999] mt-0.5">{sublabel}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {uniform ? (
            <span className="text-[10px] font-semibold text-[#777] uppercase tracking-[0.12em]">
              uniform · {fmt(avg)}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-[#8A6540] bg-[#EAB776]/[0.12] border border-[#EAB776]/30 px-2 py-0.5 rounded-full">
              {fmt(min)} → {fmt(max)}
            </span>
          )}
          {allOverridden ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#8A6540] bg-[#EAB776]/[0.14] border border-[#EAB776]/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]" />
              all 6 overridden
            </span>
          ) : someOverridden ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#8A6540] bg-[#EAB776]/[0.08] border border-[#EAB776]/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]/70" />
              some overridden
            </span>
          ) : (
            <span className="text-[10px] font-medium text-[#BBB] uppercase tracking-[0.12em]">
              using default
            </span>
          )}
        </div>
      </div>

      {/* Bulk + per-month grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-5 items-start">
        {/* Bulk input */}
        <div className="rounded-xl border border-[#EAB776]/25 bg-[#EAB776]/[0.05] p-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A6540] mb-2">
            Bulk · all 6 months
          </div>
          <div className="flex items-baseline rounded-lg px-3 py-2.5 bg-white border border-black/[0.08] focus-within:border-[#EAB776]/60 transition">
            {prefix && <span className="text-xs font-medium text-[#999] mr-0.5 select-none">{prefix}</span>}
            <input
              type="number"
              inputMode="decimal"
              step={step}
              value={bulkDraft}
              onChange={(e) => setBulkDraft(e.target.value)}
              className="w-full bg-transparent text-base font-light tabular-nums text-[#1A1A1A] outline-none text-right"
            />
            {suffix && <span className="text-xs font-medium text-[#999] ml-0.5 select-none">{suffix}</span>}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!bulkDirty}
              onClick={() => onBulkApply(bulkParsed)}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition ${
                bulkDirty
                  ? "text-white border-transparent shadow-sm hover:opacity-95"
                  : "bg-[#FAFAF8] text-[#BBB] border-black/[0.06] cursor-not-allowed"
              }`}
              style={
                bulkDirty
                  ? { background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }
                  : undefined
              }
            >
              Apply to half-year
            </button>
            <button
              type="button"
              disabled={!someOverridden}
              onClick={onBulkClear}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition ${
                someOverridden
                  ? "bg-white text-[#777] border-black/[0.08] hover:text-[#1A1A1A] hover:border-black/20"
                  : "bg-[#FAFAF8] text-[#CCC] border-black/[0.06] cursor-not-allowed"
              }`}
            >
              Reset half
            </button>
          </div>
          <div className="text-[10px] text-[#999] mt-2">
            default {fmt(defaultValue)}
          </div>
        </div>

        {/* Per-month inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {monthIdxs.map((i, j) => (
            <HalfMonthCell
              key={i}
              monthIdx={i}
              monthLabel={MONTH_LABELS[i] ?? `M${i + 1}`}
              prefix={prefix}
              suffix={suffix}
              step={step}
              decimals={decimals}
              defaultValue={defaultValue}
              value={monthValues[j]}
              override={monthOverrides[j]}
              onSet={(v) => onSetMonth(i, v)}
              onClear={() => onClearMonth(i)}
              onPickMonth={() => onPickMonth(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// One small cell inside the per-month grid of HalfBulkRow.
const HalfMonthCell: React.FC<{
  monthIdx: number;
  monthLabel: string;
  prefix?: string;
  suffix?: string;
  step: number;
  decimals: number;
  defaultValue: number;
  value: number;
  override: number | null;
  onSet: (v: number) => void;
  onClear: () => void;
  onPickMonth: () => void;
}> = ({
  monthLabel,
  prefix,
  suffix,
  step,
  decimals,
  defaultValue,
  value,
  override,
  onSet,
  onClear,
  onPickMonth,
}) => {
  const [draft, setDraft] = useState<string>(() =>
    Number.isFinite(value) ? value.toFixed(decimals) : "",
  );
  useEffect(() => {
    setDraft(Number.isFinite(value) ? value.toFixed(decimals) : "");
  }, [value, decimals]);

  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(0, n);
    if (Math.abs(clamped - value) < 1e-9) return;
    onSet(clamped);
  };

  return (
    <div
      className={`rounded-xl border p-2 transition ${
        override !== null
          ? "bg-[#EAB776]/[0.06] border-[#EAB776]/30"
          : "bg-[#FAFAF8] border-black/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <button
          type="button"
          onClick={onPickMonth}
          className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8A6540] hover:underline"
          title="Open this month for full editing"
        >
          {monthLabel}
        </button>
        {override !== null && (
          <button
            type="button"
            onClick={onClear}
            className="text-[9px] font-medium text-[#999] hover:text-[#1A1A1A] underline"
            title="Reset this month to default"
          >
            reset
          </button>
        )}
      </div>
      <div className="flex items-baseline rounded-md px-2 py-1.5 bg-white border border-black/[0.06] focus-within:border-[#EAB776]/60 transition">
        {prefix && <span className="text-[10px] font-medium text-[#BBB] mr-0.5 select-none">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="w-full bg-transparent text-[13px] font-light tabular-nums text-[#1A1A1A] outline-none text-right"
        />
        {suffix && <span className="text-[10px] font-medium text-[#BBB] ml-0.5 select-none">{suffix}</span>}
      </div>
      <div className="text-[9px] text-[#BBB] mt-1 text-right">
        default {prefix ?? ""}
        {decimals > 0 ? defaultValue.toFixed(decimals) : Math.round(defaultValue)}
        {suffix ?? ""}
      </div>
    </div>
  );
};

// Single per-month editor row with a draft input + 4 action buttons.
const MonthField: React.FC<{
  label: string;
  sublabel?: string;
  prefix?: string;
  suffix?: string;
  step?: number;
  decimals?: number;
  defaultValue: number;
  override: number | null;
  monthIdx: number;
  monthsRemaining: number;
  onSetThis: (v: number) => void;
  onClearThis: () => void;
  onApplyFollowing: (v: number) => void;
  onCopyAll: (v: number) => void;
}> = ({
  label,
  sublabel,
  prefix,
  suffix,
  step = 1,
  decimals = 0,
  defaultValue,
  override,
  monthIdx,
  monthsRemaining,
  onSetThis,
  onClearThis,
  onApplyFollowing,
  onCopyAll,
}) => {
  const effective = override ?? defaultValue;
  // Local draft so the user can type freely; reset whenever the underlying
  // effective value changes (month switch, external edit, clear, etc.).
  const [draft, setDraft] = useState<string>(() =>
    Number.isFinite(effective) ? effective.toFixed(decimals) : "",
  );
  useEffect(() => {
    setDraft(Number.isFinite(effective) ? effective.toFixed(decimals) : "");
  }, [effective, decimals, monthIdx]);

  const parsed = (() => {
    const n = parseFloat(draft);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  })();
  const dirty = Math.abs(parsed - effective) > 1e-9;

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[#1A1A1A] truncate">{label}</div>
          {sublabel && <div className="text-[11px] text-[#999] mt-0.5">{sublabel}</div>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {override !== null ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#8A6540] bg-[#EAB776]/[0.14] border border-[#EAB776]/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]" />
              override
            </span>
          ) : (
            <span className="text-[10px] font-medium text-[#BBB] uppercase tracking-[0.12em]">using default</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-baseline rounded-lg px-3 py-2.5 bg-[#FAFAF8] border border-black/[0.08] focus-within:bg-white focus-within:border-[#EAB776]/60 transition w-[170px]">
          {prefix && <span className="text-xs font-medium text-[#999] mr-0.5 select-none">{prefix}</span>}
          <input
            type="number"
            inputMode="decimal"
            step={step}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full bg-transparent text-base font-light tabular-nums text-[#1A1A1A] outline-none text-right"
          />
          {suffix && <span className="text-xs font-medium text-[#999] ml-0.5 select-none">{suffix}</span>}
        </div>
        <span className="text-[11px] text-[#999]">
          default {prefix ?? ""}
          {decimals !== undefined ? defaultValue.toFixed(decimals) : Math.round(defaultValue)}
          {suffix ?? ""}
          {override !== null && (
            <>
              {" · "}
              <span className="text-[#8A6540] font-semibold">
                this month {prefix ?? ""}
                {decimals !== undefined ? override.toFixed(decimals) : Math.round(override)}
                {suffix ?? ""}
              </span>
            </>
          )}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!dirty}
          onClick={() => onSetThis(parsed)}
          className={`text-[11px] font-semibold px-3.5 py-1.5 rounded-full border transition ${
            dirty
              ? "text-white border-transparent shadow-sm hover:opacity-95"
              : "bg-[#FAFAF8] text-[#BBB] border-black/[0.06] cursor-not-allowed"
          }`}
          style={
            dirty
              ? { background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }
              : undefined
          }
        >
          Apply to this month
        </button>
        <button
          type="button"
          onClick={() => onApplyFollowing(parsed)}
          className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full border bg-white text-[#777] border-black/[0.08] hover:border-black/20 hover:text-[#1A1A1A] transition"
        >
          Apply to next {monthsRemaining} mo
        </button>
        <button
          type="button"
          onClick={() => onCopyAll(parsed)}
          className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full border bg-white text-[#777] border-black/[0.08] hover:border-black/20 hover:text-[#1A1A1A] transition"
        >
          Copy to all months
        </button>
        {override !== null && (
          <button
            type="button"
            onClick={onClearThis}
            className="text-[11px] font-semibold px-3.5 py-1.5 rounded-full border bg-white text-[#B18059] border-[#EAB776]/30 hover:bg-[#EAB776]/[0.08] transition ml-auto"
          >
            Clear override
          </button>
        )}
      </div>
    </div>
  );
};

const MonthlyExpenseCard: React.FC<{
  line: ExpenseLine;
  label: string;
  sublabel?: string;
  prefix?: string;
  suffix?: string;
  step?: number;
  decimals?: number;
  defaultValue: number;
  override: number | null;
  monthIdx: number;
  monthsRemaining: number;
  onSetThis: (v: number) => void;
  onClearThis: () => void;
  onApplyFollowing: (v: number) => void;
  onCopyAll: (v: number) => void;
  onRemove?: () => void;
}> = ({
  line,
  label,
  sublabel,
  prefix,
  suffix,
  step = 1,
  decimals = 0,
  defaultValue,
  override,
  monthIdx,
  monthsRemaining,
  onSetThis,
  onClearThis,
  onApplyFollowing,
  onCopyAll,
  onRemove,
}) => {
  const effective = override ?? defaultValue;
  const [draft, setDraft] = useState<string>(() =>
    Number.isFinite(effective) ? effective.toFixed(decimals) : "",
  );
  useEffect(() => {
    setDraft(Number.isFinite(effective) ? effective.toFixed(decimals) : "");
  }, [effective, decimals, monthIdx]);

  const parsed = (() => {
    const n = parseFloat(draft);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  })();
  const dirty = Math.abs(parsed - effective) > 1e-9;

  return (
    <div className="rounded-xl border border-black/[0.06] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[#1A1A1A] truncate">{label}</div>
          {sublabel && <div className="text-[10px] text-[#999] mt-0.5">{sublabel}</div>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {override !== null ? (
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8A6540] bg-[#EAB776]/[0.14] border border-[#EAB776]/30 px-1.5 py-0.5 rounded">
              override
            </span>
          ) : (
            <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#BBB]">
              base
            </span>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="text-[10px] text-[#BBB] hover:text-rose-600 transition"
              title="Remove custom line"
            >
              remove
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline rounded-lg px-3 py-2 bg-[#FAFAF8] border border-black/[0.08] focus-within:bg-white focus-within:border-[#EAB776]/60 transition">
        {prefix && <span className="text-xs font-medium text-[#999] mr-0.5 select-none">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full bg-transparent text-base font-light tabular-nums text-[#1A1A1A] outline-none text-right"
        />
        {suffix && <span className="text-xs font-medium text-[#999] ml-0.5 select-none">{suffix}</span>}
      </div>

      <div className="mt-2 text-[10px] text-[#AAA]">
        base {prefix ?? ""}
        {decimals !== undefined ? defaultValue.toFixed(decimals) : Math.round(defaultValue)}
        {suffix ?? ""}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          disabled={!dirty}
          onClick={() => onSetThis(parsed)}
          className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-full border transition ${
            dirty
              ? "text-white border-transparent shadow-sm hover:opacity-95"
              : "bg-[#FAFAF8] text-[#BBB] border-black/[0.06] cursor-not-allowed"
          }`}
          style={dirty ? { background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" } : undefined}
        >
          This month
        </button>
        <button
          type="button"
          onClick={() => onApplyFollowing(parsed)}
          className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full border bg-white text-[#777] border-black/[0.08] hover:border-black/20 hover:text-[#1A1A1A] transition"
        >
          From here
        </button>
        <button
          type="button"
          onClick={() => onCopyAll(parsed)}
          className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full border bg-white text-[#777] border-black/[0.08] hover:border-black/20 hover:text-[#1A1A1A] transition"
        >
          All months
        </button>
        <button
          type="button"
          disabled={override === null}
          onClick={onClearThis}
          className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-full border transition ${
            override !== null
              ? "bg-white text-[#B18059] border-[#EAB776]/30 hover:bg-[#EAB776]/[0.08]"
              : "bg-[#FAFAF8] text-[#CCC] border-black/[0.06] cursor-not-allowed"
          }`}
        >
          Reset
        </button>
      </div>

      {monthsRemaining > 1 && (
        <div className="mt-2 text-[9px] text-[#BBB] text-right">
          “From here” affects {monthsRemaining} months
        </div>
      )}
      {!line.protected && (
        <div className="mt-1 text-[9px] text-[#C8A076] text-right">
          custom line
        </div>
      )}
    </div>
  );
};

const AddExpenseLineForm: React.FC<{
  categories: string[];
  mode: "global" | "from-month";
  monthLabel?: string;
  onAdd: (input: { category: string; label: string; amount: number }) => void;
}> = ({ categories, mode, monthLabel, onAdd }) => {
  const [category, setCategory] = useState(categories[0] ?? CATEGORY_ADMIN);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!categories.includes(category)) setCategory(categories[0] ?? CATEGORY_ADMIN);
  }, [categories, category]);

  const parsedAmount = (() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  })();
  const canAdd = label.trim().length > 0 && parsedAmount > 0;
  const scopeLabel =
    mode === "from-month"
      ? `Starts from ${monthLabel ?? "this month"} forward`
      : "Applies to all months as a base expense";

  return (
    <div className="rounded-2xl border border-[#EAB776]/25 bg-[#EAB776]/[0.05] p-5">
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A6540]">
            Add role / expense
          </div>
          <div className="text-[11px] text-[#B18059]/80 mt-1">
            {scopeLabel}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)_160px_auto] gap-3 items-end">
        <label className="block">
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#999]">Category</div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-xl px-3 py-2.5 bg-white border border-black/[0.08] text-sm text-[#1A1A1A] outline-none focus:border-[#EAB776]/60"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#999]">Name</div>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Sales rep, Support agent, Office..."
            className="mt-2 w-full rounded-xl px-3 py-2.5 bg-white border border-black/[0.08] text-sm text-[#1A1A1A] outline-none focus:border-[#EAB776]/60"
          />
        </label>
        <label className="block">
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#999]">Monthly amount</div>
          <div className="mt-2 flex items-baseline rounded-xl px-3 py-2.5 bg-white border border-black/[0.08] focus-within:border-[#EAB776]/60">
            <span className="text-xs font-medium text-[#999] mr-0.5">$</span>
            <input
              type="number"
              inputMode="decimal"
              step={50}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-sm tabular-nums text-[#1A1A1A] outline-none text-right"
            />
          </div>
        </label>
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => {
            if (!canAdd) return;
            onAdd({ category, label: label.trim(), amount: parsedAmount });
            setLabel("");
            setAmount("");
          }}
          className={`text-[12px] font-semibold px-4 py-2.5 rounded-full border transition whitespace-nowrap ${
            canAdd
              ? "text-white border-transparent shadow-sm hover:opacity-95"
              : "bg-white/60 text-[#C9B9A4] border-[#EAB776]/20 cursor-not-allowed"
          }`}
          style={canAdd ? { background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" } : undefined}
        >
          {mode === "from-month" ? "Add from here" : "Add globally"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Side panel sub-components
// ─────────────────────────────────────────────────────────────────────

const PanelSection: React.FC<{
  number: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ number, title, description, children }) => (
  <section className="rounded-2xl bg-white border border-black/[0.06] shadow-sm p-6 sm:p-7">
    <div className="flex items-baseline gap-3 mb-5">
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-[11px] font-bold tabular-nums shadow-sm"
        style={{ background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)" }}
      >
        {number}
      </span>
      <div>
        <h3 className="text-lg font-medium text-[#1A1A1A] leading-tight">{title}</h3>
        {description && (
          <p className="text-[12px] text-[#999] leading-relaxed mt-1 max-w-2xl">
            {description}
          </p>
        )}
      </div>
    </div>
    <div>{children}</div>
  </section>
);

const FieldNumber: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  decimals?: number;
  hint?: string;
}> = ({ label, value, onChange, prefix, suffix, step = 1, decimals, hint }) => (
  <label className="block">
    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#999]">
      {label}
    </div>
    <div className="mt-2 flex items-baseline rounded-xl px-3.5 py-3 bg-[#FAFAF8] border border-black/[0.08] focus-within:bg-white focus-within:border-[#EAB776]/60 transition">
      {prefix && <span className="text-sm font-medium text-[#999] mr-0.5 select-none">{prefix}</span>}
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={
          Number.isFinite(value)
            ? decimals !== undefined
              ? Number(value.toFixed(decimals))
              : value
            : 0
        }
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className="w-full bg-transparent text-xl font-light tabular-nums text-[#1A1A1A] outline-none"
      />
      {suffix && <span className="text-sm font-medium text-[#999] ml-1 select-none">{suffix}</span>}
    </div>
    {hint && <div className="mt-1.5 text-[10px] text-[#BBB]">{hint}</div>}
  </label>
);

const DerivedRow: React.FC<{ label: string; value: string; note?: string }> = ({
  label,
  value,
  note,
}) => (
  <div className="mt-4 flex items-center justify-between flex-wrap gap-2 text-[12px] rounded-xl bg-[#EAB776]/[0.06] border border-[#EAB776]/20 px-4 py-3">
    <div>
      <span className="font-medium text-[#8A6540]">{label}</span>
      {note && <span className="text-[#B18059]/70 ml-2 text-[11px]">· {note}</span>}
    </div>
    <span className="font-medium tabular-nums text-[#1A1A1A]">{value}</span>
  </div>
);

const ExpenseLineEditor: React.FC<{
  line: ExpenseLine;
  state: BudgetState;
  onChange: (p: Partial<ExpenseLine>) => void;
  onChangeCampaignSpend?: (v: number) => void;
  onRemove?: () => void;
}> = ({ line, state, onChange, onChangeCampaignSpend, onRemove }) => {
  // Vertical card layout — fits cleanly in a 2- or 3-column grid.
  // Label / badge / sub-label on top, input pinned bottom.
  if (line.kind === "linkedCampaigns") {
    const cac = Math.max(1, state.growth.defaultCac);
    const fixedMandS = state.expenseLines
      .filter((l) => l.category === CATEGORY_MS && l.kind === "fixedUsd")
      .reduce((s, l) => s + Math.max(0, l.amount), 0);
    const totalMandS = state.growth.defaultCampaignSpend + fixedMandS;
    const newSubs = totalMandS / cac;
    return (
      <div className="flex flex-col h-full px-4 py-3.5 rounded-xl bg-[#FAFAF8] border border-black/[0.06] hover:border-black/[0.12] transition">
        <div className="flex items-start gap-2 flex-wrap min-h-[20px]">
          <div className="text-[13px] font-medium text-[#1A1A1A] leading-tight">{line.label}</div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#B18059] bg-[#EAB776]/[0.14] border border-[#EAB776]/30 px-1.5 py-0.5 rounded">
            drives growth
          </span>
        </div>
        <div className="text-[11px] text-[#999] mt-1 leading-snug">
          {dec1(newSubs)} new subs / mo from {money(totalMandS)} total M&S at {money(cac)} CAC
        </div>
        <div className="mt-3 flex items-baseline rounded-lg px-3 py-2 bg-white border border-black/[0.08] focus-within:border-[#EAB776]/60 transition">
          <span className="text-xs font-medium text-[#999] mr-0.5 select-none">$</span>
          <input
            type="number"
            inputMode="decimal"
            step={500}
            value={Number.isFinite(state.growth.defaultCampaignSpend) ? state.growth.defaultCampaignSpend : 0}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              onChangeCampaignSpend?.(Number.isFinite(n) ? Math.max(0, n) : 0);
            }}
            className="w-full bg-transparent text-base font-light tabular-nums text-[#1A1A1A] outline-none text-right"
          />
          <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[#BBB] select-none">/ mo</span>
        </div>
      </div>
    );
  }
  if (line.kind === "calculatedVat") {
    return (
      <div className="flex flex-col h-full px-4 py-3.5 rounded-xl bg-[#FAFAF8] border border-black/[0.06]">
        <div className="flex items-start gap-2 flex-wrap min-h-[20px]">
          <div className="text-[13px] font-medium text-[#1A1A1A] leading-tight">{line.label}</div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#777] bg-black/[0.04] border border-black/[0.08] px-1.5 py-0.5 rounded">
            calculated
          </span>
        </div>
        <div className="text-[11px] text-[#999] mt-1 leading-snug">
          {dec1(state.business.vatPct)}% × {int(state.business.israeliCustomers)} Israeli subs × ARPU
        </div>
        <div className="mt-3 px-3 py-2 rounded-lg bg-white/70 border border-black/[0.06] text-right text-[11px] text-[#999] italic">
          auto-calculated each month
        </div>
      </div>
    );
  }
  const isCalcUnit = line.kind === "calculatedTripleBundle";
  return (
    <div className="flex flex-col h-full px-4 py-3.5 rounded-xl bg-[#FAFAF8] border border-black/[0.06] hover:border-black/[0.12] transition">
      <div className="flex items-start gap-2 flex-wrap min-h-[20px]">
        <div className="text-[13px] font-medium text-[#1A1A1A] leading-tight">{line.label}</div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto text-[10px] text-[#BBB] hover:text-rose-600 transition"
          >
            remove
          </button>
        )}
        {isCalcUnit && (
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#777] bg-black/[0.04] border border-black/[0.08] px-1.5 py-0.5 rounded">
            per new sub
          </span>
        )}
      </div>
      {isCalcUnit ? (
        <div className="text-[11px] text-[#999] mt-1 leading-snug">USD × new subs / mo</div>
      ) : (
        <div className="text-[11px] text-[#BBB] mt-1 leading-snug">USD / month</div>
      )}
      <div className="mt-3 flex items-baseline rounded-lg px-3 py-2 bg-white border border-black/[0.08] focus-within:border-[#EAB776]/60 transition">
        <span className="text-xs font-medium text-[#999] mr-0.5 select-none">$</span>
        <input
          type="number"
          inputMode="decimal"
          step={isCalcUnit ? 1 : 50}
          value={Number.isFinite(line.amount) ? line.amount : 0}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            onChange({ amount: Number.isFinite(n) ? Math.max(0, n) : 0 });
          }}
          className="w-full bg-transparent text-base font-light tabular-nums text-[#1A1A1A] outline-none text-right"
        />
        {!isCalcUnit && (
          <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[#BBB] select-none">/ mo</span>
        )}
        {isCalcUnit && (
          <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[#BBB] select-none">/ sub</span>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Read-only spreadsheet components
// ─────────────────────────────────────────────────────────────────────

const SAVE_STATUS_COPY: Record<SaveStatus, { label: string; className: string }> = {
  loading: { label: "Loading DB state", className: "text-[#999] bg-white border-black/[0.06]" },
  saving: { label: "Saving to DB", className: "text-[#8A6540] bg-[#EAB776]/[0.1] border-[#EAB776]/25" },
  saved: { label: "Saved to DB", className: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  failed: { label: "Save failed", className: "text-rose-700 bg-rose-50 border-rose-100" },
  local: { label: "Local fallback", className: "text-[#777] bg-white border-black/[0.06]" },
};

const SaveStatusBadge: React.FC<{ status: SaveStatus }> = ({ status }) => {
  const meta = SAVE_STATUS_COPY[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium uppercase tracking-[0.12em] ${meta.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
};

const KPICard: React.FC<{
  label: string;
  value: string;
  sub?: string;
  accent?: "default" | "emerald" | "rose";
}> = ({ label, value, sub, accent = "default" }) => (
  <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm px-5 py-5">
    <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#999]">{label}</div>
    <div
      className={`mt-2 text-[26px] font-light tabular-nums leading-none ${
        accent === "emerald" ? "text-emerald-600" : accent === "rose" ? "text-rose-600" : "text-[#1A1A1A]"
      }`}
    >
      {value}
    </div>
    {sub && <div className="mt-1.5 text-[10px] uppercase tracking-[0.14em] text-[#BBB]">{sub}</div>}
  </div>
);

// Horizontal-scroll wrapper that never traps vertical wheel events.
// - If the user's wheel motion is mostly vertical, the scroll is forwarded
//   to the page (window) instead of being eaten by the inner overflow.
// - If the inner element has no horizontal overflow at all, every wheel
//   event passes straight through to the page.
// - Real horizontal scroll (deltaX, or shift+wheel) still works inside.
const ScrollXSafe: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;
      // No horizontal overflow → everything goes to the page.
      if (!hasOverflow) {
        e.preventDefault();
        window.scrollBy({ top: e.deltaY, left: 0 });
        return;
      }
      // There IS horizontal overflow.
      // Pure horizontal intent (shift+wheel, deltaX > deltaY) → let the
      // browser scroll the container horizontally (don't preventDefault).
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      // Anything mostly vertical → page scroll.
      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        window.scrollBy({ top: e.deltaY, left: 0 });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  return (
    <div ref={ref} className={`overflow-x-auto overflow-y-hidden ${className}`}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Trajectory chart — area + line composition with milestone markers
// ─────────────────────────────────────────────────────────────────────

interface TrajectoryDatum {
  label: string;
  subscribers: number;
  mrr: number;
  arr: number;
  ebitda: number;
}

const TrajectoryTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ payload?: TrajectoryDatum; value?: number; name?: string; color?: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload as TrajectoryDatum | undefined;
  if (!d) return null;
  const items: { name: string; value: string; color: string }[] = [
    { name: "MRR",         value: money(d.mrr),         color: "#EAB776" },
    { name: "ARR run-rate", value: money(d.arr),         color: "#B18059" },
    { name: "EBITDA",      value: money(d.ebitda),      color: d.ebitda >= 0 ? "#10b981" : "#f43f5e" },
    { name: "Subscribers", value: int(d.subscribers),   color: "#a78bfa" },
  ];
  return (
    <div
      className="rounded-xl bg-white/95 backdrop-blur-sm border border-black/[0.06] shadow-xl px-4 py-3 min-w-[200px]"
      style={{ boxShadow: "0 8px 24px rgba(26,26,26,0.08)" }}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#999] font-medium mb-2">
        {label}
      </div>
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.name} className="flex items-center justify-between gap-4 text-[12px]">
            <span className="inline-flex items-center gap-2 text-[#555]">
              <span className="w-2 h-2 rounded-full" style={{ background: it.color }} />
              {it.name}
            </span>
            <span className="tabular-nums font-medium text-[#1A1A1A]">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TrajectoryChart: React.FC<{
  data: TrajectoryDatum[];
  startingMrr: number;
  endingMrr: number;
  startingSubs: number;
  endingSubs: number;
  totalEbitda: number;
  finalArr: number;
}> = ({ data, startingMrr, endingMrr, startingSubs, endingSubs, totalEbitda, finalArr }) => {
  const last = data.length - 1;
  // Find first profitable month for the "breakeven" marker (if EBITDA crosses zero).
  const firstProfit = data.findIndex((d) => d.ebitda > 0);
  const breakevenIdx = firstProfit > 0 ? firstProfit : -1;
  const subsGrowthPct =
    startingSubs > 0 ? ((endingSubs - startingSubs) / startingSubs) * 100 : 0;
  const mrrGrowthPct =
    startingMrr > 0 ? ((endingMrr - startingMrr) / startingMrr) * 100 : 0;

  return (
    <>
      {/* Header bar with milestone KPIs */}
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <div className="flex items-baseline gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]/80" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#999]">
            Trajectory
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#BBB]">
          <span className="w-1 h-1 rounded-full bg-[#EAB776]/60" />
          MRR
          <span className="w-1 h-1 rounded-full bg-[#B18059] ml-3" />
          ARR
          <span className="w-1 h-1 rounded-full bg-emerald-500 ml-3" />
          EBITDA
          <span className="w-1 h-1 rounded-full bg-violet-400 ml-3" />
          Subscribers
        </div>
      </div>

      <div
        className="relative rounded-2xl overflow-hidden border border-black/[0.06] shadow-sm"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(234,183,118,0.08), transparent 55%), radial-gradient(ellipse at bottom left, rgba(16,185,129,0.05), transparent 55%), #FFFFFF",
        }}
      >
        {/* KPI strip across the top */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-black/[0.04]">
          <TrajectoryKpi
            label="Final ARR"
            value={money(finalArr)}
            sub={`${mrrGrowthPct >= 0 ? "+" : ""}${dec1(mrrGrowthPct)}% MRR over ${FORECAST_MONTHS} mo`}
            accent="#B18059"
          />
          <TrajectoryKpi
            label="Final MRR"
            value={money(endingMrr)}
            sub={`from ${money(startingMrr)} starting`}
            accent="#EAB776"
            divider
          />
          <TrajectoryKpi
            label={`EBITDA · ${FORECAST_MONTHS} mo`}
            value={money(totalEbitda)}
            sub={totalEbitda >= 0 ? "cumulative profit" : "cumulative burn"}
            accent={totalEbitda >= 0 ? "#10b981" : "#f43f5e"}
            divider
          />
          <TrajectoryKpi
            label="Subscribers"
            value={int(endingSubs)}
            sub={`${subsGrowthPct >= 0 ? "+" : ""}${dec1(subsGrowthPct)}% from ${int(startingSubs)}`}
            accent="#a78bfa"
            divider
          />
        </div>

        <div className="p-4 sm:p-6 pt-2">
          <div className="h-[22rem] sm:h-[26rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 16, right: 24, left: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="grad-mrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#EAB776" stopOpacity={0.55} />
                    <stop offset="60%"  stopColor="#EAB776" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#EAB776" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-ebitda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="60%"  stopColor="#10b981" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-subs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#a78bfa" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="#EEE" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="money"
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    Math.abs(v) >= 1_000_000
                      ? `$${(v / 1_000_000).toFixed(1)}M`
                      : Math.abs(v) >= 1000
                      ? `$${Math.round(v / 1000)}k`
                      : `$${v}`
                  }
                  width={56}
                />
                <YAxis
                  yAxisId="subs"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#a78bfa" }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                  tickFormatter={(v) => int(v)}
                />
                <Tooltip
                  content={<TrajectoryTooltip />}
                  cursor={{ stroke: "#EAB776", strokeOpacity: 0.4, strokeDasharray: "3 4" }}
                />

                {/* Zero line for EBITDA reference */}
                <ReferenceLine yAxisId="money" y={0} stroke="#E5E5E5" strokeDasharray="2 2" />

                {/* Subscribers — soft purple area on right axis */}
                <Area
                  yAxisId="subs"
                  type="monotone"
                  dataKey="subscribers"
                  name="Subscribers"
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  fill="url(#grad-subs)"
                  dot={false}
                  activeDot={{ r: 4, stroke: "#a78bfa", strokeWidth: 2, fill: "#fff" }}
                  isAnimationActive={false}
                />
                {/* EBITDA — emerald area */}
                <Area
                  yAxisId="money"
                  type="monotone"
                  dataKey="ebitda"
                  name="EBITDA"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#grad-ebitda)"
                  dot={false}
                  activeDot={{ r: 4, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
                  isAnimationActive={false}
                />
                {/* MRR — gold area, the hero of the chart */}
                <Area
                  yAxisId="money"
                  type="monotone"
                  dataKey="mrr"
                  name="MRR"
                  stroke="#EAB776"
                  strokeWidth={2.5}
                  fill="url(#grad-mrr)"
                  dot={false}
                  activeDot={{ r: 5, stroke: "#EAB776", strokeWidth: 2, fill: "#fff" }}
                  isAnimationActive={false}
                />
                {/* ARR — bold solid line above */}
                <Line
                  yAxisId="money"
                  type="monotone"
                  dataKey="arr"
                  name="ARR"
                  stroke="#B18059"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, stroke: "#B18059", strokeWidth: 2, fill: "#fff" }}
                  isAnimationActive={false}
                />

                {/* Start + end milestone dots on the MRR line */}
                <ReferenceDot
                  yAxisId="money"
                  x={data[0]?.label}
                  y={data[0]?.mrr ?? 0}
                  r={5}
                  fill="#fff"
                  stroke="#B18059"
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                />
                <ReferenceDot
                  yAxisId="money"
                  x={data[last]?.label}
                  y={data[last]?.arr ?? 0}
                  r={6}
                  fill="#B18059"
                  stroke="#fff"
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                  label={{
                    value: `ARR ${money(finalArr)}`,
                    position: "left",
                    offset: 12,
                    fill: "#B18059",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                {breakevenIdx > 0 && (
                  <ReferenceDot
                    yAxisId="money"
                    x={data[breakevenIdx]?.label}
                    y={data[breakevenIdx]?.ebitda ?? 0}
                    r={4}
                    fill="#10b981"
                    stroke="#fff"
                    strokeWidth={2}
                    ifOverflow="extendDomain"
                    label={{
                      value: "first profitable month",
                      position: "top",
                      offset: 10,
                      fill: "#10b981",
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
};

const TrajectoryKpi: React.FC<{
  label: string;
  value: string;
  sub: string;
  accent: string;
  divider?: boolean;
}> = ({ label, value, sub, accent, divider }) => (
  <div
    className={`px-5 py-4 sm:py-5 ${divider ? "border-l border-black/[0.04]" : ""}`}
  >
    <div className="flex items-center gap-1.5">
      <span className="w-1 h-1 rounded-full" style={{ background: accent }} />
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#999]">
        {label}
      </div>
    </div>
    <div
      className="mt-1.5 text-[22px] sm:text-[24px] font-light tabular-nums leading-none"
      style={{ color: accent }}
    >
      {value}
    </div>
    <div className="mt-1.5 text-[11px] text-[#999]">{sub}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────
// Half-year report sections — 4 stacked tables, one per half
// ─────────────────────────────────────────────────────────────────────

type ReportRowDef =
  | {
      kind: "row";
      label: string;
      subLabel?: string;
      values: number[];
      format: (n: number) => string;
      aggregator: "sum" | "last";
      strong?: boolean;
      tone?: "default" | "muted";
      accent?: "emerald" | "rose";
      indented?: boolean;
    }
  | { kind: "spacer" }
  | { kind: "categoryHeader"; label: string; tone?: "neutral" | "income" | "expense" }
  | { kind: "subtotal"; label: string; values: number[] }
  | { kind: "total"; label: string; values: number[] }
  | { kind: "ebitda"; label: string; values: number[] }
  | {
      kind: "categoryToggle";
      label: string;
      subtotalValues: number[];
      expanded: boolean;
      onToggle: () => void;
      lineCount: number;
    };

function aggregateRange(values: number[], start: number, end: number, aggregator: "sum" | "last"): number {
  if (aggregator === "last") return values[end - 1] ?? 0;
  let s = 0;
  for (let i = start; i < end; i++) s += values[i] ?? 0;
  return s;
}

function avgRange(values: number[], start: number, end: number): number {
  let s = 0;
  let n = 0;
  for (let i = start; i < end; i++) {
    s += values[i] ?? 0;
    n++;
  }
  return n > 0 ? s / n : 0;
}

type HalfYearSummaryTone = "positive" | "negative" | "neutral";

interface HalfYearSummaryKpi {
  label: string;
  value: string;
  sub: string;
  tone: HalfYearSummaryTone;
}

const HalfYearSection: React.FC<{
  half: { start: number; end: number; label: string; range: string };
  index: number;
  rows: ReportRowDef[];
  pills: { name: string; value: string }[];
  summaryKpis: HalfYearSummaryKpi[];
}> = ({ half, index, rows, pills, summaryKpis }) => {
  const months = MONTH_LABELS.slice(half.start, half.end);
  return (
    <div className="rounded-2xl bg-white border border-black/[0.06] shadow-sm overflow-hidden">
      {/* Half header — label, range, and the 3 working assumptions for this half */}
      <div className="px-6 sm:px-7 py-5 border-b border-black/[0.05] bg-gradient-to-br from-[#FAFAF8] to-white">
        <div className="flex items-baseline justify-between gap-4 mb-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B18059]">
              {half.label}
            </div>
            <div className="text-[18px] font-light text-[#1A1A1A] mt-1 tracking-[-0.005em]">
              {half.range}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[#BBB]">
            {half.label} · 6 months
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {pills.map((p) => (
            <div
              key={p.name}
              className="rounded-xl bg-white border border-black/[0.06] px-4 py-3"
            >
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#999]">
                {p.name}
              </div>
              <div className="mt-1 text-[16px] font-medium tabular-nums text-[#1A1A1A]">
                {p.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Single combined table for the half */}
      <ScrollXSafe>
        <table className="text-sm border-collapse w-full min-w-[820px]">
          <thead className="bg-[#FAFAF8]">
            <tr className="text-[10px] uppercase tracking-[0.14em] text-[#999] border-b border-black/[0.06]">
              <th className="text-left font-semibold px-5 py-2.5 w-[240px] min-w-[240px]">Metric</th>
              {months.map((m) => (
                <th key={m} className="text-right font-medium px-3 py-2.5">
                  {m}
                </th>
              ))}
              <th className="text-right font-bold px-3 py-2.5 w-[110px] min-w-[110px] bg-[#EAB776]/[0.07] text-[#8A6540] border-l border-[#EAB776]/30">
                {half.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <CardRow key={ri} row={row} half={half} />
            ))}
          </tbody>
        </table>
      </ScrollXSafe>

      {/* Bottom half-year KPI summary — minimal, restrained palette so it
          reads like a footer panel rather than a second hero. */}
      <div className="border-t border-black/[0.06] bg-white px-5 sm:px-7 py-5">
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <div className="flex items-baseline gap-3">
            <span className="w-1 h-1 rounded-full bg-[#CCC]" />
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#999]">
              {half.label} summary
            </div>
          </div>
          <div className="hidden sm:block text-[10px] uppercase tracking-[0.14em] text-[#CCC]">
            end of {half.range}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-x-px gap-y-px bg-black/[0.05] rounded-xl overflow-hidden border border-black/[0.06]">
          {summaryKpis.map((kpi) => (
            <HalfYearSummaryCard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      </div>
    </div>
  );
};

const HalfYearSummaryCard: React.FC<{ kpi: HalfYearSummaryKpi }> = ({ kpi }) => {
  // Single restrained palette: dark for positive / neutral, soft warm rose
  // only for negative. No filled green / red backgrounds — a thin left
  // marker carries the sign instead.
  const valueClass =
    kpi.tone === "negative" ? "text-[#A8534B]" : "text-[#1A1A1A]";
  const markerClass =
    kpi.tone === "positive"
      ? "bg-[#B18059]"
      : kpi.tone === "negative"
      ? "bg-[#C97B72]"
      : "bg-[#D6D2CC]";

  return (
    <div className="relative bg-white px-4 py-4 transition-colors hover:bg-[#FAFAF8]">
      <span
        className={`absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full ${markerClass}`}
        aria-hidden="true"
      />
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#999] truncate">
        {kpi.label}
      </div>
      <div className={`mt-2.5 text-[22px] font-extralight tabular-nums leading-none ${valueClass}`}>
        {kpi.value}
      </div>
      <div className="mt-2 text-[10px] leading-snug text-[#AAA]">
        {kpi.sub}
      </div>
    </div>
  );
};

const CardRow: React.FC<{ row: ReportRowDef; half: { start: number; end: number } }> = ({ row, half }) => {
  if (row.kind === "spacer") {
    return (
      <tr aria-hidden="true">
        <td colSpan={half.end - half.start + 2} className="h-3 bg-white" />
      </tr>
    );
  }
  if (row.kind === "categoryHeader") {
    const tone = row.tone ?? "neutral";
    const dot =
      tone === "income"
        ? "bg-emerald-500"
        : tone === "expense"
        ? "bg-[#EAB776]"
        : "bg-[#BBB]";
    const text =
      tone === "income"
        ? "text-emerald-700"
        : tone === "expense"
        ? "text-[#8A6540]"
        : "text-[#777]";
    const bg =
      tone === "income"
        ? "bg-emerald-50/40"
        : tone === "expense"
        ? "bg-[#EAB776]/[0.06]"
        : "bg-[#FAFAF8]";
    return (
      <tr className={`border-t border-black/[0.05] ${bg}`}>
        <td
          colSpan={half.end - half.start + 2}
          className={`pl-5 pr-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium ${text}`}
        >
          <span className="inline-flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {row.label}
          </span>
        </td>
      </tr>
    );
  }
  if (row.kind === "categoryToggle") {
    const slice = row.subtotalValues.slice(half.start, half.end);
    const halfSum = aggregateRange(row.subtotalValues, half.start, half.end, "sum");
    const isOpen = row.expanded;
    return (
      <tr
        onClick={row.onToggle}
        className={`border-t border-[#EAB776]/[0.12] cursor-pointer select-none transition-colors ${
          isOpen ? "bg-[#EAB776]/[0.04]" : "hover:bg-[#EAB776]/[0.05]"
        }`}
      >
        <td className="pl-5 pr-4 py-2.5 whitespace-nowrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              row.onToggle();
            }}
            className="inline-flex items-center gap-2.5 text-left"
            aria-expanded={isOpen}
          >
            <span
              className={`inline-flex items-center justify-center w-4 h-4 text-[10px] text-[#B18059] transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
              aria-hidden="true"
            >
              ▶
            </span>
            <span className="text-[12px] text-[#1A1A1A] font-medium">
              {row.label}
            </span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#BBB] font-medium">
              {isOpen ? "hide" : `${row.lineCount} line${row.lineCount === 1 ? "" : "s"}`}
            </span>
          </button>
        </td>
        {slice.map((v, i) => (
          <td key={i} className="px-3 py-2.5 text-right tabular-nums text-[#555] font-medium whitespace-nowrap">
            {money(v)}
          </td>
        ))}
        <td className="px-3 py-2.5 text-right tabular-nums text-[#8A6540] font-semibold bg-[#EAB776]/[0.08] whitespace-nowrap border-l border-[#EAB776]/25">
          {money(halfSum)}
        </td>
      </tr>
    );
  }
  if (row.kind === "subtotal") {
    const slice = row.values.slice(half.start, half.end);
    const halfSum = aggregateRange(row.values, half.start, half.end, "sum");
    return (
      <tr className="border-t border-black/[0.06] bg-[#FAFAF8]/60">
        <td className="pl-5 pr-4 py-2 text-[11px] text-[#1A1A1A] font-medium whitespace-nowrap">
          {row.label}
        </td>
        {slice.map((v, i) => (
          <td key={i} className="px-3 py-2 text-right tabular-nums text-[#1A1A1A] font-medium whitespace-nowrap">
            {money(v)}
          </td>
        ))}
        <td className="px-3 py-2 text-right tabular-nums text-[#8A6540] font-semibold bg-[#EAB776]/[0.08] whitespace-nowrap border-l border-[#EAB776]/25">
          {money(halfSum)}
        </td>
      </tr>
    );
  }
  if (row.kind === "total") {
    const slice = row.values.slice(half.start, half.end);
    const halfSum = aggregateRange(row.values, half.start, half.end, "sum");
    return (
      <tr className="border-t-2 border-[#EAB776]/30 bg-[#EAB776]/[0.05]">
        <td className="pl-5 pr-4 py-3 text-[#8A6540] font-medium whitespace-nowrap">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB776]" />
            {row.label}
          </span>
        </td>
        {slice.map((v, i) => (
          <td key={i} className="px-3 py-3 text-right tabular-nums text-[#1A1A1A] font-medium whitespace-nowrap">
            {money(v)}
          </td>
        ))}
        <td className="px-3 py-3 text-right tabular-nums text-[#8A6540] font-semibold bg-[#EAB776]/[0.14] whitespace-nowrap border-l border-[#EAB776]/30">
          {money(halfSum)}
        </td>
      </tr>
    );
  }
  if (row.kind === "ebitda") {
    const slice = row.values.slice(half.start, half.end);
    const halfSum = aggregateRange(row.values, half.start, half.end, "sum");
    const positiveAll = halfSum >= 0;
    return (
      <tr
        className={`border-t-2 ${
          positiveAll ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200 bg-rose-50/40"
        }`}
      >
        <td
          className={`pl-5 pr-4 py-3.5 font-medium whitespace-nowrap ${
            positiveAll ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${positiveAll ? "bg-emerald-500" : "bg-rose-500"}`}
            />
            {row.label}
          </span>
        </td>
        {slice.map((v, i) => (
          <td
            key={i}
            className={`px-3 py-3.5 text-right tabular-nums font-medium whitespace-nowrap ${
              v < 0 ? "text-rose-600" : "text-emerald-700"
            }`}
          >
            {money(v)}
          </td>
        ))}
        <td
          className={`px-3 py-3.5 text-right tabular-nums font-semibold whitespace-nowrap border-l ${
            positiveAll
              ? "text-emerald-700 bg-emerald-100/60 border-emerald-200"
              : "text-rose-700 bg-rose-100/60 border-rose-200"
          }`}
        >
          {money(halfSum)}
        </td>
      </tr>
    );
  }
  // kind === "row"
  const isIncome = row.accent === "emerald";
  const accentClass =
    row.accent === "emerald"
      ? row.tone === "muted"
        ? "text-emerald-600/60"
        : "text-emerald-700"
      : row.accent === "rose"
      ? "text-rose-600"
      : row.tone === "muted"
      ? "text-[#AAA]"
      : "text-[#555]";
  const labelClass = row.strong ? "text-[#1A1A1A] font-medium" : "text-[#666]";
  const slice = row.values.slice(half.start, half.end);
  const halfTotal = aggregateRange(row.values, half.start, half.end, row.aggregator);
  // Income rows get a faint emerald tint on hover and the half-total cell.
  const halfTotalCell = isIncome
    ? `${row.tone === "muted" ? "text-emerald-700/70" : "text-emerald-700"} bg-emerald-50/60 border-l border-emerald-100`
    : `text-[#8A6540] ${row.strong ? "font-semibold" : "font-medium"} bg-[#EAB776]/[0.07] border-l border-[#EAB776]/25`;
  const rowHover = isIncome ? "hover:bg-emerald-50/40" : "hover:bg-[#EAB776]/[0.04]";
  return (
    <tr className={`border-t border-black/[0.04] transition-colors ${rowHover}`}>
      <td
        className={`${row.indented ? "pl-9" : "pl-5"} pr-4 py-2.5 text-[13px] whitespace-nowrap ${labelClass}`}
      >
        <div>{row.label}</div>
        {row.subLabel && <div className="text-[10px] text-[#BBB] mt-0.5">{row.subLabel}</div>}
      </td>
      {slice.map((v, i) => (
        <td key={i} className={`px-3 py-2.5 text-right tabular-nums whitespace-nowrap ${accentClass}`}>
          {row.format(v)}
        </td>
      ))}
      <td className={`px-3 py-2.5 text-right tabular-nums whitespace-nowrap ${halfTotalCell}`}>
        {row.format(halfTotal)}
      </td>
    </tr>
  );
};

export default FinancialForecastPage;

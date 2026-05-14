// ─────────────────────────────────────────────────────────────────────
// FinancialModelDrawer
//
// Collapsible 72-month audit drawer used inside the investor deck's
// Growth Model section. Renders the rows produced by
// `generateFinancialModelRows` so the chart, KPI cards, and the
// drawer always read from the same StrategicForecast-generated model.
//
// UX requirements (see plan):
//   - Collapsed by default
//   - Toolbar: Full 72 months / First 36 months / Export CSV
//   - Sticky left columns (Section, Metric, Formula / Assumption)
//   - Internal horizontal scroll only — does not blow up the page
//   - Tabular monospace digits, emphasized totals, muted negative cells
// ─────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";
import {
  formatCell,
  formatCurrencyShort,
  formatNumber,
  formatPercent,
} from "../StrategicForecast";
import type {
  FinancialModelBundle,
  FinancialModelRow,
} from "../StrategicForecast";

type DrawerTheme = "dark" | "light";

interface FinancialModelDrawerProps {
  model: FinancialModelBundle;
  /**
   * Optional override label / subtitle so the parent component can
   * customize the trigger row.
   */
  triggerLabel?: string;
  triggerSecondary?: string;
  /** Default expanded state. Defaults to false. */
  defaultOpen?: boolean;
  /** Visual theme — `dark` for the investor deck, `light` for the
   * strategic-forecast editor page. Defaults to `dark`. */
  theme?: DrawerTheme;
  /** When false, hides the 36/72-month toggle and locks the table to
   * the full 72-month horizon. Defaults to true. */
  showRangeToggle?: boolean;
}

type RangeMode = "y6" | "y3";

const ACCENT = "#EAB776";

interface ThemeTokens {
  shell: string;
  triggerHover: string;
  badgeBorder: string;
  disclaimerWrap: string;
  disclaimerText: string;
  toolbarBg: string;
  toolbarBorder: string;
  toolbarBtnIdle: string;
  toolbarBtnActive: string;
  toolbarBtnInactive: string;
  csvBtn: string;
  tableText: string;
  tableHeadBg: string;
  tableHeadText: string;
  tableHeadSubText: string;
  tableHeadStickyBg: string;
  rowEven: string;
  rowOdd: string;
  rowEvenSticky: string;
  rowOddSticky: string;
  rowDivider: string;
  emphasizeRow: string;
  metricText: string;
  metaText: string;
  sectionRowBg: string;
  sectionRowText: string;
  triggerTitle: string;
  triggerSubtitle: string;
  caret: string;
  negativeCell: string;
}

const DARK_TOKENS: ThemeTokens = {
  shell: "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-lg overflow-hidden",
  triggerHover: "hover:bg-white/[0.02]",
  badgeBorder: "border-white/10",
  disclaimerWrap: "border-b border-white/10 bg-black/30",
  disclaimerText: "text-gray-400",
  toolbarBg: "bg-white/[0.02]",
  toolbarBorder: "border-b border-white/10",
  toolbarBtnIdle: "border-white/10 bg-black/30",
  toolbarBtnActive: "bg-white/10 text-white",
  toolbarBtnInactive: "text-gray-400 hover:text-gray-200",
  csvBtn: "border-[#EAB776]/30 bg-[#EAB776]/10 text-[#EAB776] hover:bg-[#EAB776]/20",
  tableText: "text-gray-300",
  tableHeadBg: "bg-black/40",
  tableHeadText: "text-gray-400",
  tableHeadSubText: "text-gray-600",
  tableHeadStickyBg: "rgba(0,0,0,0.85)",
  rowEven: "bg-white/[0.015]",
  rowOdd: "bg-transparent",
  rowEvenSticky: "rgba(255,255,255,0.015)",
  rowOddSticky: "rgba(0,0,0,0.4)",
  rowDivider: "border-white/[0.06]",
  emphasizeRow: "bg-white/[0.045] font-semibold text-white",
  metricText: "text-gray-200",
  metaText: "text-gray-500",
  sectionRowBg: "bg-[#EAB776]/[0.06]",
  sectionRowText: "text-[#EAB776]",
  triggerTitle: "text-white",
  triggerSubtitle: "text-gray-500",
  caret: "text-gray-500",
  negativeCell: "text-amber-300/70",
};

const LIGHT_TOKENS: ThemeTokens = {
  shell: "rounded-2xl border border-black/[0.06] bg-white shadow-sm overflow-hidden",
  triggerHover: "hover:bg-[#FAFAF8]",
  badgeBorder: "border-black/[0.06]",
  disclaimerWrap: "border-b border-black/[0.06] bg-[#FAFAF8]",
  disclaimerText: "text-[#666]",
  toolbarBg: "bg-[#FAFAF8]",
  toolbarBorder: "border-b border-black/[0.06]",
  toolbarBtnIdle: "border-black/[0.08] bg-white",
  toolbarBtnActive: "bg-[#1A1A1A] text-white",
  toolbarBtnInactive: "text-[#666] hover:text-[#1A1A1A]",
  csvBtn: "border-[#B18059]/40 bg-[#EAB776]/15 text-[#8A6540] hover:bg-[#EAB776]/25",
  tableText: "text-[#333]",
  tableHeadBg: "bg-[#FAFAF8]",
  tableHeadText: "text-[#888]",
  tableHeadSubText: "text-[#BBB]",
  tableHeadStickyBg: "#FAFAF8",
  rowEven: "bg-[#FCFBF8]",
  rowOdd: "bg-white",
  rowEvenSticky: "#FCFBF8",
  rowOddSticky: "#FFFFFF",
  rowDivider: "border-black/[0.04]",
  emphasizeRow: "bg-[#EAB776]/[0.08] font-semibold text-[#1A1A1A]",
  metricText: "text-[#1A1A1A]",
  metaText: "text-[#888]",
  sectionRowBg: "bg-[#EAB776]/[0.12]",
  sectionRowText: "text-[#8A6540]",
  triggerTitle: "text-[#1A1A1A]",
  triggerSubtitle: "text-[#888]",
  caret: "text-[#888]",
  negativeCell: "text-[#B45309]",
};

/** Format a value for the audit cell, returning short currency for the
 * monthly table (so columns stay narrow) and numbers/percents in full. */
function formatAuditCell(value: number, format: FinancialModelRow["format"]): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) < 0.5 && format === "currency") return "$0";
  if (Math.abs(value) < 0.5 && format === "number") return "0";
  switch (format) {
    case "currency":
      return formatCurrencyShort(value);
    case "number":
      return formatNumber(value);
    case "percent":
      return formatPercent(value);
    default:
      return formatCell(value, format);
  }
}

function escapeCsv(value: string | number): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function exportRowsToCsv(
  rows: FinancialModelRow[],
  monthLabels: string[],
  monthsCount: number,
): void {
  const header = ["Section", "Metric", "Formula / Assumption", ...monthLabels.slice(0, monthsCount).map((label, i) => `M${i + 1} · ${label}`)];
  const lines: string[] = [header.map(escapeCsv).join(",")];
  for (const row of rows) {
    const cells = [row.section, row.metric, row.formula];
    for (let i = 0; i < monthsCount; i++) {
      const v = row.values[i] ?? 0;
      cells.push(Number.isFinite(v) ? Math.round(v).toString() : "0");
    }
    lines.push(cells.map(escapeCsv).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "spectra-financial-model-72-months.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const FinancialModelDrawer: React.FC<FinancialModelDrawerProps> = ({
  model,
  triggerLabel = "View full 72-month financial model",
  triggerSecondary = "Monthly SaaS, AI, POS, customer acquisition, costs, EBITDA and cash balance",
  defaultOpen = false,
  theme = "dark",
  showRangeToggle = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [range, setRange] = useState<RangeMode>("y6");
  // Section column collapsed by default; user can expand it from a small
  // chevron in the leftmost header cell. The section name is still visible
  // as a header row above each section group, so collapsing keeps a clean
  // table without losing context.
  const [sectionVisible, setSectionVisible] = useState(false);
  const t = theme === "light" ? LIGHT_TOKENS : DARK_TOKENS;

  const effectiveRange: RangeMode = showRangeToggle ? range : "y6";
  const monthsCount = effectiveRange === "y6" ? model.months.length : Math.min(36, model.months.length);

  // Sticky offsets shift when the Section column is hidden so Metric +
  // Formula slide left into the freed space.
  const SECTION_W = 160;
  const METRIC_W = 220;
  const FORMULA_W = 240;
  const metricLeft = sectionVisible ? SECTION_W : 0;
  const formulaLeft = sectionVisible ? SECTION_W + METRIC_W : METRIC_W;

  // Group rows by section for sticky section labels.
  const grouped = useMemo(() => {
    const groups: { section: string; rows: FinancialModelRow[] }[] = [];
    for (const row of model.rows) {
      const last = groups[groups.length - 1];
      if (!last || last.section !== row.section) {
        groups.push({ section: row.section, rows: [row] });
      } else {
        last.rows.push(row);
      }
    }
    return groups;
  }, [model.rows]);

  return (
    <div className={`mt-8 sm:mt-10 ${t.shell}`}>
      {/* ── Trigger row ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 text-left transition-colors ${t.triggerHover}`}
        aria-expanded={open}
      >
        <div>
          <p className={`text-sm sm:text-base font-semibold ${t.triggerTitle}`}>
            {triggerLabel}
          </p>
          <p className={`text-xs sm:text-sm mt-0.5 ${t.triggerSubtitle}`}>
            {triggerSecondary}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.16em]"
            style={{ borderColor: `${ACCENT}55`, color: theme === "light" ? "#8A6540" : ACCENT, background: `${ACCENT}1A` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
            Audit Layer
          </span>
          <span
            className={`text-xl transition-transform duration-200 ${t.caret} ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            ⌄
          </span>
        </div>
      </button>

      {open && (
        <div className={theme === "light" ? "border-t border-black/[0.06]" : "border-t border-white/10"}>
          {/* Disclaimer */}
          <div className={`px-5 sm:px-7 py-3 ${t.disclaimerWrap}`}>
            <p className={`text-[11px] sm:text-xs leading-relaxed ${t.disclaimerText}`}>
              Model scenario based on current assumptions. Excludes manual DB overrides unless
              connected later. Not a guarantee of future performance.
            </p>
          </div>

          {/* Toolbar */}
          <div className={`flex flex-wrap items-center justify-between gap-3 px-5 sm:px-7 py-3 ${t.toolbarBorder} ${t.toolbarBg}`}>
            {showRangeToggle ? (
              <div className={`inline-flex rounded-lg border p-1 text-xs ${t.toolbarBtnIdle}`}>
                <button
                  type="button"
                  onClick={() => setRange("y6")}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    range === "y6" ? t.toolbarBtnActive : t.toolbarBtnInactive
                  }`}
                >
                  Full 72 months
                </button>
                <button
                  type="button"
                  onClick={() => setRange("y3")}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    range === "y3" ? t.toolbarBtnActive : t.toolbarBtnInactive
                  }`}
                >
                  First 36 months
                </button>
              </div>
            ) : (
              <div className={`text-[11px] uppercase tracking-[0.16em] ${t.metaText}`}>
                Full 72 months · monthly resolution
              </div>
            )}
            <button
              type="button"
              onClick={() => exportRowsToCsv(model.rows, model.forecast.monthLabels, monthsCount)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${t.csvBtn}`}
            >
              <span aria-hidden>⤓</span>
              Export CSV
            </button>
          </div>

          {/* Audit table */}
          <div className="relative">
            <div
              className="overflow-x-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <table
                className={`w-full text-xs border-collapse ${t.tableText}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <thead>
                  <tr className={`text-[10px] uppercase tracking-[0.14em] ${t.tableHeadBg} ${t.tableHeadText}`}>
                    {sectionVisible && (
                      <th
                        scope="col"
                        className={`text-left font-semibold px-3 py-2 border-b ${t.rowDivider}`}
                        style={{ position: "sticky", left: 0, zIndex: 3, background: t.tableHeadStickyBg, minWidth: SECTION_W }}
                      >
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSectionVisible(false)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded border ${t.toolbarBtnIdle} ${t.toolbarBtnInactive} text-[14px] leading-none`}
                            title="Hide section column"
                            aria-label="Hide section column"
                          >
                            ‹
                          </button>
                          Section
                        </div>
                      </th>
                    )}
                    <th
                      scope="col"
                      className={`text-left font-semibold px-3 py-2 border-b ${t.rowDivider}`}
                      style={{ position: "sticky", left: metricLeft, zIndex: 3, background: t.tableHeadStickyBg, minWidth: METRIC_W }}
                    >
                      <div className="inline-flex items-center gap-2">
                        {!sectionVisible && (
                          <button
                            type="button"
                            onClick={() => setSectionVisible(true)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded border ${t.toolbarBtnIdle} ${t.toolbarBtnInactive} text-[14px] leading-none`}
                            title="Show section column"
                            aria-label="Show section column"
                          >
                            ›
                          </button>
                        )}
                        Metric
                      </div>
                    </th>
                    <th
                      scope="col"
                      className={`text-left font-semibold px-3 py-2 border-b ${t.rowDivider}`}
                      style={{ position: "sticky", left: formulaLeft, zIndex: 3, background: t.tableHeadStickyBg, minWidth: FORMULA_W }}
                    >
                      Formula / Assumption
                    </th>
                    {Array.from({ length: monthsCount }).map((_, i) => (
                      <th
                        key={i}
                        scope="col"
                        className={`text-right font-semibold px-2 py-2 border-b whitespace-nowrap ${t.rowDivider}`}
                        style={{ minWidth: 88 }}
                      >
                        <div className={t.tableHeadText}>M{i + 1}</div>
                        <div className={`text-[9px] ${t.tableHeadSubText}`}>
                          {model.forecast.monthLabels[i] ?? ""}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((group, gi) => (
                    <React.Fragment key={`${group.section}-${gi}`}>
                      {/* Section divider row */}
                      <tr className={t.sectionRowBg}>
                        <td
                          colSpan={(sectionVisible ? 3 : 2) + monthsCount}
                          className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] border-b ${t.rowDivider} ${t.sectionRowText}`}
                          style={{ position: "sticky", left: 0, zIndex: 2 }}
                        >
                          {group.section}
                        </td>
                      </tr>
                      {group.rows.map((row, ri) => {
                        const rowBg = ri % 2 === 0 ? t.rowEven : t.rowOdd;
                        const emphasize = row.emphasize ? t.emphasizeRow : "";
                        const stickyBg = ri % 2 === 0 ? t.rowEvenSticky : t.rowOddSticky;
                        return (
                          <tr key={`${gi}-${ri}`} className={`${rowBg} ${emphasize}`}>
                            {sectionVisible && (
                              <td
                                className={`px-3 py-1.5 border-b text-[11px] ${t.rowDivider} ${t.metaText}`}
                                style={{ position: "sticky", left: 0, zIndex: 1, background: stickyBg, minWidth: SECTION_W }}
                              >
                                {row.section}
                              </td>
                            )}
                            <td
                              className={`px-3 py-1.5 border-b whitespace-nowrap ${t.rowDivider} ${t.metricText}`}
                              style={{ position: "sticky", left: metricLeft, zIndex: 1, background: stickyBg, minWidth: METRIC_W }}
                            >
                              {row.metric}
                            </td>
                            <td
                              className={`px-3 py-1.5 border-b text-[11px] ${t.rowDivider} ${t.metaText}`}
                              style={{ position: "sticky", left: formulaLeft, zIndex: 1, background: stickyBg, minWidth: FORMULA_W }}
                            >
                              {row.formula}
                            </td>
                            {Array.from({ length: monthsCount }).map((_, i) => {
                              const v = row.values[i] ?? 0;
                              const negative = Number.isFinite(v) && v < -0.5;
                              return (
                                <td
                                  key={i}
                                  className={`px-2 py-1.5 text-right border-b whitespace-nowrap ${t.rowDivider} ${
                                    negative ? t.negativeCell : ""
                                  }`}
                                  style={{ minWidth: 88 }}
                                >
                                  {formatAuditCell(v, row.format)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

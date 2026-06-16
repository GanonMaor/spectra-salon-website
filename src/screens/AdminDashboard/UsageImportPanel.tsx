import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Loader2,
  RefreshCw,
  Calendar,
  Users as UsersIcon,
  Package,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Target,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  commitUsageImport,
  deleteUsageImport,
  fetchSnapshot,
  formatBytes,
  listUsageImports,
  previewUsageImport,
  rebuildSnapshot,
} from "../../lib/usageImportClient";
import type {
  ImportPreviewResponse,
  ImportRecord,
  ImportWarning,
  SnapshotResponse,
} from "../../lib/types/usageImport";
import type { UsageResolutionSummary } from "../../lib/types/productTruth";
import { resolveImportProducts } from "../../lib/product-truth/usageResolverClient";

interface ThemeTokens {
  card: string;
  border: string;
  borderMed: string;
  text90: string;
  textPrimary: string;
  textSec: string;
  textMuted: string;
  textFaint: string;
  input: string;
  select: string;
  filterInactive: string;
  rowDivide: string;
  rowHover: string;
  subCard: string;
}

interface Props {
  isDark: boolean;
  at: ThemeTokens;
}

const MONTH_OPTIONS = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
];

const SEVERITY_STYLE: Record<ImportWarning["severity"], { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-500/15 border-red-500/30", text: "text-red-400", label: "Critical" },
  high: { bg: "bg-orange-500/15 border-orange-500/30", text: "text-orange-400", label: "High" },
  medium: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", label: "Medium" },
  low: { bg: "bg-yellow-500/15 border-yellow-500/30", text: "text-yellow-400", label: "Low" },
  info: { bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-400", label: "Info" },
};

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  committed:    { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", label: "Ready"        },
  superseded:   { bg: "bg-gray-500/15   border-gray-500/30",    text: "text-gray-400",    label: "Superseded"   },
  failed:       { bg: "bg-red-500/15    border-red-500/30",     text: "text-red-400",     label: "Failed"       },
  // Product Truth lifecycle statuses (for future use)
  uploaded:     { bg: "bg-blue-500/15   border-blue-500/30",    text: "text-blue-400",    label: "Uploaded"     },
  parsing:      { bg: "bg-yellow-500/15 border-yellow-500/30",  text: "text-yellow-400",  label: "Parsing"      },
  resolving:    { bg: "bg-violet-500/15 border-violet-500/30",  text: "text-violet-400",  label: "Resolving"    },
  needs_review: { bg: "bg-orange-500/15 border-orange-500/30",  text: "text-orange-400",  label: "Needs Review" },
  ready:        { bg: "bg-emerald-500/15 border-emerald-500/30",text: "text-emerald-400", label: "Ready"        },
  reprocessing: { bg: "bg-indigo-500/15 border-indigo-500/30",  text: "text-indigo-400",  label: "Reprocessing" },
};

const UPDATED_SURFACES = [
  { label: "Market Intelligence", href: "/market-intelligence" },
  { label: "L'Oréal Analytics", href: "/loreal-analytics" },
  { label: "Admin Usage Cohorts", href: "/admin" },
  { label: "HairGPT (uses live dataset)", href: "/hairgpt" },
];

function defaultMonth(): { month: string; year: number } {
  const d = new Date();
  d.setMonth(d.getMonth() - 1); // last full month by default
  return {
    month: MONTH_OPTIONS[d.getMonth()].value,
    year: d.getFullYear(),
  };
}

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function WarningBadge({ w }: { w: ImportWarning }) {
  const s = SEVERITY_STYLE[w.severity] || SEVERITY_STYLE.info;
  return (
    <div className={`px-3 py-2 rounded-lg border ${s.bg} text-xs`}>
      <div className="flex items-center gap-2 mb-0.5">
        <AlertTriangle className={`w-3.5 h-3.5 ${s.text}`} />
        <span className={`font-medium ${s.text}`}>{s.label}</span>
        <span className="opacity-50">·</span>
        <span className="opacity-70 font-mono text-[10px]">{w.code}</span>
      </div>
      <p className="opacity-80 leading-snug">{w.message}</p>
    </div>
  );
}

export const UsageImportPanel: React.FC<Props> = ({ isDark, at }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const initial = useMemo(() => defaultMonth(), []);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState<number>(initial.year);
  const [importMode, setImportMode] = useState<"monthly" | "multiMonth">("monthly");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [commitLoading, setCommitLoading] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [committedAt, setCommittedAt] = useState<string | null>(null);
  const [history, setHistory] = useState<ImportRecord[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotResponse | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [forceCommit, setForceCommit] = useState(false);
  const [notes, setNotes] = useState("");
  // ── Product Truth resolution metrics ──
  const [resolutionSummary, setResolutionSummary] = useState<UsageResolutionSummary | null>(null);
  const [resolutionLoading, setResolutionLoading] = useState(false);
  const [resolutionImportId, setResolutionImportId] = useState<number | null>(null);

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const rows = await listUsageImports();
      setHistory(rows);
    } catch (e: any) {
      setHistoryError(e?.message || "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const refreshSnapshot = useCallback(async () => {
    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      const snap = await fetchSnapshot();
      setSnapshot(snap);
    } catch (e: any) {
      setSnapshotError(e?.message || "Snapshot unavailable");
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  const fetchResolutionMetrics = useCallback(async (importId: number) => {
    setResolutionLoading(true);
    setResolutionImportId(importId);
    try {
      const result = await resolveImportProducts(importId);
      setResolutionSummary(result.summary);
    } catch {
      // Graceful: resolution pipeline not yet fully connected
      setResolutionSummary(null);
    } finally {
      setResolutionLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
    refreshSnapshot();
  }, [refreshHistory, refreshSnapshot]);

  const handleFile = useCallback(
    async (selected: File | null) => {
      setFile(selected);
      setPreview(null);
      setCommittedAt(null);
      setPreviewError(null);
      setCommitError(null);
      if (!selected) return;
      if (!/\.xlsx?$/i.test(selected.name)) {
        setPreviewError("Please upload an .xlsx file.");
        return;
      }
      setPreviewLoading(true);
      try {
        const res = await previewUsageImport({
          file: selected,
          month: importMode === "monthly" ? month : undefined,
          year,
          multiMonth: importMode === "multiMonth",
        });
        setPreview(res);
      } catch (e: any) {
        setPreviewError(e?.message || "Preview failed");
      } finally {
        setPreviewLoading(false);
      }
    },
    [importMode, month, year],
  );

  // Re-run preview when month/year change after a file is selected
  useEffect(() => {
    if (file && !commitLoading) {
      handleFile(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importMode, month, year]);

  const handleCommit = useCallback(async () => {
    if (!file || !preview) return;
    setCommitLoading(true);
    setCommitError(null);
    try {
      const res = await commitUsageImport({
        file,
        month,
        year,
        multiMonth: importMode === "multiMonth",
        force: forceCommit,
        notes: notes.trim() || undefined,
        createdBy: "admin",
      });
      setCommittedAt(new Date().toISOString());
      setNotes("");
      setForceCommit(false);
      // Show fresh state
      await Promise.all([refreshHistory(), refreshSnapshot()]);
    } catch (e: any) {
      setCommitError(e?.message || "Commit failed");
    } finally {
      setCommitLoading(false);
    }
  }, [file, preview, importMode, month, year, forceCommit, notes, refreshHistory, refreshSnapshot]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm(`Delete import #${id}? This will rebuild the snapshot from remaining imports + bundled reports.`)) {
        return;
      }
      try {
        await deleteUsageImport(id);
        await Promise.all([refreshHistory(), refreshSnapshot()]);
      } catch (e: any) {
        setHistoryError(e?.message || "Delete failed");
      }
    },
    [refreshHistory, refreshSnapshot],
  );

  const handleRebuild = useCallback(async () => {
    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      await rebuildSnapshot();
      await refreshSnapshot();
    } catch (e: any) {
      setSnapshotError(e?.message || "Rebuild failed");
    } finally {
      setSnapshotLoading(false);
    }
  }, [refreshSnapshot]);

  const hasBlocking = preview?.warnings.some((w) => w.severity === "critical") || false;
  const canCommit = !!file && !!preview && (preview.canCommit || forceCommit) && !commitLoading;

  const summaryRow = (label: string, value: string | number, hint?: string) => (
    <div className={`${at.subCard} rounded-xl border p-3`}>
      <p className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}>{label}</p>
      <p className={`text-lg font-semibold mt-0.5 ${at.textPrimary}`}>{value}</p>
      {hint ? <p className={`text-[10px] ${at.textMuted} mt-0.5`}>{hint}</p> : null}
    </div>
  );

  const monthOptions = MONTH_OPTIONS;
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const years: number[] = [];
    for (let y = 2022; y <= current + 1; y++) years.push(y);
    return years;
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Snapshot status banner ── */}
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${at.subCard}`}>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className={`text-sm font-medium ${at.text90}`}>
            Live snapshot
          </span>
        </div>
        <span className={`text-xs ${at.textMuted}`}>
          {snapshotLoading
            ? "Loading…"
            : snapshot
              ? `Generated ${formatDate(snapshot.generatedAt)} · ${snapshot.summary.totalMonths} months · ${snapshot.summary.totalCustomers} customers · ${snapshot.summary.totalServices.toLocaleString()} services`
              : snapshotError || "No snapshot yet — commit an import to build one."}
        </span>
        <button
          onClick={handleRebuild}
          disabled={snapshotLoading}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${at.filterInactive}`}
          title="Rebuild from existing imports + bundled reports"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${snapshotLoading ? "animate-spin" : ""}`} />
          Rebuild snapshot
        </button>
      </div>

      {/* ── Product Truth Resolution Quality ── */}
      <div className={`rounded-2xl border ${at.card} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${at.border} flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <h3 className={`text-sm font-semibold ${at.textPrimary}`}>Product Truth Resolution</h3>
          </div>
          {resolutionSummary && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
              ${resolutionSummary.resolutionRate >= 90 ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25"
                : resolutionSummary.resolutionRate >= 70 ? "text-yellow-400 bg-yellow-500/10 border border-yellow-500/25"
                : "text-red-400 bg-red-500/10 border border-red-500/25"}`}>
              {resolutionSummary.resolutionRate}% resolved
            </span>
          )}
        </div>
        <div className="p-4">
          {!resolutionSummary && !resolutionLoading ? (
            <div className="space-y-2">
              <p className={`text-sm ${at.textMuted}`}>
                Click <strong className={at.textSec}>Resolve</strong> on any committed import below to see how its product names map to the canonical Product Truth catalog.
              </p>
              <p className={`text-xs ${at.textFaint}`}>
                Resolution shows: auto-resolved · alias-resolved · suggested matches · unresolved items routed to Review Queue.
              </p>
            </div>
          ) : resolutionLoading ? (
            <div className={`flex items-center gap-2 text-sm ${at.textMuted}`}>
              <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
              Resolving import #{resolutionImportId} against Product Truth…
            </div>
          ) : resolutionSummary ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {[
                  { label: "Total Rows",       value: resolutionSummary.totalUsageRows.toLocaleString(),          color: at.textPrimary },
                  { label: "Unique Products",  value: resolutionSummary.uniqueRawProductNames.toLocaleString(),   color: at.textSec },
                  { label: "Auto-Resolved",    value: resolutionSummary.resolvedAuto.toLocaleString(),            color: "text-emerald-400" },
                  { label: "Via Alias",        value: resolutionSummary.resolvedAlias.toLocaleString(),           color: "text-blue-400" },
                  { label: "Suggested",        value: resolutionSummary.suggestedMatches.toLocaleString(),        color: "text-yellow-400" },
                  { label: "Unresolved",       value: resolutionSummary.unresolvedUsageRows.toLocaleString(),     color: "text-red-400" },
                  { label: "Canonical IDs",    value: resolutionSummary.uniqueCanonicalProducts.toLocaleString(), color: "text-violet-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`${at.subCard} rounded-xl border ${at.border} p-3`}>
                    <p className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}>{label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
              {(resolutionSummary.suggestedMatches > 0 || resolutionSummary.unresolvedUsageRows > 0) && (
                <div className={`flex items-center gap-2 rounded-lg border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-xs text-orange-300`}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {resolutionSummary.suggestedMatches} suggested + {resolutionSummary.unresolvedUsageRows} unresolved products are waiting in the Review Queue.
                  </span>
                  <button className="ml-auto flex items-center gap-1 font-semibold hover:text-orange-200 whitespace-nowrap">
                    Go to Review Queue <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Upload card ── */}
      <div className={`rounded-2xl border ${at.card} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-2`}>
          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          <h3 className={`text-sm font-semibold ${at.textPrimary}`}>
            Upload usage report
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <label className="block">
              <span className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 block`}>
                Import mode
              </span>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as "monthly" | "multiMonth")}
                className={`w-full text-sm rounded-lg border px-3 py-2 ${at.select}`}
              >
                <option value="monthly">Single month</option>
                <option value="multiMonth">Annual / multi-month</option>
              </select>
            </label>
            <label className="block">
              <span className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 block`}>
                Month
              </span>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={importMode === "multiMonth"}
                className={`w-full text-sm rounded-lg border px-3 py-2 ${at.select}`}
              >
                {monthOptions.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 block`}>
                Year
              </span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={`w-full text-sm rounded-lg border px-3 py-2 ${at.select}`}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 block`}>
                Excel file (.xlsx)
              </span>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg border ${at.input}`}
                >
                  <Upload className="w-4 h-4" />
                  {file ? "Replace file" : "Choose file"}
                </button>
              </div>
            </label>
          </div>

          {file && (
            <div className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${at.subCard}`}>
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className={`text-sm ${at.textPrimary} font-medium`}>{file.name}</span>
              <span className={`text-xs ${at.textMuted}`}>{formatBytes(file.size)}</span>
              <button
                onClick={() => handleFile(null)}
                className={`ml-auto text-xs ${at.textFaint} hover:text-red-400`}
              >
                Remove
              </button>
            </div>
          )}

          {previewLoading && (
            <div className={`flex items-center gap-2 text-sm ${at.textMuted}`}>
              <Loader2 className="w-4 h-4 animate-spin" /> Parsing workbook…
            </div>
          )}

          {previewError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2">
              {previewError}
            </div>
          )}

          {preview && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {summaryRow(
                  importMode === "multiMonth" ? "Imported months" : "Primary month",
                  preview.summary.monthLabels.length > 1
                    ? `${preview.summary.monthLabels[0]} → ${preview.summary.monthLabels[preview.summary.monthLabels.length - 1]}`
                    : preview.primaryMonth || preview.hint.monthLabel || "—",
                  preview.summary.monthLabels.length > 1
                    ? `+${preview.summary.monthLabels.length - 1} other month(s)`
                    : undefined,
                )}
                {summaryRow(
                  "Rows",
                  preview.dedupedRowCount.toLocaleString(),
                  preview.duplicatesRemoved > 0
                    ? `${preview.duplicatesRemoved} duplicate row(s) removed`
                    : "no duplicates",
                )}
                {summaryRow("Users", preview.summary.uniqueUsers)}
                {summaryRow("Brands", preview.summary.uniqueBrands)}
                {summaryRow(
                  "Total services",
                  preview.summary.totals.services.toLocaleString(),
                )}
                {summaryRow(
                  "Total grams",
                  preview.summary.totals.grams.toLocaleString(),
                )}
                {summaryRow(
                  "Reported cost",
                  `${preview.summary.totals.cost.toLocaleString()}`,
                  "currency depends on country",
                )}
                {summaryRow("Countries", preview.summary.countries.join(", ") || "—")}
              </div>

              {preview.warnings.length > 0 && (
                <div className="space-y-2">
                  <p className={`text-xs uppercase tracking-wider ${at.textFaint}`}>
                    Quality warnings · {preview.warnings.length}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {preview.warnings.map((w, i) => (
                      <WarningBadge key={i} w={w} />
                    ))}
                  </div>
                  {hasBlocking && (
                    <label className={`flex items-center gap-2 text-xs ${at.textSec}`}>
                      <input
                        type="checkbox"
                        checked={forceCommit}
                        onChange={(e) => setForceCommit(e.target.checked)}
                      />
                      Override blocking warnings (use only when manually verified)
                    </label>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className={`text-[11px] uppercase tracking-wider ${at.textFaint} block`}>
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Describe any anomalies, sources, or context."
                  className={`w-full text-sm rounded-lg border px-3 py-2 ${at.input}`}
                />
              </div>

              {commitError && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2">
                  {commitError}
                </div>
              )}

              {committedAt && (
                <div className={`rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2`}>
                  <div className="flex items-center gap-2 text-sm text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    Import committed at {formatDate(committedAt)}.
                  </div>
                  <p className={`text-xs ${at.textMuted} mt-1`}>
                    Updated surfaces:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {UPDATED_SURFACES.map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] ${at.filterInactive}`}
                      >
                        <ExternalLink className="w-3 h-3" /> {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleCommit}
                  disabled={!canCommit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {commitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Commit import for {
                    importMode === "multiMonth"
                      ? `${preview.summary.monthLabels[0] || "selected"} → ${preview.summary.monthLabels[preview.summary.monthLabels.length - 1] || "months"}`
                      : preview.primaryMonth || preview.hint.monthLabel || "selected month"
                  }
                </button>
                <p className={`text-xs ${at.textMuted}`}>
                  {importMode === "multiMonth"
                    ? "Latest committed rows win month-by-month in the live snapshot."
                    : "Latest committed rows win for the same month."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Import history ── */}
      <div className={`rounded-2xl border ${at.card} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-2`}>
          <Calendar className="w-4 h-4 text-violet-400" />
          <h3 className={`text-sm font-semibold ${at.textPrimary}`}>
            Import history
          </h3>
          <span className={`text-xs ${at.textFaint}`}>
            {history.length} record{history.length === 1 ? "" : "s"}
          </span>
          <button
            onClick={refreshHistory}
            disabled={historyLoading}
            className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${at.filterInactive}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
            Reload
          </button>
        </div>

        {historyError && (
          <div className="px-5 py-3 text-sm text-red-400 border-b border-red-500/30">
            {historyError}
          </div>
        )}

        {history.length === 0 && !historyLoading && !historyError && (
          <div className={`px-5 py-8 text-sm text-center ${at.textMuted}`}>
            No imports yet. Upload an Excel file above to seed the live dataset.
          </div>
        )}

        {history.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${at.border}`}>
                  {["Month", "Status", "Rows", "Users", "Brands", "File", "Uploaded", ""].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${at.rowDivide}`}>
                {history.map((rec) => {
                  const s = STATUS_STYLE[rec.status] || STATUS_STYLE.committed;
                  const isOpen = expandedId === rec.id;
                  return (
                    <React.Fragment key={rec.id}>
                      <tr className={`${at.rowHover} transition`}>
                        <td className={`px-4 py-3 font-medium text-xs ${at.textPrimary}`}>
                          {rec.month_label}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${s.bg} ${s.text}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-xs ${at.textSec}`}>{rec.row_count.toLocaleString()}</td>
                        <td className={`px-4 py-3 text-xs ${at.textSec}`}>{rec.user_count}</td>
                        <td className={`px-4 py-3 text-xs ${at.textSec}`}>{rec.brand_count}</td>
                        <td className={`px-4 py-3 text-xs ${at.textMuted} max-w-[180px] truncate`} title={rec.filename}>
                          {rec.filename}
                          <span className={`block text-[10px] ${at.textFaint}`}>
                            {formatBytes(rec.file_size_bytes)}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-[10px] ${at.textMuted}`}>
                          {formatDate(rec.created_at)}
                          {rec.created_by ? (
                            <span className={`block ${at.textFaint}`}>by {rec.created_by}</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {rec.status === "committed" && (
                              <button
                                onClick={() => fetchResolutionMetrics(rec.id)}
                                disabled={resolutionLoading && resolutionImportId === rec.id}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium
                                  text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/20 transition`}
                                title="Check Product Truth resolution for this import"
                              >
                                {resolutionLoading && resolutionImportId === rec.id
                                  ? <><RefreshCw className="w-3 h-3 animate-spin" />Resolving…</>
                                  : <><Target className="w-3 h-3" />Resolve</>}
                              </button>
                            )}
                            <button
                              onClick={() => setExpandedId(isOpen ? null : rec.id)}
                              className={`p-1.5 rounded-lg ${at.filterInactive}`}
                              title={isOpen ? "Hide details" : "Show details"}
                            >
                              {isOpen ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(rec.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Delete import"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={8} className={`px-4 py-3 ${at.subCard}`}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div>
                                <p className={`uppercase tracking-wider ${at.textFaint}`}>File hash</p>
                                <p className={`font-mono ${at.textMuted}`}>
                                  {rec.file_hash.slice(0, 12)}…
                                </p>
                              </div>
                              <div>
                                <p className={`uppercase tracking-wider ${at.textFaint}`}>Visits</p>
                                <p className={at.text90}>
                                  {(rec.summary?.totals?.visits || 0).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className={`uppercase tracking-wider ${at.textFaint}`}>Cost</p>
                                <p className={at.text90}>
                                  {(rec.summary?.totals?.cost || 0).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className={`uppercase tracking-wider ${at.textFaint}`}>Grams</p>
                                <p className={at.text90}>
                                  {(rec.summary?.totals?.grams || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {rec.notes && (
                              <p className={`mt-2 text-xs ${at.textSec}`}>“{rec.notes}”</p>
                            )}
                            {rec.warnings && rec.warnings.length > 0 && (
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                {rec.warnings.map((w, i) => (
                                  <WarningBadge key={i} w={w} />
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Linked surfaces ── */}
      <div className={`rounded-2xl border ${at.card} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <UsersIcon className="w-4 h-4 text-blue-400" />
          <h3 className={`text-sm font-semibold ${at.textPrimary}`}>
            Surfaces refreshed after each import
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {UPDATED_SURFACES.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border ${at.subCard} ${at.rowHover} text-sm ${at.textPrimary}`}
            >
              <span className="flex items-center gap-2">
                <Package className={`w-4 h-4 ${at.textMuted}`} />
                {s.label}
              </span>
              <ExternalLink className={`w-3.5 h-3.5 ${at.textFaint}`} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsageImportPanel;

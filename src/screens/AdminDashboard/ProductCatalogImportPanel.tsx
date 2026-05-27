import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Database,
  Filter as FilterIcon,
  Boxes,
  MessageSquare,
  Link as LinkIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  previewCatalogImport,
  enrichCatalogRows,
  exportCatalogWorkbook,
  downloadBase64File,
  formatBytes,
  saveCatalogDbSnapshot,
  getCatalogDbSnapshot,
  clearCatalogDbSnapshot,
} from "../../lib/productCatalogImportClient";
import type {
  CatalogCandidateRow,
  CatalogConfidence,
  CatalogDbSnapshotMeta,
  CatalogImportOptions,
  CatalogPreviewResponse,
  CatalogPreviewSummary,
  CatalogRowStatus,
  CatalogWarning,
} from "../../lib/types/productCatalogImport";

const ENRICH_FIELD_LABELS: Record<string, string> = {
  barcodes: "Barcodes",
  ILS: "Price (ILS)",
  materialWeight: "Material weight",
  packingWeight: "Packing weight",
  type: "Type",
  catalogNo: "Catalog #",
};
const ENRICH_FIELD_ORDER = [
  "barcodes",
  "ILS",
  "materialWeight",
  "packingWeight",
  "type",
  "catalogNo",
] as const;
type EnrichField = (typeof ENRICH_FIELD_ORDER)[number];

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
  filterActive?: string;
  rowDivide: string;
  rowHover: string;
  subCard: string;
}

interface Props {
  isDark: boolean;
  at: ThemeTokens;
}

const STATUS_STYLE: Record<CatalogRowStatus, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", label: "New" },
  update: { bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-400", label: "Update" },
  "duplicate-risk": { bg: "bg-red-500/15 border-red-500/30", text: "text-red-400", label: "Duplicate" },
  "missing-critical-data": {
    bg: "bg-amber-500/15 border-amber-500/30",
    text: "text-amber-400",
    label: "Missing data",
  },
  "needs-review": {
    bg: "bg-orange-500/15 border-orange-500/30",
    text: "text-orange-400",
    label: "Review",
  },
};

const CONFIDENCE_STYLE: Record<CatalogConfidence, { dot: string; text: string }> = {
  high: { dot: "bg-emerald-400", text: "text-emerald-400" },
  medium: { dot: "bg-amber-400", text: "text-amber-400" },
  low: { dot: "bg-red-400", text: "text-red-400" },
};

const SEVERITY_STYLE: Record<CatalogWarning["severity"], { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-red-500/15 border-red-500/30", text: "text-red-400", label: "Critical" },
  high: { bg: "bg-orange-500/15 border-orange-500/30", text: "text-orange-400", label: "High" },
  medium: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", label: "Medium" },
  low: { bg: "bg-yellow-500/15 border-yellow-500/30", text: "text-yellow-400", label: "Low" },
  info: { bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-400", label: "Info" },
};

function describeFile(file: File): { kind: string; icon: React.ReactNode } {
  const lower = file.name.toLowerCase();
  if (/\.(xlsx|xls)$/.test(lower)) return { kind: "Excel", icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> };
  if (/\.pdf$/.test(lower)) return { kind: "PDF", icon: <FileText className="w-4 h-4 text-rose-400" /> };
  if (/\.(png|jpe?g|webp|gif|bmp)$/.test(lower)) return { kind: "Image", icon: <ImageIcon className="w-4 h-4 text-violet-400" /> };
  return { kind: "File", icon: <FileText className="w-4 h-4 text-gray-400" /> };
}

export const ProductCatalogImportPanel: React.FC<Props> = ({ isDark, at }) => {
  const dbInputRef = useRef<HTMLInputElement | null>(null);
  const catalogInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);

  const [options, setOptions] = useState<CatalogImportOptions>({
    mode: "audit",
  });
  const [requestText, setRequestText] = useState<string>("");
  const [linksInput, setLinksInput] = useState<string>("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [snapshot, setSnapshot] = useState<CatalogDbSnapshotMeta | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const [preview, setPreview] = useState<CatalogPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [enableLLM, setEnableLLM] = useState(true);
  const [selectedEnrichFields, setSelectedEnrichFields] = useState<Set<EnrichField>>(
    new Set(["barcodes"]),
  );

  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<CatalogRowStatus | "all">("all");
  const [confidenceFilter, setConfidenceFilter] = useState<CatalogConfidence | "all">("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getCatalogDbSnapshot();
        if (!alive) return;
        setSnapshot(res.snapshot);
      } catch (e: any) {
        if (!alive) return;
        setSnapshotError(e?.message || "Could not load DB snapshot");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleUploadSnapshot = useCallback(async (file: File | null) => {
    if (!file) return;
    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      const res = await saveCatalogDbSnapshot(file);
      setSnapshot(res.snapshot);
      setPreview(null);
    } catch (e: any) {
      setSnapshotError(e?.message || "Failed to save DB snapshot");
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  const handleClearSnapshot = useCallback(async () => {
    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      await clearCatalogDbSnapshot();
      setSnapshot(null);
      setPreview(null);
    } catch (e: any) {
      setSnapshotError(e?.message || "Failed to clear snapshot");
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  const toggleEnrichField = useCallback((field: EnrichField) => {
    setSelectedEnrichFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }, []);

  const summary: CatalogPreviewSummary | null = preview?.summary || null;
  const rows = preview?.rows || [];

  const filteredRows = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (confidenceFilter !== "all" && r.confidence !== confidenceFilter) return false;
      return true;
    });
  }, [rows, statusFilter, confidenceFilter]);

  const handleAddCatalogFiles = useCallback((selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    setFiles((prev) => {
      const map = new Map<string, File>();
      for (const f of prev) map.set(f.name + "::" + f.size, f);
      for (const f of Array.from(selected)) map.set(f.name + "::" + f.size, f);
      return Array.from(map.values());
    });
    setPreview(null);
    setPreviewError(null);
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreview(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    const linksFromInput = (linksInput || "")
      .split(/[\s,;\n]+/)
      .map((s) => s.trim())
      .filter((s) => /^https?:\/\//i.test(s));
    const trimmedText = (requestText || "").trim();
    if (files.length === 0 && !trimmedText && linksFromInput.length === 0) {
      setPreviewError(
        "Add at least one catalog file, paste a customer request, or provide product URLs.",
      );
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    setEnrichError(null);
    setExportError(null);
    try {
      const res = await previewCatalogImport({
        files,
        options: {
          ...options,
          requestText: trimmedText || undefined,
          links: linksFromInput.length > 0 ? linksFromInput : undefined,
        },
      });
      setPreview(res);
    } catch (e: any) {
      setPreviewError(e?.message || "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  }, [files, options, requestText, linksInput]);

  const handleEnrich = useCallback(async () => {
    if (!preview?.jobId) return;
    if (selectedEnrichFields.size === 0) {
      setEnrichError("Pick at least one field to fill before running enrichment.");
      return;
    }
    setEnrichLoading(true);
    setEnrichError(null);
    try {
      const res = await enrichCatalogRows({
        jobId: preview.jobId,
        enableLLM,
        enableWeb: false,
        enableVision: false,
        fields: [...selectedEnrichFields],
      });
      setPreview((prev) => {
        if (!prev) return prev;
        const enrichedMap = new Map(res.enriched.map((r) => [r.rowKey, r]));
        const merged = prev.rows.map((r) => enrichedMap.get(r.rowKey) || r);
        return {
          ...prev,
          rows: merged,
          summary: deriveSummaryFromRows(merged, prev.summary),
          missingFields: res.missingFields || prev.missingFields,
        };
      });
    } catch (e: any) {
      setEnrichError(e?.message || "Enrichment failed");
    } finally {
      setEnrichLoading(false);
    }
  }, [preview, enableLLM, selectedEnrichFields]);

  const handleExport = useCallback(async () => {
    if (!preview?.jobId) return;
    setExportLoading(true);
    setExportError(null);
    try {
      const res = await exportCatalogWorkbook({
        jobId: preview.jobId,
        rows: preview.rows,
        includeSources: true,
        filenameHint: "products_import_ready",
      });
      downloadBase64File(res.workbook, res.filename);
      setLastExport(`${res.filename} · ${formatBytes(res.byteSize)}`);
    } catch (e: any) {
      setExportError(e?.message || "Export failed");
    } finally {
      setExportLoading(false);
    }
  }, [preview]);

  const summaryCard = (label: string, value: string | number, hint?: string) => (
    <div className={`${at.subCard} rounded-xl border p-3`}>
      <p className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}>{label}</p>
      <p className={`text-lg font-semibold mt-0.5 ${at.textPrimary}`}>{value}</p>
      {hint ? <p className={`text-[10px] ${at.textMuted} mt-0.5`}>{hint}</p> : null}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${at.subCard}`}>
        <Boxes className="w-5 h-5 text-indigo-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${at.text90}`}>Catalog Import AI</p>
          <p className={`text-xs ${at.textMuted}`}>
            Step 1 — keep one current DB snapshot live. Step 2 — paste the
            customer request and upload screenshots/PDFs. Step 3 — review the
            internal product list, pick which missing fields to enrich, and
            export one DB-format Excel ready for import.
          </p>
        </div>
      </div>

      {/* ── Step 1: persistent DB snapshot ── */}
      <div className={`rounded-2xl border ${at.card} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-2`}>
          <Database className="w-4 h-4 text-indigo-400" />
          <h3 className={`text-sm font-semibold ${at.textPrimary}`}>
            Step 1 · Current database snapshot
          </h3>
          {snapshot && (
            <span
              className={`ml-auto text-[10px] uppercase tracking-wider ${at.textFaint}`}
            >
              persisted
            </span>
          )}
        </div>
        <div className="p-5 space-y-3">
          <input
            ref={dbInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              handleUploadSnapshot(e.target.files?.[0] || null);
              if (e.target) e.target.value = "";
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => dbInputRef.current?.click()}
              disabled={snapshotLoading}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border ${at.input} disabled:opacity-50`}
            >
              {snapshotLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {snapshot ? "Replace DB snapshot" : "Upload current DB export"}
            </button>
            {snapshot && (
              <button
                onClick={handleClearSnapshot}
                disabled={snapshotLoading}
                className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border ${at.input} disabled:opacity-50`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <p className={`text-[11px] ${at.textMuted}`}>
              The latest export stays active until you upload a new one. No
              re-upload needed for each customer request.
            </p>
          </div>
          {snapshot ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className={`${at.subCard} rounded-lg border px-3 py-2 text-xs`}>
                <p
                  className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}
                >
                  File
                </p>
                <p
                  className={`text-xs font-medium ${at.textPrimary} truncate`}
                  title={snapshot.fileName || ""}
                >
                  {snapshot.fileName || "—"}
                </p>
              </div>
              <div className={`${at.subCard} rounded-lg border px-3 py-2 text-xs`}>
                <p
                  className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}
                >
                  Rows
                </p>
                <p className={`text-base font-semibold ${at.textPrimary}`}>
                  {snapshot.rowCount.toLocaleString()}
                </p>
              </div>
              <div className={`${at.subCard} rounded-lg border px-3 py-2 text-xs`}>
                <p
                  className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}
                >
                  Brands
                </p>
                <p className={`text-base font-semibold ${at.textPrimary}`}>
                  {snapshot.brands.length}
                </p>
              </div>
              <div className={`${at.subCard} rounded-lg border px-3 py-2 text-xs`}>
                <p
                  className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}
                >
                  Last updated
                </p>
                <p className={`text-xs font-medium ${at.textPrimary}`}>
                  {formatTime(snapshot.uploadedAt || snapshot.savedAt)}
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs px-3 py-2`}
            >
              No DB snapshot yet. Upload the current products export so customer
              requests can be matched against it.
            </div>
          )}
          {snapshotError && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 text-xs px-3 py-2">
              {snapshotError}
            </div>
          )}
        </div>
      </div>

      {/* ── Step 2: customer request card ── */}
      <div className={`rounded-2xl border ${at.card} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-2`}>
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h3 className={`text-sm font-semibold ${at.textPrimary}`}>
            Step 2 · Customer request (text + links + files)
          </h3>
        </div>
        <div className="p-5 space-y-3">
          <label className="block">
            <span
              className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 block`}
            >
              Paste customer request / WhatsApp / Instagram text
            </span>
            <textarea
              value={requestText}
              onChange={(e) => {
                setRequestText(e.target.value);
                setPreview(null);
              }}
              placeholder={
                "Example:\n- kenra SA rapid toners\n- wella color touch 1.9% 6 volume gallon (quick add for all color services)\n- Framesi framcolor glamour (6.61, 7.61, 5.61, 8.61) all the .61 plz\n- ADORE COLOR (direct dye)\n  https://supersistersbeauty.com/products/adore-semi-permanent-hair-color"
              }
              className={`w-full min-h-[140px] text-sm rounded-lg border px-3 py-2 ${at.input}`}
            />
          </label>
          <label className="block">
            <span
              className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 flex items-center gap-1.5`}
            >
              <LinkIcon className="w-3 h-3" /> Extra product URLs (optional, one
              per line — auto-detected from text too)
            </span>
            <textarea
              value={linksInput}
              onChange={(e) => {
                setLinksInput(e.target.value);
                setPreview(null);
              }}
              placeholder="https://example.com/products/adore-semi-permanent-hair-color"
              className={`w-full min-h-[60px] text-xs rounded-lg border px-3 py-2 font-mono ${at.input}`}
            />
          </label>
          {preview?.requestContext && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                className={`${at.subCard} rounded-lg border px-3 py-2 text-xs`}
              >
                <p
                  className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}
                >
                  Request bullets
                </p>
                <p className={`text-base font-semibold ${at.textPrimary}`}>
                  {preview.requestContext.bulletCount}
                </p>
              </div>
              <div
                className={`${at.subCard} rounded-lg border px-3 py-2 text-xs`}
              >
                <p
                  className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}
                >
                  Detected links
                </p>
                <p className={`text-base font-semibold ${at.textPrimary}`}>
                  {preview.requestContext.detectedLinks.length}
                </p>
              </div>
              <div
                className={`${at.subCard} rounded-lg border px-3 py-2 text-xs`}
              >
                <p
                  className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}
                >
                  Detected brands
                </p>
                <p className={`text-xs font-medium ${at.textPrimary} truncate`}>
                  {preview.requestContext.detectedBrands.join(", ") || "—"}
                </p>
              </div>
              <div
                className={`${at.subCard} rounded-lg border px-3 py-2 text-xs`}
              >
                <p
                  className={`text-[10px] uppercase tracking-wider ${at.textFaint}`}
                >
                  Quick-add intents
                </p>
                <p className={`text-base font-semibold ${at.textPrimary}`}>
                  {preview.requestContext.quickAddIntents}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Step 2: catalog file uploads ── */}
      <div className={`rounded-2xl border ${at.card} overflow-hidden`}>
        <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-2`}>
          <Upload className="w-4 h-4 text-indigo-400" />
          <h3 className={`text-sm font-semibold ${at.textPrimary}`}>
            Step 2b · Screenshots / PDFs / catalog files
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <input
            ref={catalogInputRef}
            type="file"
            accept=".xlsx,.xls,.pdf,.png,.jpg,.jpeg,.webp"
            multiple
            className="hidden"
            onChange={(e) => handleAddCatalogFiles(e.target.files)}
          />
          <button
            onClick={() => catalogInputRef.current?.click()}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border ${at.input}`}
          >
            <Upload className="w-4 h-4" />
            {files.length > 0 ? "Add more files" : "Choose files (Excel / PDF / image)"}
          </button>
          {files.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {files.map((f, i) => {
                const desc = describeFile(f);
                return (
                  <div
                    key={`${f.name}-${i}`}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${at.subCard}`}
                  >
                    {desc.icon}
                    <span className={`text-xs ${at.textPrimary} truncate`}>{f.name}</span>
                    <span className={`text-[10px] ${at.textFaint}`}>{desc.kind}</span>
                    <span className={`text-[10px] ${at.textFaint} ml-auto`}>
                      {formatBytes(f.size)}
                    </span>
                    <button
                      onClick={() => removeFile(i)}
                      className={`text-[10px] ${at.textFaint} hover:text-red-400`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className={`flex items-center gap-1.5 text-xs ${at.textFaint} hover:opacity-80 transition`}
            >
              {advancedOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
              Advanced defaults (optional)
            </button>
            {advancedOpen && (
              <div className="mt-3 space-y-3 rounded-lg border border-dashed border-white/10 p-3">
                <p className={`text-[11px] ${at.textMuted}`}>
                  Use these only when the request is too sparse for the parser
                  to infer brand/series/type. The system will normally figure
                  this out automatically.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="block">
                    <span
                      className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 block`}
                    >
                      Mode
                    </span>
                    <select
                      value={options.mode || "audit"}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          mode: e.target.value as any,
                        }))
                      }
                      className={`w-full text-sm rounded-lg border px-3 py-2 ${at.select}`}
                    >
                      <option value="audit">Audit / update existing</option>
                      <option value="new-series">Add new brand/series</option>
                    </select>
                  </label>
                  <label className="block">
                    <span
                      className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 block`}
                    >
                      Default brand
                    </span>
                    <input
                      type="text"
                      value={options.brand || ""}
                      placeholder="auto"
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          brand: e.target.value || undefined,
                        }))
                      }
                      className={`w-full text-sm rounded-lg border px-3 py-2 ${at.input}`}
                    />
                  </label>
                  <label className="block">
                    <span
                      className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 block`}
                    >
                      Default series
                    </span>
                    <input
                      type="text"
                      value={options.series || ""}
                      placeholder="auto"
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          series: e.target.value || undefined,
                        }))
                      }
                      className={`w-full text-sm rounded-lg border px-3 py-2 ${at.input}`}
                    />
                  </label>
                  <label className="block">
                    <span
                      className={`text-[11px] uppercase tracking-wider ${at.textFaint} mb-1.5 block`}
                    >
                      Default type
                    </span>
                    <select
                      value={options.defaultType || ""}
                      onChange={(e) =>
                        setOptions((prev) => ({
                          ...prev,
                          defaultType: e.target.value || undefined,
                        }))
                      }
                      className={`w-full text-sm rounded-lg border px-3 py-2 ${at.select}`}
                    >
                      <option value="">auto</option>
                      <option value="color">color</option>
                      <option value="developer">developer</option>
                      <option value="bleach">bleach</option>
                      <option value="toner">toner</option>
                      <option value="treatment">treatment</option>
                      <option value="shampoo">shampoo</option>
                      <option value="conditioner">conditioner</option>
                      <option value="mask">mask</option>
                      <option value="other">other</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>

          {previewError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2">
              {previewError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleAnalyze}
              disabled={
                previewLoading ||
                (files.length === 0 &&
                  !(requestText && requestText.trim().length > 0) &&
                  !(linksInput && /https?:\/\//i.test(linksInput)))
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {previewLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Build internal product list
            </button>
            <p className={`text-xs ${at.textMuted}`}>
              Deterministic parsing + URL fetch + image OCR + DB cross-check.
              No barcode/price web lookups yet.
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      {summary && (
        <div className={`rounded-2xl border ${at.card} p-5 space-y-4`}>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <h3 className={`text-sm font-semibold ${at.textPrimary}`}>Audit summary</h3>
            <span className={`text-[10px] ${at.textFaint} ml-2`}>job · {preview?.jobId.slice(0, 10)}…</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summaryCard("Parsed rows", summary.parsedRows)}
            {summaryCard("New", summary.newRows)}
            {summaryCard("Updates", summary.updateRows)}
            {summaryCard("Needs review", summary.duplicateRiskRows + summary.needsReviewRows)}
            {summaryCard("Missing barcode", summary.missingBarcode)}
            {summaryCard("Missing price", summary.missingPrice)}
            {summaryCard("Missing material weight", summary.missingMaterialWeight)}
            {summaryCard("Brands", summary.uniqueBrands.join(", ") || "—")}
          </div>
          {(summary.textRows ||
            summary.urlRows ||
            summary.imageRows ||
            summary.quickAddRows ||
            summary.linkCount) ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {summaryCard("From text", summary.textRows ?? 0)}
              {summaryCard("From URLs", summary.urlRows ?? 0)}
              {summaryCard("From images", summary.imageRows ?? 0)}
              {summaryCard("Quick-add", summary.quickAddRows ?? 0)}
              {summaryCard("Links parsed", summary.linkCount ?? 0)}
            </div>
          ) : null}

          {preview?.warnings && preview.warnings.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs uppercase tracking-wider ${at.textFaint}`}>
                Parser warnings · {preview.warnings.length}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {preview.warnings.map((w, i) => {
                  const s = SEVERITY_STYLE[w.severity] || SEVERITY_STYLE.info;
                  return (
                    <div key={i} className={`px-3 py-2 rounded-lg border ${s.bg} text-xs`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <AlertTriangle className={`w-3.5 h-3.5 ${s.text}`} />
                        <span className={`font-medium ${s.text}`}>{s.label}</span>
                        <span className="opacity-50">·</span>
                        <span className="opacity-70 font-mono text-[10px]">{w.code}</span>
                      </div>
                      <p className="opacity-80 leading-snug">{w.message}</p>
                      {w.source && (
                        <p className={`text-[10px] mt-1 ${at.textFaint}`}>{w.source}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleExport}
              disabled={exportLoading || !preview?.jobId}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {exportLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export DB-format Excel
            </button>
          </div>

          {exportError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2">
              {exportError}
            </div>
          )}
          {lastExport && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-sm px-3 py-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Downloaded {lastExport}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: missing-field review + selective AI enrichment ── */}
      {preview && preview.missingFields && (
        <div className={`rounded-2xl border ${at.card} p-5 space-y-4`}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className={`text-sm font-semibold ${at.textPrimary}`}>
              Step 3 · Fill missing details (optional AI / web)
            </h3>
            <span className={`text-[10px] ${at.textFaint} ml-2`}>
              {preview.missingFields.eligibleRows} eligible rows ·{" "}
              {preview.missingFields.duplicateRiskRows} duplicate-risk held back
            </span>
          </div>
          <p className={`text-xs ${at.textMuted}`}>
            Pick which fields the system should ask the AI / web to fill.
            Nothing happens until you press the button — the export already
            works without enrichment.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ENRICH_FIELD_ORDER.map((field) => {
              const slot = preview.missingFields!.perField[field];
              if (!slot) return null;
              const checked = selectedEnrichFields.has(field);
              const disabled = slot.missing === 0;
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => !disabled && toggleEnrichField(field)}
                  disabled={disabled}
                  className={`text-left rounded-lg border px-3 py-2 transition ${
                    checked
                      ? "border-violet-500/60 bg-violet-500/10"
                      : disabled
                        ? "opacity-40 cursor-not-allowed " + at.subCard
                        : at.subCard + " hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEnrichField(field)}
                      disabled={disabled}
                      className="pointer-events-none"
                      readOnly
                    />
                    <span
                      className={`text-xs font-medium ${at.textPrimary}`}
                    >
                      {ENRICH_FIELD_LABELS[field]}
                    </span>
                    <span className={`ml-auto text-[10px] ${at.textFaint}`}>
                      {slot.missing} missing
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 ${at.textMuted}`}>
                    {slot.present} already filled
                  </p>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleEnrich}
              disabled={
                enrichLoading ||
                !preview?.jobId ||
                selectedEnrichFields.size === 0
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {enrichLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Fill {selectedEnrichFields.size === 0
                ? "selected fields"
                : `${[...selectedEnrichFields]
                    .map((f) => ENRICH_FIELD_LABELS[f])
                    .join(", ")}`}
            </button>
            <label className={`flex items-center gap-2 text-xs ${at.textSec}`}>
              <input
                type="checkbox"
                checked={enableLLM}
                onChange={(e) => setEnableLLM(e.target.checked)}
              />
              Use OpenAI when available
            </label>
          </div>
          {enrichError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-3 py-2">
              {enrichError}
            </div>
          )}
        </div>
      )}

      {/* ── Review table ── */}
      {preview && rows.length > 0 && (
        <div className={`rounded-2xl border ${at.card} overflow-hidden`}>
          <div className={`px-5 py-3 border-b ${at.border} flex items-center gap-3 flex-wrap`}>
            <FilterIcon className="w-4 h-4 text-indigo-400" />
            <h3 className={`text-sm font-semibold ${at.textPrimary}`}>
              Candidate rows · {filteredRows.length} / {rows.length}
            </h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className={`text-xs rounded-lg border px-2 py-1 ${at.select}`}
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="update">Update</option>
              <option value="duplicate-risk">Duplicate risk</option>
              <option value="missing-critical-data">Missing data</option>
              <option value="needs-review">Needs review</option>
            </select>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value as any)}
              className={`text-xs rounded-lg border px-2 py-1 ${at.select}`}
            >
              <option value="all">All confidence</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="overflow-x-auto max-h-[480px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className={`border-b ${at.border} ${at.subCard}`}>
                  {["Status", "Confidence", "Brand", "Series", "Shade", "Type", "Barcodes", "ILS", "Material g", "Source", "Issues"].map((h) => (
                    <th
                      key={h}
                      className={`px-3 py-2 text-left text-[11px] uppercase tracking-wider font-medium ${at.textFaint} whitespace-nowrap`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${at.rowDivide}`}>
                {filteredRows.map((row) => {
                  const s = STATUS_STYLE[row.status] || STATUS_STYLE["needs-review"];
                  const c = CONFIDENCE_STYLE[row.confidence] || CONFIDENCE_STYLE.medium;
                  const codes = parseCodes(row.barcodes);
                  return (
                    <tr key={row.rowKey} className={`${at.rowHover} transition`}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] ${c.text}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot}`} />
                          {row.confidence}
                        </span>
                      </td>
                      <td className={`px-3 py-2 text-xs ${at.textPrimary} whitespace-nowrap`}>{row.brand}</td>
                      <td className={`px-3 py-2 text-xs ${at.textPrimary} whitespace-nowrap`}>{row.series}</td>
                      <td className={`px-3 py-2 text-xs font-medium ${at.textPrimary} whitespace-nowrap`}>{row.shade}</td>
                      <td className={`px-3 py-2 text-xs ${at.textMuted}`}>{row.type || "—"}</td>
                      <td className={`px-3 py-2 text-[11px] font-mono ${at.textSec}`}>
                        {codes.length === 0 ? <span className="text-amber-400">—</span> : codes.join(", ")}
                      </td>
                      <td className={`px-3 py-2 text-xs ${at.textPrimary}`}>{row.ILS ?? "—"}</td>
                      <td className={`px-3 py-2 text-xs ${at.textMuted}`}>{row.materialWeight ?? "—"}</td>
                      <td className={`px-3 py-2 text-[10px] ${at.textFaint} max-w-[160px] truncate`}>
                        {(row.sources || []).join(", ") || "—"}
                      </td>
                      <td className={`px-3 py-2 text-[11px] ${at.textMuted} max-w-[280px] truncate`}>
                        {row.issues && row.issues.length > 0
                          ? row.issues
                              .map((i) => `[${i.severity[0].toUpperCase()}] ${i.code}`)
                              .join(", ")
                          : (row.enrichedFields && row.enrichedFields.length > 0
                              ? `enriched: ${row.enrichedFields.join(", ")}`
                              : "—")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

function parseCodes(barcodes: string | undefined): string[] {
  if (!barcodes) return [];
  if (barcodes.startsWith("[")) {
    try {
      const arr = JSON.parse(barcodes);
      return Array.isArray(arr) ? arr.map((v) => String(v)) : [];
    } catch {
      return [];
    }
  }
  return [barcodes];
}

function deriveSummaryFromRows(
  rows: CatalogCandidateRow[],
  prev: CatalogPreviewSummary,
): CatalogPreviewSummary {
  const summary: CatalogPreviewSummary = {
    ...prev,
    parsedRows: rows.length,
    newRows: 0,
    updateRows: 0,
    duplicateRiskRows: 0,
    needsReviewRows: 0,
    missingBarcode: 0,
    missingPrice: 0,
    missingMaterialWeight: 0,
    missingType: 0,
    missingPackingWeight: 0,
  };
  const brands = new Set<string>();
  const series = new Set<string>();
  for (const r of rows) {
    if (r.brand) brands.add(r.brand);
    if (r.series) series.add(r.series);
    if (r.status === "new") summary.newRows += 1;
    else if (r.status === "update") summary.updateRows += 1;
    else if (r.status === "duplicate-risk") summary.duplicateRiskRows += 1;
    else summary.needsReviewRows += 1;
    if (parseCodes(r.barcodes).length === 0) summary.missingBarcode += 1;
    if (r.ILS == null) summary.missingPrice += 1;
    if (r.materialWeight == null) summary.missingMaterialWeight += 1;
    if (r.packingWeight == null) summary.missingPackingWeight += 1;
    if (!r.type) summary.missingType += 1;
  }
  summary.uniqueBrands = [...brands].sort();
  summary.uniqueSeries = [...series].sort();
  return summary;
}

export default ProductCatalogImportPanel;

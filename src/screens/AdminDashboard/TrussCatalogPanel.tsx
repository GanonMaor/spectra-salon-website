/**
 * Admin TRUSS brand catalog preview — fully local, no CRM/session dependency.
 * Loads JSON from /public/data at runtime so Vite does not bundle large catalogs.
 */
import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, LayoutGrid, List, Package, Search, X } from "lucide-react";

type TrussProduct = {
  id: string;
  brand: string;
  division: string | null;
  product_line: string | null;
  category: string | null;
  display_name: string | null;
  supplier_name: string | null;
  official_name: string | null;
  product_type: string | null;
  professional_or_retail: string | null;
  shade_code: string | null;
  shade_name: string | null;
  size_value: number | null;
  size_unit: string | null;
  size_display: string | null;
  trs_code: string | null;
  ean_barcode: string | null;
  official_description: string | null;
  official_product_url: string | null;
  primary_image_path: string | null;
  image_status: string | null;
  validation_status: string | null;
  enrichment_status: string | null;
  source_pdf_page: number | null;
  source_confidence: string | null;
  seed_matches?: Array<{ seed_id?: string | null; method?: string | null }> | null;
};

type QualityReport = {
  totals: {
    products: number;
    approved: number;
    needs_review: number;
    with_official_description: number;
    with_local_image: number;
    missing_official_image: number;
  };
  divisions: Record<string, number>;
  product_lines: string[];
  seed_match?: { total_seed: number; matched: number; needs_review: number };
  manual_review_products?: Array<{ id: string; trs_code: string | null; ean_barcode: string | null; reasons: string[] }>;
};

type DivisionFilter = "all" | "CARE" | "COLOR" | "professional" | "retail" | "review";
type ViewMode = "grid" | "list";
type ExistingProduct = Record<string, string | number | null>;

const EMPTY_QUALITY: QualityReport = {
  totals: {
    products: 0,
    approved: 0,
    needs_review: 0,
    with_official_description: 0,
    with_local_image: 0,
    missing_official_image: 0,
  },
  divisions: {},
  product_lines: [],
};

type Props = {
  isDark: boolean;
  at: {
    card: string;
    subCard: string;
    textPrimary: string;
    textSec: string;
    textMuted: string;
    textFaint: string;
    textDim: string;
    border: string;
    tagActive: string;
    tagInactive: string;
  };
};

function productTitle(p: TrussProduct) {
  return p.official_name || p.display_name || p.supplier_name || p.trs_code || p.id;
}

async function copyText(text: string) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyIconButton({ value, label }: { value: string | number | null | undefined; label: string }) {
  const [copied, setCopied] = useState(false);
  const text = value == null || value === "" ? "" : String(value);

  return (
    <button
      type="button"
      disabled={!text}
      title={text ? `Copy ${label}` : "Empty"}
      onClick={async (e) => {
        e.stopPropagation();
        if (await copyText(text)) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1000);
        }
      }}
      className="inline-flex shrink-0 items-center justify-center rounded p-1 opacity-70 hover:opacity-100 disabled:opacity-20"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function CopyCell({
  value,
  label,
  at,
  mono = false,
}: {
  value: string | number | null | undefined;
  label: string;
  at: Props["at"];
  mono?: boolean;
}) {
  const text = value == null || value === "" ? "" : String(value);
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span
        className={`truncate text-xs ${mono ? "font-mono" : ""} ${text ? at.textPrimary : at.textFaint}`}
        title={text || "—"}
      >
        {text || "—"}
      </span>
      <CopyIconButton value={text} label={label} />
    </div>
  );
}

function CopyField({
  label,
  value,
  at,
  mono = false,
}: {
  label: string;
  value: string | number | null | undefined;
  at: Props["at"];
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const text = value == null || value === "" ? "" : String(value);

  const onCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (await copyText(text)) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }
    },
    [text],
  );

  return (
    <div className={`min-w-0 rounded-lg border px-2 py-1.5 ${at.border} ${at.subCard}`}>
      <div className="mb-0.5 flex items-center justify-between gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${at.textMuted}`}>{label}</span>
        <button
          type="button"
          onClick={onCopy}
          disabled={!text}
          title={text ? `Copy ${label}` : "Empty"}
          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold disabled:opacity-30 ${at.tagInactive}`}
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p
        className={`break-words text-xs ${mono ? "font-mono" : "font-medium"} ${text ? at.textPrimary : at.textFaint}`}
        title={text || "—"}
      >
        {text || "—"}
      </p>
    </div>
  );
}

export const TrussCatalogPanel: React.FC<Props> = ({ isDark, at }) => {
  const [products, setProducts] = useState<TrussProduct[]>([]);
  const [quality, setQuality] = useState<QualityReport>(EMPTY_QUALITY);
  const [existingProducts, setExistingProducts] = useState<ExistingProduct[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [division, setDivision] = useState<DivisionFilter>("all");
  const [line, setLine] = useState("");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selected, setSelected] = useState<TrussProduct | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catalogRes, qualityRes, existingRes] = await Promise.all([
          fetch("/data/truss-catalog.json"),
          fetch("/data/truss-catalog-quality.json"),
          fetch("/data/truss-products-existing.json"),
        ]);
        if (!catalogRes.ok || !qualityRes.ok || !existingRes.ok) {
          throw new Error("Failed to load local TRUSS catalog JSON");
        }
        const [catalogJson, qualityJson, existingJson] = await Promise.all([
          catalogRes.json(),
          qualityRes.json(),
          existingRes.json(),
        ]);
        if (cancelled) return;
        setProducts(catalogJson as TrussProduct[]);
        setQuality(qualityJson as QualityReport);
        setExistingProducts(existingJson as ExistingProduct[]);
        setLoadError(null);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lines = useMemo(
    () => [...new Set(products.map((p) => p.product_line).filter(Boolean) as string[])].sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (division === "CARE" && p.division !== "CARE") return false;
      if (division === "COLOR" && p.division !== "COLOR") return false;
      if (division === "professional" && p.professional_or_retail !== "professional") return false;
      if (division === "retail" && p.professional_or_retail !== "retail") return false;
      if (division === "review") {
        const needs =
          p.validation_status === "needs_review" ||
          p.image_status === "missing_official_image" ||
          !p.official_description;
        if (!needs) return false;
      }
      if (line && p.product_line !== line) return false;
      if (!q) return true;
      const hay = [
        p.display_name,
        p.official_name,
        p.supplier_name,
        p.trs_code,
        p.ean_barcode,
        p.product_line,
        p.shade_code,
        p.size_display,
        p.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [products, division, line, deferredQuery]);

  async function exportProductsXlsx() {
    setExporting(true);
    setExportNote(null);
    try {
      const { downloadMergedTrussProductsXlsx } = await import("../../lib/truss/exportProductsWorkbook");
      const stats = await downloadMergedTrussProductsXlsx(existingProducts, products);
      setExportNote(
        `Exported ${stats.existing + stats.addedNew} rows · kept ${stats.existing} existing IDs · completed ${stats.completed} gaps · added ${stats.addedNew} new (blank productId)`,
      );
    } finally {
      setExporting(false);
    }
  }

  function exportQualityCsv() {
    const rows = quality.manual_review_products || [];
    const header = "id,trs_code,ean_barcode,reasons";
    const body = rows
      .map((r) => `${r.id},${r.trs_code || ""},${r.ean_barcode || ""},"${(r.reasons || []).join("|")}"`)
      .join("\n");
    const blob = new Blob([[header, body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "truss-data-quality.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <p className={`py-8 text-center text-sm ${at.textMuted}`}>Loading TRUSS catalog…</p>;
  }
  if (loadError) {
    return <p className={`py-8 text-center text-sm text-rose-400`}>{loadError}</p>;
  }

  const divisions: { id: DivisionFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "CARE", label: "Care" },
    { id: "COLOR", label: "Color" },
    { id: "professional", label: "Professional" },
    { id: "retail", label: "Retail" },
    { id: "review", label: "Needs review" },
  ];

  const seedId = (p: TrussProduct) =>
    p.seed_matches?.find((m) => m.seed_id)?.seed_id || "";

  return (
    <div className="space-y-3">
      {/* Compact header */}
      <div className={`rounded-xl border px-4 py-3 ${at.card}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className={`text-xl font-black tracking-tight ${at.textPrimary}`}>TRUSS</h2>
              <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${at.textMuted}`}>
                Local catalog preview
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
              <span className={`rounded-full border px-2 py-0.5 ${at.tagInactive}`}>{quality.totals.products} products</span>
              <span className={`rounded-full border px-2 py-0.5 ${at.tagInactive}`}>{lines.length} lines</span>
              <span className={`rounded-full border px-2 py-0.5 ${at.tagInactive}`}>{quality.totals.with_local_image} images</span>
              <span className={`rounded-full border px-2 py-0.5 ${at.tagInactive}`}>{quality.totals.with_official_description} descriptions</span>
              <span className={`rounded-full border px-2 py-0.5 ${at.tagInactive}`}>
                Existing {existingProducts.length} · matched {quality.seed_match?.matched ?? 0}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={exporting}
              onClick={exportProductsXlsx}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${at.tagActive}`}
            >
              <Download className="h-3.5 w-3.5" />
              {exporting ? "Exporting…" : "Export products.xlsx"}
            </button>
            <button
              type="button"
              onClick={exportQualityCsv}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${at.tagInactive}`}
            >
              Quality CSV
            </button>
            <button
              type="button"
              onClick={() => setChecklistOpen((v) => !v)}
              className={`inline-flex items-center rounded-lg border px-3 py-2 text-xs font-semibold ${at.tagInactive}`}
            >
              {checklistOpen ? "Hide checklist" : "Checklist"}
            </button>
          </div>
        </div>
        {exportNote && <p className="mt-2 text-[11px] font-semibold text-emerald-500">{exportNote}</p>}
        {checklistOpen && (
          <ul className={`mt-3 list-disc space-y-1 border-t pt-3 pl-5 text-[11px] ${at.border} ${at.textSec}`}>
            <li>QR/EAN: 128/128 decoded with valid EAN-13</li>
            <li>TRS kept as supplier SKU — never used as barcode</li>
            <li>Missing official images: {quality.totals.missing_official_image}</li>
            <li>Legacy unmatched seed rows stay needs_review</li>
            <li>
              Import: <code>CONFIRM_TRUSS_CATALOG_IMPORT=true npm run truss:import:apply</code>
            </li>
          </ul>
        )}
      </div>

      {/* Filters toolbar */}
      <div className={`rounded-xl border px-3 py-2.5 ${at.card}`}>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {divisions.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDivision(d.id)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  division === d.id ? at.tagActive : at.tagInactive
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full min-w-[220px] max-w-sm">
              <Search className={`pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${at.textMuted}`} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, EAN, TRS, shade…"
                className={`w-full rounded-lg border bg-transparent py-1.5 pl-8 pr-2 text-xs outline-none ${at.border} ${at.textPrimary}`}
              />
            </div>
            <div className={`flex rounded-lg border p-0.5 ${at.border}`}>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
                  viewMode === "list" ? at.tagActive : at.tagInactive
                }`}
              >
                <List className="h-3.5 w-3.5" /> List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
                  viewMode === "grid" ? at.tagActive : at.tagInactive
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Grid
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setLine("")}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              !line ? at.tagActive : at.tagInactive
            }`}
          >
            All lines
          </button>
          {lines.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setLine(name)}
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                line === name ? at.tagActive : at.tagInactive
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <p className={`text-[11px] ${at.textFaint}`}>
        Showing {filtered.length} / {products.length}
      </p>

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div className={`overflow-hidden rounded-xl border ${at.card}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className={`${isDark ? "bg-white/[0.04]" : "bg-black/[0.03]"} ${at.textMuted}`}>
                <tr>
                  {["Image", "Name", "Line", "Type", "Size", "Shade", "TRS", "EAN", "Page", "Flags", ""].map((h) => (
                    <th key={h || "actions"} className="whitespace-nowrap px-2.5 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/[0.06]" : "divide-black/[0.06]"}`}>
                {filtered.map((p) => (
                  <tr key={p.id} className={isDark ? "hover:bg-white/[0.03]" : "hover:bg-black/[0.02]"}>
                    <td className="px-2.5 py-1.5">
                      <div className={`grid h-10 w-10 place-items-center overflow-hidden rounded-md ${isDark ? "bg-white/[0.04]" : "bg-black/[0.03]"}`}>
                        {p.primary_image_path ? (
                          <img src={p.primary_image_path} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                        ) : (
                          <Package className={`h-4 w-4 ${at.textDim}`} />
                        )}
                      </div>
                    </td>
                    <td className="max-w-[240px] px-2.5 py-1.5">
                      <div className="flex min-w-0 items-center gap-1">
                        <button
                          type="button"
                          className={`truncate text-left text-xs font-semibold hover:underline ${at.textPrimary}`}
                          onClick={() => setSelected(p)}
                          title={productTitle(p)}
                        >
                          {productTitle(p)}
                        </button>
                        <CopyIconButton value={productTitle(p)} label="Name" />
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <CopyCell value={p.product_line} label="Line" at={at} />
                    </td>
                    <td className="px-2.5 py-1.5">
                      <CopyCell value={p.product_type} label="Type" at={at} />
                    </td>
                    <td className="px-2.5 py-1.5">
                      <CopyCell value={p.size_display} label="Size" at={at} />
                    </td>
                    <td className="px-2.5 py-1.5">
                      <CopyCell value={p.shade_code} label="Shade" at={at} mono />
                    </td>
                    <td className="px-2.5 py-1.5">
                      <CopyCell value={p.trs_code} label="TRS" at={at} mono />
                    </td>
                    <td className="px-2.5 py-1.5">
                      <CopyCell value={p.ean_barcode} label="EAN" at={at} mono />
                    </td>
                    <td className={`px-2.5 py-1.5 ${at.textMuted}`}>{p.source_pdf_page ?? "—"}</td>
                    <td className="px-2.5 py-1.5">
                      <div className="flex flex-wrap gap-1">
                        {!p.official_description && (
                          <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">no desc</span>
                        )}
                        {p.image_status === "missing_official_image" && (
                          <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">no img</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5">
                      <button
                        type="button"
                        onClick={() => setSelected(p)}
                        className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${at.tagInactive}`}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GRID VIEW — compact cards */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p)}
              className={`rounded-xl border p-2.5 text-left transition hover:opacity-95 ${at.card}`}
            >
              <div className={`mb-2 aspect-square overflow-hidden rounded-lg ${isDark ? "bg-white/[0.04]" : "bg-black/[0.03]"}`}>
                {p.primary_image_path ? (
                  <img src={p.primary_image_path} alt="" className="h-full w-full object-contain p-2" loading="lazy" />
                ) : (
                  <div className={`grid h-full place-items-center ${at.textDim}`}>
                    <Package className="h-6 w-6" />
                  </div>
                )}
              </div>
              <p className={`truncate text-[10px] font-semibold uppercase tracking-wide ${at.textMuted}`}>
                {p.product_line || "—"}
              </p>
              <h3 className={`mt-0.5 line-clamp-2 text-xs font-bold leading-snug ${at.textPrimary}`}>
                {productTitle(p)}
              </h3>
              <p className={`mt-1 font-mono text-[10px] ${at.textSec}`}>
                {p.trs_code || "—"} · {p.ean_barcode || "—"}
              </p>
            </button>
          ))}
        </div>
      )}

      {!filtered.length && (
        <p className={`py-8 text-center text-sm ${at.textMuted}`}>No products match the current filters.</p>
      )}

      {/* Detail drawer with copyable fields */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 p-0 sm:p-3" onClick={() => setSelected(null)}>
          <aside
            className={`flex h-full w-full max-w-xl flex-col overflow-hidden rounded-none shadow-2xl sm:rounded-2xl ${
              isDark ? "bg-[#12121f]" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b px-4 py-3 ${at.border}`}>
              <h3 className={`text-base font-bold ${at.textPrimary}`}>Product detail</h3>
              <button type="button" onClick={() => setSelected(null)} className={`rounded-full p-2 ${at.tagInactive}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className={`mx-auto aspect-square max-w-[220px] overflow-hidden rounded-xl ${isDark ? "bg-white/[0.04]" : "bg-black/[0.03]"}`}>
                {selected.primary_image_path ? (
                  <img src={selected.primary_image_path} alt="" className="h-full w-full object-contain p-3" />
                ) : (
                  <div className={`grid h-full place-items-center ${at.textDim}`}>
                    <Package className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <CopyField label="Official / display name" value={productTitle(selected)} at={at} />
                <CopyField label="Supplier name" value={selected.supplier_name} at={at} />
                <CopyField label="Product line" value={selected.product_line} at={at} />
                <CopyField label="Category" value={selected.category} at={at} />
                <CopyField label="Division" value={selected.division} at={at} />
                <CopyField label="Type" value={selected.product_type} at={at} />
                <CopyField label="Size" value={selected.size_display} at={at} />
                <CopyField label="Shade" value={selected.shade_code} at={at} mono />
                <CopyField label="TRS" value={selected.trs_code} at={at} mono />
                <CopyField label="EAN" value={selected.ean_barcode} at={at} mono />
                <CopyField label="Existing productId" value={seedId(selected)} at={at} mono />
                <CopyField label="Internal id" value={selected.id} at={at} mono />
                <CopyField label="PDF page" value={selected.source_pdf_page} at={at} />
                <CopyField label="Image path" value={selected.primary_image_path} at={at} mono />
                <CopyField label="Official URL" value={selected.official_product_url} at={at} />
                <CopyField label="Validation" value={selected.validation_status} at={at} />
              </div>

              {selected.official_description ? (
                <div className="mt-4">
                  <CopyField label="Official description" value={selected.official_description} at={at} />
                </div>
              ) : (
                <p className={`mt-4 rounded-lg border px-3 py-2 text-[11px] ${at.border} ${at.textMuted}`}>
                  No verified official description yet — identity is from the PDF barcode catalog.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default TrussCatalogPanel;

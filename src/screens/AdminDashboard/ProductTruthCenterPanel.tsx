/**
 * ProductTruthCenterPanel
 * ─────────────────────────────────────────────────────────────────
 * V1 Admin Product Truth Center.
 *
 * Human review surface for canonical brands, series, shades,
 * product types, aliases, and duplicate risks derived from
 * real salon usage evidence.
 *
 * Most important rule: developer / oxidant products are ALWAYS
 * separated from shade / color intelligence.
 */

import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
  ChevronRight,
  X,
  Package,
  Beaker,
  Scissors,
  Layers,
  Filter,
  Info,
} from "lucide-react";
import seedRaw from "../../data/product-truth-seed.json";

// ── Types (mirrored from product-identity.js) ──────────────────────────────

type ProductType =
  | "hair_color_shade"
  | "developer_oxidant"
  | "lightener_bleach"
  | "bond_builder"
  | "treatment_care"
  | "mixer_corrector"
  | "other";

type ReviewStatus =
  | "suggested-approved"
  | "needs-review"
  | "duplicate-risk"
  | "split-required"
  | "missing-data";

type SuggestedAction =
  | "approve"
  | "merge-aliases"
  | "split-identity"
  | "verify-official-source"
  | "exclude-from-shade-intelligence"
  | "needs-research";

interface UsageEvidence {
  usageCount: number;
  totalGrams: number;
  totalCost: number;
  uniqueSalons: number;
  topServices: { name: string; value: number }[];
}

interface ShadeDecoding {
  level?: number | null;
  levelName?: string | null;
  colorFamily?: string | null;
  colorLine?: string | null;
  colorTechnology?: string | null;
  shadeSystem?: string | null;
  meaning?: string | null;
  reflects?: { code: string; role: string; tone: string }[] | null;
}

interface TruthIdentity {
  canonicalId: string;
  canonicalBrand: string;
  canonicalSeries: string;
  canonicalShade: string;
  rawBrand: string;
  rawSeries: string;
  rawShade: string;
  productType: ProductType;
  productTypeLabel: string;
  allProductTypes: ProductType[];
  inShadeIntelligence: boolean;
  isDevOxidant: boolean;
  isSupportingProduct: boolean;
  usageEvidence: UsageEvidence;
  shadeDecoding: ShadeDecoding;
  aliases: string[];
  rawVariants?: { brand: string; series: string; shade: string }[];
  confidence: "high" | "medium" | "low";
  duplicateRisk: number;
  reviewStatus: ReviewStatus;
  suggestedAction: SuggestedAction;
  groupSize: number;
}

interface TruthSeed {
  generatedAt: string;
  summary: {
    totalMaterials: number;
    uniqueBrands: number;
    uniqueSeries: number;
    uniqueShades: number;
    developerOxidantCount: number;
    needsReviewCount: number;
    duplicateRiskCount: number;
    lowConfidenceCount: number;
    excludedFromShadeIntelligence: number;
  };
  byProductType: Record<string, number>;
  byReviewStatus: Record<string, number>;
  brandBreakdown: { brand: string; usageCount: number; identities: number }[];
  identities: TruthIdentity[];
}

// ── Theme tokens interface ─────────────────────────────────────────────────

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

// ── Constants ──────────────────────────────────────────────────────────────

const seed = seedRaw as unknown as TruthSeed;

const PRODUCT_TYPE_CONFIG: Record<
  ProductType,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  hair_color_shade: {
    label: "Hair Color Shade",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    icon: <Scissors className="w-3 h-3" />,
  },
  developer_oxidant: {
    label: "Developer / Oxidant",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    icon: <Beaker className="w-3 h-3" />,
  },
  lightener_bleach: {
    label: "Lightener / Bleach",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    icon: <Layers className="w-3 h-3" />,
  },
  bond_builder: {
    label: "Bond Builder",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
    icon: <Package className="w-3 h-3" />,
  },
  treatment_care: {
    label: "Treatment / Care",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    icon: <Package className="w-3 h-3" />,
  },
  mixer_corrector: {
    label: "Mixer / Corrector",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/25",
    icon: <Beaker className="w-3 h-3" />,
  },
  other: {
    label: "Other",
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/25",
    icon: <Package className="w-3 h-3" />,
  },
};

const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bg: string; border: string }> = {
  "suggested-approved": {
    label: "Approved",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
  },
  "needs-review": {
    label: "Needs Review",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
  },
  "duplicate-risk": {
    label: "Duplicate Risk",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
  },
  "split-required": {
    label: "Split Required",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
  },
  "missing-data": {
    label: "Missing Data",
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/25",
  },
};

const PRODUCT_TYPE_FILTER_OPTIONS: { value: ProductType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "hair_color_shade", label: "Color shades" },
  { value: "developer_oxidant", label: "Developers" },
  { value: "lightener_bleach", label: "Lighteners" },
  { value: "bond_builder", label: "Bond builders" },
  { value: "mixer_corrector", label: "Mixers / correctors" },
  { value: "treatment_care", label: "Treatments" },
];

const REVIEW_STATUS_FILTER_OPTIONS: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "suggested-approved", label: "Approved" },
  { value: "needs-review", label: "Needs review" },
  { value: "duplicate-risk", label: "Duplicate risk" },
  { value: "missing-data", label: "Missing data" },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function ProductTypeBadge({ type, small = false }: { type: ProductType; small?: boolean }) {
  const cfg = PRODUCT_TYPE_CONFIG[type] || PRODUCT_TYPE_CONFIG.other;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${cfg.color} ${cfg.bg} ${cfg.border} ${small ? "text-[9px] px-1.5" : ""}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function ReviewBadge({ status }: { status: ReviewStatus }) {
  const cfg = REVIEW_STATUS_CONFIG[status] || REVIEW_STATUS_CONFIG["needs-review"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      {status === "suggested-approved" ? (
        <ShieldCheck className="w-2.5 h-2.5" />
      ) : (
        <AlertTriangle className="w-2.5 h-2.5" />
      )}
      {cfg.label}
    </span>
  );
}

function ConfidenceDot({ confidence }: { confidence: "high" | "medium" | "low" }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        confidence === "high"
          ? "bg-emerald-400"
          : confidence === "medium"
          ? "bg-amber-400"
          : "bg-red-400"
      }`}
      title={`Confidence: ${confidence}`}
    />
  );
}

// ── Detail Drawer ──────────────────────────────────────────────────────────

function DetailDrawer({
  identity,
  onClose,
  at,
  isDark,
}: {
  identity: TruthIdentity;
  onClose: () => void;
  at: ThemeTokens;
  isDark: boolean;
}) {
  const ev = identity.usageEvidence;
  const sd = identity.shadeDecoding;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl overflow-y-auto flex flex-col ${
        isDark ? "bg-gray-900 border-l border-gray-700" : "bg-white border-l border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 px-5 py-4 flex items-center justify-between border-b ${
          isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${at.textFaint}`}>
            {identity.canonicalBrand} · {identity.canonicalSeries}
          </p>
          <h2 className={`text-xl font-bold truncate ${at.textPrimary}`}>
            {identity.canonicalShade}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`ml-3 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition ${at.filterInactive}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 px-5 py-5 space-y-6">
        {/* Developer exclusion banner */}
        {identity.isDevOxidant && (
          <div className="rounded-xl px-4 py-3 border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-400 mb-0.5">
                Excluded from shade intelligence
              </p>
              <p className="text-xs text-amber-300/70">
                Developer / oxidant products are never treated as color shades. They are part of product truth but excluded from all shade demand, toner, and color-mix analysis.
              </p>
            </div>
          </div>
        )}

        {/* Review status + action */}
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${at.textFaint}`}>
            Review status
          </p>
          <div className="flex flex-wrap gap-2">
            <ReviewBadge status={identity.reviewStatus} />
            <ProductTypeBadge type={identity.productType} />
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium ${
              isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
            }`}>
              <ConfidenceDot confidence={identity.confidence} />
              {identity.confidence} confidence
            </span>
          </div>
          <p className={`mt-2 text-xs ${at.textMuted}`}>
            Suggested action:{" "}
            <span className={`font-medium ${at.textSec}`}>
              {identity.suggestedAction.replace(/-/g, " ")}
            </span>
          </p>
        </div>

        {/* Identity */}
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${at.textFaint}`}>
            Canonical identity
          </p>
          <div className={`rounded-xl p-4 space-y-2 ${at.subCard}`}>
            {[
              { k: "Brand", v: identity.canonicalBrand },
              { k: "Series", v: identity.canonicalSeries },
              { k: "Shade / Label", v: identity.canonicalShade },
              { k: "Product type", v: identity.productTypeLabel },
            ].map((r) => (
              <div key={r.k} className="flex gap-3 text-xs">
                <span className={`w-20 flex-shrink-0 font-medium ${at.textFaint}`}>{r.k}</span>
                <span className={at.textSec}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shade decoding for color shades */}
        {identity.productType === "hair_color_shade" && sd && (
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${at.textFaint}`}>
              Shade decoding
            </p>
            <div className={`rounded-xl p-4 space-y-2 ${at.subCard}`}>
              {[
                { k: "Color line", v: sd.colorLine },
                { k: "Technology", v: sd.colorTechnology },
                { k: "Level", v: sd.level != null ? `${sd.level} – ${sd.levelName}` : null },
                { k: "Family", v: sd.colorFamily },
                { k: "Shade system", v: sd.shadeSystem },
                { k: "Meaning", v: sd.meaning },
              ]
                .filter((r) => r.v)
                .map((r) => (
                  <div key={r.k} className="flex gap-3 text-xs">
                    <span className={`w-24 flex-shrink-0 font-medium ${at.textFaint}`}>{r.k}</span>
                    <span className={at.textSec}>{r.v}</span>
                  </div>
                ))}
              {sd.reflects && sd.reflects.length > 0 && (
                <div className="flex gap-3 text-xs">
                  <span className={`w-24 flex-shrink-0 font-medium ${at.textFaint}`}>Reflects</span>
                  <span className={at.textSec}>
                    {sd.reflects.map((r) => `${r.tone} (${r.role})`).join(" · ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* For other types */}
        {identity.productType !== "hair_color_shade" && sd?.meaning && (
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${at.textFaint}`}>
              Product description
            </p>
            <div className={`rounded-xl p-4 ${at.subCard}`}>
              <p className={`text-xs leading-relaxed ${at.textSec}`}>{sd.meaning}</p>
              {sd.colorLine && (
                <p className={`text-xs mt-1 ${at.textFaint}`}>{sd.colorLine}</p>
              )}
            </div>
          </div>
        )}

        {/* Usage evidence */}
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${at.textFaint}`}>
            Usage evidence
          </p>
          <div className={`rounded-xl p-4 ${at.subCard}`}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { k: "Usage count", v: ev.usageCount.toLocaleString() },
                { k: "Total grams", v: `${(ev.totalGrams / 1000).toFixed(1)} kg` },
                { k: "Salons", v: String(ev.uniqueSalons) },
                { k: "Est. cost", v: `₪${ev.totalCost.toLocaleString()}` },
              ].map((r) => (
                <div key={r.k}>
                  <p className={`text-[10px] font-medium ${at.textFaint}`}>{r.k}</p>
                  <p className={`text-sm font-bold ${at.textPrimary}`}>{r.v}</p>
                </div>
              ))}
            </div>
            {ev.topServices.length > 0 && (
              <>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${at.textFaint}`}>
                  Top services
                </p>
                <div className="space-y-1">
                  {ev.topServices.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <span className={at.textSec}>{s.name}</span>
                      <span className={`font-medium ${at.textPrimary}`}>{s.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Aliases */}
        {identity.aliases.length > 0 && (
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${at.textFaint}`}>
              Aliases observed ({identity.aliases.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {identity.aliases.map((a) => (
                <span
                  key={a}
                  className={`px-2 py-0.5 rounded-full text-[11px] border ${
                    isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
                  }`}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Raw variants */}
        {identity.rawVariants && identity.rawVariants.length > 1 && (
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${at.textFaint}`}>
              Raw observed variants ({identity.rawVariants.length})
            </p>
            <div className={`rounded-xl overflow-hidden ${at.subCard}`}>
              {identity.rawVariants.map((v, i) => (
                <div
                  key={i}
                  className={`flex gap-2 text-xs px-3 py-2 ${
                    i < identity.rawVariants!.length - 1 ? `border-b ${at.rowDivide}` : ""
                  }`}
                >
                  <span className={`flex-1 truncate ${at.textFaint}`}>{v.brand}</span>
                  <span className={`flex-1 truncate ${at.textSec}`}>{v.series}</span>
                  <span className={`font-medium ${at.textPrimary}`}>{v.shade}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source links placeholder */}
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2 ${at.textFaint}`}>
            Verification
          </p>
          <div className={`rounded-xl p-4 border-dashed border-2 text-center ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}>
            <Info className={`w-4 h-4 mx-auto mb-1.5 ${at.textFaint}`} />
            <p className={`text-xs ${at.textFaint}`}>
              {identity.suggestedAction === "verify-official-source"
                ? "Needs official source verification"
                : identity.confidence === "high"
                ? "High confidence — no additional verification required"
                : "Add source links for future verification"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────

export const ProductTruthCenterPanel: React.FC<Props> = ({ isDark, at }) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [showDevsOnly, setShowDevsOnly] = useState(false);
  const [showNeedsReview, setShowNeedsReview] = useState(false);
  const [selectedId, setSelectedId] = useState<TruthIdentity | null>(null);

  const { summary, identities, brandBreakdown } = seed;

  const topBrands = useMemo(
    () => brandBreakdown.slice(0, 10).map((b) => b.brand),
    [brandBreakdown],
  );

  const filtered = useMemo(() => {
    let result = identities as TruthIdentity[];

    if (showDevsOnly) result = result.filter((i) => i.isDevOxidant);
    if (showNeedsReview) result = result.filter((i) => i.reviewStatus !== "suggested-approved");

    if (typeFilter !== "all") result = result.filter((i) => i.productType === typeFilter);
    if (statusFilter !== "all") result = result.filter((i) => i.reviewStatus === statusFilter);
    if (brandFilter !== "all") result = result.filter((i) => i.canonicalBrand === brandFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.canonicalBrand.toLowerCase().includes(q) ||
          i.canonicalSeries.toLowerCase().includes(q) ||
          i.canonicalShade.toLowerCase().includes(q) ||
          i.rawShade.toLowerCase().includes(q) ||
          i.aliases.some((a) => a.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [identities, search, typeFilter, statusFilter, brandFilter, showDevsOnly, showNeedsReview]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setBrandFilter("all");
    setShowDevsOnly(false);
    setShowNeedsReview(false);
  };

  const hasActiveFilters =
    search || typeFilter !== "all" || statusFilter !== "all" || brandFilter !== "all" || showDevsOnly || showNeedsReview;

  return (
    <div className="space-y-6">
      {/* ── Overview cards ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <h2 className={`text-sm font-semibold ${at.textPrimary}`}>Product Truth Overview</h2>
          <span className={`text-xs ${at.textFaint}`}>
            · Evidence from real salon usage · Not final truth until reviewed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Total materials", value: summary.totalMaterials, color: "text-indigo-400" },
            { label: "Unique brands", value: summary.uniqueBrands, color: "text-blue-400" },
            { label: "Unique series", value: summary.uniqueSeries, color: "text-blue-400" },
            { label: "Color shades", value: summary.uniqueShades, color: "text-violet-400" },
            {
              label: "Developers / oxidants",
              value: summary.developerOxidantCount,
              color: "text-amber-400",
              highlight: true,
              note: "excluded from shade intel",
            },
            {
              label: "Needs review",
              value: summary.needsReviewCount,
              color: "text-orange-400",
              highlight: summary.needsReviewCount > 0,
            },
            {
              label: "Duplicate risks",
              value: summary.duplicateRiskCount,
              color: "text-red-400",
              highlight: summary.duplicateRiskCount > 0,
            },
          ].map((card) => (
            <div
              key={card.label}
              className={`rounded-2xl border p-3 ${at.card} ${
                card.highlight ? (isDark ? "ring-1 ring-amber-500/30" : "ring-1 ring-amber-300/40") : ""
              }`}
            >
              <p className={`text-2xl font-bold tracking-tight ${card.color}`}>{card.value}</p>
              <p className={`text-[11px] font-medium mt-0.5 ${at.textMuted}`}>{card.label}</p>
              {card.note && (
                <p className={`text-[10px] mt-0.5 ${at.textFaint}`}>{card.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Developer separation notice ── */}
      <div
        className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
          isDark
            ? "border-amber-500/25 bg-amber-500/8"
            : "border-amber-300/50 bg-amber-50"
        }`}
      >
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className={`text-xs font-semibold ${isDark ? "text-amber-300" : "text-amber-700"}`}>
            Separation rule active
          </p>
          <p className={`text-xs mt-0.5 ${isDark ? "text-amber-300/70" : "text-amber-600"}`}>
            {summary.developerOxidantCount} developer / oxidant products are visible here but excluded from all shade demand, toner, blonde, and color-mix intelligence. They will never be classified as color shades.
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={`rounded-2xl border p-4 space-y-3 ${at.card}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className={`text-xs font-semibold ${at.textPrimary}`}>Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/15 text-indigo-400">
                Active
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className={`text-xs ${at.textFaint} hover:${at.textMuted} transition`}
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${at.textFaint}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Brand, series, shade..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 ${at.input}`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${at.textFaint}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Product type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ProductType | "all")}
            className={`px-3 py-2 rounded-xl border text-xs focus:outline-none cursor-pointer ${at.select}`}
          >
            {PRODUCT_TYPE_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Review status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | "all")}
            className={`px-3 py-2 rounded-xl border text-xs focus:outline-none cursor-pointer ${at.select}`}
          >
            {REVIEW_STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Brand */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs focus:outline-none cursor-pointer ${at.select}`}
          >
            <option value="all">All brands</option>
            {topBrands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Quick-filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowDevsOnly((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition ${
              showDevsOnly
                ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                : `${at.filterInactive}`
            }`}
          >
            <EyeOff className="w-3 h-3 inline mr-1" />
            Developers only
          </button>
          <button
            type="button"
            onClick={() => setShowNeedsReview((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition ${
              showNeedsReview
                ? "border-orange-500/40 bg-orange-500/15 text-orange-400"
                : `${at.filterInactive}`
            }`}
          >
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Needs review only
          </button>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${at.textPrimary}`}>
          {filtered.length.toLocaleString()} identities
        </span>
        {hasActiveFilters && (
          <span className={`text-xs ${at.textFaint}`}>
            (filtered from {identities.length.toLocaleString()})
          </span>
        )}
      </div>

      {/* ── Main list ── */}
      <div className={`rounded-2xl border overflow-hidden ${at.card}`}>
        {/* Table header */}
        <div
          className={`hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_80px_100px_90px] gap-3 px-4 py-2 border-b text-[10px] font-semibold uppercase tracking-wider ${
            isDark ? "border-gray-700 bg-gray-800/50 text-gray-500" : "border-gray-100 bg-gray-50 text-gray-400"
          }`}
        >
          <span>Brand · Series</span>
          <span>Shade / Label</span>
          <span>Type</span>
          <span>Status</span>
          <span className="text-right">Usage</span>
          <span className="text-right">Confidence</span>
          <span></span>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: isDark ? "rgb(55,65,81,0.4)" : "rgb(243,244,246)" }}>
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Search className={`w-6 h-6 mx-auto mb-2 ${at.textFaint}`} />
              <p className={`text-sm ${at.textFaint}`}>No identities match the current filters.</p>
            </div>
          ) : (
            filtered.slice(0, 200).map((identity) => (
              <IdentityRow
                key={identity.canonicalId}
                identity={identity}
                isSelected={selectedId?.canonicalId === identity.canonicalId}
                onSelect={() =>
                  setSelectedId(
                    selectedId?.canonicalId === identity.canonicalId ? null : identity,
                  )
                }
                at={at}
                isDark={isDark}
              />
            ))
          )}
        </div>

        {filtered.length > 200 && (
          <div className={`px-4 py-3 border-t text-center text-xs ${at.textFaint} ${
            isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-100 bg-gray-50/50"
          }`}>
            Showing first 200 of {filtered.length.toLocaleString()} — narrow filters to see more.
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      {selectedId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setSelectedId(null)}
          />
          <DetailDrawer
            identity={selectedId}
            onClose={() => setSelectedId(null)}
            at={at}
            isDark={isDark}
          />
        </>
      )}
    </div>
  );
};

// ── Identity row ───────────────────────────────────────────────────────────

function IdentityRow({
  identity,
  isSelected,
  onSelect,
  at,
  isDark,
}: {
  identity: TruthIdentity;
  isSelected: boolean;
  onSelect: () => void;
  at: ThemeTokens;
  isDark: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left transition-colors ${at.rowHover} ${
        isSelected ? (isDark ? "bg-indigo-500/10" : "bg-indigo-50") : ""
      }`}
    >
      {/* Desktop layout */}
      <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_80px_100px_90px] gap-3 items-center px-4 py-3">
        {/* Brand + series */}
        <div className="min-w-0">
          <p className={`text-xs font-semibold truncate ${at.textPrimary}`}>
            {identity.canonicalBrand}
          </p>
          <p className={`text-[11px] truncate ${at.textFaint}`}>{identity.canonicalSeries}</p>
        </div>

        {/* Shade */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
              {identity.isDevOxidant && (
              <EyeOff className="w-3 h-3 text-amber-400 flex-shrink-0" />
            )}
            <p className={`text-xs font-semibold truncate ${at.textPrimary}`}>
              {identity.canonicalShade}
            </p>
          </div>
          {identity.aliases.length > 0 && (
            <p className={`text-[10px] ${at.textFaint}`}>
              {identity.aliases.length} alias{identity.aliases.length > 1 ? "es" : ""}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <ProductTypeBadge type={identity.productType} small />
        </div>

        {/* Status */}
        <div>
          <ReviewBadge status={identity.reviewStatus} />
        </div>

        {/* Usage count */}
        <div className="text-right">
          <p className={`text-xs font-semibold tabular-nums ${at.textPrimary}`}>
            {identity.usageEvidence.usageCount.toLocaleString()}
          </p>
          <p className={`text-[10px] ${at.textFaint}`}>uses</p>
        </div>

        {/* Confidence */}
        <div className="flex items-center justify-end gap-1.5">
          <ConfidenceDot confidence={identity.confidence} />
          <span className={`text-[11px] ${at.textFaint}`}>{identity.confidence}</span>
        </div>

        {/* Expand icon */}
        <div className="flex justify-end">
          <Eye className={`w-3.5 h-3.5 ${at.textFaint}`} />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden px-4 py-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-semibold truncate ${at.textPrimary}`}>
              {identity.canonicalBrand} · {identity.canonicalSeries}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {identity.isDevOxidant && (
                <EyeOff className="w-3 h-3 text-amber-400 flex-shrink-0" />
              )}
              <p className={`text-sm font-bold ${at.textPrimary}`}>{identity.canonicalShade}</p>
            </div>
          </div>
          <Eye className={`w-3.5 h-3.5 flex-shrink-0 mt-1 ${at.textFaint}`} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <ProductTypeBadge type={identity.productType} small />
          <ReviewBadge status={identity.reviewStatus} />
          <span className={`text-[10px] ${at.textFaint}`}>
            {identity.usageEvidence.usageCount.toLocaleString()} uses
          </span>
        </div>
      </div>
    </button>
  );
}

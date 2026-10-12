import React, { useState, useMemo } from "react";
import { getCompetitorData } from "./data/competitorsData2026";
import type {
  Competitor,
  FeatureScore,
  AIPresence,
  AIEvidence,
  PricingTransparency,
  FeatureScores,
  CompetitiveSegment,
  SpectraProductArea,
  CapabilityStatus,
  ColorCostProfile,
} from "./types";

// ── Badge palettes ───────────────────────────────────────────────────

const AI_PRESENCE_COLORS: Record<AIPresence, string> = {
  "AI-first": "bg-violet-50 text-violet-700 border-violet-200",
  Embedded: "bg-blue-50 text-blue-700 border-blue-200",
  Limited: "bg-amber-50 text-amber-700 border-amber-200",
  None: "bg-gray-100 text-gray-400 border-gray-200",
  "Not verified": "bg-gray-100 text-gray-600 border-gray-200",
};

const AI_EVIDENCE_COLORS: Record<AIEvidence, string> = {
  "Verified in-product": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Vendor-claimed": "bg-amber-50 text-amber-700 border-amber-200",
  Unclear: "bg-gray-100 text-gray-500 border-gray-200",
};

const TRANSPARENCY_COLORS: Record<PricingTransparency, string> = {
  High: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  "Medium-Low": "bg-orange-50 text-orange-700 border-orange-200",
  Low: "bg-red-50 text-red-600 border-red-200",
};

const SCORE_COLORS: Record<FeatureScore, string> = {
  Strong: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  Weak: "bg-red-50 text-red-700 border-red-200",
  Unknown: "bg-gray-100 text-gray-400 border-gray-200",
};

const SEGMENT_LABELS: Record<CompetitiveSegment, string> = {
  "cost-optimization": "Color & Cost Management",
  "salon-management": "Salon Management Platform",
};

const PRODUCT_LABELS: Record<SpectraProductArea, string> = {
  "color-intelligence": "Color Intelligence",
  "salon-os": "SalonOS",
  "salon-ai": "Salon AI",
};

const COLOR_COST_FIELDS: { key: keyof ColorCostProfile; label: string }[] = [
  { key: "weighing", label: "Weighing" },
  { key: "leftovers", label: "Leftovers & waste" },
  { key: "formulas", label: "Formulas" },
  { key: "billing", label: "Material billing" },
  { key: "inventory", label: "Inventory" },
  { key: "procurement", label: "Procurement" },
  { key: "integrations", label: "Integrations" },
];

const CAPABILITY_COLORS: Record<CapabilityStatus, string> = {
  Verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
  "In development": "bg-blue-50 text-blue-700 border-blue-200",
  "Not verified": "bg-gray-100 text-gray-500 border-gray-200",
};

const SPECTRA_COLOR_COST: ColorCostProfile = {
  weighing: { status: "Verified", detail: "Smart-scale data available today" },
  leftovers: { status: "Partial", detail: "Actual usage supports waste visibility; dedicated workflow scope should be confirmed" },
  formulas: { status: "Verified", detail: "Formula and material-use foundation available today" },
  billing: { status: "In development", detail: "Treatment-cost visibility exists; automated billing is part of the broader platform expansion" },
  inventory: { status: "In development", detail: "Connected inventory actions are part of the SalonOS expansion" },
  procurement: { status: "In development", detail: "Supplier and purchasing actions are a future direction" },
  integrations: { status: "In development", detail: "SalonOS integration layer is being expanded" },
};

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${colorClass}`}>
      {label}
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function parseEntryPrice(s: string): number {
  const match = s.match(/\$?([\d.]+)/);
  return match ? parseFloat(match[1]) : Infinity;
}

const FEATURE_LABELS: Record<keyof FeatureScores, string> = {
  booking: "Booking & Calendar",
  payments: "Payments & POS",
  operations: "Operations",
  clientCRM: "Client CRM",
  marketing: "Marketing",
  ai: "AI",
  analytics: "Analytics",
  teamStaff: "Team & Staff",
};

function computeFeatureAnalysis(competitors: Competitor[]) {
  const keys = Object.keys(FEATURE_LABELS) as (keyof FeatureScores)[];
  const total = competitors.length;

  const tableStakes: { key: keyof FeatureScores; label: string; strongCount: number }[] = [];
  const differentiation: { key: keyof FeatureScores; label: string; strongCount: number; scores: Record<FeatureScore, number> }[] = [];

  for (const key of keys) {
    const strongCount = competitors.filter((c) => c.features[key] === "Strong").length;
    const scores: Record<FeatureScore, number> = { Strong: 0, Moderate: 0, Weak: 0, Unknown: 0 };
    for (const c of competitors) scores[c.features[key]]++;

    if (strongCount >= total - 1) {
      tableStakes.push({ key, label: FEATURE_LABELS[key], strongCount });
    } else {
      differentiation.push({ key, label: FEATURE_LABELS[key], strongCount, scores });
    }
  }

  tableStakes.sort((a, b) => b.strongCount - a.strongCount);
  differentiation.sort((a, b) => a.strongCount - b.strongCount);

  return { tableStakes, differentiation, total };
}

function parseLeadingPercent(s: string): number | null {
  const match = s.match(/([\d.]+)%/);
  return match ? parseFloat(match[1]) : null;
}

function computePricingKPIs(competitors: Competitor[]) {
  const numericPrices = competitors
    .map((c) => ({ name: c.name, price: parseEntryPrice(c.pricing.entryPrice), raw: c.pricing.entryPrice }))
    .filter((p) => p.price !== Infinity);

  const sorted = [...numericPrices].sort((a, b) => a.price - b.price);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = numericPrices.length > 0
    ? Math.round(numericPrices.reduce((s, p) => s + p.price, 0) / numericPrices.length)
    : 0;

  const transparentCount = competitors.filter(
    (c) => c.pricing.transparency === "High" || c.pricing.transparency === "Medium",
  ).length;

  const feeValues = competitors
    .map((c) => parseLeadingPercent(c.pricing.processingFees))
    .filter((v): v is number => v !== null);
  const avgFee = feeValues.length > 0
    ? (feeValues.reduce((s, v) => s + v, 0) / feeValues.length).toFixed(1)
    : "N/A";
  const minFee = feeValues.length > 0 ? Math.min(...feeValues).toFixed(1) : "N/A";
  const maxFee = feeValues.length > 0 ? Math.max(...feeValues).toFixed(1) : "N/A";

  return {
    rangeLabel: min && max ? `${min.raw.replace("/mo", "")} – ${max.raw}` : "Varies",
    avgLabel: `~$${avg}/mo`,
    transparentCount,
    opaqueCount: competitors.length - transparentCount,
    avgFee,
    feeRange: `${minFee}%–${maxFee}%`,
  };
}

// ── Main component ───────────────────────────────────────────────────

export function CompetitorsPage() {
  const { competitors, lastUpdated } = getCompetitorData();
  const [showFullMatrix, setShowFullMatrix] = useState(false);
  const [activeSegment, setActiveSegment] = useState<CompetitiveSegment>("salon-management");

  const visibleCompetitors = useMemo(
    () => competitors
      .filter((competitor) => (competitor.segments || ["salon-management"]).includes(activeSegment))
      .sort((a, b) => Number(b.primarySegment === activeSegment) - Number(a.primarySegment === activeSegment)),
    [activeSegment, competitors],
  );
  const pricingKPIs = useMemo(() => computePricingKPIs(visibleCompetitors), [visibleCompetitors]);
  const featureAnalysis = useMemo(() => computeFeatureAnalysis(visibleCompetitors), [visibleCompetitors]);
  const aiRanking = useMemo(() => {
    return [...visibleCompetitors].sort(
      (a, b) => (b.ai.breadth + b.ai.narrativeCriticality) - (a.ai.breadth + a.ai.narrativeCriticality),
    );
  }, [visibleCompetitors]);

  const priceSorted = useMemo(() => {
    return [...visibleCompetitors].sort((a, b) => parseEntryPrice(a.pricing.entryPrice) - parseEntryPrice(b.pricing.entryPrice));
  }, [visibleCompetitors]);

  return (
    <div className="min-h-[100dvh] font-sans antialiased" style={{ background: "#FAFAF8" }}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at top center, rgba(234,183,118,0.08) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pt-20 pb-14">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#999]">
              Competitive Intelligence
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight mb-5 leading-[1.1] tracking-[-0.02em] text-[#1A1A1A]">
            Competitive{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
              Landscape
            </span>
          </h1>

          <p className="text-lg font-light max-w-2xl text-[#777]">
            How Spectra compares against{" "}
            <span className="text-[#1A1A1A] font-medium">{competitors.length}</span>{" "}
            leading salon and beauty-tech platforms — and where the whitespace lies.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#999]">
            Verified against official company announcements, product documentation and pricing pages.
            This confirms what vendors publish — not independent testing of execution quality.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pb-24 space-y-24">

        <section>
          <SectionTitle>Two Different Competitive Arenas</SectionTitle>
          <p className="mb-7 max-w-3xl font-light leading-relaxed text-[#777]">
            “Direct” and “indirect” depend on the product capability being compared. A management
            platform can complement Spectra’s scale product while competing with SalonOS or Salon AI.
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <SegmentCard
              active={activeSegment === "cost-optimization"}
              title="Color & Cost Management"
              subtitle="Treatment economics"
              count={competitors.filter((c) => c.segments?.includes("cost-optimization")).length}
              description="Weighing, formulas, waste, treatment cost, material billing, inventory and procurement. These products compete directly with Color Intelligence."
              note="Includes direct specialists Vish and SalonScale, plus Zenoti where its inventory capability overlaps."
              onClick={() => {
                setActiveSegment("cost-optimization");
                setShowFullMatrix(false);
              }}
            />
            <SegmentCard
              active={activeSegment === "salon-management"}
              title="Salon Management Platforms"
              subtitle="Business operations"
              count={competitors.filter((c) => c.segments?.includes("salon-management")).length}
              description="CRM, booking, payments, staff, marketing and reporting. These platforms compete with Spectra’s expansion into SalonOS and Salon AI."
              note="The nine-company dataset is primarily focused on this group."
              onClick={() => {
                setActiveSegment("salon-management");
                setShowFullMatrix(false);
              }}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-[#EAB776]/25 bg-[#EAB776]/[0.06] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A6B3C]">Where Spectra sits</p>
            <p className="mt-2 max-w-4xl text-base leading-relaxed text-[#555]">
              Spectra started inside the professional service itself — weighing, formulas and actual
              material consumption — and is expanding into salon management and AI-driven actions.
              The defensible connection is treatment → cost → inventory → profitability.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <StatusCard
                label="Available today"
                items={["Smart-scale data", "Formula and material-use foundation", "Treatment-cost visibility"]}
                tone="live"
              />
              <StatusCard
                label="In development"
                items={["SalonOS management expansion", "Salon AI actions and recommendations"]}
                tone="development"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 1: Market Pricing at a Glance                      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeSegment === "salon-management" && (
        <section>
          <SectionTitle>Market Pricing at a Glance</SectionTitle>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <KPICard label="Price Range" value={pricingKPIs.rangeLabel} />
            <KPICard label="Avg Entry Price" value={pricingKPIs.avgLabel} />
            <KPICard label="Avg Processing Fee" value={`~${pricingKPIs.avgFee}%`} sub={pricingKPIs.feeRange} />
            <KPICard label="Public Pricing" value={`${pricingKPIs.transparentCount}/${visibleCompetitors.length}`} sub="competitors" />
          </div>

          {/* Pricing table */}
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm" role="table">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999] whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                      Competitor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999] whitespace-nowrap">Plans &amp; Pricing</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999] whitespace-nowrap">Processing Fees</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999] whitespace-nowrap">Scale</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999] whitespace-nowrap">Countries</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999] whitespace-nowrap">Funding</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999] whitespace-nowrap">Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {priceSorted.map((c, i) => (
                    <tr
                      key={c.id}
                      className={`border-b border-black/[0.04] hover:bg-[#EAB776]/[0.04] transition-colors ${i % 2 ? "bg-gray-50/40" : ""}`}
                    >
                      <td className="sticky left-0 bg-white px-4 py-3 whitespace-nowrap z-[1]">
                        <span className="font-medium text-[#1A1A1A]">{c.name}</span>
                        <div className="mt-1 flex max-w-[180px] flex-wrap gap-1">
                          <Badge label={c.pricing.transparency} colorClass={TRANSPARENCY_COLORS[c.pricing.transparency]} />
                          {(c.competesWith || []).map((area) => (
                            <Badge key={area} label={PRODUCT_LABELS[area]} colorClass="bg-violet-50 text-violet-700 border-violet-200" />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {c.pricing.plans && c.pricing.plans.length > 0 ? (
                          <div className="space-y-1">
                            {c.pricing.plans.map((p, pi) => (
                              <div key={pi} className="flex items-baseline gap-2 text-sm">
                                <span className="text-[#999] min-w-[90px]">{p.name}</span>
                                <span className="font-medium text-[#1A1A1A]">{p.price}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#1A1A1A] font-medium">{c.pricing.entryPrice}</span>
                        )}
                        {c.pricing.marketplaceCommission !== "None" && (
                          <p className="text-xs text-amber-600 font-medium mt-1">
                            + {c.pricing.marketplaceCommission}
                          </p>
                        )}
                        {c.pricing.entryPriceNote && (
                          <p className="mt-1.5 max-w-[240px] text-[11px] leading-relaxed text-[#999]">
                            {c.pricing.entryPriceNote}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#555] text-xs max-w-[200px] align-top">
                        {c.pricing.processingFees}
                      </td>
                      <td className="px-4 py-3 text-[#777] text-xs max-w-[180px] align-top">
                        {c.scale || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#777] text-xs max-w-[180px] align-top">
                        {c.countries || "—"}
                      </td>
                      <td className="px-4 py-3 text-[#777] text-xs max-w-[220px] align-top">
                        {c.funding || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-[#777] text-xs max-w-[220px] align-top">
                        {c.valuation || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-[#BBB] mt-4">
            Prices and processing fees vary by region, currency, and promotional terms. Data from official pricing pages as of {lastUpdated}.
          </p>
        </section>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 2: Table-Stakes Features                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeSegment === "salon-management" && (
        <section>
          <SectionTitle>Features Everyone Has (Table-Stakes)</SectionTitle>
          <p className="text-[#777] font-light mb-8 max-w-2xl">
            These capabilities are offered by nearly every competitor. They represent the minimum
            bar Spectra must meet to be taken seriously.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {featureAnalysis.tableStakes.map((f) => (
              <div
                key={f.key}
                className="bg-white border border-black/[0.06] rounded-2xl p-5 shadow-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[#1A1A1A] text-base">{f.label}</p>
                  <p className="text-sm text-[#999]">
                    {f.strongCount}/{featureAnalysis.total} competitors are Strong
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Differentiation opportunities */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-1">
              Differentiation Opportunities
            </h3>
            <p className="text-sm text-[#999] mb-5">
              These features have mixed scores — competitors are not uniformly strong here. Spectra can stand out.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featureAnalysis.differentiation.map((f) => (
                <div
                  key={f.key}
                  className="bg-[#EAB776]/[0.05] border border-[#EAB776]/20 rounded-2xl p-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#B18059]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A1A] text-base">{f.label}</p>
                    <p className="text-sm text-[#777]">
                      Only {f.strongCount}/{featureAnalysis.total} are Strong
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {f.scores.Strong > 0 && <Badge label={`${f.scores.Strong} Strong`} colorClass={SCORE_COLORS.Strong} />}
                      {f.scores.Moderate > 0 && <Badge label={`${f.scores.Moderate} Moderate`} colorClass={SCORE_COLORS.Moderate} />}
                      {f.scores.Unknown > 0 && <Badge label={`${f.scores.Unknown} Unknown`} colorClass={SCORE_COLORS.Unknown} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible full matrix */}
          <button
            onClick={() => setShowFullMatrix(!showFullMatrix)}
            className="text-sm text-[#B18059] hover:text-[#8A6540] font-medium transition-colors flex items-center gap-1"
          >
            {showFullMatrix ? "Hide" : "Show"} full feature matrix
            <svg
              className={`w-4 h-4 transition-transform ${showFullMatrix ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFullMatrix && (
            <div className="mt-4 bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-gray-50/60">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999] whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                        Competitor
                      </th>
                      {(Object.keys(FEATURE_LABELS) as (keyof FeatureScores)[]).map((k) => (
                        <th key={k} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999] whitespace-nowrap">
                          {FEATURE_LABELS[k]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCompetitors.map((c, i) => (
                      <tr key={c.id} className={`border-b border-black/[0.04] ${i % 2 ? "bg-gray-50/40" : ""}`}>
                        <td className="sticky left-0 bg-white px-4 py-3 font-medium text-[#1A1A1A] whitespace-nowrap z-[1]">
                          {c.name}
                        </td>
                        {(Object.keys(FEATURE_LABELS) as (keyof FeatureScores)[]).map((k) => (
                          <td key={k} className="px-4 py-3 whitespace-nowrap">
                            <Badge label={c.features[k]} colorClass={SCORE_COLORS[c.features[k]]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
        )}

        {activeSegment === "cost-optimization" && (
          <>
            <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Coverage note</p>
              <h2 className="mt-2 text-2xl font-light text-[#1A1A1A]">Direct specialists and an overlapping platform</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#666]">
                Vish and SalonScale are direct Color Intelligence competitors. Zenoti appears because
                AI Inventory overlaps inventory and procurement, but its core product is a full salon
                platform. Pricing averages and generic “table-stakes” remain hidden because the sample
                is not an exhaustive market map and the commercial models differ.
              </p>
            </section>

            <section>
              <SectionTitle>Color &amp; Cost Capability Comparison</SectionTitle>
              <p className="mb-7 max-w-3xl font-light leading-relaxed text-[#777]">
                Verified capability detail matters more than a single score. “Partial” means the
                workflow exists with an important limitation; “Not verified” is not the same as absent.
              </p>
              <ColorCostMatrix competitors={visibleCompetitors} />
            </section>

            <section>
              <SectionTitle>Published Color &amp; Cost Pricing</SectionTitle>
              <p className="mb-7 max-w-3xl font-light leading-relaxed text-[#777]">
                Subscription, hardware and integration charges are shown separately so the entry
                price is not mistaken for the complete cost of adoption.
              </p>
              <ColorCostPricing competitors={visibleCompetitors} />
            </section>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 3: Verified AI capabilities                         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>{SEGMENT_LABELS[activeSegment]} — What the AI Actually Does</SectionTitle>
          <p className="text-[#777] font-light mb-8 max-w-3xl">
            A capability-level comparison: action completed, channel, availability, price and the
            most important limitation. Sending a booking link is not scored as completing a booking.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {aiRanking.map((c) => (
              <article
                key={c.id}
                className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-lg font-medium text-[#1A1A1A]">{c.name}</h3>
                    <p className="text-sm text-[#777]">{c.ai.product || "No verified AI product"}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge label={c.ai.presence} colorClass={AI_PRESENCE_COLORS[c.ai.presence]} />
                    <Badge label={c.ai.availability || "Availability unclear"} colorClass="bg-gray-50 text-gray-600 border-gray-200" />
                    {(c.competesWith || []).map((area) => (
                      <Badge key={area} label={PRODUCT_LABELS[area]} colorClass="bg-violet-50 text-violet-700 border-violet-200" />
                    ))}
                  </div>
                </div>

                <CapabilityRow label="Does">
                  <div className="flex flex-wrap gap-1.5">
                    {(c.ai.actions?.length ? c.ai.actions : ["No comparable AI action verified"]).map((action) => (
                      <span key={action} className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                        {action}
                      </span>
                    ))}
                  </div>
                </CapabilityRow>
                <CapabilityRow label="Channels">
                  {(c.ai.channels?.length ? c.ai.channels : ["Not verified"]).join(" · ")}
                </CapabilityRow>
                <CapabilityRow label="AI price">{c.ai.price || "Not documented"}</CapabilityRow>
                <CapabilityRow label="Limits">
                  <ul className="space-y-1">
                    {(c.ai.limitations || ["Not documented"]).map((limitation) => (
                      <li key={limitation} className="flex items-start gap-2">
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-amber-500" />
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </CapabilityRow>

                <div className="mt-5 border-t border-black/[0.06] pt-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999]">
                    Verified {c.ai.verifiedAt || lastUpdated}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {(c.ai.sources || []).map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#9A6B3C] underline decoration-[#EAB776]/50 underline-offset-2 hover:text-[#704B2A]"
                      >
                        {source.label}{source.publishedAt ? ` · ${source.publishedAt}` : ""}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 4: AI Strength Ranking                             */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {visibleCompetitors.length > 1 && (
        <section>
          <SectionTitle>{SEGMENT_LABELS[activeSegment]} — AI Strength Ranking</SectionTitle>
          <p className="text-[#777] font-light mb-8 max-w-2xl">
            {activeSegment === "cost-optimization"
              ? "AI is treated as a capability inside this group. “Not verified” means the reviewed official material did not document a comparable agent — not that no AI exists."
              : "How deeply each competitor has integrated AI into its product. Scored on breadth and product criticality, with an evidence tag distinguishing vendor documentation from independent verification."}
          </p>

          <div className="bg-white border border-black/[0.06] rounded-2xl shadow-sm overflow-hidden divide-y divide-black/[0.04]">
            {aiRanking.map((c, i) => {
              const total = c.ai.breadth + c.ai.narrativeCriticality;
              const pct = (total / 10) * 100;
              return (
                <div key={c.id} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Rank + name */}
                  <div className="flex items-center gap-4 sm:w-48 flex-shrink-0">
                    <span className="text-2xl font-light text-[#BBB] w-8 text-right">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{c.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge label={c.ai.presence} colorClass={AI_PRESENCE_COLORS[c.ai.presence]} />
                        <Badge label={c.ai.evidence} colorClass={AI_EVIDENCE_COLORS[c.ai.evidence]} />
                      </div>
                    </div>
                  </div>

                  {/* Bar + score */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: pct > 60
                              ? "linear-gradient(90deg, #7C3AED, #8B5CF6)"
                              : pct > 30
                                ? "linear-gradient(90deg, #EAB776, #C08A50)"
                                : "#D1D5DB",
                          }}
                        />
                      </div>
                      <span className="text-lg font-semibold text-[#1A1A1A] w-14 text-right tabular-nums">
                        {total}/10
                      </span>
                    </div>
                    <p className="text-sm text-[#999] leading-relaxed">
                      {c.ai.rationale}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Where Spectra Wins                                         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>
            {activeSegment === "cost-optimization"
              ? "Where Spectra Must Prove Advantage"
              : `Where Spectra Wins in ${SEGMENT_LABELS[activeSegment]}`}
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {activeSegment === "salon-management" && (
            <AdvantageCard
              title="Product Simplicity"
              items={[
                "Faster onboarding vs enterprise-grade complexity (Zenoti, Mindbody)",
                "Intuitive daily workflows that don't require training",
                "Mobile-first UX designed for solo stylists and small teams",
              ]}
              accent="gold"
            />
            )}
            <AdvantageCard
              title="Operational Data Advantage"
              items={[
                "Connect formula → actual material usage → treatment cost → inventory → profitability",
                "Turn measured salon work into decisions and actions, not just reporting",
                "Prove gram- and formula-level accuracy against Zenoti's inventory forecasting",
              ]}
              accent="blue"
            />
            {activeSegment === "salon-management" && (
              <AdvantageCard
              title="Pricing Clarity"
              items={[
                "Transparent, predictable pricing with no hidden add-ons",
                "No marketplace commissions eroding salon margins",
                "Clear value-per-tier communication for every plan",
              ]}
              accent="emerald"
            />
            )}
            <AdvantageCard
              title="Salon-Specific Depth"
              items={[
                "Build a connected hair-data layer from scale, formula and treatment history",
                "Purpose-built for hair salons, not generic beauty/fitness",
                "Deeper vertical workflows: color management, product usage, formulas",
              ]}
              accent="amber"
            />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Competitor-by-Competitor Opportunity                        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>{SEGMENT_LABELS[activeSegment]} — Competitor Opportunity</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleCompetitors.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-medium text-[#1A1A1A] mb-2">{c.name}</p>
                <p className="text-sm text-[#777] leading-relaxed">
                  {c.differentiationNote}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#EAB776]/25 bg-[#EAB776]/[0.06] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9A6B3C]">Research priorities</p>
          <h2 className="mt-2 text-2xl font-light text-[#1A1A1A]">What Spectra should verify next</h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-3">
            {(activeSegment === "cost-optimization"
              ? [
                  ["1", "Expand specialist coverage", "Keep adding verified color and cost-management vendors beyond Vish and SalonScale as the market evolves."],
                  ["2", "Zenoti inventory depth", "Determine whether consumption is measured from actual material use and formulas, or estimated from services."],
                  ["3", "Defensible proof", "Demonstrate formula → grams → cost → stock → margin → recommended action with real salon data."],
                ]
              : [
                  ["1", "Front-desk execution", "Test GlossGenius, Phorest and Fresha on full task completion, customer context and commercial packaging."],
                  ["2", "Commercial packaging", "Compare what is bundled, what is an add-on, and the incremental price a salon owner must pay."],
                  ["3", "Defensible proof", "Show why measured treatment data makes SalonOS and Salon AI decisions more accurate than generic platform data."],
                ]
            ).map(([number, title, copy]) => (
              <li key={number} className="rounded-xl border border-black/[0.06] bg-white/80 p-5">
                <span className="text-xs font-semibold text-[#B18059]">{number}</span>
                <p className="mt-2 font-medium text-[#1A1A1A]">{title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#777]">{copy}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function ColorCostMatrix({ competitors }: { competitors: Competitor[] }) {
  const rows = [
    { id: "spectra", name: "Spectra", profile: SPECTRA_COLOR_COST, spectra: true },
    ...competitors
      .filter((competitor): competitor is Competitor & { colorCost: ColorCostProfile } => Boolean(competitor.colorCost))
      .map((competitor) => ({
        id: competitor.id,
        name: competitor.name,
        profile: competitor.colorCost,
        spectra: false,
      })),
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] bg-gray-50/70">
              <th className="sticky left-0 z-10 min-w-[150px] bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999]">
                Product
              </th>
              {COLOR_COST_FIELDS.map((field) => (
                <th key={field.key} className="min-w-[135px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#999]">
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className={`border-b border-black/[0.04] align-top ${row.spectra ? "bg-[#EAB776]/[0.06]" : index % 2 ? "bg-white" : "bg-gray-50/30"}`}>
                <th className={`sticky left-0 z-[1] px-4 py-4 text-left ${row.spectra ? "bg-[#FCF7EF]" : "bg-white"}`}>
                  <span className="font-semibold text-[#1A1A1A]">{row.name}</span>
                  {row.spectra && <p className="mt-1 text-[11px] font-normal text-[#9A6B3C]">Today vs roadmap</p>}
                </th>
                {COLOR_COST_FIELDS.map((field) => {
                  const capability = row.profile[field.key];
                  return (
                    <td key={field.key} className="px-4 py-4">
                      <Badge label={capability.status} colorClass={CAPABILITY_COLORS[capability.status]} />
                      <p className="mt-2 text-xs leading-relaxed text-[#666]">{capability.detail}</p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-black/[0.06] px-4 py-3 text-xs text-[#999] sm:hidden">
        Swipe horizontally to compare all capabilities.
      </p>
    </div>
  );
}

function ColorCostPricing({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {competitors.map((competitor) => (
        <article key={competitor.id} className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-medium text-[#1A1A1A]">{competitor.name}</h3>
              <p className="mt-1 text-sm text-[#777]">{competitor.pricing.model}</p>
            </div>
            <Badge label={competitor.pricing.entryPrice} colorClass="bg-[#EAB776]/10 text-[#8A5D31] border-[#EAB776]/30" />
          </div>
          {competitor.pricing.entryPriceNote && (
            <p className="mt-3 text-xs leading-relaxed text-[#999]">{competitor.pricing.entryPriceNote}</p>
          )}
          <div className="mt-5 space-y-2 border-t border-black/[0.06] pt-4">
            {(competitor.pricing.plans || []).map((plan) => (
              <div key={`${competitor.id}-${plan.name}`} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-[#777]">{plan.name}</span>
                <span className="text-right font-medium text-[#1A1A1A]">{plan.price}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function SegmentCard({
  active,
  title,
  subtitle,
  count,
  description,
  note,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  count: number;
  description: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-2xl border p-6 text-left transition-all ${
        active
          ? "border-[#C89357] bg-white shadow-md ring-1 ring-[#EAB776]/30"
          : "border-black/[0.07] bg-white/70 shadow-sm hover:border-[#EAB776]/50 hover:bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#999]">{subtitle}</p>
          <h3 className="mt-1.5 text-xl font-medium text-[#1A1A1A]">{title}</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          active ? "bg-[#EAB776]/20 text-[#8A5D31]" : "bg-gray-100 text-[#777]"
        }`}>
          {count} verified
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[#555]">{description}</p>
      <p className="mt-3 text-xs leading-relaxed text-[#999]">{note}</p>
    </button>
  );
}

function StatusCard({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "live" | "development";
}) {
  const live = tone === "live";
  return (
    <div className={`rounded-xl border p-4 ${live ? "border-emerald-200 bg-emerald-50/70" : "border-blue-200 bg-blue-50/70"}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${live ? "text-emerald-700" : "text-blue-700"}`}>
        {label}
      </p>
      <ul className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[#555]">
            <span className={`mt-2 h-1.5 w-1.5 flex-none rounded-full ${live ? "bg-emerald-500" : "bg-blue-500"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CapabilityRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[82px_minmax(0,1fr)] gap-3 border-t border-black/[0.05] py-3 first:border-t-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#999]">{label}</p>
      <div className="text-sm leading-relaxed text-[#555]">{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-1 h-7 rounded-full bg-gradient-to-b from-[#EAB776] to-[#B18059]" />
      <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#1A1A1A]">{children}</h2>
    </div>
  );
}

function KPICard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-black/[0.06] rounded-xl px-4 py-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#999] mb-1">{label}</p>
      <p className="text-xl font-semibold text-[#1A1A1A] tracking-tight leading-tight">
        {value}
        {sub && <span className="text-xs font-normal text-[#999] ml-1">{sub}</span>}
      </p>
    </div>
  );
}

const ACCENT_MAP: Record<string, { border: string; bg: string; title: string; dot: string }> = {
  gold: {
    border: "border-[#EAB776]/30",
    bg: "bg-[#EAB776]/[0.06]",
    title: "text-[#B18059]",
    dot: "bg-[#C08A50]",
  },
  blue: {
    border: "border-blue-200",
    bg: "bg-blue-50/60",
    title: "text-blue-700",
    dot: "bg-blue-500",
  },
  emerald: {
    border: "border-emerald-200",
    bg: "bg-emerald-50/60",
    title: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  amber: {
    border: "border-amber-200",
    bg: "bg-amber-50/60",
    title: "text-amber-700",
    dot: "bg-amber-500",
  },
};

function AdvantageCard({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  const a = ACCENT_MAP[accent] ?? ACCENT_MAP.gold;
  return (
    <div className={`${a.bg} border ${a.border} rounded-2xl p-6 flex flex-col gap-3`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${a.title}`}>
        {title}
      </p>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[#555] leading-relaxed">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

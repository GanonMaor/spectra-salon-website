import React, { useState, useMemo } from "react";
import { getCompetitorData } from "./data/competitorsData";
import type {
  Competitor,
  FeatureScore,
  AIPresence,
  AIEvidence,
  PricingTransparency,
  FeatureScores,
} from "./types";

// ── Badge palettes ───────────────────────────────────────────────────

const AI_PRESENCE_COLORS: Record<AIPresence, string> = {
  "AI-first": "bg-violet-50 text-violet-700 border-violet-200",
  Embedded: "bg-blue-50 text-blue-700 border-blue-200",
  Limited: "bg-amber-50 text-amber-700 border-amber-200",
  None: "bg-gray-100 text-gray-400 border-gray-200",
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

  const pricingKPIs = useMemo(() => computePricingKPIs(competitors), [competitors]);
  const featureAnalysis = useMemo(() => computeFeatureAnalysis(competitors), [competitors]);
  const aiRanking = useMemo(() => {
    return [...competitors].sort(
      (a, b) => (b.ai.breadth + b.ai.narrativeCriticality) - (a.ai.breadth + a.ai.narrativeCriticality),
    );
  }, [competitors]);

  const priceSorted = useMemo(() => {
    return [...competitors].sort((a, b) => parseEntryPrice(a.pricing.entryPrice) - parseEntryPrice(b.pricing.entryPrice));
  }, [competitors]);

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
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 pb-24 space-y-24">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 1: Market Pricing at a Glance                      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>Market Pricing at a Glance</SectionTitle>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <KPICard label="Price Range" value={pricingKPIs.rangeLabel} />
            <KPICard label="Avg Entry Price" value={pricingKPIs.avgLabel} />
            <KPICard label="Avg Processing Fee" value={`~${pricingKPIs.avgFee}%`} sub={pricingKPIs.feeRange} />
            <KPICard label="Public Pricing" value={`${pricingKPIs.transparentCount}/${competitors.length}`} sub="competitors" />
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
                        <div className="mt-0.5">
                          <Badge label={c.pricing.transparency} colorClass={TRANSPARENCY_COLORS[c.pricing.transparency]} />
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

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 2: Table-Stakes Features                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
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
                    {competitors.map((c, i) => (
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

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 3: AI Strength Ranking                             */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>AI Strength Ranking</SectionTitle>
          <p className="text-[#777] font-light mb-8 max-w-2xl">
            How deeply each competitor has integrated AI into their product.
            Scored on breadth (feature coverage) and criticality (how central AI is in-product),
            with an evidence tag to separate verified product experience from vendor claims.
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
                    <p className="text-sm text-[#999] leading-relaxed truncate">
                      {c.ai.rationale}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Where Spectra Wins                                         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section>
          <SectionTitle>Where Spectra Wins</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <AdvantageCard
              title="Product Simplicity"
              items={[
                "Faster onboarding vs enterprise-grade complexity (Zenoti, Mindbody)",
                "Intuitive daily workflows that don't require training",
                "Mobile-first UX designed for solo stylists and small teams",
              ]}
              accent="gold"
            />
            <AdvantageCard
              title="AI Decision Support"
              items={[
                "AI-native from day one, not bolted on as an add-on",
                "HairGPT provides actionable business intelligence",
                "Real-time data-driven recommendations vs static dashboards",
              ]}
              accent="blue"
            />
            <AdvantageCard
              title="Pricing Clarity"
              items={[
                "Transparent, predictable pricing with no hidden add-ons",
                "No marketplace commissions eroding salon margins",
                "Clear value-per-tier communication for every plan",
              ]}
              accent="emerald"
            />
            <AdvantageCard
              title="Salon-Specific Depth"
              items={[
                "Smart scale integration — the only hair data lake in the market",
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
          <SectionTitle>Competitor-by-Competitor Opportunity</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {competitors.map((c) => (
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
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

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

import React, { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../SpectraInvestorExperience/tokens";
import { DeckShell } from "../SpectraInvestorExperience/primitives";
import type { DeckSlide } from "../SpectraInvestorExperience/primitives";
import { DUR, EASE_OUT, stagger, staggerItem } from "../SpectraInvestorExperience/visuals/demo/motion";
import { INK, darkGlass } from "../NewNarrativeSalonAIFirst/theme";
import usageSummary from "../../data/pol-customer-usage-summary.json";

const GOLD = "#D9B981";
const CANVAS = "#0D0A08";
const CARD = "rgba(255,255,255,0.06)";
const CARD_BORDER = "1px solid rgba(255,255,255,0.10)";
const CARD_BLUR = "blur(24px) saturate(140%)";
const BG_COLOR_ROOM = "/investor-vision/hero/salon-color-room.jpg";
const BG_COLOR_STATION = "/investor-vision/hero/salon-color-station.jpg";
const BG_COLORISTS = "/investor-vision/hero/salon-colorists.jpg";

const totals = usageSummary.metadata.totals;

const REAL_METRICS = {
  formulas: 30046,
  productUsages: totals.productRows,
  clients: totals.uniqueClients,
  brandsDetected: 25,
  shadeIdentifiers: 355,
  multiBrandPct: 21,
  multiBrandFormulas: 6365,
  avgProductLinesPerFormula: 2.6,
};

const MARKET_QUESTIONS = [
  "Most used shades",
  "Most mixed brands",
  "Product adoption",
  "Regional trends",
  "Service trends",
  "Formula complexity",
];

const SHADE_FAMILIES = [
  { label: "Brown", pct: 65, color: "#8A6248", note: "dominant root and coverage work" },
  { label: "Blonde", pct: 27, color: "#D9B981", note: "high-value highlight and toner activity" },
  { label: "Copper", pct: 4, color: "#C27C38", note: "smaller but distinctive demand" },
  { label: "Dark", pct: 4, color: "#3E2A1E", note: "deep natural shades" },
  { label: "Red", pct: 1, color: "#B5564B", note: "low-volume specialist use" },
];

const TOP_SHADES = [
  { shade: "6.0 F", family: "Brown", grams: 84853, color: "#7A5636" },
  { shade: "7.0 F", family: "Brown", grams: 76818, color: "#9B744F" },
  { shade: "6", family: "Brown", grams: 65731, color: "#7B5A3D" },
  { shade: "7.11", family: "Brown", grams: 51137, color: "#9A8777" },
  { shade: "6.0", family: "Brown", grams: 49080, color: "#6E4E36" },
  { shade: "10.13", family: "Blonde", grams: 28302, color: "#E2D3A8" },
  { shade: "10.12", family: "Blonde", grams: 21399, color: "#D8D0BD" },
  { shade: "9.13", family: "Blonde", grams: 20302, color: "#D5C08A" },
];

const SERVICE_SHADE_MATRIX = [
  { service: "Balayage", shades: ["9.03", "8.3", "10.1", "7.3", "9.12"], behavior: "lightening work followed by targeted tonal choices" },
  { service: "Highlights", shades: ["8", "9.3", "9", "9.0", "6.3"], behavior: "blonde demand shows up through service context" },
  { service: "Root Touch-Up", shades: ["6.0 F", "7.0 F", "6", "6.0", "7.11"], behavior: "natural coverage dominates recurring services" },
  { service: "Toner", shades: ["10.13", "10.12", "9.13", "9.31", "10.32"], behavior: "tone correction reveals exact blonde preference" },
  { service: "Color Lengths", shades: ["7.8", "7.18", "7.11", "6", "6.01"], behavior: "mid-level shades drive refresh and balancing work" },
];

const CROSS_BRAND_PAIRS = [
  { pair: "Afrodita + L'Oréal Professionnel", count: 2185 },
  { pair: "Afrodita + JUL", count: 1800 },
  { pair: "Afrodita + Olaplex", count: 1588 },
  { pair: "L'Oréal Professionnel + TO DEL.", count: 1336 },
  { pair: "JUL + Olaplex", count: 1152 },
  { pair: "L'Oréal Professionnel + Olaplex", count: 841 },
  { pair: "L'Oréal Professionnel + Schwarzkopf", count: 388 },
];

const INDUSTRY_INSIGHTS = [
  "Brown and natural coverage represent the largest shade-family signal in this Israeli sample.",
  "Blonde work becomes visible through highlights, balayage, and toner behavior rather than one generic category.",
  "21% of formulas include products from more than one brand.",
  "The average formula contains 2.6 product usage lines.",
  "Root color is the highest-frequency service, with 14,213 services captured.",
  "Toner for highlights appears 3,511 times, creating a dedicated view into blonde maintenance.",
  "25 brands were detected inside actual service workflows.",
  "355 shade or material identifiers appeared in the product usage data.",
  "Top services explain demand better than purchase volume alone.",
  "This is based on real salon activity, not surveys or self-reported stylist behavior.",
];

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

const SectionShell: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  image?: string;
}> = ({ eyebrow, title, subtitle, children, image }) => (
  <section className="relative w-full h-full overflow-hidden flex items-center" style={{ background: CANVAS }}>
    {image && (
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundImage: `url('${image}')`, backgroundSize: "cover", backgroundPosition: "center 42%" }}
      />
    )}
    <div
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{
        background: image
          ? "linear-gradient(110deg,rgba(8,5,3,0.94) 0%,rgba(8,5,3,0.80) 58%,rgba(8,5,3,0.30) 100%)"
          : "radial-gradient(60% 60% at 22% 42%, rgba(217,185,129,0.09), transparent 68%), radial-gradient(45% 45% at 86% 78%, rgba(224,153,106,0.06), transparent 60%)",
      }}
    />
    <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.fast, ease: EASE_OUT }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
            {eyebrow}
          </span>
        </div>
        <h1
          className="font-light leading-[1.05] tracking-[-0.02em]"
          style={{ fontSize: "clamp(2.1rem, 5vw, 4.1rem)", color: INK.strong, maxWidth: "860px" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-base sm:text-lg font-light leading-relaxed" style={{ color: INK.faint, maxWidth: "680px" }}>
            {subtitle}
          </p>
        )}
      </motion.div>
      {children}
    </div>
  </section>
);

const MetricCard: React.FC<{ value: string; label: string; note?: string }> = ({ value, label, note }) => (
  <motion.div variants={staggerItem} className="rounded-2xl px-5 py-5" style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}>
    <div className="font-light tabular-nums" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)", color: GOLD, lineHeight: 1 }}>
      {value}
    </div>
    <div className="mt-3 text-sm font-light leading-snug" style={{ color: INK.soft }}>
      {label}
    </div>
    {note && <div className="mt-2 text-xs font-light leading-snug" style={{ color: "rgba(251,246,239,0.35)" }}>{note}</div>}
  </motion.div>
);

const OpeningQuestionsSlide: React.FC = () => (
  <SectionShell
    eyebrow="Market Intelligence"
    title="What can a color manufacturer actually know about the market?"
    subtitle="Not what was shipped. Not what was ordered. What stylists actually used inside real color services."
    image={BG_COLOR_ROOM}
  >
    <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
      {MARKET_QUESTIONS.map((question) => (
        <motion.div key={question} variants={staggerItem} className="rounded-2xl px-5 py-5 flex items-center gap-3" style={darkGlass(false)}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: GOLD }} />
          <span className="text-base font-light" style={{ color: INK.soft }}>{question}</span>
        </motion.div>
      ))}
    </motion.div>
  </SectionShell>
);

const HowSpectraKnowsSlide: React.FC = () => (
  <SectionShell
    eyebrow="How Spectra Knows This"
    title="Every color service becomes structured data."
    subtitle="The mechanism is simple: Spectra sits inside the live Color Bar workflow."
    image={BG_COLOR_STATION}
  >
    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-wrap items-center gap-2 max-w-4xl">
      {["Scan", "Weigh", "Formula", "Service"].map((step, index, arr) => (
        <React.Fragment key={step}>
          <motion.div variants={staggerItem} className="rounded-2xl px-6 py-5 min-w-[140px] text-center" style={darkGlass(false)}>
            <div className="text-[11px] uppercase tracking-[0.22em] mb-2" style={{ color: "rgba(251,246,239,0.35)" }}>
              Step {index + 1}
            </div>
            <div className="text-2xl font-light" style={{ color: GOLD }}>{step}</div>
          </motion.div>
          {index < arr.length - 1 && <span className="text-xl" style={{ color: "rgba(251,246,239,0.28)" }}>→</span>}
        </React.Fragment>
      ))}
    </motion.div>
  </SectionShell>
);

const RealDataSlide: React.FC = () => (
  <SectionShell
    eyebrow="Real Data From 6 Active Salons"
    title="This first sample is already large enough to show market behavior."
    subtitle="Based on real Israeli salon activity from 2025/2026, not surveys or anecdotal feedback."
  >
    <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl">
      <MetricCard value={formatNumber(REAL_METRICS.formulas)} label="formulas analyzed" />
      <MetricCard value={formatNumber(REAL_METRICS.productUsages)} label="color/product usages" />
      <MetricCard value={formatNumber(REAL_METRICS.clients)} label="end clients represented" />
      <MetricCard value={formatNumber(REAL_METRICS.brandsDetected)} label="brands detected" />
      <MetricCard value={formatNumber(REAL_METRICS.shadeIdentifiers)} label="shade/material identifiers" />
      <MetricCard value={formatNumber(totals.serviceRows)} label="services captured" />
      <MetricCard value={`${REAL_METRICS.avgProductLinesPerFormula}x`} label="avg. product lines per formula" />
      <MetricCard value={`${REAL_METRICS.multiBrandPct}%`} label="multi-brand formulas" />
    </motion.div>
  </SectionShell>
);

const MostUsedShadesSlide: React.FC = () => {
  const maxShade = TOP_SHADES[0]?.grams ?? 1;

  return (
    <SectionShell
      eyebrow="Most Used Shades"
      title="Shade demand becomes visible as market behavior, not just a color chart."
      subtitle="This view filters for shade-like identifiers, separating them from developers, bleach, and treatment material."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 max-w-6xl">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {SHADE_FAMILIES.map((family) => (
            <motion.div key={family.label} variants={staggerItem} className="rounded-2xl px-5 py-4" style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full" style={{ background: family.color }} />
                  <span className="text-base font-light" style={{ color: INK.soft }}>{family.label}</span>
                </div>
                <span className="text-2xl font-light tabular-nums" style={{ color: GOLD }}>{family.pct}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${family.pct}%` }} transition={{ duration: DUR.slow, ease: EASE_OUT }} className="h-full rounded-full" style={{ background: family.color }} />
              </div>
              <p className="mt-2 text-xs font-light" style={{ color: "rgba(251,246,239,0.35)" }}>{family.note}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-4 gap-3 content-start">
          {TOP_SHADES.map((shade, index) => (
            <motion.div key={shade.shade} variants={staggerItem} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}>
              <div className="h-16" style={{ background: shade.color }} />
              <div className="p-3">
                <div className="text-lg font-light tabular-nums" style={{ color: INK.strong }}>{shade.shade}</div>
                <div className="text-[11px] mt-1" style={{ color: "rgba(251,246,239,0.38)" }}>{shade.family}</div>
                <div className="h-0.5 rounded-full mt-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct(shade.grams, maxShade)}%` }} transition={{ duration: DUR.slow, ease: EASE_OUT, delay: 0.15 + index * 0.05 }} className="h-full rounded-full" style={{ background: GOLD }} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionShell>
  );
};

const ShadesByServiceSlide: React.FC = () => (
  <SectionShell
    eyebrow="Shade Behavior By Service"
    title="What shades are used for which services?"
    subtitle="This is where the data shifts from colors to behavior."
    image={BG_COLORISTS}
  >
    <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 gap-3 max-w-6xl">
      {SERVICE_SHADE_MATRIX.map((row) => (
        <motion.div key={row.service} variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-[180px_1fr_1.1fr] gap-4 items-center rounded-2xl px-5 py-4" style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}>
          <div className="text-base font-light" style={{ color: GOLD }}>{row.service}</div>
          <div className="flex flex-wrap gap-2">
            {row.shades.map((shade) => (
              <span key={shade} className="px-3 py-1.5 rounded-full text-sm tabular-nums" style={{ background: "rgba(217,185,129,0.12)", color: INK.soft, border: "1px solid rgba(217,185,129,0.22)" }}>{shade}</span>
            ))}
          </div>
          <div className="text-sm font-light leading-snug" style={{ color: "rgba(251,246,239,0.45)" }}>{row.behavior}</div>
        </motion.div>
      ))}
    </motion.div>
  </SectionShell>
);

const CrossBrandSlide: React.FC = () => {
  const max = CROSS_BRAND_PAIRS[0]?.count ?? 1;

  return (
    <SectionShell
      eyebrow="Cross Brand Mixing"
      title="21% of formulas combine products from multiple brands."
      subtitle="This is one of the clearest examples of behavior manufacturers rarely see in their own systems."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 max-w-6xl">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR.enter, ease: EASE_OUT }} className="rounded-3xl px-8 py-8 flex flex-col justify-center" style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}>
          <div className="text-6xl font-light tabular-nums" style={{ color: GOLD }}>{REAL_METRICS.multiBrandPct}%</div>
          <div className="mt-4 text-base font-light leading-snug" style={{ color: INK.soft }}>of formulas include more than one brand</div>
          <div className="mt-3 text-xs font-light" style={{ color: "rgba(251,246,239,0.35)" }}>{formatNumber(REAL_METRICS.multiBrandFormulas)} multi-brand formulas detected</div>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {CROSS_BRAND_PAIRS.map((pair, index) => (
            <motion.div key={pair.pair} variants={staggerItem} className="rounded-2xl px-5 py-4" style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-sm font-light" style={{ color: INK.soft }}>{pair.pair}</span>
                <span className="text-sm tabular-nums shrink-0" style={{ color: GOLD }}>{formatNumber(pair.count)}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct(pair.count, max)}%` }} transition={{ duration: DUR.slow, ease: EASE_OUT, delay: 0.2 + index * 0.05 }} className="h-full rounded-full" style={{ background: GOLD }} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionShell>
  );
};

const IndustryCannotSeeSlide: React.FC = () => (
  <SectionShell
    eyebrow="What The Industry Cannot See"
    title="A few examples from the first Israeli sample."
    subtitle="No dashboards. Just the kind of questions a manufacturer can start answering when service-level data exists."
  >
    <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-6xl">
      {INDUSTRY_INSIGHTS.map((insight, index) => (
        <motion.div key={insight} variants={staggerItem} className="flex gap-4 rounded-2xl px-5 py-4" style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}>
          <span className="text-xs tabular-nums pt-1" style={{ color: GOLD }}>{String(index + 1).padStart(2, "0")}</span>
          <span className="text-sm font-light leading-relaxed" style={{ color: INK.soft }}>{insight}</span>
        </motion.div>
      ))}
    </motion.div>
  </SectionShell>
);

const WhyOnlySpectraSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;

  return (
    <SectionShell
      eyebrow="Why Only Spectra"
      title="Spectra captures decisions, not transactions."
      subtitle="We sit inside the Color Bar, at the exact moment where professional color choices are made."
      image={BG_COLOR_STATION}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.16 }}
        className="rounded-3xl px-7 py-7 max-w-3xl"
        style={{ background: CARD, border: CARD_BORDER, backdropFilter: CARD_BLUR }}
      >
        <p className="text-2xl sm:text-3xl font-light leading-snug" style={{ color: INK.strong }}>
          Sales data shows what moved.
        </p>
        <p className="mt-3 text-2xl sm:text-3xl font-light leading-snug" style={{ color: GOLD }}>
          Spectra shows what was chosen, mixed, and used.
        </p>
      </motion.div>
    </SectionShell>
  );
};

export const IsraelCustomerUsageExamplePage: React.FC = () => {
  useEffect(() => {
    document.title = "Israeli Market Signal Example · Spectra";
    document.documentElement.style.background = INV.bgDeep;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.background = "";
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const slides: DeckSlide[] = [
    { id: "market-questions", label: "Market Questions", group: "Market View", fullBleed: true, tone: "deep", node: <OpeningQuestionsSlide /> },
    { id: "how-spectra-knows", label: "How Spectra Knows", group: "Mechanism", fullBleed: true, tone: "deep", node: <HowSpectraKnowsSlide /> },
    { id: "real-data", label: "Real Data", group: "Israel Sample", fullBleed: true, tone: "deep", node: <RealDataSlide /> },
    { id: "most-used-shades", label: "Most Used Shades", group: "Insights", fullBleed: true, tone: "deep", node: <MostUsedShadesSlide /> },
    { id: "shades-by-service", label: "Shades By Service", group: "Insights", fullBleed: true, tone: "deep", node: <ShadesByServiceSlide /> },
    { id: "cross-brand", label: "Cross Brand Mixing", group: "Insights", fullBleed: true, tone: "deep", node: <CrossBrandSlide /> },
    { id: "industry-cannot-see", label: "What Industry Cannot See", group: "Insights", fullBleed: true, tone: "deep", node: <IndustryCannotSeeSlide /> },
    { id: "why-only-spectra", label: "Why Only Spectra", group: "Closing", fullBleed: true, tone: "deep", node: <WhyOnlySpectraSlide /> },
  ];

  return (
    <DeckShell
      slides={slides}
      brand="Spectra · Israeli Market Signal"
      confidential="Private example — aggregated Israeli salon activity."
    />
  );
};

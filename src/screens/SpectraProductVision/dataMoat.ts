/**
 * The Beauty Intelligence Dataset — rendering constants.
 *
 * Source of truth: investor-assets/DATA_MOAT_MODEL.md.
 * All baseline numbers are derived from the shipped real usage aggregate
 * (src/data/market-intelligence.json, Apr 2026 latest month, 147 active salons).
 *
 * Confidence is surfaced in the UI so the section stays investor-credible:
 *   "real"   — measured directly from shipped usage data
 *   "proxy"  — derived from a real field used as a defensible proxy
 *   "future" — requires instrumentation not yet in the shipped dataset
 */

export type Confidence = "real" | "proxy" | "future";

/** Per-active-salon, per-year baseline (Apr 2026 rate × 12). */
export const ONE_SALON = {
  visits: 1049,
  services: 1264,
  grams: 62780,
} as const;

/** Scale scenarios. Each value = ONE_SALON × salonCount (kept exact-ish for display). */
export interface ScaleCase {
  readonly id: string;
  readonly label: string;
  readonly salons: number;
  readonly highlight?: boolean;
}

export const SCALE_CASES: readonly ScaleCase[] = [
  { id: "one", label: "1 salon", salons: 1 },
  { id: "current", label: "Today", salons: 147 },
  { id: "k1", label: "1,000", salons: 1000 },
  { id: "k10", label: "10,000", salons: 10000, highlight: true },
  { id: "k50", label: "50,000", salons: 50000 },
];

/** A metric row in the scale matrix. */
export interface ScaleMetric {
  readonly id: string;
  readonly label: string;
  /** per-salon annual value, multiplied by salon count at render time */
  readonly perSalon: number;
  readonly unit?: string;
  readonly confidence: Confidence;
}

export const SCALE_METRICS: readonly ScaleMetric[] = [
  { id: "visits", label: "Customer visits", perSalon: ONE_SALON.visits, confidence: "real" },
  { id: "services", label: "Color services / formulas", perSalon: ONE_SALON.services, confidence: "proxy" },
  { id: "grams", label: "Grams of product measured", perSalon: ONE_SALON.grams, unit: "g", confidence: "real" },
  { id: "cost", label: "Material-cost data points", perSalon: ONE_SALON.services, confidence: "proxy" },
];

/** Real, measured facts used as proof points (from the shipped dataset). */
export const PROOF = {
  monthsOfHistory: 40,
  salonAccounts: 428,
  visits: 465430,
  services: 556455,
  grams: 30878848,
  brands: 221,
  rangeFrom: "Jan 2023",
  rangeTo: "Apr 2026",
} as const;

/** Data Categories Matrix — what each dataset enables (not just volume). */
export interface DataCategory {
  readonly id: string;
  readonly name: string;
  readonly enables: string;
  readonly confidence: Confidence;
}

export const DATA_CATEGORIES: readonly DataCategory[] = [
  {
    id: "product",
    name: "Product Intelligence",
    enables: "Which products and brands actually perform — and how reorder behavior moves.",
    confidence: "real",
  },
  {
    id: "formula",
    name: "Formula Intelligence",
    enables: "Which formulas deliver consistent, repeatable results.",
    confidence: "proxy",
  },
  {
    id: "waste",
    name: "Waste Intelligence",
    enables: "Where product is wasted — gram by gram, service by service.",
    confidence: "proxy",
  },
  {
    id: "margin",
    name: "Margin Intelligence",
    enables: "Which services and which mix are genuinely profitable.",
    confidence: "real",
  },
  {
    id: "journey",
    name: "Customer Journey Intelligence",
    enables: "What actually makes a customer come back.",
    confidence: "future",
  },
  {
    id: "team",
    name: "Team Intelligence",
    enables: "Which professionals get better outcomes.",
    confidence: "future",
  },
  {
    id: "benchmark",
    name: "Market Benchmark Intelligence",
    enables: "Region, salon type, brand mix and material benchmarks across the network.",
    confidence: "real",
  },
];

/** Competitive visibility — framed by product-category capability. */
export interface CompetitorRow {
  readonly id: string;
  readonly name: string;
  /** which capability columns this platform typically sees */
  readonly sees: Readonly<Record<string, boolean>>;
}

export const VISIBILITY_COLUMNS = [
  { id: "appointments", label: "Appointments" },
  { id: "payments", label: "Payments" },
  { id: "formulas", label: "Formulas" },
  { id: "grams", label: "Grams" },
  { id: "waste", label: "Waste" },
  { id: "margin", label: "Profitability" },
  { id: "journey", label: "Customer journey" },
  { id: "ai", label: "AI actions" },
] as const;

export const COMPETITORS: readonly CompetitorRow[] = [
  {
    id: "phorest",
    name: "Phorest",
    sees: { appointments: true, payments: true, journey: true },
  },
  {
    id: "vagaro",
    name: "Vagaro",
    sees: { appointments: true, payments: true, journey: true },
  },
  {
    id: "square",
    name: "Square",
    sees: { appointments: true, payments: true },
  },
  {
    id: "vish",
    name: "Vish",
    sees: { formulas: true, grams: true, waste: true },
  },
  {
    id: "salonai",
    name: "Salon AI",
    sees: {
      appointments: true,
      payments: true,
      formulas: true,
      grams: true,
      waste: true,
      margin: true,
      journey: true,
      ai: true,
    },
  },
];

/** Dataset flywheel steps (clockwise). */
export const FLYWHEEL_STEPS: readonly string[] = [
  "More Salons",
  "More Data",
  "Better AI",
  "Better Outcomes",
];

/** Intelligence assets at 10,000 salons / year. */
export interface IntelligenceAsset {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly confidence: Confidence;
}

export const INTELLIGENCE_ASSETS: readonly IntelligenceAsset[] = [
  { id: "formulas", label: "Color formulas / mixes", value: "12.6M", confidence: "proxy" },
  { id: "journeys", label: "Customer journeys", value: "10.5M", confidence: "future" },
  { id: "outcomes", label: "Service outcomes", value: "12.6M", confidence: "proxy" },
  { id: "grams", label: "Grams measured", value: "627.8M", confidence: "real" },
  { id: "brands", label: "Brands represented", value: "200+", confidence: "real" },
  { id: "benchmarks", label: "Benchmarking signals", value: "Continuous", confidence: "real" },
];

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  real: "Measured today",
  proxy: "Derived (proxy)",
  future: "With instrumentation",
};

/**
 * Representative professional color brands observed in salons. The brand COUNT
 * (221) is real from the shipped dataset; the per-brand share bars below are
 * illustrative of distribution shape, not exact production figures.
 */
export const BRAND_SAMPLE: readonly { name: string; share: number }[] = [
  { name: "Wella", share: 1.0 },
  { name: "L'Oréal Pro", share: 0.86 },
  { name: "Schwarzkopf", share: 0.74 },
  { name: "Redken", share: 0.58 },
  { name: "Keune", share: 0.47 },
  { name: "Moroccanoil", share: 0.39 },
  { name: "+215 more", share: 0.22 },
];

export const BEAUTY_TERMINAL_STATS = [
  { value: "221", label: "brands observed" },
  { value: "556K", label: "services" },
  { value: "30.9M", label: "grams" },
  { value: "428", label: "salons" },
  { value: "40", label: "months" },
] as const;

/** Product-level signals Salon AI can read inside real salons. */
export interface ProductSignal {
  readonly id: string;
  readonly label: string;
  readonly detail: string;
  readonly confidence: Confidence;
}

export const PRODUCT_SIGNALS: readonly ProductSignal[] = [
  { id: "grams-brand", label: "Grams by brand", detail: "How much of each professional line is actually consumed.", confidence: "real" },
  { id: "service-cost", label: "Service-level cost", detail: "Material cost attached to each color service.", confidence: "real" },
  { id: "formula-perf", label: "Formula performance", detail: "Which formulas repeat and hold across visits.", confidence: "proxy" },
  { id: "reorder", label: "Reorder signals", detail: "When a shade is about to run out, before it does.", confidence: "future" },
  { id: "waste-cat", label: "Waste by category", detail: "Over-mixing patterns by product and service type.", confidence: "proxy" },
  { id: "regional", label: "Regional trends", detail: "Which brands and shades win by market and salon type.", confidence: "real" },
];

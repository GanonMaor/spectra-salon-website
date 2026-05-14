// ─────────────────────────────────────────────────────────────────────
// Strategic Forecast Model — 6 years / 72 months
//
// This module is the single source of truth for the investor-facing
// strategic forecast that lives at `/strategic-forecast`. It is fully
// independent from the operating-budget model in
// `../FinancialForecast/forecast-model.ts` so we can tell a different
// story (target-driven accelerated growth, customer profile mix,
// segmented data revenue) without disturbing the live budget tool.
//
// Pure data + React-free helpers only. The page and any hooks live in
// their own files and import from here.
// ─────────────────────────────────────────────────────────────────────

// ── Constants ───────────────────────────────────────────────────────

export const STRATEGIC_FORECAST_MONTHS = 72;
export const STRATEGIC_FORECAST_YEARS = 6;
export const STRATEGIC_STORAGE_KEY = "spectra-strategic-forecast-v1";

const SHORT_MO = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// First month: June 2026 — same start as the operating forecast.
function buildMonthLabels(): string[] {
  const out: string[] = [];
  let y = 2026;
  let m = 5; // June
  for (let i = 0; i < STRATEGIC_FORECAST_MONTHS; i++) {
    out.push(`${SHORT_MO[m]} ${String(y).slice(2)}`);
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
  return out;
}

export const STRATEGIC_MONTH_LABELS = buildMonthLabels();

export interface YearRange {
  year: number;        // 1..6
  start: number;       // inclusive month index
  end: number;         // exclusive month index
  label: string;       // "Year 1"
  range: string;       // "Jun 26 – May 27"
}

export const STRATEGIC_YEAR_RANGES: YearRange[] = (() => {
  const out: YearRange[] = [];
  for (let y = 0; y < STRATEGIC_FORECAST_YEARS; y++) {
    const start = y * 12;
    const end = Math.min(start + 12, STRATEGIC_FORECAST_MONTHS);
    out.push({
      year: y + 1,
      start,
      end,
      label: `Year ${y + 1}`,
      range: `${STRATEGIC_MONTH_LABELS[start]} – ${STRATEGIC_MONTH_LABELS[end - 1]}`,
    });
  }
  return out;
})();

// Bump when default assumptions change in a way older saves should be
// re-seeded to the new plan. Version 9 locks the current target plan:
// Y1 500 · Y2 2,000 · Y3 6,500 · Y4 18,000 · Y5 26,000 · Y6 33,000 salons.
export const STRATEGIC_PROFILE_VERSION = 9;

// Monthly acquisition / opex ramp inside a single year.
// Early months are quieter (brand awareness, sales capacity, hiring still in
// flight) and later months absorb more volume. Weights are normalized at use
// time so the annual sum matches the yearly target/budget exactly.
export const DEFAULT_MONTHLY_RAMP_WEIGHTS: readonly number[] = [
  0.45, 0.55, 0.65, 0.75, 0.85, 0.95,
  1.05, 1.10, 1.15, 1.25, 1.35, 1.50,
];

// ── Categories (mirror the operating-budget naming) ─────────────────

export const STRATEGIC_CATEGORY_RND   = "Research & Development";
export const STRATEGIC_CATEGORY_MS    = "Marketing & Sales";
export const STRATEGIC_CATEGORY_OPS   = "Operations";
export const STRATEGIC_CATEGORY_MGMT  = "Management";
export const STRATEGIC_CATEGORY_ADMIN = "Accounting / Admin";
export const STRATEGIC_CATEGORY_COGS  = "COGS";

export const STRATEGIC_OPEX_CATEGORIES = [
  STRATEGIC_CATEGORY_RND,
  STRATEGIC_CATEGORY_MS,
  STRATEGIC_CATEGORY_OPS,
  STRATEGIC_CATEGORY_MGMT,
  STRATEGIC_CATEGORY_ADMIN,
] as const;

// ── Types ───────────────────────────────────────────────────────────

export type SalonProfileId = "solo" | "studio" | "professional" | "enterprise";

export interface SalonProfile {
  id: SalonProfileId;
  /** Premium-sounding investor display name. */
  displayName: string;
  /** Original term used in the strategic brief — kept for transparency. */
  legacyName: string;
  /** Subtitle shown on the page (e.g. "Solo stylist / independent user"). */
  description: string;
  /** Customer mix percentage, 0..100. */
  mixPct: number;
  /** Base monthly subscription price (full / steady-state). */
  basePrice: number;
  /**
   * Intro / promotional monthly price paid by this profile until the
   * full `basePrice` kicks in. Lets us reflect the early-life pricing
   * reality (e.g. legacy Solo customers paying $68 today) — the customer
   * is on the platform, but at a discounted rate.
   */
  introBasePrice: number;
  /**
   * Month (1..STRATEGIC_FORECAST_MONTHS) in which this profile transitions
   * from `introBasePrice` to `basePrice`. `1` means the full price
   * applies from day 1 (no intro period).
   */
  basePriceStartMonth: number;
  /** AI Booking add-on monthly price. */
  aiBookingPrice: number;
  /** AI Booking adoption rate, 0..1 (share of profile that buys it). */
  aiBookingAdoption: number;
  /** AI Credits monthly revenue per active salon. */
  aiCreditsPrice: number;
  /** AI Credits adoption rate, 0..1. */
  aiCreditsAdoption: number;
  /** Average monthly salon revenue used for POS take-rate math. */
  posSalonRevenue: number;
  /** POS adoption rate, 0..1. */
  posAdoption: number;
  /** Hardware adoption rate at the moment a salon onboards, 0..1. */
  hardwareAdoption: number;
  /** Customer-acquisition cost in USD for this profile. */
  cac: number;
  /**
   * Number of colorists / professionals working in this profile. Used to
   * size marketplace GMV — every colorist orders
   * `marketplaceSpendPerColorist` USD/month in supplies and equipment
   * through Spectra's marketplace, and we earn `marketplaceTakeRate` on
   * each order. Defaults: Solo=1, Studio=3, Professional=7, Enterprise=12.
   */
  marketplaceColorists: number;
}

export type DataSegmentId =
  | "localDistributor"
  | "regionalDistributor"
  | "majorBrand"
  | "strategicEnterprise";

export interface DataSegment {
  id: DataSegmentId;
  displayName: string;
  description: string;
  mixPct: number;          // 0..100
  monthlyPrice: number;    // USD per data customer per month
}

export interface YearlyArr {
  /** Length === STRATEGIC_FORECAST_YEARS. */
  values: number[];
}

export interface StrategicAssumptions {
  /** Salons live on day 1 (carries over from the operating model). */
  startingSalons: number;
  /** Salon count target at the end of each year — drives accelerated ramp. */
  yearlySalonTargets: number[]; // length 6
  /** Data customer count target at the end of each year. */
  yearlyDataCustomers: number[]; // length 6
  /** Monthly churn rate, 0..100 (percentage). */
  monthlyChurnPct: number;

  /** Spectra share of POS payment volume, 0..1. */
  posTakeRate: number;

  /** Hardware unit economics — non-recurring. */
  hardwarePrice: number;
  hardwareCost: number;
  /**
   * Year (1..N) in which hardware sales begin. Months before the start of
   * this year produce zero hardware units / revenue / COGS even if the
   * profile-level hardware adoption is non-zero. Default is 3 — Spectra
   * goes to market with software first and lights up hardware in Year 3.
   */
  hardwareStartYear: number;

  /**
   * Cash on the balance sheet at month 0 (e.g. seed round proceeds). Used
   * by the audit/cash trajectory layer; does not affect P&L.
   */
  seedInvestment: number;

  /**
   * Month (1..STRATEGIC_FORECAST_MONTHS) in which POS adoption begins.
   * Before this month POS revenue / payment volume / MRR are zero across
   * all profiles. Default is 18 (mid Year 2) — Spectra ships software
   * first, then layers on POS once early customers are stable.
   */
  posStartMonth: number;

  /**
   * Number of months over which POS adoption ramps from 0 to the
   * profile-level steady-state adoption rate, starting at `posStartMonth`.
   * Default is 12 — reaches full adoption a year after launch.
   */
  posRampMonths: number;

  /**
   * Month (1..STRATEGIC_FORECAST_MONTHS) in which AI Booking + AI Credits
   * adoption begins. Before this month both AI revenue lines are zero
   * across all profiles. Default is 13 (start of Year 2) — Year 1 ships
   * the core SaaS only, AI features come online with a stable customer
   * base.
   */
  aiStartMonth: number;

  /**
   * Number of months over which AI Booking + AI Credits adoption ramps
   * from 0 to the profile-level steady-state adoption rate, starting at
   * `aiStartMonth`. Default is 12.
   */
  aiRampMonths: number;

  /**
   * Month (1..STRATEGIC_FORECAST_MONTHS) in which the marketplace launches.
   * Before this month no marketplace GMV / revenue is recognised, even if
   * profile-level colorists are non-zero. Default is 25 (start of Year 3)
   * — the marketplace is a Y3 monetisation layer on top of the SaaS base.
   */
  marketplaceStartMonth: number;

  /**
   * Number of months over which marketplace adoption ramps from 0 to full
   * after `marketplaceStartMonth`. Default is 12.
   */
  marketplaceRampMonths: number;

  /**
   * Average monthly spend (USD) per colorist on supplies and equipment
   * ordered through Spectra's marketplace. Default $1,000/mo.
   */
  marketplaceSpendPerColorist: number;

  /**
   * Spectra share of marketplace GMV, 0..1. Default 0.08 (8% affiliate
   * commission).
   */
  marketplaceTakeRate: number;

  /**
   * Gross margin on marketplace affiliate revenue, 0..1. Affiliate income
   * has very low associated cost (no inventory, no fulfilment), so the
   * default is 0.95.
   */
  marketplaceGrossMargin: number;

  /** Gross margin assumptions per stream, 0..1. */
  saasGrossMargin: number;
  dataGrossMargin: number;
  posGrossMargin: number;

  /** Annual operating expense by category (length 6 each), excluding acquisition spend. */
  yearlyOpex: {
    rnd: number[];
    ms: number[];
    ops: number[];
    mgmt: number[];
    admin: number[];
  };

  profiles: SalonProfile[];
  dataSegments: DataSegment[];

  profileVersion?: number;
}

// ── Defaults ────────────────────────────────────────────────────────

export const DEFAULT_SALON_PROFILES: SalonProfile[] = [
  {
    id: "solo",
    displayName: "Solo",
    legacyName: "Single User",
    description: "Solo stylist / independent user",
    mixPct: 50,
    basePrice: 99,
    introBasePrice: 68,
    basePriceStartMonth: 5,
    aiBookingPrice: 29,
    aiBookingAdoption: 0.30,
    aiCreditsPrice: 10,
    aiCreditsAdoption: 0.40,
    posSalonRevenue: 8000,
    posAdoption: 0.10,
    hardwareAdoption: 0.20,
    cac: 180,
    marketplaceColorists: 1,
  },
  {
    id: "studio",
    displayName: "Studio",
    legacyName: "Small Salon",
    description: "Up to 4 stylists",
    mixPct: 30,
    basePrice: 199,
    introBasePrice: 68,
    basePriceStartMonth: 10,
    aiBookingPrice: 99,
    aiBookingAdoption: 0.55,
    aiCreditsPrice: 20,
    aiCreditsAdoption: 0.60,
    posSalonRevenue: 25000,
    posAdoption: 0.30,
    hardwareAdoption: 0.40,
    cac: 300,
    marketplaceColorists: 3,
  },
  {
    id: "professional",
    displayName: "Professional",
    legacyName: "Growth Salon",
    description: "Up to 10 stylists",
    mixPct: 15,
    basePrice: 599,
    introBasePrice: 0,
    basePriceStartMonth: 13,
    aiBookingPrice: 249,
    aiBookingAdoption: 0.70,
    aiCreditsPrice: 50,
    aiCreditsAdoption: 0.75,
    posSalonRevenue: 60000,
    posAdoption: 0.50,
    hardwareAdoption: 0.60,
    cac: 650,
    marketplaceColorists: 7,
  },
  {
    id: "enterprise",
    displayName: "Enterprise Salon",
    legacyName: "Large Salon",
    description: "Up to 20 stylists",
    mixPct: 5,
    basePrice: 1199,
    introBasePrice: 0,
    basePriceStartMonth: 13,
    aiBookingPrice: 500,
    aiBookingAdoption: 0.85,
    aiCreditsPrice: 100,
    aiCreditsAdoption: 0.90,
    posSalonRevenue: 120000,
    posAdoption: 0.70,
    hardwareAdoption: 0.80,
    cac: 1500,
    marketplaceColorists: 12,
  },
];

export const DEFAULT_DATA_SEGMENTS: DataSegment[] = [
  {
    id: "localDistributor",
    displayName: "Local Distributor",
    description: "Local color & supply distributors",
    mixPct: 60,
    monthlyPrice: 2000,
  },
  {
    id: "regionalDistributor",
    displayName: "Regional Distributor / Chain",
    description: "Regional distributors and salon chains",
    mixPct: 25,
    monthlyPrice: 5000,
  },
  {
    id: "majorBrand",
    displayName: "Major Color Brand",
    description: "Wella, L'Oréal, Schwarzkopf and similar",
    mixPct: 10,
    monthlyPrice: 15000,
  },
  {
    id: "strategicEnterprise",
    displayName: "Strategic Enterprise",
    description: "Advanced market intelligence accounts",
    mixPct: 5,
    monthlyPrice: 35000,
  },
];

export function buildDefaultStrategicAssumptions(): StrategicAssumptions {
  return {
    startingSalons: 160,
    yearlySalonTargets: [500, 2_000, 6_500, 18_000, 26_000, 33_000],
    yearlyDataCustomers: [0, 2, 8, 20, 40, 75],
    monthlyChurnPct: 2.0,
    posTakeRate: 0.005,
    hardwarePrice: 1200,
    hardwareCost: 350,
    hardwareStartYear: 3,
    seedInvestment: 500_000,
    posStartMonth: 18,
    posRampMonths: 12,
    aiStartMonth: 13,
    aiRampMonths: 12,
    marketplaceStartMonth: 25,
    marketplaceRampMonths: 12,
    marketplaceSpendPerColorist: 1000,
    marketplaceTakeRate: 0.08,
    marketplaceGrossMargin: 0.95,
    saasGrossMargin: 0.88,
    dataGrossMargin: 0.92,
    posGrossMargin: 0.65,
    yearlyOpex: {
      rnd:   [  300_000, 1_000_000,  3_000_000,  7_000_000, 12_000_000, 18_000_000],
      ms:    [  200_000,   750_000,  2_000_000,  5_000_000, 10_000_000, 16_000_000],
      ops:   [  250_000,   750_000,  2_500_000,  6_000_000, 12_000_000, 20_000_000],
      mgmt:  [  200_000,   400_000,    750_000,  1_200_000,  2_000_000,  3_000_000],
      admin: [   80_000,   200_000,    500_000,  1_000_000,  1_800_000,  3_000_000],
    },
    profiles: DEFAULT_SALON_PROFILES.map((p) => ({ ...p })),
    dataSegments: DEFAULT_DATA_SEGMENTS.map((d) => ({ ...d })),
    profileVersion: STRATEGIC_PROFILE_VERSION,
  };
}

// ── Validation ──────────────────────────────────────────────────────

export interface ValidationWarning {
  field: string;
  message: string;
}

export function validateStrategicAssumptions(state: StrategicAssumptions): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const profileSum = state.profiles.reduce((s, p) => s + (Number.isFinite(p.mixPct) ? p.mixPct : 0), 0);
  if (Math.abs(profileSum - 100) > 0.5) {
    warnings.push({
      field: "profiles.mix",
      message: `Salon profile mix totals ${profileSum.toFixed(1)}%; should equal 100%.`,
    });
  }
  const dataSum = state.dataSegments.reduce((s, d) => s + (Number.isFinite(d.mixPct) ? d.mixPct : 0), 0);
  if (Math.abs(dataSum - 100) > 0.5) {
    warnings.push({
      field: "dataSegments.mix",
      message: `Data customer segment mix totals ${dataSum.toFixed(1)}%; should equal 100%.`,
    });
  }
  for (const p of state.profiles) {
    if (p.mixPct < 0) warnings.push({ field: `profile.${p.id}.mix`, message: `${p.displayName} mix is negative.` });
    if (p.basePrice < 0) warnings.push({ field: `profile.${p.id}.basePrice`, message: `${p.displayName} base price is negative.` });
  }
  for (const d of state.dataSegments) {
    if (d.mixPct < 0) warnings.push({ field: `data.${d.id}.mix`, message: `${d.displayName} mix is negative.` });
    if (d.monthlyPrice < 0) warnings.push({ field: `data.${d.id}.price`, message: `${d.displayName} price is negative.` });
  }
  return warnings;
}

// ── Engine ──────────────────────────────────────────────────────────

export interface ProfileSeries {
  profile: SalonProfile;
  customers: number[];          // active customers at month-end
  newCustomers: number[];       // gross adds in the month
  churnedCustomers: number[];   // departures in the month
  baseSubMrr: number[];
  aiBookingMrr: number[];
  aiCreditsMrr: number[];
  posSalons: number[];
  posPaymentVolume: number[];
  posMrr: number[];
  hardwareUnits: number[];
  hardwareRevenue: number[];
  hardwareCogs: number[];
  hardwareGrossProfit: number[];
  marketplaceColoristsActive: number[]; // active colorists feeding the marketplace
  marketplaceGmv: number[];             // total marketplace order value
  marketplaceRevenue: number[];         // GMV × take rate
  marketplaceGrossProfit: number[];     // revenue × marketplaceGrossMargin
  recurringMrr: number[];       // base + AI booking + AI credits + POS + marketplace
  acquisitionSpend: number[];   // new customers × profile CAC
}

export interface DataSegmentSeries {
  segment: DataSegment;
  customers: number[];
  mrr: number[];
}

export interface YearlyRollup {
  year: number;
  startMonth: number;
  endMonth: number;
  endingSalons: number;
  endingDataCustomers: number;
  endingMrr: number;             // recurring run-rate at year end
  endingArr: number;             // endingMrr × 12
  baseSaasRevenue: number;       // 12-month total
  aiBookingRevenue: number;
  aiCreditsRevenue: number;
  posRevenue: number;
  paymentVolume: number;
  dataRevenue: number;
  marketplaceGmv: number;
  marketplaceRevenue: number;
  marketplaceGrossProfit: number;
  hardwareRevenue: number;
  hardwareCogs: number;
  hardwareGrossProfit: number;
  recurringRevenue: number;      // sum of recurring streams
  totalRevenue: number;          // recurring + hardware
  recurringPct: number;          // recurring / total revenue, 0..1
  saasGrossProfit: number;
  dataGrossProfit: number;
  posGrossProfit: number;
  grossProfit: number;
  grossMargin: number;           // 0..1
  acquisitionSpend: number;
  opexByCategory: Record<string, number>;
  totalOpex: number;
  ebitda: number;
  newCustomersByProfile: Record<SalonProfileId, number>;
  endingCustomersByProfile: Record<SalonProfileId, number>;
  hardwareUnits: number;
  endingCashBalance: number;
  lowestCashBalance: number;
}

export interface StrategicForecastResult {
  monthLabels: string[];
  yearRanges: YearRange[];

  // Customer base — `subscribersEnd` and `totalSalons` are aliases for end-of-month.
  totalSalons: number[];
  subscribersStart: number[];
  subscribersEnd: number[];
  newSalons: number[];
  churnedSalons: number[];
  cumulativeNewSalons: number[];
  averageActiveSalons: number[];

  byProfile: Record<SalonProfileId, ProfileSeries>;
  byDataSegment: Record<DataSegmentId, DataSegmentSeries>;

  // Aggregated streams (monthly)
  baseSaasMrr: number[];
  aiBookingMrr: number[];
  aiCreditsMrr: number[];
  posMrr: number[];
  dataMrr: number[];
  marketplaceGmv: number[];          // monthly marketplace order volume across all profiles
  marketplaceRevenue: number[];      // monthly affiliate revenue (GMV × take rate)
  marketplaceGrossProfit: number[];  // affiliate revenue × marketplace gross margin
  recurringMrr: number[];
  recurringArr: number[];

  // Non-recurring
  hardwareRevenue: number[];
  hardwareCogs: number[];
  hardwareGrossProfit: number[];

  // Top-line
  totalRevenue: number[];

  // Margin layers
  saasGrossProfit: number[];
  dataGrossProfit: number[];
  posGrossProfit: number[];
  grossProfit: number[];
  grossMargin: number[];

  // Acquisition
  acquisitionSpend: number[];
  blendedCac: number[];

  // Opex
  opexByCategory: Record<string, number[]>;
  totalOpex: number[];
  ebitda: number[];

  // Blended ARPUs
  blendedSubArpu: number[];      // base subscription only
  blendedTotalArpu: number[];    // base + AI + POS, divided by salons
  dataBlendedArpu: number[];

  // Cash / audit trajectory
  cumulativeEbitda: number[];
  cashBalance: number[];          // seedInvestment + cumulative EBITDA
  breakevenMonthIdx: number;      // first month where EBITDA > 0; -1 if never
  maxCashTroughUsd: number;       // most negative cumulative EBITDA across horizon
  maxCashTroughMonthIdx: number;  // -1 if cash never goes below zero
  safetyBufferUsd: number;        // seedInvestment + maxCashTroughUsd
  seedInvestment: number;

  // Yearly
  yearly: YearlyRollup[];
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function pos(v: number): number {
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function makeArr(n: number): number[] {
  return new Array(n).fill(0);
}

/**
 * Normalize a 12-month weight vector so that it sums to 1.
 *
 * Bad inputs (non-finite, all zero) fall back to a flat 1/12 distribution
 * so the model still produces sensible numbers.
 */
function normalizeMonthlyWeights(weights: readonly number[] = DEFAULT_MONTHLY_RAMP_WEIGHTS): number[] {
  const arr = weights.length === 12
    ? weights.map((w) => (Number.isFinite(w) && w > 0 ? w : 0))
    : new Array(12).fill(1);
  const total = arr.reduce((s, w) => s + w, 0);
  if (total <= 0) return new Array(12).fill(1 / 12);
  return arr.map((w) => w / total);
}

/**
 * Ramp a non-churning quantity (e.g. data customer count) from a starting
 * value to each year-end target using monthly ramp weights. The cumulative
 * weights are applied to the in-year delta, so the value at the last month
 * of each year exactly hits the target.
 */
function rampValuesNoChurn(start: number, yearlyTargets: number[], weights: number[]): number[] {
  const months = STRATEGIC_FORECAST_MONTHS;
  const out = makeArr(months);
  let cursor = start;
  for (let y = 0; y < STRATEGIC_FORECAST_YEARS; y++) {
    const yearStart = cursor;
    const yearEnd = yearlyTargets[y] ?? yearStart;
    const delta = yearEnd - yearStart;
    let acc = yearStart;
    for (let m = 0; m < 12; m++) {
      const idx = y * 12 + m;
      if (idx >= months) break;
      acc += delta * weights[m];
      out[idx] = acc;
    }
    cursor = out[Math.min(y * 12 + 11, months - 1)] ?? cursor;
  }
  return out;
}

interface SubscriberRamp {
  totalSalons: number[];        // alias of subscribersEnd
  subscribersStart: number[];
  subscribersEnd: number[];
  newSalons: number[];
  churnedSalons: number[];
}

/**
 * Ramp the subscriber base across `STRATEGIC_FORECAST_YEARS` years using
 * monthly weights that mimic real-world growth (low in January, high in
 * December). Within each year we solve for the total annual gross adds G
 * such that:
 *
 *   end[11] = yearStart * (1 - c)^12 + G * Σ wₖ * (1 - c)^(11-k)
 *
 * gross adds are then distributed across the 12 months by `wₖ` so that
 * end-of-year subscribers exactly equal the target. If G goes negative
 * (target lower than natural decline) we clamp to zero and let churn pull
 * the base down.
 */
function rampSubscribersWithChurn(
  start: number,
  yearlyTargets: number[],
  monthlyChurn: number,
  weights: number[],
): SubscriberRamp {
  const months = STRATEGIC_FORECAST_MONTHS;
  const totalSalons = makeArr(months);
  const subscribersStart = makeArr(months);
  const subscribersEnd = makeArr(months);
  const newSalons = makeArr(months);
  const churnedSalons = makeArr(months);

  const c = clamp01(monthlyChurn);
  const survival = Math.pow(1 - c, 12);

  // S = Σ wₖ * (1 - c)^(11-k)
  let S = 0;
  for (let k = 0; k < 12; k++) S += weights[k] * Math.pow(1 - c, 11 - k);

  let prevEnd = start;
  for (let y = 0; y < STRATEGIC_FORECAST_YEARS; y++) {
    const yearStart = prevEnd;
    const yearEnd = yearlyTargets[y] ?? yearStart;
    const naturalEnd = yearStart * survival;
    let G = 0;
    if (S > 0) G = (yearEnd - naturalEnd) / S;
    if (!Number.isFinite(G) || G < 0) G = 0;

    for (let m = 0; m < 12; m++) {
      const idx = y * 12 + m;
      if (idx >= months) break;
      const startSubs = idx === 0 ? start : subscribersEnd[idx - 1];
      const churned = pos(startSubs) * c;
      const gross = pos(G * weights[m]);
      const endSubs = pos(startSubs - churned + gross);

      subscribersStart[idx] = startSubs;
      churnedSalons[idx] = churned;
      newSalons[idx] = gross;
      subscribersEnd[idx] = endSubs;
      totalSalons[idx] = endSubs;
    }
    prevEnd = subscribersEnd[Math.min(y * 12 + 11, months - 1)] ?? prevEnd;
  }
  return { totalSalons, subscribersStart, subscribersEnd, newSalons, churnedSalons };
}

export function computeStrategicForecast(state: StrategicAssumptions): StrategicForecastResult {
  const months = STRATEGIC_FORECAST_MONTHS;
  const churn = clamp01((state.monthlyChurnPct ?? 0) / 100);
  const monthlyWeights = normalizeMonthlyWeights();

  // ── Total salons trajectory (target-driven, ramped) ──
  // Customers ramp inside each year using monthly weights so January looks
  // very different from December — January is quieter (fewer hires, smaller
  // marketing spend) and December is the heaviest acquisition month.
  const subscriberRamp = rampSubscribersWithChurn(
    state.startingSalons,
    state.yearlySalonTargets,
    churn,
    monthlyWeights,
  );
  const totalSalons = subscriberRamp.totalSalons;
  const subscribersStart = subscriberRamp.subscribersStart;
  const subscribersEnd = subscriberRamp.subscribersEnd;
  const newSalons = subscriberRamp.newSalons;
  const churnedSalons = subscriberRamp.churnedSalons;

  // ── Per-profile series ──
  const byProfile: Record<SalonProfileId, ProfileSeries> = {} as Record<SalonProfileId, ProfileSeries>;
  for (const profile of state.profiles) {
    byProfile[profile.id] = {
      profile,
      customers: makeArr(months),
      newCustomers: makeArr(months),
      churnedCustomers: makeArr(months),
      baseSubMrr: makeArr(months),
      aiBookingMrr: makeArr(months),
      aiCreditsMrr: makeArr(months),
      posSalons: makeArr(months),
      posPaymentVolume: makeArr(months),
      posMrr: makeArr(months),
      hardwareUnits: makeArr(months),
      hardwareRevenue: makeArr(months),
      hardwareCogs: makeArr(months),
      hardwareGrossProfit: makeArr(months),
      marketplaceColoristsActive: makeArr(months),
      marketplaceGmv: makeArr(months),
      marketplaceRevenue: makeArr(months),
      marketplaceGrossProfit: makeArr(months),
      recurringMrr: makeArr(months),
      acquisitionSpend: makeArr(months),
    };
  }

  const baseSaasMrr = makeArr(months);
  const aiBookingMrr = makeArr(months);
  const aiCreditsMrr = makeArr(months);
  const posMrr = makeArr(months);
  const marketplaceGmv = makeArr(months);
  const marketplaceRevenue = makeArr(months);
  const marketplaceGrossProfit = makeArr(months);
  const hardwareRevenue = makeArr(months);
  const hardwareCogs = makeArr(months);
  const hardwareGrossProfit = makeArr(months);
  const acquisitionSpend = makeArr(months);

  // Hardware sales only switch on at the start of `hardwareStartYear`.
  // Months before that produce zero hardware units / revenue / COGS even
  // if the per-profile hardware adoption is non-zero.
  const hardwareStartYear = Math.max(
    1,
    Math.min(STRATEGIC_FORECAST_YEARS, Math.round(state.hardwareStartYear ?? 3)),
  );
  const hardwareStartMonth = (hardwareStartYear - 1) * 12;

  // Linear activation ramp: returns 0 before `startMonthIdx`, then
  // climbs (1/N, 2/N, …) until it hits 1 after `rampMonths` have passed.
  // Used to gate POS / AI Booking / AI Credits revenue so each module
  // can launch later than month 1 with a smooth onset rather than a cliff.
  const makeActivation = (startMonth: number, rampMonths: number) => {
    const startIdx = Math.max(0, Math.min(months - 1, Math.round(startMonth) - 1));
    const ramp = Math.max(1, Math.round(rampMonths));
    return (i: number): number => {
      if (i < startIdx) return 0;
      const k = i - startIdx;
      if (k >= ramp) return 1;
      return (k + 1) / ramp;
    };
  };
  const posActivationFactor = makeActivation(state.posStartMonth ?? 18, state.posRampMonths ?? 12);
  const aiActivationFactor  = makeActivation(state.aiStartMonth  ?? 13, state.aiRampMonths  ?? 12);
  const marketplaceActivationFactor = makeActivation(
    state.marketplaceStartMonth ?? 25,
    state.marketplaceRampMonths ?? 12,
  );
  const marketplaceSpend = pos(state.marketplaceSpendPerColorist ?? 0);
  const marketplaceTake = clamp01(state.marketplaceTakeRate ?? 0);
  const marketplaceMargin = clamp01(state.marketplaceGrossMargin ?? 0);

  for (let i = 0; i < months; i++) {
    const hardwareActive = i >= hardwareStartMonth;
    const posFactor = posActivationFactor(i);
    const aiFactor  = aiActivationFactor(i);
    const marketplaceFactor = marketplaceActivationFactor(i);
    for (const profile of state.profiles) {
      const series = byProfile[profile.id];
      const share = (Number.isFinite(profile.mixPct) ? profile.mixPct : 0) / 100;
      const cust = pos(totalSalons[i]) * share;
      const adds = pos(newSalons[i]) * share;
      const churnedCustomers = pos(churnedSalons[i]) * share;

      series.customers[i] = cust;
      series.newCustomers[i] = adds;
      series.churnedCustomers[i] = churnedCustomers;

      // Per-profile intro pricing: customers exist on the platform from
      // day 1, but pay `introBasePrice` until the full `basePrice` kicks
      // in at `basePriceStartMonth`. Defaults reflect Spectra's reality
      // — Solo/Studio have legacy customers paying ~$68 today, larger
      // profiles aren't sold at all in early Y1.
      const fullBasePriceMonth = Math.max(
        1,
        Math.min(months, Math.round(profile.basePriceStartMonth ?? 1)),
      );
      const baseSubPrice = i + 1 < fullBasePriceMonth
        ? pos(profile.introBasePrice ?? 0)
        : pos(profile.basePrice);
      series.baseSubMrr[i]    = cust * baseSubPrice;
      series.aiBookingMrr[i]  = cust * clamp01(profile.aiBookingAdoption) * aiFactor * pos(profile.aiBookingPrice);
      series.aiCreditsMrr[i]  = cust * clamp01(profile.aiCreditsAdoption) * aiFactor * pos(profile.aiCreditsPrice);

      series.posSalons[i]         = cust * clamp01(profile.posAdoption) * posFactor;
      series.posPaymentVolume[i]  = series.posSalons[i] * pos(profile.posSalonRevenue);
      series.posMrr[i]            = series.posPaymentVolume[i] * clamp01(state.posTakeRate);

      const hwAdoption = hardwareActive ? clamp01(profile.hardwareAdoption) : 0;
      series.hardwareUnits[i]        = adds * hwAdoption;
      series.hardwareRevenue[i]      = series.hardwareUnits[i] * pos(state.hardwarePrice);
      series.hardwareCogs[i]         = series.hardwareUnits[i] * pos(state.hardwareCost);
      series.hardwareGrossProfit[i]  = series.hardwareRevenue[i] - series.hardwareCogs[i];

      // Marketplace: every colorist on staff orders supplies/equipment
      // through the Spectra marketplace, and we earn an affiliate take on
      // the order value. Sales are gated to start in M25 with a 12-month
      // ramp (matches POS/AI activation pattern).
      const profileColorists = pos(profile.marketplaceColorists);
      const activeColorists = cust * profileColorists * marketplaceFactor;
      const profileGmv = activeColorists * marketplaceSpend;
      const profileMarketRev = profileGmv * marketplaceTake;
      series.marketplaceColoristsActive[i] = activeColorists;
      series.marketplaceGmv[i] = profileGmv;
      series.marketplaceRevenue[i] = profileMarketRev;
      series.marketplaceGrossProfit[i] = profileMarketRev * marketplaceMargin;

      series.recurringMrr[i] =
        series.baseSubMrr[i] +
        series.aiBookingMrr[i] +
        series.aiCreditsMrr[i] +
        series.posMrr[i] +
        series.marketplaceRevenue[i];
      series.acquisitionSpend[i] = adds * pos(profile.cac);

      baseSaasMrr[i]               += series.baseSubMrr[i];
      aiBookingMrr[i]              += series.aiBookingMrr[i];
      aiCreditsMrr[i]              += series.aiCreditsMrr[i];
      posMrr[i]                    += series.posMrr[i];
      marketplaceGmv[i]            += series.marketplaceGmv[i];
      marketplaceRevenue[i]        += series.marketplaceRevenue[i];
      marketplaceGrossProfit[i]    += series.marketplaceGrossProfit[i];
      hardwareRevenue[i]           += series.hardwareRevenue[i];
      hardwareCogs[i]              += series.hardwareCogs[i];
      hardwareGrossProfit[i]       += series.hardwareGrossProfit[i];
      acquisitionSpend[i]          += series.acquisitionSpend[i];
    }
  }

  // ── Data segments ──
  const totalDataCustomers = rampValuesNoChurn(0, state.yearlyDataCustomers, monthlyWeights);
  const byDataSegment: Record<DataSegmentId, DataSegmentSeries> = {} as Record<DataSegmentId, DataSegmentSeries>;
  for (const segment of state.dataSegments) {
    byDataSegment[segment.id] = {
      segment,
      customers: makeArr(months),
      mrr: makeArr(months),
    };
  }
  const dataMrr = makeArr(months);
  for (let i = 0; i < months; i++) {
    for (const segment of state.dataSegments) {
      const share = (Number.isFinite(segment.mixPct) ? segment.mixPct : 0) / 100;
      const cust = pos(totalDataCustomers[i]) * share;
      const series = byDataSegment[segment.id];
      series.customers[i] = cust;
      series.mrr[i] = cust * pos(segment.monthlyPrice);
      dataMrr[i] += series.mrr[i];
    }
  }

  // ── Aggregates / margins ──
  const recurringMrr = makeArr(months);
  const recurringArr = makeArr(months);
  const totalRevenue = makeArr(months);
  const saasGrossProfit = makeArr(months);
  const dataGrossProfit = makeArr(months);
  const posGrossProfit  = makeArr(months);
  const grossProfit     = makeArr(months);
  const grossMargin     = makeArr(months);
  const blendedSubArpu  = makeArr(months);
  const blendedTotalArpu = makeArr(months);
  const dataBlendedArpu = makeArr(months);
  const blendedCac      = makeArr(months);

  for (let i = 0; i < months; i++) {
    recurringMrr[i] =
      baseSaasMrr[i] +
      aiBookingMrr[i] +
      aiCreditsMrr[i] +
      posMrr[i] +
      dataMrr[i] +
      marketplaceRevenue[i];
    recurringArr[i] = recurringMrr[i] * 12;
    totalRevenue[i] = recurringMrr[i] + hardwareRevenue[i];

    const saasRecurring = baseSaasMrr[i] + aiBookingMrr[i] + aiCreditsMrr[i];
    saasGrossProfit[i] = saasRecurring * clamp01(state.saasGrossMargin);
    dataGrossProfit[i] = dataMrr[i] * clamp01(state.dataGrossMargin);
    posGrossProfit[i]  = posMrr[i]  * clamp01(state.posGrossMargin);
    grossProfit[i] =
      saasGrossProfit[i] +
      dataGrossProfit[i] +
      posGrossProfit[i] +
      marketplaceGrossProfit[i] +
      hardwareGrossProfit[i];
    grossMargin[i] = totalRevenue[i] > 0 ? grossProfit[i] / totalRevenue[i] : 0;

    const totalSalonsAtMonth = pos(totalSalons[i]);
    blendedSubArpu[i]   = totalSalonsAtMonth > 0 ? baseSaasMrr[i] / totalSalonsAtMonth : 0;
    blendedTotalArpu[i] = totalSalonsAtMonth > 0
      ? (
          baseSaasMrr[i] +
          aiBookingMrr[i] +
          aiCreditsMrr[i] +
          posMrr[i] +
          marketplaceRevenue[i]
        ) / totalSalonsAtMonth
      : 0;
    const dataCust = pos(totalDataCustomers[i]);
    dataBlendedArpu[i] = dataCust > 0 ? dataMrr[i] / dataCust : 0;

    const grossNew = pos(newSalons[i]);
    blendedCac[i] = grossNew > 0 ? acquisitionSpend[i] / grossNew : 0;
  }

  // ── Opex (annual → spread evenly across 12 months in that year) ──
  const opexByCategory: Record<string, number[]> = {
    [STRATEGIC_CATEGORY_RND]: makeArr(months),
    [STRATEGIC_CATEGORY_MS]: makeArr(months),
    [STRATEGIC_CATEGORY_OPS]: makeArr(months),
    [STRATEGIC_CATEGORY_MGMT]: makeArr(months),
    [STRATEGIC_CATEGORY_ADMIN]: makeArr(months),
  };
  const totalOpex = makeArr(months);
  const ebitda = makeArr(months);

  // Spread the annual budget across the 12 months of that year using the
  // same ramp curve used for customer acquisition. January gets a smaller
  // slice than December, mirroring real hiring/marketing/operations ramp.
  // Annual sum is preserved exactly because the weights are normalized.
  // TODO: Connect a more granular salary/hiring ramp to the operating model.
  const yearlyToMonthly = (yearly: number[], cat: string) => {
    for (let y = 0; y < STRATEGIC_FORECAST_YEARS; y++) {
      const annual = pos(yearly[y] ?? 0);
      for (let m = 0; m < 12; m++) {
        const idx = y * 12 + m;
        if (idx >= months) break;
        opexByCategory[cat][idx] += annual * monthlyWeights[m];
      }
    }
  };
  yearlyToMonthly(state.yearlyOpex.rnd,   STRATEGIC_CATEGORY_RND);
  yearlyToMonthly(state.yearlyOpex.ms,    STRATEGIC_CATEGORY_MS);
  yearlyToMonthly(state.yearlyOpex.ops,   STRATEGIC_CATEGORY_OPS);
  yearlyToMonthly(state.yearlyOpex.mgmt,  STRATEGIC_CATEGORY_MGMT);
  yearlyToMonthly(state.yearlyOpex.admin, STRATEGIC_CATEGORY_ADMIN);
  // Marketing & Sales also absorbs raw acquisition spend (transparent, no cap).
  for (let i = 0; i < months; i++) {
    opexByCategory[STRATEGIC_CATEGORY_MS][i] += acquisitionSpend[i];
    let row = 0;
    for (const cat of STRATEGIC_OPEX_CATEGORIES) row += opexByCategory[cat][i];
    totalOpex[i] = row;
    ebitda[i] = grossProfit[i] - totalOpex[i];
  }

  // ── Cash trajectory (audit layer) ──
  const seedInvestment = pos(state.seedInvestment ?? 0);
  const cumulativeEbitda = makeArr(months);
  const cashBalance = makeArr(months);
  const cumulativeNewSalons = makeArr(months);
  const averageActiveSalons = makeArr(months);
  let runningEbitda = 0;
  let runningNewSalons = 0;
  let breakevenMonthIdx = -1;
  let maxCashTroughUsd = 0;
  let maxCashTroughMonthIdx = -1;
  for (let i = 0; i < months; i++) {
    runningEbitda += Number.isFinite(ebitda[i]) ? ebitda[i] : 0;
    cumulativeEbitda[i] = runningEbitda;
    cashBalance[i] = seedInvestment + runningEbitda;
    runningNewSalons += pos(newSalons[i]);
    cumulativeNewSalons[i] = runningNewSalons;
    averageActiveSalons[i] = (pos(subscribersStart[i]) + pos(subscribersEnd[i])) / 2;
    if (breakevenMonthIdx < 0 && (ebitda[i] ?? 0) > 0) breakevenMonthIdx = i;
    if (cashBalance[i] < 0 && cashBalance[i] < maxCashTroughUsd) {
      maxCashTroughUsd = cashBalance[i];
      maxCashTroughMonthIdx = i;
    }
  }
  const safetyBufferUsd = seedInvestment + maxCashTroughUsd;

  // ── Yearly rollup ──
  const yearly: YearlyRollup[] = STRATEGIC_YEAR_RANGES.map((range) => {
    const last = range.end - 1;
    const yIdx = range.year - 1;
    const opexCats: Record<string, number> = {};
    let totalOpexY = 0;
    for (const cat of STRATEGIC_OPEX_CATEGORIES) {
      let s = 0;
      for (let i = range.start; i < range.end; i++) s += opexByCategory[cat][i];
      opexCats[cat] = s;
      totalOpexY += s;
    }
    const sumRange = (xs: number[]) => {
      let s = 0;
      for (let i = range.start; i < range.end; i++) s += xs[i];
      return s;
    };
    const baseSaasRevenue = sumRange(baseSaasMrr);
    const aiBookingRevenue = sumRange(aiBookingMrr);
    const aiCreditsRevenue = sumRange(aiCreditsMrr);
    const posRevenueY = sumRange(posMrr);
    const dataRevenue = sumRange(dataMrr);
    const marketplaceGmvY = sumRange(marketplaceGmv);
    const marketplaceRevenueY = sumRange(marketplaceRevenue);
    const marketplaceGrossY = sumRange(marketplaceGrossProfit);
    const hardwareRevenueY = sumRange(hardwareRevenue);
    const hardwareCogsY = sumRange(hardwareCogs);
    const hardwareGrossY = hardwareRevenueY - hardwareCogsY;
    const recurringRevenue =
      baseSaasRevenue +
      aiBookingRevenue +
      aiCreditsRevenue +
      posRevenueY +
      dataRevenue +
      marketplaceRevenueY;
    const totalRevenueY = recurringRevenue + hardwareRevenueY;
    const acquisitionY = sumRange(acquisitionSpend);
    const saasGrossY = (baseSaasRevenue + aiBookingRevenue + aiCreditsRevenue) * clamp01(state.saasGrossMargin);
    const dataGrossY = dataRevenue * clamp01(state.dataGrossMargin);
    const posGrossY  = posRevenueY  * clamp01(state.posGrossMargin);
    const grossProfitY = saasGrossY + dataGrossY + posGrossY + marketplaceGrossY + hardwareGrossY;
    const grossMarginY = totalRevenueY > 0 ? grossProfitY / totalRevenueY : 0;

    const newCustomersByProfile: Record<SalonProfileId, number> = {} as Record<SalonProfileId, number>;
    const endingCustomersByProfile: Record<SalonProfileId, number> = {} as Record<SalonProfileId, number>;
    let hardwareUnitsY = 0;
    for (const profile of state.profiles) {
      const series = byProfile[profile.id];
      newCustomersByProfile[profile.id] = sumRange(series.newCustomers);
      endingCustomersByProfile[profile.id] = series.customers[last] ?? 0;
      hardwareUnitsY += sumRange(series.hardwareUnits);
    }

    let lowestCashY = Number.POSITIVE_INFINITY;
    for (let i = range.start; i < range.end; i++) {
      if (cashBalance[i] < lowestCashY) lowestCashY = cashBalance[i];
    }
    if (!Number.isFinite(lowestCashY)) lowestCashY = cashBalance[last] ?? 0;

    return {
      year: range.year,
      startMonth: range.start,
      endMonth: range.end,
      endingSalons: totalSalons[last] ?? 0,
      endingDataCustomers: totalDataCustomers[last] ?? 0,
      endingMrr: recurringMrr[last] ?? 0,
      endingArr: recurringArr[last] ?? 0,
      baseSaasRevenue,
      aiBookingRevenue,
      aiCreditsRevenue,
      posRevenue: posRevenueY,
      paymentVolume: state.profiles.reduce((sum, p) => sum + sumRange(byProfile[p.id].posPaymentVolume), 0),
      dataRevenue,
      marketplaceGmv: marketplaceGmvY,
      marketplaceRevenue: marketplaceRevenueY,
      marketplaceGrossProfit: marketplaceGrossY,
      hardwareRevenue: hardwareRevenueY,
      hardwareCogs: hardwareCogsY,
      hardwareGrossProfit: hardwareGrossY,
      recurringRevenue,
      totalRevenue: totalRevenueY,
      recurringPct: totalRevenueY > 0 ? recurringRevenue / totalRevenueY : 0,
      saasGrossProfit: saasGrossY,
      dataGrossProfit: dataGrossY,
      posGrossProfit: posGrossY,
      grossProfit: grossProfitY,
      grossMargin: grossMarginY,
      acquisitionSpend: acquisitionY,
      opexByCategory: opexCats,
      totalOpex: totalOpexY,
      ebitda: grossProfitY - totalOpexY,
      newCustomersByProfile,
      endingCustomersByProfile,
      hardwareUnits: hardwareUnitsY,
      endingCashBalance: cashBalance[last] ?? 0,
      lowestCashBalance: lowestCashY,
    };
  });

  return {
    monthLabels: STRATEGIC_MONTH_LABELS,
    yearRanges: STRATEGIC_YEAR_RANGES,
    totalSalons,
    subscribersStart,
    subscribersEnd,
    newSalons,
    churnedSalons,
    cumulativeNewSalons,
    averageActiveSalons,
    byProfile,
    byDataSegment,
    baseSaasMrr,
    aiBookingMrr,
    aiCreditsMrr,
    posMrr,
    dataMrr,
    marketplaceGmv,
    marketplaceRevenue,
    marketplaceGrossProfit,
    recurringMrr,
    recurringArr,
    hardwareRevenue,
    hardwareCogs,
    hardwareGrossProfit,
    totalRevenue,
    saasGrossProfit,
    dataGrossProfit,
    posGrossProfit,
    grossProfit,
    grossMargin,
    acquisitionSpend,
    blendedCac,
    opexByCategory,
    totalOpex,
    ebitda,
    blendedSubArpu,
    blendedTotalArpu,
    dataBlendedArpu,
    cumulativeEbitda,
    cashBalance,
    breakevenMonthIdx,
    maxCashTroughUsd,
    maxCashTroughMonthIdx,
    safetyBufferUsd,
    seedInvestment,
    yearly,
  };
}

// ── Persistence (localStorage only — independent from the operating model) ──

export function parseStrategicState(raw: unknown): StrategicAssumptions | null {
  if (!raw || typeof raw !== "object") return null;
  try {
    const def = buildDefaultStrategicAssumptions();
    const r = raw as Record<string, unknown>;

    const num = (v: unknown, fb: number) => {
      const n = typeof v === "string" ? parseFloat(v) : (v as number);
      return typeof n === "number" && Number.isFinite(n) ? n : fb;
    };
    const numArr = (v: unknown, fb: number[]) => {
      if (!Array.isArray(v)) return fb.slice();
      return fb.map((d, i) => num(v[i], d));
    };

    const profilesRaw = Array.isArray(r.profiles) ? (r.profiles as Record<string, unknown>[]) : [];
    const profiles: SalonProfile[] = def.profiles.map((tpl) => {
      const found = profilesRaw.find((p) => p?.id === tpl.id) ?? {};
      return {
        ...tpl,
        mixPct: num(found.mixPct, tpl.mixPct),
        basePrice: num(found.basePrice, tpl.basePrice),
        introBasePrice: Math.max(0, num(found.introBasePrice, tpl.introBasePrice)),
        basePriceStartMonth: Math.max(
          1,
          Math.min(STRATEGIC_FORECAST_MONTHS, Math.round(num(found.basePriceStartMonth, tpl.basePriceStartMonth))),
        ),
        aiBookingPrice: num(found.aiBookingPrice, tpl.aiBookingPrice),
        aiBookingAdoption: num(found.aiBookingAdoption, tpl.aiBookingAdoption),
        aiCreditsPrice: num(found.aiCreditsPrice, tpl.aiCreditsPrice),
        aiCreditsAdoption: num(found.aiCreditsAdoption, tpl.aiCreditsAdoption),
        posSalonRevenue: num(found.posSalonRevenue, tpl.posSalonRevenue),
        posAdoption: num(found.posAdoption, tpl.posAdoption),
        hardwareAdoption: num(found.hardwareAdoption, tpl.hardwareAdoption),
        cac: num(found.cac, tpl.cac),
        marketplaceColorists: Math.max(0, num(found.marketplaceColorists, tpl.marketplaceColorists)),
      };
    });

    const segmentsRaw = Array.isArray(r.dataSegments) ? (r.dataSegments as Record<string, unknown>[]) : [];
    const dataSegments: DataSegment[] = def.dataSegments.map((tpl) => {
      const found = segmentsRaw.find((s) => s?.id === tpl.id) ?? {};
      return {
        ...tpl,
        mixPct: num(found.mixPct, tpl.mixPct),
        monthlyPrice: num(found.monthlyPrice, tpl.monthlyPrice),
      };
    });

    const opexRaw = (r.yearlyOpex as Record<string, unknown>) ?? {};
    return {
      startingSalons: num(r.startingSalons, def.startingSalons),
      yearlySalonTargets: numArr(r.yearlySalonTargets, def.yearlySalonTargets),
      yearlyDataCustomers: numArr(r.yearlyDataCustomers, def.yearlyDataCustomers),
      monthlyChurnPct: num(r.monthlyChurnPct, def.monthlyChurnPct),
      posTakeRate: num(r.posTakeRate, def.posTakeRate),
      hardwarePrice: num(r.hardwarePrice, def.hardwarePrice),
      hardwareCost: num(r.hardwareCost, def.hardwareCost),
      hardwareStartYear: Math.max(
        1,
        Math.min(STRATEGIC_FORECAST_YEARS, Math.round(num(r.hardwareStartYear, def.hardwareStartYear))),
      ),
      seedInvestment: Math.max(0, num(r.seedInvestment, def.seedInvestment)),
      posStartMonth: Math.max(
        1,
        Math.min(STRATEGIC_FORECAST_MONTHS, Math.round(num(r.posStartMonth, def.posStartMonth))),
      ),
      posRampMonths: Math.max(1, Math.round(num(r.posRampMonths, def.posRampMonths))),
      aiStartMonth: Math.max(
        1,
        Math.min(STRATEGIC_FORECAST_MONTHS, Math.round(num(r.aiStartMonth, def.aiStartMonth))),
      ),
      aiRampMonths: Math.max(1, Math.round(num(r.aiRampMonths, def.aiRampMonths))),
      marketplaceStartMonth: Math.max(
        1,
        Math.min(
          STRATEGIC_FORECAST_MONTHS,
          Math.round(num(r.marketplaceStartMonth, def.marketplaceStartMonth)),
        ),
      ),
      marketplaceRampMonths: Math.max(1, Math.round(num(r.marketplaceRampMonths, def.marketplaceRampMonths))),
      marketplaceSpendPerColorist: Math.max(0, num(r.marketplaceSpendPerColorist, def.marketplaceSpendPerColorist)),
      marketplaceTakeRate: num(r.marketplaceTakeRate, def.marketplaceTakeRate),
      marketplaceGrossMargin: num(r.marketplaceGrossMargin, def.marketplaceGrossMargin),
      saasGrossMargin: num(r.saasGrossMargin, def.saasGrossMargin),
      dataGrossMargin: num(r.dataGrossMargin, def.dataGrossMargin),
      posGrossMargin: num(r.posGrossMargin, def.posGrossMargin),
      yearlyOpex: {
        rnd: numArr(opexRaw.rnd, def.yearlyOpex.rnd),
        ms: numArr(opexRaw.ms, def.yearlyOpex.ms),
        ops: numArr(opexRaw.ops, def.yearlyOpex.ops),
        mgmt: numArr(opexRaw.mgmt, def.yearlyOpex.mgmt),
        admin: numArr(opexRaw.admin, def.yearlyOpex.admin),
      },
      profiles,
      dataSegments,
      profileVersion: STRATEGIC_PROFILE_VERSION,
    };
  } catch {
    return null;
  }
}

export function loadStrategicState(): StrategicAssumptions {
  if (typeof window === "undefined") return buildDefaultStrategicAssumptions();
  try {
    const raw = window.localStorage.getItem(STRATEGIC_STORAGE_KEY);
    if (!raw) return buildDefaultStrategicAssumptions();
    const parsed = JSON.parse(raw);
    // If the saved profile version is older than the current model
    // version, re-seed with the latest defaults — older saves don't
    // carry the new fields and would silently fall back to neutral
    // values that hide the assumption changes.
    if (parsed && typeof parsed === "object" && parsed.profileVersion !== STRATEGIC_PROFILE_VERSION) {
      return buildDefaultStrategicAssumptions();
    }
    return parseStrategicState(parsed) ?? buildDefaultStrategicAssumptions();
  } catch {
    return buildDefaultStrategicAssumptions();
  }
}

export function saveStrategicState(state: StrategicAssumptions) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STRATEGIC_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* no-op */
  }
}

// ── Formatting helpers (independent so the model stays standalone) ──

const fmtUsd  = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtNum0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const fmtNum1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const fmtNum2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export const sMoney = (v: number) => (Number.isFinite(v) ? fmtUsd.format(Math.round(v)) : "—");
export const sMoneyShort = (v: number) => {
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${fmtNum1.format(abs / 1_000_000_000)}B`;
  if (abs >= 1_000_000) return `${sign}$${fmtNum1.format(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${fmtNum0.format(abs / 1_000)}k`;
  return `${sign}$${fmtNum0.format(abs)}`;
};
export const sInt = (v: number) => (Number.isFinite(v) ? fmtNum0.format(Math.round(v)) : "—");
export const sIntShort = (v: number) => {
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${fmtNum1.format(v / 1_000_000)}M`;
  if (abs >= 1_000) return `${fmtNum1.format(v / 1_000)}k`;
  return fmtNum0.format(Math.round(v));
};
export const sDec1 = (v: number) => (Number.isFinite(v) ? fmtNum1.format(v) : "—");
export const sDec2 = (v: number) => (Number.isFinite(v) ? fmtNum2.format(v) : "—");
export const sPct = (v: number) => (Number.isFinite(v) ? `${fmtNum1.format(v)}%` : "—");
export const sPctFromRatio = (v: number) => sPct((Number.isFinite(v) ? v : 0) * 100);
export const sSum = (xs: number[]) => xs.reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);

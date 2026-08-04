/**
 * Live analytics adapter.
 *
 * Derives every analytics view-model from the canonical, tenant-scoped CRM
 * state exposed through `crmHooks`. It never imports seed / mock data, so the
 * restored Salon Performance dashboard shows only real data for the current
 * salon session.
 *
 * Financial honesty rules (Checkout / Payments / Expenses do not exist yet):
 *  - Revenue is NEVER treated as confirmed. Values derived from booked service
 *    prices are surfaced as an *estimate* and flagged via `revenueIsEstimated`.
 *  - Scheduled appointments are excluded from revenue; only completed and
 *    in-progress appointments contribute booked value.
 *  - Expenses and retail sales have no live ledger yet. When there is enough
 *    booked service activity, `financeDemo` supplies a deterministic pilot
 *    preview and flips `hasExpenseData` / `hasRetailData` so Sales/Expenses
 *    tabs can render; UI copy must label those numbers as pilot preview.
 */

import { useMemo } from "react";
import {
  useAppointments,
  useCustomers,
  useInventoryItems,
  useMixSessions,
  useProducts,
  useBrands,
  useProductUsage,
  useReweighOutcomes,
  useServices,
  useStaffPerformance,
} from "../SalonCRM/data/crmHooks";
import type {
  Appointment,
  Brand,
  Customer,
  InventoryItem,
  MixSession,
  Product,
  ProductUsage,
  ReweighOutcome,
  Service,
  ServiceCategoryId,
} from "../SalonCRM/data/crmTypes";
import type { StaffPerformanceVm } from "../SalonCRM/data/crmSelectors";
import { useCrmLocale } from "../SalonCRM/i18n/CrmLocale";
import type { CrmLang } from "../SalonCRM/i18n/translations";
import {
  monthLabel,
  monthsInRange,
  type DateRange,
} from "./analyticsDateRange";
import {
  ANALYTICS_TRUTH_VERSION,
  MINIMUM_SAMPLE,
  type MetricClassification,
} from "./analyticsTruth";
import {
  buildPilotFinanceDemo,
  type PilotFinanceDemo,
} from "./pilotFinanceDemo";

// ── View-model interfaces (previously sourced from the mock analytics module) ──

export interface StaffVm {
  id: string;
  name: string;
  role: string;
  color: string;
  appointments: number;
  revenue: number;
  utilization: number;
  avgServiceTime: number;
  clientRetention: number;
  rating: number;
  trend: number;
}

export interface ProductVm {
  id: string;
  name: string;
  brand: string;
  category: string;
  usageGrams: number;
  cost: number;
  unitPrice: number;
  stockLevel: "high" | "medium" | "low" | "critical";
  trend: number;
}

type ReportCategoryName = "Color" | "Highlights" | "Toner" | "Straightening" | "Treatment" | "Others";

export interface ServiceVm {
  id: string;
  name: string;
  category: string;
  avgDuration: number;
  avgPrice: number;
  avgMaterialCost: number;
  totalPerformed: number;
  revenue: number;
  trend: number;
}

/** One customer × category × day material rollup (mixes/bowls summed). */
export interface CategoryMaterialDayDetail {
  id: string;
  category: ReportCategoryName;
  customerId: string;
  customerName: string;
  day: string;
  /** Distinct mixes (pink summary rows) — not ingredient lines. */
  bowlCount: number;
  visitCount: number;
  totalGrams: number;
  totalCost: number;
  avgCostPerBowl: number;
  serviceNames: string[];
  materialLabels: string[];
}

/** Compact material label for drill-down. Developers show only oxidant % (e.g. "6%"). */
export function formatMaterialUsageLabel(usage: {
  sourceBrand?: string | null;
  sourceSeries?: string | null;
  sourceShade?: string | null;
}): string {
  const brand = String(usage.sourceBrand || "").trim();
  const series = String(usage.sourceSeries || "").trim();
  const shade = String(usage.sourceShade || "").trim();
  const hay = `${brand} ${series} ${shade}`.toUpperCase();
  const isDeveloper =
    /\b(DEVELOP|OXYD|OXIDE|OXYCREM|DIACTIVAT|ACTIVATOR|WELLOXON|PRO OXIDE)/.test(hay)
    || /חמצן|מפתח/.test(hay);

  if (isDeveloper) {
    const pct = shade.match(/(\d+(?:[.,]\d+)?)\s*%/) || series.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (pct) return `${String(pct[1]).replace(",", ".")}%`;
    const vol = shade.match(/(\d+)\s*VOL/i) || series.match(/(\d+)\s*VOL/i);
    if (vol) {
      // Common mapping: 10/20/30/40 vol → 3/6/9/12%
      const volNum = Number(vol[1]);
      const mapped: Record<number, string> = { 10: "3%", 20: "6%", 30: "9%", 40: "12%" };
      if (mapped[volNum]) return mapped[volNum];
    }
    return shade || "חמצן";
  }

  // Color / bleach / treatment: series + shade (brand omitted for a tighter summary).
  return [series || brand, shade].filter(Boolean).join(" ").trim();
}

export interface MonthlyStaffRow {
  month: string;
  [key: string]: number | string;
}

export interface MonthlyProductRow {
  month: string;
  totalUsage: number;
  totalCost: number;
  /** Grams attributed to the visit's service category. */
  Color: number;
  Highlights: number;
  Toner: number;
  Straightening: number;
  Treatment: number;
  Others: number;
  /** Recorded material cost attributed to the visit's service category. */
  ColorCost: number;
  HighlightsCost: number;
  TonerCost: number;
  StraighteningCost: number;
  TreatmentCost: number;
  OthersCost: number;
}

export interface MonthlyServiceRow {
  month: string;
  Color: number;
  Highlights: number;
  Toner: number;
  Straightening: number;
  Treatment: number;
  Others: number;
  total: number;
  revenue: number;
}

export interface MonthlyCombinedRow {
  month: string;
  appointments: number;
  revenue: number;
  /**
   * Convenience material-cost value kept for backward compatibility with the
   * report components. It uses recorded product cost when present and falls
   * back to the service-default estimate otherwise. Because that fallback is
   * a silent conflation of two different truths, consumers should prefer the
   * explicit `recordedProductCost` / `estimatedMaterialCost` fields plus
   * `LiveAnalytics.materialCost.basis`. (Report migration is Slice B work.)
   *
   * @deprecated Use `recordedProductCost` + `estimatedMaterialCost` + basis.
   */
  productCost: number;
  /** Recorded material cost from product usage only (confirmed). No fallback. */
  recordedProductCost: number;
  /** Service-default material cost estimate only (estimated). */
  estimatedMaterialCost: number;
  productUsage: number;
}

// ── Analytics Truth provenance (Slice A) ───────────────────────────

/** Coverage of the active range relative to the data that actually exists. */
export interface AnalyticsCoverage {
  /** ISO timestamp of the range start (inclusive). */
  rangeFrom: string;
  /** ISO timestamp of the range end (inclusive). */
  rangeTo: string;
  monthsInRange: number;
  monthsWithActivity: number;
  firstActivityAt: string | null;
  lastActivityAt: string | null;
  /** True when the requested window is wider than the data we hold. */
  hasPartialCoverage: boolean;
  appointmentCount: number;
  recordedUsageRecordCount: number;
  /** Recorded usage rows whose product/currency linkage does not resolve. */
  unmappedProductUsageCount: number;
  mixSessionCount: number;
  reweighOutcomeCount: number;
  staffWithActivity: number;
}

/** How the material-cost number was produced — never silently conflated. */
export interface MaterialCostProvenance {
  /** Recorded material cost from product usage (confirmed). */
  recorded: number;
  /** Service-default material cost estimate. */
  estimated: number;
  /** Which source(s) actually produced the value across the range. */
  basis: "recorded" | "estimated" | "mixed" | "none";
  hasRecordedUsage: boolean;
}

/** Statistical guard results for the active range. */
export interface AnalyticsGuards {
  /** Period-over-period comparison needs activity in ≥ 2 periods. */
  comparisonAvailable: boolean;
  /** Generic ranking needs a reported sample. */
  rankingAvailable: boolean;
  /** Staff comparison needs ≥ 2 staff with activity. */
  staffComparisonAvailable: boolean;
  /** Anomaly detection needs a baseline of prior periods. */
  anomalyAvailable: boolean;
}

/** Classification of each major metric group for the active range. */
export interface AnalyticsProvenance {
  version: string;
  /** Booked service value is always an estimate, never confirmed. */
  revenue: MetricClassification;
  /** Depends on `materialCost.basis` (confirmed / estimated / unavailable). */
  materialCost: MetricClassification;
  /** Appointment / service volume. */
  volume: MetricClassification;
  /** Recorded product usage; incomplete when linkage/currency is broken. */
  recordedUsage: MetricClassification;
  /** Proportional category allocation of revenue/cost. */
  categoryAllocation: MetricClassification;
  /** No live checkout/payment source. */
  checkout: MetricClassification;
  /** No live expenses source. */
  expenses: MetricClassification;
  /** No live retail source. */
  retail: MetricClassification;
}

export interface OptimizationAggregate {
  reweighSavings: number;
  roundDownSavings: number;
  mixOptimizationSavings: number;
  extraChargeRevenue: number;
  reweighSavedGrams: number;
  roundDownSavedGrams: number;
  totalSavedGramsDirect: number;
  reweighMixes: number;
  totalMixes: number;
  reweighPct: number;
  days: number;
}

export interface LiveAnalytics {
  monthlyCombined: MonthlyCombinedRow[];
  monthlyServices: MonthlyServiceRow[];
  monthlyProducts: MonthlyProductRow[];
  monthlyStaff: MonthlyStaffRow[];
  staff: StaffVm[];
  products: ProductVm[];
  services: ServiceVm[];
  /**
   * Average recorded material cost per customer×category×day unit.
   * Multiple bowls / mix rows for the same client in the same category on the
   * same day are summed once, then averaged across those units.
   */
  categoryAvgMaterialCost: Partial<Record<ReportCategoryName, number>>;
  /**
   * Customer×category×day material rows for expandable category drill-down.
   * Full history; the UI paginates / infinite-scrolls the list.
   */
  categoryMaterialDays: CategoryMaterialDayDetail[];
  customerCount: number;
  newCustomerCount: number;
  optimization: OptimizationAggregate;
  /** Whether any confirmed checkout/payment records back the revenue numbers. */
  hasCheckoutData: boolean;
  /** Whether expense figures are available (pilot preview until Expenses module). */
  hasExpenseData: boolean;
  /** Whether retail figures are available (pilot preview until Checkout/POS). */
  hasRetailData: boolean;
  /**
   * Pilot preview for Sales + Expenses tabs, shaped from booked service activity.
   * Not checkout/ledger truth — marked as preview in the UI.
   */
  financeDemo: PilotFinanceDemo;
  /** True while revenue is derived from booked service prices, not checkout. */
  revenueIsEstimated: boolean;
  /** Whether the current range contains any operational activity at all. */
  hasActivity: boolean;
  /** Coverage of the active range vs the data that actually exists. */
  coverage: AnalyticsCoverage;
  /** Material-cost provenance — recorded vs estimated, never conflated silently. */
  materialCost: MaterialCostProvenance;
  /** Statistical guard results for the active range. */
  guards: AnalyticsGuards;
  /** Classification of each major metric group. */
  provenance: AnalyticsProvenance;
}

// ── Helpers ───────────────────────────────────────────────────────

const REPORT_CATEGORY_KEYS = ["Color", "Highlights", "Toner", "Straightening", "Treatment", "Others"] as const;
type ReportCategory = (typeof REPORT_CATEGORY_KEYS)[number];

const CATEGORY_LABELS: Record<ServiceCategoryId, ReportCategory> = {
  color: "Color",
  highlights: "Highlights",
  toner: "Toner",
  straightening: "Straightening",
  treatment: "Treatment",
  cut: "Others",
  other: "Others",
};

const REVENUE_STATUSES: ReadonlySet<Appointment["status"]> = new Set(["completed", "in-progress"]);
const VOLUME_EXCLUDED: ReadonlySet<Appointment["status"]> = new Set(["cancelled", "no-show"]);

function labelForCategory(id: ServiceCategoryId | undefined): ReportCategory {
  if (!id) return "Others";
  return CATEGORY_LABELS[id] ?? "Others";
}

/**
 * Infer CRM service category from a visit/service name.
 * Used when product-usage analytics must follow the service performed
 * (highlights / toner / straightening), not the SKU product type (almost
 * always hair-color → Color).
 */
export function categoryIdFromServiceName(serviceName: string | undefined | null): ServiceCategoryId | undefined {
  const raw = String(serviceName || "").trim();
  if (!raw) return undefined;
  const n = raw.toLowerCase();
  if (n.includes("toner") || n.includes("gloss")) return "toner";
  if (
    n.includes("highlight")
    || n.includes("balayage")
    || n.includes("balyage")
    || n.includes("ombre")
    || n.includes("t - section")
    || n.includes("t-section")
    || n.includes("t section")
  ) {
    return "highlights";
  }
  if (
    n.includes("keratin")
    || n.includes("treatment")
    || n.includes("טיפול")
    || n.includes("tipul")
  ) {
    return "treatment";
  }
  if (
    n.includes("straight")
    || n.includes("smooth")
    || n.includes("brazilian")
    || n.includes("japanese")
    || n.includes("russian")
  ) {
    return "straightening";
  }
  if (
    n.includes("color")
    || n.includes("tint")
    || n.includes("root")
    || n.includes("dye")
    || n.includes("צבע")
    || n.includes("краска")
    || n.includes("without service")
    || n.includes("tlv sanction")
  ) {
    return "color";
  }
  if (n.includes("cut") || n.includes("fade") || n.includes("תספורת")) return "cut";
  return "other";
}

/** Prefer visit/appointment category, then source service name, never product SKU type first. */
function resolveUsageCategoryLabel(opts: {
  appt?: Appointment;
  sourceServiceName?: string;
  productCategoryId?: ServiceCategoryId;
}): ReportCategory {
  if (opts.appt?.serviceCategoryId) {
    return labelForCategory(opts.appt.serviceCategoryId);
  }
  const fromName = categoryIdFromServiceName(opts.sourceServiceName || opts.appt?.serviceName);
  if (fromName) return labelForCategory(fromName);
  return labelForCategory(opts.productCategoryId);
}

function monthKeyOf(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

/** Local calendar day for customer×category×day material rollups. */
function dayKeyOf(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return String(iso || "").slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function inRange(iso: string, range: DateRange): boolean {
  const ts = new Date(iso).getTime();
  return Number.isFinite(ts) && ts >= range.from.getTime() && ts <= range.to.getTime();
}

function emptyCategoryCounts(): Record<(typeof REPORT_CATEGORY_KEYS)[number], number> {
  return { Color: 0, Highlights: 0, Toner: 0, Straightening: 0, Treatment: 0, Others: 0 };
}

// ── Pure core ─────────────────────────────────────────────────────

/** Canonical, tenant-scoped inputs the analytics view-model is derived from. */
export interface LiveAnalyticsInputs {
  appointments: Appointment[];
  customers: Customer[];
  services: Service[];
  inventory: InventoryItem[];
  products: Product[];
  brands: Brand[];
  productUsage: ProductUsage[];
  reweighOutcomes: ReweighOutcome[];
  mixSessions: MixSession[];
  performance: StaffPerformanceVm[];
}

/**
 * Derive the full analytics view-model from already-resolved CRM inputs.
 * Pure and side-effect free so it can be unit-tested without React or the
 * CRM provider. `useLiveAnalytics` is the memoized hook wrapper below.
 */
export function computeLiveAnalytics(
  input: LiveAnalyticsInputs,
  range: DateRange,
  lang: CrmLang = "en",
): LiveAnalytics {
  const {
    appointments,
    customers,
    services,
    inventory,
    products,
    brands,
    productUsage,
    reweighOutcomes,
    mixSessions,
    performance,
  } = input;

  {
    const serviceById = new Map(services.map((s) => [s.id, s]));
    const productById = new Map(products.map((p) => [p.id, p]));
    const brandById = new Map(brands.map((b) => [b.id, b]));
    const inventoryByProduct = new Map(inventory.map((inv) => [inv.productId, inv]));

    const months = monthsInRange(range);
    const monthKeys = months.map((d) => `${d.getFullYear()}-${d.getMonth()}`);
    const monthLabels = months.map((month) => monthLabel(month, lang));
    const monthIndex = new Map(monthKeys.map((k, i) => [k, i]));

    // ── Per-month operational + estimated financial buckets ──
    const apptCountByMonth = monthKeys.map(() => 0);
    const revenueByMonth = monthKeys.map(() => 0); // currency units, estimated booked
    const serviceDefaultMaterialByMonth = monthKeys.map(() => 0); // service-default fallback only
    const productCostByMonth = monthKeys.map(() => 0); // real recorded material usage when available
    const usageGramsByMonth = monthKeys.map(() => 0);
    const servicesCatByMonth = monthKeys.map(() => emptyCategoryCounts());
    const staffApptByMonth = monthKeys.map(() => ({} as Record<string, number>));

    const rangedAppointments = appointments.filter(
      (a) => inRange(a.startTime, range) && !VOLUME_EXCLUDED.has(a.status),
    );

    for (const appt of rangedAppointments) {
      const idx = monthIndex.get(monthKeyOf(appt.startTime));
      if (idx === undefined) continue;
      apptCountByMonth[idx] += 1;

      const label = labelForCategory(appt.serviceCategoryId);
      servicesCatByMonth[idx][label] += 1;

      staffApptByMonth[idx][appt.staffMemberId] =
        (staffApptByMonth[idx][appt.staffMemberId] ?? 0) + 1;

      if (REVENUE_STATUSES.has(appt.status)) {
        const svc = appt.serviceId ? serviceById.get(appt.serviceId) : undefined;
        const estimatedRevenueCents = typeof appt.estimatedRevenueCents === "number"
          ? appt.estimatedRevenueCents
          : (svc?.defaultPriceCents ?? 0);
        revenueByMonth[idx] += estimatedRevenueCents / 100;
        if (svc) {
          serviceDefaultMaterialByMonth[idx] += svc.defaultMaterialCostCents / 100;
        }
      }
    }

    // Product usage per month (grams + cost) grouped by the *visit service*
    // category — not the product SKU type (which collapses almost everything
    // to Color for hair-color / bleach / developer lines).
    const usageCatByMonth = monthKeys.map(() => emptyCategoryCounts());
    const usageCostCatByMonth = monthKeys.map(() => emptyCategoryCounts());
    const apptById = new Map(appointments.map((a) => [a.id, a]));
    const KNOWN_CURRENCIES = new Set(["USD", "ILS", "EUR"]);
    let recordedUsageRecordCount = 0;
    let unmappedProductUsageCount = 0;
    for (const usage of productUsage) {
      if (!inRange(usage.recordedAt, range)) continue;
      recordedUsageRecordCount += 1;
      const prod = productById.get(usage.productId);
      // Broken linkage / unknown currency makes a recorded row untrustworthy
      // as a confirmed cost. We keep it visible via the unmapped counter and
      // downgrade the recordedUsage classification to `incomplete`.
      const currencyKnown = !usage.costCurrency || KNOWN_CURRENCIES.has(usage.costCurrency);
      if (!prod || !currencyKnown || !Number.isFinite(usage.costAtUseUsd)) {
        unmappedProductUsageCount += 1;
      }
      const idx = monthIndex.get(monthKeyOf(usage.recordedAt));
      if (idx === undefined) continue;
      usageGramsByMonth[idx] += usage.grams;
      productCostByMonth[idx] += usage.costAtUseUsd;
      const appt = usage.mixSessionId ? apptById.get(usage.mixSessionId) : undefined;
      const label = resolveUsageCategoryLabel({
        appt,
        sourceServiceName: usage.sourceServiceName,
        productCategoryId: prod?.serviceCategoryId,
      });
      usageCatByMonth[idx][label] += usage.grams;
      if (Number.isFinite(usage.costAtUseUsd) && currencyKnown) {
        usageCostCatByMonth[idx][label] += usage.costAtUseUsd;
      }
    }

    const monthlyCombined: MonthlyCombinedRow[] = monthLabels.map((month, i) => ({
      month,
      appointments: apptCountByMonth[i],
      revenue: Math.round(revenueByMonth[i]),
      // `productCost` keeps the legacy recorded-or-estimate fallback for the
      // existing report components. The explicit fields below expose the two
      // truths separately so nothing is silently conflated.
      productCost: Math.round(productCostByMonth[i] || serviceDefaultMaterialByMonth[i]),
      recordedProductCost: Math.round(productCostByMonth[i]),
      estimatedMaterialCost: Math.round(serviceDefaultMaterialByMonth[i]),
      productUsage: Math.round(usageGramsByMonth[i]),
    }));

    const monthlyServices: MonthlyServiceRow[] = monthLabels.map((month, i) => ({
      month,
      Color: servicesCatByMonth[i].Color,
      Highlights: servicesCatByMonth[i].Highlights,
      Toner: servicesCatByMonth[i].Toner,
      Straightening: servicesCatByMonth[i].Straightening,
      Treatment: servicesCatByMonth[i].Treatment,
      Others: servicesCatByMonth[i].Others,
      total: apptCountByMonth[i],
      revenue: Math.round(revenueByMonth[i]),
    }));

    const monthlyProducts: MonthlyProductRow[] = monthLabels.map((month, i) => ({
      month,
      totalUsage: Math.round(usageGramsByMonth[i]),
      totalCost: Math.round(productCostByMonth[i]),
      Color: Math.round(usageCatByMonth[i].Color),
      Highlights: Math.round(usageCatByMonth[i].Highlights),
      Toner: Math.round(usageCatByMonth[i].Toner),
      Straightening: Math.round(usageCatByMonth[i].Straightening),
      Treatment: Math.round(usageCatByMonth[i].Treatment),
      Others: Math.round(usageCatByMonth[i].Others),
      ColorCost: Math.round(usageCostCatByMonth[i].Color),
      HighlightsCost: Math.round(usageCostCatByMonth[i].Highlights),
      TonerCost: Math.round(usageCostCatByMonth[i].Toner),
      StraighteningCost: Math.round(usageCostCatByMonth[i].Straightening),
      TreatmentCost: Math.round(usageCostCatByMonth[i].Treatment),
      OthersCost: Math.round(usageCostCatByMonth[i].Others),
    }));

    const monthlyStaff: MonthlyStaffRow[] = monthLabels.map((month, i) => {
      const row: MonthlyStaffRow = { month };
      for (const perf of performance) {
        row[perf.staff.id] = staffApptByMonth[i][perf.staff.id] ?? 0;
      }
      return row;
    });

    // ── Staff view models (live utilization / booked revenue estimate) ──
    const avgServiceMinutes = services.length > 0
      ? Math.round(services.reduce((s, sv) => s + sv.defaultDurationMinutes, 0) / services.length)
      : 0;

    const staff: StaffVm[] = performance.map((perf) => ({
      id: perf.staff.id,
      name: perf.staff.name,
      role: perf.staff.role,
      color: perf.staff.color,
      appointments: perf.appointments,
      revenue: Math.round(perf.revenueCents / 100),
      utilization: perf.utilizationPct,
      avgServiceTime: avgServiceMinutes,
      clientRetention: 0,
      rating: perf.rating,
      trend: 0,
    }));

    // ── Service view models (booked / migration estimate) ──
    const performedByService = new Map<string, { count: number; revenueCents: number }>();
    for (const appt of appointments) {
      if (!inRange(appt.startTime, range)) continue;
      if (!REVENUE_STATUSES.has(appt.status)) continue;
      if (!appt.serviceId) continue;
      const svc = serviceById.get(appt.serviceId);
      const revenueCents = typeof appt.estimatedRevenueCents === "number"
        ? appt.estimatedRevenueCents
        : (svc?.defaultPriceCents ?? 0);
      const bucket = performedByService.get(appt.serviceId) ?? { count: 0, revenueCents: 0 };
      bucket.count += 1;
      bucket.revenueCents += revenueCents;
      performedByService.set(appt.serviceId, bucket);
    }

    // Recorded material cost unit = customer × category × day.
    // One mix (pink Spectra summary row) = one bowl; white rows under it are
    // ingredients of that same mix. Multiple mixes same client/category/day
    // are summed into one drill-down row.
    type MaterialUnit = {
      category: ReportCategory;
      customerId: string;
      customerName: string;
      day: string;
      totalGrams: number;
      totalCost: number;
      serviceNames: Set<string>;
      materialLabels: Set<string>;
      visitIds: Set<string>;
    };
    const materialUnits = new Map<string, MaterialUnit>();
    const materialByVisit = new Map<string, number>();
    const customerNameById = new Map(
      customers.map((c) => [c.id, [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || c.id]),
    );
    for (const usage of productUsage) {
      if (!inRange(usage.recordedAt, range)) continue;
      if (!Number.isFinite(usage.costAtUseUsd)) continue;
      const currencyKnown = !usage.costCurrency || KNOWN_CURRENCIES.has(usage.costCurrency);
      if (!currencyKnown) continue;

      const appt = usage.mixSessionId ? apptById.get(usage.mixSessionId) : undefined;
      const categoryLabel = resolveUsageCategoryLabel({
        appt,
        sourceServiceName: usage.sourceServiceName,
        productCategoryId: productById.get(usage.productId)?.serviceCategoryId,
      });
      const customerId = appt?.customerId || appt?.customerName || usage.mixSessionId || usage.id;
      const customerName = (appt?.customerId && customerNameById.get(appt.customerId))
        || appt?.customerName
        || customerId;
      const day = dayKeyOf(appt?.startTime || usage.recordedAt);
      const unitKey = `${customerId}|${day}|${categoryLabel}`;
      const unit = materialUnits.get(unitKey) ?? {
        category: categoryLabel,
        customerId,
        customerName,
        day,
        totalGrams: 0,
        totalCost: 0,
        serviceNames: new Set<string>(),
        materialLabels: new Set<string>(),
        visitIds: new Set<string>(),
      };
      unit.totalGrams += Number.isFinite(usage.grams) ? usage.grams : 0;
      unit.totalCost += usage.costAtUseUsd;
      if (usage.sourceServiceName) unit.serviceNames.add(usage.sourceServiceName);
      else if (appt?.serviceName) unit.serviceNames.add(appt.serviceName);
      const materialLabel = formatMaterialUsageLabel(usage);
      if (materialLabel) unit.materialLabels.add(materialLabel);
      if (usage.mixSessionId) {
        unit.visitIds.add(usage.mixSessionId);
        materialByVisit.set(
          usage.mixSessionId,
          (materialByVisit.get(usage.mixSessionId) ?? 0) + usage.costAtUseUsd,
        );
      } else {
        // Orphan usage row with no visit still counts as its own mix.
        unit.visitIds.add(usage.id);
      }
      materialUnits.set(unitKey, unit);
    }

    const categoryMaterialTotals = emptyCategoryCounts();
    const categoryMaterialUnits = emptyCategoryCounts();
    for (const unit of materialUnits.values()) {
      categoryMaterialTotals[unit.category] += unit.totalCost;
      categoryMaterialUnits[unit.category] += 1;
    }
    const categoryAvgMaterialCost: Partial<Record<ReportCategory, number>> = {};
    for (const key of REPORT_CATEGORY_KEYS) {
      const units = categoryMaterialUnits[key];
      if (units > 0) {
        categoryAvgMaterialCost[key] = Math.round(categoryMaterialTotals[key] / units);
      }
    }

    // Full history for drill-down; ServicesReport infinite-scrolls (~20 rows).
    const categoryMaterialDays: CategoryMaterialDayDetail[] = [...materialUnits.entries()]
      .map(([unitKey, unit]) => {
        const bowlCount = Math.max(1, unit.visitIds.size);
        return {
          id: unitKey,
          category: unit.category,
          customerId: unit.customerId,
          customerName: unit.customerName,
          day: unit.day,
          bowlCount,
          visitCount: bowlCount,
          totalGrams: Math.round(unit.totalGrams),
          totalCost: Math.round(unit.totalCost),
          avgCostPerBowl: Math.round(unit.totalCost / bowlCount),
          serviceNames: [...unit.serviceNames].sort((a, b) => a.localeCompare(b)),
          materialLabels: [...unit.materialLabels].sort((a, b) => {
            // Keep oxidant % labels after named products.
            const aDev = /^\d+(?:\.\d+)?%$/.test(a);
            const bDev = /^\d+(?:\.\d+)?%$/.test(b);
            if (aDev !== bDev) return aDev ? 1 : -1;
            return a.localeCompare(b);
          }),
        };
      })
      .sort((a, b) => (a.day === b.day ? b.totalCost - a.totalCost : b.day.localeCompare(a.day)));

    // Per-service average: sum bowls within the visit, then average visits.
    // (Category cards use customer×day×category above.)
    const recordedMaterialByService = new Map<string, { total: number; units: number }>();
    for (const appt of appointments) {
      if (!inRange(appt.startTime, range)) continue;
      if (!REVENUE_STATUSES.has(appt.status)) continue;
      if (!appt.serviceId) continue;
      const visitCost = materialByVisit.get(appt.id);
      if (visitCost === undefined) continue;
      const bucket = recordedMaterialByService.get(appt.serviceId) ?? { total: 0, units: 0 };
      bucket.total += visitCost;
      bucket.units += 1;
      recordedMaterialByService.set(appt.serviceId, bucket);
    }

    const serviceVms: ServiceVm[] = services.map((svc) => {
      const stats = performedByService.get(svc.id) ?? { count: 0, revenueCents: 0 };
      const totalPerformed = stats.count;
      const avgPrice = totalPerformed > 0
        ? Math.round(stats.revenueCents / totalPerformed / 100)
        : Math.round(svc.defaultPriceCents / 100);
      const recorded = recordedMaterialByService.get(svc.id);
      const categoryFallback = categoryAvgMaterialCost[labelForCategory(svc.categoryId)];
      const avgMaterialCost = recorded && recorded.units > 0
        ? Math.round(recorded.total / recorded.units)
        : (categoryFallback ?? Math.round(svc.defaultMaterialCostCents / 100));
      return {
        id: svc.id,
        name: svc.name,
        category: labelForCategory(svc.categoryId),
        avgDuration: svc.defaultDurationMinutes,
        avgPrice,
        avgMaterialCost,
        totalPerformed,
        revenue: Math.round(stats.revenueCents / 100),
        trend: 0,
      };
    });

    // ── Product view models (live usage + inventory stock level) ──
    const usageByProduct = new Map<string, { grams: number; cost: number; catGrams: Record<ReportCategory, number> }>();
    for (const usage of productUsage) {
      if (!inRange(usage.recordedAt, range)) continue;
      const bucket = usageByProduct.get(usage.productId) ?? {
        grams: 0,
        cost: 0,
        catGrams: emptyCategoryCounts(),
      };
      bucket.grams += usage.grams;
      bucket.cost += usage.costAtUseUsd;
      const appt = usage.mixSessionId ? apptById.get(usage.mixSessionId) : undefined;
      const label = resolveUsageCategoryLabel({
        appt,
        sourceServiceName: usage.sourceServiceName,
        productCategoryId: productById.get(usage.productId)?.serviceCategoryId,
      });
      bucket.catGrams[label] += Number.isFinite(usage.grams) ? usage.grams : 0;
      usageByProduct.set(usage.productId, bucket);
    }

    const productIds = new Set<string>([
      ...usageByProduct.keys(),
      ...inventory.map((inv) => inv.productId),
    ]);

    const productVms: ProductVm[] = [];
    for (const productId of productIds) {
      const prod = productById.get(productId);
      if (!prod) continue;
      const usage = usageByProduct.get(productId) ?? {
        grams: 0,
        cost: 0,
        catGrams: emptyCategoryCounts(),
      };
      const inv = inventoryByProduct.get(productId);
      let stockLevel: ProductVm["stockLevel"] = "high";
      if (inv) {
        if (inv.unitsInStock <= 0) stockLevel = "critical";
        else if (inv.unitsInStock <= Math.max(1, Math.floor(inv.minStock / 2))) stockLevel = "critical";
        else if (inv.unitsInStock <= inv.minStock) stockLevel = "low";
        else stockLevel = "high";
      }
      // Label the product by the visit service category where it was used most —
      // not the catalog SKU type (which is nearly always Color for mix products).
      let dominantCategory: ReportCategory = labelForCategory(prod.serviceCategoryId);
      let dominantGrams = -1;
      for (const key of REPORT_CATEGORY_KEYS) {
        const g = usage.catGrams[key] || 0;
        if (g > dominantGrams) {
          dominantGrams = g;
          dominantCategory = key;
        }
      }
      productVms.push({
        id: productId,
        name: prod.displayName ?? prod.shadeCode,
        brand: brandById.get(prod.brandId)?.name ?? "—",
        category: dominantGrams > 0 ? dominantCategory : labelForCategory(prod.serviceCategoryId),
        usageGrams: Math.round(usage.grams),
        cost: Math.round(usage.cost),
        unitPrice: usage.grams > 0 ? Math.round((usage.cost / usage.grams) * 100) / 100 : 0,
        stockLevel,
        trend: 0,
      });
    }

    // ── Optimization aggregate (live mixes / reweigh outcomes) ──
    const rangedMixes = mixSessions.filter((m) => inRange(m.startedAt, range));
    const rangedOutcomes = reweighOutcomes.filter((o) => inRange(o.recordedAt, range));
    const savingOutcomes = rangedOutcomes.filter((o) => o.outcome === "saving");
    const extraChargeOutcomes = rangedOutcomes.filter((o) => o.outcome === "extra-charge");
    const reweighSavings = Math.round(savingOutcomes.reduce((s, o) => s + o.varianceValueUsd, 0));
    const extraChargeRevenue = Math.round(extraChargeOutcomes.reduce((s, o) => s + o.varianceValueUsd, 0));
    const reweighSavedGrams = Math.round(savingOutcomes.reduce((s, o) => s + Math.abs(o.varianceGrams), 0));
    const optimizationDays = new Set(rangedOutcomes.map((o) => o.recordedAt.slice(0, 10))).size;
    const optimization: OptimizationAggregate = {
      reweighSavings,
      roundDownSavings: 0,
      mixOptimizationSavings: reweighSavings,
      extraChargeRevenue,
      reweighSavedGrams,
      roundDownSavedGrams: 0,
      totalSavedGramsDirect: reweighSavedGrams,
      reweighMixes: new Set(rangedOutcomes.map((o) => o.mixSessionId)).size,
      totalMixes: rangedMixes.length,
      reweighPct: rangedMixes.length > 0
        ? Math.round((new Set(rangedOutcomes.map((o) => o.mixSessionId)).size / rangedMixes.length) * 100)
        : 0,
      days: optimizationDays,
    };

    const newCustomerCount = customers.filter((c) => inRange(c.createdAt, range)).length;
    const hasActivity = rangedAppointments.length > 0;

    // ── Coverage: what the range actually holds vs what was requested ──
    const monthsWithActivity = apptCountByMonth.filter((c) => c > 0).length;
    const rangedApptTimes = rangedAppointments
      .map((a) => new Date(a.startTime).getTime())
      .filter((t) => Number.isFinite(t));
    const firstActivityAt = rangedApptTimes.length > 0
      ? new Date(Math.min(...rangedApptTimes)).toISOString()
      : null;
    const lastActivityAt = rangedApptTimes.length > 0
      ? new Date(Math.max(...rangedApptTimes)).toISOString()
      : null;

    // Partial coverage: the requested window extends past the data we hold.
    const allApptTimes = appointments
      .map((a) => new Date(a.startTime).getTime())
      .filter((t) => Number.isFinite(t));
    const dataFirst = allApptTimes.length > 0 ? Math.min(...allApptTimes) : null;
    const dataLast = allApptTimes.length > 0 ? Math.max(...allApptTimes) : null;
    const hasPartialCoverage = dataFirst !== null && dataLast !== null
      ? range.from.getTime() < dataFirst || range.to.getTime() > dataLast
      : false;

    const staffWithActivity = performance.filter((p) => p.appointments > 0).length;

    const coverage: AnalyticsCoverage = {
      rangeFrom: range.from.toISOString(),
      rangeTo: range.to.toISOString(),
      monthsInRange: monthKeys.length,
      monthsWithActivity,
      firstActivityAt,
      lastActivityAt,
      hasPartialCoverage,
      appointmentCount: rangedAppointments.length,
      recordedUsageRecordCount,
      unmappedProductUsageCount,
      mixSessionCount: rangedMixes.length,
      reweighOutcomeCount: rangedOutcomes.length,
      staffWithActivity,
    };

    // ── Material cost: recorded vs estimated, never silently conflated ──
    const recordedMaterial = productCostByMonth.reduce((s, v) => s + v, 0);
    const estimatedMaterial = serviceDefaultMaterialByMonth.reduce((s, v) => s + v, 0);
    const anyRecordedMonth = productCostByMonth.some((v) => v > 0);
    const anyFallbackMonth = productCostByMonth.some(
      (v, i) => v <= 0 && serviceDefaultMaterialByMonth[i] > 0,
    );
    const materialBasis: MaterialCostProvenance["basis"] = anyRecordedMonth && anyFallbackMonth
      ? "mixed"
      : anyRecordedMonth
        ? "recorded"
        : estimatedMaterial > 0
          ? "estimated"
          : "none";
    const materialCost: MaterialCostProvenance = {
      recorded: Math.round(recordedMaterial),
      estimated: Math.round(estimatedMaterial),
      basis: materialBasis,
      hasRecordedUsage: recordedUsageRecordCount > 0,
    };

    // ── Guards ──
    const guards: AnalyticsGuards = {
      comparisonAvailable: monthsWithActivity >= MINIMUM_SAMPLE.comparisonPeriods,
      rankingAvailable: rangedAppointments.length >= MINIMUM_SAMPLE.ranking,
      staffComparisonAvailable: staffWithActivity >= MINIMUM_SAMPLE.staffComparison,
      anomalyAvailable: monthsWithActivity >= MINIMUM_SAMPLE.anomalyBaselineMonths,
    };

    // ── Provenance classifications ──
    const materialCostClassification: MetricClassification = materialBasis === "recorded"
      ? "confirmed"
      : materialBasis === "none"
        ? "unavailable"
        : "estimated";
    const financeDemo = buildPilotFinanceDemo(
      monthlyCombined.map((row) => ({
        month: row.month,
        revenue: row.revenue,
        appointments: row.appointments,
      })),
    );

    const provenance: AnalyticsProvenance = {
      version: ANALYTICS_TRUTH_VERSION,
      revenue: "estimated",
      materialCost: materialCostClassification,
      volume: "operational",
      recordedUsage: unmappedProductUsageCount > 0 ? "incomplete" : "confirmed",
      categoryAllocation: "estimated",
      checkout: "unavailable",
      expenses: financeDemo.active ? "operational" : "unavailable",
      retail: financeDemo.active ? "operational" : "unavailable",
    };

    return {
      monthlyCombined,
      monthlyServices,
      monthlyProducts,
      monthlyStaff,
      staff,
      products: productVms,
      services: serviceVms,
      categoryAvgMaterialCost,
      categoryMaterialDays,
      customerCount: customers.filter((c) => c.status !== "archived").length,
      newCustomerCount,
      optimization,
      hasCheckoutData: false,
      hasExpenseData: financeDemo.active,
      hasRetailData: financeDemo.active,
      financeDemo,
      revenueIsEstimated: true,
      hasActivity,
      coverage,
      materialCost,
      guards,
      provenance,
    };
  }
}

// ── Hook ──────────────────────────────────────────────────────────

export function useLiveAnalytics(range: DateRange): LiveAnalytics {
  const { lang } = useCrmLocale();
  const appointments = useAppointments();
  const customers = useCustomers();
  const services = useServices();
  const inventory = useInventoryItems();
  const products = useProducts();
  const brands = useBrands();
  const productUsage = useProductUsage();
  const reweighOutcomes = useReweighOutcomes();
  const mixSessions = useMixSessions();

  const perfRange = useMemo(
    () => ({ from: range.from.toISOString(), to: range.to.toISOString() }),
    [range.from, range.to],
  );
  const performance = useStaffPerformance(perfRange);

  return useMemo<LiveAnalytics>(
    () =>
      computeLiveAnalytics(
        {
          appointments,
          customers,
          services,
          inventory,
          products,
          brands,
          productUsage,
          reweighOutcomes,
          mixSessions,
          performance,
        },
        range,
        lang,
      ),
    [
      appointments,
      customers,
      services,
      inventory,
      products,
      brands,
      productUsage,
      reweighOutcomes,
      mixSessions,
      performance,
      range,
      lang,
    ],
  );
}

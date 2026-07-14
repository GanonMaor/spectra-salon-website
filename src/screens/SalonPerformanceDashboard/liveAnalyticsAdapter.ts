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
 *  - Expenses and retail sales have no live source, so `hasExpenseData` /
 *    `hasRetailData` stay false and consumers must render honest empty states
 *    instead of synthesising numbers from a percentage of revenue.
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

export interface MonthlyStaffRow {
  month: string;
  [key: string]: number | string;
}

export interface MonthlyProductRow {
  month: string;
  totalUsage: number;
  totalCost: number;
  Color: number;
  Highlights: number;
  Toner: number;
  Straightening: number;
  Treatment: number;
  Others: number;
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
  customerCount: number;
  newCustomerCount: number;
  optimization: OptimizationAggregate;
  /** Whether any confirmed checkout/payment records back the revenue numbers. */
  hasCheckoutData: boolean;
  /** Whether any real expense records exist. */
  hasExpenseData: boolean;
  /** Whether any real retail sales records exist. */
  hasRetailData: boolean;
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

function monthKeyOf(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
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
    const monthLabels = months.map(monthLabel);
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
        if (svc) {
          revenueByMonth[idx] += svc.defaultPriceCents / 100;
          serviceDefaultMaterialByMonth[idx] += svc.defaultMaterialCostCents / 100;
        }
      }
    }

    // Product usage per month (grams) grouped by service category.
    const usageCatByMonth = monthKeys.map(() => emptyCategoryCounts());
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
      const label = labelForCategory(prod?.serviceCategoryId);
      usageCatByMonth[idx][label] += usage.grams;
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
      Color: usageCatByMonth[i].Color,
      Highlights: usageCatByMonth[i].Highlights,
      Toner: usageCatByMonth[i].Toner,
      Straightening: usageCatByMonth[i].Straightening,
      Treatment: usageCatByMonth[i].Treatment,
      Others: usageCatByMonth[i].Others,
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

    // ── Service view models (booked value estimate) ──
    const performedByService = new Map<string, number>();
    for (const appt of appointments) {
      if (!inRange(appt.startTime, range)) continue;
      if (!REVENUE_STATUSES.has(appt.status)) continue;
      if (!appt.serviceId) continue;
      performedByService.set(appt.serviceId, (performedByService.get(appt.serviceId) ?? 0) + 1);
    }

    const serviceVms: ServiceVm[] = services.map((svc) => {
      const totalPerformed = performedByService.get(svc.id) ?? 0;
      const avgPrice = Math.round(svc.defaultPriceCents / 100);
      const avgMaterialCost = Math.round(svc.defaultMaterialCostCents / 100);
      return {
        id: svc.id,
        name: svc.name,
        category: labelForCategory(svc.categoryId),
        avgDuration: svc.defaultDurationMinutes,
        avgPrice,
        avgMaterialCost,
        totalPerformed,
        revenue: totalPerformed * avgPrice,
        trend: 0,
      };
    });

    // ── Product view models (live usage + inventory stock level) ──
    const usageByProduct = new Map<string, { grams: number; cost: number }>();
    for (const usage of productUsage) {
      if (!inRange(usage.recordedAt, range)) continue;
      const bucket = usageByProduct.get(usage.productId) ?? { grams: 0, cost: 0 };
      bucket.grams += usage.grams;
      bucket.cost += usage.costAtUseUsd;
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
      const usage = usageByProduct.get(productId) ?? { grams: 0, cost: 0 };
      const inv = inventoryByProduct.get(productId);
      let stockLevel: ProductVm["stockLevel"] = "high";
      if (inv) {
        if (inv.unitsInStock <= 0) stockLevel = "critical";
        else if (inv.unitsInStock <= Math.max(1, Math.floor(inv.minStock / 2))) stockLevel = "critical";
        else if (inv.unitsInStock <= inv.minStock) stockLevel = "low";
        else stockLevel = "high";
      }
      productVms.push({
        id: productId,
        name: prod.displayName ?? prod.shadeCode,
        brand: brandById.get(prod.brandId)?.name ?? "—",
        category: labelForCategory(prod.serviceCategoryId),
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
    const provenance: AnalyticsProvenance = {
      version: ANALYTICS_TRUTH_VERSION,
      revenue: "estimated",
      materialCost: materialCostClassification,
      volume: "operational",
      recordedUsage: unmappedProductUsageCount > 0 ? "incomplete" : "confirmed",
      categoryAllocation: "estimated",
      checkout: "unavailable",
      expenses: "unavailable",
      retail: "unavailable",
    };

    return {
      monthlyCombined,
      monthlyServices,
      monthlyProducts,
      monthlyStaff,
      staff,
      products: productVms,
      services: serviceVms,
      customerCount: customers.filter((c) => c.status !== "archived").length,
      newCustomerCount,
      optimization,
      hasCheckoutData: false,
      hasExpenseData: false,
      hasRetailData: false,
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
    ],
  );
}

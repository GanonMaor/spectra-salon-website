/**
 * Analytics Truth — central metric descriptor registry.
 *
 * Every metric, series, badge and ranking rendered by the Salon Performance
 * dashboard (the six tabs and the always-on `LiveKpiStrip`) is declared here
 * exactly once. The registry is the machine-readable source of truth for:
 *  - which surfaces exist and where they render (`tab` / `duplicateLocations`),
 *  - how true each value is (`classification`),
 *  - what UI state to show when there is no honest value (`unavailableState`),
 *  - the CRM origin, date field, filter semantics, formula and version,
 *  - the guard + minimum sample that gate a trustworthy render.
 *
 * A static integrity check (`assertRegistryIntegrity`) plus the registry tests
 * make it impossible to render a metric that is not described here, or to
 * describe an `unavailable` metric without an explicit blocked reason.
 *
 * NOTE (Slice A boundary): this file only *describes* surfaces. Removing
 * synthetic trends, duplicate rankings and misleading zeros from the report
 * components is Slice B / Generation 2 work.
 */

import {
  ANALYTICS_TRUTH_VERSION,
  MINIMUM_SAMPLE,
  type AnalyticsTab,
  type DataOrigin,
  type MetricClassification,
  type MetricGuard,
  type MetricSurfaceKind,
  type MetricUiState,
} from "./contract";

export interface MetricDescriptor {
  /** Stable, dot-namespaced id. Unique across the whole registry. */
  id: string;
  /** Human label as rendered (or closest equivalent). */
  label: string;
  /** Primary owner tab that renders this metric. */
  tab: AnalyticsTab;
  /** Other tabs/surfaces that render the same underlying metric. */
  duplicateLocations?: AnalyticsTab[];
  /** How the metric is presented. */
  kind: MetricSurfaceKind;
  /** How true the value is. */
  classification: MetricClassification;
  /**
   * UI state to render when the metric cannot honestly show a value. Required
   * for `unavailable` metrics; optional for others (defaults resolved live).
   */
  unavailableState?: MetricUiState;
  /** Canonical CRM (or derived) origin. */
  dataOrigin: DataOrigin;
  /** The timestamp field the metric buckets/filters by, if any. */
  dateField?: string;
  /** Human-readable range/filter semantics. */
  filterSemantics: string;
  /** Formula / provenance note. */
  sourceFormula: string;
  /** Minimum sample size before the value is trustworthy. */
  minimumSample: number;
  /** Guard that must pass before the metric may render `ready`. */
  guard: MetricGuard;
  /** Why the metric has no live source. Required when `unavailable`. */
  blockedReason?: string;
  /** Contract version this descriptor was authored against. */
  version: string;
}

/** Convenience: descriptor without the repeated `version` field. */
type MetricSeed = Omit<MetricDescriptor, "version">;

const V = ANALYTICS_TRUTH_VERSION;

// ── LiveKpiStrip (always-on, above every tab) ──────────────────────
const KPI_STRIP: MetricSeed[] = [
  {
    id: "kpiStrip.liveAppointments",
    label: "Live appointments",
    tab: "kpiStrip",
    kind: "kpi",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Appointments whose startTime falls in the active range; cancelled/no-show excluded.",
    sourceFormula: "count(appointments in range)",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "kpiStrip.reweighAdoption",
    label: "Reweigh adoption",
    tab: "kpiStrip",
    kind: "kpi",
    classification: "operational",
    dataOrigin: "crm_reweigh_outcomes",
    dateField: "mixSession.startedAt",
    filterSemantics: "Reweighed mixes over total mixes (adoption ratio). Not range-scoped in the strip.",
    sourceFormula: "reweighedMixes / totalMixes",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "kpiStrip.reweighSavings",
    label: "Reweigh savings",
    tab: "kpiStrip",
    kind: "kpi",
    classification: "estimated",
    dataOrigin: "crm_reweigh_outcomes",
    dateField: "reweighOutcome.recordedAt",
    filterSemantics: "Sum of saving-outcome variance value. Currency of imported rows may vary.",
    sourceFormula: "sum(varianceValueUsd where outcome = saving)",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "kpiStrip.inventoryHealth",
    label: "Inventory health",
    tab: "kpiStrip",
    kind: "kpi",
    classification: "operational",
    dataOrigin: "crm_inventory",
    filterSemantics: "Current inventory health score; a point-in-time snapshot, not range-scoped.",
    sourceFormula: "selectInventoryHealthScore(state)",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "kpiStrip.lowStockCount",
    label: "Items below min stock",
    tab: "kpiStrip",
    kind: "badge",
    classification: "operational",
    dataOrigin: "crm_inventory",
    filterSemantics: "Count of inventory items at or below their minimum stock. Point-in-time.",
    sourceFormula: "count(inventory where unitsInStock <= minStock)",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "kpiStrip.topPerformer",
    label: "Top performer",
    tab: "kpiStrip",
    kind: "ranking",
    classification: "estimated",
    duplicateLocations: ["dashboard", "staffPerformance"],
    dataOrigin: "crm_staff",
    dateField: "appointment.startTime",
    filterSemantics: "Staff with highest booked (estimated) revenue in range; requires a reported sample.",
    sourceFormula: "argmax(staff.revenueCents estimated from booked prices)",
    minimumSample: MINIMUM_SAMPLE.staffComparison,
    guard: "staff_comparison",
  },
];

// ── Dashboard tab ──────────────────────────────────────────────────
const DASHBOARD: MetricSeed[] = [
  {
    id: "dashboard.bookedServiceValue",
    label: "Booked Service Value",
    tab: "dashboard",
    kind: "card",
    classification: "estimated",
    duplicateLocations: ["staffPerformance", "services"],
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Completed + in-progress appointments in range, priced at service default price.",
    sourceFormula: "sum(service.defaultPriceCents for completed|in-progress appts)",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "dashboard.estMaterialCost",
    label: "Est. Material Cost",
    tab: "dashboard",
    kind: "card",
    classification: "estimated",
    duplicateLocations: ["services"],
    dataOrigin: "crm_services_catalog",
    dateField: "appointment.startTime",
    filterSemantics: "Recorded product-usage cost when present; otherwise service-default material cost. Basis exposed via provenance (never silently conflated).",
    sourceFormula: "recordedProductCost || sum(service.defaultMaterialCostCents)",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "dashboard.operatingOverhead",
    label: "Operating Overhead",
    tab: "dashboard",
    kind: "card",
    classification: "unavailable",
    unavailableState: "source_not_connected",
    dataOrigin: "none",
    filterSemantics: "No live source; requires the Expenses module.",
    sourceFormula: "n/a",
    minimumSample: 0,
    guard: "none",
    blockedReason: "Expenses module is not connected; operating overhead has no live source.",
  },
  {
    id: "dashboard.netProfit",
    label: "Net Profit",
    tab: "dashboard",
    kind: "card",
    classification: "unavailable",
    unavailableState: "source_not_connected",
    dataOrigin: "none",
    filterSemantics: "No live source; requires confirmed checkout revenue and expenses.",
    sourceFormula: "n/a",
    minimumSample: 0,
    guard: "none",
    blockedReason: "Net profit requires confirmed checkout revenue and the Expenses module; neither is connected.",
  },
  {
    id: "dashboard.revenuePerVisit",
    label: "Revenue / Visit",
    tab: "dashboard",
    kind: "card",
    classification: "estimated",
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Estimated booked value divided by appointment count in range.",
    sourceFormula: "bookedServiceValue / appointmentCount",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "dashboard.materialCostPerVisit",
    label: "Material Cost / Visit",
    tab: "dashboard",
    kind: "card",
    classification: "estimated",
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Material cost divided by appointment count in range.",
    sourceFormula: "materialCost / appointmentCount",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "dashboard.grossProfitPerVisit",
    label: "Gross Profit / Visit",
    tab: "dashboard",
    kind: "card",
    classification: "estimated",
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "(Booked value − material cost) / appointment count. Excludes labour/overhead (no source).",
    sourceFormula: "(bookedServiceValue - materialCost) / appointmentCount",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "dashboard.perVisitTrend",
    label: "Per-visit trend (sparkline / vs last month)",
    tab: "dashboard",
    kind: "series",
    classification: "unavailable",
    unavailableState: "insufficient_data",
    dataOrigin: "none",
    filterSemantics: "Currently synthesised via a fixed TREND_SHAPE when movement is flat; no confirmed period-over-period source.",
    sourceFormula: "synthetic (to be removed in Slice B)",
    minimumSample: MINIMUM_SAMPLE.comparisonPeriods,
    guard: "comparison",
    blockedReason: "Per-visit sparklines and 'vs last month' deltas are synthetic (TREND_SHAPE); no confirmed comparison source exists.",
  },
  {
    id: "dashboard.revenueByCategory",
    label: "Revenue by Category",
    tab: "dashboard",
    kind: "chart",
    classification: "estimated",
    duplicateLocations: ["services"],
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Category revenue allocated proportionally from booked value; an estimate, not a recorded split.",
    sourceFormula: "normalise(categoryServices * weightedAvgPrice) to bookedServiceValue",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "dashboard.activeClientBase",
    label: "Active Client Base",
    tab: "dashboard",
    kind: "kpi",
    classification: "operational",
    dataOrigin: "crm_customers",
    filterSemantics: "Non-archived customers for the salon (point-in-time, not range-scoped).",
    sourceFormula: "count(customers where status != archived)",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "dashboard.newClientAcquisition",
    label: "New Client Acquisition",
    tab: "dashboard",
    kind: "kpi",
    classification: "operational",
    dataOrigin: "crm_customers",
    dateField: "customer.createdAt",
    filterSemantics: "Customers whose createdAt falls within the active range.",
    sourceFormula: "count(customers where createdAt in range)",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "dashboard.serviceVolume",
    label: "Service Volume",
    tab: "dashboard",
    kind: "kpi",
    classification: "operational",
    duplicateLocations: ["services"],
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Count of services performed (appointments) in range; cancelled/no-show excluded.",
    sourceFormula: "count(appointments in range)",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "dashboard.topRevenueService",
    label: "Top Revenue Service",
    tab: "dashboard",
    kind: "ranking",
    classification: "estimated",
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Service with highest estimated booked revenue; requires a reported sample.",
    sourceFormula: "argmax(service.revenue estimated)",
    minimumSample: MINIMUM_SAMPLE.ranking,
    guard: "ranking",
  },
  {
    id: "dashboard.topProfitService",
    label: "Top Profit Service",
    tab: "dashboard",
    kind: "ranking",
    classification: "estimated",
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Service with highest estimated gross profit (booked − default material); requires a reported sample.",
    sourceFormula: "argmax(service.revenue - avgMaterialCost * performed)",
    minimumSample: MINIMUM_SAMPLE.ranking,
    guard: "ranking",
  },
  {
    id: "dashboard.extraChargeRevenue",
    label: "Extra Charge Revenue",
    tab: "dashboard",
    kind: "card",
    classification: "estimated",
    dataOrigin: "crm_reweigh_outcomes",
    dateField: "reweighOutcome.recordedAt",
    filterSemantics: "Sum of extra-charge reweigh variance value in range. Derived value; currency may vary.",
    sourceFormula: "sum(varianceValueUsd where outcome = extra-charge)",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "dashboard.mixOptimizationSavings",
    label: "Mix Optimization Savings",
    tab: "dashboard",
    kind: "card",
    classification: "estimated",
    dataOrigin: "crm_reweigh_outcomes",
    dateField: "reweighOutcome.recordedAt",
    filterSemantics: "Sum of saving reweigh variance value in range. Derived value; currency may vary.",
    sourceFormula: "sum(varianceValueUsd where outcome = saving)",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "dashboard.reweighDetail",
    label: "Re-weigh detail (mixes reweighed)",
    tab: "dashboard",
    kind: "kpi",
    classification: "operational",
    dataOrigin: "crm_mix_sessions",
    dateField: "reweighOutcome.recordedAt",
    filterSemantics: "Reweighed mixes over total mixes in range.",
    sourceFormula: "reweighMixes / totalMixes",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "dashboard.savedGramsDirect",
    label: "Re-weigh saved grams",
    tab: "dashboard",
    kind: "kpi",
    classification: "confirmed",
    dataOrigin: "crm_reweigh_outcomes",
    dateField: "reweighOutcome.recordedAt",
    filterSemantics: "Recorded gram variance for saving outcomes in range.",
    sourceFormula: "sum(abs(varianceGrams) where outcome = saving)",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "dashboard.revenueAppointmentsTrend.appointments",
    label: "Appointments trend (series)",
    tab: "dashboard",
    kind: "series",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Monthly appointment counts across the range.",
    sourceFormula: "count(appointments) per month",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "dashboard.revenueAppointmentsTrend.revenue",
    label: "Revenue trend (series)",
    tab: "dashboard",
    kind: "series",
    classification: "estimated",
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Monthly estimated booked value across the range.",
    sourceFormula: "sum(service.defaultPriceCents) per month",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "dashboard.topPerformers",
    label: "Top Performers (ranking)",
    tab: "dashboard",
    kind: "ranking",
    classification: "estimated",
    duplicateLocations: ["staffPerformance", "kpiStrip"],
    dataOrigin: "crm_staff",
    dateField: "appointment.startTime",
    filterSemantics: "Staff ranked by estimated booked revenue; requires a reported sample.",
    sourceFormula: "sort(staff by revenue estimated) desc",
    minimumSample: MINIMUM_SAMPLE.staffComparison,
    guard: "staff_comparison",
  },
  {
    id: "dashboard.topServices",
    label: "Top Services (ranking)",
    tab: "dashboard",
    kind: "ranking",
    classification: "operational",
    duplicateLocations: ["services"],
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Services ranked by performed count; requires a reported sample.",
    sourceFormula: "sort(service by totalPerformed) desc",
    minimumSample: MINIMUM_SAMPLE.ranking,
    guard: "ranking",
  },
  {
    id: "dashboard.mostUsedProducts",
    label: "Most Used Products (ranking)",
    tab: "dashboard",
    kind: "ranking",
    classification: "confirmed",
    duplicateLocations: ["productUsage"],
    dataOrigin: "crm_product_usage",
    dateField: "productUsage.recordedAt",
    filterSemantics: "Products ranked by recorded usage grams in range; requires a reported sample.",
    sourceFormula: "sort(product by usageGrams recorded) desc",
    minimumSample: MINIMUM_SAMPLE.ranking,
    guard: "ranking",
  },
];

// ── Staff Performance tab ──────────────────────────────────────────
const STAFF: MetricSeed[] = [
  {
    id: "staffPerformance.totalAppointments",
    label: "Total Appointments",
    tab: "staffPerformance",
    kind: "kpi",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Sum of per-staff appointment counts across the range.",
    sourceFormula: "sum(staffAppointments in range)",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "staffPerformance.bookedRevenue",
    label: "Booked Revenue (est.)",
    tab: "staffPerformance",
    kind: "kpi",
    classification: "estimated",
    duplicateLocations: ["dashboard"],
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Per-staff booked value scaled to the in-range appointment share.",
    sourceFormula: "staff.revenue * (rangedAppts / totalAppts)",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "staffPerformance.avgUtilization",
    label: "Avg Utilization",
    tab: "staffPerformance",
    kind: "kpi",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Average of per-staff utilisation (booked hours over a 9h/day slot model).",
    sourceFormula: "avg(min(100, ownedHours / (dayCount * 9)))",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "staffPerformance.avgRating",
    label: "Avg Rating",
    tab: "staffPerformance",
    kind: "kpi",
    classification: "unavailable",
    unavailableState: "source_not_connected",
    dataOrigin: "none",
    filterSemantics: "Rating is a seeded staff attribute, not a live review/feedback source.",
    sourceFormula: "avg(staff.rating) — no live feedback source",
    minimumSample: 0,
    guard: "none",
    blockedReason: "Staff rating has no live customer-feedback source; the seeded value is not a real metric.",
  },
  {
    id: "staffPerformance.staffTable",
    label: "Staff Performance table",
    tab: "staffPerformance",
    kind: "table",
    classification: "estimated",
    dataOrigin: "crm_staff",
    dateField: "appointment.startTime",
    filterSemantics: "Per-staff appointments (operational), revenue (estimated), utilisation (operational); rating/trend columns are unsupported.",
    sourceFormula: "selectStaffPerformance(state, range) + booked revenue estimate",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "staffPerformance.staffRank",
    label: "Staff rank",
    tab: "staffPerformance",
    kind: "ranking",
    classification: "estimated",
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Ranking of staff by estimated revenue; requires a reported sample of staff.",
    sourceFormula: "sort(staff by revenue estimated) desc",
    minimumSample: MINIMUM_SAMPLE.staffComparison,
    guard: "staff_comparison",
  },
  {
    id: "staffPerformance.trend",
    label: "Staff trend column",
    tab: "staffPerformance",
    kind: "badge",
    classification: "unavailable",
    unavailableState: "insufficient_data",
    dataOrigin: "none",
    filterSemantics: "Trend badge is hard-coded to 0; no confirmed period-over-period source.",
    sourceFormula: "constant 0 (to be removed in Slice B)",
    minimumSample: MINIMUM_SAMPLE.comparisonPeriods,
    guard: "comparison",
    blockedReason: "Staff trend has no confirmed comparison source; the value is a hard-coded 0.",
  },
  {
    id: "staffPerformance.appointmentsByStaff",
    label: "Appointments by Staff (chart)",
    tab: "staffPerformance",
    kind: "chart",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Comparative appointment volume per staff in range; requires a reported sample.",
    sourceFormula: "count(appointments) per staff",
    minimumSample: MINIMUM_SAMPLE.staffComparison,
    guard: "staff_comparison",
  },
  {
    id: "staffPerformance.monthlyAppointments",
    label: "Monthly Appointments (chart)",
    tab: "staffPerformance",
    kind: "chart",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Total appointments per month across the range.",
    sourceFormula: "sum(staffAppointments) per month",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
];

// ── Services tab ───────────────────────────────────────────────────
const SERVICES: MetricSeed[] = [
  {
    id: "services.totalServices",
    label: "Total Services",
    tab: "services",
    kind: "kpi",
    classification: "operational",
    duplicateLocations: ["dashboard"],
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Total services performed in range (monthly totals summed).",
    sourceFormula: "sum(monthlyServices.total)",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "services.bookedRevenue",
    label: "Booked Revenue (est.)",
    tab: "services",
    kind: "kpi",
    classification: "estimated",
    duplicateLocations: ["dashboard"],
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Estimated booked value for services performed in range.",
    sourceFormula: "sum(monthlyServices.revenue)",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "services.avgMaterialCost",
    label: "Avg Material Cost",
    tab: "services",
    kind: "kpi",
    classification: "estimated",
    dataOrigin: "crm_services_catalog",
    filterSemantics: "Performed-weighted average of service-default material cost.",
    sourceFormula: "sum(avgMaterialCost * performed) / sum(performed)",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "services.topCategory",
    label: "Top Category",
    tab: "services",
    kind: "ranking",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Service category with the most performed services in range.",
    sourceFormula: "argmax(category.totalPerformed)",
    minimumSample: MINIMUM_SAMPLE.ranking,
    guard: "ranking",
  },
  {
    id: "services.categoryBreakdown",
    label: "Service Categories",
    tab: "services",
    kind: "chart",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Per-category performed volume (operational) with estimated revenue/material overlays.",
    sourceFormula: "group services by category → performed, estimated revenue",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "services.serviceMix",
    label: "Service Mix (pie)",
    tab: "services",
    kind: "chart",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Share of performed services by category in range.",
    sourceFormula: "category.totalPerformed / totalPerformed",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "services.revenueByCategory",
    label: "Revenue by Category",
    tab: "services",
    kind: "chart",
    classification: "estimated",
    duplicateLocations: ["dashboard"],
    dataOrigin: "derived",
    dateField: "appointment.startTime",
    filterSemantics: "Category revenue allocated proportionally from booked value; an estimate.",
    sourceFormula: "normalise(category.rawRevenue) to bookedServiceValue",
    minimumSample: MINIMUM_SAMPLE.estimateValue,
    guard: "none",
  },
  {
    id: "services.monthlyServiceVolume",
    label: "Monthly Service Volume (stacked)",
    tab: "services",
    kind: "chart",
    classification: "operational",
    dataOrigin: "crm_appointments",
    dateField: "appointment.startTime",
    filterSemantics: "Per-category performed volume per month across range.",
    sourceFormula: "count(appointments by category) per month",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "services.allServicesTable",
    label: "All Services table",
    tab: "services",
    kind: "table",
    classification: "estimated",
    dataOrigin: "crm_services_catalog",
    dateField: "appointment.startTime",
    filterSemantics: "Performed (operational), revenue/avgPrice/material (estimated), duration (operational); trend column unsupported.",
    sourceFormula: "service catalog + performed counts + estimated value",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "services.trend",
    label: "Service trend column",
    tab: "services",
    kind: "badge",
    classification: "unavailable",
    unavailableState: "insufficient_data",
    dataOrigin: "none",
    filterSemantics: "Trend badge is hard-coded to 0; no confirmed comparison source.",
    sourceFormula: "constant 0 (to be removed in Slice B)",
    minimumSample: MINIMUM_SAMPLE.comparisonPeriods,
    guard: "comparison",
    blockedReason: "Service trend has no confirmed comparison source; the value is a hard-coded 0.",
  },
];

// ── Product Usage tab ──────────────────────────────────────────────
const PRODUCTS: MetricSeed[] = [
  {
    id: "productUsage.totalUsage",
    label: "Total Usage (g)",
    tab: "productUsage",
    kind: "kpi",
    classification: "confirmed",
    dataOrigin: "crm_product_usage",
    dateField: "productUsage.recordedAt",
    filterSemantics: "Sum of recorded usage grams in range.",
    sourceFormula: "sum(productUsage.grams in range)",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "productUsage.totalProductCost",
    label: "Total Product Cost",
    tab: "productUsage",
    kind: "kpi",
    classification: "confirmed",
    dataOrigin: "crm_product_usage",
    dateField: "productUsage.recordedAt",
    filterSemantics: "Direct recorded material cost in range. Becomes incomplete if product linkage/currency is broken.",
    sourceFormula: "sum(productUsage.costAtUseUsd in range)",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "productUsage.categories",
    label: "Categories",
    tab: "productUsage",
    kind: "kpi",
    classification: "operational",
    dataOrigin: "crm_product_usage",
    dateField: "productUsage.recordedAt",
    filterSemantics: "Count of service categories with recorded usage in range.",
    sourceFormula: "count(categories where usage > 0)",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "productUsage.lowStockAlerts",
    label: "Low Stock Alerts",
    tab: "productUsage",
    kind: "badge",
    classification: "operational",
    dataOrigin: "crm_inventory",
    filterSemantics: "Count of products at low/critical stock. Point-in-time, not range-scoped.",
    sourceFormula: "count(products where stockLevel in {low, critical})",
    minimumSample: MINIMUM_SAMPLE.volume,
    guard: "none",
  },
  {
    id: "productUsage.usageByCategory",
    label: "Usage by Category (pie)",
    tab: "productUsage",
    kind: "chart",
    classification: "confirmed",
    dataOrigin: "crm_product_usage",
    dateField: "productUsage.recordedAt",
    filterSemantics: "Recorded usage grams grouped by product service-category in range.",
    sourceFormula: "sum(productUsage.grams) by category",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "productUsage.costByCategory",
    label: "Cost by Category",
    tab: "productUsage",
    kind: "chart",
    classification: "estimated",
    dataOrigin: "derived",
    dateField: "productUsage.recordedAt",
    filterSemantics: "Total recorded cost allocated to categories by usage-gram share; a proportional estimate, not a recorded per-category cost.",
    sourceFormula: "totalCost * (category.usage / totalUsage)",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "productUsage.monthlyUsageTrend",
    label: "Monthly Usage Trend",
    tab: "productUsage",
    kind: "chart",
    classification: "confirmed",
    dataOrigin: "crm_product_usage",
    dateField: "productUsage.recordedAt",
    filterSemantics: "Recorded usage grams per month across range.",
    sourceFormula: "sum(productUsage.grams) per month",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "productUsage.inventoryTable",
    label: "Product Inventory table",
    tab: "productUsage",
    kind: "table",
    classification: "confirmed",
    dataOrigin: "crm_product_usage",
    dateField: "productUsage.recordedAt",
    filterSemantics: "Usage grams + recorded cost (confirmed), stock level (operational); trend column unsupported.",
    sourceFormula: "product usage aggregate + inventory stock level",
    minimumSample: MINIMUM_SAMPLE.recordedUsage,
    guard: "none",
  },
  {
    id: "productUsage.trend",
    label: "Product trend column",
    tab: "productUsage",
    kind: "badge",
    classification: "unavailable",
    unavailableState: "insufficient_data",
    dataOrigin: "none",
    filterSemantics: "Trend badge is hard-coded to 0; no confirmed comparison source.",
    sourceFormula: "constant 0 (to be removed in Slice B)",
    minimumSample: MINIMUM_SAMPLE.comparisonPeriods,
    guard: "comparison",
    blockedReason: "Product trend has no confirmed comparison source; the value is a hard-coded 0.",
  },
];

// ── Sales tab (no live source) ─────────────────────────────────────
const SALES: MetricSeed[] = [
  {
    id: "sales.retail",
    label: "Retail sales",
    tab: "sales",
    kind: "card",
    classification: "unavailable",
    unavailableState: "source_not_connected",
    dataOrigin: "none",
    filterSemantics: "No live retail/POS source; requires Checkout.",
    sourceFormula: "n/a",
    minimumSample: 0,
    guard: "none",
    blockedReason: "Retail sales have no live source; they arrive with Checkout / POS.",
  },
];

// ── Expenses tab (no live source) ──────────────────────────────────
const EXPENSES: MetricSeed[] = [
  {
    id: "expenses.operating",
    label: "Operating expenses",
    tab: "expenses",
    kind: "card",
    classification: "unavailable",
    unavailableState: "source_not_connected",
    dataOrigin: "none",
    filterSemantics: "No live expense source; requires the Expenses module.",
    sourceFormula: "n/a",
    minimumSample: 0,
    guard: "none",
    blockedReason: "Operating expenses have no live source; they arrive with the Expenses module.",
  },
];

const ALL_SEEDS: MetricSeed[] = [
  ...KPI_STRIP,
  ...DASHBOARD,
  ...STAFF,
  ...SERVICES,
  ...PRODUCTS,
  ...SALES,
  ...EXPENSES,
];

/** The frozen, versioned registry of every rendered analytics surface. */
export const METRIC_REGISTRY: readonly MetricDescriptor[] = Object.freeze(
  ALL_SEEDS.map((seed) => Object.freeze({ ...seed, version: V })),
) as readonly MetricDescriptor[];

const REGISTRY_BY_ID: ReadonlyMap<string, MetricDescriptor> = new Map(
  METRIC_REGISTRY.map((m) => [m.id, m]),
);

/** All registered metric ids. */
export const REGISTERED_METRIC_IDS: readonly string[] = METRIC_REGISTRY.map((m) => m.id);

/** Look up a descriptor by id. */
export function getMetric(id: string): MetricDescriptor | undefined {
  return REGISTRY_BY_ID.get(id);
}

/** True when a metric id is registered. Use in static guards. */
export function isRegisteredMetric(id: string): boolean {
  return REGISTRY_BY_ID.has(id);
}

/** All descriptors owned by (or duplicated into) a tab. */
export function metricsForTab(tab: AnalyticsTab): MetricDescriptor[] {
  return METRIC_REGISTRY.filter(
    (m) => m.tab === tab || (m.duplicateLocations?.includes(tab) ?? false),
  );
}

/** All descriptors with a given classification. */
export function metricsByClassification(
  classification: MetricClassification,
): MetricDescriptor[] {
  return METRIC_REGISTRY.filter((m) => m.classification === classification);
}

/**
 * Assert the registry's internal integrity. Throws on any violation so the
 * registry tests fail loudly and an unregistered/ill-formed metric cannot
 * ship. Returns the registry for chaining.
 */
export function assertRegistryIntegrity(): readonly MetricDescriptor[] {
  const seen = new Set<string>();
  for (const m of METRIC_REGISTRY) {
    if (!m.id || !/^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/.test(m.id)) {
      throw new Error(`Metric id is not dot-namespaced: "${m.id}"`);
    }
    if (seen.has(m.id)) {
      throw new Error(`Duplicate metric id in registry: "${m.id}"`);
    }
    seen.add(m.id);

    if (!m.label.trim()) throw new Error(`Metric "${m.id}" has no label`);
    if (!m.filterSemantics.trim()) throw new Error(`Metric "${m.id}" has no filterSemantics`);
    if (!m.sourceFormula.trim()) throw new Error(`Metric "${m.id}" has no sourceFormula`);
    if (m.version !== V) throw new Error(`Metric "${m.id}" has stale version "${m.version}"`);

    if (m.classification === "unavailable") {
      if (!m.blockedReason?.trim()) {
        throw new Error(`Unavailable metric "${m.id}" must declare a blockedReason`);
      }
      if (m.dataOrigin !== "none") {
        throw new Error(`Unavailable metric "${m.id}" must have dataOrigin "none"`);
      }
      if (!m.unavailableState) {
        throw new Error(`Unavailable metric "${m.id}" must declare an unavailableState`);
      }
    } else if (m.dataOrigin === "none") {
      throw new Error(`Metric "${m.id}" has dataOrigin "none" but is not unavailable`);
    }

    if (m.guard !== "none" && m.minimumSample <= 0) {
      throw new Error(`Guarded metric "${m.id}" must declare a positive minimumSample`);
    }

    if (m.duplicateLocations?.includes(m.tab)) {
      throw new Error(`Metric "${m.id}" lists its own tab in duplicateLocations`);
    }
  }
  return METRIC_REGISTRY;
}

/**
 * Analytics Truth — shared contract types.
 *
 * This module is the single, framework-agnostic vocabulary the analytics
 * dashboard uses to describe *how true* a rendered number is. It has no React
 * or CRM dependencies so it can be imported by the live adapter, the metric
 * registry, tests and (later) report components without pulling in view code.
 *
 * The contract encodes three orthogonal ideas:
 *  1. `MetricClassification` — the epistemic nature of the value
 *     (confirmed / estimated / operational / incomplete / unavailable).
 *  2. `MetricUiState`       — what the UI must render for the current range
 *     (ready / no_activity / source_not_connected / incomplete / insufficient_data).
 *  3. Guards + minimum sample — the statistical preconditions a metric needs
 *     before it may be shown as `ready` (comparison needs two periods, ranking
 *     needs a reported sample, anomaly needs a baseline).
 */

export const ANALYTICS_TRUTH_VERSION = "1.0.0";

/**
 * How true a metric value is.
 *
 *  - `confirmed`    — backed by a recorded transaction with valid linkage
 *                     (e.g. product usage grams + cost with a resolvable
 *                     product and currency). Safe to present as fact.
 *  - `estimated`    — derived from booked/default inputs, not a recorded
 *                     transaction (e.g. booked service value, service-default
 *                     material cost, category revenue allocation). Must be
 *                     labelled as an estimate.
 *  - `operational`  — an honest count/ratio of operational activity that does
 *                     not claim to be a financial fact (appointment volume,
 *                     service volume, utilisation, reweigh adoption).
 *  - `incomplete`   — the source exists and has partial data, but linkage or
 *                     currency is broken for some rows, so the value cannot be
 *                     trusted as confirmed.
 *  - `unavailable`  — there is no live source of truth at all (checkout, debt,
 *                     VAT, expenses, attendance/leave, retail sales). Never
 *                     render as `0`.
 */
export type MetricClassification =
  | "confirmed"
  | "estimated"
  | "operational"
  | "incomplete"
  | "unavailable";

/** The mandatory UI state a surface must resolve to for the active range. */
export type MetricUiState =
  | "ready"
  | "no_activity"
  | "source_not_connected"
  | "incomplete"
  | "insufficient_data";

/**
 * Owner surface for a metric. `kpiStrip` is the always-on `LiveKpiStrip`; the
 * remaining ids mirror the six analytics tabs.
 */
export type AnalyticsTab =
  | "kpiStrip"
  | "dashboard"
  | "sales"
  | "services"
  | "staffPerformance"
  | "productUsage"
  | "expenses";

export const ANALYTICS_TABS: readonly AnalyticsTab[] = [
  "kpiStrip",
  "dashboard",
  "sales",
  "services",
  "staffPerformance",
  "productUsage",
  "expenses",
] as const;

/** Canonical CRM (or derived) origin a metric reads from. */
export type DataOrigin =
  | "crm_appointments"
  | "crm_services_catalog"
  | "crm_product_usage"
  | "crm_inventory"
  | "crm_reweigh_outcomes"
  | "crm_mix_sessions"
  | "crm_customers"
  | "crm_staff"
  | "derived"
  | "none";

/**
 * Statistical precondition a metric must satisfy before it may render `ready`.
 * A failed guard resolves to `insufficient_data`.
 */
export type MetricGuard =
  | "none"
  | "comparison" // needs activity in two periods (e.g. "vs last month")
  | "ranking" // needs a reported sample across entities
  | "staff_comparison" // needs a reported sample across staff
  | "anomaly"; // needs a baseline of prior periods

/** The kind of surface the metric is rendered as. */
export type MetricSurfaceKind =
  | "kpi"
  | "card"
  | "badge"
  | "ranking"
  | "series"
  | "chart"
  | "table";

/**
 * Minimum sample sizes / thresholds. Centralised so tests and the adapter
 * agree on exactly one definition of "enough data".
 */
export const MINIMUM_SAMPLE = {
  /** Operational counts are meaningful from the first record. */
  volume: 1,
  /** A single booked appointment is enough to show an estimate. */
  estimateValue: 1,
  /** A single recorded usage row is enough to show a confirmed value. */
  recordedUsage: 1,
  /** Rankings need at least two entities to be a ranking. */
  ranking: 2,
  /** Staff comparisons need at least two staff with activity. */
  staffComparison: 2,
  /** Period-over-period comparison needs both periods active. */
  comparisonPeriods: 2,
  /** Anomaly detection needs at least this many baseline months. */
  anomalyBaselineMonths: 3,
} as const;

/**
 * Coverage of the active date range relative to the data that actually
 * exists. `hasPartialCoverage` means the requested window extends past the
 * data we hold, so absence at the edges is not a real zero.
 */
export interface MetricCoverage {
  /** ISO timestamp of the range start (inclusive). */
  rangeFrom: string;
  /** ISO timestamp of the range end (inclusive). */
  rangeTo: string;
  /** Whole months the range spans. */
  monthsInRange: number;
  /** Months within the range that contain any operational activity. */
  monthsWithActivity: number;
  /** ISO timestamp of the earliest activity in range, if any. */
  firstActivityAt: string | null;
  /** ISO timestamp of the latest activity in range, if any. */
  lastActivityAt: string | null;
  /** True when the range window is wider than the data we hold. */
  hasPartialCoverage: boolean;
}

/** Inputs required to resolve a metric's UI state for the active range. */
export interface MetricStateInput {
  classification: MetricClassification;
  guard: MetricGuard;
  minimumSample: number;
  /** Size of the metric's own sample in the active range. */
  sampleSize: number;
  /** Whether a live source is connected at all. */
  hasSource: boolean;
  /** Whether the range contains any relevant activity. */
  hasActivity: boolean;
  /** Number of distinct periods with activity (for `comparison`). */
  periodsWithActivity?: number;
  /** Number of baseline periods available (for `anomaly`). */
  baselineMonths?: number;
}

/**
 * Resolve the mandatory UI state for a metric. The order of checks matters:
 * source → activity → integrity (incomplete) → guards → sample size.
 */
export function resolveMetricState(input: MetricStateInput): MetricUiState {
  // No live source of truth: never a zero, always an explicit empty state.
  if (input.classification === "unavailable" || !input.hasSource) {
    return "source_not_connected";
  }

  // The source is connected but the range holds nothing.
  if (!input.hasActivity || input.sampleSize <= 0) {
    return "no_activity";
  }

  // Partial linkage / currency problems mean the value is not trustworthy.
  if (input.classification === "incomplete") {
    return "incomplete";
  }

  // Statistical guards.
  switch (input.guard) {
    case "comparison":
      if ((input.periodsWithActivity ?? 0) < MINIMUM_SAMPLE.comparisonPeriods) {
        return "insufficient_data";
      }
      break;
    case "ranking":
    case "staff_comparison":
      if (input.sampleSize < Math.max(input.minimumSample, MINIMUM_SAMPLE.ranking)) {
        return "insufficient_data";
      }
      break;
    case "anomaly":
      if ((input.baselineMonths ?? 0) < MINIMUM_SAMPLE.anomalyBaselineMonths) {
        return "insufficient_data";
      }
      break;
    case "none":
    default:
      break;
  }

  // Generic minimum-sample gate.
  if (input.sampleSize < input.minimumSample) {
    return "insufficient_data";
  }

  return "ready";
}

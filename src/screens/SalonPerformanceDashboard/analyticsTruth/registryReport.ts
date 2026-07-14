/**
 * Analytics Truth — machine-readable registry report.
 *
 * `buildRegistryReport()` produces a stable, serialisable snapshot of the
 * metric registry for Founder QA: totals by classification, tab and guard,
 * plus a flat list of every registered surface with its provenance. The
 * registry snapshot test serialises this so the report is version-controlled
 * and changes are reviewable in a diff.
 */

import {
  ANALYTICS_TABS,
  ANALYTICS_TRUTH_VERSION,
  type AnalyticsTab,
  type MetricClassification,
  type MetricGuard,
} from "./contract";
import { METRIC_REGISTRY, type MetricDescriptor } from "./metricRegistry";

const CLASSIFICATIONS: readonly MetricClassification[] = [
  "confirmed",
  "estimated",
  "operational",
  "incomplete",
  "unavailable",
];

const GUARDS: readonly MetricGuard[] = [
  "none",
  "comparison",
  "ranking",
  "staff_comparison",
  "anomaly",
];

export interface RegistryReportMetric {
  id: string;
  label: string;
  tab: AnalyticsTab;
  duplicateLocations: AnalyticsTab[];
  kind: MetricDescriptor["kind"];
  classification: MetricClassification;
  dataOrigin: MetricDescriptor["dataOrigin"];
  dateField: string | null;
  minimumSample: number;
  guard: MetricGuard;
  blockedReason: string | null;
}

export interface RegistryReport {
  version: string;
  generatedFor: "salon-performance-dashboard";
  totalMetrics: number;
  byClassification: Record<MetricClassification, number>;
  byTab: Record<AnalyticsTab, number>;
  byGuard: Record<MetricGuard, number>;
  metrics: RegistryReportMetric[];
}

function countBy<T extends string>(
  keys: readonly T[],
  pick: (m: MetricDescriptor) => T,
): Record<T, number> {
  const out = Object.fromEntries(keys.map((k) => [k, 0])) as Record<T, number>;
  for (const m of METRIC_REGISTRY) out[pick(m)] += 1;
  return out;
}

/** Build the deterministic registry report (sorted by metric id). */
export function buildRegistryReport(): RegistryReport {
  const metrics: RegistryReportMetric[] = [...METRIC_REGISTRY]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((m) => ({
      id: m.id,
      label: m.label,
      tab: m.tab,
      duplicateLocations: m.duplicateLocations ? [...m.duplicateLocations] : [],
      kind: m.kind,
      classification: m.classification,
      dataOrigin: m.dataOrigin,
      dateField: m.dateField ?? null,
      minimumSample: m.minimumSample,
      guard: m.guard,
      blockedReason: m.blockedReason ?? null,
    }));

  return {
    version: ANALYTICS_TRUTH_VERSION,
    generatedFor: "salon-performance-dashboard",
    totalMetrics: metrics.length,
    byClassification: countBy(CLASSIFICATIONS, (m) => m.classification),
    byTab: countBy(ANALYTICS_TABS, (m) => m.tab),
    byGuard: countBy(GUARDS, (m) => m.guard),
    metrics,
  };
}

/** Serialise the registry report as pretty JSON. */
export function serializeRegistryReport(): string {
  return `${JSON.stringify(buildRegistryReport(), null, 2)}\n`;
}

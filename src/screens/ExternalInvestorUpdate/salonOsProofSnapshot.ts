/**
 * Investor Salon OS proof snapshot.
 *
 * All values are derived from the CRM analytics presentation layer
 * (`AnalyticsMockData` ← `DEFAULT_CRM_SEED`) and the same formulas used by
 * DashboardReport, ServicesReport, ProductUsageReport, and
 * `selectLowStockItems`. Nothing here invents financial figures.
 */

import { DEFAULT_CRM_SEED } from "../SalonCRM/data/crmSeedData";
import type { ServiceType } from "../SalonPerformanceDashboard/reports/AnalyticsMockData";
import {
  MONTHLY_COMBINED,
  MONTHLY_PRODUCTS,
  MONTHLY_SERVICES,
  PRODUCTS,
  SERVICES,
} from "../SalonPerformanceDashboard/reports/AnalyticsMockData";
import { CATEGORY_COLORS } from "../SalonPerformanceDashboard/reports/ReportShared";
import { buildPilotFinanceDemo } from "../SalonPerformanceDashboard/pilotFinanceDemo";

export const PROOF_CATEGORY_KEYS = [
  "Color",
  "Highlights",
  "Toner",
  "Straightening",
  "Treatment",
] as const;

export type ProofCategoryKey = (typeof PROOF_CATEGORY_KEYS)[number];

const SERVICE_CATEGORY_KEYS = [...PROOF_CATEGORY_KEYS, "Others"] as const;

/** Preferred All Services rows, then CRM catalog fallbacks in the same roles. */
const PREFERRED_SERVICE_MATCHERS: readonly string[][] = [
  ["root color", "root touch-up", "root touch up"],
  ["full head highlights", "full highlights"],
  ["toner for highlights", "highlights rinse", "gloss toner"],
  ["organic straightening", "keratin treatment"],
];

export interface ProofCategoryPoint {
  key: ProofCategoryKey;
  name: ProofCategoryKey;
  revenue: number;
  usageGrams: number;
  color: string;
}

export interface ProofServiceRow {
  id: string;
  name: string;
  category: string;
  revenue: number;
  avgPrice: number;
  avgMaterialCost: number;
  avgDuration: number;
}

export interface SalonOsProofSnapshot {
  bookedServiceValue: number;
  estimatedMaterialCost: number;
  operatingOverhead: number;
  retailRevenue: number;
  netProfit: number;
  hasFinancePreview: boolean;
  revenueIsEstimated: true;
  totalUsageGrams: number;
  totalProductCost: number;
  lowStockAlerts: number;
  revenueByCategory: ProofCategoryPoint[];
  usageByCategory: ProofCategoryPoint[];
  serviceRows: ProofServiceRow[];
  periodStart: string;
  periodEnd: string;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function pickServiceRow(matchers: readonly string[]): ServiceType | undefined {
  const exact = SERVICES.find((service) => matchers.includes(normalizeName(service.name)));
  if (exact) return exact;
  return SERVICES.find((service) =>
    matchers.some((matcher) => normalizeName(service.name).includes(matcher)),
  );
}

function buildServiceRows(): ProofServiceRow[] {
  const used = new Set<string>();
  const rows: ProofServiceRow[] = [];
  for (const matchers of PREFERRED_SERVICE_MATCHERS) {
    const service = pickServiceRow(matchers);
    if (!service || used.has(service.id)) continue;
    used.add(service.id);
    rows.push({
      id: service.id,
      name: service.name,
      category: service.category,
      revenue: service.revenue,
      avgPrice: service.avgPrice,
      avgMaterialCost: service.avgMaterialCost,
      avgDuration: service.avgDuration,
    });
  }
  return rows.slice(0, 4);
}

function categoryRevenue(): ProofCategoryPoint[] {
  const months = MONTHLY_SERVICES;
  const totalRevenue = months.reduce((sum, month) => sum + month.revenue, 0);
  const rawCats = SERVICE_CATEGORY_KEYS.map((category) => {
    const performed = months.reduce((sum, month) => sum + ((month[category] as number) || 0), 0);
    const svcs = category === "Others"
      ? SERVICES.filter((service) => service.category === "Cut" || service.category === "Other")
      : SERVICES.filter((service) => service.category === category);
    const performedWeight = svcs.reduce((sum, service) => sum + service.totalPerformed, 0);
    const weightedAvgPrice = svcs.reduce(
      (sum, service) => sum + service.avgPrice * service.totalPerformed,
      0,
    ) / Math.max(1, performedWeight);
    return { name: category, totalPerformed: performed, rawRevenue: performed * weightedAvgPrice };
  }).filter((category) => category.totalPerformed > 0);

  const rawRevenueTotal = rawCats.reduce((sum, category) => sum + category.rawRevenue, 0);
  const normalized = rawCats.map((category) => ({
    ...category,
    totalRevenue: rawRevenueTotal > 0
      ? Math.round((category.rawRevenue / rawRevenueTotal) * totalRevenue)
      : 0,
  }));
  const revenueDelta = totalRevenue - normalized.reduce((sum, category) => sum + category.totalRevenue, 0);
  if (normalized.length > 0 && revenueDelta !== 0) {
    const largestIndex = normalized.reduce(
      (bestIndex, category, index, all) =>
        category.totalRevenue > all[bestIndex].totalRevenue ? index : bestIndex,
      0,
    );
    normalized[largestIndex] = {
      ...normalized[largestIndex],
      totalRevenue: normalized[largestIndex].totalRevenue + revenueDelta,
    };
  }

  return normalized
    .filter((category): category is typeof category & { name: ProofCategoryKey } =>
      (PROOF_CATEGORY_KEYS as readonly string[]).includes(category.name),
    )
    .map((category) => ({
      key: category.name,
      name: category.name,
      revenue: category.totalRevenue,
      usageGrams: 0,
      color: CATEGORY_COLORS[category.name] || "#64748B",
    }));
}

function categoryUsage(): ProofCategoryPoint[] {
  return PROOF_CATEGORY_KEYS.map((name) => {
    const usageGrams = MONTHLY_PRODUCTS.reduce((sum, month) => sum + (month[name] || 0), 0);
    return {
      key: name,
      name,
      revenue: 0,
      usageGrams,
      color: CATEGORY_COLORS[name] || "#64748B",
    };
  }).filter((category) => category.usageGrams > 0 || Boolean(PRODUCTS.find((item) => item.category === category.name)));
}

export function buildSalonOsProofSnapshot(): SalonOsProofSnapshot {
  const bookedServiceValue = MONTHLY_COMBINED.reduce((sum, month) => sum + month.revenue, 0);
  const estimatedMaterialCost = MONTHLY_COMBINED.reduce((sum, month) => sum + month.productCost, 0);
  const totalUsageGrams = MONTHLY_PRODUCTS.reduce((sum, month) => sum + month.totalUsage, 0);
  const totalProductCost = MONTHLY_PRODUCTS.reduce((sum, month) => sum + month.totalCost, 0);
  const financeDemo = buildPilotFinanceDemo(
    MONTHLY_COMBINED.map((month) => ({
      month: month.month,
      revenue: month.revenue,
      appointments: month.appointments,
    })),
  );
  const operatingOverhead = financeDemo.totalExpenses;
  const retailRevenue = financeDemo.totalRetailRevenue;
  const netProfit = bookedServiceValue + retailRevenue - estimatedMaterialCost - operatingOverhead;
  const lowStockAlerts = DEFAULT_CRM_SEED.inventoryItems.filter(
    (item) => item.unitsInStock <= item.minStock,
  ).length;
  const snapshot = DEFAULT_CRM_SEED.analyticsSnapshots[0];

  return {
    bookedServiceValue,
    estimatedMaterialCost,
    operatingOverhead,
    retailRevenue,
    netProfit,
    hasFinancePreview: financeDemo.active,
    revenueIsEstimated: true,
    totalUsageGrams,
    totalProductCost,
    lowStockAlerts,
    revenueByCategory: categoryRevenue(),
    usageByCategory: categoryUsage(),
    serviceRows: buildServiceRows(),
    periodStart: snapshot?.periodStart ?? MONTHLY_COMBINED[0]?.month ?? "",
    periodEnd: snapshot?.periodEnd ?? MONTHLY_COMBINED[MONTHLY_COMBINED.length - 1]?.month ?? "",
  };
}

export const SALON_OS_PROOF = buildSalonOsProofSnapshot();

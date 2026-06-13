/**
 * Analytics presentation view models.
 *
 * Usage, material-cost, revenue and operational values are derived
 * from the canonical CRM seed snapshot so every CRM analytics panel
 * uses the same financial model.
 *
 * When the live API is connected, the same export names will be
 * sourced from `useAnalyticsRange()` selectors. The reports only ever
 * import these names; swapping the data source is a single-file
 * change.
 */

import { DEFAULT_CRM_SEED } from "../../SalonCRM/data/crmSeedData";
import type {
  AnalyticsSnapshot,
  Customer,
  DailyOptimizationRow,
  MonthlyAnalyticsRow,
  Service as CanonicalService,
  ServiceCategoryId,
  StaffMember as CanonicalStaff,
} from "../../SalonCRM/data/crmTypes";

// ── Re-exports / view-model interfaces ─────────────────────────────

export interface StaffMember {
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

export interface Product {
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

export interface ServiceType {
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

export interface OptimizationDailyRow {
  date: string;
  reweighSavings: number;
  roundDownSavings: number;
  extraChargeRevenue: number;
  reweighSavedGrams: number;
  roundDownSavedGrams: number;
  reweighMixes: number;
  totalMixes: number;
}

// ── Canonical sources ─────────────────────────────────────────────

const CANONICAL_STAFF: CanonicalStaff[] = DEFAULT_CRM_SEED.staff;
export const CUSTOMERS: Customer[] = DEFAULT_CRM_SEED.customers;
const CANONICAL_SERVICES: CanonicalService[] = DEFAULT_CRM_SEED.services;
const CANONICAL_SNAPSHOT: AnalyticsSnapshot | undefined =
  DEFAULT_CRM_SEED.analyticsSnapshots[0];

const MONTHLY: MonthlyAnalyticsRow[] = CANONICAL_SNAPSHOT?.monthly ?? [];
const DAILY: DailyOptimizationRow[] = CANONICAL_SNAPSHOT?.daily ?? [];

const CATEGORY_LABELS: Record<ServiceCategoryId, string> = {
  color: "Color",
  highlights: "Highlights",
  toner: "Toner",
  straightening: "Straightening",
  treatment: "Treatment",
  cut: "Cut",
  other: "Other",
};

function labelForCategory(id: ServiceCategoryId): string {
  return CATEGORY_LABELS[id] ?? id;
}

const PRODUCT_CATEGORY_IDS = ["color", "highlights", "toner", "straightening", "treatment"] as const;
export const MATERIAL_COST_RATE = 0.18;
export const OPERATING_EXPENSE_RATE = 0.62;

function analyticsValueForCategory(
  selector: (row: MonthlyAnalyticsRow) => Record<ServiceCategoryId, number>,
  categoryId: ServiceCategoryId,
): number {
  return MONTHLY.reduce((sum, row) => sum + (selector(row)[categoryId] || 0), 0);
}

function productCostForCategory(categoryId: ServiceCategoryId): number {
  const totalServices = analyticsValueForCategory((row) => row.servicesByCategory, categoryId);
  const serviceDefs = CANONICAL_SERVICES.filter((svc) => svc.categoryId === categoryId);
  const avgPriceCents = serviceDefs.length > 0
    ? serviceDefs.reduce((sum, svc) => sum + svc.defaultPriceCents, 0) / serviceDefs.length
    : 0;
  return Math.round(((totalServices * avgPriceCents) / 100) * MATERIAL_COST_RATE);
}

function productCostForMonth(row: MonthlyAnalyticsRow): number {
  return Math.round((row.totalRevenueCents / 100) * MATERIAL_COST_RATE);
}

// ── Derived: STAFF ────────────────────────────────────────────────

export const STAFF: StaffMember[] = (() => {
  if (MONTHLY.length === 0) {
    return CANONICAL_STAFF.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      color: s.color,
      appointments: 0,
      revenue: 0,
      utilization: 0,
      avgServiceTime: 0,
      clientRetention: 0,
      rating: s.rating,
      trend: 0,
    }));
  }

  const totalAppointments = MONTHLY.reduce((s, m) => s + m.totalAppointments, 0);
  const totalRevenueCents = MONTHLY.reduce((s, m) => s + m.totalRevenueCents, 0);
  const revenuePerAppointment = totalAppointments > 0 ? totalRevenueCents / totalAppointments / 100 : 0;
  const last = MONTHLY[MONTHLY.length - 1];
  const prev = MONTHLY[Math.max(0, MONTHLY.length - 13)] ?? MONTHLY[0];

  return CANONICAL_STAFF.map((s) => {
    const appts = MONTHLY.reduce((sum, m) => sum + (m.staffAppointments[s.id] ?? 0), 0);
    const lastAppts = last.staffAppointments[s.id] ?? 0;
    const prevAppts = prev.staffAppointments[s.id] ?? lastAppts;
    const trend = prevAppts > 0 ? Math.round(((lastAppts - prevAppts) / prevAppts) * 100) : 0;
    return {
      id: s.id,
      name: s.name,
      role: s.role,
      color: s.color,
      appointments: appts,
      revenue: Math.round(appts * revenuePerAppointment),
      utilization: Math.min(100, Math.round((appts / Math.max(1, totalAppointments)) * 100 * CANONICAL_STAFF.length)),
      avgServiceTime: Math.round(
        CANONICAL_SERVICES.reduce((sum, sv) => sum + sv.defaultDurationMinutes, 0) /
          Math.max(1, CANONICAL_SERVICES.length),
      ),
      clientRetention: Math.min(95, 60 + Math.round(s.rating * 6)),
      rating: s.rating,
      trend,
    };
  });
})();

// ── Derived: PRODUCTS ─────────────────────────────────────────────

export const PRODUCTS: Product[] = (() => {
  const prev = MONTHLY.length >= 2 ? MONTHLY[MONTHLY.length - 2] : null;
  const last = MONTHLY[MONTHLY.length - 1] || null;

  return PRODUCT_CATEGORY_IDS.map((categoryId) => {
    const category = labelForCategory(categoryId);
    const usageGrams = analyticsValueForCategory((row) => row.productUsageByCategory, categoryId);
    const cost = productCostForCategory(categoryId);
    const lastGrams = last?.productUsageByCategory[categoryId] ?? usageGrams;
    const prevGrams = prev?.productUsageByCategory[categoryId] ?? lastGrams;
    return {
      id: `usage-${categoryId}`,
      name: `${category} usage`,
      brand: "CRM usage",
      category,
      usageGrams,
      cost,
      unitPrice: usageGrams > 0 ? Math.round((cost / usageGrams) * 100) / 100 : 0,
      stockLevel: "medium" as Product["stockLevel"],
      trend: prevGrams > 0 ? Math.round(((lastGrams - prevGrams) / prevGrams) * 100) : 0,
    };
  });
})();

// ── Derived: SERVICES ─────────────────────────────────────────────

export const SERVICES: ServiceType[] = (() => {
  const prev = MONTHLY.length >= 2 ? MONTHLY[MONTHLY.length - 2] : null;
  const last = MONTHLY[MONTHLY.length - 1] || null;

  return CANONICAL_SERVICES.map((service) => {
    const categoryServices = CANONICAL_SERVICES.filter((svc) => svc.categoryId === service.categoryId);
    const categoryPerformed = analyticsValueForCategory((row) => row.servicesByCategory, service.categoryId);
    const categoryLast = last?.servicesByCategory[service.categoryId] ?? categoryPerformed;
    const categoryPrev = prev?.servicesByCategory[service.categoryId] ?? categoryLast;
    const priceWeightTotal = categoryServices.reduce((sum, svc) => sum + svc.defaultPriceCents, 0);
    const serviceWeight = priceWeightTotal > 0 ? service.defaultPriceCents / priceWeightTotal : 1 / Math.max(1, categoryServices.length);
    const totalPerformed = Math.round(categoryPerformed * serviceWeight);
    const lastServices = Math.round(categoryLast * serviceWeight);
    const prevServices = Math.round(categoryPrev * serviceWeight);
    const avgPrice = Math.round(service.defaultPriceCents / 100);
    return {
      id: service.id,
      name: service.name,
      category: labelForCategory(service.categoryId),
      avgDuration: service.defaultDurationMinutes,
      avgPrice,
      avgMaterialCost: Math.round(avgPrice * MATERIAL_COST_RATE),
      totalPerformed,
      revenue: Math.round(totalPerformed * avgPrice),
      trend:
        prevServices > 0
          ? Math.round(((lastServices - prevServices) / prevServices) * 100)
          : 0,
    };
  });
})();

// ── Aggregate constants ──────────────────────────────────────────

export const TOTAL_APPOINTMENTS = STAFF.reduce((s, e) => s + e.appointments, 0);
export const TOTAL_REVENUE = STAFF.reduce((s, e) => s + e.revenue, 0);
export const AVG_UTILIZATION = STAFF.length > 0
  ? Math.round(STAFF.reduce((s, e) => s + e.utilization, 0) / STAFF.length)
  : 0;
export const AVG_RATING = STAFF.length > 0
  ? +(STAFF.reduce((s, e) => s + e.rating, 0) / STAFF.length).toFixed(1)
  : 0;

export const TOTAL_PRODUCT_USAGE = PRODUCTS.reduce((s, p) => s + p.usageGrams, 0);
export const TOTAL_PRODUCT_COST = PRODUCTS.reduce((s, p) => s + p.cost, 0);

export const PRODUCT_CATEGORIES = (() => {
  const map: Record<string, { usage: number; cost: number; count: number }> = {};
  for (const p of PRODUCTS) {
    if (!map[p.category]) map[p.category] = { usage: 0, cost: 0, count: 0 };
    map[p.category].usage += p.usageGrams;
    map[p.category].cost += p.cost;
    map[p.category].count += 1;
  }
  return Object.entries(map)
    .map(([name, v]) => ({ name, totalUsage: v.usage, totalCost: v.cost, productCount: v.count }))
    .sort((a, b) => b.totalUsage - a.totalUsage);
})();

export const TOTAL_SERVICES_PERFORMED = SERVICES.reduce((s, sv) => s + sv.totalPerformed, 0);
export const TOTAL_SERVICES_REVENUE = SERVICES.reduce((s, sv) => s + sv.revenue, 0);
export const AVG_SERVICE_PRICE = TOTAL_SERVICES_PERFORMED > 0
  ? Math.round(TOTAL_SERVICES_REVENUE / TOTAL_SERVICES_PERFORMED)
  : 0;
export const AVG_MATERIAL_COST_PER_SVC = TOTAL_SERVICES_PERFORMED > 0
  ? Math.round(SERVICES.reduce((s, sv) => s + sv.avgMaterialCost * sv.totalPerformed, 0) / TOTAL_SERVICES_PERFORMED)
  : 0;

export const SERVICE_CATEGORIES = (() => {
  const map: Record<string, { performed: number; revenue: number; materialCost: number; count: number }> = {};
  for (const sv of SERVICES) {
    if (!map[sv.category]) map[sv.category] = { performed: 0, revenue: 0, materialCost: 0, count: 0 };
    map[sv.category].performed += sv.totalPerformed;
    map[sv.category].revenue += sv.revenue;
    map[sv.category].materialCost += sv.avgMaterialCost * sv.totalPerformed;
    map[sv.category].count += 1;
  }
  return Object.entries(map)
    .map(([name, v]) => ({
      name,
      totalPerformed: v.performed,
      totalRevenue: v.revenue,
      avgMaterialCost: v.performed > 0 ? Math.round(v.materialCost / v.performed) : 0,
      serviceCount: v.count,
    }))
    .sort((a, b) => b.totalPerformed - a.totalPerformed);
})();

// ── Derived: monthly rows ────────────────────────────────────────

export const MONTHLY_STAFF: MonthlyStaffRow[] = MONTHLY.map((m) => {
  const row: MonthlyStaffRow = { month: m.label };
  for (const s of CANONICAL_STAFF) {
    row[s.id] = m.staffAppointments[s.id] ?? 0;
  }
  return row;
});

export const MONTHLY_PRODUCTS: MonthlyProductRow[] = MONTHLY.map((m) => ({
  month: m.label,
  totalUsage: m.totalProductUsageGrams,
  totalCost: productCostForMonth(m),
  Color: m.productUsageByCategory.color || 0,
  Highlights: m.productUsageByCategory.highlights || 0,
  Toner: m.productUsageByCategory.toner || 0,
  Straightening: m.productUsageByCategory.straightening || 0,
  Treatment: m.productUsageByCategory.treatment || 0,
  Others: m.productUsageByCategory.other || 0,
}));

export const MONTHLY_SERVICES: MonthlyServiceRow[] = MONTHLY.map((m) => ({
  month: m.label,
  Color: m.servicesByCategory.color || 0,
  Highlights: m.servicesByCategory.highlights || 0,
  Toner: m.servicesByCategory.toner || 0,
  Straightening: m.servicesByCategory.straightening || 0,
  Treatment: m.servicesByCategory.treatment || 0,
  Others: (m.servicesByCategory.cut || 0) + (m.servicesByCategory.other || 0),
  total: m.totalServices,
  revenue: Math.round(m.totalRevenueCents / 100),
}));

export const MONTHLY_COMBINED = MONTHLY_STAFF.map((row, i) => {
  const totalAppts = CANONICAL_STAFF.reduce((sum, s) => sum + ((row[s.id] as number) || 0), 0);
  const prodRow = MONTHLY_PRODUCTS[i];
  return {
    month: row.month,
    appointments: totalAppts,
    revenue: Math.round((MONTHLY[i]?.totalRevenueCents || 0) / 100),
    productCost: prodRow?.totalCost || 0,
    productUsage: prodRow?.totalUsage || 0,
  };
});

// ── Derived: daily optimization ──────────────────────────────────

export const DAILY_OPTIMIZATION: OptimizationDailyRow[] = DAILY.map((d) => ({
  date: d.date,
  reweighSavings: Math.round(d.reweighSavingsCents / 100),
  roundDownSavings: Math.round(d.roundDownSavingsCents / 100),
  extraChargeRevenue: Math.round(d.extraChargeRevenueCents / 100),
  reweighSavedGrams: d.reweighSavedGrams,
  roundDownSavedGrams: d.roundDownSavedGrams,
  reweighMixes: d.reweighMixes,
  totalMixes: d.totalMixes,
}));

// ── Date filtering types & utilities (pure helpers) ─────────────

export type DatePreset = "today" | "week" | "month" | "year" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  preset: DatePreset;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function parseMonthLabel(label: string): Date {
  const parts = label.split(" ");
  return new Date(Number(parts[1]), MONTH_NAMES.indexOf(parts[0]), 1);
}

export function monthInRange(monthLabel: string, range: DateRange): boolean {
  const start = parseMonthLabel(monthLabel);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
  return start <= range.to && end >= range.from;
}

export function getDefaultRange(): DateRange {
  return { from: new Date(2025, 2, 1), to: new Date(2026, 1, 28), preset: "year" };
}

export function rangeFromPreset(preset: DatePreset): DateRange {
  const today = new Date(2026, 1, 15);
  switch (preset) {
    case "today":
      return { from: new Date(2026, 1, 15, 0, 0, 0), to: new Date(2026, 1, 15, 23, 59, 59), preset };
    case "week": {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      return { from, to: new Date(2026, 1, 15, 23, 59, 59), preset };
    }
    case "month":
      return { from: new Date(2026, 1, 1), to: new Date(2026, 1, 15, 23, 59, 59), preset };
    case "year":
    default:
      return getDefaultRange();
  }
}

export function filterMonthly<T extends { month: string }>(data: T[], range: DateRange): T[] {
  return data.filter((row) => monthInRange(row.month, range));
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function aggregateOptimization(range: DateRange) {
  const fromStr = toDateStr(range.from);
  const toStr = toDateStr(range.to);
  let rw = 0, rd = 0, ec = 0, rwg = 0, rdg = 0, days = 0, rwm = 0, tm = 0;
  for (const row of DAILY_OPTIMIZATION) {
    if (row.date >= fromStr && row.date <= toStr) {
      rw += row.reweighSavings;
      rd += row.roundDownSavings;
      ec += row.extraChargeRevenue;
      rwg += row.reweighSavedGrams;
      rdg += row.roundDownSavedGrams;
      rwm += row.reweighMixes;
      tm += row.totalMixes;
      days++;
    }
  }
  return {
    reweighSavings: rw,
    roundDownSavings: rd,
    mixOptimizationSavings: rw + rd,
    extraChargeRevenue: ec,
    reweighSavedGrams: rwg,
    roundDownSavedGrams: rdg,
    totalSavedGramsDirect: rwg + rdg,
    reweighMixes: rwm,
    totalMixes: tm,
    reweighPct: tm > 0 ? Math.round((rwm / tm) * 100) : 0,
    days,
  };
}

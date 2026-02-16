// ── Staff types & data ──────────────────────────────────────────────

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

export const STAFF: StaffMember[] = [
  { id: "s1", name: "Adele Cooper",   role: "Senior Colorist",   color: "#E84393", appointments: 201, revenue: 105200, utilization: 95, avgServiceTime: 55, clientRetention: 91, rating: 4.8, trend: 18 },
  { id: "s2", name: "Maya Goldstein", role: "Color Specialist",  color: "#6C5CE7", appointments: 187, revenue: 89400,  utilization: 92, avgServiceTime: 45, clientRetention: 87, rating: 4.9, trend: 12 },
  { id: "s3", name: "Liam Navarro",   role: "Stylist",           color: "#00B894", appointments: 156, revenue: 62400,  utilization: 78, avgServiceTime: 35, clientRetention: 79, rating: 4.6, trend: 5 },
  { id: "s4", name: "Noa Berkovich",  role: "Straightening Pro", color: "#6AC5C8", appointments: 134, revenue: 73700,  utilization: 84, avgServiceTime: 65, clientRetention: 82, rating: 4.7, trend: -3 },
  { id: "s5", name: "Daniel Rosen",   role: "Junior Stylist",    color: "#FDCB6E", appointments: 98,  revenue: 29400,  utilization: 62, avgServiceTime: 30, clientRetention: 68, rating: 4.2, trend: 22 },
  { id: "s6", name: "Sarah Levy",     role: "Trainee",           color: "#F8B739", appointments: 67,  revenue: 16750,  utilization: 45, avgServiceTime: 40, clientRetention: 55, rating: 3.9, trend: 35 },
];

// ── Product types & data ────────────────────────────────────────────

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

export const PRODUCTS: Product[] = [
  { id: "p1",  name: "Majirel",           brand: "L'Oreal",          category: "Color",         usageGrams: 4200, cost: 8400,  unitPrice: 2.0,  stockLevel: "high",     trend: 8 },
  { id: "p2",  name: "Koleston Perfect",  brand: "Wella",            category: "Color",         usageGrams: 3100, cost: 7750,  unitPrice: 2.5,  stockLevel: "medium",   trend: -2 },
  { id: "p3",  name: "Igora Royal",       brand: "Schwarzkopf",      category: "Color",         usageGrams: 2800, cost: 5040,  unitPrice: 1.8,  stockLevel: "high",     trend: 5 },
  { id: "p4",  name: "Blond Studio",      brand: "L'Oreal",          category: "Highlights",    usageGrams: 2600, cost: 9100,  unitPrice: 3.5,  stockLevel: "medium",   trend: 12 },
  { id: "p5",  name: "Blondor",           brand: "Wella",            category: "Highlights",    usageGrams: 1900, cost: 5510,  unitPrice: 2.9,  stockLevel: "low",      trend: -5 },
  { id: "p6",  name: "BlondMe",           brand: "Schwarzkopf",      category: "Highlights",    usageGrams: 1400, cost: 4900,  unitPrice: 3.5,  stockLevel: "medium",   trend: 3 },
  { id: "p7",  name: "Shades EQ",         brand: "Redken",           category: "Toner",         usageGrams: 1800, cost: 5400,  unitPrice: 3.0,  stockLevel: "high",     trend: 15 },
  { id: "p8",  name: "Dia Light",         brand: "L'Oreal",          category: "Toner",         usageGrams: 1500, cost: 3750,  unitPrice: 2.5,  stockLevel: "medium",   trend: 7 },
  { id: "p9",  name: "Color Touch",       brand: "Wella",            category: "Toner",         usageGrams: 1200, cost: 2640,  unitPrice: 2.2,  stockLevel: "high",     trend: -1 },
  { id: "p10", name: "GK Keratin",        brand: "Global Keratin",   category: "Straightening", usageGrams: 900,  cost: 6300,  unitPrice: 7.0,  stockLevel: "low",      trend: 10 },
  { id: "p11", name: "Brazilian Blowout", brand: "Brazilian Blowout",category: "Straightening", usageGrams: 700,  cost: 5600,  unitPrice: 8.0,  stockLevel: "critical", trend: -8 },
  { id: "p12", name: "Olaplex No.1",      brand: "Olaplex",          category: "Treatment",     usageGrams: 600,  cost: 4200,  unitPrice: 7.0,  stockLevel: "medium",   trend: 20 },
  { id: "p13", name: "K18 Molecular",     brand: "K18",              category: "Treatment",     usageGrams: 400,  cost: 3600,  unitPrice: 9.0,  stockLevel: "low",      trend: 28 },
  { id: "p14", name: "Olaplex No.2",      brand: "Olaplex",          category: "Treatment",     usageGrams: 500,  cost: 2500,  unitPrice: 5.0,  stockLevel: "high",     trend: 6 },
  { id: "p15", name: "Acidic Bonding",    brand: "Redken",           category: "Treatment",     usageGrams: 800,  cost: 2800,  unitPrice: 3.5,  stockLevel: "high",     trend: 11 },
];

// ── Monthly staff rows ──────────────────────────────────────────────

export interface MonthlyStaffRow {
  month: string;
  [key: string]: number | string;
}

export const MONTHLY_STAFF: MonthlyStaffRow[] = [
  { month: "Mar 2025", s1: 14, s2: 13, s3: 11, s4: 10, s5: 7,  s6: 4 },
  { month: "Apr 2025", s1: 15, s2: 14, s3: 12, s4: 10, s5: 7,  s6: 4 },
  { month: "May 2025", s1: 16, s2: 15, s3: 12, s4: 11, s5: 8,  s6: 5 },
  { month: "Jun 2025", s1: 17, s2: 16, s3: 13, s4: 11, s5: 8,  s6: 5 },
  { month: "Jul 2025", s1: 18, s2: 16, s3: 14, s4: 12, s5: 8,  s6: 6 },
  { month: "Aug 2025", s1: 19, s2: 17, s3: 14, s4: 12, s5: 9,  s6: 6 },
  { month: "Sep 2025", s1: 17, s2: 16, s3: 13, s4: 11, s5: 9,  s6: 5 },
  { month: "Oct 2025", s1: 18, s2: 17, s3: 14, s4: 12, s5: 10, s6: 6 },
  { month: "Nov 2025", s1: 17, s2: 16, s3: 13, s4: 11, s5: 9,  s6: 6 },
  { month: "Dec 2025", s1: 16, s2: 15, s3: 12, s4: 10, s5: 9,  s6: 5 },
  { month: "Jan 2026", s1: 17, s2: 16, s3: 13, s4: 12, s5: 10, s6: 7 },
  { month: "Feb 2026", s1: 17, s2: 16, s3: 15, s4: 12, s5: 10, s6: 8 },
];

// ── Monthly product rows ────────────────────────────────────────────

export interface MonthlyProductRow {
  month: string;
  totalUsage: number;
  totalCost: number;
  Color: number;
  Highlights: number;
  Toner: number;
  Straightening: number;
  Treatment: number;
}

export const MONTHLY_PRODUCTS: MonthlyProductRow[] = [
  { month: "Mar 2025", totalUsage: 1820, totalCost: 5840,  Color: 760,  Highlights: 420, Toner: 320, Straightening: 120, Treatment: 200 },
  { month: "Apr 2025", totalUsage: 1920, totalCost: 6120,  Color: 800,  Highlights: 440, Toner: 340, Straightening: 130, Treatment: 210 },
  { month: "May 2025", totalUsage: 2050, totalCost: 6580,  Color: 850,  Highlights: 480, Toner: 360, Straightening: 140, Treatment: 220 },
  { month: "Jun 2025", totalUsage: 2180, totalCost: 7020,  Color: 900,  Highlights: 510, Toner: 380, Straightening: 150, Treatment: 240 },
  { month: "Jul 2025", totalUsage: 2280, totalCost: 7380,  Color: 950,  Highlights: 530, Toner: 400, Straightening: 150, Treatment: 250 },
  { month: "Aug 2025", totalUsage: 2350, totalCost: 7620,  Color: 980,  Highlights: 550, Toner: 410, Straightening: 155, Treatment: 255 },
  { month: "Sep 2025", totalUsage: 2150, totalCost: 6920,  Color: 890,  Highlights: 500, Toner: 380, Straightening: 140, Treatment: 240 },
  { month: "Oct 2025", totalUsage: 2250, totalCost: 7280,  Color: 940,  Highlights: 520, Toner: 390, Straightening: 150, Treatment: 250 },
  { month: "Nov 2025", totalUsage: 2100, totalCost: 6780,  Color: 870,  Highlights: 490, Toner: 370, Straightening: 135, Treatment: 235 },
  { month: "Dec 2025", totalUsage: 2000, totalCost: 6440,  Color: 830,  Highlights: 460, Toner: 350, Straightening: 130, Treatment: 230 },
  { month: "Jan 2026", totalUsage: 2200, totalCost: 7100,  Color: 920,  Highlights: 510, Toner: 380, Straightening: 145, Treatment: 245 },
  { month: "Feb 2026", totalUsage: 2300, totalCost: 7510,  Color: 960,  Highlights: 540, Toner: 400, Straightening: 150, Treatment: 250 },
];

// ── Aggregate constants ─────────────────────────────────────────────

export const TOTAL_APPOINTMENTS = STAFF.reduce((s, e) => s + e.appointments, 0);
export const TOTAL_REVENUE = STAFF.reduce((s, e) => s + e.revenue, 0);
export const AVG_UTILIZATION = Math.round(STAFF.reduce((s, e) => s + e.utilization, 0) / STAFF.length);
export const AVG_RATING = +(STAFF.reduce((s, e) => s + e.rating, 0) / STAFF.length).toFixed(1);

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

// ── Service types & data ────────────────────────────────────────────

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

export const SERVICES: ServiceType[] = [
  { id: "sv1",  name: "Full Color",        category: "Color",         avgDuration: 45,  avgPrice: 280, avgMaterialCost: 42,  totalPerformed: 312, revenue: 87360,  trend: 8 },
  { id: "sv2",  name: "Root Touch-up",     category: "Color",         avgDuration: 30,  avgPrice: 180, avgMaterialCost: 28,  totalPerformed: 245, revenue: 44100,  trend: 3 },
  { id: "sv3",  name: "Balayage",          category: "Highlights",    avgDuration: 90,  avgPrice: 450, avgMaterialCost: 65,  totalPerformed: 178, revenue: 80100,  trend: 15 },
  { id: "sv4",  name: "Full Highlights",   category: "Highlights",    avgDuration: 75,  avgPrice: 380, avgMaterialCost: 58,  totalPerformed: 134, revenue: 50920,  trend: 7 },
  { id: "sv5",  name: "Gloss Toner",       category: "Toner",         avgDuration: 20,  avgPrice: 120, avgMaterialCost: 22,  totalPerformed: 198, revenue: 23760,  trend: 12 },
  { id: "sv6",  name: "Corrective Toner",  category: "Toner",         avgDuration: 35,  avgPrice: 200, avgMaterialCost: 35,  totalPerformed: 87,  revenue: 17400,  trend: -2 },
  { id: "sv7",  name: "Keratin Treatment", category: "Straightening", avgDuration: 120, avgPrice: 600, avgMaterialCost: 95,  totalPerformed: 96,  revenue: 57600,  trend: 10 },
  { id: "sv8",  name: "Brazilian Blowout", category: "Straightening", avgDuration: 90,  avgPrice: 500, avgMaterialCost: 85,  totalPerformed: 68,  revenue: 34000,  trend: -5 },
  { id: "sv9",  name: "Olaplex Treatment", category: "Treatment",     avgDuration: 30,  avgPrice: 150, avgMaterialCost: 45,  totalPerformed: 156, revenue: 23400,  trend: 22 },
  { id: "sv10", name: "Deep Conditioning", category: "Treatment",     avgDuration: 25,  avgPrice: 100, avgMaterialCost: 18,  totalPerformed: 132, revenue: 13200,  trend: 9 },
];

export const TOTAL_SERVICES_PERFORMED = SERVICES.reduce((s, sv) => s + sv.totalPerformed, 0);
export const TOTAL_SERVICES_REVENUE = SERVICES.reduce((s, sv) => s + sv.revenue, 0);
export const AVG_SERVICE_PRICE = Math.round(TOTAL_SERVICES_REVENUE / TOTAL_SERVICES_PERFORMED);
export const AVG_MATERIAL_COST_PER_SVC = Math.round(
  SERVICES.reduce((s, sv) => s + sv.avgMaterialCost * sv.totalPerformed, 0) / TOTAL_SERVICES_PERFORMED
);

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
      avgMaterialCost: Math.round(v.materialCost / v.performed),
      serviceCount: v.count,
    }))
    .sort((a, b) => b.totalPerformed - a.totalPerformed);
})();

export interface MonthlyServiceRow {
  month: string;
  Color: number;
  Highlights: number;
  Toner: number;
  Straightening: number;
  Treatment: number;
  total: number;
  revenue: number;
}

export const MONTHLY_SERVICES: MonthlyServiceRow[] = [
  { month: "Mar 2025", Color: 42, Highlights: 22, Toner: 20, Straightening: 12, Treatment: 20, total: 116, revenue: 31900 },
  { month: "Apr 2025", Color: 44, Highlights: 24, Toner: 22, Straightening: 12, Treatment: 22, total: 124, revenue: 34200 },
  { month: "May 2025", Color: 46, Highlights: 26, Toner: 24, Straightening: 14, Treatment: 24, total: 134, revenue: 36800 },
  { month: "Jun 2025", Color: 48, Highlights: 28, Toner: 25, Straightening: 14, Treatment: 25, total: 140, revenue: 38600 },
  { month: "Jul 2025", Color: 50, Highlights: 28, Toner: 26, Straightening: 15, Treatment: 26, total: 145, revenue: 39900 },
  { month: "Aug 2025", Color: 50, Highlights: 30, Toner: 26, Straightening: 15, Treatment: 27, total: 148, revenue: 40800 },
  { month: "Sep 2025", Color: 46, Highlights: 26, Toner: 24, Straightening: 13, Treatment: 24, total: 133, revenue: 36600 },
  { month: "Oct 2025", Color: 48, Highlights: 28, Toner: 25, Straightening: 14, Treatment: 26, total: 141, revenue: 38800 },
  { month: "Nov 2025", Color: 45, Highlights: 25, Toner: 24, Straightening: 13, Treatment: 24, total: 131, revenue: 36100 },
  { month: "Dec 2025", Color: 44, Highlights: 24, Toner: 22, Straightening: 12, Treatment: 22, total: 124, revenue: 34100 },
  { month: "Jan 2026", Color: 47, Highlights: 27, Toner: 25, Straightening: 14, Treatment: 25, total: 138, revenue: 38000 },
  { month: "Feb 2026", Color: 48, Highlights: 28, Toner: 25, Straightening: 15, Treatment: 26, total: 142, revenue: 39050 },
];

// ── Combined monthly data (for Dashboard overview) ──────────────────

export const MONTHLY_COMBINED = MONTHLY_STAFF.map((row, i) => {
  const totalAppts = STAFF.reduce((sum, s) => sum + ((row[s.id] as number) || 0), 0);
  const prodRow = MONTHLY_PRODUCTS[i];
  return {
    month: row.month,
    appointments: totalAppts,
    revenue: Math.round(totalAppts * (TOTAL_REVENUE / TOTAL_APPOINTMENTS)),
    productCost: prodRow?.totalCost || 0,
    productUsage: prodRow?.totalUsage || 0,
  };
});

// ── Date filtering types & utilities ────────────────────────────────

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
  return data.filter(row => monthInRange(row.month, range));
}

// ── Optimization daily data ─────────────────────────────────────────
// Mix Optimization Savings = reweighSavings + roundDownSavings (cost reduction from smarter material usage)
// Extra Charge Revenue = client-billed over-standard usage (additional revenue, NOT cost saving)

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

export const DAILY_OPTIMIZATION: OptimizationDailyRow[] = (() => {
  const rows: OptimizationDailyRow[] = [];
  const end = new Date(2026, 1, 15);
  let seed = 42;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const d = new Date(2025, 2, 1);
  while (d <= end) {
    if (d.getDay() !== 6) {
      const sf = 1 + 0.15 * Math.sin(((d.getMonth() - 2) / 12) * Math.PI * 2);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dailyTotalMixes = Math.round((8 + rand() * 14) * sf);
      const dailyReweighMixes = Math.round(dailyTotalMixes * (0.25 + rand() * 0.35));
      rows.push({
        date: `${yyyy}-${mm}-${dd}`,
        reweighSavings: Math.round((18 + rand() * 30) * sf),
        roundDownSavings: Math.round((12 + rand() * 22) * sf),
        extraChargeRevenue: Math.round((25 + rand() * 45) * sf),
        reweighSavedGrams: Math.round((5 + rand() * 12) * sf),
        roundDownSavedGrams: Math.round((3 + rand() * 8) * sf),
        totalMixes: dailyTotalMixes,
        reweighMixes: dailyReweighMixes,
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return rows;
})();

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

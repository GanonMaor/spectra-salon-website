/**
 * Pilot preview data for Sales + Expenses tabs.
 *
 * Until checkout / expenses modules exist, we derive a deterministic, salon-
 * shaped preview from booked service revenue so the CRM analytics surface
 * looks operational for demos. Numbers are marked as pilot preview in the UI.
 */

export interface RetailProductSale {
  id: string;
  name: string;
  brand: string;
  category: string;
  units: number;
  revenue: number;
  cost: number;
  marginPct: number;
}

export interface MonthlyRetailRow {
  month: string;
  revenue: number;
  units: number;
  cost: number;
  Shampoo: number;
  Treatment: number;
  Styling: number;
  ColorCare: number;
  Other: number;
}

export interface ExpenseRow {
  id: string;
  category: string;
  label: string;
  amount: number;
  kind: "fixed" | "variable";
}

export interface MonthlyExpenseRow {
  month: string;
  total: number;
  Rent: number;
  Payroll: number;
  Utilities: number;
  Marketing: number;
  Supplies: number;
  Other: number;
}

export interface PilotFinanceDemo {
  retailProducts: RetailProductSale[];
  monthlyRetail: MonthlyRetailRow[];
  expenses: ExpenseRow[];
  monthlyExpenses: MonthlyExpenseRow[];
  totalRetailRevenue: number;
  totalRetailUnits: number;
  totalExpenses: number;
  /** True when enough service activity exists to shape a useful preview. */
  active: boolean;
}

type MonthSeed = { month: string; revenue: number; appointments: number };

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unit(seed: number): number {
  // Deterministic 0..1 from integer seed.
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const RETAIL_CATALOG = [
  { id: "retail-shampoo", name: "Series Expert Shampoo 300ml", brand: "L'Oréal Pro", category: "Shampoo", price: 129, cost: 52 },
  { id: "retail-mask", name: "Absolut Repair Mask 250ml", brand: "L'Oréal Pro", category: "Treatment", price: 159, cost: 64 },
  { id: "retail-oil", name: "Mythic Oil 100ml", brand: "L'Oréal Pro", category: "Styling", price: 189, cost: 78 },
  { id: "retail-spray", name: "Tecni.Art Fix Spray", brand: "L'Oréal Pro", category: "Styling", price: 99, cost: 38 },
  { id: "retail-colorcare", name: "Vitamino Color Conditioner", brand: "L'Oréal Pro", category: "ColorCare", price: 119, cost: 46 },
  { id: "retail-brush", name: "Ceramic Brush Large", brand: "Olivia Garden", category: "Other", price: 89, cost: 32 },
  { id: "retail-keratin", name: "Home Care Keratin 200ml", brand: "Octan Pearl", category: "Treatment", price: 149, cost: 58 },
  { id: "retail-leavein", name: "Leave-In Cream 150ml", brand: "Redken", category: "Treatment", price: 139, cost: 55 },
] as const;

/**
 * Build pilot retail + expense preview from monthly booked revenue.
 * Returns `active: false` when there is no meaningful service activity.
 */
export function buildPilotFinanceDemo(months: MonthSeed[]): PilotFinanceDemo {
  const activeMonths = months.filter((m) => m.revenue > 0 || m.appointments > 0);
  if (activeMonths.length === 0) {
    return {
      retailProducts: [],
      monthlyRetail: [],
      expenses: [],
      monthlyExpenses: [],
      totalRetailRevenue: 0,
      totalRetailUnits: 0,
      totalExpenses: 0,
      active: false,
    };
  }

  const productTotals = new Map<string, { units: number; revenue: number; cost: number }>();
  const monthlyRetail: MonthlyRetailRow[] = [];
  const monthlyExpenses: MonthlyExpenseRow[] = [];

  let totalRetailRevenue = 0;
  let totalRetailUnits = 0;
  let totalExpenses = 0;

  for (const month of months) {
    const hasActivity = month.revenue > 0 || month.appointments > 0;
    const base = Math.max(month.revenue, month.appointments * 180);
    const seed = hash(month.month);
    // Retail ≈ 9–14% of booked service value, with a floor so quiet months
    // still show a few take-home product sales in the pilot preview.
    const retailShare = 0.09 + unit(seed + 1) * 0.05;
    const minRetailUnits = hasActivity ? Math.max(2, month.appointments) : 0;
    const cheapest = Math.min(...RETAIL_CATALOG.map((item) => item.price));
    const monthRetailBudget = hasActivity
      ? Math.max(Math.round(base * retailShare), minRetailUnits * cheapest)
      : 0;

    const cat = { Shampoo: 0, Treatment: 0, Styling: 0, ColorCare: 0, Other: 0 };
    let monthRevenue = 0;
    let monthUnits = 0;
    let monthCost = 0;

    // Spread budget across catalog with deterministic weights.
    let remaining = monthRetailBudget;
    RETAIL_CATALOG.forEach((item, index) => {
      const weight = 0.08 + unit(seed + 11 + index) * 0.18;
      const slice = index === RETAIL_CATALOG.length - 1
        ? remaining
        : Math.min(remaining, Math.round(monthRetailBudget * weight));
      remaining = Math.max(0, remaining - slice);
      let units = monthRetailBudget > 0 ? Math.max(0, Math.floor(slice / item.price)) : 0;
      // Guarantee at least one sale on the first catalog items for active months.
      if (units <= 0 && hasActivity && index < minRetailUnits) {
        units = 1;
      }
      if (units <= 0) return;
      const revenue = units * item.price;
      const cost = units * item.cost;
      monthRevenue += revenue;
      monthUnits += units;
      monthCost += cost;
      const key = item.category as keyof typeof cat;
      if (key in cat) cat[key] += revenue;

      const prev = productTotals.get(item.id) ?? { units: 0, revenue: 0, cost: 0 };
      prev.units += units;
      prev.revenue += revenue;
      prev.cost += cost;
      productTotals.set(item.id, prev);
    });

    monthlyRetail.push({
      month: month.month,
      revenue: monthRevenue,
      units: monthUnits,
      cost: monthCost,
      ...cat,
    });
    totalRetailRevenue += monthRevenue;
    totalRetailUnits += monthUnits;

    // Expenses only for months with service activity (keeps charts aligned).
    if (!hasActivity) {
      monthlyExpenses.push({
        month: month.month,
        total: 0,
        Rent: 0,
        Payroll: 0,
        Utilities: 0,
        Marketing: 0,
        Supplies: 0,
        Other: 0,
      });
      continue;
    }

    // Expenses: rent/payroll scale gently with activity; utilities/marketing vary.
    const rent = 8500 + Math.round(unit(seed + 21) * 1500);
    const payroll = Math.round(base * (0.28 + unit(seed + 22) * 0.06));
    const utilities = 1200 + Math.round(unit(seed + 23) * 800);
    const marketing = Math.round(base * (0.03 + unit(seed + 24) * 0.03));
    const supplies = Math.round(base * (0.04 + unit(seed + 25) * 0.02));
    const other = 600 + Math.round(unit(seed + 26) * 900);
    const monthExpenseTotal = rent + payroll + utilities + marketing + supplies + other;

    monthlyExpenses.push({
      month: month.month,
      total: monthExpenseTotal,
      Rent: rent,
      Payroll: payroll,
      Utilities: utilities,
      Marketing: marketing,
      Supplies: supplies,
      Other: other,
    });
    totalExpenses += monthExpenseTotal;
  }

  const retailProducts: RetailProductSale[] = RETAIL_CATALOG.map((item) => {
    const totals = productTotals.get(item.id) ?? { units: 0, revenue: 0, cost: 0 };
    const marginPct = totals.revenue > 0
      ? Math.round(((totals.revenue - totals.cost) / totals.revenue) * 100)
      : 0;
    return {
      id: item.id,
      name: item.name,
      brand: item.brand,
      category: item.category,
      units: totals.units,
      revenue: totals.revenue,
      cost: totals.cost,
      marginPct,
    };
  })
    .filter((p) => p.units > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const expenseTotals = monthlyExpenses.reduce(
    (acc, m) => {
      acc.Rent += m.Rent;
      acc.Payroll += m.Payroll;
      acc.Utilities += m.Utilities;
      acc.Marketing += m.Marketing;
      acc.Supplies += m.Supplies;
      acc.Other += m.Other;
      return acc;
    },
    { Rent: 0, Payroll: 0, Utilities: 0, Marketing: 0, Supplies: 0, Other: 0 },
  );

  const expenses: ExpenseRow[] = [
    { id: "exp-rent", category: "Rent", label: "Studio rent", amount: expenseTotals.Rent, kind: "fixed" },
    { id: "exp-payroll", category: "Payroll", label: "Stylist payroll", amount: expenseTotals.Payroll, kind: "variable" },
    { id: "exp-utilities", category: "Utilities", label: "Electricity & water", amount: expenseTotals.Utilities, kind: "fixed" },
    { id: "exp-marketing", category: "Marketing", label: "Ads & Instagram", amount: expenseTotals.Marketing, kind: "variable" },
    { id: "exp-supplies", category: "Supplies", label: "Salon supplies", amount: expenseTotals.Supplies, kind: "variable" },
    { id: "exp-other", category: "Other", label: "Insurance & misc", amount: expenseTotals.Other, kind: "fixed" },
  ].filter((e) => e.amount > 0);

  return {
    retailProducts,
    monthlyRetail,
    expenses,
    monthlyExpenses,
    totalRetailRevenue,
    totalRetailUnits,
    totalExpenses,
    active: totalRetailRevenue > 0 || totalExpenses > 0,
  };
}

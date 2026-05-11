import rawData from "../../data/market-intelligence.json";

// The bundled dataset is intentionally the default for investor-facing
// surfaces — investor numbers are sensitive and should not change
// silently. To opt into live data (post-import), pass an explicit
// dataset to the `*From()` variants below or call the live equivalents
// from `useLiveFlywheelData()`.
const data = rawData as any;

// ── Types ────────────────────────────────────────────────────────────

export interface CityNode {
  name: string;
  displayName: string;
  records: number;
  revenue: number;
  normalizedActivity: number;
}

export interface MonthlyGrowthPoint {
  label: string;
  dataRecords: number;
  cumulativeRecords: number;
  visits: number;
  services: number;
  grams: number;
  brands: number;
}

export interface FlywheelSummary {
  totalDataPoints: number;
  totalMonths: number;
  totalBrands: number;
  totalSalons: number;
  totalVisits: number;
  totalServices: number;
  totalGrams: number;
  totalRevenue: number;
  dateRange: { from: string; to: string };
  growth: {
    visitsPct: number;
    servicesPct: number;
    recordsPct: number;
    gramsPct: number;
  };
}

// ── Constants ────────────────────────────────────────────────────────

const CITY_DISPLAY: Record<string, string> = {
  tlv: "Tel Aviv",
  "tel aviv": "Tel Aviv",
  krayot: "Krayot",
  "rishon letzion": "Rishon LeZion",
  "beer sheva": "Be'er Sheva",
  ashdod: "Ashdod",
  yokneam: "Yokne'am",
  hertzelia: "Herzliya",
  haifa: "Haifa",
  "hod hasharon": "Hod HaSharon",
  "kfar saba": "Kfar Saba",
  modiin: "Modi'in",
  modim: "Modi'in",
  "petah tikva": "Petah Tikva",
  netanya: "Netanya",
  jerusalem: "Jerusalem",
  raanana: "Ra'anana",
  rehovot: "Rehovot",
};

const SKIP_CITIES = new Set(["team", "unknown", "null", ""]);

// ── Selectors ────────────────────────────────────────────────────────

export function getCityNodesFrom(source: any): CityNode[] {
  const geo = source?.geographicDistribution;
  if (!Array.isArray(geo)) return [];

  const cities: CityNode[] = [];
  for (const region of geo) {
    if (!region.topCities) continue;
    for (const c of region.topCities) {
      const key = (c.city || "").toLowerCase().trim();
      if (SKIP_CITIES.has(key)) continue;
      cities.push({
        name: key,
        displayName: CITY_DISPLAY[key] || c.city,
        records: c.totalServices,
        revenue: c.totalRevenue,
        normalizedActivity: 0,
      });
    }
  }

  const max = Math.max(...cities.map((c) => c.records), 1);
  for (const c of cities) c.normalizedActivity = c.records / max;

  return cities.sort((a, b) => b.records - a.records);
}

export function getMonthlyGrowthFrom(source: any): MonthlyGrowthPoint[] {
  const trends = source?.monthlyTrends;
  if (!Array.isArray(trends)) return [];

  let cum = 0;
  return trends.map((m: any) => {
    cum += m.salonBrandPairs;
    return {
      label: m.label,
      dataRecords: m.salonBrandPairs,
      cumulativeRecords: cum,
      visits: m.totalVisits,
      services: m.totalServices,
      grams: m.totalGrams,
      brands: m.activeBrands,
    };
  });
}

export function getSummaryFrom(source: any): FlywheelSummary {
  const s = source?.summary || {};
  const trends = source?.monthlyTrends;

  const pct = (a: number, b: number) =>
    a > 0 ? Math.round(((b - a) / a) * 100) : 0;

  let visitsPct = 0,
    servicesPct = 0,
    recordsPct = 0,
    gramsPct = 0;

  if (Array.isArray(trends) && trends.length >= 2) {
    const first = trends[0];
    const last = trends[trends.length - 1];
    visitsPct = pct(first.totalVisits, last.totalVisits);
    servicesPct = pct(first.totalServices, last.totalServices);
    recordsPct = pct(first.salonBrandPairs, last.salonBrandPairs);
    gramsPct = pct(first.totalGrams, last.totalGrams);
  }

  return {
    totalDataPoints: s.totalRows || 0,
    totalMonths: s.totalMonths || 0,
    totalBrands: s.totalBrands || 0,
    totalSalons: s.totalCustomers || 0,
    totalVisits: s.totalVisits || 0,
    totalServices: s.totalServices || 0,
    totalGrams: s.totalGrams || 0,
    totalRevenue: s.totalRevenue || 0,
    dateRange: s.dateRange || { from: "", to: "" },
    growth: { visitsPct, servicesPct, recordsPct, gramsPct },
  };
}

export function getTopBrandsFrom(source: any): {
  brand: string;
  services: number;
  grams: number;
  share: number;
}[] {
  const brands = source?.brandPerformance;
  if (!Array.isArray(brands)) return [];
  const totalGrams = brands.reduce(
    (s: number, b: any) => s + (b.totalGrams || 0),
    0,
  );
  return brands.slice(0, 8).map((b: any) => ({
    brand: b.brand,
    services: b.totalServices,
    grams: b.totalGrams,
    share:
      totalGrams > 0 ? Math.round((b.totalGrams / totalGrams) * 1000) / 10 : 0,
  }));
}

// Backwards-compat: parameterless selectors keep using bundled JSON
// so existing investor pages keep displaying audited numbers.
export const getCityNodes = (): CityNode[] => getCityNodesFrom(data);
export const getMonthlyGrowth = (): MonthlyGrowthPoint[] =>
  getMonthlyGrowthFrom(data);
export const getSummary = (): FlywheelSummary => getSummaryFrom(data);
export const getTopBrands = () => getTopBrandsFrom(data);

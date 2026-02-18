import rawData from "../../data/market-intelligence.json";

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

export function getCityNodes(): CityNode[] {
  const geo = data.geographicDistribution;
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

export function getMonthlyGrowth(): MonthlyGrowthPoint[] {
  const trends = data.monthlyTrends;
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

export function getSummary(): FlywheelSummary {
  const s = data.summary;
  const trends = data.monthlyTrends;

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
    totalDataPoints: s.totalRows,
    totalMonths: s.totalMonths,
    totalBrands: s.totalBrands,
    totalSalons: s.totalCustomers,
    totalVisits: s.totalVisits,
    totalServices: s.totalServices,
    totalGrams: s.totalGrams,
    totalRevenue: s.totalRevenue,
    dateRange: s.dateRange,
    growth: { visitsPct, servicesPct, recordsPct, gramsPct },
  };
}

export function getTopBrands(): {
  brand: string;
  services: number;
  grams: number;
  share: number;
}[] {
  const brands = data.brandPerformance;
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

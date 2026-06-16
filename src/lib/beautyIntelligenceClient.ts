/**
 * src/lib/beautyIntelligenceClient.ts
 * ──────────────────────────────────────────────────────────────────────
 * Frontend client for the Beauty Intelligence Dictionary API.
 * Calls /.netlify/functions/beauty-intelligence
 *
 * All requests include the X-Access-Code header (same code as usage-import).
 */

const ACCESS_CODE =
  ((import.meta as any).env?.VITE_USAGE_IMPORT_ACCESS_CODE as string) ||
  "070315";

const FN_BASE = "/.netlify/functions/beauty-intelligence";

// ── Types ────────────────────────────────────────────────────────────────────

export interface InventoryReport {
  neon: NeonInventory | null;
  local: LocalIndex | null;
  summary: InventorySummary;
}

interface NeonInventory {
  source: "neon";
  totalRows: number;
  uniqueBrands: number;
  brandBreakdown: { brand: string; rows: number }[];
  seriesBreakdown: { brand: string; series: string; rows: number }[];
}

interface LocalIndex {
  generatedAt: string;
  sourceEntries: number;
  inventory: {
    totalObservedItems: number;
    totalRows: number;
    totalGramsKg: number;
    uniqueBrands: number;
    uniqueSeries: number;
    uniqueShades: number;
    colorShadesCount: number;
    developerCount: number;
    lightenerCount: number;
    byProductType: Record<string, number>;
  };
  seriesCount: number;
  brandsCount: number;
  needsReviewCount: number;
  references: { label: string; url: string }[];
}

interface InventorySummary {
  source: string;
  totalNeonRows?: number;
  uniqueNeonBrands?: number;
  localObservedItems: number;
  localColorShades: number;
  localDevelopers: number;
  localSeries: number;
  byProductType?: Record<string, number>;
}

export interface BrandRecord {
  brandKey: string;
  brandDisplay: string;
  country: string | null;
  shadeSystem: string | null;
  rows: number;
  grams: number;
  shadeCount: number;
  colorShadeCount: number;
  seriesList: SeriesSummary[];
}

export interface SeriesSummary {
  seriesKey: string;
  seriesRaw: string;
  seriesDisplay: string;
  productType: string;
  isDeveloper: boolean;
  isLightener: boolean;
  rows: number;
  grams: number;
  shadeCount: number;
  primaryMarketCategory: string | null;
}

export interface SeriesIntelligence {
  seriesKey: string;
  brandKey: string;
  brandDisplay: string;
  seriesRaw: string;
  seriesDisplay: string;
  productType: string;
  technology: string | null;
  description: string | null;
  primaryMarketCategory: string | null;
  officialUrl: string | null;
  commonServices: string[];
  isDeveloper: boolean;
  isLightener: boolean;
  isMixed: boolean;
  usage: {
    rows: number;
    grams: number;
    customers: number;
    shadeCount: number;
  };
  topServices: { name: string; count: number }[];
  topShades: {
    shade: string;
    rows: number;
    grams: number;
    marketCategory: string | null;
    level: number | null;
    reflectionPrimary: string | null;
  }[];
  weakShades: string[];
  marketCategories: Record<string, number>;
}

export interface ShadeIntelligence {
  id: string;
  brand: string;
  brandDisplay: string;
  series: string;
  seriesDisplay: string;
  shade: string;
  observedTruth: {
    rows: number;
    grams: number;
    customers: number;
    topServices: { name: string; value: number }[];
  };
  productKnowledge: {
    productType: string;
    productTypeLabel: string;
    technology: string | null;
    seriesDescription: string | null;
    officialUrl: string | null;
  };
  marketClassification: {
    level: number | null;
    levelName: string | null;
    reflectionPrimary: string | null;
    reflectionSecondary: string | null;
    colorFamily: string | null;
    colorFamilyDot: string | null;
    marketCategory: string | null;
    serviceContexts: string[];
    isCC: boolean;
  } | null;
  isDeveloper: boolean;
  isLightener: boolean;
  isColorShade: boolean;
}

export interface MarketCategoryReport {
  category: string;
  totalRows: number;
  totalGrams: number;
  topBrands: { brand: string; rows: number }[];
  topSeries: { series: string; rows: number }[];
  topShades: { shade: string; brand: string; series: string; rows: number }[];
  levelDistribution: Record<string, number>;
}

export interface MarketReports {
  generatedAt: string;
  totalColorRows: number;
  categories: MarketCategoryReport[];
}

// ── API call helper ───────────────────────────────────────────────────────────

async function call<T>(route: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(FN_BASE + "/" + route, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      "X-Access-Code": ACCESS_CODE,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Beauty Intelligence API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const beautyIntelligenceClient = {
  getInventoryReport(): Promise<InventoryReport> {
    return call("inventory-report");
  },

  getBrandDictionary(): Promise<{ generatedAt: string; brands: BrandRecord[] }> {
    return call("brand-dictionary");
  },

  getBrand(slug: string): Promise<BrandRecord> {
    return call("brand-dictionary", { brand: slug });
  },

  getAllSeries(): Promise<{ total: number; series: SeriesIntelligence[] }> {
    return call("series-intelligence");
  },

  getSeriesForBrand(brandSlug: string): Promise<SeriesIntelligence[]> {
    return call("series-intelligence", { brand: brandSlug });
  },

  getShadesIndex(): Promise<{ brandSlugs: string[] }> {
    return call("shade-intelligence");
  },

  getShadesForBrand(
    brandSlug: string,
    opts?: { colorOnly?: boolean; type?: string; category?: string; search?: string }
  ): Promise<{ brand: string; total: number; shades: ShadeIntelligence[] }> {
    return call("shade-intelligence", {
      brand: brandSlug,
      ...(opts?.colorOnly ? { colorOnly: "true" } : {}),
      ...(opts?.type ? { type: opts.type } : {}),
      ...(opts?.category ? { category: opts.category } : {}),
      ...(opts?.search ? { search: opts.search } : {}),
    });
  },

  getMarketReports(): Promise<MarketReports> {
    return call("market-reports");
  },

  getMarketCategory(category: string): Promise<MarketCategoryReport> {
    return call("market-reports", { category });
  },
};

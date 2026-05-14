import rawMarketData from "../../data/market-intelligence.json";

/**
 * Shared investor metrics. Revenue/subscription metrics below remain
 * explicit financial inputs. Product-usage KPIs are derived only from
 * `market-intelligence.json`, which is generated from usage reports.
 */

export interface RevenueMonth {
  month: string;
  israel: number;
  international: number;
}

export const REVENUE_DATA: RevenueMonth[] = [
  { month: "Jan 24", israel: 6548, international: 895 },
  { month: "Feb 24", israel: 5937, international: 260 },
  { month: "Mar 24", israel: 8494, international: 115 },
  { month: "Apr 24", israel: 8079, international: 117 },
  { month: "May 24", israel: 8926, international: 0 },
  { month: "Jun 24", israel: 5769, international: 82 },
  { month: "Jul 24", israel: 5534, international: 1037 },
  { month: "Aug 24", israel: 7846, international: 1078 },
  { month: "Sep 24", israel: 7721, international: 1019 },
  { month: "Oct 24", israel: 6629, international: 1663 },
  { month: "Nov 24", israel: 9069, international: 2549 },
  { month: "Dec 24", israel: 9796, international: 3623 },
  { month: "Jan 25", israel: 7773, international: 2259 },
  { month: "Feb 25", israel: 7519, international: 3876 },
  { month: "Mar 25", israel: 6774, international: 3645 },
  { month: "Apr 25", israel: 6635, international: 5654 },
  { month: "May 25", israel: 7199, international: 5689 },
  { month: "Jun 25", israel: 6629, international: 6828 },
  { month: "Jul 25", israel: 7229, international: 6502 },
  { month: "Aug 25", israel: 7712, international: 6181 },
  { month: "Sep 25", israel: 7524, international: 5617 },
  { month: "Oct 25", israel: 7096, international: 5482 },
  { month: "Nov 25", israel: 7966, international: 6433 },
  { month: "Dec 25", israel: 7190, international: 8443 },
];

export const total2024 = REVENUE_DATA.slice(0, 12).reduce(
  (sum, item) => sum + item.israel + item.international,
  0,
);
export const total2025 = REVENUE_DATA.slice(12).reduce(
  (sum, item) => sum + item.israel + item.international,
  0,
);
export const yoyGrowth = Math.round(((total2025 / total2024) - 1) * 100);

const usageData = rawMarketData as any;
const usageSummary = usageData.summary || {};
const usageTrends: any[] = usageData.monthlyTrends || [];
const usageCustomers: any[] = usageData.customerOverview || [];
const usageSnapshots = usageData.monthlySnapshots || {};

function pctChange(first: number, last: number): number {
  return first > 0 ? Math.round(((last - first) / first) * 100) : 0;
}

function retainedAfterMonths(months: number): number {
  const eligible = usageCustomers.filter((c) => (c.monthsActive || 0) >= 1);
  if (eligible.length === 0) return 0;
  const retained = eligible.filter((c) => (c.monthsActive || 0) >= months).length;
  return Math.round((retained / eligible.length) * 100);
}

const firstTrend = usageTrends[0] || {};
const lastTrend = usageTrends[usageTrends.length - 1] || firstTrend;
const monthlyCustomerCounts = Object.values(usageSnapshots).map(
  (snap: any) => snap.customerCount || 0,
);
const avgMonthlyActive =
  monthlyCustomerCounts.length > 0
    ? Math.round(
        monthlyCustomerCounts.reduce((sum, count) => sum + count, 0) /
          monthlyCustomerCounts.length,
      )
    : 0;
const firstDepth =
  (firstTrend.totalServices || 0) / Math.max(1, firstTrend.salonBrandPairs || 0);
const lastDepth =
  (lastTrend.totalServices || 0) / Math.max(1, lastTrend.salonBrandPairs || 0);

export const PRODUCT_KPI = {
  retentionM1: retainedAfterMonths(1),
  retentionM3: retainedAfterMonths(3),
  retentionM6: retainedAfterMonths(6),

  avgServicesPerAccount:
    usageSummary.totalCustomers > 0
      ? Math.round(usageSummary.totalServices / usageSummary.totalCustomers)
      : 0,
  avgVisitsPerAccount:
    usageSummary.totalCustomers > 0
      ? Math.round(usageSummary.totalVisits / usageSummary.totalCustomers)
      : 0,
  avgGramsPerAccount:
    usageSummary.totalCustomers > 0
      ? Math.round(usageSummary.totalGrams / usageSummary.totalCustomers)
      : 0,

  avgMonthlyActive,
  peakMonthlyActive: Math.max(...monthlyCustomerCounts, 0),
  totalUniqueAccounts: usageSummary.totalCustomers || 0,
  totalBrandsTracked: usageSummary.totalBrands || 0,

  activeGrowthPct: pctChange(firstTrend.salonBrandPairs || 0, lastTrend.salonBrandPairs || 0),
  usageDepthGrowthPct: pctChange(firstDepth, lastDepth),
  servicesGrowthPct: pctChange(firstTrend.totalServices || 0, lastTrend.totalServices || 0),

  avgMonthlyServices:
    usageSummary.totalMonths > 0
      ? Math.round(usageSummary.totalServices / usageSummary.totalMonths)
      : 0,
  avgMonthlyProductValue:
    usageSummary.totalMonths > 0
      ? Math.round(usageSummary.totalRevenue / usageSummary.totalMonths)
      : 0,
} as const;

export const VALIDATION_PILOTS = [
  {
    tag: "B2B",
    title: "Distributor Pilot: 50 Licenses, \u20AC15K",
    detail: "European market, validating B2B channel",
  },
  {
    tag: "L'Or\u00E9al",
    title: "L'Or\u00E9al: Market Intelligence, $5.5K",
    detail: "2025 data license for Israeli market insights",
  },
] as const;

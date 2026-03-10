/**
 * Shared investor metrics — single source of truth for all investor pages.
 *
 * Metrics dictionary:
 *   180+ salons          = active paying salon subscriptions
 *   371 accounts         = total unique accounts (including churned)
 *   14K+ services/month  = rounded from avgMonthlyServices (14,338)
 *   $149K (2025 revenue) = actual calendar-year subscription revenue, NOT ARR
 *   $93K  (2024 revenue) = actual calendar-year subscription revenue
 *   +60% YoY             = (149K - 93K) / 93K
 *   81% / 76% / 70%      = M1 / M3 / M6 cohort retention
 *   $58 / $68 ARPU       = monthly avg revenue per user (intl / Israel)
 *   185 brands           = unique brands tracked
 *   $286K/mo             = USD product value flowing through the platform
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

/**
 * Product usage and retention KPIs.
 * Computed from market-intelligence.json (Aug 2024 - Feb 2026, 19 months).
 * Active cohort only: accounts with >=1 active month and >=15 total services.
 */
export const PRODUCT_KPI = {
  retentionM1: 81,
  retentionM3: 76,
  retentionM6: 70,

  avgServicesPerAccount: 106,
  avgVisitsPerAccount: 89,
  avgGramsPerAccount: 5861,

  avgMonthlyActive: 135,
  peakMonthlyActive: 177,
  totalUniqueAccounts: 371,
  totalBrandsTracked: 185,

  activeGrowthPct: 25,
  usageDepthGrowthPct: -2,
  servicesGrowthPct: 24,

  avgMonthlyServices: 14338,
  avgMonthlyProductValue: 286051,
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

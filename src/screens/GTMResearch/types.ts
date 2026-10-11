/**
 * Shape of src/data/generated/gtm-research.json.
 *
 * Every number in here is computed by scripts/build-gtm-research.js. The screen
 * only formats and arranges it, so if a figure looks wrong the fix belongs in the
 * build script rather than in a component.
 */

export type Lang = "en" | "he";

export type Confidence = "high" | "medium" | "low" | "unknown";

export interface MilestoneMetric {
  eligibleCustomers: number;
  retainedCustomers: number;
  /** 0–1, or null when no customer is old enough to have reached the milestone. */
  retention: number | null;
  revenuePerCustomerIls: number | null;
}

export interface ChannelCampaign {
  id: string;
  label: string;
  labelHe: string;
  windowFrom: string;
  windowTo: string | null;
  requiresManualList: boolean;
  paidCustomers: number;
  spendUsd: number | null;
  spendIsEstimate: boolean | null;
  spendBasis: string | null;
  spendNotes: string | null;
}

export interface Channel {
  id: string;
  order: number;
  label: string;
  labelHe: string;
  description: string;
  descriptionHe: string;
  color: string;
  motion: string;
  scalable: boolean;
  excludeFromSalonKpis: boolean;
  /** True when the channel is real history but its customer list is still manual work. */
  awaitingManualList: boolean;
  campaigns: ChannelCampaign[];
  paidCustomers: number;
  active: number;
  churned: number;
  tooEarly: number;
  activeShare: number | null;
  firstPaidMonth: string | null;
  lastPaidMonth: string | null;
  lifetimeRevenueIls: number;
  lifetimeRevenueUsd: number | null;
  revenuePerCustomerLifetimeIls: number | null;
  currentMrrIls: number;
  currentArrIls: number;
  arrCoveredActiveCustomers: number;
  milestones: { m3: MilestoneMetric; m6: MilestoneMetric; m12: MilestoneMetric };
  revenueCurve: {
    month: number;
    eligibleCustomers: number;
    cumulativeRevenuePerCustomerIls: number;
  }[];
  hasSpendData: boolean;
  spendIsEstimate: boolean | null;
  spendUsd: number | null;
  spendIls: number | null;
  costedCustomers: number | null;
  cacIls: number | null;
  cacUsd: number | null;
  paybackMonths: number | null;
  revenuePerCac: number | null;
  confidenceBreakdown: Record<Confidence, number>;
  regionBreakdown: Record<string, number>;
}

export type CustomerStatus = "active" | "churned" | "too_early_to_tell";

export interface ChannelCustomer {
  customerId: string | null;
  name: string;
  region: string;
  firstPaidMonth: string | null;
  lastPaidMonth: string | null;
  lifetimeRevenueIls: number;
  status: CustomerStatus;
  statusSource: "billing" | "manual";
  monthlyRecurringIls: number | null;
}

export interface CohortRow {
  month: string;
  monthLabel: string;
  newPaidCustomers: number;
  activeNow: number;
  lifetimeRevenueIls: number;
  m3Retention: number | null;
  m6Retention: number | null;
  m12Retention: number | null;
  revenuePerCustomerM6Ils: number | null;
  revenuePerCustomerM12Ils: number | null;
}

export interface GeographyRow {
  paidCustomers: number;
  active: number;
  lifetimeRevenueIls: number;
  m6Retention: number | null;
  revenuePerCustomerM12Ils: number | null;
  channels: { channelId: string; paidCustomers: number }[];
}

export interface GeographyGroup extends GeographyRow {
  id: "IL" | "INTL";
  label: string;
  labelHe: string;
}

export interface GeographyCountry extends GeographyRow {
  region: string;
  confirmed: boolean;
}

export interface TimelineEntry {
  channelId: string;
  label: string;
  labelHe: string;
  color: string;
  scalable: boolean;
  periodLabel: string;
  firstPaidMonth: string | null;
  lastPaidMonth: string | null;
  paidCustomers: number;
  active: number;
  lifetimeRevenueIls: number;
  excludeFromSalonKpis: boolean;
  awaitingManualList: boolean;
}

export interface MonthlyAcquisitionPoint {
  month: string;
  monthLabel: string;
  il: number;
  intl: number;
  total: number;
  byChannel: Record<string, number>;
}

export interface StrategicRevenueStream {
  id: string;
  label: string;
  labelHe?: string;
  kind: "salon" | "distributor" | "brand";
  channelId: string | null;
  region: string | null;
  firstPaidMonth: string | null;
  lastPaidMonth: string | null;
  revenueIls: number;
  revenueUsd: number | null;
  note: string;
  noteHe?: string;
  inSummitBilling: boolean;
}

export interface ReviewItem {
  customerId: string | null;
  name: string;
  firstPaidMonth: string | null;
  lifetimeRevenueIls: number;
  issue: "no_channel" | "no_country" | "possible_schwarzkopf";
  detail: string;
}

export interface DataGap {
  id: string;
  severity: "open" | "caution" | "scope";
  title: string;
  titleHe: string;
  detail: string;
  detailHe: string;
  affectedCustomers: number | null;
}

export interface Insight {
  id: string;
  kind: "evidence" | "insight" | "risk" | "strategy" | "caveat";
  title: string;
  titleHe: string;
  text: string;
  textHe: string | null;
  channelId: string | null;
}

export interface GtmResearchDataset {
  _generated: string;
  _stage: string;
  _source: string;
  fxIlsPerUsd: number;
  milestones: number[];
  reportingWindow: {
    firstMonth: string;
    latestMonth: string;
    recentMonths: string[];
    minMonthsToJudgeRetention: number;
  };
  totals: {
    paidCustomers: number;
    salonCustomers: number;
    active: number;
    churned: number;
    tooEarly: number;
    salonRevenueIls: number;
    salonRevenueUsd: number | null;
    strategicRevenueIls: number;
    strategicRevenueUsd: number | null;
    unattributedCustomers: number;
    unattributedRevenueIls: number;
    totalRevenueIls: number;
    totalRevenueUsd: number | null;
    activeShare: number | null;
  };
  highlights: {
    highestVolume: string | null;
    bestScalable: string | null;
    bestRetention: string | null;
    worstRetention: string | null;
    lowestCac: string | null;
    minCohortForHighlight: number;
  };
  timeline: TimelineEntry[];
  channels: Channel[];
  channelCustomers: Record<string, ChannelCustomer[]>;
  cohorts: Record<string, CohortRow[]>;
  geography: { groups: GeographyGroup[]; countries: GeographyCountry[] };
  monthlyAcquisition: MonthlyAcquisitionPoint[];
  strategicRevenue: StrategicRevenueStream[];
  dataQuality: {
    attribution: {
      counts: Record<Confidence, number>;
      total: number;
      highMediumShare: number | null;
    };
    region: {
      confirmed: number;
      inferred: number;
      unknown: number;
      total: number;
      confirmedShare: number | null;
      inferredShare: number | null;
      unknownShare: number | null;
      sources: Record<string, number>;
    };
    reviewQueue: ReviewItem[];
    reviewCounts: Record<string, number>;
    gaps: DataGap[];
  };
  insights: Insight[];
}

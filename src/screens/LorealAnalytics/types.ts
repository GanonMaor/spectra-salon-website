// ── Analytics Domain Types ──────────────────────────────────────────

export const ANALYTICS_API = "/.netlify/functions/loreal-analytics";

// ── Quality Configuration ───────────────────────────────────────────

/**
 * Configurable quality scoring thresholds — do NOT hard-code these in UI.
 * Each population can carry its own QualityConfig.
 */
export interface QualityConfig {
  presenceWeight: number;        // fraction 0–1, weight of presence score
  consistencyWeight: number;     // fraction 0–1, weight of consistency score
  goodDeviationPct: number;      // max month-over-month deviation for "consistent" (e.g. 0.30 = 30%)
  partialDeviationPct: number;   // max deviation for partial credit (e.g. 0.60 = 60%)
  partialCreditFraction: number; // credit awarded when deviation is between good and partial
  lowCreditFraction: number;     // credit awarded when deviation exceeds partial threshold
  greenMinScore: number;         // minimum score (0–100) to receive green badge
  amberMinScore: number;         // minimum score (0–100) to receive amber badge
}

export const DEFAULT_QUALITY_CONFIG: QualityConfig = {
  presenceWeight: 0.6,
  consistencyWeight: 0.4,
  goodDeviationPct: 0.30,
  partialDeviationPct: 0.60,
  partialCreditFraction: 0.5,
  lowCreditFraction: 0.2,
  greenMinScore: 80,
  amberMinScore: 50,
};

export type QualityColor = "gray" | "red" | "amber" | "green" | "blue";

export interface QualityScore {
  score: number;           // 0–100
  color: QualityColor;
  presenceRatio: number;   // 0–1
  consistencyRatio: number; // 0–1
  activeMonths: number;
  totalPossibleMonths: number;
}

export const QUALITY_COLOR_CLASSES: Record<
  QualityColor,
  { bg: string; text: string; border: string; dot: string; label: string }
> = {
  gray:  { bg: "bg-gray-100",    text: "text-gray-500",    border: "border-gray-200",    dot: "bg-gray-400",    label: "לא מוערך" },
  red:   { bg: "bg-red-50",      text: "text-red-600",     border: "border-red-200",     dot: "bg-red-400",     label: "שימוש חלש" },
  amber: { bg: "bg-amber-50",    text: "text-amber-600",   border: "border-amber-200",   dot: "bg-amber-400",   label: "חלקי / לא יציב" },
  green: { bg: "bg-emerald-50",  text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-500", label: "יציב / חזק" },
  blue:  { bg: "bg-blue-50",     text: "text-blue-600",    border: "border-blue-200",    dot: "bg-blue-400",    label: "מקובע ידנית" },
};

// ── Filter Model ────────────────────────────────────────────────────

/**
 * Saved filter object for a תא ניתוח.
 * Inclusion lists act as whitelists (empty = include all).
 * Exclusion lists act as blacklists.
 */
export interface AnalyticsFilter {
  companiesIncluded: string[];   // e.g. ["L'Oréal Groupe", "Wella Company"]
  companiesExcluded: string[];
  brandsIncluded: string[];
  brandsExcluded: string[];
  seriesIncluded: string[];      // series preset IDs e.g. ["igora", "koleston"]
  serviceTypesIncluded: string[]; // ["Color", "Highlights", "Toner", "Straightening", "Others"]
}

export const EMPTY_FILTER: AnalyticsFilter = {
  companiesIncluded: [],
  companiesExcluded: [],
  brandsIncluded: [],
  brandsExcluded: [],
  seriesIncluded: [],
  serviceTypesIncluded: [],
};

export type MembershipMode = "manual" | "rule" | "hybrid";

// ── Population (אוכלוסייה) ──────────────────────────────────────────

export interface Population {
  id: number;
  name: string;
  description: string | null;
  membership_mode: MembershipMode;
  eligibility_window_start: string | null; // month label e.g. "Jan 2024"
  eligibility_window_end: string | null;   // month label e.g. "Jan 2025"
  quality_config: Partial<QualityConfig>;
  source: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

// ── Analysis Cell (תא ניתוח) ────────────────────────────────────────

export interface AnalysisCell {
  id: number;
  name: string;
  description: string | null;
  population_id: number | null;
  population_name: string | null;
  period_a_start: string | null; // month label
  period_a_end: string | null;
  period_b_start: string | null;
  period_b_end: string | null;
  filters: AnalyticsFilter;
  metrics_visible: string[];
  notes: string | null;
  source: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

// ── Cell Computation Results ────────────────────────────────────────

export interface PeriodResult {
  services: number;
  visits: number;
  grams: number;
  revenue: number;
  color: number;
  highlights: number;
  toner: number;
  straightening: number;
  others: number;
  activeUsers: number;
}

export interface CellResult {
  cell: AnalysisCell;
  memberCount: number;
  periodA: PeriodResult;
  periodB: PeriodResult;
}

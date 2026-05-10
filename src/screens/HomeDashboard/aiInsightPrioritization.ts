/**
 * Context-aware ordering for AI insights on the Home dashboard.
 *
 * The selector layer (`selectAIInsights`) decides *what* the system
 * has to say. This module decides *which one comes first* given the
 * user's recent behavior and time of day. It is pure, deterministic,
 * and never mutates inputs — running it twice with the same arguments
 * always returns the same order.
 *
 * Rules in priority order:
 *   1. Any `high` severity insight wins the first slot.
 *   2. If the user just visited or interacted with a related area
 *      (inventory, schedule, staff, customers, analytics), bump
 *      matching insights up — but never above a high severity one.
 *   3. With no critical issues, prefer opportunity-style insights:
 *      revenue, performance, and mix optimization.
 *   4. Use `lastPresentedInsightId` only as a tie-breaker so the same
 *      low-priority card doesn't feel stuck across re-renders.
 *
 * No randomness, ever.
 */

import type {
  AIInsight,
  AIInsightSeverity,
  AIInsightType,
} from "../SalonCRM/data/crmSelectors";

export type InsightPageKey =
  | "home"
  | "schedule"
  | "customers"
  | "inventory"
  | "staff"
  | "analytics";

export type InsightActionKey =
  | "inventory.update"
  | "appointment.create"
  | "appointment.update"
  | "appointment.delete"
  | "visit.complete"
  | "mix.simulate"
  | string;

export interface RecentAction {
  type: InsightActionKey;
  timestamp: number;
}

export type InsightTimeOfDay = "morning" | "midday" | "afternoon" | "evening";

export interface InsightContext {
  /** The page the user was on most recently before Home. */
  lastVisitedPage?: InsightPageKey;
  /** Recent CRM actions, newest last. */
  recentActions?: RecentAction[];
  /** Coarse time bucket for soft tie-breaking. */
  timeOfDay: InsightTimeOfDay;
  /** Last insight surfaced as the first card, if any. */
  lastPresentedInsightId?: string;
}

const SEVERITY_RANK: Record<AIInsightSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const PAGE_TO_TYPES: Record<InsightPageKey, AIInsightType[]> = {
  home: [],
  schedule: ["performance"],
  customers: ["revenue"],
  inventory: ["inventory"],
  staff: ["performance"],
  analytics: ["revenue", "performance", "mix"],
};

const ACTION_TO_TYPES: Record<string, AIInsightType[]> = {
  "inventory.update": ["inventory"],
  "appointment.create": ["performance"],
  "appointment.update": ["performance"],
  "appointment.delete": ["performance"],
  "visit.complete": ["performance", "mix"],
  "mix.simulate": ["mix"],
  "mix.complete": ["mix"],
};

const TIME_OF_DAY_BIAS: Record<InsightTimeOfDay, AIInsightType[]> = {
  morning: ["inventory", "performance"],
  midday: ["performance", "mix"],
  afternoon: ["mix", "revenue"],
  evening: ["revenue", "performance"],
};

const TYPE_TIE_BREAK: Record<AIInsightType, number> = {
  inventory: 0,
  mix: 1,
  performance: 2,
  revenue: 3,
};

const RECENCY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes counts as "recent"

/**
 * Build a context-aware ordering of insights. The first item is the
 * one that will surface in the carousel; the rest follow the same
 * scoring so swiping forward still feels intentional.
 */
export function getPrioritizedInsights(
  insights: AIInsight[],
  context: InsightContext,
): AIInsight[] {
  if (insights.length === 0) return [];

  const recentTypes = collectRecentInteractionTypes(context);
  const timeBias = TIME_OF_DAY_BIAS[context.timeOfDay] ?? [];

  const scored = insights.map((insight, index) => ({
    insight,
    index,
    score: scoreInsight(insight, recentTypes, timeBias, context.lastPresentedInsightId),
  }));

  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    // Stable tie-break by original selector order so output is deterministic.
    return a.index - b.index;
  });

  return scored.map((s) => s.insight);
}

/**
 * Empty-state copy used by the carousel when no insights exist.
 *
 * Intentionally calm and short — no fake urgency, just a friendly
 * nudge that Alice is available.
 */
export const EMPTY_STATE_INSIGHT: AIInsight = {
  id: "alice-empty-state",
  type: "performance",
  severity: "low",
  title: "Everything looks good today.",
  description: "Want help improving your schedule or revenue?",
  ctaPrimary: { label: "Ask Alice", actionKey: "alice.focusInput" },
};

/**
 * Pick the insight that should occupy the leading slot. Pure helper
 * for callers that only need the head — same ordering as
 * `getPrioritizedInsights(...)[0]` but cheaper.
 */
export function pickLeadInsight(
  insights: AIInsight[],
  context: InsightContext,
): AIInsight | null {
  const ordered = getPrioritizedInsights(insights, context);
  return ordered[0] ?? null;
}

// ── Internals ────────────────────────────────────────────────────

function collectRecentInteractionTypes(context: InsightContext): Set<AIInsightType> {
  const out = new Set<AIInsightType>();

  if (context.lastVisitedPage) {
    for (const t of PAGE_TO_TYPES[context.lastVisitedPage]) out.add(t);
  }

  const now = Date.now();
  for (const a of context.recentActions ?? []) {
    if (now - a.timestamp > RECENCY_WINDOW_MS) continue;
    const types = ACTION_TO_TYPES[a.type];
    if (!types) continue;
    for (const t of types) out.add(t);
  }

  return out;
}

/**
 * Lower score = higher priority (sorted ascending).
 *
 * Layout of the score:
 *   [severity * 1000]
 *   + [recency boost (0 if recent, 100 otherwise)]
 *   + [time-of-day bias (0..30)]
 *   + [type tie-break (0..3)]
 *   + [last-presented penalty (0 or 1)]
 *
 * High severity dominates; recency only re-orders within a band; the
 * `lastPresentedInsightId` only matters as a final tie-breaker.
 */
function scoreInsight(
  insight: AIInsight,
  recentTypes: Set<AIInsightType>,
  timeBias: AIInsightType[],
  lastPresentedInsightId: string | undefined,
): number {
  const severity = SEVERITY_RANK[insight.severity] * 1000;
  const recencyBoost = recentTypes.has(insight.type) ? 0 : 100;

  let timeBiasScore = 30;
  const biasIdx = timeBias.indexOf(insight.type);
  if (biasIdx >= 0) timeBiasScore = biasIdx * 10;

  const tieBreak = TYPE_TIE_BREAK[insight.type];
  const repeatPenalty = insight.id === lastPresentedInsightId ? 1 : 0;

  return severity + recencyBoost + timeBiasScore + tieBreak + repeatPenalty;
}

/**
 * Convenience helper to convert a `Date` (or now) into the coarse
 * `timeOfDay` bucket consumed by the prioritizer.
 */
export function resolveTimeOfDay(date: Date = new Date()): InsightTimeOfDay {
  const h = date.getHours();
  if (h < 11) return "morning";
  if (h < 14) return "midday";
  if (h < 18) return "afternoon";
  return "evening";
}

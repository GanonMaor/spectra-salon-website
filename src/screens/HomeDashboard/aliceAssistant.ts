/**
 * Alice — the home assistant helper.
 *
 * This module is a thin, pure decision layer that turns user input or
 * a proactive trigger into an `AIResponse` ready for the UI. It never
 * holds component state and never imports React. It does, however,
 * call into the CRM AI engine (`runScheduleCommand`) when the user
 * speaks in scheduling commands, and it leans on the canonical CRM
 * selectors for everything else.
 *
 * Tone is intentional, not cosmetic — every response goes through
 * short, supportive copy. No "Based on your data..." preambles.
 */

import {
  describeAIStatus,
  runScheduleCommand,
  type AICommandResult,
} from "../SalonCRM/data/crmAIEngine";
import {
  selectInventoryHealthScore,
  selectLowStockItems,
  selectReweighEfficiency,
  selectStaffPerformance,
  type AIInsight,
} from "../SalonCRM/data/crmSelectors";
import type { CRMActions } from "../SalonCRM/data/crmHooks";
import type { CRMNormalizedState } from "../SalonCRM/data/crmTypes";

// ── Tone & response types ───────────────────────────────────────

/**
 * The fixed personality contract Alice never breaks.
 * Used as a static reference for prompt generation and tests.
 */
export const ALICE_TONE = {
  warmth: "warm",
  brevity: "short",
  style: "supportive",
  robotic: false,
  chatty: false,
} as const;

export type AliceTone = typeof ALICE_TONE;

export type AliceActionKey =
  | "navigate.inventory"
  | "navigate.schedule"
  | "navigate.staff"
  | "navigate.customers"
  | "navigate.analytics"
  | "alice.dismiss"
  | "alice.focusInput";

export interface AliceActionDescriptor {
  label: string;
  actionKey: AliceActionKey | string;
  payload?: Record<string, unknown>;
  /** Marks the primary CTA so the UI can style it differently. */
  primary?: boolean;
}

export type AliceResponseTone = "answer" | "confirm" | "clarify" | "fail";

export interface AIResponse {
  message: string;
  tone: AliceResponseTone;
  /** Optional CTAs — keep to one primary, optional secondary. */
  actions?: AliceActionDescriptor[];
  /** Insights surfaced as supporting context. */
  insights?: AIInsight[];
  /** Short follow-up confirmation after Alice triggered an action. */
  confirmation?: string;
}

export type AliceSuggestionKey =
  | "optimizeSchedule"
  | "showLowStock"
  | "topStylistToday";

export interface AliceSuggestion {
  key: AliceSuggestionKey;
  label: string;
}

export const ALICE_SUGGESTIONS: AliceSuggestion[] = [
  { key: "optimizeSchedule", label: "Optimize schedule" },
  { key: "showLowStock", label: "Show low stock" },
  { key: "topStylistToday", label: "Top stylist today" },
];

// ── Public entry points ─────────────────────────────────────────

/**
 * Resolve a free-text user input into an `AIResponse`.
 *
 * Routing rules:
 *   1. Empty / whitespace input → clarify, no action.
 *   2. Looks like a schedule command (move/cancel/assign/...): hand
 *      off to `runScheduleCommand` and translate the result to the
 *      Alice response shape.
 *   3. Otherwise: try to answer locally via selectors.
 */
export function respondToUserInput(
  rawInput: string,
  state: CRMNormalizedState,
  actions: CRMActions,
): AIResponse {
  const input = (rawInput ?? "").trim();
  if (!input) {
    return clarify("Tell me what you'd like to do — schedule, inventory, or revenue?");
  }

  if (looksLikeScheduleCommand(input)) {
    const result = runScheduleCommand(input, state, actions);
    return aliceFromCommandResult(result);
  }

  const lower = input.toLowerCase();
  if (lower.includes("low stock") || lower.includes("inventory")) {
    return respondToSuggestion("showLowStock", state);
  }
  if (lower.includes("top stylist") || lower.includes("best stylist")) {
    return respondToSuggestion("topStylistToday", state);
  }
  if (lower.includes("optimi")) {
    return respondToSuggestion("optimizeSchedule", state);
  }

  return clarify(
    "I can help with schedule, inventory, or stylist performance. Try \"show low stock\" or \"move Lisa to 15:00\".",
  );
}

/** Resolve a suggestion chip tap into an `AIResponse`. */
export function respondToSuggestion(
  key: AliceSuggestionKey,
  state: CRMNormalizedState,
): AIResponse {
  switch (key) {
    case "showLowStock": return buildLowStockResponse(state);
    case "topStylistToday": return buildTopStylistResponse(state);
    case "optimizeSchedule": return buildOptimizeScheduleResponse(state);
  }
}

/**
 * Wrap an `ActionResult` from a CRM action that Alice triggered.
 * Always confirms the outcome — never claims success on failure.
 */
export function summarizeActionOutcome(
  actionLabel: string,
  result: { ok: true } | { ok: false; error: { message: string } },
): AIResponse {
  if (result.ok) {
    return {
      message: `Done. ${actionLabel}.`,
      tone: "confirm",
    };
  }
  return {
    message: `I couldn't ${actionLabel.toLowerCase()} yet.`,
    tone: "fail",
    confirmation: result.error.message,
  };
}

// ── Local selector-driven answers ───────────────────────────────

function buildLowStockResponse(state: CRMNormalizedState): AIResponse {
  const items = selectLowStockItems(state);
  const health = selectInventoryHealthScore(state);
  if (items.length === 0) {
    return {
      message: `Inventory looks healthy — ${health}% of items above minimum.`,
      tone: "answer",
      actions: [
        { label: "Open inventory", actionKey: "navigate.inventory", primary: true },
      ],
    };
  }
  const top = items[0];
  const productLabel = top.product.displayName ?? top.product.shadeCode;
  const extra = items.length > 1 ? ` and ${items.length - 1} other${items.length > 2 ? "s" : ""}` : "";
  return {
    message: `${productLabel} is low${extra}. Want me to open inventory?`,
    tone: "answer",
    actions: [
      { label: "Open inventory", actionKey: "navigate.inventory", primary: true },
    ],
  };
}

function buildTopStylistResponse(state: CRMNormalizedState): AIResponse {
  const perf = selectStaffPerformance(state);
  if (perf.length === 0) {
    return clarify("I don't have stylist performance yet for this period.");
  }
  const top = [...perf].sort((a, b) => b.utilizationPct - a.utilizationPct)[0];
  return {
    message: `${top.staff.name} is leading at ${top.utilizationPct}% utilization.`,
    tone: "answer",
    actions: [
      { label: "View staff", actionKey: "navigate.staff", primary: true },
    ],
  };
}

function buildOptimizeScheduleResponse(state: CRMNormalizedState): AIResponse {
  const reweigh = selectReweighEfficiency(state);
  if (reweigh.totalMixes >= 4 && reweigh.reweighPct < 40) {
    return {
      message: `Reweigh is at ${reweigh.reweighPct}%. Tighten color services to free up time.`,
      tone: "answer",
      actions: [
        { label: "Open schedule", actionKey: "navigate.schedule", primary: true },
      ],
    };
  }
  return {
    message: "Schedule looks balanced. Want me to open it so you can shuffle a slot?",
    tone: "answer",
    actions: [
      { label: "Open schedule", actionKey: "navigate.schedule", primary: true },
    ],
  };
}

// ── Command bridge ──────────────────────────────────────────────

const SCHEDULE_VERBS = [
  "move", "cancel", "create", "assign", "complete", "book", "reschedule", "schedule", "add", "remove", "delete",
];

function looksLikeScheduleCommand(input: string): boolean {
  const lower = input.toLowerCase();
  return SCHEDULE_VERBS.some((v) => lower.startsWith(v + " ") || lower === v);
}

function aliceFromCommandResult(result: AICommandResult): AIResponse {
  const status = describeAIStatus(result);
  switch (status.type) {
    case "success":
      return {
        message: shorten(status.message),
        tone: "confirm",
      };
    case "clarify":
      return {
        message: shorten(status.message),
        tone: "clarify",
      };
    case "error":
    default:
      return {
        message: shorten(status.message),
        tone: "fail",
      };
  }
}

// ── Tone helpers ────────────────────────────────────────────────

function clarify(message: string): AIResponse {
  return { message, tone: "clarify" };
}

/**
 * Trim verbose AI engine messages down to the brevity Alice expects.
 *
 * Hard cap at ~140 characters; anything longer would feel like a
 * generic answer rather than a salon-floor response.
 */
function shorten(message: string): string {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 140) return cleaned;
  return cleaned.slice(0, 137).trimEnd() + "...";
}

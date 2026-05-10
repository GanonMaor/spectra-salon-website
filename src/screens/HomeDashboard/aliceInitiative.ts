/**
 * Alice initiative — when (and what) Alice surfaces unprompted.
 *
 * Alice should feel like a colleague who occasionally taps you on
 * the shoulder, not a popup that fires on every state change. This
 * module is the gatekeeper:
 *
 *   - Hard cap: at most one proactive message per session.
 *   - Suppressed while the user is typing or focused on Alice.
 *   - Suppressed while a user-requested response is already shown.
 *   - Triggered by high-severity insights, important CRM actions, or
 *     fresh high-severity signals after state changes.
 *
 * The decision function is pure. The session counter lives in module
 * scope so it survives across renders within the same Home mount but
 * resets on full reload — exactly the cadence we want.
 */

import type {
  AIInsight,
  AIInsightSeverity,
  AIInsightType,
} from "../SalonCRM/data/crmSelectors";
import type { AIResponse, AliceActionDescriptor } from "./aliceAssistant";

// ── Session guard ───────────────────────────────────────────────

let proactiveShown = false;

/** True if Alice has already spoken proactively in this session. */
export function hasShownProactiveAlice(): boolean {
  return proactiveShown;
}

/** Mark the proactive slot as used. Idempotent. */
export function markProactiveAliceShown(): void {
  proactiveShown = true;
}

/** Reset the session guard. Intended for tests only. */
export function resetProactiveAliceForTests(): void {
  proactiveShown = false;
}

// ── Trigger context ─────────────────────────────────────────────

export type AliceInitiativeReason =
  | "page_load_high_severity"
  | "post_action_followup"
  | "new_high_severity_insight";

export interface RecentActionTrace {
  type: string;
  timestamp: number;
}

export interface ProactiveContext {
  /** Sorted insights from `getPrioritizedInsights`. */
  insights: AIInsight[];
  /** True if user is typing or has focused Alice's input. */
  isInputFocused: boolean;
  /** True if the assistant bar already shows a user-requested response. */
  hasActiveResponse: boolean;
  /** Last few CRM action traces, newest last. */
  recentActions?: RecentActionTrace[];
  /** Used to bias copy. Same buckets as the prioritizer. */
  timeOfDay?: "morning" | "midday" | "afternoon" | "evening";
}

const ACTION_FOLLOWUP_TYPES = new Set<string>([
  "inventory.update",
  "appointment.create",
  "appointment.update",
  "appointment.delete",
  "visit.complete",
]);

const FOLLOWUP_WINDOW_MS = 60 * 1000;

// ── Decision function ───────────────────────────────────────────

/**
 * Decide what (if anything) Alice should say without being asked.
 *
 * Returns `null` to mean "stay quiet". Callers should treat the
 * returned response as one-shot — call `markProactiveAliceShown()`
 * the moment the message becomes visible.
 */
export function decideProactiveResponse(
  context: ProactiveContext,
): { response: AIResponse; reason: AliceInitiativeReason } | null {
  if (proactiveShown) return null;
  if (context.isInputFocused) return null;
  if (context.hasActiveResponse) return null;

  const highSeverity = context.insights.find((i) => i.severity === "high");

  if (highSeverity) {
    return {
      reason: "page_load_high_severity",
      response: copyForInsight(highSeverity, "page_load_high_severity"),
    };
  }

  const followupAction = findRecentImportantAction(context.recentActions);
  if (followupAction) {
    const related = pickInsightForActionType(context.insights, followupAction.type);
    if (related) {
      return {
        reason: "post_action_followup",
        response: copyForInsight(related, "post_action_followup"),
      };
    }
  }

  return null;
}

// ── Internals ───────────────────────────────────────────────────

function findRecentImportantAction(
  actions: RecentActionTrace[] | undefined,
): RecentActionTrace | null {
  if (!actions || actions.length === 0) return null;
  const cutoff = Date.now() - FOLLOWUP_WINDOW_MS;
  for (let i = actions.length - 1; i >= 0; i -= 1) {
    const a = actions[i];
    if (a.timestamp < cutoff) continue;
    if (ACTION_FOLLOWUP_TYPES.has(a.type)) return a;
  }
  return null;
}

function pickInsightForActionType(
  insights: AIInsight[],
  actionType: string,
): AIInsight | null {
  const desired = inferTypeFromAction(actionType);
  if (!desired) return null;
  return insights.find((i) => i.type === desired) ?? null;
}

function inferTypeFromAction(actionType: string): AIInsightType | null {
  if (actionType.startsWith("inventory.")) return "inventory";
  if (actionType.startsWith("appointment.")) return "performance";
  if (actionType === "visit.complete") return "mix";
  return null;
}

function copyForInsight(
  insight: AIInsight,
  reason: AliceInitiativeReason,
): AIResponse {
  const message = phraseProactive(insight, reason);
  const actions: AliceActionDescriptor[] = [];

  const primary = insight.ctaPrimary;
  if (primary) {
    actions.push({
      label: primary.label,
      actionKey: actionKeyForInsightCta(insight, primary.actionKey),
      payload: primary.payload,
      primary: true,
    });
  }
  actions.push({ label: "Not now", actionKey: "alice.dismiss" });

  return {
    message,
    tone: insight.severity === "high" ? "answer" : "confirm",
    actions,
  };
}

function phraseProactive(
  insight: AIInsight,
  reason: AliceInitiativeReason,
): string {
  const base = severitySignal(insight.severity, insight.type, insight.title);
  if (reason === "page_load_high_severity") return base;
  if (reason === "new_high_severity_insight") return `Heads up — ${base.toLowerCase()}`;
  // Post-action follow-up — soft tone.
  return `Just noticed: ${base.toLowerCase()}`;
}

function severitySignal(
  severity: AIInsightSeverity,
  type: AIInsightType,
  title: string,
): string {
  switch (type) {
    case "inventory":
      return severity === "high"
        ? `${title}. Want me to open inventory?`
        : `${title}. Want a quick look?`;
    case "performance":
      return severity === "high"
        ? `${title}. Want me to open the schedule?`
        : `${title}. Want me to surface them in the next pass?`;
    case "revenue":
      return `${title}. Want to review analytics?`;
    case "mix":
      return severity === "high"
        ? `${title}. Want to review mixes?`
        : `${title}. Want to see the savings detail?`;
  }
}

function actionKeyForInsightCta(insight: AIInsight, ctaActionKey: string): string {
  // Prefer a navigation key the host already maps. Fall back to whatever the
  // insight emitted so unmapped CTAs still flow through `onAction`.
  switch (insight.type) {
    case "inventory": return "navigate.inventory";
    case "performance": return "navigate.schedule";
    case "revenue": return "navigate.analytics";
    case "mix": return "navigate.analytics";
    default: return ctaActionKey;
  }
}

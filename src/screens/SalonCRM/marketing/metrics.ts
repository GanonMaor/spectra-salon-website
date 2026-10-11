/**
 * Owner-facing numbers. "Sent" and "delivered" are stages of the same
 * messages, never added together. Period activity is separate from future
 * (pending) messages, and estimated cost is labelled apart from actual cost.
 */

import { isPending, marketingSpendForMonth } from "./engine";
import { addDays, isBefore, isOnOrBefore } from "./time";
import type { AutomationKind, MarketingState, ScheduledMessage, SmsSettings } from "./types";

export interface PeriodMetrics {
  /** Handed to the provider during the period (includes later delivered/failed). */
  sent: number;
  /** Of `sent`, confirmed delivered. */
  delivered: number;
  /** Of `sent`, still waiting for a receipt or an unknown result. */
  awaiting: number;
  /** Failed in the period (provider rejected or not delivered). */
  failed: number;
  /** Stopped before sending (consent, missing data, irrelevant...). */
  notSent: number;
  segments: number;
  actualCostCents: number;
  /** Cost of sent messages without a final provider price yet. */
  estimatedPendingCostCents: number;
}

export interface FutureMetrics {
  scheduled: number;
  deferred: number;
  paused: number;
  estimatedCostCents: number;
  next?: ScheduledMessage;
}

function inPeriod(iso: string | undefined, from: string, to: string): boolean {
  return Boolean(iso && isOnOrBefore(from, iso) && isOnOrBefore(iso, to));
}

/** `period` is a number of days back from `now`, or an explicit start. */
export function periodMetrics(
  messages: ScheduledMessage[],
  now: string,
  period: number | { from: string },
  kind?: AutomationKind,
): PeriodMetrics {
  const from = typeof period === "number" ? addDays(now, -period) : period.from;
  const scoped = messages.filter((message) => !message.isTest && (!kind || message.automation === kind));
  const result: PeriodMetrics = {
    sent: 0,
    delivered: 0,
    awaiting: 0,
    failed: 0,
    notSent: 0,
    segments: 0,
    actualCostCents: 0,
    estimatedPendingCostCents: 0,
  };
  for (const message of scoped) {
    if (inPeriod(message.sentAt, from, now)) {
      result.sent += 1;
      result.segments += message.segments ?? 0;
      if (message.status === "delivered") result.delivered += 1;
      if (message.status === "sent" || message.status === "unknown") result.awaiting += 1;
      if (message.actualCostCents !== undefined) result.actualCostCents += message.actualCostCents;
      else result.estimatedPendingCostCents += message.estimatedCostCents ?? 0;
    }
    if (message.status === "failed" && inPeriod(message.failedAt, from, now)) result.failed += 1;
    if ((message.status === "skipped" || message.status === "cancelled") && message.reason !== "merged_into") {
      if (inPeriod(message.updatedAt, from, now)) result.notSent += 1;
    }
  }
  return result;
}

export function futureMetrics(messages: ScheduledMessage[], now: string, kind?: AutomationKind): FutureMetrics {
  const pending = messages
    .filter((message) => !message.isTest && isPending(message.status) && (!kind || message.automation === kind))
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  return {
    scheduled: pending.filter((message) => message.status === "scheduled").length,
    deferred: pending.filter((message) => message.status === "deferred").length,
    paused: pending.filter((message) => message.status === "paused").length,
    estimatedCostCents: pending.reduce((sum, message) => sum + (message.estimatedCostCents ?? 0), 0),
    next: pending.find((message) => !isBefore(message.scheduledFor, now)) ?? pending[0],
  };
}

export type AlertKind =
  | "sms_not_connected"
  | "budget_paused"
  | "budget_near_limit"
  | "failed_recent"
  | "unknown_pending"
  | "missing_variables"
  | "drafts_unpublished"
  | "rebooking_off"
  | "consent_gaps";

export interface MarketingAlert {
  kind: AlertKind;
  level: "critical" | "warning" | "info";
  count?: number;
  percent?: number;
  automation?: AutomationKind;
}

export function budgetUsage(messages: ScheduledMessage[], settings: SmsSettings, now: string): {
  spentCents: number;
  percent: number;
} {
  const spentCents = marketingSpendForMonth(messages, settings, now);
  const percent = settings.monthlyMarketingBudgetCents > 0
    ? Math.round((spentCents / settings.monthlyMarketingBudgetCents) * 100)
    : 0;
  return { spentCents, percent };
}

export function buildAlerts(state: MarketingState, messages: ScheduledMessage[], now: string): MarketingAlert[] {
  const alerts: MarketingAlert[] = [];
  const real = messages.filter((message) => !message.isTest);
  if (state.settings.connection !== "connected") alerts.push({ kind: "sms_not_connected", level: "critical" });

  const paused = real.filter((message) => message.status === "paused" && message.reason === "budget_cap").length;
  if (paused) alerts.push({ kind: "budget_paused", level: "critical", count: paused });
  else {
    const usage = budgetUsage(real, state.settings, now);
    if (usage.percent >= state.settings.budgetAlertPercent) {
      alerts.push({ kind: "budget_near_limit", level: "warning", percent: usage.percent });
    }
  }

  const weekAgo = addDays(now, -7);
  const failed = real.filter((message) => message.status === "failed" && message.failedAt && isBefore(weekAgo, message.failedAt)).length;
  if (failed) alerts.push({ kind: "failed_recent", level: "warning", count: failed });

  const unknown = real.filter((message) => message.status === "unknown").length;
  if (unknown) alerts.push({ kind: "unknown_pending", level: "info", count: unknown });

  const missing = real.filter(
    (message) => message.status === "skipped" && message.reason === "missing_variable" && isBefore(weekAgo, message.updatedAt),
  ).length;
  if (missing) alerts.push({ kind: "missing_variables", level: "warning", count: missing });

  const drafts = Object.values(state.automations).filter((automation) => automation.draft).length;
  if (drafts) alerts.push({ kind: "drafts_unpublished", level: "info", count: drafts });

  const rebooking = state.automations.rebooking_invite;
  if (!rebooking.enabled) alerts.push({ kind: "rebooking_off", level: "info", automation: "rebooking_invite" });

  const consentGaps = real.filter(
    (message) => message.status === "skipped" && message.reason === "consent_marketing_missing" && isBefore(addDays(now, -30), message.updatedAt),
  ).length;
  if (consentGaps) alerts.push({ kind: "consent_gaps", level: "info", count: consentGaps });

  return alerts;
}

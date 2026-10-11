/**
 * Deterministic scheduling + sending engine (pure logic, no I/O).
 *
 * Lifecycle of a message:
 *   trigger (booking event / completed visit)  -> one logical message per dedupe key
 *   scheduled -> (revalidate right before send) -> sent | deferred | paused | skipped | cancelled
 *   sent -> delivered | failed (receipt)          unknown -> reconciled, never blindly resent
 *
 * Functions mutate the `messages` array they receive; callers pass a working
 * copy. Time always comes from `ctx.now` so the demo clock and tests are exact.
 */

import {
  DEFAULT_BODIES,
  DEFAULT_TIMINGS,
  renderTemplate,
  smsSegments,
  type RenderResult,
} from "./templates";
import {
  addDays,
  addMinutes,
  atLocalTimeAfterDays,
  isBefore,
  isOnOrBefore,
  localDateKey,
  maxIso,
  nextAllowedInstant,
  isWithinWindow,
} from "./time";
import {
  AUTOMATION_ORDER,
  PENDING_STATUSES,
  type AttemptOutcome,
  type Automation,
  type AutomationKind,
  type AutomationVersion,
  type LanguageCode,
  type MarketingAppointment,
  type MarketingCustomer,
  type MarketingDataset,
  type MarketingService,
  type MessageCategory,
  type MessageReason,
  type MessageStatus,
  type ScheduledMessage,
  type SmsSettings,
} from "./types";

export const DELIVERY_RECEIPT_DELAY_MIN = 1;
export const UNKNOWN_RECONCILE_DELAY_MIN = 15;
export const RETRY_BACKOFF_MIN = [5, 15, 45];
/** A marketing message pushed further than this by the frequency cap is dropped. */
export const FREQUENCY_MAX_DEFER_DAYS = 14;

export interface EngineContext {
  now: string;
  dataset: MarketingDataset;
  settings: SmsSettings;
  automations: Record<AutomationKind, Automation>;
  nextId: () => string;
  /** Simulated provider answer for an attempt. */
  provider: (message: ScheduledMessage, attempt: number) => AttemptOutcome;
}

// ── Defaults ────────────────────────────────────────────────────────

export function categoryOf(kind: AutomationKind): MessageCategory {
  return kind === "rebooking_invite" ? "marketing" : "transactional";
}

export function createDefaultSettings(timezone = "Asia/Jerusalem"): SmsSettings {
  return {
    connection: "not_connected",
    providerLabel: "SMS",
    senderName: "",
    timezone,
    defaultLanguage: "he",
    enabledLanguages: ["he"],
    marketingWindow: { start: "09:00", end: "19:00" },
    frequencyCapDays: 7,
    monthlyMarketingBudgetCents: 15_000,
    budgetAlertPercent: 80,
    maxAttempts: 3,
    estimatedCostPerSegmentCents: 12,
  };
}

export function createVersion(kind: AutomationKind, now: string, actor: string): AutomationVersion {
  return {
    version: 1,
    timing: { ...DEFAULT_TIMINGS[kind] },
    bodies: { ...DEFAULT_BODIES[kind] },
    serviceOverrides: {},
    updatedAt: now,
    updatedBy: actor,
    publishedAt: now,
    publishedBy: actor,
  };
}

export function createDefaultAutomations(now: string, actor: string): Record<AutomationKind, Automation> {
  const result = {} as Record<AutomationKind, Automation>;
  for (const kind of AUTOMATION_ORDER) {
    result[kind] = {
      kind,
      category: categoryOf(kind),
      // Rebooking stays off until an interval is chosen and it is activated.
      enabled: kind !== "rebooking_invite",
      published: createVersion(kind, now, actor),
      draft: null,
    };
  }
  return result;
}

// ── Lookups ─────────────────────────────────────────────────────────

export function findCustomer(ds: MarketingDataset, id: string): MarketingCustomer | undefined {
  return ds.customers.find((customer) => customer.id === id);
}

export function findAppointment(ds: MarketingDataset, id: string | undefined): MarketingAppointment | undefined {
  return id ? ds.appointments.find((appointment) => appointment.id === id) : undefined;
}

export function servicesFor(ds: MarketingDataset, ids: string[]): MarketingService[] {
  return ids
    .map((id) => ds.services.find((service) => service.id === id))
    .filter((service): service is MarketingService => Boolean(service));
}

export function isPending(status: MessageStatus): boolean {
  return PENDING_STATUSES.includes(status);
}

function findByKey(messages: ScheduledMessage[], key: string): ScheduledMessage | undefined {
  return messages.find((message) => message.dedupeKey === key);
}

// ── Content resolution ─────────────────────────────────────────────

export function isServiceIncluded(version: AutomationVersion, serviceId: string): boolean {
  return version.serviceOverrides[serviceId]?.enabled !== false;
}

export function resolveIntervalDays(version: AutomationVersion, serviceId: string): number | null {
  const override = version.serviceOverrides[serviceId]?.intervalDays;
  if (override && override > 0) return override;
  return version.timing.type === "after_service" ? version.timing.intervalDays : null;
}

export function pickLanguage(customer: MarketingCustomer | undefined, settings: SmsSettings): LanguageCode {
  const preferred = customer?.language;
  if (preferred && settings.enabledLanguages.includes(preferred)) return preferred;
  return settings.defaultLanguage;
}

/**
 * Body for a message. A single-service message can use a service-specific
 * text; multi-service appointments always use the general template. A missing
 * language falls back to the approved default language (never translated).
 */
export function resolveBody(
  version: AutomationVersion,
  serviceIds: string[],
  lang: LanguageCode,
  settings: SmsSettings,
): { body: string; lang: LanguageCode; usedFallbackLanguage: boolean } {
  const override = serviceIds.length === 1 ? version.serviceOverrides[serviceIds[0]] : undefined;
  const direct = override?.bodies?.[lang]?.trim() || version.bodies[lang]?.trim();
  if (direct) return { body: direct, lang, usedFallbackLanguage: false };
  const fallbackLang = settings.defaultLanguage;
  const fallback =
    override?.bodies?.[fallbackLang]?.trim() || version.bodies[fallbackLang]?.trim() || "";
  return { body: fallback, lang: fallbackLang, usedFallbackLanguage: lang !== fallbackLang };
}

/** Price is optional and never shown as zero when missing. */
export function resolvePrice(
  version: AutomationVersion,
  serviceIds: string[],
  appointment: MarketingAppointment | undefined,
  services: MarketingService[],
): number | null {
  if (serviceIds.length === 1) {
    const override = version.serviceOverrides[serviceIds[0]];
    if (override && override.priceCents !== undefined) return override.priceCents;
  }
  if (appointment && typeof appointment.priceCents === "number" && appointment.priceCents > 0) {
    return appointment.priceCents;
  }
  if (services.length && services.every((service) => typeof service.priceCents === "number" && service.priceCents > 0)) {
    return services.reduce((sum, service) => sum + (service.priceCents ?? 0), 0);
  }
  return null;
}

export function unsubscribeUrlFor(messageId: string): string {
  return `https://sln.ai/u/${messageId.replace(/[^a-z0-9]/gi, "").slice(-8)}`;
}

export interface RenderedMessage {
  render: RenderResult;
  lang: LanguageCode;
  usedFallbackLanguage: boolean;
  segments: number;
  estimatedCostCents: number;
}

export function renderMessage(
  ctx: Pick<EngineContext, "dataset" | "settings">,
  message: Pick<ScheduledMessage, "id" | "automation" | "customerId" | "appointmentId" | "serviceIds" | "category">,
  version: AutomationVersion,
  customerOverride?: MarketingCustomer,
): RenderedMessage {
  const ds = ctx.dataset;
  const customer = customerOverride ?? findCustomer(ds, message.customerId);
  const appointment = findAppointment(ds, message.appointmentId);
  const services = servicesFor(ds, message.serviceIds);
  const wanted = pickLanguage(customer, ctx.settings);
  const { body, lang, usedFallbackLanguage } = resolveBody(version, message.serviceIds, wanted, ctx.settings);
  const render = renderTemplate(body, message.automation, {
    lang,
    timeZone: ctx.settings.timezone,
    salon: ds.salon,
    customer,
    appointment,
    services,
    priceCents: resolvePrice(version, message.serviceIds, appointment, services),
    isMarketing: message.category === "marketing",
    unsubscribeUrl: unsubscribeUrlFor(message.id),
  });
  const segments = smsSegments(render.text).segments;
  return {
    render,
    lang,
    usedFallbackLanguage,
    segments,
    estimatedCostCents: segments * ctx.settings.estimatedCostPerSegmentCents,
  };
}

// ── Message creation ───────────────────────────────────────────────

interface CreateParams {
  kind: AutomationKind;
  dedupeKey: string;
  customerId: string;
  appointmentId?: string;
  serviceIds: string[];
  plannedFor: string;
  status?: MessageStatus;
  reason?: MessageReason;
  reasonDetail?: string;
}

function createMessage(ctx: EngineContext, params: CreateParams): ScheduledMessage {
  const automation = ctx.automations[params.kind];
  const id = ctx.nextId();
  const base = {
    id,
    automation: params.kind,
    category: automation.category,
    customerId: params.customerId,
    appointmentId: params.appointmentId,
    serviceIds: params.serviceIds,
  };
  const rendered = renderMessage(ctx, base, automation.published);
  const customer = findCustomer(ctx.dataset, params.customerId);
  return {
    ...base,
    dedupeKey: params.dedupeKey,
    plannedFor: params.plannedFor,
    scheduledFor: params.plannedFor,
    status: params.status ?? "scheduled",
    reason: params.reason,
    reasonDetail: params.reasonDetail,
    scheduledSnapshot: {
      automationVersion: automation.published.version,
      bodyPreview: rendered.render.text,
      marketingConsent: customer?.consent.marketing.status ?? "unknown",
    },
    estimatedCostCents: rendered.estimatedCostCents,
    segments: rendered.segments,
    language: rendered.lang,
    attempts: [],
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };
}

function setStatus(
  ctx: EngineContext,
  message: ScheduledMessage,
  status: MessageStatus,
  reason?: MessageReason,
  detail?: string,
): void {
  message.status = status;
  message.reason = reason;
  message.reasonDetail = detail;
  message.updatedAt = ctx.now;
}

function cancelPending(
  ctx: EngineContext,
  messages: ScheduledMessage[],
  predicate: (message: ScheduledMessage) => boolean,
  reason: MessageReason,
): number {
  let count = 0;
  for (const message of messages) {
    if (!message.isTest && isPending(message.status) && predicate(message)) {
      setStatus(ctx, message, "cancelled", reason);
      count += 1;
    }
  }
  return count;
}

function appointmentServicesIncluded(version: AutomationVersion, appointment: MarketingAppointment): string[] {
  return appointment.serviceIds.filter((serviceId) => isServiceIncluded(version, serviceId));
}

export function reminderTimeFor(ctx: Pick<EngineContext, "settings">, version: AutomationVersion, startTime: string): string {
  const time = version.timing.type === "day_before" ? version.timing.time : "10:00";
  return atLocalTimeAfterDays(startTime, ctx.settings.timezone, -1, time);
}

function planReminder(ctx: EngineContext, messages: ScheduledMessage[], appointment: MarketingAppointment): void {
  const automation = ctx.automations.appointment_reminder;
  if (!automation.enabled || appointment.status !== "confirmed") return;
  const included = appointmentServicesIncluded(automation.published, appointment);
  if (!included.length) return;
  const key = `reminder:${appointment.id}:${appointment.startTime}`;
  const existing = findByKey(messages, key);
  const plannedFor = reminderTimeFor(ctx, automation.published, appointment.startTime);
  if (existing) {
    if (existing.status === "cancelled" && existing.reason === "automation_disabled" && isBefore(ctx.now, plannedFor)) {
      existing.plannedFor = plannedFor;
      existing.scheduledFor = plannedFor;
      setStatus(ctx, existing, "scheduled");
    }
    return;
  }
  if (!isBefore(ctx.now, plannedFor)) {
    // Booked after the reminder moment: the confirmation is the only message.
    messages.push(
      createMessage(ctx, {
        kind: "appointment_reminder",
        dedupeKey: key,
        customerId: appointment.customerId,
        appointmentId: appointment.id,
        serviceIds: appointment.serviceIds,
        plannedFor,
        status: "skipped",
        reason: "reminder_window_passed",
      }),
    );
    return;
  }
  messages.push(
    createMessage(ctx, {
      kind: "appointment_reminder",
      dedupeKey: key,
      customerId: appointment.customerId,
      appointmentId: appointment.id,
      serviceIds: appointment.serviceIds,
      plannedFor,
    }),
  );
}

function planImmediate(
  ctx: EngineContext,
  messages: ScheduledMessage[],
  kind: AutomationKind,
  key: string,
  appointment: MarketingAppointment,
): ScheduledMessage | null {
  const automation = ctx.automations[kind];
  if (!automation.enabled || findByKey(messages, key)) return null;
  if (!appointmentServicesIncluded(automation.published, appointment).length) return null;
  const message = createMessage(ctx, {
    kind,
    dedupeKey: key,
    customerId: appointment.customerId,
    appointmentId: appointment.id,
    serviceIds: appointment.serviceIds,
    plannedFor: ctx.now,
  });
  messages.push(message);
  return message;
}

function hasFutureBookingFor(ds: MarketingDataset, customerId: string, serviceId: string, now: string): boolean {
  return ds.appointments.some(
    (appointment) =>
      appointment.customerId === customerId
      && appointment.status === "confirmed"
      && appointment.serviceIds.includes(serviceId)
      && isBefore(now, appointment.startTime),
  );
}

function suppressRebookingForBooking(ctx: EngineContext, messages: ScheduledMessage[], appointment: MarketingAppointment): void {
  for (const message of messages) {
    if (message.isTest || message.automation !== "rebooking_invite" || !isPending(message.status)) continue;
    if (message.customerId !== appointment.customerId) continue;
    const remaining = message.serviceIds.filter((serviceId) => !appointment.serviceIds.includes(serviceId));
    if (remaining.length === message.serviceIds.length) continue;
    if (!remaining.length) {
      setStatus(ctx, message, "cancelled", "future_booking_exists");
    } else {
      message.serviceIds = remaining;
      message.mergedServiceIds = message.mergedServiceIds?.filter((serviceId) => remaining.includes(serviceId));
      message.updatedAt = ctx.now;
    }
  }
}

function planRebooking(ctx: EngineContext, messages: ScheduledMessage[], appointment: MarketingAppointment): void {
  const automation = ctx.automations.rebooking_invite;
  const version = automation.published;
  if (!automation.enabled || appointment.status !== "completed") return;
  const completedAt = appointment.completedAt ?? appointment.endTime;
  const timeOfDay = version.timing.type === "after_service" ? version.timing.time : "10:00";

  for (const serviceId of appointment.serviceIds) {
    if (!isServiceIncluded(version, serviceId)) continue;
    const interval = resolveIntervalDays(version, serviceId);
    if (!interval) continue;

    // A newer visit of the same service replaces the previous schedule.
    for (const message of messages) {
      if (message.isTest || message.automation !== "rebooking_invite" || !isPending(message.status)) continue;
      if (message.customerId !== appointment.customerId || !message.serviceIds.includes(serviceId)) continue;
      if (message.appointmentId === appointment.id) continue;
      const remaining = message.serviceIds.filter((id) => id !== serviceId);
      if (!remaining.length) setStatus(ctx, message, "cancelled", "superseded_by_new_visit");
      else {
        message.serviceIds = remaining;
        message.updatedAt = ctx.now;
      }
    }

    const key = `rebook:${appointment.id}:${serviceId}`;
    if (findByKey(messages, key)) continue;
    const plannedFor = nextAllowedInstant(
      atLocalTimeAfterDays(completedAt, ctx.settings.timezone, interval, timeOfDay),
      ctx.settings.timezone,
      ctx.settings.marketingWindow,
    );

    // Same customer, same local day: merge into one message (consent and
    // frequency are still checked for the merged message before sending).
    const dayKey = localDateKey(plannedFor, ctx.settings.timezone);
    const sameDay = messages.find(
      (message) =>
        !message.isTest
        && message.automation === "rebooking_invite"
        && isPending(message.status)
        && message.customerId === appointment.customerId
        && localDateKey(message.scheduledFor, ctx.settings.timezone) === dayKey,
    );
    const created = createMessage(ctx, {
      kind: "rebooking_invite",
      dedupeKey: key,
      customerId: appointment.customerId,
      appointmentId: appointment.id,
      serviceIds: [serviceId],
      plannedFor,
    });
    if (sameDay) {
      sameDay.serviceIds = [...new Set([...sameDay.serviceIds, serviceId])];
      sameDay.mergedServiceIds = [...new Set([...(sameDay.mergedServiceIds ?? []), serviceId])];
      sameDay.updatedAt = ctx.now;
      created.status = "cancelled";
      created.reason = "merged_into";
      created.mergedInto = sameDay.id;
    }
    messages.push(created);
  }
}

// ── Events ──────────────────────────────────────────────────────────

export type AppointmentEvent =
  | { type: "booked"; appointmentId: string }
  | { type: "rescheduled"; appointmentId: string; previousStart: string }
  | { type: "cancelled"; appointmentId: string }
  | { type: "completed"; appointmentId: string }
  | { type: "no_show"; appointmentId: string };

/** Apply a CRM appointment event. The dataset must already reflect the change. */
export function handleAppointmentEvent(ctx: EngineContext, messages: ScheduledMessage[], event: AppointmentEvent): void {
  const appointment = findAppointment(ctx.dataset, event.appointmentId);
  if (!appointment) return;
  switch (event.type) {
    case "booked":
      // Multi-service visit: one confirmation and one reminder for the whole visit.
      planImmediate(ctx, messages, "booking_confirmation", `confirm:${appointment.id}`, appointment);
      planReminder(ctx, messages, appointment);
      suppressRebookingForBooking(ctx, messages, appointment);
      break;
    case "rescheduled":
      cancelPending(
        ctx,
        messages,
        (message) =>
          message.appointmentId === appointment.id
          && (message.automation === "appointment_reminder" || message.automation === "appointment_rescheduled"),
        "appointment_rescheduled",
      );
      planImmediate(
        ctx,
        messages,
        "appointment_rescheduled",
        `rescheduled:${appointment.id}:${appointment.startTime}`,
        appointment,
      );
      planReminder(ctx, messages, appointment);
      break;
    case "cancelled":
      cancelPending(
        ctx,
        messages,
        (message) => message.appointmentId === appointment.id && message.automation !== "appointment_cancelled",
        "appointment_cancelled",
      );
      planImmediate(ctx, messages, "appointment_cancelled", `cancelled:${appointment.id}`, appointment);
      break;
    case "completed":
      cancelPending(
        ctx,
        messages,
        (message) => message.appointmentId === appointment.id && message.automation === "appointment_reminder",
        "appointment_passed",
      );
      planRebooking(ctx, messages, appointment);
      break;
    case "no_show":
      // A no-show never starts a rebooking countdown.
      cancelPending(
        ctx,
        messages,
        (message) => message.appointmentId === appointment.id && message.automation === "appointment_reminder",
        "appointment_passed",
      );
      break;
  }
}

// ── Revalidation + sending ─────────────────────────────────────────

type Decision =
  | { action: "send"; rendered: RenderedMessage }
  | { action: "defer"; until: string; reason: MessageReason; detail?: string }
  | { action: "pause"; reason: MessageReason; detail?: string }
  | { action: "skip"; reason: MessageReason; detail?: string }
  | { action: "cancel"; reason: MessageReason; detail?: string };

function monthKey(iso: string, timeZone: string): string {
  return localDateKey(iso, timeZone).slice(0, 7);
}

export function messageCostCents(message: ScheduledMessage): number {
  return message.actualCostCents ?? (message.sentAt ? message.estimatedCostCents ?? 0 : 0);
}

export function marketingSpendForMonth(
  messages: ScheduledMessage[],
  settings: SmsSettings,
  now: string,
  excludeId?: string,
): number {
  const month = monthKey(now, settings.timezone);
  return messages
    .filter(
      (message) =>
        !message.isTest
        && message.category === "marketing"
        && message.id !== excludeId
        && message.sentAt
        && monthKey(message.sentAt, settings.timezone) === month,
    )
    .reduce((sum, message) => sum + messageCostCents(message), 0);
}

function lastMarketingSentAt(messages: ScheduledMessage[], customerId: string, excludeId: string): string | null {
  let latest: string | null = null;
  for (const message of messages) {
    if (message.isTest || message.category !== "marketing" || message.id === excludeId) continue;
    if (message.customerId !== customerId || !message.sentAt) continue;
    if (!latest || isBefore(latest, message.sentAt)) latest = message.sentAt;
  }
  return latest;
}

function relevanceCheck(ctx: EngineContext, message: ScheduledMessage): Decision | null {
  const ds = ctx.dataset;
  const appointment = findAppointment(ds, message.appointmentId);
  switch (message.automation) {
    case "booking_confirmation":
      if (!appointment) return { action: "cancel", reason: "appointment_cancelled" };
      if (appointment.status === "cancelled") return { action: "cancel", reason: "appointment_cancelled" };
      if (!isBefore(ctx.now, appointment.startTime)) return { action: "skip", reason: "appointment_passed" };
      return null;
    case "appointment_reminder": {
      if (!appointment || appointment.status === "cancelled") return { action: "cancel", reason: "appointment_cancelled" };
      const keyStart = message.dedupeKey.split(":").slice(2).join(":");
      if (keyStart && keyStart !== appointment.startTime) return { action: "cancel", reason: "appointment_rescheduled" };
      if (appointment.status !== "confirmed" || !isBefore(ctx.now, appointment.startTime)) {
        return { action: "skip", reason: "appointment_passed" };
      }
      return null;
    }
    case "appointment_rescheduled": {
      if (!appointment || appointment.status === "cancelled") return { action: "cancel", reason: "appointment_cancelled" };
      const keyStart = message.dedupeKey.split(":").slice(2).join(":");
      if (keyStart && keyStart !== appointment.startTime) return { action: "cancel", reason: "appointment_rescheduled" };
      if (!isBefore(ctx.now, appointment.startTime)) return { action: "skip", reason: "appointment_passed" };
      return null;
    }
    case "appointment_cancelled":
      if (!appointment || appointment.status !== "cancelled") return { action: "cancel", reason: "appointment_rescheduled" };
      return null;
    case "rebooking_invite": {
      if (!appointment || appointment.status !== "completed") {
        return { action: "cancel", reason: "appointment_not_completed" };
      }
      const remaining = message.serviceIds.filter(
        (serviceId) => !hasFutureBookingFor(ds, message.customerId, serviceId, ctx.now),
      );
      if (!remaining.length) return { action: "cancel", reason: "future_booking_exists" };
      if (remaining.length !== message.serviceIds.length) {
        message.serviceIds = remaining;
        message.mergedServiceIds = message.mergedServiceIds?.filter((serviceId) => remaining.includes(serviceId));
      }
      return null;
    }
  }
}

function evaluate(ctx: EngineContext, messages: ScheduledMessage[], message: ScheduledMessage): Decision {
  const { settings } = ctx;
  if (settings.connection !== "connected") return { action: "pause", reason: "sms_not_connected" };

  const automation = ctx.automations[message.automation];
  if (!message.isTest) {
    if (!automation.enabled) return { action: "cancel", reason: "automation_disabled" };
    const included = message.serviceIds.filter((serviceId) => isServiceIncluded(automation.published, serviceId));
    if (!included.length) return { action: "cancel", reason: "service_excluded" };

    const customer = findCustomer(ctx.dataset, message.customerId);
    if (!customer?.phone) return { action: "skip", reason: "no_phone" };
    if (customer.consent.transactional.status === "revoked") return { action: "skip", reason: "consent_opted_out" };
    if (message.category === "marketing") {
      const consent = customer.consent.marketing.status;
      if (consent === "revoked") return { action: "skip", reason: "consent_opted_out" };
      if (consent !== "granted") return { action: "skip", reason: "consent_marketing_missing" };
    }

    const relevance = relevanceCheck(ctx, message);
    if (relevance) return relevance;
  }

  const rendered = renderMessage(ctx, message, automation.published);
  if (rendered.render.missingRequired.length || rendered.render.unknownTokens.length || !rendered.render.text) {
    return {
      action: "skip",
      reason: "missing_variable",
      detail: [...rendered.render.missingRequired, ...rendered.render.unknownTokens].join(", "),
    };
  }

  if (message.category === "marketing" && !message.isTest) {
    if (!isWithinWindow(ctx.now, settings.timezone, settings.marketingWindow)) {
      return {
        action: "defer",
        until: nextAllowedInstant(ctx.now, settings.timezone, settings.marketingWindow),
        reason: "outside_send_window",
      };
    }
    const last = lastMarketingSentAt(messages, message.customerId, message.id);
    if (last) {
      const allowedAt = addDays(last, settings.frequencyCapDays);
      if (isBefore(ctx.now, allowedAt)) {
        const until = nextAllowedInstant(allowedAt, settings.timezone, settings.marketingWindow);
        if (isBefore(addDays(message.plannedFor, FREQUENCY_MAX_DEFER_DAYS), until)) {
          return { action: "skip", reason: "frequency_cap_expired" };
        }
        return { action: "defer", until, reason: "frequency_cap" };
      }
    }
    const spent = marketingSpendForMonth(messages, settings, ctx.now, message.id);
    if (spent + rendered.estimatedCostCents > settings.monthlyMarketingBudgetCents) {
      return { action: "pause", reason: "budget_cap" };
    }
  }

  return { action: "send", rendered };
}

function retryDelayMinutes(attempt: number): number {
  return RETRY_BACKOFF_MIN[Math.min(attempt - 1, RETRY_BACKOFF_MIN.length - 1)];
}

function scheduleRetry(ctx: EngineContext, message: ScheduledMessage, reason: MessageReason): void {
  const attemptsUsed = message.attempts.length;
  if (attemptsUsed >= ctx.settings.maxAttempts) {
    setStatus(ctx, message, "failed", reason);
    message.failedAt = ctx.now;
    return;
  }
  let next = addMinutes(ctx.now, retryDelayMinutes(attemptsUsed));
  if (message.category === "marketing" && !message.isTest) {
    next = nextAllowedInstant(next, ctx.settings.timezone, ctx.settings.marketingWindow);
  }
  message.scheduledFor = next;
  setStatus(ctx, message, "scheduled", reason);
}

function send(ctx: EngineContext, message: ScheduledMessage, rendered: RenderedMessage): void {
  const number = message.attempts.length + 1;
  const outcome = ctx.provider(message, number);
  const providerMessageId =
    outcome === "accepted" || outcome === "timeout" ? `sim-${message.id}-${number}` : undefined;
  message.attempts.push({ number, at: ctx.now, outcome, providerMessageId });

  if (outcome === "accepted" || outcome === "timeout") {
    // Freeze exactly what was handed to the provider.
    message.sentBody = rendered.render.text;
    message.sentVersion = ctx.automations[message.automation].published.version;
    message.language = rendered.lang;
    message.segments = rendered.segments;
    message.estimatedCostCents = rendered.estimatedCostCents;
    message.sentAt = ctx.now;
  }
  switch (outcome) {
    case "accepted":
      setStatus(ctx, message, "sent");
      break;
    case "timeout":
      setStatus(ctx, message, "unknown", "awaiting_provider_confirmation");
      break;
    case "temporary_failure":
      scheduleRetry(ctx, message, "provider_temporary_failure");
      break;
    case "permanent_failure":
      setStatus(ctx, message, "failed", "provider_permanent_failure");
      message.failedAt = ctx.now;
      break;
  }
}

function processDue(ctx: EngineContext, messages: ScheduledMessage[], message: ScheduledMessage): void {
  const decision = evaluate(ctx, messages, message);
  switch (decision.action) {
    case "send":
      send(ctx, message, decision.rendered);
      break;
    case "defer":
      message.scheduledFor = decision.until;
      setStatus(ctx, message, "deferred", decision.reason, decision.detail);
      break;
    case "pause":
      setStatus(ctx, message, "paused", decision.reason, decision.detail);
      break;
    case "skip":
      setStatus(ctx, message, "skipped", decision.reason, decision.detail);
      break;
    case "cancel":
      setStatus(ctx, message, "cancelled", decision.reason, decision.detail);
      break;
  }
}

function lastAttemptAt(message: ScheduledMessage): string | undefined {
  return message.attempts[message.attempts.length - 1]?.at;
}

function receiptDueAt(message: ScheduledMessage): string | null {
  if (message.status !== "sent" || !message.sentAt) return null;
  return addMinutes(message.sentAt, DELIVERY_RECEIPT_DELAY_MIN);
}

function reconcileDueAt(message: ScheduledMessage): string | null {
  if (message.status !== "unknown") return null;
  const at = lastAttemptAt(message);
  return at ? addMinutes(at, UNKNOWN_RECONCILE_DELAY_MIN) : null;
}

function isUndeliverable(ctx: EngineContext, message: ScheduledMessage): boolean {
  if (message.isTest) return false;
  return Boolean(findCustomer(ctx.dataset, message.customerId)?.undeliverable);
}

function applyReceipt(ctx: EngineContext, message: ScheduledMessage): void {
  message.actualCostCents = message.estimatedCostCents;
  if (isUndeliverable(ctx, message)) {
    setStatus(ctx, message, "failed", "delivery_failed");
    message.failedAt = ctx.now;
  } else {
    setStatus(ctx, message, "delivered");
    message.deliveredAt = ctx.now;
  }
}

/**
 * Resolve an unknown send by asking the provider for the status of the same
 * provider message id. Only a confirmed "not received" may lead to a retry,
 * and that retry stays on the same logical message.
 */
export function reconcileUnknown(
  ctx: EngineContext,
  message: ScheduledMessage,
  answer?: "delivered" | "not_received",
): void {
  if (message.status !== "unknown") return;
  const resolved = answer ?? (isUndeliverable(ctx, message) ? "not_received" : "delivered");
  const attempt = message.attempts[message.attempts.length - 1];
  if (attempt) {
    attempt.reconciledAs = resolved;
    attempt.reconciledAt = ctx.now;
  }
  if (resolved === "delivered") {
    message.actualCostCents = message.estimatedCostCents;
    message.deliveredAt = ctx.now;
    setStatus(ctx, message, "delivered");
    return;
  }
  message.sentAt = undefined;
  message.sentBody = undefined;
  scheduleRetry(ctx, message, "delivery_failed");
}

function resumePaused(ctx: EngineContext, messages: ScheduledMessage[]): void {
  for (const message of messages) {
    if (message.status !== "paused") continue;
    if (message.reason === "sms_not_connected" && ctx.settings.connection === "connected") {
      message.scheduledFor = ctx.now;
      setStatus(ctx, message, "scheduled");
    } else if (message.reason === "budget_cap") {
      const spent = marketingSpendForMonth(messages, ctx.settings, ctx.now, message.id);
      if (spent + (message.estimatedCostCents ?? 0) <= ctx.settings.monthlyMarketingBudgetCents) {
        message.scheduledFor = nextAllowedInstant(ctx.now, ctx.settings.timezone, ctx.settings.marketingWindow);
        setStatus(ctx, message, "scheduled");
      }
    }
  }
}

export function nextWake(messages: ScheduledMessage[]): string | null {
  let next: string | null = null;
  const consider = (iso: string | null) => {
    if (iso && (!next || isBefore(iso, next))) next = iso;
  };
  for (const message of messages) {
    if (message.status === "scheduled" || message.status === "deferred") consider(message.scheduledFor);
    consider(receiptDueAt(message));
    consider(reconcileDueAt(message));
  }
  return next;
}

/** Process everything due at `ctx.now`. */
export function processNow(ctx: EngineContext, messages: ScheduledMessage[]): void {
  resumePaused(ctx, messages);
  const due = messages
    .filter(
      (message) =>
        (message.status === "scheduled" || message.status === "deferred")
        && isOnOrBefore(message.scheduledFor, ctx.now),
    )
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor) || a.createdAt.localeCompare(b.createdAt));
  for (const message of due) processDue(ctx, messages, message);
  for (const message of messages) {
    const receipt = receiptDueAt(message);
    if (receipt && isOnOrBefore(receipt, ctx.now)) applyReceipt(ctx, message);
    const reconcile = reconcileDueAt(message);
    if (reconcile && isOnOrBefore(reconcile, ctx.now)) reconcileUnknown(ctx, message);
  }
}

/**
 * Advance the simulated clock to `target`, processing each wake-up at its
 * exact time so history timestamps are realistic.
 */
export function runUntil(ctx: EngineContext, messages: ScheduledMessage[], target: string): EngineContext {
  let current = ctx;
  for (let guard = 0; guard < 5000; guard += 1) {
    const wake = nextWake(messages);
    if (!wake || isBefore(target, wake)) break;
    current = { ...current, now: maxIso(current.now, wake) };
    processNow(current, messages);
  }
  current = { ...current, now: maxIso(current.now, target) };
  processNow(current, messages);
  return current;
}

// ── Owner actions ──────────────────────────────────────────────────

/** Re-time and re-preview pending messages after a new version is published. */
export function applyPublishedVersion(ctx: EngineContext, messages: ScheduledMessage[], kind: AutomationKind): number {
  const automation = ctx.automations[kind];
  const version = automation.published;
  let updated = 0;
  for (const message of messages) {
    if (message.isTest || message.automation !== kind || !isPending(message.status)) continue;
    const appointment = findAppointment(ctx.dataset, message.appointmentId);
    if (kind === "appointment_reminder" && appointment) {
      const planned = reminderTimeFor(ctx, version, appointment.startTime);
      message.plannedFor = planned;
      if (message.status === "scheduled") message.scheduledFor = maxIso(planned, ctx.now);
    }
    if (kind === "rebooking_invite" && appointment) {
      const interval = resolveIntervalDays(version, message.serviceIds[0]);
      const time = version.timing.type === "after_service" ? version.timing.time : "10:00";
      if (interval) {
        const planned = nextAllowedInstant(
          atLocalTimeAfterDays(appointment.completedAt ?? appointment.endTime, ctx.settings.timezone, interval, time),
          ctx.settings.timezone,
          ctx.settings.marketingWindow,
        );
        message.plannedFor = planned;
        if (message.status === "scheduled") message.scheduledFor = maxIso(planned, ctx.now);
      }
    }
    const rendered = renderMessage(ctx, message, version);
    message.scheduledSnapshot = {
      ...message.scheduledSnapshot,
      automationVersion: version.version,
      bodyPreview: rendered.render.text,
    };
    message.segments = rendered.segments;
    message.estimatedCostCents = rendered.estimatedCostCents;
    message.updatedAt = ctx.now;
    updated += 1;
  }
  return updated;
}

export function onAutomationToggled(ctx: EngineContext, messages: ScheduledMessage[], kind: AutomationKind): number {
  if (!ctx.automations[kind].enabled) {
    return cancelPending(ctx, messages, (message) => message.automation === kind, "automation_disabled");
  }
  if (kind === "appointment_reminder") {
    const before = messages.filter((message) => message.automation === kind && isPending(message.status)).length;
    for (const appointment of ctx.dataset.appointments) {
      if (appointment.status === "confirmed" && isBefore(ctx.now, appointment.startTime)) {
        const key = `reminder:${appointment.id}:${appointment.startTime}`;
        const existing = findByKey(messages, key);
        const planned = reminderTimeFor(ctx, ctx.automations[kind].published, appointment.startTime);
        if ((!existing && isBefore(ctx.now, planned)) || existing?.reason === "automation_disabled") {
          planReminder(ctx, messages, appointment);
        }
      }
    }
    return messages.filter((message) => message.automation === kind && isPending(message.status)).length - before;
  }
  return 0;
}

export function cancelMessageManually(ctx: EngineContext, message: ScheduledMessage): void {
  if (isPending(message.status)) setStatus(ctx, message, "cancelled", "manually_cancelled");
}

/** Test send to the owner's phone: sample data, never counts as marketing. */
export function createTestMessage(
  ctx: EngineContext,
  kind: AutomationKind,
  version: AutomationVersion,
  lang: LanguageCode,
  phone: string,
  sample: { customer: MarketingCustomer; appointment?: MarketingAppointment; serviceIds: string[] },
): ScheduledMessage {
  const id = ctx.nextId();
  const dataset: MarketingDataset = {
    ...ctx.dataset,
    customers: [sample.customer],
    appointments: sample.appointment ? [sample.appointment] : [],
  };
  const base = {
    id,
    automation: kind,
    category: "transactional" as MessageCategory,
    customerId: sample.customer.id,
    appointmentId: sample.appointment?.id,
    serviceIds: sample.serviceIds,
  };
  const settings = { ...ctx.settings, enabledLanguages: [lang], defaultLanguage: lang };
  const rendered = renderMessage({ dataset, settings }, { ...base, category: categoryOf(kind) }, version, {
    ...sample.customer,
    language: lang,
  });
  const prefix = lang === "he" ? "[בדיקה] " : "[Test] ";
  const text = `${prefix}${rendered.render.text}`;
  const segments = smsSegments(text).segments;
  const message: ScheduledMessage = {
    ...base,
    dedupeKey: `test:${id}`,
    plannedFor: ctx.now,
    scheduledFor: ctx.now,
    status: "scheduled",
    scheduledSnapshot: { automationVersion: version.version, bodyPreview: text, marketingConsent: "granted" },
    language: lang,
    segments,
    estimatedCostCents: segments * ctx.settings.estimatedCostPerSegmentCents,
    attempts: [],
    isTest: true,
    testPhone: phone,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };
  const outcome = ctx.provider(message, 1);
  message.attempts.push({
    number: 1,
    at: ctx.now,
    outcome,
    providerMessageId: outcome === "accepted" || outcome === "timeout" ? `sim-${id}-1` : undefined,
  });
  if (outcome === "accepted" || outcome === "timeout") {
    message.sentBody = text;
    message.sentVersion = version.version;
    message.sentAt = ctx.now;
    setStatus(ctx, message, outcome === "accepted" ? "sent" : "unknown", outcome === "timeout" ? "awaiting_provider_confirmation" : undefined);
  } else {
    setStatus(ctx, message, "failed", outcome === "permanent_failure" ? "provider_permanent_failure" : "provider_temporary_failure");
    message.failedAt = ctx.now;
  }
  return message;
}

// ── Salon-mode projection ──────────────────────────────────────────

/**
 * Salon mode never sends. It shows what *would* be scheduled from the real
 * CRM calendar so the owner can trust the setup before connecting SMS.
 */
export function projectSalonMessages(ctx: EngineContext, horizonDays = 30): ScheduledMessage[] {
  const messages: ScheduledMessage[] = [];
  const horizon = addDays(ctx.now, horizonDays);
  for (const appointment of ctx.dataset.appointments) {
    if (appointment.status === "confirmed" && isBefore(ctx.now, appointment.startTime) && isBefore(appointment.startTime, horizon)) {
      planReminder(ctx, messages, appointment);
    }
    if (appointment.status === "completed") planRebooking(ctx, messages, appointment);
  }
  return messages
    .filter((message) => isPending(message.status) && isBefore(ctx.now, message.scheduledFor) && isBefore(message.scheduledFor, horizon))
    .map((message) => {
      const customer = findCustomer(ctx.dataset, message.customerId);
      let projectedBlock: MessageReason | undefined;
      if (ctx.settings.connection !== "connected") projectedBlock = "sms_not_connected";
      if (!customer?.phone) projectedBlock = "no_phone";
      else if (customer.consent.transactional.status === "revoked") projectedBlock = "consent_opted_out";
      else if (message.category === "marketing" && customer.consent.marketing.status !== "granted") {
        projectedBlock = customer.consent.marketing.status === "revoked" ? "consent_opted_out" : "consent_marketing_missing";
      }
      const rendered = renderMessage(ctx, message, ctx.automations[message.automation].published);
      if (!projectedBlock && rendered.render.missingRequired.length) projectedBlock = "missing_variable";
      return { ...message, projectedBlock };
    })
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
}

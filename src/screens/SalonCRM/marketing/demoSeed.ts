/**
 * Deterministic demo world. The history is not hand-written: a scripted
 * timeline of CRM events is replayed through the real engine, so every
 * status and reason in the demo is something the engine actually decided.
 */

import {
  createDefaultAutomations,
  createDefaultSettings,
  handleAppointmentEvent,
  processNow,
  runUntil,
  type AppointmentEvent,
  type EngineContext,
} from "./engine";
import { addMinutes, atLocalTimeAfterDays, zonedTimeToIso } from "./time";
import type {
  AttemptOutcome,
  AuditEvent,
  MarketingAppointment,
  MarketingCustomer,
  MarketingDataset,
  MarketingState,
  ScheduledMessage,
} from "./types";

export const DEMO_TIMEZONE = "Asia/Jerusalem";
/** Monday 12 Oct 2026, 08:30 salon time. */
export const DEMO_NOW = zonedTimeToIso(2026, 10, 12, 8, 30, DEMO_TIMEZONE);
const OWNER = "בעלת הסלון (דמו)";

function at(dayOffset: number, time: string): string {
  return atLocalTimeAfterDays(DEMO_NOW, DEMO_TIMEZONE, dayOffset, time);
}

function consent(marketing: "granted" | "revoked" | "unknown", transactional: "granted" | "revoked" = "granted") {
  return {
    transactional: { status: transactional, source: "טופס הצטרפות", recordedAt: at(-120, "12:00") },
    marketing:
      marketing === "unknown"
        ? { status: "unknown" as const }
        : {
            status: marketing,
            source: marketing === "granted" ? "טופס הצטרפות" : "בקשת הלקוחה",
            recordedAt: at(marketing === "granted" ? -120 : -60, "12:00"),
          },
  };
}

const CUSTOMERS: MarketingCustomer[] = [
  { id: "c-noa", firstName: "נועה", lastName: "לוי", phone: "050-123-4567", language: "he", consent: consent("granted") },
  { id: "c-maya", firstName: "מאיה", lastName: "כהן", phone: "052-234-5678", language: "he", consent: consent("granted") },
  { id: "c-shira", firstName: "שירה", lastName: "אברהם", phone: "054-345-6789", language: "he", consent: consent("unknown") },
  { id: "c-emma", firstName: "Emma", lastName: "Clarke", phone: "053-456-7890", language: "en", consent: consent("granted") },
  { id: "c-tamar", firstName: "תמר", lastName: "פרץ", phone: "050-567-8901", language: "he", consent: consent("revoked") },
  { id: "c-yael", firstName: "יעל", lastName: "מזרחי", language: "he", consent: consent("granted") },
  { id: "c-roni", firstName: "רוני", lastName: "גולן", phone: "058-678-9012", language: "he", consent: consent("granted"), undeliverable: true },
  { id: "c-dana", firstName: "דנה", lastName: "ביטון", phone: "052-789-0123", language: "he", consent: consent("granted") },
  { id: "c-liat", firstName: "ליאת", lastName: "שפירא", phone: "054-890-1234", language: "he", consent: consent("granted") },
  { id: "c-hila", firstName: "הילה", lastName: "דוד", phone: "050-901-2345", language: "he", consent: consent("revoked", "revoked") },
];

export function createDemoDataset(): MarketingDataset {
  return {
    salon: {
      name: "סטודיו נועה",
      phone: "03-555-0100",
      address: "דיזנגוף 120, תל אביב",
      branchName: "דיזנגוף",
      timezone: DEMO_TIMEZONE,
      bookingUrl: "https://sln.ai/b/studio-noa",
    },
    customers: CUSTOMERS.map((customer) => ({ ...customer, consent: { ...customer.consent } })),
    services: [
      { id: "s-cut", name: "תספורת נשים", priceCents: 18_000, durationMinutes: 60 },
      {
        id: "s-color",
        name: "צבע שורש",
        priceCents: 32_000,
        durationMinutes: 90,
        prepInstructions: "נא להגיע עם שיער יבש וללא מוצרי עיצוב.",
      },
      { id: "s-highlights", name: "גוונים", priceCents: 65_000, durationMinutes: 180 },
      { id: "s-blowdry", name: "פן", priceCents: 12_000, durationMinutes: 45 },
      { id: "s-keratin", name: "טיפול קרטין", priceCents: null, durationMinutes: 120 },
      { id: "s-toner", name: "טונר", priceCents: 15_000, durationMinutes: 30 },
    ],
    appointments: [],
  };
}

interface AppointmentScript {
  id: string;
  customerId: string;
  serviceIds: string[];
  staffName: string;
  bookedAt: string;
  start: string;
  minutes: number;
  outcome?: { type: "completed" | "cancelled" | "no_show"; at?: string };
  reschedule?: { at: string; start: string };
}

const SCRIPT: AppointmentScript[] = [
  // Completed visits that drive rebooking invites.
  { id: "a-noa-color", customerId: "c-noa", serviceIds: ["s-color"], staffName: "אור", bookedAt: at(-52, "11:10"), start: at(-45, "10:00"), minutes: 90, outcome: { type: "completed" } },
  { id: "a-maya-cut", customerId: "c-maya", serviceIds: ["s-cut"], staffName: "אור", bookedAt: at(-50, "09:40"), start: at(-44, "12:00"), minutes: 60, outcome: { type: "completed" } },
  { id: "a-shira-cut", customerId: "c-shira", serviceIds: ["s-cut"], staffName: "גל", bookedAt: at(-49, "17:20"), start: at(-43, "16:00"), minutes: 60, outcome: { type: "completed" } },
  { id: "a-tamar-color", customerId: "c-tamar", serviceIds: ["s-color"], staffName: "גל", bookedAt: at(-47, "10:05"), start: at(-40, "11:00"), minutes: 90, outcome: { type: "completed" } },
  { id: "a-roni-cut", customerId: "c-roni", serviceIds: ["s-cut"], staffName: "אור", bookedAt: at(-52, "13:30"), start: at(-46, "13:00"), minutes: 60, outcome: { type: "completed" } },
  { id: "a-liat-color", customerId: "c-liat", serviceIds: ["s-color"], staffName: "גל", bookedAt: at(-44, "08:50"), start: at(-38, "10:00"), minutes: 90, outcome: { type: "completed" } },
  { id: "a-liat-cut", customerId: "c-liat", serviceIds: ["s-cut"], staffName: "גל", bookedAt: at(-48, "19:15"), start: at(-43, "09:00"), minutes: 60, outcome: { type: "completed" } },
  { id: "a-dana-color", customerId: "c-dana", serviceIds: ["s-color"], staffName: "אור", bookedAt: at(-36, "12:00"), start: at(-30, "10:00"), minutes: 90, outcome: { type: "completed" } },
  { id: "a-noa-cut-toner", customerId: "c-noa", serviceIds: ["s-cut", "s-toner"], staffName: "אור", bookedAt: at(-26, "15:00"), start: at(-20, "11:00"), minutes: 90, outcome: { type: "completed" } },
  { id: "a-shira-noshow", customerId: "c-shira", serviceIds: ["s-blowdry"], staffName: "גל", bookedAt: at(-14, "10:30"), start: at(-10, "17:00"), minutes: 45, outcome: { type: "no_show", at: at(-10, "17:30") } },
  { id: "a-shira-cancel", customerId: "c-shira", serviceIds: ["s-highlights"], staffName: "גל", bookedAt: at(-7, "11:45"), start: at(-2, "12:00"), minutes: 60, outcome: { type: "cancelled", at: at(-3, "14:20") } },

  // Upcoming visits.
  { id: "a-dana-multi", customerId: "c-dana", serviceIds: ["s-cut", "s-color"], staffName: "אור", bookedAt: at(-3, "13:05"), start: at(2, "11:00"), minutes: 150 },
  { id: "a-noa-blowdry", customerId: "c-noa", serviceIds: ["s-blowdry"], staffName: "גל", bookedAt: at(-1, "16:00"), start: at(0, "18:00"), minutes: 45 },
  { id: "a-maya-highlights", customerId: "c-maya", serviceIds: ["s-highlights"], staffName: "אור", bookedAt: at(-6, "10:15"), start: at(5, "14:00"), minutes: 180, reschedule: { at: at(-2, "09:30"), start: at(6, "15:00") } },
  { id: "a-emma-cut", customerId: "c-emma", serviceIds: ["s-cut"], staffName: "Gal", bookedAt: at(-4, "12:40"), start: at(1, "13:00"), minutes: 60 },
  { id: "a-yael-cut", customerId: "c-yael", serviceIds: ["s-cut"], staffName: "גל", bookedAt: at(-2, "18:10"), start: at(3, "10:00"), minutes: 60 },
  { id: "a-hila-keratin", customerId: "c-hila", serviceIds: ["s-keratin"], staffName: "אור", bookedAt: at(-2, "11:00"), start: at(4, "12:00"), minutes: 120 },
  { id: "a-roni-blowdry", customerId: "c-roni", serviceIds: ["s-blowdry"], staffName: "אור", bookedAt: at(-5, "14:00"), start: at(8, "16:00"), minutes: 45 },
  { id: "a-tamar-cut", customerId: "c-tamar", serviceIds: ["s-cut"], staffName: "גל", bookedAt: at(-1, "12:30"), start: at(2, "10:00"), minutes: 60 },
  { id: "a-liat-toner", customerId: "c-liat", serviceIds: ["s-toner"], staffName: "גל", bookedAt: addMinutes(DEMO_NOW, -6), start: at(7, "12:00"), minutes: 30 },
  { id: "a-maya-toner", customerId: "c-maya", serviceIds: ["s-toner"], staffName: "אור", bookedAt: addMinutes(DEMO_NOW, -0.5), start: at(9, "17:00"), minutes: 30 },
];

/** Scripted provider answers per dedupe key, attempt by attempt. */
const PROVIDER_SCRIPT: Record<string, AttemptOutcome[]> = {
  "confirm:a-dana-multi": ["temporary_failure", "accepted"],
  "confirm:a-emma-cut": ["timeout"],
  "confirm:a-roni-blowdry": ["permanent_failure"],
  "confirm:a-liat-toner": ["timeout"],
};

type TimelineEvent = { at: string; order: number; apply: (ds: MarketingDataset) => AppointmentEvent };

function buildTimeline(): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  SCRIPT.forEach((script, index) => {
    const end = addMinutes(script.start, script.minutes);
    events.push({
      at: script.bookedAt,
      order: index,
      apply: (ds) => {
        const appointment: MarketingAppointment = {
          id: script.id,
          customerId: script.customerId,
          serviceIds: script.serviceIds,
          staffName: script.staffName,
          startTime: script.start,
          endTime: end,
          status: "confirmed",
          createdAt: script.bookedAt,
        };
        ds.appointments.push(appointment);
        return { type: "booked", appointmentId: script.id };
      },
    });
    if (script.reschedule) {
      const reschedule = script.reschedule;
      events.push({
        at: reschedule.at,
        order: index,
        apply: (ds) => {
          const appointment = ds.appointments.find((item) => item.id === script.id)!;
          const previousStart = appointment.startTime;
          appointment.startTime = reschedule.start;
          appointment.endTime = addMinutes(reschedule.start, script.minutes);
          return { type: "rescheduled", appointmentId: script.id, previousStart };
        },
      });
    }
    if (script.outcome) {
      const outcome = script.outcome;
      const outcomeAt = outcome.at ?? end;
      events.push({
        at: outcomeAt,
        order: index,
        apply: (ds) => {
          const appointment = ds.appointments.find((item) => item.id === script.id)!;
          appointment.status = outcome.type === "no_show" ? "no-show" : outcome.type;
          if (outcome.type === "completed") appointment.completedAt = outcomeAt;
          return { type: outcome.type, appointmentId: script.id } as AppointmentEvent;
        },
      });
    }
  });
  return events.sort((a, b) => a.at.localeCompare(b.at) || a.order - b.order);
}

export function createDemoState(): MarketingState {
  const start = at(-60, "09:00");
  const dataset = createDemoDataset();
  const automations = createDefaultAutomations(start, OWNER);
  const settings = {
    ...createDefaultSettings(DEMO_TIMEZONE),
    connection: "connected" as const,
    providerLabel: "SMS",
    senderName: "StudioNoa",
    enabledLanguages: ["he", "en"] as ("he" | "en")[],
    onboardingCompletedAt: start,
    testSentAt: start,
  };

  const rebooking = automations.rebooking_invite;
  rebooking.enabled = true;
  rebooking.published = {
    ...rebooking.published,
    version: 2,
    timing: { type: "after_service", intervalDays: 42, time: "10:00" },
    serviceOverrides: {
      "s-color": { serviceId: "s-color", intervalDays: 35 },
      "s-highlights": { serviceId: "s-highlights", intervalDays: 56 },
      "s-blowdry": { serviceId: "s-blowdry", enabled: false },
      "s-keratin": { serviceId: "s-keratin", intervalDays: 90 },
    },
  };

  let sequence = 0;
  const messages: ScheduledMessage[] = [];
  let ctx: EngineContext = {
    now: start,
    dataset,
    settings,
    automations,
    nextId: () => `msg-${String(++sequence).padStart(4, "0")}`,
    provider: (message, attempt) => PROVIDER_SCRIPT[message.dedupeKey]?.[attempt - 1] ?? "accepted",
  };

  for (const event of buildTimeline()) {
    ctx = runUntil(ctx, messages, event.at);
    const appointmentEvent = event.apply(dataset);
    ctx = { ...ctx, now: event.at };
    handleAppointmentEvent(ctx, messages, appointmentEvent);
    processNow(ctx, messages);
  }
  ctx = runUntil(ctx, messages, DEMO_NOW);

  // An edit in progress: the published reminder keeps running meanwhile.
  const reminder = automations.appointment_reminder;
  reminder.draft = {
    ...reminder.published,
    version: reminder.published.version + 1,
    timing: { type: "day_before", time: "12:00" },
    bodies: {
      ...reminder.published.bodies,
      he: "היי {שם פרטי}, מזכירים שמחר ב{שעה} מחכים לך ב{שם הסלון} ל{שירותים}. {הנחיות הכנה} לשינוי: {קישור לתור}",
    },
    updatedAt: at(-1, "21:10"),
    updatedBy: "מנהלת (דמו)",
    publishedAt: undefined,
    publishedBy: undefined,
  };

  const audit: AuditEvent[] = [
    { id: "audit-1", at: start, actor: OWNER, action: "sms_connected", target: "sms", detail: "SMS (סימולציה)" },
    { id: "audit-2", at: addMinutes(start, 4), actor: OWNER, action: "test_sent", target: "booking_confirmation" },
    { id: "audit-3", at: addMinutes(start, 9), actor: OWNER, action: "published", target: "rebooking_invite", detail: "v2" },
    { id: "audit-4", at: addMinutes(start, 10), actor: OWNER, action: "enabled", target: "rebooking_invite" },
    { id: "audit-5", at: at(-1, "21:10"), actor: "מנהלת (דמו)", action: "draft_saved", target: "appointment_reminder", detail: "v2" },
  ];

  return {
    schemaVersion: 1,
    mode: "demo",
    settings,
    automations,
    messages,
    audit,
    clock: DEMO_NOW,
    dataset,
    actingRole: "owner",
    sequence,
  };
}

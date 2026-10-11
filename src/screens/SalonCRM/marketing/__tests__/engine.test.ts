import {
  applyPublishedVersion,
  createDefaultAutomations,
  createDefaultSettings,
  handleAppointmentEvent,
  nextWake,
  onAutomationToggled,
  processNow,
  projectSalonMessages,
  reconcileUnknown,
  renderMessage,
  resolveBody,
  resolveIntervalDays,
  resolvePrice,
  runUntil,
  type EngineContext,
} from "../engine";
import { smsSegments } from "../templates";
import { addDays, addMinutes, isWithinWindow, zonedTimeToIso } from "../time";
import type {
  AttemptOutcome,
  MarketingAppointment,
  MarketingCustomer,
  MarketingDataset,
  ScheduledMessage,
} from "../types";

const TZ = "Asia/Jerusalem";
const local = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return zonedTimeToIso(year, month, day, hour, minute, TZ);
};
const NOW = local("2026-10-05", "08:00");

function customer(id: string, patch: Partial<MarketingCustomer> = {}): MarketingCustomer {
  return {
    id,
    firstName: id,
    phone: "0501234567",
    consent: { transactional: { status: "granted" }, marketing: { status: "granted" } },
    ...patch,
  };
}

function appointment(id: string, patch: Partial<MarketingAppointment> & { customerId: string }): MarketingAppointment {
  return {
    id,
    serviceIds: ["cut"],
    startTime: local("2026-10-08", "11:00"),
    endTime: local("2026-10-08", "12:00"),
    status: "confirmed",
    createdAt: NOW,
    ...patch,
  };
}

function dataset(): MarketingDataset {
  return {
    salon: { name: "Studio", phone: "031234567", address: "Main 1", timezone: TZ, bookingUrl: "https://sln.ai/b/x" },
    customers: [customer("noa"), customer("maya")],
    services: [
      { id: "cut", name: "Cut", priceCents: 15_000 },
      { id: "color", name: "Color", priceCents: 30_000 },
      { id: "keratin", name: "Keratin", priceCents: null },
    ],
    appointments: [],
  };
}

type Script = Record<string, AttemptOutcome[]>;

function makeCtx(script: Script = {}, now = NOW): EngineContext {
  let counter = 0;
  const settings = { ...createDefaultSettings(TZ), connection: "connected" as const, senderName: "Studio" };
  const automations = createDefaultAutomations(NOW, "owner");
  return {
    now,
    dataset: dataset(),
    settings,
    automations,
    nextId: () => `m${String(++counter).padStart(3, "0")}`,
    provider: (message, attempt) => script[message.dedupeKey]?.[attempt - 1] ?? "accepted",
  };
}

function enableRebooking(ctx: EngineContext, intervalDays = 30, time = "10:00") {
  const automation = ctx.automations.rebooking_invite;
  automation.enabled = true;
  automation.published = { ...automation.published, timing: { type: "after_service", intervalDays, time } };
}

function book(ctx: EngineContext, messages: ScheduledMessage[], appt: MarketingAppointment) {
  ctx.dataset.appointments.push(appt);
  handleAppointmentEvent(ctx, messages, { type: "booked", appointmentId: appt.id });
}

function complete(ctx: EngineContext, messages: ScheduledMessage[], appt: MarketingAppointment) {
  ctx.dataset.appointments.push({ ...appt, status: "completed", completedAt: appt.endTime });
  handleAppointmentEvent(ctx, messages, { type: "completed", appointmentId: appt.id });
}

const byKind = (messages: ScheduledMessage[], kind: ScheduledMessage["automation"]) =>
  messages.filter((message) => message.automation === kind);

describe("scheduling", () => {
  it("plans one confirmation and one reminder the day before at 10:00 for a multi-service visit", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa", serviceIds: ["cut", "color"] }));

    expect(byKind(messages, "booking_confirmation")).toHaveLength(1);
    const reminders = byKind(messages, "appointment_reminder");
    expect(reminders).toHaveLength(1);
    expect(reminders[0].plannedFor).toBe(local("2026-10-07", "10:00"));
    expect(reminders[0].serviceIds).toEqual(["cut", "color"]);
  });

  it("sends only the confirmation when the reminder moment already passed", () => {
    const ctx = makeCtx({}, local("2026-10-07", "18:00"));
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);

    expect(byKind(messages, "booking_confirmation")[0].status).toBe("sent");
    const [reminder] = byKind(messages, "appointment_reminder");
    expect(reminder.status).toBe("skipped");
    expect(reminder.reason).toBe("reminder_window_passed");
    expect(reminder.attempts).toHaveLength(0);
  });

  it("never creates duplicates for a repeated booking event", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    const appt = appointment("a1", { customerId: "noa" });
    book(ctx, messages, appt);
    handleAppointmentEvent(ctx, messages, { type: "booked", appointmentId: appt.id });
    expect(messages.map((message) => message.dedupeKey).sort()).toEqual([
      "confirm:a1",
      `reminder:a1:${appt.startTime}`,
    ]);
  });

  it("replaces the reminder when the appointment is rescheduled", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    const appt = appointment("a1", { customerId: "noa" });
    book(ctx, messages, appt);
    const previousStart = appt.startTime;
    ctx.dataset.appointments[0] = { ...appt, startTime: local("2026-10-10", "11:00"), endTime: local("2026-10-10", "12:00") };
    handleAppointmentEvent(ctx, messages, { type: "rescheduled", appointmentId: "a1", previousStart });

    const reminders = byKind(messages, "appointment_reminder");
    expect(reminders.map((message) => message.status)).toEqual(["cancelled", "scheduled"]);
    expect(reminders[1].plannedFor).toBe(local("2026-10-09", "10:00"));
    expect(byKind(messages, "appointment_rescheduled")).toHaveLength(1);
  });

  it("cancels pending messages and sends a cancellation update", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    ctx.dataset.appointments[0].status = "cancelled";
    handleAppointmentEvent(ctx, messages, { type: "cancelled", appointmentId: "a1" });

    expect(byKind(messages, "appointment_reminder")[0]).toMatchObject({ status: "cancelled", reason: "appointment_cancelled" });
    expect(byKind(messages, "appointment_cancelled")[0].status).toBe("scheduled");
  });
});

describe("revalidation right before sending", () => {
  it("cancels a reminder whose appointment was cancelled without an event", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    ctx.dataset.appointments[0].status = "cancelled";
    runUntil(ctx, messages, local("2026-10-07", "10:05"));

    const [reminder] = byKind(messages, "appointment_reminder");
    expect(reminder).toMatchObject({ status: "cancelled", reason: "appointment_cancelled" });
    expect(reminder.attempts).toHaveLength(0);
  });

  it("skips when transactional consent is revoked after scheduling", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    ctx.dataset.customers[0].consent.transactional = { status: "revoked" };
    runUntil(ctx, messages, local("2026-10-07", "10:05"));
    expect(byKind(messages, "appointment_reminder")[0]).toMatchObject({ status: "skipped", reason: "consent_opted_out" });
  });

  it("skips a customer without a phone", () => {
    const ctx = makeCtx();
    ctx.dataset.customers[0].phone = undefined;
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    expect(byKind(messages, "booking_confirmation")[0]).toMatchObject({ status: "skipped", reason: "no_phone" });
  });

  it("skips when a required variable has no value", () => {
    const ctx = makeCtx();
    ctx.dataset.salon = { ...ctx.dataset.salon, phone: undefined, bookingUrl: null };
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    const [confirmation] = byKind(messages, "booking_confirmation");
    expect(confirmation).toMatchObject({ status: "skipped", reason: "missing_variable" });
    expect(confirmation.reasonDetail).toContain("booking_link");
  });

  it("pauses while SMS is not connected and resumes after connecting", () => {
    const ctx = makeCtx();
    ctx.settings.connection = "not_connected";
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    expect(byKind(messages, "booking_confirmation")[0]).toMatchObject({ status: "paused", reason: "sms_not_connected" });

    ctx.settings.connection = "connected";
    processNow(ctx, messages);
    processNow(ctx, messages);
    expect(byKind(messages, "booking_confirmation")[0].status).toBe("sent");
  });
});

describe("sending, retries and unknown results", () => {
  it("freezes the exact body, version and cost at send time", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    const [confirmation] = byKind(messages, "booking_confirmation");
    const frozen = confirmation.sentBody;
    expect(frozen).toContain("noa");
    expect(confirmation.sentVersion).toBe(1);

    ctx.automations.booking_confirmation.published = {
      ...ctx.automations.booking_confirmation.published,
      version: 2,
      bodies: { he: "חדש {שם פרטי}", en: "New {first name}" },
    };
    applyPublishedVersion(ctx, messages, "booking_confirmation");
    expect(confirmation.sentBody).toBe(frozen);
    expect(confirmation.sentVersion).toBe(1);
  });

  it("retries a temporary failure on the same message with backoff", () => {
    const ctx = makeCtx({ "confirm:a1": ["temporary_failure", "accepted"] });
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    const [confirmation] = byKind(messages, "booking_confirmation");
    expect(confirmation.status).toBe("scheduled");
    expect(confirmation.scheduledFor).toBe(addMinutes(NOW, 5));

    runUntil(ctx, messages, addMinutes(NOW, 10));
    expect(byKind(messages, "booking_confirmation")).toHaveLength(1);
    expect(confirmation.attempts.map((attempt) => attempt.outcome)).toEqual(["temporary_failure", "accepted"]);
    expect(confirmation.status).toBe("delivered");
  });

  it("fails after the attempt limit", () => {
    const ctx = makeCtx({ "confirm:a1": ["temporary_failure", "temporary_failure", "temporary_failure"] });
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    runUntil(ctx, messages, addMinutes(NOW, 120));
    const [confirmation] = byKind(messages, "booking_confirmation");
    expect(confirmation.attempts).toHaveLength(3);
    expect(confirmation.status).toBe("failed");
  });

  it("treats a timeout as unknown, never resends immediately, and reconciles to delivered", () => {
    const ctx = makeCtx({ "confirm:a1": ["timeout"] });
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    const [confirmation] = byKind(messages, "booking_confirmation");
    expect(confirmation).toMatchObject({ status: "unknown", reason: "awaiting_provider_confirmation" });
    expect(confirmation.sentBody).toBeTruthy();

    processNow({ ...ctx, now: addMinutes(NOW, 5) }, messages);
    expect(confirmation.status).toBe("unknown");
    expect(confirmation.attempts).toHaveLength(1);

    runUntil(ctx, messages, addMinutes(NOW, 16));
    expect(confirmation.status).toBe("delivered");
    expect(confirmation.attempts).toHaveLength(1);
    expect(confirmation.attempts[0].reconciledAs).toBe("delivered");
  });

  it("retries the same message only after a confirmed 'not received'", () => {
    const ctx = makeCtx({ "confirm:a1": ["timeout", "accepted"] });
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    const [confirmation] = byKind(messages, "booking_confirmation");
    reconcileUnknown({ ...ctx, now: addMinutes(NOW, 2) }, confirmation, "not_received");
    expect(confirmation.status).toBe("scheduled");
    expect(confirmation.sentBody).toBeUndefined();

    runUntil(ctx, messages, addMinutes(NOW, 30));
    expect(byKind(messages, "booking_confirmation")).toHaveLength(1);
    expect(confirmation.attempts).toHaveLength(2);
    expect(confirmation.status).toBe("delivered");
  });

  it("marks an undeliverable handset as failed after acceptance", () => {
    const ctx = makeCtx();
    ctx.dataset.customers[0].undeliverable = true;
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    runUntil(ctx, messages, addMinutes(NOW, 2));
    expect(byKind(messages, "booking_confirmation")[0]).toMatchObject({ status: "failed", reason: "delivery_failed" });
  });
});

describe("marketing rules", () => {
  const mctx = () => makeCtx({}, local("2026-09-01", "12:00"));
  const visit = (id: string, serviceIds: string[], date = "2026-09-01") =>
    appointment(id, {
      customerId: "noa",
      serviceIds,
      startTime: local(date, "10:00"),
      endTime: local(date, "11:00"),
    });

  it("is not planned while rebooking is off or has no interval", () => {
    const ctx = mctx();
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut"]));
    expect(byKind(messages, "rebooking_invite")).toHaveLength(0);

    ctx.automations.rebooking_invite.enabled = true;
    complete(ctx, messages, visit("v2", ["cut"]));
    expect(byKind(messages, "rebooking_invite")).toHaveLength(0);
  });

  it("does not treat a missing consent record as marketing consent", () => {
    const ctx = mctx();
    enableRebooking(ctx);
    ctx.dataset.customers[0].consent.marketing = { status: "unknown" };
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut"]));
    runUntil(ctx, messages, local("2026-10-02", "12:00"));
    expect(byKind(messages, "rebooking_invite")[0]).toMatchObject({ status: "skipped", reason: "consent_marketing_missing" });
  });

  it("defers outside the send window and sends when it opens", () => {
    const ctx = mctx();
    enableRebooking(ctx, 30, "10:00");
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut"]));
    const [invite] = byKind(messages, "rebooking_invite");
    expect(invite.plannedFor).toBe(local("2026-10-01", "10:00"));

    ctx.settings.marketingWindow = { start: "12:00", end: "19:00" };
    const after = runUntil(ctx, messages, local("2026-10-01", "11:00"));
    expect(invite).toMatchObject({ status: "deferred", reason: "outside_send_window" });
    expect(invite.scheduledFor).toBe(local("2026-10-01", "12:00"));

    runUntil(after, messages, local("2026-10-01", "12:30"));
    expect(invite.sentAt).toBe(local("2026-10-01", "12:00"));
  });

  it("does not apply marketing limits to transactional messages", () => {
    const ctx = makeCtx({}, local("2026-10-05", "22:30"));
    ctx.settings.monthlyMarketingBudgetCents = 0;
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    expect(byKind(messages, "booking_confirmation")[0].status).toBe("sent");
  });

  it("defers by the frequency cap, or skips when the wait gets too long", () => {
    const ctx = mctx();
    enableRebooking(ctx, 30);
    ctx.automations.rebooking_invite.published.serviceOverrides = {
      color: { serviceId: "color", intervalDays: 33 },
    };
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut"]));
    complete(ctx, messages, visit("v2", ["color"]));
    const [first, second] = byKind(messages, "rebooking_invite");

    let current = runUntil(ctx, messages, local("2026-10-04", "12:00"));
    expect(first.status).toBe("delivered");
    expect(second).toMatchObject({ status: "deferred", reason: "frequency_cap" });
    expect(second.scheduledFor).toBe(addDays(first.sentAt!, 7));

    current = runUntil(current, messages, local("2026-10-09", "12:00"));
    expect(second.status).toBe("delivered");

    const strict = mctx();
    enableRebooking(strict, 30);
    strict.settings.frequencyCapDays = 30;
    strict.automations.rebooking_invite.published.serviceOverrides = { color: { serviceId: "color", intervalDays: 33 } };
    const strictMessages: ScheduledMessage[] = [];
    complete(strict, strictMessages, visit("v1", ["cut"]));
    complete(strict, strictMessages, visit("v2", ["color"]));
    runUntil(strict, strictMessages, local("2026-10-04", "12:00"));
    expect(byKind(strictMessages, "rebooking_invite")[1]).toMatchObject({ status: "skipped", reason: "frequency_cap_expired" });
  });

  it("pauses at the budget cap and resumes once the budget allows it", () => {
    const ctx = mctx();
    enableRebooking(ctx);
    ctx.settings.monthlyMarketingBudgetCents = 0;
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut"]));
    const current = runUntil(ctx, messages, local("2026-10-01", "10:30"));
    const [invite] = byKind(messages, "rebooking_invite");
    expect(invite).toMatchObject({ status: "paused", reason: "budget_cap" });
    expect(invite.attempts).toHaveLength(0);

    current.settings.monthlyMarketingBudgetCents = 10_000;
    processNow(current, messages);
    runUntil(current, messages, local("2026-10-01", "10:35"));
    expect(invite.status).toBe("delivered");
    expect(invite.attempts).toHaveLength(1);
  });

  it("cancels the invite when a future booking for the service exists", () => {
    const ctx = mctx();
    enableRebooking(ctx);
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut"]));
    book(ctx, messages, appointment("future", { customerId: "noa", serviceIds: ["cut"], startTime: local("2026-10-20", "10:00"), endTime: local("2026-10-20", "11:00") }));
    expect(byKind(messages, "rebooking_invite")[0]).toMatchObject({ status: "cancelled", reason: "future_booking_exists" });
  });

  it("re-checks future bookings at send time and keeps only the services still due", () => {
    const ctx = mctx();
    enableRebooking(ctx);
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut", "color"]));
    ctx.dataset.appointments.push(
      appointment("future", { customerId: "noa", serviceIds: ["color"], startTime: local("2026-10-20", "10:00"), endTime: local("2026-10-20", "11:00") }),
    );
    runUntil(ctx, messages, local("2026-10-01", "10:30"));
    const active = byKind(messages, "rebooking_invite").find((message) => message.reason !== "merged_into")!;
    expect(active.serviceIds).toEqual(["cut"]);
    expect(active.status).toBe("delivered");
  });

  it("merges invites for the same customer and day into one message", () => {
    const ctx = mctx();
    enableRebooking(ctx);
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut", "color"]));
    const invites = byKind(messages, "rebooking_invite");
    expect(invites).toHaveLength(2);
    expect(invites[0]).toMatchObject({ status: "scheduled", serviceIds: ["cut", "color"] });
    expect(invites[1]).toMatchObject({ status: "cancelled", reason: "merged_into", mergedInto: invites[0].id });
  });

  it("supersedes an older invite when the same service is done again", () => {
    const ctx = mctx();
    enableRebooking(ctx);
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut"], "2026-09-01"));
    complete(ctx, messages, visit("v2", ["cut"], "2026-09-10"));
    const [older, newer] = byKind(messages, "rebooking_invite");
    expect(older).toMatchObject({ status: "cancelled", reason: "superseded_by_new_visit" });
    expect(newer.plannedFor).toBe(local("2026-10-10", "10:00"));
  });

  it("never starts rebooking after a no-show", () => {
    const ctx = mctx();
    enableRebooking(ctx);
    const messages: ScheduledMessage[] = [];
    const appt = visit("v1", ["cut"]);
    ctx.dataset.appointments.push({ ...appt, status: "no-show" });
    handleAppointmentEvent(ctx, messages, { type: "no_show", appointmentId: "v1" });
    expect(byKind(messages, "rebooking_invite")).toHaveLength(0);
  });

  it("appends an opt-out link to marketing messages", () => {
    const ctx = mctx();
    enableRebooking(ctx);
    const messages: ScheduledMessage[] = [];
    complete(ctx, messages, visit("v1", ["cut"]));
    expect(byKind(messages, "rebooking_invite")[0].scheduledSnapshot.bodyPreview).toMatch(/להסרה: https:\/\/sln\.ai\/u\//);
  });
});

describe("publishing and toggling", () => {
  it("re-times pending reminders and refreshes their preview after publish", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    ctx.automations.appointment_reminder.published = {
      ...ctx.automations.appointment_reminder.published,
      version: 2,
      timing: { type: "day_before", time: "12:00" },
      bodies: { he: "תזכורת ל{שם פרטי} {תאריך} {שעה} {שירותים} {כתובת} {קישור לתור}" },
    };
    expect(applyPublishedVersion(ctx, messages, "appointment_reminder")).toBe(1);
    const [reminder] = byKind(messages, "appointment_reminder");
    expect(reminder.scheduledFor).toBe(local("2026-10-07", "12:00"));
    expect(reminder.scheduledSnapshot.automationVersion).toBe(2);
    expect(reminder.scheduledSnapshot.bodyPreview.startsWith("תזכורת לnoa")).toBe(true);
  });

  it("cancels pending messages when turned off and restores reminders when turned back on", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    ctx.automations.appointment_reminder.enabled = false;
    expect(onAutomationToggled(ctx, messages, "appointment_reminder")).toBe(1);
    expect(byKind(messages, "appointment_reminder")[0]).toMatchObject({ status: "cancelled", reason: "automation_disabled" });

    ctx.automations.appointment_reminder.enabled = true;
    expect(onAutomationToggled(ctx, messages, "appointment_reminder")).toBe(1);
    expect(byKind(messages, "appointment_reminder")).toHaveLength(1);
    expect(byKind(messages, "appointment_reminder")[0].status).toBe("scheduled");
  });

  it("cancels at send time when a service is excluded after scheduling", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    processNow(ctx, messages);
    ctx.automations.appointment_reminder.published.serviceOverrides = { cut: { serviceId: "cut", enabled: false } };
    runUntil(ctx, messages, local("2026-10-07", "10:05"));
    expect(byKind(messages, "appointment_reminder")[0]).toMatchObject({ status: "cancelled", reason: "service_excluded" });
  });
});

describe("content resolution", () => {
  it("uses a service override and falls back to the general value after reset", () => {
    const ctx = makeCtx();
    enableRebooking(ctx, 42);
    const version = ctx.automations.rebooking_invite.published;
    version.serviceOverrides = { color: { serviceId: "color", intervalDays: 35, bodies: { he: "צבע {שם פרטי}" } } };
    expect(resolveIntervalDays(version, "color")).toBe(35);
    expect(resolveIntervalDays(version, "cut")).toBe(42);
    expect(resolveBody(version, ["color"], "he", ctx.settings).body).toBe("צבע {שם פרטי}");
    expect(resolveBody(version, ["color", "cut"], "he", ctx.settings).body).toBe(version.bodies.he);

    delete version.serviceOverrides.color;
    expect(resolveIntervalDays(version, "color")).toBe(42);
  });

  it("falls back to the default language without translating", () => {
    const ctx = makeCtx();
    ctx.settings.enabledLanguages = ["he", "en"];
    const version = { ...ctx.automations.booking_confirmation.published, bodies: { he: "שלום {שם פרטי}" } };
    const result = resolveBody(version, ["cut"], "en", ctx.settings);
    expect(result).toEqual({ body: "שלום {שם פרטי}", lang: "he", usedFallbackLanguage: true });
  });

  it("never shows a missing price as zero", () => {
    const ctx = makeCtx();
    const version = { ...ctx.automations.booking_confirmation.published, bodies: { he: "{שם פרטי} מחיר: {מחיר}" } };
    const keratin = ctx.dataset.services.filter((service) => service.id === "keratin");
    expect(resolvePrice(version, ["keratin"], undefined, keratin)).toBeNull();
    expect(resolvePrice(version, ["cut", "keratin"], undefined, ctx.dataset.services)).toBeNull();

    ctx.dataset.appointments.push(appointment("a1", { customerId: "noa", serviceIds: ["keratin"] }));
    const rendered = renderMessage(
      ctx,
      { id: "x", automation: "booking_confirmation", customerId: "noa", appointmentId: "a1", serviceIds: ["keratin"], category: "transactional" },
      version,
    );
    expect(rendered.render.text).not.toMatch(/0/);
    expect(rendered.render.missingOptional).toContain("price");
    expect(rendered.render.missingRequired).toHaveLength(0);

    const hidden = { ...version, serviceOverrides: { cut: { serviceId: "cut", priceCents: null } } };
    expect(resolvePrice(hidden, ["cut"], undefined, ctx.dataset.services)).toBeNull();
  });
});

describe("salon projection", () => {
  it("forecasts without sending and explains what would block a message", () => {
    const ctx = makeCtx();
    ctx.settings.connection = "not_connected";
    ctx.dataset.appointments.push(appointment("a1", { customerId: "noa" }));
    const projected = projectSalonMessages(ctx);
    expect(projected).toHaveLength(1);
    expect(projected[0]).toMatchObject({ automation: "appointment_reminder", status: "scheduled", projectedBlock: "sms_not_connected" });
    expect(projected[0].attempts).toHaveLength(0);
  });
});

describe("helpers", () => {
  it("treats the window end as exclusive", () => {
    const window = { start: "09:00", end: "19:00" };
    expect(isWithinWindow(local("2026-10-05", "09:00"), TZ, window)).toBe(true);
    expect(isWithinWindow(local("2026-10-05", "18:59"), TZ, window)).toBe(true);
    expect(isWithinWindow(local("2026-10-05", "19:00"), TZ, window)).toBe(false);
  });

  it("counts SMS segments for GSM-7 and Unicode", () => {
    expect(smsSegments("a".repeat(160))).toMatchObject({ encoding: "GSM-7", segments: 1 });
    expect(smsSegments("a".repeat(161)).segments).toBe(2);
    expect(smsSegments("א".repeat(70))).toMatchObject({ encoding: "UCS-2", segments: 1 });
    expect(smsSegments("א".repeat(71)).segments).toBe(2);
  });

  it("reports the next wake-up time", () => {
    const ctx = makeCtx();
    const messages: ScheduledMessage[] = [];
    book(ctx, messages, appointment("a1", { customerId: "noa" }));
    expect(nextWake(messages)).toBe(NOW);
  });
});

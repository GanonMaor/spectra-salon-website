/**
 * Message templates: variables, rendering, validation and SMS segment math.
 *
 * Templates are stored with human, language-specific tokens (`{שם פרטי}` in
 * Hebrew, `{first name}` in English) so salon owners never see code. Both map
 * to the same variable key.
 */

import { formatDate, formatMoney, formatTime } from "./time";
import type {
  AutomationKind,
  AutomationTiming,
  AutomationVersion,
  LanguageCode,
  MarketingAppointment,
  MarketingCustomer,
  MarketingService,
  SalonProfile,
  SmsSettings,
} from "./types";

export type VariableKey =
  | "first_name"
  | "salon_name"
  | "date"
  | "time"
  | "services"
  | "service_name"
  | "staff_name"
  | "duration"
  | "prep"
  | "price"
  | "address"
  | "branch"
  | "salon_phone"
  | "booking_link"
  | "unsubscribe_link";

export interface VariableDefinition {
  key: VariableKey;
  labels: Record<LanguageCode, string>;
  /** A missing required value stops the send with a clear reason. */
  required: boolean;
  kinds: AutomationKind[] | "all";
}

const APPOINTMENT_KINDS: AutomationKind[] = [
  "booking_confirmation",
  "appointment_reminder",
  "appointment_rescheduled",
  "appointment_cancelled",
];

export const VARIABLES: VariableDefinition[] = [
  { key: "first_name", labels: { he: "שם פרטי", en: "first name" }, required: true, kinds: "all" },
  { key: "salon_name", labels: { he: "שם הסלון", en: "salon name" }, required: true, kinds: "all" },
  { key: "date", labels: { he: "תאריך", en: "date" }, required: true, kinds: APPOINTMENT_KINDS },
  { key: "time", labels: { he: "שעה", en: "time" }, required: true, kinds: APPOINTMENT_KINDS },
  { key: "services", labels: { he: "שירותים", en: "services" }, required: true, kinds: APPOINTMENT_KINDS },
  { key: "service_name", labels: { he: "שם השירות", en: "service" }, required: true, kinds: ["rebooking_invite"] },
  { key: "staff_name", labels: { he: "שם הספר", en: "stylist" }, required: false, kinds: APPOINTMENT_KINDS },
  { key: "duration", labels: { he: "משך התור", en: "duration" }, required: false, kinds: APPOINTMENT_KINDS },
  { key: "prep", labels: { he: "הנחיות הכנה", en: "prep notes" }, required: false, kinds: ["booking_confirmation", "appointment_reminder"] },
  { key: "price", labels: { he: "מחיר", en: "price" }, required: false, kinds: ["booking_confirmation", "appointment_reminder", "rebooking_invite"] },
  { key: "address", labels: { he: "כתובת", en: "address" }, required: true, kinds: "all" },
  { key: "branch", labels: { he: "סניף", en: "branch" }, required: false, kinds: "all" },
  { key: "salon_phone", labels: { he: "טלפון הסלון", en: "salon phone" }, required: true, kinds: "all" },
  { key: "booking_link", labels: { he: "קישור לתור", en: "booking link" }, required: true, kinds: "all" },
  { key: "unsubscribe_link", labels: { he: "קישור להסרה", en: "opt-out link" }, required: true, kinds: ["rebooking_invite"] },
];

const VARIABLE_BY_KEY = new Map(VARIABLES.map((variable) => [variable.key, variable]));
const VARIABLE_BY_LABEL = new Map<string, VariableKey>();
for (const variable of VARIABLES) {
  VARIABLE_BY_LABEL.set(variable.labels.he, variable.key);
  VARIABLE_BY_LABEL.set(variable.labels.en.toLowerCase(), variable.key);
  VARIABLE_BY_LABEL.set(variable.key, variable.key);
}

export function variableToken(key: VariableKey, lang: LanguageCode): string {
  return `{${VARIABLE_BY_KEY.get(key)?.labels[lang] ?? key}}`;
}

export function variablesForKind(kind: AutomationKind): VariableDefinition[] {
  return VARIABLES.filter((variable) => variable.kinds === "all" || variable.kinds.includes(kind));
}

export function resolveToken(label: string): VariableKey | null {
  const trimmed = label.trim();
  return VARIABLE_BY_LABEL.get(trimmed) ?? VARIABLE_BY_LABEL.get(trimmed.toLowerCase()) ?? null;
}

const TOKEN_PATTERN = /\{([^{}]+)\}/g;

export function extractTokens(body: string): { known: VariableKey[]; unknown: string[] } {
  const known = new Set<VariableKey>();
  const unknown = new Set<string>();
  for (const match of body.matchAll(TOKEN_PATTERN)) {
    const key = resolveToken(match[1]);
    if (key) known.add(key);
    else unknown.add(match[1].trim());
  }
  return { known: [...known], unknown: [...unknown] };
}

// ── Default content ─────────────────────────────────────────────────

export const DEFAULT_BODIES: Record<AutomationKind, Record<LanguageCode, string>> = {
  booking_confirmation: {
    he: "היי {שם פרטי}, התור שלך ב{שם הסלון} נקבע ל{תאריך} בשעה {שעה}: {שירותים}. לשינוי או ביטול: {קישור לתור}",
    en: "Hi {first name}, your appointment at {salon name} is booked for {date} at {time}: {services}. To change or cancel: {booking link}",
  },
  appointment_reminder: {
    he: "תזכורת: מחכים לך ב{שם הסלון} ב{תאריך} בשעה {שעה} ל{שירותים}. {הנחיות הכנה} לשינוי: {קישור לתור}",
    en: "Reminder: we're expecting you at {salon name} on {date} at {time} for {services}. {prep notes} To change: {booking link}",
  },
  appointment_rescheduled: {
    he: "היי {שם פרטי}, התור שלך ב{שם הסלון} עודכן ל{תאריך} בשעה {שעה}. לפרטים: {קישור לתור}",
    en: "Hi {first name}, your appointment at {salon name} was moved to {date} at {time}. Details: {booking link}",
  },
  appointment_cancelled: {
    he: "היי {שם פרטי}, התור שלך ב{שם הסלון} ל{תאריך} בשעה {שעה} בוטל. לקביעת תור חדש: {קישור לתור}",
    en: "Hi {first name}, your appointment at {salon name} on {date} at {time} was cancelled. To book again: {booking link}",
  },
  rebooking_invite: {
    he: "היי {שם פרטי}, הגיע הזמן לרענן את {שם השירות}. לקביעת תור התקשרי ל{טלפון הסלון}. נשמח לראות אותך!",
    en: "Hi {first name}, it's time to refresh your {service}. To book, call {salon phone}. We'd love to see you!",
  },
};

export const DEFAULT_TIMINGS: Record<AutomationKind, AutomationTiming> = {
  booking_confirmation: { type: "immediate" },
  appointment_reminder: { type: "day_before", time: "10:00" },
  appointment_rescheduled: { type: "immediate" },
  appointment_cancelled: { type: "immediate" },
  rebooking_invite: { type: "after_service", intervalDays: null, time: "10:00" },
};

// ── Rendering ───────────────────────────────────────────────────────

export interface RenderContext {
  lang: LanguageCode;
  timeZone: string;
  salon: SalonProfile;
  customer?: MarketingCustomer;
  appointment?: MarketingAppointment;
  services: MarketingService[];
  /** Price to show; `undefined`/`null` means unavailable. */
  priceCents?: number | null;
  isMarketing: boolean;
  unsubscribeUrl?: string;
}

export interface RenderResult {
  text: string;
  missingRequired: VariableKey[];
  missingOptional: VariableKey[];
  unknownTokens: string[];
  /** Tokens that exist but do not apply to this message type. */
  unavailableTokens: VariableKey[];
  usedFallback: Partial<Record<VariableKey, true>>;
}

function joinNames(names: string[], lang: LanguageCode): string {
  if (names.length <= 1) return names[0] ?? "";
  const conjunction = lang === "he" ? " ו" : " and ";
  return `${names.slice(0, -1).join(", ")}${conjunction}${names[names.length - 1]}`;
}

function durationLabel(minutes: number, lang: LanguageCode): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (lang === "he") {
    if (hours && rest) return `${hours} שע׳ ו־${rest} דק׳`;
    if (hours) return hours === 1 ? "שעה" : `${hours} שעות`;
    return `${rest} דק׳`;
  }
  if (hours && rest) return `${hours}h ${rest}m`;
  if (hours) return `${hours}h`;
  return `${rest}m`;
}

export function buildValues(ctx: RenderContext): {
  values: Partial<Record<VariableKey, string>>;
  usedFallback: Partial<Record<VariableKey, true>>;
} {
  const { lang, salon, customer, appointment, services, timeZone } = ctx;
  const values: Partial<Record<VariableKey, string>> = {};
  const usedFallback: Partial<Record<VariableKey, true>> = {};
  const names = services.map((service) => service.name).filter(Boolean);
  const set = (key: VariableKey, value: string | undefined | null) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") values[key] = String(value).trim();
  };

  set("first_name", customer?.firstName);
  set("salon_name", salon.name);
  set("address", salon.address);
  set("branch", salon.branchName);
  set("salon_phone", salon.phone);
  if (salon.bookingUrl) {
    set("booking_link", salon.bookingUrl);
  } else if (salon.phone) {
    set("booking_link", salon.phone);
    usedFallback.booking_link = true;
  }
  if (appointment) {
    set("date", formatDate(appointment.startTime, timeZone, lang));
    set("time", formatTime(appointment.startTime, timeZone, lang));
    set("staff_name", appointment.staffName);
    const minutes = Math.round(
      (new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / 60_000,
    );
    if (minutes > 0) set("duration", durationLabel(minutes, lang));
  }
  set("services", joinNames(names, lang));
  set("service_name", joinNames(names, lang));
  const prep = services.map((service) => service.prepInstructions).filter(Boolean) as string[];
  set("prep", prep.join(" "));
  if (typeof ctx.priceCents === "number" && ctx.priceCents > 0) set("price", formatMoney(ctx.priceCents, lang));
  set("unsubscribe_link", ctx.unsubscribeUrl);
  return { values, usedFallback };
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.,!?:;])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function renderTemplate(body: string, kind: AutomationKind, ctx: RenderContext): RenderResult {
  const { values, usedFallback } = buildValues(ctx);
  const allowed = new Set(variablesForKind(kind).map((variable) => variable.key));
  const missingRequired = new Set<VariableKey>();
  const missingOptional = new Set<VariableKey>();
  const unknownTokens = new Set<string>();
  const unavailableTokens = new Set<VariableKey>();

  let source = body;
  if (ctx.isMarketing && !extractTokens(body).known.includes("unsubscribe_link")) {
    const label = ctx.lang === "he" ? "להסרה" : "Opt out";
    source = `${body}\n${label}: ${variableToken("unsubscribe_link", ctx.lang)}`;
  }

  const text = source.replace(TOKEN_PATTERN, (raw, label: string) => {
    const key = resolveToken(label);
    if (!key) {
      unknownTokens.add(label.trim());
      return raw;
    }
    if (!allowed.has(key)) {
      unavailableTokens.add(key);
      return "";
    }
    const value = values[key];
    if (value === undefined) {
      if (VARIABLE_BY_KEY.get(key)?.required) missingRequired.add(key);
      else missingOptional.add(key);
      return "";
    }
    return value;
  });

  return {
    text: tidy(text),
    missingRequired: [...missingRequired],
    missingOptional: [...missingOptional],
    unknownTokens: [...unknownTokens],
    unavailableTokens: [...unavailableTokens],
    usedFallback,
  };
}

// ── SMS segments ────────────────────────────────────────────────────

const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXTENDED = "^{}\\[~]|€";

export interface SegmentInfo {
  encoding: "GSM-7" | "UCS-2";
  units: number;
  segments: number;
  perSegment: number;
}

export function smsSegments(text: string): SegmentInfo {
  let gsm = true;
  let gsmUnits = 0;
  for (const char of text) {
    if (GSM_BASIC.includes(char)) gsmUnits += 1;
    else if (GSM_EXTENDED.includes(char)) gsmUnits += 2;
    else {
      gsm = false;
      break;
    }
  }
  if (gsm) {
    const segments = gsmUnits === 0 ? 0 : gsmUnits <= 160 ? 1 : Math.ceil(gsmUnits / 153);
    return { encoding: "GSM-7", units: gsmUnits, segments, perSegment: segments > 1 ? 153 : 160 };
  }
  const units = text.length;
  const segments = units === 0 ? 0 : units <= 70 ? 1 : Math.ceil(units / 67);
  return { encoding: "UCS-2", units, segments, perSegment: segments > 1 ? 67 : 70 };
}

// ── Validation (editor) ─────────────────────────────────────────────

export type ValidationCode =
  | "empty_default_body"
  | "missing_language_body"
  | "unknown_token"
  | "unavailable_token"
  | "interval_required"
  | "invalid_time"
  | "opt_out_appended"
  | "missing_first_name_token";

export interface ValidationIssue {
  level: "error" | "warning" | "info";
  code: ValidationCode;
  detail?: string;
  lang?: LanguageCode;
}

export function validateVersion(
  kind: AutomationKind,
  version: AutomationVersion,
  settings: Pick<SmsSettings, "defaultLanguage" | "enabledLanguages">,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const allowed = new Set(variablesForKind(kind).map((variable) => variable.key));
  const defaultBody = version.bodies[settings.defaultLanguage]?.trim();
  if (!defaultBody) issues.push({ level: "error", code: "empty_default_body", lang: settings.defaultLanguage });

  for (const lang of settings.enabledLanguages) {
    const body = version.bodies[lang]?.trim();
    if (!body) {
      if (lang !== settings.defaultLanguage) issues.push({ level: "warning", code: "missing_language_body", lang });
      continue;
    }
    const tokens = extractTokens(body);
    for (const token of tokens.unknown) issues.push({ level: "error", code: "unknown_token", detail: token, lang });
    for (const key of tokens.known) {
      if (!allowed.has(key)) {
        issues.push({ level: "error", code: "unavailable_token", detail: VARIABLE_BY_KEY.get(key)?.labels[lang], lang });
      }
    }
    if (kind === "rebooking_invite" && !tokens.known.includes("unsubscribe_link")) {
      issues.push({ level: "info", code: "opt_out_appended", lang });
    }
  }

  const timing = version.timing;
  if (timing.type === "after_service" && (!timing.intervalDays || timing.intervalDays < 1)) {
    issues.push({ level: "error", code: "interval_required" });
  }
  if ((timing.type === "day_before" || timing.type === "after_service") && !/^([01]\d|2[0-3]):[0-5]\d$/.test(timing.time)) {
    issues.push({ level: "error", code: "invalid_time" });
  }
  return issues;
}

export function hasBlockingIssues(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.level === "error");
}

/**
 * Salon-timezone helpers. All scheduling decisions are made in the salon's
 * IANA timezone, never the browser's.
 */

import type { LanguageCode } from "./types";

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

export function zonedParts(iso: string, timeZone: string): ZonedParts {
  const values: Record<string, string> = {};
  for (const part of partsFormatter(timeZone).formatToParts(new Date(iso))) {
    values[part.type] = part.value;
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour) % 24,
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function offsetMs(utcMs: number, timeZone: string): number {
  const p = zonedParts(new Date(utcMs).toISOString(), timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** Convert a wall-clock time in `timeZone` to an ISO instant. */
export function zonedTimeToIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): string {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = offsetMs(guess, timeZone);
  let utc = guess - first;
  const second = offsetMs(utc, timeZone);
  if (second !== first) utc = guess - second;
  return new Date(utc).toISOString();
}

export function parseHm(value: string): { hour: number; minute: number } {
  const [h, m] = value.split(":").map((part) => Number(part));
  return {
    hour: Number.isFinite(h) ? Math.min(23, Math.max(0, h)) : 0,
    minute: Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0,
  };
}

export function isValidHm(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function localDateKey(iso: string, timeZone: string): string {
  const p = zonedParts(iso, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function localMinutes(iso: string, timeZone: string): number {
  const p = zonedParts(iso, timeZone);
  return p.hour * 60 + p.minute;
}

/** Local date of `iso` shifted by `days`, at local `time`. */
export function atLocalTimeAfterDays(iso: string, timeZone: string, days: number, time: string): string {
  const p = zonedParts(iso, timeZone);
  const shifted = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
  const { hour, minute } = parseHm(time);
  return zonedTimeToIso(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    hour,
    minute,
    timeZone,
  );
}

/** Local midnight on the first day of the month containing `iso`. */
export function startOfLocalMonth(iso: string, timeZone: string): string {
  const p = zonedParts(iso, timeZone);
  return zonedTimeToIso(p.year, p.month, 1, 0, 0, timeZone);
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function addDays(iso: string, days: number): string {
  return addMinutes(iso, days * 24 * 60);
}

export function isBefore(a: string, b: string): boolean {
  return new Date(a).getTime() < new Date(b).getTime();
}

export function isOnOrBefore(a: string, b: string): boolean {
  return new Date(a).getTime() <= new Date(b).getTime();
}

export function maxIso(a: string, b: string): string {
  return isBefore(a, b) ? b : a;
}

/** Whether `iso` falls inside [start, end) in local salon time. */
export function isWithinWindow(iso: string, timeZone: string, window: { start: string; end: string }): boolean {
  const minutes = localMinutes(iso, timeZone);
  const start = parseHm(window.start);
  const end = parseHm(window.end);
  return minutes >= start.hour * 60 + start.minute && minutes < end.hour * 60 + end.minute;
}

/** The earliest instant at or after `iso` that is inside the window. */
export function nextAllowedInstant(iso: string, timeZone: string, window: { start: string; end: string }): string {
  if (isWithinWindow(iso, timeZone, window)) return iso;
  const minutes = localMinutes(iso, timeZone);
  const start = parseHm(window.start);
  const startMinutes = start.hour * 60 + start.minute;
  return atLocalTimeAfterDays(iso, timeZone, minutes < startMinutes ? 0 : 1, window.start);
}

function locale(lang: LanguageCode): string {
  return lang === "he" ? "he-IL" : "en-GB";
}

export function formatDate(iso: string, timeZone: string, lang: LanguageCode): string {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function formatTime(iso: string, timeZone: string, lang: LanguageCode): string {
  return new Intl.DateTimeFormat(locale(lang), {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, timeZone: string, lang: LanguageCode): string {
  return `${formatDate(iso, timeZone, lang)} · ${formatTime(iso, timeZone, lang)}`;
}

export function formatMoney(cents: number, lang: LanguageCode, currency = "ILS"): string {
  return new Intl.NumberFormat(locale(lang), {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

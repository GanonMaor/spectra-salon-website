/**
 * Seedless date-range helpers for the live analytics dashboard.
 *
 * These are pure utilities. They intentionally do NOT import any seed or
 * mock data so that runtime report components can consume date helpers
 * without pulling the legacy seed/mock analytics module into the bundle.
 *
 * Presets are calendar / wall-clock relative to "now":
 * - today  → today
 * - week   → last 7 days through today
 * - month  → start of this month through today (MTD)
 * - year   → Jan 1 of this year through today (YTD)
 * - all    → full visit history when activity timestamps are provided
 */
import type { CrmLang } from "../SalonCRM/i18n/translations";

export type DatePreset = "today" | "week" | "month" | "year" | "all" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  preset: DatePreset;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type ActivityTimestamp = string | Date | number | null | undefined;

export function monthLabel(d: Date, lang: CrmLang = "en"): string {
  const month = new Intl.DateTimeFormat(lang === "he" ? "he-IL" : "en-US", { month: "short" }).format(d);
  return `${month} ${d.getFullYear()}`;
}

export function parseMonthLabel(label: string): Date {
  const yearMatch = label.match(/(\d{4})$/);
  const year = Number(yearMatch?.[1]);
  const monthText = label.replace(/\s*\d{4}$/, "");
  const monthIndex = Array.from({ length: 12 }, (_, index) => index).find((index) => {
    const date = new Date(2020, index, 1);
    const en = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
    const he = new Intl.DateTimeFormat("he-IL", { month: "short" }).format(date);
    return monthText === en || monthText === he || monthText === MONTH_NAMES[index];
  });
  return new Date(year, monthIndex ?? -1, 1);
}

export function monthInRange(monthLabelValue: string, range: DateRange): boolean {
  const start = parseMonthLabel(monthLabelValue);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
  return start <= range.to && end >= range.from;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

/** Latest finite activity timestamp, or null when none. */
export function latestActivityDate(timestamps: ActivityTimestamp[] = []): Date | null {
  let max = Number.NEGATIVE_INFINITY;
  for (const value of timestamps) {
    if (value == null) continue;
    const ms = new Date(value).getTime();
    if (!Number.isFinite(ms)) continue;
    if (ms > max) max = ms;
  }
  return Number.isFinite(max) ? new Date(max) : null;
}

/** Default view: calendar year-to-date (Jan 1 → today). */
export function getDefaultRange(now: Date = new Date()): DateRange {
  return rangeFromPreset("year", [], now);
}

/** True when at least one timestamp falls inside the range (inclusive). */
export function hasActivityInRange(
  timestamps: ActivityTimestamp[],
  range: DateRange,
): boolean {
  const fromMs = range.from.getTime();
  const toMs = range.to.getTime();
  return timestamps.some((value) => {
    if (value == null) return false;
    const ms = new Date(value).getTime();
    return Number.isFinite(ms) && ms >= fromMs && ms <= toMs;
  });
}

/**
 * Range covering the earliest→latest activity timestamps.
 * End stays on the latest visit so empty future months do not dilute history.
 */
export function rangeCoveringActivity(timestamps: ActivityTimestamp[]): DateRange {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const value of timestamps) {
    if (value == null) continue;
    const ms = new Date(value).getTime();
    if (!Number.isFinite(ms)) continue;
    if (ms < min) min = ms;
    if (ms > max) max = ms;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { ...getDefaultRange(), preset: "all" };
  }
  return {
    from: startOfDay(new Date(min)),
    to: endOfDay(new Date(max)),
    preset: "all",
  };
}

export function rangeFromPreset(
  preset: DatePreset,
  timestamps: ActivityTimestamp[] = [],
  now: Date = new Date(),
): DateRange {
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now), preset };
    case "week": {
      const from = new Date(now);
      from.setDate(from.getDate() - 6);
      return { from: startOfDay(from), to: endOfDay(now), preset };
    }
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: startOfDay(from), to: endOfDay(now), preset };
    }
    case "all": {
      if (timestamps.length > 0) return rangeCoveringActivity(timestamps);
      const from = new Date(now.getFullYear() - 10, 0, 1);
      return { from: startOfDay(from), to: endOfDay(now), preset };
    }
    case "year":
    default: {
      // Calendar YTD: 1 Jan of the current year → today.
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: startOfDay(from), to: endOfDay(now), preset: "year" };
    }
  }
}

/** Filter monthly rows (keyed by a "Mon YYYY" label) to those in range. */
export function filterMonthly<T extends { month: string }>(data: T[], range: DateRange): T[] {
  return data.filter((row) => monthInRange(row.month, range));
}

/** Enumerate the first-of-month dates that fall inside the range. */
export function monthsInRange(range: DateRange): Date[] {
  const out: Date[] = [];
  const cursor = new Date(range.from.getFullYear(), range.from.getMonth(), 1);
  const end = new Date(range.to.getFullYear(), range.to.getMonth(), 1);
  while (cursor <= end) {
    out.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}

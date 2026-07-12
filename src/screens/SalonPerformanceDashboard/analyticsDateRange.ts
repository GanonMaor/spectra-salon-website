/**
 * Seedless date-range helpers for the live analytics dashboard.
 *
 * These are pure utilities. They intentionally do NOT import any seed or
 * mock data so that runtime report components can consume date helpers
 * without pulling the legacy seed/mock analytics module into the bundle.
 *
 * Presets are relative to "today" so a live salon always sees a rolling
 * window rather than a hardcoded 2025/2026 range.
 */

export type DatePreset = "today" | "week" | "month" | "year" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
  preset: DatePreset;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthLabel(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function parseMonthLabel(label: string): Date {
  const parts = label.split(" ");
  return new Date(Number(parts[1]), MONTH_NAMES.indexOf(parts[0]), 1);
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

/** Default view: the trailing 12 months ending today. */
export function getDefaultRange(): DateRange {
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  return { from: startOfDay(from), to: endOfDay(today), preset: "year" };
}

export function rangeFromPreset(preset: DatePreset): DateRange {
  const today = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(today), to: endOfDay(today), preset };
    case "week": {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      return { from: startOfDay(from), to: endOfDay(today), preset };
    }
    case "month": {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: startOfDay(from), to: endOfDay(today), preset };
    }
    case "year":
    default:
      return getDefaultRange();
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

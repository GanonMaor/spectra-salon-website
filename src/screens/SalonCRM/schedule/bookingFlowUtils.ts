/**
 * Booking flow formatting helpers.
 */

export function minutesToLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Minutes-from-midnight to "HH:MM". */
export function clockFromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatPriceCents(cents: number, currencySymbol = "₪"): string {
  const value = cents / 100;
  const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return `${currencySymbol}${rounded}`;
}

export function snapToInterval(minutes: number, interval = 15): number {
  return Math.round(minutes / interval) * interval;
}

export function buildDateAtMinutes(baseDay: Date, minutesFromMidnight: number): Date {
  const d = new Date(baseDay);
  d.setHours(Math.floor(minutesFromMidnight / 60), Math.round(minutesFromMidnight % 60), 0, 0);
  return d;
}

export function minutesFromDate(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

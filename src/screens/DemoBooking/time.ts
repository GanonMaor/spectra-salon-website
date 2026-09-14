export interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const pad = (value: number): string => String(value).padStart(2, "0");

export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function getWallClock(instant: Date | number, timeZone: string): WallClock {
  const date = typeof instant === "number" ? new Date(instant) : instant;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

export function getOffsetMinutes(instant: Date, timeZone: string): number {
  const wall = getWallClock(instant, timeZone);
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  return Math.round((asUtc - instant.getTime()) / 60000);
}

export function formatIsoWithOffset(instant: Date, timeZone: string): string {
  const wall = getWallClock(instant, timeZone);
  const offset = getOffsetMinutes(instant, timeZone);
  const sign = offset >= 0 ? "+" : "-";
  const abs = Math.abs(offset);
  return `${wall.year}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}:${pad(wall.second)}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

export function formatDateKey(instant: Date, timeZone: string): string {
  const wall = getWallClock(instant, timeZone);
  return `${wall.year}-${pad(wall.month)}-${pad(wall.day)}`;
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

/**
 * Interpret a wall-clock date + minutes-from-midnight in `timeZone`
 * and return the corresponding instant.
 */
export function wallClockToDate(dateKey: string, minutesFromMidnight: number, timeZone: string): Date {
  const { year, month, day } = parseDateKey(dateKey);
  const hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  let instant = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let i = 0; i < 4; i += 1) {
    const wall = getWallClock(instant, timeZone);
    const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
    const actual = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, 0);
    const diff = desired - actual;
    if (diff === 0) break;
    instant += diff;
  }

  return new Date(instant);
}

export function wallClockToIso(dateKey: string, minutesFromMidnight: number, timeZone: string): string {
  return formatIsoWithOffset(wallClockToDate(dateKey, minutesFromMidnight, timeZone), timeZone);
}

export function formatTimeZoneOffsetLabel(timeZone: string, at: Date = new Date()): string {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName")?.value;

  return name?.replace("UTC", "GMT") ?? "GMT";
}

export function formatSlotTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function formatFriendlyDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatFriendlyDateTime(iso: string, timeZone: string): string {
  const date = formatFriendlyDate(iso, timeZone);
  const time = formatSlotTime(iso, timeZone);
  return `${date} at ${time}`;
}

export function formatMonthTitle(year: number, monthIndex: number, timeZone: string): string {
  const sample = wallClockToDate(
    `${year}-${pad(monthIndex + 1)}-01`,
    12 * 60,
    timeZone,
  );
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    year: "numeric",
  }).format(sample);
}

export function weekdayShortLabels(): string[] {
  return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
}

export function isWeekendDateKey(dateKey: string): boolean {
  const { year, month, day } = parseDateKey(dateKey);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 || weekday === 6;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const { year, month, day } = parseDateKey(dateKey);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

export function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b);
}

export function todayDateKey(timeZone: string, now = new Date()): string {
  return formatDateKey(now, timeZone);
}

export function dateKeyFromIso(iso: string, timeZone: string): string {
  return formatDateKey(new Date(iso), timeZone);
}

export function toUtcCompact(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

export function startOfMonthDateKey(year: number, monthIndex: number): string {
  return `${year}-${pad(monthIndex + 1)}-01`;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function weekdayOfDateKey(dateKey: string): number {
  const { year, month, day } = parseDateKey(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function buildMonthGrid(year: number, monthIndex: number): string[] {
  const first = startOfMonthDateKey(year, monthIndex);
  const leading = weekdayOfDateKey(first);
  const total = daysInMonth(year, monthIndex);
  const cells: string[] = [];

  for (let i = 0; i < leading; i += 1) {
    cells.push(addDaysToDateKey(first, i - leading));
  }
  for (let day = 1; day <= total; day += 1) {
    cells.push(`${year}-${pad(monthIndex + 1)}-${pad(day)}`);
  }
  while (cells.length % 7 !== 0) {
    cells.push(addDaysToDateKey(cells[cells.length - 1], 1));
  }
  while (cells.length < 42) {
    cells.push(addDaysToDateKey(cells[cells.length - 1], 1));
  }

  return cells;
}

export function shiftMonth(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; month: number } {
  const date = new Date(Date.UTC(year, monthIndex + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

export function isPastDateKey(dateKey: string, timeZone: string, now = new Date()): boolean {
  return compareDateKeys(dateKey, todayDateKey(timeZone, now)) < 0;
}

export function isPastSlot(startIso: string, now = new Date()): boolean {
  return new Date(startIso).getTime() <= now.getTime();
}

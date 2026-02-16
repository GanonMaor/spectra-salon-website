import type { Appointment } from "./calendarTypes";

// ── Date helpers ────────────────────────────────────────────────────

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function getWeekDays(base: Date): Date[] {
  const start = startOfWeek(base);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDayLabel(d: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[d.getDay()]} ${d.getDate()}`;
}

export function formatFullDate(d: Date): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m > 0 ? `${h12}:${String(m).padStart(2, "0")} ${ampm}` : `${h12} ${ampm}`;
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

// ── Appointment positioning ─────────────────────────────────────────

export const HOUR_START = 8;  // calendar starts at 8 AM
export const HOUR_END = 21;   // calendar ends at 9 PM
export const SLOT_HEIGHT = 64; // px per hour

export function appointmentTop(appt: Appointment): number {
  const h = appt.start.getHours() + appt.start.getMinutes() / 60;
  return (h - HOUR_START) * SLOT_HEIGHT;
}

export function appointmentHeight(appt: Appointment): number {
  const startH = appt.start.getHours() + appt.start.getMinutes() / 60;
  const endH = appt.end.getHours() + appt.end.getMinutes() / 60;
  return Math.max((endH - startH) * SLOT_HEIGHT, 20);
}

export function getAppointmentsForDay(appointments: Appointment[], day: Date, employeeId?: string | null): Appointment[] {
  return appointments.filter((a) => {
    if (employeeId && a.employeeId !== employeeId) return false;
    return isSameDay(a.start, day);
  });
}

export function getHourSlots(): number[] {
  const slots: number[] = [];
  for (let h = HOUR_START; h < HOUR_END; h++) slots.push(h);
  return slots;
}

export function formatHourLabel(hour: number): string {
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12} ${ampm}`;
}

// ── Drag & Resize helpers ───────────────────────────────────────────

export function snapMinutes(minutes: number, interval: number = 15): number {
  return Math.round(minutes / interval) * interval;
}

export function dateToMinutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function buildDateWithMinutes(baseDay: Date, minutesFromMidnight: number): Date {
  const d = new Date(baseDay);
  d.setHours(Math.floor(minutesFromMidnight / 60), Math.round(minutesFromMidnight % 60), 0, 0);
  return d;
}

export function clampToWorkingWindow(
  startMin: number,
  endMin: number,
  minDuration: number = 15,
): { start: number; end: number } {
  if (endMin <= startMin) endMin = startMin + minDuration;
  let s = Math.max(startMin, HOUR_START * 60);
  let e = Math.min(endMin, HOUR_END * 60);
  if (e - s < minDuration) {
    if (s + minDuration <= HOUR_END * 60) {
      e = s + minDuration;
    } else {
      e = HOUR_END * 60;
      s = Math.max(HOUR_START * 60, e - minDuration);
    }
  }
  return { start: s, end: e };
}

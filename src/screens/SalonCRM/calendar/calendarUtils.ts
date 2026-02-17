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
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
  return `${String(hour).padStart(2, "0")}:00`;
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

// ── Validation helpers ──────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

export function validateAppointment(appt: {
  clientName?: string;
  serviceName?: string;
  start?: Date;
  end?: Date;
  employeeId?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!appt.clientName || appt.clientName.trim().length === 0) {
    errors.push({ field: "clientName", message: "Client name is required" });
  }
  if (!appt.serviceName || appt.serviceName.trim().length === 0) {
    errors.push({ field: "serviceName", message: "Service name is required" });
  }
  if (!appt.employeeId) {
    errors.push({ field: "employeeId", message: "Employee is required" });
  }
  if (!appt.start || !appt.end) {
    errors.push({ field: "time", message: "Start and end times are required" });
  } else if (appt.end.getTime() <= appt.start.getTime()) {
    errors.push({ field: "time", message: "End time must be after start time" });
  } else {
    const durationMin = (appt.end.getTime() - appt.start.getTime()) / 60000;
    if (durationMin < 15) {
      errors.push({ field: "time", message: "Minimum appointment duration is 15 minutes" });
    }
  }

  return errors;
}

export function validateSegments(
  segments: Array<{ start: Date; end: Date; sortOrder: number }>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (segments.length < 2) {
    errors.push({ field: "segments", message: "At least 2 segments required for a split" });
    return errors;
  }

  const sorted = [...segments].sort((a, b) => a.sortOrder - b.sortOrder);

  for (let i = 0; i < sorted.length; i++) {
    const seg = sorted[i];
    if (seg.end.getTime() <= seg.start.getTime()) {
      errors.push({ field: `segment_${i}`, message: `Segment ${i + 1}: end must be after start` });
    }
    const durMin = (seg.end.getTime() - seg.start.getTime()) / 60000;
    if (durMin < 5) {
      errors.push({ field: `segment_${i}`, message: `Segment ${i + 1}: minimum duration is 5 minutes` });
    }
  }

  return errors;
}

export function checkOverlap(
  appointments: Appointment[],
  employeeId: string,
  start: Date,
  end: Date,
  excludeId?: string,
): boolean {
  return appointments.some((a) => {
    if (a.id === excludeId) return false;
    if (a.employeeId !== employeeId) return false;
    return a.start.getTime() < end.getTime() && a.end.getTime() > start.getTime();
  });
}

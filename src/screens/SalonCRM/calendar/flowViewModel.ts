/**
 * Flow View model — pure layout + temporal state over existing appointments.
 *
 * This is a presentation layer only. It does not fetch, mutate, or duplicate
 * schedule data. Future stage / delay / prediction fields can be filled here
 * without changing the calendar source of truth.
 */

import type { Appointment, Employee } from "./calendarTypes";
import { dateToMinutes, getAppointmentsForDay } from "./calendarUtils";
import type {
  FlowBarLayout,
  FlowDaySummary,
  FlowLiveVisitRef,
  FlowTemporalState,
  FlowTimeWindow,
  FlowVisitRow,
} from "./flowViewTypes";

export const FLOW_DEFAULT_START_HOUR = 9;
export const FLOW_DEFAULT_END_HOUR = 19;
export const FLOW_MIN_HOUR = 7;
export const FLOW_MAX_HOUR = 22;
export const FLOW_PX_PER_HOUR = 112;
export const FLOW_LABEL_WIDTH_PX = 220;
export const FLOW_ROW_HEIGHT_PX = 58;

const ARRIVING_SOON_MINUTES = 60;
const FINISHING_SOON_MINUTES = 45;

function floorHourMinutes(minutes: number): number {
  return Math.floor(minutes / 60) * 60;
}

function ceilHourMinutes(minutes: number): number {
  return Math.ceil(minutes / 60) * 60;
}

function clampHourMinutes(minutes: number): number {
  return Math.max(FLOW_MIN_HOUR * 60, Math.min(FLOW_MAX_HOUR * 60, minutes));
}

export function resolveFlowWindow(
  appointments: Appointment[],
  nowMinutes?: number,
): FlowTimeWindow {
  let startMinutes = FLOW_DEFAULT_START_HOUR * 60;
  let endMinutes = FLOW_DEFAULT_END_HOUR * 60;

  for (const appt of appointments) {
    startMinutes = Math.min(startMinutes, floorHourMinutes(dateToMinutes(appt.start)));
    endMinutes = Math.max(endMinutes, ceilHourMinutes(dateToMinutes(appt.end)));
  }

  const nowIsDuringSalonHours = nowMinutes != null
    && nowMinutes >= FLOW_MIN_HOUR * 60
    && nowMinutes <= FLOW_MAX_HOUR * 60;
  if (nowIsDuringSalonHours) {
    startMinutes = Math.min(startMinutes, floorHourMinutes(nowMinutes));
    endMinutes = Math.max(endMinutes, ceilHourMinutes(nowMinutes + 1));
  }

  startMinutes = clampHourMinutes(startMinutes);
  endMinutes = clampHourMinutes(endMinutes);
  if (endMinutes <= startMinutes) endMinutes = startMinutes + 60;

  return { startMinutes, endMinutes };
}

export function flowWindowHours(window: FlowTimeWindow): number[] {
  const hours: number[] = [];
  for (let minutes = window.startMinutes; minutes < window.endMinutes; minutes += 60) {
    hours.push(minutes / 60);
  }
  return hours;
}

export function flowWindowWidthPx(window: FlowTimeWindow): number {
  return ((window.endMinutes - window.startMinutes) / 60) * FLOW_PX_PER_HOUR;
}

export function layoutFlowBar(
  start: Date,
  end: Date,
  window: FlowTimeWindow,
): FlowBarLayout {
  const span = Math.max(1, window.endMinutes - window.startMinutes);
  const startMin = dateToMinutes(start);
  const endMin = Math.max(startMin + 15, dateToMinutes(end));
  const leftPct = ((startMin - window.startMinutes) / span) * 100;
  const widthPct = ((endMin - startMin) / span) * 100;
  return {
    leftPct: Math.max(0, leftPct),
    widthPct: Math.max(1.4, widthPct),
  };
}

export function layoutNowLine(
  nowMinutes: number,
  window: FlowTimeWindow,
): number | null {
  if (nowMinutes < window.startMinutes || nowMinutes > window.endMinutes) return null;
  const span = Math.max(1, window.endMinutes - window.startMinutes);
  return ((nowMinutes - window.startMinutes) / span) * 100;
}

function isLiveVisit(visit: FlowLiveVisitRef): boolean {
  return visit.status === "active";
}

export function isAppointmentInSalon(
  appointment: Appointment,
  liveVisits: FlowLiveVisitRef[],
): boolean {
  if (appointment.status === "in-progress") return true;
  return liveVisits.some((visit) => {
    if (!isLiveVisit(visit)) return false;
    if (visit.appointmentId && visit.appointmentId === appointment.id) return true;
    return Boolean(appointment.customerId && visit.customerId === appointment.customerId);
  });
}

export function resolveFlowTemporalState(input: {
  start: Date;
  end: Date;
  status: Appointment["status"];
  isInSalon: boolean;
  now: Date;
}): FlowTemporalState {
  if (input.status === "completed" || input.status === "cancelled" || input.status === "no-show") {
    return "ended";
  }
  if (input.isInSalon || input.status === "in-progress") {
    if (input.now.getTime() >= input.end.getTime()) return "ended";
    return "active";
  }
  if (input.now.getTime() >= input.end.getTime()) return "ended";
  if (input.now.getTime() >= input.start.getTime()) return "active";
  return "upcoming";
}

export function buildFlowRows(input: {
  appointments: Appointment[];
  day: Date;
  employees: Employee[];
  liveVisits: FlowLiveVisitRef[];
  selectedEmployeeId?: string | null;
  now: Date;
  customerAvatars?: Record<string, string | undefined>;
}): FlowVisitRow[] {
  const empMap = new Map(input.employees.map((employee) => [employee.id, employee]));
  const dayAppointments = getAppointmentsForDay(
    input.appointments,
    input.day,
    input.selectedEmployeeId,
  ).filter((appointment) => appointment.status !== "cancelled");
  const nowMs = input.now.getTime();

  return dayAppointments
    .map((appointment) => {
      const isInSalon = isAppointmentInSalon(appointment, input.liveVisits);
      const temporalState = resolveFlowTemporalState({
        start: appointment.start,
        end: appointment.end,
        status: appointment.status,
        isInSalon,
        now: input.now,
      });
      const msUntilStart = appointment.start.getTime() - nowMs;
      const msUntilEnd = appointment.end.getTime() - nowMs;
      const arrivingSoon = temporalState === "upcoming"
        && msUntilStart <= ARRIVING_SOON_MINUTES * 60_000
        && msUntilStart >= 0;
      const finishingSoon = (temporalState === "active" || isInSalon)
        && msUntilEnd <= FINISHING_SOON_MINUTES * 60_000
        && msUntilEnd > 0;

      return {
        id: appointment.id,
        appointmentId: appointment.id,
        customerId: appointment.customerId,
        customerName: appointment.clientName,
        customerAvatarUrl: appointment.customerId
          ? input.customerAvatars?.[appointment.customerId]
          : undefined,
        staffId: appointment.employeeId,
        staffName: empMap.get(appointment.employeeId)?.name ?? "",
        staffAvatarUrl: empMap.get(appointment.employeeId)?.avatar || undefined,
        serviceName: appointment.serviceName,
        category: appointment.serviceCategory,
        status: appointment.status,
        start: appointment.start,
        plannedEnd: appointment.end,
        temporalState,
        isInSalon,
        arrivingSoon,
        finishingSoon,
      } satisfies FlowVisitRow;
    })
    .sort((a, b) => {
      const startDelta = a.start.getTime() - b.start.getTime();
      if (startDelta !== 0) return startDelta;
      return a.customerName.localeCompare(b.customerName);
    });
}

export function summarizeFlowDay(rows: FlowVisitRow[]): FlowDaySummary {
  return {
    inSalon: rows.filter((row) => row.isInSalon).length,
    arrivingSoon: rows.filter((row) => row.arrivingSoon).length,
    finishingSoon: rows.filter((row) => row.finishingSoon).length,
    total: rows.length,
  };
}

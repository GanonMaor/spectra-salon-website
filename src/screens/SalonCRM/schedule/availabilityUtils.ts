/**
 * Availability and conflict validation for the booking flow.
 *
 * This is structured validation, not optimization: it stops impossible
 * bookings and explains why. It checks working hours, staff overlaps against
 * existing appointments, required assignments, and in-composition resource
 * double-booking.
 */

import type { AppointmentComposition } from "./bookingFlowTypes";
import { layoutComposition } from "./appointmentCompositionUtils";
import { clockFromMinutes } from "./bookingFlowUtils";

export interface ConflictItem {
  severity: "error" | "warning";
  message: string;
  stageId?: string;
}

export interface AvailabilityResult {
  ok: boolean;
  hasBlocking: boolean;
  conflicts: ConflictItem[];
}

/** Minimal shape of an existing calendar appointment for overlap checks. */
export interface ExistingBusyBlock {
  employeeId: string;
  startMinutes: number;
  endMinutes: number;
  isSameDay: boolean;
}

interface ValidateParams {
  composition: AppointmentComposition;
  existing: ExistingBusyBlock[];
  workingStartHour: number;
  workingEndHour: number;
  staffNameById: Record<string, string>;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function validateComposition(params: ValidateParams): AvailabilityResult {
  const { composition, existing, workingStartHour, workingEndHour, staffNameById } = params;
  const conflicts: ConflictItem[] = [];

  if (composition.services.length === 0) {
    return { ok: false, hasBlocking: true, conflicts: [{ severity: "error", message: "Add at least one service." }] };
  }

  const laid = layoutComposition(composition.services);
  const base = composition.startMinutes;
  const workStart = workingStartHour * 60;
  const workEnd = workingEndHour * 60;

  // Working-hours bounds.
  let journeyEnd = base;
  for (const svc of laid) {
    for (const stage of svc.stages) {
      journeyEnd = Math.max(journeyEnd, base + stage.startOffsetMinutes + stage.durationMinutes);
    }
  }
  if (base < workStart) {
    conflicts.push({ severity: "error", message: `Start ${clockFromMinutes(base)} is before working hours.` });
  }
  if (journeyEnd > workEnd) {
    conflicts.push({ severity: "error", message: `Appointment ends at ${clockFromMinutes(journeyEnd)}, beyond working hours.` });
  }

  // Same-day existing blocks per employee.
  const busyByEmployee = new Map<string, ExistingBusyBlock[]>();
  for (const b of existing) {
    if (!b.isSameDay) continue;
    const list = busyByEmployee.get(b.employeeId) ?? [];
    list.push(b);
    busyByEmployee.set(b.employeeId, list);
  }

  // In-composition resource bookings to detect double-use.
  const resourceBookings: Array<{ resourceId: string; start: number; end: number; stageId: string }> = [];

  for (const svc of laid) {
    for (const stage of svc.stages) {
      const stageStart = base + stage.startOffsetMinutes;
      const stageEnd = stageStart + stage.durationMinutes;

      if (stage.isActiveStaffTime) {
        if (!stage.employeeId) {
          conflicts.push({ severity: "error", stageId: stage.id, message: `${svc.serviceName} · ${stage.label} has no employee assigned.` });
        } else {
          const busy = busyByEmployee.get(stage.employeeId) ?? [];
          const clash = busy.find((b) => overlaps(stageStart, stageEnd, b.startMinutes, b.endMinutes));
          if (clash) {
            const name = staffNameById[stage.employeeId] ?? "Staff";
            conflicts.push({
              severity: "error",
              stageId: stage.id,
              message: `${name} is not available for ${svc.serviceName} · ${stage.label} at ${clockFromMinutes(stageStart)}.`,
            });
          }
        }
      }

      if (stage.requiredResourceType && !stage.resourceId) {
        conflicts.push({
          severity: "warning",
          stageId: stage.id,
          message: `${svc.serviceName} · ${stage.label} has no ${stage.requiredResourceType.replace("-", " ")} assigned.`,
        });
      }

      if (stage.resourceId) {
        const clash = resourceBookings.find(
          (r) => r.resourceId === stage.resourceId && overlaps(stageStart, stageEnd, r.start, r.end),
        );
        if (clash) {
          conflicts.push({
            severity: "warning",
            stageId: stage.id,
            message: `Resource is used by two stages at the same time around ${clockFromMinutes(stageStart)}.`,
          });
        }
        resourceBookings.push({ resourceId: stage.resourceId, start: stageStart, end: stageEnd, stageId: stage.id });
      }
    }
  }

  const hasBlocking = conflicts.some((c) => c.severity === "error");
  return { ok: !hasBlocking, hasBlocking, conflicts };
}

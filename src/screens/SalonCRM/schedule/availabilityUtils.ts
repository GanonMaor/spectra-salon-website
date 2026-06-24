/**
 * Availability and conflict validation for the booking flow.
 *
 * This is structured validation, not optimization: it stops impossible
 * bookings and explains why. It checks working hours, staff overlaps against
 * existing appointments, required assignments, and in-composition resource
 * double-booking.
 */

import type { AppointmentComposition } from "./bookingFlowTypes";
import type { CrmTranslations } from "../i18n/translations";
import type { ResourceType } from "./catalogTypes";
import { layoutComposition } from "./appointmentCompositionUtils";
import { clockFromMinutes } from "./bookingFlowUtils";
import { resourceTypeLabel } from "./serviceCatalogUtils";

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

/** Localized message builders for conflict explanations. */
export interface ConflictTexts {
  addService: string;
  beforeHours: (time: string) => string;
  afterHours: (time: string) => string;
  noEmployee: (service: string, stage: string) => string;
  staffBusy: (name: string, service: string, stage: string, time: string) => string;
  noResource: (service: string, stage: string, resource: string) => string;
  resourceDouble: (time: string) => string;
  resourceLabel: (type: ResourceType) => string;
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? `{${k}}`);
}

/** Build localized conflict texts from the CRM translations. */
export function buildConflictTexts(t: CrmTranslations): ConflictTexts {
  const w = t.schedule.wizard;
  return {
    addService: w.conflictAddService,
    beforeHours: (time) => fill(w.conflictBeforeHours, { time }),
    afterHours: (time) => fill(w.conflictAfterHours, { time }),
    noEmployee: (service, stage) => fill(w.conflictNoEmployee, { service, stage }),
    staffBusy: (name, service, stage, time) => fill(w.conflictStaffBusy, { name, service, stage, time }),
    noResource: (service, stage, resource) => fill(w.conflictNoResource, { service, stage, resource }),
    resourceDouble: (time) => fill(w.conflictResourceDouble, { time }),
    resourceLabel: (type) => resourceTypeLabel(t, type),
  };
}

const DEFAULT_TEXTS: ConflictTexts = {
  addService: "Add at least one service.",
  beforeHours: (time) => `Start ${time} is before working hours.`,
  afterHours: (time) => `Appointment ends at ${time}, beyond working hours.`,
  noEmployee: (service, stage) => `${service} · ${stage} has no employee assigned.`,
  staffBusy: (name, service, stage, time) => `${name} is not available for ${service} · ${stage} at ${time}.`,
  noResource: (service, stage, resource) => `${service} · ${stage} has no ${resource} assigned.`,
  resourceDouble: (time) => `Resource is used by two stages at the same time around ${time}.`,
  resourceLabel: (type) => type.replace("-", " "),
};

interface ValidateParams {
  composition: AppointmentComposition;
  existing: ExistingBusyBlock[];
  workingStartHour: number;
  workingEndHour: number;
  staffNameById: Record<string, string>;
  texts?: ConflictTexts;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function validateComposition(params: ValidateParams): AvailabilityResult {
  const { composition, existing, workingStartHour, workingEndHour, staffNameById } = params;
  const texts = params.texts ?? DEFAULT_TEXTS;
  const conflicts: ConflictItem[] = [];

  if (composition.services.length === 0) {
    return { ok: false, hasBlocking: true, conflicts: [{ severity: "error", message: texts.addService }] };
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
    conflicts.push({ severity: "error", message: texts.beforeHours(clockFromMinutes(base)) });
  }
  if (journeyEnd > workEnd) {
    conflicts.push({ severity: "error", message: texts.afterHours(clockFromMinutes(journeyEnd)) });
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
          conflicts.push({ severity: "error", stageId: stage.id, message: texts.noEmployee(svc.serviceName, stage.label) });
        } else {
          const busy = busyByEmployee.get(stage.employeeId) ?? [];
          const clash = busy.find((b) => overlaps(stageStart, stageEnd, b.startMinutes, b.endMinutes));
          if (clash) {
            const name = staffNameById[stage.employeeId] ?? "Staff";
            conflicts.push({
              severity: "error",
              stageId: stage.id,
              message: texts.staffBusy(name, svc.serviceName, stage.label, clockFromMinutes(stageStart)),
            });
          }
        }
      }

      if (stage.requiredResourceType && !stage.resourceId) {
        conflicts.push({
          severity: "warning",
          stageId: stage.id,
          message: texts.noResource(svc.serviceName, stage.label, texts.resourceLabel(stage.requiredResourceType)),
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
            message: texts.resourceDouble(clockFromMinutes(stageStart)),
          });
        }
        resourceBookings.push({ resourceId: stage.resourceId, start: stageStart, end: stageEnd, stageId: stage.id });
      }
    }
  }

  const hasBlocking = conflicts.some((c) => c.severity === "error");
  return { ok: !hasBlocking, hasBlocking, conflicts };
}

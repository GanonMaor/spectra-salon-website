/**
 * Appointment composition utilities.
 *
 * Turns catalog services into an editable, multi-stage appointment
 * composition, lays the stages out on a single sequential client journey,
 * computes time/price totals, and produces the canonical CRM create payload
 * (appointment fields + generated segments).
 */

import type { AppointmentSegment, ServiceCategoryId } from "../data/crmTypes";
import type { CatalogService, ClientServiceTimingOverride } from "./catalogTypes";
import type {
  AppointmentComposition,
  CompositionService,
  CompositionStage,
  CompositionTotals,
} from "./bookingFlowTypes";
import { buildDateAtMinutes } from "./bookingFlowUtils";

let instanceCounter = 0;
function nextInstanceId(): string {
  instanceCounter += 1;
  return `ci-${Date.now().toString(36)}-${instanceCounter}`;
}

/**
 * Build a composition service (with stages) from a catalog service. Applies
 * a client-specific timing override when one is present.
 */
export function buildCompositionService(
  service: CatalogService,
  defaultEmployeeId: string,
  newStageId: () => string,
  isLinked = false,
  timingOverride?: ClientServiceTimingOverride,
): CompositionService {
  const stages: CompositionStage[] = service.defaultStages.map((def) => ({
    id: newStageId(),
    definitionId: def.id,
    label: def.label,
    segmentType: def.segmentType,
    durationMinutes: timingOverride?.stageDurations[def.id] ?? def.durationMinutes,
    isActiveStaffTime: def.isActiveStaffTime,
    employeeId: defaultEmployeeId,
    requiredResourceType: def.requiredResourceType,
    resourceId: undefined,
    startOffsetMinutes: 0,
  }));

  return {
    instanceId: nextInstanceId(),
    serviceId: service.id,
    serviceName: service.name,
    crmCategoryId: service.crmCategoryId,
    categoryId: service.categoryId,
    priceCents: service.defaultPriceCents,
    isLinked,
    stages,
  };
}

/**
 * Lay out all stages sequentially from the appointment start time. Each stage
 * occupies the time directly after the previous one (a single-chair client
 * journey). Returns a new services array with computed `startOffsetMinutes`.
 */
export function layoutComposition(
  services: CompositionService[],
): CompositionService[] {
  let cursor = 0;
  return services.map((svc) => ({
    ...svc,
    stages: svc.stages.map((stage) => {
      const startOffsetMinutes = cursor;
      cursor += stage.durationMinutes;
      return { ...stage, startOffsetMinutes };
    }),
  }));
}

export function computeTotals(
  composition: AppointmentComposition,
): CompositionTotals {
  const laid = layoutComposition(composition.services);
  let processing = 0;
  let price = 0;
  const activeByEmployee: Record<string, number> = {};
  let journeyEnd = 0;

  for (const svc of laid) {
    price += svc.priceCents;
    for (const stage of svc.stages) {
      const stageEnd = stage.startOffsetMinutes + stage.durationMinutes;
      journeyEnd = Math.max(journeyEnd, stageEnd);
      if (stage.isActiveStaffTime) {
        activeByEmployee[stage.employeeId] = (activeByEmployee[stage.employeeId] ?? 0) + stage.durationMinutes;
      } else {
        processing += stage.durationMinutes;
      }
    }
  }

  return {
    clientJourneyMinutes: journeyEnd,
    processingMinutes: processing,
    totalPriceCents: price,
    activeByEmployee,
    endMinutes: composition.startMinutes + journeyEnd,
  };
}

export interface CompositionCreatePayload {
  staffMemberId: string;
  customerId?: string;
  customerName: string;
  primaryServiceId?: string;
  serviceName: string;
  serviceCategoryId: ServiceCategoryId;
  start: Date;
  end: Date;
  notes?: string;
  segments: Array<Omit<AppointmentSegment, "id" | "appointmentId">>;
}

/**
 * Convert a composition into a canonical CRM create payload. All stages
 * across all services become ordered appointment segments.
 */
export function buildCreatePayload(
  composition: AppointmentComposition,
): CompositionCreatePayload {
  const laid = layoutComposition(composition.services);
  const totals = computeTotals(composition);
  const start = buildDateAtMinutes(composition.date, composition.startMinutes);
  const end = buildDateAtMinutes(composition.date, totals.endMinutes);

  const segments: Array<Omit<AppointmentSegment, "id" | "appointmentId">> = [];
  let sortOrder = 0;
  for (const svc of laid) {
    for (const stage of svc.stages) {
      const segStart = buildDateAtMinutes(composition.date, composition.startMinutes + stage.startOffsetMinutes);
      const segEnd = buildDateAtMinutes(composition.date, composition.startMinutes + stage.startOffsetMinutes + stage.durationMinutes);
      segments.push({
        segmentType: stage.segmentType,
        label: svc.stages.length > 1 ? `${svc.serviceName} · ${stage.label}` : svc.serviceName,
        startTime: segStart.toISOString(),
        endTime: segEnd.toISOString(),
        sortOrder: sortOrder++,
      });
    }
  }

  const primary = laid[0];
  const serviceNames = laid.map((s) => s.serviceName).join(" + ");

  return {
    staffMemberId: composition.defaultEmployeeId,
    customerId: composition.client?.id,
    customerName: composition.client?.name ?? "Walk-in",
    primaryServiceId: primary?.serviceId,
    serviceName: serviceNames || "Appointment",
    serviceCategoryId: primary?.crmCategoryId ?? "other",
    start,
    end,
    notes: composition.notes || undefined,
    segments,
  };
}

/** Build a timing override record from the current (edited) composition. */
export function buildTimingOverrides(
  composition: AppointmentComposition,
): ClientServiceTimingOverride[] {
  if (!composition.client?.id) return [];
  const now = new Date().toISOString();
  const byService = new Map<string, ClientServiceTimingOverride>();
  for (const svc of composition.services) {
    if (svc.isLinked) continue;
    const existing = byService.get(svc.serviceId) ?? {
      customerId: composition.client.id,
      serviceId: svc.serviceId,
      stageDurations: {},
      updatedAt: now,
    };
    for (const stage of svc.stages) {
      existing.stageDurations[stage.definitionId] = stage.durationMinutes;
    }
    byService.set(svc.serviceId, existing);
  }
  return Array.from(byService.values());
}

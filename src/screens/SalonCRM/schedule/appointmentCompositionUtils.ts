/**
 * Appointment composition utilities.
 *
 * Turns catalog services into an editable, multi-stage appointment
 * composition, lays the stages out on a single sequential client journey,
 * computes time/price totals, and produces the canonical CRM create payload
 * (appointment fields + generated segments).
 */

import type { AppointmentSegment, ServiceCategoryId, SegmentType } from "../data/crmTypes";
import type { Appointment as UIAppointment } from "../calendar/calendarTypes";
import { categoryFromUI } from "../calendar/calendarAdapters";
import type { CatalogService, ClientServiceTimingOverride } from "./catalogTypes";
import type {
  AppointmentComposition,
  CompositionService,
  CompositionStage,
  CompositionTotals,
} from "./bookingFlowTypes";
import { buildDateAtMinutes, minutesFromDate } from "./bookingFlowUtils";
import { SEGMENT_TYPE_LABELS } from "./serviceCatalogUtils";

let instanceCounter = 0;
function nextInstanceId(): string {
  instanceCounter += 1;
  return `ci-${Date.now().toString(36)}-${instanceCounter}`;
}

/**
 * Whether a segment type consumes active staff time. Processing/waiting frees
 * the employee; every other stage keeps them on the chair.
 */
export function isActiveStaffSegment(type: SegmentType): boolean {
  return type !== "wait";
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
        staffMemberId: stage.employeeId,
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

  // The appointment lives in the column of its primary staff member: prefer the
  // first active-staff stage so reassigning the main stage moves the card.
  const firstActiveStage = laid
    .flatMap((s) => s.stages)
    .find((st) => st.isActiveStaffTime && st.employeeId);

  return {
    staffMemberId: firstActiveStage?.employeeId ?? composition.defaultEmployeeId,
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

/**
 * Build an editable composition from an existing calendar appointment so the
 * same workflow editor can power create *and* edit. Existing segments become
 * editable stages (apply / wait / wash / …); an appointment without segments
 * starts as a single service stage the user can then split into more stages.
 *
 * `services` is the active catalog used to recover the service's price and
 * category mapping when the appointment matches a known service.
 */
export function buildCompositionFromAppointment(
  appt: UIAppointment,
  services: CatalogService[],
  newStageId: () => string,
): AppointmentComposition {
  const crmCategoryId = categoryFromUI(appt.serviceCategory);
  const active = services.filter((s) => s.status === "active");
  const matched =
    active.find((s) => s.name.toLowerCase() === appt.serviceName.toLowerCase()) ??
    active.find((s) => s.crmCategoryId === crmCategoryId);

  const startMinutes = minutesFromDate(appt.start);
  const sortedSegments = (appt.segments ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  let stages: CompositionStage[];
  if (sortedSegments.length > 0) {
    stages = sortedSegments.map((seg) => ({
      id: newStageId(),
      definitionId: "",
      label: seg.label || SEGMENT_TYPE_LABELS[seg.segmentType],
      segmentType: seg.segmentType,
      durationMinutes: Math.max(5, Math.round((seg.end.getTime() - seg.start.getTime()) / 60000)),
      isActiveStaffTime: isActiveStaffSegment(seg.segmentType),
      employeeId: appt.employeeId,
      requiredResourceType: undefined,
      resourceId: undefined,
      startOffsetMinutes: 0,
    }));
  } else {
    const total = Math.max(5, Math.round((appt.end.getTime() - appt.start.getTime()) / 60000));
    stages = [{
      id: newStageId(),
      definitionId: "",
      label: appt.serviceName,
      segmentType: "service",
      durationMinutes: total,
      isActiveStaffTime: true,
      employeeId: appt.employeeId,
      requiredResourceType: undefined,
      resourceId: undefined,
      startOffsetMinutes: 0,
    }];
  }

  const service: CompositionService = {
    instanceId: nextInstanceId(),
    serviceId: matched?.id ?? "",
    serviceName: appt.serviceName,
    crmCategoryId,
    categoryId: matched?.categoryId ?? "",
    priceCents: matched?.defaultPriceCents ?? 0,
    isLinked: false,
    stages,
  };

  return {
    entryType: "appointment",
    client: { id: appt.customerId, name: appt.clientName },
    defaultEmployeeId: appt.employeeId,
    date: new Date(appt.start),
    startMinutes,
    services: [service],
    notes: appt.notes ?? "",
    saveClientTiming: false,
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

/**
 * Adapters between the canonical CRM data model (`crmTypes`) and the
 * legacy calendar view-model (`calendarTypes`).
 *
 * The Schedule UI was built with native `Date` objects and a fixed set
 * of `serviceCategory` strings. The shared CRM state stores ISO 8601
 * timestamps and `ServiceCategoryId` keys. These adapters keep the UI
 * untouched while routing through the single source of truth.
 */

import type {
  Appointment as CrmAppointment,
  AppointmentSegment as CrmSegment,
  ServiceCategoryId,
  StaffMember,
} from "../data/crmTypes";
import type {
  Appointment as UIAppointment,
  AppointmentSegment as UISegment,
  Employee as UIEmployee,
} from "./calendarTypes";

const CATEGORY_TO_LABEL: Record<ServiceCategoryId, UIAppointment["serviceCategory"]> = {
  color: "Color",
  highlights: "Highlights",
  toner: "Toner",
  straightening: "Straightening",
  cut: "Cut",
  treatment: "Treatment",
  other: "Other",
};

const LABEL_TO_CATEGORY: Record<UIAppointment["serviceCategory"], ServiceCategoryId> = {
  Color: "color",
  Highlights: "highlights",
  Toner: "toner",
  Straightening: "straightening",
  Cut: "cut",
  Treatment: "treatment",
  Other: "other",
};

export function toUIAppointment(canonical: CrmAppointment): UIAppointment {
  const segments: UISegment[] | undefined = canonical.segments && canonical.segments.length > 1
    ? canonical.segments.map(segmentToUI)
    : undefined;
  return {
    id: canonical.id,
    employeeId: canonical.staffMemberId,
    clientName: canonical.customerName,
    serviceName: canonical.serviceName,
    serviceCategory: CATEGORY_TO_LABEL[canonical.serviceCategoryId],
    start: new Date(canonical.startTime),
    end: new Date(canonical.endTime),
    status: canonical.status,
    notes: canonical.notes,
    customerId: canonical.customerId,
    salonId: canonical.salonId,
    groupId: canonical.groupId,
    segments,
  };
}

function segmentToUI(seg: CrmSegment): UISegment {
  return {
    id: seg.id,
    appointmentId: seg.appointmentId,
    segmentType: seg.segmentType,
    label: seg.label,
    start: new Date(seg.startTime),
    end: new Date(seg.endTime),
    sortOrder: seg.sortOrder,
    productGrams: seg.productGrams,
    notes: seg.notes,
  };
}

export function categoryFromUI(label: UIAppointment["serviceCategory"]): ServiceCategoryId {
  return LABEL_TO_CATEGORY[label];
}

export function categoryToUILabel(id: ServiceCategoryId): UIAppointment["serviceCategory"] {
  return CATEGORY_TO_LABEL[id];
}

export function toUIEmployee(staff: StaffMember): UIEmployee {
  return {
    id: staff.id,
    name: staff.name,
    avatar: staff.avatarUrl ?? "",
    role: staff.role,
    color: staff.color,
  };
}

export function uiSegmentToCanonical(seg: UISegment, appointmentId: string): CrmSegment {
  return {
    id: seg.id,
    appointmentId,
    segmentType: seg.segmentType,
    label: seg.label,
    startTime: seg.start.toISOString(),
    endTime: seg.end.toISOString(),
    sortOrder: seg.sortOrder,
    productGrams: seg.productGrams,
    notes: seg.notes,
  };
}

import type { Appointment, AppointmentSegment, SplitTemplate, SplitTemplateStep } from "./calendarTypes";

// ── Server → UI mappers ─────────────────────────────────────────────

export function mapServerAppointment(raw: Record<string, any>): Appointment {
  const segs: AppointmentSegment[] = (raw.segments || [])
    .filter((s: any) => s && s.id)
    .map((s: any) => mapServerSegment(s, raw.id));

  // Derive start/end from segments if available, else fallback
  let start: Date;
  let end: Date;

  if (segs.length > 0) {
    const sorted = [...segs].sort((a, b) => a.sortOrder - b.sortOrder);
    start = sorted[0].start;
    end = sorted[sorted.length - 1].end;
  } else {
    start = new Date();
    end = new Date(start.getTime() + 60 * 60000);
  }

  return {
    id: raw.id,
    employeeId: raw.employee_id,
    clientName: raw.client_name,
    serviceName: raw.service_name,
    serviceCategory: raw.service_category || "Other",
    start,
    end,
    status: raw.status || "confirmed",
    notes: raw.notes || undefined,
    segments: segs.length > 0 ? segs : undefined,
    groupId: raw.id,
  };
}

export function mapServerSegment(raw: Record<string, any>, appointmentId?: string): AppointmentSegment {
  return {
    id: raw.id,
    appointmentId: appointmentId || raw.appointment_id,
    segmentType: raw.segment_type || "service",
    label: raw.label || "",
    start: new Date(raw.start_time),
    end: new Date(raw.end_time),
    sortOrder: raw.sort_order ?? 0,
    productGrams: raw.product_grams ?? undefined,
    notes: raw.notes ?? undefined,
  };
}

export function mapServerTemplate(raw: Record<string, any>): SplitTemplate {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category || "Other",
    description: raw.description || undefined,
    steps: (raw.steps || [])
      .filter((s: any) => s && s.id)
      .map((s: any): SplitTemplateStep => ({
        id: s.id,
        stepType: s.step_type || "service",
        label: s.label,
        durationMinutes: s.duration_minutes,
        sortOrder: s.sort_order ?? 0,
        isGap: !!s.is_gap,
      })),
  };
}

// ── UI → Server mappers ─────────────────────────────────────────────

export function appointmentToServer(appt: Appointment): Record<string, any> {
  return {
    employee_id: appt.employeeId,
    client_name: appt.clientName,
    service_name: appt.serviceName,
    service_category: appt.serviceCategory,
    status: appt.status,
    notes: appt.notes || null,
    segments: appt.segments?.map(segmentToServer) ?? [
      {
        segment_type: "service",
        label: appt.serviceName,
        start_time: appt.start.toISOString(),
        end_time: appt.end.toISOString(),
        sort_order: 0,
      },
    ],
  };
}

export function segmentToServer(seg: AppointmentSegment): Record<string, any> {
  return {
    segment_type: seg.segmentType,
    label: seg.label,
    start_time: seg.start.toISOString(),
    end_time: seg.end.toISOString(),
    sort_order: seg.sortOrder,
    product_grams: seg.productGrams ?? null,
    notes: seg.notes ?? null,
  };
}

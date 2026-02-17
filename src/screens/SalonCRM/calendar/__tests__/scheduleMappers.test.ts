import {
  mapServerAppointment,
  mapServerSegment,
  mapServerTemplate,
  appointmentToServer,
  segmentToServer,
} from "../scheduleMappers";
import type { Appointment, AppointmentSegment } from "../calendarTypes";

describe("mapServerAppointment", () => {
  it("maps a raw server appointment to UI model", () => {
    const raw = {
      id: "appt-1",
      employee_id: "e1",
      client_name: "Jane Doe",
      service_name: "Balayage",
      service_category: "Highlights",
      status: "confirmed",
      notes: "VIP",
      segments: [
        {
          id: "seg-1",
          segment_type: "apply",
          label: "Apply Bleach",
          start_time: "2026-02-16T09:00:00.000Z",
          end_time: "2026-02-16T09:30:00.000Z",
          sort_order: 0,
          product_grams: 30,
          notes: null,
        },
        {
          id: "seg-2",
          segment_type: "wait",
          label: "Processing",
          start_time: "2026-02-16T09:30:00.000Z",
          end_time: "2026-02-16T10:15:00.000Z",
          sort_order: 1,
          product_grams: null,
          notes: null,
        },
      ],
    };

    const result = mapServerAppointment(raw);

    expect(result.id).toBe("appt-1");
    expect(result.employeeId).toBe("e1");
    expect(result.clientName).toBe("Jane Doe");
    expect(result.serviceName).toBe("Balayage");
    expect(result.serviceCategory).toBe("Highlights");
    expect(result.status).toBe("confirmed");
    expect(result.notes).toBe("VIP");
    expect(result.segments).toHaveLength(2);
    expect(result.segments![0].segmentType).toBe("apply");
    expect(result.segments![0].productGrams).toBe(30);
    expect(result.start.toISOString()).toBe("2026-02-16T09:00:00.000Z");
    expect(result.end.toISOString()).toBe("2026-02-16T10:15:00.000Z");
    expect(result.groupId).toBe("appt-1");
  });

  it("handles appointment with no segments", () => {
    const raw = {
      id: "appt-2",
      employee_id: "e2",
      client_name: "John",
      service_name: "Cut",
      service_category: "Cut",
      status: "confirmed",
      segments: null,
    };

    const result = mapServerAppointment(raw);
    expect(result.segments).toBeUndefined();
    expect(result.start).toBeInstanceOf(Date);
    expect(result.end).toBeInstanceOf(Date);
  });
});

describe("mapServerSegment", () => {
  it("maps server segment correctly", () => {
    const raw = {
      id: "seg-1",
      appointment_id: "appt-1",
      segment_type: "wash",
      label: "Color Wash",
      start_time: "2026-02-16T10:00:00.000Z",
      end_time: "2026-02-16T10:15:00.000Z",
      sort_order: 2,
      product_grams: 30,
      notes: "gentle",
    };

    const result = mapServerSegment(raw);
    expect(result.id).toBe("seg-1");
    expect(result.appointmentId).toBe("appt-1");
    expect(result.segmentType).toBe("wash");
    expect(result.label).toBe("Color Wash");
    expect(result.sortOrder).toBe(2);
    expect(result.productGrams).toBe(30);
    expect(result.notes).toBe("gentle");
  });
});

describe("mapServerTemplate", () => {
  it("maps a server template with steps", () => {
    const raw = {
      id: "tmpl-1",
      name: "Basic Color",
      category: "Color",
      description: "Standard color process",
      steps: [
        { id: "s1", step_type: "apply", label: "Apply", duration_minutes: 20, sort_order: 0, is_gap: false },
        { id: "s2", step_type: "wait", label: "Wait", duration_minutes: 30, sort_order: 1, is_gap: true },
        { id: "s3", step_type: "wash", label: "Wash", duration_minutes: 15, sort_order: 2, is_gap: false },
      ],
    };

    const result = mapServerTemplate(raw);
    expect(result.id).toBe("tmpl-1");
    expect(result.name).toBe("Basic Color");
    expect(result.steps).toHaveLength(3);
    expect(result.steps[1].isGap).toBe(true);
    expect(result.steps[1].durationMinutes).toBe(30);
  });
});

describe("appointmentToServer", () => {
  it("converts UI appointment to server format", () => {
    const appt: Appointment = {
      id: "appt-1",
      employeeId: "e1",
      clientName: "Jane",
      serviceName: "Color",
      serviceCategory: "Color",
      status: "confirmed",
      start: new Date("2026-02-16T09:00:00.000Z"),
      end: new Date("2026-02-16T10:00:00.000Z"),
      notes: "test",
    };

    const result = appointmentToServer(appt);
    expect(result.employee_id).toBe("e1");
    expect(result.client_name).toBe("Jane");
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].segment_type).toBe("service");
  });

  it("preserves existing segments", () => {
    const appt: Appointment = {
      id: "appt-1",
      employeeId: "e1",
      clientName: "Jane",
      serviceName: "Color",
      serviceCategory: "Color",
      status: "confirmed",
      start: new Date("2026-02-16T09:00:00.000Z"),
      end: new Date("2026-02-16T10:00:00.000Z"),
      segments: [
        {
          id: "seg-1",
          appointmentId: "appt-1",
          segmentType: "apply",
          label: "Apply",
          start: new Date("2026-02-16T09:00:00.000Z"),
          end: new Date("2026-02-16T09:20:00.000Z"),
          sortOrder: 0,
        },
        {
          id: "seg-2",
          appointmentId: "appt-1",
          segmentType: "wait",
          label: "Wait",
          start: new Date("2026-02-16T09:20:00.000Z"),
          end: new Date("2026-02-16T10:00:00.000Z"),
          sortOrder: 1,
        },
      ],
    };

    const result = appointmentToServer(appt);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0].segment_type).toBe("apply");
    expect(result.segments[1].segment_type).toBe("wait");
  });
});

describe("segmentToServer", () => {
  it("converts UI segment to server format", () => {
    const seg: AppointmentSegment = {
      id: "seg-1",
      appointmentId: "appt-1",
      segmentType: "wash",
      label: "Wash",
      start: new Date("2026-02-16T10:00:00.000Z"),
      end: new Date("2026-02-16T10:15:00.000Z"),
      sortOrder: 2,
      productGrams: 30,
    };

    const result = segmentToServer(seg);
    expect(result.segment_type).toBe("wash");
    expect(result.label).toBe("Wash");
    expect(result.sort_order).toBe(2);
    expect(result.product_grams).toBe(30);
    expect(result.start_time).toBe("2026-02-16T10:00:00.000Z");
  });
});

import { useState, useCallback, useEffect, useRef } from "react";
import type { Appointment, AppointmentSegment, SplitTemplate } from "./calendarTypes";
import { APPOINTMENTS } from "./calendarMockData";
import { apiClient } from "../../../api/client";
import { mapServerAppointment, mapServerTemplate, appointmentToServer, segmentToServer } from "./scheduleMappers";

interface CreateAppointmentData {
  employeeId: string;
  clientName: string;
  serviceName: string;
  serviceCategory: Appointment["serviceCategory"];
  start: Date;
  end: Date;
  notes?: string;
  customerId?: string;
}

interface UseScheduleReturn {
  appointments: Appointment[];
  templates: SplitTemplate[];
  loading: boolean;
  error: string | null;
  usingMock: boolean;
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  saveAppointment: (appt: Appointment) => Promise<void>;
  createAppointment: (data: CreateAppointmentData) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  splitAppointment: (id: string, splits: Array<Record<string, unknown>>) => Promise<void>;
  applyTemplate: (appointmentId: string, templateId: string, startTime: string) => Promise<void>;
  reload: () => Promise<void>;
}

function isNetlifyRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const port = window.location.port;
  return port === "8888" || (!port && window.location.hostname !== "localhost");
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export function useSchedule(): UseScheduleReturn {
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [templates, setTemplates] = useState<SplitTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(true);
  const loadedRef = useRef(false);

  const load = useCallback(async () => {
    if (loadedRef.current) return;

    if (!isNetlifyRuntime()) {
      console.info("Schedule: not running under Netlify, using mock data");
      setUsingMock(true);
      loadedRef.current = true;
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [apptRes, tmplRes] = await Promise.all([
        withTimeout(apiClient.getAppointments(), 4000),
        withTimeout(apiClient.getTemplates(), 4000),
      ]);

      // API responded successfully — we are in DB mode, even if list is empty
      setUsingMock(false);

      if (apptRes.appointments) {
        const mapped = apptRes.appointments.map(mapServerAppointment);
        setAppointments(mapped.length > 0 ? mapped : APPOINTMENTS);
      }

      if (tmplRes.templates) {
        setTemplates(tmplRes.templates.map(mapServerTemplate));
      }

      loadedRef.current = true;
    } catch (err: any) {
      console.warn("Schedule API unavailable, using mock data:", err.message);
      setUsingMock(true);
      loadedRef.current = true;
    } finally {
      setLoading(false);
    }
  }, []);

  const reload = useCallback(async () => {
    loadedRef.current = false;
    await load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  const saveAppointment = useCallback(async (appt: Appointment) => {
    setAppointments((prev) => {
      const idx = prev.findIndex((a) => a.id === appt.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = appt;
        return copy;
      }
      return [...prev, appt];
    });

    if (usingMock) return;

    try {
      const existing = appointments.find((a) => a.id === appt.id);
      const payload = appointmentToServer(appt);

      if (existing) {
        await apiClient.updateAppointment(appt.id, payload);
      } else {
        const res = await apiClient.createAppointment(payload as any);
        if (res.appointment?.id && res.appointment.id !== appt.id) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === appt.id ? { ...a, id: res.appointment.id } : a))
          );
        }
      }
    } catch (err: any) {
      console.error("Save appointment failed:", err);
      setError(err.message);
    }
  }, [usingMock, appointments]);

  const deleteAppt = useCallback(async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    if (usingMock) return;
    try {
      await apiClient.deleteAppointment(id);
    } catch (err: any) {
      console.error("Delete appointment failed:", err);
      setError(err.message);
    }
  }, [usingMock]);

  const splitAppt = useCallback(async (id: string, splits: Array<Record<string, unknown>>) => {
    // Optimistic local update: build segments from splits array
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const segments: AppointmentSegment[] = splits.map((s, i) => ({
          id: `seg-${id}-${i}`,
          appointmentId: id,
          segmentType: (s.segment_type as AppointmentSegment["segmentType"]) || "service",
          label: (s.label as string) || "",
          start: new Date(s.start_time as string),
          end: new Date(s.end_time as string),
          sortOrder: (s.sort_order as number) ?? i,
        }));
        return { ...a, segments };
      })
    );

    if (usingMock) return; // local-only update in mock mode

    try {
      await apiClient.splitAppointment(id, splits);
      await reload();
    } catch (err: any) {
      console.error("Split appointment failed:", err);
      setError(err.message);
    }
  }, [usingMock, reload]);

  const applyTmpl = useCallback(async (appointmentId: string, templateId: string, startTime: string) => {
    if (usingMock) {
      // In mock mode, find template and build local segments
      const tmpl = templates.find((t) => t.id === templateId);
      if (!tmpl) return;
      let cursor = new Date(startTime);
      const segments: AppointmentSegment[] = tmpl.steps.map((step, i) => {
        const segStart = new Date(cursor);
        const segEnd = new Date(cursor.getTime() + step.durationMinutes * 60000);
        cursor = segEnd;
        return {
          id: `tmpl-seg-${appointmentId}-${i}`,
          appointmentId,
          segmentType: step.stepType,
          label: step.label,
          start: segStart,
          end: segEnd,
          sortOrder: step.sortOrder,
        };
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, segments } : a))
      );
      return;
    }

    try {
      await apiClient.applyTemplate(appointmentId, templateId, startTime);
      await reload();
    } catch (err: any) {
      console.error("Apply template failed:", err);
      setError(err.message);
    }
  }, [usingMock, reload, templates]);

  const createAppt = useCallback(async (data: CreateAppointmentData) => {
    const tempId = `temp-${Date.now()}`;
    const newAppt: Appointment = {
      id: tempId,
      employeeId: data.employeeId,
      clientName: data.clientName,
      serviceName: data.serviceName,
      serviceCategory: data.serviceCategory,
      start: data.start,
      end: data.end,
      status: "confirmed",
      notes: data.notes,
      customerId: data.customerId,
    };

    setAppointments((prev) => [...prev, newAppt]);

    if (usingMock) return;

    try {
      const payload = {
        employee_id: data.employeeId,
        client_name: data.clientName,
        service_name: data.serviceName,
        service_category: data.serviceCategory,
        status: "confirmed",
        notes: data.notes || null,
        customer_id: data.customerId || null,
        segments: [{
          segment_type: "service",
          label: data.serviceName,
          start_time: data.start.toISOString(),
          end_time: data.end.toISOString(),
          sort_order: 0,
        }],
      };

      const res = await apiClient.createAppointment(payload);
      if (res.appointment?.id) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === tempId ? { ...a, id: res.appointment.id } : a))
        );
      }
    } catch (err: any) {
      console.error("Create appointment failed:", err);
      setError(err.message);
      setAppointments((prev) => prev.filter((a) => a.id !== tempId));
    }
  }, [usingMock]);

  return {
    appointments,
    templates,
    loading,
    error,
    usingMock,
    setAppointments,
    saveAppointment,
    createAppointment: createAppt,
    deleteAppointment: deleteAppt,
    splitAppointment: splitAppt,
    applyTemplate: applyTmpl,
    reload,
  };
}

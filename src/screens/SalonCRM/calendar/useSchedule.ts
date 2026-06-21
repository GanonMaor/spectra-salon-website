/**
 * Schedule data hook.
 *
 * The Schedule page is the source of truth for appointments. All reads
 * and writes go through the shared CRM data layer (`useCRMState`,
 * `useCRMActions`). The only legacy concept preserved is the calendar
 * `Appointment` view-model (Date-based), produced by `toUIAppointment`.
 *
 * Templates are still managed locally because the seed adapter does not
 * expose split templates yet; once the API ships them, the same hook
 * shape will surface them without forcing a UI change.
 */

import { useCallback, useMemo, useState } from "react";
import type { Appointment, AppointmentSegment, SplitTemplate } from "./calendarTypes";
import {
  categoryFromUI,
  toUIAppointment,
  uiSegmentToCanonical,
} from "./calendarAdapters";
import {
  useAppointments,
  useCRMActions,
} from "../data/crmHooks";
import type { ServiceCategoryId, AppointmentSegment as CrmAppointmentSegment } from "../data/crmTypes";

interface CreateAppointmentData {
  employeeId: string;
  clientName: string;
  serviceName: string;
  serviceCategory: Appointment["serviceCategory"];
  start: Date;
  end: Date;
  notes?: string;
  customerId?: string;
  serviceId?: string;
}

/**
 * Composition-aware create payload produced by the booking flow. Carries the
 * canonical category id directly and pre-built segments for the generated
 * service workflow.
 */
interface CreateAppointmentCompositionData {
  staffMemberId: string;
  customerId?: string;
  customerName: string;
  primaryServiceId?: string;
  serviceName: string;
  serviceCategoryId: ServiceCategoryId;
  start: Date;
  end: Date;
  notes?: string;
  segments: Array<Omit<CrmAppointmentSegment, "id" | "appointmentId">>;
}

/** Result returned by composition-aware writes so callers can react to
 *  failures (e.g. keep an edit modal open and show why the save failed). */
export interface ScheduleWriteResult {
  ok: boolean;
  error?: string;
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
  createAppointmentWithComposition: (data: CreateAppointmentCompositionData) => Promise<ScheduleWriteResult>;
  updateAppointmentWithComposition: (id: string, data: CreateAppointmentCompositionData) => Promise<ScheduleWriteResult>;
  deleteAppointment: (id: string) => Promise<void>;
  splitAppointment: (id: string, splits: Array<Record<string, unknown>>) => Promise<void>;
  applyTemplate: (appointmentId: string, templateId: string, startTime: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useSchedule(): UseScheduleReturn {
  const canonicalAppointments = useAppointments();
  const actions = useCRMActions();
  const [templates] = useState<SplitTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const appointments = useMemo(
    () => canonicalAppointments.map(toUIAppointment),
    [canonicalAppointments],
  );

  const setAppointments: UseScheduleReturn["setAppointments"] = useCallback(() => {
    // No-op: callers historically used this to mutate local state, but
    // the source of truth now lives in the CRM provider. Drag/resize
    // flows commit through `saveAppointment` which dispatches through
    // `crmActions`.
  }, []);

  const reportFailure = useCallback((label: string, message: string) => {
    setError(`${label}: ${message}`);
    if (typeof console !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn(`[Schedule] ${label} failed`, message);
    }
  }, []);

  const saveAppointment = useCallback(async (appt: Appointment) => {
    setError(null);
    const result = actions.updateAppointment(appt.id, {
      staffMemberId: appt.employeeId,
      customerId: appt.customerId,
      customerName: appt.clientName,
      serviceName: appt.serviceName,
      serviceCategoryId: categoryFromUI(appt.serviceCategory),
      startTime: appt.start.toISOString(),
      endTime: appt.end.toISOString(),
      status: appt.status,
      notes: appt.notes,
      segments: appt.segments?.map((seg) => uiSegmentToCanonical(seg, appt.id)),
    });
    if (!result.ok) reportFailure("Update appointment", result.error.message);
  }, [actions, reportFailure]);

  const deleteAppointment = useCallback(async (id: string) => {
    setError(null);
    const result = actions.deleteAppointment(id);
    if (!result.ok) reportFailure("Delete appointment", result.error.message);
  }, [actions, reportFailure]);

  const splitAppointment = useCallback(
    async (id: string, splits: Array<Record<string, unknown>>) => {
      const segments: AppointmentSegment[] = splits.map((s, i) => ({
        id: `seg-${id}-${Date.now()}-${i}`,
        appointmentId: id,
        segmentType: (s.segment_type as AppointmentSegment["segmentType"]) || "service",
        label: (s.label as string) || "",
        start: new Date(s.start_time as string),
        end: new Date(s.end_time as string),
        sortOrder: (s.sort_order as number) ?? i,
      }));
      const result = actions.updateAppointment(id, {
        segments: segments.map((seg) => uiSegmentToCanonical(seg, id)),
      });
      if (!result.ok) reportFailure("Split appointment", result.error.message);
    },
    [actions, reportFailure],
  );

  const applyTemplate = useCallback(
    async (appointmentId: string, templateId: string, startTime: string) => {
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
      const result = actions.updateAppointment(appointmentId, {
        segments: segments.map((seg) => uiSegmentToCanonical(seg, appointmentId)),
      });
      if (!result.ok) reportFailure("Apply template", result.error.message);
    },
    [actions, templates, reportFailure],
  );

  const createAppointment = useCallback(async (data: CreateAppointmentData) => {
    setError(null);
    const categoryId: ServiceCategoryId = categoryFromUI(data.serviceCategory);
    const result = actions.createAppointment({
      staffMemberId: data.employeeId,
      customerId: data.customerId,
      customerName: data.clientName,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      serviceCategoryId: categoryId,
      startTime: data.start.toISOString(),
      endTime: data.end.toISOString(),
      notes: data.notes,
      status: "confirmed",
    });
    if (!result.ok) reportFailure("Create appointment", result.error.message);
  }, [actions, reportFailure]);

  const createAppointmentWithComposition = useCallback(
    async (data: CreateAppointmentCompositionData): Promise<ScheduleWriteResult> => {
      setError(null);
      // Dev strict mode throws on action/state failure; catch so the caller
      // can show the reason instead of failing silently.
      try {
        const result = actions.createAppointment({
          staffMemberId: data.staffMemberId,
          customerId: data.customerId,
          customerName: data.customerName,
          serviceId: data.primaryServiceId,
          serviceName: data.serviceName,
          serviceCategoryId: data.serviceCategoryId,
          startTime: data.start.toISOString(),
          endTime: data.end.toISOString(),
          notes: data.notes,
          status: "confirmed",
          segments: data.segments,
        });
        if (!result.ok) {
          reportFailure("Create appointment", result.error.message);
          return { ok: false, error: result.error.message };
        }
        return { ok: true };
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        reportFailure("Create appointment", message);
        return { ok: false, error: message };
      }
    },
    [actions, reportFailure],
  );

  const updateAppointmentWithComposition = useCallback(
    async (id: string, data: CreateAppointmentCompositionData): Promise<ScheduleWriteResult> => {
      setError(null);
      const segments: CrmAppointmentSegment[] = data.segments.map((seg, i) => ({
        ...seg,
        id: `seg-${id}-${Date.now()}-${i}`,
        appointmentId: id,
      }));
      try {
        const result = actions.updateAppointment(id, {
          staffMemberId: data.staffMemberId,
          customerId: data.customerId,
          customerName: data.customerName,
          serviceId: data.primaryServiceId || undefined,
          serviceName: data.serviceName,
          serviceCategoryId: data.serviceCategoryId,
          startTime: data.start.toISOString(),
          endTime: data.end.toISOString(),
          notes: data.notes,
          segments,
        });
        if (!result.ok) {
          reportFailure("Update appointment", result.error.message);
          return { ok: false, error: result.error.message };
        }
        return { ok: true };
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        reportFailure("Update appointment", message);
        return { ok: false, error: message };
      }
    },
    [actions, reportFailure],
  );

  const reload = useCallback(async () => {
    // The provider is the single hydration point. Future API adapter
    // will expose its own refresh hook; for now this is a no-op.
  }, []);

  return {
    appointments,
    templates,
    loading: false,
    error,
    usingMock: true,
    setAppointments,
    saveAppointment,
    createAppointment,
    createAppointmentWithComposition,
    updateAppointmentWithComposition,
    deleteAppointment,
    splitAppointment,
    applyTemplate,
    reload,
  };
}

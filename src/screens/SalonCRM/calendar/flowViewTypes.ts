import type { Appointment, AppointmentStatus } from "./calendarTypes";

export type ScheduleSurface = "calendar" | "flow";

export type FlowTemporalState = "ended" | "active" | "upcoming";

/**
 * Reserved for a later in-bar stage breakdown (Consultation / Mix / Processing…).
 * The MVP does not render these; the shape is here so the row model can grow
 * without a second mapping layer.
 */
export type FlowStageKind =
  | "consultation"
  | "mix"
  | "processing"
  | "toner"
  | "cut"
  | "finish";

export interface FlowStage {
  id: string;
  kind: FlowStageKind;
  label: string;
  start: Date;
  end: Date;
}

export interface FlowTimeWindow {
  /** Minutes from midnight, inclusive. */
  startMinutes: number;
  /** Minutes from midnight, exclusive. */
  endMinutes: number;
}

export interface FlowBarLayout {
  leftPct: number;
  widthPct: number;
}

export interface FlowLiveVisitRef {
  customerId?: string;
  appointmentId?: string;
  status: string;
}

/**
 * One visit row on the Flow timeline. End times are split so a later pass can
 * show Planned / Actual / Predicted without changing the appointment source.
 */
export interface FlowVisitRow {
  id: string;
  appointmentId: string;
  customerId?: string;
  customerName: string;
  customerAvatarUrl?: string;
  staffId: string;
  staffName: string;
  staffAvatarUrl?: string;
  serviceName: string;
  category: Appointment["serviceCategory"];
  status: AppointmentStatus;
  start: Date;
  plannedEnd: Date;
  actualEnd?: Date;
  predictedEnd?: Date;
  temporalState: FlowTemporalState;
  isInSalon: boolean;
  arrivingSoon: boolean;
  finishingSoon: boolean;
  stages?: FlowStage[];
}

export interface FlowDaySummary {
  inSalon: number;
  arrivingSoon: number;
  finishingSoon: number;
  total: number;
}

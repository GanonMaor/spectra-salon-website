export type CalendarViewMode = "staff" | "chairs" | "rooms";

export type StageType =
  | "active"
  | "processing"
  | "wash"
  | "consultation"
  | "checkout"
  | "linked";

export type StageStatus = "completed" | "in-progress" | "upcoming";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  accent: string;
  accentBg: string;
  photo: string;
}

export interface Chair {
  id: string;
  label: string;
  zone: "main" | "wash" | "waiting";
}

export interface Room {
  id: string;
  label: string;
  type: "color-room" | "wash-station" | "styling";
}

export interface ServiceStage {
  id: string;
  label: string;
  type: StageType;
  durationMin: number;
  staffId: string;
  chairId?: string;
  roomId?: string;
  startH: number;
  status: StageStatus;
  formula?: string;
  grams?: number;
  materialCost?: number;
}

export interface LinkedService {
  id: string;
  label: string;
  durationMin: number;
  afterStageId: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  service: string;
  staffId: string;
  startH: number;
  totalDurationH: number;
  stages: ServiceStage[];
  linkedServices: LinkedService[];
  clientSavedTiming?: boolean;
}

export interface SalonClient {
  id: string;
  name: string;
  appointmentId: string;
  currentStageId: string;
  since?: string;
  formula?: string;
  gramsMixed?: number;
  materialCost?: number;
  inventoryUpdated?: boolean;
}

export interface ScheduleOpportunity {
  id: string;
  type: "staff-available" | "chair-available";
  message: string;
  staffId?: string;
  chairId?: string;
  startH: number;
  durationMin: number;
}

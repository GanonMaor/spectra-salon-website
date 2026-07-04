/**
 * Booking flow domain types.
 *
 * The booking flow builds an appointment *composition*: one or more services,
 * each expanded into operational stages with their own employee, resource,
 * timing, and start offset. These shapes are UI-facing and convert to
 * canonical CRM appointment + segment payloads at creation time.
 */

import type { SegmentType } from "../data/crmTypes";
import type { ResourceType } from "./catalogTypes";

export type EntryType = "appointment" | "break" | "time-block" | "internal-task" | "other";

export type FlowStep = "type" | "client" | "services" | "workflow" | "schedule" | "review";

export const FLOW_STEPS: FlowStep[] = ["type", "client", "services", "workflow", "schedule", "review"];

export const FLOW_STEP_LABELS: Record<FlowStep, string> = {
  type: "Type",
  client: "Client",
  services: "Services",
  workflow: "Workflow",
  schedule: "Schedule",
  review: "Review",
};

export interface SelectedClient {
  id?: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  walkInGender?: "male" | "female";
}

/** A single stage within a composed service (a row in the workflow). */
export interface CompositionStage {
  id: string;
  /** Stage definition id from the catalog (for timing overrides). */
  definitionId: string;
  label: string;
  segmentType: SegmentType;
  durationMinutes: number;
  isActiveStaffTime: boolean;
  employeeId: string;
  requiredResourceType?: ResourceType;
  resourceId?: string;
  /** Minutes from appointment start; computed by the layout pass. */
  startOffsetMinutes: number;
}

/** A service added to the appointment, with its own stages. */
export interface CompositionService {
  /** Unique instance id (same service can be added more than once). */
  instanceId: string;
  serviceId: string;
  serviceName: string;
  crmCategoryId: import("../data/crmTypes").ServiceCategoryId;
  categoryId: string;
  priceCents: number;
  isLinked: boolean;
  stages: CompositionStage[];
}

export interface AppointmentComposition {
  entryType: EntryType;
  client: SelectedClient | null;
  /** Default employee from the clicked calendar column. */
  defaultEmployeeId: string;
  date: Date;
  startMinutes: number;
  services: CompositionService[];
  notes: string;
  /** Whether to persist edited stage timings for this client. */
  saveClientTiming: boolean;
}

export interface CompositionTotals {
  clientJourneyMinutes: number;
  processingMinutes: number;
  totalPriceCents: number;
  /** Active minutes keyed by employeeId. */
  activeByEmployee: Record<string, number>;
  endMinutes: number;
}

export interface BookingPrefill {
  date: Date;
  employeeId: string;
  startMinutes: number;
  entryType?: EntryType;
}

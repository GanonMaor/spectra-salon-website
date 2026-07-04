/**
 * Schedule catalog types.
 *
 * These extend the canonical CRM service catalog with the structure the
 * booking flow needs: departments, resources, default service stages,
 * linked services, and client-specific timing overrides.
 *
 * They live in the schedule feature layer (in-memory, seeded from the real
 * CRM `useServices()` / `useServiceCategories()`), so the shared normalized
 * CRM state and its strict validation are not affected. Shapes are kept
 * close to canonical CRM payloads so they can later move to the data layer.
 */

import type { ServiceCategoryId, SegmentType } from "../data/crmTypes";

export type CatalogStatus = "active" | "archived";

export type ResourceType =
  | "chair"
  | "wash-station"
  | "treatment-room"
  | "color-station"
  | "other";

export interface ServiceDepartment {
  id: string;
  name: string;
  description?: string;
  calendarLabel?: string;
  calendarTone?: "hair" | "cosmetics" | "spa";
  bookingMode?: "process" | "singleBlock";
  isCalendarEnabled?: boolean;
  sortOrder: number;
  status: CatalogStatus;
}

export interface CatalogCategory {
  id: string;
  departmentId: string;
  /** Canonical CRM category id when this maps to a known category. */
  crmCategoryId?: ServiceCategoryId;
  name: string;
  accentColor: string;
  coverImageUrl?: string;
  sortOrder: number;
  status: CatalogStatus;
}

export interface ServiceStageDefinition {
  id: string;
  label: string;
  segmentType: SegmentType;
  durationMinutes: number;
  /** True when the stage consumes an employee; false for processing/waiting. */
  isActiveStaffTime: boolean;
  requiredResourceType?: ResourceType;
  sortOrder: number;
}

export interface CatalogService {
  id: string;
  categoryId: string;
  /** Canonical CRM category id used when creating appointments. */
  crmCategoryId: ServiceCategoryId;
  name: string;
  defaultDurationMinutes: number;
  defaultPriceCents: number;
  defaultMaterialCostCents: number;
  accentColor?: string;
  description?: string;
  sortOrder: number;
  status: CatalogStatus;
  defaultStages: ServiceStageDefinition[];
  linkedServiceIds: string[];
  allowClientTimingOverrides: boolean;
  canOverlapDuringProcessing: boolean;
}

export interface SalonResource {
  id: string;
  type: ResourceType;
  name: string;
  status: CatalogStatus;
  sortOrder: number;
}

export interface ClientServiceTimingOverride {
  customerId: string;
  serviceId: string;
  /** Per-stage duration overrides keyed by stage definition id. */
  stageDurations: Record<string, number>;
  totalDurationMinutes?: number;
  updatedAt: string;
}

export interface ScheduleCatalogState {
  departments: ServiceDepartment[];
  categories: CatalogCategory[];
  services: CatalogService[];
  resources: SalonResource[];
  timingOverrides: ClientServiceTimingOverride[];
}

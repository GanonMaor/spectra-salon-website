/**
 * Central CRM action types and reducer.
 *
 * Every state mutation in the CRM goes through this reducer. Screens never
 * mutate provider state directly: they call the bound action creators
 * exposed by `useCRMActions()` which dispatch `CRMAction` payloads.
 *
 * The reducer is responsible for two things:
 *   1. Atomic state transitions (the action shapes below).
 *   2. State versioning. Every successful, non-HYDRATE mutation
 *      increments `state.version` and bumps `state.lastUpdatedAt`.
 *      The reducer never silently returns the same reference for an
 *      "intent to mutate" action — silent no-ops would mask graph
 *      bugs. Validators in `crmHooks` reject invalid inputs before
 *      they reach the reducer.
 */

import type {
  Appointment,
  AppointmentSegment,
  AppointmentStatus,
  AttachServiceToVisitInput,
  CreateAppointmentInput,
  CreateCustomerInput,
  CreateStaffInput,
  CRMNormalizedState,
  Customer,
  InventoryItem,
  MixSession,
  ProductUsage,
  ReweighOutcome,
  SimulateMixInput,
  SimulateProductUsageInput,
  SimulateReweighInput,
  StartVisitInput,
  UpdateAppointmentInput,
  UpdateCustomerInput,
  UpdateStaffInput,
  UpdateInventoryInput,
  Visit,
  VisitService,
  VisitServiceStatus,
  StaffMember,
} from "./crmTypes";

// ── Action shapes ─────────────────────────────────────────────────

export type CRMAction =
  | { type: "HYDRATE"; payload: CRMNormalizedState }
  | { type: "SET_ACTIVE_DATE"; date: string }
  | { type: "SET_BLUETOOTH_CONNECTED"; connected: boolean }
  | { type: "MARK_NOTIFICATIONS_READ" }
  | { type: "TOGGLE_FEATURE_FLAG"; key: string; value: boolean }
  | { type: "APPOINTMENT_CREATE"; appointment: Appointment }
  | { type: "APPOINTMENT_UPDATE"; id: string; patch: Partial<Appointment> }
  | { type: "APPOINTMENT_DELETE"; id: string }
  | { type: "APPOINTMENT_REPLACE_SEGMENTS"; id: string; segments: AppointmentSegment[] }
  | { type: "CUSTOMER_CREATE"; customer: Customer }
  | { type: "CUSTOMER_UPDATE"; id: string; patch: Partial<Customer> }
  | { type: "STAFF_CREATE"; staff: StaffMember }
  | { type: "STAFF_UPDATE"; id: string; patch: Partial<StaffMember> }
  | { type: "VISIT_START"; visit: Visit; appointmentId?: string }
  | { type: "VISIT_COMPLETE"; visitId: string; endedAt: string; visitServicePatches?: Record<string, Partial<VisitService>>; appointmentPatch?: { id: string; patch: Partial<Appointment> } }
  | { type: "VISIT_SERVICE_ADD"; visitService: VisitService }
  | { type: "VISIT_SERVICE_UPDATE"; id: string; patch: Partial<VisitService> }
  | { type: "MIX_SESSION_ADD"; mixSession: MixSession }
  | { type: "MIX_SESSION_UPDATE"; id: string; patch: Partial<MixSession> }
  | { type: "PRODUCT_USAGE_ADD"; usage: ProductUsage; inventoryDelta: number }
  | { type: "REWEIGH_OUTCOME_ADD"; outcome: ReweighOutcome }
  | { type: "INVENTORY_UPDATE"; inventory: InventoryItem }
  | { type: "COMING_SOON_DISMISS"; key: string };

// ── Helpers ───────────────────────────────────────────────────────

function setItem<T extends { id: string }>(
  map: Record<string, T>,
  next: T,
): Record<string, T> {
  return { ...map, [next.id]: next };
}

function patchItem<T extends { id: string }>(
  map: Record<string, T>,
  id: string,
  patch: Partial<T>,
): Record<string, T> {
  const existing = map[id];
  if (!existing) return map;
  return { ...map, [id]: { ...existing, ...patch } };
}

function deleteItem<T>(
  map: Record<string, T>,
  id: string,
): Record<string, T> {
  if (!(id in map)) return map;
  const { [id]: _removed, ...rest } = map;
  return rest;
}

function bumpVersion(state: CRMNormalizedState, isoNow: string): {
  version: number;
  lastUpdatedAt: string;
} {
  return {
    version: (state.version ?? 0) + 1,
    lastUpdatedAt: isoNow,
  };
}

// ── Reducer ───────────────────────────────────────────────────────

export function crmReducer(
  state: CRMNormalizedState,
  action: CRMAction,
): CRMNormalizedState {
  // HYDRATE replaces the whole state and is the only action that does
  // not bump the existing version. Hydration is treated as a fresh
  // baseline (the payload itself carries `version` from the
  // normalizer).
  if (action.type === "HYDRATE") return action.payload;

  const now = new Date().toISOString();
  const version = bumpVersion(state, now);

  switch (action.type) {
    case "SET_ACTIVE_DATE":
      if (state.systemState.activeDate === action.date) return state;
      return {
        ...state,
        ...version,
        systemState: { ...state.systemState, activeDate: action.date },
      };

    case "SET_BLUETOOTH_CONNECTED":
      return {
        ...state,
        ...version,
        systemState: {
          ...state.systemState,
          bluetooth: {
            ...state.systemState.bluetooth,
            connected: action.connected,
            lastSeenAt: action.connected
              ? now
              : state.systemState.bluetooth.lastSeenAt,
          },
        },
      };

    case "MARK_NOTIFICATIONS_READ":
      return {
        ...state,
        ...version,
        systemState: {
          ...state.systemState,
          notifications: { unreadCount: 0, hasUrgent: false },
        },
      };

    case "TOGGLE_FEATURE_FLAG":
      return {
        ...state,
        ...version,
        systemState: {
          ...state.systemState,
          comingSoonFeatures: {
            ...state.systemState.comingSoonFeatures,
            [action.key]: action.value,
          },
        },
      };

    case "APPOINTMENT_CREATE":
      return {
        ...state,
        ...version,
        appointmentsById: setItem(state.appointmentsById, action.appointment),
      };

    case "APPOINTMENT_UPDATE": {
      const existing = state.appointmentsById[action.id];
      // Validators ensure the id exists by the time we reach the
      // reducer. If it doesn't, treat it as a hard programmer error
      // to avoid silent no-ops.
      if (!existing) {
        throw new Error(
          `[crmReducer] APPOINTMENT_UPDATE for missing id "${action.id}"`,
        );
      }
      return {
        ...state,
        ...version,
        appointmentsById: {
          ...state.appointmentsById,
          [action.id]: { ...existing, ...action.patch },
        },
      };
    }

    case "APPOINTMENT_DELETE": {
      if (!state.appointmentsById[action.id]) {
        throw new Error(
          `[crmReducer] APPOINTMENT_DELETE for missing id "${action.id}"`,
        );
      }
      return {
        ...state,
        ...version,
        appointmentsById: deleteItem(state.appointmentsById, action.id),
      };
    }

    case "APPOINTMENT_REPLACE_SEGMENTS": {
      const existing = state.appointmentsById[action.id];
      if (!existing) {
        throw new Error(
          `[crmReducer] APPOINTMENT_REPLACE_SEGMENTS for missing id "${action.id}"`,
        );
      }
      return {
        ...state,
        ...version,
        appointmentsById: {
          ...state.appointmentsById,
          [action.id]: { ...existing, segments: action.segments },
        },
      };
    }

    case "CUSTOMER_CREATE":
      return {
        ...state,
        ...version,
        customersById: setItem(state.customersById, action.customer),
      };

    case "CUSTOMER_UPDATE": {
      if (!state.customersById[action.id]) {
        throw new Error(
          `[crmReducer] CUSTOMER_UPDATE for missing id "${action.id}"`,
        );
      }
      return {
        ...state,
        ...version,
        customersById: patchItem(state.customersById, action.id, action.patch),
      };
    }

    case "STAFF_CREATE":
      return {
        ...state,
        ...version,
        staffById: setItem(state.staffById, action.staff),
      };

    case "STAFF_UPDATE": {
      if (!state.staffById[action.id]) {
        throw new Error(
          `[crmReducer] STAFF_UPDATE for missing id "${action.id}"`,
        );
      }
      return {
        ...state,
        ...version,
        staffById: patchItem(state.staffById, action.id, action.patch),
      };
    }

    case "VISIT_START": {
      let appointmentsById = state.appointmentsById;
      if (action.appointmentId && state.appointmentsById[action.appointmentId]) {
        appointmentsById = patchItem(state.appointmentsById, action.appointmentId, {
          visitId: action.visit.id,
          status: "in-progress",
        });
      }
      return {
        ...state,
        ...version,
        visitsById: setItem(state.visitsById, action.visit),
        appointmentsById,
      };
    }

    case "VISIT_COMPLETE": {
      const existingVisit = state.visitsById[action.visitId];
      if (!existingVisit) {
        throw new Error(
          `[crmReducer] VISIT_COMPLETE for missing id "${action.visitId}"`,
        );
      }
      let visitServicesById = state.visitServicesById;
      if (action.visitServicePatches) {
        visitServicesById = { ...state.visitServicesById };
        for (const [vsId, patch] of Object.entries(action.visitServicePatches)) {
          const vs = visitServicesById[vsId];
          if (vs) visitServicesById[vsId] = { ...vs, ...patch };
        }
      }
      let appointmentsById = state.appointmentsById;
      if (action.appointmentPatch) {
        const appt = state.appointmentsById[action.appointmentPatch.id];
        if (appt) {
          appointmentsById = {
            ...state.appointmentsById,
            [appt.id]: { ...appt, ...action.appointmentPatch.patch },
          };
        }
      }
      return {
        ...state,
        ...version,
        visitsById: {
          ...state.visitsById,
          [action.visitId]: {
            ...existingVisit,
            status: "completed",
            endedAt: action.endedAt,
          },
        },
        visitServicesById,
        appointmentsById,
      };
    }

    case "VISIT_SERVICE_ADD":
      return {
        ...state,
        ...version,
        visitServicesById: setItem(state.visitServicesById, action.visitService),
      };

    case "VISIT_SERVICE_UPDATE": {
      if (!state.visitServicesById[action.id]) {
        throw new Error(
          `[crmReducer] VISIT_SERVICE_UPDATE for missing id "${action.id}"`,
        );
      }
      return {
        ...state,
        ...version,
        visitServicesById: patchItem(
          state.visitServicesById,
          action.id,
          action.patch,
        ),
      };
    }

    case "MIX_SESSION_ADD":
      return {
        ...state,
        ...version,
        mixSessionsById: setItem(state.mixSessionsById, action.mixSession),
      };

    case "MIX_SESSION_UPDATE": {
      if (!state.mixSessionsById[action.id]) {
        throw new Error(
          `[crmReducer] MIX_SESSION_UPDATE for missing id "${action.id}"`,
        );
      }
      return {
        ...state,
        ...version,
        mixSessionsById: patchItem(state.mixSessionsById, action.id, action.patch),
      };
    }

    case "PRODUCT_USAGE_ADD": {
      const inventory = state.inventoryById[action.usage.inventoryItemId];
      const inventoryById = inventory
        ? {
            ...state.inventoryById,
            [inventory.id]: {
              ...inventory,
              unitsInStock: Math.max(
                0,
                inventory.unitsInStock - action.inventoryDelta,
              ),
              updatedAt: action.usage.recordedAt,
            },
          }
        : state.inventoryById;
      return {
        ...state,
        ...version,
        productUsageById: setItem(state.productUsageById, action.usage),
        inventoryById,
      };
    }

    case "REWEIGH_OUTCOME_ADD":
      return {
        ...state,
        ...version,
        reweighOutcomesById: setItem(state.reweighOutcomesById, action.outcome),
      };

    case "INVENTORY_UPDATE":
      return {
        ...state,
        ...version,
        inventoryById: setItem(state.inventoryById, action.inventory),
      };

    case "COMING_SOON_DISMISS":
      return {
        ...state,
        ...version,
        systemState: {
          ...state.systemState,
          comingSoonFeatures: {
            ...state.systemState.comingSoonFeatures,
            [action.key]: false,
          },
        },
      };

    default:
      return state;
  }
}

// ── Action creator helpers ─────────────────────────────────────────

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

/** Reset deterministic counter — used by simulation/replay tests. */
export function _resetActionCounter(): void {
  counter = 0;
}

export function buildAppointment(
  salonId: string,
  input: CreateAppointmentInput,
  customerName: string,
): Appointment {
  const id = nextId("appt");
  const segments = (input.segments ?? []).map((s, idx) => ({
    ...s,
    id: nextId(`seg-${id}`),
    appointmentId: id,
    sortOrder: s.sortOrder ?? idx,
  }));
  if (segments.length === 0) {
    segments.push({
      id: nextId(`seg-${id}`),
      appointmentId: id,
      segmentType: "service",
      label: input.serviceName,
      startTime: input.startTime,
      endTime: input.endTime,
      sortOrder: 0,
    });
  }
  return {
    id,
    salonId,
    staffMemberId: input.staffMemberId,
    customerId: input.customerId,
    customerName,
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    serviceCategoryId: input.serviceCategoryId,
    startTime: input.startTime,
    endTime: input.endTime,
    status: input.status ?? "confirmed",
    notes: input.notes,
    segments,
  };
}

export function buildAppointmentPatch(
  input: UpdateAppointmentInput,
): Partial<Appointment> {
  return {
    ...(input.staffMemberId !== undefined ? { staffMemberId: input.staffMemberId } : {}),
    ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
    ...(input.customerName !== undefined ? { customerName: input.customerName } : {}),
    ...(input.serviceId !== undefined ? { serviceId: input.serviceId } : {}),
    ...(input.serviceName !== undefined ? { serviceName: input.serviceName } : {}),
    ...(input.serviceCategoryId !== undefined ? { serviceCategoryId: input.serviceCategoryId } : {}),
    ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
    ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.visitId !== undefined ? { visitId: input.visitId } : {}),
    ...(input.segments !== undefined ? { segments: input.segments } : {}),
  };
}

export function buildCustomer(
  salonId: string,
  input: CreateCustomerInput,
): Customer {
  const now = new Date().toISOString();
  return {
    id: nextId("cust"),
    salonId,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    email: input.email,
    notes: input.notes,
    tags: input.tags ?? [],
    status: "active",
    isVip: input.isVip ?? false,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildCustomerPatch(
  input: UpdateCustomerInput,
): Partial<Customer> {
  return {
    ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
    ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.isVip !== undefined ? { isVip: input.isVip } : {}),
    updatedAt: new Date().toISOString(),
  };
}

export function buildStaff(
  salonId: string,
  input: CreateStaffInput,
): StaffMember {
  return {
    id: nextId("staff"),
    salonId,
    name: input.name,
    role: input.role,
    roleId: input.roleId,
    departmentIds: input.departmentIds ?? ["dept-hair"],
    serviceIds: input.serviceIds ?? [],
    servicePriceOverrides: input.servicePriceOverrides ?? {},
    color: input.color ?? "#D7897F",
    avatarUrl: input.avatarUrl,
    email: input.email,
    phone: input.phone,
    status: input.status ?? "active",
    rating: 0,
    workingHours: [0, 1, 2, 3, 4, 5].map((dayOfWeek) => ({
      dayOfWeek,
      startHour: 7,
      endHour: 24,
      breakStart: 13,
      breakEnd: 14,
    })),
  };
}

export function buildStaffPatch(input: UpdateStaffInput): Partial<StaffMember> {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.role !== undefined ? { role: input.role } : {}),
    ...(input.roleId !== undefined ? { roleId: input.roleId } : {}),
    ...(input.departmentIds !== undefined ? { departmentIds: input.departmentIds } : {}),
    ...(input.serviceIds !== undefined ? { serviceIds: input.serviceIds } : {}),
    ...(input.servicePriceOverrides !== undefined ? { servicePriceOverrides: input.servicePriceOverrides } : {}),
    ...(input.color !== undefined ? { color: input.color } : {}),
    ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };
}

export function buildVisit(
  salonId: string,
  input: StartVisitInput,
): Visit {
  return {
    id: nextId("visit"),
    salonId,
    customerId: input.customerId,
    appointmentId: input.appointmentId,
    staffMemberId: input.staffMemberId,
    startedAt: new Date().toISOString(),
    status: "active",
    notes: input.notes,
    totalRevenueCents: 0,
    totalMaterialCostCents: 0,
  };
}

export function buildVisitService(
  input: AttachServiceToVisitInput,
): VisitService {
  return {
    id: nextId("vs"),
    visitId: input.visitId,
    serviceId: input.serviceId,
    staffMemberId: input.staffMemberId,
    assignedStaffIds: input.assignedStaffIds ?? [input.staffMemberId],
    startedAt: new Date().toISOString(),
    status: "active" satisfies VisitServiceStatus,
    priceCents: 0,
    materialCostCents: 0,
  };
}

export function buildMixSession(
  input: SimulateMixInput,
): MixSession {
  return {
    id: nextId("mix"),
    visitServiceId: input.visitServiceId,
    startedAt: new Date().toISOString(),
    expectedGrams: input.expectedGrams ?? 0,
    status: "in_progress",
  };
}

export function buildProductUsage(
  input: SimulateProductUsageInput,
  productId: string,
  costAtUseUsd: number,
): ProductUsage {
  return {
    id: nextId("usage"),
    mixSessionId: input.mixSessionId,
    productId,
    inventoryItemId: input.inventoryItemId,
    grams: input.grams,
    costAtUseUsd,
    recordedAt: new Date().toISOString(),
  };
}

export function buildReweighOutcome(
  input: SimulateReweighInput,
): ReweighOutcome {
  const variance = input.actualGrams - input.expectedGrams;
  const outcome: ReweighOutcome["outcome"] =
    variance < 0 ? "saving" : variance > 0 ? "extra-charge" : "waste";
  return {
    id: nextId("rw"),
    mixSessionId: input.mixSessionId,
    expectedGrams: input.expectedGrams,
    actualGrams: input.actualGrams,
    varianceGrams: variance,
    varianceValueUsd: Number((Math.abs(variance) * 0.09).toFixed(2)),
    outcome,
    recordedAt: new Date().toISOString(),
  };
}

export function appointmentStatusForVisitTransition(
  current: AppointmentStatus,
): AppointmentStatus {
  if (current === "confirmed") return "in-progress";
  return current;
}

export function inventoryDeltaForUsage(
  inventory: InventoryItem,
  grams: number,
): number {
  if (!inventory.productId) return 0;
  // Translate grams used to "tube-equivalents" using the product size when
  // we know it (kept simple for the simulation). In real flows the backend
  // resolves the consumed unit count from the product's pack metadata.
  return grams >= 50 ? 1 : 0;
}

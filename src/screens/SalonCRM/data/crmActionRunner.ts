/**
 * Pure action runner.
 *
 * `applyActionRequest` is the non-React equivalent of the action
 * helpers exposed by `useCRMActions()`. It validates the incoming
 * request, dispatches through the reducer, and returns:
 *
 *   - the new state,
 *   - the structured `ActionResult`,
 *   - affected entity IDs,
 *   - the canonical `CRMActionType`,
 *
 * so simulation, replay, and tests can share the exact same code path
 * the UI takes. Adding a new action means adding a new request shape
 * here and a new validator branch — never bypassing this runner.
 */

import {
  appointmentStatusForVisitTransition,
  buildAppointment,
  buildAppointmentPatch,
  buildCustomer,
  buildCustomerPatch,
  buildMixSession,
  buildProductUsage,
  buildReweighOutcome,
  buildVisit,
  buildVisitService,
  crmReducer,
  inventoryDeltaForUsage,
} from "./crmActions";
import {
  ok as okResult,
  type ActionResult,
  type AffectedEntities,
  type CRMActionType,
  type CRMError,
} from "./crmContracts";
import type {
  Appointment,
  AttachServiceToVisitInput,
  CreateAppointmentInput,
  CreateCustomerInput,
  CRMNormalizedState,
  Customer,
  InventoryItem,
  SimulateMixInput,
  SimulateProductUsageInput,
  SimulateReweighInput,
  StartVisitInput,
  UpdateAppointmentInput,
  UpdateCustomerInput,
  UpdateInventoryInput,
  VisitServiceStatus,
} from "./crmTypes";

// ── Request shapes ───────────────────────────────────────────────

export type ActionRequest =
  | { type: "appointment.create"; input: CreateAppointmentInput }
  | { type: "appointment.update"; id: string; input: UpdateAppointmentInput }
  | { type: "appointment.delete"; id: string }
  | { type: "customer.create"; input: CreateCustomerInput }
  | { type: "customer.update"; id: string; input: UpdateCustomerInput }
  | { type: "visit.start"; input: StartVisitInput }
  | { type: "visit.complete"; visitId: string }
  | { type: "visit.attachService"; input: AttachServiceToVisitInput }
  | { type: "mix.start"; input: SimulateMixInput }
  | { type: "mix.recordUsage"; input: SimulateProductUsageInput }
  | { type: "mix.reweigh"; input: SimulateReweighInput }
  | { type: "inventory.update"; input: UpdateInventoryInput }
  | { type: "system.setActiveDate"; date: string };

export interface ApplyActionOutput<T = unknown> {
  state: CRMNormalizedState;
  result: ActionResult<T>;
  affected: AffectedEntities;
  actionType: CRMActionType;
}

// ── Public entry ─────────────────────────────────────────────────

export function applyActionRequest<T = unknown>(
  state: CRMNormalizedState,
  request: ActionRequest,
): ApplyActionOutput<T> {
  switch (request.type) {
    case "appointment.create":
      return applyCreateAppointment(state, request.input) as ApplyActionOutput<T>;
    case "appointment.update":
      return applyUpdateAppointment(state, request.id, request.input) as ApplyActionOutput<T>;
    case "appointment.delete":
      return applyDeleteAppointment(state, request.id) as ApplyActionOutput<T>;
    case "customer.create":
      return applyCreateCustomer(state, request.input) as ApplyActionOutput<T>;
    case "customer.update":
      return applyUpdateCustomer(state, request.id, request.input) as ApplyActionOutput<T>;
    case "visit.start":
      return applyStartVisit(state, request.input) as ApplyActionOutput<T>;
    case "visit.complete":
      return applyCompleteVisit(state, request.visitId) as ApplyActionOutput<T>;
    case "visit.attachService":
      return applyAttachServiceToVisit(state, request.input) as ApplyActionOutput<T>;
    case "mix.start":
      return applyStartMix(state, request.input) as ApplyActionOutput<T>;
    case "mix.recordUsage":
      return applyRecordUsage(state, request.input) as ApplyActionOutput<T>;
    case "mix.reweigh":
      return applyReweigh(state, request.input) as ApplyActionOutput<T>;
    case "inventory.update":
      return applyUpdateInventory(state, request.input) as ApplyActionOutput<T>;
    case "system.setActiveDate":
      return applySetActiveDate(state, request.date) as ApplyActionOutput<T>;
  }
}

// ── Per-request implementations ──────────────────────────────────

function err(state: CRMNormalizedState, actionType: CRMActionType, error: CRMError, affected: AffectedEntities = {}): ApplyActionOutput {
  return { state, result: { ok: false, error }, affected, actionType };
}

function applyCreateAppointment(
  state: CRMNormalizedState,
  input: CreateAppointmentInput,
): ApplyActionOutput<Appointment> {
  const validation = validateCreateAppointment(state, input);
  if (validation) return err(state, "appointment.create", validation) as ApplyActionOutput<Appointment>;
  const customer = input.customerId ? state.customersById[input.customerId] : undefined;
  const customerName = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(" ")
    : input.customerName;
  const appointment = buildAppointment(state.currentSalonId, input, customerName);
  const next = crmReducer(state, { type: "APPOINTMENT_CREATE", appointment });
  return {
    state: next,
    result: okResult(appointment),
    affected: { appointments: [appointment.id] },
    actionType: "appointment.create",
  };
}

function applyUpdateAppointment(
  state: CRMNormalizedState,
  id: string,
  input: UpdateAppointmentInput,
): ApplyActionOutput {
  const validation = validateUpdateAppointment(state, id, input);
  if (validation) return err(state, "appointment.update", validation, { appointments: [id] });
  const next = crmReducer(state, { type: "APPOINTMENT_UPDATE", id, patch: buildAppointmentPatch(input) });
  return { state: next, result: okResult(), affected: { appointments: [id] }, actionType: "appointment.update" };
}

function applyDeleteAppointment(state: CRMNormalizedState, id: string): ApplyActionOutput {
  if (!state.appointmentsById[id]) {
    return err(state, "appointment.delete", { code: "ENTITY_NOT_FOUND", message: `Appointment "${id}" not found` }, { appointments: [id] });
  }
  const next = crmReducer(state, { type: "APPOINTMENT_DELETE", id });
  return { state: next, result: okResult(), affected: { appointments: [id] }, actionType: "appointment.delete" };
}

function applyCreateCustomer(state: CRMNormalizedState, input: CreateCustomerInput): ApplyActionOutput<Customer> {
  if (!state.currentSalonId) {
    return err(state, "customer.create", { code: "INVALID_INPUT", message: "Salon not loaded" }) as ApplyActionOutput<Customer>;
  }
  if (!input?.firstName || input.firstName.trim() === "") {
    return err(state, "customer.create", { code: "MISSING_INPUT", message: "Customer first name is required" }) as ApplyActionOutput<Customer>;
  }
  const customer = buildCustomer(state.currentSalonId, input);
  const next = crmReducer(state, { type: "CUSTOMER_CREATE", customer });
  return {
    state: next,
    result: okResult(customer),
    affected: { customers: [customer.id] },
    actionType: "customer.create",
  };
}

function applyUpdateCustomer(state: CRMNormalizedState, id: string, input: UpdateCustomerInput): ApplyActionOutput {
  if (!state.customersById[id]) {
    return err(state, "customer.update", { code: "ENTITY_NOT_FOUND", message: `Customer "${id}" not found` }, { customers: [id] });
  }
  const next = crmReducer(state, { type: "CUSTOMER_UPDATE", id, patch: buildCustomerPatch(input) });
  return { state: next, result: okResult(), affected: { customers: [id] }, actionType: "customer.update" };
}

function applyStartVisit(state: CRMNormalizedState, input: StartVisitInput): ApplyActionOutput<string> {
  const validation = validateStartVisit(state, input);
  if (validation) return err(state, "visit.start", validation) as ApplyActionOutput<string>;
  const visit = buildVisit(state.currentSalonId, input);
  let next = crmReducer(state, { type: "VISIT_START", visit, appointmentId: input.appointmentId });
  if (input.appointmentId) {
    const existing = next.appointmentsById[input.appointmentId];
    if (existing) {
      next = crmReducer(next, {
        type: "APPOINTMENT_UPDATE",
        id: existing.id,
        patch: { visitId: visit.id, status: appointmentStatusForVisitTransition(existing.status) },
      });
    }
  }
  return {
    state: next,
    result: okResult(visit.id),
    affected: { visits: [visit.id], appointments: input.appointmentId ? [input.appointmentId] : [] },
    actionType: "visit.start",
  };
}

function applyCompleteVisit(state: CRMNormalizedState, visitId: string): ApplyActionOutput {
  const visit = state.visitsById[visitId];
  if (!visit) {
    return err(state, "visit.complete", { code: "ENTITY_NOT_FOUND", message: `Visit "${visitId}" not found` }, { visits: [visitId] });
  }
  if (visit.status === "completed") {
    return err(state, "visit.complete", {
      code: "ILLEGAL_STATUS_TRANSITION",
      message: `Visit "${visitId}" is already completed`,
    }, { visits: [visitId] });
  }
  const endedAt = new Date().toISOString();
  const visitServicePatches: Record<string, Partial<{ status: VisitServiceStatus; endedAt: string }>> = {};
  for (const vs of Object.values(state.visitServicesById)) {
    if (vs.visitId === visitId && vs.status !== "done") {
      visitServicePatches[vs.id] = { status: "done", endedAt };
    }
  }
  const appointmentPatch = visit.appointmentId && state.appointmentsById[visit.appointmentId]
    ? { id: visit.appointmentId, patch: { status: "completed" as const } }
    : undefined;
  const next = crmReducer(state, {
    type: "VISIT_COMPLETE",
    visitId,
    endedAt,
    visitServicePatches,
    appointmentPatch,
  });
  return {
    state: next,
    result: okResult(),
    affected: {
      visits: [visitId],
      visitServices: Object.keys(visitServicePatches),
      appointments: appointmentPatch ? [appointmentPatch.id] : [],
    },
    actionType: "visit.complete",
  };
}

function applyAttachServiceToVisit(state: CRMNormalizedState, input: AttachServiceToVisitInput): ApplyActionOutput<string> {
  if (!input?.visitId || !state.visitsById[input.visitId]) {
    return err(state, "visit.attachService", { code: "ENTITY_NOT_FOUND", message: `Unknown visit "${input?.visitId}"` }) as ApplyActionOutput<string>;
  }
  if (!input.serviceId || !state.servicesById[input.serviceId]) {
    return err(state, "visit.attachService", { code: "ENTITY_NOT_FOUND", message: `Unknown service "${input?.serviceId}"` }) as ApplyActionOutput<string>;
  }
  if (!input.staffMemberId || !state.staffById[input.staffMemberId]) {
    return err(state, "visit.attachService", { code: "ENTITY_NOT_FOUND", message: `Unknown staff member "${input?.staffMemberId}"` }) as ApplyActionOutput<string>;
  }
  const vs = buildVisitService(input);
  const next = crmReducer(state, { type: "VISIT_SERVICE_ADD", visitService: vs });
  return {
    state: next,
    result: okResult(vs.id),
    affected: { visitServices: [vs.id], visits: [input.visitId] },
    actionType: "visit.attachService",
  };
}

function applyStartMix(state: CRMNormalizedState, input: SimulateMixInput): ApplyActionOutput<string> {
  if (!input?.visitServiceId || !state.visitServicesById[input.visitServiceId]) {
    return err(state, "mix.start", { code: "ENTITY_NOT_FOUND", message: `Unknown visit service "${input?.visitServiceId}"` }) as ApplyActionOutput<string>;
  }
  const mix = buildMixSession(input);
  let next = crmReducer(state, { type: "MIX_SESSION_ADD", mixSession: mix });
  next = crmReducer(next, {
    type: "VISIT_SERVICE_UPDATE",
    id: input.visitServiceId,
    patch: { status: "mix_in_progress" },
  });
  return {
    state: next,
    result: okResult(mix.id),
    affected: { mixSessions: [mix.id], visitServices: [input.visitServiceId] },
    actionType: "mix.start",
  };
}

function applyRecordUsage(state: CRMNormalizedState, input: SimulateProductUsageInput): ApplyActionOutput {
  const inventory = state.inventoryById[input?.inventoryItemId];
  if (!input?.mixSessionId || !state.mixSessionsById[input.mixSessionId]) {
    return err(state, "mix.recordUsage", { code: "ENTITY_NOT_FOUND", message: `Unknown mix session "${input?.mixSessionId}"` });
  }
  if (!inventory) {
    return err(state, "mix.recordUsage", { code: "ENTITY_NOT_FOUND", message: `Unknown inventory item "${input?.inventoryItemId}"` });
  }
  const product = state.productsById[inventory.productId];
  if (!product) {
    return err(state, "mix.recordUsage", { code: "FK_BROKEN", message: `Inventory ${inventory.id} has no resolvable product` }, { inventory: [inventory.id] });
  }
  if (typeof input.grams !== "number" || input.grams <= 0) {
    return err(state, "mix.recordUsage", { code: "INVALID_INPUT", message: "grams must be a positive number" });
  }
  const inventoryDelta = inventoryDeltaForUsage(inventory, input.grams);
  if (inventory.unitsInStock - inventoryDelta < 0) {
    return err(state, "mix.recordUsage", { code: "INVENTORY_NEGATIVE", message: `Insufficient stock for inventory ${inventory.id}` }, { inventory: [inventory.id] });
  }
  const usage = buildProductUsage(input, product.id, inventory.costUsd * (input.grams / product.sizeGrams));
  const next = crmReducer(state, { type: "PRODUCT_USAGE_ADD", usage, inventoryDelta });
  return {
    state: next,
    result: okResult(),
    affected: { productUsage: [usage.id], inventory: [inventory.id], mixSessions: [input.mixSessionId] },
    actionType: "mix.recordUsage",
  };
}

function applyReweigh(state: CRMNormalizedState, input: SimulateReweighInput): ApplyActionOutput {
  if (!input?.mixSessionId || !state.mixSessionsById[input.mixSessionId]) {
    return err(state, "mix.reweigh", { code: "ENTITY_NOT_FOUND", message: `Unknown mix session "${input?.mixSessionId}"` });
  }
  if (typeof input.expectedGrams !== "number" || input.expectedGrams < 0) {
    return err(state, "mix.reweigh", { code: "INVALID_INPUT", message: "expectedGrams must be >= 0" });
  }
  if (typeof input.actualGrams !== "number" || input.actualGrams < 0) {
    return err(state, "mix.reweigh", { code: "INVALID_INPUT", message: "actualGrams must be >= 0" });
  }
  const outcome = buildReweighOutcome(input);
  let next = crmReducer(state, { type: "REWEIGH_OUTCOME_ADD", outcome });
  next = crmReducer(next, {
    type: "MIX_SESSION_UPDATE",
    id: input.mixSessionId,
    patch: {
      actualGrams: input.actualGrams,
      status: "complete",
      endedAt: new Date().toISOString(),
    },
  });
  return {
    state: next,
    result: okResult(),
    affected: { reweighOutcomes: [outcome.id], mixSessions: [input.mixSessionId] },
    actionType: "mix.reweigh",
  };
}

function applyUpdateInventory(state: CRMNormalizedState, input: UpdateInventoryInput): ApplyActionOutput {
  const existing = state.inventoryById[input?.inventoryItemId];
  if (!existing) {
    return err(state, "inventory.update", { code: "ENTITY_NOT_FOUND", message: `Unknown inventory item "${input?.inventoryItemId}"` });
  }
  if (input.unitsInStock !== undefined && input.unitsInStock < 0) {
    return err(state, "inventory.update", { code: "INVENTORY_NEGATIVE", message: "unitsInStock cannot be negative" }, { inventory: [existing.id] });
  }
  if (input.minStock !== undefined && input.minStock < 0) {
    return err(state, "inventory.update", { code: "INVALID_INPUT", message: "minStock cannot be negative" }, { inventory: [existing.id] });
  }
  if (input.costUsd !== undefined && input.costUsd < 0) {
    return err(state, "inventory.update", { code: "INVALID_INPUT", message: "costUsd cannot be negative" }, { inventory: [existing.id] });
  }
  const updated: InventoryItem = {
    ...existing,
    ...(input.unitsInStock !== undefined ? { unitsInStock: input.unitsInStock } : {}),
    ...(input.minStock !== undefined ? { minStock: input.minStock } : {}),
    ...(input.costUsd !== undefined ? { costUsd: input.costUsd } : {}),
    ...(input.sellingPriceUsd !== undefined ? { sellingPriceUsd: input.sellingPriceUsd } : {}),
    ...(input.marginPct !== undefined ? { marginPct: input.marginPct } : {}),
    ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
    ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
    updatedAt: new Date().toISOString(),
  };
  const next = crmReducer(state, { type: "INVENTORY_UPDATE", inventory: updated });
  return { state: next, result: okResult(), affected: { inventory: [existing.id] }, actionType: "inventory.update" };
}

function applySetActiveDate(state: CRMNormalizedState, date: string): ApplyActionOutput {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(date)) {
    return err(state, "system.setActiveDate", { code: "INVALID_INPUT", message: `Invalid active date: ${date}` });
  }
  const next = crmReducer(state, { type: "SET_ACTIVE_DATE", date });
  return { state: next, result: okResult(), affected: { systemState: ["activeDate"] }, actionType: "system.setActiveDate" };
}

// ── Validators (also used by hooks) ──────────────────────────────

export function validateCreateAppointment(
  state: CRMNormalizedState,
  input: CreateAppointmentInput,
): CRMError | null {
  if (!state.currentSalonId) return { code: "INVALID_INPUT", message: "Salon not loaded" };
  if (!input?.staffMemberId || !state.staffById[input.staffMemberId]) {
    return { code: "ENTITY_NOT_FOUND", message: `Unknown staff member "${input?.staffMemberId}"` };
  }
  if (input.customerId && !state.customersById[input.customerId]) {
    return { code: "ENTITY_NOT_FOUND", message: `Unknown customer "${input.customerId}"` };
  }
  if (!input.startTime || !input.endTime) {
    return { code: "INVALID_INPUT", message: "Appointment requires startTime and endTime" };
  }
  if (new Date(input.endTime).getTime() <= new Date(input.startTime).getTime()) {
    return { code: "INVALID_TIME_RANGE", message: "Appointment end must be after start" };
  }
  return null;
}

export function validateUpdateAppointment(
  state: CRMNormalizedState,
  id: string,
  input: UpdateAppointmentInput,
): CRMError | null {
  const existing = state.appointmentsById[id];
  if (!existing) return { code: "ENTITY_NOT_FOUND", message: `Appointment "${id}" not found` };
  if (input?.staffMemberId && !state.staffById[input.staffMemberId]) {
    return { code: "ENTITY_NOT_FOUND", message: `Unknown staff member "${input.staffMemberId}"` };
  }
  if (input?.customerId && !state.customersById[input.customerId]) {
    return { code: "ENTITY_NOT_FOUND", message: `Unknown customer "${input.customerId}"` };
  }
  if (input?.startTime && input?.endTime) {
    if (new Date(input.endTime).getTime() <= new Date(input.startTime).getTime()) {
      return { code: "INVALID_TIME_RANGE", message: "Appointment end must be after start" };
    }
  }
  return null;
}

export function validateStartVisit(
  state: CRMNormalizedState,
  input: StartVisitInput,
): CRMError | null {
  if (!state.currentSalonId) return { code: "INVALID_INPUT", message: "Salon not loaded" };
  if (!input?.customerId || !state.customersById[input.customerId]) {
    return { code: "ENTITY_NOT_FOUND", message: `Unknown customer "${input?.customerId}"` };
  }
  if (!input?.staffMemberId || !state.staffById[input.staffMemberId]) {
    return { code: "ENTITY_NOT_FOUND", message: `Unknown staff member "${input?.staffMemberId}"` };
  }
  if (input.appointmentId && !state.appointmentsById[input.appointmentId]) {
    return { code: "ENTITY_NOT_FOUND", message: `Unknown appointment "${input.appointmentId}"` };
  }
  if (input.appointmentId) {
    const conflicting = Object.values(state.visitsById).find(
      (v) => v.appointmentId === input.appointmentId && v.status === "active",
    );
    if (conflicting) {
      return {
        code: "DUPLICATE_ACTIVE_VISIT",
        message: `Appointment ${input.appointmentId} already has an active visit (${conflicting.id})`,
      };
    }
  }
  return null;
}

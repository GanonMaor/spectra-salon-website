/**
 * CRM hooks — the only way screens read CRM data.
 *
 * Each hook composes selectors over the shared `CRMNormalizedState` and
 * returns memoized view models. Hooks never mutate state. State changes
 * happen exclusively through `useCRMActions`.
 */

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useCRMContext, useCRMState } from "./CRMDataProvider";
import {
  fail,
  isFail,
  nextTraceId,
  ok as okResult,
  type ActionResult,
  type AffectedEntities,
  type CRMActionTrace,
  type CRMActionType,
  type CRMError,
} from "./crmContracts";
import {
  getActionTraces,
  recordActionTrace,
  subscribe as subscribeToActionLog,
} from "./crmActionLogger";
import {
  getCRMStrictMode,
  maybeThrowOnActionFailure,
} from "./crmStrictMode";
import { warnInvalidCRMState } from "./crmStateValidation";
import {
  selectAIInsights,
  selectActiveVisits,
  selectAllAppointments,
  selectAnalyticsRange,
  selectAppointmentsByDate,
  selectAppointmentsInRange,
  selectAppointmentsWithCustomers,
  selectBrands,
  selectComingSoonFeature,
  selectCurrentSalon,
  selectCustomerById,
  selectCustomerSearch,
  selectCustomerVisitStats,
  selectCustomerVisits,
  selectCustomers,
  selectInventoryByBrand,
  selectInventoryHealthScore,
  selectInventoryItems,
  selectLiveClients,
  selectLowStockItems,
  selectMarketplaceBanners,
  selectMixUsagePerVisit,
  selectMixSessions,
  selectPrimaryAnalytics,
  selectProductLines,
  selectProductUsage,
  selectProducts,
  selectRevenuePerService,
  selectReweighEfficiency,
  selectReweighOutcomes,
  selectServiceCategories,
  selectServices,
  selectStaff,
  selectStaffById,
  selectStaffPerformance,
  selectSystemState,
  selectVisitsByDate,
  type AppointmentsByDateOptions,
} from "./crmSelectors";
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
  inventoryDeltaForUsage,
} from "./crmActions";
import type {
  AnalyticsSnapshot,
  Appointment,
  AttachServiceToVisitInput,
  CreateAppointmentInput,
  CreateCustomerInput,
  Customer,
  DateRange,
  InventoryItem,
  Service,
  ServiceCategory,
  ServiceCategoryId,
  SimulateMixInput,
  SimulateProductUsageInput,
  SimulateReweighInput,
  StaffMember,
  StartVisitInput,
  UpdateAppointmentInput,
  UpdateCustomerInput,
  UpdateInventoryInput,
} from "./crmTypes";

// ── Foundation ────────────────────────────────────────────────────

export function useCRMReady(): boolean {
  const { loading, state } = useCRMContext();
  return !loading && Boolean(state) && Boolean(state?.currentSalonId);
}

export function useCRMSalon() {
  const state = useCRMState();
  return useMemo(() => selectCurrentSalon(state), [state]);
}

export function useCRMSystemState() {
  const state = useCRMState();
  return selectSystemState(state);
}

export function useComingSoon(key: string): boolean {
  const state = useCRMState();
  return selectComingSoonFeature(state, key);
}

export function useMarketplaceBanners() {
  const state = useCRMState();
  return useMemo(() => selectMarketplaceBanners(state), [state]);
}

// ── Staff ─────────────────────────────────────────────────────────

export function useStaff(): StaffMember[] {
  const state = useCRMState();
  return useMemo(() => selectStaff(state), [state]);
}

export function useStaffById(id: string | null | undefined): StaffMember | undefined {
  const state = useCRMState();
  return useMemo(() => (id ? selectStaffById(state, id) : undefined), [state, id]);
}

export function useStaffPerformance(range?: DateRange) {
  const state = useCRMState();
  return useMemo(() => selectStaffPerformance(state, range), [state, range]);
}

// ── Customers ─────────────────────────────────────────────────────

export function useCustomers(): Customer[] {
  const state = useCRMState();
  return useMemo(() => selectCustomers(state), [state]);
}

export function useCustomerById(id: string | null | undefined): Customer | undefined {
  const state = useCRMState();
  return useMemo(() => (id ? selectCustomerById(state, id) : undefined), [state, id]);
}

export function useCustomerVisitStats() {
  const state = useCRMState();
  return useMemo(() => selectCustomerVisitStats(state), [state]);
}

export function useCustomerVisits(customerId: string | null | undefined) {
  const state = useCRMState();
  return useMemo(
    () => (customerId ? selectCustomerVisits(state, customerId) : []),
    [state, customerId],
  );
}

export function useCRMSearch(query: string, limit?: number): Customer[] {
  const state = useCRMState();
  return useMemo(() => selectCustomerSearch(state, query, limit), [state, query, limit]);
}

// ── Service catalog ──────────────────────────────────────────────

export function useServices(): Service[] {
  const state = useCRMState();
  return useMemo(() => selectServices(state), [state]);
}

export function useServiceCategories(): ServiceCategory[] {
  const state = useCRMState();
  return useMemo(() => selectServiceCategories(state), [state]);
}

// ── Appointments ─────────────────────────────────────────────────

export function useAppointments(): Appointment[] {
  const state = useCRMState();
  return useMemo(() => selectAllAppointments(state), [state]);
}

export function useAppointmentsByDate(opts: AppointmentsByDateOptions) {
  const state = useCRMState();
  return useMemo(() => selectAppointmentsByDate(state, opts), [state, opts]);
}

export function useAppointmentsInRange(
  range: DateRange,
  filter?: { staffMemberId?: string | null; status?: Appointment["status"][] },
) {
  const state = useCRMState();
  return useMemo(() => selectAppointmentsInRange(state, range, filter), [state, range, filter]);
}

export function useAppointmentsWithCustomers(opts?: AppointmentsByDateOptions) {
  const state = useCRMState();
  return useMemo(() => selectAppointmentsWithCustomers(state, opts), [state, opts]);
}

// ── Visits / Live clients ────────────────────────────────────────

export function useLiveVisits() {
  const state = useCRMState();
  return useMemo(() => selectActiveVisits(state), [state]);
}

export function useVisitsByDate(date: string) {
  const state = useCRMState();
  return useMemo(() => selectVisitsByDate(state, date), [state, date]);
}

export function useLiveClients() {
  const state = useCRMState();
  return useMemo(() => selectLiveClients(state), [state]);
}

// ── Inventory ────────────────────────────────────────────────────

export function useInventoryItems(): InventoryItem[] {
  const state = useCRMState();
  return useMemo(() => selectInventoryItems(state), [state]);
}

export function useInventoryByBrand() {
  const state = useCRMState();
  return useMemo(() => selectInventoryByBrand(state), [state]);
}

export function useLowStockItems() {
  const state = useCRMState();
  return useMemo(() => selectLowStockItems(state), [state]);
}

export function useInventoryHealth(): number {
  const state = useCRMState();
  return useMemo(() => selectInventoryHealthScore(state), [state]);
}

export function useBrands() {
  const state = useCRMState();
  return useMemo(() => selectBrands(state), [state]);
}

export function useProductLines() {
  const state = useCRMState();
  return useMemo(() => selectProductLines(state), [state]);
}

export function useProducts() {
  const state = useCRMState();
  return useMemo(() => selectProducts(state), [state]);
}

// ── Operations / mixes / reweigh ─────────────────────────────────

export function useMixSessions() {
  const state = useCRMState();
  return useMemo(() => selectMixSessions(state), [state]);
}

export function useProductUsage() {
  const state = useCRMState();
  return useMemo(() => selectProductUsage(state), [state]);
}

export function useReweighOutcomes() {
  const state = useCRMState();
  return useMemo(() => selectReweighOutcomes(state), [state]);
}

export function useMixUsagePerVisit() {
  const state = useCRMState();
  return useMemo(() => selectMixUsagePerVisit(state), [state]);
}

export function useReweighEfficiency() {
  const state = useCRMState();
  return useMemo(() => selectReweighEfficiency(state), [state]);
}

// ── Analytics ────────────────────────────────────────────────────

export function useAnalyticsPrimary(): AnalyticsSnapshot | undefined {
  const state = useCRMState();
  return useMemo(() => selectPrimaryAnalytics(state), [state]);
}

export function useAnalyticsRange(range: DateRange) {
  const state = useCRMState();
  return useMemo(() => selectAnalyticsRange(state, range), [state, range]);
}

export function useRevenuePerService() {
  const state = useCRMState();
  return useMemo(() => selectRevenuePerService(state), [state]);
}

// ── AI insights ──────────────────────────────────────────────────

export function useAIInsights() {
  const state = useCRMState();
  return useMemo(() => selectAIInsights(state), [state]);
}

// ── Actions ──────────────────────────────────────────────────────

/**
 * Public action surface exposed to screens. Every method returns an
 * `ActionResult<T>` so failures surface in a uniform shape and the
 * caller can decide how to render them. In strict mode failures throw
 * a `CRMDomainError` instead.
 */
export interface CRMActions {
  setActiveDate: (date: string) => ActionResult;
  setBluetoothConnected: (connected: boolean) => ActionResult;
  markNotificationsRead: () => ActionResult;
  toggleFeatureFlag: (key: string, value: boolean) => ActionResult;

  createAppointment: (input: CreateAppointmentInput) => ActionResult<Appointment>;
  updateAppointment: (id: string, input: UpdateAppointmentInput) => ActionResult;
  deleteAppointment: (id: string) => ActionResult;

  createCustomer: (input: CreateCustomerInput) => ActionResult<Customer>;
  updateCustomer: (id: string, input: UpdateCustomerInput) => ActionResult;

  startVisit: (input: StartVisitInput) => ActionResult<string>;
  completeVisit: (visitId: string) => ActionResult;
  attachServiceToVisit: (input: AttachServiceToVisitInput) => ActionResult<string>;

  simulateStartMix: (input: SimulateMixInput) => ActionResult<string>;
  simulateProductUsage: (input: SimulateProductUsageInput) => ActionResult;
  simulateReweigh: (input: SimulateReweighInput) => ActionResult;

  updateInventory: (input: UpdateInventoryInput) => ActionResult;
  dismissComingSoon: (key: string) => ActionResult;
}

interface CommitOptions<T> {
  actionType: CRMActionType;
  input: unknown;
  affected: AffectedEntities;
  origin?: CRMActionTrace["origin"];
  data?: T;
}

export function useCRMActions(): CRMActions {
  const { dispatch, stateRef } = useCRMContext();

  /**
   * Run a guarded action. The factory either returns a `CRMError`
   * (validation failed) or a closure that performs the dispatches.
   * The wrapper logs success/failure, bumps version visibility, and
   * respects strict mode.
   */
  const commit = useCallback(
    function runCommit<T>(
      validator: () => CRMError | null,
      perform: () => void,
      options: CommitOptions<T>,
    ): ActionResult<T> {
      const before = stateRef.current;
      const stateVersionBefore = before.version ?? 0;
      const traceId = nextTraceId("act");
      const timestamp = new Date().toISOString();

      const validationError = validator();
      if (validationError) {
        const result = fail<T>(validationError.code, validationError.message, validationError.details);
        recordActionTrace({
          id: traceId,
          timestamp,
          actionType: options.actionType,
          input: options.input,
          result,
          affectedEntities: options.affected,
          stateVersionBefore,
          stateVersionAfter: stateVersionBefore,
          origin: options.origin ?? "ui",
        });
        if (!result.ok) maybeThrowOnActionFailure(result.error);
        return result;
      }

      try {
        perform();
      } catch (err) {
        const error: CRMError = {
          code: "INTERNAL_ERROR",
          message: err instanceof Error ? err.message : String(err),
          details: { actionType: options.actionType },
        };
        const result: ActionResult<T> = { ok: false, error };
        recordActionTrace({
          id: traceId,
          timestamp,
          actionType: options.actionType,
          input: options.input,
          result,
          affectedEntities: options.affected,
          stateVersionBefore,
          stateVersionAfter: stateVersionBefore,
          origin: options.origin ?? "ui",
        });
        maybeThrowOnActionFailure(error);
        return result;
      }

      const after = stateRef.current;
      const stateVersionAfter = after.version ?? stateVersionBefore;

      if (getCRMStrictMode().validateState) {
        // Validation runs against the post-dispatch snapshot. Any
        // error inside `warnInvalidCRMState` will throw under strict
        // mode (see crmStateValidation.ts).
        warnInvalidCRMState(after, options.actionType);
      }

      const successResult: ActionResult<T> = options.data !== undefined
        ? { ok: true, data: options.data }
        : { ok: true };

      recordActionTrace({
        id: traceId,
        timestamp,
        actionType: options.actionType,
        input: options.input,
        result: successResult,
        affectedEntities: options.affected,
        stateVersionBefore,
        stateVersionAfter,
        origin: options.origin ?? "ui",
      });

      return successResult;
    },
    [stateRef],
  );

  // ── System ──────────────────────────────────────────────────
  const setActiveDate = useCallback(
    (date: string): ActionResult => commit<void>(
      () => (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)
        ? null
        : { code: "INVALID_INPUT", message: `Invalid active date: ${date}` }),
      () => dispatch({ type: "SET_ACTIVE_DATE", date }),
      { actionType: "system.setActiveDate", input: { date }, affected: { systemState: ["activeDate"] } },
    ),
    [commit, dispatch],
  );

  const setBluetoothConnected = useCallback(
    (connected: boolean): ActionResult => commit<void>(
      () => null,
      () => dispatch({ type: "SET_BLUETOOTH_CONNECTED", connected }),
      { actionType: "system.setBluetoothConnected", input: { connected }, affected: { systemState: ["bluetooth"] } },
    ),
    [commit, dispatch],
  );

  const markNotificationsRead = useCallback(
    (): ActionResult => commit<void>(
      () => null,
      () => dispatch({ type: "MARK_NOTIFICATIONS_READ" }),
      { actionType: "system.markNotificationsRead", input: {}, affected: { systemState: ["notifications"] } },
    ),
    [commit, dispatch],
  );

  const toggleFeatureFlag = useCallback(
    (key: string, value: boolean): ActionResult => commit<void>(
      () => (key ? null : { code: "INVALID_INPUT", message: "Feature flag key required" }),
      () => dispatch({ type: "TOGGLE_FEATURE_FLAG", key, value }),
      { actionType: "system.toggleFeatureFlag", input: { key, value }, affected: { systemState: [`flag:${key}`] } },
    ),
    [commit, dispatch],
  );

  const dismissComingSoon = useCallback(
    (key: string): ActionResult => commit<void>(
      () => (key ? null : { code: "INVALID_INPUT", message: "Coming-soon key required" }),
      () => dispatch({ type: "COMING_SOON_DISMISS", key }),
      { actionType: "system.dismissComingSoon", input: { key }, affected: { systemState: [`flag:${key}`] } },
    ),
    [commit, dispatch],
  );

  // ── Appointments ────────────────────────────────────────────
  const createAppointment = useCallback(
    (input: CreateAppointmentInput): ActionResult<Appointment> => {
      const state = stateRef.current;
      const validationError = (() => {
        if (!state.currentSalonId) return { code: "INVALID_INPUT" as const, message: "Salon not loaded" };
        if (!input?.staffMemberId || !state.staffById[input.staffMemberId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown staff member "${input?.staffMemberId}"` };
        }
        if (input.customerId && !state.customersById[input.customerId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown customer "${input.customerId}"` };
        }
        if (!input.startTime || !input.endTime) {
          return { code: "INVALID_INPUT" as const, message: "Appointment requires startTime and endTime" };
        }
        if (new Date(input.endTime).getTime() <= new Date(input.startTime).getTime()) {
          return { code: "INVALID_TIME_RANGE" as const, message: "Appointment end must be after start" };
        }
        return null;
      })();

      const customer = input?.customerId ? state.customersById[input.customerId] : undefined;
      const customerName = customer
        ? [customer.firstName, customer.lastName].filter(Boolean).join(" ")
        : input?.customerName ?? "Walk-in";
      const appointment = !validationError
        ? buildAppointment(state.currentSalonId, input, customerName)
        : (null as unknown as Appointment);

      return commit<Appointment>(
        () => validationError,
        () => dispatch({ type: "APPOINTMENT_CREATE", appointment }),
        {
          actionType: "appointment.create",
          input,
          affected: { appointments: appointment ? [appointment.id] : [] },
          data: appointment,
        },
      );
    },
    [commit, dispatch, stateRef],
  );

  const updateAppointment = useCallback(
    (id: string, input: UpdateAppointmentInput): ActionResult => {
      const state = stateRef.current;
      const existing = state.appointmentsById[id];
      const validationError = (() => {
        if (!existing) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Appointment "${id}" not found` };
        }
        if (input?.staffMemberId && !state.staffById[input.staffMemberId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown staff member "${input.staffMemberId}"` };
        }
        if (input?.customerId && !state.customersById[input.customerId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown customer "${input.customerId}"` };
        }
        if (input?.startTime && input?.endTime) {
          if (new Date(input.endTime).getTime() <= new Date(input.startTime).getTime()) {
            return { code: "INVALID_TIME_RANGE" as const, message: "Appointment end must be after start" };
          }
        }
        return null;
      })();

      return commit<void>(
        () => validationError,
        () => dispatch({ type: "APPOINTMENT_UPDATE", id, patch: buildAppointmentPatch(input) }),
        { actionType: "appointment.update", input: { id, ...input }, affected: { appointments: [id] } },
      );
    },
    [commit, dispatch, stateRef],
  );

  const deleteAppointment = useCallback(
    (id: string): ActionResult => {
      const state = stateRef.current;
      return commit<void>(
        () => (state.appointmentsById[id]
          ? null
          : { code: "ENTITY_NOT_FOUND", message: `Appointment "${id}" not found` }),
        () => dispatch({ type: "APPOINTMENT_DELETE", id }),
        { actionType: "appointment.delete", input: { id }, affected: { appointments: [id] } },
      );
    },
    [commit, dispatch, stateRef],
  );

  // ── Customers ───────────────────────────────────────────────
  const createCustomer = useCallback(
    (input: CreateCustomerInput): ActionResult<Customer> => {
      const state = stateRef.current;
      const validationError = (() => {
        if (!state.currentSalonId) return { code: "INVALID_INPUT" as const, message: "Salon not loaded" };
        if (!input?.firstName || input.firstName.trim() === "") {
          return { code: "MISSING_INPUT" as const, message: "Customer first name is required" };
        }
        return null;
      })();
      const customer = !validationError ? buildCustomer(state.currentSalonId, input) : (null as unknown as Customer);
      return commit<Customer>(
        () => validationError,
        () => dispatch({ type: "CUSTOMER_CREATE", customer }),
        {
          actionType: "customer.create",
          input,
          affected: { customers: customer ? [customer.id] : [] },
          data: customer,
        },
      );
    },
    [commit, dispatch, stateRef],
  );

  const updateCustomer = useCallback(
    (id: string, input: UpdateCustomerInput): ActionResult => {
      const state = stateRef.current;
      return commit<void>(
        () => (state.customersById[id]
          ? null
          : { code: "ENTITY_NOT_FOUND", message: `Customer "${id}" not found` }),
        () => dispatch({ type: "CUSTOMER_UPDATE", id, patch: buildCustomerPatch(input) }),
        { actionType: "customer.update", input: { id, ...input }, affected: { customers: [id] } },
      );
    },
    [commit, dispatch, stateRef],
  );

  // ── Visits ──────────────────────────────────────────────────
  const startVisit = useCallback(
    (input: StartVisitInput): ActionResult<string> => {
      const state = stateRef.current;
      const validationError = (() => {
        if (!state.currentSalonId) return { code: "INVALID_INPUT" as const, message: "Salon not loaded" };
        if (!input?.customerId || !state.customersById[input.customerId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown customer "${input?.customerId}"` };
        }
        if (!input?.staffMemberId || !state.staffById[input.staffMemberId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown staff member "${input?.staffMemberId}"` };
        }
        if (input.appointmentId && !state.appointmentsById[input.appointmentId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown appointment "${input.appointmentId}"` };
        }
        if (input.appointmentId) {
          const conflicting = Object.values(state.visitsById).find(
            (v) => v.appointmentId === input.appointmentId && v.status === "active",
          );
          if (conflicting) {
            return {
              code: "DUPLICATE_ACTIVE_VISIT" as const,
              message: `Appointment ${input.appointmentId} already has an active visit (${conflicting.id})`,
            };
          }
        }
        return null;
      })();
      const visit = !validationError ? buildVisit(state.currentSalonId, input) : null;
      return commit<string>(
        () => validationError,
        () => {
          if (!visit) return;
          dispatch({ type: "VISIT_START", visit, appointmentId: input.appointmentId });
        },
        {
          actionType: "visit.start",
          input,
          affected: {
            visits: visit ? [visit.id] : [],
            appointments: input.appointmentId ? [input.appointmentId] : [],
          },
          data: visit?.id,
        },
      );
    },
    [commit, dispatch, stateRef],
  );

  const completeVisit = useCallback(
    (visitId: string): ActionResult => {
      const state = stateRef.current;
      const visit = state.visitsById[visitId];
      const validationError = (() => {
        if (!visit) return { code: "ENTITY_NOT_FOUND" as const, message: `Visit "${visitId}" not found` };
        if (visit.status === "completed") {
          return { code: "ILLEGAL_STATUS_TRANSITION" as const, message: `Visit "${visitId}" is already completed` };
        }
        return null;
      })();
      // Atomic completion: also flag any active visit services as
      // done and move the linked appointment status forward.
      const visitServicePatches: Record<string, Partial<{ status: VisitServiceStatus; endedAt: string }>> = {};
      const endedAt = new Date().toISOString();
      if (visit) {
        for (const vs of Object.values(state.visitServicesById)) {
          if (vs.visitId === visitId && vs.status !== "done") {
            visitServicePatches[vs.id] = { status: "done", endedAt };
          }
        }
      }
      const appointmentPatch = visit?.appointmentId && state.appointmentsById[visit.appointmentId]
        ? { id: visit.appointmentId, patch: { status: "completed" as const } }
        : undefined;

      return commit<void>(
        () => validationError,
        () =>
          dispatch({
            type: "VISIT_COMPLETE",
            visitId,
            endedAt,
            visitServicePatches,
            appointmentPatch,
          }),
        {
          actionType: "visit.complete",
          input: { visitId },
          affected: {
            visits: [visitId],
            visitServices: Object.keys(visitServicePatches),
            appointments: appointmentPatch ? [appointmentPatch.id] : [],
          },
        },
      );
    },
    [commit, dispatch, stateRef],
  );

  const attachServiceToVisit = useCallback(
    (input: AttachServiceToVisitInput): ActionResult<string> => {
      const state = stateRef.current;
      const validationError = (() => {
        if (!input?.visitId || !state.visitsById[input.visitId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown visit "${input?.visitId}"` };
        }
        if (!input.serviceId || !state.servicesById[input.serviceId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown service "${input?.serviceId}"` };
        }
        if (!input.staffMemberId || !state.staffById[input.staffMemberId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown staff member "${input?.staffMemberId}"` };
        }
        return null;
      })();
      const vs = !validationError ? buildVisitService(input) : null;
      return commit<string>(
        () => validationError,
        () => {
          if (!vs) return;
          dispatch({ type: "VISIT_SERVICE_ADD", visitService: vs });
        },
        {
          actionType: "visit.attachService",
          input,
          affected: { visitServices: vs ? [vs.id] : [], visits: [input.visitId] },
          data: vs?.id,
        },
      );
    },
    [commit, dispatch, stateRef],
  );

  // ── Mix / product usage / reweigh ───────────────────────────
  const simulateStartMix = useCallback(
    (input: SimulateMixInput): ActionResult<string> => {
      const state = stateRef.current;
      const validationError = (() => {
        if (!input?.visitServiceId || !state.visitServicesById[input.visitServiceId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown visit service "${input?.visitServiceId}"` };
        }
        if (input.expectedGrams !== undefined && input.expectedGrams < 0) {
          return { code: "INVALID_INPUT" as const, message: "expectedGrams cannot be negative" };
        }
        return null;
      })();
      const mix = !validationError ? buildMixSession(input) : null;
      return commit<string>(
        () => validationError,
        () => {
          if (!mix) return;
          dispatch({ type: "MIX_SESSION_ADD", mixSession: mix });
          dispatch({
            type: "VISIT_SERVICE_UPDATE",
            id: input.visitServiceId,
            patch: { status: "mix_in_progress" },
          });
        },
        {
          actionType: "mix.start",
          input,
          affected: { mixSessions: mix ? [mix.id] : [], visitServices: [input.visitServiceId] },
          data: mix?.id,
        },
      );
    },
    [commit, dispatch, stateRef],
  );

  const simulateProductUsage = useCallback(
    (input: SimulateProductUsageInput): ActionResult => {
      const state = stateRef.current;
      const inventory = state.inventoryById[input?.inventoryItemId];
      const product = inventory ? state.productsById[inventory.productId] : undefined;
      const validationError = (() => {
        if (!input?.mixSessionId || !state.mixSessionsById[input.mixSessionId]) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown mix session "${input?.mixSessionId}"` };
        }
        if (!inventory) {
          return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown inventory item "${input?.inventoryItemId}"` };
        }
        if (!product) {
          return { code: "FK_BROKEN" as const, message: `Inventory ${inventory.id} has no resolvable product` };
        }
        if (typeof input.grams !== "number" || input.grams <= 0) {
          return { code: "INVALID_INPUT" as const, message: "grams must be a positive number" };
        }
        return null;
      })();
      const usage = inventory && product
        ? buildProductUsage(input, product.id, inventory.costUsd * (input.grams / product.sizeGrams))
        : null;
      const inventoryDelta = inventory ? inventoryDeltaForUsage(inventory, input.grams ?? 0) : 0;
      if (inventory && inventory.unitsInStock - inventoryDelta < 0) {
        return commit<void>(
          () => ({ code: "INVENTORY_NEGATIVE", message: `Insufficient stock for inventory ${inventory.id}` }),
          () => undefined,
          {
            actionType: "mix.recordUsage",
            input,
            affected: { inventory: [inventory.id] },
          },
        );
      }
      return commit<void>(
        () => validationError,
        () => {
          if (!usage) return;
          dispatch({ type: "PRODUCT_USAGE_ADD", usage, inventoryDelta });
        },
        {
          actionType: "mix.recordUsage",
          input,
          affected: {
            productUsage: usage ? [usage.id] : [],
            mixSessions: input?.mixSessionId ? [input.mixSessionId] : [],
            inventory: input?.inventoryItemId ? [input.inventoryItemId] : [],
          },
        },
      );
    },
    [commit, dispatch, stateRef],
  );

  const simulateReweigh = useCallback(
    (input: SimulateReweighInput): ActionResult => {
      const state = stateRef.current;
      const mix = state.mixSessionsById[input?.mixSessionId];
      const validationError = (() => {
        if (!mix) return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown mix session "${input?.mixSessionId}"` };
        if (typeof input.expectedGrams !== "number" || input.expectedGrams < 0) {
          return { code: "INVALID_INPUT" as const, message: "expectedGrams must be >= 0" };
        }
        if (typeof input.actualGrams !== "number" || input.actualGrams < 0) {
          return { code: "INVALID_INPUT" as const, message: "actualGrams must be >= 0" };
        }
        return null;
      })();
      const outcome = !validationError ? buildReweighOutcome(input) : null;
      return commit<void>(
        () => validationError,
        () => {
          if (!outcome) return;
          dispatch({ type: "REWEIGH_OUTCOME_ADD", outcome });
          dispatch({
            type: "MIX_SESSION_UPDATE",
            id: input.mixSessionId,
            patch: {
              actualGrams: input.actualGrams,
              status: "complete",
              endedAt: new Date().toISOString(),
            },
          });
        },
        {
          actionType: "mix.reweigh",
          input,
          affected: {
            reweighOutcomes: outcome ? [outcome.id] : [],
            mixSessions: input?.mixSessionId ? [input.mixSessionId] : [],
          },
        },
      );
    },
    [commit, dispatch, stateRef],
  );

  // ── Inventory ───────────────────────────────────────────────
  const updateInventory = useCallback(
    (input: UpdateInventoryInput): ActionResult => {
      const state = stateRef.current;
      const existing = state.inventoryById[input?.inventoryItemId];
      const validationError = (() => {
        if (!existing) return { code: "ENTITY_NOT_FOUND" as const, message: `Unknown inventory item "${input?.inventoryItemId}"` };
        if (input.unitsInStock !== undefined && input.unitsInStock < 0) {
          return { code: "INVENTORY_NEGATIVE" as const, message: "unitsInStock cannot be negative" };
        }
        if (input.minStock !== undefined && input.minStock < 0) {
          return { code: "INVALID_INPUT" as const, message: "minStock cannot be negative" };
        }
        if (input.costUsd !== undefined && input.costUsd < 0) {
          return { code: "INVALID_INPUT" as const, message: "costUsd cannot be negative" };
        }
        return null;
      })();
      const updated: InventoryItem | null = existing
        ? {
            ...existing,
            ...(input.unitsInStock !== undefined ? { unitsInStock: input.unitsInStock } : {}),
            ...(input.minStock !== undefined ? { minStock: input.minStock } : {}),
            ...(input.costUsd !== undefined ? { costUsd: input.costUsd } : {}),
            ...(input.sellingPriceUsd !== undefined ? { sellingPriceUsd: input.sellingPriceUsd } : {}),
            ...(input.marginPct !== undefined ? { marginPct: input.marginPct } : {}),
            ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
            ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
            updatedAt: new Date().toISOString(),
          }
        : null;
      return commit<void>(
        () => validationError,
        () => {
          if (!updated) return;
          dispatch({ type: "INVENTORY_UPDATE", inventory: updated });
        },
        {
          actionType: "inventory.update",
          input,
          affected: { inventory: input?.inventoryItemId ? [input.inventoryItemId] : [] },
        },
      );
    },
    [commit, dispatch, stateRef],
  );

  // Note: appointmentStatusForVisitTransition is intentionally
  // left unused at this layer because VISIT_START already handles
  // the transition atomically inside the reducer. We keep the
  // import so simulation/replay can reach it from the same module.
  void appointmentStatusForVisitTransition;

  return useMemo<CRMActions>(() => ({
    setActiveDate,
    setBluetoothConnected,
    markNotificationsRead,
    toggleFeatureFlag,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    createCustomer,
    updateCustomer,
    startVisit,
    completeVisit,
    attachServiceToVisit,
    simulateStartMix,
    simulateProductUsage,
    simulateReweigh,
    updateInventory,
    dismissComingSoon,
  }), [
    setActiveDate, setBluetoothConnected, markNotificationsRead, toggleFeatureFlag,
    createAppointment, updateAppointment, deleteAppointment,
    createCustomer, updateCustomer,
    startVisit, completeVisit, attachServiceToVisit,
    simulateStartMix, simulateProductUsage, simulateReweigh,
    updateInventory, dismissComingSoon,
  ]);
}

export type { CRMActions as CRMActionsApi };

// ── Action log subscription ─────────────────────────────────────

/** Live snapshot of action traces. Re-renders when new traces arrive. */
export function useCRMActionLog(): ReadonlyArray<CRMActionTrace> {
  return useSyncExternalStore(
    subscribeToActionLog,
    getActionTraces,
    getActionTraces,
  );
}

/** Convenience helper for screens: forwards the structured failure to
 *  whatever toast/inline surface the caller wants. Returns `null` on
 *  success so callers can write `const err = unwrapAction(actions.x())`. */
export function unwrapAction<T>(result: ActionResult<T>): CRMError | null {
  return isFail(result) ? result.error : null;
}

// Avoid TS complaining about unused imports in some configs.
export const _selectorBundle = {
  selectAllAppointments,
  selectAppointmentsByDate,
  selectAppointmentsInRange,
};

// Re-export `ok` for testability without forcing screens to import contracts.
export { okResult as _okResult };

// Local helpers re-exported as type aliases for visit-service status used
// inside completeVisit's atomic patch map.
type VisitServiceStatus = import("./crmTypes").VisitServiceStatus;

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { buildAnalyticsEvent, useStartNowAnalytics } from "./analytics";
import { FIRST_POST_CONFIRM_STEP, stepIdAt } from "./constants";
import { estimateDelivery } from "./deliveryEstimate";
import { clearDraft, createEmptyDraft, loadDraft, loadOrders, saveDraft } from "./persistence";
import { createStartNowRepository } from "./repository";
import { applyAccountSeed, parseStartNowSearch, resolveSearch, type StartNowSearch } from "./seed";
import {
  emptyAccountDetails,
  emptyShippingAddress,
  isLockedAfterCheckout,
  type AccountDetails,
  type DeviceChoice,
  type EquipmentId,
  type FieldErrors,
  type PaymentMethod,
  type ShippingAddress,
  type StartNowAnalyticsEvent,
  type StartNowDraft,
  type StartNowDraftStatus,
  type StartNowOrder,
  type StartNowRepository,
  type StartNowSeed,
  type StartNowSeedSource,
  type StartNowStepIndex,
} from "./types";
import {
  firstErrorKey,
  hasErrors,
  sanitizeAccount,
  sanitizeShipping,
  validateAccount,
  validateDevice,
  validateEquipment,
  validatePayment,
  validateShipping,
} from "./validation";

export type FlowStatus = StartNowDraftStatus | "authorizing";

export type PasswordGate = () => boolean;

interface FlowState {
  hydrated: boolean;
  step: StartNowStepIndex;
  status: FlowStatus;
  idempotencyKey: string;
  demoBookingId: string | null;
  account: AccountDetails;
  equipment: EquipmentId[];
  device: DeviceChoice | "";
  shipping: ShippingAddress;
  paymentMethod: PaymentMethod | "";
  errors: FieldErrors;
  order: StartNowOrder | null;
  submitError: string | null;
  showEmailPreview: boolean;
}

type Action =
  | { type: "hydrate"; draft: StartNowDraft; order: StartNowOrder | null; seed?: StartNowSeed }
  | { type: "apply-seed"; seed: StartNowSeed }
  | { type: "set-account"; account: Partial<AccountDetails> }
  | { type: "set-shipping"; shipping: Partial<ShippingAddress> }
  | { type: "toggle-equipment"; id: EquipmentId }
  | { type: "set-device"; device: DeviceChoice }
  | { type: "set-payment"; method: PaymentMethod }
  | { type: "prefill-shipping" }
  | { type: "set-errors"; errors: FieldErrors }
  | { type: "set-step"; step: StartNowStepIndex }
  | { type: "authorizing" }
  | { type: "ordered"; order: StartNowOrder }
  | { type: "password-set"; order: StartNowOrder }
  | { type: "completed"; order: StartNowOrder }
  | { type: "submit-failed"; message: string }
  | { type: "toggle-email-preview"; open?: boolean }
  | { type: "reset"; draft: StartNowDraft };

function initialState(draft: StartNowDraft): FlowState {
  return {
    hydrated: false,
    step: 0,
    status: "draft",
    idempotencyKey: draft.idempotencyKey,
    demoBookingId: null,
    account: emptyAccountDetails(),
    equipment: draft.equipment,
    device: "",
    shipping: emptyShippingAddress(),
    paymentMethod: "",
    errors: {},
    order: null,
    submitError: null,
    showEmailPreview: false,
  };
}

function clearFieldErrors(errors: FieldErrors, keys: string[]): FieldErrors {
  const next = { ...errors };
  keys.forEach((key) => {
    delete next[key as keyof FieldErrors];
  });
  return next;
}

function clampStep(step: number): StartNowStepIndex {
  if (step < 0) return 0;
  if (step > 9) return 9;
  return step as StartNowStepIndex;
}

function canVisitStep(status: FlowStatus, target: StartNowStepIndex): boolean {
  if (isLockedAfterCheckout(status)) {
    return target >= FIRST_POST_CONFIRM_STEP;
  }
  return target < FIRST_POST_CONFIRM_STEP;
}

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "hydrate": {
      const locked = Boolean(action.order);
      const seededAccount = applyAccountSeed(
        action.order?.account ?? action.draft.account,
        action.seed,
      );
      const step = locked
        ? clampStep(Math.max(action.draft.step, FIRST_POST_CONFIRM_STEP))
        : clampStep(action.draft.step >= FIRST_POST_CONFIRM_STEP ? 5 : action.draft.step);
      return {
        ...state,
        hydrated: true,
        step,
        status: action.order?.status ?? "draft",
        idempotencyKey: action.draft.idempotencyKey,
        demoBookingId:
          action.order?.demoBookingId ?? action.seed?.demoBookingId ?? action.draft.demoBookingId ?? null,
        account: seededAccount,
        equipment: action.order?.equipment ?? action.draft.equipment,
        device: action.order?.device ?? action.draft.device,
        shipping: action.order?.shipping ?? action.draft.shipping,
        paymentMethod: action.order?.payment.method ?? action.draft.paymentMethod,
        order: action.order,
        // The preview is a disclosure: collapsed by default so the confirmed
        // step fits one viewport. `toggleEmailPreview` still opens it.
        showEmailPreview: false,
      };
    }
    case "apply-seed":
      if (state.order) {
        return {
          ...state,
          demoBookingId: state.demoBookingId ?? action.seed.demoBookingId ?? null,
        };
      }
      return {
        ...state,
        demoBookingId: state.demoBookingId ?? action.seed.demoBookingId ?? null,
        account: applyAccountSeed(state.account, action.seed),
      };
    case "set-account":
      if (isLockedAfterCheckout(state.status)) return state;
      return {
        ...state,
        account: { ...state.account, ...action.account },
        errors: clearFieldErrors(state.errors, Object.keys(action.account)),
        submitError: null,
      };
    case "set-shipping":
      if (isLockedAfterCheckout(state.status)) return state;
      return {
        ...state,
        shipping: { ...state.shipping, ...action.shipping },
        errors: clearFieldErrors(
          state.errors,
          Object.keys(action.shipping).map((key) => (key === "country" ? "shippingCountry" : key)),
        ),
        submitError: null,
      };
    case "toggle-equipment": {
      if (isLockedAfterCheckout(state.status)) return state;
      const selected = state.equipment.includes(action.id);
      const equipment = selected
        ? state.equipment.filter((item) => item !== action.id)
        : [...state.equipment, action.id];
      return {
        ...state,
        equipment,
        errors: { ...state.errors, equipment: undefined },
      };
    }
    case "set-device":
      if (isLockedAfterCheckout(state.status)) return state;
      return {
        ...state,
        device: action.device,
        errors: { ...state.errors, device: undefined },
      };
    case "set-payment":
      if (isLockedAfterCheckout(state.status)) return state;
      return {
        ...state,
        paymentMethod: action.method,
        errors: { ...state.errors, paymentMethod: undefined },
      };
    case "prefill-shipping":
      if (isLockedAfterCheckout(state.status)) return state;
      return {
        ...state,
        shipping: {
          ...state.shipping,
          fullName: state.shipping.fullName || state.account.contactName,
          country: state.shipping.country || state.account.country,
        },
      };
    case "set-errors":
      return {
        ...state,
        errors: action.errors,
        status: state.status === "authorizing" ? "draft" : state.status,
      };
    case "set-step":
      if (!canVisitStep(state.status, action.step)) return state;
      return { ...state, step: action.step, errors: {}, submitError: null };
    case "authorizing":
      return { ...state, status: "authorizing", submitError: null };
    case "ordered":
      return {
        ...state,
        status: "confirmed",
        step: 6,
        order: action.order,
        account: action.order.account,
        equipment: action.order.equipment,
        device: action.order.device,
        shipping: action.order.shipping,
        paymentMethod: action.order.payment.method,
        submitError: null,
        showEmailPreview: false,
      };
    case "password-set":
      return {
        ...state,
        status: action.order.status,
        order: action.order,
        step: state.step < 8 ? 8 : state.step,
        submitError: null,
      };
    case "completed":
      return {
        ...state,
        status: "complete",
        order: action.order,
        step: 9,
        submitError: null,
      };
    case "submit-failed":
      return {
        ...state,
        status: state.order ? state.order.status : "draft",
        submitError: action.message,
      };
    case "toggle-email-preview":
      return {
        ...state,
        showEmailPreview: action.open ?? !state.showEmailPreview,
      };
    case "reset":
      return { ...initialState(action.draft), hydrated: true };
    default:
      return state;
  }
}

export interface UseStartNowOptions {
  repository?: StartNowRepository;
  seed?: StartNowSeed;
  search?: StartNowSearch;
  seedSource?: StartNowSeedSource;
  onAnalytics?: (event: StartNowAnalyticsEvent) => void;
  onComplete?: (order: StartNowOrder) => void;
}

export function useStartNow({
  repository,
  seed,
  search,
  seedSource,
  onAnalytics,
  onComplete,
}: UseStartNowOptions) {
  const repo = useMemo(() => repository ?? createStartNowRepository("local"), [repository]);
  const empty = useMemo(() => createEmptyDraft(), []);
  const [state, dispatch] = useReducer(reducer, empty, initialState);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const hydratedRef = useRef(false);
  const didFocusStepRef = useRef(false);
  const passwordGateRef = useRef<PasswordGate | null>(null);
  const seedSourceRef = useRef(seedSource);
  seedSourceRef.current = seedSource;

  const publishAnalytics = useStartNowAnalytics(onAnalytics);
  const emit = useCallback(
    (name: StartNowAnalyticsEvent["name"], step: StartNowStepIndex, extra: StartNowAnalyticsEvent["metadata"] = {}) => {
      publishAnalytics(
        buildAnalyticsEvent(name, step, {
          adapter: repo.adapter,
          hasDemoBooking: Boolean(state.demoBookingId),
          deviceChoice: state.device || undefined,
          equipmentCount: state.equipment.length,
          paymentMethod: state.paymentMethod || undefined,
          countryCode: state.account.country || state.shipping.country || undefined,
          stylistCount: state.account.stylistCount || undefined,
          ...extra,
        }),
      );
    },
    [
      publishAnalytics,
      repo.adapter,
      state.account.country,
      state.account.stylistCount,
      state.demoBookingId,
      state.device,
      state.equipment.length,
      state.paymentMethod,
      state.shipping.country,
    ],
  );

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const draft = loadDraft();
    const order = draft.orderId
      ? loadOrders().find((item) => item.id === draft.orderId) ?? null
      : null;
    const querySeed = parseStartNowSearch(resolveSearch(search));
    const mergedSeed: StartNowSeed = { ...querySeed, ...seed };
    dispatch({ type: "hydrate", draft, order, seed: mergedSeed });

    const demoBookingId = mergedSeed.demoBookingId || draft.demoBookingId;
    const source = seedSourceRef.current;
    if (demoBookingId && source?.getSeed) {
      void Promise.resolve(source.getSeed(demoBookingId)).then((found) => {
        if (found) dispatch({ type: "apply-seed", seed: { demoBookingId, ...found } });
      });
    }
  }, [search, seed]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveDraft({
      version: 1,
      step: state.step,
      status: state.status === "authorizing" ? "draft" : state.status,
      idempotencyKey: state.idempotencyKey,
      demoBookingId: state.demoBookingId,
      account: state.account,
      equipment: state.equipment,
      device: state.device,
      shipping: state.shipping,
      paymentMethod: state.paymentMethod,
      orderId: state.order?.id ?? null,
      passwordSet: state.order?.passwordSet ?? false,
      updatedAt: new Date().toISOString(),
    });
  }, [
    state.account,
    state.demoBookingId,
    state.device,
    state.equipment,
    state.hydrated,
    state.idempotencyKey,
    state.order?.id,
    state.order?.passwordSet,
    state.paymentMethod,
    state.shipping,
    state.status,
    state.step,
  ]);

  useEffect(() => {
    if (!state.hydrated) return;
    emit("start_now_step_view", state.step);
    // Step views are keyed to the step itself, not metadata snapshots.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated, state.step]);

  useEffect(() => {
    if (!state.hydrated) return;
    if (!didFocusStepRef.current) {
      didFocusStepRef.current = true;
      emit("start_now_view", state.step);
      return;
    }
    headingRef.current?.focus();
    // Focus + first-view emit only; do not retrigger on metadata changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated, state.step]);

  const focusField = useCallback((key: keyof FieldErrors) => {
    if (key === "form") return;
    const node = document.getElementById(`snw-${key}`);
    node?.focus();
  }, []);

  const goToStep = useCallback(
    (step: StartNowStepIndex) => {
      if (step > state.step) return;
      if (!canVisitStep(state.status, step)) return;
      dispatch({ type: "set-step", step });
    },
    [state.status, state.step],
  );

  const goBack = useCallback(() => {
    if (state.step === 0) return;
    if (state.step === FIRST_POST_CONFIRM_STEP) return;
    const next = clampStep(state.step - 1);
    if (!canVisitStep(state.status, next)) return;
    emit("start_now_back", state.step);
    dispatch({ type: "set-step", step: next });
  }, [emit, state.status, state.step]);

  const authorizeOrder = useCallback(async () => {
    if (state.status === "authorizing") return;
    if (state.order) {
      dispatch({ type: "ordered", order: state.order });
      return;
    }

    const accountErrors = validateAccount(state.account);
    const equipmentErrors = validateEquipment(state.equipment);
    const deviceErrors = validateDevice(state.device);
    const shippingErrors = validateShipping(state.shipping);
    const paymentErrors = validatePayment(state.paymentMethod);
    const errors = {
      ...accountErrors,
      ...equipmentErrors,
      ...deviceErrors,
      ...shippingErrors,
      ...paymentErrors,
    };

    if (hasErrors(errors) || !state.device || !state.paymentMethod) {
      dispatch({ type: "set-errors", errors });
      emit("start_now_validation_error", 5);
      if (hasErrors(accountErrors)) dispatch({ type: "set-step", step: 0 });
      else if (hasErrors(equipmentErrors)) dispatch({ type: "set-step", step: 1 });
      else if (hasErrors(deviceErrors)) dispatch({ type: "set-step", step: 2 });
      else if (hasErrors(shippingErrors)) dispatch({ type: "set-step", step: 3 });
      else focusField("paymentMethod");
      return;
    }

    dispatch({ type: "authorizing" });
    const existing = await repo.getOrderByIdempotencyKey(state.idempotencyKey);
    if (existing.ok && existing.data) {
      dispatch({ type: "ordered", order: existing.data });
      emit("start_now_order_authorized", 6, { paymentMethod: existing.data.payment.method });
      onComplete?.(existing.data);
      return;
    }

    const result = await repo.authorizeAndCreateOrder({
      idempotencyKey: state.idempotencyKey,
      demoBookingId: state.demoBookingId,
      account: sanitizeAccount(state.account),
      equipment: state.equipment,
      device: state.device,
      shipping: sanitizeShipping(state.shipping),
      paymentMethod: state.paymentMethod,
    });

    if (!result.ok) {
      dispatch({ type: "submit-failed", message: result.error.message });
      return;
    }

    dispatch({ type: "ordered", order: result.data });
    emit("start_now_order_authorized", 6, { paymentMethod: result.data.payment.method });
    onComplete?.(result.data);
  }, [
    emit,
    focusField,
    onComplete,
    repo,
    state.account,
    state.demoBookingId,
    state.device,
    state.equipment,
    state.idempotencyKey,
    state.order,
    state.paymentMethod,
    state.shipping,
    state.status,
  ]);

  const confirmPassword = useCallback(async () => {
    if (!state.order) {
      dispatch({ type: "submit-failed", message: "Confirm your order before setting a password." });
      return;
    }
    if (state.order.passwordSet) {
      dispatch({ type: "set-step", step: 8 });
      return;
    }

    const accepted = passwordGateRef.current?.() ?? false;
    if (!accepted) {
      emit("start_now_validation_error", 7);
      return;
    }

    const result = await repo.markPasswordSet(state.order.id);
    if (!result.ok) {
      dispatch({ type: "submit-failed", message: result.error.message });
      return;
    }

    dispatch({ type: "password-set", order: result.data });
    emit("start_now_password_set", 8);
  }, [emit, repo, state.order]);

  const finishSetup = useCallback(async () => {
    if (!state.order) return;
    const result = await repo.markComplete(state.order.id);
    if (!result.ok) {
      dispatch({ type: "submit-failed", message: result.error.message });
      return;
    }
    dispatch({ type: "completed", order: result.data });
    emit("start_now_complete", 9);
  }, [emit, repo, state.order]);

  const goNext = useCallback(() => {
    if (state.step === 0) {
      const errors = validateAccount(state.account);
      if (hasErrors(errors)) {
        dispatch({ type: "set-errors", errors });
        emit("start_now_validation_error", 0);
        const key = firstErrorKey(errors);
        if (key) focusField(key);
        return;
      }
      dispatch({ type: "set-account", account: sanitizeAccount(state.account) });
      emit("start_now_continue", 0);
      dispatch({ type: "set-step", step: 1 });
      return;
    }

    if (state.step === 1) {
      const errors = validateEquipment(state.equipment);
      if (hasErrors(errors)) {
        dispatch({ type: "set-errors", errors });
        emit("start_now_validation_error", 1);
        focusField("equipment");
        return;
      }
      emit("start_now_continue", 1);
      dispatch({ type: "set-step", step: 2 });
      return;
    }

    if (state.step === 2) {
      const errors = validateDevice(state.device);
      if (hasErrors(errors)) {
        dispatch({ type: "set-errors", errors });
        emit("start_now_validation_error", 2);
        focusField("device");
        return;
      }
      emit("start_now_continue", 2);
      dispatch({ type: "prefill-shipping" });
      dispatch({ type: "set-step", step: 3 });
      return;
    }

    if (state.step === 3) {
      const errors = validateShipping(state.shipping);
      if (hasErrors(errors)) {
        dispatch({ type: "set-errors", errors });
        emit("start_now_validation_error", 3);
        const key = firstErrorKey(errors);
        if (key) focusField(key);
        return;
      }
      dispatch({ type: "set-shipping", shipping: sanitizeShipping(state.shipping) });
      emit("start_now_continue", 3);
      dispatch({ type: "set-step", step: 4 });
      return;
    }

    if (state.step === 4) {
      emit("start_now_continue", 4);
      dispatch({ type: "set-step", step: 5 });
      return;
    }

    if (state.step === 5) {
      emit("start_now_continue", 5);
      void authorizeOrder();
      return;
    }

    if (state.step === 6) {
      emit("start_now_continue", 6);
      dispatch({ type: "set-step", step: 7 });
      return;
    }

    if (state.step === 7) {
      void confirmPassword();
      return;
    }

    if (state.step === 8) {
      emit("start_now_continue", 8);
      void finishSetup();
    }
  }, [
    authorizeOrder,
    confirmPassword,
    emit,
    finishSetup,
    focusField,
    state.account,
    state.device,
    state.equipment,
    state.shipping,
    state.step,
  ]);

  const reset = useCallback(() => {
    clearDraft();
    dispatch({ type: "reset", draft: createEmptyDraft() });
  }, []);

  const registerPasswordGate = useCallback((gate: PasswordGate | null) => {
    passwordGateRef.current = gate;
  }, []);

  const delivery = useMemo(
    () => state.order?.delivery ?? estimateDelivery(state.shipping),
    [state.order?.delivery, state.shipping],
  );

  return {
    ...state,
    headingRef,
    delivery,
    repositoryAdapter: repo.adapter,
    locked: isLockedAfterCheckout(state.status),
    canGoBack: state.step > 0 && state.step !== FIRST_POST_CONFIRM_STEP,
    currentStepId: stepIdAt(state.step),
    goNext,
    goBack,
    goToStep,
    reset,
    registerPasswordGate,
    setAccount: (account: Partial<AccountDetails>) => dispatch({ type: "set-account", account }),
    setShipping: (shipping: Partial<ShippingAddress>) => dispatch({ type: "set-shipping", shipping }),
    toggleEquipment: (id: EquipmentId) => dispatch({ type: "toggle-equipment", id }),
    setDevice: (device: DeviceChoice) => dispatch({ type: "set-device", device }),
    setPaymentMethod: (method: PaymentMethod) => dispatch({ type: "set-payment", method }),
    toggleEmailPreview: (open?: boolean) => dispatch({ type: "toggle-email-preview", open }),
  };
}

export type StartNowController = ReturnType<typeof useStartNow>;

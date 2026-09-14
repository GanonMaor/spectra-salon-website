import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { dispatchConfirmationEmail } from "./emailDispatch";
import { downloadIcsFile, googleCalendarUrl, outlookCalendarUrl } from "./ics";
import { findNextOpenDateKey } from "./mockAvailability";
import { clearDraft, createEmptyDraft, loadBookings, loadDraft, saveDraft } from "./persistence";
import { createDemoBookingRepository } from "./repository";
import {
  shiftMonth,
  todayDateKey,
} from "./time";
import type {
  DemoBooking,
  DemoBookingRepository,
  DemoBookingStepIndex,
  FieldErrors,
  ImprovementGoal,
  QualifyingAnswers,
  SalonDetails,
  TimeSlot,
} from "./types";
import {
  firstErrorKey,
  hasErrors,
  sanitizeDetails,
  validateQuestions,
  validateSalonDetails,
  validateSlot,
} from "./validation";

export type FlowStatus = "draft" | "submitting" | "confirmed" | "thankyou";

interface FlowState {
  hydrated: boolean;
  step: DemoBookingStepIndex;
  status: FlowStatus;
  details: SalonDetails;
  questions: QualifyingAnswers;
  selectedDateKey: string | null;
  selectedSlot: TimeSlot | null;
  monthCursor: { year: number; month: number };
  errors: FieldErrors;
  availability: TimeSlot[];
  availabilityLoading: boolean;
  booking: DemoBooking | null;
  submitError: string | null;
  showEmailPreview: boolean;
}

type Action =
  | { type: "hydrate"; draft: ReturnType<typeof loadDraft>; booking: DemoBooking | null; dateKey: string }
  | { type: "set-details"; details: Partial<SalonDetails> }
  | { type: "set-questions"; questions: Partial<QualifyingAnswers> }
  | { type: "toggle-goal"; goal: ImprovementGoal }
  | { type: "set-date"; dateKey: string }
  | { type: "set-slot"; slot: TimeSlot }
  | { type: "set-month"; year: number; month: number }
  | { type: "set-availability"; slots: TimeSlot[]; loading: boolean }
  | { type: "set-errors"; errors: FieldErrors }
  | { type: "set-step"; step: DemoBookingStepIndex }
  | { type: "submitting" }
  | { type: "booked"; booking: DemoBooking }
  | { type: "submit-failed"; message: string }
  | { type: "thankyou" }
  | { type: "return-confirm" }
  | { type: "begin-reschedule" }
  | { type: "toggle-email-preview"; open?: boolean }
  | { type: "reset"; dateKey: string };

function todayCursor(dateKey: string): { year: number; month: number } {
  const [year, month] = dateKey.split("-").map(Number);
  return { year, month: month - 1 };
}

function initialState(dateKey: string): FlowState {
  return {
    hydrated: false,
    step: 0,
    status: "draft",
    details: createEmptyDraft().details,
    questions: createEmptyDraft().questions,
    selectedDateKey: dateKey,
    selectedSlot: null,
    monthCursor: todayCursor(dateKey),
    errors: {},
    availability: [],
    availabilityLoading: true,
    booking: null,
    submitError: null,
    showEmailPreview: false,
  };
}

function reducer(state: FlowState, action: Action): FlowState {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        hydrated: true,
        step: action.draft.step,
        status:
          action.draft.status === "thankyou" && action.booking
            ? "thankyou"
            : action.booking
              ? "confirmed"
              : "draft",
        details: action.draft.details,
        questions: action.draft.questions,
        selectedDateKey: action.draft.selectedDateKey ?? action.dateKey,
        selectedSlot: action.draft.selectedSlot,
        monthCursor: todayCursor(action.draft.selectedDateKey ?? action.dateKey),
        booking: action.booking,
        // The preview is a disclosure: collapsed by default so the confirmed
        // step fits one viewport. `toggleEmailPreview` still opens it.
        showEmailPreview: false,
      };
    case "set-details":
      return {
        ...state,
        details: { ...state.details, ...action.details },
        errors: { ...state.errors, ...Object.fromEntries(Object.keys(action.details).map((key) => [key, undefined])) },
        submitError: null,
      };
    case "set-questions":
      return {
        ...state,
        questions: { ...state.questions, ...action.questions },
        errors: { ...state.errors, ...Object.fromEntries(Object.keys(action.questions).map((key) => [key, undefined])) },
      };
    case "toggle-goal": {
      const selected = state.questions.improvementGoals.includes(action.goal);
      const improvementGoals = selected
        ? state.questions.improvementGoals.filter((goal) => goal !== action.goal)
        : [...state.questions.improvementGoals, action.goal];
      return {
        ...state,
        questions: { ...state.questions, improvementGoals },
        errors: { ...state.errors, improvementGoals: undefined },
      };
    }
    case "set-date":
      return {
        ...state,
        selectedDateKey: action.dateKey,
        selectedSlot: state.selectedSlot?.dateKey === action.dateKey ? state.selectedSlot : null,
        errors: { ...state.errors, slot: undefined },
        monthCursor: todayCursor(action.dateKey),
      };
    case "set-slot":
      return {
        ...state,
        selectedSlot: action.slot,
        selectedDateKey: action.slot.dateKey,
        errors: { ...state.errors, slot: undefined },
      };
    case "set-month":
      return { ...state, monthCursor: { year: action.year, month: action.month } };
    case "set-availability":
      return { ...state, availability: action.slots, availabilityLoading: action.loading };
    case "set-errors":
      return { ...state, errors: action.errors, status: state.status === "submitting" ? "draft" : state.status };
    case "set-step":
      return { ...state, step: action.step, errors: {}, submitError: null };
    case "submitting":
      return { ...state, status: "submitting", submitError: null };
    case "booked":
      return {
        ...state,
        status: "confirmed",
        step: 3,
        booking: action.booking,
        selectedSlot: action.booking.slot,
        selectedDateKey: action.booking.slot.dateKey,
        submitError: null,
        showEmailPreview: false,
      };
    case "submit-failed":
      return { ...state, status: "draft", submitError: action.message };
    case "thankyou":
      return { ...state, status: "thankyou" };
    case "return-confirm":
      return state.booking ? { ...state, status: "confirmed", step: 3 } : state;
    case "begin-reschedule":
      return { ...state, status: "draft", step: 1, errors: {}, submitError: null };
    case "toggle-email-preview":
      return {
        ...state,
        showEmailPreview: action.open ?? !state.showEmailPreview,
      };
    case "reset":
      return { ...initialState(action.dateKey), hydrated: true };
    default:
      return state;
  }
}

export interface UseDemoBookingOptions {
  repository?: DemoBookingRepository;
  timeZone: string;
  onComplete?: (booking: DemoBooking) => void;
}

export function useDemoBooking({ repository, timeZone, onComplete }: UseDemoBookingOptions) {
  const repo = useMemo(() => repository ?? createDemoBookingRepository("local"), [repository]);
  const todayKey = todayDateKey(timeZone);
  const [state, dispatch] = useReducer(reducer, todayKey, initialState);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const hydratedRef = useRef(false);
  const didFocusStepRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const draft = loadDraft();
    const booking = draft.bookingId
      ? loadBookings().find((item) => item.id === draft.bookingId) ?? null
      : null;
    const dateKey = draft.selectedDateKey ?? findNextOpenDateKey(todayKey, timeZone, loadBookings()) ?? todayKey;
    dispatch({ type: "hydrate", draft, booking, dateKey });
  }, [timeZone, todayKey]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveDraft({
      version: 1,
      step: state.step,
      status: state.status === "thankyou" ? "thankyou" : state.status === "confirmed" ? "confirmed" : "draft",
      details: state.details,
      questions: state.questions,
      selectedDateKey: state.selectedDateKey,
      selectedSlot: state.selectedSlot,
      bookingId: state.booking?.id ?? null,
      updatedAt: new Date().toISOString(),
    });
  }, [state.booking?.id, state.details, state.hydrated, state.questions, state.selectedDateKey, state.selectedSlot, state.status, state.step]);

  useEffect(() => {
    const dateKey = state.selectedDateKey;
    if (!dateKey) return;
    let cancelled = false;
    dispatch({ type: "set-availability", slots: state.availability, loading: true });
    repo.getAvailability({
      dateKey,
      timezone: timeZone,
      excludeBookingId: state.booking?.id,
    }).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        dispatch({ type: "set-availability", slots: [], loading: false });
        return;
      }
      dispatch({ type: "set-availability", slots: result.data, loading: false });
      if (state.selectedSlot && !result.data.some((slot) => slot.id === state.selectedSlot?.id && slot.available)) {
        dispatch({ type: "set-errors", errors: { ...state.errors, slot: "That time is no longer available. Choose another slot." } });
      }
    });
    return () => {
      cancelled = true;
    };
    // Availability refresh is keyed to date + adapter, not the current slot snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, state.selectedDateKey, timeZone, state.booking?.id]);

  useEffect(() => {
    if (!didFocusStepRef.current) {
      didFocusStepRef.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [state.step, state.status]);

  const focusField = useCallback((key: keyof FieldErrors) => {
    if (key === "form") return;
    const node = document.getElementById(`dbk-${key}`);
    node?.focus();
  }, []);

  const goToStep = useCallback((step: DemoBookingStepIndex) => {
    dispatch({ type: "set-step", step });
  }, []);

  const goBack = useCallback(() => {
    if (state.status === "thankyou") {
      dispatch({ type: "return-confirm" });
      return;
    }
    if (state.step === 0) return;
    dispatch({ type: "set-step", step: (state.step - 1) as DemoBookingStepIndex });
  }, [state.status, state.step]);

  const goNext = useCallback(() => {
    if (state.step === 0) {
      const errors = validateSalonDetails(state.details);
      if (hasErrors(errors)) {
        dispatch({ type: "set-errors", errors });
        const key = firstErrorKey(errors);
        if (key) focusField(key);
        return;
      }
      dispatch({ type: "set-details", details: sanitizeDetails(state.details) });
      dispatch({ type: "set-step", step: 1 });
      return;
    }

    if (state.step === 1) {
      const errors = validateSlot(state.selectedSlot);
      if (hasErrors(errors)) {
        dispatch({ type: "set-errors", errors });
        return;
      }
      dispatch({ type: "set-step", step: state.booking ? 3 : 2 });
      return;
    }

    if (state.step === 2) {
      const errors = validateQuestions(state.questions);
      if (hasErrors(errors)) {
        dispatch({ type: "set-errors", errors });
        const key = firstErrorKey(errors);
        if (key) focusField(key);
        return;
      }
      dispatch({ type: "set-step", step: 3 });
    }
  }, [focusField, state.booking, state.details, state.questions, state.selectedSlot, state.step]);

  const confirmBooking = useCallback(async () => {
    const detailErrors = validateSalonDetails(state.details);
    const slotErrors = validateSlot(state.selectedSlot);
    const questionErrors = validateQuestions(state.questions);
    const errors = { ...detailErrors, ...slotErrors, ...questionErrors };
    if (hasErrors(errors) || !state.selectedSlot) {
      dispatch({ type: "set-errors", errors });
      if (detailErrors.salonName) dispatch({ type: "set-step", step: 0 });
      else if (slotErrors.slot) dispatch({ type: "set-step", step: 1 });
      else if (hasErrors(questionErrors)) dispatch({ type: "set-step", step: 2 });
      return;
    }

    dispatch({ type: "submitting" });
    const availability = await repo.getAvailability({
      dateKey: state.selectedSlot.dateKey,
      timezone: timeZone,
      excludeBookingId: state.booking?.id,
    });
    if (!availability.ok || !availability.data.some((slot) => slot.id === state.selectedSlot?.id && slot.available)) {
      dispatch({
        type: "set-errors",
        errors: { slot: "That time is no longer available. Choose another slot." },
      });
      dispatch({ type: "set-step", step: 1 });
      return;
    }

    const input = {
      details: sanitizeDetails(state.details),
      slot: state.selectedSlot,
      questions: state.questions,
      timezone: timeZone,
    };

    const result = state.booking
      ? await repo.rescheduleBooking(state.booking.id, state.selectedSlot)
      : await repo.createBooking(input);

    if (!result.ok) {
      if (result.error.code === "SLOT_UNAVAILABLE") {
        dispatch({ type: "set-errors", errors: { slot: result.error.message } });
        dispatch({ type: "set-step", step: 1 });
        return;
      }
      dispatch({ type: "submit-failed", message: result.error.message });
      return;
    }

    dispatch({ type: "booked", booking: result.data });
    onComplete?.(result.data);
    void dispatchConfirmationEmail({
      to: result.data.details.workEmail,
      template: "demo-confirmation",
      booking: result.data,
    });
  }, [onComplete, repo, state.booking, state.details, state.questions, state.selectedSlot, timeZone]);

  const startReschedule = useCallback(() => {
    dispatch({ type: "begin-reschedule" });
  }, []);

  const reset = useCallback(() => {
    clearDraft();
    dispatch({ type: "reset", dateKey: findNextOpenDateKey(todayKey, timeZone, loadBookings()) ?? todayKey });
  }, [timeZone, todayKey]);

  const addToCalendar = useCallback(() => {
    if (state.booking) downloadIcsFile(state.booking);
  }, [state.booking]);

  return {
    ...state,
    headingRef,
    timeZone,
    repositoryAdapter: repo.adapter,
    goNext,
    goBack,
    goToStep,
    confirmBooking,
    startReschedule,
    reset,
    addToCalendar,
    googleCalendarUrl: state.booking ? googleCalendarUrl(state.booking) : null,
    outlookCalendarUrl: state.booking ? outlookCalendarUrl(state.booking) : null,
    setDetails: (details: Partial<SalonDetails>) => dispatch({ type: "set-details", details }),
    setQuestions: (questions: Partial<QualifyingAnswers>) => dispatch({ type: "set-questions", questions }),
    toggleGoal: (goal: ImprovementGoal) => dispatch({ type: "toggle-goal", goal }),
    setDate: (dateKey: string) => dispatch({ type: "set-date", dateKey }),
    setSlot: (slot: TimeSlot) => dispatch({ type: "set-slot", slot }),
    setMonth: (year: number, month: number) => dispatch({ type: "set-month", year, month }),
    shiftVisibleMonth: (delta: number) => {
      const next = shiftMonth(state.monthCursor.year, state.monthCursor.month, delta);
      dispatch({ type: "set-month", year: next.year, month: next.month });
    },
    showThankYou: () => dispatch({ type: "thankyou" }),
    toggleEmailPreview: (open?: boolean) => dispatch({ type: "toggle-email-preview", open }),
  };
}

export type DemoBookingController = ReturnType<typeof useDemoBooking>;

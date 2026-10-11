/**
 * State container for the marketing module.
 *
 * Demo mode: a fully simulated world (own dataset, clock, outbox) persisted
 * under its own storage key. Salon mode: settings and automations persist
 * locally, while customers/appointments come only from the CRM and upcoming
 * messages are projections — nothing is ever sent.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getSalonLoginState, getSalonScopeKey } from "../data/salonSession";
import { useCrmLocale } from "../i18n/CrmLocale";
import {
  applyPublishedVersion,
  cancelMessageManually,
  createTestMessage,
  handleAppointmentEvent,
  nextWake,
  onAutomationToggled,
  processNow,
  projectSalonMessages,
  reconcileUnknown,
  resolveIntervalDays,
  runUntil,
  servicesFor,
  type AppointmentEvent,
  type EngineContext,
} from "./engine";
import { buildAlerts, type MarketingAlert } from "./metrics";
import { actorLabel, permissionsForRole, resolveMarketingRole, type MarketingPermissions } from "./permissions";
import { fictionalSample, listSamples } from "./preview";
import { createLocalMarketingRepository, type MarketingRepository } from "./repository";
import { useSalonMarketingDataset } from "./salonData";
import { hasBlockingIssues, validateVersion } from "./templates";
import { addMinutes, atLocalTimeAfterDays } from "./time";
import type {
  AttemptOutcome,
  AuditEvent,
  AutomationKind,
  AutomationVersion,
  ConsentStatus,
  LanguageCode,
  MarketingActorRole,
  MarketingAppointment,
  MarketingDataset,
  MarketingMode,
  MarketingState,
  ProviderBehavior,
  ScheduledMessage,
  SmsSettings,
} from "./types";

export type ActionError =
  | "forbidden"
  | "invalid"
  | "interval_required"
  | "not_connected"
  | "demo_only"
  | "not_found";

export type ActionResult = { ok: true; count?: number } | { ok: false; error: ActionError };

export interface TestSendInput {
  kind: AutomationKind;
  version: AutomationVersion;
  lang: LanguageCode;
  phone: string;
  outcome: ProviderBehavior;
}

export interface BookInput {
  customerId: string;
  serviceIds: string[];
  dayOffset: number;
  time: string;
}

export interface MarketingActions {
  setMode: (mode: MarketingMode) => void;
  saveDraft: (kind: AutomationKind, version: AutomationVersion) => ActionResult;
  discardDraft: (kind: AutomationKind) => ActionResult;
  publish: (kind: AutomationKind, version?: AutomationVersion) => ActionResult;
  setEnabled: (kind: AutomationKind, enabled: boolean) => ActionResult;
  updateSettings: (patch: Partial<SmsSettings>) => ActionResult;
  connectSms: () => ActionResult;
  disconnectSms: () => ActionResult;
  completeFirstRun: () => ActionResult;
  sendTest: (input: TestSendInput) => { ok: true; message: ScheduledMessage } | { ok: false; error: ActionError };
  cancelMessage: (id: string) => ActionResult;
  resumeMessage: (id: string) => ActionResult;
  reconcileMessage: (id: string, answer?: "delivered" | "not_received") => ActionResult;
  // Demo-only controls
  advanceClock: (minutes: number) => ActionResult;
  advanceToNextEvent: () => ActionResult;
  setNextProviderOutcome: (outcome: ProviderBehavior) => ActionResult;
  setActingRole: (role: MarketingActorRole) => ActionResult;
  resetDemo: () => ActionResult;
  restartFirstRun: () => ActionResult;
  bookAppointment: (input: BookInput) => ActionResult;
  rescheduleAppointment: (id: string, dayShift: number) => ActionResult;
  cancelAppointment: (id: string) => ActionResult;
  completeAppointment: (id: string) => ActionResult;
  markNoShow: (id: string) => ActionResult;
  setConsent: (customerId: string, channel: "marketing" | "transactional", status: ConsentStatus) => ActionResult;
}

export interface MarketingContextValue {
  mode: MarketingMode;
  state: MarketingState;
  dataset: MarketingDataset;
  datasetReady: boolean;
  now: string;
  timezone: string;
  messages: ScheduledMessage[];
  permissions: MarketingPermissions;
  actorName: string;
  alerts: MarketingAlert[];
  actions: MarketingActions;
}

const MarketingContext = createContext<MarketingContextValue | null>(null);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function providerFromBehavior(behavior: ProviderBehavior | undefined): AttemptOutcome {
  switch (behavior) {
    case "temporary_failure":
      return "temporary_failure";
    case "timeout":
      return "timeout";
    case "permanent_failure":
      return "permanent_failure";
    default:
      return "accepted";
  }
}

function buildContext(state: MarketingState, dataset: MarketingDataset, now: string, oneShot?: ProviderBehavior): EngineContext {
  return {
    now,
    dataset,
    settings: state.settings,
    automations: state.automations,
    nextId: () => {
      state.sequence += 1;
      return `${state.mode === "demo" ? "msg" : "local"}-${String(state.sequence).padStart(4, "0")}`;
    },
    provider: () => {
      if (oneShot) {
        const outcome = providerFromBehavior(oneShot);
        oneShot = undefined;
        return outcome;
      }
      const pending = state.nextProviderOutcome;
      if (pending && pending !== "normal") {
        state.nextProviderOutcome = "normal";
        return providerFromBehavior(pending);
      }
      return "accepted";
    },
  };
}

export interface MarketingProviderProps {
  children: React.ReactNode;
  /** Injected in tests. */
  repository?: MarketingRepository;
  salonData?: { ready: boolean; dataset: MarketingDataset };
  realNow?: () => string;
}

const SalonDataBridge: React.FC<{ children: (data: { ready: boolean; dataset: MarketingDataset }) => React.ReactNode }> = ({
  children,
}) => <>{children(useSalonMarketingDataset())}</>;

export const MarketingProvider: React.FC<MarketingProviderProps> = ({ children, repository, salonData, realNow }) => {
  if (salonData) {
    return (
      <MarketingStateProvider repository={repository} salonData={salonData} realNow={realNow}>
        {children}
      </MarketingStateProvider>
    );
  }
  return (
    <SalonDataBridge>
      {(data) => (
        <MarketingStateProvider repository={repository} salonData={data} realNow={realNow}>
          {children}
        </MarketingStateProvider>
      )}
    </SalonDataBridge>
  );
};

const MarketingStateProvider: React.FC<{
  children: React.ReactNode;
  repository?: MarketingRepository;
  salonData: { ready: boolean; dataset: MarketingDataset };
  realNow?: () => string;
}> = ({ children, repository, salonData, realNow }) => {
  const { lang } = useCrmLocale();
  const scopeKey = useMemo(() => getSalonScopeKey(), []);
  const repo = useMemo(() => repository ?? createLocalMarketingRepository(scopeKey), [repository, scopeKey]);
  const readNow = useCallback(() => (realNow ? realNow() : new Date().toISOString()), [realNow]);
  const [realClock, setRealClock] = useState(readNow);
  const salonTimezone = salonData.dataset.salon.timezone;

  const [mode, setModeState] = useState<MarketingMode>(() => repo.loadMode());
  const [state, setState] = useState<MarketingState>(() =>
    repo.load(repo.loadMode(), { timezone: salonTimezone, now: readNow(), actor: "owner" }),
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (mode !== "salon") return undefined;
    const timer = window.setInterval(() => setRealClock(readNow()), 60_000);
    return () => window.clearInterval(timer);
  }, [mode, readNow]);

  const loginRole = getSalonLoginState()?.role ?? null;
  const role = resolveMarketingRole(mode, loginRole, state.actingRole);
  const permissions = useMemo(() => permissionsForRole(role), [role]);
  const actorName = actorLabel(role, lang);

  const dataset = mode === "demo" && state.dataset ? state.dataset : salonData.dataset;
  const now = mode === "demo" ? state.clock ?? readNow() : realClock;
  const timezone = state.settings.timezone || dataset.salon.timezone;

  const messages = useMemo(() => {
    if (mode === "demo") return state.messages;
    const ctx = buildContext(clone(state), dataset, now);
    return [...projectSalonMessages(ctx), ...state.messages.filter((message) => message.isTest)];
  }, [mode, state, dataset, now]);

  const alerts = useMemo(() => buildAlerts(state, messages, now), [state, messages, now]);

  // Salon mode only persists simulated test sends; let their receipts arrive.
  useEffect(() => {
    if (mode !== "salon") return;
    const current = stateRef.current;
    if (!current.messages.some((message) => message.status === "sent" || message.status === "unknown")) return;
    const draft = clone(current);
    processNow(buildContext(draft, salonData.dataset, realClock), draft.messages);
    if (JSON.stringify(draft.messages) !== JSON.stringify(current.messages)) {
      stateRef.current = draft;
      setState(draft);
      repo.save(draft);
    }
  }, [mode, realClock, repo, salonData.dataset]);

  const commit = useCallback(
    (next: MarketingState) => {
      stateRef.current = next;
      setState(next);
      repo.save(next);
    },
    [repo],
  );

  /** Run a mutation against a working copy and persist it. */
  const mutate = useCallback(
    (fn: (draft: MarketingState, ctx: EngineContext) => ActionResult | void, oneShot?: ProviderBehavior): ActionResult => {
      const draft = clone(stateRef.current);
      const draftDataset = draft.mode === "demo" && draft.dataset ? draft.dataset : salonData.dataset;
      const draftNow = draft.mode === "demo" ? draft.clock ?? readNow() : readNow();
      const ctx = buildContext(draft, draftDataset, draftNow, oneShot);
      const result = fn(draft, ctx) ?? { ok: true };
      if (result.ok) commit(draft);
      return result;
    },
    [commit, readNow, salonData.dataset],
  );

  const audit = useCallback(
    (draft: MarketingState, action: AuditEvent["action"], target: string, detail?: string, at?: string) => {
      draft.audit.unshift({
        id: `audit-${draft.audit.length + 1}-${Date.now().toString(36)}`,
        at: at ?? (draft.mode === "demo" ? draft.clock ?? readNow() : readNow()),
        actor: actorName,
        action,
        target,
        detail,
      });
      draft.audit = draft.audit.slice(0, 200);
    },
    [actorName, readNow],
  );

  const demoOnly = useCallback(
    (fn: (draft: MarketingState, ctx: EngineContext) => ActionResult | void): ActionResult => {
      if (stateRef.current.mode !== "demo") return { ok: false, error: "demo_only" };
      return mutate(fn);
    },
    [mutate],
  );

  const actions = useMemo<MarketingActions>(() => {
    const appointmentEvent = (event: AppointmentEvent) => (draft: MarketingState, ctx: EngineContext) => {
      handleAppointmentEvent(ctx, draft.messages, event);
      processNow(ctx, draft.messages);
    };

    return {
      setMode: (nextMode) => {
        repo.saveMode(nextMode);
        setModeState(nextMode);
        const loaded = repo.load(nextMode, { timezone: salonTimezone, now: readNow(), actor: actorName });
        stateRef.current = loaded;
        setState(loaded);
      },

      saveDraft: (kind, version) => {
        if (!permissions.canEditDrafts) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          const automation = draft.automations[kind];
          automation.draft = {
            ...clone(version),
            version: automation.published.version + 1,
            updatedAt: ctx.now,
            updatedBy: actorName,
            publishedAt: undefined,
            publishedBy: undefined,
          };
          audit(draft, "draft_saved", kind, `v${automation.draft.version}`, ctx.now);
        });
      },

      discardDraft: (kind) => {
        if (!permissions.canEditDrafts) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          if (!draft.automations[kind].draft) return { ok: false, error: "not_found" };
          draft.automations[kind].draft = null;
          audit(draft, "draft_discarded", kind, undefined, ctx.now);
        });
      },

      publish: (kind, version) => {
        if (!permissions.canPublish) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          const automation = draft.automations[kind];
          const source = version ? clone(version) : automation.draft;
          if (!source) return { ok: false, error: "not_found" };
          if (hasBlockingIssues(validateVersion(kind, source, draft.settings))) return { ok: false, error: "invalid" };
          automation.published = {
            ...source,
            version: automation.published.version + 1,
            updatedAt: version ? ctx.now : source.updatedAt,
            updatedBy: version ? actorName : source.updatedBy,
            publishedAt: ctx.now,
            publishedBy: actorName,
          };
          automation.draft = null;
          const count = applyPublishedVersion(ctx, draft.messages, kind);
          audit(draft, "published", kind, `v${automation.published.version}`, ctx.now);
          if (draft.mode === "demo") processNow(ctx, draft.messages);
          return { ok: true, count };
        });
      },

      setEnabled: (kind, enabled) => {
        if (!permissions.canToggle) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          const automation = draft.automations[kind];
          if (enabled && kind === "rebooking_invite") {
            const version = automation.published;
            const hasInterval = Boolean(resolveIntervalDays(version, "__general__"))
              || Object.values(version.serviceOverrides).some((override) => (override.intervalDays ?? 0) > 0);
            if (!hasInterval) return { ok: false, error: "interval_required" };
          }
          automation.enabled = enabled;
          const count = draft.mode === "demo" ? onAutomationToggled(ctx, draft.messages, kind) : 0;
          audit(draft, enabled ? "enabled" : "disabled", kind, undefined, ctx.now);
          if (draft.mode === "demo") processNow(ctx, draft.messages);
          return { ok: true, count };
        });
      },

      updateSettings: (patch) => {
        if (!permissions.canManageSettings) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          draft.settings = { ...draft.settings, ...patch };
          ctx.settings = draft.settings;
          audit(draft, "settings_updated", "sms", Object.keys(patch).join(", "), ctx.now);
          if (draft.mode === "demo") processNow(ctx, draft.messages);
        });
      },

      connectSms: () => {
        if (!permissions.canManageSettings) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          draft.settings.connection = "connected";
          draft.settings.providerLabel = "SMS";
          ctx.settings = draft.settings;
          audit(draft, "sms_connected", "sms", draft.settings.providerLabel, ctx.now);
          if (draft.mode === "demo") processNow(ctx, draft.messages);
        });
      },

      disconnectSms: () => {
        if (!permissions.canManageSettings) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          draft.settings.connection = "not_connected";
          audit(draft, "sms_disconnected", "sms", undefined, ctx.now);
        });
      },

      completeFirstRun: () => {
        if (!permissions.canManageSettings) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          if (draft.settings.connection !== "connected") return { ok: false, error: "not_connected" };
          draft.settings.onboardingCompletedAt = ctx.now;
        });
      },

      sendTest: ({ kind, version, lang: testLang, phone, outcome }) => {
        if (!permissions.canSendTest) return { ok: false, error: "forbidden" };
        if (stateRef.current.settings.connection !== "connected") return { ok: false, error: "not_connected" };
        let created: ScheduledMessage | null = null;
        const result = mutate((draft, ctx) => {
          const samples = listSamples(ctx.dataset, kind, ctx.now);
          const picked = samples[0];
          const { sample, dataset: sampleDataset } = picked
            ? { sample: picked, dataset: ctx.dataset }
            : fictionalSample(ctx.dataset, kind, testLang, ctx.now, draft.settings.timezone);
          const message = createTestMessage(
            { ...ctx, dataset: sampleDataset },
            kind,
            version,
            testLang,
            phone,
            sample,
          );
          draft.messages.push(message);
          draft.settings.testSentAt = ctx.now;
          created = message;
          audit(draft, "test_sent", kind, phone, ctx.now);
        }, outcome);
        if (!result.ok || !created) return { ok: false, error: result.ok ? "invalid" : result.error };
        return { ok: true, message: created };
      },

      cancelMessage: (id) => {
        if (!permissions.canCancelMessages) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          const message = draft.messages.find((item) => item.id === id);
          if (!message) return { ok: false, error: "not_found" };
          cancelMessageManually(ctx, message);
          audit(draft, "message_cancelled", id, message.automation, ctx.now);
        });
      },

      resumeMessage: (id) => {
        if (!permissions.canCancelMessages) return { ok: false, error: "forbidden" };
        return mutate((draft, ctx) => {
          const message = draft.messages.find((item) => item.id === id);
          if (!message || message.status !== "paused") return { ok: false, error: "not_found" };
          message.status = "scheduled";
          message.reason = undefined;
          message.scheduledFor = ctx.now;
          message.updatedAt = ctx.now;
          processNow(ctx, draft.messages);
          audit(draft, "message_resumed", id, message.automation, ctx.now);
        });
      },

      reconcileMessage: (id, answer) =>
        mutate((draft, ctx) => {
          const message = draft.messages.find((item) => item.id === id);
          if (!message || message.status !== "unknown") return { ok: false, error: "not_found" };
          reconcileUnknown(ctx, message, answer);
          audit(draft, "message_reconciled", id, answer ?? "auto", ctx.now);
        }),

      advanceClock: (minutes) =>
        demoOnly((draft, ctx) => {
          const target = addMinutes(ctx.now, minutes);
          runUntil(ctx, draft.messages, target);
          draft.clock = target;
        }),

      advanceToNextEvent: () =>
        demoOnly((draft, ctx) => {
          const wake = nextWake(draft.messages);
          if (!wake) return { ok: false, error: "not_found" };
          const target = wake > ctx.now ? wake : ctx.now;
          runUntil(ctx, draft.messages, target);
          draft.clock = target;
        }),

      setNextProviderOutcome: (outcome) =>
        demoOnly((draft) => {
          draft.nextProviderOutcome = outcome;
        }),

      setActingRole: (nextRole) =>
        demoOnly((draft) => {
          draft.actingRole = nextRole;
        }),

      resetDemo: () => {
        if (stateRef.current.mode !== "demo") return { ok: false, error: "demo_only" };
        if (!permissions.canResetDemo) return { ok: false, error: "forbidden" };
        const fresh = repo.resetDemo();
        stateRef.current = fresh;
        setState(fresh);
        return { ok: true };
      },

      restartFirstRun: () =>
        demoOnly((draft) => {
          draft.settings.onboardingCompletedAt = undefined;
          draft.settings.testSentAt = undefined;
          draft.settings.connection = "not_connected";
        }),

      bookAppointment: (input) =>
        demoOnly((draft, ctx) => {
          if (!input.serviceIds.length) return { ok: false, error: "invalid" };
          const services = servicesFor(ctx.dataset, input.serviceIds);
          const start = atLocalTimeAfterDays(ctx.now, draft.settings.timezone, input.dayOffset, input.time);
          const minutes = services.reduce((sum, service) => sum + (service.durationMinutes ?? 60), 0) || 60;
          draft.sequence += 1;
          const appointment: MarketingAppointment = {
            id: `a-sim-${draft.sequence}`,
            customerId: input.customerId,
            serviceIds: input.serviceIds,
            staffName: lang === "he" ? "אור" : "Or",
            startTime: start,
            endTime: addMinutes(start, minutes),
            status: "confirmed",
            createdAt: ctx.now,
          };
          ctx.dataset.appointments.push(appointment);
          appointmentEvent({ type: "booked", appointmentId: appointment.id })(draft, ctx);
        }),

      rescheduleAppointment: (id, dayShift) =>
        demoOnly((draft, ctx) => {
          const appointment = ctx.dataset.appointments.find((item) => item.id === id);
          if (!appointment || appointment.status !== "confirmed") return { ok: false, error: "not_found" };
          const previousStart = appointment.startTime;
          const duration = new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime();
          appointment.startTime = addMinutes(appointment.startTime, dayShift * 24 * 60);
          appointment.endTime = new Date(new Date(appointment.startTime).getTime() + duration).toISOString();
          appointmentEvent({ type: "rescheduled", appointmentId: id, previousStart })(draft, ctx);
        }),

      cancelAppointment: (id) =>
        demoOnly((draft, ctx) => {
          const appointment = ctx.dataset.appointments.find((item) => item.id === id);
          if (!appointment || appointment.status !== "confirmed") return { ok: false, error: "not_found" };
          appointment.status = "cancelled";
          appointmentEvent({ type: "cancelled", appointmentId: id })(draft, ctx);
        }),

      completeAppointment: (id) =>
        demoOnly((draft, ctx) => {
          const appointment = ctx.dataset.appointments.find((item) => item.id === id);
          if (!appointment || appointment.status !== "confirmed") return { ok: false, error: "not_found" };
          appointment.status = "completed";
          appointment.completedAt = ctx.now;
          appointmentEvent({ type: "completed", appointmentId: id })(draft, ctx);
        }),

      markNoShow: (id) =>
        demoOnly((draft, ctx) => {
          const appointment = ctx.dataset.appointments.find((item) => item.id === id);
          if (!appointment || appointment.status !== "confirmed") return { ok: false, error: "not_found" };
          appointment.status = "no-show";
          appointmentEvent({ type: "no_show", appointmentId: id })(draft, ctx);
        }),

      setConsent: (customerId, channel, status) =>
        demoOnly((_draft, ctx) => {
          const customer = ctx.dataset.customers.find((item) => item.id === customerId);
          if (!customer) return { ok: false, error: "not_found" };
          customer.consent[channel] =
            status === "unknown"
              ? { status }
              : { status, source: lang === "he" ? "עדכון בכרטיס לקוחה" : "Updated on customer card", recordedAt: ctx.now };
        }),
    };
  }, [actorName, audit, demoOnly, lang, mutate, permissions, readNow, repo, salonTimezone]);

  const value = useMemo<MarketingContextValue>(
    () => ({
      mode,
      state,
      dataset,
      datasetReady: mode === "demo" || salonData.ready,
      now,
      timezone,
      messages,
      permissions,
      actorName,
      alerts,
      actions,
    }),
    [mode, state, dataset, salonData.ready, now, timezone, messages, permissions, actorName, alerts, actions],
  );

  return <MarketingContext.Provider value={value}>{children}</MarketingContext.Provider>;
};

export function useMarketing(): MarketingContextValue {
  const ctx = useContext(MarketingContext);
  if (!ctx) throw new Error("useMarketing must be used inside MarketingProvider");
  return ctx;
}

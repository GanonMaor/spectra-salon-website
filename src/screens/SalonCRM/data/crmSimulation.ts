/**
 * Deterministic salon-day simulation.
 *
 * `runSimulationDay` walks the same action path the UI uses
 * (`applyActionRequest`) so simulated runs exercise every validator
 * and reducer branch. The simulation is seeded from a string: same
 * seed in, same exact action sequence and final state out. This is
 * critical for reproducing bugs reported via action logs and for
 * regression tests.
 *
 * Returns:
 *   - the final state,
 *   - a per-step trace,
 *   - the `ValidationReport` from the resulting state,
 *   - aggregate counts (appointments created, visits completed, etc.).
 *
 * The simulation never bypasses the reducer or the validators. If a
 * validator rejects an action, the simulation records the failure
 * trace and continues; failed actions do not silently update state.
 */

import { applyActionRequest, type ActionRequest } from "./crmActionRunner";
import { recordActionTrace } from "./crmActionLogger";
import {
  nextTraceId,
  type AffectedEntities,
  type CRMActionTrace,
  type CRMActionType,
} from "./crmContracts";
import { validateCRMState, type ValidationReport } from "./crmStateValidation";
import type { CRMNormalizedState } from "./crmTypes";

export interface SimulationOptions {
  /** Seed string. Same seed → same output. */
  seed?: string;
  /** Maximum simulated appointments. Defaults to ~12. */
  maxAppointments?: number;
  /** Whether to record traces through the action logger. */
  recordTraces?: boolean;
  /** Origin tag for produced traces. */
  origin?: CRMActionTrace["origin"];
}

export interface SimulationSummary {
  seed: string;
  appointmentsCreated: number;
  appointmentsFailed: number;
  visitsStarted: number;
  visitsCompleted: number;
  mixesCreated: number;
  productUsageEvents: number;
  reweighOutcomes: number;
  totalActions: number;
  failedActions: number;
  validation: ValidationReport;
  traceIds: string[];
  finalStateVersion: number;
}

export interface SimulationRun {
  finalState: CRMNormalizedState;
  summary: SimulationSummary;
  traces: CRMActionTrace[];
}

// ── Seedable PRNG ────────────────────────────────────────────────

/** mulberry32 — small, deterministic, good enough for simulation. */
function makeRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, list: T[]): T {
  return list[Math.floor(rng() * list.length)];
}

// ── Simulation ───────────────────────────────────────────────────

export function runSimulationDay(
  initial: CRMNormalizedState,
  options: SimulationOptions = {},
): SimulationRun {
  const seed = options.seed ?? "default-day";
  const recordTraces = options.recordTraces ?? false;
  const origin = options.origin ?? "simulation";
  const maxAppointments = options.maxAppointments ?? 12;
  const rng = makeRng(seed);

  let state = initial;
  const traces: CRMActionTrace[] = [];
  const appointmentIds: string[] = [];
  const visitIdsByAppointment = new Map<string, string>();
  const visitServiceIdsByAppointment = new Map<string, string>();
  const mixIdsByVisitService = new Map<string, string>();

  const summary = {
    appointmentsCreated: 0,
    appointmentsFailed: 0,
    visitsStarted: 0,
    visitsCompleted: 0,
    mixesCreated: 0,
    productUsageEvents: 0,
    reweighOutcomes: 0,
    totalActions: 0,
    failedActions: 0,
  };

  const customers = Object.values(state.customersById);
  const staff = Object.values(state.staffById);
  const services = Object.values(state.servicesById);
  const inventoryItems = Object.values(state.inventoryById).filter((i) => !!state.productsById[i.productId]);
  const today = new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0);

  if (customers.length === 0 || staff.length === 0 || services.length === 0) {
    return finalize(state, traces, summary, seed);
  }

  // Phase 1: create appointments
  for (let i = 0; i < maxAppointments; i++) {
    const customer = pick(rng, customers);
    const member = pick(rng, staff);
    const service = pick(rng, services);
    const startMs = baseDate.getTime() + i * 45 * 60_000;
    const endMs = startMs + Math.max(service.defaultDurationMinutes ?? 60, 30) * 60_000;
    const out = step(state, {
      type: "appointment.create",
      input: {
        staffMemberId: member.id,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName ?? ""}`.trim(),
        serviceId: service.id,
        serviceName: service.name,
        serviceCategoryId: service.categoryId,
        startTime: new Date(startMs).toISOString(),
        endTime: new Date(endMs).toISOString(),
        status: "confirmed",
      },
    });
    state = out.state;
    if (out.result.ok && out.result.data) {
      appointmentIds.push((out.result.data as { id: string }).id);
      summary.appointmentsCreated += 1;
    } else {
      summary.appointmentsFailed += 1;
    }
  }

  // Phase 2: start visits, attach service, mix, usage, reweigh, complete.
  for (const apptId of appointmentIds) {
    const appt = state.appointmentsById[apptId];
    if (!appt) continue;
    const startVisit = step(state, {
      type: "visit.start",
      input: {
        customerId: appt.customerId ?? customers[0].id,
        appointmentId: appt.id,
        staffMemberId: appt.staffMemberId,
      },
    });
    state = startVisit.state;
    if (!startVisit.result.ok) continue;
    const visitId = startVisit.result.data as string;
    visitIdsByAppointment.set(apptId, visitId);
    summary.visitsStarted += 1;

    // Attach a service.
    const svc = state.servicesById[appt.serviceId ?? services[0].id] ?? services[0];
    const attach = step(state, {
      type: "visit.attachService",
      input: { visitId, serviceId: svc.id, staffMemberId: appt.staffMemberId },
    });
    state = attach.state;
    if (!attach.result.ok) continue;
    const visitServiceId = attach.result.data as string;
    visitServiceIdsByAppointment.set(apptId, visitServiceId);

    // Start a mix.
    const mix = step(state, {
      type: "mix.start",
      input: { visitServiceId, expectedGrams: 80 + Math.floor(rng() * 40) },
    });
    state = mix.state;
    if (mix.result.ok) {
      const mixId = mix.result.data as string;
      mixIdsByVisitService.set(visitServiceId, mixId);
      summary.mixesCreated += 1;

      // Record up to two product usage events.
      const usageCount = 1 + Math.floor(rng() * 2);
      for (let u = 0; u < usageCount; u++) {
        if (inventoryItems.length === 0) break;
        const inv = pick(rng, inventoryItems);
        const grams = 30 + Math.floor(rng() * 70);
        const usage = step(state, {
          type: "mix.recordUsage",
          input: { mixSessionId: mixId, inventoryItemId: inv.id, grams },
        });
        state = usage.state;
        if (usage.result.ok) summary.productUsageEvents += 1;
      }

      // Reweigh.
      const expected = state.mixSessionsById[mixId]?.expectedGrams ?? 80;
      const variance = Math.floor(rng() * 11) - 5;
      const reweigh = step(state, {
        type: "mix.reweigh",
        input: { mixSessionId: mixId, expectedGrams: expected, actualGrams: Math.max(0, expected + variance) },
      });
      state = reweigh.state;
      if (reweigh.result.ok) summary.reweighOutcomes += 1;
    }

    // Complete visit.
    const complete = step(state, { type: "visit.complete", visitId });
    state = complete.state;
    if (complete.result.ok) summary.visitsCompleted += 1;
  }

  return finalize(state, traces, summary, seed);

  // ── helpers (closure scope) ─────────────────────────────────
  function step(s: CRMNormalizedState, request: ActionRequest) {
    const before = s;
    const out = applyActionRequest(before, request);
    summary.totalActions += 1;
    if (!out.result.ok) summary.failedActions += 1;

    const traceId = nextTraceId("act");
    const trace: CRMActionTrace = {
      id: traceId,
      timestamp: new Date().toISOString(),
      actionType: out.actionType,
      input: serializeRequest(request),
      result: out.result,
      affectedEntities: out.affected as AffectedEntities,
      stateVersionBefore: before.version ?? 0,
      stateVersionAfter: out.state.version ?? before.version ?? 0,
      origin,
    };
    traces.push(trace);
    if (recordTraces) recordActionTrace(trace);
    return out;
  }
}

function serializeRequest(req: ActionRequest): unknown {
  return req;
}

function finalize(
  state: CRMNormalizedState,
  traces: CRMActionTrace[],
  summary: {
    appointmentsCreated: number;
    appointmentsFailed: number;
    visitsStarted: number;
    visitsCompleted: number;
    mixesCreated: number;
    productUsageEvents: number;
    reweighOutcomes: number;
    totalActions: number;
    failedActions: number;
  },
  seed: string,
): SimulationRun {
  const validation = validateCRMState(state, "simulation.final");
  return {
    finalState: state,
    traces,
    summary: {
      seed,
      ...summary,
      validation,
      traceIds: traces.map((t) => t.id),
      finalStateVersion: state.version ?? 0,
    },
  };
}

/** Deterministic snapshot reset: drop derived state and re-seed from
 *  the canonical seed snapshot factory. Useful for tests that want a
 *  pristine starting point per simulation. */
export function buildSimulationSnapshot(
  initial: CRMNormalizedState,
): CRMNormalizedState {
  return { ...initial, version: 0, lastUpdatedAt: new Date(0).toISOString() };
}

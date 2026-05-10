/**
 * Action and AI trace logger.
 *
 * Every successful or failed action goes through `recordActionTrace`.
 * AI commands additionally go through `recordAITrace`. The logger is
 * an in-memory ring buffer with a configurable limit so dev sessions,
 * simulations, and replay flows can inspect the most recent N traces
 * without leaking memory.
 *
 * Exposed via:
 *   - `useCRMActionLog()` (see crmHooks.ts) for UI subscribers.
 *   - `getActionTraces()` / `getAITraces()` for tests, simulation,
 *     and replay.
 *
 * Production note: the logger is not the system of record. Once the
 * backend ships, traces should also be POSTed to a server-side audit
 * sink. This file isolates that future change behind one function.
 */

import type {
  AITrace,
  CRMActionTrace,
} from "./crmContracts";

const DEFAULT_LIMIT = 200;

interface LoggerState {
  actions: CRMActionTrace[];
  ai: AITrace[];
  limit: number;
  listeners: Set<() => void>;
}

const state: LoggerState = {
  actions: [],
  ai: [],
  limit: DEFAULT_LIMIT,
  listeners: new Set(),
};

function emit(): void {
  for (const listener of state.listeners) {
    try {
      listener();
    } catch (err) {
      // Listeners must not break the action pipeline. Log and continue.
      // eslint-disable-next-line no-console
      console.warn("[CRM:logger] listener threw", err);
    }
  }
}

function trim<T>(list: T[], limit: number): T[] {
  if (list.length <= limit) return list;
  return list.slice(list.length - limit);
}

// ── Public API ───────────────────────────────────────────────────

export function recordActionTrace(trace: CRMActionTrace): void {
  state.actions.push(trace);
  state.actions = trim(state.actions, state.limit);
  emit();
}

export function recordAITrace(trace: AITrace): void {
  state.ai.push(trace);
  state.ai = trim(state.ai, state.limit);
  emit();
}

export function getActionTraces(): CRMActionTrace[] {
  return state.actions.slice();
}

export function getAITraces(): AITrace[] {
  return state.ai.slice();
}

export function clearTraces(): void {
  state.actions = [];
  state.ai = [];
  emit();
}

export function setLogLimit(limit: number): void {
  state.limit = Math.max(1, Math.floor(limit));
  state.actions = trim(state.actions, state.limit);
  state.ai = trim(state.ai, state.limit);
}

export function subscribe(listener: () => void): () => void {
  state.listeners.add(listener);
  return () => state.listeners.delete(listener);
}

/** Snapshot the last N action traces (for replay/debugging). */
export function snapshotActionTraces(count?: number): CRMActionTrace[] {
  if (!count || count >= state.actions.length) return state.actions.slice();
  return state.actions.slice(state.actions.length - count);
}

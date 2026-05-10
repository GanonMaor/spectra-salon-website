/**
 * Action replay system.
 *
 * Replay takes:
 *   - an initial `CRMNormalizedState` (typically the hydrated baseline
 *     captured before recording), and
 *   - an array of `RecordedAction` (saved input + expected outcome),
 * and re-runs them through `applyActionRequest`. The result includes
 * the final state, the resulting validation report, and — crucially —
 * the first action that diverges (if any) from the recorded
 * outcome.
 *
 * `record(...)` produces a `RecordedAction[]` from the live action
 * log. The same trace shape is used, so replaying a salon-day
 * simulation or a UI session works the same way. In strict mode,
 * divergence throws a `CRMDomainError` so tests fail loudly.
 */

import { applyActionRequest, type ActionRequest } from "./crmActionRunner";
import {
  CRMDomainError,
  type ActionResult,
  type CRMActionTrace,
} from "./crmContracts";
import { getActionTraces } from "./crmActionLogger";
import { getCRMStrictMode } from "./crmStrictMode";
import { validateCRMState, type ValidationReport } from "./crmStateValidation";
import type { CRMNormalizedState } from "./crmTypes";

export interface RecordedAction {
  /** Stable identifier so replay can be correlated with the source. */
  traceId: string;
  request: ActionRequest;
  expected: ActionResult<unknown>;
  stateVersionBefore: number;
  stateVersionAfter: number;
}

export interface ReplayDivergence {
  index: number;
  recorded: RecordedAction;
  actual: ActionResult<unknown>;
  reason: "result_changed" | "version_mismatch";
}

export interface ReplayReport {
  finalState: CRMNormalizedState;
  validation: ValidationReport;
  divergence: ReplayDivergence | null;
  appliedCount: number;
}

// ── Recording ────────────────────────────────────────────────────

/**
 * Convert action traces from the logger into a replayable sequence.
 *
 * The logger stores the full `input` blob from `recordActionTrace`,
 * but for replay we need the typed `ActionRequest`. Callers typically
 * record from simulation (which serializes the request) or wrap
 * action invocations themselves. For action traces produced by the
 * UI hook layer, the input shape matches `ActionRequest` only when
 * the trace was emitted via `applyActionRequest` (simulation/replay).
 */
export function recordFromTraces(
  traces: ReadonlyArray<CRMActionTrace> = getActionTraces(),
): RecordedAction[] {
  const out: RecordedAction[] = [];
  for (const trace of traces) {
    const request = traceToRequest(trace);
    if (!request) continue;
    out.push({
      traceId: trace.id,
      request,
      expected: trace.result,
      stateVersionBefore: trace.stateVersionBefore,
      stateVersionAfter: trace.stateVersionAfter,
    });
  }
  return out;
}

function traceToRequest(trace: CRMActionTrace): ActionRequest | null {
  // Most trace inputs from the action runner are already
  // `ActionRequest`-shaped because simulation passes them through
  // unchanged. UI traces have richer inputs (id + patches) that we
  // don't replay here yet.
  const input = trace.input as { type?: string } | undefined;
  if (input && typeof input === "object" && typeof input.type === "string") {
    return input as ActionRequest;
  }
  return null;
}

// ── Replay ───────────────────────────────────────────────────────

export function replay(
  initial: CRMNormalizedState,
  actions: RecordedAction[],
): ReplayReport {
  let state: CRMNormalizedState = initial;
  let divergence: ReplayDivergence | null = null;
  let appliedCount = 0;

  for (let i = 0; i < actions.length; i++) {
    const recorded = actions[i];
    const out = applyActionRequest(state, recorded.request);
    state = out.state;
    appliedCount += 1;
    if (!resultsEqual(out.result, recorded.expected)) {
      divergence = {
        index: i,
        recorded,
        actual: out.result,
        reason: "result_changed",
      };
      break;
    }
  }

  if (divergence && getCRMStrictMode().throwOnInvalidState) {
    throw new CRMDomainError({
      code: "STRICT_MODE_VIOLATION",
      message: `Replay diverged at index ${divergence.index} (${divergence.reason})`,
      details: { divergence },
    });
  }

  return {
    finalState: state,
    validation: validateCRMState(state, "replay.final"),
    divergence,
    appliedCount,
  };
}

function resultsEqual<T>(a: ActionResult<T>, b: ActionResult<T>): boolean {
  if (a.ok !== b.ok) return false;
  if (!a.ok && !b.ok) {
    return a.error.code === (b as { ok: false; error: { code: string } }).error.code;
  }
  return true;
}

// ── Convenience ──────────────────────────────────────────────────

/** Record from the live action log and replay against the supplied
 *  baseline state. Useful for in-app debugging consoles. */
export function recordAndReplay(initial: CRMNormalizedState): ReplayReport {
  return replay(initial, recordFromTraces());
}

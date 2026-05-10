/**
 * Shared production contracts for the CRM core.
 *
 * This file is the authoritative source for: structured failures
 * (`CRMError`), action results (`ActionResult`), action and AI traces
 * (`CRMActionTrace`, `AITrace`), state version metadata
 * (`CRMStateVersion`), and the strict-mode contract referenced from
 * actions, validation, replay, and simulation.
 *
 * No file in `data/` may invent its own error shape or success/failure
 * tuple. Screens consume `ActionResult` directly from
 * `useCRMActions()` and decide how to surface failures.
 */

// ── Failure semantics ────────────────────────────────────────────

/** Stable, machine-readable error codes for CRM failures. */
export type CRMErrorCode =
  // Input / contract
  | "INVALID_INPUT"
  | "MISSING_INPUT"
  | "AMBIGUOUS_TARGET"
  // Graph / referential integrity
  | "ENTITY_NOT_FOUND"
  | "ORPHAN_REFERENCE"
  | "DUPLICATE_ID"
  | "FK_BROKEN"
  // Domain invariants
  | "INVENTORY_NEGATIVE"
  | "INVALID_TIME_RANGE"
  | "DUPLICATE_ACTIVE_VISIT"
  | "ILLEGAL_STATUS_TRANSITION"
  // System
  | "STATE_VALIDATION_FAILED"
  | "REPOSITORY_ERROR"
  | "STRICT_MODE_VIOLATION"
  | "UNKNOWN_COMMAND"
  | "INTERNAL_ERROR";

export interface CRMError {
  code: CRMErrorCode;
  message: string;
  /** Optional structured payload for debugging (input snapshot, FK chain, etc.). */
  details?: Record<string, unknown>;
}

/**
 * Structured action result. Every public action exposed via
 * `useCRMActions()` and every AI command must return this shape.
 *
 * The failure rule: no action may silently no-op. If an action cannot
 * proceed, it returns `{ ok: false, error }` (and throws in strict mode).
 */
export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: CRMError };

export function ok<T>(data?: T): ActionResult<T> {
  return data === undefined ? { ok: true } : { ok: true, data };
}

export function fail<T = void>(
  code: CRMErrorCode,
  message: string,
  details?: Record<string, unknown>,
): ActionResult<T> {
  return { ok: false, error: { code, message, details } };
}

export function isOk<T>(result: ActionResult<T>): result is { ok: true; data?: T } {
  return result.ok === true;
}

export function isFail<T>(
  result: ActionResult<T>,
): result is { ok: false; error: CRMError } {
  return result.ok === false;
}

/** Domain error thrown only when strict mode is enabled. */
export class CRMDomainError extends Error {
  readonly code: CRMErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(error: CRMError) {
    super(`[CRM:${error.code}] ${error.message}`);
    this.name = "CRMDomainError";
    this.code = error.code;
    this.details = error.details;
  }

  toCRMError(): CRMError {
    return { code: this.code, message: this.message, details: this.details };
  }
}

// ── State version metadata ───────────────────────────────────────

export interface CRMStateVersion {
  /** Monotonic counter; increments on every successful state mutation. */
  version: number;
  /** ISO 8601 timestamp of the last successful mutation. */
  lastUpdatedAt: string;
}

export const INITIAL_STATE_VERSION: CRMStateVersion = {
  version: 0,
  lastUpdatedAt: new Date(0).toISOString(),
};

// ── Affected entities ────────────────────────────────────────────

/**
 * Map of entity kind to affected ID list. Action traces and replay
 * use this so observers can invalidate, refetch, or audit the graph
 * touched by a single mutation.
 */
export interface AffectedEntities {
  appointments?: string[];
  visits?: string[];
  visitServices?: string[];
  customers?: string[];
  staff?: string[];
  mixSessions?: string[];
  productUsage?: string[];
  reweighOutcomes?: string[];
  inventory?: string[];
  systemState?: string[];
}

// ── Action trace ─────────────────────────────────────────────────

/** Logical action types tracked by the logger and replay system. */
export type CRMActionType =
  | "appointment.create"
  | "appointment.update"
  | "appointment.delete"
  | "appointment.cancel"
  | "customer.create"
  | "customer.update"
  | "visit.start"
  | "visit.complete"
  | "visit.attachService"
  | "mix.start"
  | "mix.recordUsage"
  | "mix.reweigh"
  | "inventory.update"
  | "system.setActiveDate"
  | "system.setBluetoothConnected"
  | "system.markNotificationsRead"
  | "system.toggleFeatureFlag"
  | "system.dismissComingSoon"
  | "ai.scheduleCommand"
  | "simulation.run"
  | "replay.apply";

export interface CRMActionTrace {
  id: string;
  /** ISO 8601 timestamp captured before the action runs. */
  timestamp: string;
  actionType: CRMActionType;
  /** Sanitized input. Sensitive values are not logged. */
  input?: unknown;
  result: ActionResult<unknown>;
  affectedEntities: AffectedEntities;
  stateVersionBefore: number;
  stateVersionAfter: number;
  /** Optional source for audit (e.g. ui|ai|simulation|replay). */
  origin?: "ui" | "ai" | "simulation" | "replay" | "system";
}

// ── AI trace ─────────────────────────────────────────────────────

export type AIDecision =
  | "executed"
  | "rejected"
  | "missing_input"
  | "ambiguous"
  | "unknown_command";

export type AIRejectionReason =
  | "AMBIGUOUS_TARGET"
  | "MISSING_TARGET"
  | "MISSING_INPUT"
  | "UNKNOWN_COMMAND"
  | "INVALID_TIME"
  | "ACTION_FAILED";

export interface AITrace {
  id: string;
  timestamp: string;
  rawCommand: string;
  intent?: string;
  parsedEntities: Record<string, unknown>;
  decision: AIDecision;
  rejectedReason?: AIRejectionReason;
  /** Action trace IDs produced by this command, if any. */
  actionsTriggered: string[];
  stateVersion: number;
}

// ── Strict mode ──────────────────────────────────────────────────

export interface CRMStrictModeConfig {
  /** Validate state after every reducer mutation. */
  validateState: boolean;
  /** Throw when an action would otherwise return `{ ok: false }`. */
  throwOnActionFailure: boolean;
  /** Throw when validation reports errors. */
  throwOnInvalidState: boolean;
  /** Log a console warning when adapters look like they are deriving data. */
  warnOnAdapterMisuse: boolean;
}

export const DEFAULT_PROD_STRICT_MODE: CRMStrictModeConfig = {
  validateState: false,
  throwOnActionFailure: false,
  throwOnInvalidState: false,
  warnOnAdapterMisuse: false,
};

export const DEFAULT_DEV_STRICT_MODE: CRMStrictModeConfig = {
  validateState: true,
  throwOnActionFailure: true,
  throwOnInvalidState: true,
  warnOnAdapterMisuse: true,
};

// ── Helpers ──────────────────────────────────────────────────────

let traceCounter = 0;
/** Deterministic-ish trace id: combines a monotonic counter with the
 *  current timestamp to stay sortable while still being unique. */
export function nextTraceId(prefix: "act" | "ai"): string {
  traceCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${traceCounter.toString(36)}`;
}

/** Reset the internal counter; tests use this to make IDs predictable. */
export function _resetTraceCounter(): void {
  traceCounter = 0;
}

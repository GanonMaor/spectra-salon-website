/**
 * State integrity validation.
 *
 * `validateCRMState` walks the normalized state and verifies the graph
 * is internally consistent: every foreign key resolves, every visit
 * belongs to a known customer, every product usage refers to a known
 * mix and inventory item, segments are time-ordered, etc.
 *
 * The validator is pure. It returns a structured report instead of a
 * boolean, so callers can pick between "block & throw" (strict mode)
 * and "log a warning" (production). Reducers and the provider call
 * this after every mutation.
 *
 * Runtime cost: linear in entity count. The validator is intentionally
 * forgiving when state has not been hydrated yet (zero entities is
 * "ok", not "broken").
 */

import {
  CRMDomainError,
  type CRMError,
  type CRMErrorCode,
} from "./crmContracts";
import { getCRMStrictMode, maybeThrowOnInvalidState } from "./crmStrictMode";
import type { CRMNormalizedState } from "./crmTypes";

export interface ValidationReport {
  ok: boolean;
  errors: CRMError[];
  warnings: CRMError[];
}

interface BuilderContext {
  errors: CRMError[];
  warnings: CRMError[];
}

function pushError(
  ctx: BuilderContext,
  code: CRMErrorCode,
  message: string,
  details?: Record<string, unknown>,
): void {
  ctx.errors.push({ code, message, details });
}

function pushWarning(
  ctx: BuilderContext,
  code: CRMErrorCode,
  message: string,
  details?: Record<string, unknown>,
): void {
  ctx.warnings.push({ code, message, details });
}

function checkDuplicateIds<T extends { id: string }>(
  ctx: BuilderContext,
  list: T[],
  kind: string,
): void {
  const seen = new Set<string>();
  for (const item of list) {
    if (!item || typeof item.id !== "string") continue;
    if (seen.has(item.id)) {
      pushError(ctx, "DUPLICATE_ID", `Duplicate ${kind} id "${item.id}"`, {
        kind,
        id: item.id,
      });
    } else {
      seen.add(item.id);
    }
  }
}

function ensureFk(
  ctx: BuilderContext,
  ownerKind: string,
  ownerId: string,
  field: string,
  referencedId: string | undefined | null,
  exists: boolean,
  isWarning = false,
): void {
  if (referencedId == null) return;
  if (!exists) {
    const code: CRMErrorCode = "FK_BROKEN";
    const msg = `${ownerKind} ${ownerId}.${field} -> "${referencedId}" not found`;
    const details = { ownerKind, ownerId, field, referencedId };
    if (isWarning) pushWarning(ctx, code, msg, details);
    else pushError(ctx, code, msg, details);
  }
}

// ── Public API ───────────────────────────────────────────────────

export function validateCRMState(
  state: CRMNormalizedState,
  context: string = "validate",
): ValidationReport {
  const ctx: BuilderContext = { errors: [], warnings: [] };

  if (!state) {
    return {
      ok: false,
      errors: [
        {
          code: "STATE_VALIDATION_FAILED",
          message: `[${context}] state is null/undefined`,
        },
      ],
      warnings: [],
    };
  }

  // ── Duplicate IDs (cheap, runs on the maps directly) ─────────
  checkDuplicateIds(ctx, Object.values(state.customersById), "customer");
  checkDuplicateIds(ctx, Object.values(state.staffById), "staff");
  checkDuplicateIds(ctx, Object.values(state.appointmentsById), "appointment");
  checkDuplicateIds(ctx, Object.values(state.visitsById), "visit");
  checkDuplicateIds(ctx, Object.values(state.visitServicesById), "visitService");
  checkDuplicateIds(ctx, Object.values(state.mixSessionsById), "mixSession");
  checkDuplicateIds(ctx, Object.values(state.productUsageById), "productUsage");
  checkDuplicateIds(ctx, Object.values(state.reweighOutcomesById), "reweighOutcome");
  checkDuplicateIds(ctx, Object.values(state.inventoryById), "inventory");
  checkDuplicateIds(ctx, Object.values(state.productsById), "product");

  // ── Appointments ─────────────────────────────────────────────
  for (const appt of Object.values(state.appointmentsById)) {
    ensureFk(ctx, "appointment", appt.id, "salonId", appt.salonId, !!state.salonsById[appt.salonId]);
    ensureFk(ctx, "appointment", appt.id, "staffMemberId", appt.staffMemberId, !!state.staffById[appt.staffMemberId]);
    if (appt.customerId) {
      ensureFk(ctx, "appointment", appt.id, "customerId", appt.customerId, !!state.customersById[appt.customerId]);
    }
    if (appt.serviceId) {
      ensureFk(ctx, "appointment", appt.id, "serviceId", appt.serviceId, !!state.servicesById[appt.serviceId], true);
    }
    if (appt.serviceCategoryId) {
      ensureFk(
        ctx,
        "appointment",
        appt.id,
        "serviceCategoryId",
        appt.serviceCategoryId,
        !!state.serviceCategoriesById[appt.serviceCategoryId],
        true,
      );
    }
    if (appt.visitId) {
      ensureFk(ctx, "appointment", appt.id, "visitId", appt.visitId, !!state.visitsById[appt.visitId]);
    }
    const start = new Date(appt.startTime).getTime();
    const end = new Date(appt.endTime).getTime();
    if (Number.isFinite(start) && Number.isFinite(end) && end <= start) {
      pushError(ctx, "INVALID_TIME_RANGE", `appointment ${appt.id} endTime <= startTime`, {
        startTime: appt.startTime,
        endTime: appt.endTime,
      });
    }
    // Segment ordering / time consistency
    if (Array.isArray(appt.segments)) {
      const sorted = [...appt.segments].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      for (let i = 0; i < sorted.length; i++) {
        const seg = sorted[i];
        const segStart = new Date(seg.startTime).getTime();
        const segEnd = new Date(seg.endTime).getTime();
        if (Number.isFinite(segStart) && Number.isFinite(segEnd) && segEnd < segStart) {
          pushError(ctx, "INVALID_TIME_RANGE", `appointment ${appt.id} segment ${seg.id} ends before it starts`, {
            startTime: seg.startTime,
            endTime: seg.endTime,
          });
        }
        if (i > 0) {
          const prev = sorted[i - 1];
          if (
            new Date(seg.startTime).getTime() <
            new Date(prev.startTime).getTime()
          ) {
            pushWarning(ctx, "INVALID_TIME_RANGE", `appointment ${appt.id} segments out of order`, {
              previousId: prev.id,
              currentId: seg.id,
            });
          }
        }
      }
    }
  }

  // ── Visits ───────────────────────────────────────────────────
  const activeByAppointment = new Map<string, string>();
  for (const visit of Object.values(state.visitsById)) {
    ensureFk(ctx, "visit", visit.id, "salonId", visit.salonId, !!state.salonsById[visit.salonId]);
    ensureFk(ctx, "visit", visit.id, "customerId", visit.customerId, !!state.customersById[visit.customerId]);
    if (visit.staffMemberId) {
      ensureFk(ctx, "visit", visit.id, "staffMemberId", visit.staffMemberId, !!state.staffById[visit.staffMemberId]);
    }
    if (visit.appointmentId) {
      ensureFk(ctx, "visit", visit.id, "appointmentId", visit.appointmentId, !!state.appointmentsById[visit.appointmentId]);
      if (visit.status === "active") {
        const prior = activeByAppointment.get(visit.appointmentId);
        if (prior && prior !== visit.id) {
          pushError(
            ctx,
            "DUPLICATE_ACTIVE_VISIT",
            `appointment ${visit.appointmentId} has multiple active visits`,
            { existing: prior, conflicting: visit.id },
          );
        } else {
          activeByAppointment.set(visit.appointmentId, visit.id);
        }
      }
    }
    if (visit.endedAt) {
      const startedAt = new Date(visit.startedAt).getTime();
      const endedAt = new Date(visit.endedAt).getTime();
      if (Number.isFinite(startedAt) && Number.isFinite(endedAt) && endedAt < startedAt) {
        pushError(ctx, "INVALID_TIME_RANGE", `visit ${visit.id} ended before it started`, {
          startedAt: visit.startedAt,
          endedAt: visit.endedAt,
        });
      }
    }
  }

  // ── Visit services ────────────────────────────────────────────
  for (const vs of Object.values(state.visitServicesById)) {
    ensureFk(ctx, "visitService", vs.id, "visitId", vs.visitId, !!state.visitsById[vs.visitId]);
    ensureFk(ctx, "visitService", vs.id, "serviceId", vs.serviceId, !!state.servicesById[vs.serviceId]);
    ensureFk(ctx, "visitService", vs.id, "staffMemberId", vs.staffMemberId, !!state.staffById[vs.staffMemberId]);
  }

  // ── Mix sessions ─────────────────────────────────────────────
  for (const mix of Object.values(state.mixSessionsById)) {
    ensureFk(
      ctx,
      "mixSession",
      mix.id,
      "visitServiceId",
      mix.visitServiceId,
      !!state.visitServicesById[mix.visitServiceId],
    );
  }

  // ── Product usage ────────────────────────────────────────────
  for (const usage of Object.values(state.productUsageById)) {
    ensureFk(ctx, "productUsage", usage.id, "mixSessionId", usage.mixSessionId, !!state.mixSessionsById[usage.mixSessionId]);
    ensureFk(ctx, "productUsage", usage.id, "productId", usage.productId, !!state.productsById[usage.productId]);
    ensureFk(ctx, "productUsage", usage.id, "inventoryItemId", usage.inventoryItemId, !!state.inventoryById[usage.inventoryItemId]);
    if (typeof usage.grams === "number" && usage.grams < 0) {
      pushError(ctx, "INVALID_INPUT", `productUsage ${usage.id} has negative grams`, {
        grams: usage.grams,
      });
    }
  }

  // ── Reweigh outcomes ────────────────────────────────────────
  for (const ro of Object.values(state.reweighOutcomesById)) {
    ensureFk(ctx, "reweighOutcome", ro.id, "mixSessionId", ro.mixSessionId, !!state.mixSessionsById[ro.mixSessionId]);
  }

  // ── Inventory ────────────────────────────────────────────────
  for (const inv of Object.values(state.inventoryById)) {
    ensureFk(ctx, "inventory", inv.id, "salonId", inv.salonId, !!state.salonsById[inv.salonId]);
    ensureFk(ctx, "inventory", inv.id, "productId", inv.productId, !!state.productsById[inv.productId]);
    if (typeof inv.unitsInStock === "number" && inv.unitsInStock < 0) {
      pushError(ctx, "INVENTORY_NEGATIVE", `inventory ${inv.id} unitsInStock < 0`, {
        unitsInStock: inv.unitsInStock,
      });
    }
  }

  // ── Products / catalog graph ─────────────────────────────────
  for (const product of Object.values(state.productsById)) {
    ensureFk(ctx, "product", product.id, "brandId", product.brandId, !!state.brandsById[product.brandId]);
    if (product.productLineId) {
      ensureFk(
        ctx,
        "product",
        product.id,
        "productLineId",
        product.productLineId,
        !!state.productLinesById[product.productLineId],
        true,
      );
    }
  }

  return {
    ok: ctx.errors.length === 0,
    errors: ctx.errors,
    warnings: ctx.warnings,
  };
}

/**
 * Strict assertion. Throws `CRMDomainError` when validation reports
 * errors. Use after structural mutations or during simulation/replay.
 */
export function assertValidCRMState(
  state: CRMNormalizedState,
  context: string,
): void {
  const report = validateCRMState(state, context);
  if (!report.ok) {
    throw new CRMDomainError({
      code: "STATE_VALIDATION_FAILED",
      message: `[${context}] state validation failed (${report.errors.length} errors)`,
      details: { errors: report.errors, warnings: report.warnings },
    });
  }
}

/** Non-throwing variant. Logs and respects strict-mode opt-in. */
export function warnInvalidCRMState(
  state: CRMNormalizedState,
  context: string,
): ValidationReport {
  const report = validateCRMState(state, context);
  if (!report.ok) {
    if (typeof console !== "undefined" && typeof console.warn === "function") {
      // eslint-disable-next-line no-console
      console.warn(`[CRM:validation] ${context} reported`, report.errors, report.warnings);
    }
    if (getCRMStrictMode().throwOnInvalidState) {
      maybeThrowOnInvalidState({
        code: "STATE_VALIDATION_FAILED",
        message: `${context}: ${report.errors.length} errors`,
        details: { errors: report.errors, warnings: report.warnings },
      });
    }
  }
  return report;
}

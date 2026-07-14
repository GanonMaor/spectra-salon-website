/**
 * netlify/functions/lib/professional-roles.js
 * ─────────────────────────────────────────────────────────────────────────
 * Pure, dependency-free helpers behind the professional-roles API (Phase B of
 * the settings/permissions plan). Kept separate from the function handler
 * (which pulls in `pg`) so the rules can be unit-tested without a database or
 * network.
 *
 * A professional role answers "what professional work can this person do?"
 * (departments, allowed services, split-stage capabilities, default
 * price/time). It grants NO system access — that is the RBAC slice.
 *
 * Professional roles share the catalog active | inactive | archived lifecycle:
 * a role that is still assigned to staff cannot be archived without an explicit
 * replacement (reassign) or force, mirroring catalog dependency checks.
 */
"use strict";

const {
  CATALOG_STATUSES,
  normalizeCatalogStatus,
  resolveStatusForPatch,
  isArchiveTransition,
  evaluateArchive,
} = require("./catalog-lifecycle");

// The split-stage capability vocabulary mirrors the appointment SegmentType.
// Storing capabilities against these keys lets the calendar assign stages by
// capability instead of matching a hard-coded role id.
const STAGE_CAPABILITIES = ["service", "apply", "wait", "wash", "dry", "checkin", "checkout"];

/** Raised when a professional-role rule is violated. Carries a stable code + HTTP status. */
class ProfessionalRoleError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.name = "ProfessionalRoleError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/** Trim to a non-empty string, or return null. */
function normalizeText(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

/**
 * Normalize an arbitrary value to a de-duplicated array of trimmed, non-empty
 * string ids. Anything that is not an array collapses to [].
 */
function normalizeIdList(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of value) {
    const id = normalizeText(raw);
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/**
 * Normalize split-stage capabilities to a de-duplicated array of known stage
 * keys. Unknown values are dropped so a bad client payload can never widen the
 * capability vocabulary.
 */
function normalizeStageCapabilities(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  const seen = new Set();
  for (const raw of value) {
    const key = normalizeText(raw);
    if (key && STAGE_CAPABILITIES.includes(key) && !seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}

/**
 * Normalize an optional integer (price/time). Returns:
 *   - undefined  when the field was omitted (caller keeps previous value),
 *   - null       when explicitly cleared,
 *   - a finite integer otherwise,
 *   - the string "invalid" when the value is present but not a valid integer.
 */
function normalizeOptionalInt(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return "invalid";
  return n;
}

/**
 * Validate a professional-role create/update payload. Returns
 * { validationError } on failure, or a normalized { fields } object.
 * `partial` mode (PATCH) only validates provided fields.
 */
function buildRolePayload(body, { partial = false } = {}) {
  const fields = {};

  if (!partial || body.name !== undefined) {
    const name = normalizeText(body.name);
    if (!name) return { validationError: "name is required" };
    fields.name = name;
  }

  if (!partial || body.departmentIds !== undefined) {
    fields.departmentIds = normalizeIdList(body.departmentIds);
  }
  if (!partial || body.allowedServiceIds !== undefined) {
    fields.allowedServiceIds = normalizeIdList(body.allowedServiceIds);
  }
  if (!partial || body.stageCapabilities !== undefined) {
    fields.stageCapabilities = normalizeStageCapabilities(body.stageCapabilities);
  }

  for (const key of ["defaultPriceCents", "defaultDurationMinutes"]) {
    if (partial && body[key] === undefined) continue;
    const parsed = normalizeOptionalInt(body[key]);
    if (parsed === "invalid") return { validationError: `${key} must be an integer` };
    if (parsed !== undefined && parsed !== null && parsed < 0) {
      return { validationError: `${key} must be >= 0` };
    }
    fields[key] = parsed === undefined ? null : parsed;
  }

  if (!partial || body.color !== undefined) fields.color = normalizeText(body.color);
  if (!partial || body.icon !== undefined) fields.icon = normalizeText(body.icon);
  if (!partial || body.sortOrder !== undefined) {
    const sortOrder = Number(body.sortOrder);
    fields.sortOrder = Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0;
  }

  if (!partial) {
    fields.status = normalizeCatalogStatus(body.status, "active");
  } else if (body.status !== undefined) {
    fields.status = body.status;
  }

  return { fields };
}

/**
 * Validate a staff <-> role assignment payload. Both ids are required. The
 * primacy signals are optional and normalized.
 */
function buildAssignmentPayload(body) {
  const staffMemberId = normalizeText(body.staffMemberId);
  const professionalRoleId = normalizeText(body.professionalRoleId);
  if (!staffMemberId) return { validationError: "staffMemberId is required" };
  if (!professionalRoleId) return { validationError: "professionalRoleId is required" };
  return {
    fields: {
      staffMemberId,
      professionalRoleId,
      isPrimary: body.isPrimary === true || body.isPrimary === "true",
      primaryServiceIds: normalizeIdList(body.primaryServiceIds),
      servicePriceOverrides:
        body.servicePriceOverrides && typeof body.servicePriceOverrides === "object" && !Array.isArray(body.servicePriceOverrides)
          ? body.servicePriceOverrides
          : {},
    },
  };
}

/**
 * Decide whether a professional role can be archived given the number of staff
 * members still assigned to it. Reuses the shared archive-decision helper so
 * archiving an assigned role requires reassign (replacement) or force.
 */
function evaluateRoleArchive(assignedStaffCount, actions = {}) {
  return evaluateArchive([{ type: "assignedStaff", count: Number(assignedStaffCount) || 0 }], actions);
}

module.exports = {
  ProfessionalRoleError,
  STAGE_CAPABILITIES,
  CATALOG_STATUSES,
  normalizeText,
  normalizeIdList,
  normalizeStageCapabilities,
  normalizeOptionalInt,
  buildRolePayload,
  buildAssignmentPayload,
  evaluateRoleArchive,
  resolveStatusForPatch,
  isArchiveTransition,
  normalizeCatalogStatus,
};

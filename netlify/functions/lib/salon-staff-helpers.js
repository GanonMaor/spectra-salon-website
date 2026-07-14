/**
 * netlify/functions/lib/salon-staff-helpers.js
 * ─────────────────────────────────────────────────────────────────────────
 * Pure, dependency-free helpers behind salon-staff identity linkage. Kept
 * separate from the function handler (which pulls in `pg`) so the identity
 * rules can be unit-tested without a database or network.
 *
 * Identity contract (slice A of the settings/permissions plan):
 *   * A StaffMember MAY be linked to a login user (crm_users) via user_id,
 *     but the link is optional: staff can exist without a user, and a user
 *     can exist without staff.
 *   * The link is scoped per tenant: a given user maps to at most one staff
 *     member per salon. Linking the same user in a different salon is fine.
 *   * Re-linking a staff member to the user it already carries (an update
 *     that keeps user_id unchanged) is not a conflict.
 */
"use strict";

/**
 * Raised when a staff identity rule is violated (e.g. linking a login user
 * that is already attached to another staff member in the same salon).
 * Carries a stable code + HTTP status so callers can return a precise error.
 */
class StaffIdentityError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.name = "StaffIdentityError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Normalize a user-link value to a trimmed string id or null. Empty strings,
 * whitespace, null and undefined all collapse to null (i.e. "no linked user").
 */
function normalizeUserId(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
}

/**
 * Parse a boolean-ish flag. Accepts real booleans and the common string/number
 * encodings ("true"/"false", "1"/"0", 1/0). Returns `fallback` for undefined
 * so PATCH callers can omit the field, and for values that are not recognised.
 */
function parseBooleanFlag(value, fallback = undefined) {
  if (value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return fallback;
}

/**
 * Find an existing staff row (in the same salon) that already links the given
 * login user, excluding the staff member being edited. Returns the conflicting
 * row or null. Cross-salon links are never conflicts.
 *
 * @param {object} args
 * @param {string|null} args.userId         Proposed login user id (nullable).
 * @param {string} args.salonId             Tenant scope.
 * @param {string|null} [args.currentStaffId] Staff id being updated (excluded).
 * @param {Array<{id:string, salon_id:string, user_id:string|null}>} args.existingStaff
 * @returns {object|null}
 */
function findConflictingStaffLink({ userId, salonId, currentStaffId = null, existingStaff = [] }) {
  const normalized = normalizeUserId(userId);
  if (!normalized) return null;
  const rows = Array.isArray(existingStaff) ? existingStaff : [];
  return (
    rows.find(
      (row) =>
        row &&
        normalizeUserId(row.user_id) === normalized &&
        row.salon_id === salonId &&
        row.id !== currentStaffId,
    ) || null
  );
}

/**
 * Throwing wrapper around findConflictingStaffLink. No-op when there is no
 * linked user or no conflict; throws StaffIdentityError(409) otherwise.
 */
function assertUniqueStaffUserLink(args) {
  const conflict = findConflictingStaffLink(args);
  if (conflict) {
    throw new StaffIdentityError(
      "DUPLICATE_STAFF_USER_LINK",
      "This user is already linked to another staff member in this salon.",
      409,
    );
  }
  return true;
}

module.exports = {
  StaffIdentityError,
  normalizeUserId,
  parseBooleanFlag,
  findConflictingStaffLink,
  assertUniqueStaffUserLink,
};

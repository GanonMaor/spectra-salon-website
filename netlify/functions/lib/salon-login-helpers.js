/**
 * netlify/functions/lib/salon-login-helpers.js
 * ─────────────────────────────────────────────────────────────────────────
 * Pure, dependency-free helpers behind salon-login. Kept separate from the
 * function handler (which pulls in `pg`) so they can be unit-tested without a
 * database or network.
 */
"use strict";

/**
 * Raised when an identity authenticates but cannot be mapped to exactly one
 * active salon. Carries an HTTP status + stable code so the client can render a
 * precise message instead of a generic "invalid login".
 */
class AuthResolutionError extends Error {
  constructor(code, message, statusCode) {
    super(message);
    this.name = "AuthResolutionError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Normalize a phone/email identifier to the bare national-significant digits
 * used for comparison. Emails return "" (they are matched on the email column).
 * Handles Israeli formats: 0504322680, +972504322680, 972504322680, 504322680,
 * and 00-prefixed international dialing.
 */
function normalizePhone(value) {
  if (String(value || "").includes("@")) return "";
  let digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("972")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

/**
 * Parse SALON_LOGIN_IDENTIFIERS into a normalized allowlist. Each configured
 * identifier contributes both its lowercased raw form and (for phones) its
 * normalized digit form.
 */
function allowedLoginIdentifiers(raw) {
  return String(raw || "")
    .split(",")
    .flatMap((value) => {
      const identifier = value.trim().toLowerCase();
      if (!identifier) return [];
      const normalizedPhone = normalizePhone(identifier);
      return normalizedPhone ? [identifier, normalizedPhone] : [identifier];
    })
    .filter(Boolean);
}

/**
 * Decide whether an identifier is permitted by the allowlist. An empty
 * allowlist permits any active user (legacy behavior).
 */
function isIdentifierAllowed(identifier, normalizedPhone, allowed) {
  if (!allowed || allowed.length === 0) return true;
  return (
    allowed.includes(String(identifier).toLowerCase()) ||
    (normalizedPhone !== "" && allowed.includes(normalizedPhone))
  );
}

/**
 * Deterministically pick the active membership a login identity resolves to.
 * Never silently guesses between multiple salons.
 *
 * @param {Array<{salon_id:string, role:string, is_default:boolean}>} rows
 *   Active memberships (already filtered to active salons + non-null role).
 * @returns {{ membership: object|null, error: AuthResolutionError|null }}
 */
function pickActiveMembership(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length === 0) {
    return {
      membership: null,
      error: new AuthResolutionError(
        "NO_ACTIVE_MEMBERSHIP",
        "This user has no active salon membership.",
        403,
      ),
    };
  }
  if (list.length === 1) {
    return { membership: list[0], error: null };
  }
  const defaults = list.filter((row) => row.is_default === true);
  if (defaults.length === 1) {
    return { membership: defaults[0], error: null };
  }
  return {
    membership: null,
    error: new AuthResolutionError(
      "AMBIGUOUS_MEMBERSHIP",
      "This user maps to multiple active salons with no single default. Salon selection is required.",
      409,
    ),
  };
}

module.exports = {
  AuthResolutionError,
  normalizePhone,
  allowedLoginIdentifiers,
  isIdentifierAllowed,
  pickActiveMembership,
};

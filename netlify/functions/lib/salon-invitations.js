/**
 * netlify/functions/lib/salon-invitations.js
 * ─────────────────────────────────────────────────────────────────────────
 * Pure, (almost) dependency-free helpers behind the access invitation,
 * activation, suspension/revocation and session-invalidation lifecycle
 * (Phase E of the salon settings/permissions plan). Kept separate from the
 * function handler (which pulls in `pg`) so the security-critical rules can be
 * unit-tested without a database or network.
 *
 * The only import is Node's built-in `crypto` (no npm dependency) for code
 * generation + hashing, and the shared phone normalizer.
 *
 * Contract locked here:
 *   * Codes are personal + single-use. Only a per-invitation salt + SHA-256
 *     hash is ever stored; the raw code is delivered out-of-band.
 *   * Redemption enforces expiry AND an attempt limit; each wrong code burns an
 *     attempt and locks the invitation once the limit is reached.
 *   * A resend supersedes (revokes) prior pending invitations for the target.
 *   * Existing-user behavior is tenant-safe: an existing login user gets a new
 *     membership instead of a duplicated account; a contact already attached to
 *     a staff member requires an explicit link / owner approval.
 *   * The membership lifecycle is a fixed state machine
 *     (invited → accepted → active → suspended | revoked) with reactivation.
 *   * Sessions are stateless HMAC tokens; a token is revoked when its `iat`
 *     predates the membership's `sessions_valid_after`, or the membership is
 *     suspended/revoked.
 */
"use strict";

const crypto = require("crypto");
const { normalizePhone } = require("./salon-login-helpers");

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEFAULT_MAX_ATTEMPTS = 5;
const CODE_BYTES = 20; // 160 bits of entropy before base32 encoding

const INVITATION_STATUSES = ["pending", "accepted", "revoked", "expired"];
const MEMBERSHIP_STATUSES = ["invited", "accepted", "active", "suspended", "revoked"];

// Allowed membership lifecycle transitions. Anything not listed is rejected.
const MEMBERSHIP_TRANSITIONS = {
  invited: ["accepted", "active", "revoked"],
  accepted: ["active", "revoked", "suspended"],
  active: ["suspended", "revoked"],
  suspended: ["active", "revoked"],
  revoked: [], // terminal
};

// Audit actions the plan requires we record. Kept as a set so the handler and
// tests share one vocabulary and typos fail fast.
const AUDIT_ACTIONS = new Set([
  "permission_change",
  "invite",
  "invite_resend",
  "invite_revoke",
  "accept",
  "access_suspend",
  "access_revoke",
  "access_reactivate",
  "ownership_transfer",
  "price_change",
  "catalog_archive",
  "resource_change",
  "staff_change",
]);

/**
 * Raised for any invitation / lifecycle rule violation. Carries a stable code
 * and HTTP status so handlers can respond precisely without leaking detail.
 */
class InvitationError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = "InvitationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ── Channel + contact normalization ────────────────────────────────────────

/** Lowercase + trim an email, or null when blank/not an email. */
function normalizeEmail(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) return null;
  return trimmed;
}

/** Normalize a phone to national-significant digits, or null when blank. */
function normalizeInvitePhone(value) {
  const digits = normalizePhone(value);
  return digits || null;
}

/**
 * Resolve the delivery channel from the provided contacts. At least one of
 * email/phone must be present. Returns the normalized contacts + channel.
 * @throws {InvitationError} NO_CHANNEL when neither is usable.
 */
function resolveInvitationChannel({ email, phone } = {}) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizeInvitePhone(phone);
  if (!normalizedEmail && !normalizedPhone) {
    throw new InvitationError(
      "NO_CHANNEL",
      "An invitation requires an email address or a phone number.",
      400,
    );
  }
  let channel = "email";
  if (normalizedEmail && normalizedPhone) channel = "both";
  else if (normalizedPhone) channel = "phone";
  return { email: normalizedEmail, phone: normalizedPhone, channel };
}

// ── Code generation + hashing (only the hash is ever stored) ────────────────

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // no 0/1/8/9 to avoid ambiguity

/**
 * Generate a personal, single-use invitation code. Uses CSPRNG bytes encoded
 * as an unambiguous base32 string, grouped for readability (XXXX-XXXX-...).
 */
function generateInvitationCode(bytes = CODE_BYTES) {
  const raw = crypto.randomBytes(bytes);
  let out = "";
  for (let i = 0; i < raw.length; i += 1) {
    out += BASE32_ALPHABET[raw[i] % 32];
  }
  return out.match(/.{1,4}/g).join("-");
}

/** Random per-invitation salt (hex) to defeat precomputation across rows. */
function generateCodeSalt(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Canonicalize a code for hashing: strip separators + whitespace, uppercase. */
function canonicalizeCode(code) {
  return String(code || "").replace(/[\s-]+/g, "").toUpperCase();
}

/** Deterministic salted hash. The raw code is never stored. */
function hashInvitationCode(code, salt) {
  return crypto
    .createHash("sha256")
    .update(`${salt}:${canonicalizeCode(code)}`)
    .digest("hex");
}

/** Constant-time comparison of a submitted code against a stored hash. */
function verifyInvitationCode(code, salt, expectedHash) {
  if (!code || !salt || !expectedHash) return false;
  const actual = Buffer.from(hashInvitationCode(code, salt));
  const expected = Buffer.from(String(expectedHash));
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

// ── Redemption guards (expiry + attempts + status) ──────────────────────────

function toTime(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  const t = Date.parse(value);
  return Number.isNaN(t) ? NaN : t;
}

/** True when the invitation is past its expiry relative to `now`. */
function isInvitationExpired(invite, now = Date.now()) {
  if (!invite || invite.expires_at == null) return false;
  const exp = toTime(invite.expires_at);
  if (Number.isNaN(exp)) return false;
  return toTime(now) > exp;
}

/**
 * Assert an invitation may still be redeemed. Order matters so the caller can
 * surface the most specific reason:
 *   ALREADY_ACCEPTED → INVITATION_REVOKED → INVITATION_EXPIRED →
 *   TOO_MANY_ATTEMPTS.
 * Does NOT check the code itself (that is verifyInvitationCode).
 */
function assertInvitationRedeemable(invite, now = Date.now()) {
  if (!invite) {
    throw new InvitationError("INVITATION_NOT_FOUND", "Invitation not found.", 404);
  }
  if (invite.status === "accepted") {
    throw new InvitationError("ALREADY_ACCEPTED", "This invitation has already been used.", 409);
  }
  if (invite.status === "revoked") {
    throw new InvitationError("INVITATION_REVOKED", "This invitation is no longer valid.", 410);
  }
  if (invite.status === "expired" || isInvitationExpired(invite, now)) {
    throw new InvitationError("INVITATION_EXPIRED", "This invitation has expired.", 410);
  }
  const attempts = Number(invite.attempt_count || 0);
  const max = Number(invite.max_attempts || DEFAULT_MAX_ATTEMPTS);
  if (attempts >= max) {
    throw new InvitationError(
      "TOO_MANY_ATTEMPTS",
      "This invitation is locked after too many incorrect attempts.",
      429,
    );
  }
  return true;
}

/**
 * Compute the effect of a code submission WITHOUT mutating the input. Returns
 * the next attempt count and whether the invitation should now be locked.
 * Handlers persist this transactionally.
 */
function registerCodeAttempt(invite, success) {
  const max = Number(invite.max_attempts || DEFAULT_MAX_ATTEMPTS);
  if (success) {
    return { attemptCount: Number(invite.attempt_count || 0), locked: false, accepted: true };
  }
  const attemptCount = Number(invite.attempt_count || 0) + 1;
  return { attemptCount, locked: attemptCount >= max, accepted: false };
}

// ── Membership lifecycle state machine ──────────────────────────────────────

function normalizeMembershipStatus(status) {
  const s = String(status || "active").trim().toLowerCase();
  return MEMBERSHIP_STATUSES.includes(s) ? s : "active";
}

/** True when `from → to` is an allowed membership lifecycle transition. */
function canTransitionMembership(from, to) {
  const f = normalizeMembershipStatus(from);
  const t = String(to || "").trim().toLowerCase();
  if (!MEMBERSHIP_STATUSES.includes(t)) return false;
  if (f === t) return false; // no-op is not a transition
  return (MEMBERSHIP_TRANSITIONS[f] || []).includes(t);
}

/**
 * Throwing wrapper for a lifecycle transition. Throws InvitationError(409)
 * when the transition is not allowed.
 */
function assertMembershipTransition(from, to) {
  if (!canTransitionMembership(from, to)) {
    throw new InvitationError(
      "INVALID_LIFECYCLE_TRANSITION",
      `Cannot move membership from '${normalizeMembershipStatus(from)}' to '${to}'.`,
      409,
    );
  }
  return true;
}

// ── Tenant-safe existing-user behavior ──────────────────────────────────────

/**
 * Decide how an invitation should be fulfilled given who already exists in the
 * tenant. Never duplicates an account, and never silently links a contact that
 * already belongs to a staff member.
 *
 * @param {object} params
 * @param {object|null} params.existingUser       crm_users row matching the contact (or null)
 * @param {object|null} params.existingMembership salon_memberships row for that user in THIS salon (or null)
 * @param {boolean} [params.contactBelongsToStaff] the email/phone is already on a staff row
 * @param {boolean} [params.ownerApproved]         an owner explicitly approved linking that contact
 * @returns {{ action: string, reason?: string }}
 *   action ∈ {
 *     'attach_membership'         — user exists, add a membership (invited)
 *     'reinvite_membership'       — user + membership exist, re-issue access
 *     'requires_link_or_approval' — contact is on a staff row; needs owner approval
 *     'create_user'               — brand-new invitee; create user on acceptance
 *   }
 */
function classifyInvitationTarget({
  existingUser = null,
  existingMembership = null,
  contactBelongsToStaff = false,
  ownerApproved = false,
} = {}) {
  if (existingUser) {
    if (existingMembership) {
      const status = normalizeMembershipStatus(existingMembership.status);
      if (status === "active") {
        throw new InvitationError(
          "ALREADY_MEMBER",
          "This user already has active access to the salon.",
          409,
        );
      }
      if (status === "revoked") {
        // Revocation is terminal. Re-inviting must never silently revive an
        // intentionally revoked membership; use a future explicit, owner-only,
        // audited reactivation flow instead.
        throw new InvitationError(
          "MEMBERSHIP_REVOKED",
          "This membership has been revoked and cannot be re-invited. An owner must use an explicit reactivation flow.",
          409,
        );
      }
      return { action: "reinvite_membership" };
    }
    return { action: "attach_membership" };
  }
  if (contactBelongsToStaff && !ownerApproved) {
    return {
      action: "requires_link_or_approval",
      reason:
        "This email/phone already belongs to a staff member. Owner approval is required to grant them system access.",
    };
  }
  return { action: "create_user" };
}

// ── Session invalidation (stateless HMAC token revocation) ──────────────────

/**
 * A session is valid for a membership only when the membership is active AND
 * the token was issued at/after `sessions_valid_after`. Suspension/revocation
 * bumps `sessions_valid_after` (and flips status), so previously-issued tokens
 * stop working immediately without any server-side session store.
 *
 * @param {object} params
 * @param {number|string|Date|null} params.tokenIat  session `iat` (unix seconds or ms/date)
 * @param {number|string|Date|null} params.sessionsValidAfter membership cutoff
 * @param {string} params.membershipStatus
 */
function isSessionActiveForMembership({ tokenIat, sessionsValidAfter, membershipStatus }) {
  const status = normalizeMembershipStatus(membershipStatus);
  // A membership is not an authenticated principal until it is fully active.
  // Invited/accepted rows are lifecycle staging states and must never mint or
  // validate a session; legacy missing/unknown statuses normalize to active.
  if (status !== "active") return false;
  if (sessionsValidAfter == null) return true;
  const cutoff = toTime(sessionsValidAfter);
  if (Number.isNaN(cutoff)) return true;
  if (tokenIat == null) return false; // legacy token without iat cannot prove freshness
  // `iat` is unix seconds in our tokens; normalize both to ms for comparison.
  const iatMs = Number(tokenIat) < 1e12 ? Number(tokenIat) * 1000 : Number(tokenIat);
  return iatMs >= cutoff;
}

/** Throwing wrapper: 401 SESSION_REVOKED when the session is no longer valid. */
function assertSessionActiveForMembership(params) {
  if (!isSessionActiveForMembership(params)) {
    throw new InvitationError(
      "SESSION_REVOKED",
      "This session is no longer valid. Please sign in again.",
      401,
    );
  }
  return true;
}

// ── Append-only audit event builder ─────────────────────────────────────────

function toJsonOrNull(value) {
  if (value === undefined || value === null) return null;
  return value;
}

/**
 * Normalize an audit event into the shape persisted to salon_audit_events.
 * Validates the action against the shared vocabulary and requires actor+salon.
 */
function buildAuditEvent({
  actorUserId = null,
  salonId,
  action,
  entityType = null,
  entityId = null,
  before = null,
  after = null,
  reason = null,
  ip = null,
  device = null,
  metadata = {},
} = {}) {
  if (!salonId) {
    throw new InvitationError("AUDIT_MISSING_SALON", "Audit events require a salon id.", 500);
  }
  if (!AUDIT_ACTIONS.has(action)) {
    throw new InvitationError("AUDIT_UNKNOWN_ACTION", `Unknown audit action '${action}'.`, 500);
  }
  return {
    actor_user_id: actorUserId || null,
    salon_id: salonId,
    action,
    entity_type: entityType || null,
    entity_id: entityId || null,
    before_state: toJsonOrNull(before),
    after_state: toJsonOrNull(after),
    reason: reason ? String(reason) : null,
    ip_address: ip || null,
    device: device || null,
    metadata: metadata || {},
  };
}

/** Compute an invitation expiry from a base time + ttl. */
function computeExpiry(now = Date.now(), ttlMs = DEFAULT_TTL_MS) {
  return new Date(toTime(now) + ttlMs);
}

module.exports = {
  DEFAULT_TTL_MS,
  DEFAULT_MAX_ATTEMPTS,
  INVITATION_STATUSES,
  MEMBERSHIP_STATUSES,
  MEMBERSHIP_TRANSITIONS,
  AUDIT_ACTIONS,
  InvitationError,
  normalizeEmail,
  normalizeInvitePhone,
  resolveInvitationChannel,
  generateInvitationCode,
  generateCodeSalt,
  canonicalizeCode,
  hashInvitationCode,
  verifyInvitationCode,
  isInvitationExpired,
  assertInvitationRedeemable,
  registerCodeAttempt,
  normalizeMembershipStatus,
  canTransitionMembership,
  assertMembershipTransition,
  classifyInvitationTarget,
  isSessionActiveForMembership,
  assertSessionActiveForMembership,
  buildAuditEvent,
  computeExpiry,
};

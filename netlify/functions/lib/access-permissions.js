/**
 * netlify/functions/lib/access-permissions.js
 * ─────────────────────────────────────────────────────────────────────────
 * Pure, dependency-free RBAC resolver and owner-safety primitives (Phase D of
 * the salon settings/permissions plan). Kept separate from the function
 * handlers (which pull in `pg`) so the permission rules can be unit-tested
 * without a database or network.
 *
 * Contract:
 *   * An AccessRole answers "what may the user see or change?". It grants
 *     permissions as `domain.action@scope` tuples and is data-backed (the
 *     `access_roles` catalog, migration 041). This module is the single source
 *     of truth for the DEFAULT system roles so runtime enforcement works even
 *     before a salon customises its role catalog.
 *   * Enforcement is deny-by-default and happens on the SERVER only. The
 *     frontend merely reflects/hides actions.
 *   * Scopes are ordered from narrow to broad: self < assigned_staff <
 *     department < salon. A grant at a broader scope satisfies a requirement at
 *     an equal-or-narrower scope.
 *   * Owner safety: the last active owner can never be removed/suspended, no
 *     actor may escalate beyond their own permissions, and no actor may change
 *     their own permissions. Ownership transfer is an explicit, re-authenticated
 *     operation.
 */
"use strict";

const ACTIONS = [
  "view",
  "create",
  "update",
  "archive",
  "approve",
  "export",
  "manage_permissions",
];

const SCOPES = ["self", "assigned_staff", "department", "salon"];

const SCOPE_RANK = {
  self: 0,
  assigned_staff: 1,
  department: 2,
  salon: 3,
};

// Domains guarded by the matrix. Enforcement currently wires staff + services;
// the remaining domains are declared so the matrix and future slices stay
// coherent.
const DOMAINS = [
  "staff",
  "services",
  "inventory",
  "appointments",
  "customers",
  "settings",
  "permissions",
];

// Wildcard grant: full access. Reserved for the owner profile.
const WILDCARD_GRANT = "*";

/**
 * The seven starting access profiles from the plan, expressed as a data-backed
 * matrix. The migration seeds the same grants into `access_roles`; keep the two
 * in sync. Grants are `domain.action@scope` strings (or the "*" wildcard).
 */
const DEFAULT_ACCESS_ROLES = [
  {
    key: "owner",
    name: "Owner",
    rank: 100,
    grants: [WILDCARD_GRANT],
  },
  {
    key: "manager",
    name: "Manager",
    rank: 90,
    grants: [
      ...expandGrants(["staff", "services", "inventory", "appointments", "customers", "settings"],
        ["view", "create", "update", "archive", "approve", "export"], "salon"),
    ],
  },
  {
    key: "reception",
    name: "Reception",
    rank: 60,
    grants: [
      ...expandGrants(["appointments", "customers"], ["view", "create", "update"], "salon"),
      "staff.view@salon",
      "services.view@salon",
    ],
  },
  {
    key: "service_provider",
    name: "Service provider",
    rank: 50,
    grants: [
      "appointments.view@assigned_staff",
      "appointments.update@assigned_staff",
      "customers.view@salon",
      "services.view@salon",
      "staff.view@self",
    ],
  },
  {
    key: "assistant",
    name: "Assistant",
    rank: 40,
    grants: [
      "appointments.view@assigned_staff",
      "services.view@salon",
      "staff.view@self",
    ],
  },
  {
    key: "inventory",
    name: "Inventory / operations",
    rank: 45,
    grants: [
      ...expandGrants(["inventory"], ["view", "create", "update", "archive"], "salon"),
      "services.view@salon",
    ],
  },
  {
    key: "viewer",
    name: "Viewer",
    rank: 10,
    grants: [
      ...expandGrants(["staff", "services", "inventory", "appointments", "customers"], ["view"], "salon"),
    ],
  },
];

// Legacy coarse membership roles (migration 09) mapped onto the matrix keys so
// existing sessions resolve without a data migration.
const LEGACY_ROLE_ALIASES = {
  owner: "owner",
  manager: "manager",
  stylist: "service_provider",
  service_provider: "service_provider",
  reception: "reception",
  receptionist: "reception",
  assistant: "assistant",
  inventory: "inventory",
  operations: "inventory",
  viewer: "viewer",
};

const OWNER_ROLE_KEY = "owner";

/**
 * Raised when a permission check fails or an owner-safety invariant would be
 * violated. Carries a stable code + HTTP status so handlers can respond
 * precisely (403 for forbidden actions).
 */
class PermissionError extends Error {
  constructor(code, message, statusCode = 403) {
    super(message);
    this.name = "PermissionError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/** Expand a matrix cell into `domain.action@scope` grant strings. */
function expandGrants(domains, actions, scope) {
  const grants = [];
  for (const domain of domains) {
    for (const action of actions) {
      grants.push(`${domain}.${action}@${scope}`);
    }
  }
  return grants;
}

/**
 * Parse a `domain.action@scope` grant string. Returns null for malformed input
 * or the wildcard (handled separately by the resolver).
 */
function parseGrant(grant) {
  if (typeof grant !== "string") return null;
  const trimmed = grant.trim();
  if (!trimmed || trimmed === WILDCARD_GRANT) return null;
  const at = trimmed.indexOf("@");
  if (at < 0) return null;
  const left = trimmed.slice(0, at);
  const scope = trimmed.slice(at + 1);
  const dot = left.indexOf(".");
  if (dot < 0) return null;
  const domain = left.slice(0, dot);
  const action = left.slice(dot + 1);
  if (!domain || !action) return null;
  if (!SCOPES.includes(scope)) return null;
  return { domain, action, scope };
}

/** Look up the default matrix grants for a role key (or legacy alias). */
function grantsForRoleKey(roleKey) {
  if (!roleKey) return null;
  const key = LEGACY_ROLE_ALIASES[String(roleKey).trim().toLowerCase()];
  if (!key) return null;
  const role = DEFAULT_ACCESS_ROLES.find((r) => r.key === key);
  return role ? role.grants.slice() : null;
}

/**
 * Resolve a permission set for an actor.
 *
 * @param {object} input
 * @param {string} [input.role]         Legacy/coarse role from the session.
 * @param {string} [input.accessRoleId] Access-role catalog reference (future).
 * @param {string[]} [input.grants]     Explicit grants (from a DB role); when
 *                                       provided they win over `role`.
 * @returns {{
 *   role: string|null,
 *   isOwner: boolean,
 *   wildcard: boolean,
 *   grants: string[],
 *   parsed: Array<{domain,action,scope}>,
 *   can: (domain: string, action: string, requiredScope?: string) => boolean,
 * }}
 *   Deny-by-default: an unknown role with no explicit grants resolves to an
 *   empty permission set that denies everything.
 */
function resolvePermissions(input = {}) {
  const { role = null, accessRoleId = null } = input;
  // An explicit array (including []) means a persisted access role was
  // resolved. Its grants are authoritative for EVERY authorization decision,
  // including owner-only guards; do not let a stale legacy `role: owner`
  // broaden that database-backed role.
  const hasExplicitGrants = Array.isArray(input.grants);
  let grants = hasExplicitGrants ? input.grants.slice() : null;

  if (!grants) {
    grants = grantsForRoleKey(role) || [];
  }

  const wildcard = grants.includes(WILDCARD_GRANT);
  const parsed = grants.map(parseGrant).filter(Boolean);
  const normalizedRoleKey = role ? LEGACY_ROLE_ALIASES[String(role).trim().toLowerCase()] || null : null;
  const isOwner = wildcard || (!hasExplicitGrants && normalizedRoleKey === OWNER_ROLE_KEY);

  function can(domain, action, requiredScope = "salon") {
    if (wildcard) return true;
    const neededRank = SCOPE_RANK[requiredScope];
    if (neededRank === undefined) return false;
    return parsed.some(
      (g) => g.domain === domain && g.action === action && SCOPE_RANK[g.scope] >= neededRank,
    );
  }

  return {
    role: role || null,
    accessRoleId: accessRoleId || null,
    isOwner,
    wildcard,
    grants,
    parsed,
    can,
  };
}

/** True when the permission set allows the action at the required scope. */
function hasPermission(permissionSet, domain, action, requiredScope = "salon") {
  if (!permissionSet || typeof permissionSet.can !== "function") return false;
  return permissionSet.can(domain, action, requiredScope);
}

/**
 * Throwing wrapper for enforcement. Throws PermissionError(403) when the
 * permission set does not allow the action at the required scope.
 */
function requirePermission(permissionSet, domain, action, requiredScope = "salon") {
  if (!hasPermission(permissionSet, domain, action, requiredScope)) {
    throw new PermissionError(
      "FORBIDDEN",
      `Missing permission ${domain}.${action}@${requiredScope}`,
      403,
    );
  }
  return true;
}

// ── Owner safety & permission-change guards ───────────────────────────────

/** True when the actor is acting on their own membership/permissions. */
function isSelfTarget(actorUserId, targetUserId) {
  if (!actorUserId || !targetUserId) return false;
  return String(actorUserId) === String(targetUserId);
}

/**
 * Grants the target role would have that the actor's permission set does not.
 * Used to prevent privilege escalation: an actor can never grant a capability
 * they lack. The wildcard actor (owner) can grant anything.
 *
 * @param {object} actorPermissionSet resolvePermissions() result for the actor
 * @param {string[]} targetGrants grants that would be assigned
 * @returns {string[]} grants that exceed the actor (empty ⇒ no escalation)
 */
function grantsExceedingActor(actorPermissionSet, targetGrants = []) {
  if (actorPermissionSet && actorPermissionSet.wildcard) return [];
  const exceeding = [];
  for (const grant of targetGrants) {
    if (grant === WILDCARD_GRANT) {
      exceeding.push(grant);
      continue;
    }
    const parsed = parseGrant(grant);
    if (!parsed) continue;
    if (!hasPermission(actorPermissionSet, parsed.domain, parsed.action, parsed.scope)) {
      exceeding.push(grant);
    }
  }
  return exceeding;
}

/**
 * Guard a permission/role assignment. Throws PermissionError when:
 *   * the actor lacks permissions.manage_permissions@salon,
 *   * the actor targets their own permissions, or
 *   * the assignment would escalate beyond the actor's own permissions.
 */
function assertCanAssignPermissions({ actorPermissionSet, actorUserId, targetUserId, targetGrants = [] }) {
  requirePermission(actorPermissionSet, "permissions", "manage_permissions", "salon");
  if (isSelfTarget(actorUserId, targetUserId)) {
    throw new PermissionError(
      "SELF_PERMISSION_CHANGE",
      "You cannot change your own permissions.",
      403,
    );
  }
  const exceeding = grantsExceedingActor(actorPermissionSet, targetGrants);
  if (exceeding.length > 0) {
    throw new PermissionError(
      "PRIVILEGE_ESCALATION",
      `Cannot grant permissions you do not hold: ${exceeding.join(", ")}`,
      403,
    );
  }
  return true;
}

/** Normalize a membership-ish record for owner-safety checks. */
function isActiveOwner(membership) {
  if (!membership) return false;
  const roleKey = LEGACY_ROLE_ALIASES[String(membership.role || "").trim().toLowerCase()] || null;
  const status = membership.status ? String(membership.status).toLowerCase() : "active";
  return roleKey === OWNER_ROLE_KEY && status === "active";
}

/** Active owners among the salon's memberships. */
function findActiveOwners(memberships = []) {
  return (Array.isArray(memberships) ? memberships : []).filter(isActiveOwner);
}

/**
 * Would applying `change` to the given salon memberships leave zero active
 * owners? A change is one of:
 *   { userId, remove: true }              — membership removed
 *   { userId, nextStatus: 'suspended' }   — membership suspended/revoked
 *   { userId, nextRole: 'manager' }       — owner demoted to a non-owner role
 *
 * @returns {boolean} true when the change would remove the last active owner
 */
function wouldLeaveNoActiveOwner(memberships, change = {}) {
  const owners = findActiveOwners(memberships);
  if (owners.length === 0) return false; // nothing to protect
  const targetId = change.userId;
  const remaining = owners.filter((owner) => {
    if (String(owner.user_id ?? owner.userId) !== String(targetId)) return true;
    // This owner is the target of the change.
    if (change.remove) return false;
    if (change.nextStatus && String(change.nextStatus).toLowerCase() !== "active") return false;
    if (change.nextRole !== undefined) {
      const nextKey = LEGACY_ROLE_ALIASES[String(change.nextRole || "").trim().toLowerCase()] || null;
      return nextKey === OWNER_ROLE_KEY;
    }
    return true;
  });
  return remaining.length === 0;
}

/**
 * Guard against removing/suspending/demoting the last active owner. Throws
 * PermissionError(409) when the change would leave the salon ownerless.
 */
function assertNotLastActiveOwner(memberships, change = {}) {
  if (wouldLeaveNoActiveOwner(memberships, change)) {
    throw new PermissionError(
      "LAST_ACTIVE_OWNER",
      "You cannot remove, suspend, or demote the last active owner. Transfer ownership first.",
      409,
    );
  }
  return true;
}

/**
 * Validate an ownership transfer before it is applied. Ownership transfer is an
 * explicit, re-authenticated operation that promotes an active target member to
 * owner (optionally keeping the current owner as an additional owner).
 *
 * @param {object} params
 * @param {object} params.actorPermissionSet resolvePermissions() for the actor
 * @param {string} params.actorUserId        the acting owner
 * @param {object} params.targetMembership    { user_id, role, status }
 * @param {boolean} params.reauthenticated    fresh credential re-check performed
 * @returns {{ ok: true } | never} throws PermissionError on any failure
 */
function assertOwnershipTransferAllowed({ actorPermissionSet, actorUserId, targetMembership, reauthenticated }) {
  if (!actorPermissionSet || !actorPermissionSet.isOwner) {
    throw new PermissionError("NOT_OWNER", "Only an owner may transfer ownership.", 403);
  }
  if (!reauthenticated) {
    throw new PermissionError("REAUTH_REQUIRED", "Ownership transfer requires re-authentication.", 401);
  }
  if (!targetMembership || !(targetMembership.user_id ?? targetMembership.userId)) {
    throw new PermissionError("INVALID_TARGET", "A target owner must be selected.", 400);
  }
  const targetId = targetMembership.user_id ?? targetMembership.userId;
  if (isSelfTarget(actorUserId, targetId)) {
    throw new PermissionError("INVALID_TARGET", "The target owner must be a different active member.", 400);
  }
  const status = targetMembership.status ? String(targetMembership.status).toLowerCase() : "active";
  if (status !== "active") {
    throw new PermissionError("INVALID_TARGET", "The target owner must be an active member of this salon.", 400);
  }
  return { ok: true };
}

module.exports = {
  ACTIONS,
  SCOPES,
  SCOPE_RANK,
  DOMAINS,
  WILDCARD_GRANT,
  OWNER_ROLE_KEY,
  DEFAULT_ACCESS_ROLES,
  LEGACY_ROLE_ALIASES,
  PermissionError,
  expandGrants,
  parseGrant,
  grantsForRoleKey,
  resolvePermissions,
  hasPermission,
  requirePermission,
  isSelfTarget,
  grantsExceedingActor,
  assertCanAssignPermissions,
  isActiveOwner,
  findActiveOwners,
  wouldLeaveNoActiveOwner,
  assertNotLastActiveOwner,
  assertOwnershipTransferAllowed,
};

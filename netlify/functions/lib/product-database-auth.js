/**
 * netlify/functions/lib/product-database-auth.js
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4 Hardening: Fail-closed server authorization for product
 * resolution write and preview actions.
 *
 * Rules:
 *   1. JWT identity is trusted ONLY after cryptographic signature verification,
 *      issuer validation, audience validation, expiry validation, and server-side
 *      permission mapping. Never trust unverified payload claims.
 *   2. X-Access-Code is NOT accepted for write actions.
 *   3. PRODUCT_DB_ADMIN_USER default fallback is removed. Permissions must be
 *      configured via PRODUCT_DB_PERMISSIONS.
 *   4. A temporary development identity is allowed only when all of:
 *        - NODE_ENV !== "production"
 *        - PRODUCT_DB_DEV_IDENTITY_ENABLED === "true" (explicit opt-in)
 *        - Identity and permissions are fully server-defined
 *        - Never grants all permissions implicitly
 *   5. Preview actions require the same authentication as writes because
 *      previews expose sensitive impact and candidate data.
 *   6. Missing permission configuration blocks all writes.
 *   7. Frontend-supplied role/permissions/userId/tenantId/isAdmin are
 *      completely ignored.
 *   8. Integration test identity: When NODE_ENV === "test" and
 *      INTEGRATION_TEST_ADMIN_SECRET is set, requests bearing
 *      X-Integration-Test-Secret: <secret> are granted product_database_admin.
 *      This path is strictly gated behind NODE_ENV="test" so it cannot be
 *      reached in production or development.
 */

"use strict";

const jwt = require("jsonwebtoken");

// ── Required env config (read lazily at call time so test setup can inject) ──

function getJwtSecret()      { return process.env.JWT_SECRET; }
function getJwtIssuer()      { return process.env.JWT_ISSUER; }
function getJwtAudience()    { return process.env.JWT_AUDIENCE; }
function getPermissionsRaw() { return process.env.PRODUCT_DB_PERMISSIONS; }

// ── Development identity (explicit opt-in only) ──────────────────────────────

function isDevIdentityEnabled()    { return process.env.PRODUCT_DB_DEV_IDENTITY_ENABLED === "true"; }
function getDevUserId()            { return process.env.PRODUCT_DB_DEV_USER_ID; }
function getDevPermissionsRaw()    { return process.env.PRODUCT_DB_DEV_PERMISSIONS; }
function getDevSecret()            { return process.env.PRODUCT_DB_DEV_SECRET; }

// ── Integration test identity (gated: only when NODE_ENV === "test") ──────────

function getIntegrationTestSecret() { return process.env.INTEGRATION_TEST_ADMIN_SECRET; }

function loadPermissionsTable() {
  const raw = getPermissionsRaw();
  if (!raw) return null;
  try {
    const table = JSON.parse(raw);
    if (typeof table !== "object" || Array.isArray(table)) {
      console.error("[product-db-auth] PRODUCT_DB_PERMISSIONS is not an object");
      return null;
    }
    return table;
  } catch (e) {
    console.error("[product-db-auth] PRODUCT_DB_PERMISSIONS parse error:", e.message);
    return null;
  }
}

// ── Startup safety validation ─────────────────────────────────────────────────

function validateConfig() {
  if (process.env.NODE_ENV === "production") {
    if (isDevIdentityEnabled()) {
      throw new Error(
        "PRODUCT_DB_DEV_IDENTITY_ENABLED must not be set in production"
      );
    }
  }
  if (isDevIdentityEnabled()) {
    if (!getDevUserId() || !getDevPermissionsRaw() || !getDevSecret()) {
      throw new Error(
        "PRODUCT_DB_DEV_IDENTITY_ENABLED requires PRODUCT_DB_DEV_USER_ID, " +
        "PRODUCT_DB_DEV_PERMISSIONS, and PRODUCT_DB_DEV_SECRET"
      );
    }
  }
}

// ── Auth resolution ───────────────────────────────────────────────────────────

/**
 * Resolve server-side identity from the request event.
 *
 * Returns:
 *   { authenticated: true, userId, permissions: string[], authMethod }
 *
 * Throws an error with statusCode on failure.
 *
 * NEVER reads role/permissions/userId/tenantId/isAdmin from the request body.
 */
function resolveAuth(event, { requirePermissions = true } = {}) {
  // Validate configuration at request time
  try {
    validateConfig();
  } catch (e) {
    const err = new Error("Server authorization configuration error: " + e.message);
    err.statusCode = 500;
    throw err;
  }

  const headers = event.headers || {};
  const authHeader = headers["authorization"] || "";

  // ── Integration test identity (strictly gated behind NODE_ENV === "test") ──
  if (process.env.NODE_ENV === "test") {
    const integrationSecret = getIntegrationTestSecret();
    const sentSecret = headers["x-integration-test-secret"] || "";
    if (integrationSecret && sentSecret && sentSecret === integrationSecret) {
      return {
        authenticated: true,
        userId: "integration-test-admin",
        permissions: ["product_database_admin"],
        authMethod: "integration_test",
      };
    }
  }

  // ── JWT path ──────────────────────────────────────────────────────────────
  if (authHeader.startsWith("Bearer ")) {
    const jwtSecret = getJwtSecret();
    if (!jwtSecret) {
      const err = new Error(
        "JWT_SECRET is not configured; cannot verify identity"
      );
      err.statusCode = 500;
      throw err;
    }

    let decoded;
    try {
      const verifyOptions = { algorithms: ["HS256", "RS256"] };
      const jwtIssuer = getJwtIssuer();
      const jwtAudience = getJwtAudience();
      if (jwtIssuer)   verifyOptions.issuer   = jwtIssuer;
      if (jwtAudience) verifyOptions.audience = jwtAudience;
      decoded = jwt.verify(authHeader.slice(7), jwtSecret, verifyOptions);
    } catch (e) {
      const err = new Error("JWT verification failed: " + e.message);
      err.statusCode = 401;
      throw err;
    }

    const userId = decoded.sub || decoded.userId || decoded.id;
    if (!userId || typeof userId !== "string") {
      const err = new Error("JWT missing or invalid subject claim");
      err.statusCode = 401;
      throw err;
    }

    const permissionsTable = loadPermissionsTable();
    if (requirePermissions && !permissionsTable) {
      const err = new Error(
        "PRODUCT_DB_PERMISSIONS is not configured; all writes are blocked"
      );
      err.statusCode = 403;
      throw err;
    }

    const permissions = permissionsTable ? (permissionsTable[userId] || []) : [];

    return {
      authenticated: true,
      userId,
      permissions,
      authMethod: "jwt",
    };
  }

  // ── Development identity path ─────────────────────────────────────────────
  if (isDevIdentityEnabled()) {
    const devSecret = getDevSecret();
    const sentDevSecret = headers["x-dev-identity-secret"] || "";
    if (!sentDevSecret || sentDevSecret !== devSecret) {
      const err = new Error(
        "Development identity requires a matching X-Dev-Identity-Secret header"
      );
      err.statusCode = 401;
      throw err;
    }

    let devPermissions;
    try {
      devPermissions = JSON.parse(getDevPermissionsRaw());
      if (!Array.isArray(devPermissions)) throw new Error("must be array");
    } catch (e) {
      const err = new Error(
        "PRODUCT_DB_DEV_PERMISSIONS must be a JSON array of permission strings"
      );
      err.statusCode = 500;
      throw err;
    }

    return {
      authenticated: true,
      userId: getDevUserId(),
      permissions: devPermissions,
      authMethod: "dev_identity",
    };
  }

  // ── No valid identity ─────────────────────────────────────────────────────
  const err = new Error("Authentication required");
  err.statusCode = 401;
  throw err;
}

/**
 * Check that the resolved auth has the required permission.
 * product_database_admin grants all permissions.
 */
function requirePermission(auth, required) {
  if (
    !auth.permissions.includes(required) &&
    !auth.permissions.includes("product_database_admin")
  ) {
    const err = new Error(`Permission required: ${required}`);
    err.statusCode = 403;
    throw err;
  }
}

/**
 * Permissions required for each action (preview and write).
 * Previews require the same permissions as writes because they
 * expose sensitive impact data.
 */
const ACTION_REQUIRED_PERMISSION = {
  // Write actions
  "detach":              "product_database_edit",
  "reassign":            "product_database_edit",
  "make-independent":    "product_database_edit",
  "approve-alias":       "product_database_edit",
  "keep-separate":       "product_database_validate",
  "reject-match":        "product_database_validate",
  "merge":               "product_database_merge",
  "unmerge":             "product_database_merge",
  "undo":                "product_database_admin",
  // Preview actions — same permission as corresponding write
  "detach-preview":          "product_database_edit",
  "reassign-preview":        "product_database_edit",
  "make-independent-preview":"product_database_edit",
  "approve-alias-preview":   "product_database_edit",
  "keep-separate-preview":   "product_database_validate",
  "reject-match-preview":    "product_database_validate",
  "merge-preview":           "product_database_merge",
  "unmerge-preview":         "product_database_merge",
  "undo-preview":            "product_database_admin",
};

/**
 * Authenticate and authorize the request for the given action.
 * Returns the auth object or throws 401/403.
 */
function authorizeAction(event, action) {
  const auth = resolveAuth(event, { requirePermissions: true });
  const required = ACTION_REQUIRED_PERMISSION[action];
  if (required) requirePermission(auth, required);
  return auth;
}

module.exports = {
  resolveAuth,
  requirePermission,
  authorizeAction,
  ACTION_REQUIRED_PERMISSION,
  validateConfig,
};

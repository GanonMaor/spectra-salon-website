/**
 * netlify/functions/lib/product-preview-token.js
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4 Hardening: Preview token generation and validation.
 *
 * Rules:
 *   1. A preview token is bound to userId, action, source reference,
 *      normalized request hash, and expected revisions.
 *   2. A preview token cannot be reused by another user, for another action,
 *      another source record, or a materially different request.
 *   3. The impact hash uses deterministic canonical serialization (sorted keys,
 *      sorted ID arrays, normalized null/undefined).
 *   4. Stale previews are rejected with code "preview_stale".
 *   5. Tokens expire after PREVIEW_TOKEN_TTL_SECONDS (default 300 / 5 minutes).
 */

"use strict";

const crypto = require("crypto");

const PREVIEW_TOKEN_TTL_SECONDS =
  parseInt(process.env.PREVIEW_TOKEN_TTL_SECONDS || "300", 10);

const IMPACT_HASH_VERSION = 1;

// ── Canonical serialization for impact hashing ────────────────────────────────

/**
 * Produce a deterministic JSON string for hashing.
 * - Sorts object keys.
 * - Sorts arrays of strings/numbers where order is not semantically significant.
 * - Normalizes undefined → null.
 * - Strips random or timestamp-only values outside the revision model.
 *
 * @param {unknown} value
 * @returns {string}
 */
function canonicalSerialize(value) {
  if (value === undefined || value === null) return "null";
  if (Array.isArray(value)) {
    // Sort arrays of primitives for stable hashing
    const normalized = value.map(canonicalSerialize);
    const allPrimitive = normalized.every((s) => !s.startsWith("{") && !s.startsWith("["));
    if (allPrimitive) normalized.sort();
    return "[" + normalized.join(",") + "]";
  }
  if (typeof value === "object") {
    const sortedKeys = Object.keys(value).sort();
    const parts = sortedKeys.map((k) => {
      const serialized = canonicalSerialize(value[k]);
      return JSON.stringify(k) + ":" + serialized;
    });
    return "{" + parts.join(",") + "}";
  }
  return JSON.stringify(value);
}

/**
 * Compute a versioned impact hash from the preview impact object.
 * @param {object} impactData
 * @returns {{ impactHash: string; impactHashVersion: number }}
 */
function computeImpactHash(impactData) {
  const canonical = canonicalSerialize(impactData);
  const hash = crypto.createHash("sha256").update(canonical).digest("hex");
  return { impactHash: hash, impactHashVersion: IMPACT_HASH_VERSION };
}

/**
 * Compute a normalized request hash for token binding.
 * Strips fields that legitimately differ between preview and write:
 *   operationId, previewToken, impactHash — added by write path
 *   action — "detach-preview" vs "detach" by design
 *   reason — user may type this after seeing preview
 *   mode — may default differently, not material to impact
 *   testFailurePoint — test-only
 *
 * @param {object} params - Request params
 * @returns {string}
 */
function computeRequestHash(params) {
  const {
    operationId: _oid,
    previewToken: _pt,
    impactHash: _ih,
    action: _action,
    reason: _reason,
    mode: _mode,
    testFailurePoint: _tfp,
    ...bindingParams
  } = params;
  return crypto
    .createHash("sha256")
    .update(canonicalSerialize(bindingParams))
    .digest("hex");
}

/**
 * Generate a preview token ID (opaque, non-guessable).
 * @returns {string}
 */
function generateTokenId() {
  return "prev-" + crypto.randomBytes(24).toString("hex");
}

/**
 * Build the preview token payload for storage.
 *
 * @param {{
 *   userId: string,
 *   action: string,
 *   sourceRecordType?: string,
 *   sourceRecordId?: string,
 *   requestParams: object,
 *   expectedRevisions: Record<string, number>,
 *   impactHash: string,
 *   impactHashVersion: number,
 * }} opts
 * @returns {{ tokenId: string, generatedAt: string, expiresAt: string, payload: object }}
 */
function buildPreviewToken(opts) {
  const { userId, action, sourceRecordType, sourceRecordId, requestParams, expectedRevisions, impactHash, impactHashVersion } = opts;
  const tokenId = generateTokenId();
  const generatedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + PREVIEW_TOKEN_TTL_SECONDS * 1000).toISOString();
  const normalizedRequestHash = computeRequestHash(requestParams);

  return {
    tokenId,
    generatedAt,
    expiresAt,
    payload: {
      token_id: tokenId,
      user_id: userId,
      action,
      source_record_type: sourceRecordType || null,
      source_record_id: sourceRecordId || null,
      normalized_req_hash: normalizedRequestHash,
      expected_revisions: expectedRevisions || {},
      impact_hash: impactHash,
      impact_hash_version: impactHashVersion || IMPACT_HASH_VERSION,
      generated_at: generatedAt,
      expires_at: expiresAt,
      consumed_at: null,
      operation_id: null,
    },
  };
}

/**
 * Persist a preview token to the database.
 *
 * @param {import('pg').Client} client
 * @param {object} payload - From buildPreviewToken().payload
 */
async function savePreviewToken(client, payload) {
  await client.query(
    `INSERT INTO product_preview_tokens
       (token_id, user_id, action, source_record_type, source_record_id,
        normalized_req_hash, expected_revisions, impact_hash,
        impact_hash_version, generated_at, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (token_id) DO NOTHING`,
    [
      payload.token_id,
      payload.user_id,
      payload.action,
      payload.source_record_type,
      payload.source_record_id,
      payload.normalized_req_hash,
      JSON.stringify(payload.expected_revisions),
      payload.impact_hash,
      payload.impact_hash_version,
      payload.generated_at,
      payload.expires_at,
    ]
  );
}

/**
 * Validate a previewToken + impactHash on a write request.
 *
 * Checks:
 *   - Token exists and is not expired.
 *   - Token is bound to the correct user and action.
 *   - Token is bound to the correct source record (if applicable).
 *   - Token normalized_req_hash matches the current write request.
 *   - impactHash in the write request matches the stored token impact_hash.
 *   - Token has not been consumed by another operation.
 *
 * Does NOT check revisions here — that is done separately during the
 * structural write by re-fetching and comparing.
 *
 * @param {import('pg').Client} client
 * @param {{
 *   tokenId: string,
 *   impactHash: string,
 *   userId: string,
 *   action: string,
 *   sourceRecordType?: string,
 *   sourceRecordId?: string,
 *   requestParams: object,
 * }} opts
 * @throws Error with statusCode 409 and code "preview_stale"
 */
async function validatePreviewToken(client, opts) {
  const { tokenId, impactHash, userId, action, sourceRecordType, sourceRecordId, requestParams } = opts;

  const { rows } = await client.query(
    `SELECT * FROM product_preview_tokens WHERE token_id = $1`,
    [tokenId]
  );

  if (!rows.length) {
    const err = new Error("Preview token not found or expired");
    err.statusCode = 409;
    err.code = "preview_stale";
    throw err;
  }

  const token = rows[0];

  // Check expiry
  if (new Date(token.expires_at) < new Date()) {
    const err = new Error("Preview token has expired; please generate a new preview");
    err.statusCode = 409;
    err.code = "preview_stale";
    throw err;
  }

  // Check user binding
  if (token.user_id !== userId) {
    const err = new Error("Preview token was generated for a different user");
    err.statusCode = 409;
    err.code = "preview_stale";
    throw err;
  }

  // Check action binding
  if (token.action !== action) {
    const err = new Error("Preview token was generated for a different action");
    err.statusCode = 409;
    err.code = "preview_stale";
    throw err;
  }

  // Check source record binding
  if (sourceRecordType !== undefined && token.source_record_type !== (sourceRecordType || null)) {
    const err = new Error("Preview token was generated for a different source record type");
    err.statusCode = 409;
    err.code = "preview_stale";
    throw err;
  }
  if (sourceRecordId !== undefined && token.source_record_id !== (sourceRecordId || null)) {
    const err = new Error("Preview token was generated for a different source record");
    err.statusCode = 409;
    err.code = "preview_stale";
    throw err;
  }

  // Check request hash binding
  const currentRequestHash = computeRequestHash(requestParams);
  if (token.normalized_req_hash !== currentRequestHash) {
    const err = new Error("Write request parameters differ from previewed request; please preview again");
    err.statusCode = 409;
    err.code = "preview_stale";
    throw err;
  }

  // Check impact hash
  if (token.impact_hash !== impactHash) {
    const err = new Error("Impact hash does not match preview; product state may have changed");
    err.statusCode = 409;
    err.code = "preview_stale";
    throw err;
  }

  // Check not already consumed by a different operation
  if (token.consumed_at && token.operation_id !== opts.operationId) {
    const err = new Error("Preview token has already been used by another operation");
    err.statusCode = 409;
    err.code = "preview_stale";
    throw err;
  }

  return token;
}

/**
 * Mark a preview token as consumed by the given operation.
 *
 * @param {import('pg').Client} client
 * @param {string} tokenId
 * @param {string} operationId
 */
async function consumePreviewToken(client, tokenId, operationId) {
  await client.query(
    `UPDATE product_preview_tokens
     SET consumed_at = NOW(), operation_id = $2
     WHERE token_id = $1 AND consumed_at IS NULL`,
    [tokenId, operationId]
  );
}

module.exports = {
  computeImpactHash,
  computeRequestHash,
  buildPreviewToken,
  savePreviewToken,
  validatePreviewToken,
  consumePreviewToken,
  IMPACT_HASH_VERSION,
  PREVIEW_TOKEN_TTL_SECONDS,
};

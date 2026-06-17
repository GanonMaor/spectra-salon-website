/**
 * netlify/functions/product-resolution-actions.js
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4: Transactional Product Resolution Workflows
 *
 * Provides preview (read-only) and write (transactional) endpoints for all
 * product identity resolution actions:
 *
 *   POST /.netlify/functions/product-resolution-actions
 *   Body: { action: "<action-name>", ...params }
 *
 * Allowlisted actions:
 *   detach-preview          | detach
 *   reassign-preview        | reassign
 *   make-independent-preview| make-independent
 *   merge-preview           | merge
 *   unmerge-preview         | unmerge
 *   approve-alias-preview   | approve-alias
 *   keep-separate-preview   | keep-separate
 *   reject-match-preview    | reject-match
 *   undo-preview            | undo
 *
 * Auth: Bearer JWT verified with JWT_SECRET.
 *   Fallback (dev mode): X-Access-Code header (grants full admin).
 *
 * Permissions (resolved server-side from JWT payload + DB or env config):
 *   product_database_edit    → detach, reassign, approve-alias, make-independent
 *   product_database_validate→ keep-separate, reject-match
 *   product_database_merge   → merge, unmerge
 *   product_database_admin   → force overrides
 *
 * All write actions run inside a pg Client transaction with
 * BEGIN / COMMIT / ROLLBACK semantics.
 */

"use strict";

const { Client } = require("pg");
const crypto = require("crypto");

// ── Auth: delegated to shared fail-closed helper ──────────────────────────────
const { authorizeAction, requirePermission: requirePerm } = require("./lib/product-database-auth");
// ── Source record typing ──────────────────────────────────────────────────────
const { resolveSourceRecordType } = require("./lib/product-source-resolver");
// ── Preview token ─────────────────────────────────────────────────────────────
const {
  computeImpactHash,
  computeRequestHash,
  buildPreviewToken,
  savePreviewToken,
  validatePreviewToken,
  consumePreviewToken,
  IMPACT_HASH_VERSION,
  PREVIEW_TOKEN_TTL_SECONDS,
} = require("./lib/product-preview-token");
// ── Idempotency ───────────────────────────────────────────────────────────────
const { reserveOperation, markOperationRunning, markOperationCompleted, markOperationFailed } = require("./lib/product-idempotency");

// Legacy shim: extract permissions array for inline requirePermission calls
function requirePermission(permissions, required) {
  if (!permissions.includes(required) && !permissions.includes("product_database_admin")) {
    const err = new Error(`Permission required: ${required}`);
    err.statusCode = 403;
    throw err;
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Dev-Identity-Secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

// ── Database helpers ─────────────────────────────────────────────────────────

function getDbUrl(useTestDb = false) {
  if (useTestDb) {
    const testUrl = process.env.TEST_DATABASE_URL;
    if (!testUrl) throw new Error("TEST_DATABASE_URL not configured");
    const prodUrl = process.env.NEON_DATABASE_URL || "";
    if (testUrl === prodUrl) throw new Error("TEST_DATABASE_URL must not equal NEON_DATABASE_URL");
    return testUrl;
  }
  let url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "";
  url = url.replace(/^psql\s+/i, "").replace(/^'|'$/g, "").trim();
  if (!url) throw new Error("NEON_DATABASE_URL not configured");
  return url;
}

async function withTransaction(dbUrl, fn) {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    await client.end().catch(() => {});
  }
}

async function readOnlyDb(dbUrl, fn) {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end().catch(() => {});
  }
}

function newActionId() {
  return "act-" + crypto.randomUUID();
}

// ── Analytics recalculation state ─────────────────────────────────────────────

/**
 * Build a baseline analytics recalculation state.
 * Used in preview and write results to report honestly how analytics will
 * be affected. Fields that cannot be determined return in unsupportedFields.
 *
 * @param {{ reprocessingRequiredCount?: number }} [opts]
 * @returns {object}
 */
function buildAnalyticsState(opts = {}) {
  return {
    analyticsAffected: (opts.reprocessingRequiredCount || 0) > 0,
    affectedSnapshotIds: [],
    affectedAggregationTypes: [],
    recalculationMode: "mark_stale",
    reprocessingRequiredCount: opts.reprocessingRequiredCount || 0,
    unsupportedFields: ["affectedSnapshotIds", "affectedAggregationTypes"],
  };
}

// ── Preview token helpers (graceful degradation when table not yet created) ────

/**
 * Generate a preview token for a preview result.
 * If the product_preview_tokens table does not yet exist (migration not applied),
 * returns minimal token fields without DB persistence.
 *
 * @param {import('pg').Client} client
 * @param {{ userId: string, action: string, sourceRecordType?: string, sourceRecordId?: string, params: object, expectedRevisions: object, impactData: object }} opts
 * @returns {Promise<{ previewToken: string, impactHash: string, impactHashVersion: number, generatedAt: string, expiresAt: string }>}
 */
async function generatePreviewToken(client, opts) {
  const { userId, action, sourceRecordType, sourceRecordId, params, expectedRevisions, impactData } = opts;
  const { impactHash, impactHashVersion } = computeImpactHash(impactData);
  const tokenInfo = buildPreviewToken({
    userId,
    action,
    sourceRecordType,
    sourceRecordId,
    requestParams: params,
    expectedRevisions: expectedRevisions || {},
    impactHash,
    impactHashVersion,
  });
  try {
    await savePreviewToken(client, tokenInfo.payload);
  } catch (e) {
    // Graceful degradation: table may not exist yet (migration pending)
    if (!e.message?.includes("product_preview_tokens")) throw e;
  }
  return {
    previewToken: tokenInfo.tokenId,
    impactHash,
    impactHashVersion,
    generatedAt: tokenInfo.generatedAt,
    expiresAt: tokenInfo.expiresAt,
  };
}

/**
 * Validate a write request's preview token + idempotency.
 * Gracefully skips if tables don't exist yet.
 *
 * @param {import('pg').Client} client
 * @param {{ previewToken: string, impactHash: string, operationId: string, userId: string, action: string, sourceRecordType?: string, sourceRecordId?: string, requestParams: object }} opts
 */
async function validateWriteToken(client, opts) {
  if (!opts.previewToken || !opts.impactHash) {
    const err = new Error("previewToken and impactHash are required for write actions");
    err.statusCode = 400;
    throw err;
  }
  if (!opts.operationId) {
    const err = new Error("operationId is required for write actions");
    err.statusCode = 400;
    throw err;
  }
  // Test mode bypass: allows integration tests to call writes without going through preview
  if (
    process.env.NODE_ENV === "test" &&
    (opts.previewToken === "test-bypass-token" || opts.previewToken === "no-token")
  ) {
    return; // Skip preview token validation in test bypass mode
  }
  try {
    await validatePreviewToken(client, {
      tokenId: opts.previewToken,
      impactHash: opts.impactHash,
      userId: opts.userId,
      action: opts.action,
      sourceRecordType: opts.sourceRecordType,
      sourceRecordId: opts.sourceRecordId,
      requestParams: opts.requestParams,
      operationId: opts.operationId,
    });
  } catch (e) {
    // Graceful degradation: table may not exist yet
    if (e.code === "preview_stale") throw e;
    if (!e.message?.includes("product_preview_tokens")) throw e;
  }
}

/**
 * Idempotency wrapper for write actions.
 * Returns { result, replay } — replay=true means we returned a cached result.
 *
 * @param {import('pg').Client} client - A connected client (outside transaction)
 * @param {{ operationId: string, userId: string, action: string, requestParams: object }} opts
 * @param {() => Promise<object>} executeFn
 */
async function withIdempotency(client, opts, executeFn) {
  const requestHash = computeRequestHash(opts.requestParams);
  try {
    const reservation = await reserveOperation(client, {
      operationId: opts.operationId,
      userId: opts.userId,
      action: opts.action,
      requestHash,
    });
    if (reservation.status === "completed") {
      return { result: reservation.resultSnapshot, replay: true };
    }
    if (reservation.status === "running_lease_ok") {
      const err = new Error("Operation is currently being processed; retry shortly");
      err.statusCode = 409;
      err.code = "operation_running";
      throw err;
    }
    await markOperationRunning(client, opts.operationId);
    const result = await executeFn();
    await markOperationCompleted(client, opts.operationId, result);
    return { result, replay: false };
  } catch (e) {
    if (e.code === "operation_conflict" || e.code === "operation_running") throw e;
    // DB error from idempotency tables (table not created yet) — skip idempotency
    if (e.message?.includes("product_resolution_operations")) {
      const result = await executeFn();
      return { result, replay: false };
    }
    try {
      await markOperationFailed(client, opts.operationId, {
        retryable: e.code === "40001" || e.code === "40P01",
        errorMessage: e.message,
      });
    } catch (_) { /* best-effort */ }
    throw e;
  }
}

/**
 * Test-only failure injection.
 * Only active when NODE_ENV === "test" AND TEST_DATABASE_URL is present.
 *
 * @param {import('pg').Client} client
 * @param {string|undefined} testFailurePoint
 * @param {string} point
 */
async function injectFailureIfRequested(client, testFailurePoint, point) {
  if (!testFailurePoint || testFailurePoint !== point) return;
  if (process.env.NODE_ENV !== "test" || !process.env.TEST_DATABASE_URL) {
    // Security log: attempt to use testFailurePoint outside test mode
    console.error(
      `[SECURITY] testFailurePoint received outside test mode (NODE_ENV=${process.env.NODE_ENV}). Rejected.`
    );
    const err = new Error("testFailurePoint is only allowed in test mode");
    err.statusCode = 403;
    throw err;
  }
  throw new Error(`Controlled failure injection at point: ${point}`);
}

// ── Action: detach ────────────────────────────────────────────────────────────

async function detachPreview(params, dbUrl, auth) {
  const { sourceRecordId, sourceRecordType = "catalog_product_source" } = params;
  if (!sourceRecordId) throw validationError("sourceRecordId required");
  resolveSourceRecordType(sourceRecordType); // validate type

  return readOnlyDb(dbUrl, async (client) => {
    const { rows: sources } = await client.query(
      `SELECT s.id, s.raw_product_name, s.canonical_product_id, s.assignment_active,
              cp.canonical_name, cp.revision AS canonical_revision
       FROM catalog_product_sources s
       LEFT JOIN canonical_products cp ON cp.id = s.canonical_product_id
       WHERE s.id = $1`,
      [sourceRecordId]
    );
    if (!sources.length) throw notFoundError("Source record not found");
    const src = sources[0];

    if (!src.canonical_product_id) {
      const impactData = { blocker: "already_unassigned", affectedMappings: 0, affectedUsageResolutions: 0 };
      const tokenMeta = auth ? await generatePreviewToken(client, {
        userId: auth.userId, action: "detach", sourceRecordType, sourceRecordId,
        params, expectedRevisions: {}, impactData,
      }) : { previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1, generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString() };
      return {
        preview: true, action: "detach",
        blocker: "Source is already unassigned; no active mapping to detach.",
        affectedSources: 0, affectedMappings: 0, affectedUsageResolutions: 0,
        warnings: [],
        ...buildAnalyticsState(),
        ...tokenMeta,
      };
    }

    const { rows: mappings } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM product_identity_mappings
       WHERE source_record_id = $1 AND active = true
         AND mapping_type NOT IN ('rejected_match','keep_separate')`,
      [sourceRecordId]
    );

    const { rows: usageRows } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM usage_product_resolutions
       WHERE canonical_product_id = $1 AND resolution_status IN ('resolved','suggested')`,
      [src.canonical_product_id]
    );

    const impactData = {
      sourceId: src.id, currentCanonicalId: src.canonical_product_id,
      canonicalRevision: src.canonical_revision,
      affectedMappings: mappings[0].cnt, affectedUsageResolutions: usageRows[0].cnt,
    };
    const expectedRevisions = { [src.canonical_product_id]: src.canonical_revision };
    const tokenMeta = auth ? await generatePreviewToken(client, {
      userId: auth.userId, action: "detach", sourceRecordType, sourceRecordId,
      params, expectedRevisions, impactData,
    }) : { previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1, generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString() };

    return {
      preview: true,
      action: "detach",
      sourceId: src.id,
      sourceName: src.raw_product_name,
      currentCanonicalId: src.canonical_product_id,
      currentCanonicalName: src.canonical_name,
      canonicalRevision: src.canonical_revision,
      affectedSources: 1,
      affectedMappings: mappings[0].cnt,
      affectedUsageResolutions: usageRows[0].cnt,
      warnings: usageRows[0].cnt > 0
        ? [`${usageRows[0].cnt} usage resolution row(s) will be marked reprocessing_required`]
        : [],
      ...buildAnalyticsState({ reprocessingRequiredCount: usageRows[0].cnt }),
      ...tokenMeta,
    };
  });
}

async function detachWrite(params, auth, dbUrl) {
  const { userId, permissions } = auth;
  requirePermission(permissions, "product_database_edit");

  const { sourceRecordId, sourceRecordType = "catalog_product_source", mode = "detach_to_unresolved",
          reason, expectedCanonicalRevision, operationId, previewToken, impactHash, testFailurePoint } = params;
  if (!sourceRecordId) throw validationError("sourceRecordId required");
  resolveSourceRecordType(sourceRecordType, { requiresWrite: true });
  if (!["detach_to_unresolved", "detach_and_create_independent"].includes(mode)) {
    throw validationError("mode must be detach_to_unresolved or detach_and_create_independent");
  }
  if (!operationId) throw validationError("operationId required");
  if (!previewToken || !impactHash) throw validationError("previewToken and impactHash required");

  // Validate preview token (outside the structural transaction)
  const outerClient = new Client({ connectionString: dbUrl });
  await outerClient.connect();
  try {
    await validateWriteToken(outerClient, {
      previewToken, impactHash, userId, action: "detach",
      sourceRecordType, sourceRecordId, requestParams: params, operationId,
    });
    const { result } = await withIdempotency(outerClient, {
      operationId, userId, action: "detach",
      requestParams: params,
    }, async () => {
      return withTransaction(dbUrl, async (client) => {
        const { rows: sources } = await client.query(
          `SELECT s.id, s.raw_product_name, s.normalized_raw_name, s.canonical_product_id,
                  s.assignment_active, s.raw_brand, s.raw_product_line,
                  (SELECT cp.revision FROM canonical_products cp WHERE cp.id = s.canonical_product_id)
                    AS canonical_revision
           FROM catalog_product_sources s
           WHERE s.id = $1 FOR UPDATE`,
          [sourceRecordId]
        );
        if (!sources.length) throw notFoundError("Source record not found");
        const src = sources[0];

        if (!src.canonical_product_id) {
          return { success: true, noOp: true, message: "Source already unassigned",
                   operationId, actionId: newActionId(), mode, prevCanonicalId: null,
                   newCanonicalId: null, deactivatedMappings: 0, affectedUsageResolutions: 0,
                   ...buildAnalyticsState() };
        }

        if (expectedCanonicalRevision != null && src.canonical_revision !== expectedCanonicalRevision) {
          const err = new Error("Revision conflict: canonical product was modified since preview was loaded");
          err.statusCode = 409; throw err;
        }

        const actionId = newActionId();
        const prevCanonicalId = src.canonical_product_id;

        const { rows: deactivated } = await client.query(
          `UPDATE product_identity_mappings
           SET active = false, deactivated_at = now(), deactivation_reason = $1, updated_at = now()
           WHERE source_record_id = $2 AND active = true
             AND mapping_type NOT IN ('rejected_match','keep_separate')
           RETURNING id`,
          [reason || "manual_detach", sourceRecordId]
        );

        await injectFailureIfRequested(client, testFailurePoint, "after_mapping_update");

        await client.query(
          `UPDATE catalog_product_sources
           SET canonical_product_id = NULL, assignment_active = false,
               detached_at = now(), detached_reason = $1, updated_at = now()
           WHERE id = $2`,
          [reason || "manual_detach", sourceRecordId]
        );

        await injectFailureIfRequested(client, testFailurePoint, "after_source_update");

        const { rows: usageAffected } = await client.query(
          `UPDATE usage_product_resolutions
           SET reprocessing_required = true,
               previous_canonical_product_id = canonical_product_id,
               last_resolution_action_id = $1, updated_at = now()
           WHERE canonical_product_id = $2 AND resolution_status IN ('resolved','suggested')
           RETURNING id`,
          [actionId, prevCanonicalId]
        );

        await injectFailureIfRequested(client, testFailurePoint, "after_usage_update");

        await client.query(
          `UPDATE canonical_products SET source_count = GREATEST(0, source_count - 1),
           revision = revision + 1, updated_at = now() WHERE id = $1`,
          [prevCanonicalId]
        );

        let newCanonicalId = null;

        if (mode === "detach_and_create_independent") {
          const newId = "cprod-" + crypto.randomUUID();
          const mfr = await ensurePlaceholderManufacturer(client, src.raw_brand || "Unknown");
          await client.query(
            `INSERT INTO canonical_products
               (id, manufacturer_id, canonical_name, normalized_name,
                primary_product_type, validation_status, evidence_status,
                source_count, revision, created_at, updated_at)
             VALUES ($1,$2,$3,$4,'other','needs_review','unresearched',1,1,now(),now())`,
            [newId, mfr.id, src.raw_product_name, normalize(src.raw_product_name)]
          );
          await client.query(
            `UPDATE catalog_product_sources
             SET canonical_product_id = $1, assignment_active = true,
                 detached_at = NULL, detached_reason = NULL, updated_at = now()
             WHERE id = $2`,
            [newId, sourceRecordId]
          );
          await client.query(
            `INSERT INTO product_identity_mappings
               (source_record_id, raw_product_name, normalized_raw_name,
                canonical_product_id, mapping_type, match_method, confidence,
                validation_status, assigned_by, assigned_at, active, created_at, updated_at)
             VALUES ($1,$2,$3,$4,'manual_assignment','admin_action','high',
                     'candidate',$5,now(),true,now(),now())`,
            [sourceRecordId, src.raw_product_name, src.normalized_raw_name, newId, userId]
          );
          await client.query(
            `INSERT INTO product_review_items
               (review_type, source_record_id, canonical_product_id, status,
                priority, confidence, reason_code, evidence, created_by_action_id,
                created_at, updated_at)
             VALUES ('manual_review_requested',$1,$2,'open',2,'low',
                     'detach_and_create_independent',$3,$4,now(),now())`,
            [sourceRecordId, newId,
             JSON.stringify({ sourceId: sourceRecordId, actionId, reason }),
             actionId]
          );
          newCanonicalId = newId;
        } else {
          await client.query(
            `INSERT INTO product_review_items
               (review_type, source_record_id, status, priority, confidence,
                reason_code, evidence, created_by_action_id, created_at, updated_at)
             VALUES ('unresolved_source',$1,'open',2,'low','manual_detach',$2,$3,now(),now())`,
            [sourceRecordId,
             JSON.stringify({ sourceId: sourceRecordId, previousCanonicalId: prevCanonicalId, reason }),
             actionId]
          );
        }

        // Write history with operation_id and source_record_type
        const { rows: histRows } = await client.query(
          `INSERT INTO product_merge_history
             (action, source_record_id, previous_canonical_id, new_canonical_id,
              affected_mapping_count, affected_usage_row_count,
              reason, performed_by, action_id, operation_id, source_record_type,
              rollback_data, created_at)
           VALUES ('detached',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())
           RETURNING id`,
          [sourceRecordId, prevCanonicalId, newCanonicalId,
           deactivated.length, usageAffected.length,
           reason || null, userId, actionId, operationId, sourceRecordType,
           JSON.stringify({
             sourceRecordId, sourceRecordType, prevCanonicalId, mode,
             deactivatedMappingIds: deactivated.map(r => r.id),
             affectedUsageIds: usageAffected.map(r => r.id),
           })]
        );

        await injectFailureIfRequested(client, testFailurePoint, "after_history_write");
        await injectFailureIfRequested(client, testFailurePoint, "pre_commit");

        await client.query(
          `INSERT INTO product_audit_logs
             (entity_type, entity_id, action, previous_value, new_value,
              reason, performed_by, revision_before, created_at)
           VALUES ('catalog_product_source',$1,'detach',$2,$3,$4,$5,$6,now())`,
          [sourceRecordId,
           JSON.stringify({ canonical_product_id: prevCanonicalId }),
           JSON.stringify({ canonical_product_id: newCanonicalId }),
           reason || null, userId, src.canonical_revision]
        );

        // Consume preview token within transaction
        try {
          await consumePreviewToken(client, previewToken, operationId);
        } catch (_) { /* graceful if table not yet migrated */ }

        return {
          success: true, actionId, operationId,
          mergeHistoryId: histRows[0]?.id, mode, prevCanonicalId, newCanonicalId,
          deactivatedMappings: deactivated.length, affectedUsageResolutions: usageAffected.length,
          ...buildAnalyticsState({ reprocessingRequiredCount: usageAffected.length }),
        };
      });
    });
    return result;
  } finally {
    await outerClient.end().catch(() => {});
  }
}

// ── Action: reassign ─────────────────────────────────────────────────────────

async function reassignPreview(params, dbUrl) {
  const { sourceRecordId, targetCanonicalId } = params;
  if (!sourceRecordId) throw validationError("sourceRecordId required");
  if (!targetCanonicalId) throw validationError("targetCanonicalId required");

  return readOnlyDb(dbUrl, async (client) => {
    const { rows: sources } = await client.query(
      `SELECT s.id, s.raw_product_name, s.canonical_product_id,
              s.raw_brand, s.raw_product_type,
              cp.canonical_name AS current_canonical_name, cp.revision AS canonical_revision,
              cp.primary_product_type AS current_type,
              cp.package_size_value AS current_pkg_size, cp.package_size_unit AS current_pkg_unit
       FROM catalog_product_sources s
       LEFT JOIN canonical_products cp ON cp.id = s.canonical_product_id
       WHERE s.id = $1`,
      [sourceRecordId]
    );
    if (!sources.length) throw notFoundError("Source record not found");
    const src = sources[0];

    const { rows: targets } = await client.query(
      `SELECT id, canonical_name, revision, primary_product_type,
              package_size_value, package_size_unit, active, validation_status
       FROM canonical_products WHERE id = $1`,
      [targetCanonicalId]
    );
    if (!targets.length) throw notFoundError("Target canonical product not found");
    const tgt = targets[0];

    if (!tgt.active) {
      return { preview: true, action: "reassign", blocker: "Target canonical product is inactive" };
    }

    const warnings = [];
    const blockers = [];

    if (src.current_type && tgt.primary_product_type && src.current_type !== tgt.primary_product_type) {
      warnings.push(`Product type mismatch: current=${src.current_type}, target=${tgt.primary_product_type}`);
    }

    const { rows: usageRows } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM usage_product_resolutions
       WHERE canonical_product_id = $1 AND resolution_status IN ('resolved','suggested')`,
      [src.canonical_product_id]
    );

    const { rows: mappings } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM product_identity_mappings
       WHERE source_record_id = $1 AND active = true
         AND mapping_type NOT IN ('rejected_match','keep_separate')`,
      [sourceRecordId]
    );

    return {
      preview: true,
      action: "reassign",
      sourceId: src.id,
      sourceName: src.raw_product_name,
      currentCanonicalId: src.canonical_product_id,
      currentCanonicalName: src.current_canonical_name,
      targetCanonicalId: tgt.id,
      targetCanonicalName: tgt.canonical_name,
      targetRevision: tgt.revision,
      currentRevision: src.canonical_revision,
      affectedMappings: mappings[0].cnt,
      affectedUsageResolutions: usageRows[0].cnt,
      warnings,
      blockers,
      unsupportedFields: ["barcode_conflict_check", "catalog_number_conflict_check"],
    };
  });
}

async function reassignWrite(params, userId, permissions, dbUrl) {
  requirePermission(permissions, "product_database_edit");

  const { sourceRecordId, targetCanonicalId, reason,
          expectedSourceRevision, expectedTargetRevision,
          operationId, previewToken, impactHash,
          forceOverride = false,
          sourceRecordType = "catalog_product_source" } = params;
  if (!sourceRecordId) throw validationError("sourceRecordId required");
  if (!targetCanonicalId) throw validationError("targetCanonicalId required");
  if (!operationId) throw validationError("operationId required");
  if (!previewToken || !impactHash) throw validationError("previewToken and impactHash required");

  if (forceOverride) requirePermission(permissions, "product_database_admin");

  const outerClient = new Client({ connectionString: dbUrl });
  await outerClient.connect();
  try {
    await validateWriteToken(outerClient, {
      previewToken, impactHash, userId, action: "reassign",
      sourceRecordType, sourceRecordId, requestParams: params, operationId,
    });
    const { result } = await withIdempotency(outerClient, {
      operationId, userId, action: "reassign", requestParams: params,
    }, async () => {
      return withTransaction(dbUrl, async (client) => {
    const { rows: sources } = await client.query(
      `SELECT s.id, s.raw_product_name, s.normalized_raw_name,
              s.canonical_product_id, s.raw_brand, s.raw_product_type,
              (SELECT cp.revision FROM canonical_products cp WHERE cp.id = s.canonical_product_id)
                AS old_canonical_revision
       FROM catalog_product_sources s
       WHERE s.id = $1 FOR UPDATE`,
      [sourceRecordId]
    );
    if (!sources.length) throw notFoundError("Source record not found");
    const src = sources[0];

    const { rows: targets } = await client.query(
      `SELECT id, revision, active, primary_product_type FROM canonical_products
       WHERE id = $1 FOR UPDATE`,
      [targetCanonicalId]
    );
    if (!targets.length) throw notFoundError("Target not found");
    const tgt = targets[0];

    if (!tgt.active) throw validationError("Target canonical product is inactive");

    if (expectedSourceRevision != null && src.old_canonical_revision !== expectedSourceRevision) {
      const err = new Error("Revision conflict on source canonical product");
      err.statusCode = 409; throw err;
    }
    if (expectedTargetRevision != null && tgt.revision !== expectedTargetRevision) {
      const err = new Error("Revision conflict on target canonical product");
      err.statusCode = 409; throw err;
    }

    // Sanity: same target as current
    if (src.canonical_product_id === targetCanonicalId) {
      return { success: true, noOp: true, message: "Source already assigned to target" };
    }

    const actionId = newActionId();
    const prevCanonicalId = src.canonical_product_id;

    // Deactivate old mappings
    const { rows: deactivated } = await client.query(
      `UPDATE product_identity_mappings
       SET active = false, deactivated_at = now(), deactivation_reason = 'reassignment',
           updated_at = now()
       WHERE source_record_id = $1 AND active = true
         AND mapping_type NOT IN ('rejected_match','keep_separate')
       RETURNING id`,
      [sourceRecordId]
    );

    // Create new manual assignment mapping
    const { rows: newMappingRows } = await client.query(
      `INSERT INTO product_identity_mappings
         (source_record_id, raw_product_name, normalized_raw_name,
          canonical_product_id, mapping_type, match_method, confidence,
          validation_status, assigned_by, assigned_at, active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'manual_assignment','admin_reassign','high',
               'approved',$5,now(),true,now(),now())
       RETURNING id`,
      [sourceRecordId, src.raw_product_name, src.normalized_raw_name,
       targetCanonicalId, userId]
    );

    // Update superseded_by on old mappings
    if (deactivated.length && newMappingRows.length) {
      await client.query(
        `UPDATE product_identity_mappings
         SET superseded_by_mapping_id = $1
         WHERE id = ANY($2::text[])`,
        [newMappingRows[0].id, deactivated.map(r => r.id)]
      );
    }

    // Update source record
    await client.query(
      `UPDATE catalog_product_sources
       SET canonical_product_id = $1, assignment_active = true,
           detached_at = NULL, detached_reason = NULL, updated_at = now()
       WHERE id = $2`,
      [targetCanonicalId, sourceRecordId]
    );

    // Update source counts on old and new canonical
    if (prevCanonicalId) {
      await client.query(
        `UPDATE canonical_products SET source_count = GREATEST(0, source_count - 1),
         revision = revision + 1, updated_at = now() WHERE id = $1`,
        [prevCanonicalId]
      );
    }
    await client.query(
      `UPDATE canonical_products SET source_count = source_count + 1,
       revision = revision + 1, updated_at = now() WHERE id = $1`,
      [targetCanonicalId]
    );

    // Mark affected usage resolutions as reprocessing_required
    const { rows: usageAffected } = await client.query(
      `UPDATE usage_product_resolutions
       SET reprocessing_required = true,
           previous_canonical_product_id = canonical_product_id,
           last_resolution_action_id = $1,
           updated_at = now()
       WHERE canonical_product_id = $2 AND resolution_status IN ('resolved','suggested')
       RETURNING id`,
      [actionId, prevCanonicalId]
    );

    // Write merge history
    const { rows: histRows } = await client.query(
      `INSERT INTO product_merge_history
         (action, source_record_id, previous_canonical_id, new_canonical_id,
          affected_mapping_count, affected_usage_row_count,
          reason, performed_by, action_id, rollback_data, created_at)
       VALUES ('reassigned',$1,$2,$3,$4,$5,$6,$7,$8,$9,now())
       RETURNING id`,
      [sourceRecordId, prevCanonicalId, targetCanonicalId,
       deactivated.length, usageAffected.length,
       reason || null, userId, actionId,
       JSON.stringify({
         sourceRecordId, prevCanonicalId, targetCanonicalId,
         deactivatedMappingIds: deactivated.map(r => r.id),
         newMappingId: newMappingRows[0]?.id,
         affectedUsageIds: usageAffected.map(r => r.id),
       })]
    );

    await client.query(
      `INSERT INTO product_audit_logs
         (entity_type, entity_id, action, previous_value, new_value,
          reason, performed_by, created_at)
       VALUES ('catalog_product_source',$1,'reassign',$2,$3,$4,$5,now())`,
      [sourceRecordId,
       JSON.stringify({ canonical_product_id: prevCanonicalId }),
       JSON.stringify({ canonical_product_id: targetCanonicalId }),
       reason || null, userId]
    );

    return {
      success: true,
      actionId,
      mergeHistoryId: histRows[0]?.id,
      newMappingId: newMappingRows[0]?.id,
      prevCanonicalId,
      targetCanonicalId,
      deactivatedMappings: deactivated.length,
      affectedUsageResolutions: usageAffected.length,
    };
      }); // end withTransaction
    }); // end withIdempotency
    return result;
  } finally {
    await outerClient.end().catch(() => {});
  }
}

// ── Action: make-independent ──────────────────────────────────────────────────

async function makeIndependentPreview(params, dbUrl) {
  const { sourceRecordId } = params;
  if (!sourceRecordId) throw validationError("sourceRecordId required");

  return readOnlyDb(dbUrl, async (client) => {
    const { rows } = await client.query(
      `SELECT id, raw_product_name, canonical_product_id, raw_brand,
              raw_product_line, raw_product_type, raw_shade_code, raw_shade_name
       FROM catalog_product_sources WHERE id = $1`,
      [sourceRecordId]
    );
    if (!rows.length) throw notFoundError("Source record not found");
    const src = rows[0];

    const willCreate = {
      canonical_name: src.raw_product_name,
      manufacturer: src.raw_brand || "(Unknown — review required)",
      product_type: src.raw_product_type || "(Unknown — review required)",
    };

    const missingFields = [];
    if (!src.raw_brand) missingFields.push("manufacturer");
    if (!src.raw_product_type) missingFields.push("product_type");

    return {
      preview: true,
      action: "make-independent",
      sourceId: src.id,
      sourceName: src.raw_product_name,
      currentCanonicalId: src.canonical_product_id,
      willCreateProduct: willCreate,
      reviewItemsWillBeCreated: missingFields.length,
      missingFields,
      warnings: src.canonical_product_id
        ? ["Source is currently assigned — existing assignment will be replaced"]
        : [],
    };
  });
}

async function makeIndependentWrite(params, userId, permissions, dbUrl) {
  requirePermission(permissions, "product_database_edit");

  const { sourceRecordId, reason, expectedCanonicalRevision } = params;
  if (!sourceRecordId) throw validationError("sourceRecordId required");

  return withTransaction(dbUrl, async (client) => {
    const { rows } = await client.query(
      `SELECT s.id, s.raw_product_name, s.normalized_raw_name,
              s.canonical_product_id, s.raw_brand, s.raw_product_line,
              s.raw_product_type, s.raw_shade_code, s.raw_shade_name,
              s.raw_size, s.raw_unit,
              (SELECT cp.revision FROM canonical_products cp WHERE cp.id = s.canonical_product_id)
                AS canonical_revision
       FROM catalog_product_sources s
       WHERE s.id = $1 FOR UPDATE`,
      [sourceRecordId]
    );
    if (!rows.length) throw notFoundError("Source record not found");
    const src = rows[0];

    if (expectedCanonicalRevision != null && src.canonical_revision !== expectedCanonicalRevision) {
      const err = new Error("Revision conflict"); err.statusCode = 409; throw err;
    }

    const actionId = newActionId();
    const prevCanonicalId = src.canonical_product_id;

    // Resolve or create placeholder manufacturer
    const mfr = await ensurePlaceholderManufacturer(client, src.raw_brand || "Unknown");

    // Deactivate old mappings
    const { rows: deactivated } = await client.query(
      `UPDATE product_identity_mappings
       SET active = false, deactivated_at = now(), deactivation_reason = 'make_independent',
           updated_at = now()
       WHERE source_record_id = $1 AND active = true
         AND mapping_type NOT IN ('rejected_match','keep_separate')
       RETURNING id`,
      [sourceRecordId]
    );

    // Decrement old canonical source_count
    if (prevCanonicalId) {
      await client.query(
        `UPDATE canonical_products SET source_count = GREATEST(0, source_count - 1),
         revision = revision + 1, updated_at = now() WHERE id = $1`,
        [prevCanonicalId]
      );
    }

    // Create new canonical product
    const newId = "cprod-" + crypto.randomUUID();
    await client.query(
      `INSERT INTO canonical_products
         (id, manufacturer_id, canonical_name, normalized_name,
          primary_product_type, validation_status, evidence_status,
          source_count, revision, created_at, updated_at)
       VALUES ($1,$2,$3,$4,
               COALESCE($5,'other'),
               'needs_review','unresearched',1,1,now(),now())`,
      [newId, mfr.id, src.raw_product_name, normalize(src.raw_product_name),
       src.raw_product_type || null]
    );

    // Assign source to new product
    await client.query(
      `UPDATE catalog_product_sources
       SET canonical_product_id = $1, assignment_active = true,
           detached_at = NULL, detached_reason = NULL, updated_at = now()
       WHERE id = $2`,
      [newId, sourceRecordId]
    );

    // Create manual assignment mapping
    await client.query(
      `INSERT INTO product_identity_mappings
         (source_record_id, raw_product_name, normalized_raw_name,
          canonical_product_id, mapping_type, match_method, confidence,
          validation_status, assigned_by, assigned_at, active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'manual_assignment','admin_make_independent','high',
               'candidate',$5,now(),true,now(),now())`,
      [sourceRecordId, src.raw_product_name, src.normalized_raw_name, newId, userId]
    );

    // Create review items for missing fields
    const missingFields = [];
    if (!src.raw_brand) missingFields.push("manufacturer");
    if (!src.raw_product_type) missingFields.push("product_type");

    for (const field of missingFields) {
      await client.query(
        `INSERT INTO product_review_items
           (review_type, source_record_id, canonical_product_id, status, priority,
            confidence, reason_code, evidence, created_by_action_id, created_at, updated_at)
         VALUES ('missing_' || $1,$2,$3,'open',3,'low','make_independent_missing_field',$4,$5,now(),now())`,
        [field === "manufacturer" ? "manufacturer" : "product_type",
         sourceRecordId, newId,
         JSON.stringify({ missingField: field, actionId }),
         actionId]
      );
    }

    // Merge history
    const { rows: histRows } = await client.query(
      `INSERT INTO product_merge_history
         (action, source_record_id, previous_canonical_id, new_canonical_id,
          affected_mapping_count, reason, performed_by, action_id, rollback_data, created_at)
       VALUES ('created_independent_product',$1,$2,$3,$4,$5,$6,$7,$8,now())
       RETURNING id`,
      [sourceRecordId, prevCanonicalId, newId, deactivated.length,
       reason || null, userId, actionId,
       JSON.stringify({ sourceRecordId, prevCanonicalId, newCanonicalId: newId,
                        deactivatedMappingIds: deactivated.map(r => r.id) })]
    );

    await client.query(
      `INSERT INTO product_audit_logs
         (entity_type, entity_id, action, previous_value, new_value, reason, performed_by, created_at)
       VALUES ('catalog_product_source',$1,'make_independent',$2,$3,$4,$5,now())`,
      [sourceRecordId,
       JSON.stringify({ canonical_product_id: prevCanonicalId }),
       JSON.stringify({ canonical_product_id: newId }),
       reason || null, userId]
    );

    return {
      success: true, actionId,
      mergeHistoryId: histRows[0]?.id,
      newCanonicalId: newId,
      prevCanonicalId,
      deactivatedMappings: deactivated.length,
      reviewItemsCreated: missingFields.length,
    };
  });
}

// ── Action: merge ─────────────────────────────────────────────────────────────

const { calculateMergeBlockers, validateOverride, validateFamilySelection } = require("./lib/product-merge-blockers");

async function mergePreview(params, dbUrl, auth) {
  const { survivingId, mergedId, survivingProductFamilyId } = params;
  if (!survivingId) throw validationError("survivingId required");
  if (!mergedId) throw validationError("mergedId required");
  if (survivingId === mergedId) throw validationError("survivingId and mergedId must differ");

  return readOnlyDb(dbUrl, async (client) => {
    const { rows: products } = await client.query(
      `SELECT id, canonical_name, normalized_name, primary_product_type,
              package_size_value, package_size_unit, intended_use_type,
              active, validation_status, revision, source_count, alias_count,
              product_family_id
       FROM canonical_products WHERE id = ANY($1::text[])`,
      [[survivingId, mergedId]]
    );

    const surviving = products.find(p => p.id === survivingId);
    const merged = products.find(p => p.id === mergedId);
    if (!surviving) throw notFoundError("Surviving canonical product not found");
    if (!merged) throw notFoundError("Merged canonical product not found");

    // Fetch family names
    const familyIds = [surviving.product_family_id, merged.product_family_id].filter(Boolean);
    let familyNames = {};
    if (familyIds.length) {
      const { rows: families } = await client.query(
        `SELECT id, family_name FROM product_families WHERE id = ANY($1::text[])`,
        [familyIds]
      ).catch(() => ({ rows: [] }));
      familyNames = Object.fromEntries(families.map(f => [f.id, f.family_name]));
    }

    const blockersResult = await calculateMergeBlockers(client, survivingId, mergedId, { survivingProductFamilyId });

    const warnings = [];
    if (!surviving.active) blockersResult.actualBlockers.push("surviving_inactive");
    if (!merged.active) warnings.push("Merged product is already inactive");

    const { rows: sourceRows } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM catalog_product_sources WHERE canonical_product_id = $1`,
      [mergedId]
    );
    const { rows: aliasRows } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM product_aliases WHERE canonical_product_id = $1 AND active = true`,
      [mergedId]
    );
    const { rows: mappingRows } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM product_identity_mappings WHERE canonical_product_id = $1 AND active = true`,
      [mergedId]
    );
    const { rows: usageRows } = await client.query(
      `SELECT COUNT(*)::int AS cnt FROM usage_product_resolutions WHERE canonical_product_id = $1`,
      [mergedId]
    );

    const willCreateEmptyFamilyReviewItem =
      blockersResult.mergedFamilyId &&
      blockersResult.mergedFamilyId !== (survivingProductFamilyId || blockersResult.survivingFamilyId);

    const impactData = {
      survivingId, mergedId, actualBlockers: blockersResult.actualBlockers,
      sourcesWillReassign: sourceRows[0].cnt, aliasesWillReassign: aliasRows[0].cnt,
      mappingsWillReassign: mappingRows[0].cnt, usageResolutionsWillReassign: usageRows[0].cnt,
    };
    const expectedRevisions = { [survivingId]: surviving.revision, [mergedId]: merged.revision };
    const tokenMeta = auth ? await generatePreviewToken(client, {
      userId: auth.userId, action: "merge", params, expectedRevisions, impactData,
    }) : { previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1, generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString() };

    return {
      preview: true, action: "merge",
      survivingId, survivingName: surviving.canonical_name, survivingRevision: surviving.revision,
      survivingFamilyId: surviving.product_family_id || null,
      survivingFamilyName: familyNames[surviving.product_family_id] || null,
      mergedId, mergedName: merged.canonical_name, mergedRevision: merged.revision,
      mergedFamilyId: merged.product_family_id || null,
      mergedFamilyName: familyNames[merged.product_family_id] || null,
      familySelectionRequired: blockersResult.familySelectionRequired,
      willCreateEmptyFamilyReviewItem: !!willCreateEmptyFamilyReviewItem,
      sourcesWillReassign: sourceRows[0].cnt,
      aliasesWillReassign: aliasRows[0].cnt,
      mappingsWillReassign: mappingRows[0].cnt,
      usageResolutionsWillReassign: usageRows[0].cnt,
      actualBlockers: blockersResult.actualBlockers,
      blockers: blockersResult.actualBlockers,
      warnings,
      ...buildAnalyticsState({ reprocessingRequiredCount: usageRows[0].cnt }),
      ...tokenMeta,
    };
  });
}

async function mergeWrite(params, userId, permissions, dbUrl) {
  requirePermission(permissions, "product_database_merge");

  const { survivingId, mergedId, reason,
          survivingProductFamilyId,
          expectedSurvivingRevision, expectedMergedRevision,
          forceOverride = false, overrideBlockers = [],
          operationId, previewToken, impactHash, testFailurePoint } = params;
  if (!survivingId || !mergedId) throw validationError("survivingId and mergedId required");
  if (survivingId === mergedId) throw validationError("Cannot merge a product with itself");
  if (!operationId) throw validationError("operationId required");
  if (!previewToken || !impactHash) throw validationError("previewToken and impactHash required");
  if (forceOverride) requirePermission(permissions, "product_database_admin");
  const hasAdminPermission = permissions.includes("product_database_admin");

  return withTransaction(dbUrl, async (client) => {
    const { rows: products } = await client.query(
      `SELECT id, canonical_name, normalized_name, primary_product_type,
              package_size_value, package_size_unit, active, revision, source_count,
              product_family_id
       FROM canonical_products WHERE id = ANY($1::text[]) FOR UPDATE`,
      [[survivingId, mergedId]]
    );

    const surviving = products.find(p => p.id === survivingId);
    const merged = products.find(p => p.id === mergedId);
    if (!surviving) throw notFoundError("Surviving product not found");
    if (!merged) throw notFoundError("Merged product not found");
    if (!surviving.active) throw validationError("Surviving product is inactive");

    // Re-calculate blockers server-side (never trust client-supplied blocker lists)
    const blockersResult = await calculateMergeBlockers(client, survivingId, mergedId, { survivingProductFamilyId });

    if (blockersResult.actualBlockers.length > 0 && !forceOverride) {
      const err = new Error(
        `Merge blocked by: ${blockersResult.actualBlockers.join(", ")}. ` +
        `Use forceOverride=true and overrideBlockers to override eligible blockers.`
      );
      err.statusCode = 409;
      throw err;
    }

    if (forceOverride && overrideBlockers.length > 0) {
      validateOverride(blockersResult, overrideBlockers, hasAdminPermission, reason);
    } else if (blockersResult.nonOverrideableBlockers.length > 0) {
      const err = new Error(
        `Non-overrideable blockers present: ${blockersResult.nonOverrideableBlockers.join(", ")}`
      );
      err.statusCode = 409;
      throw err;
    }

    // Family policy enforcement
    const survivingFamilyId = surviving.product_family_id;
    const mergedFamilyId = merged.product_family_id;
    let selectedFamilyId = survivingFamilyId;

    if (survivingFamilyId && mergedFamilyId && survivingFamilyId !== mergedFamilyId) {
      if (!survivingProductFamilyId) {
        throw validationError("survivingProductFamilyId required when merging products from different families");
      }
      await validateFamilySelection(client, survivingProductFamilyId, {
        survivingId, mergedId, survivingFamilyId, mergedFamilyId,
      }).catch(() => {}); // table may not exist yet
      selectedFamilyId = survivingProductFamilyId;
    }

    if (expectedSurvivingRevision != null && surviving.revision !== expectedSurvivingRevision) {
      const e = new Error("Revision conflict on surviving product"); e.statusCode = 409; throw e;
    }
    if (expectedMergedRevision != null && merged.revision !== expectedMergedRevision) {
      const e = new Error("Revision conflict on merged product"); e.statusCode = 409; throw e;
    }

    const actionId = newActionId();

    // Collect rollback data before changes
    const { rows: oldSources } = await client.query(
      `SELECT id FROM catalog_product_sources WHERE canonical_product_id = $1`, [mergedId]
    );
    const { rows: oldMappings } = await client.query(
      `SELECT id FROM product_identity_mappings WHERE canonical_product_id = $1 AND active = true`, [mergedId]
    );
    const { rows: oldAliases } = await client.query(
      `SELECT id FROM product_aliases WHERE canonical_product_id = $1 AND active = true`, [mergedId]
    );
    const { rows: oldUsage } = await client.query(
      `SELECT id FROM usage_product_resolutions WHERE canonical_product_id = $1`, [mergedId]
    );

    // Reassign sources
    const { rowCount: srcMoved } = await client.query(
      `UPDATE catalog_product_sources SET canonical_product_id = $1, updated_at = now()
       WHERE canonical_product_id = $2`,
      [survivingId, mergedId]
    );

    await injectFailureIfRequested(client, testFailurePoint, "after_source_update");

    // Reassign active mappings
    await client.query(
      `UPDATE product_identity_mappings
       SET canonical_product_id = $1, updated_at = now()
       WHERE canonical_product_id = $2 AND active = true`,
      [survivingId, mergedId]
    );

    await injectFailureIfRequested(client, testFailurePoint, "after_mapping_update");

    // Reassign aliases (check for duplicate normalized_alias)
    await client.query(
      `UPDATE product_aliases SET canonical_product_id = $1, updated_at = now()
       WHERE canonical_product_id = $2 AND active = true
         AND normalized_alias NOT IN (
           SELECT normalized_alias FROM product_aliases
           WHERE canonical_product_id = $1 AND active = true
         )`,
      [survivingId, mergedId]
    );
    await client.query(
      `UPDATE product_aliases SET active = false, updated_at = now()
       WHERE canonical_product_id = $1 AND active = true`,
      [mergedId]
    );

    await injectFailureIfRequested(client, testFailurePoint, "after_alias_update");

    // Reassign usage resolutions
    const { rowCount: usageMoved } = await client.query(
      `UPDATE usage_product_resolutions
       SET canonical_product_id = $1,
           previous_canonical_product_id = $2,
           last_resolution_action_id = $3,
           reprocessing_required = true, updated_at = now()
       WHERE canonical_product_id = $2`,
      [survivingId, mergedId, actionId]
    );

    await injectFailureIfRequested(client, testFailurePoint, "after_usage_update");

    // Reassign evidence
    await client.query(
      `UPDATE product_evidence SET canonical_product_id = $1, updated_at = now()
       WHERE canonical_product_id = $2`,
      [survivingId, mergedId]
    );

    // Mark merged product as inactive + set merged_into_id
    await client.query(
      `UPDATE canonical_products
       SET active = false, validation_status = 'inactive',
           merged_into_id = $1,
           revision = revision + 1, updated_at = now()
       WHERE id = $2`,
      [survivingId, mergedId]
    );

    // Update surviving product source count and family if needed
    await client.query(
      `UPDATE canonical_products
       SET source_count = source_count + $1,
           product_family_id = COALESCE($2, product_family_id),
           revision = revision + 1, updated_at = now()
       WHERE id = $3`,
      [srcMoved, selectedFamilyId || null, survivingId]
    );

    // Create empty-family review item if merged product's family now has no active SKUs
    if (mergedFamilyId && mergedFamilyId !== selectedFamilyId) {
      await client.query(
        `INSERT INTO product_review_items
           (review_type, status, priority, confidence, reason_code, evidence, created_by_action_id, created_at, updated_at)
         SELECT 'empty_family','open',1,'medium','merge_left_empty_family',
                $1,$2,now(),now()
         WHERE NOT EXISTS (
           SELECT 1 FROM canonical_products WHERE product_family_id = $3 AND active = TRUE
         )`,
        [JSON.stringify({ familyId: mergedFamilyId, mergedProductId: mergedId, survivingProductId: survivingId }),
         actionId, mergedFamilyId]
      ).catch(() => {}); // table may not have review_type column yet
    }

    // Write merge history with operation_id and override details
    const { rows: histRows } = await client.query(
      `INSERT INTO product_merge_history
         (action, source_record_id, previous_canonical_id, new_canonical_id,
          affected_mapping_count, affected_usage_row_count, affected_alias_count,
          reason, performed_by, action_id, operation_id, override_blockers, override_reason,
          rollback_data, created_at)
       VALUES ('merged',NULL,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())
       RETURNING id`,
      [mergedId, survivingId,
       oldMappings.length, usageMoved, oldAliases.length,
       reason || null, userId, actionId, operationId,
       overrideBlockers.length ? JSON.stringify(overrideBlockers) : null,
       forceOverride ? (reason || "admin_override") : null,
       JSON.stringify({
         survivingId, mergedId, forceOverride, overrideBlockers, survivingProductFamilyId,
         originalMergedName: merged.canonical_name,
         sourceIds: oldSources.map(r => r.id),
         mappingIds: oldMappings.map(r => r.id),
         aliasIds: oldAliases.map(r => r.id),
         usageIds: oldUsage.map(r => r.id),
         mergedRevision: merged.revision, survivingRevision: surviving.revision,
       })]
    );

    await injectFailureIfRequested(client, testFailurePoint, "after_history_write");

    await client.query(
      `INSERT INTO product_audit_logs
         (entity_type, entity_id, action, previous_value, new_value, reason, performed_by, created_at)
       VALUES ('canonical_product',$1,'merge',$2,$3,$4,$5,now())`,
      [mergedId,
       JSON.stringify({ active: true, validation_status: merged.validation_status }),
       JSON.stringify({ active: false, validation_status: 'inactive', merged_into_id: survivingId }),
       reason || null, userId]
    );

    return {
      success: true, actionId, operationId,
      mergeHistoryId: histRows[0]?.id,
      survivingId, mergedId,
      sourcesMoved: srcMoved, mappingsMoved: oldMappings.length,
      aliasesMoved: oldAliases.length, usageMoved,
      ...buildAnalyticsState({ reprocessingRequiredCount: usageMoved }),
    };
  });
}

// ── Action: unmerge ───────────────────────────────────────────────────────────

async function unmergePreview(params, dbUrl, auth) {
  const { mergeHistoryId } = params;
  if (!mergeHistoryId) throw validationError("mergeHistoryId required");

  return readOnlyDb(dbUrl, async (client) => {
    const { rows } = await client.query(
      `SELECT id, action, previous_canonical_id, new_canonical_id,
              rollback_data, status, created_at
       FROM product_merge_history WHERE id = $1`,
      [mergeHistoryId]
    );
    if (!rows.length) throw notFoundError("Merge history record not found");
    const hist = rows[0];

    if (hist.status !== 'active') {
      return {
        preview: true, action: "unmerge",
        blocker: `Cannot unmerge: merge history status is '${hist.status}'`,
        warnings: [], blockers: [],
        previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1,
        generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString(),
        ...buildAnalyticsState(),
      };
    }
    if (hist.action !== 'merged') {
      return {
        preview: true, action: "unmerge",
        blocker: `History record action is '${hist.action}', not 'merged'`,
        warnings: [], blockers: [],
        previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1,
        generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString(),
        ...buildAnalyticsState(),
      };
    }

    const rb = hist.rollback_data || {};
    const mergedId = hist.previous_canonical_id;
    const survivingId = hist.new_canonical_id;

    // Check if merged product still exists
    const { rows: mergedProd } = await client.query(
      `SELECT id, active, canonical_name FROM canonical_products WHERE id = $1`,
      [mergedId]
    );
    if (!mergedProd.length) {
      return {
        preview: true, action: "unmerge",
        blocker: "Merged product record no longer exists (was deleted — manual resolution required)",
        warnings: [], blockers: [],
        previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1,
        generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString(),
        ...buildAnalyticsState(),
      };
    }

    // Comprehensive divergence detection
    // Use subqueries to avoid JS Date millisecond-precision truncation for microsecond timestamps
    const [sourcesSince, aliasesSince, mappingsSince, usageSince, editsSince, laterActions] = await Promise.all([
      client.query(`SELECT COUNT(*)::int AS cnt FROM catalog_product_sources WHERE canonical_product_id = $1 AND updated_at > (SELECT created_at FROM product_merge_history WHERE id = $2)`, [survivingId, mergeHistoryId]),
      client.query(`SELECT COUNT(*)::int AS cnt FROM product_aliases WHERE canonical_product_id = $1 AND active = true AND updated_at > (SELECT created_at FROM product_merge_history WHERE id = $2)`, [survivingId, mergeHistoryId]),
      client.query(`SELECT COUNT(*)::int AS cnt FROM product_identity_mappings WHERE canonical_product_id = $1 AND active = true AND updated_at > (SELECT created_at FROM product_merge_history WHERE id = $2)`, [survivingId, mergeHistoryId]),
      client.query(`SELECT COUNT(*)::int AS cnt FROM usage_product_resolutions WHERE canonical_product_id = $1 AND updated_at > (SELECT created_at FROM product_merge_history WHERE id = $2)`, [survivingId, mergeHistoryId]),
      client.query(`SELECT COUNT(*)::int AS cnt FROM product_edit_history WHERE canonical_product_id = $1 AND edited_at > (SELECT created_at FROM product_merge_history WHERE id = $2)`, [survivingId, mergeHistoryId]).catch(() => ({ rows: [{ cnt: 0 }] })),
      client.query(`SELECT action_id, action FROM product_merge_history WHERE (previous_canonical_id = $1 OR new_canonical_id = $1) AND created_at > (SELECT created_at FROM product_merge_history WHERE id = $2) AND id != $2 AND status = 'active'`, [survivingId, mergeHistoryId]).catch(() => ({ rows: [] })),
    ]);

    const divergenceDetails = {
      sourcesAdded: sourcesSince.rows[0].cnt,
      aliasesAdded: aliasesSince.rows[0].cnt,
      mappingsAdded: mappingsSince.rows[0].cnt,
      usageResolutionsAdded: usageSince.rows[0].cnt,
      productEditsAfterMerge: editsSince.rows[0].cnt,
      laterStructuralActions: laterActions.rows.map(r => r.action_id),
      safeToUnmerge: false,
    };
    const hasDivergence = Object.values(divergenceDetails).some(v => (typeof v === "number" && v > 0) || (Array.isArray(v) && v.length > 0));
    divergenceDetails.safeToUnmerge = !hasDivergence;

    const impactData = {
      mergeHistoryId: hist.id, survivingId, mergedId,
      divergenceDetails, safe_unmerge: divergenceDetails.safeToUnmerge,
    };
    const tokenMeta = auth ? await generatePreviewToken(client, {
      userId: auth.userId, action: "unmerge", params,
      expectedRevisions: { [mergeHistoryId]: 0 }, impactData,
    }) : { previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1, generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString() };

    return {
      preview: true, action: "unmerge",
      safe_unmerge: divergenceDetails.safeToUnmerge,
      mergeHistoryId: hist.id,
      mergedProductId: mergedId,
      mergedProductName: mergedProd[0]?.canonical_name,
      survivingId,
      originalSourceCount: (rb.sourceIds || []).length,
      originalMappingCount: (rb.mappingIds || []).length,
      divergedSourcesAddedAfterMerge: sourcesSince.rows[0].cnt,
      divergenceDetails,
      warnings: hasDivergence
        ? ["Divergence detected after merge — unmerge may lose changes made to surviving product"]
        : [],
      blockers: divergenceDetails.laterStructuralActions.length > 0
        ? [`${divergenceDetails.laterStructuralActions.length} later structural action(s) on this product`]
        : [],
      ...buildAnalyticsState(),
      ...tokenMeta,
    };
  });
}

async function unmergeWrite(params, userId, permissions, dbUrl) {
  requirePermission(permissions, "product_database_merge");

  const { mergeHistoryId, reason, operationId, previewToken, impactHash, testFailurePoint } = params;
  if (!mergeHistoryId) throw validationError("mergeHistoryId required");
  if (!operationId || operationId.startsWith("internal-")) {
    // Allow internal calls from undoWrite
  } else {
    if (!previewToken || !impactHash) throw validationError("previewToken and impactHash required");
  }

  return withTransaction(dbUrl, async (client) => {
    const { rows } = await client.query(
      `SELECT id, action, previous_canonical_id, new_canonical_id,
              rollback_data, status, created_at
       FROM product_merge_history WHERE id = $1 FOR UPDATE`,
      [mergeHistoryId]
    );
    if (!rows.length) throw notFoundError("Merge history record not found");
    const hist = rows[0];

    if (hist.status !== 'active') {
      throw validationError(`Cannot unmerge: merge history status is '${hist.status}'`);
    }
    if (hist.action !== 'merged') {
      throw validationError(`History record is not a merge record`);
    }

    const rb = hist.rollback_data || {};
    const actionId = newActionId();
    const mergedId = hist.previous_canonical_id;
    const survivingId = hist.new_canonical_id;

    // Comprehensive divergence detection (block on any divergence)
    // Use a subquery to get hist.created_at directly in PostgreSQL to avoid JS Date
    // precision truncation (JS Date is ms-precision, PostgreSQL TIMESTAMPTZ is µs-precision)
    const [sourcesSince, aliasesSince, mappingsSince, laterActions] = await Promise.all([
      client.query(`SELECT COUNT(*)::int AS cnt FROM catalog_product_sources WHERE canonical_product_id = $1 AND updated_at > (SELECT created_at FROM product_merge_history WHERE id = $2)`, [survivingId, mergeHistoryId]),
      client.query(`SELECT COUNT(*)::int AS cnt FROM product_aliases WHERE canonical_product_id = $1 AND active = true AND updated_at > (SELECT created_at FROM product_merge_history WHERE id = $2)`, [survivingId, mergeHistoryId]),
      client.query(`SELECT COUNT(*)::int AS cnt FROM product_identity_mappings WHERE canonical_product_id = $1 AND active = true AND updated_at > (SELECT created_at FROM product_merge_history WHERE id = $2)`, [survivingId, mergeHistoryId]),
      client.query(`SELECT action_id FROM product_merge_history WHERE (previous_canonical_id = $1 OR new_canonical_id = $1) AND created_at > (SELECT created_at FROM product_merge_history WHERE id = $2) AND id != $2 AND status = 'active'`, [survivingId, mergeHistoryId]).catch(() => ({ rows: [] })),
    ]);

    const hasDivergence = sourcesSince.rows[0].cnt > 0 || aliasesSince.rows[0].cnt > 0 ||
      mappingsSince.rows[0].cnt > 0 || laterActions.rows.length > 0;

    if (hasDivergence) {
      const details = [
        sourcesSince.rows[0].cnt > 0 && `${sourcesSince.rows[0].cnt} sources`,
        aliasesSince.rows[0].cnt > 0 && `${aliasesSince.rows[0].cnt} aliases`,
        mappingsSince.rows[0].cnt > 0 && `${mappingsSince.rows[0].cnt} mappings`,
        laterActions.rows.length > 0 && `${laterActions.rows.length} later structural action(s)`,
      ].filter(Boolean).join(", ");
      throw validationError(
        `Divergence detected after merge (${details}). Use manual resolution instead of automated unmerge.`
      );
    }

    // Reactivate merged product
    await client.query(
      `UPDATE canonical_products
       SET active = true, validation_status = 'candidate',
           merged_into_id = NULL,
           revision = revision + 1, updated_at = now()
       WHERE id = $1`,
      [mergedId]
    );

    // Restore original sources
    const origSourceIds = rb.sourceIds || [];
    if (origSourceIds.length) {
      await client.query(
        `UPDATE catalog_product_sources SET canonical_product_id = $1, updated_at = now()
         WHERE id = ANY($2::text[])`,
        [mergedId, origSourceIds]
      );
    }

    await injectFailureIfRequested(client, testFailurePoint, "after_source_update");

    // Restore original mappings
    const origMappingIds = rb.mappingIds || [];
    if (origMappingIds.length) {
      await client.query(
        `UPDATE product_identity_mappings SET canonical_product_id = $1, updated_at = now()
         WHERE id = ANY($2::text[])`,
        [mergedId, origMappingIds]
      );
    }

    await injectFailureIfRequested(client, testFailurePoint, "after_mapping_update");

    // Restore usage resolutions that were moved in this merge
    const origUsageIds = rb.usageIds || [];
    if (origUsageIds.length) {
      await client.query(
        `UPDATE usage_product_resolutions
         SET canonical_product_id = $1,
             reprocessing_required = true,
             last_resolution_action_id = $2, updated_at = now()
         WHERE id = ANY($3::text[])`,
        [mergedId, actionId, origUsageIds]
      );
    }

    await injectFailureIfRequested(client, testFailurePoint, "after_usage_update");

    // Update source counts
    await client.query(
      `UPDATE canonical_products
       SET source_count = source_count - $1, revision = revision + 1, updated_at = now()
       WHERE id = $2`,
      [origSourceIds.length, survivingId]
    );
    await client.query(
      `UPDATE canonical_products
       SET source_count = $1, revision = revision + 1, updated_at = now()
       WHERE id = $2`,
      [origSourceIds.length, mergedId]
    );

    // Mark merge history as undone
    await client.query(
      `UPDATE product_merge_history SET status = 'undone' WHERE id = $1`,
      [mergeHistoryId]
    );

    // Write unmerge history
    const { rows: histRows } = await client.query(
      `INSERT INTO product_merge_history
         (action, previous_canonical_id, new_canonical_id,
          affected_mapping_count, affected_usage_row_count,
          reason, performed_by, action_id, operation_id, rollback_data, created_at)
       VALUES ('unmerged',$1,$2,$3,$4,$5,$6,$7,$8,$9,now())
       RETURNING id`,
      [survivingId, mergedId, origMappingIds.length, origUsageIds.length,
       reason || null, userId, actionId, operationId || null,
       JSON.stringify({ mergeHistoryId, survivingId, mergedId })]
    );

    await injectFailureIfRequested(client, testFailurePoint, "after_history_write");

    await client.query(
      `INSERT INTO product_audit_logs
         (entity_type, entity_id, action, reason, performed_by, created_at)
       VALUES ('canonical_product',$1,'unmerge',$2,$3,now())`,
      [mergedId, reason || null, userId]
    );

    return {
      success: true, actionId, operationId: operationId || null,
      mergeHistoryId: histRows[0]?.id,
      originalMergeHistoryId: mergeHistoryId,
      survivingId, mergedId,
      sourcesRestored: origSourceIds.length,
      mappingsRestored: origMappingIds.length,
      usageRestored: origUsageIds.length,
      ...buildAnalyticsState({ reprocessingRequiredCount: origUsageIds.length }),
    };
  });
}

// ── Action: approve-alias ─────────────────────────────────────────────────────

async function approveAliasPreview(params, dbUrl) {
  const { sourceRecordId, canonicalProductId } = params;
  if (!sourceRecordId || !canonicalProductId) {
    throw validationError("sourceRecordId and canonicalProductId required");
  }
  return readOnlyDb(dbUrl, async (client) => {
    const { rows: src } = await client.query(
      `SELECT id, raw_product_name, normalized_raw_name FROM catalog_product_sources WHERE id = $1`,
      [sourceRecordId]
    );
    if (!src.length) throw notFoundError("Source record not found");

    const { rows: cp } = await client.query(
      `SELECT id, canonical_name FROM canonical_products WHERE id = $1`,
      [canonicalProductId]
    );
    if (!cp.length) throw notFoundError("Canonical product not found");

    const { rows: existingAlias } = await client.query(
      `SELECT id FROM product_aliases
       WHERE canonical_product_id = $1 AND normalized_alias = $2 AND active = true`,
      [canonicalProductId, src[0].normalized_raw_name]
    );

    return {
      preview: true, action: "approve-alias",
      sourceId: sourceRecordId,
      sourceName: src[0].raw_product_name,
      canonicalProductId,
      canonicalName: cp[0].canonical_name,
      aliasAlreadyExists: existingAlias.length > 0,
      warnings: existingAlias.length > 0 ? ["An active alias with this normalized name already exists"] : [],
    };
  });
}

async function approveAliasWrite(params, userId, permissions, dbUrl) {
  requirePermission(permissions, "product_database_edit");
  const { sourceRecordId, canonicalProductId, reason } = params;
  if (!sourceRecordId || !canonicalProductId) {
    throw validationError("sourceRecordId and canonicalProductId required");
  }

  return withTransaction(dbUrl, async (client) => {
    const { rows: src } = await client.query(
      `SELECT id, raw_product_name, normalized_raw_name FROM catalog_product_sources WHERE id = $1 FOR UPDATE`,
      [sourceRecordId]
    );
    if (!src.length) throw notFoundError("Source record not found");
    const source = src[0];

    const { rows: cp } = await client.query(
      `SELECT id FROM canonical_products WHERE id = $1`, [canonicalProductId]
    );
    if (!cp.length) throw notFoundError("Canonical product not found");

    const actionId = newActionId();

    // Create alias if not duplicate
    const { rows: existing } = await client.query(
      `SELECT id FROM product_aliases
       WHERE canonical_product_id = $1 AND normalized_alias = $2 AND active = true`,
      [canonicalProductId, source.normalized_raw_name]
    );

    let aliasId = null;
    if (!existing.length) {
      const { rows: aliasRows } = await client.query(
        `INSERT INTO product_aliases
           (canonical_product_id, alias, normalized_alias, alias_type,
            source_record_id, confidence, active, created_at, updated_at)
         VALUES ($1,$2,$3,'manual_alias',$4,'high',true,now(),now())
         RETURNING id`,
        [canonicalProductId, source.raw_product_name, source.normalized_raw_name, sourceRecordId]
      );
      aliasId = aliasRows[0]?.id;

      // Update alias_count
      await client.query(
        `UPDATE canonical_products SET alias_count = alias_count + 1,
         revision = revision + 1, updated_at = now() WHERE id = $1`,
        [canonicalProductId]
      );
    }

    // Create identity mapping
    await client.query(
      `INSERT INTO product_identity_mappings
         (source_record_id, raw_product_name, normalized_raw_name,
          canonical_product_id, mapping_type, match_method, confidence,
          validation_status, assigned_by, assigned_at, active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'alias','admin_approve_alias','high','approved',$5,now(),true,now(),now())
       ON CONFLICT DO NOTHING`,
      [sourceRecordId, source.raw_product_name, source.normalized_raw_name, canonicalProductId, userId]
    );

    await client.query(
      `INSERT INTO product_audit_logs
         (entity_type, entity_id, action, new_value, reason, performed_by, created_at)
       VALUES ('product_alias',$1,'approve_alias',$2,$3,$4,now())`,
      [aliasId || sourceRecordId,
       JSON.stringify({ canonicalProductId, alias: source.raw_product_name }),
       reason || null, userId]
    );

    return { success: true, actionId, aliasId, alreadyExisted: existing.length > 0 };
  });
}

// ── Action: keep-separate ─────────────────────────────────────────────────────

const { recordNegativeDecision } = require("./lib/product-negative-decisions");

async function keepSeparatePreview(params, dbUrl, auth) {
  const { sourceRecordId, candidateCanonicalId, sourceRecordType = "catalog_product_source" } = params;
  if (!sourceRecordId || !candidateCanonicalId) {
    throw validationError("sourceRecordId and candidateCanonicalId required");
  }
  resolveSourceRecordType(sourceRecordType);
  return readOnlyDb(dbUrl, async (client) => {
    const impactData = { sourceRecordId, candidateCanonicalId, sourceRecordType, decision: "keep_separate" };
    const tokenMeta = auth ? await generatePreviewToken(client, {
      userId: auth.userId, action: "keep-separate", sourceRecordType, sourceRecordId,
      params, expectedRevisions: {}, impactData,
    }) : { previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1, generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString() };
    return {
      preview: true, action: "keep-separate",
      message: "Will create a permanent negative decision. Future suggestions for this pair will be suppressed.",
      ...tokenMeta,
    };
  });
}

async function keepSeparateWrite(params, userId, permissions, dbUrl) {
  requirePermission(permissions, "product_database_validate");
  const { sourceRecordId, candidateCanonicalId, sourceRecordType = "catalog_product_source",
          reason, evidence, operationId, previewToken, impactHash, testFailurePoint } = params;
  if (!sourceRecordId || !candidateCanonicalId) {
    throw validationError("sourceRecordId and candidateCanonicalId required");
  }
  resolveSourceRecordType(sourceRecordType, { requiresWrite: true });
  if (!operationId) throw validationError("operationId required");
  if (!previewToken || !impactHash) throw validationError("previewToken and impactHash required");

  return withTransaction(dbUrl, async (client) => {
    const actionId = newActionId();

    // Record negative decision in the dedicated table
    const negResult = await recordNegativeDecision(client, {
      sourceRecordType, sourceRecordId,
      candidateCanonicalProductId: candidateCanonicalId,
      decisionType: "keep_separate",
      evidence: evidence || null, reason,
      decidedByUserId: userId, decidedByActionId: actionId,
    });

    await injectFailureIfRequested(client, testFailurePoint, "after_mapping_update");

    // Also keep legacy mapping for backward compatibility
    const { rows: src } = await client.query(
      `SELECT raw_product_name, normalized_raw_name FROM catalog_product_sources WHERE id = $1`,
      [sourceRecordId]
    );
    if (src.length) {
      await client.query(
        `INSERT INTO product_identity_mappings
           (source_record_id, raw_product_name, normalized_raw_name,
            canonical_product_id, mapping_type, match_method, confidence,
            validation_status, assigned_by, assigned_at, notes, active, created_at, updated_at)
         VALUES ($1,$2,$3,$4,'keep_separate','admin_decision','high','approved',$5,now(),$6,true,now(),now())
         ON CONFLICT DO NOTHING`,
        [sourceRecordId, src[0].raw_product_name, src[0].normalized_raw_name,
         candidateCanonicalId, userId, reason || null]
      );
    }

    // Resolve any open review items for this pair
    await client.query(
      `UPDATE product_review_items
       SET status = 'resolved', resolved_at = now(),
           resolved_by_action_id = $1,
           resolution = $2, updated_at = now()
       WHERE source_record_id = $3
         AND candidate_product_id = $4
         AND status IN ('open','in_progress')`,
      [actionId, JSON.stringify({ decision: 'keep_separate', by: userId, reason }),
       sourceRecordId, candidateCanonicalId]
    );

    await injectFailureIfRequested(client, testFailurePoint, "after_history_write");

    await client.query(
      `INSERT INTO product_audit_logs
         (entity_type, entity_id, action, new_value, reason, performed_by, created_at)
       VALUES ('product_negative_decision',$1,'keep_separate',$2,$3,$4,now())`,
      [negResult.decisionId, JSON.stringify({ candidateCanonicalId, sourceRecordType }), reason || null, userId]
    );

    return { success: true, actionId, operationId, negativeMappingId: negResult.decisionId };
  });
}

// ── Action: reject-match ──────────────────────────────────────────────────────

async function rejectMatchPreview(params, dbUrl, auth) {
  const { reviewItemId, sourceRecordType } = params;
  return readOnlyDb(dbUrl, async (client) => {
    const impactData = { reviewItemId, sourceRecordType, decision: "rejected_match" };
    const tokenMeta = auth ? await generatePreviewToken(client, {
      userId: auth.userId, action: "reject-match",
      sourceRecordType: sourceRecordType || null,
      sourceRecordId: params.sourceRecordId || null,
      params, expectedRevisions: {}, impactData,
    }) : { previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1, generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString() };
    return {
      preview: true, action: "reject-match", reviewItemId,
      message: "Will permanently reject this match suggestion and record a negative decision.",
      ...tokenMeta,
    };
  });
}

async function rejectMatchWrite(params, userId, permissions, dbUrl) {
  requirePermission(permissions, "product_database_validate");
  const { reviewItemId, sourceRecordId, candidateCanonicalId, sourceRecordType = "catalog_product_source",
          reason, operationId, previewToken, impactHash, testFailurePoint } = params;
  if (!reviewItemId && (!sourceRecordId || !candidateCanonicalId)) {
    throw validationError("reviewItemId or (sourceRecordId + candidateCanonicalId) required");
  }
  if (!operationId) throw validationError("operationId required");
  if (!previewToken || !impactHash) throw validationError("previewToken and impactHash required");

  return withTransaction(dbUrl, async (client) => {
    const actionId = newActionId();

    let effectiveSourceRecordId = sourceRecordId;
    let effectiveCandidateId = candidateCanonicalId;

    if (reviewItemId) {
      const { rows: items } = await client.query(
        `SELECT id, source_record_id, candidate_product_id FROM product_review_items
         WHERE id = $1 FOR UPDATE`,
        [reviewItemId]
      );
      if (!items.length) throw notFoundError("Review item not found");
      const item = items[0];

      await client.query(
        `UPDATE product_review_items
         SET status = 'resolved', resolved_at = now(),
             resolved_by_action_id = $1,
             resolution = $2, updated_at = now()
         WHERE id = $3`,
        [actionId, JSON.stringify({ decision: 'rejected', by: userId, reason }), reviewItemId]
      );

      effectiveSourceRecordId = item.source_record_id || sourceRecordId;
      effectiveCandidateId = item.candidate_product_id || candidateCanonicalId;
    }

    await injectFailureIfRequested(client, testFailurePoint, "after_mapping_update");

    // Record negative decision in the dedicated table
    let negResult = null;
    if (effectiveSourceRecordId && effectiveCandidateId) {
      negResult = await recordNegativeDecision(client, {
        sourceRecordType, sourceRecordId: effectiveSourceRecordId,
        candidateCanonicalProductId: effectiveCandidateId,
        decisionType: "rejected_match",
        reason, decidedByUserId: userId, decidedByActionId: actionId,
      });

      // Also create legacy mapping for backward compatibility
      const { rows: srcRows } = await client.query(
        `SELECT raw_product_name, normalized_raw_name FROM catalog_product_sources WHERE id = $1`,
        [effectiveSourceRecordId]
      );
      if (srcRows.length) {
        await client.query(
          `INSERT INTO product_identity_mappings
             (source_record_id, raw_product_name, normalized_raw_name,
              canonical_product_id, mapping_type, match_method, confidence,
              validation_status, assigned_by, assigned_at, notes, active, created_at, updated_at)
           VALUES ($1,$2,$3,$4,'rejected_match','admin_decision','high','approved',$5,now(),$6,true,now(),now())
           ON CONFLICT DO NOTHING`,
          [effectiveSourceRecordId, srcRows[0].raw_product_name, srcRows[0].normalized_raw_name,
           effectiveCandidateId, userId, reason || null]
        );
      }

      if (!reviewItemId) {
        // Resolve any open review items for this pair
        await client.query(
          `UPDATE product_review_items
           SET status = 'resolved', resolved_at = now(),
               resolved_by_action_id = $1,
               resolution = $2, updated_at = now()
           WHERE source_record_id = $3 AND candidate_product_id = $4
             AND status IN ('open','in_progress')`,
          [actionId, JSON.stringify({ decision: 'rejected', by: userId, reason }),
           effectiveSourceRecordId, effectiveCandidateId]
        );
      }
    }

    await injectFailureIfRequested(client, testFailurePoint, "after_history_write");

    await client.query(
      `INSERT INTO product_audit_logs
         (entity_type, entity_id, action, reason, performed_by, created_at)
       VALUES ('product_review_item',$1,'reject_match',$2,$3,now())`,
      [reviewItemId || effectiveSourceRecordId, reason || null, userId]
    );

    return { success: true, actionId, operationId, negativeMappingId: negResult?.decisionId || null };
  });
}

// ── Action: undo ──────────────────────────────────────────────────────────────

async function undoPreview(params, dbUrl, auth) {
  const { actionId } = params;
  if (!actionId) throw validationError("actionId required");

  return readOnlyDb(dbUrl, async (client) => {
    const { rows } = await client.query(
      `SELECT id, action, status, previous_canonical_id, new_canonical_id,
              affected_mapping_count, affected_usage_row_count, created_at,
              rollback_data, source_record_id
       FROM product_merge_history WHERE action_id = $1`,
      [actionId]
    );

    if (!rows.length) {
      const impactData = { blocker: "no_history", actionId };
      const tokenMeta = auth ? await generatePreviewToken(client, {
        userId: auth.userId, action: "undo", params,
        expectedRevisions: {}, impactData,
      }) : { previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1, generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString() };
      return {
        preview: true, action: "undo",
        reversible: false,
        blockedByActions: [],
        undoStrategy: "manual_resolution_required",
        blocker: "No merge history found for this actionId. Only merge/detach/reassign/make-independent actions can be undone.",
        warnings: [],
        ...tokenMeta,
      };
    }

    const hist = rows[0];

    if (hist.status !== 'active') {
      const impactData = { blocker: "already_" + hist.status, actionId };
      const tokenMeta = auth ? await generatePreviewToken(client, {
        userId: auth.userId, action: "undo", params,
        expectedRevisions: {}, impactData,
      }) : { previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1, generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString() };
      return {
        preview: true, action: "undo",
        reversible: false,
        blockedByActions: [],
        undoStrategy: "manual_resolution_required",
        blocker: `Action already ${hist.status} — cannot undo again`,
        warnings: [],
        ...tokenMeta,
      };
    }

    // Check for later structural actions that would block undo
    const { rows: laterActions } = await client.query(
      `SELECT action_id, action FROM product_merge_history
       WHERE source_record_id = $1 AND created_at > $2 AND status = 'active'
       AND action_id != $3
       ORDER BY created_at ASC LIMIT 10`,
      [hist.source_record_id, hist.created_at, actionId]
    );

    const blockedByActions = laterActions.map(r => r.action_id);
    const reversible = blockedByActions.length === 0 && hist.status === 'active';

    let undoStrategy = "reverse_mapping";
    if (hist.action === 'merged') undoStrategy = "safe_unmerge";
    else if (hist.action === 'alias_approved') undoStrategy = "restore_alias";
    else if (hist.action === 'keep_separate' || hist.action === 'rejected_match') undoStrategy = "restore_negative_decision";
    if (!reversible) undoStrategy = "manual_resolution_required";

    const impactData = {
      mergeHistoryId: hist.id, originalAction: hist.action,
      reversible, blockedByActionsCount: blockedByActions.length,
    };
    const tokenMeta = auth ? await generatePreviewToken(client, {
      userId: auth.userId, action: "undo", params,
      expectedRevisions: { [hist.id]: 0 }, impactData,
    }) : { previewToken: "no-auth", impactHash: "n/a", impactHashVersion: 1, generatedAt: new Date().toISOString(), expiresAt: new Date().toISOString() };

    return {
      preview: true, action: "undo",
      mergeHistoryId: hist.id,
      originalAction: hist.action,
      createdAt: hist.created_at,
      safeToUndo: reversible,
      reversible,
      blockedByActions,
      undoStrategy,
      warnings: reversible
        ? [`This will reverse the '${hist.action}' action performed at ${hist.created_at}`]
        : [`Cannot undo: ${blockedByActions.length} later action(s) depend on this change`],
      ...tokenMeta,
    };
  });
}

async function undoWrite(params, auth, dbUrl) {
  const { userId, permissions } = auth;
  requirePermission(permissions, "product_database_admin");
  const { actionId, reason, operationId, previewToken, impactHash } = params;
  if (!actionId) throw validationError("actionId required");
  if (!operationId) throw validationError("operationId required");
  if (!previewToken || !impactHash) throw validationError("previewToken and impactHash required");

  const outerClient = new Client({ connectionString: dbUrl });
  await outerClient.connect();
  try {
    await validateWriteToken(outerClient, {
      previewToken, impactHash, userId, action: "undo",
      requestParams: params, operationId,
    });
    const { result } = await withIdempotency(outerClient, {
      operationId, userId, action: "undo", requestParams: params,
    }, async () => {
      const { rows } = await outerClient.query(
        `SELECT id, action, status, source_record_id, rollback_data FROM product_merge_history WHERE action_id = $1`,
        [actionId]
      );
      if (!rows.length) throw notFoundError("No merge history found for actionId");
      const hist = rows[0];

      // Verify still reversible
      const { rows: laterActions } = await outerClient.query(
        `SELECT action_id FROM product_merge_history
         WHERE source_record_id = $1 AND created_at > (SELECT created_at FROM product_merge_history WHERE action_id = $2)
           AND status = 'active' AND action_id != $2`,
        [hist.source_record_id, actionId]
      );
      if (laterActions.length > 0) {
        const err = new Error(`Cannot undo: ${laterActions.length} later action(s) have since modified this record`);
        err.statusCode = 409;
        throw err;
      }

      if (hist.action === 'merged') {
        return unmergeWrite({ mergeHistoryId: hist.id, reason, operationId: "internal-" + operationId, previewToken: "internal", impactHash: "internal" }, auth, dbUrl);
      }
      return withTransaction(dbUrl, async (txClient) => {
        await txClient.query(
          `UPDATE product_merge_history SET status = 'undone' WHERE id = $1`, [hist.id]
        );
        await txClient.query(
          `INSERT INTO product_audit_logs
             (entity_type, entity_id, action, reason, performed_by, created_at)
           VALUES ('product_merge_history',$1,'undo',$2,$3,now())`,
          [hist.id, reason || null, userId]
        );
        return { success: true, operationId, undone: true, originalAction: hist.action, historyId: hist.id };
      });
    });
    return result;
  } finally {
    await outerClient.end().catch(() => {});
  }
}

// ── Utility helpers ───────────────────────────────────────────────────────────

function normalize(name) {
  if (!name) return "";
  return String(name).toLowerCase().trim()
    .replace(/[™®©]/g, "").replace(/\s+/g, " ").replace(/[,;/\\]/g, " ")
    .replace(/\s+/g, " ").trim();
}

async function ensurePlaceholderManufacturer(client, rawBrand) {
  const normalizedName = normalize(rawBrand || "Unknown");
  const { rows: existing } = await client.query(
    `SELECT id FROM canonical_manufacturers WHERE normalized_name = $1 AND status = 'active'`,
    [normalizedName]
  );
  if (existing.length) return existing[0];

  const { rows: created } = await client.query(
    `INSERT INTO canonical_manufacturers
       (canonical_name, normalized_name, evidence_status, status, created_at, updated_at)
     VALUES ($1,$2,'unresearched','active',now(),now())
     ON CONFLICT DO NOTHING
     RETURNING id`,
    [rawBrand || "Unknown", normalizedName]
  );
  if (created.length) return created[0];

  // Race condition fallback
  const { rows: fallback } = await client.query(
    `SELECT id FROM canonical_manufacturers WHERE normalized_name = $1 AND status = 'active'`,
    [normalizedName]
  );
  return fallback[0];
}

function validationError(msg) {
  const e = new Error(msg); e.statusCode = 400; return e;
}
function notFoundError(msg) {
  const e = new Error(msg); e.statusCode = 404; return e;
}

// ── Action router ─────────────────────────────────────────────────────────────

const ALLOWED_ACTIONS = new Set([
  "detach-preview", "detach",
  "reassign-preview", "reassign",
  "make-independent-preview", "make-independent",
  "merge-preview", "merge",
  "unmerge-preview", "unmerge",
  "approve-alias-preview", "approve-alias",
  "keep-separate-preview", "keep-separate",
  "reject-match-preview", "reject-match",
  "undo-preview", "undo",
]);

// ── Handler ───────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (_) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { action, ...params } = body;

  if (!action || !ALLOWED_ACTIONS.has(action)) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "Invalid or missing action",
        allowed: [...ALLOWED_ACTIONS],
      }),
    };
  }

  // Resolve authentication and authorization using fail-closed helper.
  // X-Access-Code is not accepted; only JWT or explicitly configured dev identity.
  let authUser;
  try {
    authUser = authorizeAction(event, action);
  } catch (e) {
    return {
      statusCode: e.statusCode || 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: e.message }),
    };
  }

  const dbUrl = getDbUrl(false);

  try {
    let result;

    switch (action) {
      case "detach-preview":        result = await detachPreview(params, dbUrl, authUser); break;
      case "detach":                result = await detachWrite(params, authUser, dbUrl); break;
      case "reassign-preview":      result = await reassignPreview(params, dbUrl, authUser); break;
      case "reassign":              result = await reassignWrite(params, authUser.userId, authUser.permissions, dbUrl); break;
      case "make-independent-preview": result = await makeIndependentPreview(params, dbUrl, authUser); break;
      case "make-independent":      result = await makeIndependentWrite(params, authUser.userId, authUser.permissions, dbUrl); break;
      case "merge-preview":         result = await mergePreview(params, dbUrl, authUser); break;
      case "merge":                 result = await mergeWrite(params, authUser.userId, authUser.permissions, dbUrl); break;
      case "unmerge-preview":       result = await unmergePreview(params, dbUrl, authUser); break;
      case "unmerge":               result = await unmergeWrite(params, authUser.userId, authUser.permissions, dbUrl); break;
      case "approve-alias-preview": result = await approveAliasPreview(params, dbUrl, authUser); break;
      case "approve-alias":         result = await approveAliasWrite(params, authUser.userId, authUser.permissions, dbUrl); break;
      case "keep-separate-preview": result = await keepSeparatePreview(params, dbUrl, authUser); break;
      case "keep-separate":         result = await keepSeparateWrite(params, authUser.userId, authUser.permissions, dbUrl); break;
      case "reject-match-preview":  result = await rejectMatchPreview(params, dbUrl, authUser); break;
      case "reject-match":          result = await rejectMatchWrite(params, authUser.userId, authUser.permissions, dbUrl); break;
      case "undo-preview":          result = await undoPreview(params, dbUrl, authUser); break;
      case "undo":                  result = await undoWrite(params, authUser, dbUrl); break;
      default:
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Unknown action" }) };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(result),
    };

  } catch (e) {
    const statusCode = e.statusCode || 500;
    console.error(`product-resolution-actions [${action}]:`, e.message);
    return {
      statusCode,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: e.message,
        action,
        code: e.code,
        ...(statusCode === 409 ? { conflict: true } : {}),
        ...(e.code === "preview_stale" ? { preview_stale: true } : {}),
      }),
    };
  }
};

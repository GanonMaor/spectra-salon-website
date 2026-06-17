/**
 * netlify/functions/lib/product-negative-decisions.js
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4 Hardening: Separate negative decision model.
 *
 * Rules:
 *   - Negative decisions (rejected_match, keep_separate) are stored in
 *     product_negative_decisions, NOT in product_identity_mappings.
 *   - Future suggestions are suppressed when candidate and material evidence
 *     are unchanged (same evidence_hash and rules_version).
 *   - If evidence changes, a new review item is created referencing the
 *     prior decision. The old decision is preserved (not deleted).
 *   - Uniqueness constraint covers:
 *     (source_record_type, source_record_id, candidate_canonical_product_id,
 *      decision_type, evidence_hash, rules_version) WHERE active = TRUE.
 */

"use strict";

const crypto = require("crypto");

const CURRENT_RULES_VERSION = process.env.PRODUCT_RULES_VERSION || "1.0";

/**
 * Compute a deterministic evidence hash for a given evidence object.
 * @param {object|null} evidence
 * @returns {string}
 */
function computeEvidenceHash(evidence) {
  if (!evidence) return crypto.createHash("sha256").update("null").digest("hex");
  const sorted = JSON.stringify(evidence, Object.keys(evidence).sort());
  return crypto.createHash("sha256").update(sorted).digest("hex");
}

/**
 * Check if an active negative decision already exists for a source/candidate pair.
 *
 * Returns:
 *   { exists: false }
 *   { exists: true, decisionId, sameEvidence: boolean }
 *
 * @param {import('pg').Client} client
 * @param {{ sourceRecordType: string, sourceRecordId: string, candidateCanonicalProductId: string, decisionType: string, evidenceHash?: string, rulesVersion?: string }} opts
 */
async function findActiveNegativeDecision(client, opts) {
  const { sourceRecordType, sourceRecordId, candidateCanonicalProductId, decisionType, evidenceHash, rulesVersion } = opts;

  const { rows } = await client.query(
    `SELECT id, evidence_hash, rules_version FROM product_negative_decisions
     WHERE source_record_type = $1
       AND source_record_id = $2
       AND candidate_canonical_product_id = $3
       AND decision_type = $4
       AND active = TRUE
     ORDER BY created_at DESC LIMIT 1`,
    [sourceRecordType, sourceRecordId, candidateCanonicalProductId, decisionType]
  );

  if (!rows.length) return { exists: false };

  const existing = rows[0];
  const sameEvidence =
    existing.evidence_hash === (evidenceHash || null) &&
    existing.rules_version === (rulesVersion || CURRENT_RULES_VERSION);

  return { exists: true, decisionId: existing.id, sameEvidence };
}

/**
 * Check if a source/candidate pair should be suppressed based on negative decisions.
 *
 * @param {import('pg').Client} client
 * @param {{ sourceRecordType: string, sourceRecordId: string, candidateCanonicalProductId: string }} opts
 * @returns {Promise<{ suppressed: boolean, decisionId?: string, decisionType?: string }>}
 */
async function isSuppressed(client, opts) {
  const { sourceRecordType, sourceRecordId, candidateCanonicalProductId } = opts;
  const { rows } = await client.query(
    `SELECT id, decision_type FROM product_negative_decisions
     WHERE source_record_type = $1
       AND source_record_id = $2
       AND candidate_canonical_product_id = $3
       AND active = TRUE
     LIMIT 1`,
    [sourceRecordType, sourceRecordId, candidateCanonicalProductId]
  );
  if (!rows.length) return { suppressed: false };
  return { suppressed: true, decisionId: rows[0].id, decisionType: rows[0].decision_type };
}

/**
 * Record a negative decision. If an active decision already exists with the
 * same evidence, return it (idempotent). If evidence has changed, deactivate
 * the old decision, create a new one, and return a review-item creation request.
 *
 * @param {import('pg').Client} client
 * @param {{
 *   sourceRecordType: string,
 *   sourceRecordId: string,
 *   candidateCanonicalProductId: string,
 *   decisionType: "rejected_match" | "keep_separate",
 *   evidence?: object,
 *   reason?: string,
 *   decidedByUserId: string,
 *   decidedByActionId?: string,
 * }} opts
 * @returns {Promise<{ decisionId: string, created: boolean, evidenceChanged: boolean, oldDecisionId?: string }>}
 */
async function recordNegativeDecision(client, opts) {
  const { sourceRecordType, sourceRecordId, candidateCanonicalProductId, decisionType,
          evidence, reason, decidedByUserId, decidedByActionId } = opts;

  const evidenceHash = computeEvidenceHash(evidence || null);
  const rulesVersion = CURRENT_RULES_VERSION;

  // Check for existing active decision
  const existing = await findActiveNegativeDecision(client, {
    sourceRecordType, sourceRecordId, candidateCanonicalProductId, decisionType,
    evidenceHash, rulesVersion,
  });

  if (existing.exists && existing.sameEvidence) {
    // Idempotent: same decision with same evidence already exists
    return { decisionId: existing.decisionId, created: false, evidenceChanged: false };
  }

  let oldDecisionId = null;
  if (existing.exists && !existing.sameEvidence) {
    // Deactivate old decision (preserve as history)
    await client.query(
      `UPDATE product_negative_decisions
       SET active = FALSE, deactivated_at = NOW(),
           superseded_by_id = NULL
       WHERE id = $1`,
      [existing.decisionId]
    );
    oldDecisionId = existing.decisionId;
  }

  // Insert new decision
  const { rows } = await client.query(
    `INSERT INTO product_negative_decisions
       (source_record_type, source_record_id, candidate_canonical_product_id,
        decision_type, evidence_hash, rules_version, reason,
        decided_by_user_id, decided_by_action_id, active, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE,NOW())
     RETURNING id`,
    [sourceRecordType, sourceRecordId, candidateCanonicalProductId,
     decisionType, evidenceHash, rulesVersion, reason || null,
     decidedByUserId, decidedByActionId || null]
  );

  const newDecisionId = rows[0].id;

  // Update superseded_by_id on old decision if evidence changed
  if (oldDecisionId) {
    await client.query(
      `UPDATE product_negative_decisions SET superseded_by_id = $1 WHERE id = $2`,
      [newDecisionId, oldDecisionId]
    );
  }

  return {
    decisionId: newDecisionId,
    created: true,
    evidenceChanged: !!oldDecisionId,
    oldDecisionId,
  };
}

module.exports = {
  computeEvidenceHash,
  findActiveNegativeDecision,
  isSuppressed,
  recordNegativeDecision,
  CURRENT_RULES_VERSION,
};

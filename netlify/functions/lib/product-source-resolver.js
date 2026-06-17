/**
 * netlify/functions/lib/product-source-resolver.js
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4 Hardening: Typed source-record identity resolver.
 *
 * Rules:
 *   - Table names are NEVER accepted from the client.
 *   - The allowlist of supported source record types is defined server-side.
 *   - Unsupported source types return { supported: false } or throw for writes.
 *   - The resolver maps sourceRecordType → database table and column names.
 */

"use strict";

// ── Source record type definitions ────────────────────────────────────────────

const SOURCE_RECORD_TYPES = {
  catalog_product_source: {
    table: "catalog_product_sources",
    idColumn: "id",
    nameColumn: "raw_product_name",
    canonicalIdColumn: "canonical_product_id",
    assignmentActiveColumn: "assignment_active",
    supportsWrite: true,
  },
  legacy_product: {
    table: "legacy_products",
    idColumn: "id",
    nameColumn: "product_name",
    canonicalIdColumn: "canonical_product_id",
    assignmentActiveColumn: null,
    supportsWrite: true,
  },
  usage_value: {
    table: null,
    idColumn: null,
    nameColumn: null,
    canonicalIdColumn: null,
    assignmentActiveColumn: null,
    supportsWrite: false,
    reason: "usage_value is resolved through usage_product_resolutions, not direct assignment",
  },
  product_alias: {
    table: "product_aliases",
    idColumn: "id",
    nameColumn: "alias",
    canonicalIdColumn: "canonical_product_id",
    assignmentActiveColumn: null,
    supportsWrite: false,
    reason: "product_alias assignments are managed through approve-alias action only",
  },
};

/**
 * Validate and resolve a source record type string.
 * Returns the resolved config or throws a validation error.
 *
 * @param {string} sourceRecordType
 * @param {{ requiresWrite?: boolean }} [options]
 * @returns {{ table: string, idColumn: string, ... }}
 */
function resolveSourceRecordType(sourceRecordType, options = {}) {
  if (!sourceRecordType || typeof sourceRecordType !== "string") {
    const err = new Error("sourceRecordType is required");
    err.statusCode = 400;
    throw err;
  }

  const config = SOURCE_RECORD_TYPES[sourceRecordType];
  if (!config) {
    const err = new Error(
      `Unsupported sourceRecordType: ${JSON.stringify(sourceRecordType)}. ` +
      `Allowed: ${Object.keys(SOURCE_RECORD_TYPES).join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  if (options.requiresWrite && !config.supportsWrite) {
    const err = new Error(
      `Write operations are not supported for sourceRecordType "${sourceRecordType}". ` +
      (config.reason || "")
    );
    err.statusCode = 400;
    throw err;
  }

  return config;
}

/**
 * Look up a source record by type and ID in the database.
 * Returns the source row or throws 404.
 *
 * @param {import('pg').Client} client
 * @param {string} sourceRecordType
 * @param {string} sourceRecordId
 * @returns {Promise<object>}
 */
async function fetchSourceRecord(client, sourceRecordType, sourceRecordId) {
  const config = resolveSourceRecordType(sourceRecordType);
  if (!config.table) {
    const err = new Error(
      `Cannot fetch source record for type "${sourceRecordType}": no backing table`
    );
    err.statusCode = 400;
    throw err;
  }

  const { rows } = await client.query(
    `SELECT * FROM ${config.table} WHERE ${config.idColumn} = $1`,
    [sourceRecordId]
  );

  if (!rows.length) {
    const err = new Error(
      `Source record not found: type="${sourceRecordType}", id="${sourceRecordId}"`
    );
    err.statusCode = 404;
    throw err;
  }

  return rows[0];
}

/**
 * Get the canonical product ID currently assigned to a source record.
 * Returns null if the source record has no canonical assignment.
 *
 * @param {import('pg').Client} client
 * @param {string} sourceRecordType
 * @param {string} sourceRecordId
 * @returns {Promise<string|null>}
 */
async function getSourceCanonicalId(client, sourceRecordType, sourceRecordId) {
  const config = resolveSourceRecordType(sourceRecordType);
  if (!config.table || !config.canonicalIdColumn) return null;

  const { rows } = await client.query(
    `SELECT ${config.canonicalIdColumn} FROM ${config.table} WHERE ${config.idColumn} = $1`,
    [sourceRecordId]
  );
  return rows[0]?.[config.canonicalIdColumn] ?? null;
}

module.exports = {
  SOURCE_RECORD_TYPES,
  resolveSourceRecordType,
  fetchSourceRecord,
  getSourceCanonicalId,
};

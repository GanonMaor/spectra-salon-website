#!/usr/bin/env node
/**
 * scripts/seed-smoke-test-data.js
 * ─────────────────────────────────────────────────────────────────────────
 * Seeds deterministic data into TEST_DATABASE_URL for Playwright smoke tests.
 *
 * Creates:
 *   - One canonical manufacturer
 *   - Two canonical products (product A = merge target, product B = source product with source record)
 *   - One source record assigned to product A
 *   - One open review item of type potential_duplicate linking A and B
 *
 * All records use the prefix "smoke_" so they can be found by the smoke tests
 * and cleaned up easily.
 *
 * Usage:
 *   TEST_DATABASE_URL=postgresql://... node scripts/seed-smoke-test-data.js
 *   TEST_DATABASE_URL=postgresql://... node scripts/seed-smoke-test-data.js --cleanup
 */

const { Client } = require("pg");

const TEST_DB_URL = process.env.TEST_DATABASE_URL;
if (!TEST_DB_URL) {
  console.error("ERROR: TEST_DATABASE_URL is not set.");
  process.exit(1);
}

const PROD_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "";
if (TEST_DB_URL === PROD_URL) {
  console.error("ERROR: TEST_DATABASE_URL equals production database URL. Refusing to seed.");
  process.exit(1);
}

const SMOKE_PREFIX = "smoke_m4_";
const CLEANUP = process.argv.includes("--cleanup");

async function run() {
  const client = new Client({ connectionString: TEST_DB_URL });
  await client.connect();
  try {
    if (CLEANUP) {
      await cleanup(client);
      console.log("Cleanup complete.");
      return;
    }
    await seed(client);
  } finally {
    await client.end();
  }
}

async function cleanup(client) {
  await client.query(`DELETE FROM product_review_items WHERE created_by_action_id LIKE $1`, [`${SMOKE_PREFIX}%`]);
  await client.query(`DELETE FROM product_identity_mappings WHERE source_record_id IN (SELECT id FROM catalog_product_sources WHERE source_system LIKE $1)`, [`${SMOKE_PREFIX}%`]);
  await client.query(`DELETE FROM product_aliases WHERE source_record_id IN (SELECT id FROM catalog_product_sources WHERE source_system LIKE $1)`, [`${SMOKE_PREFIX}%`]);
  await client.query(`DELETE FROM catalog_product_sources WHERE source_system LIKE $1`, [`${SMOKE_PREFIX}%`]);
  await client.query(`DELETE FROM canonical_products WHERE canonical_name LIKE $1`, [`${SMOKE_PREFIX}%`]);
  await client.query(`DELETE FROM canonical_manufacturers WHERE canonical_name LIKE $1`, [`${SMOKE_PREFIX}%`]);
  console.log("Smoke test data cleaned up.");
}

async function seed(client) {
  // Idempotent: clean up first so re-runs are safe
  await cleanup(client);

  // 1. Manufacturer
  const { rows: mfrRows } = await client.query(
    `INSERT INTO canonical_manufacturers (canonical_name, normalized_name, evidence_status, status)
     VALUES ($1, $2, 'unresearched', 'active') RETURNING id`,
    [`${SMOKE_PREFIX}Brand`, `${SMOKE_PREFIX}brand`]
  );
  const mfrId = mfrRows[0].id;
  console.log("Manufacturer:", mfrId);

  // 2. Canonical product A (the surviving product to reassign TO)
  const { rows: cpARows } = await client.query(
    `INSERT INTO canonical_products
       (manufacturer_id, canonical_name, normalized_name, primary_product_type, validation_status, evidence_status, active, source_count, revision)
     VALUES ($1, $2, $3, 'hair_color', 'approved', 'verified', true, 0, 1) RETURNING id`,
    [mfrId, `${SMOKE_PREFIX}Product A`, `${SMOKE_PREFIX}product a`]
  );
  const canonicalAId = cpARows[0].id;
  console.log("Canonical A (reassign target):", canonicalAId);

  // 3. Canonical product B (the product that has a source record assigned)
  const { rows: cpBRows } = await client.query(
    `INSERT INTO canonical_products
       (manufacturer_id, canonical_name, normalized_name, primary_product_type, validation_status, evidence_status, active, source_count, revision)
     VALUES ($1, $2, $3, 'hair_color', 'approved', 'verified', true, 1, 1) RETURNING id`,
    [mfrId, `${SMOKE_PREFIX}Product B`, `${SMOKE_PREFIX}product b`]
  );
  const canonicalBId = cpBRows[0].id;
  console.log("Canonical B (source product):", canonicalBId);

  // 4. Source record assigned to product B
  const { rows: srcRows } = await client.query(
    `INSERT INTO catalog_product_sources
       (source_system, raw_product_name, normalized_raw_name, raw_brand, canonical_product_id, assignment_active)
     VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
    [
      `${SMOKE_PREFIX}system`,
      `${SMOKE_PREFIX}Source Record`,
      `${SMOKE_PREFIX}source record`,
      `${SMOKE_PREFIX}Brand`,
      canonicalBId,
    ]
  );
  const sourceId = srcRows[0].id;
  console.log("Source record:", sourceId);

  // 5. Active identity mapping
  const { rows: mapRows } = await client.query(
    `INSERT INTO product_identity_mappings
       (source_record_id, raw_product_name, normalized_raw_name, canonical_product_id,
        mapping_type, match_method, confidence, validation_status, active)
     VALUES ($1, $2, $3, $4, 'exact_match', 'system', 'high', 'approved', true) RETURNING id`,
    [
      sourceId,
      `${SMOKE_PREFIX}Source Record`,
      `${SMOKE_PREFIX}source record`,
      canonicalBId,
    ]
  );
  const mappingId = mapRows[0].id;
  console.log("Mapping:", mappingId);

  // 6. Open review item (potential_duplicate: A vs B) for blocked-merge test
  const { rows: revRows } = await client.query(
    `INSERT INTO product_review_items
       (review_type, source_record_id, canonical_product_id, candidate_product_id,
        status, priority, confidence, reason_code, evidence, created_by_action_id)
     VALUES ('potential_duplicate', $1, $2, $3, 'open', 2, 'high', 'auto_duplicate_detected',
             '{"auto": true}'::jsonb, $4) RETURNING id`,
    [sourceId, canonicalBId, canonicalAId, `${SMOKE_PREFIX}seed`]
  );
  const reviewItemId = revRows[0].id;
  console.log("Review item:", reviewItemId);

  // Output IDs as JSON for Playwright to consume
  const seedData = {
    mfrId,
    canonicalAId,
    canonicalBId,
    sourceId,
    mappingId,
    reviewItemId,
  };

  // Write seed data to a temp file so Playwright can read it
  const fs = require("fs");
  const path = require("path");
  const outPath = path.join(__dirname, "../tests/smoke/.seed-data.json");
  fs.writeFileSync(outPath, JSON.stringify(seedData, null, 2));
  console.log("Seed data written to", outPath);
  console.log(JSON.stringify(seedData, null, 2));
}

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

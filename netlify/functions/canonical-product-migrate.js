/**
 * netlify/functions/canonical-product-migrate.js
 * ─────────────────────────────────────────────────────────────────────────
 * Applies migration 020_canonical_product_database.sql to Neon.
 *
 * POST /.netlify/functions/canonical-product-migrate
 * Header: X-Access-Code: <USAGE_IMPORT_ACCESS_CODE>
 *
 * This function reads and executes the SQL migration file idempotently
 * (CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS patterns).
 * It is safe to call multiple times — already-existing objects are skipped.
 *
 * Milestone 1 — Database Foundation
 */
"use strict";

const { neon } = require("@neondatabase/serverless");
const fs   = require("fs");
const path = require("path");

const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const accessCode = event.headers?.["x-access-code"];
  if (accessCode !== ACCESS_CODE) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: "NEON_DATABASE_URL not configured" }),
    };
  }

  try {
    const sql = neon(databaseUrl);
    const results = [];
    const warnings = [];

    // ── Step 0: Ensure pg_trgm is available ──────────────────────────────
    try {
      await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
      results.push({ step: "pg_trgm extension", status: "ok" });
    } catch (err) {
      warnings.push("pg_trgm extension may not be available: " + err.message);
    }

    // ── Step 1: canonical_manufacturers ──────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS canonical_manufacturers (
        id               TEXT PRIMARY KEY DEFAULT 'mfr-' || gen_random_uuid()::text,
        canonical_name   TEXT NOT NULL,
        normalized_name  TEXT NOT NULL,
        display_name     TEXT,
        country_of_origin TEXT,
        website          TEXT,
        evidence_status  TEXT NOT NULL DEFAULT 'unresearched',
        status           TEXT NOT NULL DEFAULT 'active',
        revision         INTEGER NOT NULL DEFAULT 1,
        created_at       TIMESTAMPTZ DEFAULT now(),
        updated_at       TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_manufacturer_evidence_status CHECK (
          evidence_status IN ('verified','partially_verified','inferred','unresearched','conflicting')
        ),
        CONSTRAINT chk_manufacturer_status CHECK (
          status IN ('active','inactive','merged')
        )
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uidx_manufacturer_normalized_active
        ON canonical_manufacturers (normalized_name)
        WHERE status = 'active'
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_manufacturer_status ON canonical_manufacturers (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_manufacturer_canonical_name ON canonical_manufacturers (canonical_name)`;
    results.push({ step: "canonical_manufacturers", status: "ok" });

    // ── Step 2: product_lines ─────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_lines (
        id               TEXT PRIMARY KEY DEFAULT 'pl-' || gen_random_uuid()::text,
        manufacturer_id  TEXT NOT NULL REFERENCES canonical_manufacturers(id),
        canonical_name   TEXT NOT NULL,
        normalized_name  TEXT NOT NULL,
        region           TEXT,
        evidence_status  TEXT NOT NULL DEFAULT 'unresearched',
        status           TEXT NOT NULL DEFAULT 'active',
        revision         INTEGER NOT NULL DEFAULT 1,
        created_at       TIMESTAMPTZ DEFAULT now(),
        updated_at       TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_product_line_evidence_status CHECK (
          evidence_status IN ('verified','partially_verified','inferred','unresearched','conflicting')
        ),
        CONSTRAINT chk_product_line_status CHECK (
          status IN ('active','inactive','discontinued')
        )
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uidx_product_line_mfr_normalized_region
        ON product_lines (manufacturer_id, normalized_name, COALESCE(region, ''))
        WHERE status = 'active'
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_line_manufacturer ON product_lines (manufacturer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_line_status ON product_lines (status)`;
    results.push({ step: "product_lines", status: "ok" });

    // ── Step 3: product_families ──────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_families (
        id                   TEXT PRIMARY KEY DEFAULT 'fam-' || gen_random_uuid()::text,
        manufacturer_id      TEXT NOT NULL REFERENCES canonical_manufacturers(id),
        product_line_id      TEXT REFERENCES product_lines(id),
        canonical_name       TEXT NOT NULL,
        normalized_name      TEXT NOT NULL,
        primary_product_type TEXT NOT NULL DEFAULT 'other',
        evidence_status      TEXT NOT NULL DEFAULT 'unresearched',
        status               TEXT NOT NULL DEFAULT 'active',
        revision             INTEGER NOT NULL DEFAULT 1,
        created_at           TIMESTAMPTZ DEFAULT now(),
        updated_at           TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_product_family_status CHECK (
          status IN ('active','inactive','discontinued')
        )
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uidx_product_family_mfr_line_normalized
        ON product_families (manufacturer_id, COALESCE(product_line_id,''), normalized_name)
        WHERE status = 'active'
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_family_manufacturer ON product_families (manufacturer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_family_product_line ON product_families (product_line_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_family_status ON product_families (status)`;
    results.push({ step: "product_families", status: "ok" });

    // ── Step 4: canonical_products ────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS canonical_products (
        id                    TEXT PRIMARY KEY DEFAULT 'cprod-' || gen_random_uuid()::text,
        product_family_id     TEXT REFERENCES product_families(id),
        manufacturer_id       TEXT NOT NULL REFERENCES canonical_manufacturers(id),
        product_line_id       TEXT REFERENCES product_lines(id),
        canonical_name        TEXT NOT NULL,
        normalized_name       TEXT NOT NULL,
        primary_product_type  TEXT NOT NULL DEFAULT 'other',
        product_category      TEXT,
        product_subcategory   TEXT,
        package_size_value    NUMERIC(10,3),
        package_size_unit     TEXT,
        package_count         INTEGER,
        unit_size_value       NUMERIC(10,3),
        unit_size_unit        TEXT,
        original_package_text TEXT,
        packaging_type        TEXT,
        intended_use_type     TEXT,
        professional_use      BOOLEAN NOT NULL DEFAULT false,
        retail_use            BOOLEAN NOT NULL DEFAULT false,
        technical_use         BOOLEAN NOT NULL DEFAULT false,
        compatible_system     TEXT,
        active                BOOLEAN NOT NULL DEFAULT true,
        evidence_status       TEXT NOT NULL DEFAULT 'unresearched',
        validation_status     TEXT NOT NULL DEFAULT 'candidate',
        color_depth_level     NUMERIC(4,2),
        color_tone_code       TEXT,
        color_tone_family     TEXT,
        neutralization_target TEXT,
        source_count          INTEGER NOT NULL DEFAULT 0,
        alias_count           INTEGER NOT NULL DEFAULT 0,
        review_item_count     INTEGER NOT NULL DEFAULT 0,
        revision              INTEGER NOT NULL DEFAULT 1,
        created_at            TIMESTAMPTZ DEFAULT now(),
        updated_at            TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_canonical_product_evidence_status CHECK (
          evidence_status IN ('verified','partially_verified','inferred','unresearched','conflicting')
        ),
        CONSTRAINT chk_canonical_product_validation_status CHECK (
          validation_status IN ('approved','candidate','needs_review','rejected','inactive')
        )
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_manufacturer ON canonical_products (manufacturer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_family ON canonical_products (product_family_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_line ON canonical_products (product_line_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_validation ON canonical_products (validation_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_active ON canonical_products (active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_type ON canonical_products (primary_product_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_compound_search ON canonical_products (manufacturer_id, primary_product_type, validation_status, active)`;
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_name_trgm ON canonical_products USING gin (normalized_name gin_trgm_ops) WHERE active = true`;
    } catch (err) {
      warnings.push("Trigram index skipped (pg_trgm may not be available): " + err.message);
    }
    results.push({ step: "canonical_products", status: "ok" });

    // ── Step 5: product_import_batches ────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_import_batches (
        id                TEXT PRIMARY KEY DEFAULT 'batch-' || gen_random_uuid()::text,
        source_type       TEXT NOT NULL,
        source_file       TEXT,
        source_hash       TEXT,
        processor_version TEXT NOT NULL DEFAULT '1.0.0',
        rules_version     TEXT NOT NULL DEFAULT '1.0.0',
        status            TEXT NOT NULL DEFAULT 'created',
        started_at        TIMESTAMPTZ,
        completed_at      TIMESTAMPTZ,
        created_by        TEXT,
        total_rows        INTEGER NOT NULL DEFAULT 0,
        valid_rows        INTEGER NOT NULL DEFAULT 0,
        invalid_rows      INTEGER NOT NULL DEFAULT 0,
        inserted_rows     INTEGER NOT NULL DEFAULT 0,
        updated_rows      INTEGER NOT NULL DEFAULT 0,
        unchanged_rows    INTEGER NOT NULL DEFAULT 0,
        conflict_rows     INTEGER NOT NULL DEFAULT 0,
        review_rows       INTEGER NOT NULL DEFAULT 0,
        summary           JSONB,
        created_at        TIMESTAMPTZ DEFAULT now(),
        updated_at        TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_import_batch_status CHECK (
          status IN (
            'created','profiling','validated','preview_ready','approved',
            'importing','completed','completed_with_warnings','failed','rolled_back'
          )
        )
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uidx_import_batch_file_hash_active
        ON product_import_batches (source_hash)
        WHERE source_hash IS NOT NULL
          AND status NOT IN ('rolled_back','failed')
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_import_batch_status ON product_import_batches (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_import_batch_created ON product_import_batches (created_at DESC)`;
    results.push({ step: "product_import_batches", status: "ok" });

    // ── Step 6: catalog_product_sources ───────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS catalog_product_sources (
        id                   TEXT PRIMARY KEY DEFAULT 'src-' || gen_random_uuid()::text,
        source_system        TEXT NOT NULL,
        source_product_id    TEXT,
        source_file          TEXT,
        source_sheet         TEXT,
        source_row_id        TEXT,
        import_batch_id      TEXT REFERENCES product_import_batches(id),
        raw_product_name     TEXT NOT NULL,
        normalized_raw_name  TEXT NOT NULL,
        raw_brand            TEXT,
        raw_product_line     TEXT,
        raw_shade_code       TEXT,
        raw_shade_name       TEXT,
        raw_size             TEXT,
        raw_unit             TEXT,
        raw_barcode          TEXT,
        raw_catalog_number   TEXT,
        raw_product_type     TEXT,
        raw_active_status    TEXT,
        raw_payload          JSONB NOT NULL DEFAULT '{}',
        canonical_product_id TEXT REFERENCES canonical_products(id),
        created_at           TIMESTAMPTZ DEFAULT now(),
        updated_at           TIMESTAMPTZ DEFAULT now()
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uidx_catalog_source_system_product_id
        ON catalog_product_sources (source_system, source_product_id)
        WHERE source_product_id IS NOT NULL
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uidx_catalog_source_batch_row
        ON catalog_product_sources (import_batch_id, source_row_id)
        WHERE import_batch_id IS NOT NULL AND source_row_id IS NOT NULL
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_catalog_source_canonical_product ON catalog_product_sources (canonical_product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_catalog_source_import_batch ON catalog_product_sources (import_batch_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_catalog_source_raw_name ON catalog_product_sources (normalized_raw_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_catalog_source_barcode ON catalog_product_sources (raw_barcode) WHERE raw_barcode IS NOT NULL`;
    results.push({ step: "catalog_product_sources", status: "ok" });

    // ── Step 7: product_identity_mappings ─────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_identity_mappings (
        id                   TEXT PRIMARY KEY DEFAULT 'map-' || gen_random_uuid()::text,
        source_type          TEXT NOT NULL,
        source_record_id     TEXT REFERENCES catalog_product_sources(id),
        raw_product_name     TEXT NOT NULL,
        normalized_raw_name  TEXT NOT NULL,
        canonical_product_id TEXT REFERENCES canonical_products(id),
        mapping_type         TEXT NOT NULL,
        match_method         TEXT NOT NULL,
        confidence           TEXT NOT NULL DEFAULT 'low',
        validation_status    TEXT NOT NULL DEFAULT 'candidate',
        assigned_by          TEXT,
        assigned_at          TIMESTAMPTZ,
        import_batch_id      TEXT REFERENCES product_import_batches(id),
        rules_version        TEXT,
        notes                TEXT,
        active               BOOLEAN NOT NULL DEFAULT true,
        created_at           TIMESTAMPTZ DEFAULT now(),
        updated_at           TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_mapping_type CHECK (
          mapping_type IN (
            'exact_match','normalized_match','barcode_match','catalog_number_match',
            'alias','manual_assignment','approved_duplicate','usage_alias',
            'historical_alias','rejected_match','keep_separate'
          )
        ),
        CONSTRAINT chk_mapping_confidence CHECK (confidence IN ('high','medium','low')),
        CONSTRAINT chk_mapping_validation_status CHECK (
          validation_status IN ('approved','candidate','needs_review','rejected','inactive')
        )
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_mapping_normalized_raw_name
        ON product_identity_mappings (normalized_raw_name)
        WHERE active = true
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_mapping_source_record ON product_identity_mappings (source_record_id) WHERE source_record_id IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_mapping_canonical_product ON product_identity_mappings (canonical_product_id) WHERE canonical_product_id IS NOT NULL`;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uidx_mapping_source_canonical_active
        ON product_identity_mappings (source_record_id, canonical_product_id)
        WHERE source_record_id IS NOT NULL
          AND canonical_product_id IS NOT NULL
          AND active = true
          AND mapping_type NOT IN ('rejected_match','keep_separate')
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_mapping_active_type ON product_identity_mappings (active, mapping_type)`;
    results.push({ step: "product_identity_mappings", status: "ok" });

    // ── Step 8: product_aliases ───────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_aliases (
        id                   TEXT PRIMARY KEY DEFAULT 'alias-' || gen_random_uuid()::text,
        canonical_product_id TEXT NOT NULL REFERENCES canonical_products(id) ON DELETE RESTRICT,
        alias                TEXT NOT NULL,
        normalized_alias     TEXT NOT NULL,
        alias_type           TEXT NOT NULL DEFAULT 'manual_alias',
        source_record_id     TEXT REFERENCES catalog_product_sources(id),
        confidence           TEXT NOT NULL DEFAULT 'medium',
        active               BOOLEAN NOT NULL DEFAULT true,
        created_at           TIMESTAMPTZ DEFAULT now(),
        updated_at           TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_alias_confidence CHECK (confidence IN ('high','medium','low'))
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_product_normalized_active
        ON product_aliases (canonical_product_id, normalized_alias)
        WHERE active = true
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_alias_normalized ON product_aliases (normalized_alias) WHERE active = true`;
    await sql`CREATE INDEX IF NOT EXISTS idx_alias_canonical_product ON product_aliases (canonical_product_id)`;
    results.push({ step: "product_aliases", status: "ok" });

    // ── Step 9: usage_product_resolutions ─────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS usage_product_resolutions (
        id                       TEXT PRIMARY KEY DEFAULT 'ures-' || gen_random_uuid()::text,
        usage_report_id          TEXT NOT NULL,
        usage_row_id             TEXT,
        raw_product_name         TEXT NOT NULL,
        normalized_raw_name      TEXT NOT NULL,
        legacy_source_product_id TEXT,
        canonical_product_id     TEXT REFERENCES canonical_products(id),
        mapping_id               TEXT REFERENCES product_identity_mappings(id),
        match_method             TEXT,
        confidence               TEXT NOT NULL DEFAULT 'none',
        resolution_status        TEXT NOT NULL DEFAULT 'unresolved',
        product_truth_revision   TEXT,
        created_at               TIMESTAMPTZ DEFAULT now(),
        updated_at               TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_usage_resolution_status CHECK (
          resolution_status IN ('resolved','suggested','unresolved','rejected')
        ),
        CONSTRAINT chk_usage_resolution_confidence CHECK (
          confidence IN ('high','medium','low','none')
        )
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_usage_resolution_report ON usage_product_resolutions (usage_report_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_usage_resolution_canonical_product ON usage_product_resolutions (canonical_product_id) WHERE canonical_product_id IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_usage_resolution_status ON usage_product_resolutions (resolution_status)`;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS uidx_usage_resolution_report_row
        ON usage_product_resolutions (usage_report_id, usage_row_id)
        WHERE usage_row_id IS NOT NULL
    `;
    results.push({ step: "usage_product_resolutions", status: "ok" });

    // ── Step 10: product_evidence ─────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_evidence (
        id                       TEXT PRIMARY KEY DEFAULT 'ev-' || gen_random_uuid()::text,
        canonical_product_id     TEXT NOT NULL REFERENCES canonical_products(id) ON DELETE RESTRICT,
        field_name               TEXT NOT NULL,
        value_snapshot           TEXT NOT NULL,
        evidence_status          TEXT NOT NULL DEFAULT 'unresearched',
        source_type              TEXT NOT NULL DEFAULT 'other',
        source_url               TEXT,
        source_title             TEXT,
        source_language          TEXT,
        translated_to_english    BOOLEAN NOT NULL DEFAULT false,
        region                   TEXT,
        retrieved_at             TIMESTAMPTZ,
        published_or_updated_at  TIMESTAMPTZ,
        confidence               TEXT NOT NULL DEFAULT 'low',
        metadata                 JSONB NOT NULL DEFAULT '{}',
        created_at               TIMESTAMPTZ DEFAULT now(),
        updated_at               TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_evidence_status CHECK (
          evidence_status IN ('verified','partially_verified','inferred','unresearched','conflicting')
        ),
        CONSTRAINT chk_evidence_confidence CHECK (confidence IN ('high','medium','low'))
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_evidence_canonical_product ON product_evidence (canonical_product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_evidence_field_name ON product_evidence (canonical_product_id, field_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_evidence_status ON product_evidence (evidence_status)`;
    results.push({ step: "product_evidence", status: "ok" });

    // ── Step 11: product_review_items ─────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_review_items (
        id                   TEXT PRIMARY KEY DEFAULT 'rev-' || gen_random_uuid()::text,
        review_type          TEXT NOT NULL,
        source_record_id     TEXT REFERENCES catalog_product_sources(id),
        canonical_product_id TEXT REFERENCES canonical_products(id),
        candidate_product_id TEXT REFERENCES canonical_products(id),
        status               TEXT NOT NULL DEFAULT 'open',
        priority             INTEGER NOT NULL DEFAULT 3,
        confidence           TEXT NOT NULL DEFAULT 'low',
        reason_code          TEXT NOT NULL,
        evidence             JSONB NOT NULL DEFAULT '{}',
        resolution           JSONB,
        assigned_to          TEXT,
        created_at           TIMESTAMPTZ DEFAULT now(),
        updated_at           TIMESTAMPTZ DEFAULT now(),
        resolved_at          TIMESTAMPTZ,
        CONSTRAINT chk_review_status CHECK (status IN ('open','in_progress','resolved','dismissed')),
        CONSTRAINT chk_review_priority CHECK (priority BETWEEN 1 AND 5),
        CONSTRAINT chk_review_type CHECK (
          review_type IN (
            'potential_duplicate','uncertain_mapping','conflicting_barcode',
            'missing_manufacturer','missing_product_type','low_confidence_merge',
            'unresolved_source','manual_review_requested'
          )
        )
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_review_status_priority ON product_review_items (status, priority) WHERE status IN ('open','in_progress')`;
    await sql`CREATE INDEX IF NOT EXISTS idx_review_canonical_product ON product_review_items (canonical_product_id) WHERE canonical_product_id IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_review_source_record ON product_review_items (source_record_id) WHERE source_record_id IS NOT NULL`;
    await sql`CREATE INDEX IF NOT EXISTS idx_review_type_status ON product_review_items (review_type, status)`;
    results.push({ step: "product_review_items", status: "ok" });

    // ── Step 12: product_audit_logs ───────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_audit_logs (
        id               TEXT PRIMARY KEY DEFAULT 'audit-' || gen_random_uuid()::text,
        entity_type      TEXT NOT NULL,
        entity_id        TEXT NOT NULL,
        action           TEXT NOT NULL,
        previous_value   JSONB,
        new_value        JSONB,
        reason           TEXT,
        performed_by     TEXT,
        import_batch_id  TEXT REFERENCES product_import_batches(id),
        revision_before  INTEGER,
        revision_after   INTEGER,
        created_at       TIMESTAMPTZ DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_entity ON product_audit_logs (entity_type, entity_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_created ON product_audit_logs (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_audit_import_batch ON product_audit_logs (import_batch_id) WHERE import_batch_id IS NOT NULL`;
    results.push({ step: "product_audit_logs", status: "ok" });

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        migration: "020_canonical_product_database",
        steps: results,
        warnings,
      }),
    };
  } catch (error) {
    console.error("Migration 020 failed:", error);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({
        error: "Migration 020 failed",
        details: error.message,
        rollback: "All tables use CREATE TABLE IF NOT EXISTS — partial failure leaves schema in a consistent state. Re-run to complete remaining steps.",
      }),
    };
  }
};

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
    await sql`ALTER TABLE canonical_manufacturers ADD COLUMN IF NOT EXISTS evidence_status TEXT NOT NULL DEFAULT 'unresearched'`;
    await sql`ALTER TABLE canonical_manufacturers ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`;
    await sql`ALTER TABLE canonical_manufacturers ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1`;
    await sql`ALTER TABLE canonical_manufacturers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`;
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
    await sql`ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS manufacturer_id TEXT REFERENCES canonical_manufacturers(id)`;
    await sql`ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS canonical_name TEXT`;
    await sql`ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS normalized_name TEXT`;
    await sql`ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS region TEXT`;
    await sql`ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS evidence_status TEXT NOT NULL DEFAULT 'unresearched'`;
    await sql`ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`;
    await sql`ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1`;
    await sql`ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()`;
    await sql`ALTER TABLE product_lines ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`;
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
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS manufacturer_id TEXT REFERENCES canonical_manufacturers(id)`;
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS product_line_id TEXT REFERENCES product_lines(id)`;
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS canonical_name TEXT`;
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS normalized_name TEXT`;
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS primary_product_type TEXT NOT NULL DEFAULT 'other'`;
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS evidence_status TEXT NOT NULL DEFAULT 'unresearched'`;
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`;
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1`;
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()`;
    await sql`ALTER TABLE product_families ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`;
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
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS product_family_id TEXT REFERENCES product_families(id)`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS manufacturer_id TEXT REFERENCES canonical_manufacturers(id)`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS product_line_id TEXT REFERENCES product_lines(id)`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS canonical_name TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS normalized_name TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS primary_product_type TEXT NOT NULL DEFAULT 'other'`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS product_category TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS product_subcategory TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS package_size_value NUMERIC(10,3)`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS package_size_unit TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS package_count INTEGER`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS unit_size_value NUMERIC(10,3)`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS unit_size_unit TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS original_package_text TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS packaging_type TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS intended_use_type TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS professional_use BOOLEAN NOT NULL DEFAULT false`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS retail_use BOOLEAN NOT NULL DEFAULT false`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS technical_use BOOLEAN NOT NULL DEFAULT false`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS compatible_system TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS evidence_status TEXT NOT NULL DEFAULT 'unresearched'`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS validation_status TEXT NOT NULL DEFAULT 'candidate'`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS color_depth_level NUMERIC(4,2)`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS color_tone_code TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS color_tone_family TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS neutralization_target TEXT`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS source_count INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS alias_count INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS review_item_count INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()`;
    await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`;
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
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS source_type TEXT`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS source_file TEXT`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS source_hash TEXT`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS processor_version TEXT NOT NULL DEFAULT '1.0.0'`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS rules_version TEXT NOT NULL DEFAULT '1.0.0'`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'created'`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS created_by TEXT`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS total_rows INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS valid_rows INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS invalid_rows INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS inserted_rows INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS updated_rows INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS unchanged_rows INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS conflict_rows INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS review_rows INTEGER NOT NULL DEFAULT 0`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS summary JSONB`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()`;
    await sql`ALTER TABLE product_import_batches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`;
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
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS source_system TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS source_product_id TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS source_file TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS source_sheet TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS source_row_id TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS import_batch_id TEXT REFERENCES product_import_batches(id)`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_product_name TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS normalized_raw_name TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_brand TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_product_line TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_shade_code TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_shade_name TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_size TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_unit TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_barcode TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_catalog_number TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_product_type TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_active_status TEXT`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS raw_payload JSONB NOT NULL DEFAULT '{}'`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS canonical_product_id TEXT REFERENCES canonical_products(id)`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now()`;
    await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`;
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

    // ── Step 13: product_merge_history ────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_merge_history (
        id                         TEXT PRIMARY KEY DEFAULT 'pmh-' || gen_random_uuid()::text,
        action                     TEXT NOT NULL,
        source_record_id           TEXT,
        previous_canonical_id      TEXT,
        new_canonical_id           TEXT,
        affected_alias_count       INTEGER DEFAULT 0,
        affected_usage_row_count   INTEGER DEFAULT 0,
        affected_mapping_count     INTEGER DEFAULT 0,
        reason                     TEXT,
        notes                      TEXT,
        performed_by               TEXT,
        import_batch_id            TEXT,
        revision_before            INTEGER,
        revision_after             INTEGER,
        rollback_data              JSONB,
        created_at                 TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_pmh_action CHECK (
          action IN (
            'assigned','reassigned','detached','created_independent_product',
            'merged','unmerged','marked_alias','kept_separate',
            'deactivated','reactivated'
          )
        )
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_pmh_source_record      ON product_merge_history (source_record_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pmh_previous_canonical ON product_merge_history (previous_canonical_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pmh_new_canonical      ON product_merge_history (new_canonical_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pmh_created_at         ON product_merge_history (created_at DESC)`;
    results.push({ step: "product_merge_history", status: "ok" });

    // ── Step 14: product_edit_history ─────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS product_edit_history (
        id                TEXT PRIMARY KEY DEFAULT 'peh-' || gen_random_uuid()::text,
        entity_type       TEXT NOT NULL,
        entity_id         TEXT NOT NULL,
        field_name        TEXT NOT NULL,
        previous_value    TEXT,
        new_value         TEXT,
        change_type       TEXT NOT NULL DEFAULT 'field_update',
        reason            TEXT,
        performed_by      TEXT,
        import_batch_id   TEXT,
        revision_before   INTEGER,
        revision_after    INTEGER,
        created_at        TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT chk_peh_entity_type CHECK (
          entity_type IN (
            'canonical_product','product_family','product_line','canonical_manufacturer'
          )
        ),
        CONSTRAINT chk_peh_change_type CHECK (
          change_type IN ('field_update','status_change','classification_change','evidence_update')
        )
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_peh_entity       ON product_edit_history (entity_type, entity_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_peh_field        ON product_edit_history (entity_id, field_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_peh_created_at   ON product_edit_history (created_at DESC)`;
    results.push({ step: "product_edit_history", status: "ok" });

    // ── Step 15: Migration 022 — resolution workflow schema additions ─────
    try {
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS merged_into_id TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_merged_into ON canonical_products (merged_into_id) WHERE merged_into_id IS NOT NULL`;

      await sql`ALTER TABLE usage_product_resolutions ADD COLUMN IF NOT EXISTS reprocessing_required BOOLEAN NOT NULL DEFAULT false`;
      await sql`ALTER TABLE usage_product_resolutions ADD COLUMN IF NOT EXISTS previous_canonical_product_id TEXT`;
      await sql`ALTER TABLE usage_product_resolutions ADD COLUMN IF NOT EXISTS last_resolution_action_id TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS idx_usage_resolution_reprocessing ON usage_product_resolutions (reprocessing_required) WHERE reprocessing_required = true`;
      await sql`CREATE INDEX IF NOT EXISTS idx_usage_resolution_previous_canonical ON usage_product_resolutions (previous_canonical_product_id) WHERE previous_canonical_product_id IS NOT NULL`;

      await sql`ALTER TABLE product_identity_mappings ADD COLUMN IF NOT EXISTS superseded_by_mapping_id TEXT`;
      await sql`ALTER TABLE product_identity_mappings ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ`;
      await sql`ALTER TABLE product_identity_mappings ADD COLUMN IF NOT EXISTS deactivation_reason TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS idx_mapping_superseded_by ON product_identity_mappings (superseded_by_mapping_id) WHERE superseded_by_mapping_id IS NOT NULL`;
      await sql`CREATE INDEX IF NOT EXISTS idx_mapping_deactivated ON product_identity_mappings (deactivated_at) WHERE deactivated_at IS NOT NULL`;

      await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS assignment_active BOOLEAN NOT NULL DEFAULT true`;
      await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS detached_at TIMESTAMPTZ`;
      await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS detached_reason TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS idx_catalog_source_assignment_active ON catalog_product_sources (assignment_active) WHERE assignment_active = false`;

      await sql`ALTER TABLE product_review_items ADD COLUMN IF NOT EXISTS created_by_action_id TEXT`;
      await sql`ALTER TABLE product_review_items ADD COLUMN IF NOT EXISTS resolved_by_action_id TEXT`;

      await sql`ALTER TABLE product_merge_history ADD COLUMN IF NOT EXISTS action_id TEXT`;
      await sql`ALTER TABLE product_merge_history ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`;
      try {
        await sql`ALTER TABLE product_merge_history ADD CONSTRAINT chk_pmh_status CHECK (status IN ('active','undone','superseded'))`;
      } catch (_) {
        // constraint may already exist
      }
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS uidx_merge_history_action_id ON product_merge_history (action_id) WHERE action_id IS NOT NULL`;
      await sql`CREATE INDEX IF NOT EXISTS idx_merge_history_status ON product_merge_history (status)`;

      results.push({ step: "022_resolution_workflow_columns", status: "ok" });
    } catch (err) {
      results.push({ step: "022_resolution_workflow_columns", status: "partial", warning: err.message });
      warnings.push("Migration 022 partial: " + err.message);
    }

    // ── Step 16: Migration 023 — hardening (source_record_type, idempotency, scoped aliases) ─
    try {
      // 1. source_record_type on product_identity_mappings
      await sql`ALTER TABLE product_identity_mappings ADD COLUMN IF NOT EXISTS source_record_type TEXT`;
      await sql`ALTER TABLE product_identity_mappings DROP CONSTRAINT IF EXISTS chk_source_record_type`;
      await sql`ALTER TABLE product_identity_mappings ADD CONSTRAINT chk_source_record_type CHECK (
        source_record_type IS NULL OR source_record_type IN (
          'catalog_product_source','legacy_product','usage_value','product_alias'
        )
      )`;
      // Backfill from known catalog sources
      await sql`
        UPDATE product_identity_mappings m
        SET source_record_type = 'catalog_product_source'
        WHERE source_record_type IS NULL
          AND source_record_id IS NOT NULL
          AND EXISTS (SELECT 1 FROM catalog_product_sources s WHERE s.id = m.source_record_id)
      `;

      // 2. Audit unresolved rows
      await sql`CREATE TABLE IF NOT EXISTS migration_023_unresolved_source_types (
        id               SERIAL PRIMARY KEY,
        mapping_id       TEXT,
        source_record_id TEXT,
        mapping_type     TEXT,
        active           BOOLEAN,
        created_at       TIMESTAMPTZ,
        noted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;

      // 3. Active-assignment partial unique index (after reconciliation check)
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS uidx_one_active_positive_assignment
          ON product_identity_mappings (source_record_id)
          WHERE active = TRUE
            AND canonical_product_id IS NOT NULL
            AND mapping_type IN (
              'exact_match','normalized_match','barcode_match','catalog_number_match',
              'alias','manual_assignment','approved_duplicate','usage_alias','historical_alias'
            )
      `;

      // 4. Scoped alias fields
      await sql`ALTER TABLE product_aliases ADD COLUMN IF NOT EXISTS alias_scope        TEXT NOT NULL DEFAULT 'global'`;
      await sql`ALTER TABLE product_aliases ADD COLUMN IF NOT EXISTS manufacturer_id    TEXT`;
      await sql`ALTER TABLE product_aliases ADD COLUMN IF NOT EXISTS product_line_id    TEXT`;
      await sql`ALTER TABLE product_aliases ADD COLUMN IF NOT EXISTS region             TEXT`;
      await sql`ALTER TABLE product_aliases ADD COLUMN IF NOT EXISTS source_system      TEXT`;
      await sql`ALTER TABLE product_aliases ADD COLUMN IF NOT EXISTS source_record_type TEXT`;
      await sql`ALTER TABLE product_aliases ADD COLUMN IF NOT EXISTS source_record_id   TEXT`;
      await sql`ALTER TABLE product_aliases DROP CONSTRAINT IF EXISTS chk_alias_scope`;
      await sql`ALTER TABLE product_aliases ADD CONSTRAINT chk_alias_scope CHECK (alias_scope IN ('global','manufacturer','product_line','region','source_system'))`;
      // Replace global unique index with scope-aware one
      await sql`DROP INDEX IF EXISTS uidx_alias_product_normalized_active`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_global_active ON product_aliases (canonical_product_id, normalized_alias) WHERE active = TRUE AND alias_scope = 'global'`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_manufacturer_active ON product_aliases (canonical_product_id, normalized_alias, manufacturer_id) WHERE active = TRUE AND alias_scope = 'manufacturer'`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_product_line_active ON product_aliases (canonical_product_id, normalized_alias, product_line_id) WHERE active = TRUE AND alias_scope = 'product_line'`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_region_active ON product_aliases (canonical_product_id, normalized_alias, region) WHERE active = TRUE AND alias_scope = 'region'`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_source_system_active ON product_aliases (canonical_product_id, normalized_alias, source_system) WHERE active = TRUE AND alias_scope = 'source_system'`;

      // 5. product_resolution_operations (idempotency)
      await sql`CREATE TABLE IF NOT EXISTS product_resolution_operations (
        operation_id      TEXT PRIMARY KEY,
        user_id           TEXT NOT NULL,
        action            TEXT NOT NULL,
        request_hash      TEXT NOT NULL,
        status            TEXT NOT NULL DEFAULT 'pending',
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at        TIMESTAMPTZ,
        completed_at      TIMESTAMPTZ,
        lease_expires_at  TIMESTAMPTZ,
        result_snapshot   JSONB,
        error_message     TEXT,
        retry_count       INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT chk_operation_status CHECK (
          status IN ('pending','running','completed','failed_retryable','failed_terminal')
        )
      )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_resolution_op_user_action ON product_resolution_operations (user_id, action, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_resolution_op_status ON product_resolution_operations (status) WHERE status IN ('pending','running')`;

      // 6. product_preview_tokens
      await sql`CREATE TABLE IF NOT EXISTS product_preview_tokens (
        token_id            TEXT PRIMARY KEY,
        user_id             TEXT NOT NULL,
        action              TEXT NOT NULL,
        source_record_type  TEXT,
        source_record_id    TEXT,
        normalized_req_hash TEXT NOT NULL,
        expected_revisions  JSONB NOT NULL DEFAULT '{}',
        impact_hash         TEXT NOT NULL,
        impact_hash_version INTEGER NOT NULL DEFAULT 1,
        generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at          TIMESTAMPTZ NOT NULL,
        consumed_at         TIMESTAMPTZ,
        operation_id        TEXT
      )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_preview_token_user_action ON product_preview_tokens (user_id, action, expires_at) WHERE consumed_at IS NULL`;
      await sql`CREATE INDEX IF NOT EXISTS idx_preview_token_expires ON product_preview_tokens (expires_at) WHERE consumed_at IS NULL`;

      // 7. product_negative_decisions
      await sql`CREATE TABLE IF NOT EXISTS product_negative_decisions (
        id                             TEXT PRIMARY KEY DEFAULT 'neg-' || gen_random_uuid()::text,
        source_record_type             TEXT NOT NULL,
        source_record_id               TEXT NOT NULL,
        candidate_canonical_product_id TEXT NOT NULL,
        decision_type                  TEXT NOT NULL,
        evidence_hash                  TEXT,
        rules_version                  TEXT,
        reason                         TEXT,
        decided_by_user_id             TEXT,
        decided_by_action_id           TEXT,
        active                         BOOLEAN NOT NULL DEFAULT TRUE,
        superseded_by_id               TEXT REFERENCES product_negative_decisions(id),
        created_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deactivated_at                 TIMESTAMPTZ,
        CONSTRAINT chk_neg_decision_type CHECK (decision_type IN ('rejected_match','keep_separate')),
        CONSTRAINT chk_neg_source_record_type CHECK (
          source_record_type IN ('catalog_product_source','legacy_product','usage_value','product_alias')
        )
      )`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS uidx_neg_decision_active ON product_negative_decisions (source_record_type, source_record_id, candidate_canonical_product_id, decision_type, COALESCE(evidence_hash,''), COALESCE(rules_version,'')) WHERE active = TRUE`;
      await sql`CREATE INDEX IF NOT EXISTS idx_neg_decision_source ON product_negative_decisions (source_record_type, source_record_id) WHERE active = TRUE`;
      await sql`CREATE INDEX IF NOT EXISTS idx_neg_decision_candidate ON product_negative_decisions (candidate_canonical_product_id) WHERE active = TRUE`;

      // 8. revision column on canonical_products
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1`;

      // 9. History table additions
      await sql`ALTER TABLE product_merge_history ADD COLUMN IF NOT EXISTS source_record_type TEXT`;
      await sql`ALTER TABLE product_merge_history ADD COLUMN IF NOT EXISTS operation_id TEXT`;
      await sql`ALTER TABLE product_merge_history ADD COLUMN IF NOT EXISTS preview_token TEXT`;
      await sql`ALTER TABLE product_merge_history ADD COLUMN IF NOT EXISTS override_blockers JSONB`;
      await sql`ALTER TABLE product_merge_history ADD COLUMN IF NOT EXISTS override_reason TEXT`;

      // 10. Review items additions
      await sql`ALTER TABLE product_review_items ADD COLUMN IF NOT EXISTS source_record_type TEXT`;
      await sql`ALTER TABLE product_review_items ADD COLUMN IF NOT EXISTS evidence_hash TEXT`;
      await sql`ALTER TABLE product_review_items ADD COLUMN IF NOT EXISTS rules_version TEXT`;
      await sql`ALTER TABLE product_review_items ADD COLUMN IF NOT EXISTS negative_decision_id TEXT`;

      // 11. Supporting indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_pim_source_record_type_active ON product_identity_mappings (source_record_type, source_record_id) WHERE active = TRUE`;
      await sql`CREATE INDEX IF NOT EXISTS idx_review_items_status_priority ON product_review_items (status, priority DESC, created_at ASC, id ASC)`;

      results.push({ step: "023_resolution_hardening", status: "ok" });
    } catch (err) {
      results.push({ step: "023_resolution_hardening", status: "partial", warning: err.message });
      warnings.push("Migration 023 partial: " + err.message);
    }

    // ── Step 17: Product Truth production import staging/readiness ─────────────
    try {
      await sql`CREATE TABLE IF NOT EXISTS product_truth_import_runs (
        run_id                    TEXT PRIMARY KEY,
        mode                      TEXT NOT NULL,
        status                    TEXT NOT NULL DEFAULT 'created',
        database_identity         JSONB NOT NULL DEFAULT '{}',
        snapshot_reference        TEXT,
        artifact_checksums        JSONB NOT NULL DEFAULT '{}',
        expected_counts           JSONB NOT NULL DEFAULT '{}',
        before_counts             JSONB NOT NULL DEFAULT '{}',
        after_counts              JSONB NOT NULL DEFAULT '{}',
        blocking_conflicts        JSONB NOT NULL DEFAULT '[]',
        non_blocking_conflicts    JSONB NOT NULL DEFAULT '[]',
        reconciliation            JSONB NOT NULL DEFAULT '{}',
        report_json_path          TEXT,
        report_markdown_path      TEXT,
        created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        staged_at                 TIMESTAMPTZ,
        validated_at              TIMESTAMPTZ,
        promoted_at               TIMESTAMPTZ,
        published_at              TIMESTAMPTZ,
        completed_at              TIMESTAMPTZ,
        CONSTRAINT chk_product_truth_import_run_status CHECK (
          status IN ('created','staging','staged','validated','blocked','approved','promoting','promoted','published','failed','complete')
        )
      )`;

      await sql`CREATE TABLE IF NOT EXISTS product_truth_import_chunks (
        id               TEXT PRIMARY KEY DEFAULT 'ptchunk-' || gen_random_uuid()::text,
        run_id           TEXT NOT NULL REFERENCES product_truth_import_runs(run_id),
        phase            TEXT NOT NULL,
        chunk_number     INTEGER NOT NULL,
        status           TEXT NOT NULL DEFAULT 'pending',
        inserted_count   INTEGER NOT NULL DEFAULT 0,
        updated_count    INTEGER NOT NULL DEFAULT 0,
        unchanged_count  INTEGER NOT NULL DEFAULT 0,
        rejected_count   INTEGER NOT NULL DEFAULT 0,
        error_count      INTEGER NOT NULL DEFAULT 0,
        checksum         TEXT,
        started_at       TIMESTAMPTZ,
        completed_at     TIMESTAMPTZ,
        error_message    TEXT,
        metadata         JSONB NOT NULL DEFAULT '{}',
        CONSTRAINT chk_product_truth_import_chunk_status CHECK (
          status IN ('pending','running','completed','failed','skipped')
        )
      )`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS uidx_product_truth_import_chunk ON product_truth_import_chunks (run_id, phase, chunk_number)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_truth_import_chunks_run_phase ON product_truth_import_chunks (run_id, phase, chunk_number)`;

      await sql`CREATE TABLE IF NOT EXISTS staging_product_truth_canonical (
        run_id          TEXT NOT NULL REFERENCES product_truth_import_runs(run_id),
        canonical_id    TEXT NOT NULL,
        record_checksum TEXT NOT NULL,
        record          JSONB NOT NULL,
        staged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        validation_status TEXT NOT NULL DEFAULT 'pending',
        validation_errors JSONB NOT NULL DEFAULT '[]',
        PRIMARY KEY (run_id, canonical_id)
      )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_staging_pt_canonical_status ON staging_product_truth_canonical (run_id, validation_status)`;

      await sql`CREATE TABLE IF NOT EXISTS staging_product_truth_sources (
        run_id          TEXT NOT NULL REFERENCES product_truth_import_runs(run_id),
        source_id       TEXT NOT NULL,
        canonical_id    TEXT,
        record_checksum TEXT NOT NULL,
        record          JSONB NOT NULL,
        staged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        validation_status TEXT NOT NULL DEFAULT 'pending',
        validation_errors JSONB NOT NULL DEFAULT '[]',
        PRIMARY KEY (run_id, source_id)
      )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_staging_pt_sources_canonical ON staging_product_truth_sources (run_id, canonical_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_staging_pt_sources_status ON staging_product_truth_sources (run_id, validation_status)`;

      await sql`CREATE TABLE IF NOT EXISTS staging_product_truth_aliases (
        run_id          TEXT NOT NULL REFERENCES product_truth_import_runs(run_id),
        alias_key       TEXT NOT NULL,
        canonical_id    TEXT,
        source_id       TEXT,
        alias_scope     TEXT,
        record_checksum TEXT NOT NULL,
        record          JSONB NOT NULL,
        staged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        validation_status TEXT NOT NULL DEFAULT 'pending',
        validation_errors JSONB NOT NULL DEFAULT '[]',
        PRIMARY KEY (run_id, alias_key)
      )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_staging_pt_aliases_canonical ON staging_product_truth_aliases (run_id, canonical_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_staging_pt_aliases_status ON staging_product_truth_aliases (run_id, validation_status)`;

      await sql`CREATE TABLE IF NOT EXISTS product_truth_import_id_mappings (
        run_id              TEXT NOT NULL REFERENCES product_truth_import_runs(run_id),
        entity_type         TEXT NOT NULL,
        source_id           TEXT NOT NULL,
        target_id           TEXT NOT NULL,
        mapping_strategy    TEXT NOT NULL,
        record_checksum     TEXT,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (run_id, entity_type, source_id)
      )`;

      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS shade_code_raw TEXT`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS shade_code_normalized TEXT`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS classification_confidence NUMERIC(5,4)`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS classification_status TEXT`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS classification_rules_version TEXT`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS classification_evidence JSONB NOT NULL DEFAULT '[]'`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS tonal_profile JSONB`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS shade_bearing BOOLEAN`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS tonal_classification_eligible BOOLEAN`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS region TEXT`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS import_run_id TEXT`;
      await sql`ALTER TABLE canonical_products ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`;
      await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_import_visibility ON canonical_products (import_run_id, published_at) WHERE import_run_id IS NOT NULL`;
      await sql`CREATE INDEX IF NOT EXISTS idx_canonical_product_classification_rules ON canonical_products (classification_rules_version) WHERE classification_rules_version IS NOT NULL`;

      await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS import_run_id TEXT`;
      await sql`ALTER TABLE catalog_product_sources ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`;
      await sql`ALTER TABLE product_aliases ADD COLUMN IF NOT EXISTS import_run_id TEXT`;
      await sql`ALTER TABLE product_aliases ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`;
      await sql`ALTER TABLE product_identity_mappings ADD COLUMN IF NOT EXISTS import_run_id TEXT`;
      await sql`ALTER TABLE product_identity_mappings ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`;

      results.push({ step: "024_product_truth_import_staging", status: "ok" });
    } catch (err) {
      results.push({ step: "024_product_truth_import_staging", status: "partial", warning: err.message });
      warnings.push("Migration 024 partial: " + err.message);
    }

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        migration: "020 + 021_product_history_tables + 022_product_resolution_workflows + 023_resolution_hardening + 024_product_truth_import_staging",
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

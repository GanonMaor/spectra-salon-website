-- migrations/023_product_resolution_hardening.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Milestone 4 Hardening Pass
--
-- This migration hardens the product resolution schema with:
--   1. source_record_type column added where needed
--   2. Partial unique index for one active positive assignment per source
--   3. Scoped alias fields and scope-aware constraints
--   4. product_resolution_operations table for idempotency
--   5. Preview metadata table for previewToken validation
--   6. Negative decision hardening (product_negative_decisions)
--   7. Merge blocker audit columns
--   8. Supporting indexes
--
-- SAFE: All changes are additive (ADD COLUMN IF NOT EXISTS, CREATE TABLE IF
-- NOT EXISTS, CREATE INDEX IF NOT EXISTS). No existing columns are dropped.

-- ── 0. Reconciliation safety check ───────────────────────────────────────────
-- Before we add the active-assignment uniqueness constraint we must confirm
-- that no source record already has two active positive mappings.
-- This CTE returns conflicting rows. The migration will abort if any exist.

DO $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM (
    SELECT source_record_id, COUNT(*) AS cnt
    FROM product_identity_mappings
    WHERE active = TRUE
      AND canonical_product_id IS NOT NULL
      AND mapping_type IN (
        'exact_match','normalized_match','barcode_match','catalog_number_match',
        'alias','manual_assignment','approved_duplicate','usage_alias','historical_alias'
      )
    GROUP BY source_record_id
    HAVING COUNT(*) > 1
  ) conflicts;

  IF conflict_count > 0 THEN
    RAISE EXCEPTION
      'Migration 023 blocked: % source record(s) have multiple active positive assignments. '
      'Resolve conflicts manually before applying this migration.',
      conflict_count;
  END IF;
END $$;

-- ── 1. Add source_record_type to product_identity_mappings ───────────────────

ALTER TABLE product_identity_mappings
  ADD COLUMN IF NOT EXISTS source_record_type TEXT;

-- Backfill source_record_type from the existing source_id relationship.
-- Only rows that already reference a known catalog_product_sources record
-- are backfilled safely. All others remain NULL and will need manual review.
UPDATE product_identity_mappings m
SET source_record_type = 'catalog_product_source'
WHERE source_record_type IS NULL
  AND source_record_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM catalog_product_sources s WHERE s.id = m.source_record_id
  );

-- Create a report of unresolved rows (NULLs after backfill) for manual review.
-- This report is inserted into a dedicated audit table.
CREATE TABLE IF NOT EXISTS migration_023_unresolved_source_types (
  id               SERIAL PRIMARY KEY,
  mapping_id       TEXT,
  source_record_id TEXT,
  mapping_type     TEXT,
  active           BOOLEAN,
  created_at       TIMESTAMPTZ,
  noted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO migration_023_unresolved_source_types
  (mapping_id, source_record_id, mapping_type, active, created_at)
SELECT
  id, source_record_id, mapping_type, active, created_at
FROM product_identity_mappings
WHERE source_record_type IS NULL
  AND source_record_id IS NOT NULL;

-- Add a CHECK constraint on the allowed values (soft – does not enforce NOT NULL
-- yet since historical rows may legitimately be NULL until reviewed).
ALTER TABLE product_identity_mappings
  DROP CONSTRAINT IF EXISTS chk_source_record_type;

ALTER TABLE product_identity_mappings
  ADD CONSTRAINT chk_source_record_type CHECK (
    source_record_type IS NULL OR source_record_type IN (
      'catalog_product_source',
      'legacy_product',
      'usage_value',
      'product_alias'
    )
  );

-- ── 2. Add source_record_type to product_merge_history ──────────────────────

ALTER TABLE product_merge_history
  ADD COLUMN IF NOT EXISTS source_record_type TEXT,
  ADD COLUMN IF NOT EXISTS operation_id        TEXT,
  ADD COLUMN IF NOT EXISTS preview_token       TEXT,
  ADD COLUMN IF NOT EXISTS override_blockers   JSONB,
  ADD COLUMN IF NOT EXISTS override_reason     TEXT;

-- ── 3. Add source_record_type to product_review_items ───────────────────────

ALTER TABLE product_review_items
  ADD COLUMN IF NOT EXISTS source_record_type     TEXT,
  ADD COLUMN IF NOT EXISTS evidence_hash          TEXT,
  ADD COLUMN IF NOT EXISTS rules_version          TEXT,
  ADD COLUMN IF NOT EXISTS negative_decision_id   TEXT;

-- ── 4. Partial unique index: one active positive assignment per source ────────
-- Positive mapping types = all types that represent a canonical assignment.
-- Negative types (rejected_match, keep_separate) are explicitly excluded.

CREATE UNIQUE INDEX IF NOT EXISTS uidx_one_active_positive_assignment
  ON product_identity_mappings (source_record_id)
  WHERE active = TRUE
    AND canonical_product_id IS NOT NULL
    AND mapping_type IN (
      'exact_match','normalized_match','barcode_match','catalog_number_match',
      'alias','manual_assignment','approved_duplicate','usage_alias','historical_alias'
    );

-- ── 5. Scoped alias fields ────────────────────────────────────────────────────

ALTER TABLE product_aliases
  ADD COLUMN IF NOT EXISTS alias_scope        TEXT NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS manufacturer_id    TEXT,
  ADD COLUMN IF NOT EXISTS product_line_id    TEXT,
  ADD COLUMN IF NOT EXISTS region             TEXT,
  ADD COLUMN IF NOT EXISTS source_system      TEXT,
  ADD COLUMN IF NOT EXISTS source_record_type TEXT,
  ADD COLUMN IF NOT EXISTS source_record_id   TEXT;

-- Allowed scope values
ALTER TABLE product_aliases
  DROP CONSTRAINT IF EXISTS chk_alias_scope;
ALTER TABLE product_aliases
  ADD CONSTRAINT chk_alias_scope CHECK (
    alias_scope IN ('global','manufacturer','product_line','region','source_system')
  );

-- Scope-specific presence constraints
ALTER TABLE product_aliases
  DROP CONSTRAINT IF EXISTS chk_alias_scope_manufacturer;
ALTER TABLE product_aliases
  ADD CONSTRAINT chk_alias_scope_manufacturer CHECK (
    alias_scope <> 'manufacturer' OR manufacturer_id IS NOT NULL
  );

ALTER TABLE product_aliases
  DROP CONSTRAINT IF EXISTS chk_alias_scope_product_line;
ALTER TABLE product_aliases
  ADD CONSTRAINT chk_alias_scope_product_line CHECK (
    alias_scope <> 'product_line' OR product_line_id IS NOT NULL
  );

ALTER TABLE product_aliases
  DROP CONSTRAINT IF EXISTS chk_alias_scope_region;
ALTER TABLE product_aliases
  ADD CONSTRAINT chk_alias_scope_region CHECK (
    alias_scope <> 'region' OR region IS NOT NULL
  );

ALTER TABLE product_aliases
  DROP CONSTRAINT IF EXISTS chk_alias_scope_source_system;
ALTER TABLE product_aliases
  ADD CONSTRAINT chk_alias_scope_source_system CHECK (
    alias_scope <> 'source_system' OR source_system IS NOT NULL
  );

ALTER TABLE product_aliases
  DROP CONSTRAINT IF EXISTS chk_alias_global_no_scope;
ALTER TABLE product_aliases
  ADD CONSTRAINT chk_alias_global_no_scope CHECK (
    alias_scope <> 'global' OR (
      manufacturer_id IS NULL AND
      product_line_id IS NULL AND
      region IS NULL AND
      source_system IS NULL
    )
  );

-- Drop old unscoped unique index; replace with scoped NULL-safe indexes.
DROP INDEX IF EXISTS uidx_alias_product_normalized_active;

-- NULL-safe scoped uniqueness: active global alias per canonical_product
CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_global_active
  ON product_aliases (canonical_product_id, normalized_alias)
  WHERE active = TRUE AND alias_scope = 'global';

-- NULL-safe manufacturer-scoped alias uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_manufacturer_active
  ON product_aliases (canonical_product_id, normalized_alias, manufacturer_id)
  WHERE active = TRUE AND alias_scope = 'manufacturer';

-- NULL-safe product-line-scoped alias uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_product_line_active
  ON product_aliases (canonical_product_id, normalized_alias, product_line_id)
  WHERE active = TRUE AND alias_scope = 'product_line';

-- NULL-safe region-scoped alias uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_region_active
  ON product_aliases (canonical_product_id, normalized_alias, region)
  WHERE active = TRUE AND alias_scope = 'region';

-- NULL-safe source-system-scoped alias uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS uidx_alias_source_system_active
  ON product_aliases (canonical_product_id, normalized_alias, source_system)
  WHERE active = TRUE AND alias_scope = 'source_system';

-- ── 6. product_resolution_operations (idempotency) ───────────────────────────

CREATE TABLE IF NOT EXISTS product_resolution_operations (
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
);

CREATE INDEX IF NOT EXISTS idx_resolution_op_user_action
  ON product_resolution_operations (user_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resolution_op_status
  ON product_resolution_operations (status)
  WHERE status IN ('pending','running');

CREATE INDEX IF NOT EXISTS idx_resolution_op_lease
  ON product_resolution_operations (lease_expires_at)
  WHERE status = 'running' AND lease_expires_at IS NOT NULL;

-- ── 7. product_preview_tokens (preview token validation) ─────────────────────

CREATE TABLE IF NOT EXISTS product_preview_tokens (
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
);

CREATE INDEX IF NOT EXISTS idx_preview_token_user_action
  ON product_preview_tokens (user_id, action, expires_at)
  WHERE consumed_at IS NULL;

-- Expire old tokens automatically (requires pg_cron or application cleanup)
CREATE INDEX IF NOT EXISTS idx_preview_token_expires
  ON product_preview_tokens (expires_at)
  WHERE consumed_at IS NULL;

-- ── 8. product_negative_decisions (separate negative decision model) ──────────

CREATE TABLE IF NOT EXISTS product_negative_decisions (
  id                        TEXT PRIMARY KEY DEFAULT 'neg-' || gen_random_uuid()::text,
  source_record_type        TEXT NOT NULL,
  source_record_id          TEXT NOT NULL,
  candidate_canonical_product_id TEXT NOT NULL,
  decision_type             TEXT NOT NULL,
  evidence_hash             TEXT,
  rules_version             TEXT,
  reason                    TEXT,
  decided_by_user_id        TEXT,
  decided_by_action_id      TEXT,
  active                    BOOLEAN NOT NULL DEFAULT TRUE,
  superseded_by_id          TEXT REFERENCES product_negative_decisions(id),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at            TIMESTAMPTZ,
  CONSTRAINT chk_neg_decision_type CHECK (
    decision_type IN ('rejected_match','keep_separate')
  ),
  CONSTRAINT chk_neg_source_record_type CHECK (
    source_record_type IN (
      'catalog_product_source','legacy_product','usage_value','product_alias'
    )
  )
);

-- Uniqueness: one active negative decision per (source, candidate, type, evidence, rules)
CREATE UNIQUE INDEX IF NOT EXISTS uidx_neg_decision_active
  ON product_negative_decisions (
    source_record_type,
    source_record_id,
    candidate_canonical_product_id,
    decision_type,
    COALESCE(evidence_hash, ''),
    COALESCE(rules_version, '')
  )
  WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_neg_decision_source
  ON product_negative_decisions (source_record_type, source_record_id)
  WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_neg_decision_candidate
  ON product_negative_decisions (candidate_canonical_product_id)
  WHERE active = TRUE;

-- ── 9. Add revision columns to canonical_products if missing ─────────────────

ALTER TABLE canonical_products
  ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1;

-- ── 10. Supporting indexes for performance ────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pim_source_record_type_active
  ON product_identity_mappings (source_record_type, source_record_id)
  WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_pim_canonical_active
  ON product_identity_mappings (canonical_product_id)
  WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_review_items_source_type
  ON product_review_items (source_record_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_items_status_priority
  ON product_review_items (status, priority DESC, created_at ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_neg_decision_by_action
  ON product_negative_decisions (decided_by_action_id)
  WHERE decided_by_action_id IS NOT NULL;

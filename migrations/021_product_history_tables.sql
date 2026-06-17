-- ============================================================
-- Migration 021: Product History Tables
-- ============================================================
-- Adds product_merge_history and product_edit_history tables
-- that were deferred from migration 020.
--
-- Non-destructive: only CREATE TABLE IF NOT EXISTS.
-- product_audit_logs already captures every structural event.
-- These tables provide faster dedicated query paths for
-- merge undo workflows and field-level edit history.
-- ============================================================

-- ── 1. product_merge_history ───────────────────────────────────────────────
-- Records every merge, unmerge, detach, reassign, or "make independent"
-- structural action between source products and canonical products.

CREATE TABLE IF NOT EXISTS product_merge_history (
  id                         TEXT PRIMARY KEY DEFAULT 'pmh-' || gen_random_uuid()::text,
  action                     TEXT NOT NULL,        -- assigned|reassigned|detached|created_independent_product|merged|unmerged|marked_alias|kept_separate|deactivated|reactivated
  source_record_id           TEXT,                 -- catalog_product_sources.id
  previous_canonical_id      TEXT,                 -- canonical_products.id (before)
  new_canonical_id           TEXT,                 -- canonical_products.id (after)
  affected_alias_count       INTEGER DEFAULT 0,
  affected_usage_row_count   INTEGER DEFAULT 0,
  affected_mapping_count     INTEGER DEFAULT 0,
  reason                     TEXT,
  notes                      TEXT,
  performed_by               TEXT,
  import_batch_id            TEXT,
  revision_before            INTEGER,
  revision_after             INTEGER,
  rollback_data              JSONB,               -- snapshot for undo
  created_at                 TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_pmh_action CHECK (
    action IN (
      'assigned','reassigned','detached','created_independent_product',
      'merged','unmerged','marked_alias','kept_separate',
      'deactivated','reactivated'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_pmh_source_record      ON product_merge_history (source_record_id);
CREATE INDEX IF NOT EXISTS idx_pmh_previous_canonical ON product_merge_history (previous_canonical_id);
CREATE INDEX IF NOT EXISTS idx_pmh_new_canonical      ON product_merge_history (new_canonical_id);
CREATE INDEX IF NOT EXISTS idx_pmh_created_at         ON product_merge_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pmh_action             ON product_merge_history (action);

-- ── 2. product_edit_history ────────────────────────────────────────────────
-- Stores field-level edit events for canonical products and product lines/
-- families/manufacturers. Provides faster per-product history queries than
-- scanning the full product_audit_logs table.

CREATE TABLE IF NOT EXISTS product_edit_history (
  id                TEXT PRIMARY KEY DEFAULT 'peh-' || gen_random_uuid()::text,
  entity_type       TEXT NOT NULL,    -- canonical_product|product_family|product_line|canonical_manufacturer
  entity_id         TEXT NOT NULL,
  field_name        TEXT NOT NULL,
  previous_value    TEXT,
  new_value         TEXT,
  change_type       TEXT NOT NULL DEFAULT 'field_update',  -- field_update|status_change|classification_change
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
);

CREATE INDEX IF NOT EXISTS idx_peh_entity          ON product_edit_history (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_peh_field           ON product_edit_history (entity_id, field_name);
CREATE INDEX IF NOT EXISTS idx_peh_created_at      ON product_edit_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_peh_performed_by    ON product_edit_history (performed_by);

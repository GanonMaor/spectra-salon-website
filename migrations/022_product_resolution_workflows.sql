-- ============================================================
-- Migration 022: Product Resolution Workflow Support
-- ============================================================
-- Adds columns required by Milestone 4: transactional resolution
-- workflows (detach, reassign, make-independent, merge, unmerge,
-- alias approval, keep-separate, reject-match, undo).
--
-- Non-destructive: only ADD COLUMN IF NOT EXISTS and IF NOT EXISTS
-- indexes. Safe to re-run.
-- ============================================================

-- ── 1. canonical_products: track merged-into relationship ─────────────────
-- When a canonical product is merged into another it is marked inactive
-- but preserved for history. merged_into_id points to the surviving product.

ALTER TABLE canonical_products
  ADD COLUMN IF NOT EXISTS merged_into_id TEXT;

-- No FK constraint to avoid circular-reference issues in partial merges.
-- The application layer validates the target exists before inserting.

CREATE INDEX IF NOT EXISTS idx_canonical_product_merged_into
  ON canonical_products (merged_into_id)
  WHERE merged_into_id IS NOT NULL;

-- ── 2. usage_product_resolutions: mark rows stale after re-mapping ────────
-- When a source product is reassigned to a different canonical product,
-- existing resolution rows are marked reprocessing_required = true rather
-- than updated in bulk. The analytics layer reads this flag and recalculates
-- only affected aggregates.

ALTER TABLE usage_product_resolutions
  ADD COLUMN IF NOT EXISTS reprocessing_required BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE usage_product_resolutions
  ADD COLUMN IF NOT EXISTS previous_canonical_product_id TEXT;

ALTER TABLE usage_product_resolutions
  ADD COLUMN IF NOT EXISTS last_resolution_action_id TEXT;

CREATE INDEX IF NOT EXISTS idx_usage_resolution_reprocessing
  ON usage_product_resolutions (reprocessing_required)
  WHERE reprocessing_required = true;

CREATE INDEX IF NOT EXISTS idx_usage_resolution_previous_canonical
  ON usage_product_resolutions (previous_canonical_product_id)
  WHERE previous_canonical_product_id IS NOT NULL;

-- ── 3. product_identity_mappings: track supersession chain ───────────────
-- When a mapping is replaced (e.g. on reassign) the old mapping is
-- deactivated and superseded_by_mapping_id is set to the new mapping id.
-- This allows auditors to follow the full chain of mapping changes.

ALTER TABLE product_identity_mappings
  ADD COLUMN IF NOT EXISTS superseded_by_mapping_id TEXT;

ALTER TABLE product_identity_mappings
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;

ALTER TABLE product_identity_mappings
  ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_mapping_superseded_by
  ON product_identity_mappings (superseded_by_mapping_id)
  WHERE superseded_by_mapping_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mapping_deactivated
  ON product_identity_mappings (deactivated_at)
  WHERE deactivated_at IS NOT NULL;

-- ── 4. catalog_product_sources: track direct assignment state ────────────
-- assignment_active makes it explicit when a source is deliberately
-- left unassigned (detach_to_unresolved) vs never assigned.

ALTER TABLE catalog_product_sources
  ADD COLUMN IF NOT EXISTS assignment_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE catalog_product_sources
  ADD COLUMN IF NOT EXISTS detached_at TIMESTAMPTZ;

ALTER TABLE catalog_product_sources
  ADD COLUMN IF NOT EXISTS detached_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_catalog_source_assignment_active
  ON catalog_product_sources (assignment_active)
  WHERE assignment_active = false;

-- ── 5. product_review_items: add resolution_action_id reference ──────────
-- When a structural action creates or resolves a review item, the action
-- ID is stored for traceability.

ALTER TABLE product_review_items
  ADD COLUMN IF NOT EXISTS created_by_action_id TEXT;

ALTER TABLE product_review_items
  ADD COLUMN IF NOT EXISTS resolved_by_action_id TEXT;

-- ── 6. product_merge_history: expose the action_id for undo chaining ──────
-- action_id is the stable identifier for the resolution action event that
-- created this merge-history row; used by the undo endpoint to locate the
-- row.

ALTER TABLE product_merge_history
  ADD COLUMN IF NOT EXISTS action_id TEXT;

ALTER TABLE product_merge_history
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'undone', 'superseded'));

CREATE UNIQUE INDEX IF NOT EXISTS uidx_merge_history_action_id
  ON product_merge_history (action_id)
  WHERE action_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_merge_history_status
  ON product_merge_history (status);

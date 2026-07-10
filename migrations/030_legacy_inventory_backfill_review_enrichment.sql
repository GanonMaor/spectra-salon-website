-- ============================================================
-- Migration 030: Legacy Inventory Backfill — Review Enrichment
-- ============================================================
-- Extends legacy_inventory_migration_review (migration 028) with dry-run
-- metadata so the confidence-based backfill dry-run can record, per legacy
-- row: which run produced it, how it was matched, the score, the candidate
-- product ids considered, a readable snapshot, structured reasons, whether it
-- would auto-migrate, and which review bucket it belongs to.
--
-- This migration ONLY touches the review/staging table. It never affects
-- salon_inventory_products. Additive + idempotent; safe to re-run.
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.legacy_inventory_migration_review') IS NULL THEN
    RAISE EXCEPTION '[030] legacy_inventory_migration_review is missing. Run migration 028 first.';
  END IF;
END $$;

-- ── 1. Dry-run metadata columns ───────────────────────────────────────────
ALTER TABLE legacy_inventory_migration_review
  ADD COLUMN IF NOT EXISTS run_id              TEXT,
  ADD COLUMN IF NOT EXISTS match_method        TEXT,
  ADD COLUMN IF NOT EXISTS match_score         NUMERIC(6,4),
  ADD COLUMN IF NOT EXISTS candidate_product_ids JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS candidate_snapshot  JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reason_details      JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS would_migrate       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_bucket       TEXT NOT NULL DEFAULT 'unmatched',
  ADD COLUMN IF NOT EXISTS updated_at          TIMESTAMPTZ DEFAULT now();

-- ── 2. Review bucket constraint ───────────────────────────────────────────
-- Human-facing outcome bucket. Distinct from match_status/match_confidence so
-- the dry-run can express "matched a candidate but not confident enough".
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_legacy_review_bucket'
  ) THEN
    ALTER TABLE legacy_inventory_migration_review
      ADD CONSTRAINT chk_legacy_review_bucket CHECK (
        review_bucket IN (
          'auto_migrate','review_medium','review_low','ambiguous','unmatched','skipped'
        )
      );
  END IF;
END $$;

-- ── 3. Indexes for report slicing ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_legacy_inventory_review_run
  ON legacy_inventory_migration_review (run_id);

CREATE INDEX IF NOT EXISTS idx_legacy_inventory_review_bucket
  ON legacy_inventory_migration_review (review_bucket);

CREATE INDEX IF NOT EXISTS idx_legacy_inventory_review_would_migrate
  ON legacy_inventory_migration_review (would_migrate);

-- ── 4. updated_at trigger ─────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $fn$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_legacy_inventory_review_updated_at') THEN
    CREATE TRIGGER trg_legacy_inventory_review_updated_at
      BEFORE UPDATE ON legacy_inventory_migration_review
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ── End of migration 030 ─────────────────────────────────────────────────

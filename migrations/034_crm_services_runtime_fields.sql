-- ============================================================
-- Migration 034: CRM Services Runtime Fields
-- ============================================================
-- Adds the small set of fields needed by the tenant-scoped services runtime
-- API and schedule settings UI on top of migration 033.
--
-- Non-destructive: ALTER TABLE ADD COLUMN IF NOT EXISTS only.
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.salon_service_categories') IS NULL THEN
    RAISE EXCEPTION '[034] salon_service_categories is missing. Run migration 033 first.';
  END IF;
  IF to_regclass('public.salon_services') IS NULL THEN
    RAISE EXCEPTION '[034] salon_services is missing. Run migration 033 first.';
  END IF;
END $$;

ALTER TABLE salon_service_categories
  ADD COLUMN IF NOT EXISTS department_id TEXT,
  ADD COLUMN IF NOT EXISTS crm_category_id TEXT NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE salon_services
  ADD COLUMN IF NOT EXISTS accent_color TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allow_client_timing_overrides BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS can_overlap_during_processing BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_stages JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS linked_service_ids JSONB NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_salon_service_categories_salon_crm_category
  ON salon_service_categories (salon_id, crm_category_id);

CREATE INDEX IF NOT EXISTS idx_salon_service_categories_salon_department
  ON salon_service_categories (salon_id, department_id);

CREATE INDEX IF NOT EXISTS idx_salon_services_salon_status
  ON salon_services (salon_id, status);

-- ── End of migration 034 ─────────────────────────────────────────────────

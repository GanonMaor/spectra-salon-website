-- ============================================================
-- Migration 039: CRM Catalog Lifecycle & Persistent Resources
-- ============================================================
-- Phase C of the salon settings/permissions plan (catalog lifecycle and
-- resource enforcement). Two additive, non-destructive changes:
--
--   1. Widen the catalog status lifecycle to active | inactive | archived
--      for departments, service categories, and services. Existing rows are
--      always in {active, archived}, so no data is invalidated. Regular row
--      deletion is replaced by status transitions at the API layer.
--
--   2. Introduce salon_resources (chairs, wash stations, rooms, …) as a
--      persistent, tenant-scoped catalog with optional department scoping
--      (NULL department_id = shared across the salon), capacity, and an
--      exclusivity flag. Appointment segments already carry resource_id
--      (migration 033) as free text; this table lets the server enforce
--      capacity/exclusivity for segments that reference a persisted resource
--      while leaving legacy free-text resource ids untouched.
--
--   3. Add salon_services.resource_requirements so a service can declare, per
--      stage/segment type, that it needs a specific resource or one_of a set.
--
-- Depends on migrations 033 (core CRM runtime) and 034 (services fields).
-- Idempotent: guarded constraint swaps + IF NOT EXISTS.
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.salon_departments') IS NULL THEN
    RAISE EXCEPTION '[039] salon_departments is missing. Run migration 033 first.';
  END IF;
  IF to_regclass('public.salon_services') IS NULL THEN
    RAISE EXCEPTION '[039] salon_services is missing. Run migration 033 first.';
  END IF;
END $$;

-- ── 1. Widen catalog status lifecycle to include 'inactive' ───────────────
ALTER TABLE salon_departments DROP CONSTRAINT IF EXISTS chk_salon_department_status;
ALTER TABLE salon_departments
  ADD CONSTRAINT chk_salon_department_status
  CHECK (status IN ('active','inactive','archived'));

ALTER TABLE salon_service_categories DROP CONSTRAINT IF EXISTS chk_salon_service_category_status;
ALTER TABLE salon_service_categories
  ADD CONSTRAINT chk_salon_service_category_status
  CHECK (status IN ('active','inactive','archived'));

ALTER TABLE salon_services DROP CONSTRAINT IF EXISTS chk_salon_service_status;
ALTER TABLE salon_services
  ADD CONSTRAINT chk_salon_service_status
  CHECK (status IN ('active','inactive','archived'));

-- ── 2. Persistent resources ───────────────────────────────────────────────
-- department_id NULL means the resource is shared across the whole salon.
-- capacity is the number of simultaneous holds the resource supports (>= 1).
-- is_exclusive forces effective capacity to 1 regardless of capacity.
-- holding_segment_types (optional) overrides which segment types consume the
-- resource; when empty the server default applies (everything except 'wait').
CREATE TABLE IF NOT EXISTS salon_resources (
  id                   TEXT PRIMARY KEY DEFAULT 'sres-' || gen_random_uuid()::text,
  salon_id             TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  department_id        TEXT REFERENCES salon_departments(id) ON DELETE SET NULL,
  type                 TEXT NOT NULL DEFAULT 'other',
  name                 TEXT NOT NULL,
  capacity             INTEGER NOT NULL DEFAULT 1,
  is_exclusive         BOOLEAN NOT NULL DEFAULT true,
  holding_segment_types JSONB NOT NULL DEFAULT '[]',
  sort_order           INTEGER NOT NULL DEFAULT 0,
  status               TEXT NOT NULL DEFAULT 'active',
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_resource_status CHECK (status IN ('active','inactive','archived')),
  CONSTRAINT chk_salon_resource_capacity CHECK (capacity >= 1)
);
CREATE INDEX IF NOT EXISTS idx_salon_resources_salon
  ON salon_resources (salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_resources_salon_department
  ON salon_resources (salon_id, department_id);
CREATE INDEX IF NOT EXISTS idx_salon_resources_salon_status
  ON salon_resources (salon_id, status);

-- Help resource-conflict lookups filter segments by resource within a salon.
CREATE INDEX IF NOT EXISTS idx_salon_appointment_segments_salon_resource
  ON salon_appointment_segments (salon_id, resource_id);

-- ── 3. Per-service resource requirements ──────────────────────────────────
-- Shape (per element): { segmentType?: string, mode: 'specific'|'one_of', resourceIds: string[] }
ALTER TABLE salon_services
  ADD COLUMN IF NOT EXISTS resource_requirements JSONB NOT NULL DEFAULT '[]';

-- ── End of migration 039 ─────────────────────────────────────────────────

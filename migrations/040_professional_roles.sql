-- ============================================================
-- Migration 040: Professional roles & capability precedence
-- ============================================================
-- Phase B of the salon settings & permissions plan. Introduces multiple
-- professional roles per staff member, service capabilities, split-stage
-- capabilities and the assignment layer that drives price/time precedence.
-- This slice does NOT touch RBAC/access roles, invitations, catalog
-- resources, or the unified settings UI.
--
--   * ProfessionalRole      — what professional work a person can do
--                             (departments, allowed services, split-stage
--                             capabilities, default price/time, color/icon).
--                             It grants NO system access.
--   * StaffProfessionalRole — links a staff member to a professional role and
--                             carries the per-staff primacy signals used to
--                             resolve "which role applies for this service".
--
-- Additive and non-destructive:
--   * Two new tenant-scoped tables (salon_professional_roles,
--     salon_staff_professional_roles).
--   * salon_staff gains blocked_service_ids so a manual per-staff service
--     block can override any role-granted permission.
--
-- Both tables use the shared active | inactive | archived lifecycle. There is
-- no hard delete of a role that is still assigned; the API archives instead
-- and requires an explicit replacement/force to archive an assigned role.
--
-- Depends on migration 033 (salon_staff) and 09 (salons).
-- Idempotent (IF NOT EXISTS guards + guarded constraint creation).
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.salons') IS NULL THEN
    RAISE EXCEPTION '[040] salons is missing. Run migration 09 first.';
  END IF;
  IF to_regclass('public.salon_staff') IS NULL THEN
    RAISE EXCEPTION '[040] salon_staff is missing. Run migration 033 first.';
  END IF;
END $$;

-- ── 1. Professional roles catalog ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salon_professional_roles (
  id                        TEXT PRIMARY KEY DEFAULT 'sprole-' || gen_random_uuid()::text,
  salon_id                  TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name                      TEXT NOT NULL,
  department_ids            JSONB NOT NULL DEFAULT '[]',
  allowed_service_ids       JSONB NOT NULL DEFAULT '[]',
  stage_capabilities        JSONB NOT NULL DEFAULT '[]',
  default_price_cents       INTEGER,
  default_duration_minutes  INTEGER,
  color                     TEXT,
  icon                      TEXT,
  sort_order                INTEGER NOT NULL DEFAULT 0,
  status                    TEXT NOT NULL DEFAULT 'active',
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_professional_role_status CHECK (status IN ('active','inactive','archived'))
);
CREATE INDEX IF NOT EXISTS idx_salon_professional_roles_salon
  ON salon_professional_roles (salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_professional_roles_salon_status
  ON salon_professional_roles (salon_id, status);

-- ── 2. Staff <-> professional role assignments ────────────────────────────
-- is_primary marks the staff member's default role. primary_service_ids marks
-- the services for which this role is the primary one for the staff member,
-- resolving the ambiguity when several roles allow the same service.
CREATE TABLE IF NOT EXISTS salon_staff_professional_roles (
  id                      TEXT PRIMARY KEY DEFAULT 'ssprole-' || gen_random_uuid()::text,
  salon_id                TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_member_id         TEXT NOT NULL REFERENCES salon_staff(id) ON DELETE CASCADE,
  professional_role_id    TEXT NOT NULL REFERENCES salon_professional_roles(id) ON DELETE CASCADE,
  is_primary              BOOLEAN NOT NULL DEFAULT false,
  primary_service_ids     JSONB NOT NULL DEFAULT '[]',
  service_price_overrides JSONB NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_salon_staff_professional_role UNIQUE (staff_member_id, professional_role_id)
);
CREATE INDEX IF NOT EXISTS idx_salon_staff_professional_roles_salon
  ON salon_staff_professional_roles (salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_staff_professional_roles_staff
  ON salon_staff_professional_roles (staff_member_id);
CREATE INDEX IF NOT EXISTS idx_salon_staff_professional_roles_role
  ON salon_staff_professional_roles (professional_role_id);

-- ── 3. Manual per-staff service block ─────────────────────────────────────
-- A manual block always wins over a role that would otherwise allow the
-- service (see resolveServicePlan precedence).
ALTER TABLE salon_staff
  ADD COLUMN IF NOT EXISTS blocked_service_ids JSONB NOT NULL DEFAULT '[]';

-- ── End of migration 040 ──────────────────────────────────────────────────

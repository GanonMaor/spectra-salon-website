-- ============================================================
-- Migration 038: Identity foundation (staff <-> user linkage)
-- ============================================================
-- Slice A of the salon settings & permissions plan. Separates the
-- three identity concepts without touching professional roles, RBAC,
-- invitations, catalog resources, or the unified settings UI:
--
--   * StaffMember  — who works in the salon and appears on the calendar.
--                    May be active/inactive and bookable/not. Does NOT
--                    require a login user.
--   * CRMUser      — who can log into the system (crm_users, migration 09).
--   * Membership   — which salon a user accesses and with which access
--                    role (salon_memberships, migration 09).
--
-- This migration is additive and non-destructive:
--   * salon_staff gains user_id (optional link to crm_users), lifecycle
--     flags (is_bookable, is_active), employment window (start_date,
--     end_date), and display ordering (sort_order).
--   * A partial unique index guarantees a login user is linked to at most
--     one staff member per salon (prevents duplicate staff/user links),
--     while keeping the link optional and scoped per tenant.
--   * salon_memberships gains access_role_id so a membership can carry an
--     access role reference. The RBAC access-role catalog itself is a
--     later slice, so this column stays a nullable TEXT with no FK yet.
--
-- Depends on migration 033 (salon_staff) and 09 (crm_users, memberships).
-- Idempotent (IF NOT EXISTS guards + guarded constraint/index creation).
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.salon_staff') IS NULL THEN
    RAISE EXCEPTION '[038] salon_staff is missing. Run migration 033 first.';
  END IF;
  IF to_regclass('public.crm_users') IS NULL THEN
    RAISE EXCEPTION '[038] crm_users is missing. Run migration 09 first.';
  END IF;
  IF to_regclass('public.salon_memberships') IS NULL THEN
    RAISE EXCEPTION '[038] salon_memberships is missing. Run migration 09 first.';
  END IF;
END $$;

-- ── 1. salon_staff identity + lifecycle columns ───────────────────────────
ALTER TABLE salon_staff
  ADD COLUMN IF NOT EXISTS user_id     TEXT,
  ADD COLUMN IF NOT EXISTS is_bookable BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_active   BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS start_date  DATE,
  ADD COLUMN IF NOT EXISTS end_date    DATE,
  ADD COLUMN IF NOT EXISTS sort_order  INTEGER NOT NULL DEFAULT 0;

-- Optional FK to the login user. ON DELETE SET NULL so removing a login
-- user never deletes the staff member, their appointments, or history.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_salon_staff_user'
  ) THEN
    ALTER TABLE salon_staff
      ADD CONSTRAINT fk_salon_staff_user
      FOREIGN KEY (user_id) REFERENCES crm_users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- A login user maps to at most one staff member per salon. The link is
-- optional (NULL user_id rows are unconstrained) and scoped per tenant.
CREATE UNIQUE INDEX IF NOT EXISTS uq_salon_staff_salon_user
  ON salon_staff (salon_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_salon_staff_user
  ON salon_staff (user_id)
  WHERE user_id IS NOT NULL;

-- Keep the new is_active flag consistent with the pre-existing status column
-- for any rows that already exist. status remains the operational soft-delete
-- signal used by the runtime API; is_active is the lifecycle flag.
UPDATE salon_staff
  SET is_active = (status = 'active')
  WHERE is_active <> (status = 'active');

-- ── 2. salon_memberships access role reference ────────────────────────────
-- Nullable TEXT (no FK): the access-role catalog is introduced in a later
-- RBAC slice. Existing memberships keep their legacy `role` column untouched.
ALTER TABLE salon_memberships
  ADD COLUMN IF NOT EXISTS access_role_id TEXT;

CREATE INDEX IF NOT EXISTS idx_memberships_access_role
  ON salon_memberships (access_role_id)
  WHERE access_role_id IS NOT NULL;

-- ── End of migration 038 ──────────────────────────────────────────────────

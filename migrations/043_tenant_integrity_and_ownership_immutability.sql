-- ============================================================
-- Migration 043: Tenant-integrity constraints & ownership-audit immutability
-- ============================================================
-- Hardening follow-on to the identity/RBAC/invitation slices (038, 040, 041,
-- 042). Purely additive and non-destructive: it adds DB-level guarantees that
-- back the application-layer checks so a bug or a direct SQL write can never
-- cross tenant boundaries or mutate the ownership audit trail.
--
-- Four additive pieces:
--
--   1. Composite unique indexes (salon_id, id) on the tables that are referenced
--      across the tenant boundary. `id` is already the primary key, so these are
--      trivially unique; they exist only to serve as composite foreign-key
--      targets in piece 2.
--
--   2. Composite foreign keys that pin child rows to the SAME salon as their
--      parent:
--        * salon_staff_professional_roles(salon_id, staff_member_id)
--            → salon_staff(salon_id, id)
--        * salon_staff_professional_roles(salon_id, professional_role_id)
--            → salon_professional_roles(salon_id, id)
--        * salon_invitations(salon_id, membership_id)
--            → salon_memberships(salon_id, id)
--      They are added NOT VALID: existing rows are never rejected at deploy time
--      (so a bad legacy row cannot block the rollout), but the constraint is
--      fully enforced on every INSERT/UPDATE going forward. A later VALIDATE
--      CONSTRAINT can promote them once the data is confirmed clean.
--      (membership_id is nullable; MATCH SIMPLE skips the check when it is NULL,
--      so brand-new invitations that pre-date a membership still insert.)
--
--   3. A data-integrity CHECK that an invitation always carries at least one
--      delivery contact (email or phone), matching the JS channel resolver.
--
--   4. Append-only immutability for salon_ownership_events (migration 041),
--      mirroring the salon_audit_events guard: UPDATE/DELETE are rejected so the
--      ownership audit trail is tamper-evident at the database level.
--
-- Idempotent: guarded with IF NOT EXISTS / pg_constraint / pg_trigger checks.
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.salon_staff') IS NULL THEN
    RAISE EXCEPTION '[043] salon_staff is missing. Run the CRM runtime migrations first.';
  END IF;
  IF to_regclass('public.salon_memberships') IS NULL THEN
    RAISE EXCEPTION '[043] salon_memberships is missing. Run migration 09 first.';
  END IF;
  IF to_regclass('public.salon_professional_roles') IS NULL THEN
    RAISE EXCEPTION '[043] salon_professional_roles is missing. Run migration 040 first.';
  END IF;
  IF to_regclass('public.salon_invitations') IS NULL THEN
    RAISE EXCEPTION '[043] salon_invitations is missing. Run migration 042 first.';
  END IF;
  IF to_regclass('public.salon_ownership_events') IS NULL THEN
    RAISE EXCEPTION '[043] salon_ownership_events is missing. Run migration 041 first.';
  END IF;
END $$;

-- ── 1. Composite unique indexes (foreign-key targets) ─────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS uq_salon_staff_tenant
  ON salon_staff (salon_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_salon_professional_roles_tenant
  ON salon_professional_roles (salon_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_salon_memberships_tenant
  ON salon_memberships (salon_id, id);

-- ── 2. Composite (same-salon) foreign keys, enforced on new writes ────────
DO $$ BEGIN
  -- assignment.staff_member_id must belong to the assignment's salon
  IF to_regclass('public.salon_staff_professional_roles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sspr_staff_tenant') THEN
    ALTER TABLE salon_staff_professional_roles
      ADD CONSTRAINT fk_sspr_staff_tenant
      FOREIGN KEY (salon_id, staff_member_id)
      REFERENCES salon_staff (salon_id, id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;

  -- assignment.professional_role_id must belong to the assignment's salon
  IF to_regclass('public.salon_staff_professional_roles') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sspr_role_tenant') THEN
    ALTER TABLE salon_staff_professional_roles
      ADD CONSTRAINT fk_sspr_role_tenant
      FOREIGN KEY (salon_id, professional_role_id)
      REFERENCES salon_professional_roles (salon_id, id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;

  -- invitation.membership_id (when present) must belong to the invitation's salon
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_invitation_membership_tenant') THEN
    ALTER TABLE salon_invitations
      ADD CONSTRAINT fk_invitation_membership_tenant
      FOREIGN KEY (salon_id, membership_id)
      REFERENCES salon_memberships (salon_id, id)
      ON DELETE CASCADE
      NOT VALID;
  END IF;
END $$;

-- ── 3. An invitation must carry at least one delivery contact ─────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_invitation_contact_present') THEN
    ALTER TABLE salon_invitations
      ADD CONSTRAINT chk_invitation_contact_present
      CHECK (email IS NOT NULL OR phone IS NOT NULL)
      NOT VALID;
  END IF;
END $$;

-- ── 4. Ownership audit trail: append-only (reject UPDATE/DELETE) ──────────
CREATE OR REPLACE FUNCTION salon_ownership_events_no_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'salon_ownership_events is append-only (% not allowed)', TG_OP;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_salon_ownership_events_no_mutation'
  ) THEN
    CREATE TRIGGER trg_salon_ownership_events_no_mutation
      BEFORE UPDATE OR DELETE ON salon_ownership_events
      FOR EACH ROW EXECUTE FUNCTION salon_ownership_events_no_mutation();
  END IF;
END $$;

-- ── End of migration 043 ───────────────────────────────────────────────────

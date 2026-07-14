-- ============================================================
-- Migration 042: Access invitations, activation lifecycle & audit
-- ============================================================
-- Phase E of the salon settings/permissions plan. Additive, non-destructive
-- follow-on to the identity foundation (038) and access RBAC / owner safety
-- (041_access_rbac_owner_safety).
--
-- Four additive pieces:
--
--   1. salon_memberships access lifecycle — a `status` enum-ish TEXT
--      (invited | accepted | active | suspended | revoked), the timestamps that
--      go with it, and `sessions_valid_after`. Existing rows default to
--      'active'. `sessions_valid_after` is the stateless-session revocation
--      primitive: a signed session whose `iat` predates it is no longer valid,
--      so suspending/revoking access invalidates existing sessions without
--      touching the staff member, appointments, or history.
--
--   2. salon_invitations — personal, single-use access invitations. The code is
--      NEVER stored: only a per-row salt + SHA-256 hash. Carries channel
--      (email | phone | both), expiry, an attempt counter with a limit, and a
--      status. Resending supersedes prior pending invitations for the same
--      target (enforced by the JS lifecycle + a partial unique index).
--
--   3. salon_audit_events — the append-only audit log across all domains
--      (actor, salon, timestamp, action, entity type/id, before/after JSON,
--      optional reason, IP/device). Append-only is enforced by a trigger that
--      rejects UPDATE/DELETE.
--
-- Depends on migration 09 (salons, crm_users, salon_memberships),
-- 038_identity_foundation (salon_memberships.access_role_id) and
-- 041_access_rbac_owner_safety (access_roles). Idempotent (IF NOT EXISTS
-- guards + guarded constraint/index/trigger creation).
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.salons') IS NULL THEN
    RAISE EXCEPTION '[042] salons is missing. Run migration 09 first.';
  END IF;
  IF to_regclass('public.salon_memberships') IS NULL THEN
    RAISE EXCEPTION '[042] salon_memberships is missing. Run migration 09 first.';
  END IF;
  IF to_regclass('public.crm_users') IS NULL THEN
    RAISE EXCEPTION '[042] crm_users is missing. Run migration 09 first.';
  END IF;
END $$;

-- ── 1. Membership access lifecycle + session invalidation primitive ────────
ALTER TABLE salon_memberships
  ADD COLUMN IF NOT EXISTS status               TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS invited_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activated_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoked_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sessions_valid_after TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ DEFAULT now();

-- Lifecycle allow-list. Legacy rows already carry an operational role and are
-- treated as 'active'; the CHECK stays lenient by only constraining the known
-- states so a bad write fails fast without breaking historical data.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_membership_status'
  ) THEN
    ALTER TABLE salon_memberships
      ADD CONSTRAINT chk_membership_status
      CHECK (status IN ('invited','accepted','active','suspended','revoked'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_memberships_status
  ON salon_memberships (salon_id, status);

-- ── 2. salon_invitations (personal, single-use, hashed code) ───────────────
-- code_hash = sha256(code_salt || ':' || code). The raw code is delivered
-- out-of-band (email/SMS) and never persisted. `status`:
--   pending  → outstanding, redeemable while not expired and attempts remain
--   accepted → redeemed once; terminal
--   revoked  → superseded by a resend or explicitly cancelled; terminal
--   expired  → past expires_at (also derived at read time); terminal
CREATE TABLE IF NOT EXISTS salon_invitations (
  id                TEXT PRIMARY KEY DEFAULT 'sinv-' || gen_random_uuid()::text,
  salon_id          TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  -- Optional link to an already-provisioned membership/user. For a brand-new
  -- invitee both stay NULL until acceptance creates the user + membership.
  membership_id     TEXT REFERENCES salon_memberships(id) ON DELETE CASCADE,
  invited_user_id   TEXT REFERENCES crm_users(id) ON DELETE SET NULL,
  -- Target channel(s). At least one of email/phone is required (JS-enforced).
  email             TEXT,
  phone             TEXT,
  channel           TEXT NOT NULL DEFAULT 'email',  -- email | phone | both
  -- Access to grant on acceptance.
  access_role_id    TEXT,
  role              TEXT,                            -- legacy coarse role fallback
  -- Hashed single-use code + anti-precompute salt.
  code_salt         TEXT NOT NULL,
  code_hash         TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | revoked | expired
  expires_at        TIMESTAMPTZ NOT NULL,
  attempt_count     INTEGER NOT NULL DEFAULT 0,
  max_attempts      INTEGER NOT NULL DEFAULT 5,
  invited_by_user_id TEXT,
  accepted_user_id  TEXT,
  accepted_at       TIMESTAMPTZ,
  revoked_at        TIMESTAMPTZ,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_invitation_status'
  ) THEN
    ALTER TABLE salon_invitations
      ADD CONSTRAINT chk_invitation_status
      CHECK (status IN ('pending','accepted','revoked','expired'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_invitation_channel'
  ) THEN
    ALTER TABLE salon_invitations
      ADD CONSTRAINT chk_invitation_channel
      CHECK (channel IN ('email','phone','both'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_invitations_salon
  ON salon_invitations (salon_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_email
  ON salon_invitations (salon_id, lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_phone
  ON salon_invitations (salon_id, phone) WHERE phone IS NOT NULL;

-- At most one *pending* invitation per (salon, email) and per (salon, phone):
-- a resend must first revoke/supersede the prior pending code (JS lifecycle),
-- and this index is the backstop that guarantees the invariant.
CREATE UNIQUE INDEX IF NOT EXISTS uq_invitations_pending_email
  ON salon_invitations (salon_id, lower(email))
  WHERE status = 'pending' AND email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_invitations_pending_phone
  ON salon_invitations (salon_id, phone)
  WHERE status = 'pending' AND phone IS NOT NULL;

-- ── 3. salon_audit_events (append-only audit log) ──────────────────────────
CREATE TABLE IF NOT EXISTS salon_audit_events (
  id            TEXT PRIMARY KEY DEFAULT 'saud-' || gen_random_uuid()::text,
  salon_id      TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  actor_user_id TEXT,
  action        TEXT NOT NULL,   -- permission_change | invite | invite_resend |
                                 -- invite_revoke | accept | access_suspend |
                                 -- access_revoke | access_reactivate |
                                 -- ownership_transfer | price_change |
                                 -- catalog_archive | resource_change | staff_change
  entity_type   TEXT,
  entity_id     TEXT,
  before_state  JSONB,
  after_state   JSONB,
  reason        TEXT,
  ip_address    TEXT,
  device        TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_salon
  ON salon_audit_events (salon_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_action
  ON salon_audit_events (salon_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity
  ON salon_audit_events (salon_id, entity_type, entity_id);

-- Append-only: reject UPDATE and DELETE so the log stays immutable.
CREATE OR REPLACE FUNCTION salon_audit_events_no_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'salon_audit_events is append-only (% not allowed)', TG_OP;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_salon_audit_events_no_mutation'
  ) THEN
    CREATE TRIGGER trg_salon_audit_events_no_mutation
      BEFORE UPDATE OR DELETE ON salon_audit_events
      FOR EACH ROW EXECUTE FUNCTION salon_audit_events_no_mutation();
  END IF;
END $$;

-- ── End of migration 042 ───────────────────────────────────────────────────

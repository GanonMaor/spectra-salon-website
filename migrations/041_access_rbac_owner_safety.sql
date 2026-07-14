-- ============================================================
-- Migration 041: Access RBAC & owner safety
-- ============================================================
-- Phase D of the salon settings/permissions plan. Additive follow-on to the
-- identity foundation (migration 038_identity_foundation, which already added
-- salon_memberships.access_role_id as a nullable TEXT reference).
--
-- Three additive, non-destructive changes:
--
--   1. access_roles — the data-backed permission matrix. Each role grants a
--      set of `domain.action@scope` tuples (JSONB array, or the "*" wildcard
--      for the owner). System roles (salon_id IS NULL) ship the seven starting
--      profiles from the plan; a salon may later add its own rows. The JS
--      resolver (lib/access-permissions.js) is the runtime source of truth and
--      MUST stay in sync with the seeded grants here.
--
--   2. Backfill salon_memberships.access_role_id from the legacy coarse `role`
--      column onto the matching system role. The legacy `role` column is left
--      untouched for backward compatibility.
--
--   3. salon_ownership_events — an append-only primitive that records ownership
--      transfers / owner-safety actions (actor, from/to user, action, reason).
--      The full audit log across all domains is a later slice; this table only
--      covers the owner-safety/transfer primitives introduced in Phase D.
--
-- Depends on migration 09 (salons, crm_users, salon_memberships) and
-- 038_identity_foundation (salon_memberships.access_role_id). Idempotent
-- (IF NOT EXISTS guards + ON CONFLICT DO NOTHING + guarded index creation).
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.salons') IS NULL THEN
    RAISE EXCEPTION '[041] salons is missing. Run migration 09 first.';
  END IF;
  IF to_regclass('public.salon_memberships') IS NULL THEN
    RAISE EXCEPTION '[041] salon_memberships is missing. Run migration 09 first.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'salon_memberships' AND column_name = 'access_role_id'
  ) THEN
    RAISE EXCEPTION '[041] salon_memberships.access_role_id is missing. Run migration 038_identity_foundation first.';
  END IF;
END $$;

-- ── 1. access_roles catalog ───────────────────────────────────────────────
-- salon_id NULL  → global system role usable by every salon.
-- salon_id set   → salon-specific custom role (future slices/UI).
-- grants         → JSONB array of `domain.action@scope` strings, or ["*"].
CREATE TABLE IF NOT EXISTS access_roles (
  id          TEXT PRIMARY KEY DEFAULT 'arole-' || gen_random_uuid()::text,
  salon_id    TEXT REFERENCES salons(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  is_system   BOOLEAN NOT NULL DEFAULT false,
  rank        INTEGER NOT NULL DEFAULT 0,
  grants      JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- One row per key within the global catalog, and one per key within a salon.
CREATE UNIQUE INDEX IF NOT EXISTS uq_access_roles_system_key
  ON access_roles (key) WHERE salon_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_access_roles_salon_key
  ON access_roles (salon_id, key) WHERE salon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_access_roles_salon
  ON access_roles (salon_id) WHERE salon_id IS NOT NULL;

-- ── 2. Seed the seven system roles ────────────────────────────────────────
-- Owner, service_provider and assistant carry small literal grant sets; the
-- larger matrices (manager, reception, inventory, viewer) are computed below to
-- avoid drift and keep the seed readable.
INSERT INTO access_roles (id, salon_id, key, name, description, is_system, rank, grants) VALUES
  ('arole-owner', NULL, 'owner', 'Owner',
   'Full access to everything, including permissions and ownership.', true, 100,
   '["*"]'::jsonb),
  ('arole-manager', NULL, 'manager', 'Manager',
   'Manage staff, services, inventory, appointments and customers (no permission management).', true, 90,
   '[]'::jsonb),
  ('arole-reception', NULL, 'reception', 'Reception',
   'Front-desk: manage appointments and customers; view staff and services.', true, 60,
   '[]'::jsonb),
  ('arole-service_provider', NULL, 'service_provider', 'Service provider',
   'Works the calendar: view/update own appointments; view services and customers.', true, 50,
   '["appointments.view@assigned_staff","appointments.update@assigned_staff","customers.view@salon","services.view@salon","staff.view@self"]'::jsonb),
  ('arole-inventory', NULL, 'inventory', 'Inventory / operations',
   'Manage inventory; view services.', true, 45,
   '[]'::jsonb),
  ('arole-assistant', NULL, 'assistant', 'Assistant',
   'Supports providers: view assigned appointments and services.', true, 40,
   '["appointments.view@assigned_staff","services.view@salon","staff.view@self"]'::jsonb),
  ('arole-viewer', NULL, 'viewer', 'Viewer',
   'Read-only across the salon.', true, 10,
   '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- manager: {staff,services,inventory,appointments,customers,settings} ×
--          {view,create,update,archive,approve,export} @salon
UPDATE access_roles SET grants = (
  SELECT jsonb_agg(d || '.' || a || '@salon' ORDER BY d, a)
  FROM unnest(ARRAY['staff','services','inventory','appointments','customers','settings']) AS d
  CROSS JOIN unnest(ARRAY['view','create','update','archive','approve','export']) AS a
), updated_at = now()
WHERE id = 'arole-manager' AND grants = '[]'::jsonb;

-- reception: {appointments,customers} × {view,create,update} @salon + staff/services view
UPDATE access_roles SET grants = (
  SELECT jsonb_agg(d || '.' || a || '@salon' ORDER BY d, a)
  FROM unnest(ARRAY['appointments','customers']) AS d
  CROSS JOIN unnest(ARRAY['view','create','update']) AS a
) || '["staff.view@salon","services.view@salon"]'::jsonb, updated_at = now()
WHERE id = 'arole-reception' AND grants = '[]'::jsonb;

-- inventory: inventory × {view,create,update,archive} @salon + services view
UPDATE access_roles SET grants = (
  SELECT jsonb_agg('inventory.' || a || '@salon' ORDER BY a)
  FROM unnest(ARRAY['view','create','update','archive']) AS a
) || '["services.view@salon"]'::jsonb, updated_at = now()
WHERE id = 'arole-inventory' AND grants = '[]'::jsonb;

-- viewer: {staff,services,inventory,appointments,customers}.view@salon
UPDATE access_roles SET grants = (
  SELECT jsonb_agg(d || '.view@salon' ORDER BY d)
  FROM unnest(ARRAY['staff','services','inventory','appointments','customers']) AS d
), updated_at = now()
WHERE id = 'arole-viewer' AND grants = '[]'::jsonb;

-- ── 3. Backfill memberships onto the system roles ─────────────────────────
-- Map the legacy coarse role to a system access role. Only fills rows that do
-- not already carry an access_role_id; the legacy `role` column is preserved.
UPDATE salon_memberships m
SET access_role_id = 'arole-' || CASE lower(trim(m.role))
    WHEN 'owner'            THEN 'owner'
    WHEN 'manager'          THEN 'manager'
    WHEN 'stylist'          THEN 'service_provider'
    WHEN 'service_provider' THEN 'service_provider'
    WHEN 'reception'        THEN 'reception'
    WHEN 'receptionist'     THEN 'reception'
    WHEN 'assistant'        THEN 'assistant'
    WHEN 'inventory'        THEN 'inventory'
    WHEN 'operations'       THEN 'inventory'
    WHEN 'viewer'           THEN 'viewer'
  END
WHERE m.access_role_id IS NULL
  AND lower(trim(m.role)) IN (
    'owner','manager','stylist','service_provider','reception',
    'receptionist','assistant','inventory','operations','viewer'
  );

-- ── 4. Ownership-safety / transfer audit primitive (append-only) ──────────
CREATE TABLE IF NOT EXISTS salon_ownership_events (
  id            TEXT PRIMARY KEY DEFAULT 'sowe-' || gen_random_uuid()::text,
  salon_id      TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  actor_user_id TEXT,
  from_user_id  TEXT,
  to_user_id    TEXT,
  action        TEXT NOT NULL,   -- transfer | add_owner | remove_owner | reauth
  reason        TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_salon_ownership_events_salon
  ON salon_ownership_events (salon_id, created_at DESC);

-- ── End of migration 041 ──────────────────────────────────────────────────

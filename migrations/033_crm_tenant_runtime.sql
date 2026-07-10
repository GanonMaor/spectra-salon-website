-- ============================================================
-- Migration 033: CRM Tenant Runtime Tables
-- ============================================================
-- Phase A foundation for a truly multi-tenant CRM. Introduces the core
-- salon-scoped CRM entities so runtime APIs can derive salon_id from the
-- authenticated session and every row is isolated by tenant.
--
-- Scope of this migration (additive, non-destructive):
--   * salon_service_categories
--   * salon_services
--   * salon_departments
--   * salon_staff
--   * salon_customers
--   * salon_appointments
--   * salon_appointment_segments
--
-- Every table carries salon_id and is indexed by salon_id first. Foreign keys
-- stay within the same tenant. This migration only creates tables/indexes; it
-- never mutates existing data. Inventory/catalog tables (026-032) are the
-- authority for products and remain unchanged.
--
-- Depends on migration 09 (salons). Idempotent (IF NOT EXISTS).
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.salons') IS NULL THEN
    RAISE EXCEPTION '[033] salons is missing. Run migration 09 first.';
  END IF;
END $$;

-- ── 1. salon_service_categories ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salon_service_categories (
  id             TEXT PRIMARY KEY DEFAULT 'ssc-' || gen_random_uuid()::text,
  salon_id       TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  accent_color   TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_service_category_status CHECK (status IN ('active','archived'))
);
CREATE INDEX IF NOT EXISTS idx_salon_service_categories_salon
  ON salon_service_categories (salon_id);

-- ── 2. salon_departments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salon_departments (
  id             TEXT PRIMARY KEY DEFAULT 'sdep-' || gen_random_uuid()::text,
  salon_id       TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  calendar_label TEXT,
  calendar_color TEXT,
  booking_mode   TEXT,
  is_calendar_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_department_status CHECK (status IN ('active','archived'))
);
CREATE INDEX IF NOT EXISTS idx_salon_departments_salon
  ON salon_departments (salon_id);

-- ── 3. salon_services ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salon_services (
  id                        TEXT PRIMARY KEY DEFAULT 'ssvc-' || gen_random_uuid()::text,
  salon_id                  TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  category_id               TEXT REFERENCES salon_service_categories(id) ON DELETE SET NULL,
  department_id             TEXT REFERENCES salon_departments(id) ON DELETE SET NULL,
  name                      TEXT NOT NULL,
  default_duration_minutes  INTEGER NOT NULL DEFAULT 60,
  default_price_cents       INTEGER NOT NULL DEFAULT 0,
  default_material_cost_cents INTEGER NOT NULL DEFAULT 0,
  status                    TEXT NOT NULL DEFAULT 'active',
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_service_status CHECK (status IN ('active','archived'))
);
CREATE INDEX IF NOT EXISTS idx_salon_services_salon
  ON salon_services (salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_services_salon_category
  ON salon_services (salon_id, category_id);

-- ── 4. salon_staff ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salon_staff (
  id             TEXT PRIMARY KEY DEFAULT 'sstf-' || gen_random_uuid()::text,
  salon_id       TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  role           TEXT,
  color          TEXT,
  avatar_url     TEXT,
  email          TEXT,
  phone          TEXT,
  department_ids JSONB NOT NULL DEFAULT '[]',
  service_ids    JSONB NOT NULL DEFAULT '[]',
  service_price_overrides JSONB NOT NULL DEFAULT '{}',
  working_hours  JSONB NOT NULL DEFAULT '[]',
  rating         NUMERIC(3,2) NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_staff_status CHECK (status IN ('active','inactive'))
);
CREATE INDEX IF NOT EXISTS idx_salon_staff_salon
  ON salon_staff (salon_id);

-- ── 5. salon_customers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salon_customers (
  id             TEXT PRIMARY KEY DEFAULT 'scst-' || gen_random_uuid()::text,
  salon_id       TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  first_name     TEXT NOT NULL,
  last_name      TEXT,
  phone          TEXT,
  email          TEXT,
  notes          TEXT,
  tags           JSONB NOT NULL DEFAULT '[]',
  avatar_url     TEXT,
  is_vip         BOOLEAN NOT NULL DEFAULT false,
  status         TEXT NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_customer_status CHECK (status IN ('active','inactive','archived'))
);
CREATE INDEX IF NOT EXISTS idx_salon_customers_salon
  ON salon_customers (salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_customers_salon_phone
  ON salon_customers (salon_id, phone);

-- ── 6. salon_appointments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salon_appointments (
  id                  TEXT PRIMARY KEY DEFAULT 'sappt-' || gen_random_uuid()::text,
  salon_id            TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_member_id     TEXT REFERENCES salon_staff(id) ON DELETE SET NULL,
  customer_id         TEXT REFERENCES salon_customers(id) ON DELETE SET NULL,
  customer_name       TEXT NOT NULL DEFAULT '',
  service_id          TEXT REFERENCES salon_services(id) ON DELETE SET NULL,
  service_name        TEXT NOT NULL DEFAULT '',
  service_category_id TEXT,
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'confirmed',
  notes               TEXT,
  group_id            TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_appointment_status CHECK (
    status IN ('confirmed','in-progress','completed','cancelled','no-show')
  )
);
CREATE INDEX IF NOT EXISTS idx_salon_appointments_salon
  ON salon_appointments (salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_appointments_salon_start
  ON salon_appointments (salon_id, start_time);
CREATE INDEX IF NOT EXISTS idx_salon_appointments_salon_staff_start
  ON salon_appointments (salon_id, staff_member_id, start_time);

-- ── 7. salon_appointment_segments ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salon_appointment_segments (
  id                  TEXT PRIMARY KEY DEFAULT 'sseg-' || gen_random_uuid()::text,
  salon_id            TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  appointment_id      TEXT NOT NULL REFERENCES salon_appointments(id) ON DELETE CASCADE,
  staff_member_id     TEXT REFERENCES salon_staff(id) ON DELETE SET NULL,
  resource_id         TEXT,
  service_id          TEXT REFERENCES salon_services(id) ON DELETE SET NULL,
  service_name        TEXT,
  service_category_id TEXT,
  segment_type        TEXT NOT NULL DEFAULT 'service',
  label               TEXT NOT NULL DEFAULT '',
  start_time          TIMESTAMPTZ NOT NULL,
  end_time            TIMESTAMPTZ NOT NULL,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  product_grams       NUMERIC(12,3),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_salon_appointment_segments_salon
  ON salon_appointment_segments (salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_appointment_segments_appointment
  ON salon_appointment_segments (appointment_id);

-- ── End of migration 033 ─────────────────────────────────────────────────

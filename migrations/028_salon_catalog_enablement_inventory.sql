-- ============================================================
-- Migration 028: Salon Brand Enablement + Salon Inventory
-- ============================================================
-- Phase 3 of the multi-tenant catalog + salon inventory plan.
--
-- Introduces the salon-runtime layer on top of the global catalog:
--   * salon_enabled_brands      — which catalog brands a salon works with
--   * salon_inventory_products  — a salon's local record for a global product
--                                 (stock, price, visibility, favorites, etc.)
--   * salon_product_usage       — weighing / usage events, scoped by salon
--   * legacy_inventory_migration_review — staging report for legacy rows that
--                                 could not be mapped to a catalog product
--
-- Every salon-owned row carries salon_id and every tenant query path is
-- indexed by salon_id first, keeping tenants isolated and fast.
--
-- Depends on:
--   * migration 026 (catalog_brands, catalog_products)
--   * migration 09  (salons)
-- Non-destructive: creates tables/indexes only, no data mutation.
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.catalog_brands') IS NULL THEN
    RAISE EXCEPTION '[028] catalog_brands is missing. Run migration 026 first.';
  END IF;
  IF to_regclass('public.catalog_products') IS NULL THEN
    RAISE EXCEPTION '[028] catalog_products is missing. Run migration 026 first.';
  END IF;
  IF to_regclass('public.salons') IS NULL THEN
    RAISE EXCEPTION '[028] salons is missing. Run migration 09 first.';
  END IF;
END $$;

-- ── 1. salon_enabled_brands ───────────────────────────────────────────────
-- V1 uses brand-level enablement. Product-line enablement can be layered on
-- later without changing this table.

CREATE TABLE IF NOT EXISTS salon_enabled_brands (
  id                TEXT PRIMARY KEY DEFAULT 'seb-' || gen_random_uuid()::text,
  salon_id          TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  brand_id          TEXT NOT NULL REFERENCES catalog_brands(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL DEFAULT 'enabled',
  enabled_by_user_id TEXT,
  enabled_at        TIMESTAMPTZ DEFAULT now(),
  disabled_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_enabled_brand_status CHECK (status IN ('enabled','disabled'))
);

-- A brand can only be actively enabled once per salon.
CREATE UNIQUE INDEX IF NOT EXISTS uidx_salon_enabled_brand_active
  ON salon_enabled_brands (salon_id, brand_id)
  WHERE status = 'enabled';

CREATE INDEX IF NOT EXISTS idx_salon_enabled_brands_salon
  ON salon_enabled_brands (salon_id);

CREATE INDEX IF NOT EXISTS idx_salon_enabled_brands_salon_status
  ON salon_enabled_brands (salon_id, status);

CREATE INDEX IF NOT EXISTS idx_salon_enabled_brands_brand
  ON salon_enabled_brands (brand_id);

-- ── 2. salon_inventory_products ───────────────────────────────────────────
-- The salon's private, local record for a global catalog product. The global
-- product is shared; everything here (stock, pricing, visibility, favorites,
-- local barcode override) is per salon.

CREATE TABLE IF NOT EXISTS salon_inventory_products (
  id                    TEXT PRIMARY KEY DEFAULT 'sinv-' || gen_random_uuid()::text,
  salon_id              TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  product_id            TEXT NOT NULL REFERENCES catalog_products(id) ON DELETE RESTRICT,

  -- Stock
  units_in_stock        NUMERIC(12,3) NOT NULL DEFAULT 0,
  min_stock             NUMERIC(12,3) NOT NULL DEFAULT 0,

  -- Pricing (currency stored per amount so mixed-currency salons stay correct)
  cost_amount           NUMERIC(12,2),
  cost_currency         TEXT DEFAULT 'ILS',
  sell_price_amount     NUMERIC(12,2),
  sell_price_currency   TEXT DEFAULT 'ILS',

  -- Local presentation / behavior
  is_visible            BOOLEAN NOT NULL DEFAULT true,
  is_favorite           BOOLEAN NOT NULL DEFAULT false,
  local_barcode_override TEXT,
  local_display_name    TEXT,

  status                TEXT NOT NULL DEFAULT 'active',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_inventory_status CHECK (status IN ('active','archived'))
);

-- One local inventory record per (salon, global product).
CREATE UNIQUE INDEX IF NOT EXISTS uidx_salon_inventory_salon_product
  ON salon_inventory_products (salon_id, product_id);

CREATE INDEX IF NOT EXISTS idx_salon_inventory_salon
  ON salon_inventory_products (salon_id);

CREATE INDEX IF NOT EXISTS idx_salon_inventory_salon_visible
  ON salon_inventory_products (salon_id, is_visible)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_salon_inventory_salon_favorite
  ON salon_inventory_products (salon_id, is_favorite)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_salon_inventory_low_stock
  ON salon_inventory_products (salon_id)
  WHERE units_in_stock <= min_stock AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_salon_inventory_local_barcode
  ON salon_inventory_products (salon_id, local_barcode_override)
  WHERE local_barcode_override IS NOT NULL;

-- ── 3. salon_product_usage ────────────────────────────────────────────────
-- Weighing / color / usage events. Always scoped by salon and linked to both
-- the global product and the salon's local inventory record.

CREATE TABLE IF NOT EXISTS salon_product_usage (
  id                    TEXT PRIMARY KEY DEFAULT 'suse-' || gen_random_uuid()::text,
  salon_id              TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  product_id            TEXT NOT NULL REFERENCES catalog_products(id) ON DELETE RESTRICT,
  inventory_product_id  TEXT REFERENCES salon_inventory_products(id) ON DELETE SET NULL,
  visit_id              TEXT,
  customer_id           TEXT,
  staff_member_id       TEXT,
  quantity              NUMERIC(12,3) NOT NULL DEFAULT 0,
  unit                  TEXT NOT NULL DEFAULT 'g',
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_usage_unit CHECK (unit IN ('g','ml','unit'))
);

CREATE INDEX IF NOT EXISTS idx_salon_usage_salon
  ON salon_product_usage (salon_id);

CREATE INDEX IF NOT EXISTS idx_salon_usage_salon_recorded
  ON salon_product_usage (salon_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_salon_usage_salon_product
  ON salon_product_usage (salon_id, product_id);

CREATE INDEX IF NOT EXISTS idx_salon_usage_inventory
  ON salon_product_usage (inventory_product_id)
  WHERE inventory_product_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_salon_usage_visit
  ON salon_product_usage (salon_id, visit_id)
  WHERE visit_id IS NOT NULL;

-- ── 4. legacy_inventory_migration_review ──────────────────────────────────
-- Backfilling legacy inventory_products (migration 15) into
-- salon_inventory_products must be dry-run first. Rows that cannot be
-- confidently matched to a catalog_products row land here for human review
-- rather than being auto-linked to an ambiguous product.

CREATE TABLE IF NOT EXISTS legacy_inventory_migration_review (
  id                    TEXT PRIMARY KEY DEFAULT 'linv-' || gen_random_uuid()::text,
  salon_id              TEXT NOT NULL,
  legacy_inventory_id   TEXT NOT NULL,
  legacy_snapshot       JSONB NOT NULL DEFAULT '{}',
  match_status          TEXT NOT NULL DEFAULT 'unmatched',
  matched_product_id    TEXT,
  match_confidence      TEXT NOT NULL DEFAULT 'none',
  reason                TEXT,
  reviewed              BOOLEAN NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_legacy_match_status CHECK (
    match_status IN ('matched','ambiguous','unmatched','skipped')
  ),
  CONSTRAINT chk_legacy_match_confidence CHECK (
    match_confidence IN ('high','medium','low','none')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uidx_legacy_inventory_review_row
  ON legacy_inventory_migration_review (salon_id, legacy_inventory_id);

CREATE INDEX IF NOT EXISTS idx_legacy_inventory_review_status
  ON legacy_inventory_migration_review (match_status);

-- ── 5. updated_at triggers (reuse shared function if present) ─────────────

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
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_salon_enabled_brands_updated_at') THEN
    CREATE TRIGGER trg_salon_enabled_brands_updated_at
      BEFORE UPDATE ON salon_enabled_brands
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_salon_inventory_products_updated_at') THEN
    CREATE TRIGGER trg_salon_inventory_products_updated_at
      BEFORE UPDATE ON salon_inventory_products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ── End of migration 028 ─────────────────────────────────────────────────

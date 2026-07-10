-- ============================================================
-- Migration 031: Salon Product-Line Enablement
-- ============================================================
-- Adds optional series/product-line enablement under an enabled brand.
--
-- V1 behavior:
--   * Brand enablement is required.
--   * Product-line enablement is optional.
--   * If a salon has enabled lines for a brand, default runtime search only
--     includes those lines for that brand.
--   * If no lines are enabled for a brand, the whole enabled brand remains in
--     scope.
--
-- Non-destructive: this never deletes inventory, usage, mix history, or
-- preferences. It only controls default product search scope.
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.salons') IS NULL THEN
    RAISE EXCEPTION '[031] salons is missing. Run migration 09 first.';
  END IF;
  IF to_regclass('public.catalog_brands') IS NULL THEN
    RAISE EXCEPTION '[031] catalog_brands is missing. Run migration 026 first.';
  END IF;
  IF to_regclass('public.catalog_product_lines') IS NULL THEN
    RAISE EXCEPTION '[031] catalog_product_lines is missing. Run migration 026 first.';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS salon_enabled_product_lines (
  id                  TEXT PRIMARY KEY DEFAULT 'sepl-' || gen_random_uuid()::text,
  salon_id            TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  brand_id            TEXT NOT NULL REFERENCES catalog_brands(id) ON DELETE RESTRICT,
  product_line_id     TEXT NOT NULL REFERENCES catalog_product_lines(id) ON DELETE RESTRICT,
  status              TEXT NOT NULL DEFAULT 'enabled',
  enabled_by_user_id  TEXT,
  enabled_at          TIMESTAMPTZ DEFAULT now(),
  disabled_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_salon_enabled_product_line_status CHECK (status IN ('enabled','disabled'))
);

-- A product line can only be actively enabled once per salon.
CREATE UNIQUE INDEX IF NOT EXISTS uidx_salon_enabled_product_line_active
  ON salon_enabled_product_lines (salon_id, product_line_id)
  WHERE status = 'enabled';

CREATE INDEX IF NOT EXISTS idx_salon_enabled_product_lines_salon_brand_status
  ON salon_enabled_product_lines (salon_id, brand_id, status);

CREATE INDEX IF NOT EXISTS idx_salon_enabled_product_lines_salon_line
  ON salon_enabled_product_lines (salon_id, product_line_id);

CREATE INDEX IF NOT EXISTS idx_salon_enabled_product_lines_brand
  ON salon_enabled_product_lines (brand_id);

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
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_salon_enabled_product_lines_updated_at') THEN
    CREATE TRIGGER trg_salon_enabled_product_lines_updated_at
      BEFORE UPDATE ON salon_enabled_product_lines
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ── End of migration 031 ─────────────────────────────────────────────────

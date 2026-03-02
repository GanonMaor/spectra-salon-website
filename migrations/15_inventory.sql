-- Migration 15: Inventory Management Schema
-- Brands, product lines, inventory products, and stock change audit trail.

-- ── 1. Brands (lookup) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    logo_url    TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- ── 2. Product lines (sub-line / family, linked to brand) ─────────
CREATE TABLE IF NOT EXISTS product_lines (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    brand_id    TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE(brand_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_product_lines_brand ON product_lines(brand_id);

-- ── 3. Inventory products (per salon) ─────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_products (
    id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    salon_id          TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    brand_id          TEXT NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    product_line_id   TEXT NOT NULL REFERENCES product_lines(id) ON DELETE RESTRICT,
    shade_code        TEXT NOT NULL,
    display_name      TEXT,
    level             INTEGER,
    size_grams        REAL DEFAULT 50,
    barcode           TEXT,
    is_visible        BOOLEAN NOT NULL DEFAULT true,
    cost_usd          NUMERIC(10,2) DEFAULT 0,
    selling_price_usd NUMERIC(10,2) DEFAULT 0,
    margin_pct        NUMERIC(6,2) DEFAULT 0,
    min_stock         INTEGER NOT NULL DEFAULT 0,
    units_in_stock    INTEGER NOT NULL DEFAULT 0,
    status            TEXT NOT NULL DEFAULT 'active',
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now(),
    UNIQUE(salon_id, brand_id, product_line_id, shade_code)
);

CREATE INDEX IF NOT EXISTS idx_inv_products_salon ON inventory_products(salon_id);
CREATE INDEX IF NOT EXISTS idx_inv_products_salon_brand ON inventory_products(salon_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_inv_products_salon_line ON inventory_products(salon_id, product_line_id);
CREATE INDEX IF NOT EXISTS idx_inv_products_salon_visible ON inventory_products(salon_id, is_visible);
CREATE INDEX IF NOT EXISTS idx_inv_products_barcode ON inventory_products(salon_id, barcode);
CREATE INDEX IF NOT EXISTS idx_inv_products_low_stock ON inventory_products(salon_id)
    WHERE units_in_stock <= min_stock AND status = 'active';

-- ── 4. Stock change audit trail ───────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_stock_changes (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    salon_id        TEXT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    product_id      TEXT NOT NULL REFERENCES inventory_products(id) ON DELETE CASCADE,
    change_type     TEXT NOT NULL,
    before_json     JSONB,
    after_json      JSONB,
    reason          TEXT,
    changed_by      TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_changes_product ON inventory_stock_changes(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_changes_salon_date ON inventory_stock_changes(salon_id, created_at);

-- ── 5. updated_at trigger (reuse existing function if present) ────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
  ) THEN
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_brands_updated_at'
  ) THEN
    CREATE TRIGGER trg_brands_updated_at
      BEFORE UPDATE ON brands
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_product_lines_updated_at'
  ) THEN
    CREATE TRIGGER trg_product_lines_updated_at
      BEFORE UPDATE ON product_lines
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_inv_products_updated_at'
  ) THEN
    CREATE TRIGGER trg_inv_products_updated_at
      BEFORE UPDATE ON inventory_products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ── 6. Seed brands ───────────────────────────────────────────────
INSERT INTO brands (id, name, slug, sort_order) VALUES
  ('brand-loreal',  'Loreal Profesional',  'loreal',  1),
  ('brand-wella',   'Wella Professionals', 'wella',   2),
  ('brand-matrix',  'Matrix',              'matrix',  3),
  ('brand-redken',  'Redken',              'redken',  4),
  ('brand-joico',   'Joico',               'joico',   5)
ON CONFLICT (id) DO NOTHING;

-- ── 7. Seed product lines (for Loreal) ───────────────────────────
INSERT INTO product_lines (id, brand_id, name, slug, sort_order) VALUES
  ('line-majirel',       'brand-loreal', 'Majirel',              'majirel',       1),
  ('line-dia-richesse',  'brand-loreal', 'Dia Richesse',         'dia-richesse',  2),
  ('line-dia-colorur',   'brand-loreal', 'Dia Colorur',          'dia-colorur',   3),
  ('line-new-inoa',      'brand-loreal', 'New Inoa',             'new-inoa',      4),
  ('line-fonda',         'brand-loreal', 'Fonda',                'fonda',         5),
  ('line-bleach',        'brand-loreal', 'Bleach & Developers',  'bleach',        6)
ON CONFLICT (id) DO NOTHING;

-- ── 8. Seed demo inventory products for Salon Look ───────────────
INSERT INTO inventory_products
  (id, salon_id, brand_id, product_line_id, shade_code, display_name, level,
   cost_usd, selling_price_usd, margin_pct, min_stock, units_in_stock, barcode)
VALUES
  ('ip01','salon-look','brand-loreal','line-dia-richesse','1.0','Dia Richesse 1.0',1, 8.50,12.50,32,  3, 2, NULL),
  ('ip02','salon-look','brand-loreal','line-dia-richesse','1.1','Dia Richesse 1.1',1, 8.50,12.50,32,  3, 7, NULL),
  ('ip03','salon-look','brand-loreal','line-dia-richesse','1.2','Dia Richesse 1.2',1, 8.50,12.50,32,  3, 5, NULL),
  ('ip04','salon-look','brand-loreal','line-dia-richesse','1.3','Dia Richesse 1.3',1, 8.50,12.50,32,  3, 2, NULL),
  ('ip05','salon-look','brand-loreal','line-dia-richesse','1.4','Dia Richesse 1.4',1, 8.50,12.50,32,  3, 7, NULL),
  ('ip06','salon-look','brand-loreal','line-dia-richesse','1.5','Dia Richesse 1.5',1, 8.50,12.50,32,  3, 5, NULL),
  ('ip07','salon-look','brand-loreal','line-dia-richesse','1.6','Dia Richesse 1.6',1, 8.50,12.50,32,  3, 2, NULL),
  ('ip08','salon-look','brand-loreal','line-dia-richesse','1.22','Dia Richesse 1.22',1,8.50,12.50,32, 3, 2, NULL),
  ('ip09','salon-look','brand-loreal','line-dia-richesse','4.11','Dia Richesse 4.11',4,8.50,12.50,32, 3, 2, NULL),
  ('ip10','salon-look','brand-loreal','line-majirel','5.0','Majirel 5.0',5,          9.00,14.00,36,   2, 4, NULL),
  ('ip11','salon-look','brand-loreal','line-majirel','6.0','Majirel 6.0',6,          9.00,14.00,36,   2, 6, NULL),
  ('ip12','salon-look','brand-loreal','line-majirel','7.0','Majirel 7.0',7,          9.00,14.00,36,   2, 3, NULL),
  ('ip13','salon-look','brand-loreal','line-new-inoa','5.3','New Inoa 5.3',5,        10.00,15.00,33,  2, 5, NULL),
  ('ip14','salon-look','brand-loreal','line-new-inoa','6.1','New Inoa 6.1',6,        10.00,15.00,33,  2, 8, NULL),
  ('ip15','salon-look','brand-loreal','line-bleach','dev-20','20 Vol Developer',NULL, 6.00,10.00,40,   5,12, NULL),
  ('ip16','salon-look','brand-loreal','line-bleach','dev-30','30 Vol Developer',NULL, 6.00,10.00,40,   5, 9, NULL)
ON CONFLICT (id) DO NOTHING;

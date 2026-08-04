-- ============================================================
-- Migration 047: TRUSS catalog product fields (additive)
-- ============================================================
-- Adds supplier SKU + primary image path/source URL for brand catalog
-- imports (TRUSS Israel barcode catalog and future brand packs).
-- Non-destructive: ADD COLUMN IF NOT EXISTS only.
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.catalog_products') IS NULL THEN
    RAISE EXCEPTION '[047] catalog_products is missing. Run prior catalog migrations first.';
  END IF;
END $$;

ALTER TABLE catalog_products
  ADD COLUMN IF NOT EXISTS supplier_sku TEXT;

ALTER TABLE catalog_products
  ADD COLUMN IF NOT EXISTS primary_image_path TEXT;

ALTER TABLE catalog_products
  ADD COLUMN IF NOT EXISTS image_source_url TEXT;

ALTER TABLE catalog_products
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE catalog_products
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

ALTER TABLE catalog_products
  ADD COLUMN IF NOT EXISTS shade_code_raw TEXT;

ALTER TABLE catalog_products
  ADD COLUMN IF NOT EXISTS shade_code_normalized TEXT;

-- One active supplier SKU per brand when present (TRS codes).
CREATE UNIQUE INDEX IF NOT EXISTS uidx_catalog_products_brand_supplier_sku
  ON catalog_products (manufacturer_id, supplier_sku)
  WHERE supplier_sku IS NOT NULL AND active = true;

CREATE INDEX IF NOT EXISTS idx_catalog_products_supplier_sku
  ON catalog_products (supplier_sku)
  WHERE supplier_sku IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_catalog_products_published_at
  ON catalog_products (published_at)
  WHERE published_at IS NOT NULL;

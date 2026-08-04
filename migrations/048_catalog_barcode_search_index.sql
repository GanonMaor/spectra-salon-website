-- ============================================================
-- Migration 048: Catalog barcode / supplier SKU search support
-- ============================================================
-- Speeds salon catalog search by EAN and internal supplier codes (TRS).
-- Non-destructive.
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.catalog_product_barcodes') IS NULL THEN
    RAISE EXCEPTION '[048] catalog_product_barcodes is missing. Run migration 027 first.';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_catalog_barcodes_barcode_trgm
  ON catalog_product_barcodes USING gin (barcode gin_trgm_ops)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_catalog_barcodes_type_barcode
  ON catalog_product_barcodes (barcode_type, barcode)
  WHERE status = 'active';

-- Helpful for TRS / supplier_sku text search when column exists (047).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='catalog_products' AND column_name='supplier_sku'
  ) THEN
    EXECUTE $sql$
      CREATE INDEX IF NOT EXISTS idx_catalog_products_supplier_sku_trgm
        ON catalog_products USING gin (supplier_sku gin_trgm_ops)
        WHERE supplier_sku IS NOT NULL AND active = true
    $sql$;
  END IF;
END $$;

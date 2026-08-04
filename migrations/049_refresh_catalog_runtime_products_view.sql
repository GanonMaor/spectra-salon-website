-- ============================================================
-- Migration 049: Refresh catalog_runtime_products after 047 columns
-- ============================================================
-- Postgres expands SELECT * at CREATE VIEW time. After 047 added
-- supplier_sku / image fields, recreate the view so runtime queries see them.
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.catalog_products') IS NULL THEN
    RAISE EXCEPTION '[049] catalog_products is missing.';
  END IF;
END $$;

CREATE OR REPLACE VIEW catalog_runtime_products AS
SELECT *
FROM catalog_products
WHERE active = true
  AND validation_status = 'approved'
  AND published_at IS NOT NULL;

COMMENT ON VIEW catalog_runtime_products IS
  'Approved, active, published salon-facing catalog. Includes supplier_sku and image fields from 047+.';

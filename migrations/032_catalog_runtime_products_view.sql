-- ============================================================
-- Migration 032: Runtime Approved Catalog View
-- ============================================================
-- Defines the salon-facing runtime catalog as a clean contract on top of the
-- full admin/master catalog.
--
--   catalog_products          = full admin/master catalog (candidates,
--                               conflicts, review items, admin data)
--   catalog_runtime_products  = approved, active, published salon-facing subset
--
-- Every salon-runtime product query (catalog-stock, salon product search,
-- add-from-catalog, future barcode lookup / inventory picker) must read from
-- catalog_runtime_products, NEVER from raw catalog_products. Admin screens keep
-- using catalog_products directly.
--
-- The view is intentionally the V1 boundary: no runtime_status column and no
-- separate runtime table. If runtime approval ever needs to diverge from
-- product-truth approval, that is a later, explicit change.
--
-- Depends on migration 026 (catalog_products). Non-destructive: creates a view
-- only, no data mutation. Idempotent (CREATE OR REPLACE).
-- ============================================================

DO $$ BEGIN
  IF to_regclass('public.catalog_products') IS NULL THEN
    RAISE EXCEPTION '[032] catalog_products is missing. Run migration 026 first.';
  END IF;
END $$;

CREATE OR REPLACE VIEW catalog_runtime_products AS
SELECT *
FROM catalog_products
WHERE active = true
  AND validation_status = 'approved'
  AND published_at IS NOT NULL;

COMMENT ON VIEW catalog_runtime_products IS
  'Approved, active, published salon-facing catalog. Salon-runtime queries must read from this view, not raw catalog_products.';

-- ── End of migration 032 ─────────────────────────────────────────────────

-- ============================================================
-- Migration 026: Catalog / Inventory V1 — Schema Naming Cleanup
-- ============================================================
-- Phase 1 of the multi-tenant catalog + salon inventory plan.
--
-- Goal: give the global master catalog a clean, explicit surface
-- (catalog_*) so that salon-runtime tables in later phases can safely
-- reference it with real foreign keys, WITHOUT breaking existing admin
-- and import code that still uses the historical canonical_* names.
--
-- Strategy (non-destructive):
--   1. Rename the four canonical master tables to catalog_*:
--        canonical_manufacturers -> catalog_brands
--        product_lines (canonical variant) -> catalog_product_lines
--        product_families -> catalog_product_families
--        canonical_products -> catalog_products
--   2. Create auto-updatable backward-compatibility VIEWs with the old
--      names so canonical-product-db.js, the product-truth importer, and
--      the resolution functions keep working during the transition.
--   3. Column names are intentionally left unchanged in V1
--      (manufacturer_id, product_line_id, etc.). The plan allows keeping
--      them for compatibility; renaming to brand_id is a later cleanup.
--
-- Safety:
--   * Every action is guarded with existence checks (idempotent, safe
--     to re-run, safe on partially-migrated databases).
--   * No row data is inserted, updated, or deleted.
--   * The `product_lines` name collides between the canonical catalog
--     (migration 020, has column `manufacturer_id`) and the legacy
--     inventory schema (migration 15, has column `brand_id`). We ONLY
--     rename the canonical variant, detected via its `manufacturer_id`
--     column, and never touch a legacy inventory `product_lines`.
-- ============================================================

-- ── 1. Rename canonical master tables to catalog_* ────────────────────────

DO $$
DECLARE
  has_manufacturer_col boolean;
BEGIN
  -- canonical_manufacturers -> catalog_brands
  IF to_regclass('public.canonical_manufacturers') IS NOT NULL
     AND to_regclass('public.catalog_brands') IS NULL THEN
    EXECUTE 'ALTER TABLE canonical_manufacturers RENAME TO catalog_brands';
    RAISE NOTICE '[026] Renamed canonical_manufacturers -> catalog_brands';
  END IF;

  -- product_families -> catalog_product_families
  IF to_regclass('public.product_families') IS NOT NULL
     AND to_regclass('public.catalog_product_families') IS NULL THEN
    EXECUTE 'ALTER TABLE product_families RENAME TO catalog_product_families';
    RAISE NOTICE '[026] Renamed product_families -> catalog_product_families';
  END IF;

  -- canonical_products -> catalog_products
  IF to_regclass('public.canonical_products') IS NOT NULL
     AND to_regclass('public.catalog_products') IS NULL THEN
    EXECUTE 'ALTER TABLE canonical_products RENAME TO catalog_products';
    RAISE NOTICE '[026] Renamed canonical_products -> catalog_products';
  END IF;

  -- product_lines is ambiguous. Only rename the CANONICAL catalog variant,
  -- which is uniquely identified by having a `manufacturer_id` column.
  -- A legacy inventory product_lines (migration 15) has `brand_id` instead
  -- and must be left completely untouched.
  IF to_regclass('public.product_lines') IS NOT NULL
     AND to_regclass('public.catalog_product_lines') IS NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'product_lines'
        AND column_name = 'manufacturer_id'
    ) INTO has_manufacturer_col;

    IF has_manufacturer_col THEN
      EXECUTE 'ALTER TABLE product_lines RENAME TO catalog_product_lines';
      RAISE NOTICE '[026] Renamed product_lines (canonical variant) -> catalog_product_lines';
    ELSE
      RAISE NOTICE '[026] Skipped product_lines rename: found legacy inventory variant (brand_id), not the canonical catalog table.';
    END IF;
  END IF;
END $$;

-- ── 2. Backward-compatibility views (old names -> new tables) ─────────────
-- These are simple single-table SELECT * views, which PostgreSQL treats as
-- auto-updatable: existing INSERT/UPDATE/DELETE ... RETURNING statements in
-- admin/import code continue to work transparently against the base tables.
-- Each view is only created when its base table was actually renamed AND the
-- old name is now free (so a legacy inventory product_lines is never shadowed).

DO $$ BEGIN
  IF to_regclass('public.catalog_brands') IS NOT NULL
     AND to_regclass('public.canonical_manufacturers') IS NULL THEN
    EXECUTE 'CREATE VIEW canonical_manufacturers AS SELECT * FROM catalog_brands';
    RAISE NOTICE '[026] Created compatibility view canonical_manufacturers -> catalog_brands';
  END IF;

  IF to_regclass('public.catalog_product_families') IS NOT NULL
     AND to_regclass('public.product_families') IS NULL THEN
    EXECUTE 'CREATE VIEW product_families AS SELECT * FROM catalog_product_families';
    RAISE NOTICE '[026] Created compatibility view product_families -> catalog_product_families';
  END IF;

  IF to_regclass('public.catalog_products') IS NOT NULL
     AND to_regclass('public.canonical_products') IS NULL THEN
    EXECUTE 'CREATE VIEW canonical_products AS SELECT * FROM catalog_products';
    RAISE NOTICE '[026] Created compatibility view canonical_products -> catalog_products';
  END IF;

  -- Only expose a product_lines compatibility view when the name is free.
  -- If a legacy inventory product_lines base table still exists, we leave it
  -- alone and do NOT create a conflicting view.
  IF to_regclass('public.catalog_product_lines') IS NOT NULL
     AND to_regclass('public.product_lines') IS NULL THEN
    EXECUTE 'CREATE VIEW product_lines AS SELECT * FROM catalog_product_lines';
    RAISE NOTICE '[026] Created compatibility view product_lines -> catalog_product_lines';
  END IF;
END $$;

-- ── 3. Convenience indexes on the renamed catalog tables ──────────────────
-- (Index objects follow their table across a rename, so these only add any
--  that were missing. All are IF NOT EXISTS and safe to re-run.)

DO $$ BEGIN
  IF to_regclass('public.catalog_products') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalog_products_manufacturer ON catalog_products (manufacturer_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalog_products_product_line ON catalog_products (product_line_id)';
  END IF;
  IF to_regclass('public.catalog_product_lines') IS NOT NULL THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_catalog_product_lines_manufacturer ON catalog_product_lines (manufacturer_id)';
  END IF;
END $$;

-- ── End of migration 026 ─────────────────────────────────────────────────

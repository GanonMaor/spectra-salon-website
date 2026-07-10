-- ============================================================
-- Migration 029: Catalog Search Performance Index
-- ============================================================
-- Performance audit finding: the explicit full-catalog search in
-- netlify/functions/salon-products.js filters with:
--     cp.normalized_name ILIKE '%q%' OR LOWER(cp.canonical_name) ILIKE '%q%'
--
-- The trigram GIN index on normalized_name (migration 020/027) can serve the
-- first branch, but the second branch (LOWER(canonical_name)) had no matching
-- index, so PostgreSQL fell back to a Seq Scan over all catalog_products
-- (~621ms on 32,739 rows, and worse as the catalog grows to 300k+).
--
-- This migration adds a matching trigram expression index on
-- LOWER(canonical_name) so the planner can BitmapOr both trigram indexes and
-- avoid the sequential scan, WITHOUT changing query semantics.
--
-- Non-destructive: additive index only. Safe to re-run.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$ BEGIN
  IF to_regclass('public.catalog_products') IS NULL THEN
    RAISE EXCEPTION '[029] catalog_products is missing. Run migration 026 first.';
  END IF;
END $$;

-- Trigram index on the lowercased canonical name to accelerate
-- LOWER(canonical_name) ILIKE '%...%' predicates in full-catalog search.
CREATE INDEX IF NOT EXISTS idx_catalog_products_canonical_name_trgm
  ON catalog_products USING gin (lower(canonical_name) gin_trgm_ops);

-- ── End of migration 029 ─────────────────────────────────────────────────

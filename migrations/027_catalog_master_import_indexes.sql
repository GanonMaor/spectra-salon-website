-- ============================================================
-- Migration 027: Catalog Master — Barcodes + Search Indexes
-- ============================================================
-- Phase 2 of the multi-tenant catalog + salon inventory plan.
--
-- Makes the global catalog (catalog_products, renamed in migration 026)
-- the runtime source of truth for product search:
--   * Adds catalog_product_barcodes so barcodes are first-class, support
--     multiple codes per product, and can be resolved/reviewed by admin.
--   * Adds search-oriented indexes (trigram + compound) so salon-scoped
--     and global catalog search stay fast without loading everything.
--
-- Depends on migration 026 (catalog_* tables must exist).
-- Non-destructive: creates tables/indexes only, all IF NOT EXISTS.
-- ============================================================

-- Ensure trigram support exists (no-op if already enabled).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── 1. catalog_product_barcodes ───────────────────────────────────────────
-- One global catalog product can carry several barcodes (regional SKUs,
-- repackaging, EAN/UPC variants). Barcode conflicts are surfaced for admin
-- resolution rather than silently collapsed.

DO $$ BEGIN
  IF to_regclass('public.catalog_products') IS NULL THEN
    RAISE EXCEPTION '[027] catalog_products is missing. Run migration 026 first.';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS catalog_product_barcodes (
  id                TEXT PRIMARY KEY DEFAULT 'cbar-' || gen_random_uuid()::text,
  product_id        TEXT NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
  barcode           TEXT NOT NULL,
  barcode_type      TEXT NOT NULL DEFAULT 'unknown',
  is_primary        BOOLEAN NOT NULL DEFAULT false,
  source_record_id  TEXT,
  status            TEXT NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_catalog_barcode_type CHECK (
    barcode_type IN ('ean13','ean8','upca','upce','gtin14','code128','internal','unknown')
  ),
  CONSTRAINT chk_catalog_barcode_status CHECK (
    status IN ('active','conflict','retired')
  )
);

CREATE INDEX IF NOT EXISTS idx_catalog_barcodes_product
  ON catalog_product_barcodes (product_id);

-- A barcode should resolve to a single active catalog product. Genuine
-- conflicts are represented by rows in status 'conflict' (excluded here)
-- so admin tooling can resolve them rather than the DB rejecting the import.
CREATE UNIQUE INDEX IF NOT EXISTS uidx_catalog_barcode_active
  ON catalog_product_barcodes (barcode)
  WHERE status = 'active';

-- Only one primary barcode per product.
CREATE UNIQUE INDEX IF NOT EXISTS uidx_catalog_barcode_primary
  ON catalog_product_barcodes (product_id)
  WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_catalog_barcodes_lookup
  ON catalog_product_barcodes (barcode);

-- ── 2. Search indexes on catalog_products ─────────────────────────────────
-- The trigram index on normalized_name already exists from migration 020;
-- add compound indexes tuned for the two catalog search paths:
--   a) admin/global browse filtered by brand + type + status
--   b) enabled-brand-scoped salon search (brand_id + active)

CREATE INDEX IF NOT EXISTS idx_catalog_products_search_compound
  ON catalog_products (manufacturer_id, primary_product_type, active);

CREATE INDEX IF NOT EXISTS idx_catalog_products_brand_active
  ON catalog_products (manufacturer_id, active);

-- Trigram index for fuzzy name search (guarded in case 020's variant is
-- named differently on this database).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'catalog_products'
      AND indexdef ILIKE '%gin_trgm_ops%'
  ) THEN
    EXECUTE 'CREATE INDEX idx_catalog_products_name_trgm
             ON catalog_products USING gin (normalized_name gin_trgm_ops)';
    RAISE NOTICE '[027] Created trigram index idx_catalog_products_name_trgm';
  END IF;
END $$;

-- ── End of migration 027 ─────────────────────────────────────────────────

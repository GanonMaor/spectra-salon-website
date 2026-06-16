-- Catalog Research Verification Audit
-- Draft Neon schema for moving Beauty Intelligence and Product Catalog truth
-- from static JSON into database-backed canonical tables.
--
-- This file is intentionally a draft artifact. It is not wired into the
-- migration runner yet.

CREATE TABLE IF NOT EXISTS beauty_product_catalog_items (
  id TEXT PRIMARY KEY,
  source_product_id TEXT,
  brand TEXT NOT NULL,
  brand_normalized TEXT,
  series TEXT,
  series_normalized TEXT,
  shade TEXT,
  family_shade TEXT,
  product_type TEXT NOT NULL,
  raw_type TEXT,
  product_kind TEXT,
  catalog_no TEXT,
  image_url TEXT,
  hair_color TEXT,
  packing_weight NUMERIC,
  material_weight NUMERIC,
  price_ils NUMERIC,
  barcodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_barcode TEXT,
  catalog_status TEXT NOT NULL DEFAULT 'active'
    CHECK (catalog_status IN ('active', 'deleted', 'deprecated', 'barcode_conflict')),
  verification_status TEXT NOT NULL DEFAULT 'source_linked'
    CHECK (verification_status IN ('verified', 'partially_verified', 'source_linked', 'heuristic_only', 'needs_review')),
  verification_confidence TEXT NOT NULL DEFAULT 'low'
    CHECK (verification_confidence IN ('high', 'medium', 'low')),
  verification_query TEXT,
  verification_url TEXT,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beauty_catalog_brand_series
  ON beauty_product_catalog_items (brand_normalized, series_normalized);

CREATE INDEX IF NOT EXISTS idx_beauty_catalog_type_status
  ON beauty_product_catalog_items (product_type, verification_status);

CREATE INDEX IF NOT EXISTS idx_beauty_catalog_primary_barcode
  ON beauty_product_catalog_items (primary_barcode);

CREATE TABLE IF NOT EXISTS beauty_observed_items (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  brand_normalized TEXT,
  series TEXT,
  series_normalized TEXT,
  shade TEXT,
  product_label TEXT,
  product_type TEXT NOT NULL,
  usage_rows INTEGER NOT NULL DEFAULT 0,
  grams NUMERIC NOT NULL DEFAULT 0,
  customers INTEGER NOT NULL DEFAULT 0,
  top_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  linked_catalog_item_id TEXT REFERENCES beauty_product_catalog_items(id),
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beauty_observed_brand_series
  ON beauty_observed_items (brand_normalized, series_normalized);

CREATE TABLE IF NOT EXISTS beauty_series_dictionary (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  brand_normalized TEXT NOT NULL,
  series TEXT NOT NULL,
  series_normalized TEXT NOT NULL,
  display_name TEXT,
  product_type TEXT,
  technology TEXT,
  shade_system TEXT,
  description TEXT,
  common_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_market_category TEXT,
  official_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'heuristic_only'
    CHECK (verification_status IN ('verified', 'partially_verified', 'source_linked', 'heuristic_only', 'needs_review')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_normalized, series_normalized)
);

CREATE TABLE IF NOT EXISTS beauty_shade_intelligence (
  id TEXT PRIMARY KEY,
  catalog_item_id TEXT REFERENCES beauty_product_catalog_items(id),
  observed_item_id TEXT REFERENCES beauty_observed_items(id),
  brand TEXT,
  series TEXT,
  shade TEXT,
  product_type TEXT,
  level NUMERIC,
  level_name TEXT,
  reflection_primary TEXT,
  reflection_secondary TEXT,
  color_family TEXT,
  color_family_dot TEXT,
  market_category TEXT,
  service_contexts JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence TEXT NOT NULL DEFAULT 'medium'
    CHECK (confidence IN ('high', 'medium', 'low')),
  classification_source TEXT NOT NULL DEFAULT 'heuristic'
    CHECK (classification_source IN ('official_source', 'manual_review', 'heuristic', 'usage_inferred')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beauty_shade_market_category
  ON beauty_shade_intelligence (market_category);

CREATE TABLE IF NOT EXISTS beauty_dictionary_sources (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('catalog_item', 'observed_item', 'series_dictionary', 'shade_intelligence')),
  entity_id TEXT NOT NULL,
  source_kind TEXT NOT NULL
    CHECK (source_kind IN ('official_site', 'barcode_lookup', 'distributor_catalog', 'google_result', 'manual_note')),
  source_url TEXT,
  source_domain TEXT,
  source_title TEXT,
  search_query TEXT,
  matched_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence TEXT NOT NULL DEFAULT 'low'
    CHECK (confidence IN ('high', 'medium', 'low')),
  evidence_text TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_by TEXT NOT NULL DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_beauty_sources_entity
  ON beauty_dictionary_sources (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_beauty_sources_domain
  ON beauty_dictionary_sources (source_domain);

CREATE TABLE IF NOT EXISTS beauty_dictionary_audit_log (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before JSONB,
  after JSONB,
  actor TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

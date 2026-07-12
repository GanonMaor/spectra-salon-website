-- Migration 036: Salon Product Usage Import Metadata
-- ============================================================
-- Preserve real historical Spectra mix-export fields on usage rows.
--
-- This is intentionally additive. Existing usage rows remain valid, while
-- imported historical rows can keep material cost and source workbook context
-- without inventing checkout/payments/expense records.

ALTER TABLE salon_product_usage
  ADD COLUMN IF NOT EXISTS cost_at_use_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS cost_currency TEXT NOT NULL DEFAULT 'ILS',
  ADD COLUMN IF NOT EXISTS source_brand TEXT,
  ADD COLUMN IF NOT EXISTS source_series TEXT,
  ADD COLUMN IF NOT EXISTS source_shade TEXT,
  ADD COLUMN IF NOT EXISTS source_service_name TEXT,
  ADD COLUMN IF NOT EXISTS source_profile TEXT,
  ADD COLUMN IF NOT EXISTS source_import_id TEXT,
  ADD COLUMN IF NOT EXISTS source_row_number INTEGER,
  ADD COLUMN IF NOT EXISTS source_workbook_name TEXT;

CREATE INDEX IF NOT EXISTS idx_salon_usage_import
  ON salon_product_usage (salon_id, source_import_id)
  WHERE source_import_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_salon_usage_source_brand
  ON salon_product_usage (salon_id, source_brand)
  WHERE source_brand IS NOT NULL;

-- ── End of migration 036 ─────────────────────────────────────────────────

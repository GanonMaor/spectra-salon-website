-- ============================================================
-- Migration 037: Open product amount on salon inventory
-- ============================================================
-- Stores the amount remaining in the currently open product. This is
-- salon-local inventory state; sealed units remain in units_in_stock.

ALTER TABLE salon_inventory_products
  ADD COLUMN IF NOT EXISTS open_product_amount NUMERIC(12,3) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS open_product_unit TEXT NOT NULL DEFAULT 'g';

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_salon_inventory_open_product_unit'
  ) THEN
    ALTER TABLE salon_inventory_products
      ADD CONSTRAINT chk_salon_inventory_open_product_unit
      CHECK (open_product_unit IN ('g', 'oz'));
  END IF;
END $$;

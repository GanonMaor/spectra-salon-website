-- 046_appointment_estimated_revenue.sql
-- Snapshot estimated revenue on appointments for migration history.
-- Never recompute historical estimates from the live price list.

ALTER TABLE salon_appointments
  ADD COLUMN IF NOT EXISTS list_price_cents INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_revenue_cents INTEGER,
  ADD COLUMN IF NOT EXISTS revenue_source TEXT,
  ADD COLUMN IF NOT EXISTS pricing_source TEXT,
  ADD COLUMN IF NOT EXISTS pricing_confidence TEXT,
  ADD COLUMN IF NOT EXISTS pricing_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS pricing_computed_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_salon_appointment_revenue_source'
  ) THEN
    ALTER TABLE salon_appointments
      ADD CONSTRAINT chk_salon_appointment_revenue_source
      CHECK (
        revenue_source IS NULL
        OR revenue_source IN (
          'migration_estimate',
          'booked_service_price',
          'checkout_confirmed'
        )
      );
  END IF;
END $$;

COMMENT ON COLUMN salon_appointments.list_price_cents IS
  'Price-list amount in cents before bundle waivers; immutable once snapshotted.';
COMMENT ON COLUMN salon_appointments.estimated_revenue_cents IS
  'Estimated charged amount in cents after migration rules (e.g. color waived with highlights). Not confirmed checkout revenue.';
COMMENT ON COLUMN salon_appointments.revenue_source IS
  'migration_estimate | booked_service_price | checkout_confirmed';
COMMENT ON COLUMN salon_appointments.pricing_snapshot IS
  'JSON snapshot of the pricing decision used for historical estimates.';

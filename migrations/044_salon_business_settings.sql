-- ============================================================================
-- Migration 044: Authoritative salon business settings
-- ============================================================================
-- Extends the existing `salons` tenant record.  These values describe the
-- salon itself; they intentionally do not duplicate staff availability,
-- customer data, or per-service configuration.

ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT 'IL',
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS street_number TEXT,
  ADD COLUMN IF NOT EXISTS floor TEXT,
  ADD COLUMN IF NOT EXISTS unit TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS address_notes TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'he-IL',
  ADD COLUMN IF NOT EXISTS default_language TEXT NOT NULL DEFAULT 'he',
  ADD COLUMN IF NOT EXISTS date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
  ADD COLUMN IF NOT EXISTS time_format TEXT NOT NULL DEFAULT '24h',
  ADD COLUMN IF NOT EXISTS week_starts_on SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS business_registration_number TEXT,
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS is_tax_registered BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_tax_rate NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS prices_include_tax BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS invoice_prefix TEXT,
  ADD COLUMN IF NOT EXISTS receipt_prefix TEXT,
  ADD COLUMN IF NOT EXISTS default_appointment_duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS booking_interval_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS minimum_booking_notice_hours INTEGER,
  ADD COLUMN IF NOT EXISTS maximum_booking_window_days INTEGER,
  ADD COLUMN IF NOT EXISTS cancellation_window_hours INTEGER,
  ADD COLUMN IF NOT EXISTS online_booking_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS customer_phone_required BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS customer_email_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_calendar_view TEXT,
  ADD COLUMN IF NOT EXISTS default_department_id TEXT,
  ADD COLUMN IF NOT EXISTS business_hours JSONB;

ALTER TABLE salons
  DROP CONSTRAINT IF EXISTS salons_country_code_chk,
  ADD CONSTRAINT salons_country_code_chk CHECK (country_code IN ('IL', 'US', 'GB', 'FR', 'DE', 'CA', 'AU'));

ALTER TABLE salons
  DROP CONSTRAINT IF EXISTS salons_currency_chk,
  ADD CONSTRAINT salons_currency_chk CHECK (currency IN ('ILS', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'));

ALTER TABLE salons
  DROP CONSTRAINT IF EXISTS salons_time_format_chk,
  ADD CONSTRAINT salons_time_format_chk CHECK (time_format IN ('12h', '24h'));

ALTER TABLE salons
  DROP CONSTRAINT IF EXISTS salons_week_starts_on_chk,
  ADD CONSTRAINT salons_week_starts_on_chk CHECK (week_starts_on BETWEEN 0 AND 6);

ALTER TABLE salons
  DROP CONSTRAINT IF EXISTS salons_tax_rate_chk,
  ADD CONSTRAINT salons_tax_rate_chk CHECK (default_tax_rate IS NULL OR (default_tax_rate >= 0 AND default_tax_rate <= 100));

ALTER TABLE salons
  DROP CONSTRAINT IF EXISTS salons_coordinates_chk,
  ADD CONSTRAINT salons_coordinates_chk CHECK (
    (latitude IS NULL OR latitude BETWEEN -90 AND 90)
    AND (longitude IS NULL OR longitude BETWEEN -180 AND 180)
  );

CREATE INDEX IF NOT EXISTS idx_salons_country_code ON salons (country_code);

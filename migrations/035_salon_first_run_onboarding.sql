-- Migration 035: Salon first-run onboarding state
-- Keeps the First Run Setup Wizard server-authoritative and tenant-scoped.

ALTER TABLE salons
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'ILS',
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT NOT NULL DEFAULT 'incomplete',
  ADD COLUMN IF NOT EXISTS onboarding_current_step TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE salons
  DROP CONSTRAINT IF EXISTS salons_currency_chk,
  ADD CONSTRAINT salons_currency_chk CHECK (currency IN ('ILS', 'USD', 'EUR'));

ALTER TABLE salons
  DROP CONSTRAINT IF EXISTS salons_onboarding_status_chk,
  ADD CONSTRAINT salons_onboarding_status_chk CHECK (onboarding_status IN ('incomplete', 'completed'));

UPDATE salons
SET
  onboarding_status = 'completed',
  onboarding_current_step = NULL,
  onboarding_completed_at = COALESCE(onboarding_completed_at, now()),
  onboarding_updated_at = now()
WHERE status = 'active'
  AND onboarding_completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_salons_onboarding_status
  ON salons (status, onboarding_status);

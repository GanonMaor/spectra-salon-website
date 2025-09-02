-- 02_subscribers.sql  
-- Migration: Create subscribers table for completed subscriptions
-- Gate B - Database Reduction Project - CLEAN START (no data migration)

-- Create ENUM for subscription status (truly idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('trial_active','active','past_due','canceled');
    RAISE NOTICE '✅ Created subscription_status ENUM';
  ELSE
    RAISE NOTICE '⚠️  subscription_status ENUM already exists - skipping';
  END IF;
END $$;

-- Create subscribers table
DROP TABLE IF EXISTS public.subscribers CASCADE;

CREATE TABLE public.subscribers (
  subscriber_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Link to original lead (if available)
  lead_id              UUID REFERENCES public.leads_new(lead_id) ON DELETE SET NULL,

  -- Customer information
  email                CITEXT NOT NULL,
  full_name            TEXT,
  company              TEXT,
  billing_country      TEXT,

  -- Subscription and pricing
  plan_code            TEXT NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'USD',
  amount_minor         INTEGER NOT NULL,          -- Amount in minor units (cents/agorot)
  status               subscription_status NOT NULL DEFAULT 'trial_active',
  trial_start          TIMESTAMPTZ,
  trial_end            TIMESTAMPTZ,

  -- Payment integration (secure IDs only - never store PAN/CVC)
  payment_customer_id    TEXT NOT NULL,
  payment_method_id TEXT,                      -- Token/ID only
  subscription_id TEXT,

  -- Billing history
  last_charge_at       TIMESTAMPTZ,
  canceled_at          TIMESTAMPTZ,

  -- Data validation
  CONSTRAINT email_format_chk CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT amount_positive_chk CHECK (amount_minor > 0),
  CONSTRAINT currency_valid_chk CHECK (currency IN ('USD', 'EUR', 'ILS', 'GBP')),
  CONSTRAINT trial_dates_chk CHECK (trial_end IS NULL OR trial_start IS NULL OR trial_end >= trial_start),
  CONSTRAINT canceled_status_chk CHECK (
    (status = 'canceled' AND canceled_at IS NOT NULL) OR 
    (status != 'canceled' AND canceled_at IS NULL)
  )
);

-- Create minimal indexes (only for Overview dashboard queries)
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at);

-- Unique constraints (business critical)
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email_unique ON public.subscribers(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_payment_customer_unique ON public.subscribers(payment_customer_id);

-- CLEAN START - No data migration (per business requirement)
-- Old subscription data is preserved in backups for reference only

RAISE NOTICE '🗑️  CLEAN START: Starting with empty subscribers table (old data in backups)';

-- NO VIEWS - Overview dashboard will use direct SQL queries
-- 2-table architecture means no complex views needed

-- Create trigger for automatic updated_at maintenance
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON public.subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.subscribers IS 'Completed subscriptions with payment integration - NO sensitive payment data stored';
COMMENT ON COLUMN public.subscribers.payment_customer_id IS 'Payment customer ID - secure reference only';
COMMENT ON COLUMN public.subscribers.payment_method_id IS 'Payment method token - never stores PAN/CVC';
COMMENT ON COLUMN public.subscribers.amount_minor IS 'Subscription amount in minor currency units (cents for USD)';
COMMENT ON COLUMN public.subscribers.lead_id IS 'Reference to original lead that converted (if traceable)';

RAISE NOTICE '✅ Subscribers table created successfully (CLEAN START)';
RAISE NOTICE '🔧 updated_at trigger enabled for automatic maintenance';

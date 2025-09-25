-- 01_leads.sql
-- Migration: Create new leads table for 4-stage funnel tracking
-- Gate B - Database Reduction Project - CLEAN START (no data migration)

-- Create ENUM for lead stages (truly idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_stage') THEN
    CREATE TYPE lead_stage AS ENUM ('cta_clicked','account_completed','address_completed','payment_viewed');
    RAISE NOTICE '✅ Created lead_stage ENUM';
  ELSE
    RAISE NOTICE '⚠️  lead_stage ENUM already exists - skipping';
  END IF;
END $$;

-- Create leads table (clean start - no existing data)
DROP TABLE IF EXISTS public.leads_new CASCADE;

CREATE TABLE public.leads_new (
  lead_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Attribution & Source
  source_page       TEXT NOT NULL,                       -- e.g. "/pricing" or full path
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,

  -- Session tracking (soft identification)
  session_id        TEXT,                                -- First-party session ID for tracking
  user_agent        TEXT,

  -- Lead information (collected during stage 1)
  email             CITEXT,                              -- NULL until step 1 completed
  full_name         TEXT,

  -- 4-Stage funnel progression
  stage             lead_stage NOT NULL DEFAULT 'cta_clicked',
  cta_clicked_at          TIMESTAMPTZ,
  account_completed_at    TIMESTAMPTZ,
  address_completed_at    TIMESTAMPTZ,
  payment_viewed_at       TIMESTAMPTZ,

  -- Compact event history for debugging (no sensitive data)
  events            JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{ts,step,meta}]

  -- Data validation
  CONSTRAINT email_format_chk CHECK (email IS NULL OR email ~* '^[^@]+@[^@]+\.[^@]+$'),
  CONSTRAINT stage_progression_chk CHECK (
    (stage = 'cta_clicked' AND cta_clicked_at IS NOT NULL) OR
    (stage = 'account_completed' AND account_completed_at IS NOT NULL AND email IS NOT NULL) OR  
    (stage = 'address_completed' AND address_completed_at IS NOT NULL) OR
    (stage = 'payment_viewed' AND payment_viewed_at IS NOT NULL)
  )
);

-- Create minimal indexes (only for Overview dashboard queries)
CREATE INDEX IF NOT EXISTS idx_leads_new_stage ON public.leads_new(stage);
CREATE INDEX IF NOT EXISTS idx_leads_new_created_at ON public.leads_new(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_new_source_page ON public.leads_new(source_page);

-- Unique constraint: prevent duplicate CTA clicks from same session
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_new_session_first 
ON public.leads_new(session_id) 
WHERE stage='cta_clicked' AND session_id IS NOT NULL;

-- CLEAN START - No data migration (per business requirement)
-- Old data is preserved in backups for reference only

RAISE NOTICE '🗑️  CLEAN START: Starting with empty leads table (old data in backups)';

-- NO VIEWS - Overview dashboard will use direct SQL queries
-- 2-table architecture means no complex views needed

-- Create updated_at trigger function (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS '
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;
    RAISE NOTICE '✅ Created update_updated_at_column function';
  END IF;
END $$;

-- Create trigger for automatic updated_at maintenance
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads_new;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads_new
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.leads_new IS '4-stage funnel tracking: CTA → Account → Address → Payment Viewed';
COMMENT ON COLUMN public.leads_new.stage IS 'Current funnel stage: cta_clicked | account_completed | address_completed | payment_viewed';
COMMENT ON COLUMN public.leads_new.source_page IS 'Page where the lead originated (first CTA click)';
COMMENT ON COLUMN public.leads_new.events IS 'Compact JSONB log of funnel progression events (no sensitive data)';
COMMENT ON COLUMN public.leads_new.session_id IS 'First-party session identifier for anonymous tracking';

RAISE NOTICE '✅ Leads table created successfully (CLEAN START)';
RAISE NOTICE '🔧 updated_at trigger enabled for automatic maintenance';

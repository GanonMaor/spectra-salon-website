-- 02_leads_table.sql
-- Create public.leads to align with API writes

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  full_name TEXT NOT NULL,
  email CITEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  message TEXT,
  source_page TEXT NOT NULL,

  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source_page ON public.leads(source_page);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Email format check (loose)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_email_format_chk'
  ) THEN
    ALTER TABLE public.leads
    ADD CONSTRAINT leads_email_format_chk CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$');
  END IF;
END $$;

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'leads_set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION leads_set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION leads_set_updated_at();



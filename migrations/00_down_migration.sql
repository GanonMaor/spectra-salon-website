-- 00_down_migration.sql
-- ROLLBACK/DOWN Migration - EMERGENCY USE ONLY
-- Restores original table structure if needed

-- ⚠️  WARNING: This will DROP the new tables and restore old structure
-- Only use this in emergency rollback situations

-- Drop new tables (no views to drop - we don't create any)

-- Drop new tables
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.leads_new CASCADE;

-- Drop new ENUMs
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS lead_stage CASCADE;

-- Restore original views (based on existing leads table)
CREATE OR REPLACE VIEW public.v_leads_recent AS
SELECT
  email,
  full_name,
  phone AS phone_e164,
  NULL::text AS landing_path,
  NULL::text AS cta_path,
  source_page AS signup_path,
  utm_source,
  utm_medium,
  utm_campaign,
  referrer,
  created_at,
  updated_at
FROM public.leads
WHERE created_at >= now() - interval '30 days';

CREATE OR REPLACE VIEW public.v_leads_by_signup_path_30d AS
SELECT source_page AS signup_path, COUNT(*) AS leads
FROM public.leads
WHERE created_at >= now() - interval '30 days'
GROUP BY source_page
ORDER BY leads DESC NULLS LAST;

CREATE OR REPLACE VIEW public.v_leads_by_cta_path_30d AS
SELECT source_page AS cta_path, COUNT(*) AS leads
FROM public.leads
WHERE created_at >= now() - interval '30 days'
GROUP BY source_page
ORDER BY leads DESC NULLS LAST;

RAISE NOTICE '❌ ROLLBACK COMPLETED - Original schema restored';
RAISE NOTICE '⚠️  Verify data integrity and functionality before proceeding';

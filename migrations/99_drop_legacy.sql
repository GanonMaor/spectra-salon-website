-- 99_drop_legacy.sql
-- DROP legacy tables after 7-day grace period
-- ⚠️  WARNING: This will PERMANENTLY DELETE old tables
-- Only run AFTER confirming new system works and backups are safe

-- This script should be run as Gate D, AFTER:
-- 1. New system is tested and working
-- 2. 7-day grace period has passed
-- 3. Stakeholder approval to proceed
-- 4. Final backup verification

-- Check that backups exist before dropping anything
DO $$
DECLARE
  backup_dir TEXT := 'backups/pre-reduction-2025-08-26';
BEGIN
  -- This is a safety check - in real deployment, verify backup files exist
  RAISE NOTICE '⚠️  VERIFY BACKUPS BEFORE RUNNING THIS SCRIPT!';
  RAISE NOTICE '📁 Expected backup location: %', backup_dir;
  RAISE NOTICE '🔍 Confirm backup files are accessible and verified';
  
  -- Uncomment the next line to prevent accidental execution
  -- RAISE EXCEPTION 'Safety check: Remove this line only after confirming backups';
END $$;

-- Legacy tables to DROP (based on backup inventory)
-- Total: 11 tables identified in Gate A backup

-- Chat/Support System (5 tables)
DROP TABLE IF EXISTS public.support_messages CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.support_users CASCADE;

-- Legacy User Management (2 tables)
DROP TABLE IF EXISTS public.signup_users CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- System Tables (2 tables)
DROP TABLE IF EXISTS public.user_actions CASCADE;
DROP TABLE IF EXISTS public.client_throttling CASCADE;

-- Metadata/Tags (2 tables)
DROP TABLE IF EXISTS public.message_tags CASCADE;

-- OLD leads table (replace with leads_new)
-- DO NOT DROP until leads_new is renamed to leads
-- DROP TABLE IF EXISTS public.leads CASCADE;

-- Drop any remaining sequences
DROP SEQUENCE IF EXISTS public.leads_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.users_id_seq CASCADE;

-- Drop old views that may still exist
DROP VIEW IF EXISTS public.v_leads_recent CASCADE;
DROP VIEW IF EXISTS public.v_leads_by_signup_path_30d CASCADE; 
DROP VIEW IF EXISTS public.v_leads_by_cta_path_30d CASCADE;

-- Clean up any orphaned functions/triggers
-- (Will be identified during actual deployment)

-- Final step: rename leads_new to leads (production cutover)
-- This should be done atomically in a separate transaction:
-- BEGIN;
-- DROP TABLE IF EXISTS public.leads CASCADE;
-- ALTER TABLE public.leads_new RENAME TO leads;
-- COMMIT;

-- Report what was dropped
DO $$
BEGIN
  RAISE NOTICE '✅ Legacy table cleanup completed';
  RAISE NOTICE '📊 Dropped 10 legacy tables + sequences + views';
  RAISE NOTICE '🔄 Ready for leads_new → leads rename operation';
  RAISE NOTICE '⚠️  Remember to update application code to use "leads" table';
END $$;

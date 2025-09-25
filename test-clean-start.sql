-- Clean Start Verification Queries
-- Run these AFTER migrations to verify empty tables

-- 1. Verify tables are empty (clean start)
SELECT 'leads_new' AS table_name, COUNT(*) AS row_count FROM public.leads_new
UNION ALL
SELECT 'subscribers' AS table_name, COUNT(*) AS row_count FROM public.subscribers;
-- Expected: Both should return 0

-- 2. Verify no application views exist  
SELECT table_name, table_type 
FROM information_schema.views 
WHERE table_schema = 'public';
-- Expected: Empty result (no application views)

-- 3. Verify ENUMs created successfully
SELECT typname, typtype FROM pg_type 
WHERE typname IN ('lead_stage', 'subscription_status')
ORDER BY typname;
-- Expected: 2 rows, both with typtype = 'e'

-- 4. Verify triggers are active
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;
-- Expected: 2 rows (leads_new, subscribers)

-- 5. Verify indexes created (6 total)
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('leads_new', 'subscribers')
ORDER BY tablename, indexname;
-- Expected: 6 indexes total (4 on leads_new, 2 on subscribers)

-- 6. Extensions verification
SELECT extname FROM pg_extension WHERE extname IN ('citext', 'pgcrypto');
-- Expected: 2 rows

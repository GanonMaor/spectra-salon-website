\set ON_ERROR_STOP on
\timing off
\x auto

\echo === [1] Tables inventory (size, est rows) ===
SELECT
  n.nspname   AS schema,
  c.relname   AS table_name,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
  pg_size_pretty(pg_relation_size(c.oid))       AS table_size,
  pg_size_pretty(pg_indexes_size(c.oid))        AS indexes_size,
  s.n_live_tup                                 AS est_rows,
  s.last_vacuum, s.last_analyze
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
WHERE c.relkind = 'r' AND n.nspname = 'public'
ORDER BY total_size DESC, table_name;

\echo === [2] Columns per table ===
SELECT
  table_name, ordinal_position AS col_no, column_name, data_type,
  is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

\echo === [3] Constraints (PK/FK/Unique) ===
SELECT
  tc.table_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type DESC, kcu.ordinal_position;

\echo === [4] Candidate support/chat tables to archive ===
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
  AND (table_name ILIKE 'support_%'
       OR table_name ILIKE 'message%'
       OR table_name ILIKE 'unified%')
ORDER BY table_name;

\echo === [5] Leads with duplicate emails (top 100) ===
SELECT email, COUNT(*) AS cnt, MIN(created_at) AS first_seen, MAX(updated_at) AS last_seen
FROM public.leads
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY cnt DESC, last_seen DESC
LIMIT 100;

\echo === [6] Attribution fields existence in leads ===
SELECT
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='landing_path')  AS has_landing_path,
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='cta_path')      AS has_cta_path,
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='signup_path')   AS has_signup_path,
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='utm_campaign')  AS has_utm_campaign,
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='gclid')         AS has_gclid,
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema='public' AND table_name='leads' AND column_name='fbclid')        AS has_fbclid;

\echo === [7] Dashboard views (create or replace) ===
-- Align views with existing leads schema. Provide safe fallbacks for non-existent columns.
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

\echo === [8] Triggers present in schema ===
SELECT event_object_table AS table_name,
       trigger_name, action_timing, event_manipulation AS event, action_statement
FROM information_schema.triggers
WHERE trigger_schema='public'
ORDER BY table_name, trigger_name;



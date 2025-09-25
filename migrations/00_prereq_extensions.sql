-- 00_prereq_extensions.sql
-- Prerequisites: PostgreSQL extensions required for the 2-table schema
-- Must run FIRST before other migrations

-- Enable CITEXT for case-insensitive text (emails)
CREATE EXTENSION IF NOT EXISTS citext;

-- Enable pgcrypto for gen_random_uuid() 
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verify extensions are available
DO $$ 
BEGIN
  -- Test CITEXT
  PERFORM 'test@Example.COM'::citext = 'test@example.com'::citext;
  
  -- Test UUID generation
  PERFORM gen_random_uuid();
  
  RAISE NOTICE '✅ Extensions verified: citext and pgcrypto ready';
END $$;

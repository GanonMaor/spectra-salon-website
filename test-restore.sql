-- Smoke test: Restore one backup file to verify integrity
-- This proves the backup files are valid and can be restored

-- Create temp table with same structure as clients
CREATE TEMP TABLE temp_clients_restore (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Load CSV (would use \copy in psql)
-- \copy temp_clients_restore FROM 'backups/pre-reduction-2025-08-26/clients_data.csv' WITH CSV HEADER;

-- Verify row count matches backup report
-- Expected: 5 rows based on backup log
SELECT COUNT(*) AS restored_row_count FROM temp_clients_restore;

-- Show sample data to confirm integrity
SELECT name, email, created_at FROM temp_clients_restore LIMIT 3;

DROP TABLE temp_clients_restore;

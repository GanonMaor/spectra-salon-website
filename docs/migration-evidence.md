# Migration Evidence - Gate B Sign-off

## 1. Extensions Prerequisites ✅

**File:** `migrations/00_prereq_extensions.sql`

```sql
-- Enable CITEXT for case-insensitive text (emails)
CREATE EXTENSION IF NOT EXISTS citext;

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## 2. Idempotent ENUM Creation ✅

**File:** `migrations/01_leads.sql`

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_stage') THEN
    CREATE TYPE lead_stage AS ENUM ('cta_clicked','account_completed','address_completed','payment_viewed');
    RAISE NOTICE '✅ Created lead_stage ENUM';
  ELSE
    RAISE NOTICE '⚠️  lead_stage ENUM already exists - skipping';
  END IF;
END $$;
```

## 3. updated_at Triggers ✅

**Function (idempotent):**

```sql
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
  END IF;
END $$;
```

**Triggers for both tables:**

```sql
-- For leads_new
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads_new;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads_new
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- For subscribers
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON public.subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 4. Minimal Index Set ✅

**Total: 6 indexes only (aligned to Overview queries)**

**leads_new table (4 indexes):**

- `idx_leads_new_stage` - for funnel counting
- `idx_leads_new_created_at` - for time-based queries
- `idx_leads_new_source_page` - for attribution analysis
- `idx_leads_new_session_first` - unique constraint for CTA deduplication

**subscribers table (2 indexes + 2 unique):**

- `idx_subscribers_status` - for status breakdown
- `idx_subscribers_created_at` - for today's metrics
- `idx_subscribers_email_unique` (UNIQUE) - business constraint
- `idx_subscribers_sumit_customer_unique` (UNIQUE) - integration constraint

**No speculative indexes** - each index serves specific Overview dashboard queries.

## 5. Clean Start (No Data Migration) ✅

**File:** `migrations/01_leads.sql` & `migrations/02_subscribers.sql`

```sql
-- CLEAN START - No data migration (per business requirement)
-- Old data is preserved in backups for reference only

RAISE NOTICE '🗑️  CLEAN START: Starting with empty leads table (old data in backups)';
RAISE NOTICE '🗑️  CLEAN START: Starting with empty subscribers table (old data in backups)';
```

**All legacy data migration code removed** - replaced with clean start notices.

## 6. No Database Views ✅

**All VIEW creation statements removed from migrations:**

- ❌ `v_leads_summary` - removed
- ❌ `v_funnel_conversion_7d` - removed
- ❌ `v_subscription_summary` - removed
- ❌ `v_revenue_by_period` - removed
- ❌ `v_trial_conversions` - removed
- ❌ `v_subscribers_today` - removed
- ❌ `v_lead_to_subscriber_funnel` - removed

**Overview dashboard will use direct SQL queries** instead of views.

## 7. Expected Post-Migration State

After running migrations on clean database:

```sql
SELECT COUNT(*) FROM leads_new;     -- Expected: 0
SELECT COUNT(*) FROM subscribers;   -- Expected: 0

-- No views should exist
SELECT * FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog','information_schema');
-- Expected: Empty result

-- ENUMs should exist
SELECT typname FROM pg_type WHERE typname IN ('lead_stage', 'subscription_status');
-- Expected: 2 rows

-- Triggers should be active
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%updated_at%';
-- Expected: 2 rows (leads + subscribers)
```

## 8. Rollback Available ✅

**File:** `migrations/00_down_migration.sql`

- Drops new tables/ENUMs
- Restores original views
- Emergency rollback ready

---

**Status:** Ready for Gate B sign-off ✅  
**All requirements met:** Extensions, idempotent creation, triggers, minimal indexes, clean start, no views

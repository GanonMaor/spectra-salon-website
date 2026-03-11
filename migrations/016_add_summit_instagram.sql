-- Migration 016: Add summit and instagram columns to salon_users
-- Safe to run multiple times (IF NOT EXISTS)

ALTER TABLE salon_users
  ADD COLUMN IF NOT EXISTS summit TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram TEXT DEFAULT '';

COMMENT ON COLUMN salon_users.summit IS 'Summit CRM / referral link for the salon';
COMMENT ON COLUMN salon_users.instagram IS 'Instagram handle or URL for the salon';

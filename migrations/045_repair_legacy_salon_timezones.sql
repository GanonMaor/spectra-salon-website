-- ============================================================================
-- Migration 045: Repair legacy salon timezone placeholders
-- ============================================================================
-- Early bootstrap paths could expose UTC for salons whose timezone was missing.
-- Supported countries all have an IANA regional zone with DST/history rules, so
-- fixed UTC is not a correct business-calendar default for these records.

UPDATE salons
SET timezone = CASE COALESCE(country_code, 'IL')
  WHEN 'IL' THEN 'Asia/Jerusalem'
  WHEN 'US' THEN 'America/New_York'
  WHEN 'GB' THEN 'Europe/London'
  WHEN 'FR' THEN 'Europe/Paris'
  WHEN 'DE' THEN 'Europe/Berlin'
  WHEN 'CA' THEN 'America/Toronto'
  WHEN 'AU' THEN 'Australia/Sydney'
  ELSE timezone
END,
updated_at = now()
WHERE timezone IS NULL
   OR timezone = ''
   OR (
     timezone = 'UTC'
     AND COALESCE(country_code, 'IL') IN ('IL', 'US', 'GB', 'FR', 'DE', 'CA', 'AU')
   );

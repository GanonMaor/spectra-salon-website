-- Add SUMIT password field to users table
-- This stores the auto-generated password for SUMIT access
-- Should be encrypted/hashed in production

ALTER TABLE users
ADD COLUMN IF NOT EXISTS sumit_password_hash VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_sumit_user_id_password 
ON users(sumit_user_id) 
WHERE sumit_user_id IS NOT NULL;

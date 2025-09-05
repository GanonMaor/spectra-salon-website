-- Add SUMIT Customer ID field to users table
-- This separates User ID (for login/access) from Customer ID (for billing)

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS sumit_customer_id INTEGER;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_sumit_customer_id ON users(sumit_customer_id);

-- Add comment for clarity
COMMENT ON COLUMN users.sumit_customer_id IS 'SUMIT Customer ID for billing - different from sumit_user_id which is for login';

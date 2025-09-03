-- Add SUMIT-related fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS sumit_user_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS sumit_plan_id INTEGER,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;

-- Create index for SUMIT user ID
CREATE INDEX IF NOT EXISTS idx_users_sumit_user_id ON users(sumit_user_id);

-- Create index for subscription status
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Update subscription_status to have proper values
UPDATE users SET subscription_status = 'none' WHERE subscription_status IS NULL;

-- Add check constraint for subscription status
ALTER TABLE users
ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('none', 'trial', 'active', 'canceled', 'expired'));

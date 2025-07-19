-- Spectra CI Database Schema - Neon DB Version
-- Complete structure with all required tables

-- Users table (already exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'partner')),
  summit_id VARCHAR(100),
  profile_image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table - for tracking user payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  service VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  receipt_url VARCHAR(500),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User actions table - for tracking user activity
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table - for user preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  notifications_email BOOLEAN DEFAULT true,
  notifications_sms BOOLEAN DEFAULT false,
  language VARCHAR(5) DEFAULT 'en',
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  timezone VARCHAR(50) DEFAULT 'UTC',
  email_marketing BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table (from existing schema)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  source VARCHAR(100),
  cta_clicked VARCHAR(100),
  message TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  summit_status VARCHAR(20) CHECK (summit_status IN ('trial', 'active', 'cancelled', 'pending')),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CTA Clicks table (from existing schema)
CREATE TABLE IF NOT EXISTS cta_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  button_name VARCHAR(255) NOT NULL,
  page_url VARCHAR(500) NOT NULL,
  device_type VARCHAR(50),
  user_agent TEXT,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  ip_address INET,
  referrer VARCHAR(500),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for JWT management)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

CREATE INDEX IF NOT EXISTS idx_cta_clicks_user_id ON cta_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_timestamp ON cta_clicks(timestamp);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Insert some sample data for testing (optional)
INSERT INTO payments (user_id, amount, currency, status, service, paid_at) 
SELECT 
  u.id,
  CASE 
    WHEN random() < 0.3 THEN 299.00
    WHEN random() < 0.6 THEN 199.00
    ELSE 149.00
  END,
  'USD',
  CASE 
    WHEN random() < 0.9 THEN 'completed'
    ELSE 'pending'
  END,
  CASE 
    WHEN random() < 0.3 THEN 'Premium Subscription'
    WHEN random() < 0.6 THEN 'Color Analysis'
    ELSE 'Style Consultation'
  END,
  NOW() - (random() * interval '90 days')
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM payments WHERE user_id = u.id)
LIMIT 5;

-- Insert default settings for existing users
INSERT INTO user_settings (user_id, notifications_email, notifications_sms, language, theme)
SELECT 
  u.id,
  true,
  false,
  'en',
  'light'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = u.id); 
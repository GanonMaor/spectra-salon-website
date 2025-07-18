-- Spectra CI Database Schema - Neon DB Version
-- Simple structure without Supabase auth dependencies

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'partner')),
  summit_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
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

-- CTA Clicks table
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

-- Sessions table (for auth)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_button ON cta_clicks(button_name);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Insert admin user (password will be hashed by the app)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('maor@spectra-ci.com', '$2b$10$placeholder_hash_change_on_first_login', 'Maor Ganon', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Add some demo data for testing
INSERT INTO leads (name, email, phone, source, message, status) VALUES 
('Test Lead 1', 'test1@example.com', '+972-50-1234567', 'website', 'Interested in the product', 'new'),
('Test Lead 2', 'test2@example.com', '+972-50-7654321', 'referral', 'Want to learn more about pricing', 'contacted')
ON CONFLICT (email) DO NOTHING;

-- Verification
SELECT 'Neon DB schema created successfully!' as status,
       'Tables: users, leads, cta_clicks, user_sessions' as tables_created,
       (SELECT COUNT(*) FROM users) as user_count,
       (SELECT COUNT(*) FROM leads) as lead_count; 
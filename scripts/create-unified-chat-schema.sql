-- Unified Chat System Database Schema
-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS support_assignments CASCADE;
DROP TABLE IF EXISTS client_throttling CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS message_tags CASCADE;
DROP TABLE IF EXISTS support_users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- support_users table
CREATE TABLE support_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'support', -- 'admin' | 'support' | 'read-only'
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- message_tags table
CREATE TABLE message_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'client' | 'admin'
  message TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'chat', -- 'chat' | 'whatsapp' | 'email' | 'sms' | 'instagram'
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new', -- 'new' | 'in-progress' | 'waiting' | 'resolved'
  assigned_to UUID REFERENCES support_users(id),
  tag TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add file attachment columns to messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS attachment BYTEA,
  ADD COLUMN IF NOT EXISTS attachment_mime TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_size INT;

-- support_assignments table
CREATE TABLE support_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  support_user_id UUID REFERENCES support_users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- client_throttling table
CREATE TABLE client_throttling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  ip TEXT,
  email TEXT,
  phone TEXT,
  attempts INT DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_messages_client_id ON messages(client_id);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_assigned_to ON messages(assigned_to);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_support_users_email ON support_users(email);

-- Insert default message tags
INSERT INTO message_tags (label, color) VALUES
  ('Urgent', '#EF4444'),
  ('Sales', '#10B981'),
  ('Support', '#3B82F6'),
  ('Billing', '#F59E0B'),
  ('Demo', '#8B5CF6'),
  ('Follow-up', '#6B7280');

-- Insert default admin user (update with real password hash)
INSERT INTO support_users (email, name, role, password_hash) VALUES
  ('admin@spectra-ci.com', 'Admin User', 'admin', '$2b$10$placeholder_hash_here');

-- Sample data for testing
INSERT INTO clients (name, email, phone, location) VALUES
  ('Sarah Johnson', 'sarah@example.com', '+972501234567', 'Tel Aviv, Israel'),
  ('Michael Chen', 'mike@example.com', '+972549876543', 'Jerusalem, Israel'),
  ('Emma Rodriguez', 'emma@example.com', '+972521234567', 'Haifa, Israel');

-- Sample messages
INSERT INTO messages (client_id, sender, message, channel, status) VALUES
  ((SELECT id FROM clients WHERE email = 'sarah@example.com'), 'client', 'Hi! I am interested in your color tracking system. Can you tell me more about pricing?', 'whatsapp', 'new'),
  ((SELECT id FROM clients WHERE email = 'mike@example.com'), 'client', 'I need help with installation. When can we schedule a demo?', 'chat', 'in-progress'),
  ((SELECT id FROM clients WHERE email = 'emma@example.com'), 'client', 'Do you offer bulk pricing for multiple salon locations?', 'email', 'new');
-- ========================================
-- CONTACTS TABLE
-- ========================================
-- Created: 2026-01-18
-- Purpose: Store contact information (first name, last name, phone)

-- Create the contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);

-- Sample data (optional)
INSERT INTO contacts (first_name, last_name, phone) VALUES 
  ('John', 'Doe', '+1-555-0101'),
  ('Jane', 'Smith', '+1-555-0102'),
  ('Michael', 'Johnson', '+1-555-0103')
ON CONFLICT DO NOTHING;

-- Useful queries:

-- Get all contacts
-- SELECT * FROM contacts ORDER BY created_at DESC;

-- Search by phone
-- SELECT * FROM contacts WHERE phone = '+1-555-0101';

-- Search by name
-- SELECT * FROM contacts WHERE first_name ILIKE '%john%' OR last_name ILIKE '%john%';

-- Count contacts
-- SELECT COUNT(*) FROM contacts;

-- Add new contact
-- INSERT INTO contacts (first_name, last_name, phone) VALUES ('Sarah', 'Williams', '+1-555-0104');

-- Update contact
-- UPDATE contacts SET phone = '+1-555-9999' WHERE id = 1;

-- Delete contact
-- DELETE FROM contacts WHERE id = 1;

-- Database setup for SUMIT data import
-- Run this SQL in your Neon PostgreSQL database

-- Enhanced users table for customer data
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  
  -- Customer identification
  card_name TEXT,                    -- שם הכרטיס
  full_name TEXT NOT NULL,           -- שם מלא
  id_number TEXT,                    -- ת"ז/ח"פ
  
  -- Contact information
  phone TEXT,                        -- טלפון
  email TEXT UNIQUE NOT NULL,        -- כתובת מייל (unique for login)
  
  -- Address information
  address TEXT,                      -- פרטי כתובת
  city TEXT,                         -- יישוב
  zip_code TEXT,                     -- מיקוד
  
  -- Business logic
  next_contact DATE,                 -- התאריך הבא ליצירת קשר
  status TEXT DEFAULT 'active',      -- סטטוס
  
  -- System fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Legacy fields (if needed for existing system)
  password_hash TEXT,                -- For login system
  role TEXT DEFAULT 'client',        -- user role
  is_verified BOOLEAN DEFAULT false  -- email verification
);

-- Payments table for transaction data
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  
  -- Payment identification
  document_id TEXT UNIQUE NOT NULL,  -- מספר מסמך (from SUMIT)
  reference_number TEXT,             -- מספר אסמכתא
  
  -- Customer linking
  customer_name TEXT,                -- לקוח
  customer_id TEXT,                  -- מזהה לקוח
  user_id INTEGER REFERENCES users(id), -- Link to users table
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,     -- סכום
  currency TEXT DEFAULT 'ILS',       -- מטבע
  payment_date DATE NOT NULL,        -- תאריך תשלום
  payment_method TEXT,               -- אמצעי תשלום
  
  -- Status and notes
  status TEXT DEFAULT 'completed',   -- סטטוס
  notes TEXT,                        -- הערות
  
  -- System fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_next_contact ON users(next_contact);

CREATE INDEX IF NOT EXISTS idx_payments_document_id ON payments(document_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Function to link payments to users by email
CREATE OR REPLACE FUNCTION link_payments_to_users()
RETURNS void AS $$
BEGIN
  UPDATE payments 
  SET user_id = users.id
  FROM users 
  WHERE payments.customer_name = users.full_name 
    AND payments.user_id IS NULL;
    
  -- Alternative linking by customer_id if available
  UPDATE payments 
  SET user_id = users.id
  FROM users 
  WHERE payments.customer_id = users.id_number
    AND payments.user_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for reporting and analytics
CREATE OR REPLACE VIEW customer_payment_summary AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  u.phone,
  u.city,
  u.status as customer_status,
  COUNT(p.id) as total_payments,
  SUM(p.amount) as total_amount,
  AVG(p.amount) as avg_payment,
  MAX(p.payment_date) as last_payment_date,
  MIN(p.payment_date) as first_payment_date
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
GROUP BY u.id, u.full_name, u.email, u.phone, u.city, u.status;

-- Sample queries you can run after import:
/*
-- Check total customers imported
SELECT COUNT(*) as total_customers FROM users;

-- Check total payments imported
SELECT COUNT(*) as total_payments, SUM(amount) as total_revenue FROM payments;

-- Top customers by revenue
SELECT full_name, email, total_amount, total_payments 
FROM customer_payment_summary 
ORDER BY total_amount DESC 
LIMIT 10;

-- Payment trends by month
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  COUNT(*) as payment_count,
  SUM(amount) as monthly_revenue
FROM payments 
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month DESC;

-- Link existing payments to users (run after import)
SELECT link_payments_to_users();
*/ 
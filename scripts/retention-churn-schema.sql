
-- Retention & Churn Tables
CREATE TABLE IF NOT EXISTS customer_monthly_payments (
  id SERIAL PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT,
  payment_month DATE NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  payment_count INTEGER DEFAULT 0,
  subscription_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, payment_month)
);

CREATE TABLE IF NOT EXISTS customer_lifecycle (
  id SERIAL PRIMARY KEY,
  customer_id TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  first_payment_date DATE,
  last_payment_date DATE,
  total_payments INTEGER DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  months_active INTEGER DEFAULT 0,
  current_status TEXT DEFAULT 'active',
  churn_date DATE,
  subscription_type TEXT,
  ltv DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_retention_reports (
  id SERIAL PRIMARY KEY,
  report_month DATE NOT NULL,
  cohort_month DATE NOT NULL,
  cohort_size INTEGER NOT NULL,
  retained_customers INTEGER NOT NULL,
  retention_rate DECIMAL(5,2) NOT NULL,
  months_since_signup INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(report_month, cohort_month)
);

CREATE TABLE IF NOT EXISTS churn_analysis (
  id SERIAL PRIMARY KEY,
  month_year DATE NOT NULL,
  total_customers INTEGER NOT NULL,
  churned_customers INTEGER NOT NULL,
  churn_rate DECIMAL(5,2) NOT NULL,
  revenue_lost DECIMAL(10,2) NOT NULL,
  avg_customer_lifespan_months DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(month_year)
);

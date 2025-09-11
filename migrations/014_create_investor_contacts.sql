-- Create investor contacts table for potential investors
-- This table stores contact information from the investor deck contact form

CREATE TABLE IF NOT EXISTS investor_contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Track engagement
  contacted BOOLEAN DEFAULT FALSE,
  contacted_at TIMESTAMP WITH TIME ZONE,
  contacted_by VARCHAR(255),
  notes TEXT,
  
  -- Lead scoring
  investor_type VARCHAR(50), -- 'angel', 'vc', 'strategic', 'other'
  investment_range VARCHAR(50), -- '50k-100k', '100k-500k', '500k+', etc.
  interest_level INTEGER CHECK (interest_level >= 1 AND interest_level <= 5), -- 1-5 scale
  
  -- Source tracking
  source VARCHAR(100) DEFAULT 'investor_deck',
  referrer VARCHAR(255),
  
  -- Indexing for performance
  CONSTRAINT unique_email_per_source UNIQUE (email, source)
);

-- Create indexes for common queries
CREATE INDEX idx_investor_contacts_email ON investor_contacts(email);
CREATE INDEX idx_investor_contacts_created_at ON investor_contacts(created_at DESC);
CREATE INDEX idx_investor_contacts_contacted ON investor_contacts(contacted);
CREATE INDEX idx_investor_contacts_interest_level ON investor_contacts(interest_level DESC);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_investor_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_investor_contacts_updated_at
BEFORE UPDATE ON investor_contacts
FOR EACH ROW
EXECUTE FUNCTION update_investor_contacts_updated_at();

-- Create view for active leads
CREATE VIEW v_active_investor_leads AS
SELECT 
  id,
  name,
  email,
  company,
  created_at,
  interest_level,
  investor_type,
  investment_range,
  CASE 
    WHEN contacted THEN 'Contacted'
    WHEN created_at > NOW() - INTERVAL '7 days' THEN 'New'
    WHEN created_at > NOW() - INTERVAL '30 days' THEN 'Recent'
    ELSE 'Aging'
  END as status,
  EXTRACT(DAY FROM NOW() - created_at) as days_since_contact
FROM investor_contacts
WHERE NOT contacted OR contacted_at > NOW() - INTERVAL '90 days'
ORDER BY 
  contacted ASC,
  interest_level DESC NULLS LAST,
  created_at DESC;

-- Grant permissions
GRANT SELECT, INSERT ON investor_contacts TO authenticated;
GRANT SELECT ON v_active_investor_leads TO authenticated;

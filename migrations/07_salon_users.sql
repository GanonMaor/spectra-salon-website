-- Migration: Create salon_users table
-- Description: Stores all salon user/client data with their activity info

CREATE TABLE IF NOT EXISTS salon_users (
    id SERIAL PRIMARY KEY,
    salon_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(30),
    profiles INTEGER DEFAULT 0,
    first_mix_date VARCHAR(50),
    last_mix_date VARCHAR(50),
    monthly_trend VARCHAR(20) DEFAULT '-',
    version VARCHAR(10),
    state VARCHAR(100),
    city VARCHAR(100),
    links VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_salon_users_salon_name ON salon_users(salon_name);
CREATE INDEX IF NOT EXISTS idx_salon_users_phone ON salon_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_salon_users_version ON salon_users(version);
CREATE INDEX IF NOT EXISTS idx_salon_users_state ON salon_users(state);
CREATE INDEX IF NOT EXISTS idx_salon_users_city ON salon_users(city);

-- Create a view for summary by country/state
CREATE OR REPLACE VIEW v_salon_users_by_state AS
SELECT
    COALESCE(state, 'Unknown') as state,
    COUNT(*) as total_salons,
    SUM(profiles) as total_profiles,
    AVG(profiles) as avg_profiles
FROM salon_users
GROUP BY state
ORDER BY total_salons DESC;

-- Create a view for version distribution
CREATE OR REPLACE VIEW v_salon_users_by_version AS
SELECT
    version,
    COUNT(*) as total_salons,
    SUM(profiles) as total_profiles
FROM salon_users
GROUP BY version
ORDER BY version DESC;

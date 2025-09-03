-- Create spectra_payments table
CREATE TABLE IF NOT EXISTS spectra_payments (
    id SERIAL PRIMARY KEY,
    client VARCHAR(255) NOT NULL,
    payment_date DATE NOT NULL,
    currency VARCHAR(3) CHECK (currency IN ('ILS', 'USD')) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    country VARCHAR(100) DEFAULT 'Israel',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_spectra_payments_client ON spectra_payments(client);
CREATE INDEX idx_spectra_payments_date ON spectra_payments(payment_date);
CREATE INDEX idx_spectra_payments_currency ON spectra_payments(currency);
CREATE INDEX idx_spectra_payments_country ON spectra_payments(country);

-- Create a view for monthly summary
CREATE OR REPLACE VIEW v_spectra_payments_monthly AS
SELECT 
    DATE_TRUNC('month', payment_date) as month,
    currency,
    SUM(amount) as total_amount,
    COUNT(DISTINCT client) as unique_clients,
    COUNT(*) as transaction_count
FROM spectra_payments
GROUP BY DATE_TRUNC('month', payment_date), currency
ORDER BY month DESC, currency;

-- Create a view for client summary
CREATE OR REPLACE VIEW v_spectra_clients_summary AS
SELECT 
    client,
    currency,
    COUNT(*) as payment_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    MIN(payment_date) as first_payment,
    MAX(payment_date) as last_payment
FROM spectra_payments
GROUP BY client, currency
ORDER BY total_amount DESC;

-- Create a view for country summary
CREATE OR REPLACE VIEW v_spectra_country_summary AS
SELECT 
    country,
    currency,
    COUNT(DISTINCT client) as unique_clients,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM spectra_payments
GROUP BY country, currency
ORDER BY total_amount DESC;

-- Sample data (replace with actual import)
INSERT INTO spectra_payments (client, payment_date, currency, amount, country) VALUES
('סלון ספקטרה תל אביב', '2024-01-15', 'ILS', 15000, 'Israel'),
('סלון ספקטרה תל אביב', '2024-02-15', 'ILS', 18000, 'Israel'),
('Spectra NYC', '2024-01-20', 'USD', 5000, 'USA'),
('Spectra NYC', '2024-02-20', 'USD', 5500, 'USA'),
('סלון ספקטרה רמת גן', '2024-01-10', 'ILS', 12000, 'Israel'),
('סלון ספקטרה רמת גן', '2024-02-10', 'ILS', 13500, 'Israel'),
('Spectra LA', '2024-01-25', 'USD', 4500, 'USA'),
('Spectra LA', '2024-02-25', 'USD', 4800, 'USA');

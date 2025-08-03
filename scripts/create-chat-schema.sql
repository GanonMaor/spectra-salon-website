-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source_page TEXT,
    last_message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    tags TEXT[] DEFAULT '{}',
    pipeline_stage TEXT DEFAULT 'lead' CHECK (pipeline_stage IN ('lead', 'trial', 'customer', 'churned')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support messages table
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
    sender_name TEXT NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    file_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_timestamp ON support_messages(timestamp DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_support_ticket_timestamp();

-- Insert sample data for testing
INSERT INTO support_tickets (name, email, phone, source_page, last_message, status, tags, pipeline_stage) VALUES
('Sarah Chen', 'sarah@modernhair.com', '+1-555-0123', '/features', 'Hi, I need help setting up the color matching system', 'new', ARRAY['technical', 'setup'], 'lead'),
('Mike Johnson', 'mike@salonpro.com', '+1-555-0456', '/pricing', 'What are the pricing options for multiple locations?', 'in_progress', ARRAY['pricing', 'sales'], 'trial'),
('Lisa Rodriguez', 'lisa@glamstudio.com', '+1-555-0789', '/contact', 'The formula is not mixing correctly', 'new', ARRAY['technical', 'formula'], 'customer');

-- Insert sample messages for the tickets
DO $$
DECLARE
    ticket1_id UUID;
    ticket2_id UUID;
    ticket3_id UUID;
BEGIN
    SELECT id INTO ticket1_id FROM support_tickets WHERE email = 'sarah@modernhair.com';
    SELECT id INTO ticket2_id FROM support_tickets WHERE email = 'mike@salonpro.com';
    SELECT id INTO ticket3_id FROM support_tickets WHERE email = 'lisa@glamstudio.com';
    
    INSERT INTO support_messages (ticket_id, sender_type, sender_name, message) VALUES
    (ticket1_id, 'client', 'Sarah Chen', 'Hi, I need help setting up the color matching system'),
    (ticket2_id, 'client', 'Mike Johnson', 'What are the pricing options for multiple locations?'),
    (ticket2_id, 'admin', 'Support Team', 'Hi Mike! I''d be happy to help with pricing. Let me get you the multi-location details.'),
    (ticket3_id, 'client', 'Lisa Rodriguez', 'The formula is not mixing correctly');
END $$;
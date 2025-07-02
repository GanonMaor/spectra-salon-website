-- Spectra CI Database Schema - Phase 2
-- Advanced RLS (Row Level Security) & Role Management

-- =====================================================
-- PHASE 2: CREATE NEW TABLES
-- =====================================================

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  source text, -- which page they came from
  cta_clicked text, -- which button they clicked
  message text, -- optional message from contact forms
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  summit_status text, -- 'trial', 'active', 'cancelled', 'pending'
  user_id uuid REFERENCES auth.users(id), -- if they later register
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create cta_clicks table
CREATE TABLE IF NOT EXISTS public.cta_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  button_name text NOT NULL, -- e.g., "Start Trial", "Contact Us"
  page_url text NOT NULL, -- the page where the click happened
  device_type text, -- 'mobile', 'desktop', 'tablet'
  user_agent text, -- browser info
  user_id uuid REFERENCES auth.users(id), -- if user is logged in
  session_id text, -- anonymous session tracking
  ip_address inet, -- for analytics (anonymized)
  referrer text, -- where they came from
  timestamp timestamp with time zone DEFAULT now()
);

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  action text NOT NULL, -- 'create', 'update', 'delete', 'view'
  target_type text NOT NULL, -- 'user', 'lead', 'payment', etc.
  target_id text, -- ID of the affected record
  details jsonb, -- additional information about the action
  ip_address inet,
  user_agent text,
  timestamp timestamp with time zone DEFAULT now()
);

-- =====================================================
-- PHASE 2: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PHASE 2: DROP EXISTING POLICIES (CLEAN SLATE)
-- =====================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- =====================================================
-- PHASE 2: USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (OLD.role = NEW.role OR OLD.role IS NULL) -- prevent role escalation
  );

-- Admins can read all users
CREATE POLICY "users_select_admin" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all users (including roles)
CREATE POLICY "users_update_admin" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow authenticated users to insert (for registration)
CREATE POLICY "users_insert_authenticated" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- PHASE 2: LEADS TABLE POLICIES
-- =====================================================

-- Only admins can read all leads
CREATE POLICY "leads_select_admin" ON public.leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can only read their own leads (if user_id matches)
CREATE POLICY "leads_select_own" ON public.leads
  FOR SELECT USING (user_id = auth.uid());

-- Only admins can insert leads
CREATE POLICY "leads_insert_admin" ON public.leads
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow anonymous insert for lead capture forms
CREATE POLICY "leads_insert_anonymous" ON public.leads
  FOR INSERT WITH CHECK (user_id IS NULL);

-- Only admins can update leads
CREATE POLICY "leads_update_admin" ON public.leads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete leads
CREATE POLICY "leads_delete_admin" ON public.leads
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PHASE 2: CTA CLICKS TABLE POLICIES
-- =====================================================

-- Only admins can read all CTA clicks
CREATE POLICY "cta_clicks_select_admin" ON public.cta_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can read their own clicks
CREATE POLICY "cta_clicks_select_own" ON public.cta_clicks
  FOR SELECT USING (user_id = auth.uid());

-- Allow anyone to insert CTA clicks (for tracking)
CREATE POLICY "cta_clicks_insert_all" ON public.cta_clicks
  FOR INSERT WITH CHECK (true);

-- Only admins can update/delete CTA clicks
CREATE POLICY "cta_clicks_update_admin" ON public.cta_clicks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "cta_clicks_delete_admin" ON public.cta_clicks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- PHASE 2: ADMIN LOGS TABLE POLICIES
-- =====================================================

-- Only admins can read admin logs
CREATE POLICY "admin_logs_select_admin" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert admin logs
CREATE POLICY "admin_logs_insert_admin" ON public.admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin logs are append-only (no updates or deletes)
-- This ensures audit trail integrity

-- =====================================================
-- PHASE 2: HELPER FUNCTIONS
-- =====================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_target_type text,
  p_target_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Only log if user is admin
  IF public.is_admin() THEN
    INSERT INTO public.admin_logs (admin_id, action, target_type, target_id, details)
    VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PHASE 2: TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Update triggers for new tables
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 2: INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);

-- Indexes for cta_clicks table
CREATE INDEX IF NOT EXISTS idx_cta_clicks_button_name ON public.cta_clicks(button_name);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_page_url ON public.cta_clicks(page_url);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_timestamp ON public.cta_clicks(timestamp);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_user_id ON public.cta_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_cta_clicks_session_id ON public.cta_clicks(session_id);

-- Indexes for admin_logs table
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_type ON public.admin_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON public.admin_logs(timestamp);

-- =====================================================
-- PHASE 2: GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.cta_clicks TO authenticated;
GRANT ALL ON public.admin_logs TO authenticated;

-- Allow anonymous users to insert leads and CTA clicks
GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.cta_clicks TO anon;

-- =====================================================
-- PHASE 2: TEST DATA (OPTIONAL)
-- =====================================================

-- Insert some test leads (only if you want sample data)
-- INSERT INTO public.leads (name, email, phone, source, cta_clicked, status)
-- VALUES 
--   ('John Doe', 'john@example.com', '+1-555-0123', '/ugc-offer', 'Start Trial', 'new'),
--   ('Jane Smith', 'jane@example.com', '+1-555-0124', '/features', 'Contact Us', 'contacted'),
--   ('Bob Wilson', 'bob@example.com', '+1-555-0125', '/', 'Learn More', 'qualified');

-- =====================================================
-- PHASE 2: VERIFICATION
-- =====================================================

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'leads', 'cta_clicks', 'admin_logs');

-- Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'leads', 'cta_clicks', 'admin_logs')
ORDER BY tablename, policyname;

-- Success message
SELECT 'Phase 2 - Advanced RLS & Role Management completed successfully!' as status; 
-- VENUS Water Management Company Database Migration
-- Version: 001_initial_schema.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLE: enquiries
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    email_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    sms_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL
);

-- Comments on enquiries table and columns
COMMENT ON TABLE public.enquiries IS 'Customer enquiries submitted via VENUS website enquiry form';
COMMENT ON COLUMN public.enquiries.id IS 'Unique UUID identifier for the enquiry';
COMMENT ON COLUMN public.enquiries.customer_name IS 'Full name of the prospective customer';
COMMENT ON COLUMN public.enquiries.email IS 'Validated email address of customer';
COMMENT ON COLUMN public.enquiries.mobile IS 'Contact mobile number of customer';
COMMENT ON COLUMN public.enquiries.message IS 'Enquiry text describing the water management requirement';
COMMENT ON COLUMN public.enquiries.created_at IS 'UTC timestamp when enquiry was submitted';
COMMENT ON COLUMN public.enquiries.email_status IS 'Status of Resend email notification (SENT, PENDING, or FAILED: reason)';
COMMENT ON COLUMN public.enquiries.sms_status IS 'Status of Twilio SMS notification (SENT, PENDING, or FAILED: reason)';

-- Indexes for performance and sorting
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON public.enquiries (email);
CREATE INDEX IF NOT EXISTS idx_enquiries_customer_name ON public.enquiries (customer_name);

-- ==============================================================================
-- 2. TABLE: admin_users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments on admin_users table
COMMENT ON TABLE public.admin_users IS 'List of authenticated Supabase Auth users authorized as VENUS Administrators';
COMMENT ON COLUMN public.admin_users.user_id IS 'Foreign key referencing auth.users.id';

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users (user_id);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on both tables
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper security function to verify whether currently authenticated user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = auth.uid()
  );
$$;

-- Grant execute on is_admin function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ENQUIRIES POLICIES:
-- 1. Public (anonymous) users can only INSERT enquiries.
CREATE POLICY "Public users can insert enquiries" 
ON public.enquiries 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
    char_length(customer_name) >= 2 AND
    char_length(email) >= 5 AND
    char_length(mobile) >= 7 AND
    char_length(message) >= 5
);

-- 2. Strictly DENY public SELECT on enquiries
-- Only verified admins can SELECT enquiries
CREATE POLICY "Admins can view all enquiries" 
ON public.enquiries 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

-- 3. Only verified admins can UPDATE enquiries (e.g. status updates)
CREATE POLICY "Admins can update enquiries" 
ON public.enquiries 
FOR UPDATE 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Only verified admins can DELETE enquiries
CREATE POLICY "Admins can delete enquiries" 
ON public.enquiries 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- ADMIN_USERS POLICIES:
-- 1. Authenticated users can read their own admin record to verify admin status
CREATE POLICY "Users can verify their own admin status" 
ON public.admin_users 
FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- 2. Only existing admins or service_role can manage admin_users
CREATE POLICY "Admins can manage admin_users" 
ON public.admin_users 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 4. INITIAL ADMIN PROVISIONING HELPER
-- ==============================================================================
-- To grant admin access to a registered user in Supabase SQL editor:
-- INSERT INTO public.admin_users (user_id) 
-- VALUES ('<USER_UUID_FROM_AUTH_USERS>')
-- ON CONFLICT (user_id) DO NOTHING;

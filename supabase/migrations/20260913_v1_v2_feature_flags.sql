-- ==============================================================================
-- Migration: V1 and V2 Route Feature Flags
-- Target: Supabase PostgreSQL Database (users and organizations tables)
-- ==============================================================================

-- 1. Add v1_routes and v2_routes columns to public.users
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS v1_routes BOOLEAN DEFAULT false;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS v2_routes BOOLEAN DEFAULT true;

-- 2. Add v1_routes and v2_routes columns to public.organizations
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS v1_routes BOOLEAN DEFAULT false;

ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS v2_routes BOOLEAN DEFAULT true;

-- 3. Comments for documentation
COMMENT ON COLUMN public.users.v1_routes IS 'Enables access to V1 LED route creation and V1 export format';
COMMENT ON COLUMN public.users.v2_routes IS 'Enables access to V2 multi-screen route creation and V2 export format';
COMMENT ON COLUMN public.organizations.v1_routes IS 'Default V1 route access for users in this organization';
COMMENT ON COLUMN public.organizations.v2_routes IS 'Default V2 route access for users in this organization';

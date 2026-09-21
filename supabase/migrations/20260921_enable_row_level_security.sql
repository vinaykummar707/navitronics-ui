-- ==============================================================================
-- Migration: Enable Row Level Security (RLS) & Multi-Tenant Access Policies (PND-02 / ISS-02)
-- Target: Supabase PostgreSQL Database
-- Date: 2026-09-21
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Helper function: Get Current User's Organization ID and Role
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id
  FROM public.users
  WHERE id = auth.uid() OR user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE (u.id = auth.uid() OR u.user_id = auth.uid())
      AND LOWER(r.name) IN ('master', 'super_admin')
      AND u.deleted = false
      AND u.active = true
  );
$$;

-- ------------------------------------------------------------------------------
-- 2. Enable Row Level Security across all core tables
-- ------------------------------------------------------------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stop_audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.font_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Organizations Policies
-- ------------------------------------------------------------------------------

-- Allow super admins full access
DROP POLICY IF EXISTS "Super admins manage organizations" ON public.organizations;
CREATE POLICY "Super admins manage organizations"
  ON public.organizations
  FOR ALL
  USING (public.is_super_admin());

-- Allow tenant users to view their assigned organization
DROP POLICY IF EXISTS "Users can view assigned organization" ON public.organizations;
CREATE POLICY "Users can view assigned organization"
  ON public.organizations
  FOR SELECT
  USING (
    id = public.current_user_org_id()
    OR auth.role() = 'anon' -- needed for initial tenant discovery before session hydration
  );

-- ------------------------------------------------------------------------------
-- 4. Regions Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Super admins manage regions" ON public.regions;
CREATE POLICY "Super admins manage regions"
  ON public.regions
  FOR ALL
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Tenant users manage regions" ON public.regions;
CREATE POLICY "Tenant users manage regions"
  ON public.regions
  FOR ALL
  USING (organization_id = public.current_user_org_id())
  WITH CHECK (organization_id = public.current_user_org_id());

-- ------------------------------------------------------------------------------
-- 5. Depots Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Super admins manage depots" ON public.depots;
CREATE POLICY "Super admins manage depots"
  ON public.depots
  FOR ALL
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Tenant users manage depots" ON public.depots;
CREATE POLICY "Tenant users manage depots"
  ON public.depots
  FOR ALL
  USING (
    organization_id = public.current_user_org_id()
    OR region_id IN (
      SELECT id FROM public.regions WHERE organization_id = public.current_user_org_id()
    )
  )
  WITH CHECK (
    organization_id = public.current_user_org_id()
  );

-- ------------------------------------------------------------------------------
-- 6. Users Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Super admins manage users" ON public.users;
CREATE POLICY "Super admins manage users"
  ON public.users
  FOR ALL
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Users can view and edit own profile" ON public.users;
CREATE POLICY "Users can view and edit own profile"
  ON public.users
  FOR ALL
  USING (id = auth.uid() OR user_id = auth.uid())
  WITH CHECK (id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Tenant admins view organization users" ON public.users;
CREATE POLICY "Tenant admins view organization users"
  ON public.users
  FOR SELECT
  USING (organization_id = public.current_user_org_id());

-- ------------------------------------------------------------------------------
-- 7. Routes Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Super admins manage routes" ON public.routes;
CREATE POLICY "Super admins manage routes"
  ON public.routes
  FOR ALL
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Tenant users manage routes" ON public.routes;
CREATE POLICY "Tenant users manage routes"
  ON public.routes
  FOR ALL
  USING (
    organization_id = public.current_user_org_id()
    OR depot_id IN (
      SELECT id FROM public.depots WHERE organization_id = public.current_user_org_id()
    )
    OR (
      -- Regular Customer Isolation: own routes where depot_id is null
      created_by = auth.uid()
      AND (organization_id IS NULL OR organization_id = public.current_user_org_id())
    )
  )
  WITH CHECK (
    organization_id = public.current_user_org_id()
    OR (
      -- Regular customer can insert/update if created_by matches their auth id
      created_by = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 8. Stops Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Super admins manage stops" ON public.stops;
CREATE POLICY "Super admins manage stops"
  ON public.stops
  FOR ALL
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Tenant users manage stops" ON public.stops;
CREATE POLICY "Tenant users manage stops"
  ON public.stops
  FOR ALL
  USING (
    organization_id = public.current_user_org_id()
    OR depot_id IN (
      SELECT id FROM public.depots WHERE organization_id = public.current_user_org_id()
    )
  )
  WITH CHECK (
    organization_id = public.current_user_org_id()
  );

-- ------------------------------------------------------------------------------
-- 9. Stop Audios Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Super admins manage stop audios" ON public.stop_audios;
CREATE POLICY "Super admins manage stop audios"
  ON public.stop_audios
  FOR ALL
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Tenant users manage stop audios" ON public.stop_audios;
CREATE POLICY "Tenant users manage stop audios"
  ON public.stop_audios
  FOR ALL
  USING (
    stop_id IN (
      SELECT id FROM public.stops
      WHERE organization_id = public.current_user_org_id()
         OR depot_id IN (
           SELECT id FROM public.depots WHERE organization_id = public.current_user_org_id()
         )
    )
  )
  WITH CHECK (
    stop_id IN (
      SELECT id FROM public.stops
      WHERE organization_id = public.current_user_org_id()
    )
  );

-- ------------------------------------------------------------------------------
-- 10. Font Settings Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Super admins manage font settings" ON public.font_settings;
CREATE POLICY "Super admins manage font settings"
  ON public.font_settings
  FOR ALL
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "All authenticated users view font settings" ON public.font_settings;
CREATE POLICY "All authenticated users view font settings"
  ON public.font_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

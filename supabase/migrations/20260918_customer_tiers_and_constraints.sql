-- ==============================================================================
-- Migration: Customer Tiers (Regular Standalone vs. STU Hierarchical)
-- Target: Supabase PostgreSQL Database (users, routes, organizations)
-- ==============================================================================

-- 1. Ensure organization_id in users is nullable for standalone regular customers
ALTER TABLE public.users 
  ALTER COLUMN organization_id DROP NOT NULL;

-- 2. Ensure organization_id and depot_id in routes are nullable for regular customers
ALTER TABLE public.routes 
  ALTER COLUMN organization_id DROP NOT NULL;

ALTER TABLE public.routes 
  ALTER COLUMN depot_id DROP NOT NULL;

-- 3. Add customer_type column to organizations and users
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) DEFAULT 'stu';

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20);

-- 4. Uniqueness constraints:
-- For STU routes: unique route_number per depot
-- For Regular customer routes: unique route_number per user (where depot_id is null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_routes_user_route_num 
  ON public.routes (created_by, route_number) 
  WHERE depot_id IS NULL AND deleted = false;

-- 5. Performance index for regular customer "only own routes" queries
CREATE INDEX IF NOT EXISTS idx_routes_created_by_del 
  ON public.routes (created_by, deleted);

-- 6. Documentation Comments
COMMENT ON COLUMN public.organizations.customer_type IS 'Customer tier: "stu" (enterprise STU with regions/depots) or "regular"';
COMMENT ON COLUMN public.users.customer_type IS 'Customer tier: "regular" (standalone freelancer/body builder) or "stu"';

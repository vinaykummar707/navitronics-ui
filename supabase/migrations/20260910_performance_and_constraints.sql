-- ==============================================================================
-- Migration: Performance Indexes (AUD-24) and Integrity Constraints (AUD-30)
-- Target: Supabase PostgreSQL Database
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Performance Indexes (AUD-24)
-- Accelerates foreign-key joins, tenant filters, and soft-delete queries
-- ------------------------------------------------------------------------------

-- Regions: Filtered by organization and deleted status
CREATE INDEX IF NOT EXISTS idx_regions_org_del 
  ON public.regions (organization_id, deleted);

-- Depots: Filtered by region/organization and deleted status
CREATE INDEX IF NOT EXISTS idx_depots_region_del 
  ON public.depots (region_id, deleted);

CREATE INDEX IF NOT EXISTS idx_depots_org_del 
  ON public.depots (organization_id, deleted);

-- Users: Filtered by organization and deleted status
CREATE INDEX IF NOT EXISTS idx_users_org_del 
  ON public.users (organization_id, deleted);

CREATE INDEX IF NOT EXISTS idx_users_user_id 
  ON public.users (user_id);

-- Stops: Filtered by depot/organization and deleted status
CREATE INDEX IF NOT EXISTS idx_stops_depot_del 
  ON public.stops (depot_id, deleted);

CREATE INDEX IF NOT EXISTS idx_stops_org_del 
  ON public.stops (organization_id, deleted);

-- Stop Audios: Filtered by stop_id
CREATE INDEX IF NOT EXISTS idx_stop_audios_stop_id 
  ON public.stop_audios (stop_id);

-- Routes: Filtered by depot and deleted status
CREATE INDEX IF NOT EXISTS idx_routes_depot_del 
  ON public.routes (depot_id, deleted);

-- Font Settings: Filtered by organization
CREATE INDEX IF NOT EXISTS idx_font_settings_org_del 
  ON public.font_settings (organization_id, deleted);


-- ------------------------------------------------------------------------------
-- 2. Data Integrity Constraints (AUD-30)
-- Prevents duplicate records within the same administrative scope
-- ------------------------------------------------------------------------------

-- Ensure unique region names per organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_region_org_name'
  ) THEN
    ALTER TABLE public.regions 
      ADD CONSTRAINT unique_region_org_name UNIQUE (organization_id, name);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN others THEN 
    RAISE NOTICE 'Constraint unique_region_org_name could not be added automatically: %', SQLERRM;
END $$;

-- Ensure unique depot names within the same region and organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_depot_org_region_name'
  ) THEN
    ALTER TABLE public.depots 
      ADD CONSTRAINT unique_depot_org_region_name UNIQUE (organization_id, region_id, name);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN others THEN 
    RAISE NOTICE 'Constraint unique_depot_org_region_name could not be added automatically: %', SQLERRM;
END $$;

-- Ensure unique route numbers within the same depot
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_route_depot_number'
  ) THEN
    ALTER TABLE public.routes 
      ADD CONSTRAINT unique_route_depot_number UNIQUE (depot_id, route_number);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN others THEN 
    RAISE NOTICE 'Constraint unique_route_depot_number could not be added automatically: %', SQLERRM;
END $$;

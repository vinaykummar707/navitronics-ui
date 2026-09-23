-- ==============================================================================
-- Migration: Soft Delete Partial Unique Constraints & Concurrency Hardening
-- Target: Supabase PostgreSQL Database (regions, depots, routes, stops, organizations)
-- Date: 2026-09-23
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Pre-Migration Data Clean-up: Soft-delete Historical Duplicate Active Rows
-- In a soft-delete architecture, only one active record per unique scope is valid.
-- To allow unique index creation on tables that accumulated duplicate active records,
-- we retain the most recently created record and mark older duplicate active records as deleted.
-- ------------------------------------------------------------------------------

-- 1a. Normalize whitespace on unique text fields
UPDATE public.organizations SET name = TRIM(name) WHERE deleted = false AND name != TRIM(name);
UPDATE public.regions SET name = TRIM(name) WHERE deleted = false AND name != TRIM(name);
UPDATE public.depots SET name = TRIM(name) WHERE deleted = false AND name != TRIM(name);
UPDATE public.routes SET route_number = TRIM(route_number) WHERE deleted = false AND route_number != TRIM(route_number);
UPDATE public.stops SET name = TRIM(name) WHERE deleted = false AND name != TRIM(name);

-- 1b. Soft-delete duplicate active routes within the same depot (retains newest)
WITH duplicate_routes AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY depot_id, LOWER(route_number)
           ORDER BY created_at DESC, id DESC
         ) AS rnum
  FROM public.routes
  WHERE depot_id IS NOT NULL AND deleted = false
)
UPDATE public.routes
SET deleted = true
WHERE id IN (
  SELECT id FROM duplicate_routes WHERE rnum > 1
);

-- 1c. Soft-delete duplicate active stops within the same depot (retains newest)
WITH duplicate_stops AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY depot_id, LOWER(name)
           ORDER BY created_at DESC, id DESC
         ) AS rnum
  FROM public.stops
  WHERE depot_id IS NOT NULL AND deleted = false
)
UPDATE public.stops
SET deleted = true
WHERE id IN (
  SELECT id FROM duplicate_stops WHERE rnum > 1
);

-- 1d. Soft-delete duplicate active depots within the same region & organization (retains newest)
WITH duplicate_depots AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY organization_id, region_id, LOWER(name)
           ORDER BY created_at DESC, id DESC
         ) AS rnum
  FROM public.depots
  WHERE deleted = false
)
UPDATE public.depots
SET deleted = true
WHERE id IN (
  SELECT id FROM duplicate_depots WHERE rnum > 1
);

-- 1e. Soft-delete duplicate active regions within the same organization (retains newest)
WITH duplicate_regions AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY organization_id, LOWER(name)
           ORDER BY created_at DESC, id DESC
         ) AS rnum
  FROM public.regions
  WHERE deleted = false
)
UPDATE public.regions
SET deleted = true
WHERE id IN (
  SELECT id FROM duplicate_regions WHERE rnum > 1
);

-- 1f. Soft-delete duplicate active organizations (retains newest)
WITH duplicate_orgs AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY LOWER(name)
           ORDER BY created_at DESC, id DESC
         ) AS rnum
  FROM public.organizations
  WHERE deleted = false
)
UPDATE public.organizations
SET deleted = true
WHERE id IN (
  SELECT id FROM duplicate_orgs WHERE rnum > 1
);

-- ------------------------------------------------------------------------------
-- 2. Replace Unconditional Constraints with Active Partial Unique Indexes
-- Allows recreating soft-deleted records without PostgreSQL 23505 collisions
-- ------------------------------------------------------------------------------

-- Regions: Drop unconditional constraint and add partial index scoped to active rows
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_region_org_name'
  ) THEN
    ALTER TABLE public.regions DROP CONSTRAINT unique_region_org_name;
  END IF;
END $$;

DROP INDEX IF EXISTS public.idx_unique_regions_active;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_regions_active
  ON public.regions (organization_id, LOWER(name))
  WHERE deleted = false;

-- Depots: Drop unconditional constraint and add partial index scoped to active rows
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_depot_org_region_name'
  ) THEN
    ALTER TABLE public.depots DROP CONSTRAINT unique_depot_org_region_name;
  END IF;
END $$;

DROP INDEX IF EXISTS public.idx_unique_depots_active;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_depots_active
  ON public.depots (organization_id, region_id, LOWER(name))
  WHERE deleted = false;

-- Routes: Drop unconditional constraint and add partial index scoped to active rows
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_route_depot_number'
  ) THEN
    ALTER TABLE public.routes DROP CONSTRAINT unique_route_depot_number;
  END IF;
END $$;

DROP INDEX IF EXISTS public.idx_unique_routes_depot_active;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_routes_depot_active
  ON public.routes (depot_id, LOWER(route_number))
  WHERE depot_id IS NOT NULL AND deleted = false;

-- Stops: Add partial index for stops in depot scoped to active rows
DROP INDEX IF EXISTS public.idx_unique_stops_depot_active;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_stops_depot_active
  ON public.stops (depot_id, LOWER(name))
  WHERE depot_id IS NOT NULL AND deleted = false;

-- Organizations: Add partial index for unique organization names scoped to active rows
DROP INDEX IF EXISTS public.idx_unique_organizations_active;
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_organizations_active
  ON public.organizations (LOWER(name))
  WHERE deleted = false;

-- ------------------------------------------------------------------------------
-- 3. Ensure updated_at audit column and triggers exist on core tables
-- ------------------------------------------------------------------------------

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.regions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.depots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.stops ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.font_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Generic trigger function for setting updated_at on row mutation
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_organizations') THEN
    CREATE TRIGGER set_updated_at_organizations BEFORE UPDATE ON public.organizations
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_regions') THEN
    CREATE TRIGGER set_updated_at_regions BEFORE UPDATE ON public.regions
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_depots') THEN
    CREATE TRIGGER set_updated_at_depots BEFORE UPDATE ON public.depots
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_routes') THEN
    CREATE TRIGGER set_updated_at_routes BEFORE UPDATE ON public.routes
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_stops') THEN
    CREATE TRIGGER set_updated_at_stops BEFORE UPDATE ON public.stops
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

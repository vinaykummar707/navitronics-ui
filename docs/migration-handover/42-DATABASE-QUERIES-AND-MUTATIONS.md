# Database Queries and Mutations: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Backend Engineers, Database Administrators, API Developers  

---

## 1. Query & Mutation Architecture

All data operations are executed directly from the client via Supabase PostgREST client libraries (`@supabase/supabase-js`) wrapped by TanStack React Query (`@tanstack/react-query`). This document provides the definitive catalog of all data access queries, RPC invocations, and mutations.

---

## 2. Queries Catalog

---

### `QRY-001`: Generic Tabular Entity Fetch (`useCrud.getAll`)
- **Query ID:** `QRY-001`
- **Purpose:** Fetches collection of active entities from any target table with ordering.
- **Calling Hook:** [`src/hooks/useCrud.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/hooks/useCrud.ts#L25-L45)
- **Target Table:** Dynamic (`organizations`, `regions`, `depots`, `stops`, `routes`, `users`, `roles`).
- **PostgREST Call:**
  ```typescript
  supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false });
  ```
- **Implicit Filters:** RLS policies automatically filter rows based on `current_user_org_id()` or `is_super_admin()`.
- **Query Key:** `[tableName, 'list']`.
- **Cache Strategy:** Stale-time 5 minutes; garbage collected after 10 minutes.

---

### `QRY-002`: Depot-Scoped Routes Query (`useRoutes`)
- **Query ID:** `QRY-002`
- **Purpose:** Loads route catalog for active bus depot or regular customer.
- **Calling Hook:** [`src/hooks/useRoutes.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/hooks/useRoutes.ts#L10-L45)
- **Target Table:** `public.routes`
- **PostgREST Call:**
  ```typescript
  // For STU Depot Scope:
  supabase
    .from('routes')
    .select('*')
    .eq('depot_id', selectedDepotId)
    .eq('deleted', false)
    .order('updated_at', { ascending: false });

  // For Regular Customer Scope:
  supabase
    .from('routes')
    .select('*')
    .eq('created_by', currentUserId)
    .eq('deleted', false)
    .order('updated_at', { ascending: false });
  ```
- **Return Shape:** Array of route objects including `configuration_v2` JSONB.

---

### `QRY-003`: Multilingual Stops Scoped to Depot
- **Query ID:** `QRY-003`
- **Purpose:** Loads all bus stops configured for a specific depot to populate the Stops Catalog and Studio Via point pickers.
- **Calling Page:** [`src/pages/v2/StopsPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/StopsPage.tsx#L50-L85), [`src/pages/v2/RouteConfigurationPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RouteConfigurationPage.tsx#L90-L125)
- **Target Table:** `public.stops`
- **PostgREST Call:**
  ```typescript
  supabase
    .from('stops')
    .select('id, code, name, name_english, name_telugu, name_hindi, audio_url_te, audio_url_hi, created_at')
    .eq('depot_id', selectedDepotId)
    .eq('deleted', false)
    .order('name_english', { ascending: true });
  ```

---

### `QRY-004`: User Profile by Authentication Subject ID
- **Query ID:** `QRY-004`
- **Purpose:** Resolves application staff profile immediately following credential authentication.
- **Calling Component:** [`src/ui/components/UserLoginForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UserLoginForm.tsx#L80-L105)
- **Target Table:** `public.users`
- **PostgREST Call:**
  ```typescript
  supabase
    .from('users')
    .select('id, username, email, role_id, role_code, organization_id, region_id, depot_id, status, customer_type, expires_at')
    .eq('id', session.user.id)
    .single();
  ```

---

## 3. Mutations Catalog

---

### `MUT-001`: Route Configuration Save / Upsert
- **Mutation ID:** `MUT-001`
- **Purpose:** Creates or updates a route record along with its multi-board display configuration JSONB payload.
- **Calling Page:** [`src/pages/v2/RouteConfigurationPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RouteConfigurationPage.tsx#L450-L510)
- **Target Table:** `public.routes`
- **PostgREST Call:**
  ```typescript
  // For New Route:
  supabase.from('routes').insert({
    route_number_1: draft.route_number_1,
    route_number_2: draft.route_number_2,
    separator: draft.separator,
    route_number: `${draft.route_number_1}${draft.separator}${draft.route_number_2 || ''}`,
    name: draft.name,
    service_type: draft.service_type,
    direction: draft.direction,
    via: draft.via,
    depot_id: user.depot_id || selectedDepotId,
    organization_id: user.organization_id,
    configuration_v2: studioState,
    created_by: user.id,
    status: 'active',
    deleted: false
  }).select().single();

  // For Existing Route:
  supabase.from('routes').update({
    name: draft.name,
    service_type: draft.service_type,
    direction: draft.direction,
    via: draft.via,
    configuration_v2: studioState,
    updated_at: new Date().toISOString()
  }).eq('id', routeId).select().single();
  ```
- **Post-Mutation Cache Invalidation:** `queryClient.invalidateQueries({ queryKey: ['routes'] })`.

---

### `MUT-002`: Auto-Insert Discovered Bus Stops (`FR-056`)
- **Mutation ID:** `MUT-002`
- **Purpose:** Inserts stops discovered in a route's "Via" string that do not currently exist in the depot stop registry.
- **Calling Page:** [`src/pages/v2/RouteConfigurationPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RouteConfigurationPage.tsx#L425-L445)
- **Target Table:** `public.stops`
- **PostgREST Call:**
  ```typescript
  supabase.from('stops').insert(
    missingStops.map(stopName => ({
      name: stopName,
      name_english: stopName,
      code: `STP_${stopName.substring(0, 4).toUpperCase()}_${Date.now().toString().slice(-4)}`,
      depot_id: activeDepotId,
      organization_id: activeOrgId,
      deleted: false
    }))
  );
  ```

---

### `MUT-003`: Soft Deletion Protocol (`useCrud.delete`)
- **Mutation ID:** `MUT-003`
- **Purpose:** Marks any entity as soft-deleted to preserve referential history while releasing partial unique indexes.
- **Calling Hook:** [`src/hooks/useCrud.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/hooks/useCrud.ts#L70-L95)
- **Target Table:** Dynamic (`organizations`, `regions`, `depots`, `stops`, `routes`, `users`).
- **PostgREST Call:**
  ```typescript
  supabase
    .from(tableName)
    .update({
      deleted: true,
      status: 'deleted',
      updated_at: new Date().toISOString()
    })
    .eq('id', recordId);
  ```
- **Database Trigger:** Sets `updated_at = NOW()` via trigger `handle_updated_at`.

---

### `MUT-004`: Storage Audio File Upload
- **Mutation ID:** `MUT-004`
- **Purpose:** Uploads synthesized speech announcement WAV file to Supabase Storage.
- **Calling Utility:** [`src/utils/fetchTTS.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/fetchTTS.ts#L80-L115)
- **Target Storage Bucket:** `audios`
- **Supabase Storage Call:**
  ```typescript
  const filePath = `${depotId}/${stopCode}_${languageCode}.wav`;
  const { data, error } = await supabase.storage
    .from('audios')
    .upload(filePath, wavBlob, {
      contentType: 'audio/wav',
      upsert: true
    });
  
  const { data: { publicUrl } } = supabase.storage
    .from('audios')
    .getPublicUrl(filePath);
  ```

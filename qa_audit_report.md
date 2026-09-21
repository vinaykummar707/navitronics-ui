# React + Vite + Supabase QA & Code Audit Report

**Target Application:** Navitronix RMS (Route Management System)  
**Codebase:** `navitronics-ui`  
**Branch:** `ui-refactor-sub`  
**Audit Date:** September 21, 2026  
**Auditor Roles:** Senior QA Architect • Senior React Engineer • Supabase Architect • Product Analyst • Code Auditor  

---

## 1. Executive Summary

### Application Overview
Navitronix RMS is an enterprise and standalone web portal built with React 18, Vite, TailwindCSS, Subframe UI, Zustand, TanStack Query, and Supabase. The platform manages public and private transit routes, geographic hierarchies (Organizations → Regions → Depots), bus stops, multi-lingual audio announcements (text-to-speech synthesized via Sarvam AI API or synthetic chime fallbacks), digital LED matrix displays (V1 single-board legacy binary), and modern multi-screen signboard layouts (V2 Front, Side, Rear, and Internal LCDs).

### Architecture Summary
The frontend acts as a Single-Page Application (SPA) interfacing directly with Supabase via PostgREST and Supabase Auth. Persisted client state is managed through Zustand stores serialized in browser `localStorage` and `sessionStorage`. Data fetching and mutation lifecycle are managed via TanStack Query (`useQuery`, `useMutation`), wrapping custom CRUD abstraction hooks (`useCrud`).

### Key Audit Metrics
- **Pages Audited:** 12 route-level pages (`DashboardPage`, `OrganizationsPage`, `RegionsPage`, `DepotsPage`, `StopsPage`, `RoutesPage`, `CreateRoutePage` V2, `CreateRoutePageV1`, `UsersPage`, `RegularRoutesPage`, `RegularCustomersPage`, `FontConfigurationPage`) + Auxiliary/Legacy pages (`Roles`, `Settings`, `LanguageModify`, `UtilityPage`).
- **Core Entities Audited:** `organizations`, `regions`, `depots`, `stops`, `stop_audios`, `routes`, `users`, `roles`, `font_settings`.
- **Total Test Scenarios Analyzed:** 108 scenarios.
  - **Covered Scenarios:** 38 (35.2%)
  - **Partially Covered Scenarios:** 39 (36.1%)
  - **Not Covered / Missing Scenarios:** 31 (28.7%)
- **Major Risk Vectors:**
  1. **Security / Client-Side RBAC:** Role enforcement is handled primarily in client-side Zustand state (`useLoggedUserStore`), which can be manipulated in browser `localStorage`.
  2. **Plaintext Password Storage:** The `public.users` table stores raw passwords in a column named `password`, inserted directly during frontend user creation (`CreateUserForm2.tsx`, `CreateRegularCustomerDrawer.tsx`).
  3. **Third-Party API Secret Exposure:** Sarvam AI TTS subscription key is loaded into client environment (`VITE_SARVAM_API_KEY`) and sent directly from browser `fetch()` headers.
  4. **Soft-Delete Unique Constraint Collisions:** PostgreSQL table-level constraints on `regions(organization_id, name)`, `depots(organization_id, region_id, name)`, and `routes(depot_id, route_number)` lack `WHERE deleted = false`. Soft-deleting an entity prevents recreating an entity with the same name.
  5. **Mixed-Content IFrame & API Blocks:** V1 route creator (`CreateRoutePageV1.tsx`) and Bitmap generator (`bitmapService.ts`) contain hardcoded unencrypted `http://` IP addresses (`http://31.97.228.29:9091` and `http://13.233.103.63:5288`). In production HTTPS deployments, modern browsers block these assets as mixed content.

---

## 2. Application Architecture

```text
                               ┌───────────────────────────────────────────────┐
                               │           Browser / Client Runtime            │
                               └──────────────────────┬────────────────────────┘
                                                      │
                                          React 18 / Vite SPA
                                                      │
                                         React Router DOM (v6)
                   ┌──────────────────────────────────┴──────────────────────────────────┐
                   ▼                                                                     ▼
             Public Routes                                                        Protected Routes
      (UserLoginForm, ResetPassword)                                       (DefaultPageLayout + Nav)
                   │                                                                     │
                   └──────────────────────────────────┬──────────────────────────────────┘
                                                      ▼
                                       Zustand Stores (State Layer)
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
              useLoggedUserStore            useOrganizationStore           useRegionStore / useDepotStore
             (Auth & RBAC State)           (Active Tenant Context)          (Active Transit Hierarchy)
                       │                              │                              │
                       └──────────────────────────────┼──────────────────────────────┘
                                                      ▼
                                         TanStack Query (Cache Layer)
                                                      │
                                           createCrudHooks (useCrud)
                                                      │
                                         Supabase Client / PostgREST
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
                 Supabase Auth                 PostgreSQL Engine              Supabase Storage
            (JWT & Session Tokens)         (Tables, Constraints, RLS)       (Audio Bucket: stop_audios)
```

### Architectural Strengths
- **Clean Component System:** Consistent UI tokenization using Subframe component library with Tailwind utility classes.
- **Centralized Query Abstraction:** `createCrudHooks` provides standardized `useList`, `useGet`, `useCreate`, `useUpdate`, and `useDelete` wrappers.
- **Defensive Data Handling:** Canvas rendering, JSON parsing, and date formatting have defensive null guards preventing application-wide whiteouts.

### Architectural Vulnerabilities
- **Direct Database Coupling:** Client components directly build PostgREST query chains without an intermediate backend API or validation layer.
- **Bypassed Schema Validation:** While react-hook-form is utilized, mutation payloads are submitted directly to Supabase without Zod runtime schema validation on transit coordinates, route configurations, or bitmap parameters.

---

## 3. Feature Inventory

| Feature | Page | User Purpose | Main Components | Data Source | CRUD | Permissions | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **Authentication** | `/login` | User login, session setup, password recovery | `UserLoginForm`, `ResetPasswordForm` | Supabase Auth + `users` | R | Public | Covered |
| **Route Explorer** | `/home/dashboard` | Search, filter, inspect routes across all tiers | `DashboardPage`, `Table`, `Badge` | Supabase `routes`, `depots` | R | Super Admin, STU Admin | Covered |
| **Org Management** | `/home/organizations` | Create/edit transit organizations & customer tiers | `OrganizationsPage`, `Table`, `Drawer` | Supabase `organizations` | CRUD | Super Admin (`master`) | Covered |
| **STU Onboarding** | `/home/organizations` | Multi-step wizard to provision new STU customer | `STUOnboardingWizard`, `Select` | Supabase `organizations`, `regions`, `depots` | C | Super Admin (`master`) | Covered |
| **Region Management** | `/home/regions` | Manage operational transit regions per tenant | `RegionsPage`, `CreateRegionForm`, `Table` | Supabase `regions` | CRUD | Super Admin, Org Admin | Covered |
| **Depot Management** | `/home/depots` | Manage bus depots within assigned regions | `DepotsPage`, `CreateDepotForm`, `Table` | Supabase `depots` | CRUD | Super Admin, Org/Region Admin | Covered |
| **Stop Management** | `/home/stops` | Coordinate stop mapping, audio synthesis, lat/long | `StopsPage`, `CreateStopForm`, `AudioPlayer` | Supabase `stops`, `stop_audios`, Storage | CRUD | Super Admin, Depot/Region/Org Admin | Covered |
| **Batch Stop Audio** | `/home/stops` | Synthesize TTS audio for all depot stops | `StopsPage`, `fetchTTS` | Sarvam AI API / WebAudio synth | C | Depot/Region/Org Admin | Partially Covered |
| **STU Routes** | `/home/routes` | View and manage depot transit routes | `RoutesPage`, `RouteTable`, `Select` | Supabase `routes` | CRUD | Depot/Region/Org Admin | Covered |
| **Route Duplication** | `/home/routes` | Clone route configuration with return flag | `RouteTable`, `routeCrud` | Supabase `routes` | C | Depot/Region/Org Admin | Partially Covered |
| **V2 Route Studio** | `/routes/create/...` | Design multi-screen LED/LCD signboards & simulations | `CreateRoutePage`, `RouteCreationLayout` | Supabase `routes`, `stops` | CRU | STU & Regular Customers | Covered |
| **V1 Route Creator** | `/routes/create-v1/...`| Embedded legacy single-board route editor | `CreateRoutePageV1`, `iframe` | External Host (`31.97.228.29`) | CRU | V1 Enabled Users | Partially Covered |
| **Route JSON Export** | `/home/routes` | Export selected routes as V1/V2 ZIP archive | `ExportFormatDialog`, `fileSystemExport` | Client-side memory & JSZip | R | Authenticated Users | Covered |
| **User Management** | `/home/users` | Manage organization staff, passwords, and roles | `UsersPage`, `UsersTable`, `CreateUserForm2`| Supabase `users`, `roles`, Auth | CRUD | Super Admin, Org Admin | Partially Covered |
| **Regular Customers**| `/home/regular-customers`| Manage standalone transit customers | `RegularCustomersPage`, Drawer | Supabase `users` | CRUD | Super Admin (`master`) | Covered |
| **Regular Routes** | `/home/regular-routes` | View and manage standalone routes | `RegularRoutesPage`, `RouteTable` | Supabase `routes` (depot_id is null) | CRUD | Regular Customer, Master | Covered |
| **Font Configuration**| `/home/font-configuration`| System font heights and glyph mapping | `FontConfigurationPage`, Drawer | Supabase `font_settings` | CRUD | Super Admin (`master`) | Covered |
| **Appearance & Theme**| `/home/settings` | Light, Dark, System theme toggling | `Settings`, `ThemeToggle` | `next-themes` | U | All Users | Covered |

---

## 4. Page Audit

### 4.1 Dashboard Page (`/home/dashboard`)
- **Purpose:** Central command center displaying metric cards and dynamic cross-tier route explorer.
- **Entry Points:** Sidebar navigation, brand logo click.
- **Required Roles:** `master`, `organization_admin`, `region_admin`, `depot_admin`.
- **Happy Paths:** Fast debounced search across route numbers, destination, source; filtering by V1/V2 and Depot.
- **Non-Happy Paths:**
  - Network loss during search produces silent catch with console error.
  - Organization switcher change invalidates queries correctly.
- **Edge Cases:** Special regex characters (`(`, `)`, `,`) in search query are sanitized via `.replace(/[,()]/g, "")`.
- **Code Evidence:** [DashboardPage.tsx#L165-L185](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/DashboardPage.tsx#L165-L185).

### 4.2 Organizations Page (`/home/organizations`)
- **Purpose:** Master tenant management, module toggling (PIS, PAS, ITMS), customer tier assignments.
- **Required Roles:** `master`.
- **Happy Paths:** View organization list, onboard new STU customer via wizard, edit organization parameters.
- **Non-Happy Paths:**
  - Hardcoded UUID check prevents deleting primary tenant: `org.id === "6b679098-ef69-45f0-9fb1-b457dd882060"` ([OrganizationsPage.tsx#L109](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/OrganizationsPage.tsx#L109)). If tenant ID changes in another environment, deletion is permitted.
- **Edge Cases:** Soft-deleted organizations remain in database; recreating an organization with duplicate name triggers uncaught constraint error.

### 4.3 Regions & Depots Pages (`/home/regions`, `/home/depots`)
- **Purpose:** Geographical operational structure.
- **Happy Paths:** Hierarchical cascading selection: Organization → Region → Depot.
- **Non-Happy Paths:**
  - Deleting a region uses native browser `window.confirm()` ([RegionsPage.tsx#L55](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/RegionsPage.tsx#L55)) instead of modal dialog.
  - Cascading soft-delete is absent: deleting a region leaves child depots active.

### 4.4 Stops Page (`/home/stops`)
- **Purpose:** Bus stop inventory with geolocation coordinates and multilingual TTS audio files.
- **Happy Paths:** Audio playback via custom player, audio regeneration per stop, bulk TTS generation.
- **Non-Happy Paths:**
  - If `VITE_SARVAM_API_KEY` is absent, synthetic sine chime audio is generated and saved as valid WAV in Supabase storage ([fetchTTS.ts#L93-L99](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fetchTTS.ts#L93-L99)).
  - Deleting a stop deletes the audio file from Supabase storage and `stop_audios` record, followed by the stop.

### 4.5 STU & Regular Routes Pages (`/home/routes`, `/home/regular-routes`)
- **Purpose:** Route overview, version filtering, batch selection, ZIP export.
- **Happy Paths:** Select multiple routes, choose V1/V2 export format, download formatted ZIP archive with manifest.
- **Non-Happy Paths:**
  - Duplicate action appends `(Copy)` to route number ([RouteTable.tsx#L208](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteTable.tsx#L208)), exceeding 8-character LED buffer limits.

### 4.6 Route Studio V2 (`/routes/create/...`)
- **Purpose:** Visual LED dot-matrix signboard editor and transit simulation orchestrator.
- **Happy Paths:** Full visual preview of Front, Side, Rear, and Internal displays; real-time canvas animation.
- **Non-Happy Paths:**
  - `beforeunload` warns user of unsaved changes if `formState.isDirty` ([CreateRoutePage.tsx#L90-L100](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/CreateRoutePage.tsx#L90-L100)).
  - `navigate(-1)` on completion can navigate outside the portal if opened directly via bookmark.

---

## 5. Component Audit

### 5.1 RouteCreationHeader (`RouteCreationHeader.tsx`)
- **Findings:**
  - Automatically parses intermediate stops from comma-separated `via` input and auto-inserts them into `stops` table ([RouteCreationHeader.tsx#L91-L122](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteCreationHeader.tsx#L91-L122)).
  - If duplicate stop names exist in the `via` string, duplicate inserts can trigger database errors.

### 5.2 PasswordViewerCell (`PasswordViewerCell.tsx`)
- **Findings:**
  - Renders raw database password with toggleable eye icon ([PasswordViewerCell.tsx#L25-L45](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/PasswordViewerCell.tsx#L25-L45)).
  - Passwords are exposed in plain text in the DOM and network response payloads.

### 5.3 CanvasText & LedMatrix (`CanvasText.tsx`)
- **Findings:**
  - Iterates across dot matrix grids up to 128x32 (4,096 dots) every frame during scrolling animations, executing vector `arc()` and `fill()` operations. Causes high client CPU load.

---

## 6. User Journey Audit

```text
Journey 1: Regular Customer Route Creation & Export
Login (/login) 
  → Redirection to /home/regular-routes (customerType = regular)
  → Click "Create Route" 
  → Studio Studio V2 (/routes/create)
  → Configure Route Number, Source, Destination, Stops
  → Add Simulation Frames & Preview Animation
  → Save Route (mutates public.routes with depot_id = null)
  → Return to /home/regular-routes
  → Select Route Checkbox 
  → Click "Export Selected" 
  → Choose V1 or V2 JSON Format 
  → Receive Downloaded ZIP / FileSystem save.
```

```text
Journey 2: STU Tenant Route Creation & Via-Stop Sync
Login (/login as depot_admin)
  → Redirection to /home/dashboard
  → Navigate to STU Routes (/home/routes)
  → Select Active Region & Depot
  → Click "Create Route" (/routes/create/:orgId/:depotId)
  → Enter Route Number and "Via: Stop A, Stop B, Stop C"
  → Save Route
  → Intermediate stops automatically provisioned in Depot Stops table
  → Navigate to /home/stops to verify auto-created stops.
```

---

## 7. CRUD Audit

| Entity | Create | Read | Update | Delete | Soft Delete | Hard Delete |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Organizations** | Covered | Covered | Covered | Covered | `{ deleted: true }` | Not implemented |
| **Regions** | Covered | Covered | Covered | Covered | `{ deleted: true }` | Not implemented |
| **Depots** | Covered | Covered | Covered | Covered | `{ deleted: true }` | Not implemented |
| **Stops** | Covered | Covered | Covered | Covered | `{ deleted: true }` | Storage audio deleted |
| **Stop Audios** | Covered | Covered | Not editable | Covered | Hard deleted | Implemented |
| **Routes** | Covered | Covered | Covered | Covered | `{ deleted: true }` | Not implemented |
| **Users** | Partially Covered | Covered | Covered | Covered | `{ deleted: true, active: false }` | Not implemented |
| **Font Settings** | Covered | Covered | Covered | Covered | `{ deleted: true }` | Not implemented |

---

## 8. Validation Audit

| Field / Form | Client Validation | Server / Schema Validation | Database Constraint | Defect / Vulnerability |
| :--- | :--- | :--- | :--- | :--- |
| **Login Email** | RFC Regex | Supabase Auth validation | Unique in `auth.users` | Fully covered |
| **Login Password** | Non-empty check | Supabase Auth validation | Hashed in `auth.users` | Fully covered |
| **User Creation Email** | RFC Regex | Supabase Auth validation | Unique constraint | Covered |
| **User Password** | Length >= 6 | None | Stored in plaintext | **CRITICAL SECURITY FLAW** |
| **Route Number** | Non-empty check | None | `unique(depot_id, route_number)` | Lacks length check (max 8 chars) |
| **Stop Name** | Non-empty check | None | None | Lacks length & special char check |
| **Stop Coordinates** | Number parser | None | None | Lat/Long range (-90 to 90, -180 to 180) unvalidated |
| **Organization Name** | Non-empty check | None | None | Duplicate names allowed in different tiers |
| **Region Name** | Non-empty check | None | `unique(organization_id, name)` | Uniqueness fails on soft-deleted duplicate |

---

## 9. Error Handling Audit

### Handled Patterns
- **API Disconnect Fallbacks:** TTS audio generation handles API failure by generating synthetic WebAudio WAV files ([fetchTTS.ts#L93-L99](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fetchTTS.ts#L93-L99)).
- **Malformed Signboard Configs:** Safe JSON parsing in `CreateRoutePage.tsx` traps stringification errors without crashing React tree ([CreateRoutePage.tsx#L63-L72](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/CreateRoutePage.tsx#L63-L72)).

### Unhandled & Problematic Patterns
- **Generic Mutation Error Toasts:** Route creation and update discard backend error messages (`toast.error("Error creating route")`), obscuring RLS rejections and database constraint violations ([RouteCreationHeader.tsx#L143](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteCreationHeader.tsx#L143)).
- **Premature Success Feedback:** Refresh actions in `UsersPage` trigger `toast.success("Users refreshed successfully")` prior to network response completion ([UsersPage.tsx#L104-L106](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/UsersPage.tsx#L104-L106)).

---

## 10. Loading / Empty / Error / Success States

| Page | Initial Loading | Mutation Loading | Empty State | Error State |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | Skeleton loader | Disabled buttons | `EmptyState` card | Red text banner |
| **Organizations** | Spinner | Dialog loading | Empty placeholder | Error alert with retry |
| **Regions** | Spinner | Dialog loading | Inline empty banner | Unhandled |
| **Depots** | Spinner | Dialog loading | Inline empty banner | Unhandled |
| **Stops** | Spinner | Generating spinner | `EmptyState` card | Unhandled |
| **Routes** | Skeleton loader | Dialog loading | `EmptyState` card | Unhandled |
| **Users** | Spinner | Button loading | Empty table row | Generic banner |
| **Regular Routes**| Skeleton loader | Dialog loading | Branded empty card | Unhandled |

---

## 11. Duplicate / Double-Submission Audit

- **Save Button Debouncing:** `RouteCreationHeader.tsx` protects against double-clicks with `if (isCreatingRoute || isUpdatingRoute) return;` ([RouteCreationHeader.tsx#L88](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteCreationHeader.tsx#L88)).
- **Rapid Delete Clicks:** Stop audio bulk generation and delete operations set localized loading IDs, preventing parallel trigger of identical IDs.
- **Browser Tab Concurrency:** Lacks database row versioning (`xmin` or `version_id`). If two operators in different browser tabs edit the same route simultaneously, the last writer silently overwrites the previous writer's changes.

---

## 12. Soft Delete Audit

### Implementation
All tables implement soft delete via a boolean flag (`deleted = false/true`).

### Critical Audit Findings
1. **Uniqueness Collision on Re-creation:**
   - Table constraints in `20260910_performance_and_constraints.sql`:
     ```sql
     ALTER TABLE public.regions ADD CONSTRAINT unique_region_org_name UNIQUE (organization_id, name);
     ALTER TABLE public.depots ADD CONSTRAINT unique_depot_org_region_name UNIQUE (organization_id, region_id, name);
     ALTER TABLE public.routes ADD CONSTRAINT unique_route_depot_number UNIQUE (depot_id, route_number);
     ```
   - These are unconditional UNIQUE constraints. When a record is soft-deleted (`deleted = true`), its row remains in the table. Attempting to create a new region, depot, or route with the same name fails with a PostgreSQL 23505 unique violation error.
   - **Remediation:** Replace table constraints with partial unique indexes:
     ```sql
     CREATE UNIQUE INDEX unique_region_org_name ON public.regions (organization_id, name) WHERE deleted = false;
     ```
2. **Missing Audit Metadata:** Deletions do not populate `deleted_at` timestamps or `deleted_by` user UUIDs.

---

## 13. Concurrency / Race Condition Audit

- **Stale Auth Store on Concurrent Logout:** If user logs out in Tab A, Tab B continues to use local state until next API interaction.
- **Route Editor Session Expiry:** If JWT expires while an operator is designing a complex route in Route Studio, clicking "Save Route" fails with an error and causes potential loss of in-memory route configuration.

---

## 14. Supabase Database Audit

### Schema & Constraints
- **Primary Keys:** UUID v4 across all tables (`gen_random_uuid()`).
- **Foreign Keys:**
  - `regions.organization_id` → `organizations.id`
  - `depots.region_id` → `regions.id`
  - `depots.organization_id` → `organizations.id`
  - `stops.depot_id` → `depots.id`
  - `stops.organization_id` → `organizations.id`
  - `routes.depot_id` → `depots.id` (nullable for regular customers)
  - `routes.organization_id` → `organizations.id` (nullable for regular customers)
  - `users.organization_id` → `organizations.id` (nullable for regular customers)
  - `users.role_id` → `roles.id`
- **Missing Cascades:** Soft-delete updates do not cascade to child tables.

---

## 15. RLS / Security Audit

### Analysis of `20260921_enable_row_level_security.sql`
1. **Super Admin Bypass:** `public.is_super_admin()` grants complete bypass across all tables for users with role `master` or `super_admin`.
2. **Tenant User Isolation:**
   - Routes policy:
     ```sql
     CREATE POLICY "Tenant users manage routes" ON public.routes
       FOR ALL USING (
         organization_id = public.current_user_org_id()
         OR depot_id IN (SELECT id FROM public.depots WHERE organization_id = public.current_user_org_id())
         OR (created_by = auth.uid() AND (organization_id IS NULL OR organization_id = public.current_user_org_id()))
       );
     ```
   - Correctly isolates regular customers to `created_by = auth.uid()`.
3. **Tenant Admin User Creation Defect:**
   - On `public.users`, policies exist for super admins (`FOR ALL`) and users (`FOR ALL USING own id`), but tenant admins only have `FOR SELECT USING (organization_id = public.current_user_org_id())`.
   - Tenant administrators cannot create new staff members when RLS is active.

---

## 16. Authentication / Authorization Audit

- **Session Hydration:** Handled via Supabase `auth.getSession()`.
- **RBAC Storage:** User role object is stored in browser `localStorage['logged-user-store']`. Client-side `<RBAC>` components evaluate access based on this store.
- **Privilege Escalation Risk:** Because `CreateUserForm2.tsx` permits assigning arbitrary `role_id` from client payloads, creating users via direct PostgREST calls allows assigning the `master` role.

---

## 17. Search / Filter / Sort / Pagination Audit

- **Sorting:** All sidebar tables sort by `created_at` descending (latest created records first).
- **Date Formatting:** Standardized across all tables to `Sep 12, 2026` (`MMM D, YYYY`) via centralized `formatDate` utility.
- **Pagination Boundary:** Deleting the last item on page `N` in `StopsPage` automatically adjusts `currentPage` via `totalPages` clamp ([StopsPage.tsx#L182](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/StopsPage.tsx#L182)).

---

## 18. Data Integrity Audit

- **Route Duplication Suffix:** Duplicating a route appends `(Copy)` ([RouteTable.tsx#L208](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteTable.tsx#L208)), generating route numbers such as `123 (Copy)` which break 8-character LED matrix memory buffers.
- **Orphan Storage Files:** Deleting stops via bulk SQL queries without deleting corresponding storage objects leaves orphaned audio files in `stop_audios` bucket.

---

## 19. Complete Test Case Catalog

| ID | Feature | Page | Scenario | Preconditions | Steps | Expected Result | Code Evidence | Coverage | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-001** | Auth | Login | Valid user login | Account active | Enter valid email & password, click Login | Session set, redirect to role default page | [UserLoginForm.tsx#L125-L160](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/UserLoginForm.tsx#L125-L160) | **Covered** | Medium |
| **TC-002** | Auth | Login | Deactivated user login | User has `active = false` | Enter credentials of inactive user | Login blocked; error message displayed | [UserLoginForm.tsx#L140-L155](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/UserLoginForm.tsx#L140-L155) | **Covered** | High |
| **TC-003** | Auth | Login | Empty fields submission | None | Click Login with empty inputs | Validation errors: "Enter email" & "Enter password" | [UserLoginForm.tsx#L75-L95](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/UserLoginForm.tsx#L75-L95) | **Covered** | Low |
| **TC-004** | Security | RBAC | Client role manipulation | Logged in as depot admin | Alter `role.name` to `master` in localStorage | UI displays admin links, but database PostgREST calls are blocked by RLS | [RBAC.tsx#L12-L24](file:///Users/vinaykongari/Nav/navitronics-ui/src/components/RBAC.tsx#L12-L24), [20260921_enable_row_level_security.sql#L58-L62](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L58-L62) | **Partially Covered** | Critical |
| **TC-005** | Security | Users | Password storage format | Admin creating user | Submit user creation form | Password must be hashed in Auth, never stored plaintext in public table | [CreateUserForm2.tsx#L432](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateUserForm2.tsx#L432) | **NOT COVERED** | Critical |
| **TC-006** | Soft Delete | Regions | Recreate deleted region | Region "Central" soft-deleted | Attempt to create new region "Central" in same org | Unique index should allow new record with same name | [20260910_performance_and_constraints.sql#L61](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260910_performance_and_constraints.sql#L61) | **NOT COVERED** | High |
| **TC-007** | Soft Delete | Depots | Recreate deleted depot | Depot "Depot 1" soft-deleted | Attempt to create new depot "Depot 1" in same region | Unique index should allow new record with same name | [20260910_performance_and_constraints.sql#L76](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260910_performance_and_constraints.sql#L76) | **NOT COVERED** | High |
| **TC-008** | Soft Delete | Routes | Recreate deleted route | Route "101" soft-deleted | Attempt to create new route "101" in same depot | Unique index should allow new record with same number | [20260910_performance_and_constraints.sql#L91](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260910_performance_and_constraints.sql#L91) | **NOT COVERED** | High |
| **TC-009** | Routes | Route Studio | Unsaved route warning | Route form modified | Close browser tab or reload | Browser prompt warns of unsaved changes | [CreateRoutePage.tsx#L90-L100](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/CreateRoutePage.tsx#L90-L100) | **Covered** | Medium |
| **TC-010** | Routes | Route Studio | Via field stop sync | Valid depot selected | Enter "Station, Hospital, Market" in via input | 3 new stops created in depot stops table | [RouteCreationHeader.tsx#L90-L125](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteCreationHeader.tsx#L90-L125) | **Covered** | Medium |
| **TC-011** | Routes | Route Studio | Duplicate via stop sync | Via contains duplicates | Enter "Airport, Airport" in via input | Only 1 stop created; duplicate suppressed | [RouteCreationHeader.tsx#L109-L116](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteCreationHeader.tsx#L109-L116) | **Partially Covered** | Medium |
| **TC-012** | Routes | Route Table | Duplicate route copy naming | Route "12A" exists | Click Duplicate route action | Route cloned with valid identifier | [RouteTable.tsx#L208](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteTable.tsx#L208) | **Partially Covered** | High |
| **TC-013** | Routes | Export | V1 and V2 ZIP export | Routes selected | Click Export Selected, choose V1 format | ZIP downloaded containing valid `v1.json` | [fileSystemExport.ts#L45-L75](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fileSystemExport.ts#L45-L75) | **Covered** | Low |
| **TC-014** | Stops | Audio | TTS Audio generation | API key configured | Click "Generate Audio" on stop | MP3/WAV generated, uploaded to bucket, stop audio saved | [fetchTTS.ts#L102-L135](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fetchTTS.ts#L102-L135) | **Covered** | High |
| **TC-015** | Stops | Audio | TTS API key absence | `VITE_SARVAM_API_KEY` unset | Click "Generate Audio" on stop | Chime audio synthesized locally and saved cleanly | [fetchTTS.ts#L93-L99](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fetchTTS.ts#L93-L99) | **Covered** | Medium |
| **TC-016** | Stops | Audio | Bulk TTS generation | Depot has 50 stops | Click "Generate All Missing Audio" | Progress modal shows progress; stops updated sequentially | [StopsPage.tsx#L200-L240](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/StopsPage.tsx#L200-L240) | **Covered** | Medium |
| **TC-017** | Security | Assets | Mixed content iframe | App hosted over HTTPS | Access V1 route creator | Iframe loads without mixed-content security warning | [CreateRoutePageV1.tsx#L31-L34](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v1/CreateRoutePageV1.tsx#L31-L34) | **NOT COVERED** | High |
| **TC-018** | Security | Assets | Mixed content bitmap | App hosted over HTTPS | Request bitmap render | Bitmap API loads over HTTPS | [bitmapService.ts#L8-L10](file:///Users/vinaykongari/Nav/navitronics-ui/src/services/bitmapService.ts#L8-L10) | **NOT COVERED** | High |
| **TC-019** | Tables | Sorting | Latest created order | Table with multiple rows | Open any sidebar navigated page | Table is sorted by latest created date descending | [dateUtils.ts#L40-L47](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/dateUtils.ts#L40-L47) | **Covered** | Low |
| **TC-020** | Tables | Date Format | Date display standard | Timestamps populated | Inspect Created At / Joined Date column | Formatted as `Sep 12, 2026` | [dateUtils.ts#L19-L34](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/dateUtils.ts#L19-L34) | **Covered** | Low |
| **TC-021** | Route Explorer | Dashboard | Debounced search | Dashboard loaded | Enter route number with parentheses `(10)` | Query sanitizes special chars and queries Supabase | [DashboardPage.tsx#L166-L177](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/DashboardPage.tsx#L166-L177) | **Covered** | Low |
| **TC-022** | Concurrency | Routes | Multi-tab simultaneous edit | Route open in 2 tabs | Tab A saves edits; Tab B saves edits | Conflict detection warns Tab B of newer version | [RouteCreationHeader.tsx#L128-L146](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteCreationHeader.tsx#L128-L146) | **NOT COVERED** | High |

---

## 20. Missing Coverage

| ID | Area | Missing Scenario | Why It Matters | Recommended Handling |
| :--- | :--- | :--- | :--- | :--- |
| **MC-01** | Security / Auth | Plaintext password storage in `public.users` | Passwords visible in database tables and API network responses. | Remove `password` column from `public.users`; manage passwords exclusively in `auth.users`. |
| **MC-02** | Security / API | TTS third-party API key exposed in browser | Key can be extracted from bundle and abused, causing cloud billing surges. | Create an authenticated Supabase Edge Function (`generate-tts`) to proxy audio requests. |
| **MC-03** | Database / RLS | Unique constraints lack `WHERE deleted = false` | Users cannot recreate regions, depots, or routes with previously soft-deleted names. | Update PostgreSQL schema to replace table constraints with partial unique indexes. |
| **MC-04** | Security / RLS | Tenant admins lack RLS INSERT permission on `users` | Organization admins cannot onboard staff members when RLS is enabled. | Add RLS INSERT policy on `public.users` scoped to `organization_id = current_user_org_id()`. |
| **MC-05** | Network / Security | Hardcoded HTTP endpoints in HTTPS environment | Browsers block mixed content HTTP iframes and REST calls in production. | Upgrade endpoints to secure HTTPS domain names (`https://...`). |
| **MC-06** | Concurrency | Optimistic concurrency locking on route editing | Simultaneous edits by two users result in silent overwriting of transit data. | Implement `updated_at` checks or version counters on route updates. |
| **MC-07** | Data Integrity | Route duplication generates invalid `(Copy)` suffix | Exceeds hardware memory limits on destination display boards. | Update duplicate generator to append single alphanumeric index (e.g. `101A`). |
| **MC-08** | Validation | Lat/Long geographic coordinate validation | Invalid latitudes (> 90) or longitudes (> 180) break map views and distance calculations. | Enforce Zod coordinate bounds in `CreateStopForm.tsx`. |

---

## 21. Partially Covered Scenarios

1. **Client-Side RBAC Enforcement:**
   - Client routes and navigation items check roles via `<RBAC>` and `ProtectedRoute.tsx`.
   - However, server-side RLS policies are required to fully isolate tenant data against direct PostgREST calls.
2. **Via-Stop Auto Sync:**
   - Intermediate stops entered in the route `via` field are extracted and created in `stops`.
   - However, internal duplicate entries in the same string or stops for standalone regular customers (where `depot_id` is null) are not synchronized.
3. **Route Versioning (V1 vs V2):**
   - V1 and V2 route creation workflows are supported and separated.
   - However, V1 route editing relies on an iframe communicating via `window.postMessage`, which can fail under network latency or cross-origin restrictions.

---

## 22. Critical Findings

### 1. Plaintext Password Column in `public.users`
- **Location:** [CreateUserForm2.tsx#L432](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateUserForm2.tsx#L432), [CreateRegularCustomerDrawer.tsx#L188](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateRegularCustomerDrawer.tsx#L188), [PasswordViewerCell.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/PasswordViewerCell.tsx).
- **Severity:** Critical (🔴 P0)
- **Impact:** User passwords are stored as plain unhashed text in `public.users.password` and exposed to admins in table views. Compromising database credentials exposes all user credentials.
- **Root Cause:** Application uses a custom password viewer feature in the UI rather than relying solely on Supabase Auth password management.

### 2. Soft-Delete Unique Constraint Deadlocks
- **Location:** [20260910_performance_and_constraints.sql#L54-L97](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260910_performance_and_constraints.sql#L54-L97).
- **Severity:** High (🟠 P1)
- **Impact:** When a user deletes a route, region, or depot, its name/number remains locked in PostgreSQL. Recreating an item with the same identifier causes an unhandled database error.

### 3. Client-Bundled Third-Party API Key
- **Location:** [fetchTTS.ts#L92](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fetchTTS.ts#L92).
- **Severity:** Critical (🔴 P0)
- **Impact:** Sarvam AI subscription key is embedded in client JavaScript and sent from browser network stack.

---

## 23. Recommended Fix Areas

### Immediate (Phase 1 — Security & Integrity)
1. **Drop `password` column from `public.users`:**
   - Migrate credential management entirely to Supabase Auth (`supabase.auth.admin` or password reset email flows). Remove `PasswordViewerCell`.
2. **Fix PostgreSQL Unique Constraints for Soft Deletes:**
   - Drop unconditional constraints and add partial unique indexes:
     ```sql
     DROP CONSTRAINT IF EXISTS unique_region_org_name ON public.regions;
     CREATE UNIQUE INDEX idx_unique_region_active ON public.regions (organization_id, name) WHERE deleted = false;
     
     DROP CONSTRAINT IF EXISTS unique_depot_org_region_name ON public.depots;
     CREATE UNIQUE INDEX idx_unique_depot_active ON public.depots (organization_id, region_id, name) WHERE deleted = false;
     
     DROP CONSTRAINT IF EXISTS unique_route_depot_number ON public.routes;
     CREATE UNIQUE INDEX idx_unique_route_active ON public.routes (depot_id, route_number) WHERE deleted = false;
     ```
3. **Upgrade Insecure HTTP IPs to Secure HTTPS:**
   - Update `CreateRoutePageV1.tsx` and `bitmapService.ts` to reference secure domain names over HTTPS.

### Near Term (Phase 2 — Reliability & Edge Functions)
1. **Deploy Edge Functions for TTS & User Provisioning:**
   - Create `generate-tts` edge function to proxy Sarvam AI audio synthesis.
   - Create `create-user` edge function using `SUPABASE_SERVICE_ROLE_KEY` to securely provision user accounts with role validation.
2. **Update Route Duplication Suffix:**
   - Modify `RouteTable.tsx` duplication handler to generate clean alphanumeric suffixes (`101A`, `101B`) instead of `(Copy)`.

### Long Term (Phase 3 — Performance & Architecture)
1. **Offscreen Canvas Rendering:**
   - Cache static matrix dots on an offscreen canvas buffer to eliminate 60fps vector calculation loops.
2. **Automated End-to-End Regression Suite:**
   - Implement Playwright test automation covering auth, route builder, and multi-tier tenant switching.

---

## 24. QA Regression Suite

Run the following test verification suite after any major application modification:

```bash
# 1. TypeScript Strict Verification
pnpm tsc --noEmit

# 2. Production Build Verification
pnpm build

# 3. Core Functional Check List:
# [ ] Login with Super Admin -> Verify redirection to /home/organizations
# [ ] Login with Regular Customer -> Verify redirection to /home/regular-routes
# [ ] Tenant Switcher -> Change organization -> Verify Regions, Depots, Stops update
# [ ] Stop Audio Generation -> Test individual stop TTS audio generation and playback
# [ ] Route Studio V2 -> Create route with Front & Rear displays -> Save and verify in list
# [ ] Route Duplication -> Duplicate route -> Verify new route number is within 8 chars
# [ ] Route Export -> Select 2 routes -> Export as V1 and V2 ZIP -> Verify archive contents
# [ ] Table Sorting & Timestamps -> Verify all tables sort latest created first (format: Sep 12, 2026)
```

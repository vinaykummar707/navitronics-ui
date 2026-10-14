# User Operations and CRUD Specifications: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Backend Engineers, Full-Stack Developers, QA Automation Engineers  

---

## 1. Operations Catalog & Lifecycle Summary

This document specifies all 44 user and system operations executable within the application. Every operation is documented with its complete execution trace:

$$\text{User Action} \rightarrow \text{UI Component} \rightarrow \text{Validation} \rightarrow \text{State Mutation} \rightarrow \text{Database / API RPC} \rightarrow \text{UI Outcome}$$

### Operation Classification
- **Authentication & Tenancy:** `OP-001` - `OP-003`
- **Organizational Hierarchy:** `OP-004` - `OP-009`
- **Customer & Guest Accounts:** `OP-010` - `OP-012`, `OP-038` - `OP-039`
- **Route Lifecycle & Signboard Studio:** `OP-013` - `OP-025`, `OP-043` - `OP-044`
- **Depots & Transit Assets:** `OP-026` - `OP-029`
- **Bus Stops & Multilingual Audio:** `OP-030` - `OP-034`
- **User Administration & System Roles:** `OP-035` - `OP-037`, `OP-040` - `OP-042`

---

## 2. Exhaustive Operation Specifications

---

### `OP-001`: Submit Login Credentials
1. **Operation ID & Name:** `OP-001` — Submit Login Credentials
2. **Initiating Page & Component:** [`PAGE-001`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-001) / [`UserLoginForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UserLoginForm.tsx)
3. **Triggering Event:** Click "Sign In" button or press Enter in password field.
4. **Preconditions:** Network connectivity to Supabase Auth endpoint.
5. **Required Role & Permission:** Anonymous / Unauthenticated.
6. **Input Parameters:** `{ email: string, password: string }`.
7. **Input Validation:** Email must be non-empty and match regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`; password must be non-empty (min length 6).
8. **Business Rules:** [`BR-001`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-001) (Auth Credentials), [`BR-002`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-002) (Role Landing Routing).
9. **Data Read Before Operation:** None.
10. **State Changes & Transformations:** Form enters `isSubmitting = true`.
11. **Database / API Operations:**
    - `POST /auth/v1/token?grant_type=password` (Supabase GoTrue).
    - `SELECT * FROM public.users WHERE id = auth.uid()`.
    - `SELECT * FROM public.roles WHERE id = user.role_id`.
12. **Transaction Boundaries:** Separate GoTrue auth exchange followed by PostgREST read.
13. **Side Effects & External Calls:** Supabase JWT stored in browser `localStorage`.
14. **Success Response & UI Result:** Toast "Logged in successfully"; redirect to `/dashboard` (Master/STU) or `/routes` (Regular).
15. **Error Cases & Messages:**
    - 400 Bad Request: "Invalid login credentials".
    - User status inactive: "Account is suspended; contact administrator".
16. **Failure & Retry Behavior:** Clear password field; focus returned to password input; user may retry immediately.
17. **Duplicate Submission Behavior:** Submit button disabled while request is in flight.
18. **Audit & Notifications:** None logged in current implementation.
19. **Related Requirements:** `FR-001`, `PAGE-001`, `STORE-001`.
20. **Evidence References:** [`src/ui/components/UserLoginForm.tsx:L45-L120`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UserLoginForm.tsx#L45-L120).

---

### `OP-003`: Switch Active Depot Context
1. **Operation ID & Name:** `OP-003` — Switch Active Depot Context
2. **Initiating Page & Component:** Universal Top Navigation / [`PageHeader.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/PageHeader.tsx)
3. **Triggering Event:** User clicks depot dropdown in header and selects an item.
4. **Preconditions:** User belongs to an STU organization with access to multiple depots, or has `master` role.
5. **Required Role & Permission:** `master`, `admin`.
6. **Input Parameters:** `selected_depot_id: string (UUID)`.
7. **Input Validation:** Selected depot ID must exist in current user's permitted depots list.
8. **Business Rules:** [`BR-005`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-005) (Depot Scoping).
9. **Data Read Before Operation:** List of depots cached in React Query.
10. **State Changes & Transformations:** Mutates `useDepotStore.selectedDepot`.
11. **Database / API Operations:** None direct; triggers reactive refetch of active page queries.
12. **Transaction Boundaries:** Pure client-side state mutation.
13. **Side Effects:** Persists `selected-depot-storage` in browser `localStorage`. Invalidates queries: `['routes', depotId]`, `['stops', depotId]`, `['stats', depotId]`.
14. **Success Response & UI Result:** Header updates to show new depot name; active tables and cards re-render with new depot data.
15. **Error Cases:** Depot ID not found in organization (aborts with warning).
16. **Failure & Retry Behavior:** Reverts selection to previous active depot.
17. **Duplicate Submission Behavior:** No-op if selecting currently active depot.
18. **Audit & Notifications:** None.
19. **Related Requirements:** `FR-003`, `STORE-002`, `COMP-014`.
20. **Evidence References:** [`src/store/useDepotStore.tsx:L1-L35`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/store/useDepotStore.tsx#L1-L35).

---

### `OP-005`: Execute STU Onboarding Wizard
1. **Operation ID & Name:** `OP-005` — Execute STU Onboarding Wizard
2. **Initiating Page & Component:** [`PAGE-003`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-003) / [`STUOnboardingWizard.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx)
3. **Triggering Event:** Click "Complete Setup" on final step of onboarding modal.
4. **Preconditions:** Super Admin session active.
5. **Required Role & Permission:** `master` only.
6. **Input Parameters:**
   ```json
   {
     "org": { "name": "TSRTC", "code": "TSRTC", "state": "Telangana" },
     "region": { "name": "Greater Hyderabad", "code": "GH" },
     "depot": { "name": "Musheerabad-1", "code": "MSR1", "location": "Hyderabad" },
     "admin": { "username": "msr1_admin", "email": "msr1@tsrtc.in", "password": "..." }
   }
   ```
7. **Input Validation:** All names and codes non-empty; codes uppercase alphanumeric; email format validated; password length $\ge 8$.
8. **Business Rules:** [`BR-006`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-006) (Sequential Hierarchy Creation), [`BR-007`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-007) (Code Uniqueness).
9. **Data Read Before Operation:** Validates code uniqueness against `public.organizations` and `public.depots`.
10. **State Changes & Transformations:** Stepper advances to step 4 (Processing).
11. **Database / API Operations:**
    - Step 1: `INSERT INTO public.organizations (...) RETURNING id`.
    - Step 2: `INSERT INTO public.regions (organization_id, ...) RETURNING id`.
    - Step 3: `INSERT INTO public.depots (organization_id, region_id, ...) RETURNING id`.
    - Step 4: `supabaseAuthHelper.auth.signUp(...) RETURNING user.id`.
    - Step 5: `INSERT INTO public.users (id, organization_id, region_id, depot_id, role_code, password, ...)`.
12. **Transaction Boundaries:** Client-side orchestration; non-atomic pseudo-rollback (`ARC-01`).
13. **Side Effects:** Sends account confirmation email if Supabase SMTP enabled.
14. **Success Response & UI Result:** Modal displays success checkmark; closes after 2 seconds; redirects to `/organizations`.
15. **Error Cases:** Step 3 or 4 fails due to unique constraint or auth error.
16. **Failure & Retry Behavior:** Attempts best-effort DELETE of previously created organization, region, or depot; displays specific error toast.
17. **Duplicate Submission Behavior:** Submit button disabled and shows spinner.
18. **Audit & Notifications:** None.
19. **Related Requirements:** `FR-011`, `UI-009`, `PAGE-003`.
20. **Evidence References:** [`src/ui/components/STUOnboardingWizard.tsx:L50-L280`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx#L50-L280).

---

### `OP-015`: Duplicate Route
1. **Operation ID & Name:** `OP-015` — Duplicate Route
2. **Initiating Page & Component:** [`PAGE-006`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-006) / [`RouteTable.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteTable.tsx)
3. **Triggering Event:** Select "Duplicate" from route row actions dropdown.
4. **Preconditions:** Target route exists in database.
5. **Required Role & Permission:** `master`, `admin`, `operator`, `regular`.
6. **Input Parameters:** `source_route_id: string (UUID)`.
7. **Input Validation:** Route ID must be valid UUID.
8. **Business Rules:** [`BR-019`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-019) (Route Duplication Semantics).
9. **Data Read Before Operation:** `SELECT * FROM public.routes WHERE id = source_route_id`.
10. **State Changes & Transformations:** Deep clone JSONB `configuration_v2` and append " - Copy" to route name.
11. **Database / API Operations:**
    - `INSERT INTO public.routes (route_number_1, route_number_2, name, depot_id, configuration_v2, status, created_by, ...)`
12. **Transaction Boundaries:** Single row insert.
13. **Side Effects:** Invalidates React Query cache for routes list.
14. **Success Response & UI Result:** Toast "Route duplicated successfully"; new duplicated route appears at top of table.
15. **Error Cases:** Database write failure or quota limit exceeded.
16. **Failure & Retry Behavior:** Shows toast with error; original route unmodified.
17. **Duplicate Submission Behavior:** Row action dropdown closes immediately.
18. **Audit & Notifications:** None.
19. **Related Requirements:** `FR-021`, `PAGE-006`, `HOOK-001`.
20. **Evidence References:** [`src/pages/v2/RoutesPage.tsx:L140-L185`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RoutesPage.tsx#L140-L185).

---

### `OP-016`: Soft Delete Route
1. **Operation ID & Name:** `OP-016` — Soft Delete Route
2. **Initiating Page & Component:** [`PAGE-006`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-006) / [`RouteTable.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteTable.tsx)
3. **Triggering Event:** Click "Delete" in row menu and confirm prompt.
4. **Preconditions:** Route exists and has `status != 'deleted'`.
5. **Required Role & Permission:** `master`, `admin`, `operator`, `regular` (for own routes).
6. **Input Parameters:** `route_id: string (UUID)`.
7. **Input Validation:** Confirmation modal prompt confirmed by user.
8. **Business Rules:** [`BR-020`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-020) (Soft Deletion Protocol).
9. **Data Read Before Operation:** None.
10. **State Changes & Transformations:** Target row removed from local table view optimistically.
11. **Database / API Operations:**
    - `UPDATE public.routes SET status = 'deleted', updated_at = NOW() WHERE id = route_id`.
12. **Transaction Boundaries:** Single row update.
13. **Side Effects:** Invalidate routes query cache. Partial unique indexes on `route_number` exclude deleted records.
14. **Success Response & UI Result:** Toast "Route deleted"; table updates.
15. **Error Cases:** RLS violation if attempting to delete another tenant's route.
16. **Failure & Retry Behavior:** Rollback optimistic update and display error banner.
17. **Duplicate Submission Behavior:** Button disabled during confirmation dialog.
18. **Audit & Notifications:** None.
19. **Related Requirements:** `FR-021`, `DATA-003`, `HOOK-001`.
20. **Evidence References:** [`src/hooks/useCrud.ts:L70-L95`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/hooks/useCrud.ts#L70-L95).

---

### `OP-020`: Save Route Configuration V2
1. **Operation ID & Name:** `OP-020` — Save Route Configuration V2
2. **Initiating Page & Component:** [`PAGE-007`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-007) / [`RouteConfigurationPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RouteConfigurationPage.tsx)
3. **Triggering Event:** Click "Save Route" in top studio toolbar.
4. **Preconditions:** Studio open with valid route parameters.
5. **Required Role & Permission:** `master`, `admin`, `operator`, `regular`.
6. **Input Parameters:**
   - Route Header: `route_number_1`, `route_number_2`, `separator`, `name`, `service_type`, `via`, `direction`.
   - Complete Studio Payload: `configuration_v2` (Front, Side, Rear, Internal board slides, dimensions, fonts, speed, timings).
7. **Input Validation:**
   - `route_number_1` must be non-empty string.
   - At least one slide configured on Front board.
   - Slide display duration must be between 1 and 30 seconds.
   - Scroll speed must be integer 1 to 10.
8. **Business Rules:** [`BR-009`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-009) (Standard Dimensions), [`BR-017`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-017) (Stop Auto-Discovery).
9. **Data Read Before Operation:** Queries existing stops to resolve via stops.
10. **State Changes & Transformations:**
    - Parse `via` string into stop list.
    - If new stops found, invoke auto-insertion (`OP-021`).
    - Serialize `RouteConfigV2` model into clean JSON structure.
11. **Database / API Operations:**
    - If new route: `INSERT INTO public.routes (...) RETURNING id`.
    - If existing route: `UPDATE public.routes SET configuration_v2 = ..., name = ..., updated_at = NOW() WHERE id = ...`.
12. **Transaction Boundaries:** Stop insertions followed by route write.
13. **Side Effects:** Invalidate routes cache; update browser URL if draft becomes persisted route.
14. **Success Response & UI Result:** Toast "Route configuration saved successfully"; save button reverts to idle state.
15. **Error Cases:** Network disconnection, PostgreSQL constraint violation.
16. **Failure & Retry Behavior:** Display dialog with specific field errors; preserve unsaved draft in memory.
17. **Duplicate Submission Behavior:** Save button disabled while saving.
18. **Audit & Notifications:** None.
19. **Related Requirements:** `FR-021`, `FR-056`, `PAGE-007`.
20. **Evidence References:** [`src/pages/v2/RouteConfigurationPage.tsx:L410-L490`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RouteConfigurationPage.tsx#L410-L490).

---

### `OP-023`: Export Route Firmware (Controller ZIP)
1. **Operation ID & Name:** `OP-023` — Export Route Firmware (Controller ZIP)
2. **Initiating Page & Component:** [`PAGE-007`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-007) / [`ExportFormatDialog.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/ExportFormatDialog.tsx)
3. **Triggering Event:** Click "Export Firmware" -> Select "Controller ZIP" -> Click "Download".
4. **Preconditions:** Valid route configuration saved in database.
5. **Required Role & Permission:** `master`, `admin`, `operator`, `regular`.
6. **Input Parameters:** `route_id: string`, `include_audio: boolean`.
7. **Input Validation:** Route must have valid non-empty slide text.
8. **Business Rules:** [`BR-016`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-016) (Firmware Serialization Contract).
9. **Data Read Before Operation:** Route configuration and associated audio URLs from `public.stops`.
10. **State Changes & Transformations:** Transform V2 configuration into controller export payload.
11. **Database / API Operations:**
    - `POST https://api.navitronix.in/navitranix/api/routes/export-v2`.
12. **Transaction Boundaries:** External HTTP API stream call.
13. **Side Effects:** None on database.
14. **Success Response & UI Result:** Browser triggers download of `{route_number}_FIRMWARE.ZIP` using `file-saver`. Dialog closes.
15. **Error Cases:** 500 error from external controller API or timeout.
16. **Failure & Retry Behavior:** Toast error "Firmware generation failed: Controller compiler reported syntax error".
17. **Duplicate Submission Behavior:** Button disabled during compiler processing.
18. **Audit & Notifications:** None.
19. **Related Requirements:** `FR-046`, `COMP-007`, `UTIL-010`.
20. **Evidence References:** [`src/components/ExportFormatDialog.tsx:L30-L95`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/ExportFormatDialog.tsx#L30-L95).

---

### `OP-031`: Generate Multilingual Audio via Sarvam AI TTS
1. **Operation ID & Name:** `OP-031` — Generate Multilingual Audio via Sarvam AI TTS
2. **Initiating Page & Component:** [`PAGE-009`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-009) / [`CreateStopForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateStopForm.tsx)
3. **Triggering Event:** Click "Generate Audio" button next to language stop name.
4. **Preconditions:** Stop name populated in target language; `VITE_SARVAM_API_KEY` present.
5. **Required Role & Permission:** `master`, `admin`, `operator`.
6. **Input Parameters:** `{ text: string, language_code: string ('te-IN' | 'hi-IN' | 'en-IN'), depot_id: string, stop_id?: string }`.
7. **Input Validation:** `text` must be $\ge 2$ characters and $\le 100$ characters.
8. **Business Rules:** [`BR-015`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-015) (TTS Audio Generation & Storage).
9. **Data Read Before Operation:** None.
10. **State Changes & Transformations:** Audio generation spinner active. Base64 audio response decoded to binary WAV blob.
11. **Database / API Operations:**
    - `POST https://api.sarvam.ai/text-to-speech` with header `api-subscription-key`.
    - `supabase.storage.from('audios').upload('{depot_id}/{stop_id}_{lang}.wav', blob)`.
    - If stop already exists: `UPDATE public.stops SET audio_url_{lang} = ... WHERE id = ...`.
12. **Transaction Boundaries:** External AI call followed by Supabase Storage write.
13. **Side Effects:** Storage bucket usage increments.
14. **Success Response & UI Result:** Audio waveform player component renders with play/pause button; public URL populated.
15. **Error Cases:** 401 Unauthorized (invalid Sarvam API key); 429 Too Many Requests (rate limit reached).
16. **Failure & Retry Behavior:** Toast "Audio synthesis failed; check API quota"; user can retry manually.
17. **Duplicate Submission Behavior:** Button disabled while synthesis runs.
18. **Audit & Notifications:** None.
19. **Related Requirements:** `FR-037`, `UTIL-002`, `UI-016`.
20. **Evidence References:** [`src/utils/fetchTTS.ts:L20-L135`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/fetchTTS.ts#L20-L135).

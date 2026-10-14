# Functional Requirements Specification: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** System Architects, Product Owners, Full-Stack Migration Engineers  

---

## 1. Requirement Taxonomy & Conventions

This specification details all functional requirements extracted from the `navitronics-ui` codebase. Every requirement adheres to the strict contract outlined in Section 6 of the Master Migration Specification.

### Identifier Index
- `FR-001` - `FR-010`: Authentication, Session, and Tenant Identity
- `FR-011` - `FR-020`: Transit Hierarchy & STU Multi-Tenancy Management
- `FR-021` - `FR-035`: Signboard Studio & Multiboard LED Configuration
- `FR-036` - `FR-045`: Multilingual Text, Phonetic IME, and Speech Synthesis (TTS)
- `FR-046` - `FR-055`: Firmware Serialization & Hardware Controller Export
- `FR-056` - `FR-065`: Bus Stops & Route Auto-Discovery Management
- `FR-066` - `FR-075`: User Administration & Security Controls

---

## 2. Authentication, Session & Multi-Tier Identity (`FR-001` - `FR-010`)

### `FR-001`: Direct Credential Authentication with Role Hydration
- **Requirement ID:** `FR-001`
- **Title:** Direct Credential Authentication and Client Role Hydration
- **Requirement Statement:** The application must authenticate users via Supabase GoTrue Auth using email and password, retrieve the corresponding application user profile from `public.users`, hydrate global Zustand stores (`useLoggedUserStore`), and direct the user to their designated landing page.
- **Business Purpose:** Provide secure gateway access to transit personnel while determining organizational scope.
- **Source:** [`src/ui/components/UserLoginForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UserLoginForm.tsx#L45-L120), [`src/store/useLoggedUserStore.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/store/useLoggedUserStore.ts#L10-L45)
- **Evidence Status:** Verified
- **Actors and Roles:** All roles (`master`, `admin`, `operator`, `guest`, `regular`)
- **Preconditions:** Valid record in `auth.users` and matching `public.users` profile.
- **Trigger:** Submission of `UserLoginForm` on `/login`.
- **Inputs:** `email` (string, valid email format), `password` (string).
- **Business Rules:** [`BR-001`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-001) (Authentication Validation), [`BR-002`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-002) (Role Landing Redirection).
- **Processing:**
  1. Call `supabase.auth.signInWithPassword({ email, password })`.
  2. Query `public.users` where `id = auth.user.id`.
  3. Validate `status === 'active'`. If inactive/deleted, abort and throw error.
  4. Fetch role record from `public.roles` matching `role_id`.
  5. Commit `IUser` object to `useLoggedUserStore` and persist to `localStorage`.
- **Data Dependencies:** `auth.users`, `public.users`, `public.roles`.
- **Authorization:** Publicly accessible endpoint.
- **Success Behavior:** JWT token stored; user routed to `/dashboard` (Master/STU) or `/routes` (Regular).
- **Failure Behavior:** Display toast error "Invalid email or password" or "Account is deactivated".
- **Conditional Behavior:** If user is `guest` and `expires_at` is past current timestamp, reject login (`BR-003`).
- **Related Requirements:** `OP-001`, `PAGE-001`, `FORM-001`.
- **Acceptance Criteria:** Given valid credentials, user session is created and persisted across page refresh; invalid credentials display explicit error toast.

---

### `FR-002`: Multi-Tier Tenancy Classification & Navigation Adaptation
- **Requirement ID:** `FR-002`
- **Title:** Multi-Tier Tenancy Classification and Dynamic Navigation
- **Requirement Statement:** The application must classify logged-in users into one of four customer tiers (`master`, `stu`, `regular`, `guest`) and dynamically filter the sidebar navigation and operational capabilities.
- **Business Purpose:** Provide tailored workflows for enterprise state transit corporations (STUs), private bus body builders, and prospective evaluators within a unified codebase.
- **Source:** [`src/utils/customerType.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/customerType.ts#L1-L85), [`src/ui/layouts/DefaultPageLayout.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/layouts/DefaultPageLayout.tsx#L40-L150)
- **Evidence Status:** Verified
- **Actors and Roles:** All authenticated users.
- **Preconditions:** Active session in `useLoggedUserStore`.
- **Trigger:** Layout mounting and route change events.
- **Inputs:** `user.organization_id`, `user.depot_id`, `user.role_code`.
- **Business Rules:** [`BR-004`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-004) (Customer Tier Resolution).
- **Processing:**
  - If `role_code === 'master'` -> Tier: `master` (All modules visible).
  - Else if `organization_id !== null && depot_id !== null` -> Tier: `stu` (Hierarchy, Stops, Routes, Config visible).
  - Else if `organization_id === null && depot_id === null && role_code !== 'guest'` -> Tier: `regular` (Routes only).
  - Else if `role_code === 'guest'` -> Tier: `guest` (Read-only routes & displays).
- **Data Dependencies:** `public.users`.
- **Authorization:** Evaluated client-side via `customerType.ts`.
- **Success Behavior:** Sidebar reflects only navigation links permitted for the active tier.
- **Failure Behavior:** If tier cannot be resolved, default to minimal restricted guest view.
- **Related Requirements:** `COMP-008`, `PAGE-002`, `ROLE-001..ROLE-004`.
- **Acceptance Criteria:** A regular customer user never sees Organizations, Regions, Depots, or Users sidebar items.

---

### `FR-003`: STU Active Depot Switching and Scope Enforcement
- **Requirement ID:** `FR-003`
- **Title:** STU Active Depot Context Switching and Data Scoping
- **Requirement Statement:** Users with multi-depot clearance or Super Admin role must be able to switch active depot context via the global header selector; all subsequent database queries for stops, routes, and statistics must automatically filter by the selected `depot_id`.
- **Business Purpose:** Enable regional supervisors and system administrators to manage individual depot operations seamlessly.
- **Source:** [`src/store/useDepotStore.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/store/useDepotStore.tsx#L1-L35), [`src/components/PageHeader.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/PageHeader.tsx#L25-L65)
- **Evidence Status:** Verified
- **Actors and Roles:** `master`, `admin`
- **Preconditions:** User belongs to an STU organization or is `master`.
- **Trigger:** User selects an alternate depot from the top navigation dropdown.
- **Inputs:** `new_depot_id` (UUID).
- **Business Rules:** [`BR-005`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-005) (Depot Scoping).
- **Processing:**
  1. Update `selectedDepot` state in `useDepotStore`.
  2. Persist selection to `localStorage`.
  3. Invalidate TanStack Query caches for `routes`, `stops`, and `depot_stats`.
- **Data Dependencies:** `public.depots`.
- **Authorization:** Only depots belonging to the user's organization may be selected.
- **Success Behavior:** All tables, metrics, and dropdowns update immediately to show the newly selected depot's assets.
- **Failure Behavior:** Inability to load depot details shows a non-blocking toast warning and reverts to default depot.
- **Related Requirements:** `STORE-002`, `COMP-014`, `PAGE-006`.
- **Acceptance Criteria:** Switching depot triggers instant refetch of routes table filtered by new `depot_id`.

---

## 3. Transit Hierarchy & STU Onboarding (`FR-011` - `FR-020`)

### `FR-011`: STU Enterprise Sequential Onboarding Wizard
- **Requirement ID:** `FR-011`
- **Title:** Multi-Step STU Enterprise Onboarding Wizard
- **Requirement Statement:** The system must provide a guided 4-step wizard for Super Admins to provision an entire transit organization structure (Organization -> Region -> Depot -> Depot Administrator) sequentially.
- **Business Purpose:** Expedite onboarding of new transit corporations while enforcing relational data integrity.
- **Source:** [`src/ui/components/STUOnboardingWizard.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx#L50-L280)
- **Evidence Status:** Verified (with Known Defect [`ARC-01`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/62-KNOWN-ISSUES-AND-TECHNICAL-DEBT.md#ARC-01))
- **Actors and Roles:** `master`
- **Preconditions:** Super Admin authentication.
- **Trigger:** Wizard submission on `/organizations`.
- **Inputs:** Organization details (name, code, state), Region details (name, code), Depot details (name, code, location), Admin user details (username, email, password).
- **Business Rules:** [`BR-006`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-006) (Sequential Hierarchy Creation), [`BR-007`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-007) (Code Uniqueness).
- **Processing:**
  1. Insert into `public.organizations`; capture `org_id`.
  2. Insert into `public.regions` using `org_id`; capture `region_id`.
  3. Insert into `public.depots` using `org_id` and `region_id`; capture `depot_id`.
  4. Create auth account via `supabaseAuthHelper.auth.signUp()`.
  5. Insert profile into `public.users` linking `org_id`, `region_id`, `depot_id`.
- **Data Dependencies:** `public.organizations`, `public.regions`, `public.depots`, `public.users`.
- **Authorization:** Restricted to `master`.
- **Success Behavior:** Complete enterprise tree provisioned; success modal displayed; lists refreshed.
- **Failure Behavior:** If any step fails, attempt manual cleanup of preceding created records and surface error.
- **Related Requirements:** `UI-009`, `PAGE-003`, `OP-005`.
- **Acceptance Criteria:** Successful wizard run creates active organization, region, depot, and administrator account ready for login.

---

### `FR-012`: Regular Customer Automated Self-Provisioning
- **Requirement ID:** `FR-012`
- **Title:** Regular Customer Account and Virtual Depot Provisioning
- **Requirement Statement:** Super Admins must be able to onboard standalone regular customers by providing credentials; the system must auto-generate a virtual depot for the user to satisfy schema foreign key constraints while maintaining customer isolation.
- **Business Purpose:** Permit private coach builders and single-bus operators to use the route studio without setting up complex transit hierarchies.
- **Source:** [`src/ui/components/CreateRegularCustomerDrawer.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateRegularCustomerDrawer.tsx#L40-L160)
- **Evidence Status:** Verified
- **Actors and Roles:** `master`
- **Preconditions:** Super Admin session.
- **Trigger:** Submit "Add Regular Customer" drawer.
- **Inputs:** `username`, `email`, `phone_number`, `password`.
- **Business Rules:** [`BR-008`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-008) (Regular Customer Isolation).
- **Processing:**
  1. Call `supabaseAuthHelper.auth.signUp()`.
  2. Create virtual depot in `public.depots` with name format `REGULAR_<username>`.
  3. Insert into `public.users` with `organization_id = NULL`, `depot_id = virtual_depot_id`, role = `regular`.
- **Data Dependencies:** `public.users`, `public.depots`.
- **Authorization:** Master only.
- **Success Behavior:** Regular customer profile created; drawer closes; customers table refreshed.
- **Related Requirements:** `PAGE-005`, `UI-005`, `OP-008`.
- **Acceptance Criteria:** Created regular user can log in and immediately build private routes scoped exclusively to their virtual depot.

---

## 4. Signboard Studio & Multiboard LED Configuration (`FR-021` - `FR-035`)

### `FR-021`: Multiboard Synchronized Display Studio Configuration
- **Requirement ID:** `FR-021`
- **Title:** Multiboard LED Signboard Route Configuration (Front, Side, Rear, Internal)
- **Requirement Statement:** The system must provide an interactive visual studio allowing transit designers to configure up to four distinct destination display signboards (Front, Side, Rear, Cabin/Internal) per route with independent dimensions, formats, and sequence slides.
- **Business Purpose:** Provide a single unified authoring tool matching actual bus physical hardware setups.
- **Source:** [`src/pages/v2/RouteConfigurationPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RouteConfigurationPage.tsx#L120-L450), [`src/types/routeConfigV2.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/types/routeConfigV2.ts#L1-L150)
- **Evidence Status:** Verified
- **Actors and Roles:** `master`, `admin`, `operator`, `regular`
- **Preconditions:** Active route draft or existing route loaded in studio.
- **Trigger:** Route configuration page load on `/routes/:id/config` or `/routes/new`.
- **Inputs:** Route metadata (number 1, number 2, service type), board toggles, slide timing, text lines.
- **Business Rules:** [`BR-009`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-009) (Standard Board Dimensions), [`BR-010`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-010) (Display Formats).
- **Processing:**
  - Maintains state structure `RouteConfigV2` with sub-records for `front_board`, `side_board`, `rear_board`, and `internal_board`.
  - Enforces default pixel bounds: Front (128x16 or 128x32), Side (128x16), Rear (96x16), Internal (128x16).
  - Syncs common route properties (Route Numbers, Service Type) across all enabled boards.
- **Data Dependencies:** `public.routes.configuration_v2` (JSONB column).
- **Authorization:** Checked via RLS and route ownership.
- **Success Behavior:** Full multiboard state maintained reactively; changes render in real-time canvas preview.
- **Related Requirements:** `COMP-001`, `PAGE-007`, `TYPE-001`.
- **Acceptance Criteria:** Designer can configure distinct slides on Front and Side boards simultaneously within the same route record.

---

### `FR-022`: Split Route Numbering Architecture
- **Requirement ID:** `FR-022`
- **Title:** Split Route Number Matrix Formatting (Stacked / Delimited)
- **Requirement Statement:** The application must support dual route identifiers (`route_number_1` and `route_number_2`) separated by `-` or `/`, and render them either side-by-side or stacked vertically in half-height dot-matrix fonts.
- **Business Purpose:** Accommodate complex Indian transit route numbering conventions (e.g., "100-D", "5K/16", "218/1").
- **Source:** [`src/ui/components/RouteNumberControl.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteNumberControl.tsx#L20-L85), [`src/ui/components/SignboardCanvasStage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/SignboardCanvasStage.tsx#L310-L380)
- **Evidence Status:** Verified
- **Actors and Roles:** `master`, `admin`, `operator`, `regular`
- **Preconditions:** Route editor open.
- **Trigger:** Modification of Route Number 1 or Route Number 2 inputs.
- **Inputs:** `route_number_1` (string, max 10 chars), `route_number_2` (string, max 10 chars), `separator` ('-', '/', ' ').
- **Business Rules:** [`BR-011`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-011) (Route Number Matrix Layout).
- **Processing:**
  - On 32-pixel height boards: Route Number 1 renders on upper 16 rows, Route Number 2 renders on lower 16 rows if stacked format is selected.
  - On 16-pixel height boards: Both strings render inline separated by selected delimiter.
- **Related Requirements:** `UI-011`, `COMP-001`.
- **Acceptance Criteria:** Entering "218" and "A" renders a stacked composite glyph box occupying the leftmost 32x32 matrix pixels.

---

### `FR-023`: HTML5 Canvas Physical LED Matrix Simulation Engine
- **Requirement ID:** `FR-023`
- **Title:** Canvas-Based Photorealistic LED Signboard Simulator
- **Requirement Statement:** The studio must render an interactive, pixel-accurate HTML5 Canvas simulation of the physical signboard displaying active LED dots, glowing halos, inactive background bead grids, scan lines, and frame-stepped motion effects.
- **Business Purpose:** Enable visual verification of typography legibility and transition effects without requiring physical hardware connected to the workstation.
- **Source:** [`src/ui/components/SignboardCanvasStage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/SignboardCanvasStage.tsx#L40-L450), [`src/components/canvasUtility.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/canvasUtility.ts#L10-L120)
- **Evidence Status:** Verified
- **Actors and Roles:** All roles with access to route configuration or simulation dialog.
- **Preconditions:** Valid slide text and dimensions.
- **Trigger:** Canvas animation frame request loop (`requestAnimationFrame`).
- **Inputs:** Board width, board height, pixel pitch (P10/P13), LED color (`#FFB000` Amber, `#FF0000` Red, `#00FF00` Green, `#FFFFFF` White), pixel style (`circle` / `square`), active raster bitmask.
- **Business Rules:** [`BR-012`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-012) (LED Canvas Rasterization).
- **Processing:**
  1. Clear canvas; calculate pixel diameter and spacing based on container width.
  2. Draw background inactive dark circular beads (`#1A1A1A`).
  3. Overlay active bright circular beads with radial gradient glow.
  4. Apply horizontal scanline overlay if enabled.
- **Performance Criteria:** Must maintain steady 60 FPS rendering on modern browsers.
- **Related Requirements:** `COMP-001`, `COMP-028`, `NFR-001`.
- **Acceptance Criteria:** Toggle between Amber and Red instantly redraws all active LEDs in the chosen color with realistic luminescence.

---

### `FR-024`: Local .NET 8 Sidecar Bitmap Font Rasterizer Integration
- **Requirement ID:** `FR-024`
- **Title:** Electron Background .NET Sidecar Bitmap Rasterizer Integration
- **Requirement Statement:** In Electron desktop mode, the application must interface with an embedded .NET 8 sidecar executable (`BitmapFontApi.exe`) running on `127.0.0.1:5288` to rasterize complex Indian language glyphs into exact ASCII dot matrices (`#`/`.`), falling back to browser Canvas rendering in standard web mode.
- **Business Purpose:** Ensure mathematical parity between on-screen simulation and the proprietary microcontroller font rasterization engine.
- **Source:** [`src/services/bitmapService.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/services/bitmapService.ts#L15-L80), [`electron/main.cjs`](file:///Users/vinaykongari/Nav/old/navitronics-ui/electron/main.cjs#L60-L115)
- **Evidence Status:** Verified
- **Actors and Roles:** System / Background runtime
- **Preconditions:** Electron process running; .NET 8 sidecar spawned and healthy on port 5288.
- **Trigger:** Text property changes or slide switching in Route Studio.
- **Inputs:** `POST http://127.0.0.1:5288/api/bitmap` payload: `{ text: string, font_size: number, language: string, height: number }`.
- **Business Rules:** [`BR-013`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-013) (Sidecar Rasterization Fallback).
- **Processing:**
  1. Dispatch HTTP POST to loopback sidecar with 2000ms timeout.
  2. If HTTP 200 returned: Parse ASCII matrix array (`#` active, `.` inactive) and pass to canvas stage.
  3. If timeout or connection refused: Log warning, invoke client-side HTML5 Canvas 2D `measureText()` / `getImageData()` fallback.
- **Data Dependencies:** None (Local HTTP RPC).
- **Success Behavior:** Pixel-perfect matrix matching hardware firmware rendered on canvas.
- **Failure Behavior:** Transparent fallback to client Canvas rendering; user workflow uninterrupted.
- **Related Requirements:** `SVC-001`, `COMP-024`, `10-SYSTEM-ARCHITECTURE.md`.
- **Acceptance Criteria:** Terminating the sidecar process does not crash the UI; canvas continues rendering via fallback engine.

---

## 5. Multilingual Text, Phonetic IME & Speech Synthesis (`FR-036` - `FR-045`)

### `FR-036`: Real-Time Indic Phonetic IME Transliteration
- **Requirement ID:** `FR-036`
- **Title:** Real-Time Indic Phonetic IME Transliteration (Google Input Tools & Sanscript)
- **Requirement Statement:** Stop and route input fields must allow users to type phonetic English text (e.g., "Secunderabad", "Koti") and automatically convert it into native Indic scripts (Telugu, Devanagari/Hindi) in real time.
- **Business Purpose:** Eliminate the need for transit clerks to install specialized multilingual keyboard drivers.
- **Source:** [`src/components/IMEInput.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/IMEInput.tsx#L35-L160), [`src/utils/transliteration.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/transliteration.ts#L1-L35)
- **Evidence Status:** Verified
- **Actors and Roles:** `master`, `admin`, `operator`, `regular`
- **Preconditions:** IME mode toggled on for field; target language set to Telugu (`te`) or Hindi (`hi`).
- **Trigger:** Spacebar or Enter key pressed in `IMEInput`.
- **Inputs:** Raw Latin keystroke string.
- **Business Rules:** [`BR-014`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-014) (Transliteration Fallback Priority).
- **Processing:**
  1. Call Google Input Tools API endpoint: `https://inputtools.google.com/request?text=...&itc=te-t-i0-und`.
  2. If online API returns candidates: Select primary candidate and replace input text.
  3. If offline or request fails: Invoke local `@indic-transliteration/sanscript` library for client-side phonetic mapping.
- **Data Dependencies:** Google Input Tools API (external).
- **Success Behavior:** Romanized text replaced with native Telugu or Devanagari script.
- **Failure Behavior:** Preserves raw Latin text if both online and offline conversion fail.
- **Related Requirements:** `COMP-012`, `UTIL-003`, `PAGE-009`.
- **Acceptance Criteria:** Typing "hyderabad" followed by space produces "హైదరాబాద్" when Telugu IME is active.

---

### `FR-037`: Automated Speech Synthesis (TTS) via Sarvam AI API
- **Requirement ID:** `FR-037`
- **Title:** Automated Multilingual Speech Synthesis for Bus Stop Announcements
- **Requirement Statement:** When a transit bus stop is created or updated, the application must invoke the Sarvam AI TTS API (`bulbul:v2`) to generate WAV audio announcement files in English, Telugu, and Hindi, and upload them to the Supabase `audios` storage bucket.
- **Business Purpose:** Power the vehicle's automatic Passenger Announcement System (PAS) for next-stop chimes without requiring manual voice recording studio sessions.
- **Source:** [`src/utils/fetchTTS.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/fetchTTS.ts#L20-L135), [`src/ui/components/CreateStopForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateStopForm.tsx#L85-L140)
- **Evidence Status:** Verified (with Known Security Finding [`SEC-03`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/33-SECURITY-AND-PRIVACY-REQUIREMENTS.md#SEC-03))
- **Actors and Roles:** `master`, `admin`, `operator`
- **Preconditions:** Stop name populated in target language; `VITE_SARVAM_API_KEY` present.
- **Trigger:** "Generate Audio" action or automatic stop creation.
- **Inputs:** `stop_name` (string), `language_code` ('te-IN', 'hi-IN', 'en-IN'), `speaker` ('meera', 'arvind').
- **Business Rules:** [`BR-015`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-015) (TTS Audio Generation & Storage).
- **Processing:**
  1. Send POST request to `https://api.sarvam.ai/text-to-speech`.
  2. Decode base64 audio payload from response into binary WAV Blob.
  3. Upload WAV file to Supabase Storage: `audios/{depot_id}/{stop_id}_{lang}.wav`.
  4. Obtain public URL and persist to `public.stops.audio_url_{lang}`.
- **Data Dependencies:** Sarvam AI API, Supabase Storage (`audios`), `public.stops`.
- **Authorization:** Authenticated user with depot write permissions.
- **Success Behavior:** Audio file created; URL stored; audio player waveform visible in UI.
- **Failure Behavior:** Display toast "Audio generation failed; verify API quota"; stop record saved without audio link.
- **Related Requirements:** `UTIL-002`, `UI-016`, `PAGE-009`.
- **Acceptance Criteria:** Clicking generate audio produces a playable WAV file within 3 seconds.

---

## 6. Firmware Serialization & Hardware Export (`FR-046` - `FR-055`)

### `FR-046`: Navitronix Controller Hardware Firmware Export (V1 Binary, V2 JSON, ZIP)
- **Requirement ID:** `FR-046`
- **Title:** Hardware Firmware Binary and Configuration Bundle Export
- **Requirement Statement:** The system must export configured routes into controller-ready packages, including legacy V1 binary format (`.bin`), modern V2 JSON format (`.json`), and comprehensive firmware ZIP packages containing matrix binaries and stop audio clips via `api.navitronix.in`.
- **Business Purpose:** Transfer route configurations onto USB thumb drives or over-the-air (OTA) programming dongles for vehicle LED display master controllers.
- **Source:** [`src/pages/v2/RouteConfigurationPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RouteConfigurationPage.tsx#L550-L680), [`src/components/ExportFormatDialog.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/ExportFormatDialog.tsx#L30-L95)
- **Evidence Status:** Verified
- **Actors and Roles:** `master`, `admin`, `operator`, `regular`
- **Preconditions:** Valid route configuration saved in database.
- **Trigger:** "Export Firmware" button click in Route Studio or Routes Table.
- **Inputs:** `export_format` ('v1_bin', 'v2_json', 'controller_zip'), `include_audio` (boolean).
- **Business Rules:** [`BR-016`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-016) (Firmware Serialization Contract).
- **Processing:**
  1. If `v2_json`: Generate formatted JSON blob from `configuration_v2` and trigger browser file download (`fileSystemExport.ts`).
  2. If `controller_zip`: Call `POST https://api.navitronix.in/navitranix/api/routes/export-v2` with converted route payload; stream response ZIP containing `ROUTES.BIN`, `CONFIG.DAT`, and audio `.WAV` files.
  3. If `v1_bin`: Convert V2 structure to V1 via `routeConfigMapper.ts` and post to legacy endpoint `.../routes/export`.
- **Data Dependencies:** External Navitronix Controller API (`api.navitronix.in`), `public.routes`.
- **Success Behavior:** Browser initiates download of `.zip` or `.json` file formatted for controller firmware.
- **Failure Behavior:** Error modal showing "Controller compilation failed: Check route character length".
- **Related Requirements:** `COMP-007`, `UTIL-004`, `UTIL-010`.
- **Acceptance Criteria:** Exported ZIP contains valid binary structure readable by hardware simulator.

---

## 7. Stops & Route Auto-Discovery (`FR-056` - `FR-065`)

### `FR-056`: Automatic Stop Discovery and Silent Insertion on Route Save
- **Requirement ID:** `FR-056`
- **Title:** Automatic Stop Discovery and Insertion from Route "Via" String
- **Requirement Statement:** When a user creates or saves a route with a "Via" stop sequence string (e.g., "Koti, Lakdikapul, Ameerpet"), the system must parse the comma-separated stops, cross-reference them against existing stops for that depot, and automatically insert any missing stops into `public.stops`.
- **Business Purpose:** Speed up route entry by eliminating the mandatory prerequisite of manual stop creation in advance.
- **Source:** [`src/pages/v2/RouteConfigurationPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RouteConfigurationPage.tsx#L410-L490)
- **Evidence Status:** Verified (Noted in Bug Tracker as [`BUG-051`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/62-KNOWN-ISSUES-AND-TECHNICAL-DEBT.md#BUG-051) for missing transliteration)
- **Actors and Roles:** `master`, `admin`, `operator`, `regular`
- **Preconditions:** Route save operation initiated.
- **Trigger:** Save Route action in Route Studio.
- **Inputs:** `via` (comma-separated string), `depot_id`.
- **Business Rules:** [`BR-017`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-017) (Stop Auto-Discovery).
- **Processing:**
  1. Split `via` string by `,` and trim whitespace.
  2. Query `public.stops` for `depot_id` matching stop names.
  3. For every missing stop name:
     - Generate stop code `STP_<name_prefix>_<random>`.
     - Insert into `public.stops` with `name_english = stop_name`, `depot_id = active_depot`.
  4. Link created stop IDs into route sequence definition.
- **Data Dependencies:** `public.stops`, `public.routes`.
- **Success Behavior:** Route saved; new stops immediately visible in Stops Management table.
- **Failure Behavior:** If stop insert fails due to constraint, abort route save and roll back.
- **Related Requirements:** `PAGE-007`, `PAGE-009`, `OP-020`.
- **Acceptance Criteria:** Entering three new stop names in "Via" field automatically populates three new rows in `public.stops`.

---

## 8. User Administration & Security Controls (`FR-066` - `FR-075`)

### `FR-066`: User Profile Provisioning with Isolated Auth Client
- **Requirement ID:** `FR-066`
- **Title:** User Provisioning using Non-Persisted Auth Helper
- **Requirement Statement:** Administrators must be able to create new staff users without having their current administrator session overwritten in browser `localStorage`. The application must use an isolated client (`supabaseAuthHelper`) with `persistSession: false`.
- **Business Purpose:** Prevent administrative session hijacking/logout during routine operator creation.
- **Source:** [`src/supabaseClient.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/supabaseClient.ts#L8-L15), [`src/ui/components/CreateUserForm2.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateUserForm2.tsx#L120-L195)
- **Evidence Status:** Verified
- **Actors and Roles:** `master`, `admin`
- **Preconditions:** Authenticated admin session.
- **Trigger:** Submission of `CreateUserForm2`.
- **Inputs:** `username`, `email`, `password`, `role_id`, `organization_id`, `region_id`, `depot_id`.
- **Business Rules:** [`BR-018`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/24-BUSINESS-RULES-AND-DECISION-TABLES.md#BR-018) (User Creation Integrity).
- **Processing:**
  1. Call `supabaseAuthHelper.auth.signUp({ email, password })`.
  2. Retrieve generated `auth.users.id`.
  3. Insert into `public.users` storing user metadata, scope IDs, and plaintext password (`SEC-02`).
- **Data Dependencies:** `auth.users`, `public.users`.
- **Authorization:** Only users with `admin` or `master` role.
- **Success Behavior:** User created; Admin remains logged in on current page; users table refreshes.
- **Failure Behavior:** Toast notification with Supabase error code.
- **Related Requirements:** `UI-007`, `PAGE-010`, `OP-030`.
- **Acceptance Criteria:** Admin creates a user and remains authenticated as admin without session disruption.

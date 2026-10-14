# Assumptions, Decisions, Conflicts & Open Questions Register

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  

---

## 1. Assumptions Register (`ASM-xxx`)

The following assumptions were formulated during reverse engineering where explicit runtime code or backend source was unavailable:

| ID | Title | Underlying Rationale | Source Evidence | Impact on Migration | Status |
|---|---|---|---|---|---|
| **ASM-001** | External Controller API Protocol | In [RoutesPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RoutesPage.tsx#L613-L650), routes are posted to `api.navitronix.in/navitranix/api/routes/export` and `export-v2`. It is assumed this Java backend compiles proprietary binary firmware (.bin / .hex) for USB controller hardware. | `RoutesPage.tsx:613`, `RegularRoutesPage.tsx:448` | Target system must either retain this controller API or implement equivalent firmware binary formatting. | Inferred |
| **ASM-002** | Sarvam AI Production Voice Consistency | Voice generation calls Sarvam AI `bulbul:v2` with speakers `"meera"` and `"arvind"`. It is assumed the receiving system must preserve these exact voice profiles to match existing audio chimes onboard buses. | `fetchTTS.ts:20-23`, `fetchTTS.ts:111-112` | Changing TTS vendors would alter the acoustic signature of transit announcements across existing fleets. | Inferred |
| **ASM-003** | Default Navitronix System Organization | Organization with name `"navitronix"` or ID `6b679098-ef69-45f0-9fb1-b457dd882060` is treated as a non-deletable system organization. | `OrganizationsPage.tsx:110-112` | Migration seed scripts must preserve this root tenant ID to prevent orphan foreign key references. | Verified |
| **ASM-004** | LED Matrix Dot-Pitch and Hardware Canvas | Physical bus signboards use an 8-bit or 16-bit packed column binary layout where dot column height corresponds to 16 or 32 physical LEDs. | `v1.json`, `v2.json`, `LedSignBoard.tsx:70-107` | Canvas simulation scale calculations depend on an 8px virtual LED dot size. | Verified |
| **ASM-005** | Standalone Customer Data Isolation | Standalone customers have `depot_id = NULL` and `organization_id = NULL`. It is assumed they should never be able to access any stops, regions, or depots belonging to STU customers. | `customerType.ts:19-36`, `20260918_customer_tiers_and_constraints.sql` | Migration data models must strictly enforce this nullability and isolation. | Verified |

---

## 2. Confirmed Architectural Decisions (`DEC-xxx`)

Decisions evidenced by active implementation and recent git commits:

| ID | Title | Summary of Confirmed Implementation Decision | Evidence Reference |
|---|---|---|---|
| **DEC-001** | Multi-Tier Customer Separation | Replaced monolithic organizational model with 3 clear tiers: Super Admin, STU Enterprise, and Standalone Regular Customers. | [customerType.ts](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/customerType.ts), [20260918_customer_tiers_and_constraints.sql](file:///Users/vinaykongari/Nav/old/navitronics-ui/supabase/migrations/20260918_customer_tiers_and_constraints.sql) |
| **DEC-002** | Soft-Delete Partial Unique Constraints | Switched from unconditional unique constraints to partial unique indexes (`WHERE deleted = false`) to permit recreation of soft-deleted records without 23505 collisions. | [20260923_soft_delete_partial_unique_constraints.sql](file:///Users/vinaykongari/Nav/old/navitronics-ui/supabase/migrations/20260923_soft_delete_partial_unique_constraints.sql) |
| **DEC-003** | Split-Route LED Numbering Architecture | Added dedicated `route_number_1` and `route_number_2` fields to support split signboard numbering (stacked boxes for route suffixes). | [routeConfigV2.ts](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/types/routeConfigV2.ts#L155-L158), commit `16f3c5b` |
| **DEC-004** | Dual Route Engine Coexistence (V1 + V2) | Maintained feature flags `v1_routes` and `v2_routes` at both user and organization levels, enabling seamless legacy V1 format support alongside modern V2. | [featureFlags.ts](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/featureFlags.ts), [20260913_v1_v2_feature_flags.sql](file:///Users/vinaykongari/Nav/old/navitronics-ui/supabase/migrations/20260913_v1_v2_feature_flags.sql) |
| **DEC-005** | Hybrid Desktop Sidecar Process | Packaged a local .NET 8 `BitmapFontApi` background executable inside Electron to generate LED dot-matrix ASCII strings locally on Windows without cloud latency. | [electron/main.cjs](file:///Users/vinaykongari/Nav/old/navitronics-ui/electron/main.cjs#L17-L71), [electron/preload.cjs](file:///Users/vinaykongari/Nav/old/navitronics-ui/electron/preload.cjs) |
| **DEC-006** | Audio Announcement Fallback Pipeline | Implemented synthetic 16-bit PCM mono WAV chime generator in the browser when Sarvam AI API keys are unavailable, preventing UI lockups. | [fetchTTS.ts:37-68](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/fetchTTS.ts#L37-L68) |

---

## 3. Conflicting Evidence & Architectural Inconsistencies (`CNF-xxx`)

Discrepancies identified between different files or subsystem layers in the repository:

| ID | Title | Conflict Description | Source A | Source B | Recommended Resolution |
|---|---|---|---|---|---|
| **CNF-001** | Role Service Split-Brain Backend | Roles page uses Axios to call `api.navitronix.in/roles`, while all other pages use Supabase PostgREST on `public.roles`. | [Roles.tsx:18-23](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/Roles.tsx#L18-L23), [roleService.ts](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/services/roleService.ts) | [IUser.ts:53](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/types/IUser.ts#L53) (`roleCrud`) | Deprecate Axios endpoint and standardize on Supabase `roleCrud`. |
| **CNF-002** | Plaintext Password vs Hashed Supabase Auth | Passwords are saved in plaintext to `public.users.password`, but users authenticate against Supabase Auth hashed passwords. | [STUOnboardingWizard.tsx:370](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx#L370) | [UserLoginForm.tsx:95](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UserLoginForm.tsx#L95) (`signInWithPassword`) | Drop plaintext `password` column; rely exclusively on Supabase Auth. |
| **CNF-003** | Frontend Route Guard vs Supabase RLS Scoping | Frontend RBAC permits Depot Admin to access routes, but RLS route policy allows modifying any route in the organization if `organization_id` matches. | [App.tsx:155-161](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/App.tsx#L155-L161) | [20260921_enable_row_level_security.sql:148-169](file:///Users/vinaykongari/Nav/old/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L148-L169) | Align RLS policies to restrict depot admins strictly to their assigned `depot_id`. |
| **CNF-004** | Hardcoded Client Credentials vs Environment Variables | [supabaseClient.ts](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/supabaseClient.ts) hardcodes production URL and anon key, ignoring `import.meta.env.VITE_SUPABASE_URL`. | [supabaseClient.ts:3-4](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/supabaseClient.ts#L3-L4) | [.env.example](file:///Users/vinaykongari/Nav/old/navitronics-ui/.env.example) | Inject Supabase credentials dynamically from environment variables. |

---

## 4. Stakeholder & Architectural Questions (`QST-xxx`)

Questions that require business or infrastructure stakeholder confirmation before target production deployment:

| ID | Topic | Question for Leadership / Stakeholders | Architectural Impact |
|---|---|---|---|
| **QST-001** | Controller Export Backend | Will the target system reimplement the firmware compilation logic natively in TypeScript/Python, or continue proxying to `api.navitronix.in`? | Affects whether the Java controller backend must be maintained or decommissioned. |
| **QST-002** | Plaintext Password Elimination | Can the `PasswordViewerCell` component in admin tables be permanently removed in favor of standard automated email password reset invites? | Resolves critical compliance vulnerability `SEC-02`. |
| **QST-003** | CCTV Module Timeline | Is the CCTV and live surveillance streaming feature (`/home/cctv`) scheduled for the migration release or a subsequent phase? | Dictates whether video streaming infrastructure (WebRTC / HLS) must be provisioned. |
| **QST-004** | Desktop vs Pure Web | Is the Windows Electron desktop application mandatory for the migration, or will the new web application run purely in standard web browsers? | Determines whether Electron packaging and sidecar process lifecycles must be ported. |

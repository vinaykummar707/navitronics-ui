# Architecture Audit Report

**Target Repository:** `navitronics-ui`  
**Audit Date:** September 21, 2026  
**Auditor:** Staff / Principal Software Architect  
**Scope:** Frontend Architecture (React 18, Vite 6, TypeScript), State Management (Zustand, React Query), Data Access & Security (Supabase PostgreSQL, Auth, RLS, Storage), Build & Tooling  

---

## 1. Executive Summary

The `navitronics-ui` codebase delivers rich transit operations capabilities—including LED signboard simulation, bus route creation, multilingual audio announcement generation, and multi-tenant fleet administration. However, the application exhibits an overall architecture health rating of **Critical** due to foundational security, data integrity, and transactional vulnerabilities that jeopardize production safety. The primary architectural strengths include clean route-level code-splitting with `React.lazy`, robust compound database indexes in recent migrations, and zero circular dependencies. 

The three most urgent architectural issues are:
1. **Critical Row-Level Security (RLS) Privilege Escalation (`SEC-01`):** The RLS update policy on `public.users` permits any authenticated user to update their own record with arbitrary role IDs, enabling immediate privilege escalation to Super Admin (`master`) or reassignment across organizations directly via client-side PostgREST calls.
2. **Plaintext Password Storage and Third-Party API Key Exposure (`SEC-02` / `SEC-03`):** Passwords are saved unhashed into `public.users.password` and rendered in the admin UI table, while a private paid Sarvam AI subscription key is bundled into client JavaScript and transmitted in client request headers.
3. **Non-Atomic Client-Side Multi-Entity Provisioning (`ARC-01`):** Multi-step tenant onboarding (organizations, regions, depots, auth accounts, and user rows) executes sequentially in the browser with pseudo-rollback `catch` handlers, resulting in orphaned records and database corruption upon network interruption.

The primary risk of leaving these issues unaddressed is catastrophic tenant data breach, unauthorized administrative takeover, compromised user credentials, and irrecoverable database corruption. While the UI component library and visual layer are mature, the underlying data-access, authorization, and session architecture requires immediate stabilization to be production-ready.

---

## 2. Architecture Snapshot

| Category | Detected Approach | Assessment |
|---|---|---|
| **Frontend structure** | Layer-based hybrid under `src/` (`components/`, `pages/`, `ui/`, `services/`, `store/`, `types/`) | **Needs Refactoring**: Severe layer boundary violations; runtime React Query hooks instantiated directly inside `src/types/*.ts`; monolithic 900+ line components. |
| **Routing** | `react-router-dom` v7.1.3 with client-side `<BrowserRouter>` and `React.lazy()` route-level code-splitting | **Good**: Route-level chunk splitting is implemented cleanly across all main pages. |
| **Server state** | `@tanstack/react-query` v5.64.2 wrapped in generic `useCrud.ts` hook | **Fair**: React Query is utilized for caching, but generic hooks enforce `select('*')` without server-side pagination or query cancellation. |
| **Client state** | Zustand v5.0.3 across 8 stores (`useLoggedUserStore`, `useOrganizationStore`, etc.) with `persist` middleware | **Needs Refactoring**: Fragmented stores with overlapping scope; persisted stores not wiped on logout; dead legacy stores (`useAreaStore`). |
| **Supabase client setup** | Hardcoded URL and anon key in `src/supabaseClient.ts`; dual instances (`supabase` and `supabaseAuthHelper`) | **At Risk**: Project credentials hardcoded without fallback to environment variables; dual clients indicate workarounds for lack of backend admin APIs. |
| **Authentication** | Supabase Auth (`signUp`, `signInWithPassword`) with client `localStorage['logged-user-store']` | **At Risk**: Complete absence of `onAuthStateChange` listener; session drift on expiry or multi-tab logouts; password verification performed via client sign-in tricks. |
| **Authorization / RLS** | Supabase PostgreSQL RLS policies in `20260921_enable_row_level_security.sql` combined with UI `<RBACPage>` | **Critical**: Flawed `public.users` RLS allows self-promotion to `master`; `public.roles` lacks RLS; organizations exposed unauthenticated via `auth.role() = 'anon'`. |
| **Realtime** | Supabase Realtime Channels (`.channel()`, `.subscribe()`) | **Not Found / Not Applicable**: Realtime is not implemented in any component or service. |
| **Testing** | Automated unit, integration, and E2E test suites | **Not Found**: Zero test runner installed (no Vitest, Jest, Playwright); 0% automated test coverage. |
| **Observability** | Native `console.error` and `console.log` statements; toast notifications via `react-toastify` | **Needs Improvement**: Missing root and route-level React Error Boundaries; no structured logging or telemetry integration (e.g., Sentry). |
| **Build and deployment** | Vite v6.0.5 with manual Rollup chunking in `vite.config.ts`; static SPA deployment target | **Fair**: Chunking strategy isolates vendors well, but unused heavyweight dependencies (`ag-grid-community`) and 5.2 MB unreferenced fonts bloat assets. |

---

## 3. Findings Summary

| ID | Severity | Area | File(s) | Issue | Impact | Recommended Action |
|---|---|---|---|---|---|---|
| **SEC-01** | **Critical** | Database / RLS | [20260921_enable_row_level_security.sql](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L125-L131) | Unrestricted `FOR ALL` RLS policy on `public.users` allows users to edit `role_id` and `organization_id` | Privilege escalation: Any user can promote themselves to Super Admin (`master`) or reassign organizations | Restrict user update policy with `WITH CHECK` preventing modification of `role_id`, `organization_id`, and `active` columns |
| **SEC-02** | **Critical** | Security / Auth | [STUOnboardingWizard.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx#L392), [CreateRegularCustomerDrawer.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateRegularCustomerDrawer.tsx#L149), [RegularCustomersPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/RegularCustomersPage.tsx#L230) | Plaintext passwords stored in `public.users.password` and displayed in admin UI | Credential compromise: Unhashed passwords exposed in database tables, network payloads, and UI tables | Drop `password` column from `public.users`; remove password viewing UI; use Supabase Auth admin API |
| **SEC-03** | **Critical** | Security / Secrets | [fetchTTS.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fetchTTS.ts#L92-L107), [.env](file:///Users/vinaykongari/Nav/navitronics-ui/.env#L1) | Paid Sarvam AI secret key exposed in client bundle via `VITE_SARVAM_API_KEY` | Financial & quota abuse: Third-party secret key is public in client JavaScript bundle and sent in HTTP headers | Move Sarvam TTS calls to a protected Supabase Edge Function (`generate-tts`) with service-side secret |
| **SEC-04** | **Critical** | Database / RLS | [20260921_enable_row_level_security.sql](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L68-L72) | RLS policy on `public.organizations` grants unrestricted SELECT access to `anon` role | Data exposure: Unauthenticated actors can enumerate all transit agencies, tenant names, and metadata | Remove `OR auth.role() = 'anon'` from organization SELECT policy; enforce authenticated tenant scoping |
| **SEC-05** | **Critical** | Database / RLS | [20260921_enable_row_level_security.sql](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L44-L52) | `public.roles` table has RLS completely disabled | Unauthorized mutation: Any client can read, alter, or insert system roles and permission definitions | Enable RLS on `public.roles`; grant read-only access to authenticated users, mutations only to `service_role` |
| **ARC-01** | **High** | Architecture / Data | [STUOnboardingWizard.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx#L260-L425) | Multi-entity provisioning (org, regions, depots, users) handled client-side with non-atomic rollback | Data corruption: Network drops or partial failures create orphaned tenants and dangling auth users | Migrate provisioning logic to an atomic PostgreSQL transaction / RPC (`provision_stu_tenant`) |
| **ARC-02** | **High** | Architecture / API | [Roles.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/Roles.tsx#L18-L58), [roleService.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/services/roleService.ts#L8-L26), [axios.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/config/axios.ts#L3-L25) | Split-brain backend: Roles page communicates with legacy Axios REST API while rest of app uses Supabase | Broken feature / Outage: Axios client lacks authentication headers, causing 401s or pointing to stale endpoints | Consolidate role management into Supabase client query hooks, deprecating unused Axios infrastructure |
| **AUT-01** | **High** | Auth Lifecycle | [App.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/App.tsx#L160-L165), [useLoggedUserStore.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/store/useLoggedUserStore.ts#L20-L45), [ProtectedRoute.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/components/ProtectedRoute.tsx#L12-L74) | Complete absence of `onAuthStateChange` listener; state stored only in Zustand `localStorage` | Session desynchronization: Token refresh, remote session revocation, and multi-tab logout are not coordinated | Implement a centralized `AuthProvider` subscribing to `supabase.auth.onAuthStateChange` |
| **TYP-01** | **High** | Type Safety | [tsconfig.app.json](file:///Users/vinaykongari/Nav/navitronics-ui/tsconfig.app.json#L3-L27), [useCrud.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/hooks/useCrud.ts#L18-L20) | TypeScript strict mode disabled (`"strict": false`, `"noImplicitAny": false`); 0 generated Supabase types | Hidden runtime crashes: Type drift between hand-written interfaces and Postgres schemas; unchecked nulls | Enable `strict: true`; integrate `supabase gen types typescript` workflow into build and development |
| **DAT-01** | **High** | Architecture / Layers | [organization.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/organization.ts#L36), [IDepot.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IDepot.ts#L25), [IRoute.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IRoute.ts#L45), [IStop.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IStop.ts#L57), [IRegion.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IRegion.ts#L24), [IUser.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IUser.ts#L46-L54) | Runtime `createCrudHooks` and Supabase client imported and instantiated directly inside `src/types/*.ts` | Architecture violation: Circular dependencies, tight coupling, and inability to tree-shake type files | Extract CRUD hook instances from type definitions into a dedicated `src/api/` or `src/hooks/crud/` directory |
| **TST-01** | **High** | Quality Assurance | [package.json](file:///Users/vinaykongari/Nav/navitronics-ui/package.json#L6-L10) | Zero automated tests (unit, integration, or E2E) across entire application | High regression risk: Critical fleet operations, route coordinates, and LED matrix generation lack test coverage | Install Vitest and React Testing Library; add unit tests for route calculations and integration tests for auth |
| **CMP-01** | **Medium** | Component Architecture | [CreateUserForm2.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateUserForm2.tsx#L1-L1039), [StopsPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/StopsPage.tsx#L1-L937), [RoutesPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/RoutesPage.tsx#L1-L863) | Monolithic "God" components exceeding 900 lines mixing UI layout, audio hardware, storage, and queries | Low maintainability: Difficult to test, debug, or refactor without introducing unexpected regressions | Decompose into focused container/presentational components with extracted custom hooks |
| **DAT-02** | **Medium** | Performance / Data | [useCrud.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/hooks/useCrud.ts#L19-L20), [SelectOrganizationComponent.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/SelectOrganizationComponent.tsx#L44-L48) | Blanket `select('*')` fetching in `useCrud.ts`; stops and routes loaded without server pagination | High memory & latency: Unnecessary columns fetched; client-side memory bloat as stops scale | Implement explicit column selection and cursor/range-based server-side pagination |
| **PER-01** | **Medium** | Bundle Hygiene | [package.json](file:///Users/vinaykongari/Nav/navitronics-ui/package.json#L24-L32), `src/*.ttf` | 5.2 MB of loose TTF fonts unreferenced in `src/`; unused `ag-grid-community`, `npm`, `install` packages | Wasted repository space and bloated node_modules; potential bundle contamination | Delete loose `src/*.ttf` files; uninstall `ag-grid-community`, `ag-grid-react`, `npm`, and `install` |
| **STA-01** | **Medium** | State Management | [useOrganizationStore.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/store/useOrganizationStore.ts), [useRegionStore.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/store/useRegionStore.ts), [useDepotStore.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/store/useDepotStore.tsx), [useAreaStore.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/store/useAreaStore.ts) | 8 disparate Zustand stores with overlapping state; persisted data not cleared on user sign-out | Cross-tenant state pollution: Stale depot/region IDs retained across session transitions | Consolidate into a unified `useTenantStore`; wipe all tenant state on auth logout |
| **OBS-01** | **Medium** | Reliability | [App.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/App.tsx#L163-L170), [main.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/main.tsx#L7-L13) | Missing React Error Boundary at root and route levels | Silent failures: An uncaught rendering exception in any component blanks the entire application viewport | Implement root and route-level `ErrorBoundary` components with fallback UI and error logging |
| **CFG-01** | **Low** | Configuration | [supabaseClient.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/supabaseClient.ts#L3-L4) | Hardcoded Supabase URL and anon key; `.env` variables not referenced | Deployment rigidity: Cannot dynamically switch between local, staging, and production Supabase instances | Read `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY` |
| **TYP-02** | **Low** | Code Cleanliness | [area.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/area.ts), [depot.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/depot.ts), [route.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/route.ts), [user.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/user.ts) | Duplicate and obsolete type declaration files conflicting with `I`-prefixed canonical interfaces | Developer friction: Confusing naming collisions (`Role` vs `IRole`, `Area` vs `IRegion`) | Remove deprecated type files and standardize on generated schema types |

---

## 4. Detailed Findings

### [SEC-01] Critical Row-Level Security Privilege Escalation on `public.users`

- **Severity:** Critical
- **Area:** Database / Row Level Security
- **Affected files:** [20260921_enable_row_level_security.sql](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L125-L131)
- **Evidence:**
  ```sql
  DROP POLICY IF EXISTS "Users can view and edit own profile" ON public.users;
  CREATE POLICY "Users can view and edit own profile"
    ON public.users
    FOR ALL
    USING (id = auth.uid() OR user_id = auth.uid())
    WITH CHECK (id = auth.uid() OR user_id = auth.uid());
  ```
- **Why it matters:** The policy specifies `FOR ALL`, which applies to `SELECT`, `UPDATE`, and `DELETE`. The `WITH CHECK` expression only checks that the row's `id` matches `auth.uid()`. It contains no restrictions on which columns can be modified. Consequently, any authenticated user can submit a direct PostgREST `PATCH` to update their `role_id` to that of `master` (Super Admin) or change their `organization_id` to access other tenants' data. Because `public.is_super_admin()` checks `u.role_id = r.id AND LOWER(r.name) IN ('master', 'super_admin')`, this single update immediately grants the user complete administrative power across all tables.
- **Failure scenario:** A malicious depot dispatcher or regular customer opens DevTools in the browser, inspects `public.roles` to find the UUID of the `master` role, and runs:
  ```js
  await supabase.from('users').update({ role_id: '<master-role-uuid>' }).eq('id', authUserId);
  ```
  Upon refreshing the page, all RLS policies evaluating `public.is_super_admin()` grant full read, write, and delete permissions over all transit authorities.
- **Recommended remediation:** Split the policy into separate `SELECT` and `UPDATE` policies. On `UPDATE`, use a database trigger or explicit RLS `WITH CHECK` to forbid mutations to `role_id`, `organization_id`, and `active` unless performed by a confirmed super admin.
- **Effort:** S
- **Priority:** Immediate

```sql
-- Current problematic pattern (20260921_enable_row_level_security.sql:126-130)
CREATE POLICY "Users can view and edit own profile"
  ON public.users
  FOR ALL
  USING (id = auth.uid() OR user_id = auth.uid())
  WITH CHECK (id = auth.uid() OR user_id = auth.uid());
```

```sql
-- Recommended secure pattern
DROP POLICY IF EXISTS "Users can view and edit own profile" ON public.users;

-- 1. Read own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (id = auth.uid() OR user_id = auth.uid());

-- 2. Restrict updates: only allow editing non-sensitive fields
CREATE POLICY "Users can update own profile safe fields"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid() OR user_id = auth.uid())
  WITH CHECK (
    (id = auth.uid() OR user_id = auth.uid())
    -- Prevent role and organization tampering
    AND role_id = (SELECT role_id FROM public.users WHERE id = auth.uid())
    AND organization_id IS NOT DISTINCT FROM (SELECT organization_id FROM public.users WHERE id = auth.uid())
    AND active = (SELECT active FROM public.users WHERE id = auth.uid())
  );
```

---

### [SEC-02] Plaintext Password Storage and Exposure in Database and UI

- **Severity:** Critical
- **Area:** Security / Authentication / Database
- **Affected files:**
  - [STUOnboardingWizard.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx#L389-L400)
  - [CreateRegularCustomerDrawer.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateRegularCustomerDrawer.tsx#L149-L150)
  - [RegularCustomersPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/RegularCustomersPage.tsx#L227-L232)
  - [PasswordViewerCell.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/PasswordViewerCell.tsx#L1-L25)
  - [types/user.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/user.ts#L18)
- **Evidence:**
  ```tsx
  // STUOnboardingWizard.tsx:389-393
  const { error: userInsertError } = await supabase.from("users").insert({
    email: trimmedAdminEmail,
    user_id: authUserId,
    password: adminPassword, // <-- Storing plaintext password in public table
    organization_id: orgId,
  // ...
  ```
  ```tsx
  // RegularCustomersPage.tsx:227-230
  {/* Password (Super Admin Only) */}
  <PasswordViewerCell password={customer.password} />
  ```
- **Why it matters:** User passwords are stored unhashed directly in `public.users.password` and are queried and displayed via a "reveal password" toggle (`PasswordViewerCell`) in the UI. This violates basic data security standards (OWASP, GDPR, ISO 27001). Any database backup, read-only analytics query, or compromised database access exposes raw credentials. Furthermore, Supabase Auth already hashes passwords securely using bcrypt inside `auth.users`.
- **Failure scenario:** An attacker gains read access to the database or intercepts network traffic, extracting unhashed administrative passwords for all transit directors and depot managers.
- **Recommended remediation:**
  1. Remove `password` from all `insert` and `update` calls in frontend components.
  2. Drop the `password` column from `public.users` via a database migration.
  3. Delete `PasswordViewerCell.tsx` and remove the password column from [RegularCustomersPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/RegularCustomersPage.tsx).
  4. Use Supabase's standard password reset flow (`resetPasswordForEmail`) for credential management.
- **Effort:** S
- **Priority:** Immediate

```tsx
// Current problematic pattern (STUOnboardingWizard.tsx:389-393)
await supabase.from("users").insert({
  email: trimmedAdminEmail,
  user_id: authUserId,
  password: adminPassword,
  organization_id: orgId,
});
```

```tsx
// Recommended pattern: rely strictly on Supabase Auth
await supabase.from("users").insert({
  email: trimmedAdminEmail,
  user_id: authUserId,
  organization_id: orgId,
  role_id: orgAdminRoleId,
  customer_type: "stu",
  active: true,
  deleted: false,
});
```

---

### [SEC-03] Third-Party Paid API Secret Exposed in Client Bundle and HTTP Headers

- **Severity:** Critical
- **Area:** Security / Secrets Management
- **Affected files:**
  - [fetchTTS.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fetchTTS.ts#L92-L107)
  - [.env](file:///Users/vinaykongari/Nav/navitronics-ui/.env#L1)
- **Evidence:**
  ```ts
  // fetchTTS.ts:92-107
  const sarvamKey = import.meta.env.VITE_SARVAM_API_KEY || "";
  // ...
  const response = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": sarvamKey,
    },
  // ...
  ```
  ```env
  // .env:1
  VITE_SARVAM_API_KEY=sk_ub6tmck1_GssLt4xToCdAjQGEgh3BJQKk
  ```
- **Why it matters:** Environment variables prefixed with `VITE_` are inlined into the client JavaScript bundle during build. Anyone opening DevTools or viewing the production bundle can extract the raw paid API secret (`sk_ub6tmck1_...`). In addition, the secret is transmitted in the `api-subscription-key` header on every client request to `api.sarvam.ai`, exposing it in browser network logs and proxies.
- **Failure scenario:** An external actor inspects the network tab while generating audio announcements, extracts the active `api-subscription-key`, and uses it to run unauthorized, expensive speech synthesis workloads, draining account credits.
- **Recommended remediation:**
  1. Revoke and rotate the current Sarvam API key in the Sarvam dashboard immediately.
  2. Remove `VITE_SARVAM_API_KEY` from `.env` and `.env.example`.
  3. Create a Supabase Edge Function `generate-tts` that securely stores `SARVAM_API_KEY` as an encrypted Supabase Secret.
  4. Have the frontend call `supabase.functions.invoke('generate-tts', { body: ... })` with standard user JWT authorization.
- **Effort:** M
- **Priority:** Immediate

```ts
// Current problematic pattern (client-side API key usage)
const response = await fetch("https://api.sarvam.ai/text-to-speech", {
  headers: { "api-subscription-key": import.meta.env.VITE_SARVAM_API_KEY },
  body: JSON.stringify({ inputs: [text], target_language_code: lang }),
});
```

```ts
// Recommended pattern: proxy through authenticated Supabase Edge Function
const { data, error } = await supabase.functions.invoke("generate-tts", {
  body: { text: normalizedText, language: normalizedLang, speaker: normalizedSpeaker },
});
if (error) throw error;
return data.audioContent;
```

---

### [SEC-04] Unauthenticated Public Enumeration of Organizations via RLS

- **Severity:** Critical
- **Area:** Database / Row Level Security
- **Affected files:** [20260921_enable_row_level_security.sql](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L65-L73)
- **Evidence:**
  ```sql
  DROP POLICY IF EXISTS "Users can view assigned organization" ON public.organizations;
  CREATE POLICY "Users can view assigned organization"
    ON public.organizations
    FOR SELECT
    USING (
      id = public.current_user_org_id()
      OR auth.role() = 'anon' -- needed for initial tenant discovery before session hydration
    );
  ```
- **Why it matters:** Because `auth.role() = 'anon'` is explicitly allowed, any unauthenticated client with the public anon key can run `supabase.from('organizations').select('*')` and dump all tenant records, including agency names, addresses, primary contact details, and internal configurations. The rationale cited in the comment ("needed for initial tenant discovery before session hydration") is an architectural anti-pattern; session hydration should occur prior to querying tenant-specific data.
- **Failure scenario:** Competitors or unauthorized actors scrape the entire customer registry and organizational hierarchy of all STUs and private operators using a single unauthenticated curl command:
  ```bash
  curl 'https://supabase.navitronix.in/rest/v1/organizations?select=*' -H "apikey: <anon_key>"
  ```
- **Recommended remediation:** Eliminate `OR auth.role() = 'anon'` from the policy. Only authenticated users with a matching `organization_id` or verified `is_super_admin()` status should be permitted to read organization rows.
- **Effort:** S
- **Priority:** Immediate

```sql
-- Corrected organizations SELECT policy
DROP POLICY IF EXISTS "Users can view assigned organization" ON public.organizations;
CREATE POLICY "Users can view assigned organization"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    id = public.current_user_org_id()
    OR public.is_super_admin()
  );
```

---

### [SEC-05] Missing Row Level Security on `public.roles`

- **Severity:** Critical
- **Area:** Database / Row Level Security
- **Affected files:** [20260921_enable_row_level_security.sql](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L44-L52)
- **Evidence:**
  ```sql
  -- Migration lines 44-51:
  ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.depots ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.stop_audios ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.font_settings ENABLE ROW LEVEL SECURITY;
  -- Note: public.roles is completely omitted!
  ```
- **Why it matters:** Postgres defaults to unrestricted public access when RLS is not enabled on a table. Because `public.roles` lacks `ENABLE ROW LEVEL SECURITY`, any client using the anonymous or authenticated key can perform `INSERT`, `UPDATE`, or `DELETE` on the `roles` table. An attacker can modify existing role names (breaking RBAC checks) or inject new administrative roles.
- **Failure scenario:** An attacker alters the `master` role row or inserts a custom role that collides with authorization logic, bypassing application-wide permission gates.
- **Recommended remediation:** Add `ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;` and define strict policies allowing read-only access for authenticated users, with mutations restricted to super admins or service roles.
- **Effort:** S
- **Priority:** Immediate

```sql
-- Required migration addition
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins manage roles"
  ON public.roles
  FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
```

---

### [ARC-01] Client-Side Multi-Entity Provisioning with Pseudo-Rollbacks

- **Severity:** High
- **Area:** Architecture / Data Integrity
- **Affected files:** [STUOnboardingWizard.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx#L260-L425)
- **Evidence:**
  ```tsx
  // STUOnboardingWizard.tsx:260-422
  // 1. Insert Org -> 2. Insert Regions (loop) -> 3. Insert Depots (loop) -> 4. Role lookup -> 5. Auth signup -> 6. Insert User
  // ...
  } catch (err: any) {
    console.error("STU Provisioning error:", err);
    // Clean up orphaned organization if provisioning failed midway
    if (createdOrgId) {
      try {
        await supabase.from("depots").delete().eq("organization_id", createdOrgId);
        await supabase.from("regions").delete().eq("organization_id", createdOrgId);
        await supabase.from("organizations").delete().eq("id", createdOrgId);
      } catch (cleanupErr) {
        console.warn("Rollback cleanup warning:", cleanupErr);
      }
    }
  }
  ```
- **Why it matters:** The wizard orchestrates 5 distinct database entities and an authentication identity creation from client-side JavaScript across up to 20 sequential HTTP roundtrips. If network connectivity drops midway, the browser tab closes, or foreign-key constraints prevent manual cleanup, the database is left in a corrupted state: orphaned organizations, unlinked regions, or registered auth accounts without corresponding `public.users` records.
- **Failure scenario:** Step 5 (`signUp`) succeeds, but Step 6 (`insert into public.users`) fails due to a schema mismatch. The catch block deletes the organization, but cannot delete the auth user (since clients lack admin auth privileges). The user's email is now permanently locked out from re-registering.
- **Recommended remediation:** Move all tenant entity provisioning into a single atomic PostgreSQL stored procedure (`provision_stu_organization(...)`) or an Edge Function using the Supabase Service Role Key. If any step fails, PostgreSQL automatically rolls back the transaction.
- **Effort:** M
- **Priority:** Next sprint

---

### [ARC-02] Split-Brain Backend & Orphaned REST Integration

- **Severity:** High
- **Area:** Architecture / API Layer
- **Affected files:**
  - [Roles.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/Roles.tsx#L18-L58)
  - [roleService.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/services/roleService.ts#L8-L26)
  - [config/axios.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/config/axios.ts#L3-L25)
- **Evidence:**
  ```ts
  // roleService.ts:8-10
  export const roleService = {
    getAll: async (): Promise<Role[]> => {
      const response = await axiosInstance.get(`${BASE_PATH}/active/getAllRoles`);
      return response.data['data'];
    },
  ```
  ```ts
  // config/axios.ts:14-25
  // Request interceptor to add token to all requests is commented out!
  // axiosInstance.interceptors.request.use(
  //   (config) => {
  //     const token = localStorage.getItem('token');
  ```
- **Why it matters:** The codebase is split between two competing backend paradigms: direct Supabase PostgREST queries across 95% of the application, and a legacy Axios REST client targeting `https://api.navitronix.in/navitranix/api`. In `axios.ts`, the authentication token interceptor is commented out, and token retrieval refers to a legacy `localStorage.getItem('token')` key that is never populated by Supabase Auth. As a result, requests to `/roles` fail with 401 Unauthorized or point to dead infrastructure.
- **Failure scenario:** An administrator navigates to the Roles page (`/home/roles`). The page attempts to call `roleService.getAll()`, fails on an unauthenticated REST endpoint, and leaves the UI in an unrecoverable error state.
- **Recommended remediation:** Deprecate `roleService.ts` and `axiosInstance`. Rewrite role querying using the standard `supabase.from('roles').select(...)` query hook pattern with TanStack Query.
- **Effort:** S
- **Priority:** Immediate

---

### [AUT-01] Missing Centralized Auth Provider and Session Desynchronization

- **Severity:** High
- **Area:** Authentication Lifecycle
- **Affected files:**
  - [App.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/App.tsx#L160-L165)
  - [useLoggedUserStore.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/store/useLoggedUserStore.ts#L20-L45)
  - [ProtectedRoute.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/components/ProtectedRoute.tsx#L12-L74)
  - [UserLoginForm.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/UserLoginForm.tsx#L120-L190)
- **Evidence:**
  - `grep -r "onAuthStateChange" src/` returns 0 occurrences across the entire repository.
  - Auth state is managed via `useLoggedUserStore` with `persist` to `localStorage['logged-user-store']`.
  - [ProtectedRoute.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/components/ProtectedRoute.tsx#L25-L43) runs an ad-hoc `supabase.auth.getSession()` on every mount, followed by a separate query to `public.users`.
- **Why it matters:** Without an `onAuthStateChange` subscription, the frontend does not react to automatic token refreshes, session expiries, password changes, or multi-tab sign-outs. If a user logs out in one tab, other open tabs retain administrative UI states. Furthermore, `useLoggedUserStore.logout()` only clears `sessionStorage`, leaving stale Zustand state in `localStorage` until overwritten.
- **Failure scenario:** A session token expires while an operator is editing a bus route. The client state still indicates `isAuthenticated: true`. When saving the route, PostgREST requests fail silently or reject with RLS violations, causing unsaved work to be lost without prompting for re-login.
- **Recommended remediation:** Create a dedicated `<AuthProvider>` wrapping `<App />` that listens to `supabase.auth.onAuthStateChange((event, session) => ...)`, synchronizes Zustand/React Query state, and handles token refreshes centrally.
- **Effort:** M
- **Priority:** Next sprint

---

### [TYP-01] Disabled TypeScript Strictness and Type Drift from Database Schema

- **Severity:** High
- **Area:** Type Safety & Developer Experience
- **Affected files:**
  - [tsconfig.app.json](file:///Users/vinaykongari/Nav/navitronics-ui/tsconfig.app.json#L3-L31)
  - [useCrud.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/hooks/useCrud.ts#L18-L20)
  - [types/](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/)
- **Evidence:**
  ```json
  // tsconfig.app.json:3, 27-31
  "noImplicitAny": false,
  "strict": false,
  "noUnusedLocals": false,
  "noUnusedParameters": false,
  "noFallthroughCasesInSwitch": false
  ```
  - Zero generated database types (`database.types.ts` is absent).
  - Heavy reliance on `as any` casts in `useCrud.ts`, `RouteCreationHeader.tsx`, and `StopsPage.tsx`.
- **Why it matters:** With strict mode disabled and no schema-generated types, TypeScript cannot detect nullability bugs, mismatched column names, or missing fields. When database migrations add or alter columns (e.g., `v1_routes`, `v2_routes`, `customer_type`), frontend types drift, resulting in silent runtime bugs.
- **Failure scenario:** A database column is renamed or given a NOT NULL constraint. The build passes without warnings, but user submissions fail in production with unhandled PostgREST constraint violations.
- **Recommended remediation:**
  1. Run `npx supabase gen types typescript --project-id ... > src/types/database.types.ts`.
  2. Type the Supabase client: `createClient<Database>(...)`.
  3. Incrementally enable `"strict": true` and `"noImplicitAny": true` in `tsconfig.app.json`.
- **Effort:** M
- **Priority:** Next sprint

---

### [DAT-01] Runtime Hook Instantiation and Supabase Queries Embedded in Type Files

- **Severity:** High
- **Area:** Layer Boundaries & Code Architecture
- **Affected files:**
  - [types/organization.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/organization.ts#L36)
  - [types/IDepot.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IDepot.ts#L25)
  - [types/IRoute.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IRoute.ts#L45)
  - [types/IStop.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IStop.ts#L57)
  - [types/IRegion.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IRegion.ts#L24)
  - [types/IUser.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IUser.ts#L46-L54)
  - [types/ITextConfig.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/ITextConfig.ts#L90)
- **Evidence:**
  ```ts
  // types/organization.ts:1, 36
  import { createCrudHooks } from "@/hooks/useCrud";
  // ...
  export const organizationCrud = createCrudHooks<IOrganization, IOrganizationCreate, IOrganizationUpdate>('organizations');
  ```
- **Why it matters:** Files in `src/types/` should strictly contain TypeScript interfaces, type aliases, and enums. Instantiating runtime React Query hooks and importing `supabaseClient` inside type files creates an inverted dependency structure, complicates unit testing, produces circular import chains, and breaks module boundaries.
- **Failure scenario:** Importing a pure data type into a test file or utility function inadvertently pulls in the entire React Query runtime and initialized Supabase network client.
- **Recommended remediation:** Relocate all `createCrudHooks` calls to a dedicated `src/api/` or `src/hooks/crud/` directory (e.g., `src/api/organizations.ts`), keeping `src/types/` purely for TypeScript type declarations.
- **Effort:** S
- **Priority:** Immediate

---

### [TST-01] Complete Absence of Automated Testing Framework

- **Severity:** High
- **Area:** Quality Assurance & Reliability
- **Affected files:** [package.json](file:///Users/vinaykongari/Nav/navitronics-ui/package.json#L6-L10)
- **Evidence:**
  - No test scripts in `package.json` (`"scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" }`).
  - No test runners or testing utilities installed (`vitest`, `jest`, `@testing-library/react`).
  - 0 test files (`*.test.ts`, `*.spec.tsx`) exist in the repository.
- **Why it matters:** `navitronics-ui` implements high-stakes domain logic: LED dot-matrix coordinate rendering, multilingual transliteration, binary export parsing, and multi-tier tenant isolation. Without automated regression tests, any refactoring or bug fix carries a high risk of breaking core route planning and fleet programming capabilities undetected.
- **Failure scenario:** An engineer modifies `CanvasText.tsx` or `fileSystemExport.ts` to support a new signboard resolution. The modification inadvertently breaks binary export packaging for legacy LED controller hardware, causing buses in production to display scrambled destination text.
- **Recommended remediation:** Install Vitest and React Testing Library. Add CI verification running unit tests on core utilities (`dateUtils`, `fetchTTS`, `routeConfigV2`) and component integration tests for authentication and role guardrails.
- **Effort:** M
- **Priority:** Planned

---

## 5. Quick Wins

Checklist of high-impact improvements that can be completed in under 30 minutes each:

- [ ] **Purge 5.2 MB of loose fonts from `src/`:** Delete `src/en.ttf`, `src/english.ttf`, `src/gautami.ttf`, `src/hi.ttf`, `src/mangal.ttf`, `src/notosans.ttf`, `src/notosanstelugu.ttf`, `src/pixeloperator.ttf`, `src/pixeloperator8.ttf`, and `src/te.ttf` (none are imported in the codebase).
- [ ] **Remove unused and duplicate dependencies:** Run `pnpm remove ag-grid-community ag-grid-react npm install` to eliminate dead bundle bloat and invalid CLI packages from `dependencies`.
- [ ] **Enable RLS on `public.roles`:** Execute `ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;` and add read policy for authenticated users.
- [ ] **Close public enumeration on `public.organizations`:** Remove `OR auth.role() = 'anon'` from the organization SELECT policy in Supabase.
- [ ] **Hardcode credential cleanup:** Update [supabaseClient.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/supabaseClient.ts#L3-L4) to read `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`.
- [ ] **Delete dead stores and types:** Remove [useAreaStore.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/store/useAreaStore.ts) and [area.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/area.ts).
- [ ] **Add Root Error Boundary:** Wrap `<App />` with a standard React `ErrorBoundary` in [main.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/main.tsx) to prevent full-screen whiteouts on uncaught component errors.

---

## 6. Recommended Target Architecture

### Practical Directory Structure

```text
src/
  api/                          # Centralized data-access layer (PostgREST queries)
    client.ts                   # Typed Supabase client instance
    organizations.ts            # Organization queries & mutations
    routes.ts                   # Route queries & mutations
    stops.ts                    # Stop & audio queries
    users.ts                    # User management & profile queries
    roles.ts                    # Role queries (replacing roleService.ts)
  components/                   # Shared design system & layout components
    feedback/                   # ErrorBoundary, Toast, Skeleton, EmptyState
    navigation/                 # Sidebar, Header, Breadcrumbs
    rbac/                       # RBACPage, ProtectedRoute, PublicRoute
  features/                     # Domain feature modules (gradual migration)
    auth/                       # Login form, session provider, auth store
    routes/                     # Route canvas stage, route forms, simulation
    signboards/                 # LED matrix renderers, font configs
    stops/                      # Stop table, audio player, TTS generator
    tenants/                    # STU onboarding wizard, regular customer drawers
  hooks/                        # Reusable hooks (useDebounce, useMediaQuery)
  store/                        # Unified client UI state (non-server data)
    useAuthStore.ts             # Active session & user profile
    useTenantStore.ts           # Active organization, region, depot selection
    useSignboardStore.ts        # Canvas zoom, active display mode
  types/                        # Pure TypeScript declarations (NO runtime hooks)
    database.types.ts           # Auto-generated from Supabase CLI
    domain.types.ts             # Application-specific models & DTOs
```

### Architectural Rules & Standards

1. **Supabase Query Boundaries:**
   - No direct `supabase.from(...)` queries inside UI components or `src/types/`.
   - All database reads and mutations must reside in `src/api/` as TanStack Query hooks (`useQuery`, `useMutation`).
   - Standardize query keys using factory patterns: `const orgKeys = { all: ['orgs'] as const, detail: (id: string) => ['orgs', id] as const }`.

2. **Business Logic & Multi-Entity Actions:**
   - Multi-step relational operations (such as STU customer provisioning) must be executed as transactional Postgres stored procedures (`RPC`) or backend Supabase Edge Functions.
   - Client components must not attempt manual database rollbacks in `catch` blocks.

3. **Authentication & Session Rules:**
   - A single `<AuthProvider>` component must wrap the application tree.
   - Listen to `supabase.auth.onAuthStateChange` to synchronize auth tokens and profile data.
   - Upon sign-out, purge all Zustand persisted stores, clear TanStack Query cache via `queryClient.clear()`, and reset browser storage.

4. **Type Generation & Validation:**
   - Generate schema types directly via `supabase gen types typescript`.
   - Use Zod schemas for validating forms and external API/RPC responses.
   - Enable `"strict": true` in `tsconfig.app.json`.

5. **Error & Loading Standards:**
   - Wrap major page routes in a granular `ErrorBoundary` with reload buttons.
   - Standardize table loading states using skeleton placeholders instead of full-screen blocking spinners.

---

## 7. Prioritized Refactoring Roadmap

| Phase | Timeframe | Goal | Work Items | Expected Outcome |
|---|---|---|---|---|
| **Phase 0** | Immediate (Day 1–3) | Security & Vulnerability Remediation | 1. Fix RLS update policy on `public.users` (`SEC-01`).<br>2. Enable RLS on `public.roles` (`SEC-05`).<br>3. Restrict `public.organizations` SELECT policy (`SEC-04`).<br>4. Drop plaintext password persistence in DB and UI (`SEC-02`).<br>5. Rotate Sarvam AI key and isolate to Edge Function (`SEC-03`). | Immediate closing of privilege escalation, secret leak, and credential exposure vectors. |
| **Phase 1** | Next Sprint (Weeks 1–2) | Architecture & Layer Stabilization | 1. Implement atomic `provision_stu_tenant` PostgreSQL function (`ARC-01`).<br>2. Replace dead Axios `roleService` with Supabase query hooks (`ARC-02`).<br>3. Move `createCrudHooks` out of `src/types/` into `src/api/` (`DAT-01`).<br>4. Implement `<AuthProvider>` with `onAuthStateChange` (`AUT-01`).<br>5. Purge dead 5.2 MB TTF fonts and drop unused packages (`PER-01`). | Clean layer boundaries; stable tenant provisioning; zero split-brain API calls; reliable auth lifecycle. |
| **Phase 2** | Near-Term (Weeks 3–4) | Scalability, Types & Developer Experience | 1. Generate Supabase TypeScript types and type the Supabase client (`TYP-01`).<br>2. Enable TypeScript strict mode incrementally.<br>3. Consolidate 8 Zustand stores into `useTenantStore` and `useAuthStore` (`STA-01`).<br>4. Install Vitest and write unit tests for route calculations and LED coordinate generation (`TST-01`).<br>5. Add server-side pagination to `stops` and `routes` (`DAT-02`). | End-to-end type safety; reduced client memory consumption; robust regression safety nets. |
| **Phase 3** | Later (Month 2+) | Maintainability & Observability | 1. Decompose monolithic components (`CreateUserForm2`, `StopsPage`) into presentational sub-components (`CMP-01`).<br>2. Implement route-level Error Boundaries and error logging (`OBS-01`).<br>3. Integrate automated bundle analysis in CI. | Modular UI codebase; resilient error handling; fast build times. |

---

## 8. What Is Working Well

1. **Route-Level Code Splitting:** In [App.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/App.tsx#L21-L43), all 18 primary application pages are lazy-loaded via `React.lazy()` with `<Suspense>` fallbacks, preventing unnecessary script download on initial page entry.
2. **Zero Circular Dependencies:** Static dependency analysis of `src/` reveals no circular module import cycles.
3. **Database Performance Indexing:** Recent migrations ([20260910_performance_and_constraints.sql](file:///Users/vinaykongari/Nav/navitronics-ui/supabase/migrations/20260910_performance_and_constraints.sql)) implement appropriate compound indexes on high-traffic columns (`routes(organization_id, depot_id)`, `stops(depot_id, deleted)`).
4. **Isolated Auth Client Strategy:** The use of `supabaseAuthHelper` with `persistSession: false` in [supabaseClient.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/supabaseClient.ts#L8-L15) prevents administrative sessions from being overwritten during user creation workflows.
5. **Modern Build Tooling:** Vite 6 with custom Rollup vendor chunking (`react-vendor`, `supabase-vendor`, `tanstack-vendor`, `ui-vendor`) ensures efficient chunk caching.

---

## 9. Areas Reviewed With No Material Issue

- **Vite Configuration & Plugins:** `vite.config.ts` uses modern ES module plugins (`@vitejs/plugin-react`, `vite-tsconfig-paths`) with an effective `chunkSizeWarningLimit` and clean path aliases (`@/*`).
- **CSS Architecture:** Tailwind CSS 3.4 is configured cleanly with PostCSS and Autoprefixer. No CSS duplication or specificity fighting observed.
- **Route Definitions:** React Router v7 structure is well-formed with clean route parameters and consistent public/protected branching.
- **Transliteration & Language Utilities:** The Sanscript transliteration and Indian language code normalization utilities in `src/utils/` are pure, deterministic functions with no side effects.

---

## 10. Top 5 Actions Ranked by Urgency and Impact

1. **Patch `public.users` RLS Policy (`SEC-01`):** Restrict self-service updates on `public.users` to prevent instant privilege escalation to Super Admin (`master`).
2. **Eliminate Plaintext Passwords (`SEC-02`):** Drop `password` from `public.users`, remove `PasswordViewerCell`, and cease sending raw passwords in database inserts.
3. **Secure Sarvam AI API Secret (`SEC-03`):** Revoke exposed API key and migrate TTS generation to a serverless Supabase Edge Function.
4. **Enable RLS on `public.roles` & Close Public Org Enumeration (`SEC-04` / `SEC-05`):** Lock down the `roles` table and remove `auth.role() = 'anon'` access to `organizations`.
5. **Move Tenant Provisioning to an Atomic Database RPC (`ARC-01`):** Eliminate multi-entity client loops and fragile JavaScript rollbacks by encapsulating onboarding in a Postgres transaction.

Listed directory navitronics-ui
Listed directory src
Viewed App.tsx:1-216
Listed directory pages
Listed directory v2
Listed directory services
Listed directory hooks
Listed directory components
Listed directory ui
Listed directory components
Listed directory layouts
Listed directory store
Listed directory context
Viewed supabaseClient.ts:1-7
Listed directory types
Listed directory antigravity-ide
Viewed package.json:1-65
Viewed SKILL.md:1-115
Viewed ProtectedRoute.tsx:1-19
Viewed useLoggedUserStore.ts:1-36
Viewed UserLoginForm.tsx:1-232
Viewed useCrud.ts:1-184
Viewed IUser.ts:1-56
Searched for "password"
Viewed CreateUserForm2.tsx:1-150
Viewed CreateUserForm2.tsx:145-250
Viewed CreateUserForm2.tsx:245-360
Viewed CreateUserForm2.tsx:360-450
Viewed UsersPage.tsx:1-154
Viewed UsersTable.tsx:1-127
Viewed OrganizationsPage.tsx:1-122
Viewed CreateOrganizationDrawer.tsx:1-140
Viewed CreateOrganizationDrawer.tsx:140-200
Viewed RegionsPage.tsx:1-153
Viewed CreateRegionForm.tsx:1-167
Viewed TextField.tsx:1-129
Viewed DepotsPage.tsx:1-251
Viewed CreateDepotForm.tsx:1-176
Viewed RoutesPage.tsx:1-150
Viewed RoutesPage.tsx:140-300
Viewed RoutesPage.tsx:300-450
Viewed RoutesPage.tsx:450-580
Viewed IRoute.ts:1-48
Viewed CreateRoutePage.tsx:1-99
Viewed RouteCreationLayout.tsx:1-59
Viewed RouteCreationHeader.tsx:1-208
Viewed RouteSettingsPanel.tsx:1-60
Searched for "RouteSettingsPanel"
Searched for "RouteConfigurationForm"
Viewed RouteConfigurationForm.tsx:1-113
Viewed SimulationSettingsPanel.tsx:1-140
Viewed SimulationSettingsPanel.tsx:140-280
Searched for "audioElementRef"
Viewed StopsPage.tsx:1-160
Viewed StopsPage.tsx:160-300
Viewed StopsPage.tsx:300-450
Viewed StopsPage.tsx:450-561
Viewed CreateStopForm.tsx:1-238
Viewed FontConfigurationPage.tsx:1-116
Viewed FontSettingsDrawerWrapper.tsx:1-120
Viewed LanguageModify.tsx:1-253
Viewed DisplaySettings.tsx:1-140
Viewed Roles.tsx:1-222
Viewed roleService.ts:1-27
Viewed role.ts:1-22
Viewed axios.ts:1-41
Viewed UtilityPage.tsx:1-15
Viewed CCTVPage.tsx:1-15
Viewed Settings.tsx:1-11
Viewed HomePage.tsx:1-68
Viewed DefaultPageLayout.tsx:1-130
Viewed SelectOrganizationComponent.tsx:1-100
Viewed LoggedUser.tsx:1-105
Searched for "pages/Organizations"
Searched for "pages/Routes"
Listed directory api
Viewed apolloClient.ts:1-16
Viewed routeService.ts:1-96
Searched for "routeService"
Viewed bitmapService.ts:1-159
Viewed fetchTTS.ts:1-216
Viewed routeConfigMapper.ts:1-121
Viewed SimulationsPlayerPanel.tsx:1-140
Viewed SimulationsPlayerPanel.tsx:140-300
Viewed SimulationsPlayerPanel.tsx:300-450
Viewed SimulationsPlayerPanel.tsx:450-600
Viewed SimulationPlayerCard.tsx:1-140
Viewed TextPropertiesControls.tsx:1-140
Viewed TextPropertiesControls.tsx:140-300
Viewed CanvasText.tsx:1-140
Viewed CanvasText.tsx:180-250
Viewed CanvasText.tsx:250-314
Viewed DisplayEditor.tsx:1-173
Viewed LedSignBoard.tsx:1-140
Viewed LedSignBoard.tsx:140-200
Viewed LedSignBoard.tsx:200-258
Searched for "create table"
Ran command: `find . -name "*.sql"`
Ran command: `ls -la .env*`

# Deep Page-by-Page Code Audit Report

## Master Audit Table

| ID | Priority | Type | Page | User Operation | Code File | Component / Function | Current Implementation | Bug / Issue / Missing Piece | What Can Go Wrong | Root Cause | Change Needed | Expected Result After Fix | Validation / Test Required |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **AUD-01** | P0 | SECURITY | Route Creation / Edit | Access route creation or edit directly via URL | [App.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/App.tsx#L131-L146) | `App` / `Routes` definition | Routes `/routes/create/:areaId/:depotId` and `/routes/create/:areaId/:depotId/:routeId` are defined outside `<ProtectedRoute>` and without `<RBACPage>`. | Unauthenticated and unauthorized users can access, create, edit, or tamper with depot routes directly. | An unauthenticated external actor can navigate directly to the URL, bypass login, and create/update route configs. | Route definitions placed as siblings to `/login` and `/home` instead of nested inside the protected route tree. | Move route definitions inside `<ProtectedRoute>` under `/home/routes/create/...` with appropriate RBAC wrapper. | Route requires valid authenticated session and authorized role before rendering. | Test direct URL navigation in an incognito window; verify redirect to `/login`. |
| **AUD-02** | P0 | SECURITY | Users | View users list in table | [UsersTable.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/UsersTable.tsx#L57-L76) | `UsersTableRoot` / `Table.Cell` | Displays `user.password` in plaintext in table cell with a copy-to-clipboard button. | Sensitive user passwords stored and rendered in plaintext; exposed on-screen and to anyone viewing the table. | Password compromise; anyone with screen view or DOM inspection access gains plaintext credentials. | Passwords stored as plaintext in custom database table instead of one-way salted hashes in Supabase Auth. | Remove `password` column from custom table; manage passwords exclusively via Supabase Auth Admin / Auth API. | Passwords never returned to frontend or displayed in UI. | Verify network payload and UI DOM contain no `password` fields. |
| **AUD-03** | P0 | SECURITY | Users | Create or reactivate user | [CreateUserForm2.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateUserForm2.tsx#L192-L240) | `CreateUserForm2Root` / `onSubmit` | Inserts `password: data.password` directly into public `users` table upon signup or reactivation. | Plaintext credentials persisted in database application table. | Compromise of database read replica, backups, or client query logs reveals all user passwords. | Architecture stores redundant plaintext credentials in custom relation alongside Supabase Auth. | Remove `password` field from `IUser`, form inputs, and `users` table insertion payload. | Credentials managed solely via Supabase Auth encryption/hashing. | Inspect database table `users` after user creation; confirm no password column exists. |
| **AUD-04** | P0 | SECURITY | Global / GraphQL | Any client GraphQL query | [apolloClient.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/api/apolloClient.ts#L10) | `client` initialization | Hardcoded Hasura Admin Secret `x-hasura-admin-secret: 6Jq3rrh...` in client bundle. | Full administrative database bypass; anyone inspecting bundle can execute arbitrary GraphQL mutations/DDL. | Complete database takeover, data exfiltration, or total data wipeout by malicious actors. | Secret key placed in frontend client config instead of backend environment variable or server proxy. | Revoke the Hasura secret immediately; remove legacy Apollo client from frontend bundle entirely. | All client access governed by Supabase RLS and anon key. | Run bundle analyzer and grep build artifacts for admin secrets. |
| **AUD-05** | P0 | SECURITY | Stops / Route Creation | Generate TTS audio for stop/slogan | [fetchTTS.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fetchTTS.ts#L33) | `fetchTTS` | Hardcoded Sarvam AI subscription key `api-subscription-key: sk_ub6tmck1_...` in client code. | Public exposure of third-party paid API subscription key. | API quota exhaustion, excessive cloud billing, or denial of service by external scrapers. | Third-party secret key embedded directly in frontend utility rather than proxied via Supabase Edge Function. | Move Sarvam TTS calls to a protected Supabase Edge Function that stores the API key in server environment secrets. | API key hidden from browser network tab and bundle. | Inspect browser DevTools network headers when generating audio. |
| **AUD-06** | P0 | BUG | Stops | Load stops page | [StopsPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/StopsPage.tsx#L68) | `useStopsPageData` | Passes `organization_id: selectedOrganization.id` without optional chaining `?.`. | Application crashes with `TypeError: Cannot read properties of null (reading 'id')` on page refresh or before store initialization. | Page fails to mount completely, showing a blank screen or unhandled error boundary crash. | Direct property access on state object that can be `null` initially. | Change to `organization_id: selectedOrganization?.id || ""` and add `skip: !selectedOrganization?.id`. | Page renders loading state until organization store initializes. | Refresh page on `/home/stops` with cleared local storage; verify graceful loading. |
| **AUD-07** | P0 | BUG | Stops / Drawer | Open create stop drawer | [CreateStopForm.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateStopForm.tsx#L48) | `CreateStopFormRoot` | `defaultValues: { organization_id: selectedOrganization.id }` accessed without optional chaining. | Form crashes with TypeError if `selectedOrganization` is null when drawer opens. | User cannot open the stop creation drawer; component unmounts. | Unguarded property access on Zustand store state in form initialization. | Use `selectedOrganization?.id || ""` and validate before submission. | Drawer opens reliably; form disables submit if organization is unset. | Clear organization in store and trigger drawer open; verify no crash. |
| **AUD-08** | P0 | BUG | Route Creation / Layout | Open route creation page | [SimulationsPlayerPanel.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/SimulationsPlayerPanel.tsx#L145) | `SimulationsPlayerPanelRoot` | Query filter accesses `organization_id: selectedOrganization.id` without optional chaining. | Entire route creation layout crashes on mount when loaded directly via deep link or reload. | Route creation/editing tool completely inaccessible on page refresh. | Assumed store state is populated synchronously before child component mounts. | Change to `organization_id: selectedOrganization?.id || ""` and pass `skip: !selectedOrganization?.id`. | Component gracefully waits for organization state to populate. | Open `/routes/create/:areaId/:depotId` in a fresh browser session; verify smooth load. |
| **AUD-09** | P0 | BUG | Roles | Update existing role | [roleService.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/services/roleService.ts#L18) | `roleService.update` | Service signature requires `(data, roleId)`, but [Roles.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/Roles.tsx#L38) calls `updateMutation.mutate(data)` with single argument. | Role update requests are sent to `/roles/updateRole/undefined`, permanently failing with 404/500 errors. | Users cannot update role names or permissions; form shows permanent error toast. | Function signature mismatch between service definition and TanStack Query mutation caller. | Refactor mutation to accept `{ id, data }` and invoke `roleService.update(data, id)` or use Supabase `roleCrud`. | Role updates persist successfully to database. | Edit a role on `/home/roles` and verify network payload contains valid role ID. |
| **AUD-10** | P0 | SECURITY | Users | Load users list when organization unselected | [UsersPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/UsersPage.tsx#L26) | `UsersPage` / `useList` | Filter is `{ organization_id: selectedOrganization?.id, deleted: false }`; [useCrud.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/hooks/useCrud.ts#L25) ignores undefined filter values. | Omitting the filter causes Supabase query to execute without `organization_id` constraint, returning all users across all organizations. | Cross-tenant data leak: admins see users belonging to other transit agencies. | Missing guard condition on `skip` when mandatory tenancy key `organization_id` is missing. | Add `skip: !selectedOrganization?.id` to `useList` query options in `UsersPage.tsx`. | Query only runs when an organization ID is explicitly set. | Switch between organizations and monitor network responses for cross-tenant data. |
| **AUD-11** | P1 | BUG | Users | Render users table with user without role | [UsersTable.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/UsersTable.tsx#L116) | `UsersTableRoot` | `isDisabled={user.role.name === "master"}` accessed without optional chaining `user.role?.name`. | Component throws `TypeError: Cannot read properties of undefined (reading 'name')` if any user record has `role: null`. | Entire table crashes and disappears from screen; page becomes completely unusable. | Inconsistent defensive programming: optional chaining used on line 85 but omitted on line 116. | Change to `isDisabled={user.role?.name === "master"}`. | Table renders gracefully even if role relation is null. | Insert a test user with `role_id: null` in database and reload users page. |
| **AUD-12** | P1 | BUG | Global Navigation | Sidebar footer profile render | [LoggedUser.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/LoggedUser.tsx#L40) | `LoggedUserRoot` | `switch (user.role.name)` accessed without optional chaining. | Global layout crashes if user object in Zustand store has a null or malformed role relation. | App crashes upon successful login or token restoration; user cannot access any page. | Unguarded nested property access on persisted store object. | Change to `switch (user?.role?.name)`. | Fallback string rendered; user can still navigate and logout. | Test with a user profile where `role` is null; verify sidebar stays intact. |
| **AUD-13** | P1 | VALIDATION | Route Creation | Fill Route Information form | [RouteConfigurationForm.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteConfigurationForm.tsx#L48-L104) | `RouteConfigurationFormRoot` | Text fields registered via `{...register("route_number")}`, etc., without validation schema or rules. | Empty, whitespace-only, duplicate, or arbitrarily long text can be submitted for route numbers, source, and destination. | Broken LED sign rendering, controller export crashes, corrupt route numbers on bus hardware displays. | No Zod resolver or react-hook-form rules attached to the route configuration form. | Attach a comprehensive Zod schema enforcing required fields, length limits (e.g., max 10 chars for route number), and regex patterns. | Form rejects invalid or blank route numbers with descriptive error messages. | Attempt saving a route with empty route number and 500-char string; verify blocked. |
| **AUD-14** | P1 | BUG | Routes | Export route to V1/V2 or create Return route | [RoutesPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/RoutesPage.tsx#L177-L305) | `parseFieldValue` / `handleReturn` | Unconditionally calls `JSON.parse(json[fieldKey])`. | If Supabase returns `jsonb` column already parsed as a JavaScript object, `JSON.parse("[object Object]")` throws SyntaxError. | Export package generation fails; Return Route creation crashes. | Assumed database always returns raw JSON strings rather than parsed JSONB objects. | Check `typeof val === "string" ? JSON.parse(val) : val` inside `parseFieldValue`. | Correct object returned regardless of whether Supabase driver returns string or object. | Trigger V1 export and Return Route on both string and JSONB database columns. |
| **AUD-15** | P1 | DATA INTEGRITY | Routes | Export V2 route to V1 format | [routeConfigMapper.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/routeConfigMapper.ts#L96-L101) | `convertV2ToV1` | `languageDisplayConfig[lang][loc] = { ... }` overwrites previous screen configs for that location and language. | If a route has multiple alternating screens (e.g. 2 Front screens in English), all screens except the last are permanently lost. | Bus LED boards only show 1 screen instead of alternating route info and destination. | V1 dictionary keying assumption collided with V2 multi-screen array structure. | Support multi-screen list serialization or merge alternating screens into valid V1 sequence structure. | All configured simulation screens exported without data loss. | Configure 3 Front English screens on a route and export to V1; inspect exported JSON. |
| **AUD-16** | P1 | RACE CONDITION | Stops | Delete stop with audio | [StopsPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/StopsPage.tsx#L258-L268) | `deleteAudioFileAndStopAudioRecordAndStop` | Calls `await deleteStop(stopId); refetchStops();`, but `deleteStop` mutation is synchronous `void`. | `refetchStops()` executes immediately before Supabase update reaches the server; stale un-deleted stop remains on screen. | User thinks delete failed; clicks delete repeatedly or gets confused by ghost records. | React Query mutation `mutate` does not return a promise; calling `await mutate(...)` does not block. | Use `mutateAsync` or place `refetchStops()` inside the `onSuccess` mutation callback. | UI updates only after database mutation confirms deletion. | Delete a stop on 3G network throttle; verify UI updates only after network request completes. |
| **AUD-17** | P1 | SECURITY | LED Simulation | Generate bitmap from text | [bitmapService.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/services/bitmapService.ts#L6) | `BITMAP_API_BASE_URL` | Fallback URL points to unencrypted plain HTTP endpoint `http://13.233.103.63:5288/api/bitmap`. | Modern browsers block mixed content (HTTP requests inside HTTPS origin); bitmap generation fails completely in production. | LED matrix simulation displays blank screens on any HTTPS deployment domain. | Insecure HTTP IP address hardcoded as default API base URL. | Use HTTPS domain with SSL certificate (e.g., `https://api.navitronix.in/api/bitmap`) and configure environment variable. | Bitmap requests succeed without mixed-content browser blocking. | Deploy to HTTPS domain and verify DevTools console has zero mixed-content errors. |
| **AUD-18** | P1 | RBAC | Routes | Switch depot on Routes page | [RoutesPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/RoutesPage.tsx#L464) | `RoutesPage` / Toolbar | Depot select dropdown wrapped in `<RBAC roles={["master", "organization_admin"]}>`. | Region Admin has access to Routes page and manages multiple depots, but cannot switch depots on Routes page. | Region Admin cannot view or manage routes in any depot other than the first auto-selected depot. | `region_admin` role omitted from RBAC allowed roles array for Depot Select on Routes page (unlike Stops page line 343). | Add `ROLES.REGION_ADMIN` to allowed roles for Depot Select in `RoutesPage.tsx`. | Region Admin can switch depots seamlessly on Routes page. | Log in as `region_admin` and verify Depot dropdown is visible and functional on Routes page. |
| **AUD-19** | P1 | DATA INTEGRITY | Route Creation / Simulation | Duplicate a simulation card | [SimulationPlayerCard.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/SimulationPlayerCard.tsx#L88) | `handleDuplicateSimulation` | Performs shallow copy `const newSimulation = { ...simulationToDuplicate }`. | `texts` and nested properties remain shared by reference; editing text in duplicated card mutates the original card. | Changing destination or route number on copy corrupts text on the original simulation screen. | Shallow object spread does not clone nested text configuration objects. | Perform a deep clone using `structuredClone(simulationToDuplicate)` or `JSON.parse(JSON.stringify(...))`. | Duplicate card has completely isolated state. | Duplicate a simulation, change font and text on card 2; verify card 1 remains unchanged. |
| **AUD-20** | P1 | DATA INTEGRITY | Users | Soft delete record via CRUD | [useCrud.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/hooks/useCrud.ts#L147-L165) | `useDelete` / `useDeleteAll` | Updates `{ deleted: true }`, but `useList` (line 20) does not filter `deleted: false` by default. | If any page omits `{ deleted: false }` from `filters`, deleted records resurface; if table lacks `deleted` column, delete crashes. | Soft-deleted records continue appearing in lists or delete operation throws Postgres schema error. | Soft-delete logic hardcoded into mutation without symmetric query filtering or table schema checks. | Parameterize delete mode (soft vs hard) or enforce default `{ deleted: false }` filter in `useList`. | Consistent soft-delete behavior across all entities. | Perform soft delete on entity and reload list without explicit filter; verify record hidden. |
| **AUD-21** | P1 | PERFORMANCE | Stops / Simulation | Play audio preview | [SimulationSettingsPanel.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/SimulationSettingsPanel.tsx#L144-L157) | `handleLoop` | Calls `audioElementRef.current!.play()` without catch block or null checking. | Unhandled Promise rejection: `NotAllowedError: play() failed because the user didn't interact with the document first`. | Console flooded with uncaught exceptions; audio playback silently fails. | Browser autoplay policy blocks programmatic playback before direct user gesture. | Add `.catch(error => toast.info("Click play to hear audio"))` and ensure `audioElementRef.current` exists. | Audio plays smoothly or prompts user cleanly if autoplay is restricted. | Test audio play on Safari and Chrome without prior page interaction. |
| **AUD-22** | P1 | ARCHITECTURE | Users | Reactivate soft-deleted user | [CreateUserForm2.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateUserForm2.tsx#L183-L197) | `onSubmit` | Reactivates user in `users` table, but does not invoke Supabase Auth update. | User record marked active in database, but credentials in Supabase Auth are unchanged. | Reactivated user cannot log in with the new password provided during reactivation. | Client cannot call admin auth endpoints (`supabase.auth.admin.updateUserById`) without service role key. | Implement a secure Supabase Edge Function to update auth credentials and reactivate user profile. | Reactivated user can immediately sign in with new credentials. | Soft-delete a user, reactivate with a new password, and attempt login. |
| **AUD-23** | P1 | SECURITY | Users | Create new user account | [CreateUserForm2.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateUserForm2.tsx#L215) | `onSubmit` | Admin client calls `supabase.auth.signUp(...)` directly. | In default Supabase client setups, `signUp` creates a session and logs the browser in as the new user. | Logged-in admin session is terminated or overwritten by the newly created standard user account. | Client SDK auth `signUp` intended for self-registration, not admin user provisioning. | Move user provisioning to a Supabase Edge Function using `supabaseAdmin.auth.admin.createUser`. | Admin remains logged in; new user receives invite or pre-configured credentials. | Create a user as Super Admin; verify admin remains logged in on `/home/users`. |
| **AUD-24** | P1 | PERFORMANCE | Database Queries | Query routes, stops, depots | Multiple pages / queries | Supabase `.select(*)` | No database indexes declared for foreign keys (`depot_id`, `organization_id`, `region_id`, `deleted`). | Full table scans executed across `routes`, `stops`, `depots` as records scale into thousands. | Sluggish page transitions, query timeouts, and high Supabase compute resource consumption. | Missing index migration scripts on relational foreign keys and filter columns. | Add PostgreSQL indexes: `CREATE INDEX idx_routes_depot_del ON routes(depot_id, deleted);`, etc. | Instant query response times under high data volume. | Run `EXPLAIN ANALYZE` on Supabase queries with 10,000 mock rows. |
| **AUD-25** | P1 | ARCHITECTURE | Entire Application | Backend communication | [services/](file:///Users/vinaykongari/Nav/navitronics-ui/src/services) vs [useCrud.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/hooks/useCrud.ts) | Multiple files | Repository maintains 3 disjointed data access patterns: Axios REST (`/services`), GraphQL (`/api`), and Supabase (`useCrud`). | Spaghetti architecture: some components update Supabase while others call defunct REST APIs or Apollo GraphQL. | Unpredictable behavior, dead code bloat, and confusion over which data source is authoritative. | Incomplete migration from legacy NestJS/Hasura backend to Supabase. | Deprecate and remove `/src/api` and unused Axios services; standardize all data access through typed Supabase service hooks. | Single, consistent, maintainable data access architecture. | Audit all imports across `src/` to confirm zero imports from dead `/api` or `/services`. |
| **AUD-26** | P2 | VALIDATION | Stops | Create or update stop | [CreateStopForm.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateStopForm.tsx#L150-L215) | `CreateStopFormRoot` | Latitude and longitude inputs accept raw text without numeric or geographic range validation. | Users can input non-numeric strings, negative out-of-range degrees, or malicious input for GPS coordinates. | Geofencing and bus stop arrival announcements fail on onboard GPS devices. | Inputs bound directly to react-hook-form string fields with only `{ required: true }`. | Add Zod schema with `z.coerce.number().min(-90).max(90)` for latitude and `(-180, 180)` for longitude. | Only valid geographic coordinates within valid ranges can be submitted. | Enter "invalid_coord" and "999.99" in stop form; verify submit blocked with validation errors. |
| **AUD-27** | P2 | UX | Organizations | View organizations page | [OrganizationsPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/OrganizationsPage.tsx#L32) | `OrganizationsPage` | `isLoading` and `isError` destructured from `useList` but never rendered in JSX. | While fetching or when network fails, screen displays empty list with no loading spinner or error message. | Users think there are no organizations or that the app is frozen. | Missing conditional loading skeleton and error alert states in component layout. | Render `<SkeletonText>` or `<Loader>` when `isLoading` is true, and an `<Alert variant="error">` when `isError` is true. | Visual feedback provided during data loading and network errors. | Simulate slow 3G network and offline mode; verify proper loading/error indicators. |
| **AUD-28** | P2 | DATA INTEGRITY | Organizations | Delete organization | [OrganizationsPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/OrganizationsPage.tsx#L82) | `OptionsDropdown` / `isDisabled` | Protection relies on hardcoded UUID string `org.id === "6b679098-ef69-45f0-9fb1-b457dd882060"`. | If deployed to staging, testing, or fresh production database with different UUID, master org can be deleted. | Accidental deletion of the primary system organization, breaking all multi-tenant lookups. | System entity identity tied to an environment-specific database primary key literal. | Add an `is_system` or `slug: "master"` column to organizations table and check `org.is_system`. | System-level organizations protected regardless of environment or database ID. | Verify delete button remains disabled across staging and production databases. |
| **AUD-29** | P2 | UX | Regions / Depots / Stops | Submit create forms | Multiple form components | Submit buttons | Buttons lack `disabled={isPending}` during mutation execution; forms rely on `isSubmitting`. | Users clicking "Submit" twice rapidly fire duplicate insert queries, creating duplicate records. | Duplicate region, depot, or stop records created in database. | `mutate` callback execution is non-blocking; `isSubmitting` resets before query finishes on server. | Bind `disabled={isCreating || isUpdating}` directly to mutation `isPending` state. | Submit button disables immediately upon first click and shows spinner. | Rapid double-click submit button; verify only single insert request in network tab. |
| **AUD-30** | P2 | DATA INTEGRITY | Database | Insert duplicate entity names | Database tables | Database schema | Missing UNIQUE composite constraints on `(organization_id, name)` for regions, depots, and routes. | Database allows multiple depots with identical names in the same region, or identical route numbers. | Operator confusion; ambiguous bus route selection on driver terminals. | Uniqueness constraints omitted from PostgreSQL table definitions. | Add constraints: `ALTER TABLE depots ADD CONSTRAINT unique_depot_org_name UNIQUE (organization_id, region_id, name);`. | Database strictly rejects duplicate entries with a clear constraint violation code. | Attempt inserting two depots named "Central" under the same region; verify DB rejection. |
| **AUD-31** | P2 | UX | Users / Regions / Depots | Page header subtitles | Multiple pages | `PageHeader` | Subtitle text reads `"Overview of your store's performance and customer engagement"`. | Unprofessional UI presentation; confusing ecommerce template copy in a transit fleet management portal. | Loss of credibility with transit agency clients. | Hardcoded placeholder text from Subframe template copied across multiple pages. | Replace subtitles with contextual transit descriptions (e.g. "Manage depot terminals and operational zones"). | Clear, professional, domain-accurate subtitles displayed on all pages. | Visual inspection of all page headers across the app. |
| **AUD-32** | P2 | PERFORMANCE | Regions | Switch organization | [RegionsPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/RegionsPage.tsx#L43-L45) | `useEffect` | Redundant `useEffect` triggers `refetch()` when `selectedOrganization` changes. | `useList` already keys on `options` which includes `organization_id`; causes two duplicate queries in parallel. | Double HTTP requests fired to Supabase on every organization selection change. | Redundant manual refetch trigger on top of TanStack Query automatic query-key reactivity. | Remove manual `useEffect` and rely entirely on TanStack Query key invalidation. | Single query executed on organization change. | Monitor network tab when switching organizations; verify only 1 request fires. |
| **AUD-33** | P2 | UX | Multiple Pages | Confirm deletion | Multiple pages | `confirm(...)` calls | Uses native blocking browser dialog `window.confirm(...)` for record deletions. | Freezes browser thread; inconsistent look-and-feel; easily auto-blocked by browsers. | Degradation of user experience; inconsistent modal styling. | Shortcut implementation using browser alerts instead of custom UI dialog components. | Replace with `<Dialog>` component (such as existing Subframe Dialog) with Cancel and Confirm buttons. | Smooth, non-blocking, branded confirmation modals across all deletions. | Trigger delete on any entity; verify branded modal appears without freezing window. |
| **AUD-34** | P2 | BUG | Depots | Region auto-selection on mount | [DepotsPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/DepotsPage.tsx#L60) | `DepotsPage` / `useEffect` | Sets `firstRegion = regions ? regions[0] : []`. If regions is empty, sets `[]` into store. | Store state `selectedRegion` gets populated with an empty array instead of `null`. | Type corruption in Zustand store; downstream components expecting `IRegion | null` crash on property access. | Incorrect fallback default in ternary expression. | Change fallback to `null`: `const firstRegion = regions?.length ? regions[0] : null;`. | Store state strictly typed to `IRegion | null`. | Load depots page for an organization with zero regions; inspect Zustand store state. |
| **AUD-35** | P2 | BUG | Users | Render user table row | [UsersTable.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/UsersTable.tsx#L68) | `UsersTableRoot` | Row key uses `<Table.Row key={user.user_id}>` instead of `user.id`. | If `user.user_id` is null or duplicate, React key collision warning occurs and DOM rendering desynchronizes. | Stale row states, incorrect checkbox toggles, or re-ordering visual bugs. | Using secondary auth provider ID instead of primary database record UUID. | Change key to `key={user.id}`. | Unique, stable React key for every table row. | Inspect React DevTools console for duplicate key warnings. |
| **AUD-36** | P2 | BUG | Roles | Render role table row | [Roles.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/Roles.tsx#L115) | `Roles` / `tbody` | Table row key uses `<tr key={role.roleId}>`, but `Role` type only has `id`. | `role.roleId` evaluates to `undefined`; all rows share `key="undefined"`. | React key collisions; table fails to reconcile properly when roles are added, edited, or deleted. | Property name mismatch with TypeScript interface definition. | Change to `<tr key={role.id}>`. | Clean DOM reconciliation with unique keys. | Verify zero React key warnings in browser console. |
| **AUD-37** | P2 | PERFORMANCE | Route Creation / LED Display | Animate LED canvas marquee | [CanvasText.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/components/CanvasText.tsx#L123-L228) | `LEDMatrix` / `drawMatrix` | Loops over all 6,144 matrix dots every frame and invokes `ctx.arc()` and `ctx.fill()`. | Massive CPU usage and frame drops on lower-spec hardware when multiple LED signs animate simultaneously. | Mobile devices and embedded display tablets overheat, lag, or drop below 15 FPS. | Drawing thousands of vector circle paths on canvas every tick instead of using an offscreen bitmap buffer. | Draw dots to an offscreen canvas once and copy the buffer via `ctx.drawImage()`, or use CSS transforms. | Smooth 60 FPS animation with minimal CPU/GPU overhead. | Profile performance in Chrome DevTools Performance tab during marquee scroll. |
| **AUD-38** | P2 | UX | Route Creation / Editor | Mount route editor in view mode | [LedSignBoard.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/components/LedSignBoard.tsx#L229-L231) | `LEDBitmapSimulator` | Initial bitmap fetch calls `onBitmapTextChange` on mount, triggering `setValue` in react-hook-form. | Form marked dirty (`formState.isDirty = true`) immediately upon loading without user input. | User opens a route just to view it, clicks Back, and is prompted "You have unsaved changes". | Side effect in child presentation component directly mutates parent form state during mount. | Pass `{ shouldDirty: false }` to `setValue` when syncing initial bitmap values. | Form remains pristine until user explicitly edits a field. | Open an existing route, click Back immediately; verify no unsaved changes warning. |
| **AUD-39** | P2 | BUG | Route Creation / Text Settings | No simulation selected | [TextPropertiesControls.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/TextPropertiesControls.tsx#L58) | `TextPropertiesControlsRoot` | `pathBase` constructed using `${selectedTab}.${selectedSimulationIndex}...` when index can be `-1`. | Evaluates to `front.-1.texts.text`; react-hook-form sets keys with string `"-1"`, corrupting form data. | Route payload corrupted with invalid array key `"-1"`; saving fails on server. | Missing guard condition checking if a simulation is actually selected before resolving path. | Add early return `if (selectedSimulationIndex < 0) return null;` at top of component. | Component safely unmounts or shows placeholder when no simulation is selected. | Delete all simulations in a tab; verify Text Properties panel gracefully handles empty selection. |
| **AUD-40** | P2 | ARCHITECTURE | Production Bundle | Production build | [App.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/App.tsx#L210) | `App` | `<ReactQueryDevtools initialIsOpen={false} />` included in production bundle unconditionally. | Unnecessary bundle weight and devtools exposed to end users in production environment. | Slower initial bundle download; internal query cache inspectable by end users. | Missing environment check wrapper around devtools component. | Render `{process.env.NODE_ENV === "development" && <ReactQueryDevtools />}`. | Devtools excluded from production build artifacts. | Run `pnpm build` and verify devtools chunk is excluded from production output. |
| **AUD-41** | P3 | UX | Stops | Generate stop audio | [StopsPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/StopsPage.tsx#L270) | `StopsPage` | Single global boolean state `const [generatingAudio, setGeneratingAudio] = useState(false)`. | Clicking "Generate Audio" for one stop causes buttons for ALL stops on the page to say "Generating...". | Confusing user experience; inability to tell which specific stop audio is being generated. | Page-level boolean used instead of tracking the active `stopId` currently generating. | Track `generatingStopId: string | null` instead of a plain boolean. | Only the specific stop card being processed displays the loading indicator. | Click generate on Stop A; verify Stop B's button remains unaffected. |
| **AUD-42** | P3 | ARCHITECTURE | Navigation | Sidebar / Stubs | [UtilityPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/UtilityPage.tsx), [Settings.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/Settings.tsx) | Page roots | Pages contain empty headings/paragraphs with zero functionality; `CCTVPage.tsx` orphaned. | Misleading navigation routes; dead ends in user workflows. | User confusion and unfinished product feel. | Stub pages created during initial scaffolding and never implemented. | Implement functional settings/utility workflows or remove the routes and files until ready. | Every accessible route contains fully functional user workflows. | Audit all sidebar links; verify every link lands on an active, functional page. |

---

## Page Summary

| Page | Total Issues | P0 | P1 | P2 | P3 | CRUD Issues | Validation Issues | Performance Issues | Architecture Issues |
|---|---|---|---|---|---|---|---|---|---|
| **Login (`/login`)** | 2 | 1 | 1 | 0 | 0 | 1 | 1 | 0 | 1 |
| **Home Layout (`/home`)** | 3 | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 2 |
| **Organizations (`/home/organizations`)** | 4 | 0 | 0 | 3 | 1 | 2 | 1 | 1 | 1 |
| **Regions (`/home/regions`)** | 5 | 0 | 0 | 4 | 1 | 2 | 2 | 1 | 1 |
| **Depots (`/home/depots`)** | 4 | 0 | 0 | 3 | 1 | 2 | 1 | 0 | 1 |
| **Users (`/home/users`)** | 8 | 4 | 2 | 2 | 0 | 3 | 2 | 0 | 3 |
| **Routes (`/home/routes`)** | 6 | 0 | 3 | 3 | 0 | 3 | 1 | 1 | 2 |
| **Route Create / Edit (`/routes/create/...`)** | 9 | 2 | 4 | 3 | 0 | 4 | 3 | 2 | 2 |
| **Stops (`/home/stops`)** | 7 | 2 | 2 | 2 | 1 | 3 | 2 | 1 | 1 |
| **Font Configuration (`/home/font-configuration`)** | 3 | 0 | 1 | 1 | 1 | 2 | 1 | 0 | 1 |
| **Roles (`/home/roles`)** | 4 | 1 | 1 | 2 | 0 | 3 | 1 | 0 | 2 |
| **Fonts Legacy (`/home/fonts`)** | 3 | 0 | 1 | 1 | 1 | 2 | 1 | 0 | 2 |
| **Utility & Settings (`/home/utility`, `/home/settings`)** | 2 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 2 |

---

## CRUD Coverage Table

| Entity | Create | Read | Update | Delete | Search | Filter | Sort | Pagination | Validation | RLS | Database Constraints | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Organization** | PARTIAL | PASS | PARTIAL | PARTIAL | MISSING | MISSING | PASS | MISSING | PARTIAL | RISK | FAIL | **PARTIAL** |
| **Region** | PARTIAL | PASS | PARTIAL | PARTIAL | MISSING | PASS | PASS | MISSING | PARTIAL | RISK | FAIL | **PARTIAL** |
| **Depot** | PARTIAL | PASS | PARTIAL | PARTIAL | MISSING | PASS | PASS | MISSING | FAIL | RISK | FAIL | **PARTIAL** |
| **User** | FAIL | PASS | PARTIAL | PARTIAL | MISSING | PARTIAL | FAIL | MISSING | FAIL | RISK | FAIL | **FAIL** |
| **Route** | PASS | PASS | PASS | PASS | MISSING | PASS | PASS | MISSING | FAIL | RISK | FAIL | **PARTIAL** |
| **Stop** | PARTIAL | PASS | PARTIAL | PARTIAL | PASS | PASS | PASS | PASS | FAIL | RISK | FAIL | **PARTIAL** |
| **Stop Audio** | PASS | PASS | MISSING | PARTIAL | MISSING | PASS | FAIL | MISSING | FAIL | RISK | FAIL | **PARTIAL** |
| **Font Setting** | PARTIAL | PASS | PARTIAL | PARTIAL | MISSING | MISSING | FAIL | MISSING | FAIL | RISK | FAIL | **PARTIAL** |
| **Role** | FAIL | PASS | FAIL | FAIL | MISSING | MISSING | FAIL | MISSING | FAIL | RISK | FAIL | **FAIL** |

---

## Service Map

| Service | Used By Pages | Supabase Tables | Operations | Problems | Recommended Change |
|---|---|---|---|---|---|
| **`useCrud.ts` (generic)** | Organizations, Regions, Depots, Users, Routes, Stops, FontConfig | `organizations`, `regions`, `depots`, `users`, `routes`, `stops`, `font_settings` | `select`, `insert`, `update`, soft delete (`deleted: true`) | Soft delete assumes `deleted` column exists; `useList` fails to filter out `deleted: false` by default; no optimistic locking. | Add automatic `{ deleted: false }` query filter; handle tables without soft delete; return typed errors. |
| **`routeService.ts`** | Legacy `Routes.tsx`, `EntryPage.tsx` | None (Calls legacy Axios controller `/routes`) | `getAll`, `create`, `update`, `delete`, `bulk-delete`, `export` | Dead code in v2 application; unauthenticated calls via commented Axios interceptor. | Remove file; migrate remaining binary export logic to a dedicated Supabase client utility. |
| **`roleService.ts`** | `Roles.tsx` | None (Calls legacy Axios controller `/roles`) | `getAllRoles`, `create`, `updateRole`, `delete` | Update signature mismatch (`roleId` undefined); duplicates Supabase `roleCrud` in `IUser.ts`. | Consolidate onto Supabase `roleCrud`; eliminate external Axios role service. |
| **`bitmapService.ts`** | `DisplayEditor.tsx`, `LedSignBoard.tsx` | None (Calls HTTP bitmap API) | `GET /api/bitmap` | Insecure HTTP IP fallback blocked by browser mixed-content security policies; unmemoized query builder. | Configure HTTPS domain via `VITE_BITMAP_API_URL`; add client-side LRU response cache. |
| **`fetchTTS.ts`** | `StopsPage.tsx`, `SimulationSettingsPanel.tsx` | `stop_audios`, Storage buckets `audios`, `stops` | Sarvam TTS API, Supabase Storage upload, `stop_audios` insert/delete | Secret API key exposed in client; unhandled storage error parsing; `uploadAudio` vs `uploadAudioEnchanced` duplication. | Move Sarvam API integration to Supabase Edge Function; unify storage upload helpers. |
| **`apolloClient.ts`** | Legacy `/api/*` files | None (Hasura GraphQL) | GraphQL queries/mutations | Hardcoded Hasura admin secret in client bundle; dead code in v2 architecture. | Revoke Hasura secret immediately; delete Apollo Client and `/src/api` directory entirely. |

---

## Data Flow Table

| Page | User Action | Component | Hook | Service | Supabase Query | Table | State Update | UI Update | Problems |
|---|---|---|---|---|---|---|---|---|---|
| **Login** | Click "Sign In" | `UserLoginForm` | `useList` (loggedUserCrud) | `supabaseClient` | `auth.signInWithPassword`, then `from('users').select(...).eq('user_id', id).single()` | `users` | `login(userData)` in `useLoggedUserStore` | Redirects to `/home` | Two sequential network requests; unhandled account deactivation errors in store. |
| **Users** | Submit User Form | `CreateUserForm2` | `useCreate` / `useUpdate` | `userCrud`, `supabaseClient` | `auth.signUp`, then `from('users').insert({ ..., password })` | `users` | React Query invalidates `['users']` | Drawer closes; table refetches | Plaintext password saved to DB; admin session can be overridden by `signUp`. |
| **Users** | Delete User | `UsersPage` | `useDelete` | `userCrud` | `from('users').update({ deleted: true }).eq('id', id)` | `users` | React Query invalidates `['users']` | Refetches users list | Soft-deleted user still queried if `deleted: false` omitted; browser confirm used. |
| **Routes** | Duplicate Route | `RoutesPage` | `useCreate` | `routeCrud`, `supabaseClient` | `from('routes').select('*').eq('id', id)`, then `from('routes').insert(...)` | `routes` | React Query invalidates `['routes']` | Refetches routes list | Does not check for duplicate route number collisions; sequential read-then-write race condition. |
| **Routes** | Create Return Route | `RoutesPage` | `useCreate` | `routeCrud`, `supabaseClient` | `from('routes').select('*').eq('id', id)`, then reverse stops and insert | `routes` | React Query invalidates `['routes']` | Refetches routes list | Unhandled JSON parsing errors if stops is already an object. |
| **Route Create** | Save / Update Route | `RouteCreationHeader` | `useCreate` / `useUpdate` | `routeCrud` | `from('routes').insert(payload)` or `from('routes').update(payload).eq('id', id)` | `routes` | Zustand `hasBeenSaved` set to `true` | Navigates back via `navigate(-1)` | Zero field validation; complex nested JSON sent unvalidated; potential `[object Object]` stringification error. |
| **Stops** | Delete Stop with Audio | `StopsPage` | `useDelete` | `stopCrud`, `supabaseClient` | Storage remove, then `from('stop_audios').delete()`, then `update({ deleted: true })` | `stops`, `stop_audios`, Storage | Refetches stops via `refetchStops()` | Removes card from grid | Synchronous `await deleteStop` fires `refetchStops` before DB update completes. |
| **Stops** | Generate Audio | `StopsPage` | `handleStopAudioGeneration` | `fetchTTS`, `supabaseClient` | Sarvam API, Storage upload, `from('stop_audios').insert(...)` | `stop_audios`, Storage | `refetchStops()` | Updates card audio preview | Global `generatingAudio` boolean puts all buttons into loading state simultaneously. |
| **Regions** | Create Region | `CreateRegionForm` | `useCreate` | `regionCrud` | `from('regions').insert({ name, organization_id })` | `regions` | React Query invalidates `['regions']` | Dialog closes; grid refetches | Double click inserts duplicate regions; no uniqueness validation. |
| **Organizations** | Update Org Status | `CreateOrganizationDrawer` | `useUpdate` | `organizationCrud` | `from('organizations').update(payload).eq('id', id)` | `organizations` | React Query invalidates `['organizations']` | Drawer closes; cards refetch | `isUpdating` state not bound to submit button disabled state. |

---

## Top 10 Issues To Fix First

### 1. Hardcoded Hasura Admin Secret in Client Bundle
- **Page**: Global / API Setup
- **File**: [apolloClient.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/api/apolloClient.ts#L10)
- **Why It Matters**: Complete catastrophic security breach. The Hasura admin secret bypasses all row-level security and authentication rules, granting full superadmin database read/write/drop permissions to anyone inspecting the frontend source code.
- **Recommended Fix**: Revoke the compromised secret immediately in the Hasura dashboard. Remove `apolloClient.ts` and the `/src/api` folder entirely, as the app has transitioned to Supabase.
- **Expected Result**: Admin credentials eliminated from client bundles; all database access mediated via authenticated Supabase RLS.

### 2. Plaintext User Passwords Stored in Database & Displayed in UI
- **Page**: Users Page (`/home/users`)
- **File**: [UsersTable.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/UsersTable.tsx#L57-L76), [CreateUserForm2.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateUserForm2.tsx#L192-L240), [IUser.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/types/IUser.ts#L11)
- **Why It Matters**: Severe credential vulnerability violating basic data protection standards. Plaintext passwords displayed on screen with copy buttons and stored in application tables expose user credentials to screen recording, shoulder surfing, and database leaks.
- **Recommended Fix**: Drop the `password` column from the public `users` table. Remove password display cells from `UsersTable.tsx`. Manage user authentication credentials strictly within Supabase Auth (`auth.users`), and generate secure one-time reset links instead of displaying passwords.
- **Expected Result**: Passwords are never stored in plaintext, never transmitted in user profile queries, and never visible in the browser DOM.

### 3. Route Creation & Edit Pages Completely Unprotected
- **Page**: Route Create & Edit (`/routes/create/:areaId/:depotId`)
- **File**: [App.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/App.tsx#L131-L146)
- **Why It Matters**: Bypasses authentication and authorization entirely. Anyone with the URL can create, edit, or delete transit routes and inspect operational depot IDs without logging in.
- **Recommended Fix**: Move both `/routes/create/...` route declarations inside the `<ProtectedRoute>` wrapper, nested under the authenticated `/home` tree, and wrap with `<RBACPage roles={[ROLES.MASTER, ROLES.ORGANIZATION_ADMIN, ROLES.REGION_ADMIN, ROLES.DEPOT_ADMIN]}>`.
- **Expected Result**: Unauthenticated requests are immediately redirected to `/login`; unauthorized roles are blocked.

### 4. Hardcoded Sarvam AI Subscription Key
- **Page**: Stops (`/home/stops`) & Route Creation
- **File**: [fetchTTS.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/utils/fetchTTS.ts#L33), [SimulationsPlayerPanel.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/SimulationsPlayerPanel.tsx#L286)
- **Why It Matters**: The private third-party subscription key is exposed in client-side code. Malicious actors can extract the key from DevTools and exhaust API quotas or incur massive billing on the user's account.
- **Recommended Fix**: Deploy a Supabase Edge Function (`/functions/v1/tts`) that holds the Sarvam API key in server-side environment secrets. Update frontend helpers to invoke the Edge Function.
- **Expected Result**: Zero private API keys exposed to browser network tabs or compiled JavaScript bundles.

### 5. Multi-Tenant User Data Leak When Organization Unselected
- **Page**: Users Page (`/home/users`)
- **File**: [UsersPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/UsersPage.tsx#L26), [useCrud.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/hooks/useCrud.ts#L25)
- **Why It Matters**: When `selectedOrganization` is undefined or loading, `useCrud` drops the filter and requests `from('users').select('*')`, returning user records across all transit organizations.
- **Recommended Fix**: Pass `skip: !selectedOrganization?.id` to `useList` in `UsersPage.tsx`, and ensure the query never executes without an explicit organization filter. Enforce tenant isolation via PostgreSQL RLS policies.
- **Expected Result**: Tenancy boundary strictly enforced; users from other agencies are never retrieved.

### 6. Application Crash on Stops & Route Creation Due to Unguarded Property Access
- **Page**: Stops (`/home/stops`) & Route Creation
- **File**: [StopsPage.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/pages/v2/StopsPage.tsx#L68), [CreateStopForm.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/CreateStopForm.tsx#L48), [SimulationsPlayerPanel.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/SimulationsPlayerPanel.tsx#L145)
- **Why It Matters**: Accessing `selectedOrganization.id` directly crashes the entire React component tree with a fatal TypeError whenever a user refreshes the page or navigates before the store initializes.
- **Recommended Fix**: Replace all instances with `selectedOrganization?.id || ""` and add `skip: !selectedOrganization?.id` to all dependent query hooks.
- **Expected Result**: Smooth, crash-free page reloads and deep links across the entire application.

### 7. Unhandled TypeError Crashes in UsersTable and Global Sidebar
- **Page**: Users Page (`/home/users`) & Global Sidebar Layout
- **File**: [UsersTable.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/UsersTable.tsx#L116), [LoggedUser.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/LoggedUser.tsx#L40)
- **Why It Matters**: Accessing `user.role.name` without optional chaining throws an unhandled TypeError when any user has an unassigned or deleted role, crashing the entire users table or the global application sidebar.
- **Recommended Fix**: Change to optional chaining: `user?.role?.name === "master"` and `switch (user?.role?.name)`.
- **Expected Result**: Robust UI rendering that handles null or pending relational data without crashing.

### 8. Total Absence of Input Validation on Route Configuration
- **Page**: Route Creation / Edit
- **File**: [RouteConfigurationForm.tsx](file:///Users/vinaykongari/Nav/navitronics-ui/src/ui/components/RouteConfigurationForm.tsx#L48-L104)
- **Why It Matters**: Route number, source, destination, and via fields accept completely empty, whitespace, or arbitrarily long input. Corrupt routes get propagated to physical bus LED signs and onboard hardware.
- **Recommended Fix**: Integrate Zod schema validation via `@hookform/resolvers/zod` into `RouteCreatePage`. Require route numbers, limit string lengths to hardware specifications, and sanitize inputs.
- **Expected Result**: Clear field-level error messages displayed to operators; invalid data rejected before database insertion.

### 9. Broken Soft Delete Logic and Incomplete Data Filtering
- **Page**: Global CRUD Hook
- **File**: [useCrud.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/hooks/useCrud.ts#L18-L20, L147)
- **Why It Matters**: `useDelete` updates `{ deleted: true }`, but `useList` does not automatically filter `{ deleted: false }`. Any page omitting manual filters displays deleted records. If a table lacks a `deleted` column, the mutation fails.
- **Recommended Fix**: Update `useList` to automatically include `.eq('deleted', false)` unless an explicit option `{ includeDeleted: true }` is passed. Verify table schema before soft-deleting.
- **Expected Result**: Uniform, dependable soft deletion across all entities without ghost records appearing in lists.

### 10. Mixed Content HTTP Insecure Bitmap API Endpoint Blocked in Production
- **Page**: Route Creation / LED Display Simulator
- **File**: [bitmapService.ts](file:///Users/vinaykongari/Nav/navitronics-ui/src/services/bitmapService.ts#L6)
- **Why It Matters**: The fallback URL `http://13.233.103.63:5288/api/bitmap` uses unencrypted HTTP. In any HTTPS deployment, browsers block mixed content, completely disabling LED signboard simulation and bitmap generation.
- **Recommended Fix**: Secure the bitmap generation API behind an HTTPS domain (e.g. `https://bitmap.navitronix.in`) and enforce HTTPS in `VITE_BITMAP_API_URL`.
- **Expected Result**: LED matrix rendering and simulation function reliably on all secure production domains.

---

## Final Engineering Verdict

| Category | Score | Detailed Engineering Rationale |
|---|---|---|
| **Page Architecture** | **5 / 10** | Strong UI components via Subframe library, but plagued by dead v1 pages, empty stub screens (`Utility`, `Settings`), and inconsistent route protection in `App.tsx`. |
| **CRUD Correctness** | **4 / 10** | Role update is fundamentally broken due to parameter mismatch; soft-delete lacks symmetric query filtering; several delete operations suffer from race conditions. |
| **Validation** | **3 / 10** | Organization has basic Zod validation, but core transit entities (Routes, Stops, Depots, Regions) have virtually zero validation on numeric boundaries, coordinate ranges, or text lengths. |
| **Data Integrity** | **4 / 10** | Missing database uniqueness constraints allow duplicate depots and routes; simulation duplication shares text references; V1 export drops multi-screen data. |
| **Supabase Implementation** | **4 / 10** | Relies entirely on client-side anon key without database-level RLS policies; missing critical relational indexes; client attempts admin operations (`auth.signUp`). |
| **Service Architecture** | **3 / 10** | Fragmented between dead Axios REST services, exposed Hasura GraphQL, and newer Supabase hooks, causing architectural redundancy and confusion. |
| **React Architecture** | **5 / 10** | Good use of Zustand and React Query, but harmed by direct store mutations during render, `fields` array mapping anti-patterns, and unguarded `useEffect` dependencies. |
| **Performance** | **4 / 10** | Unoptimized canvas drawing loops (thousands of `arc` calls per frame); duplicate queries triggered via manual `refetch` in `useEffect`; missing query limits and pagination on routes. |
| **Security** | **2 / 10** | Critical vulnerabilities: hardcoded Hasura admin secret, hardcoded Sarvam AI key, plaintext passwords stored in DB and displayed in UI, and public route editing URLs. |
| **Error Handling** | **4 / 10** | Heavy reliance on generic toasts that swallow server error messages; silent failures on route fetch; unhandled audio promise rejections. |
| **Scalability** | **4 / 10** | Absence of database indexes on foreign keys (`organization_id`, `depot_id`, `deleted`) will degrade query performance rapidly as records scale beyond a few hundred rows. |
| **Overall Production Readiness** | **3.5 / 10** | **NOT READY** |

---

### Recommendation

**STATUS: NOT READY**

The application exhibits excellent domain concepts, sophisticated LED matrix visualization, and modern Subframe UI designs. However, it cannot be deployed to production in its current state due to critical P0 security vulnerabilities (hardcoded admin secrets, plaintext credentials in public tables, exposed third-party API keys, and unauthenticated route editing URLs), fatal unhandled exceptions on page refresh, and broken update operations in the role and user management flows. 

Prioritize resolving the **Top 10 Issues** above before considering a production release.
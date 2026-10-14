# Application Execution Lifecycle: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  

---

## 1. Complete Application Execution Lifecycle

The following Mermaid sequence diagram traces the complete execution lifecycle from initial browser load or desktop launch through session hydration, route resolution, data loading, user mutation, and session termination:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Operator
    participant Browser as Browser / Electron Window
    participant Main as Electron Main Process (if Desktop)
    participant Sidecar as BitmapFontApi.exe (127.0.0.1:5288)
    participant App as React App (main.tsx -> App.tsx)
    participant Guard as Route Guard (ProtectedRoute / PublicRoute)
    participant Store as Zustand (useLoggedUserStore)
    participant SupaAuth as Supabase Auth (GoTrue)
    participant PostgREST as Supabase PostgREST
    participant DB as PostgreSQL Database

    Note over User, DB: PHASE 1: Bootstrap & Runtime Initialization
    alt Desktop Environment
        User->>Main: Launch Executable
        Main->>Sidecar: Spawn Background Process (--urls 127.0.0.1:5288)
        Main->>Browser: Open Window & Load Web URL
    else Standard Web
        User->>Browser: Navigate to App URL
    end

    Browser->>App: Mount main.tsx
    App->>Store: Hydrate State from localStorage['logged-user-store']
    App->>App: Initialize TanStack QueryClient (staleTime: 5m)

    Note over User, DB: PHASE 2: Route Resolution & Authentication
    App->>Guard: Evaluate Route Path
    alt User Unauthenticated (Store user is null)
        Guard-->>Browser: Redirect to /login
        User->>App: Enter Email & Password
        App->>SupaAuth: signInWithPassword(email, password)
        SupaAuth-->>App: Return Auth Token & Session User
        App->>PostgREST: SELECT * FROM users WHERE user_id = authData.user.id
        PostgREST-->>App: Return User Profile (Role, Org, Region, Depot)
        App->>Store: login(userData) (Set isAuthenticated = true)
        App->>Guard: Redirect to getDefaultRouteForUser(userData)
    else User Authenticated (Store user exists)
        Guard->>SupaAuth: getSession() (Verify JWT Token)
        Guard->>PostgREST: SELECT active FROM users WHERE id = user.id
        PostgREST-->>Guard: Return active status
        alt Account Inactive
            Guard->>SupaAuth: signOut()
            Guard->>Store: logout()
            Guard-->>Browser: Display Inactive Toast & Redirect /login
        else Session Valid & Account Active
            Guard-->>App: Render Protected Route Children
        end
    end

    Note over User, DB: PHASE 3: Tenant Hydration & Page Data Loading
    App->>App: Render DefaultPageLayout & Sidebar
    App->>PostgREST: loggedUserCrud.useList (Fetch active organization & role status)
    PostgREST-->>App: Hydrate user organization, modules (PIS/PAS/ITMS)
    App->>PostgREST: Fetch Page Queries (Routes, Stops, Depots, Regions)
    PostgREST-->>App: Render Tabular Data / Studio Canvas

    Note over User, DB: PHASE 4: Signboard Design & Bitmap Generation
    User->>App: Edit Destination Text or Route Number
    App->>Sidecar: GET /api/bitmap?text=...&height=16&weight=Bold
    Sidecar-->>App: Return Multiline ASCII Matrix String (# and .)
    App->>App: Re-render LED Matrix Canvas with Animated Scrolling

    Note over User, DB: PHASE 5: User Signout & Desktop Cleanup
    User->>App: Click 'Log out' Button
    App->>SupaAuth: signOut()
    App->>Store: logout() (Set isAuthenticated = false, user = null)
    App->>Browser: clear localStorage & sessionStorage
    App-->>Browser: Redirect to /login
    opt Desktop Exit
        Browser->>Main: Window Closed / Exit Event
        Main->>Sidecar: taskkill /pid ... /T /F (Terminate Sidecar)
        Main->>Main: app.quit()
    end
```

---

## 2. Detailed Lifecycle Stages

### 2.1 Stage 1 — Application Bootstrap & Environment Discovery
1. **Entry Point:** Execution begins at [src/main.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/main.tsx). It renders `<App />` into the DOM `#root` container.
2. **Theme Initialization:** `next-themes` wraps the app tree in `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`, determining initial theme classes (`light` vs `dark`).
3. **Desktop Bridge Detection:** The app inspects `window.navitronixDesktop`. If present, it binds the local Bitmap API to `http://127.0.0.1:5288/api/bitmap`. Otherwise, it falls back to `VITE_BITMAP_API_URL` or defaults.
4. **React Query Cache:** Initializes `QueryClient` with default options:
   - `staleTime: 1000 * 60 * 5` (5 minutes)
   - `retry: 1`
   - In development mode (`import.meta.env.DEV`), injects `<ReactQueryDevtools />`.

### 2.2 Stage 2 — Client State Hydration
1. **Zustand Store Rehydration:** On startup, Zustand automatically restores persisted state from browser `localStorage`:
   - `localStorage['logged-user-store']` -> Restores `isAuthenticated`, `user`, `rememberMe`.
   - `localStorage['organization-storage']` -> Restores `selectedOrganization`.
   - `localStorage['region-storage']` -> Restores `selectedRegion`, `depotsPageRegion`, `routesPageRegion`.
   - `localStorage['depot-storage']` -> Restores `selectedDepot`, `routesPageDepot`.
2. **Security & Session Drift Risk:** Zustand restores `isAuthenticated: true` even if the underlying Supabase JWT session expired or was revoked remotely. Stage 3 mitigates this.

### 2.3 Stage 3 — Route Guard & Session Verification
1. **Protected Route Execution ([ProtectedRoute.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/ProtectedRoute.tsx)):**
   - Displays a fullscreen spinner while `isValidating === true`.
   - Invokes `supabase.auth.getSession()`. If no valid auth session exists, triggers `logout()`, sets `isSessionValid = false`, and redirects to `/login`.
   - Queries `public.users` table for `active` column. If `active === false`, displays error toast `"Your account is inactive. Please contact support at support@navitronix.in."`, issues `supabase.auth.signOut()`, and forces redirect to `/login`.
2. **Public Route Execution ([PublicRoute.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/PublicRoute.tsx)):**
   - If an authenticated session already exists, redirects the user immediately to `/home` (preventing re-login).

### 2.4 Stage 4 — Role-Based Access Control (RBAC) & Dynamic Landing
1. **Root Navigation:** Navigating to `/` triggers `<Navigate to="/home" replace />`.
2. **Home Landing Resolution:** The index route of `/home` executes `getDefaultRouteForUser(user)` ([customerType.ts:69-85](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/customerType.ts#L69-L85)):
   - `master` / `super_admin` -> Navigates to `/home/organizations`
   - `regular` / Standalone Customer -> Navigates to `/home/regular-routes`
   - `organization_admin` & `region_admin` -> Navigates to `/home/dashboard`
   - `depot_admin` -> Navigates to `/home/routes`
   - `guest` -> Navigates to `/home/organizations`
   - Unauthenticated -> Navigates to `/login`
3. **RBAC Route Gates ([RBACPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/RBACPage.tsx)):**
   - Verifies whether `user.role.name` matches the route's allowed `roles` array.
   - Verifies whether the organization/user possesses required `features` (`PIS`, `PAS`, `ITMS`, `v1_routes`, `v2_routes`).
   - If unauthorized, renders an "Access Denied" view rather than throwing an unhandled error.

### 2.5 Stage 5 — Route Creation Studio Lifecycle
1. **Creation Studio Entry (`/routes/create`, `/routes/create/:routeId`):**
   - Wrapped by `<LanguageConfigProvider>` ([LanguageConfigContext.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/context/LanguageConfigContext.tsx)), which preloads `font_settings` table configurations.
   - Form state initialized via `useForm<IRouteCreate>` with `defaultDisplayConfigPostRequest`.
   - If `:routeId` is present, fetches route from `public.routes` and parses JSON strings (`front`, `side`, `rear`, `internal`, `stops`).
2. **Unsaved Edits Protection:**
   - [RouteCreatePage.tsx:81-91](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/CreateRoutePage.tsx#L81-L91) registers a `beforeunload` event listener when `formState.isDirty === true` to block accidental tab closures.
   - [RouteCreationHeader.tsx:211-228](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteCreationHeader.tsx#L211-L228) renders a confirmation dialog when the back button is clicked with unsaved edits.
3. **Studio Cleanup:**
   - On component unmount, [RouteCreatePage.tsx:94-98](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/CreateRoutePage.tsx#L94-L98) calls `useSimulationStore.getState().reset()`, resetting active slide indices and clearing canvas memory.

### 2.6 Stage 6 — Logout & Clean Teardown
1. **Signout Execution ([DefaultPageLayout.tsx:91-105](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/layouts/DefaultPageLayout.tsx#L91-L105)):**
   - Calls `await supabase.auth.signOut()` to revoke Supabase JWT session.
   - Calls Zustand `logout()` to reset `isAuthenticated: false` and `user: null`.
   - Executes `localStorage.clear()` and `sessionStorage.clear()`.
   - Navigates to `/login` with `{ replace: true }`.
2. **Desktop Shutdown ([electron/main.cjs:76-98](file:///Users/vinaykongari/Nav/old/navitronics-ui/electron/main.cjs#L76-L98)):**
   - Listens on `before-quit`, `will-quit`, and `window-all-closed` events.
   - Executes `stopBackendSidecar()`: forces execution of `taskkill /pid ${pid} /T /F` on Windows to kill the .NET child process tree.

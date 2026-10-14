# Authentication and Session Management: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Security Architects, Backend Engineers, Full-Stack Developers  

---

## 1. Authentication Topology & Protocols

Navitronix RMS implements client-side authentication mediated by **Supabase GoTrue Auth** (JWT, OAuth2/Password grant) over HTTPS/WSS, coupled with application profile hydration from PostgreSQL table `public.users`.

```mermaid
graph TD
    Client["React Client Application"]
    Storage["Browser localStorage ('sb-*-auth-token')"]
    GoTrue["Supabase GoTrue Auth Service"]
    PostgresDB[("PostgreSQL DB (public.users, public.roles)")]
    ZustandStore["Zustand useLoggedUserStore ('logged-user-storage')"]

    Client -->|1. signInWithPassword(email, pass)| GoTrue
    GoTrue -->|2. Returns JWT & Refresh Token| Client
    Client -->|3. Persist Auth Session| Storage
    Client -->|4. SELECT * FROM public.users WHERE id = auth.uid()| PostgresDB
    PostgresDB -->|5. Return Profile & Role ID| Client
    Client -->|6. Hydrate Store & Set Depots| ZustandStore
    ZustandStore -->|7. Persist Profile State| Storage
```

---

## 2. Authentication Flows & Execution Sequences

### 2.1 Primary Credential Login Flow (`OP-001`)
- **Entry Point:** [`PAGE-001`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-001) (`/login`).
- **Trigger Component:** [`src/ui/components/UserLoginForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UserLoginForm.tsx).
- **Execution Path:**
  1. The user inputs email and password into `UserLoginForm`.
  2. Submits via `supabase.auth.signInWithPassword({ email, password })`.
  3. Supabase validates credentials against `auth.users` and issues a signed JWT containing claims: `sub` (`auth.uid()`), `role` (`authenticated`), and expiration timestamp.
  4. The client uses the active JWT session to issue a PostgREST query:
     ```sql
     SELECT id, username, email, role_id, organization_id, region_id, depot_id, status
     FROM public.users
     WHERE id = auth.uid();
     ```
  5. The client queries `public.roles` where `id = user.role_id` to resolve role code (`master`, `admin`, `operator`, `regular`, `guest`).
  6. **Account Status Verification:** If `user.status !== 'active'`, the client calls `supabase.auth.signOut()`, presents an error toast, and halts navigation.
  7. **Guest Expiration Check:** If role is `guest` and `user.expires_at < NOW()`, session is terminated and user is rejected (`BR-003`).
  8. Upon validation, the profile is written to `useLoggedUserStore` and saved to `localStorage` under key `logged-user-storage`.
  9. The user is redirected to their landing route according to Customer Tier Resolution (`BR-002`).

---

### 2.2 Isolated Staff Provisioning Flow (`FR-066` / `OP-035`)
- **Challenge:** Under standard Supabase client behavior, calling `supabase.auth.signUp()` automatically binds the newly created user session into the active browser window, overwriting the administrator's JWT in `localStorage` and logging them out.
- **Implementation Strategy:** The application instantiates a secondary isolated Supabase client in [`src/supabaseClient.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/supabaseClient.ts#L8-L15):
  ```typescript
  export const supabaseAuthHelper = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  ```
- **Execution:** When creating a staff user in `CreateUserForm2` or onboarding an STU admin in `STUOnboardingWizard`:
  1. Calls `supabaseAuthHelper.auth.signUp({ email, password })`.
  2. Receives the newly generated `auth.users.id`.
  3. The administrator's primary `supabase` client and active JWT remain untouched in `localStorage`.
  4. The administrator's primary client inserts the profile into `public.users` linking `auth_user_id`.

---

### 2.3 Session Restoration & Rehydration
- **Lifecycle Initialization:** In [`src/App.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/App.tsx#L40-L85):
  1. On page boot, `supabase.auth.getSession()` checks for an existing session.
  2. GoTrue event listener `supabase.auth.onAuthStateChange((event, session) => ...)` handles `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, and `USER_UPDATED`.
  3. If session exists, profile is rehydrated from `localStorage` key `logged-user-storage`.
  4. If `localStorage` is empty or corrupted, the client falls back to re-querying `public.users` using the JWT subject ID.
  5. If token is invalid or expired and cannot be refreshed, state is cleared and user is redirected to `/login`.

---

### 2.4 Route Guard Architecture (`ProtectedRoute` & `PublicRoute`)
- **`ProtectedRoute` ([`src/components/ProtectedRoute.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/ProtectedRoute.tsx)):**
  - Evaluates `useLoggedUserStore.user` and active Supabase session.
  - If unauthenticated: Redirects to `/login` with redirect state preserving intended target route.
  - If authenticated but missing required role or tier clearance: Renders `RBACPage` (`COMP-018`) displaying 403 Forbidden.
- **`PublicRoute` ([`src/components/PublicRoute.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/PublicRoute.tsx)):**
  - If unauthenticated: Renders child login route.
  - If authenticated: Redirects user away from `/login` back to their designated workspace (`/dashboard` or `/routes`).

---

### 2.5 Clean Teardown & Logout Flow (`OP-002`)
- **Trigger:** Clicking "Log Out" in the user profile dropdown.
- **Execution:**
  1. Calls `supabase.auth.signOut()`.
  2. Resets Zustand stores:
     - `useLoggedUserStore.getState().clearUser()`
     - `useDepotStore.getState().clearSelectedDepot()`
     - `useRegionStore.getState().clearSelectedRegion()`
     - `useOrganizationStore.getState().clearOrganization()`
  3. Clears browser `localStorage` entries:
     - `logged-user-storage`
     - `selected-depot-storage`
     - `selected-region-storage`
     - `selected-org-storage`
  4. TanStack Query cache is purged: `queryClient.clear()`.
  5. React Router navigates user to `/login`.

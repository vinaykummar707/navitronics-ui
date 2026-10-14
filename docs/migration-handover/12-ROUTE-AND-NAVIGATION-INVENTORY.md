# Route and Navigation Inventory: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  

---

## 1. Master Route Matrix

The following matrix records every navigable route discovered in [src/App.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/App.tsx) and navigation layouts:

| Page ID | Route Path | Component / View | Layout | Allowed Roles | Feature Flags | Access Type |
|---|---|---|---|---|---|---|
| **PAGE-001** | `/login` | `UserLoginForm` | Standalone Fullscreen | Public / Unauthenticated | None | Public Route |
| **PAGE-002** | `/` | Root Redirect (`/home`) | None | Any | None | Redirect |
| **PAGE-003** | `/home` (Index) | Dynamic Landing Redirect | `DefaultPageLayout` | Authenticated | None | Guarded Redirect |
| **PAGE-004** | `/home/dashboard` | `DashboardPage` | `DefaultPageLayout` | `master`, `organization_admin`, `region_admin` | None | Protected |
| **PAGE-005** | `/home/organizations` | `OrganizationsPage` | `DefaultPageLayout` | `master`, `guest` | None | Protected |
| **PAGE-006** | `/home/regions` | `AreasPage` (`RegionsPage`) | `DefaultPageLayout` | `master`, `organization_admin`, `region_admin`, `guest` | `PIS`, `PAS`, `ITMS` | Protected |
| **PAGE-007** | `/home/depots` | `DepotsPage` | `DefaultPageLayout` | `master`, `organization_admin`, `region_admin`, `depot_admin`, `guest` | `PIS`, `PAS`, `ITMS` | Protected |
| **PAGE-008** | `/home/stops` | `StopsPage` | `DefaultPageLayout` | `master`, `organization_admin`, `region_admin`, `depot_admin`, `guest` | `PAS`, `ITMS` | Protected |
| **PAGE-009** | `/home/routes` | `RoutesPage` | `DefaultPageLayout` | `master`, `organization_admin`, `region_admin`, `depot_admin`, `guest` | `PIS`, `PAS`, `ITMS` | Protected |
| **PAGE-010** | `/home/route-configuration` | `RouteConfigurationPage` | `DefaultPageLayout` | `master`, `organization_admin`, `region_admin`, `depot_admin`, `guest` | `PIS`, `PAS`, `ITMS` | Protected |
| **PAGE-011** | `/home/regular-routes` | `RegularRoutesPage` | `DefaultPageLayout` | `master`, `user` (Regular Customer) | None | Protected |
| **PAGE-012** | `/home/regular-customers` | `RegularCustomersPage` | `DefaultPageLayout` | `master` | None | Protected |
| **PAGE-013** | `/home/users` | `UsersPage` | `DefaultPageLayout` | `master`, `organization_admin`, `region_admin`, `depot_admin` | None | Protected |
| **PAGE-014** | `/home/guests` | `GuestsPage` | `DefaultPageLayout` | `master` | None | Protected (Hidden Nav) |
| **PAGE-015** | `/home/font-configuration` | `FontConfigurationPage` | `DefaultPageLayout` | `master` | None | Protected |
| **PAGE-016** | `/home/fonts` | `LanguageModify` | `DefaultPageLayout` | `master` | None | Protected (Legacy Axios) |
| **PAGE-017** | `/home/roles` | `Roles` | `DefaultPageLayout` | `master` | None | Protected (Legacy Axios) |
| **PAGE-018** | `/home/settings` | `Settings` | `DefaultPageLayout` | Any Authenticated | None | Protected |
| **PAGE-019** | `/home/utility` | `UtilityPage` | `DefaultPageLayout` | `master` | None | Protected (Placeholder) |
| **PAGE-020** | `/home/cctv` | `CCTVPage` | `DefaultPageLayout` | `master` | None | Protected (Placeholder) |
| **PAGE-021** | `/routes/create` | `RouteCreatePage` (V2 Studio) | Standalone Studio | `master`, `org_admin`, `region_admin`, `depot_admin`, `user` | `v2_routes` | Protected Studio |
| **PAGE-022** | `/routes/create/:routeId` | `RouteCreatePage` (V2 Edit) | Standalone Studio | `master`, `org_admin`, `region_admin`, `depot_admin`, `user` | `v2_routes` | Protected Studio |
| **PAGE-023** | `/routes/create/:areaId/:depotId` | `RouteCreatePage` (V2 STU) | Standalone Studio | `master`, `org_admin`, `region_admin`, `depot_admin` | `v2_routes` | Protected Studio |
| **PAGE-024** | `/routes/create/:areaId/:depotId/:routeId` | `RouteCreatePage` (V2 STU Edit) | Standalone Studio | `master`, `org_admin`, `region_admin`, `depot_admin` | `v2_routes` | Protected Studio |
| **PAGE-025** | `/routes/create-v1` | `CreateRoutePageV1` (V1 Iframe) | Standalone Studio | `master`, `org_admin`, `region_admin`, `depot_admin`, `user` | `v1_routes` | Protected Legacy |
| **PAGE-026** | `/routes/create-v1/:routeId` | `CreateRoutePageV1` (V1 Edit) | Standalone Studio | `master`, `org_admin`, `region_admin`, `depot_admin`, `user` | `v1_routes` | Protected Legacy |
| **PAGE-027** | `/routes/create-v1/:areaId/:depotId` | `CreateRoutePageV1` (V1 STU) | Standalone Studio | `master`, `org_admin`, `region_admin`, `depot_admin` | `v1_routes` | Protected Legacy |
| **PAGE-028** | `/routes/create-v1/:areaId/:depotId/:routeId` | `CreateRoutePageV1` (V1 STU Edit) | Standalone Studio | `master`, `org_admin`, `region_admin`, `depot_admin` | `v1_routes` | Protected Legacy |

---

## 2. Navigation Hierarchy & Sidebar Structure

Sidebar navigation is rendered in [DefaultPageLayout.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/layouts/DefaultPageLayout.tsx#L133-L388) and adapts conditionally to the user's customer tier and role:

### 2.1 Regular Customer Sidebar View (`isRegular === true`)
```
Menu
└── My Routes (/home/regular-routes)
```

### 2.2 Super Admin Sidebar View (`isSuper === true`)
```
STU Operations
├── Dashboard (/home/dashboard)
├── Organizations (/home/organizations)
├── Regions (/home/regions)
├── Depots (/home/depots)
├── Stops (/home/stops)
├── Route Configuration (/home/route-configuration)
├── STU Routes (/home/routes)
└── STU Users (/home/users)

Regular Customers
├── Regular Routes (/home/regular-routes)
└── Regular Customers (/home/regular-customers)

Administrator
└── Font Configuration (/home/font-configuration)
```

### 2.3 STU Enterprise Customer & Guest Sidebar View
```
Menu
├── Dashboard (/home/dashboard)             [Roles: organization_admin, region_admin]
├── Organizations (/home/organizations)     [Roles: guest]
├── Regions (/home/regions)                 [Roles: organization_admin] (Requires PIS/PAS/ITMS)
├── Depots (/home/depots)                   [Roles: organization_admin, region_admin, guest] (Requires PIS/PAS/ITMS)
├── Stops (/home/stops)                     [Roles: organization_admin, region_admin, depot_admin] (Requires PAS/ITMS)
├── Route Configuration (/home/route-config) [Roles: organization_admin, region_admin, depot_admin, guest] (Requires PIS/PAS/ITMS)
├── Routes (/home/routes)                   [Roles: organization_admin, region_admin, depot_admin, guest] (Requires PIS/PAS/ITMS)
└── Users (/home/users)                     [Roles: organization_admin, region_admin]
```

---

## 3. Detailed Route Specifications

### PAGE-001: `/login` (User Login & Password Reset)
- **Display Name:** User Login
- **Component:** [UserLoginForm.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UserLoginForm.tsx)
- **Access Rule:** Wrapped by `<PublicRoute>`. If authenticated session is already valid, immediately redirects to `/home`.
- **Form Controls:** Email input, Password input (with show/hide eye toggle), "Remember me" checkbox, Forgot password link opening `ResetPasswordForm` dialog, "Login" submit button.
- **Data Action:** Executes `supabase.auth.signInWithPassword`, queries `public.users` profile with joined foreign keys (`region`, `organization`, `depot`, `role`), validates `active === true`, initializes Zustand `login()`, and navigates via `getDefaultRouteForUser`.

### PAGE-004: `/home/dashboard` (Executive Overview & Operational Metrics)
- **Display Name:** Operations Dashboard
- **Component:** [DashboardPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/DashboardPage.tsx)
- **Roles:** `master`, `organization_admin`, `region_admin`
- **Data Loaded:** Total counts for Regions, Depots, Bus Stops, Fleet Users, and Routes scoped to the user's organization/region.
- **Key Tables:** Recent routes table with search, pagination, and direct navigation links to Route Creation Studio.

### PAGE-005: `/home/organizations` (Transit Authorities Management)
- **Display Name:** Organizations
- **Component:** [OrganizationsPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/OrganizationsPage.tsx)
- **Roles:** `master`, `guest`
- **Actions:** View organization cards/table; Add Organization drawer; "Onboard STU Customer" opening [STUOnboardingWizard.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx); Delete organization (hard delete).

### PAGE-006: `/home/regions` (Geographic Operational Regions)
- **Display Name:** Regions
- **Component:** [RegionsPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RegionsPage.tsx)
- **Roles:** `master`, `organization_admin`, `region_admin`, `guest`
- **Filter Dependency:** Scoped strictly to `selectedOrganization.id`. If no organization is selected, query is skipped.
- **Actions:** Add Region drawer (`CreateRegionForm`), Edit region, Delete region (checks for attached depots).

### PAGE-007: `/home/depots` (Bus Depots)
- **Display Name:** Depots
- **Component:** [DepotsPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/DepotsPage.tsx)
- **Roles:** `master`, `organization_admin`, `region_admin`, `depot_admin`, `guest`
- **Filter Dependency:** Scoped by `selectedOrganization.id` AND `selectedRegion.id`.
- **Auto-Selection:** For `depot_admin` or `region_admin`, region selector automatically locks to their assigned region.
- **Actions:** Add Depot drawer (`CreateDepotForm`), Edit depot name, Delete depot.

### PAGE-008: `/home/stops` (Bus Stops & TTS Announcements)
- **Display Name:** Stops Catalog
- **Component:** [StopsPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/StopsPage.tsx)
- **Roles:** `master`, `organization_admin`, `region_admin`, `depot_admin`, `guest`
- **Filter Dependency:** Scoped by `selectedOrganization.id` AND `selectedDepot.id`.
- **Data Fetched:** Stops table joined with `stop_audios (id, url, file_name, file_size)`.
- **Special Operations:** 
  - Generate Audio Announcement via Sarvam AI API.
  - In-table audio playback of stop announcement WAV files.
  - CSV Stops Export (`[depot]_stops.csv`).
  - CSV Stops Import with regex quoted-delimiter parser.

### PAGE-009: `/home/routes` (STU Transit Routes & Export)
- **Display Name:** STU Routes
- **Component:** [RoutesPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RoutesPage.tsx)
- **Roles:** `master`, `organization_admin`, `region_admin`, `depot_admin`, `guest`
- **Data Fetched:** Routes where `depot_id = selectedDepot.id`.
- **Special Operations:**
  - Multi-row selection checkbox.
  - Batch export to ZIP (.zip file download or direct USB directory write).
  - Mixed-version detection (dialog prompt if both V1 and V2 routes are selected simultaneously).
  - Duplicate route with auto-generated route number suffix.
  - Delete single route and bulk delete selected routes.

### PAGE-010: `/home/route-configuration` (Automated Route Specification Generator)
- **Display Name:** Route Configuration
- **Component:** [RouteConfigurationPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RouteConfigurationPage.tsx)
- **Roles:** `master`, `organization_admin`, `region_admin`, `depot_admin`, `guest`
- **Purpose:** Accelerated route generation tool. Allows configuring route metadata (source, destination, via stops, split-route numbers) and automatically generates Front, Side, and Rear LED simulation slides.

### PAGE-011: `/home/regular-routes` (Standalone Customer Routes)
- **Display Name:** Regular Routes
- **Component:** [RegularRoutesPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RegularRoutesPage.tsx)
- **Roles:** `master`, `user` (Regular Customer)
- **Data Scoping:** Regular customers see only routes where `created_by = auth.uid()`. Super Admin sees all routes where `depot_id IS NULL`.
- **Actions:** Create route button (navigates to `/routes/create` or `/routes/create-v1` based on feature flags); duplicate route; export to ZIP.

### PAGE-012: `/home/regular-customers` (Standalone Customer Administration)
- **Display Name:** Regular Customers
- **Component:** [RegularCustomersPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RegularCustomersPage.tsx)
- **Roles:** `master`
- **Data Loaded:** Users with `customer_type = 'regular'` or role `user` or `organization_id IS NULL`.
- **Actions:** Open `CreateRegularCustomerDrawer` to create/edit customer; view plaintext password in table via `PasswordViewerCell`; toggle active status; toggle `v1_routes` and `v2_routes` access.

### PAGE-013: `/home/users` (STU Staff Administration)
- **Display Name:** STU Users
- **Component:** [UsersPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/UsersPage.tsx)
- **Roles:** `master`, `organization_admin`, `region_admin`, `depot_admin`
- **Data Loaded:** Organization staff accounts. Excludes regular customers and logged-in user themselves.
- **Actions:** Open `CreateUserForm2` drawer to create/edit staff accounts; assign roles (`organization_admin`, `region_admin`, `depot_admin`); assign territory; view plaintext password.

### PAGE-015: `/home/font-configuration` (Font Heights & Language Mappings)
- **Display Name:** Font Configuration
- **Component:** [FontConfigurationPage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/FontConfigurationPage.tsx)
- **Roles:** `master`
- **Data Loaded:** `font_settings` table records.
- **Actions:** Create, edit, and delete font mapping settings per language; configure allowed font heights (e.g. `16,32`), font family fallbacks for 8px, 16px, 32px text.

### PAGE-021 through PAGE-024: `/routes/create*` (V2 Route Creation Studio)
- **Display Name:** Route Creation Studio (V2)
- **Component:** [RouteCreatePage.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/CreateRoutePage.tsx) rendering [RouteCreationLayout.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteCreationLayout.tsx)
- **Roles:** `master`, `organization_admin`, `region_admin`, `depot_admin`, `user`
- **Sub-Panels:**
  - `RouteSpecificationPanel`: Route numbers, split-route controls, source/destination/via, stops, return route toggle.
  - `SignboardCanvasStage`: Live dot-matrix canvas, signboard selector (Front, Side, Rear, Internal), slide play/pause, slide add/duplicate/delete/reorder.
  - `SlidePropertyInspector`: Slide format (single, two, three), scroll speed, scroll type, text zones, font height, font width, Indic transliteration, icon picker.

### PAGE-025 through PAGE-028: `/routes/create-v1*` (V1 Legacy Route Creation Studio)
- **Display Name:** Route Creation Studio (V1 Legacy)
- **Component:** [CreateRoutePageV1.tsx](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v1/CreateRoutePageV1.tsx)
- **Roles:** `master`, `organization_admin`, `region_admin`, `depot_admin`, `user`
- **Implementation:** Embeds external V1 application inside an `<iframe>` pointing to `VITE_V1_APP_URL` or fallback `http://31.97.228.29:9091`. Communicates with parent via HTML5 `window.postMessage` (`NAVITRONIX_V1_ROUTE_SAVED`, `NAVITRONIX_V1_ROUTE_BACK`).

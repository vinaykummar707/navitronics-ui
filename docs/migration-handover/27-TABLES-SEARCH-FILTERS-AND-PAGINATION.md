# Tables, Search, Filtering, and Pagination: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Frontend Developers, Database Engineers, QA Test Architects  

---

## 1. Tabular Views Inventory

This document details the data sources, column definitions, derived transformations, sorting rules, filter semantics, and pagination/virtualization implementations for all 8 tabular views in the system.

---

## 2. Table Specifications

---

### 1. Routes Catalog Table (`RouteTable.tsx`)
- **Host View:** `/routes` ([`PAGE-006`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-006)) and `/regular-routes` ([`PAGE-017`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-017)).
- **Component File:** [`src/ui/components/RouteTable.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteTable.tsx), [`src/pages/v2/RoutesPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RoutesPage.tsx).
- **Data Source:** `public.routes` filtered by `depot_id = active_depot` (or `created_by = auth.uid()` for regular tier) where `status != 'deleted'`.
- **Column Definitions:**

| Column ID | Header Label | Data Source Field | Derived / Formatted Output | Sortable? | Filterable? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `COL-001` | **Route Number** | `route_number_1`, `route_number_2`, `separator` | Formatted composite string: e.g., `218/A` or `100-D`. Monospace badge. | Yes (Alpha) | Yes (Partial text) |
| `COL-002` | **Route Name** | `name` | Raw string (e.g., "Koti to Patancheru"). Truncated at 40 chars with tooltip. | Yes | Yes (Partial text) |
| `COL-003` | **Service Type** | `service_type` | Visual Badge: `ORD` (Gray), `EXP` (Blue), `DLX` (Green), `SLX` (Purple), `EV` (Cyan). | Yes | Yes (Multi-select) |
| `COL-004` | **Direction** | `direction` | Arrow Icon + Text: `UP` ($\uparrow$), `DOWN` ($\downarrow$), `CIRCULAR` ($\circlearrowright$). | Yes | Yes (Dropdown) |
| `COL-005` | **Via Stops** | `via` / `stops` | Comma-separated summary of stop names; truncated with "+N more" badge. | No | Yes (Text match) |
| `COL-006` | **Last Modified** | `updated_at` | Formatted IST timestamp: `DD MMM YYYY, hh:mm A` via `dateUtils.ts`. | Yes (Default DESC) | No |
| `COL-007` | **Status** | `status` | Status Pill: `Active` (Green), `Inactive` (Amber). | Yes | Yes (Dropdown) |
| `COL-008` | **Actions** | *Virtual* | Context menu: Edit (`/routes/:id/config`), Duplicate (`OP-015`), Simulate (`COMP-023`), Export (`COMP-007`), Delete (`OP-016`). | No | No |

- **Search Semantics:** Client-side filter across `route_number_1`, `route_number_2`, and `name`. Case-insensitive (`toLowerCase()`), debounced by 300ms.
- **Filter Combinations:** Search text + Service Type filter + Direction filter evaluated with logical `AND`.
- **Pagination & Virtualization:** Virtualized row scrolling via AG Grid / Subframe Table. Row height fixed at 48px; renders buffer of 10 rows above and below visible viewport.
- **Empty State:** `EmptyState` component (`COMP-005`) rendering illustration: "No routes found for this depot. Click 'Create Route' to get started."

---

### 2. Bus Stops Table (`StopsPage.tsx`)
- **Host View:** `/stops` ([`PAGE-009`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-009)).
- **Component File:** [`src/pages/v2/StopsPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/StopsPage.tsx).
- **Data Source:** `public.stops` where `depot_id = active_depot` and `status != 'deleted'`.
- **Column Definitions:**

| Column ID | Header Label | Data Source Field | Derived / Formatted Output |
| :--- | :--- | :--- | :--- |
| `COL-010` | **Stop Code** | `code` | Monospace code badge (e.g., `STP_KOTI_01`). |
| `COL-011` | **English Name** | `name_english` | Bold text string. |
| `COL-012` | **Telugu Name** | `name_telugu` | Rendered in `gautami.ttf` font glyphs (`కోటి`). |
| `COL-013` | **Hindi Name** | `name_hindi` | Rendered in `mangal.ttf` font glyphs (`कोटी`). |
| `COL-014` | **Audio (Telugu)** | `audio_url_te` | Mini audio wave play/pause button (`AudioFileContainer`) or "Generate" button. |
| `COL-015` | **Audio (Hindi)** | `audio_url_hi` | Mini audio wave play/pause button or "Generate" button. |
| `COL-016` | **Actions** | *Virtual* | Edit Stop, Regenerate Audio, Delete Stop. |

- **Search Semantics:** Substring search against English, Telugu, or Hindi stop names.
- **Bulk Actions:** "Generate All Missing Audio" action in toolbar batch-processes stops lacking audio URLs via Sarvam AI API.

---

### 3. Staff & User Administration Table (`UsersTable.tsx`)
- **Host View:** `/users` ([`PAGE-010`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-010)).
- **Component File:** [`src/ui/components/UsersTable.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UsersTable.tsx).
- **Data Source:** `public.users` joined with `public.roles`, `public.organizations`, `public.depots`.
- **Column Definitions:**

| Column ID | Header Label | Data Source Field | Formatted Output | Security / Architecture Note |
| :--- | :--- | :--- | :--- | :--- |
| `COL-020` | **Username** | `username` | Text string + Avvvatars avatar pill. | Standard |
| `COL-021` | **Email** | `email` | Monospace link (`mailto:...`). | Standard |
| `COL-022` | **Role** | `role_code` | Badge: `Master` (Red), `Admin` (Purple), `Operator` (Blue). | Standard |
| `COL-023` | **Scope** | `organization_name` / `depot_name` | Displays assigned Depot or "Global" for Super Admin. | Standard |
| `COL-024` | **Password** | `password` | `PasswordViewerCell` (`UI-015`): Masked `••••••••` with eye icon toggle revealing plaintext password. | **Critical Security Finding `SEC-02`** |
| `COL-025` | **Status** | `status` | Active (Green) / Suspended (Red). | Standard |
| `COL-026` | **Actions** | *Virtual* | Reset Password (`UI-028`), Deactivate User. | Master / Admin only |

---

### 4. Organizations Table (`OrganizationsPage.tsx`)
- **Host View:** `/organizations` ([`PAGE-003`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-003)).
- **Data Source:** `public.organizations` joined with count of child depots from `public.depots`.
- **Columns:** Organization Name, Short Code (Unique), State, Contact Phone, Contact Email, Depot Count (Badge), Created Date, Actions (Edit, Onboarding Wizard, Delete).

---

### 5. Transit Regions Table (`RegionsPage.tsx`)
- **Host View:** `/regions` ([`PAGE-004`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-004)).
- **Data Source:** `public.regions` scoped to selected Organization.
- **Columns:** Region Name, Region Code, Organization Name, Depot Count, Actions.

---

### 6. Bus Depots Table (`DepotsPage.tsx`)
- **Host View:** `/depots` ([`PAGE-008`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-008)).
- **Data Source:** `public.depots` joined with region and organization.
- **Columns:** Depot Name, Depot Code, Region, Location String, Active Routes Count, Actions.

---

### 7. Regular Customers Table (`RegularCustomersPage.tsx`)
- **Host View:** `/regular-customers` ([`PAGE-005`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-005)).
- **Data Source:** `public.users` where `role_code = 'regular'`.
- **Columns:** Customer Name, Work Email, Phone Number, Virtual Depot Identifier, Total Configured Routes, Onboarded Date, Actions (Reset Password, Deactivate).

---

### 8. Guest Accounts Table (`GuestsPage.tsx`)
- **Host View:** `/guests` ([`PAGE-011`](file:///Users/vinaykongari/Nav/old/navitronics-ui/docs/migration-handover/22-PAGE-BY-PAGE-SPECIFICATIONS.md#PAGE-011)).
- **Data Source:** `public.users` where `role_code = 'guest'`.
- **Columns:** Evaluator Username, Temporary Email, Access Expiration Timestamp (`expires_at`), Remaining Validity Hours, Actions (Extend 7 Days, Revoke Access).

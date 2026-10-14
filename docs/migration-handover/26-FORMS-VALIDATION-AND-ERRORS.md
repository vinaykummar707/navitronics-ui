# Forms, Validation, and Error Handling: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Frontend Developers, QA Engineers, Form Validation Specialists  

---

## 1. Forms Inventory

This document provides a field-by-field specification of all 15 data capture forms, drawers, and modal dialogs discovered in the application.

| Form ID | Form Name | Component Path | Container Type | Host Page |
| :--- | :--- | :--- | :--- | :--- |
| `FORM-001` | `UserLoginForm` | [`src/ui/components/UserLoginForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UserLoginForm.tsx) | Card / Inline | `/login` (`PAGE-001`) |
| `FORM-002` | `CreateOrganizationDrawer` | [`src/ui/components/CreateOrganizationDrawer.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateOrganizationDrawer.tsx) | Slide-Over Drawer | `/organizations` (`PAGE-003`) |
| `FORM-003` | `CreateRegionForm` | [`src/ui/components/CreateRegionForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateRegionForm.tsx) | Modal Dialog | `/regions` (`PAGE-004`) |
| `FORM-004` | `CreateDepotForm` | [`src/ui/components/CreateDepotForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateDepotForm.tsx) | Modal Dialog | `/depots` (`PAGE-008`) |
| `FORM-005` | `CreateRegularCustomerDrawer` | [`src/ui/components/CreateRegularCustomerDrawer.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateRegularCustomerDrawer.tsx) | Slide-Over Drawer | `/regular-customers` (`PAGE-005`) |
| `FORM-006` | `CreateGuestDrawer` | [`src/ui/components/CreateGuestDrawer.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateGuestDrawer.tsx) | Slide-Over Drawer | `/guests` (`PAGE-011`) |
| `FORM-007` | `CreateUserForm2` | [`src/ui/components/CreateUserForm2.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateUserForm2.tsx) | Modal Dialog | `/users` (`PAGE-010`) |
| `FORM-008` | `CreateStopForm` | [`src/ui/components/CreateStopForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateStopForm.tsx) | Slide-Over Drawer | `/stops` (`PAGE-009`) |
| `FORM-009` | `STUOnboardingWizard` | [`src/ui/components/STUOnboardingWizard.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/STUOnboardingWizard.tsx) | Stepper Wizard | `/organizations` (`PAGE-003`) |
| `FORM-010` | `RouteSpecificationPanel` | [`src/ui/components/RouteSpecificationPanel.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteSpecificationPanel.tsx) | Studio Panel | `/routes/:id/config` (`PAGE-007`) |
| `FORM-011` | `RouteNumberControl` | [`src/ui/components/RouteNumberControl.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteNumberControl.tsx) | Studio Control | `/routes/:id/config` (`PAGE-007`) |
| `FORM-012` | `SlidePropertyInspector` | [`src/ui/components/SlidePropertyInspector.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/SlidePropertyInspector.tsx) | Studio Panel | `/routes/:id/config` (`PAGE-007`) |
| `FORM-013` | `FontSettingsDrawerWrapper` | [`src/components/FontSettingsDrawerWrapper.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/FontSettingsDrawerWrapper.tsx) | Drawer | `/routes/:id/config` (`PAGE-007`) |
| `FORM-014` | `ResetPassword` | [`src/ui/components/ResetPassword.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/ResetPassword.tsx) | Modal Dialog | `/users` (`PAGE-010`) |
| `FORM-015` | `RoleForm` | [`src/components/roles/RoleForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/roles/RoleForm.tsx) | Modal Dialog | `/roles` (`PAGE-015`) |

---

## 2. Field-by-Field Form Specifications

---

### `FORM-001`: User Login Form (`UserLoginForm`)
- **Host Component:** [`src/ui/components/UserLoginForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/UserLoginForm.tsx)
- **Submission Trigger:** "Sign In" button click or Enter key.
- **Fields:**

| Field ID | Field Name | Label | Input Type | Required? | Validation Constraints | Default Value | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `FIELD-001` | `email` | Email Address | `email` | Yes | Valid email format regex; non-empty | `""` | Trimmed lowercase on submit |
| `FIELD-002` | `password` | Password | `password` | Yes | Minimum 6 characters; non-empty | `""` | Cleartext toggle via eye icon |
| `FIELD-003` | `rememberMe`| Remember Me | `checkbox` | No | Boolean | `false` | Modifies token persistence |

- **Validation Timing:** `onBlur` for email format; `onSubmit` for required checks.
- **Submission Error Handling:** Displays inline alert under form and toast alert with error message.

---

### `FORM-002`: Create Organization Drawer (`CreateOrganizationDrawer`)
- **Host Component:** [`src/ui/components/CreateOrganizationDrawer.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateOrganizationDrawer.tsx)
- **Submission Trigger:** "Save Organization" button click.
- **Fields:**

| Field ID | Field Name | Label | Input Type | Required? | Validation Constraints | Default Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `FIELD-010` | `name` | Organization Name | `text` | Yes | 3 to 100 characters | `""` |
| `FIELD-011` | `code` | Short Code | `text` | Yes | 2 to 10 uppercase alphanumeric chars; Unique | `""` |
| `FIELD-012` | `state` | State / Province | `select` | Yes | Valid Indian state string (e.g., "Telangana") | `""` |
| `FIELD-013` | `contact_email`| Contact Email | `email` | No | Valid email format | `""` |
| `FIELD-014` | `contact_phone`| Contact Phone | `tel` | No | 10-digit phone format | `""` |
| `FIELD-015` | `address` | Headquarters Address | `textarea` | No | Max 250 characters | `""` |

- **Normalization:** `code` is auto-capitalized via `toUpperCase()` during input.
- **Conflict Handling:** If `code` exists, server responds with PostgreSQL unique violation `23505`; client surfaces "Organization code already in use".

---

### `FORM-007`: User Provisioning Form (`CreateUserForm2`)
- **Host Component:** [`src/ui/components/CreateUserForm2.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateUserForm2.tsx)
- **Submission Trigger:** "Create Staff User" button.
- **Fields:**

| Field ID | Field Name | Label | Input Type | Required? | Validation Constraints | Dependencies |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `FIELD-020` | `username` | Full Name / Username | `text` | Yes | 3 to 50 characters | None |
| `FIELD-021` | `email` | Work Email | `email` | Yes | Valid email format | None |
| `FIELD-022` | `password` | Temporary Password | `password` | Yes | Min 8 chars; uppercase, number | None (persisted in plaintext `SEC-02`) |
| `FIELD-023` | `role_id` | User Role | `select` | Yes | Valid ID from `public.roles` | Controls hierarchy requirement |
| `FIELD-024` | `organization_id`| Organization | `select` | Conditional | Required if role is `admin` or `operator` | Triggers regions refetch |
| `FIELD-025` | `region_id` | Transit Region | `select` | Conditional | Required if depot-scoped | Filtered by `organization_id` |
| `FIELD-026` | `depot_id` | Assigned Depot | `select` | Conditional | Required if role is `operator` | Filtered by `region_id` |

- **Cascading Dropdown Behavior:** Selecting an Organization resets `region_id` and `depot_id` and loads child regions. Selecting a Region resets `depot_id` and loads child depots.

---

### `FORM-008`: Create Bus Stop Form (`CreateStopForm`)
- **Host Component:** [`src/ui/components/CreateStopForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateStopForm.tsx)
- **Submission Trigger:** "Save Stop" button.
- **Fields:**

| Field ID | Field Name | Label | Input Type | Required? | Validation Constraints | Normalization / Helper |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `FIELD-030` | `name_english` | Stop Name (English) | `text` | Yes | 2 to 100 characters | Capitalized words |
| `FIELD-031` | `name_telugu` | Stop Name (Telugu) | `IMEInput` | Yes | Native Telugu Unicode string | Transliterated from English |
| `FIELD-032` | `name_hindi` | Stop Name (Hindi) | `IMEInput` | Yes | Native Devanagari string | Transliterated from English |
| `FIELD-033` | `code` | Stop Code | `text` | Yes | 3 to 15 uppercase characters; Unique per depot | Auto-generated if blank |
| `FIELD-034` | `audio_url_te` | Audio (Telugu) | `hidden / audio` | No | Valid Supabase Storage URL | Generated via Sarvam AI button |
| `FIELD-035` | `audio_url_hi` | Audio (Hindi) | `hidden / audio` | No | Valid Supabase Storage URL | Generated via Sarvam AI button |

- **Integrated Actions:** "Generate Audio" button triggers Sarvam AI TTS API (`FR-037`) for Telugu and Hindi fields and updates `audio_url` fields before final save.

---

### `FORM-010`: Route Specification Panel (`RouteSpecificationPanel`)
- **Host Component:** [`src/ui/components/RouteSpecificationPanel.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteSpecificationPanel.tsx)
- **Submission Trigger:** Auto-syncs into `RouteConfigurationPage` memory state.
- **Fields:**

| Field ID | Field Name | Label | Input Type | Required? | Validation Constraints | Allowed Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `FIELD-040` | `route_number_1` | Route No (Main) | `text` | Yes | 1 to 10 alphanumeric chars | e.g., "100", "218" |
| `FIELD-041` | `route_number_2` | Route No (Sub) | `text` | No | 0 to 5 alphanumeric chars | e.g., "D", "A", "K" |
| `FIELD-042` | `separator` | Delimiter | `select` | Yes | Single character | `-`, `/`, ` ` (space) |
| `FIELD-043` | `name` | Route Name | `text` | Yes | 3 to 100 characters | e.g., "Koti to Patancheru" |
| `FIELD-044` | `service_type` | Bus Service Type | `select` | Yes | Valid transit code (`BR-028`) | `ORD`, `EXP`, `DLX`, `SLX`, `EV` |
| `FIELD-045` | `direction` | Direction | `radio` | Yes | Direction enum | `UP`, `DOWN`, `CIRCULAR` |
| `FIELD-046` | `via` | Via Stops Summary | `text` | No | Comma-delimited stop names | Triggers stop auto-discovery |

---

### `FORM-012`: Slide Property Inspector (`SlidePropertyInspector`)
- **Host Component:** [`src/ui/components/SlidePropertyInspector.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/SlidePropertyInspector.tsx)
- **Submission Trigger:** Real-time synchronization with active slide in studio canvas.
- **Fields:**

| Field ID | Field Name | Label | Input Type | Required? | Validation Constraints | Default Value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `FIELD-050` | `duration` | Display Duration | `number / slider`| Yes | Integer: $1 \le x \le 30$ seconds | `3` |
| `FIELD-051` | `speed` | Scroll Speed | `slider` | Yes | Integer: $1 \le x \le 10$ | `5` |
| `FIELD-052` | `in_effect` | Entry Effect | `select` | Yes | `Scroll Left`, `Curtain`, `Freeze`, `Flash` | `Scroll Left` |
| `FIELD-053` | `out_effect` | Exit Effect | `select` | Yes | `Immediate`, `Scroll Left`, `Fade` | `Immediate` |
| `FIELD-054` | `font_height` | Font Size | `select` | Yes | 7, 8, 10, 12, 14, 16, 24, 32 pixels | `16` |
| `FIELD-055` | `text_english`| English Text | `text` | Conditional | Up to 120 characters | `""` |
| `FIELD-056` | `text_telugu` | Telugu Text | `IMEInput` | Conditional | Up to 120 characters | `""` |
| `FIELD-057` | `text_hindi` | Hindi Text | `IMEInput` | Conditional | Up to 120 characters | `""` |
| `FIELD-058` | `material_icon`| Embedded Icon | `select` | No | Valid Google Material Symbol name | `None` |

---

## 3. Centralized Validation & Error Catalog

| Error ID | Triggering Condition | Detection Point | User-Visible Error Message | Recovery Action |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-001` | Invalid email format | Form `onBlur` | "Please enter a valid email address" | Focus remains on email input |
| `ERR-002` | Password length $< 6$ | Form `onSubmit` | "Password must be at least 6 characters" | Highlights password field in red |
| `ERR-003` | Organization code collision | PostgreSQL 23505 | "Organization with this code already exists" | User modifies code string |
| `ERR-004` | Depot code collision within region | PostgreSQL 23505 | "Depot code already exists in this organization" | Re-enter unique depot code |
| `ERR-005` | Missing Front Board slide | Route Save trigger | "Route must contain at least one valid slide" | Studio focuses on Left Panel |
| `ERR-006` | Slide duration out of bounds | Inspector change | "Duration must be between 1 and 30 seconds" | Clamped automatically to $[1, 30]$ |
| `ERR-007` | Sarvam AI API quota exceeded | HTTP 429 | "Audio synthesis rate limit exceeded. Retry in 60s"| Stop saved without audio; user retries |
| `ERR-008` | Missing depot selection | Header switch | "Please select an active depot to view routes" | Banner prompts depot selection |
| `ERR-009` | Deleting parent with active children | PostgreSQL 23503 | "Cannot delete region: Depots are assigned to it" | Delete or reassign child depots first |
| `ERR-010` | Sidecar port 5288 unreachable | HTTP Connection Refused | Transparent fallback; debug console logs warning | Switches to client Canvas font rasterizer |

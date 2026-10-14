# Database Schema and Data Dictionary: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Database Administrators, Backend Architects, Data Migration Specialists  

---

## 1. Schema Topology Overview

Navitronix RMS utilizes PostgreSQL 15 on Supabase with the `public` schema housing all domain entities, Row-Level Security policies, and performance indexes. Uniqueness constraints on business codes are hardened using partial indexes scoped to non-deleted records (`WHERE deleted = false`).

```mermaid
graph TD
    Org["organizations"] -->|1:N| Region["regions"]
    Org -->|1:N| Depot["depots"]
    Region -->|1:N| Depot
    Org -->|1:N| User["users"]
    Depot -->|1:N| User
    Role["roles"] -->|1:N| User
    Depot -->|1:N| Route["routes"]
    Depot -->|1:N| Stop["stops"]
    Stop -->|1:N| StopAudio["stop_audios"]
    User -->|1:N (created_by)| Route
```

---

## 2. Table-by-Table Data Dictionary

---

### 1. `public.organizations`
- **Purpose:** Represents top-level transit corporations (e.g., TSRTC, APSRTC, KSRTC) or enterprise accounts.
- **RLS Enabled:** Yes (`SEC-01`, `public.is_super_admin()`).

| Column Name | Data Type | Nullable? | Default Value | Foreign Key / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key | Unique organization identifier. |
| `name` | `VARCHAR(255)` | No | *None* | `idx_unique_organizations_active` | Full corporation name (e.g., "Telangana State RTC"). |
| `code` | `VARCHAR(20)` | No | *None* | Partial Unique (`deleted=false`) | Short telegraphic code (e.g., "TSRTC"). |
| `state` | `VARCHAR(100)` | Yes | *None* | *None* | Geographic state jurisdiction in India. |
| `contact_email` | `VARCHAR(255)` | Yes | *None* | *None* | Primary administrative contact email. |
| `contact_phone` | `VARCHAR(50)` | Yes | *None* | *None* | Administrative telephone number. |
| `address` | `TEXT` | Yes | *None* | *None* | Headquarters physical address. |
| `customer_type` | `VARCHAR(20)` | Yes | `'stu'` | `'stu' \| 'regular'` | Customer tier classifier (`BR-004`). |
| `deleted` | `BOOLEAN` | No | `false` | *None* | Soft deletion flag (`BR-020`). |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | *None* | Record creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Triggered by `handle_updated_at` | Last modification timestamp. |

---

### 2. `public.regions`
- **Purpose:** Regional divisions or operational zones within a state transit corporation (e.g., "Greater Hyderabad Zone", "Warangal Region").
- **RLS Enabled:** Yes (Scoped to `current_user_org_id()`).

| Column Name | Data Type | Nullable? | Default Value | Foreign Key / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key | Unique region identifier. |
| `organization_id`| `UUID` | No | *None* | `FK -> organizations.id ON DELETE RESTRICT` | Parent transit organization. |
| `name` | `VARCHAR(255)` | No | *None* | `idx_unique_regions_active` | Region name (unique per organization when active). |
| `code` | `VARCHAR(20)` | No | *None* | *None* | Region short code (e.g., "GHZ"). |
| `deleted` | `BOOLEAN` | No | `false` | `idx_regions_org_del` | Soft deletion flag. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | *None* | Timestamp created. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Trigger `handle_updated_at` | Timestamp updated. |

---

### 3. `public.depots`
- **Purpose:** Operational bus depots housing vehicles, drivers, and route dispatch operations.
- **RLS Enabled:** Yes (Scoped to `current_user_org_id()`).

| Column Name | Data Type | Nullable? | Default Value | Foreign Key / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key | Unique depot identifier. |
| `organization_id`| `UUID` | No | *None* | `FK -> organizations.id` | Parent corporation. |
| `region_id` | `UUID` | Yes | *None* | `FK -> regions.id` | Regional administrative grouping. |
| `name` | `VARCHAR(255)` | No | *None* | `idx_unique_depots_active` | Depot name (unique within org and region when active). |
| `code` | `VARCHAR(20)` | No | *None* | *None* | Depot identifier code (e.g., "MSR1"). |
| `location` | `TEXT` | Yes | *None* | *None* | City or facility address. |
| `deleted` | `BOOLEAN` | No | `false` | `idx_depots_region_del`, `idx_depots_org_del` | Soft deletion flag. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | *None* | Timestamp created. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Trigger `handle_updated_at` | Timestamp updated. |

---

### 4. `public.users`
- **Purpose:** Application staff profiles, customer accounts, and role mapping.
- **RLS Enabled:** Yes (**CRITICAL VULNERABILITY `SEC-01`**).

| Column Name | Data Type | Nullable? | Default Value | Foreign Key / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | *None* | `Primary Key / References auth.users.id` | Supabase Auth user ID. |
| `username` | `VARCHAR(100)` | No | *None* | *None* | User display name or staff ID. |
| `email` | `VARCHAR(255)` | No | *None* | `UNIQUE` | Contact email address. |
| `password` | `VARCHAR(255)` | Yes | *None* | *None* | **Cleartext Password (`SEC-02`)**. |
| `role_id` | `UUID` | Yes | *None* | `FK -> roles.id` | Assigned RBAC role. |
| `role_code` | `VARCHAR(50)` | Yes | *None* | *None* | Denormalized role string (`master`, `admin`, etc.). |
| `organization_id`| `UUID` | Yes | *None* | `FK -> organizations.id` | Assigned organization (NULL for Regular customers). |
| `region_id` | `UUID` | Yes | *None* | `FK -> regions.id` | Assigned regional fleet. |
| `depot_id` | `UUID` | Yes | *None* | `FK -> depots.id` | Assigned depot (Virtual depot for Regular customers). |
| `customer_type` | `VARCHAR(20)` | Yes | *None* | `'stu' \| 'regular' \| 'guest'` | Customer tier classifier. |
| `status` | `VARCHAR(20)` | No | `'active'` | `'active' \| 'inactive' \| 'deleted'` | Account status (`BR-001`). |
| `active` | `BOOLEAN` | No | `true` | `idx_users_org_del` | Active flag. |
| `deleted` | `BOOLEAN` | No | `false` | *None* | Soft deletion flag. |
| `expires_at` | `TIMESTAMPTZ` | Yes | *None* | *None* | Temporary expiration date for Guest accounts (`BR-003`). |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | *None* | Account creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | *None* | Last profile update. |

---

### 5. `public.roles`
- **Purpose:** System and custom role definitions and permission bitmasks.
- **RLS Enabled:** No (Read-accessible to authenticated users).

| Column Name | Data Type | Nullable? | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key. |
| `name` | `VARCHAR(50)` | No | *None* | Unique role code (`master`, `admin`, `operator`, `regular`, `guest`). |
| `description` | `TEXT` | Yes | *None* | Human-readable description of authority. |
| `permissions` | `JSONB` | Yes | `'{}'` | JSON structure or bitmask of feature permissions. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | Role definition timestamp. |

---

### 6. `public.routes`
- **Purpose:** Bus transit routes, destination signboard sequences, and firmware payloads.
- **RLS Enabled:** Yes (`Tenant users manage routes`).

| Column Name | Data Type | Nullable? | Default Value | Foreign Key / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key | Unique route UUID. |
| `depot_id` | `UUID` | Yes | *None* | `FK -> depots.id` (Nullable for Regular tier) | Assigned depot scope. |
| `organization_id`| `UUID` | Yes | *None* | `FK -> organizations.id` | Parent corporation scope. |
| `route_number` | `VARCHAR(50)` | No | *None* | `idx_unique_routes_depot_active` | Composite route identifier (e.g., "218/A"). |
| `route_number_1` | `VARCHAR(20)` | Yes | *None* | *None* | Primary route number prefix (e.g., "218"). |
| `route_number_2` | `VARCHAR(20)` | Yes | *None* | *None* | Secondary route suffix (e.g., "A"). |
| `separator` | `VARCHAR(5)` | Yes | `'/'` | `'-' \| '/' \| ' '` | Split number delimiter. |
| `name` | `VARCHAR(255)` | No | *None* | *None* | Descriptive route title. |
| `service_type` | `VARCHAR(20)` | Yes | `'ORD'` | Code from `BR-028` (`ORD`, `EXP`, `DLX`, `SLX`, `EV`) | Transit service category. |
| `direction` | `VARCHAR(20)` | Yes | `'UP'` | `'UP' \| 'DOWN' \| 'CIRCULAR'` | Route direction. |
| `via` | `TEXT` | Yes | *None* | *None* | Comma-delimited list of via stops. |
| `configuration_v2`| `JSONB` | Yes | `'{}'` | Type `RouteConfigV2` | Complete modern multi-board studio payload. |
| `configuration_v1`| `JSONB` | Yes | `'{}'` | Legacy V1 flat schema | Backward compatibility schema. |
| `created_by` | `UUID` | Yes | *None* | `References auth.users.id` | Author UUID (Used for Regular customer RLS). |
| `status` | `VARCHAR(20)` | No | `'active'` | `'active' \| 'inactive' \| 'deleted'` | Operational status. |
| `deleted` | `BOOLEAN` | No | `false` | `idx_routes_depot_del`, `idx_routes_created_by_del` | Soft deletion flag. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | *None* | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Trigger `handle_updated_at` | Modification timestamp. |

---

### 7. `public.stops`
- **Purpose:** Multilingual bus stop registry, GPS coordinates, and TTS audio links.
- **RLS Enabled:** Yes (`Tenant users manage stops`).

| Column Name | Data Type | Nullable? | Default Value | Foreign Key / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key | Unique stop UUID. |
| `depot_id` | `UUID` | No | *None* | `FK -> depots.id` | Assigned depot scope. |
| `organization_id`| `UUID` | Yes | *None* | `FK -> organizations.id` | Parent transit organization. |
| `code` | `VARCHAR(50)` | No | *None* | Partial Unique per depot (`deleted=false`) | Telegraphic stop code (e.g., `STP_KOTI_01`). |
| `name` | `VARCHAR(255)` | No | *None* | `idx_unique_stops_depot_active` | Stop name in English (primary lookup). |
| `name_english` | `VARCHAR(255)` | Yes | *None* | *None* | Stop name in English Roman script. |
| `name_telugu` | `VARCHAR(255)` | Yes | *None* | *None* | Native Telugu script name (`గౌతమి/తెలుగు`). |
| `name_hindi` | `VARCHAR(255)` | Yes | *None* | *None* | Native Devanagari script name (`मंगल/हिन्दी`). |
| `audio_url_te` | `TEXT` | Yes | *None* | *None* | Supabase Storage URL for Telugu WAV audio clip. |
| `audio_url_hi` | `TEXT` | Yes | *None* | *None* | Supabase Storage URL for Hindi WAV audio clip. |
| `audio_url_en` | `TEXT` | Yes | *None* | *None* | Supabase Storage URL for English audio clip. |
| `deleted` | `BOOLEAN` | No | `false` | `idx_stops_depot_del` | Soft deletion flag. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | *None* | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Trigger `handle_updated_at` | Modification timestamp. |

---

### 8. `public.stop_audios`
- **Purpose:** Detail table for audio announcement clips associated with bus stops.
- **RLS Enabled:** Yes (`Tenant users manage stop audios`).

| Column Name | Data Type | Nullable? | Default Value | Foreign Key / Constraints | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key | Audio record UUID. |
| `stop_id` | `UUID` | No | *None* | `FK -> stops.id ON DELETE CASCADE` | Associated bus stop. |
| `language_code` | `VARCHAR(10)` | No | *None* | `'te-IN' \| 'hi-IN' \| 'en-IN'` | BCP-47 language tag. |
| `storage_path` | `TEXT` | No | *None* | *None* | Path inside Supabase `audios` bucket. |
| `file_size_bytes`| `INTEGER` | Yes | *None* | *None* | Binary audio size in bytes. |
| `duration_seconds`| `NUMERIC(5,2)`| Yes | *None* | *None* | Playback duration in seconds. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | *None* | Timestamp synthesized. |

---

### 9. `public.font_settings`
- **Purpose:** System font configurations and glyph metrics for LED rasterization.
- **RLS Enabled:** Yes (`All authenticated users view font settings`).

| Column Name | Data Type | Nullable? | Default Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | `gen_random_uuid()` | Primary Key. |
| `organization_id`| `UUID` | Yes | *None* | FK to organization (NULL for system defaults). |
| `font_family` | `VARCHAR(50)` | No | *None* | Font identifier (e.g., "gautami", "mangal", "notosans"). |
| `font_file` | `VARCHAR(100)` | No | *None* | Bundled TTF filename (`gautami.ttf`). |
| `pixel_height` | `INTEGER` | No | `16` | Matrix pixel height (7, 8, 10, 12, 14, 16, 24, 32). |
| `character_spacing`| `INTEGER`| No | `1` | Default column gap between letter matrices in pixels. |
| `deleted` | `BOOLEAN` | No | `false` | Soft delete flag. |
| `created_at` | `TIMESTAMPTZ` | No | `NOW()` | Creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | No | `NOW()` | Last update timestamp. |

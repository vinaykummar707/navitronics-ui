# Migration Compatibility and Data Preservation: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Data Migration Leads, Database Administrators, Hardware Engineers  

---

## 1. Migration Preservation Mandate

To guarantee that the target application seamlessly replaces the existing deployment without operational downtime, bus fleet reprogramming, or data corruption, the migration engineering team must adhere to the data preservation contracts specified in this document.

---

## 2. Critical Data Contracts & Preservation Rules

### 2.1 Dual Route Schema Preservation (V1 & V2 Coexistence)
- **Problem:** Older vehicle master display controllers deployed across regional depots run legacy firmware expecting flat V1 JSON/binary structures. Newer vehicles utilize multiboard V2 configurations.
- **Contract:**
  - Table `public.routes` must retain both `configuration_v2` and `configuration_v1` JSONB columns.
  - The bidirectional mapper [`routeConfigMapper.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/routeConfigMapper.ts) must be preserved in the target backend/frontend to ensure that any edit to a V2 route automatically updates the corresponding V1 representation, preventing controller export failures.

---

### 2.2 Relational Integrity & UUID Preservation
- **Primary Keys:** All existing entity UUIDs (`organizations.id`, `depots.id`, `routes.id`, `stops.id`) must be preserved verbatim during database migration.
- **Evaluation Guest User Identity:** The hardcoded guest account UUID `3fd42bb4-31fd-4f27-9fe9-f2dbb2d77b6c` must be preserved in `public.users` to support legacy automated evaluation test harnesses.
- **Soft Delete Protocol:** Rows with `deleted = true` must NOT be pruned or dropped during migration. They represent historical operational records and are required to prevent foreign-key orphan exceptions.

---

### 2.3 Partial Unique Constraint Invariants
- In PostgreSQL, unconditional unique constraints (`UNIQUE (depot_id, route_number)`) break soft-deletion because deleted records prevent creating a new route with the same number.
- The target database must preserve the partial unique indexes introduced in migration `20260923`:
  ```sql
  CREATE UNIQUE INDEX idx_unique_routes_depot_active
    ON public.routes (depot_id, LOWER(route_number))
    WHERE depot_id IS NOT NULL AND deleted = false;
  ```

---

### 2.4 Multilingual Script Encoding (UTF-8 Invariant)
- Stop and route tables store Indic Unicode text (Telugu script range `U+0C00` - `U+0C7F` and Devanagari range `U+0900` - `U+097F`).
- The target database must enforce database encoding `UTF8` with collation `C` or `und-x-icu` to prevent character corruption during ETL exports or database dumps.

---

### 2.5 Storage Object Directory Hierarchy
- Storage bucket `audios` stores audio announcement clips using the invariant pattern:
  $$\text{Storage Key} = \{\text{depot\_id}\}/\{\text{stop\_code}\}\_\{\text{language\_code}\}.\text{wav}$$
- Any reorganization of cloud storage buckets must preserve this file path convention to avoid breaking hardcoded URLs stored in `public.stops.audio_url_te` and `public.stops.audio_url_hi`.

---

## 3. Password Sanitization & Security Migration Plan

- **Current Vulnerability:** Passwords are stored in plaintext in `public.users.password` (`SEC-02`).
- **Migration Protocol:**
  1. During ETL data extraction, verify that every active user in `public.users` possesses an existing record in `auth.users` with a valid bcrypt password hash.
  2. For users whose passwords exist only in `public.users.password`, use the Supabase Admin Auth API (`auth.admin.createUser()` or `auth.admin.updateUserById()`) to set their hashed password in GoTrue.
  3. Drop column `password` from `public.users` in the target schema.
  4. Ensure that the migrated application uses standard Supabase Auth password verification with zero cleartext password storage.

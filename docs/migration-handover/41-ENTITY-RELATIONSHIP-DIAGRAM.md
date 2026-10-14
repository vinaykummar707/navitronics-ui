# Entity-Relationship Diagram: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Database Architects, Data Engineers, Software Engineers  

---

## 1. Global Entity-Relationship Diagram

The following Mermaid ER diagram documents all entities, primary keys (`PK`), foreign keys (`FK`), and relational cardinalities in the PostgreSQL database:

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ REGIONS : "has"
    ORGANIZATIONS ||--o{ DEPOTS : "owns"
    ORGANIZATIONS ||--o{ USERS : "employs"
    ORGANIZATIONS ||--o{ ROUTES : "contains"
    ORGANIZATIONS ||--o{ STOPS : "standardizes"
    ORGANIZATIONS ||--o{ FONT_SETTINGS : "customizes"

    REGIONS ||--o{ DEPOTS : "groups"
    REGIONS ||--o{ USERS : "supervises"

    DEPOTS ||--o{ USERS : "assigns"
    DEPOTS ||--o{ ROUTES : "dispatches"
    DEPOTS ||--o{ STOPS : "maintains"

    ROLES ||--o{ USERS : "grants_privileges"

    USERS ||--o{ ROUTES : "authors (created_by)"

    STOPS ||--o{ STOP_AUDIOS : "has_audio_clips"

    ORGANIZATIONS {
        uuid id PK
        varchar name
        varchar code
        varchar state
        varchar contact_email
        varchar contact_phone
        text address
        varchar customer_type
        boolean deleted
        timestamptz created_at
        timestamptz updated_at
    }

    REGIONS {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar code
        boolean deleted
        timestamptz created_at
        timestamptz updated_at
    }

    DEPOTS {
        uuid id PK
        uuid organization_id FK
        uuid region_id FK
        varchar name
        varchar code
        text location
        boolean deleted
        timestamptz created_at
        timestamptz updated_at
    }

    USERS {
        uuid id PK
        varchar username
        varchar email
        varchar password
        uuid role_id FK
        varchar role_code
        uuid organization_id FK
        uuid region_id FK
        uuid depot_id FK
        varchar customer_type
        varchar status
        boolean active
        boolean deleted
        timestamptz expires_at
        timestamptz created_at
        timestamptz updated_at
    }

    ROLES {
        uuid id PK
        varchar name
        text description
        jsonb permissions
        timestamptz created_at
    }

    ROUTES {
        uuid id PK
        uuid depot_id FK
        uuid organization_id FK
        varchar route_number
        varchar route_number_1
        varchar route_number_2
        varchar separator
        varchar name
        varchar service_type
        varchar direction
        text via
        jsonb configuration_v2
        jsonb configuration_v1
        uuid created_by FK
        varchar status
        boolean deleted
        timestamptz created_at
        timestamptz updated_at
    }

    STOPS {
        uuid id PK
        uuid depot_id FK
        uuid organization_id FK
        varchar code
        varchar name
        varchar name_english
        varchar name_telugu
        varchar name_hindi
        text audio_url_te
        text audio_url_hi
        text audio_url_en
        boolean deleted
        timestamptz created_at
        timestamptz updated_at
    }

    STOP_AUDIOS {
        uuid id PK
        uuid stop_id FK
        varchar language_code
        text storage_path
        integer file_size_bytes
        numeric duration_seconds
        timestamptz created_at
    }

    FONT_SETTINGS {
        uuid id PK
        uuid organization_id FK
        varchar font_family
        varchar font_file
        integer pixel_height
        integer character_spacing
        boolean deleted
        timestamptz created_at
        timestamptz updated_at
    }
```

---

## 2. Domain Subgraph Breakdowns

### 2.1 Organizational & Staff Hierarchy Domain
- **Key Relationships:**
  - An `Organization` can have multiple `Regions` ($1:N$).
  - An `Organization` has multiple `Depots` ($1:N$), either assigned to a `Region` or unassigned.
  - A `User` belongs to one `Role` ($N:1$).
  - A `User` can be globally scoped (`organization_id = NULL`), organization-scoped (`admin`), or depot-scoped (`operator`).
  - Standalone `Regular Customers` have `organization_id = NULL` and point to an auto-generated virtual `Depot`.

### 2.2 Route & Signboard Studio Domain
- **Key Relationships:**
  - An STU `Route` belongs to a specific `Depot` ($N:1$).
  - A Regular Customer `Route` has `depot_id = NULL` (or points to their virtual depot) and is owned directly by `created_by` pointing to `auth.users.id`.
  - The `configuration_v2` JSONB document stores the embedded multi-board layout (Front, Side, Rear, Internal) and sequence slides directly within the route record.

### 2.3 Multilingual Stops & Audio Storage Domain
- **Key Relationships:**
  - A `Stop` is scoped to a `Depot` ($N:1$).
  - A `Stop` has direct URL references (`audio_url_te`, `audio_url_hi`) pointing to WAV files in Supabase Storage.
  - A `Stop` can optionally link to multiple `StopAudios` detail rows ($1:N$) tracking playback metadata.

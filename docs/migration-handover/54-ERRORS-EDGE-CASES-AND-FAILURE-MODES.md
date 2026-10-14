# Errors, Edge Cases, and Failure Modes: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Reliability Engineers, QA Architects, Backend Developers  

---

## 1. Exception Handling Architecture

The application handles errors through client-side React Query exception traps, inline form validation alerts, graceful service fallbacks, and global toast notifications.

```mermaid
graph TD
    Op["User Operation (Save Route / Audio Synthesis)"]
    Op --> TryExec{"Service Execution"}

    TryExec -->|PostgreSQL 23505 Unique Collision| ErrUnique["Catch Constraint: Toast 'Code already in use'"]
    TryExec -->|PostgreSQL 23503 FK Conflict| ErrFK["Catch FK: Toast 'Cannot delete: Child records exist'"]
    TryExec -->|Sarvam AI 429 / 401 Outage| ErrTTS["Fallback: Save stop without audio; Toast warning"]
    TryExec -->|Google IME Offline| ErrIME["Fallback: Switch to offline Sanscript transliteration"]
    TryExec -->|Sidecar Port 5288 Down| ErrSidecar["Fallback: Switch to browser Canvas 2D font engine"]
    TryExec -->|Wizard Step 3 Fails (ARC-01)| ErrWiz["Partial State: Best-effort delete; Toast error"]
```

---

## 2. Exhaustive Edge Cases & Failure Modes Catalog

---

### `FAIL-001`: Non-Atomic Sequential Onboarding Failure (`ARC-01`)
- **Failure Description:** In `STUOnboardingWizard`, the client executes sequential API calls: Organization $\rightarrow$ Region $\rightarrow$ Depot $\rightarrow$ Auth User $\rightarrow$ User Profile. If step 4 or 5 fails (e.g., due to duplicate email or network drop), steps 1-3 have already been committed to the database.
- **Current Behavior:** The wizard executes a client-side pseudo-rollback by attempting manual `DELETE` requests against previously created records. If the browser tab is closed mid-operation, orphaned organizations or depots remain in the database.
- **Migration Mandate:** Encapsulate the entire 5-step onboarding sequence into a single atomic PostgreSQL stored procedure or Supabase Edge Function executed within a single transaction (`BEGIN ... COMMIT / ROLLBACK`).

---

### `FAIL-002`: Concurrent Edits & Stale Route Overwrites
- **Failure Description:** Two dispatchers at the same bus depot open the same route in the Route Studio concurrently. Operator A edits slides and saves. Operator B, unaware of Operator A's changes, saves their draft 10 seconds later.
- **Current Behavior:** The system issues a raw PostgREST `UPDATE` without optimistic locking. Operator B's write silently overwrites Operator A's changes (Last-Write-Wins).
- **Migration Mandate:** Add an `etag` or integer `version` column to `public.routes`. Mutate via:
  ```sql
  UPDATE public.routes 
  SET configuration_v2 = :data, version = version + 1 
  WHERE id = :id AND version = :clientVersion;
  ```
  If zero rows are updated, reject with HTTP 409 Conflict: "Route was updated by another operator. Please refresh."

---

### `FAIL-003`: Upstream Sarvam AI Speech Synthesis Outage
- **Failure Description:** During stop creation, the Sarvam AI TTS endpoint returns HTTP 429 (Rate limit reached), 503 (Outage), or 401 (Invalid API key).
- **Current Behavior:** `fetchTTS.ts` catches the error, logs a console message, and allows the stop record to be saved with `audio_url_te = NULL` and `audio_url_hi = NULL`. The UI renders an alert toast: "Audio synthesis failed: check API quota".
- **Recovery Path:** The stop card in `StopsPage` displays a "Generate Audio" button, allowing clerks to retry synthesis once quotas reset.

---

### `FAIL-004`: Desktop .NET Sidecar Port Collision / Unavailability
- **Failure Description:** Another application binds to port 5288, or Windows Defender blocks `BitmapFontApi.exe`.
- **Current Behavior:** `bitmapService.ts` detects connection refusal or timeout within 2000ms. It sets `isSidecarAvailable = false` and redirects all subsequent rasterization requests to the client-side HTML5 Canvas 2D engine using bundled TTF fonts (`gautami.ttf`, `mangal.ttf`).
- **Recovery Path:** Fully transparent to the user; on-screen simulation continues rendering without UI crashes.

---

### `FAIL-005`: Session Expiry Mid-Operation
- **Failure Description:** An operator's Supabase JWT access token expires or is revoked while they are actively designing a complex 10-slide route in Route Studio.
- **Current Behavior:** When the user clicks "Save Route", PostgREST returns HTTP 401 Unauthorized. TanStack Query catches the error, prompts a toast "Session expired", and React Router redirects to `/login`.
- **Defect:** Unsaved route changes in memory are lost upon redirect.
- **Migration Mandate:** Implement automatic background token refresh via GoTrue `autoRefreshToken: true` and persist unsaved route drafts in browser `sessionStorage` to restore upon re-authentication.

---

### `FAIL-006`: Foreign Key Constraint Violation on Deletion (PostgreSQL 23503)
- **Failure Description:** An administrator attempts to delete a Region that still has active Depots assigned to it, or a Depot that has active Routes.
- **Current Behavior:** If hard-deleted, PostgreSQL throws a 23503 constraint violation. Because the application implements soft-deletion (`deleted = true`), the update succeeds; however, child depots can appear orphaned if the UI fails to cascade the soft-delete filter.
- **Migration Mandate:** Implement database trigger or application check verifying that a region has zero active child depots before allowing `deleted = true`.

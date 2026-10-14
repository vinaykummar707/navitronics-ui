# Non-Functional Requirements: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Performance Engineers, DevOps, Security Architects, QA Leads  

---

## 1. Classification & Scope

This document specifies the non-functional characteristics, service-level targets, architectural constraints, and operational requirements governing `navitronics-ui`. Every requirement is categorized by quality attribute and given a stable identifier (`NFR-xxx`).

---

## 2. Performance & Responsiveness (`NFR-001` - `NFR-006`)

### `NFR-001`: LED Canvas Simulation Frame Rate & Render Latency
- **Requirement ID:** `NFR-001`
- **Category:** Performance / Graphics Rendering
- **Target Metric:** $\ge 60\text{ FPS}$ sustained on standard 1080p desktop display; render loop execution time $< 16.6\text{ ms}$ per frame.
- **Implementation Mechanism:** HTML5 Canvas 2D context double-buffering via `requestAnimationFrame` in [`SignboardCanvasStage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/SignboardCanvasStage.tsx#L45-L110).
- **Measurement Method:** Chrome DevTools Performance Profiler measuring paint times during multi-board continuous scroll playback.
- **Verification Status:** Verified.

### `NFR-002`: Local Sidecar Rasterization Response Latency
- **Requirement ID:** `NFR-002`
- **Category:** Inter-Process Communication (IPC) Performance
- **Target Metric:** Sidecar HTTP POST response time $< 40\text{ ms}$ on loopback `127.0.0.1:5288` for strings up to 64 Unicode characters.
- **Implementation Mechanism:** Native .NET 8 Kestrel web server in `BitmapFontApi.exe` serving compiled glyph lookup tables in memory.
- **Verification Status:** Verified.

### `NFR-003`: Large-Scale Transit Tabular Virtualization
- **Requirement ID:** `NFR-003`
- **Category:** UI Performance / Memory Optimization
- **Target Metric:** Initial render $< 500\text{ ms}$ and scroll responsiveness at $60\text{ FPS}$ for datasets containing up to 5,000 stops or 2,000 routes per depot.
- **Implementation Mechanism:** Virtualized DOM row rendering using `ag-grid-react` / `ag-grid-community` in [`RouteTable.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteTable.tsx#L35-L120) and [`StopsPage.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/StopsPage.tsx#L180-L290).
- **Verification Status:** Verified.

### `NFR-004`: Client Data Cache Freshness & Invalidation
- **Requirement ID:** `NFR-004`
- **Category:** Data Synchronization / Network Efficiency
- **Target Metric:** Server roundtrip suppression for identical queries within a 5-minute stale-time window; immediate optimistic invalidation on mutation.
- **Implementation Mechanism:** TanStack React Query (`@tanstack/react-query`) with query key namespacing in [`useCrud.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/hooks/useCrud.ts#L25-L95).
- **Verification Status:** Verified.

---

## 3. Reliability, Fault Tolerance & Graceful Degradation (`NFR-007` - `NFR-012`)

### `NFR-007`: Fallback on Sidecar Rasterizer Unavailability
- **Requirement ID:** `NFR-007`
- **Category:** Fault Tolerance / Graceful Degradation
- **Requirement Statement:** In the event that the .NET sidecar process `BitmapFontApi.exe` terminates unexpectedly or fails to bind to port 5288, the application must detect connection refusal within 2000ms, set an internal fallback flag, and switch seamlessly to browser Canvas 2D font rasterization without throwing uncaught UI exceptions.
- **Implementation Evidence:** [`src/services/bitmapService.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/services/bitmapService.ts#L45-L75).
- **Verification Status:** Verified.

### `NFR-008`: Dual-Tier Multilingual Transliteration Resilience
- **Requirement ID:** `NFR-008`
- **Category:** Network Resilience
- **Requirement Statement:** If internet connectivity is interrupted or Google Input Tools API becomes unreachable, the phonetic input fields must fall back to the bundled offline `@indic-transliteration/sanscript` JavaScript engine to maintain basic phonetic typing capabilities.
- **Implementation Evidence:** [`src/utils/transliteration.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/transliteration.ts#L10-L32).
- **Verification Status:** Verified.

### `NFR-009`: Non-Blocking Audio Generation Failures
- **Requirement ID:** `NFR-009`
- **Category:** Operation Resiliency
- **Requirement Statement:** Failure of third-party Sarvam AI TTS API calls (due to rate limits, invalid token, or upstream outage) must not prevent the persistence of bus stop or route records. Stop metadata must save successfully, with audio generation marked as pending/retryable.
- **Implementation Evidence:** [`src/ui/components/CreateStopForm.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateStopForm.tsx#L110-L135).
- **Verification Status:** Verified.

---

## 4. Security, Privacy & Compliance (`NFR-013` - `NFR-017`)

### `NFR-013`: Cryptographic Authentication & Token Isolation
- **Requirement ID:** `NFR-013`
- **Category:** Security / Session Integrity
- **Requirement Statement:** All client-to-backend communications must be authenticated via Supabase JWTs with SHA-256 HMAC signatures. Staff creation flows must use isolated non-persisted clients to avoid session contamination.
- **Implementation Evidence:** [`src/supabaseClient.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/supabaseClient.ts#L8-L16).
- **Verification Status:** Verified.

### `NFR-014`: Row-Level Database Security (RLS) Enforcement
- **Requirement ID:** `NFR-014`
- **Category:** Database Security / Multi-Tenancy Isolation
- **Requirement Statement:** Every PostgreSQL table storing business or user data must have Row-Level Security enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`). Client queries must only return records scoped to the authenticated user's organization or virtual depot.
- **Implementation Evidence:** [`supabase/migrations/20260921_enable_row_level_security.sql`](file:///Users/vinaykongari/Nav/old/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L1-L180).
- **Critical Security Finding:** Note that `public.users` currently has an overly permissive policy (`SEC-01`) that must be hardened in the target application.
- **Verification Status:** Verified (with Known Defect).

### `NFR-015`: Zero Plaintext Secret Exposure (Target Architecture Requirement)
- **Requirement ID:** `NFR-015`
- **Category:** Secrets Management / Data Privacy
- **Requirement Statement:** The target application must eliminate all cleartext password persistence in `public.users.password` (`SEC-02`) and move third-party API keys (`VITE_SARVAM_API_KEY`, `SEC-03`) into server-side Supabase Edge Functions or backend environment secrets.
- **Verification Status:** Partially Verified (Audited defect in source; mandatory requirement for migration target).

---

## 5. Compatibility, Portability & Deployment (`NFR-018` - `NFR-022`)

### `NFR-018`: Dual Web and Desktop Runtime Compatibility
- **Requirement ID:** `NFR-018`
- **Category:** Cross-Platform Portability
- **Requirement Statement:** The codebase must execute identically as a standard web application hosted on modern browsers (Chromium $\ge 100$, Firefox $\ge 115$, Safari $\ge 16$) and as an offline-capable Windows desktop application packaged via Electron 44 and electron-builder.
- **Implementation Evidence:** [`package.json`](file:///Users/vinaykongari/Nav/old/navitronics-ui/package.json#L58-L60), [`electron/main.cjs`](file:///Users/vinaykongari/Nav/old/navitronics-ui/electron/main.cjs#L1-L120).
- **Verification Status:** Verified.

### `NFR-019`: Display Resolution & Industrial Usability
- **Requirement ID:** `NFR-019`
- **Category:** Human Factors / Industrial Ergonomics
- **Requirement Statement:** The user interface must be fully operational on low-resolution industrial PCs commonly deployed in bus depot dispatcher kiosks (minimum resolution $1366 \times 768$ pixels), providing collapsible navigation sidebars and scalable canvas preview zoom (50% to 200%).
- **Implementation Evidence:** [`src/ui/layouts/DefaultPageLayout.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/layouts/DefaultPageLayout.tsx#L55-L90), [`src/store/useToggleStore.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/store/useToggleStore.ts).
- **Verification Status:** Verified.

### `NFR-020`: Indian Transit Firmware Compatibility
- **Requirement ID:** `NFR-020`
- **Category:** Hardware Interoperability
- **Requirement Statement:** Exported binary and JSON data structures must maintain exact byte-alignment and schema parity with the microcontroller firmware running on Navitronix LED Master Display Controllers deployed across state road transport fleets.
- **Implementation Evidence:** [`src/utils/routeConfigMapper.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/routeConfigMapper.ts#L1-L180).
- **Verification Status:** Verified.

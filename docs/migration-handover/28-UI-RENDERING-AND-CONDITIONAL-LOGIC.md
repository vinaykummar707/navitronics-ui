# UI Rendering and Conditional Logic: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Frontend Engineers, Design System Specialists, QA Testers  

---

## 1. Conditional UI Logic Catalog

This document details all conditional rendering rules, view-state toggles, and dynamic presentation logic discovered across the React component hierarchy.

---

## 2. Conditional Rendering Rules

### `COND-001`: Multi-Tier Sidebar Navigation Visibility
- **Condition ID:** `COND-001`
- **Location:** [`src/ui/layouts/DefaultPageLayout.tsx:L60-L140`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/layouts/DefaultPageLayout.tsx#L60-L140)
- **Inputs:** `user.role_code`, `customerType(user)`.
- **Expression / Logic:**
  ```typescript
  const isMaster = user?.role_code === 'master';
  const isSTU = !isMaster && user?.organization_id != null;
  const isRegular = !isMaster && user?.organization_id == null && user?.role_code !== 'guest';
  const isGuest = user?.role_code === 'guest';
  ```
- **Resulting UI:**
  - `isMaster`: Renders Dashboard, Organizations, Regions, Depots, Stops, Routes, Regular Customers, Guests, Users, Roles, CCTV, Utility.
  - `isSTU`: Renders Dashboard, Depots, Stops, Routes, Users (depot-scoped), CCTV.
  - `isRegular`: Renders only Regular Routes (`/regular-routes`) and Settings.
  - `isGuest`: Renders Routes (`/routes`, read-only view) and Settings.
- **Verification Status:** Verified.

---

### `COND-002`: Global Depot Context Switcher Visibility
- **Condition ID:** `COND-002`
- **Location:** [`src/components/PageHeader.tsx:L30-L55`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/PageHeader.tsx#L30-L55)
- **Inputs:** `customerType(user)`.
- **Expression:** `isMaster || isSTU`
- **Resulting UI:**
  - `True`: Renders interactive depot selector dropdown in page header banner.
  - `False`: Depot selector omitted completely from header; page title spans full width.
- **Verification Status:** Verified.

---

### `COND-003`: Signboard Studio Canvas Partitioning by Display Format
- **Condition ID:** `COND-003`
- **Location:** [`src/ui/components/SignboardCanvasStage.tsx:L120-L240`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/SignboardCanvasStage.tsx#L120-L240)
- **Inputs:** `activeBoard.format` ('single_text' | 'two_half' | 'three_section').
- **Resulting Canvas Render:**
  - `single_text`: Single text line rendered horizontally across width of canvas ($0 \le x \le W$).
  - `two_half`: Left vertical partition ($0 \le x < 32$) reserved for static Route Number; right partition ($32 \le x \le W$) renders scrolling destination stops.
  - `three_section`: Left partition ($0 \le x < 32$) reserved for Route Number; right upper partition ($0 \le y < H/2$) renders Upper Half destination; right lower partition ($H/2 \le y < H$) renders Lower Half via points.
- **Verification Status:** Verified.

---

### `COND-004`: Route Number Stacked vs Inline Formatting
- **Condition ID:** `COND-004`
- **Location:** [`src/ui/components/RouteNumberControl.tsx:L40-L75`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/RouteNumberControl.tsx#L40-L75)
- **Inputs:** `boardHeight` (number), `routeNumber2` (string).
- **Expression:** `boardHeight >= 32 && routeNumber2.length > 0`
- **Resulting UI:**
  - `True`: Renders stacked preview toggle and dual 16px font matrix controls.
  - `False`: Renders single horizontal text field with delimiter selector (`-` or `/`).
- **Verification Status:** Verified.

---

### `COND-005`: Rasterizer Engine Fallback Degradation
- **Condition ID:** `COND-005`
- **Location:** [`src/services/bitmapService.ts:L45-L70`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/services/bitmapService.ts#L45-L70)
- **Inputs:** `isSidecarAvailable` (boolean ref).
- **Expression:** `isElectronRuntime && isSidecarAvailable`
- **Resulting Execution:**
  - `True`: Dispatches HTTP POST to loopback sidecar on port 5288.
  - `False`: Transparently executes client-side HTML5 Canvas 2D rasterization using embedded TTF fonts.
- **Verification Status:** Verified.

---

### `COND-006`: IME Indic Transliteration Mode
- **Condition ID:** `COND-006`
- **Location:** [`src/components/IMEInput.tsx:L50-L85`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/IMEInput.tsx#L50-L85)
- **Inputs:** `targetLanguage` ('en' | 'te' | 'hi'), `isIMEActive` (boolean).
- **Resulting UI:**
  - `targetLanguage === 'en' || !isIMEActive`: Standard native text field; keystrokes passed directly to input value.
  - `targetLanguage === 'te' || targetLanguage === 'hi'`: Keystrokes intercepted on spacebar/enter and transliterated via Google Input Tools or Sanscript before committing.
- **Verification Status:** Verified.

---

### `COND-007`: Plaintext Password Eye-Toggle Visibility
- **Condition ID:** `COND-007`
- **Location:** [`src/ui/components/PasswordViewerCell.tsx:L25-L55`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/PasswordViewerCell.tsx#L25-L55)
- **Inputs:** `isVisible` (local boolean state).
- **Resulting UI:**
  - `isVisible === false`: Renders bulleted mask `••••••••` with open eye icon.
  - `isVisible === true`: Renders cleartext password string with strikethrough eye icon (**`SEC-02`**).
- **Verification Status:** Verified.

---

### `COND-008`: Guest Evaluator Read-Only Action Suppression
- **Condition ID:** `COND-008`
- **Location:** [`src/pages/v2/RoutesPage.tsx:L80-L110`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/pages/v2/RoutesPage.tsx#L80-L110)
- **Inputs:** `user.role_code === 'guest'`.
- **Resulting UI:**
  - `True`: "Create Route", "Duplicate", and "Delete" buttons hidden; "Edit" opens Route Studio in read-only mode with Save button disabled.
  - `False`: Standard CRUD buttons visible and active.
- **Verification Status:** Verified.

---

### `COND-009`: Audio Player Preview vs Generation Action
- **Condition ID:** `COND-009`
- **Location:** [`src/ui/components/AudioFileContainer.tsx:L30-L75`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/AudioFileContainer.tsx#L30-L75)
- **Inputs:** `audioUrl` (string | null), `isGenerating` (boolean).
- **Resulting UI:**
  - `isGenerating === true`: Renders spinning loader with text "Synthesizing AI Audio...".
  - `audioUrl != null`: Renders mini waveform visualizer with Play/Pause button.
  - `audioUrl == null`: Renders "Generate Audio" button with Sarvam AI icon.
- **Verification Status:** Verified.

---

### `COND-010`: Empty State vs Tabular Data View
- **Condition ID:** `COND-010`
- **Location:** Universal across all catalog views (`RoutesPage`, `StopsPage`, `DepotsPage`).
- **Inputs:** `data.length === 0` and `!isLoading`.
- **Resulting UI:**
  - `True`: Renders centered `EmptyState` component (`COMP-005`) with descriptive illustration, context message, and primary creation CTA.
  - `False`: Renders virtualized data grid table.
- **Verification Status:** Verified.

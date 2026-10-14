# API and External Integration Catalog: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Integration Architects, Backend Engineers, DevOps Engineers  

---

## 1. Network Integration Topology

The application orchestrates communications across four distinct boundaries: local desktop sidecar IPC, Supabase cloud backend services, AI synthesis clouds, and proprietary hardware firmware compilation engines.

```mermaid
graph LR
    subgraph Client ["Client Runtime (Web / Electron)"]
        SPA["React 18 Single-Page Application"]
    end

    subgraph LocalIPC ["Local Desktop Boundary (127.0.0.1)"]
        Sidecar[".NET 8 BitmapFontApi (Port 5288)"]
    end

    subgraph SupabaseCloud ["Supabase Backend Infrastructure"]
        PostgREST["PostgREST API (/rest/v1)"]
        GoTrue["Supabase Auth (/auth/v1)"]
        Storage["Storage API (/storage/v1)"]
    end

    subgraph ExternalCloud ["Third-Party & Hardware APIs"]
        Sarvam["Sarvam AI TTS API (api.sarvam.ai)"]
        GoogleIME["Google Input Tools (inputtools.google.com)"]
        ControllerAPI["Navitronix Controller API (api.navitronix.in)"]
    end

    SPA -->|API-004: HTTP POST| Sidecar
    SPA -->|API-001: HTTPS / PostgREST| PostgREST
    SPA -->|API-002: HTTPS / GoTrue| GoTrue
    SPA -->|API-003: HTTPS / S3 Storage| Storage
    SPA -->|API-005: HTTPS POST (bulbul:v2)| Sarvam
    SPA -->|API-006: HTTPS GET (Translit)| GoogleIME
    SPA -->|API-007: HTTPS POST (ZIP Export)| ControllerAPI
```

---

## 2. Exhaustive Integration Contracts

---

### `API-001`: Supabase PostgREST Database API
- **Integration ID:** `API-001`
- **Service Name:** Supabase PostgREST Engine
- **Endpoint URL:** `https://supabase.navitronix.in/rest/v1/*`
- **Protocol / Method:** HTTPS / GET, POST, PATCH, DELETE
- **Calling Modules:** [`useCrud.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/hooks/useCrud.ts), [`useRoutes.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/hooks/useRoutes.ts), all page components.
- **Authentication:**
  - `apikey`: Public anon JWT key.
  - `Authorization`: `Bearer <user_jwt_token>`.
- **Request Headers:**
  ```http
  apikey: eyJhbGciOiJIUzI1Ni...
  Authorization: Bearer <jwt>
  Content-Type: application/json
  Prefer: return=representation
  ```
- **Response Format:** JSON Array / Single Object.
- **Error Handling:** Returns PostgREST JSON `{ message, code, details, hint }`.
- **Status:** Verified.

---

### `API-002`: Supabase GoTrue Authentication API
- **Integration ID:** `API-002`
- **Service Name:** Supabase GoTrue Auth
- **Endpoint URL:** `https://supabase.navitronix.in/auth/v1/*`
- **Protocol / Method:** HTTPS / POST
- **Primary Calls:**
  - `POST /auth/v1/token?grant_type=password`: Exchanges email/password for JWT session.
  - `POST /auth/v1/signup`: Creates new user account (invoked via `supabaseAuthHelper`).
  - `POST /auth/v1/logout`: Revokes active refresh token.
- **Payload Schema (`signInWithPassword`):**
  ```json
  {
    "email": "operator@depot.in",
    "password": "SecretPassword123!"
  }
  ```
- **Response Schema:**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 3600,
    "refresh_token": "...",
    "user": { "id": "uuid", "email": "..." }
  }
  ```
- **Status:** Verified.

---

### `API-003`: Supabase S3-Compatible Storage API
- **Integration ID:** `API-003`
- **Service Name:** Supabase Storage
- **Endpoint URL:** `https://supabase.navitronix.in/storage/v1/object/*`
- **Target Buckets:** `audios`, `stops`.
- **Protocol / Method:** HTTPS / POST (Upload), GET (Download/Stream), DELETE.
- **Upload Request:**
  - URL: `https://supabase.navitronix.in/storage/v1/object/audios/{depot_id}/{stop_code}_{lang}.wav`
  - Body: Binary WAV Blob (`Content-Type: audio/wav`).
- **Download / Stream:**
  - URL: `https://supabase.navitronix.in/storage/v1/object/public/audios/...`
  - Access: Public read without authorization header.
- **Status:** Verified.

---

### `API-004`: Local .NET 8 Sidecar BitmapFontApi
- **Integration ID:** `API-004`
- **Service Name:** Local Desktop .NET 8 Font Rasterization Engine (`BitmapFontApi.exe`)
- **Endpoint URL:** `http://127.0.0.1:5288/api/bitmap`
- **Protocol / Method:** Loopback HTTP / POST
- **Calling Service:** [`src/services/bitmapService.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/services/bitmapService.ts#L25-L65)
- **Request Payload:**
  ```json
  {
    "text": "మహాత్మా గాంధీ బస్ స్టేషన్",
    "font_size": 16,
    "language": "te",
    "height": 16,
    "family": "gautami",
    "weight": "Regular"
  }
  ```
- **Response Payload:**
  ```json
  {
    "width": 128,
    "height": 16,
    "ascii_matrix": [
      "..####..####..####..",
      ".#....#.#...#.#...#.",
      "####################"
    ]
  }
  ```
- **Failure & Timeout Behavior:** Client enforces 2000ms timeout. On connection error, sets fallback flag and redirects rendering to browser Canvas (`BR-013`).
- **Security Finding:** `SEC-04` (Unauthenticated loopback endpoint).
- **Status:** Verified.

---

### `API-005`: Sarvam AI Multilingual Speech Synthesis (TTS) API
- **Integration ID:** `API-005`
- **Service Name:** Sarvam AI Speech Engine
- **Endpoint URL:** `https://api.sarvam.ai/text-to-speech`
- **Protocol / Method:** HTTPS / POST
- **Calling Module:** [`src/utils/fetchTTS.ts`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/fetchTTS.ts#L30-L75)
- **Request Headers:**
  ```http
  api-subscription-key: <VITE_SARVAM_API_KEY>
  Content-Type: application/json
  ```
- **Request Payload:**
  ```json
  {
    "inputs": ["మెహదీపట్నం బస్ స్టాప్"],
    "target_language_code": "te-IN",
    "speaker": "meera",
    "pitch": 0,
    "pace": 1.0,
    "loudness": 1.0,
    "speech_sample_rate": 22050,
    "enable_preprocessing": true,
    "model": "bulbul:v2"
  }
  ```
- **Response Payload:**
  ```json
  {
    "audios": [
      "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA..."
    ]
  }
  ```
- **Post-Processing:** Client decodes base64 string into `Uint8Array`, wraps in `Blob({ type: 'audio/wav' })`, and uploads via `API-003`.
- **Critical Security Finding:** `SEC-03` (Secret key exposed in client environment).
- **Status:** Verified.

---

### `API-006`: Google Input Tools Cloud Transliteration
- **Integration ID:** `API-006`
- **Service Name:** Google Input Tools API
- **Endpoint URL:** `https://inputtools.google.com/request`
- **Protocol / Method:** HTTPS / GET
- **Calling Component:** [`src/components/IMEInput.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/IMEInput.tsx#L45-L80)
- **Query Parameters:**
  - `text`: Romanized string (e.g., `secunderabad`).
  - `itc`: Indic input tool code (`te-t-i0-und` for Telugu, `hi-t-i0-und` for Hindi).
  - `num`: Candidate count (`5`).
  - `cp`: Cursor position (`0`).
  - `cs`: Character set (`1`).
- **Response Format:**
  ```json
  [
    "SUCCESS",
    [
      [
        "secunderabad",
        ["సికింద్రాబాద్", "సికింద్రాబాదు", "సికిందరాబాద్"],
        [],
        {"annotation": []}
      ]
    ]
  ]
  ```
- **Fallback:** In offline mode, falls back to `@indic-transliteration/sanscript` (`BR-014`).
- **Status:** Verified.

---

### `API-007`: Navitronix Controller Hardware Export API
- **Integration ID:** `API-007`
- **Service Name:** Navitronix Controller Compiler Service
- **Endpoint URLs:**
  - V2 Bundle: `https://api.navitronix.in/navitranix/api/routes/export-v2`
  - V1 Binary: `https://api.navitronix.in/navitranix/api/routes/export`
- **Protocol / Method:** HTTPS / POST
- **Calling Component:** [`src/components/ExportFormatDialog.tsx`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/components/ExportFormatDialog.tsx#L40-L85)
- **Request Headers:**
  ```http
  Content-Type: application/json
  Accept: application/zip, application/octet-stream
  ```
- **Request Payload:** Serialized `DisplayConfigPostRequest` object containing multiboard configurations and slide arrays.
- **Response Body:** Binary byte stream of compiled firmware ZIP archive (`application/zip`) containing:
  - `ROUTES.BIN`: Master microcontroller route directory.
  - `DISPLAYS.DAT`: Hardware timing and matrix definitions.
  - `AUDIO/*.WAV`: Downloaded audio announcements.
- **Client Processing:** Stream piped directly into `file-saver` saving `{route_number}_FIRMWARE.ZIP` to local disk.
- **Status:** Verified.

# Security and Privacy Requirements: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Chief Information Security Officer (CISO), Security Architects, Full-Stack Developers  

---

## 1. Security Architecture & Threat Model

Navitronix RMS processes transit operational data, driver dispatch schedules, and staff credentials. This document catalogs all verified security findings, privacy constraints, and mandatory security requirements for the target migration architecture.

---

## 2. Verified Security Vulnerabilities & Audit Findings

### `SEC-01`: RLS Privilege Escalation / Self-Promotion Vulnerability
- **Severity:** **CRITICAL** (CVSS 9.1)
- **Vulnerability Type:** CWE-285: Improper Authorization / CWE-732: Incorrect Permission Assignment
- **Source Location:** [`supabase/migrations/20260921_enable_row_level_security.sql:L125-L131`](file:///Users/vinaykongari/Nav/old/navitronics-ui/supabase/migrations/20260921_enable_row_level_security.sql#L125-L131)
- **Description:** The policy `Users can view and edit own profile` on table `public.users` uses `FOR ALL` with `WITH CHECK (id = auth.uid() OR user_id = auth.uid())`. 
- **Exploitation Path:** An authenticated user with low privileges (such as a depot operator or regular customer) can dispatch a direct PostgREST `PATCH` or `UPDATE` request modifying their own `role_id` to point to the `master` role UUID. The `is_super_admin()` function immediately evaluates to `TRUE`, granting the attacker global read/write access to all tenants.
- **Mandatory Target Remediation:** Split into `FOR SELECT` and `FOR UPDATE`. On `UPDATE`, restrict updatable columns via database trigger or explicit view to prevent modifying `role_id`, `organization_id`, or `active`.

---

### `SEC-02`: Plaintext Password Storage and UI Exposure
- **Severity:** **CRITICAL** (CVSS 8.8)
- **Vulnerability Type:** CWE-256: Plaintext Storage of a Password / CWE-312: Cleartext Storage of Sensitive Information
- **Source Location:** [`src/ui/components/CreateUserForm2.tsx:L180-L195`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/CreateUserForm2.tsx#L180-L195), [`src/ui/components/PasswordViewerCell.tsx:L25-L55`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/ui/components/PasswordViewerCell.tsx#L25-L55)
- **Description:** While Supabase Auth stores hashed passwords in `auth.users`, the application duplicates the raw user password into column `public.users.password` as an unencrypted string. Furthermore, the administration table renders a `PasswordViewerCell` component allowing administrators to view employee passwords in cleartext.
- **Mandatory Target Remediation:** Completely drop column `public.users.password`. Rely exclusively on Supabase GoTrue bcrypt hashes. Remove `PasswordViewerCell` and implement an automated password-reset email workflow.

---

### `SEC-03`: Client-Side Third-Party API Key Exposure
- **Severity:** **HIGH** (CVSS 7.5)
- **Vulnerability Type:** CWE-798: Use of Hard-coded Credentials
- **Source Location:** [`.env.example:L1`](file:///Users/vinaykongari/Nav/old/navitronics-ui/.env.example#L1), [`src/utils/fetchTTS.ts:L25-L40`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/utils/fetchTTS.ts#L25-L40)
- **Description:** The Sarvam AI Text-to-Speech API key is prefixed with `VITE_` (`VITE_SARVAM_API_KEY`), which causes Vite to compile the secret key directly into client-side JavaScript bundles. Any user can extract the key from browser DevTools and consume paid API credits.
- **Mandatory Target Remediation:** Move all Sarvam AI API interactions into a Supabase Edge Function (`supabase/functions/synthesize-speech`). The Edge Function validates user JWTs and calls Sarvam AI using server-side environment secrets.

---

### `SEC-04`: Unauthenticated Loopback Sidecar IPC
- **Severity:** **MEDIUM** (CVSS 5.3)
- **Vulnerability Type:** CWE-306: Missing Authentication for Critical Function
- **Source Location:** [`src/services/bitmapService.ts:L20-L45`](file:///Users/vinaykongari/Nav/old/navitronics-ui/src/services/bitmapService.ts#L20-L45)
- **Description:** The desktop Electron process binds the .NET sidecar HTTP server to `127.0.0.1:5288` without requiring an API key or mutual authentication token. Any local process or malicious script running on the user workstation can issue requests to the port.
- **Mandatory Target Remediation:** Generate an ephemeral session secret in Electron `main.cjs` when spawning the sidecar and require a `X-Sidecar-Token` header on all IPC requests.

---

## 3. Privacy, PII & Operational Security Requirements

### `SEC-REQ-001`: Data Minimization & PII Protection
- User profiles must store only necessary identity attributes: Full Name, Business Email, and Contact Phone.
- Passwords, OTPs, and password reset tokens must NEVER be stored in application tables or application log outputs.

### `SEC-REQ-002`: Cross-Tenant Data Isolation
- State Road Transport Corporations (STUs) are multi-tenant competitors. All queries must enforce strict tenant boundaries through `organization_id` filters and PostgreSQL RLS.
- Standalone Regular Customers must be strictly quarantined to their virtual depots.

### `SEC-REQ-003`: Audit Logging & Tamper Evidence
- The target application must implement an immutable `public.audit_logs` table recording critical administrative operations:
  - User creation, deactivation, and role changes.
  - Organization and depot creation/deletion.
  - Route deletion and firmware exports.
  - Recording actor ID, timestamp, target entity, and IP address.

### `SEC-REQ-004`: Storage Bucket Access Controls
- Audio bucket `audios` must enforce write authorization scoped to the depot directory (`audios/{depot_id}/*`).
- File uploads must validate MIME types (`audio/wav`, `audio/mpeg`) and enforce a maximum file size limit of 5 MB.

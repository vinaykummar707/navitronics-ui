# Requirement Gaps and Unverified Behavior: Navitronix RMS

**Target Application:** Navitronix RMS (`navitronics-ui`)  
**Specification Version:** 1.0.0-FINAL  
**Date:** October 12, 2026  
**Status:** Verified  
**Audience:** Project Stakeholders, Lead Architects, Technical Leadership  

---

## 1. Gaps and Unverified Scope Register

In compliance with Principle 2.3 ("Separate facts from assumptions") and Principle 2.4 ("No silent omissions"), this document catalogs all areas of functionality that could not be fully reverse-engineered from the repository, depend on external closed systems, or represent incomplete placeholder code.

---

## 2. Unresolved Gaps & Dependencies

| Gap ID | Scope Area | Severity | Current Status | Description & Impact | Stakeholder Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GAP-001` | CCTV Surveillance (`/cctv`) | Low | **Not Implemented** | `CCTVPage.tsx` renders a static placeholder stating module is under development. No RTSP video streaming, HLS endpoints, or hardware camera drivers exist in the codebase. | Confirm whether CCTV module should be implemented in target project or excluded from v1 scope. |
| `GAP-002` | Hardware Diagnostic Utility (`/utility`) | Low | **Not Implemented** | `UtilityPage.tsx` renders an empty placeholder view. No serial port or USB testing routines exist in this repository. | Confirm whether diagnostic tools should be implemented as native Electron IPC modules. |
| `GAP-003` | Remote Controller API Compiler | High | **External / Black Box** | Firmware compilation endpoints (`api.navitronix.in/navitranix/api/routes/export-v2`) run on an external proprietary server. The binary translation algorithms and byte layouts are not hosted in this repository. | Stakeholders must provide API access, documentation, or source code for the Navitronix Controller compilation service. |
| `GAP-004` | Production Database Secrets | High | **External Config** | Supabase `service_role` secret and database administration credentials are not stored in the repository. | Infrastructure team must provide target Supabase project keys and database migration access. |
| `GAP-005` | Automated Test Suite | Medium | **Zero Tests (`TST-01`)** | Repository contains zero unit, integration, or E2E tests. Functional requirements were reverse-engineered from source and manual QA audits. | Receiving team must author automated test suite satisfying `63-MIGRATION-ACCEPTANCE-CRITERIA.md`. |
| `GAP-006` | Offline Desktop Storage | Medium | **Inferred Architecture** | Although packaged via Electron, the desktop application communicates directly with Supabase cloud PostgREST endpoints and lacks an offline SQLite sync engine. | Confirm whether target desktop client requires full offline operation with local database sync. |

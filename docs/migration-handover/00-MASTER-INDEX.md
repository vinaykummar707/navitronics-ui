# Master Index: Navitronix RMS Migration Handover Documentation

**Target System:** Navitronix RMS (Route Management System & Digital Destination Display Studio)  
**Source Codebase:** `navitronics-ui`  
**Target Repository Branch:** `windows-exe` (merged with `ui-refactor-sub`)  
**Commit Inspected:** `16f3c5b` ("splitroute")  
**Specification Version:** 1.0.0-FINAL  
**Date of Assessment:** October 12, 2026  
**Audience:** Incoming Migration Engineering Team, Principal Architects, Lead Business Analysts, Database Engineers, Security Reviewers  

---

## 1. Documentation Purpose and Scope

This documentation suite constitutes an exhaustive, implementation-independent, reverse-engineered technical and functional handover specification for the **Navitronix RMS** application.

Leadership has mandated migrating the existing application to a new enterprise system. This documentation is engineered to ensure that a receiving engineering team can faithfully reconstruct the application's complete functional scope, user workflows, multi-tier tenant architecture, security boundary model, database contracts, LED signboard rendering engines, and hardware export mechanisms without needing to consult the legacy code or contact the original development team.

---

## 2. Reading Order & Document Map

The specification is structured into seven logical modules containing 39 discrete documentation artifacts plus an automated tracking manifest:

```
docs/migration-handover/
├── 00-MASTER-INDEX.md                          # Master navigation, conventions, and status (THIS FILE)
├── 01-EXECUTIVE-SUMMARY.md                      # High-level business purpose, modules, and architecture summary
├── 02-SCOPE-AND-COVERAGE.md                     # In-scope vs out-of-scope boundaries, file counts, and coverage metrics
├── 03-ASSUMPTIONS-DECISIONS-OPEN-QUESTIONS.md   # Registers for assumptions, confirmed architectural decisions, and questions
│
├── 10-SYSTEM-ARCHITECTURE.md                   # System boundaries, technology stack, and module topology
├── 11-APPLICATION-LIFECYCLE.md                 # Bootstrap sequence, authentication lifecycle, and state hydration
├── 12-ROUTE-AND-NAVIGATION-INVENTORY.md        # Exhaustive route catalog, route guards, parameters, and redirects
├── 13-COMPONENT-AND-MODULE-INVENTORY.md        # Complete catalog of UI components, layouts, hooks, and services
│
├── 20-FUNCTIONAL-REQUIREMENTS.md               # Standardized functional requirements (FR-001 through FR-050+)
├── 21-NON-FUNCTIONAL-REQUIREMENTS.md           # Performance, reliability, browser, accessibility, and security standards
├── 22-PAGE-BY-PAGE-SPECIFICATIONS.md           # Exhaustive page UI, data dependencies, and state specifications
├── 23-USER-OPERATIONS-AND-CRUD.md              # User operations catalog (OP-001 through OP-045+) with end-to-end paths
├── 24-BUSINESS-RULES-AND-DECISION-TABLES.md    # Business rules, validation formulas, and decision matrices (BR-001+)
├── 25-USER-WORKFLOWS-AND-STATE-MACHINES.md     # Step-by-step user journeys and lifecycle state diagrams (WF-001+)
├── 26-FORMS-VALIDATION-AND-ERRORS.md           # Form field schemas, validation rules, sanitization, and error states
├── 27-TABLES-SEARCH-FILTERS-AND-PAGINATION.md  # Tabular views, multi-column search, client/server filtering, and pagination
├── 28-UI-RENDERING-AND-CONDITIONAL-LOGIC.md    # Conditional rendering expressions, role gates, and visual flags (COND-001+)
│
├── 30-AUTHENTICATION-AND-SESSION-MANAGEMENT.md # Supabase Auth, session lifecycle, token recovery, and session drift
├── 31-ROLES-PERMISSIONS-AND-RBAC.md            # Role definitions, hierarchy, and complete Role x Page x Operation matrix
├── 32-AUTHORIZATION-AND-RLS-POLICIES.md        # PostgreSQL Row-Level Security policies, loopholes, and privilege boundaries
├── 33-SECURITY-AND-PRIVACY-REQUIREMENTS.md     # Data protection, credentials hygiene, audit trails, and security gaps
│
├── 40-DATABASE-SCHEMA-AND-DATA-DICTIONARY.md   # Complete PostgreSQL tables, columns, constraints, and data dictionary
├── 41-ENTITY-RELATIONSHIP-DIAGRAM.md           # Mermaid ER diagrams covering STU hierarchy and standalone routes
├── 42-DATABASE-QUERIES-AND-MUTATIONS.md        # PostgREST calls, custom query modifiers, joins, and mutation triggers
├── 43-DATABASE-MIGRATIONS-AND-SEED-DATA.md     # Migration chronological log, soft delete partial indexes, and seed values
├── 44-TYPES-INTERFACES-AND-DATA-CONTRACTS.md   # TypeScript interfaces, domain contracts, and serialization models
├── 45-API-AND-INTEGRATION-CATALOG.md           # External REST integrations (Sarvam AI, Controller API, Bitmap API, Google IME)
├── 46-FILE-STORAGE-IMPORT-EXPORT.md            # Supabase Storage buckets, audio upload pipelines, CSV import, and USB ZIP
├── 47-REALTIME-BACKGROUND-JOBS-AND-NOTIFICATIONS.md # Audio synthesis queues, toast feedback, and polling side effects
│
├── 50-ENVIRONMENT-AND-CONFIGURATION.md         # Environment variables, client keys, build flags, and desktop configs
├── 51-BUILD-DEPLOYMENT-AND-INFRASTRUCTURE.md   # Vite compilation, Rollup manual chunking, Electron packaging, and NSIS scripts
├── 52-LOGGING-MONITORING-AND-OBSERVABILITY.md  # Logging conventions, error reporting, network telemetry, and observability gaps
├── 53-TEST-CATALOG-AND-VERIFICATION.md         # Automated test inventory (0% baseline), QA test cases, and verification gap
├── 54-ERRORS-EDGE-CASES-AND-FAILURE-MODES.md   # Comprehensive catalog of edge cases, race conditions, and error recovery (ERR-001+)
│
├── 60-REQUIREMENT-TRACEABILITY-MATRIX.md       # Bidirectional traceability: FR <-> PAGE <-> COMP <-> OP <-> BR <-> DATA <-> SEC
├── 61-MIGRATION-COMPATIBILITY-AND-DATA-PRESERVATION.md # Schema backward-compatibility, enum values, and JSON payload contracts
├── 62-KNOWN-ISSUES-AND-TECHNICAL-DEBT.md       # Documented defects, architectural debt, and security vulnerabilities
├── 63-MIGRATION-ACCEPTANCE-CRITERIA.md         # Objective, testable criteria for acceptance testing of the target app
├── 64-REQUIREMENT-GAPS-AND-UNVERIFIED-BEHAVIOR.md # Unverified behaviors, third-party backend assumptions, and open gaps
├── 65-FINAL-COVERAGE-AND-HANDOVER-REPORT.md    # Executive readiness evaluation, final statistics, and handover signoff
└── coverage-manifest.json                      # Machine-readable inventory, coverage metrics, and status manifest
```

---

## 3. Source-of-Truth Hierarchy

When conflicting information is detected between various files in the repository, the following precedence order applies:

1. **Active Application Runtime Code** (`src/pages/`, `src/ui/components/`, `src/services/`, `electron/main.cjs`): Reflects what actually runs in the user's browser or desktop environment.
2. **Applied Database Migrations & Schemas** (`supabase/migrations/*.sql`): Reflects physical database constraints, RLS policies, and data integrity triggers.
3. **Domain Contracts & State Stores** (`src/types/`, `src/store/`): Reflects client-side data representations and persistence logic.
4. **Existing Technical Audit Documentation** (`docs/architecture-audit-report.md`, `qa_audit_report.md`, `consolidated_bug_tracker.md`): Provides deep historical context and confirms identified defects.
5. **Code Comments & Legacy Files** (`src/services/roleService.ts`, unreferenced types): Considered historical or deprecated unless confirmed active.

---

## 4. Verification Status Definitions

Every requirement, rule, operation, and specification in this suite is assigned one of the following statuses:

| Status | Definition |
|---|---|
| **Verified** | Directly evidenced by active source code, working database schemas, or executing runtime behavior. |
| **Partially verified** | Core functional behavior is evidenced, but certain edge cases or environmental dependencies remain unverified. |
| **Inferred** | Logical and intended business behavior that is strongly suggested by UI/UX patterns but lacks explicit backend code. |
| **Unresolved** | Requires explicit stakeholder input, external controller backend access, or missing credentials to confirm. |
| **Not implemented** | Referenced in navigation or UI menus but has no operative implementation (e.g. CCTV streaming). |
| **Broken** | Operative implementation exists in code, but known defects or structural bugs prevent proper execution. |
| **Deprecated/legacy** | Retained strictly for backward compatibility (e.g. V1 single-matrix route simulator, Axios role service). |

---

## 5. Stable Identifier Conventions

To enable complete bidirectional traceability across all handover documents, unique stable identifiers are utilized:

- `PAGE-xxx`: Application routes and page views (e.g., `PAGE-001` through `PAGE-018`)
- `COMP-xxx`: Key presentation and container components (e.g., `COMP-001` through `COMP-035`)
- `FR-xxx`: Functional requirements (e.g., `FR-001` through `FR-050`)
- `NFR-xxx`: Non-functional requirements (e.g., `NFR-001` through `NFR-020`)
- `OP-xxx`: User and system operations (e.g., `OP-001` through `OP-045`)
- `BR-xxx`: Business and domain validation rules (e.g., `BR-001` through `BR-040`)
- `FORM-xxx`: Forms and input dialogs (e.g., `FORM-001` through `FORM-015`)
- `FIELD-xxx`: Form input fields (e.g., `FIELD-001` through `FIELD-060`)
- `ROLE-xxx`: System user roles (e.g., `ROLE-001` through `ROLE-007`)
- `PERM-xxx`: Discrete capability permissions (e.g., `PERM-001` through `PERM-025`)
- `DATA-xxx`: Database tables and entities (e.g., `DATA-001` through `DATA-010`)
- `TYPE-xxx`: TypeScript data types and contracts (e.g., `TYPE-001` through `TYPE-030`)
- `API-xxx`: Network APIs, edge services, and sidecar endpoints (e.g., `API-001` through `API-010`)
- `COND-xxx`: Conditional rendering expressions (e.g., `COND-001` through `COND-025`)
- `ERR-xxx`: Error states and exception handlers (e.g., `ERR-001` through `ERR-030`)
- `WF-xxx`: End-to-end user workflows (e.g., `WF-001` through `WF-012`)
- `CFG-xxx`: Configuration parameters (e.g., `CFG-001` through `CFG-015`)
- `SEC-xxx`: Security findings and controls (e.g., `SEC-001` through `SEC-015`)
- `GAP-xxx`: Documentation and architecture gaps (e.g., `GAP-001` through `GAP-015`)
- `MIG-xxx`: Migration acceptance criteria (e.g., `MIG-001` through `MIG-030`)

---

## 6. Handover Coverage Summary

- **Total Source Files Inventoried:** 234 files
- **Total Application Lines of Code:** 39,321 LOC
- **Pages Discovered & Documented:** 18 pages
- **Core Entities Reverse Engineered:** 9 primary tables (`organizations`, `regions`, `depots`, `stops`, `stop_audios`, `routes`, `users`, `roles`, `font_settings`)
- **Documented Functional Requirements:** 50 requirements
- **Documented User Operations:** 45 operations
- **Documented Business Rules:** 40 rules
- **External Integrations Documented:** 4 external services (Sarvam AI TTS, .NET BitmapFontApi Sidecar, Controller API, Google Input Tools)
- **Documentation Verification Level:** Comprehensive, Evidence-Backed Specification

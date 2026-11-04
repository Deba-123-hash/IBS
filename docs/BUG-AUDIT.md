# UNIFIX TECH — COMPREHENSIVE BUG & ISSUE AUDIT

This document establishes the bug inventory, root cause analysis, reproduction vectors, fixes, and verification statuses for all defects identified across the UNIFIX TECH application.

---

## Bug Inventory Matrix

| Bug ID | Severity | Route / Endpoint | Component | Root Cause | Fix Description | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | **P0** (Critical) | `/student/chatbot`, `/api/ai/chat` | `chatbotEngine.js`, `campusDataTools.js` | Chatbot returned static guidance ("Go to Attendance") instead of querying live Neon PostgreSQL data via Prisma. | Created deterministic data retrieval tools and prompt pipeline in `campusDataTools.js` and `chatbotEngine.js`. Real attendance (88%, DBMS 67%), room, gate pass, complaints, fees returned. | **VERIFIED (PASS)** |
| **BUG-02** | **P0** (Critical) | `/*` (Global) | `App.jsx`, `ErrorBoundary.jsx` | Absence of React Error Boundary meant any unexpected component error caused total application white screen. | Built production-grade `ErrorBoundary` with reload module, return home, and diagnostic recording. Wrapped `AppRouter` in `App.jsx`. | **VERIFIED (PASS)** |
| **BUG-03** | **P1** (Major) | `/student/gate-pass`, `/admin/students` | `AppRouter.jsx` | Singular route aliases (`/student/gate-pass`, `/student/complaint`) and explicit admin paths fell through to catch-all. | Added declarative route aliases and explicit admin destination mappings in `AppRouter.jsx`. | **VERIFIED (PASS)** |
| **BUG-04** | **P1** (Major) | `/admin/requests`, `/admin/complaints` | `AdminRequests.jsx` | Admin requests pipeline used static mock records without fetching live Neon complaints or persisting status updates. | Added `useEffect` to fetch from `GET /complaints` and updated `handleUpdateStatus` to call `PATCH /complaints/:id/status`. | **VERIFIED (PASS)** |
| **BUG-05** | **P1** (Major) | `/admin/communications`, `/admin/notices` | `Communications.jsx` | Circular notice composer only updated client state without broadcasting to `POST /notices` or reading live notices. | Integrated `GET /notices` on mount and `POST /notices` on form submission with live audience estimation. | **VERIFIED (PASS)** |
| **BUG-06** | **P2** (Moderate) | `/admin/analytics` | `Analytics.jsx` | Clicking "Export CSV" showed a blocking browser `alert()` modal with no actual file generated. | Implemented `handleExportCSV` with programmatic Blob generation, automatic download trigger, and non-blocking toast. | **VERIFIED (PASS)** |
| **BUG-07** | **P2** (Moderate) | `/login`, `/student/dashboard` | Language locales, UI files | Inconsistent Odia script strings in regional fallbacks and language dropdown causing broken text rendering. | Replaced all Odia script characters with clean, default professional English across UI components, prompts, and locale maps. | **VERIFIED (PASS)** |
| **BUG-08** | **P2** (Moderate) | `/` (Public layout) | `PublicLayout.jsx` | Syntax error in `<select>` tag (missing closing angle bracket) breaking Vite Babel parsing. | Corrected JSX syntax in `PublicLayout.jsx`. | **VERIFIED (PASS)** |
| **BUG-09** | **P2** (Moderate) | `/*` (Global navigation) | Route transitions, CSS | Slow navigation due to awaiting long animations or serial data waterfalls. | Reduced route transition budget to 150ms-250ms, added progressive loading skeletons, and integrated GSAP counter cleanup. | **VERIFIED (PASS)** |

---

## Detailed Bug Reports

### BUG-01: AI Chatbot Fallback Refusal
- **Severity:** P0 (Critical)
- **Route:** `/student/chatbot`, `/api/ai/chat`
- **Component:** `server/src/ai/chatbotEngine.js`, `server/src/ai/campusDataTools.js`
- **Root Cause:** Intent handling was hardcoded to suggest navigation paths rather than executing SQL/Prisma aggregations against Neon PostgreSQL.
- **Reproduction Steps:**
  1. Login as synthetic student (`student.demo` / `Student@123`).
  2. Navigate to `/student/chatbot`.
  3. Query: *"What is my attendance?"*
  4. Observed Result: *"Go to Attendance."*
- **Fix:** Implemented `campusDataTools.js` with direct Prisma queries for `getStudentAttendance`, `getStudentRoom`, `getStudentComplaints`, `getGatePassStatus`, `getFeeSummary`, `getMessMenu`, and `getAdminCampusOverview`. Synthesizes factual metrics with Groq LPU (`qwen/qwen3.8-27b`) or deterministic markdown.
- **Verification:** Tested in Chrome CDP headless browser and automated tests. Answer returns: *"Your current overall attendance is 88%. Data Structures: 86.7%, DBMS: 66.7%..."* with deep links.

---

### BUG-02: Missing React Error Boundary
- **Severity:** P0 (Critical)
- **Route:** `/*` (Global)
- **Component:** `client/src/App.jsx`, `client/src/components/common/ErrorBoundary.jsx`
- **Root Cause:** No error boundary wrapped the React tree. An unhandled error in any component caused a blank white screen.
- **Reproduction Steps:**
  1. Trigger an uncaught exception in a child component.
  2. Entire React tree unmounts.
- **Fix:** Created `ErrorBoundary.jsx` displaying a graceful Campus OS error UI with "Retry Module" and "Campus Home" recovery actions. Wrapped `AppRouter` in `App.jsx`.
- **Verification:** Verified that component errors are contained, preventing full application crash.

---

### BUG-03: Route Mismatches & Missing Singular Aliases
- **Severity:** P1 (Major)
- **Route:** `/student/gate-pass`, `/student/complaint`, `/admin/students`
- **Component:** `client/src/routes/AppRouter.jsx`
- **Root Cause:** Routes were only registered under plural names (`/student/gate-passes`) or wildcards. Direct navigation to singular forms redirected to `/`.
- **Reproduction Steps:**
  1. Navigate to `http://localhost:5173/student/gate-pass`.
  2. Observed: Redirect to landing page `/`.
- **Fix:** Added route aliases in `AppRouter.jsx` for `/student/gate-pass`, `/student/complaint`, `/student/certificate`, `/admin/students`, `/admin/hostel`, `/admin/mess`, `/admin/visitors`, `/admin/fees`, `/admin/attendance`, and `/admin/settings`.
- **Verification:** All routes resolve to their respective operational workstations.

---

### BUG-04: Admin Requests Pipeline Disconnected from Live Database
- **Severity:** P1 (Major)
- **Route:** `/admin/requests`, `/admin/complaints`
- **Component:** `client/src/pages/admin/Requests.jsx`
- **Root Cause:** Local state used static mock items; `handleUpdateStatus` did not dispatch `PATCH /complaints/:id/status`.
- **Reproduction Steps:**
  1. Submit a complaint as a student.
  2. Open Admin Requests board.
  3. Complaint was missing, and changing ticket status didn't persist to database.
- **Fix:** Added `useEffect` hook fetching live complaints from `/complaints`, merged them with existing items, and updated `handleUpdateStatus` to call `apiClient.patch('/complaints/' + id + '/status', { status: newStatus })`.
- **Verification:** Verified live complaints appear in admin board and status updates persist to Neon.

---

### BUG-05: Admin Communications Composer Unpersisted
- **Severity:** P1 (Major)
- **Route:** `/admin/communications`, `/admin/notices`
- **Component:** `client/src/pages/admin/Communications.jsx`
- **Root Cause:** Form submission only mutated in-memory React state without writing to the backend API.
- **Reproduction Steps:**
  1. Compose a notice in Admin Communications.
  2. Submit form.
  3. Reload page: notice is lost, and students never receive it.
- **Fix:** Connected `GET /notices` on mount and dispatched `POST /notices` with `{ title, content, category, targetAudience, priority }` on form submission.
- **Verification:** Verified notices persist to Neon PostgreSQL and appear in student bulletin.

---

### BUG-06: Analytics CSV Export Blocking Alert
- **Severity:** P2 (Moderate)
- **Route:** `/admin/analytics`
- **Component:** `client/src/pages/admin/Analytics.jsx`
- **Root Cause:** Button had inline `onClick={() => alert(...)}` without file generation.
- **Reproduction Steps:**
  1. Open Admin Analytics.
  2. Click "Export CSV".
  3. Browser alert modal opens, no file downloaded.
- **Fix:** Implemented `handleExportCSV` creating a structured CSV blob, triggering browser file download, and firing a non-blocking toast notification.
- **Verification:** Clicking "Export CSV" downloads `SAMT_Campus_Telemetry_30D_<timestamp>.csv` and displays toast.

---

### BUG-07: Inconsistent Odia Script Defaults
- **Severity:** P2 (Moderate)
- **Route:** Global / Login / Locales
- **Component:** `PublicLayout.jsx`, `client/src/i18n/or.json`, prompt templates
- **Root Cause:** Residual Odia script characters in translations and language selectors.
- **Reproduction Steps:**
  1. Inspect language switcher or error strings.
  2. Regional script text rendered inconsistently.
- **Fix:** Standardized on default English across all components, locale dictionaries, and chatbot system prompts.
- **Verification:** Grep search confirmed zero Odia unicode characters `[\u0B00-\u0B7F]` across the repository.

---

### BUG-08: Babel JSX Syntax Error in PublicLayout
- **Severity:** P2 (Moderate)
- **Route:** `/`
- **Component:** `client/src/layouts/PublicLayout.jsx`
- **Root Cause:** A missing closing angle bracket `>` on a `<select>` tag caused Babel parsing failure during Vite HMR.
- **Reproduction Steps:**
  1. Run Vite dev server.
  2. Babel threw `Unexpected token (46:14)`.
- **Fix:** Corrected tag closure in `PublicLayout.jsx`.
- **Verification:** Vite build compiles in 4.28s with zero Babel errors.

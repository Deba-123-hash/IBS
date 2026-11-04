# 10 - IMPLEMENTATION ROADMAP & PHASE SPECIFICATION

## 1. Overview & Prioritization Strategy
To deliver a fully operational full-stack application within an intensive hackathon build window, features are classified into three strict operational tiers:
* **[CORE]:** Mandatory for the core MVP and live workflow demonstrations (Must work flawlessly end-to-end).
* **[IMPORTANT]:** Critical operational capabilities providing deep campus utility.
* **[ENHANCEMENT]:** Value-add features, advanced analytics, and aesthetic polishes.

---

## 2. Phase-by-Phase Roadmap

### PHASE 1: Foundation & Project Scaffolding
* **Objective:** Establish the monorepo workspace, root configurations, client Vite React setup, server Express setup, and shared utilities.
* **Priority Tier:** `[CORE]`
* **Files to Create:**
  * Root: `package.json`, `.gitignore`, `docker-compose.yml`, `README.md`
  * Client: `client/package.json`, `client/vite.config.js`, `client/tailwind.config.js`, `client/src/main.jsx`, `client/src/App.jsx`, `client/src/styles/index.css`
  * Server: `server/package.json`, `server/src/server.js`, `server/src/app.js`, `server/src/config/env.js`
* **Dependencies:**
  * Client: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `axios`, `clsx`, `tailwind-merge`
  * Server: `express`, `cors`, `helmet`, `dotenv`, `morgan`
* **Testing & Verification:** `npm run dev` boots client on port 5173 and server on port 5000 with healthy CORS handshakes.
* **Completion Criteria:** Root workspace scripts start both frontend and backend concurrently.

---

### PHASE 2: Database Schema & Authentication Subsystem
* **Objective:** Configure Neon PostgreSQL with Prisma ORM, implement secure user registration, JWT login, and RBAC middleware.
* **Priority Tier:** `[CORE]`
* **Files to Create:**
  * Server: `server/prisma/schema.prisma`, `server/prisma/seed.js`, `server/src/config/database.js`, `server/src/controllers/authController.js`, `server/src/routes/authRoutes.js`, `server/src/middleware/authMiddleware.js`, `server/src/utils/token.js`
  * Client: `client/src/context/AuthContext.jsx`, `client/src/api/auth.js`, `client/src/pages/auth/Login.jsx`, `client/src/routes/ProtectedRoute.jsx`
* **Database Entities:** `User`, `Role`, `Student`, `Staff`, `AuditLog`.
* **APIs:** `POST /api/v1/auth/login`, `GET /api/v1/auth/me`.
* **Testing & Verification:** Seed database with default accounts for each role (`student@campus.demo`, `admin@campus.demo`, etc.). Verify password hash verification and JWT payload extraction.
* **Completion Criteria:** User can log into the client, receive a token, and be redirected to their role-specific dashboard.

---

### PHASE 3: Student Operations (Attendance, Timetable & Dashboard)
* **Objective:** Construct the primary student interface, attendance calculations, schedule visualizers, and personal KPI cards.
* **Priority Tier:** `[CORE]` (Attendance & Dashboard); `[IMPORTANT]` (Timetable updates).
* **Files to Create:**
  * Client: `client/src/layouts/StudentLayout.jsx`, `client/src/pages/student/Dashboard.jsx`, `client/src/pages/student/Attendance.jsx`, `client/src/pages/student/Timetable.jsx`, `client/src/features/attendance/AttendanceCard.jsx`
  * Server: `server/src/controllers/attendanceController.js`, `server/src/routes/attendanceRoutes.js`, `server/src/controllers/timetableController.js`, `server/src/routes/timetableRoutes.js`
* **Database Entities:** `Attendance`, `AttendanceRecord`, `Subject`, `Timetable`, `ClassUpdate`.
* **APIs:** `GET /api/v1/attendance/student/:id`, `GET /api/v1/timetable/my-schedule`.
* **Testing & Verification:** Verify attendance percentage calculations accurately reflect presence/absence and trigger `<75%` warning badges.
* **Completion Criteria:** Student logs in and immediately sees accurate attendance percentage, schedule, and quick action widgets.

---

### PHASE 4: Hostel, Grievances (Complaints) & Mess Operations
* **Objective:** Implement the paperless hostel complaint system with image evidence, status history, room allocation views, and mess menu ratings.
* **Priority Tier:** `[CORE]` (Complaints & Mess Menu); `[IMPORTANT]` (Mess Feedback & Room Asset Grid).
* **Files to Create:**
  * Client: `client/src/pages/student/Complaints.jsx`, `client/src/pages/student/NewComplaint.jsx`, `client/src/pages/student/Hostel.jsx`, `client/src/pages/student/Mess.jsx`, `client/src/pages/maintenance/WorkQueue.jsx`
  * Server: `server/src/controllers/complaintController.js`, `server/src/routes/complaintRoutes.js`, `server/src/controllers/messController.js`, `server/src/routes/messRoutes.js`, `server/src/controllers/hostelController.js`, `server/src/routes/hostelRoutes.js`
* **Database Entities:** `Hostel`, `Room`, `RoomAllocation`, `Complaint`, `ComplaintStatusHistory`, `ComplaintComment`, `MessMenu`, `MessFeedback`.
* **APIs:** `POST /api/v1/complaints`, `GET /api/v1/complaints`, `PATCH /api/v1/complaints/:id/status`, `GET /api/v1/mess/menu`, `POST /api/v1/mess/feedback`.
* **Testing & Verification:** File a complaint as Student -> view ticket in Maintenance Work Queue -> update status to `RESOLVED` -> verify student view reflects update.
* **Completion Criteria:** Complete complaint lifecycle and daily mess menu workflows functioning end-to-end.

---

### PHASE 5: Requests, Security & Communication (Gate Pass, Certificates, Notices)
* **Objective:** Deliver digital gate pass generation with dynamic QR codes, security verification scanning, certificate requests, and targeted campus notices.
* **Priority Tier:** `[CORE]` (Gate Pass & Notices); `[IMPORTANT]` (Certificates & Security QR Scanner); `[ENHANCEMENT]` (Visitor Management).
* **Files to Create:**
  * Client: `client/src/pages/student/GatePasses.jsx`, `client/src/pages/student/NewGatePass.jsx`, `client/src/pages/student/Certificates.jsx`, `client/src/pages/warden/Approvals.jsx`, `client/src/pages/security/GateScanner.jsx`, `client/src/pages/student/Notices.jsx`
  * Server: `server/src/controllers/gatePassController.js`, `server/src/routes/gatePassRoutes.js`, `server/src/controllers/certificateController.js`, `server/src/routes/certificateRoutes.js`, `server/src/controllers/noticeController.js`, `server/src/routes/noticeRoutes.js`
* **Database Entities:** `GatePass`, `GatePassApproval`, `GatePassEvent`, `Certificate`, `CertificateRequest`, `Notice`, `NoticeTarget`.
* **APIs:** `POST /api/v1/gate-passes`, `PATCH /api/v1/gate-passes/:id/decision`, `POST /api/v1/security/verify-qr`, `POST /api/v1/certificates/request`, `POST /api/v1/notices`.
* **Testing & Verification:** Student applies for gate pass -> Warden approves -> QR code appears on student mobile view -> Security scanner verifies token and logs checkout.
* **Completion Criteria:** Zero-friction paperless gate pass and certificate request pipelines operating end-to-end.

---

### PHASE 6: Executive Admin Command Center & Analytics
* **Objective:** Unify campus telemetry into an executive dashboard with charts, KPI cards, user administration, and audit trails.
* **Priority Tier:** `[CORE]` (KPI Dashboard & User Registry); `[IMPORTANT]` (Complaint Ageing & Staff Workload Charts); `[ENHANCEMENT]` (Audit Log Explorer).
* **Files to Create:**
  * Client: `client/src/layouts/AdminLayout.jsx`, `client/src/pages/admin/Dashboard.jsx`, `client/src/pages/admin/Users.jsx`, `client/src/pages/admin/Complaints.jsx`, `client/src/pages/admin/Analytics.jsx`, `client/src/components/charts/BarChartComponent.jsx`
  * Server: `server/src/controllers/adminController.js`, `server/src/routes/adminRoutes.js`, `server/src/controllers/analyticsController.js`, `server/src/routes/analyticsRoutes.js`
* **Database Entities:** Cross-entity aggregation queries.
* **APIs:** `GET /api/v1/analytics/overview`, `GET /api/v1/admin/users`, `GET /api/v1/audit-logs`.
* **Testing & Verification:** Validate that totals for students, open complaints, overdue tickets, and gate exits aggregate correctly in real time.
* **Completion Criteria:** Administrator can inspect real-time campus health and drill down into complaints, users, and audit records.

---

### PHASE 7: AI Intelligence, Inclusivity & Accessibility
* **Objective:** Integrate the Campus AI Assistant, complaint auto-classification, duplicate detection, recurring issue detection, and the Help Desk proxy screen.
* **Priority Tier:** `[CORE]` (Campus AI Assistant & Complaint Classification); `[IMPORTANT]` (Recurring Issue Intelligence & Help Desk Module); `[ENHANCEMENT]` (Multi-lingual i18n & Voice Prompts).
* **Files to Create:**
  * Client: `client/src/pages/student/Chatbot.jsx`, `client/src/pages/helpDesk/HelpDesk.jsx`, `client/src/locales/{en,hi,or}.json`
  * Server: `server/src/ai/aiService.js`, `server/src/ai/chatbotService.js`, `server/src/ai/complaintClassifier.js`, `server/src/ai/recurringIssueDetector.js`, `server/src/routes/aiRoutes.js`
* **Database Entities:** `KnowledgeDocument`, `AIConversation`, `AIMessage`, `HelpDeskRequest`.
* **APIs:** `POST /api/v1/ai/chat`, `POST /api/v1/ai/classify-complaint`, `GET /api/v1/ai/recurring-issues`, `POST /api/v1/help-desk/proxy-request`.
* **Testing & Verification:** Test conversational queries against campus knowledge documents; verify fallback rule engine triggers if AI API key is missing.
* **Completion Criteria:** AI assistant provides accurate campus answers, auto-routes complaints, and Help Desk allows proxy ticket generation for students without phones.

---

### PHASE 8: Production Hardening, Docker Containerization & Deployment
* **Objective:** Finalize Docker container configuration, verify Vercel deployment builds, write comprehensive README, and execute end-to-end hackathon demonstration rehearsals.
* **Priority Tier:** `[CORE]`
* **Files to Create:**
  * Root: `README.md`, `.dockerignore`, `server/Dockerfile`, `client/public/manifest.json`, `client/public/offline.html`, `.github/workflows/ci.yml`
* **Testing & Verification:**
  * `docker compose up --build` boots backend container and connects to Neon PostgreSQL.
  * `cd client && npm run build` produces zero errors.
  * Execute all 3 primary demo workflows: (1) Complaint to Resolution, (2) Gate Pass to QR Security Verification, (3) Bonafide Certificate Approval.
* **Completion Criteria:** Production-ready repository ready for GitHub push, Vercel frontend deployment, and live hackathon judging.

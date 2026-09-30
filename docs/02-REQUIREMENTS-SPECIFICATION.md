# 02 - REQUIREMENTS SPECIFICATION (SRS)

## 1. Introduction & Scope
This document specifies the complete functional and non-functional requirements for **Campus Life, Debugged**, establishing a verifiable contract for all system capabilities across 8 stakeholder roles.

---

## 2. Functional Requirements by User Role

### 2.1 Student Role (FR-STU)
* **FR-STU-01 (Authentication):** Students can authenticate using Institutional Email/Roll Number and Password with JWT token issuance, session persistence, and password reset.
* **FR-STU-02 (Dashboard):** Single-pane view showing overall attendance percentage, today's schedule, active gate passes, open complaint status, latest notices, today's mess menu, and quick action cards.
* **FR-STU-03 (Attendance Tracking):** View aggregated attendance % across all enrolled subjects, subject-wise breakdowns, detailed session-by-session history, and low-attendance alerts (<75% threshold).
* **FR-STU-04 (Timetable & Class Updates):** Interactive weekly timetable view with real-time class cancellation or relocation alerts posted by faculty.
* **FR-STU-05 (Notices & Announcements):** Filter notices by category (Urgent, Academic, Hostel, Events), mark notices as read, and download PDF attachments.
* **FR-STU-06 (Hostel Leave Application):** Submit hostel leave requests specifying start/end date-time, reason, emergency contact, and destination address.
* **FR-STU-07 (Gate Pass Management):** Submit daytime or overnight gate pass requests; track live approval status; view dynamic secure QR code upon Warden approval for security gate checkout/check-in.
* **FR-STU-08 (Certificate Requisition):** Request official certificates (Bonafide, Study, Conduct, Fee Estimate) with custom purpose specification; track workflow stages; download digitally signed/uploaded PDFs.
* **FR-STU-09 (Fee & Dues Overview):** View semester fee breakdown, paid receipts, pending dues, due dates, and submit fee-related queries to the Accounts office.
* **FR-STU-10 (Hostel Room & Asset View):** View allocated hostel, block, room number, roommate details, and inventory list of assigned room assets (table, chair, fan, bed, switchboard).
* **FR-STU-11 (Grievance / Complaint Lifecycle):** Lodge maintenance or hostel complaints with category, title, description, room/location, priority, and optional photo upload; receive SLA updates; add comments; rate resolution satisfaction.
* **FR-STU-12 (Mess Operations & Daily Menu):** Access daily/weekly breakfast, lunch, snack, and dinner menus; submit daily ratings (1-5 stars) and qualitative feedback on food quality, hygiene, and portion size.
* **FR-STU-13 (Visitor Pre-Registration):** Pre-register visiting parents/guardians with name, contact, relationship, arrival date, and vehicle number.
* **FR-STU-14 (Notifications):** In-app notification center receiving real-time alerts for gate pass approvals, complaint status shifts, new notices, and fee deadlines.
* **FR-STU-15 (Campus AI Assistant):** Conversational AI interface capable of answering queries regarding campus regulations, office procedures, mess schedules, and guiding students to the correct digital forms.

### 2.2 Faculty Role (FR-FAC)
* **FR-FAC-01 (Attendance Management):** Select course/batch and mark batch attendance (Present / Absent / Late / Excused) with bulk-toggle and instant calculation of roll statistics.
* **FR-FAC-02 (Class & Schedule Broadcasts):** Post instant class updates (extra lecture, cancellation, room change) triggering targeted push notifications to enrolled students.
* **FR-FAC-03 (Student Academic Profile):** View student attendance records, profile information, and academic alert flags.
* **FR-FAC-04 (Notice Creation):** Submit departmental academic notices targeted at specific batches or sections.
* **FR-FAC-05 (Leave Endorsement):** Review and digitally endorse student academic leave applications prior to final Warden/Dean approval.

### 2.3 Hostel Warden Role (FR-WAR)
* **FR-WAR-01 (Hostel & Room Oversight):** Visual room grid displaying occupancy, vacancy, maintenance status, and allocated student details across assigned hostel blocks.
* **FR-WAR-02 (Gate Pass & Leave Approvals):** Dedicated approval queue for daytime and overnight gate passes with one-click approve/reject actions and parental notification triggers.
* **FR-WAR-03 (Hostel Complaint Escalation):** Monitor all unresolved tickets in assigned blocks, reassign priority, and view maintenance turnaround times.
* **FR-WAR-04 (Room Inspection & Asset Audits):** Flag damaged room assets and trigger automatic maintenance ticket generation.

### 2.4 Maintenance Staff / Technician Role (FR-MNT)
* **FR-MNT-01 (Assigned Work Queue):** View prioritized maintenance jobs assigned to the technician's trade (Electrical, Plumbing, Carpentry, Masonry, Network, Cleaning).
* **FR-MNT-02 (Status Progression):** Update ticket status: `ASSIGNED` → `IN_PROGRESS` → `ON_HOLD` → `RESOLVED` with mandatory resolution comments.
* **FR-MNT-03 (Evidence Upload):** Upload before-and-after photographic proof of completed repairs.
* **FR-MNT-04 (Asset Tagging):** Log replacement or repair of specific institutional assets linked to hostel rooms or campus facilities.

### 2.5 Security Guard Role (FR-SEC)
* **FR-SEC-01 (Gate Pass Scanner):** Camera-based and manual code scanner to verify student gate passes in real-time, verifying validity, expiry, and student identity photo.
* **FR-SEC-02 (Entry/Exit Event Logging):** Instant single-click recording of student departure and arrival timestamps, flagging overdue returns.
* **FR-SEC-03 (Visitor Logbook):** Register walk-in visitors with photo capture, government ID number, student host verification, OTP check, and checkout timestamping.
* **FR-SEC-04 (Offline Mode):** Gate scanner caches valid active daily gate passes locally in the browser to maintain gate operations during Wi-Fi or cellular outages.

### 2.6 Accounts Staff Role (FR-ACC)
* **FR-ACC-01 (Fee Ledger Management):** View and update student fee balances, tuition components, hostel dues, and library fines.
* **FR-ACC-02 (Payment Verification):** Verify offline bank drafts, NEFT/RTGS transaction IDs, or cash deposits and update receipt statuses to `PAID`.
* **FR-ACC-03 (Fee Query Resolution):** Review student queries concerning fee discrepancies, scholarship adjustments, and installment plans.
* **FR-ACC-04 (No-Dues Clearance):** One-click verification of financial clearance required for issuing Bonafide certificates and final degree clearances.

### 2.7 Campus Administrator / Super Admin Role (FR-ADM)
* **FR-ADM-01 (Unified Command Center):** Real-time analytics dashboard showcasing total student headcount, active complaints, overdue SLA breaches, gate occupancy, and mess ratings.
* **FR-ADM-02 (User & Role Provisioning):** Create, update, deactivate, and assign roles for students, faculty, wardens, security, and staff with batch CSV import.
* **FR-ADM-03 (Department & Program Structure):** Configure academic departments, degree programs, batches, semesters, and course subjects.
* **FR-ADM-04 (Facilities & Asset Configuration):** Manage hostels, blocks, room capacities, mess facilities, and physical assets.
* **FR-ADM-05 (Notice Engine):** Author and broadcast campus-wide or finely targeted notices (by hostel, batch, program, or role) with delivery metrics.
* **FR-ADM-06 (AI Intelligence & Overrides):** Review AI complaint triage classifications, override suggested assignments, and inspect recurring issue clusters.
* **FR-ADM-07 (Audit Logs):** Immutable search and filter view over all critical system transactions, logins, approvals, and permission updates.

---

## 3. Non-Functional Requirements (NFR)

| ID | Category | Metric / Specification |
| :--- | :--- | :--- |
| **NFR-PERF-01** | Page Load Time | Initial dashboard load < 1.8 seconds on standard 4G; < 3.0 seconds on simulated 3G network. |
| **NFR-PERF-02** | API Latency | 95th percentile response time < 250ms for core CRUD REST endpoints under 200 concurrent users. |
| **NFR-PERF-03** | QR Scan Speed | Camera-based gate pass decode and validation verification < 1.2 seconds. |
| **NFR-SCAL-01** | Database Capacity | Neon PostgreSQL database schema architected with indexes to support up to 50,000 students and 500,000 attendance records per semester. |
| **NFR-SEC-01** | Cryptography | Passwords hashed using `bcrypt` (work factor 10). Cryptographic JWT tokens with 7-day expiration and secret-backed validation. |
| **NFR-SEC-02** | Transport Security | HTTPS enforced; API hardened using `Helmet` security headers, strict CORS origin policies, and rate-limiting (100 req/15 min per IP). |
| **NFR-SEC-03** | Authorization | Strict Role-Based Access Control (RBAC) enforced on every API route and resource ownership check (e.g. students cannot access peers' records). |
| **NFR-RELI-01** | Availability | System uptime SLA target of 99.5% during academic semesters, leveraging Neon's serverless PostgreSQL high availability. |
| **NFR-ACC-01** | Accessibility | Adherence to WCAG 2.1 Level AA standards: minimum 4.5:1 color contrast ratio, full keyboard navigation, and ARIA labels. |
| **NFR-MOBI-01** | Responsive Design | 100% functional rendering on screen viewports from 320px (budget Android) to 2560px (4K desktop monitors). |
| **NFR-BAND-01** | Low Bandwidth | Total bundle size (gzipped) < 350 KB. Images compressed client-side before Cloudinary upload. |
| **NFR-OFFL-01** | Offline Resilience | Progressive Web App (PWA) with Service Worker caching static assets and presenting `offline.html` fallback. |
| **NFR-MAINT-01**| Maintainability | Modular code organization (Controllers-Services-Prisma) with zero TypeScript dependencies, standard CommonJS / ES Modules. |

---

## 4. Requirements Traceability Matrix (RTM)

| Req ID | Module | User Role(s) | UI Screen / Route | API Endpoint | Database Entity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-STU-01** | Auth | All Roles | `/login`, `/register` | `POST /api/v1/auth/login` | `User`, `Role` |
| **FR-STU-02** | Dashboard | Student | `/student/dashboard` | `GET /api/v1/students/dashboard-summary` | Aggregated |
| **FR-STU-03** | Attendance | Student / Faculty | `/student/attendance`, `/faculty/attendance` | `GET /api/v1/attendance/student/:id`, `POST /api/v1/attendance` | `Attendance`, `AttendanceRecord` |
| **FR-STU-04** | Timetable | Student / Faculty | `/student/timetable` | `GET /api/v1/timetable/my-schedule` | `Timetable`, `ClassUpdate` |
| **FR-STU-05** | Notices | All Roles | `/student/notices`, `/admin/notices` | `GET /api/v1/notices`, `POST /api/v1/notices` | `Notice`, `NoticeTarget`, `NoticeRead` |
| **FR-STU-06** | Leave | Student / Warden | `/student/leave`, `/warden/leave` | `POST /api/v1/leave`, `PATCH /api/v1/leave/:id/status` | `LeaveRequest` |
| **FR-STU-07** | Gate Pass | Student / Warden / Sec | `/student/gate-passes`, `/security/gate-verification` | `POST /api/v1/gate-passes`, `PATCH /api/v1/gate-passes/:id/verify` | `GatePass`, `GatePassApproval`, `GatePassEvent` |
| **FR-STU-08** | Certificates | Student / Admin | `/student/certificates`, `/admin/certificates` | `POST /api/v1/certificates`, `PATCH /api/v1/certificates/:id` | `Certificate`, `CertificateRequest` |
| **FR-STU-09** | Fees | Student / Accounts | `/student/fees`, `/accounts/fees` | `GET /api/v1/fees/student/:id`, `POST /api/v1/fees/payments` | `FeeRecord`, `FeePayment`, `FeeQuery` |
| **FR-STU-10** | Hostel | Student / Warden | `/student/hostel`, `/warden/rooms` | `GET /api/v1/hostels/my-room`, `GET /api/v1/rooms` | `Hostel`, `HostelBlock`, `Room`, `RoomAllocation` |
| **FR-STU-11** | Complaints | Student / Maint / Admin | `/student/complaints`, `/maintenance/work-queue` | `POST /api/v1/complaints`, `PATCH /api/v1/complaints/:id/status` | `Complaint`, `ComplaintComment`, `ComplaintStatusHistory` |
| **FR-STU-12** | Mess | Student / Admin | `/student/mess`, `/admin/mess` | `GET /api/v1/mess/menu`, `POST /api/v1/mess/feedback` | `MessMenu`, `MessFeedback` |
| **FR-STU-13** | Visitors | Student / Security | `/student/visitors`, `/security/visitors` | `POST /api/v1/visitors`, `PATCH /api/v1/visitors/:id/checkout` | `Visitor`, `VisitorLog` |
| **FR-STU-14** | Notifications | All Roles | Component Header Modal | `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read` | `Notification`, `NotificationPreference` |
| **FR-STU-15** | AI Assistant | Student | `/student/ai-assistant` | `POST /api/v1/ai/chat` | `KnowledgeDocument`, `AIConversation`, `AIMessage` |
| **FR-ADM-01** | Admin Center | Admin / Super Admin | `/admin/dashboard` | `GET /api/v1/analytics/overview` | All Core Entities |
| **FR-ADM-06** | AI Triage | Admin / Maint | `/admin/complaints` | `POST /api/v1/ai/classify-complaint`, `GET /api/v1/ai/recurring-issues` | `Complaint`, `AuditLog` |
| **FR-SEC-01** | QR Verify | Security | `/security/gate-verification` | `POST /api/v1/security/verify-qr` | `GatePass`, `GatePassEvent` |
| **FR-MNT-02** | Maintenance | Maintenance | `/maintenance/tickets/:id` | `PATCH /api/v1/maintenance/tickets/:id` | `Complaint`, `Asset` |
| **FR-HLP-01** | Help Desk | Staff / Student | `/help-desk` | `POST /api/v1/help-desk/proxy-request` | `HelpDeskRequest`, `Complaint`, `GatePass` |

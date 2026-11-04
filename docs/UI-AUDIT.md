# UNIFIX TECH: Comprehensive UI/UX Audit

## 1. Executive Summary & Audit Context
- **Product:** UNIFIX TECH Campus Operations Platform
- **Edition:** BPUT Hackathon 2026 Edition
- **Stack:** React (Vite, Tailwind CSS, TanStack Query, Recharts, Lucide) + Node.js (Express, Prisma) + Neon PostgreSQL + Groq LPUs
- **Audit Scope:** All 8 stakeholder user journeys (Student, Admin, Warden, Maintenance, Security, Accounts, Faculty, Super Admin) across 32 registered routes.

---

## 2. Route Audit Matrix & Action Plan

| Route | Primary Stakeholder | Purpose | Information Hierarchy | Primary / Secondary Action | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| `/loginsvg` | All Roles | Unified Gateway & Evaluation Login | 3D Hero + Institution Branding + Form + 1-Click Evaluation Roles | Sign In / 1-Click Role Perspective Switch | **P0** | **AUDITED & OPTIMIZED** |
| `/student/dashboard` | Student | Morning Overview & KPI Command Center | Greeting + Academic KPIs + Today's Class + Action Hub + Notices | Launch AI Chatbot / View Attendance | **P0** | **AUDITED & OPTIMIZED** |
| `/student/attendance`| Student | Aggregate & Subject-wise Compliance | 75% Regulation Ring + Warning Banners + Subject Breakdown | Check Shortage Risk / Request Medical Condonation | **P0** | **AUDITED & OPTIMIZED** |
| `/student/chatbot` | Student / All | Live Real-time AI Assistant | Chat Stream + Prompt Suggestions + Real DB Grounding + Action Deep-links | Submit Personal Academic Inquiry / [Deep-Link Action] | **P0** | **AUDITED & OPTIMIZED** |
| `/student/complaints` | Student | Grievance Filing & SLA Tracking | Ticket Overview + Interactive Status Timeline + Category Filtering | Report New Maintenance Issue / Track SLA Progress | **P0** | **AUDITED & OPTIMIZED** |
| `/student/gate-passes`| Student | Outing Request & Dynamic QR Pass | Active Encrypted QR Token + Verification State + Outing History | Apply for Gate Pass / Present QR at Gate | **P0** | **AUDITED & OPTIMIZED** |
| `/admin/dashboard` | Admin / Dean | Campus Operations Command Center | Executive KPIs + Overdue Alerts + Department Health + Quick Actions | Review Critical SLAs / Access Incident Analytics | **P0** | **AUDITED & OPTIMIZED** |
| `/admin/analytics` | Admin | Real-time Operations & Recharts | Multi-dimension Recharts (Resolution, Department, Fee, Mess) | Filter Date Range / Export Operational Report | **P0** | **AUDITED & OPTIMIZED** |
| `/student/timetable` | Student | Lecture & Laboratory Schedule | Day-by-day Tabs + Current Active Lecture Indicator + Faculty Contacts | View Today's Next Class / Open Lab Schedule | **P1** | **AUDITED & OPTIMIZED** |
| `/student/hostel` | Student | Room Allocation & Asset Audit | Hostel, Block, Floor, Room Number + Roommate Roster + Asset Condition | Report Room Maintenance / Check Inventory | **P1** | **AUDITED & OPTIMIZED** |
| `/student/mess` | Student | Dining Schedule & Quality Feedback | Meal Timeslots (Breakfast to Dinner) + Menu Card + Star Rating Form | View Today's Menu / Submit Daily Meal Rating | **P1** | **AUDITED & OPTIMIZED** |
| `/student/fees` | Student | Financial Ledgers & Clearance | Semester Ledger + Tuition/Hostel Due Breakdown + Payment Receipts | Pay Pending Fees / Download Zero-Dues Slip | **P1** | **AUDITED & OPTIMIZED** |
| `/student/certificates`| Student | Institutional Letter Issuance | Bonafide, NOC, Custodian Tracker + Processing Status | Request Bonafide / Download Digitally Signed PDF | **P1** | **AUDITED & OPTIMIZED** |
| `/admin/users` | Admin | Directory Governance | Paginated User Table + Role Badges + Active Toggle | Search Student / Manage Staff Credentials | **P1** | **AUDITED & OPTIMIZED** |
| `/help-desk` | Kiosk / Offline | Non-smartphone Emergency Access | Touch-friendly Kiosk Grid + Roll Number Validation | Submit Emergency Outing / File Offline Ticket | **P1** | **AUDITED & OPTIMIZED** |
| `/security/gate-verification` | Security Guard | QR Check-in / Check-out Terminal | Camera Scanner Viewport + Student Identity Verification Card | Confirm Gate Check-out / Log Late Curfew Breach | **P1** | **AUDITED & OPTIMIZED** |

---

## 3. Critical Findings & Solved Bottlenecks

1. **AI Chatbot Disconnect (Resolved):**
   - *Previous state:* Chatbot returned generic safety refusals (*"I do not have access to your personal academic records..."*).
   - *Resolution:* Connected `req.user` to `chatbotEngine.js` with direct Neon PostgreSQL tools for attendance, room allocation, complaints, mess menu, timetable, and admin metrics.
2. **Navigation & Interaction Latency (Resolved):**
   - *Previous state:* Heavy full-page transitions caused perceived lag.
   - *Resolution:* Instant route change with skeleton fallbacks (0–150ms micro-interactions) and zero artificial delays.
3. **Three.js / WebGL Safety (Resolved):**
   - *Resolution:* Implemented `CampusWebGLHero.jsx` with responsive canvas scaling, automatic pause on unmount, low-power fallback, and strict `prefers-reduced-motion` compliance.
4. **Babel Parser Syntax (Resolved):**
   - *Resolution:* Fixed syntax bracket in `PublicLayout.jsx` and verified with clean production compilation (`npm run build`).

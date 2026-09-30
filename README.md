# CAMPUS LIFE, DEBUGGED

> **Tagline:** *Attendance, Mess, Hostel, Repeat: Campus Life, Debugged*  
> **Organisation / Problem Owner:** Fretbox

---

## 1. Executive Project Overview
**Campus Life, Debugged** is a high-availability, low-bandwidth, mobile-first **Campus Operations Operating System (Campus OS)**. Developed for the Fretbox collegiate hackathon challenge, the platform eliminates fragmented paper registers, chaotic WhatsApp spam, manual complaint diaries, physical gate passes, and lost corkboard notices by delivering a single, unified digital command interface.

The platform serves 8 distinct stakeholder roles:
1. **Students** (Attendance, Gate Passes, Complaints, Mess Feedback, Certificates, AI Helper)
2. **Faculty** (Batch Attendance, Lecture Updates, Advising)
3. **Hostel Wardens** (Room Occupancy Grid, Gate Pass Approvals, Facility Escalations)
4. **Maintenance Technicians** (Work Queues, SLA Tracking, Photo Evidence of Repairs)
5. **Security Guards** (Sub-second QR Gate Code Validation, Visitor Registry)
6. **Accounts Staff** (Fee Ledgers, Receipt Clearances, Dues Queries)
7. **Campus Administrators** (Executive Command Center, User Provisioning, Circular Broadcasts)
8. **Help Desk Officers** (Proxy service terminal for students without smartphones)

---

## 2. Technical Stack & Architectural Constraints
* **Frontend:** React 18, Vite 5, JavaScript, JSX, Tailwind CSS, Lucide React, Recharts, Axios, PWA.
* **Backend:** Node.js, Express.js, JavaScript, REST API, JWT, bcrypt, Helmet, CORS, Rate Limiting.
* **Database:** Neon Serverless PostgreSQL with connection pooling (`pgbouncer=true`) & Prisma ORM.
* **AI Subsystem:** Google Gemini 1.5 Flash API / OpenAI compatible abstraction layer with deterministic rule-based heuristic fallbacks.
* **Deployment & Containerization:** Vercel (Client SPA) + Docker (Backend container) + GitHub Actions CI/CD.
* **Language Rules:** **Strictly JavaScript & JSX. Zero TypeScript dependencies.**

---

## 3. Key Operational Capabilities

### ⚡ 1. Paperless Grievances & AI Smart Routing
* Students lodge room maintenance issues with optional photo evidence.
* Built-in AI classifier auto-detects trade (`PLUMBING`, `ELECTRICAL`, `INTERNET`, `CLEANING`, `CARPENTRY`), suggests priority (`URGENT`, `HIGH`), and assigns an SLA deadline.
* Duplicate detection flags existing tickets in the same block/room.

### 🛡️ 2. Sub-Second Dynamic QR Gate Passes
* Students apply for Day or Night outings.
* Wardens approve with a single tap.
* Approved passes generate a dynamic, high-contrast QR code on the student's mobile device.
* Security guards scan the QR token at the gate checkpoint in under 2 seconds, verifying validity, curfew window, and student photo ID.

### 🤖 3. 24/7 Context-Aware Campus AI Assistant
* Instant answers regarding institutional circulars, scholarship bonafide applications, mess timings, curfew rules, and attendance requirements.
* Embedded navigation shortcuts redirect students straight to relevant digital forms.

### 📊 4. Executive Command Center & Recurring Issue Intelligence
* Real-time telemetry for Deans and Campus Directors: open tickets, SLA breaches, active gate crossings.
* **Recurring Issue Detector:** Analyzes 30-day ticket clusters and alerts campus leadership to systemic infrastructure failures (e.g., 23 plumbing complaints in Hostel Block B indicating a riser pipe failure).

### ♿ 5. Digital Equity: The No-Smartphone Help Desk
* Dedicated `/help-desk` terminal allowing staff to submit proxy requests on behalf of students without smartphones or with depleted batteries.
* Generates a physical printed reference slip with a scannable barcode for the student.

---

## 4. Repository Structure

```text
campus-life-debugged/
├── client/                     # React 18 + Vite Frontend Application
│   ├── public/                 # PWA Manifest, Offline Fallback, Icons
│   ├── src/
│   │   ├── api/                # Axios API instance with JWT interceptors
│   │   ├── components/         # Layout (Navbar, Sidebar, BottomNav), UI Atoms
│   │   ├── context/            # AuthContext & 1-Click Role Switcher
│   │   ├── pages/
│   │   │   ├── auth/           # Login with Quick Demo buttons
│   │   │   ├── student/        # Dashboard, Attendance, Timetable, Complaints, Gate Passes, etc.
│   │   │   ├── security/       # QR Gate Scanner & Crossing Logs
│   │   │   ├── admin/          # Command Center, Recurring Intelligence, User Directory
│   │   │   └── helpDesk/       # Physical Proxy Desk Terminal
│   │   ├── routes/             # ProtectedRoute & AppRoutes
│   │   └── styles/             # Tailwind CSS Design System
│   └── package.json
│
├── server/                     # Node.js + Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Neon PostgreSQL Database Models
│   │   └── seed.js             # Realistic Campus Database Seeder
│   ├── src/
│   │   ├── ai/                 # Gemini/OpenAI Adapters & Heuristic Fallbacks
│   │   ├── config/             # Database & Environment Configuration
│   │   ├── controllers/        # Domain Route Controllers
│   │   ├── middleware/         # Auth, RBAC, Rate Limiting, Error Handling
│   │   ├── notifications/      # Multi-Channel Alert Dispatcher
│   │   ├── routes/             # REST API Endpoint Routers
│   │   ├── app.js              # Express Application Config
│   │   └── server.js           # Server Entrypoint
│   ├── Dockerfile
│   └── package.json
│
├── docs/                       # 10 Architectural Source-of-Truth Specifications
│   ├── 01-PROJECT-VISION.md
│   ├── 02-REQUIREMENTS-SPECIFICATION.md
│   ├── 03-SYSTEM-ARCHITECTURE.md
│   ├── 04-DATABASE-DESIGN.md
│   ├── 05-FEATURES-AND-WORKFLOWS.md
│   ├── 06-UI-UX-DESIGN-SYSTEM.md
│   ├── 07-API-SPECIFICATION.md
│   ├── 08-AI-SYSTEM-DESIGN.md
│   ├── 09-SECURITY-ACCESSIBILITY-DEVOPS.md
│   └── 10-IMPLEMENTATION-ROADMAP.md
│
├── .github/workflows/          # Continuous Integration CI/CD Actions
├── docker-compose.yml          # Container orchestration
└── README.md
```

---

## 5. Instant Local Setup & Execution

### Prerequisites
* Node.js v18+ or v20+
* npm v9+

> **💡 Windows PowerShell Tip:** If you encounter `npm.ps1 cannot be loaded because running scripts is disabled`, either use `npm.cmd` directly (e.g., `npm.cmd test`, `npm.cmd run dev`) or enable process script execution by running:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

### 1. Install Dependencies
From the repository root:
```bash
# Install all workspace dependencies (root, client, server, shared)
npm install
```

### 2. Configure Environment Variables
Copy the templates:
```bash
# Server environment
cp server/.env.example server/.env

# Client environment
cp client/.env.example client/.env
```

Set your Neon PostgreSQL connection string in `server/.env`:
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-sample-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="super-secret-campus-life-debugged-jwt-key-2026"
```

### 3. Generate Prisma Client & Push Database Schema
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Launch Development Servers
* **Start Both (Fullstack Concurrently):**
  ```bash
  npm run dev
  ```
* **Or Start Independently:**
  ```bash
  npm run server   # Starts Express backend on http://localhost:5000
  npm run client   # Starts Vite React client on http://localhost:5173
  ```
* **Verify Health Check:**
  ```bash
  npm run health   # Queries /api/v1/health and confirms status
  ```

---

## 6. Demo Accounts & 1-Click Role Switcher

For seamless hackathon evaluation, the platform includes a **1-Click Demo Evaluation Switcher** on the login screen and the navigation bar:

| Role | Demo Email | Password | Primary Workflow to Test |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campus.demo` | `Password@123` | Dashboard, Apply Gate Pass, Lodge Grievance, Mess Menu |
| **Admin** | `admin@campus.demo` | `Password@123` | Executive Command Center, SLA Breaches, Recurring Intelligence |
| **Super Admin** | `superadmin@campus.demo` | `Password@123` | Full Campus OS Governance, System Configuration & Audits |
| **Warden** | `warden@campus.demo` | `Password@123` | Approve/Reject Gate Passes, Visual 24-Room Block Grid |
| **Faculty** | `faculty@campus.demo` | `Password@123` | Student Academic Advising, Batch Attendance, Class Updates |
| **Maintenance** | `maintenance@campus.demo` | `Password@123` | Work Queue, Mark In-Progress, Resolve Grievances |
| **Security** | `security@campus.demo` | `Password@123` | QR Scanner Terminal, Instant Gate Clearance Verification |
| **Accounts** | `accounts@campus.demo` | `Password@123` | Fee Ledgers, Component Clearances, Dues Queries |

---

## 7. Primary Hackathon Demonstration Workflows

### 🛠️ Workflow 1: Grievance Lodging to Technician Resolution
1. Login as **Student** (`student@campus.demo`).
2. Navigate to **Hostel Complaints** -> click **Report New Grievance**.
3. Type *"Severe bathroom pipe leakage in Room 304"*, click **Analyze with AI** (triggers AI trade classification and priority assignment), and submit.
4. Switch role to **Maintenance** using the top navigation pill.
5. In the maintenance view, claim the ticket, click **Mark In Progress**, and then click **Resolve Ticket**.
6. Switch back to **Student** -> observe the status update milestone stepper and notification.

### 🎫 Workflow 2: Gate Pass Approval & QR Gate Clearance
1. Login as **Student** -> Navigate to **Gate Passes**.
2. Click **Apply for Gate Pass**, specify destination *"Apollo Clinic"*, and submit.
3. Switch role to **Warden** -> click **Approve** on the student's request.
4. Switch back to **Student** -> click **Show Gate Pass QR** to display the high-contrast digital exit pass.
5. Switch role to **Security** -> navigate to **Gate QR Scanner**, enter or scan the pass token, and click **Verify Pass**.
6. Green authorization banner confirms checkout and records the event timestamp.

### 🎓 Workflow 3: Instant Academic Certificate Clearance
1. Login as **Student** -> Navigate to **Certificates**.
2. Apply for a **Bonafide Certificate** with purpose *"Passport Application"*.
3. Switch role to **Admin** -> click **Approve & Issue**.
4. Student view instantly displays the **Download Signed PDF** button.

---

## 8. Docker Deployment
To launch the backend inside Docker:
```bash
docker compose up --build
```
The Docker container connects to your external Neon PostgreSQL database over secure TLS.

---

## 9. License
MIT License. Developed for the Fretbox Hackathon 2026.

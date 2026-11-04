# CampusOS — Complete Project Run Guide

## 1. Overview
CampusOS is an enterprise-grade Campus & Hostel Life Management System designed to handle student accommodation, room allocations, leave approvals, maintenance work orders, gate security, fee billing, and academic operations.

### Architecture Summary
- **Frontend SPA**: React 18, Vite 5, Tailwind CSS, React Router 6, TanStack Query, Lucide Icons, GSAP animations (`http://localhost:5173`)
- **Backend API**: Node.js, Express.js, TypeScript, Prisma ORM, Zod, JWT, bcrypt (`http://localhost:5000`)
- **Database**: Neon Serverless PostgreSQL (`ep-morning-brook-b5tx1efd-pooler.c-7.us-east-2.aws.neon.tech/neondb`)
- **AI Integrations**: Google Gemini API & Groq Cloud

---

## 2. Quickstart Execution (One Command)

From the project root (`DEBA IBST/DEBA IBST`):

```bash
npm run dev
```

This concurrently starts:
1. **Backend API Service** on `http://localhost:5000`
2. **Frontend Vite SPA** on `http://localhost:5173`

Both services automatically connect to the live Neon cloud PostgreSQL database.

---

## 3. Individual Service Startup

If you prefer starting services in separate terminal windows:

### Terminal 1: Backend API
```bash
cd "server"
npm run dev
```
- Listens on: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### Terminal 2: Frontend SPA
```bash
cd "client"
npm run dev
```
- Available at: `http://localhost:5173`

---

## 4. Verification & Health Check

### Verify Live Backend Health:
```bash
curl http://localhost:5000/api/health
```
Expected output:
```json
{
  "success": true,
  "database": "connected",
  "api": "healthy",
  "data": {
    "api": "healthy",
    "database": "healthy",
    "environment": "development",
    "details": {
      "provider": "Neon Serverless PostgreSQL (Prisma ORM)",
      "status": "CONNECTED"
    }
  }
}
```

### Run Full Regression Suite:
```bash
node scripts/verify-all-apis.js
node scripts/verify-database.js
node scripts/verify-phase-5-responsiveness-a11y.js
```

---

## 5. Verified Demo User Credentials

All accounts share the standard password: `Password@123`

| Institutional Role | Login Email / Identifier | Purpose & Access Scope |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@campus.demo` | Global system control, audit logs, admin management |
| **Admin** | `admin@campus.demo` | Institutional dashboard, student roster, room allocations |
| **Student** | `student@campus.demo` (or roll `CS2023048`) | Student profile, hostel room, fee payment, gate pass, complaints |
| **Warden** | `warden@campus.demo` | Residential command center, room occupancy grid, leave approvals |
| **Security** | `security@campus.demo` | Gate log entry/exit, visitor registration, QR code verification |
| **Technician** | `maintenance@campus.demo` | Work order queue, start work, resolve maintenance tickets |
| **Accountant** | `accounts@campus.demo` | Fee collections, receipts, expenses, financial reconciliation |
| **Faculty** | `faculty@campus.demo` | Academic workstation, batch attendance marking, student roster |

*(Tip: In development, click the role pills in the top navbar for instant persona switching without manual re-login).*

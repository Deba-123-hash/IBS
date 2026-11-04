# CampusOS — Backend Architecture & Startup Guide

## 1. Overview
The CampusOS backend is built on **Node.js**, **Express.js**, and **TypeScript**, using **Prisma ORM** for type-safe database queries. It exposes a modular REST API structured across 14 domain controllers.

---

## 2. Server Entry Point & Lifecycle

- **Entry Point File**: [`server/src/server.ts`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/server/src/server.ts)
- **Port**: `5000` (configurable via `PORT` env var)
- **Startup Command**:
  ```bash
  cd "server"
  npm run dev
  ```
  *(Or concurrently from root: `npm run dev`)*

### Boot Sequence:
1. Environment variables validated and loaded (`dotenv`).
2. Express app instantiated with Helmet security headers, CORS origin whitelist, and JSON body parser.
3. Database connection pool established with Neon PostgreSQL.
4. Route controllers registered under `/api/v1/*`.
5. Global 404 handler and central error-handling middleware registered.
6. HTTP server begins listening on port 5000.

---

## 3. Core REST API Route Groups

| Base URL Path | Controller Module | Primary Functionality |
| :--- | :--- | :--- |
| **`/api/health`** | Diagnostics | Server and Neon database connectivity check |
| **`/api/v1/auth`** | `authController.ts` | Login, student self-registration, session `/me`, password change |
| **`/api/v1/users`** | `userController.ts` | Profile retrieval, user management, avatar uploads |
| **`/api/v1/student`** | `studentController.ts` | Academic dashboard, attendance summary, hostel info, fee dues |
| **`/api/v1/warden`** | `wardenController.ts` | Room allocation matrix, student resident roster, leave approvals |
| **`/api/v1/maintenance`** | `maintenanceController.ts` | Work order dispatch queue, trade categories, ticket resolution |
| **`/api/v1/security`** | `securityController.ts` | Gate entry/exit logging, visitor registry, QR verification, alerts |
| **`/api/v1/accounts`** | `accountsController.ts` | Fee ledger, student payments, receipts, operating expenses |
| **`/api/v1/faculty`** | `facultyController.ts` | Cohort classes, batch attendance marking, academic leaves |
| **`/api/v1/complaints`** | `complaintController.ts` | Grievance submission, status progression, comment threads |
| **`/api/v1/gatepass`** | `gatepassController.ts` | Gate pass issuance, QR code payload, approval lifecycle |
| **`/api/v1/leave`** | `leaveController.ts` | Student residential and academic leave requests |
| **`/api/v1/admin`** | `adminController.ts` | Campus-wide analytics, user directory, broadcast notices |
| **`/api/v1/ai`** | `aiController.ts` | Natural language campus chat, automatic complaint classification |

---

## 4. Middleware & Security Perimeter

- **`authenticateToken`**: Validates JWT `Bearer` token from `Authorization` header. Decodes user identity into `req.user`.
- **`requireRole([...roles])`**: Role-based access control. Checks if `req.user.role` is authorized to access the route. Returns `403 Forbidden` if unauthorized.
- **`rateLimiter`**: Prevents brute-force credential stuffing attacks against auth routes.
- **`errorHandler`**: Catches unhandled promise rejections and formats uniform JSON error responses:
  ```json
  { "success": false, "error": "Descriptive message" }
  ```

---

## 5. Backend Diagnostic Smoke Test

To test the backend from the terminal:
```bash
curl -s http://localhost:5000/api/health
```
Response status: `200 OK`.


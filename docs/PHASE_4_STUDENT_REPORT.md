# CampusOS — Phase 4 Student Module Redesign Report

**Document ID**: `DOC-P4-STU-2026`  
**Role**: STUDENT (Campus Life & Academics)  
**Primary Routes**: `/student/dashboard`, `/student/profile`, `/student/attendance`, `/student/hostel`, `/student/fees`, `/student/complaints`, `/student/leave`, `/student/gate-passes`  
**Status**: **PASS — FULLY FUNCTIONAL**

---

## 1. Overview & Operational Scope

The Student module offers a modern, student-centric interface for daily academic and residential routines.

### Key Capabilities & Redesign Highlights
- **Student Command Center (`/student/dashboard`)**: Time-aware greeting, animated attendance donut gauge (`CircularProgress`), room allocation status, fee ledger balances, and recent institutional notices.
- **Academic Attendance (`/student/attendance`)**: Detailed course lecture attendance summaries with present/absent logs.
- **Hostel & Room Assignment (`/student/hostel`)**: Room details (e.g. Room `304`, Single Occupancy), roommate directory, and transfer request modal.
- **Fee Ledger & Payments (`/student/fees`)**: Transparent tuition and hostel fee ledger, verified payment histories, and receipt download triggers.
- **Complaints & Work Orders (`/student/complaints`)**: Maintenance ticket filing modal, live status badges (`OPEN`, `IN_PROGRESS`, `RESOLVED`), and technician comment timeline.
- **Gate Pass QR Code (`/student/gate-passes`)**: Digital gate pass generator with unique verification token for gate security check-in/out.

---

## 2. API & Database Integration

| Action | HTTP Route | Controller / Service | Data Source |
| :--- | :--- | :--- | :--- |
| **Dashboard Summary** | `GET /api/v1/students/dashboard-summary` | `studentController.js` | Neon PostgreSQL (Authenticated User ID) |
| **Profile** | `GET /api/v1/student/profile` | `studentRoleController.js` | `prisma.student.findUnique` |
| **Room Details** | `GET /api/v1/student/room` | `studentRoleController.js` | `prisma.roomAllocation.findFirst` |
| **Complaints** | `GET /api/v1/student/complaints` | `studentRoleController.js` | `prisma.complaint.findMany` |
| **Submit Complaint** | `POST /api/v1/student/complaints` | `studentRoleController.js` | `prisma.complaint.create` |
| **Leave Requests** | `GET /api/v1/student/leave-requests` | `studentRoleController.js` | `prisma.leaveRequest.findMany` |


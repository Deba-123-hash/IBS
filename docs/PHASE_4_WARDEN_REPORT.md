# CampusOS — Phase 4 Warden Module Redesign Report

**Document ID**: `DOC-P4-WDN-2026`  
**Role**: WARDEN (Hostel Residential Operations)  
**Primary Routes**: `/warden`, `/warden/hostels`, `/warden/allocations`, `/warden/transfers`, `/warden/leave-requests`, `/warden/complaints`, `/warden/visitors`  
**Status**: **PASS — FULLY FUNCTIONAL**

---

## 1. Overview & Operational Scope

The Warden module serves as the central command post for campus hostel buildings, room inventory, resident directory, leave approvals, and grievances.

### Key Capabilities & Redesign Highlights
- **7-View Command Center (`WardenDashboard.jsx`)**: Synchronized with URL subroutes for rapid bookmarking and browser navigation.
- **Room & Hostel Inventory**: Visual room grid with capacity badges, occupancy meters, and room detail inspection modals.
- **Resident Directory**: Filterable roster of 50 active students with room search and status badges.
- **Leave Application Approvals**: One-click Approve / Reject actions with customizable remarks passed directly to the backend.
- **Hostel Grievances**: Prioritized complaints triage with technician coordination triggers.

---

## 2. API & Database Integration

| Action | HTTP Route | Controller / Service | Data Source |
| :--- | :--- | :--- | :--- |
| **Warden Dashboard** | `GET /api/v1/warden/dashboard` | `wardenRoleController.js` | Neon PostgreSQL (Hostels, Rooms, Requests) |
| **Rooms Inventory** | `GET /api/v1/warden/rooms` | `wardenRoleController.js` | `prisma.room.findMany` |
| **Leave Requests** | `GET /api/v1/warden/leave-requests` | `wardenRoleController.js` | `prisma.leaveRequest.findMany` |
| **Approve Leave** | `PUT /api/v1/warden/leave-requests/:id/approve` | `wardenRoleController.js` | `prisma.leaveRequest.update` |
| **Reject Leave** | `PUT /api/v1/warden/leave-requests/:id/reject` | `wardenRoleController.js` | `prisma.leaveRequest.update` |
| **Resident Directory**| `GET /api/v1/warden/students` | `wardenRoleController.js` | `prisma.student.findMany` |


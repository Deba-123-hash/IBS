# CampusOS — Phase 4 Faculty Module Redesign Report

**Document ID**: `DOC-P4-FAC-2026`  
**Role**: FACULTY (Academic Instruction & Student Counseling)  
**Primary Routes**: `/staff`, `/faculty/dashboard`, `/faculty/attendance`, `/admin/students`, `/student/notices`  
**Status**: **PASS — FULLY FUNCTIONAL**

---

## 1. Overview & Operational Scope

The Faculty module provides professors and academic instructors with an integrated workstation to manage course curricula, student rosters, lecture attendance, and leave endorsements.

### Key Capabilities & Redesign Highlights
- **5-Tab Workstation (`StaffDashboard.jsx`)**: Seamlessly navigates across *Command Overview*, *Classes & Timetable*, *Student Roster*, *Leave Endorsements*, and *Academic Bulletins*.
- **Interactive Batch Attendance Modal**: Allows rapid marking of entire cohorts (`PRESENT`, `ABSENT`, `LATE`) with one-click bulk status toggles.
- **Assigned Student Roster**: Filterable roster of 50 active students with department, roll number, and academic attendance percentages.
- **Leave Endorsements**: Enables professors to review student medical and emergency leave applications and approve or reject them with academic counseling notes.

---

## 2. API & Database Integration

| Action | HTTP Route | Controller / Service | Data Source |
| :--- | :--- | :--- | :--- |
| **Faculty Dashboard** | `GET /api/v1/faculty/dashboard` | `facultyController.js` | Neon PostgreSQL (Classes, Students) |
| **Assigned Cohorts** | `GET /api/v1/faculty/classes` | `facultyController.js` | `prisma.batch.findMany` |
| **Student Roster** | `GET /api/v1/faculty/students` | `facultyController.js` | `prisma.student.findMany` |
| **Save Attendance** | `POST /api/v1/faculty/attendance` | `facultyController.js` | `prisma.attendanceRecord.upsert` |
| **Endorse Leave** | `PUT /api/v1/faculty/leave-endorsements/:id`| `facultyController.js` | `prisma.leaveRequest.update` |


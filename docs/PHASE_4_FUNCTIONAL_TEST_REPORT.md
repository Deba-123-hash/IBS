# CampusOS — Phase 4 Functional & RBAC Regression Test Report

**Document ID**: `DOC-P4-FUNC-TEST-2026`  
**System**: CampusOS / Unifix Tech Unified Campus Platform  
**Target Scope**: Authentication, Authorization, CRUD Operations, and API Integrations across All 8 Roles  
**Status**: **100% PASS**

---

## 1. Multi-Role Authentication & Session Verification

| Role / Account | Email Credential | Endpoint | Token Type | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| **Super Admin** | `superadmin@campus.demo` | `POST /auth/login` | Signed JWT | **PASS (200 OK)** |
| **Admin** | `admin@campus.demo` | `POST /auth/login` | Signed JWT | **PASS (200 OK)** |
| **Student** | `student@campus.demo` | `POST /auth/login` | Signed JWT | **PASS (200 OK)** |
| **Warden** | `warden@campus.demo` | `POST /auth/login` | Signed JWT | **PASS (200 OK)** |
| **Security** | `security@campus.demo` | `POST /auth/login` | Signed JWT | **PASS (200 OK)** |
| **Technician** | `maintenance@campus.demo`| `POST /auth/login` | Signed JWT | **PASS (200 OK)** |
| **Accountant** | `accounts@campus.demo` | `POST /auth/login` | Signed JWT | **PASS (200 OK)** |
| **Faculty** | `faculty@campus.demo` | `POST /auth/login` | Signed JWT | **PASS (200 OK)** |

---

## 2. RBAC & IDOR Boundary Protections

| Protected Route | Unauthorized User Attempt | Expected Status | Actual Status | Security Status |
| :--- | :--- | :---: | :---: | :---: |
| `GET /api/v1/admin/users` | Student (`student@campus.demo`) | `403 Forbidden` | `403 Forbidden` | **PASS (SECURED)** |
| `GET /api/v1/warden/rooms` | Student (`student@campus.demo`) | `403 Forbidden` | `403 Forbidden` | **PASS (SECURED)** |
| `GET /api/v1/accounts/overview` | Student (`student@campus.demo`) | `403 Forbidden` | `403 Forbidden` | **PASS (SECURED)** |
| `GET /api/v1/admin/users` | Faculty (`faculty@campus.demo`) | `403 Forbidden` | `403 Forbidden` | **PASS (SECURED)** |
| `POST /api/v1/warden/room-allocations` | Faculty (`faculty@campus.demo`) | `403 Forbidden` | `403 Forbidden` | **PASS (SECURED)** |


# CAMPUSOS ROLE-BASED ACCESS CONTROL (RBAC) ARCHITECTURE

## 1. Overview & Security Philosophy
CampusOS enforces strict, multi-layered Role-Based Access Control following:
**Least Privilege + Separation of Duties + Resource Ownership + Immutable Auditability**

Authorization decisions follow this deterministic precedence algorithm:
```text
1. Authenticate user (JWT Bearer Token verification).
2. Resolve user's active role & identity.
3. Check required permission (RESOURCE_ACTION_SCOPE).
4. Evaluate resource ownership / context (_OWN scope from token context).
5. Enforce separation of duties (prevent self-approval of financial transactions).
6. Execute operation and log sensitive state mutations to immutable AuditLog.
```

---

## 2. Core System Roles

| Role | Domain Ownership | Key Responsibilities | Hard Boundaries |
| :--- | :--- | :--- | :--- |
| **SUPER_ADMIN** | System Governance | Manages roles, permissions, system settings, global administration. | Cannot delete immutable records (Payments, Transactions, GateLogs, AuditLogs). Must be audited. |
| **ADMIN** | General Campus Operations | Manages students, staff, academic notices, hostel configuration, dashboard telemetry. | Cannot assign `SUPER_ADMIN`, verify payments, refund transactions, create expenses, or perform reconciliation. |
| **ACCOUNTANT** | Student Billing & Collections | Fee creation, payment collection, payment verification, payment rejection, receipts. | Cannot verify own created payments (Self-Approval forbidden). Cannot modify hostel allocations or delete financial records. |
| **ACCOUNTS** | Financial Control & Reconciliation | Expenses, bank reconciliation, financial reports, revenue/balance oversight. | Does not verify operational student fee payments. Cannot manage users, hostel rooms, or physical gate logs. |
| **SECURITY** | Physical Campus Security | Gate entry/exit, visitor registration & approvals, security incident response. | Cannot modify student fees, allocate hostel rooms, approve leaves, or delete historical gate logs. |
| **WARDEN** | Residential Life & Hostels | Hostel rooms, bed allocations, room transfers, leave approvals, hostel complaints. | Cannot verify payments, modify fee records, create accounting expenses, or tamper with security gate logs. |
| **FACULTY** | Academic Operations | Attendance recording for assigned classes, student academic profile views, notices. | Cannot verify payments, manage fees, allocate rooms, or alter administrative records. |
| **STUDENT** | Personal Self-Service | Own profile, own attendance, own hostel details, fee payments, leave/visitor requests. | Cannot view or modify records belonging to other students. Cannot verify payments or self-allocate rooms. |

---

## 3. Authoritative Role-Permission Matrix

| Permission Code | Super Admin | Admin | Accountant | Accounts | Security | Warden | Faculty | Student |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `USER_READ_ALL` | ✓ | ✓ | — | — | — | — | — | — |
| `USER_CREATE` | ✓ | ✓ | — | — | — | — | — | — |
| `USER_UPDATE` | ✓ | ✓ | — | — | — | — | — | — |
| `USER_DEACTIVATE` | ✓ | ✓ | — | — | — | — | — | — |
| `USER_ROLE_ASSIGN` | ✓ | — | — | — | — | — | — | — |
| `ROLE_MANAGE` | ✓ | — | — | — | — | — | — | — |
| `PERMISSION_MANAGE` | ✓ | — | — | — | — | — | — | — |
| `STUDENT_READ_ALL` | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — |
| `STUDENT_READ_OWN` | — | — | — | — | — | — | — | ✓ |
| `STUDENT_UPDATE` | ✓ | ✓ | — | — | — | — | — | — |
| `STUDENT_UPDATE_OWN` | — | — | — | — | — | — | — | ✓ |
| `ATTENDANCE_READ_ALL` | ✓ | ✓ | — | — | — | ✓ | — | — |
| `ATTENDANCE_READ_ASSIGNED` | — | — | — | — | — | — | ✓ | — |
| `ATTENDANCE_READ_OWN` | — | — | — | — | — | — | — | ✓ |
| `ATTENDANCE_CREATE` | ✓ | — | — | — | — | — | ✓ | — |
| `ATTENDANCE_UPDATE` | ✓ | — | — | — | — | — | ✓ | — |
| `HOSTEL_READ_ALL` | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — |
| `HOSTEL_READ_OWN` | — | — | — | — | — | — | — | ✓ |
| `HOSTEL_MANAGE` | ✓ | ✓ | — | — | — | ✓ | — | — |
| `ROOM_ASSIGN` | ✓ | ✓ | — | — | — | ✓ | — | — |
| `ROOM_TRANSFER_APPROVE` | ✓ | ✓ | — | — | — | ✓ | — | — |
| `ROOM_TRANSFER_REQUEST` | — | — | — | — | — | — | — | ✓ |
| `LEAVE_READ_ALL` | ✓ | ✓ | — | — | — | ✓ | — | — |
| `LEAVE_READ_OWN` | — | — | — | — | ✓ | — | — | ✓ |
| `LEAVE_CREATE` | — | — | — | — | — | — | — | ✓ |
| `LEAVE_APPROVE` | ✓ | — | — | — | — | ✓ | — | — |
| `LEAVE_REJECT` | ✓ | — | — | — | — | ✓ | — | — |
| `FEES_READ_ALL` | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | — |
| `FEES_READ_OWN` | — | — | — | — | — | — | — | ✓ |
| `FEES_CREATE` | ✓ | — | ✓ | — | — | — | — | — |
| `FEES_UPDATE` | ✓ | — | ✓ | — | — | — | — | — |
| `PAYMENT_READ_ALL` | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| `PAYMENT_READ_OWN` | — | — | — | — | — | — | — | ✓ |
| `PAYMENT_CREATE` | ✓ | — | ✓ | — | — | — | — | ✓ |
| `PAYMENT_VERIFY` | ✓ | — | ✓ | — | — | — | — | — |
| `PAYMENT_REJECT` | ✓ | — | ✓ | — | — | — | — | — |
| `PAYMENT_REFUND` | ✓ | — | — | ✓ | — | — | — | — |
| `EXPENSE_READ_ALL` | ✓ | ✓ | — | ✓ | — | — | — | — |
| `EXPENSE_CREATE` | ✓ | — | — | ✓ | — | — | — | — |
| `EXPENSE_UPDATE` | ✓ | — | — | ✓ | — | — | — | — |
| `RECONCILIATION_READ` | ✓ | — | — | ✓ | — | — | — | — |
| `RECONCILIATION_CREATE` | ✓ | — | — | ✓ | — | — | — | — |
| `FINANCIAL_REPORT_READ` | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| `FINANCIAL_REPORT_EXPORT`| ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| `VISITOR_READ_ALL` | ✓ | ✓ | — | — | ✓ | ✓ | — | — |
| `VISITOR_READ_OWN` | — | — | — | — | — | — | — | ✓ |
| `VISITOR_CREATE` | ✓ | ✓ | — | — | ✓ | — | — | ✓ |
| `VISITOR_APPROVE` | ✓ | ✓ | — | — | ✓ | ✓* | — | — |
| `VISITOR_REJECT` | ✓ | ✓ | — | — | ✓ | ✓* | — | — |
| `GATE_ENTRY` | ✓ | — | — | — | ✓ | — | — | — |
| `GATE_EXIT` | ✓ | — | — | — | ✓ | — | — | — |
| `GATE_LOG_READ` | ✓ | ✓ | — | — | ✓ | ✓ | — | — |
| `EMERGENCY_CREATE` | ✓ | ✓ | — | — | ✓ | ✓ | — | — |
| `EMERGENCY_READ` | ✓ | ✓ | — | — | ✓ | ✓ | — | — |
| `EMERGENCY_RESOLVE` | ✓ | ✓ | — | — | ✓ | ✓ | — | — |
| `COMPLAINT_READ_ALL` | ✓ | ✓ | — | — | — | ✓ | — | — |
| `COMPLAINT_READ_OWN` | — | — | — | — | — | — | — | ✓ |
| `COMPLAINT_CREATE` | ✓ | ✓ | — | — | — | — | ✓ | ✓ |
| `COMPLAINT_ASSIGN` | ✓ | ✓ | — | — | — | ✓ | — | — |
| `COMPLAINT_RESOLVE` | ✓ | ✓ | — | — | ✓* | ✓ | ✓* | — |
| `NOTICE_READ` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `NOTICE_CREATE` | ✓ | ✓ | — | — | — | ✓ | ✓* | — |
| `NOTICE_UPDATE` | ✓ | ✓ | — | — | — | ✓* | ✓* | — |
| `NOTICE_DELETE` | ✓ | ✓ | — | — | — | — | — | — |
| `AUDIT_READ` | ✓ | ✓ | — | — | — | — | — | — |
| `AUDIT_EXPORT` | ✓ | ✓ | — | — | — | — | — | — |
| `AUDIT_DELETE` | — | — | — | — | — | — | — | — |

*Restricted to assigned scope / category.

---

## 4. Reusable Middleware Implementation

Located in `server/src/middleware/auth.js`:

1. `authenticate`: Verifies JWT access token, checks user account active status.
2. `requireRole(roles)`: Enforces allowed roles.
3. `requirePermission(permissionCode)`: Verifies role-permission matrix against database / cache.
4. `requireOwnership(paramName, resolver)`: Enforces that requests cannot access another user's resources.
5. `preventSelfApproval(creatorField)`: Prevents operators from approving transactions they created themselves.

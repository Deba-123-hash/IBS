# CAMPUSOS UNIFIED API SPECIFICATION

All endpoints follow the standard response envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

Error response envelope:
```json
{
  "success": false,
  "message": "Human readable error reason",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
```

---

## 1. ADMIN APIS (`/api/admin`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/dashboard` | `GET` | `USER_READ_ALL` | Centralized campus metrics (students, hostels, fees, complaints, gate traffic, alerts). |
| `/api/admin/users` | `GET` | `USER_READ_ALL` | List all system accounts with pagination, search, status, and role filter. |
| `/api/admin/users/:id` | `GET` | `USER_READ_ALL` | Detailed user account profile with student/staff records. |
| `/api/admin/users` | `POST` | `USER_CREATE` | Create new staff or user account. Enforces role restrictions (cannot create Super Admin). |
| `/api/admin/users/:id` | `PATCH` | `USER_UPDATE` | Update contact information, name, status. |
| `/api/admin/users/:id/status` | `PATCH` | `USER_DEACTIVATE` | Activate or deactivate account. Produces immutable audit log. |
| `/api/admin/users/:id/role` | `PATCH` | `USER_ROLE_ASSIGN` | Update user role. Admin cannot promote to `SUPER_ADMIN`. |
| `/api/admin/students` | `GET` | `STUDENT_READ_ALL` | Filterable student directory (by dept, batch, semester, hostel, status). |
| `/api/admin/students/:id` | `GET` | `STUDENT_READ_ALL` | Full student 360 record (profile, room, fees, complaints). |
| `/api/admin/students/:id` | `PATCH` | `STUDENT_UPDATE` | Update academic details, emergency contact, guardian info. |
| `/api/admin/notices` | `GET` | `NOTICE_READ` | Paginated campus notices. |
| `/api/admin/notices` | `POST` | `NOTICE_CREATE` | Publish targeted broadcast notice (`ALL`, `STUDENT`, `FACULTY`, `WARDEN`, etc.). |
| `/api/admin/notices/:id` | `PATCH` | `NOTICE_UPDATE` | Edit existing notice title, content, or priority. |
| `/api/admin/notices/:id` | `DELETE` | `NOTICE_DELETE` | Delete notice. |
| `/api/admin/notices/:id/publish` | `POST` | `NOTICE_UPDATE` | Publish draft notice to targeted stakeholders. |
| `/api/admin/audit-logs` | `GET` | `AUDIT_READ` | Paginated immutable system activity audit logs. |

---

## 2. ACCOUNTANT APIS (`/api/accountant`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/accountant/dashboard` | `GET` | `FEES_READ_ALL` | Total collection, today's collection, pending dues, overdue amounts, stats. |
| `/api/accountant/fees` | `GET` | `FEES_READ_ALL` | Fee schedule & student fee records with category and semester filters. |
| `/api/accountant/fees` | `POST` | `FEES_CREATE` | Issue fee invoices (`HOSTEL_FEE`, `MESS_FEE`, `TUITION_FEE`, `FINE`, etc.). |
| `/api/accountant/fees/:id` | `GET` | `FEES_READ_ALL` | Detailed fee invoice with breakdown and payment transactions. |
| `/api/accountant/fees/:id` | `PATCH` | `FEES_UPDATE` | Update fee terms or apply concession. |
| `/api/accountant/students/:studentId/fees` | `GET` | `FEES_READ_ALL` | Fee ledger for a specific student. |
| `/api/accountant/students/:studentId/dues` | `GET` | `FEES_READ_ALL` | Calculate outstanding dues for student. |
| `/api/accountant/payments` | `GET` | `PAYMENT_READ_ALL` | List incoming payments with status filter (`PENDING`, `SUCCESS`, `FAILED`, etc.). |
| `/api/accountant/payments` | `POST` | `PAYMENT_CREATE` | Record manual counter payment (Cash, POS, Cheque, Bank Transfer). |
| `/api/accountant/payments/:id` | `GET` | `PAYMENT_READ_ALL` | Detailed transaction view. |
| `/api/accountant/payments/:id/verify` | `POST` | `PAYMENT_VERIFY` | Verify pending payment. Prevents self-approval. Produces audit log. |
| `/api/accountant/payments/:id/reject` | `POST` | `PAYMENT_REJECT` | Reject invalid payment with mandatory reason. |
| `/api/accountant/payments/:id/receipt` | `GET` | `PAYMENT_READ_ALL` | Generate formal payment receipt with receipt number and verification metadata. |

---

## 3. ACCOUNTS APIS (`/api/accounts`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/accounts/dashboard` | `GET` | `FINANCIAL_REPORT_READ` | Total revenue, expenses, net liquidity, pending reconciliations. |
| `/api/accounts/transactions` | `GET` | `PAYMENT_READ_ALL` | Read-only ledger of all campus financial transactions. |
| `/api/accounts/income` | `GET` | `FINANCIAL_REPORT_READ` | Categorized fee revenue stream analysis. |
| `/api/accounts/expenses` | `GET` | `EXPENSE_READ_ALL` | List campus operating expenses by category (`HOSTEL`, `MESS`, `MAINTENANCE`, etc.). |
| `/api/accounts/expenses` | `POST` | `EXPENSE_CREATE` | Record campus operational expense voucher. |
| `/api/accounts/expenses/:id` | `PATCH` | `EXPENSE_UPDATE` | Update expense details / approval state. |
| `/api/accounts/balance` | `GET` | `FINANCIAL_REPORT_READ` | Account balance and ledger net summary. |
| `/api/accounts/reports` | `GET` | `FINANCIAL_REPORT_READ` | High-level financial reporting summaries. |
| `/api/accounts/reports/monthly` | `GET` | `FINANCIAL_REPORT_READ` | Month-over-month income, expense, and surplus comparison. |
| `/api/accounts/reports/yearly` | `GET` | `FINANCIAL_REPORT_READ` | Fiscal year consolidated financial overview. |
| `/api/accounts/reconciliation` | `GET` | `RECONCILIATION_READ` | Bank reconciliation history. |
| `/api/accounts/reconciliation` | `POST` | `RECONCILIATION_CREATE` | Execute statement reconciliation and record discrepancies. |

---

## 4. SECURITY APIS (`/api/security`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/security/dashboard` | `GET` | `GATE_LOG_READ` | Real-time security metrics (visitors on campus, entries/exits today, alerts). |
| `/api/security/gate/entry` | `POST` | `GATE_ENTRY` | Record entry of student, visitor, or staff vehicle into campus. |
| `/api/security/gate/exit` | `POST` | `GATE_EXIT` | Record exit timestamp and close active gate movement. |
| `/api/security/gate/logs` | `GET` | `GATE_LOG_READ` | Filterable append-only gate movement records. |
| `/api/security/visitors` | `GET` | `VISITOR_READ_ALL` | Registered visitor list with status filter (`PENDING`, `APPROVED`, `INSIDE`, `EXITED`). |
| `/api/security/visitors` | `POST` | `VISITOR_CREATE` | Register walk-in visitor with ID proof and purpose. |
| `/api/security/visitors/:id` | `GET` | `VISITOR_READ_ALL` | Specific visitor profile and visit logs. |
| `/api/security/visitors/:id/status` | `PATCH` | `VISITOR_APPROVE` | Approve, reject, or mark visitor entered/exited. |
| `/api/security/emergency` | `GET` | `EMERGENCY_READ` | List active emergency alerts (`MEDICAL`, `FIRE`, `SECURITY`, `FIGHT`, etc.). |
| `/api/security/emergency` | `POST` | `EMERGENCY_CREATE` | Trigger high-priority emergency alert. Broadcasts to safety team. |
| `/api/security/emergency/:id/resolve` | `PATCH` | `EMERGENCY_RESOLVE` | Resolve emergency incident with post-action notes. |

---

## 5. WARDEN APIS (`/api/warden`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/warden/dashboard` | `GET` | `HOSTEL_MANAGE` | Hostel occupancy, pending leaves, transfers, complaints, bed availability. |
| `/api/warden/hostels` | `GET` | `HOSTEL_READ_ALL` | All hostel blocks, room lists, warden allocations. |
| `/api/warden/hostels/:id` | `GET` | `HOSTEL_READ_ALL` | Hostel details with block and room occupant hierarchies. |
| `/api/warden/rooms` | `GET` | `HOSTEL_READ_ALL` | Room directory with occupancy and vacancy status. |
| `/api/warden/rooms/:id` | `GET` | `HOSTEL_READ_ALL` | Specific room occupant details and inventory. |
| `/api/warden/room-allocations` | `POST` | `ROOM_ASSIGN` | Allocate vacant bed to student. Updates room occupancy counter. |
| `/api/warden/room-allocations/:id` | `PATCH` | `ROOM_ASSIGN` | Deactivate or reassign allocation. |
| `/api/warden/room-allocations/:id` | `DELETE`| `ROOM_ASSIGN` | Deallocate student from room. |
| `/api/warden/room-transfers` | `GET` | `ROOM_TRANSFER_APPROVE` | List student room transfer requests. |
| `/api/warden/room-transfers` | `POST` | `ROOM_ASSIGN` | Initiate administrative room transfer. |
| `/api/warden/room-transfers/:id/approve` | `PATCH`| `ROOM_TRANSFER_APPROVE` | Approve transfer, update allocations, and rebalance occupancy. |
| `/api/warden/room-transfers/:id/reject` | `PATCH`| `ROOM_TRANSFER_APPROVE` | Reject transfer with comments. |
| `/api/warden/leave-requests` | `GET` | `LEAVE_READ_ALL` | Review student hostel leave / night-out requests. |
| `/api/warden/leave-requests/:id` | `GET` | `LEAVE_READ_ALL` | Detailed leave application. |
| `/api/warden/leave-requests/:id/approve`| `PATCH`| `LEAVE_APPROVE` | Approve leave application. |
| `/api/warden/leave-requests/:id/reject` | `PATCH`| `LEAVE_REJECT` | Reject leave request with justification. |
| `/api/warden/complaints` | `GET` | `COMPLAINT_READ_ALL` | Hostel complaints filterable by category and status. |
| `/api/warden/complaints/:id/assign` | `PATCH` | `COMPLAINT_ASSIGN` | Assign maintenance staff to complaint. |
| `/api/warden/complaints/:id/status` | `PATCH` | `COMPLAINT_RESOLVE` | Update complaint status (`IN_PROGRESS`, `RESOLVED`, `REJECTED`). |

---

## 6. STUDENT SELF-SERVICE APIS (`/api/student` & `/api/students`)

*All student endpoints automatically enforce context ownership derived from `req.user.studentId`.*

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/student/dashboard` | `GET` | `STUDENT_READ_OWN` | Personalized student dashboard (attendance %, room, dues, complaints, notices). |
| `/api/student/profile` | `GET` | `STUDENT_READ_OWN` | Authenticated student profile, batch, department, guardian. |
| `/api/student/profile` | `PATCH` | `STUDENT_UPDATE_OWN` | Update permitted profile fields (phone, emergency contact). |
| `/api/student/attendance` | `GET` | `ATTENDANCE_READ_OWN` | Detailed subject session attendance records. |
| `/api/student/attendance/summary`| `GET` | `ATTENDANCE_READ_OWN` | Subject-wise attendance calculation, total attended, percentage. |
| `/api/student/hostel` | `GET` | `HOSTEL_READ_OWN` | Current hostel, block, warden contacts. |
| `/api/student/room` | `GET` | `HOSTEL_READ_OWN` | Room number, floor, roommates list. |
| `/api/student/room-transfer-request` | `POST` | `ROOM_TRANSFER_REQUEST` | Submit request for hostel room transfer. |
| `/api/student/leave-requests` | `GET` | `LEAVE_READ_OWN` | Personal leave application history. |
| `/api/student/leave-requests` | `POST` | `LEAVE_CREATE` | Apply for hostel out-pass or leave. |
| `/api/student/leave-requests/:id` | `GET` | `LEAVE_READ_OWN` | Specific leave application status. |
| `/api/student/leave-requests/:id` | `DELETE`| `LEAVE_CREATE` | Cancel pending leave request. |
| `/api/student/complaints` | `GET` | `COMPLAINT_READ_OWN` | Student filed complaints. |
| `/api/student/complaints` | `POST` | `COMPLAINT_CREATE` | Submit room or facility complaint. |
| `/api/student/complaints/:id` | `GET` | `COMPLAINT_READ_OWN` | View ticket details and comments. |
| `/api/student/fees` | `GET` | `FEES_READ_OWN` | View student fee schedule and paid/pending balances. |
| `/api/student/fees/summary` | `GET` | `FEES_READ_OWN` | Total billed, total paid, and total outstanding dues. |
| `/api/student/payments` | `GET` | `PAYMENT_READ_OWN` | Historical payment receipts. |
| `/api/student/visitor-requests` | `GET` | `VISITOR_READ_OWN` | Campus guest pre-registration history. |
| `/api/student/visitor-requests` | `POST` | `VISITOR_CREATE` | Submit guest arrival request. |
| `/api/student/visitor-requests/:id/cancel` | `PATCH` | `VISITOR_CREATE` | Cancel unapproved visitor request. |

---

## 7. NOTIFICATIONS & AUDIT LOGS

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/notifications` | `GET` | Authenticated | User's notifications paginated with unread count. |
| `/api/notifications/:id/read` | `PATCH` | Authenticated | Mark notification as read. |
| `/api/notifications/read-all` | `PATCH` | Authenticated | Mark all user notifications as read. |
| `/api/notifications/:id` | `DELETE` | Authenticated | Dismiss notification. |
| `/api/admin/audit-logs` | `GET` | `AUDIT_READ` | System audit ledger with before/after diffs, actor details, IP, and timestamp. |

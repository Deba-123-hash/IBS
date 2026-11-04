# CAMPUSOS DATABASE & PRISMA SCHEMA DOCUMENTATION

## 1. Overview
The CampusOS database is deployed on **Neon PostgreSQL** with connection pooling (`pg-pool` & `@prisma/adapter-pg`).
The schema encapsulates 53 entity tables and 16 enumerated domain types, modeling complete campus operations with relational integrity, cascading constraints, unique indexes, and audit immutability.

---

## 2. Core Domain Enums

1. `Role`: `SUPER_ADMIN`, `ADMIN`, `STUDENT`, `FACULTY`, `WARDEN`, `SECURITY`, `ACCOUNTANT`, `ACCOUNTS`, `MAINTENANCE`
2. `FeeCategory`: `HOSTEL_FEE`, `MESS_FEE`, `TUITION_FEE`, `EXAM_FEE`, `LIBRARY_FEE`, `FINE`, `OTHER`
3. `PaymentStatus`: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`, `REJECTED`, `CANCELLED`
4. `ExpenseCategory`: `HOSTEL`, `MESS`, `ELECTRICITY`, `WATER`, `MAINTENANCE`, `SECURITY`, `SALARY`, `EQUIPMENT`, `OTHER`
5. `ExpenseStatus`: `PENDING`, `APPROVED`, `REJECTED`, `PAID`
6. `ReconciliationStatus`: `MATCHED`, `DISCREPANCY`, `PENDING_REVIEW`, `RESOLVED`
7. `TransferStatus`: `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`, `CANCELLED`
8. `GateLogStatus`: `INSIDE`, `EXITED`, `OVERDUE`
9. `EmergencyType`: `MEDICAL`, `FIRE`, `SECURITY`, `FIGHT`, `ACCIDENT`, `OTHER`
10. `EmergencySeverity`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
11. `EmergencyStatus`: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED`
12. `VisitorRequestStatus`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED`
13. `NotificationType`: `FEE`, `HOSTEL`, `COMPLAINT`, `LEAVE`, `VISITOR`, `NOTICE`, `SECURITY`, `SYSTEM`
14. `ComplaintStatus`: `SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`, `CLOSED`
15. `LeaveStatus`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
16. `Priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

---

## 3. Key Model Relationships & Schemas

### Role & Permission Management
- `User`: Identity root with `email` (`@unique`), `passwordHash`, `role` (`Role`), `isActive`, and relations to `Student`, `Staff`, `notifications`, `auditLogs`.
- `Permission`: Granular action definition with `code` (`@unique`), `resource`, `action`, `scope`, `isSensitive`.
- `RolePermission`: Many-to-many join between `Role` and `Permission` with compound unique index `@@unique([role, permissionId])`.

### Financial Operations
- `FeeRecord`: Student billing record with `studentId`, `academicYear`, `semester`, `totalAmount`, `paidAmount`, `dueAmount`, `status`.
- `Payment`: Direct payment transaction with `studentId`, `feeRecordId`, `amount`, `paymentMethod`, `status`, `transactionId` (`@unique`), `receiptNumber` (`@unique`), `verifiedById`.
- `Expense`: Campus operational expense voucher with `category` (`ExpenseCategory`), `amount`, `vendorName`, `status`, `approvedById`.
- `Reconciliation`: Account reconciliation journal entry with `periodStart`, `periodEnd`, `statementBalance`, `bookBalance`, `difference`, `status`, `reconciledById`.

### Hostel & Residential Life
- `Hostel`: Hostel block root with `name`, `gender`, `wardenId` -> `Staff`.
- `Block`: Physical wing within a hostel.
- `Room`: Room entity with `roomNumber`, `floorNumber`, `capacity`, `currentOccupancy`.
- `RoomAllocation`: Student room assignment with `studentId` (`@unique`), `roomId`, `startDate`, `endDate`, `isActive`.
- `RoomTransfer`: Transfer workflow record with `studentId`, `fromRoomId`, `toRoomId`, `reason`, `status`, `approvedById`.
- `LeaveRequest`: Student night-out or leave application with `studentId`, `startDate`, `endDate`, `destination`, `reason`, `status`, `approvedById`.

### Campus Security & Gate Control
- `Visitor`: External visitor registry with `visitorNumber` (`@unique`), `fullName`, `phoneNumber`, `idProofType`, `idProofNumber`.
- `VisitorRequest`: Student guest arrival pre-authorization with `studentId`, `visitorName`, `purpose`, `expectedDate`, `status`.
- `GateLog`: Append-only physical gate crossing log with `personName`, `personType`, `studentId`, `visitorId`, `vehicleNumber`, `entryTime`, `exitTime`, `status`, `securityStaffId`.
- `EmergencyIncident`: Emergency alert ticket with `type` (`EmergencyType`), `severity` (`EmergencySeverity`), `location`, `status`, `reportedById`, `resolvedById`.

### Auditability & Notifications
- `AuditLog`: Immutable system ledger recording sensitive state transitions with `actorUserId`, `actorRole`, `action`, `entity`, `entityId`, `oldData`, `newData`, `ipAddress`, `userAgent`, `createdAt`.
- `Notification`: High-priority in-app notification with `userId`, `title`, `message`, `type` (`NotificationType`), `isRead`, `createdAt`.

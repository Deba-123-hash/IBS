# CampusOS — Database Setup & Neon PostgreSQL Architecture

## 1. Overview
CampusOS uses **Neon Serverless PostgreSQL** hosted in the AWS Ohio (`us-east-2`) cloud region. Data modeling, migration management, and queries are orchestrated through **Prisma ORM** with a high-concurrency `pg.Pool` connection adapter.

---

## 2. Database Connection Architecture

To handle serverless connection bursts without overloading PostgreSQL process limits, the database configuration uses Neon's pgBouncer connection pooler:

- **Host**: `ep-morning-brook-b5tx1efd-pooler.c-7.us-east-2.aws.neon.tech`
- **Database**: `neondb`
- **SSL**: Required (`sslmode=require`)
- **Engine Version**: PostgreSQL 18.6 (ac70818)

### Connection Setup in Code (`server/src/config/database.ts`)
```typescript
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

---

## 3. Schema Models & Inventory

The schema is defined in [`server/prisma/schema.prisma`](file:///d:/IBST/DEBA%20IBST/DEBA%20IBST/server/prisma/schema.prisma). It encapsulates 43 data models across distinct institutional domains:

1. **Authentication & Identity**: `User`, `Student`, `Staff`, `Department`, `Program`, `Batch`
2. **Residential & Hostel**: `Hostel`, `HostelBlock`, `Room`, `RoomAllocation`, `RoomTransfer`, `Asset`
3. **Grievance Management**: `ComplaintCategory`, `Complaint`, `ComplaintComment`, `ComplaintAssignment`, `ComplaintStatusHistory`
4. **Passes & Permissions**: `GatePass`, `GatePassApproval`, `GatePassEvent`, `LeaveRequest`, `CertificateRequest`
5. **Academic Instruction**: `Subject`, `Attendance`, `AttendanceRecord`, `Timetable`, `ClassUpdate`
6. **Dining & Facilities**: `MessMenu`, `MessFeedback`, `Visitor`, `VisitorLog`, `GateLog`
7. **Accounts & Treasury**: `FeeRecord`, `FeePayment`, `FeeQuery`, `Payment`, `Expense`, `Reconciliation`
8. **Governance & Audit**: `Notice`, `NoticeTarget`, `NoticeRead`, `Notification`, `AuditLog`

---

## 4. Safe Database Verification (Zero Data Loss)

To verify the database health without altering existing records or risking data loss, run the non-destructive verification suite:

```bash
node scripts/verify-database.js
```

### What this script verifies:
- [x] Pool handshake latency ($\sim 340\text{ms}$ roundtrip to Ohio).
- [x] Model population (187 Users, 136 Students, 42 Staff, 55 Rooms, 60 Complaints, 474 Audit Logs).
- [x] Cryptographic password compliance (100% bcrypt hashes, 0 plaintext passwords).
- [x] Relational integrity (0 orphan students, 0 orphan staff, 0 over-capacity rooms).
- [x] Migration history tracking (`_prisma_migrations` baseline `20260930000000_init`).

---

## 5. Safe Migration Commands

> [!CAUTION]
> Never run `prisma migrate reset` in a shared or production environment as it will wipe existing data.

- **Generate Types without Schema Changes**:
  ```bash
  cd "server"
  npx prisma generate
  ```
- **Inspect Migration Status**:
  ```bash
  cd "server"
  npx prisma migrate status
  ```
- **Apply New Pending Migrations**:
  ```bash
  cd "server"
  npx prisma migrate deploy
  ```

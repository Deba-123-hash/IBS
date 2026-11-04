import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;
const rawUrl = process.env.DATABASE_URL || '';

if (!rawUrl) {
  console.error('[Apply Role Models] ERROR: DATABASE_URL not found in server/.env');
  process.exit(1);
}

const client = new Client({
  connectionString: rawUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('[Apply Role Models] Connecting to Neon PostgreSQL...');
    await client.connect();
    console.log('[Apply Role Models] Connected successfully.');

    // 1. Add ACCOUNTANT to Role enum if not present
    await client.query(`
      DO $$ BEGIN
        ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ACCOUNTANT';
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('[Apply Role Models] Ensured ACCOUNTANT enum value on Role.');

    // 2. Helper to safely create enums
    const enums = [
      { name: 'FeeCategory', values: ['HOSTEL_FEE', 'MESS_FEE', 'TUITION_FEE', 'EXAM_FEE', 'LIBRARY_FEE', 'FINE', 'OTHER'] },
      { name: 'PaymentStatus', values: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'REJECTED', 'CANCELLED'] },
      { name: 'ExpenseCategory', values: ['HOSTEL', 'MESS', 'ELECTRICITY', 'WATER', 'MAINTENANCE', 'SECURITY', 'SALARY', 'EQUIPMENT', 'OTHER'] },
      { name: 'ExpenseStatus', values: ['PENDING', 'APPROVED', 'PAID', 'REJECTED'] },
      { name: 'ReconciliationStatus', values: ['DRAFT', 'RECONCILED', 'DISCREPANCY_FLAGGED'] },
      { name: 'TransferStatus', values: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] },
      { name: 'GateLogStatus', values: ['INSIDE', 'EXITED'] },
      { name: 'EmergencyType', values: ['MEDICAL', 'FIRE', 'SECURITY', 'FIGHT', 'ACCIDENT', 'OTHER'] },
      { name: 'EmergencySeverity', values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
      { name: 'EmergencyStatus', values: ['OPEN', 'INVESTIGATING', 'RESOLVED'] },
      { name: 'VisitorRequestStatus', values: ['PENDING', 'APPROVED', 'REJECTED', 'INSIDE', 'EXITED', 'CANCELLED'] }
    ];

    for (const e of enums) {
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${e.name}') THEN
            CREATE TYPE "${e.name}" AS ENUM (${e.values.map(v => `'${v}'`).join(', ')});
          END IF;
        END $$;
      `);
    }
    console.log('[Apply Role Models] Created/verified all domain Enums.');

    // 3. Update AuditLog columns
    await client.query(`
      ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "actorRole" TEXT;
      ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "oldData" TEXT;
      ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "newData" TEXT;
      CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
    `);
    console.log('[Apply Role Models] Updated AuditLog columns.');

    // 4. Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Permission" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "code" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "resource" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "scope" TEXT NOT NULL DEFAULT 'ALL',
        "isSensitive" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "Permission_code_idx" ON "Permission"("code");
      CREATE INDEX IF NOT EXISTS "Permission_resource_idx" ON "Permission"("resource");

      CREATE TABLE IF NOT EXISTS "RolePermission" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "role" "Role" NOT NULL,
        "permissionId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "RolePermission_role_permissionId_key" UNIQUE ("role", "permissionId")
      );
      CREATE INDEX IF NOT EXISTS "RolePermission_role_idx" ON "RolePermission"("role");

      CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "receiptNumber" TEXT NOT NULL UNIQUE,
        "transactionRef" TEXT NOT NULL UNIQUE,
        "studentId" TEXT NOT NULL,
        "feeRecordId" TEXT,
        "amount" DOUBLE PRECISION NOT NULL,
        "feeCategory" "FeeCategory" NOT NULL DEFAULT 'TUITION_FEE',
        "paymentMode" TEXT NOT NULL DEFAULT 'ONLINE',
        "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
        "verifiedById" TEXT,
        "verifiedAt" TIMESTAMP(3),
        "rejectedReason" TEXT,
        "refundReason" TEXT,
        "remarks" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Payment_feeRecordId_fkey" FOREIGN KEY ("feeRecordId") REFERENCES "FeeRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Payment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "Payment_studentId_idx" ON "Payment"("studentId");
      CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
      CREATE INDEX IF NOT EXISTS "Payment_transactionRef_idx" ON "Payment"("transactionRef");

      CREATE TABLE IF NOT EXISTS "Expense" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "category" "ExpenseCategory" NOT NULL DEFAULT 'OTHER',
        "description" TEXT,
        "invoiceNumber" TEXT,
        "vendorName" TEXT,
        "status" "ExpenseStatus" NOT NULL DEFAULT 'APPROVED',
        "createdById" TEXT NOT NULL,
        "approvedById" TEXT,
        "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Expense_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense"("category");
      CREATE INDEX IF NOT EXISTS "Expense_status_idx" ON "Expense"("status");

      CREATE TABLE IF NOT EXISTS "Reconciliation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "periodStart" TIMESTAMP(3) NOT NULL,
        "periodEnd" TIMESTAMP(3) NOT NULL,
        "totalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "totalExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "systemBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "actualBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "discrepancy" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "status" "ReconciliationStatus" NOT NULL DEFAULT 'RECONCILED',
        "notes" TEXT,
        "performedById" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Reconciliation_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "Reconciliation_status_idx" ON "Reconciliation"("status");

      CREATE TABLE IF NOT EXISTS "RoomTransfer" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "fromRoomId" TEXT NOT NULL,
        "toRoomId" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
        "reviewedById" TEXT,
        "remarks" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RoomTransfer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "RoomTransfer_fromRoomId_fkey" FOREIGN KEY ("fromRoomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "RoomTransfer_toRoomId_fkey" FOREIGN KEY ("toRoomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "RoomTransfer_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "RoomTransfer_studentId_idx" ON "RoomTransfer"("studentId");
      CREATE INDEX IF NOT EXISTS "RoomTransfer_status_idx" ON "RoomTransfer"("status");

      CREATE TABLE IF NOT EXISTS "GateLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "personName" TEXT NOT NULL,
        "personType" TEXT NOT NULL DEFAULT 'VISITOR',
        "studentId" TEXT,
        "visitorId" TEXT,
        "vehicleNumber" TEXT,
        "purpose" TEXT,
        "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "exitTime" TIMESTAMP(3),
        "securityStaffId" TEXT,
        "status" "GateLogStatus" NOT NULL DEFAULT 'INSIDE',
        "remarks" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "GateLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "GateLog_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "GateLog_securityStaffId_fkey" FOREIGN KEY ("securityStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "GateLog_entryTime_idx" ON "GateLog"("entryTime");
      CREATE INDEX IF NOT EXISTS "GateLog_status_idx" ON "GateLog"("status");

      CREATE TABLE IF NOT EXISTS "EmergencyIncident" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "incidentNumber" TEXT NOT NULL UNIQUE,
        "type" "EmergencyType" NOT NULL DEFAULT 'SECURITY',
        "severity" "EmergencySeverity" NOT NULL DEFAULT 'HIGH',
        "location" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "reportedById" TEXT,
        "status" "EmergencyStatus" NOT NULL DEFAULT 'OPEN',
        "resolvedById" TEXT,
        "resolutionNotes" TEXT,
        "resolvedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EmergencyIncident_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "EmergencyIncident_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "EmergencyIncident_status_idx" ON "EmergencyIncident"("status");
      CREATE INDEX IF NOT EXISTS "EmergencyIncident_type_idx" ON "EmergencyIncident"("type");

      CREATE TABLE IF NOT EXISTS "VisitorRequest" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "visitorName" TEXT NOT NULL,
        "phoneNumber" TEXT NOT NULL,
        "idProofType" TEXT,
        "idProofNumber" TEXT,
        "studentId" TEXT NOT NULL,
        "purpose" TEXT NOT NULL,
        "visitDate" TIMESTAMP(3) NOT NULL,
        "status" "VisitorRequestStatus" NOT NULL DEFAULT 'PENDING',
        "reviewedById" TEXT,
        "rejectionReason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "VisitorRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "VisitorRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX IF NOT EXISTS "VisitorRequest_studentId_idx" ON "VisitorRequest"("studentId");
      CREATE INDEX IF NOT EXISTS "VisitorRequest_status_idx" ON "VisitorRequest"("status");
    `);

    console.log('[Apply Role Models] All new tables and constraints created successfully.');
  } catch (err) {
    console.error('[Apply Role Models] Error executing DDL:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

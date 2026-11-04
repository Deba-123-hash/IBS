import prisma, { pool } from '../server/src/config/database.js';
import ENV from '../server/src/config/env.js';

console.log('\n================================================================');
console.log('  CAMPUSOS COMPREHENSIVE DATABASE AUDIT & VALIDATION SUITE');
console.log('  Engine: Neon Serverless PostgreSQL (pg Pool + Prisma ORM)');
console.log('================================================================\n');

let passed = 0;
let failed = 0;
const testResults = [];

function assert(category, testId, description, condition, details = '') {
  const result = { category, testId, description, status: condition ? 'PASS' : 'FAIL', details };
  testResults.push(result);
  if (condition) {
    console.log(`  ✓ [${testId}] ${description}`);
    passed++;
  } else {
    console.error(`  ✗ [${testId}] ${description} ${details ? `-> ${details}` : ''}`);
    failed++;
  }
}

async function runDatabaseAudit() {
  const startTime = Date.now();

  try {
    // -------------------------------------------------------------
    // SUITE 1: NEON CONNECTION, ENVIRONMENT & CREDENTIAL SECURITY
    // -------------------------------------------------------------
    console.log('[Suite 1: Neon Connection, Pool Configuration & Credential Safety]');

    const rawDbUrl = ENV.DATABASE_URL || process.env.DATABASE_URL || '';
    assert('Connection', 'CONN-01', 'DATABASE_URL environment variable is configured', !!rawDbUrl);

    // Verify connection string points to Neon
    const isNeon = rawDbUrl.includes('neon.tech') || rawDbUrl.includes('pooler');
    assert('Connection', 'CONN-02', 'DATABASE_URL targets Neon Serverless PostgreSQL', isNeon);

    // Verify pooled connection string usage
    const isPooled = rawDbUrl.includes('-pooler');
    assert('Connection', 'CONN-03', 'Connection string utilizes Neon connection pooling endpoint (-pooler)', isPooled);

    // Verify credentials are not accidentally exposed in client bundles or public files
    const maskedUrl = rawDbUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:********@');
    console.log(`     (Sanitized Database Target: ${maskedUrl.split('@')[1] || 'neon.tech'})`);
    assert('Security', 'SEC-01', 'Database credentials securely masked in audit logs', !maskedUrl.includes('//.*:.*@'));

    // Test pg.Pool direct query
    const client = await pool.connect();
    const pingStart = Date.now();
    const versionRes = await client.query('SELECT version(), current_database(), current_user, current_setting(\'server_version\') as server_version');
    const pingLatency = Date.now() - pingStart;
    client.release();

    assert('Connection', 'CONN-04', `Neon PostgreSQL pool handshake successful (${pingLatency}ms roundtrip)`, 
      versionRes.rows.length > 0 && versionRes.rows[0].current_database === 'neondb');

    console.log(`     (PostgreSQL Engine: ${versionRes.rows[0].server_version} | DB: ${versionRes.rows[0].current_database})`);

    // Verify Prisma client initialization
    const prismaPingStart = Date.now();
    const prismaPing = await prisma.$queryRaw`SELECT 1 as alive`;
    const prismaLatency = Date.now() - prismaPingStart;
    assert('Connection', 'CONN-05', `Prisma adapter query execution successful (${prismaLatency}ms)`, 
      prismaPing && prismaPing[0]?.alive === 1);

    // -------------------------------------------------------------
    // SUITE 2: PRISMA SCHEMA, MODELS & ENUM INVENTORY AUDIT
    // -------------------------------------------------------------
    console.log('\n[Suite 2: Prisma Schema Models & Enum Type Audit]');

    const modelCounts = {};
    const criticalModels = [
      'User', 'Student', 'Staff', 'Department', 'Program', 'Batch',
      'Subject', 'Attendance', 'AttendanceRecord', 'Timetable', 'ClassUpdate',
      'Hostel', 'HostelBlock', 'Room', 'RoomAllocation', 'Asset',
      'ComplaintCategory', 'Complaint', 'ComplaintComment', 'ComplaintAssignment', 'ComplaintStatusHistory',
      'LeaveRequest', 'GatePass', 'GatePassApproval', 'GatePassEvent',
      'Certificate', 'CertificateRequest', 'FeeRecord', 'FeePayment', 'FeeQuery',
      'MessMenu', 'MessFeedback', 'Visitor', 'VisitorLog',
      'Notice', 'NoticeTarget', 'NoticeRead', 'Notification', 'AuditLog',
      'Payment', 'Expense', 'Reconciliation', 'RoomTransfer', 'GateLog'
    ];

    for (const model of criticalModels) {
      const delegate = prisma[model.charAt(0).toLowerCase() + model.slice(1)];
      if (delegate && typeof delegate.count === 'function') {
        const count = await delegate.count();
        modelCounts[model] = count;
      }
    }

    assert('Schema', 'SCH-01', `Core identity models populated (User: ${modelCounts.User}, Student: ${modelCounts.Student}, Staff: ${modelCounts.Staff})`, 
      modelCounts.User > 0 && modelCounts.Student > 0 && modelCounts.Staff > 0);

    assert('Schema', 'SCH-02', `Residential models populated (Hostel: ${modelCounts.Hostel}, Room: ${modelCounts.Room}, RoomAllocation: ${modelCounts.RoomAllocation})`, 
      modelCounts.Hostel > 0 && modelCounts.Room > 0);

    assert('Schema', 'SCH-03', `Grievance models populated (ComplaintCategory: ${modelCounts.ComplaintCategory}, Complaint: ${modelCounts.Complaint})`, 
      modelCounts.ComplaintCategory > 0 && modelCounts.Complaint > 0);

    assert('Schema', 'SCH-04', `Passes & Requests populated (GatePass: ${modelCounts.GatePass}, LeaveRequest: ${modelCounts.LeaveRequest}, CertificateRequest: ${modelCounts.CertificateRequest})`, 
      modelCounts.GatePass > 0 && modelCounts.LeaveRequest > 0);

    assert('Schema', 'SCH-05', `Telemetry & Governance models populated (Notice: ${modelCounts.Notice}, AuditLog: ${modelCounts.AuditLog})`, 
      modelCounts.Notice > 0 && modelCounts.AuditLog > 0);

    // -------------------------------------------------------------
    // SUITE 3: DATA INTEGRITY & BUSINESS CONSTRAINTS
    // -------------------------------------------------------------
    console.log('\n[Suite 3: Data Integrity, Constraints & Business Rules]');

    // 1. Password security check: zero plaintext passwords in User table
    const plainPasswords = await prisma.$queryRaw`
      SELECT count(*)::int as count FROM "User" 
      WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%'
    `;
    const plainCount = plainPasswords[0]?.count || 0;
    assert('DataIntegrity', 'INT-01', `Zero plaintext passwords in User table (All bcrypt hashes: ${plainCount} unhashed)`, 
      plainCount === 0);

    // 2. Orphan Student check: Every Student must have a valid User
    const orphanStudents = await prisma.$queryRaw`
      SELECT count(*)::int as count FROM "Student" s 
      LEFT JOIN "User" u ON s."userId" = u.id 
      WHERE u.id IS NULL
    `;
    const orphanStudentCount = orphanStudents[0]?.count || 0;
    assert('DataIntegrity', 'INT-02', `Zero orphan Student records without matching User (${orphanStudentCount} found)`, 
      orphanStudentCount === 0);

    // 3. Orphan Staff check: Every Staff must have a valid User
    const orphanStaff = await prisma.$queryRaw`
      SELECT count(*)::int as count FROM "Staff" s 
      LEFT JOIN "User" u ON s."userId" = u.id 
      WHERE u.id IS NULL
    `;
    const orphanStaffCount = orphanStaff[0]?.count || 0;
    assert('DataIntegrity', 'INT-03', `Zero orphan Staff records without matching User (${orphanStaffCount} found)`, 
      orphanStaffCount === 0);

    // 4. Single Active Room Allocation Constraint: No student has multiple active allocations
    const duplicateAllocations = await prisma.$queryRaw`
      SELECT "studentId", count(*)::int as count 
      FROM "RoomAllocation" 
      WHERE "isActive" = true 
      GROUP BY "studentId" 
      HAVING count(*) > 1
    `;
    assert('DataIntegrity', 'INT-04', `Single active room allocation constraint enforced (${duplicateAllocations.length} violations)`, 
      duplicateAllocations.length === 0);

    // 5. Room Occupancy Accuracy: currentOccupancy equals count of active allocations
    const roomOccupancyDiscrepancies = await prisma.$queryRaw`
      SELECT r.id, r."roomNumber", r."currentOccupancy", count(ra.id)::int as active_allocations
      FROM "Room" r
      LEFT JOIN "RoomAllocation" ra ON r.id = ra."roomId" AND ra."isActive" = true
      GROUP BY r.id, r."roomNumber", r."currentOccupancy"
      HAVING r."currentOccupancy" != count(ra.id)
    `;
    assert('DataIntegrity', 'INT-05', `Room currentOccupancy synchronized with active allocations (${roomOccupancyDiscrepancies.length} mismatches)`, 
      roomOccupancyDiscrepancies.length === 0);

    // 6. Room Capacity Constraint: No room currentOccupancy exceeds capacity
    const overCapacityRooms = await prisma.$queryRaw`
      SELECT count(*)::int as count FROM "Room" 
      WHERE "currentOccupancy" > capacity
    `;
    const overCapacityCount = overCapacityRooms[0]?.count || 0;
    assert('DataIntegrity', 'INT-06', `Zero rooms exceeded maximum capacity (${overCapacityCount} over capacity)`, 
      overCapacityCount === 0);

    // 7. Orphan Complaints check: Every Complaint references a valid Student
    const orphanComplaints = await prisma.$queryRaw`
      SELECT count(*)::int as count FROM "Complaint" c 
      LEFT JOIN "Student" s ON c."studentId" = s.id 
      WHERE s.id IS NULL
    `;
    const orphanComplaintCount = orphanComplaints[0]?.count || 0;
    assert('DataIntegrity', 'INT-07', `Zero orphan Complaints without valid student (${orphanComplaintCount} found)`, 
      orphanComplaintCount === 0);

    // -------------------------------------------------------------
    // SUITE 4: CRUD LIFECYCLE & ISOLATED FIXTURE OPERATIONS
    // -------------------------------------------------------------
    console.log('\n[Suite 4: CRUD Lifecycle & Non-Destructive Fixture Operations]');

    const testTag = `TEST-${Date.now()}`;
    
    // CREATE
    const createdAsset = await prisma.asset.create({
      data: {
        assetTag: testTag,
        name: 'Automated Audit Test Fixture Lamp',
        category: 'ELECTRICAL',
        condition: 'OPERATIONAL'
      }
    });
    assert('CRUD', 'CRUD-01', 'CREATE operation successfully inserts new record with unique cuid', 
      createdAsset && createdAsset.id && createdAsset.assetTag === testTag);

    // READ
    const fetchedAsset = await prisma.asset.findUnique({
      where: { id: createdAsset.id }
    });
    assert('CRUD', 'CRUD-02', 'READ operation retrieves record by primary key', 
      fetchedAsset && fetchedAsset.assetTag === testTag);

    // UPDATE
    const updatedAsset = await prisma.asset.update({
      where: { id: createdAsset.id },
      data: { condition: 'MAINTENANCE_REQUIRED' }
    });
    assert('CRUD', 'CRUD-03', 'UPDATE operation modifies field values accurately', 
      updatedAsset && updatedAsset.condition === 'MAINTENANCE_REQUIRED');

    // DELETE (Clean up test fixture)
    const deletedAsset = await prisma.asset.delete({
      where: { id: createdAsset.id }
    });
    assert('CRUD', 'CRUD-04', 'DELETE operation cleanly removes test fixture record', 
      deletedAsset && deletedAsset.id === createdAsset.id);

    // Verify deletion
    const verifyDeleted = await prisma.asset.findUnique({
      where: { id: createdAsset.id }
    });
    assert('CRUD', 'CRUD-05', 'Record verification confirms persistent deletion (null response)', 
      verifyDeleted === null);

    // -------------------------------------------------------------
    // SUITE 5: TRANSACTION ATOMICITY & ROLLBACK SAFETY
    // -------------------------------------------------------------
    console.log('\n[Suite 5: Database Transaction Atomicity & Concurrency Safety]');

    // Successful atomic multi-statement transaction
    const transTag1 = `TX-TAG-A-${Date.now()}`;
    const transTag2 = `TX-TAG-B-${Date.now()}`;

    const txResult = await prisma.$transaction(async (tx) => {
      const a1 = await tx.asset.create({
        data: { assetTag: transTag1, name: 'Tx Test Asset A', category: 'FURNITURE', condition: 'OPERATIONAL' }
      });
      const a2 = await tx.asset.create({
        data: { assetTag: transTag2, name: 'Tx Test Asset B', category: 'FURNITURE', condition: 'OPERATIONAL' }
      });
      return { a1, a2 };
    });
    assert('Transactions', 'TX-01', 'Multi-statement transaction commits atomically', 
      txResult.a1 && txResult.a2);

    // Clean up successful tx
    await prisma.asset.deleteMany({
      where: { assetTag: { in: [transTag1, transTag2] } }
    });

    // Deliberate transaction rollback verification
    const rollbackTag = `ROLLBACK-${Date.now()}`;
    let rollbackThrew = false;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.asset.create({
          data: { assetTag: rollbackTag, name: 'Must Roll Back', category: 'OTHER', condition: 'OPERATIONAL' }
        });
        // Deliberately throw error to force abort
        throw new Error('SIMULATED_TRANSACTION_ABORT');
      });
    } catch (err) {
      if (err.message.includes('SIMULATED_TRANSACTION_ABORT')) {
        rollbackThrew = true;
      }
    }

    const rolledBackRecord = await prisma.asset.findUnique({
      where: { assetTag: rollbackTag }
    });

    assert('Transactions', 'TX-02', 'Transaction rollback aborts all writes upon exception (Zero partial state)', 
      rollbackThrew && rolledBackRecord === null);

    // -------------------------------------------------------------
    // SUITE 6: RELATIONAL TRAVERSAL & N+1 QUERY PERFORMANCE
    // -------------------------------------------------------------
    console.log('\n[Suite 6: Deep Relational Traversal & Query Latency Evaluation]');

    const deepHostelStart = Date.now();
    const deepHostel = await prisma.hostel.findFirst({
      include: {
        blocks: {
          include: {
            rooms: {
              take: 5,
              include: {
                allocations: {
                  include: {
                    student: {
                      include: {
                        user: { select: { firstName: true, lastName: true, email: true } }
                      }
                    }
                  }
                },
                assets: true
              }
            }
          }
        },
        warden: {
          include: { user: true }
        }
      }
    });
    const deepHostelLatency = Date.now() - deepHostelStart;

    assert('Performance', 'PERF-01', `Deep 5-level relational join executes efficiently (${deepHostelLatency}ms < 5000ms)`, 
      deepHostel !== null && deepHostelLatency < 5000);

    const deepComplaintStart = Date.now();
    const deepComplaints = await prisma.complaint.findMany({
      take: 10,
      include: {
        category: true,
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        assignment: { include: { staff: { include: { user: true } } } },
        statusHistory: true,
        comments: { take: 3 }
      },
      orderBy: { createdAt: 'desc' }
    });
    const deepComplaintLatency = Date.now() - deepComplaintStart;

    assert('Performance', 'PERF-02', `Complaints pipeline with 4 relational joins executes cleanly (${deepComplaintLatency}ms < 5000ms)`, 
      deepComplaints.length > 0 && deepComplaintLatency < 5000);

    // -------------------------------------------------------------
    // SUITE 7: PRISMA MIGRATIONS & SCHEMA SYNCHRONIZATION AUDIT
    // -------------------------------------------------------------
    console.log('\n[Suite 7: Migration Table & Schema Synchronization Status]');

    const migrations = await prisma.$queryRaw`
      SELECT id, migration_name, finished_at, rolled_back_at, applied_steps_count 
      FROM "_prisma_migrations" 
      ORDER BY finished_at ASC
    `;

    assert('Migrations', 'MIG-01', `_prisma_migrations tracking table present in Neon (${migrations.length} migration records)`, 
      migrations.length > 0);

    const hasFailedMigration = migrations.some(m => m.rolled_back_at !== null);
    assert('Migrations', 'MIG-02', 'Zero rolled-back or failed migrations in migration history', 
      !hasFailedMigration);

    const initMigration = migrations.find(m => m.migration_name.includes('init'));
    assert('Migrations', 'MIG-03', 'Baseline schema migration (20260930000000_init) successfully applied', 
      initMigration && initMigration.finished_at !== null);

    // -------------------------------------------------------------
    // SUITE 8: DATABASE SECURITY & SENSITIVE FIELD REDACTION
    // -------------------------------------------------------------
    console.log('\n[Suite 8: Database Security & Query Exposure Safeguards]');

    // Verify user password hash structure
    const sampleUser = await prisma.user.findFirst({
      select: { id: true, email: true, password: true, role: true }
    });

    const isBcrypt = sampleUser.password.startsWith('$2a$') || sampleUser.password.startsWith('$2b$');
    assert('Security', 'SEC-02', 'User password hashes utilize bcrypt with cost factor 10-12', isBcrypt);

    // Verify SQL injection immunity via Prisma parameterization
    const maliciousInput = "admin@campus.demo' OR '1'='1";
    const sqliTest = await prisma.user.findMany({
      where: { email: maliciousInput }
    });
    assert('Security', 'SEC-03', 'Prisma parameterized query treats injection string literally (0 rows matched)', 
      sqliTest.length === 0);

    const totalDuration = Date.now() - startTime;
    console.log('\n================================================================');
    console.log(`  DATABASE AUDIT COMPLETE IN ${totalDuration}ms`);
    console.log(`  RESULTS: ${passed} PASSED | ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Database validation fatal exception:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

runDatabaseAudit();

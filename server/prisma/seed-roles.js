import bcrypt from 'bcryptjs';
import prisma from '../src/config/database.js';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../src/constants/permissions.js';

if (!prisma) {
  console.error('[SeedRoles] ERROR: Prisma client could not be initialized.');
  process.exit(1);
}

async function main() {
  console.log('================================================================');
  console.log('  CAMPUSOS ADVANCED ROLE-BASED SYSTEM SEED ENGINE (HIGH SPEED)');
  console.log('  Database: Neon PostgreSQL');
  console.log('================================================================');

  const defaultHash = await bcrypt.hash('Password@123', 10);

  // ==========================================================================
  // 1. SEED PERMISSIONS AND ROLE-PERMISSION MATRIX (BATCH OPTIMIZED)
  // ==========================================================================
  console.log('\n[1/7] Seeding Granular Permissions Registry into database...');
  const permissionEntries = Object.entries(PERMISSIONS);
  const permissionData = permissionEntries.map(([key, code]) => {
    const parts = code.split('_');
    const resource = parts[0];
    const action = parts.slice(1).join('_');
    return {
      code,
      name: code.replace(/_/g, ' '),
      description: `Allows ${action.toLowerCase()} operations on ${resource.toLowerCase()} domain`,
      resource,
      action,
      scope: code.includes('OWN') ? 'OWN' : (code.includes('ASSIGNED') ? 'ASSIGNED' : 'ALL'),
      isSensitive: ['PAYMENT_VERIFY', 'USER_ROLE_ASSIGN', 'AUDIT_READ', 'RECONCILIATION_CREATE'].includes(code)
    };
  });

  await prisma.permission.createMany({
    data: permissionData,
    skipDuplicates: true
  });

  const allPerms = await prisma.permission.findMany({ select: { id: true, code: true } });
  const permMap = Object.fromEntries(allPerms.map(p => [p.code, p.id]));
  console.log(`  ✓ ${allPerms.length} granular permissions present in Permission table`);

  console.log('\n[2/7] Seeding Authoritative RolePermission Matrix (Batch)...');
  const rolePermEntries = [];
  for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
    for (const permCode of perms) {
      if (permMap[permCode]) {
        rolePermEntries.push({ role, permissionId: permMap[permCode] });
      }
    }
  }

  const rolePermResult = await prisma.rolePermission.createMany({
    data: rolePermEntries,
    skipDuplicates: true
  });
  console.log(`  ✓ ${rolePermResult.count} Role-Permission links synchronized in bulk across 8 roles`);

  // ==========================================================================
  // 2. SEED CORE REQUESTED ROLES (IDEMPOTENT)
  // ==========================================================================
  console.log('\n[3/7] Seeding Required Core Accounts (1 SUPER_ADMIN, 2 ADMIN, 2 ACCOUNTANT, 2 ACCOUNTS, 4 SECURITY, 4 WARDEN, 5 FACULTY, 30 STUDENTS)...');

  // SUPER_ADMIN (1)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@campus.demo' },
    update: { password: defaultHash, role: 'SUPER_ADMIN', isActive: true },
    create: {
      email: 'superadmin@campus.demo',
      password: defaultHash,
      role: 'SUPER_ADMIN',
      firstName: 'Dr. Anand',
      lastName: 'Choudhury',
      phoneNumber: '+91 98000 00001',
      isActive: true
    }
  });

  // ADMIN (2)
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@campus.demo' },
    update: { password: defaultHash, role: 'ADMIN', isActive: true },
    create: {
      email: 'admin@campus.demo',
      password: defaultHash,
      role: 'ADMIN',
      firstName: 'Rajesh',
      lastName: 'Verma',
      phoneNumber: '+91 98000 11111',
      isActive: true
    }
  });

  const admin2 = await prisma.user.upsert({
    where: { email: 'sahoodebatosh782@gmail' },
    update: { role: 'ADMIN', isActive: true },
    create: {
      email: 'sahoodebatosh782@gmail',
      password: await bcrypt.hash('Deba@2004', 10),
      role: 'ADMIN',
      firstName: 'Debatosh',
      lastName: 'Sahoo',
      phoneNumber: '+91 94370 00782',
      isActive: true
    }
  });

  // ACCOUNTANT (2)
  const accountant1 = await prisma.user.upsert({
    where: { email: 'accountant@campus.demo' },
    update: { password: defaultHash, role: 'ACCOUNTANT', isActive: true },
    create: {
      email: 'accountant@campus.demo',
      password: defaultHash,
      role: 'ACCOUNTANT',
      firstName: 'Pradeep',
      lastName: 'Mohapatra',
      phoneNumber: '+91 98000 77771',
      isActive: true
    }
  });

  const accountant2 = await prisma.user.upsert({
    where: { email: 'accountant2@campus.demo' },
    update: { password: defaultHash, role: 'ACCOUNTANT', isActive: true },
    create: {
      email: 'accountant2@campus.demo',
      password: defaultHash,
      role: 'ACCOUNTANT',
      firstName: 'Sujata',
      lastName: 'Rath',
      phoneNumber: '+91 98000 77772',
      isActive: true
    }
  });

  // ACCOUNTS (2)
  const accounts1 = await prisma.user.upsert({
    where: { email: 'accounts@campus.demo' },
    update: { password: defaultHash, role: 'ACCOUNTS', isActive: true },
    create: {
      email: 'accounts@campus.demo',
      password: defaultHash,
      role: 'ACCOUNTS',
      firstName: 'Meena',
      lastName: 'Iyer',
      phoneNumber: '+91 98000 66661',
      isActive: true
    }
  });

  const accounts2 = await prisma.user.upsert({
    where: { email: 'accounts2@campus.demo' },
    update: { password: defaultHash, role: 'ACCOUNTS', isActive: true },
    create: {
      email: 'accounts2@campus.demo',
      password: defaultHash,
      role: 'ACCOUNTS',
      firstName: 'Santosh',
      lastName: 'Barik',
      phoneNumber: '+91 98000 66662',
      isActive: true
    }
  });

  // SECURITY (4)
  const securityUsers = [];
  const secNames = [
    { first: 'Devendra', last: 'Singh', email: 'security@campus.demo' },
    { first: 'Manoj', last: 'Nayak', email: 'security2@campus.demo' },
    { first: 'Rabi', last: 'Mallik', email: 'security3@campus.demo' },
    { first: 'Bikram', last: 'Behera', email: 'security4@campus.demo' }
  ];
  for (let i = 0; i < secNames.length; i++) {
    const s = secNames[i];
    const u = await prisma.user.upsert({
      where: { email: s.email },
      update: { password: defaultHash, role: 'SECURITY', isActive: true },
      create: {
        email: s.email,
        password: defaultHash,
        role: 'SECURITY',
        firstName: s.first,
        lastName: s.last,
        phoneNumber: `+91 98000 5555${i + 1}`,
        isActive: true
      }
    });
    securityUsers.push(u);
    await prisma.staff.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, employeeCode: `SEC-00${i + 1}`, designation: 'Security Officer' }
    }).catch(() => {});
  }

  // WARDEN (4)
  const wardenUsers = [];
  const warNames = [
    { first: 'Suresh', last: 'Patel', email: 'warden@campus.demo' },
    { first: 'Smita', last: 'Mohanty', email: 'warden2@campus.demo' },
    { first: 'Prakash', last: 'Rout', email: 'warden3@campus.demo' },
    { first: 'Sunita', last: 'Swain', email: 'warden4@campus.demo' }
  ];
  for (let i = 0; i < warNames.length; i++) {
    const w = warNames[i];
    const u = await prisma.user.upsert({
      where: { email: w.email },
      update: { password: defaultHash, role: 'WARDEN', isActive: true },
      create: {
        email: w.email,
        password: defaultHash,
        role: 'WARDEN',
        firstName: w.first,
        lastName: w.last,
        phoneNumber: `+91 98000 2222${i + 1}`,
        isActive: true
      }
    });
    wardenUsers.push(u);
    await prisma.staff.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, employeeCode: `WAR-00${i + 1}`, designation: 'Hostel Warden' }
    }).catch(() => {});
  }

  // FACULTY (5)
  const facultyUsers = [];
  const facNames = [
    { first: 'Dr. Priya', last: 'Nair', email: 'faculty@campus.demo', dept: 'CSE' },
    { first: 'Dr. Biswajit', last: 'Mohanty', email: 'faculty2@campus.demo', dept: 'CSE' },
    { first: 'Dr. Debasis', last: 'Panda', email: 'faculty3@campus.demo', dept: 'ECE' },
    { first: 'Dr. Tapan', last: 'Pradhan', email: 'faculty4@campus.demo', dept: 'EEE' },
    { first: 'Dr. Manoj', last: 'Behera', email: 'faculty5@campus.demo', dept: 'ME' }
  ];
  for (let i = 0; i < facNames.length; i++) {
    const f = facNames[i];
    const u = await prisma.user.upsert({
      where: { email: f.email },
      update: { password: defaultHash, role: 'FACULTY', isActive: true },
      create: {
        email: f.email,
        password: defaultHash,
        role: 'FACULTY',
        firstName: f.first,
        lastName: f.last,
        phoneNumber: `+91 98000 3333${i + 1}`,
        isActive: true
      }
    });
    facultyUsers.push(u);
    await prisma.staff.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, employeeCode: `FAC-00${i + 1}`, designation: 'Associate Professor' }
    }).catch(() => {});
  }

  // STUDENTS (30)
  const batch = await prisma.batch.findFirst();
  const studentList = [];

  // Primary demo student
  const primaryStudentUser = await prisma.user.upsert({
    where: { email: 'student@campus.demo' },
    update: { password: defaultHash, role: 'STUDENT', isActive: true },
    create: {
      email: 'student@campus.demo',
      password: defaultHash,
      role: 'STUDENT',
      firstName: 'Aarav',
      lastName: 'Sharma',
      phoneNumber: '+91 98765 43210',
      isActive: true
    }
  });

  const primaryStudent = await prisma.student.upsert({
    where: { userId: primaryStudentUser.id },
    update: { rollNumber: 'CS2026001', registrationNumber: 'REG-2026-001' },
    create: {
      userId: primaryStudentUser.id,
      rollNumber: 'CS2026001',
      registrationNumber: 'REG-2026-001',
      batchId: batch?.id || 'batch_default',
      emergencyContact: '+91 98765 00001',
      guardianName: 'Ramesh Sharma',
      guardianPhone: '+91 98765 00001'
    }
  });
  studentList.push(primaryStudent);

  // 29 additional students
  const firstNames = ['Rohan', 'Aditya', 'Sneha', 'Ananya', 'Pooja', 'Rahul', 'Vivek', 'Kunal', 'Ishaan', 'Tanvi', 'Anjali', 'Deepak', 'Manish', 'Neha', 'Priti', 'Sanjay', 'Vikram', 'Alok', 'Amit', 'Divya', 'Kiran', 'Megha', 'Nitin', 'Ritu', 'Shreya', 'Saurabh', 'Tarun', 'Varun', 'Yash'];
  const lastNames = ['Dash', 'Mohapatra', 'Nayak', 'Panda', 'Rath', 'Samal', 'Tripathy', 'Behera', 'Pradhan', 'Mishra', 'Patra', 'Sethi', 'Bhoi', 'Swain', 'Jena', 'Barik', 'Mallik', 'Sahoo', 'Rout', 'Mohanty', 'Parida', 'Lenka', 'Biswal', 'Maharana', 'Acharya', 'Satapathy', 'Choudhury', 'Khandual', 'Palei'];

  for (let i = 0; i < 29; i++) {
    const roll = `CS20260${(i + 2).toString().padStart(2, '0')}`;
    const email = `student${i + 2}@campus.demo`;
    const u = await prisma.user.upsert({
      where: { email },
      update: { password: defaultHash, role: 'STUDENT', isActive: true },
      create: {
        email,
        password: defaultHash,
        role: 'STUDENT',
        firstName: firstNames[i],
        lastName: lastNames[i],
        phoneNumber: `+91 98765 ${43200 + i}`,
        isActive: true
      }
    });

    const s = await prisma.student.upsert({
      where: { userId: u.id },
      update: { rollNumber: roll, registrationNumber: `REG-${roll}` },
      create: {
        userId: u.id,
        rollNumber: roll,
        registrationNumber: `REG-${roll}`,
        batchId: batch?.id || 'batch_default',
        emergencyContact: '+91 98765 99999',
        guardianName: `Guardian of ${firstNames[i]}`,
        guardianPhone: '+91 98765 99999'
      }
    });
    studentList.push(s);
  }
  console.log(`  ✓ 1 SUPER_ADMIN, 2 ADMIN, 2 ACCOUNTANT, 2 ACCOUNTS, 4 SECURITY, 4 WARDEN, 5 FACULTY, and 30 STUDENTS ready`);

  // ==========================================================================
  // 3. SEED HOSTEL, ROOMS & ALLOCATIONS
  // ==========================================================================
  console.log('\n[4/7] Seeding Hostels, Rooms, and Room Allocations...');
  let hostel = await prisma.hostel.findFirst({ where: { name: 'Kharavela Boys Hostel' } });
  if (!hostel) {
    hostel = await prisma.hostel.create({
      data: {
        name: 'Kharavela Boys Hostel',
        gender: 'BOYS'
      }
    });
  }

  let block = await prisma.hostelBlock.findFirst({ where: { hostelId: hostel.id, name: 'Block A' } });
  if (!block) {
    block = await prisma.hostelBlock.create({
      data: {
        name: 'Block A',
        hostelId: hostel.id,
        floorsCount: 4
      }
    });
  }

  const roomList = [];
  for (let r = 101; r <= 110; r++) {
    let room = await prisma.room.findFirst({
      where: { blockId: block.id, roomNumber: `A-${r}` }
    });
    if (!room) {
      room = await prisma.room.create({
        data: {
          roomNumber: `A-${r}`,
          floorNumber: 1,
          capacity: 3,
          currentOccupancy: 0,
          blockId: block.id
        }
      });
    }
    roomList.push(room);
  }

  // Allocate first 15 students to rooms
  for (let i = 0; i < 15; i++) {
    const targetRoom = roomList[Math.floor(i / 3)];
    const student = studentList[i];

    const existingAlloc = await prisma.roomAllocation.findUnique({
      where: { studentId: student.id }
    });

    if (!existingAlloc && targetRoom) {
      await prisma.roomAllocation.create({
        data: {
          studentId: student.id,
          roomId: targetRoom.id,
          startDate: new Date(),
          isActive: true
        }
      });
      await prisma.room.update({
        where: { id: targetRoom.id },
        data: { currentOccupancy: { increment: 1 } }
      });
    }
  }

  // Seed sample room transfer request
  if (studentList[1] && roomList[4] && roomList[5]) {
    await prisma.roomTransfer.upsert({
      where: { id: 'sample-transfer-01' },
      update: {},
      create: {
        id: 'sample-transfer-01',
        studentId: studentList[1].id,
        fromRoomId: roomList[4].id,
        toRoomId: roomList[5].id,
        reason: 'Requested quiet study environment',
        status: 'PENDING'
      }
    }).catch(() => {});
  }
  console.log(`  ✓ Hostels, 10 Rooms, and Active Room Allocations prepared`);

  // ==========================================================================
  // 4. SEED FEES & PAYMENTS
  // ==========================================================================
  console.log('\n[5/7] Seeding Fee Records and Payments...');
  for (let i = 0; i < studentList.length; i++) {
    const student = studentList[i];
    const totalAmount = 65000;
    const dueAmount = i % 3 === 0 ? 0 : (i % 3 === 1 ? 25000 : totalAmount);
    const status = dueAmount === 0 ? 'PAID' : (dueAmount < totalAmount ? 'PARTIALLY_PAID' : 'UNPAID');

    const feeRecord = await prisma.feeRecord.upsert({
      where: {
        studentId_academicYear_semester: {
          studentId: student.id,
          academicYear: '2026-2027',
          semester: 5
        }
      },
      update: {},
      create: {
        studentId: student.id,
        academicYear: '2026-2027',
        semester: 5,
        tuitionAmount: 45000,
        hostelAmount: 15000,
        messAmount: 5000,
        otherAmount: 0,
        totalAmount,
        dueAmount,
        status,
        dueDate: new Date('2026-11-30')
      }
    });

    // Seed payments for first 10 students
    if (i < 10) {
      const pStatus = i % 2 === 0 ? 'SUCCESS' : 'PENDING';
      const ref = `TXN-DEMO-${student.rollNumber}-001`;
      await prisma.payment.upsert({
        where: { transactionRef: ref },
        update: {},
        create: {
          receiptNumber: `RCP-2026-${1000 + i}`,
          transactionRef: ref,
          studentId: student.id,
          feeRecordId: feeRecord.id,
          amount: 40000,
          feeCategory: 'TUITION_FEE',
          paymentMode: 'ONLINE_UPI',
          status: pStatus,
          verifiedById: pStatus === 'SUCCESS' ? accountant1.id : null,
          verifiedAt: pStatus === 'SUCCESS' ? new Date() : null,
          remarks: 'Semester 5 Tuition Installment'
        }
      });
    }
  }
  console.log(`  ✓ 30 Fee records and 10 Sample Payment transactions created`);

  // ==========================================================================
  // 5. SEED EXPENSES & RECONCILIATIONS
  // ==========================================================================
  console.log('\n[6/7] Seeding Accounts Expenses and Reconciliation records...');
  const expenseDefs = [
    { title: 'Campus Fiber Internet Bandwidth (Oct 2026)', amount: 24500, category: 'MAINTENANCE', vendor: 'BSNL Telecom Ltd', inv: 'INV-OCT-01' },
    { title: 'Hostel Dining Provisions - Weekly Bulk Supply', amount: 48000, category: 'MESS', vendor: 'Odisha Agro Traders', inv: 'INV-OCT-02' },
    { title: 'Substation Electrical Maintenance & Spares', amount: 18200, category: 'ELECTRICITY', vendor: 'Tata Power Central Supply', inv: 'INV-OCT-03' },
    { title: 'Campus Physical Security Staff Payroll Support', amount: 85000, category: 'SALARY', vendor: 'G4S Facility Services', inv: 'INV-OCT-04' },
    { title: 'Purified Water Filtration Membrane Replacement', amount: 9500, category: 'WATER', vendor: 'Aquaguard Commercials', inv: 'INV-OCT-05' }
  ];

  for (const exp of expenseDefs) {
    const existing = await prisma.expense.findFirst({ where: { invoiceNumber: exp.inv } });
    if (!existing) {
      await prisma.expense.create({
        data: {
          title: exp.title,
          amount: exp.amount,
          category: exp.category,
          vendorName: exp.vendor,
          invoiceNumber: exp.inv,
          status: 'APPROVED',
          createdById: accounts1.id,
          approvedById: superAdmin.id,
          expenseDate: new Date()
        }
      });
    }
  }

  // Reconciliation
  await prisma.reconciliation.upsert({
    where: { id: 'recon-q3-2026' },
    update: {},
    create: {
      id: 'recon-q3-2026',
      periodStart: new Date('2026-07-01'),
      periodEnd: new Date('2026-09-30'),
      totalIncome: 1250000,
      totalExpenses: 645000,
      systemBalance: 605000,
      actualBalance: 605000,
      discrepancy: 0,
      status: 'RECONCILED',
      notes: 'Quarterly financial reconciliation fully matched against bank ledger',
      performedById: accounts1.id
    }
  });

  // ==========================================================================
  // 6. SEED SECURITY (GATE LOGS, VISITORS, EMERGENCIES)
  // ==========================================================================
  console.log('\n[7/7] Seeding Security Gate Logs, Visitors, Emergencies & Audit Logs...');

  // Visitor
  let visitor = await prisma.visitor.findFirst({ where: { phoneNumber: '+91 94371 88888' } });
  if (!visitor) {
    visitor = await prisma.visitor.create({
      data: {
        fullName: 'Bishnu Charan Das',
        phoneNumber: '+91 94371 88888',
        idProofType: 'AADHAAR',
        idProofNumber: 'XXXX-XXXX-4589'
      }
    });
  }

  // Gate Log (Append-only)
  const existingLog = await prisma.gateLog.findFirst({ where: { personName: 'Bishnu Charan Das' } });
  if (!existingLog) {
    await prisma.gateLog.create({
      data: {
        personName: 'Bishnu Charan Das',
        personType: 'VISITOR',
        visitorId: visitor.id,
        vehicleNumber: 'OD-02-BA-1234',
        purpose: 'Parent Guardian Campus Visit',
        status: 'INSIDE',
        securityStaffId: securityUsers[0].id,
        entryTime: new Date()
      }
    });
  }

  // Emergency Incident
  await prisma.emergencyIncident.upsert({
    where: { incidentNumber: 'EMG-2026-001' },
    update: {},
    create: {
      incidentNumber: 'EMG-2026-001',
      type: 'MEDICAL',
      severity: 'HIGH',
      location: 'Block A - 2nd Floor Corridor',
      description: 'Student experiencing sudden dehydration. Immediate campus medical escort provided.',
      reportedById: securityUsers[0].id,
      status: 'RESOLVED',
      resolvedById: wardenUsers[0].id,
      resolutionNotes: 'First aid and hydration administered by campus physician. Student rested and stable.',
      resolvedAt: new Date()
    }
  });

  // Leave Request
  const existingLeave = await prisma.leaveRequest.findFirst({ where: { studentId: studentList[0].id } });
  if (!existingLeave) {
    await prisma.leaveRequest.create({
      data: {
        studentId: studentList[0].id,
        startDate: new Date('2026-10-10'),
        endDate: new Date('2026-10-14'),
        reason: 'Attending family wedding ceremony',
        destination: 'Cuttack, Odisha',
        emergencyContact: '+91 98765 00001',
        status: 'APPROVED'
      }
    });
  }

  // Category for complaint
  let compCat = await prisma.complaintCategory.findFirst();
  if (!compCat) {
    compCat = await prisma.complaintCategory.create({
      data: { name: 'Plumbing', code: 'PLUMBING' }
    });
  }

  // Complaints
  const existingComplaint = await prisma.complaint.findFirst({ where: { studentId: studentList[0].id } });
  if (!existingComplaint && compCat) {
    await prisma.complaint.create({
      data: {
        ticketNumber: 'CMP-2026-010',
        studentId: studentList[0].id,
        categoryId: compCat.id,
        title: 'Water pressure low in bathroom 102',
        description: 'The overhead water tank valve appears partially clogged causing low shower pressure.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS'
      }
    });
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: primaryStudentUser.id,
        title: 'Fee Payment Verified',
        message: 'Your payment of ₹40,000 for Tuition Fee has been verified by the Accounts department.',
        type: 'FEE',
        linkUrl: '/student/fees'
      },
      {
        userId: primaryStudentUser.id,
        title: 'Hostel Leave Approved',
        message: 'Your leave request for Cuttack has been approved by Chief Warden Suresh Patel.',
        type: 'LEAVE',
        linkUrl: '/student/leave'
      }
    ]
  }).catch(() => {});

  // Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: superAdmin.id,
        actorRole: 'SUPER_ADMIN',
        action: 'SYSTEM_INITIALIZATION',
        entity: 'System',
        entityId: 'ROOT',
        newData: JSON.stringify({ version: 'CampusOS 2.0', mode: 'RBAC_ENFORCED' }),
        ipAddress: '127.0.0.1'
      },
      {
        userId: accountant1.id,
        actorRole: 'ACCOUNTANT',
        action: 'PAYMENT_VERIFIED',
        entity: 'Payment',
        entityId: 'TXN-DEMO-CS2026001-001',
        newData: JSON.stringify({ amount: 40000, status: 'SUCCESS' }),
        ipAddress: '127.0.0.1'
      },
      {
        userId: accounts1.id,
        actorRole: 'ACCOUNTS',
        action: 'RECONCILIATION_COMPLETED',
        entity: 'Reconciliation',
        entityId: 'recon-q3-2026',
        newData: JSON.stringify({ status: 'RECONCILED' }),
        ipAddress: '127.0.0.1'
      }
    ]
  }).catch(() => {});

  console.log('================================================================');
  console.log('  ROLE-BASED SEED COMPLETED SUCCESSFULLY (100%)');
  console.log('  All 8 Roles & Realistic Domain Data are Ready in Neon DB');
  console.log('================================================================');
}

main()
  .catch(e => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    if (prisma) await prisma.$disconnect();
  });

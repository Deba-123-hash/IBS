import prisma from '../src/config/database.js';

async function seedDomain() {
  console.log('[SeedDomain] Starting sequential seeding to Neon DB...');

  const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  const accountant = await prisma.user.findFirst({ where: { role: 'ACCOUNTANT' } });
  const accounts = await prisma.user.findFirst({ where: { role: 'ACCOUNTS' } });
  const security = await prisma.user.findFirst({ where: { role: 'SECURITY' } });
  const warden = await prisma.user.findFirst({ where: { role: 'WARDEN' } });
  const students = await prisma.student.findMany({ take: 10, include: { feeRecords: true } });
  const rooms = await prisma.room.findMany({ take: 10 });

  console.log(`Found: SuperAdmin=${superAdmin?.id}, Accountant=${accountant?.id}, Accounts=${accounts?.id}`);
  console.log(`Students=${students.length}, Rooms=${rooms.length}`);

  // 1. Seed Payments
  console.log('Seeding Payments...');
  for (let i = 0; i < Math.min(5, students.length); i++) {
    const student = students[i];
    const feeRecord = student.feeRecords[0];
    const pStatus = i % 2 === 0 ? 'SUCCESS' : 'PENDING';
    const txRef = `TXN-DEMO-${Date.now()}-${i + 1}`;

    await prisma.payment.create({
      data: {
        receiptNumber: `RCP-2026-${1000 + i}`,
        transactionRef: txRef,
        studentId: student.id,
        feeRecordId: feeRecord?.id || null,
        amount: 35000,
        feeCategory: 'TUITION_FEE',
        paymentMode: 'ONLINE_UPI',
        status: pStatus,
        verifiedById: pStatus === 'SUCCESS' ? accountant.id : null,
        verifiedAt: pStatus === 'SUCCESS' ? new Date() : null,
        remarks: 'Semester Fee Installment'
      }
    });
  }

  // 2. Seed Expenses
  console.log('Seeding Expenses...');
  const expenseDefs = [
    { title: 'Campus High-Speed Leased Line Internet Bandwidth', amount: 24500, category: 'MAINTENANCE', vendor: 'BSNL Telecom Ltd', inv: `INV-OCT-${Date.now()}-1` },
    { title: 'Hostel Dining Hall Provisions & Grains Bulk Order', amount: 48000, category: 'MESS', vendor: 'Odisha Agro Traders', inv: `INV-OCT-${Date.now()}-2` },
    { title: 'Substation Transformer Electrical Spares & Maintenance', amount: 18200, category: 'ELECTRICITY', vendor: 'Tata Power Central Supply', inv: `INV-OCT-${Date.now()}-3` },
    { title: 'Campus Physical Guard Force Monthly Payroll Support', amount: 85000, category: 'SALARY', vendor: 'G4S Facility Services', inv: `INV-OCT-${Date.now()}-4` },
    { title: 'Water Purification Membrane & Filter Replacement', amount: 9500, category: 'WATER', vendor: 'Aquaguard Commercials', inv: `INV-OCT-${Date.now()}-5` }
  ];

  for (const exp of expenseDefs) {
    await prisma.expense.create({
      data: {
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        vendorName: exp.vendor,
        invoiceNumber: exp.inv,
        status: 'APPROVED',
        createdById: accounts.id,
        approvedById: superAdmin.id,
        expenseDate: new Date()
      }
    });
  }

  // 3. Seed Reconciliation
  console.log('Seeding Reconciliation...');
  await prisma.reconciliation.create({
    data: {
      periodStart: new Date('2026-07-01'),
      periodEnd: new Date('2026-09-30'),
      totalIncome: 1250000,
      totalExpenses: 645000,
      systemBalance: 605000,
      actualBalance: 605000,
      discrepancy: 0,
      status: 'RECONCILED',
      notes: 'Quarterly financial reconciliation fully matched against bank ledger',
      performedById: accounts.id
    }
  });

  // 4. Seed Security: Visitor, GateLogs, Emergency
  console.log('Seeding Security records...');
  const visitor = await prisma.visitor.create({
    data: {
      fullName: 'Bishnu Charan Das',
      phoneNumber: `+91 94371 ${Math.floor(10000 + Math.random() * 90000)}`,
      idProofType: 'AADHAAR',
      idProofNumber: `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`
    }
  });

  const staffProfile = await prisma.staff.findFirst({ where: { userId: security.id } });

  await prisma.gateLog.create({
    data: {
      personName: 'Bishnu Charan Das',
      personType: 'VISITOR',
      visitorId: visitor.id,
      vehicleNumber: 'OD-02-BA-1234',
      purpose: 'Parent Guardian Campus Visit',
      status: 'INSIDE',
      securityStaffId: staffProfile?.id || null,
      entryTime: new Date()
    }
  });

  await prisma.gateLog.create({
    data: {
      personName: 'Aarav Sharma (Student)',
      personType: 'STUDENT',
      studentId: students[0]?.id || null,
      purpose: 'Authorized Day Outing Return',
      status: 'INSIDE',
      securityStaffId: staffProfile?.id || null,
      entryTime: new Date(Date.now() - 3600000)
    }
  });

  await prisma.emergencyIncident.create({
    data: {
      incidentNumber: `EMG-${Date.now().toString().slice(-6)}`,
      type: 'MEDICAL',
      severity: 'HIGH',
      location: 'Block A - 2nd Floor Corridor',
      description: 'Student experiencing sudden dehydration. Immediate campus medical escort provided.',
      reportedById: security.id,
      status: 'RESOLVED',
      resolvedById: warden.id,
      resolutionNotes: 'First aid and hydration administered by campus physician. Student rested and stable.',
      resolvedAt: new Date()
    }
  });

  // 5. Seed Room Transfer Request
  if (students.length >= 2 && rooms.length >= 2) {
    await prisma.roomTransfer.create({
      data: {
        studentId: students[1].id,
        fromRoomId: rooms[0].id,
        toRoomId: rooms[1].id,
        reason: 'Requested quiet study environment',
        status: 'PENDING'
      }
    });
  }

  // 6. Seed Visitor Request
  if (students[0]) {
    await prisma.visitorRequest.create({
      data: {
        visitorName: 'Subhashree Dash',
        phoneNumber: '+91 94370 12345',
        purpose: 'Parental Visit & Academic Discussion',
        studentId: students[0].id,
        visitDate: new Date('2026-10-15'),
        status: 'PENDING'
      }
    });
  }

  console.log('✓ All domain records seeded successfully in Neon DB!');
}

seedDomain()
  .catch(e => {
    console.error('[SeedDomain Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

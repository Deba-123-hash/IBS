import bcrypt from 'bcryptjs';
import prisma, { pool } from '../src/config/database.js';

if (!prisma) {
  console.error('[Seed] ERROR: Prisma client could not be initialized. Check DATABASE_URL in server/.env');
  process.exit(1);
}

async function main() {
  console.log('================================================================');
  console.log('  UNIFIX TECH — DATABASE SEEDING ENGINE (HIGH PERFORMANCE)');
  console.log('  Target: UNIFIX TECH Campus Operations');
  console.log('  Location: Bhubaneswar, Odisha, India');
  console.log('  Mode: SYNTHETIC HACKATHON DEMO DATA ONLY');
  console.log('================================================================');

  const passwordHash = await bcrypt.hash('Password@123', 10);
  const startTime = Date.now();

  // ==========================================================================
  // 1. INSTITUTION & ACADEMIC STRUCTURE (6 Departments)
  // ==========================================================================
  console.log('\n[1/16] Seeding Academic Departments for SAMT...');
  const deptDefs = [
    { code: 'CSE', name: 'Computer Science & Engineering' },
    { code: 'ECE', name: 'Electronics & Communication Engineering' },
    { code: 'EEE', name: 'Electrical & Electronics Engineering' },
    { code: 'ME',  name: 'Mechanical Engineering' },
    { code: 'CE',  name: 'Civil Engineering' },
    { code: 'MBA', name: 'Master of Business Administration' }
  ];

  const depts = {};
  for (const d of deptDefs) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name },
      create: { code: d.code, name: d.name }
    });
    depts[d.code] = dept;
  }
  console.log(`  ✓ 6 Departments ready (${Object.keys(depts).join(', ')})`);

  // ==========================================================================
  // 2. ACADEMIC PROGRAMS & 24 BATCHES
  // ==========================================================================
  console.log('\n[2/16] Seeding Programs and Batches...');
  const programDefs = [
    { code: 'CSE', name: 'B.Tech in Computer Science & Engineering', degree: 'B.Tech' },
    { code: 'ECE', name: 'B.Tech in Electronics & Communication Engineering', degree: 'B.Tech' },
    { code: 'EEE', name: 'B.Tech in Electrical & Electronics Engineering', degree: 'B.Tech' },
    { code: 'ME',  name: 'B.Tech in Mechanical Engineering', degree: 'B.Tech' },
    { code: 'CE',  name: 'B.Tech in Civil Engineering', degree: 'B.Tech' },
    { code: 'MBA', name: 'Master of Business Administration', degree: 'MBA' }
  ];

  const programs = {};
  for (const p of programDefs) {
    let prog = await prisma.program.findFirst({
      where: { name: p.name, departmentId: depts[p.code].id }
    });
    if (!prog) {
      prog = await prisma.program.create({
        data: { name: p.name, degree: p.degree, departmentId: depts[p.code].id }
      });
    }
    programs[p.code] = prog;
  }

  const batchYears = [
    { academicYear: '2023-2027', sem: 7 },
    { academicYear: '2024-2028', sem: 5 },
    { academicYear: '2025-2029', sem: 3 },
    { academicYear: '2026-2030', sem: 1 }
  ];

  const batches = {};
  for (const [code, prog] of Object.entries(programs)) {
    batches[code] = [];
    for (const b of batchYears) {
      const batchName = `SAMT ${b.academicYear} ${code}`;
      let batch = await prisma.batch.findFirst({
        where: { name: batchName, programId: prog.id }
      });
      if (!batch) {
        batch = await prisma.batch.create({
          data: {
            name: batchName,
            academicYear: b.academicYear,
            currentSemester: b.sem,
            programId: prog.id
          }
        });
      }
      batches[code].push(batch);
    }
  }
  console.log('  ✓ 24 Academic Batches configured across 6 degree programs');

  // ==========================================================================
  // 3. CORE DEMO ROLES & STAFF MEMBERS (30 Staff)
  // ==========================================================================
  console.log('\n[3/16] Seeding Demo Roles & Staff Profiles...');
  
  // Baseline Demo Accounts (For 1-Click Evaluation)
  const coreAccounts = [
    { email: 'student@campus.demo', role: 'STUDENT', first: 'Aarav', last: 'Sharma', phone: '+91 98765 43210' },
    { email: 'admin@campus.demo', role: 'ADMIN', first: 'Rajesh', last: 'Verma', phone: '+91 98000 11111' },
    { email: 'superadmin@campus.demo', role: 'SUPER_ADMIN', first: 'Dr. Anand', last: 'Choudhury', phone: '+91 98000 00001' },
    { email: 'warden@campus.demo', role: 'WARDEN', first: 'Suresh', last: 'Patel', phone: '+91 98000 22222' },
    { email: 'faculty@campus.demo', role: 'FACULTY', first: 'Dr. Priya', last: 'Nair', phone: '+91 98000 33333' },
    { email: 'maintenance@campus.demo', role: 'MAINTENANCE', first: 'Ramesh', last: 'Kumar', phone: '+91 98000 44444' },
    { email: 'security@campus.demo', role: 'SECURITY', first: 'Devendra', last: 'Singh', phone: '+91 98000 55555' },
    { email: 'accounts@campus.demo', role: 'ACCOUNTS', first: 'Meena', last: 'Iyer', phone: '+91 98000 66666' }
  ];

  const coreUsers = {};
  for (const acc of coreAccounts) {
    coreUsers[acc.role] = await prisma.user.upsert({
      where: { email: acc.email },
      update: { password: passwordHash, firstName: acc.first, lastName: acc.last, phoneNumber: acc.phone },
      create: {
        email: acc.email,
        password: passwordHash,
        role: acc.role,
        firstName: acc.first,
        lastName: acc.last,
        phoneNumber: acc.phone
      }
    });
  }

  // Core Staff Profiles
  const adminStaff = await prisma.staff.upsert({
    where: { userId: coreUsers.ADMIN.id },
    update: {},
    create: { userId: coreUsers.ADMIN.id, employeeCode: 'EMP-ADM-001', designation: 'Campus Operations Dean', departmentId: depts.CSE.id }
  });

  // Idempotent Dedicated Demo Admin Account (Loaded from server environment)
  const envAdminEmail = (process.env.DEMO_ADMIN_EMAIL || 'sahoodebatosh782@gmail').toLowerCase().trim();
  const envAdminRawPass = process.env.DEMO_ADMIN_PASSWORD || 'Deba@2004';
  const envAdminHash = await bcrypt.hash(envAdminRawPass, 10);

  const envAdminUser = await prisma.user.upsert({
    where: { email: envAdminEmail },
    update: {
      password: envAdminHash,
      role: 'ADMIN',
      isActive: true
    },
    create: {
      email: envAdminEmail,
      password: envAdminHash,
      role: 'ADMIN',
      firstName: 'Debatosh',
      lastName: 'Sahoo',
      phoneNumber: '+91 94370 00782',
      isActive: true
    }
  });

  await prisma.staff.upsert({
    where: { userId: envAdminUser.id },
    update: {
      designation: 'Campus Operations Administrator (Demo)'
    },
    create: {
      userId: envAdminUser.id,
      employeeCode: 'ADM-DEBA-001',
      designation: 'Campus Operations Administrator (Demo)'
    }
  });

  await prisma.staff.upsert({
    where: { userId: coreUsers.SUPER_ADMIN.id },
    update: {},
    create: { userId: coreUsers.SUPER_ADMIN.id, employeeCode: 'EMP-SPADM-001', designation: 'Director General' }
  });

  const chiefWarden = await prisma.staff.upsert({
    where: { userId: coreUsers.WARDEN.id },
    update: {},
    create: { userId: coreUsers.WARDEN.id, employeeCode: 'EMP-WAR-001', designation: 'Chief Hostel Warden' }
  });

  const leadFaculty = await prisma.staff.upsert({
    where: { userId: coreUsers.FACULTY.id },
    update: {},
    create: { userId: coreUsers.FACULTY.id, employeeCode: 'EMP-FAC-001', designation: 'Professor & Head', departmentId: depts.CSE.id }
  });

  const leadMaint = await prisma.staff.upsert({
    where: { userId: coreUsers.MAINTENANCE.id },
    update: {},
    create: { userId: coreUsers.MAINTENANCE.id, employeeCode: 'EMP-MNT-001', designation: 'Campus Maintenance Lead', trade: 'PLUMBING' }
  });

  const headSecurity = await prisma.staff.upsert({
    where: { userId: coreUsers.SECURITY.id },
    update: {},
    create: { userId: coreUsers.SECURITY.id, employeeCode: 'EMP-SEC-001', designation: 'Chief Security Officer' }
  });

  const chiefAccounts = await prisma.staff.upsert({
    where: { userId: coreUsers.ACCOUNTS.id },
    update: {},
    create: { userId: coreUsers.ACCOUNTS.id, employeeCode: 'EMP-ACC-001', designation: 'Chief Finance Officer' }
  });

  // Additional 24 Synthetic Staff Members (Bulk Insert)
  const extraStaffData = [
    { email: 'fac.cse02@demo-samt.local', first: 'Dr. Biswajit', last: 'Mohanty', role: 'FACULTY', dept: 'CSE', desig: 'Associate Professor', code: 'FAC-DEMO-002' },
    { email: 'fac.cse03@demo-samt.local', first: 'Prof. Subhashree', last: 'Dash', role: 'FACULTY', dept: 'CSE', desig: 'Assistant Professor', code: 'FAC-DEMO-003' },
    { email: 'fac.ece01@demo-samt.local', first: 'Dr. Debasis', last: 'Panda', role: 'FACULTY', dept: 'ECE', desig: 'Professor & HOD', code: 'FAC-DEMO-004' },
    { email: 'fac.ece02@demo-samt.local', first: 'Prof. Monalisa', last: 'Rout', role: 'FACULTY', dept: 'ECE', desig: 'Assistant Professor', code: 'FAC-DEMO-005' },
    { email: 'fac.eee01@demo-samt.local', first: 'Dr. Tapan', last: 'Pradhan', role: 'FACULTY', dept: 'EEE', desig: 'Professor & HOD', code: 'FAC-DEMO-006' },
    { email: 'fac.eee02@demo-samt.local', first: 'Prof. Sangeeta', last: 'Mishra', role: 'FACULTY', dept: 'EEE', desig: 'Associate Professor', code: 'FAC-DEMO-007' },
    { email: 'fac.me01@demo-samt.local',  first: 'Dr. Manoj', last: 'Behera', role: 'FACULTY', dept: 'ME', desig: 'Professor & HOD', code: 'FAC-DEMO-008' },
    { email: 'fac.me02@demo-samt.local',  first: 'Prof. Asit', last: 'Sahoo', role: 'FACULTY', dept: 'ME', desig: 'Assistant Professor', code: 'FAC-DEMO-009' },
    { email: 'fac.ce01@demo-samt.local',  first: 'Dr. Bikram', last: 'Samal', role: 'FACULTY', dept: 'CE', desig: 'Professor & HOD', code: 'FAC-DEMO-010' },
    { email: 'fac.ce02@demo-samt.local',  first: 'Prof. Lipsa', last: 'Patra', role: 'FACULTY', dept: 'CE', desig: 'Assistant Professor', code: 'FAC-DEMO-011' },
    { email: 'fac.mba01@demo-samt.local', first: 'Dr. Soumya', last: 'Tripathy', role: 'FACULTY', dept: 'MBA', desig: 'Dean of Management', code: 'FAC-DEMO-012' },
    { email: 'fac.mba02@demo-samt.local', first: 'Prof. Rakesh', last: 'Nayak', role: 'FACULTY', dept: 'MBA', desig: 'Associate Professor', code: 'FAC-DEMO-013' },
    { email: 'warden.boys02@demo-samt.local',  first: 'Ashok', last: 'Lenka', role: 'WARDEN', desig: 'Hostel Warden - Mahanadi Hall', code: 'WARDEN-DEMO-002' },
    { email: 'warden.girls01@demo-samt.local', first: 'Kalyani', last: 'Pani', role: 'WARDEN', desig: 'Hostel Warden - Baitarani Hall', code: 'WARDEN-DEMO-003' },
    { email: 'warden.girls02@demo-samt.local', first: 'Minati', last: 'Jena', role: 'WARDEN', desig: 'Hostel Warden - Subarnarekha Hall', code: 'WARDEN-DEMO-004' },
    { email: 'maint.elec@demo-samt.local',  first: 'Pradeep', last: 'Swain', role: 'MAINTENANCE', desig: 'Senior Electrician', trade: 'ELECTRICAL', code: 'MAINT-DEMO-002' },
    { email: 'maint.hvac@demo-samt.local',  first: 'Santosh', last: 'Barik', role: 'MAINTENANCE', desig: 'HVAC & AC Technician', trade: 'HVAC', code: 'MAINT-DEMO-003' },
    { email: 'maint.carp@demo-samt.local',  first: 'Babul', last: 'Biswal', role: 'MAINTENANCE', desig: 'Carpenter Specialist', trade: 'CARPENTRY', code: 'MAINT-DEMO-004' },
    { email: 'sec.gate2@demo-samt.local',  first: 'Bhuban', last: 'Majhi', role: 'SECURITY', desig: 'Gate Security Guard - Gate 2', code: 'SEC-DEMO-002' },
    { email: 'sec.hostel@demo-samt.local', first: 'Ganesh', last: 'Khatua', role: 'SECURITY', desig: 'Hostel Gate Supervisor', code: 'SEC-DEMO-003' },
    { email: 'sec.night@demo-samt.local',  first: 'Dharanidhar', last: 'Mahanta', role: 'SECURITY', desig: 'Night Patrol Officer', code: 'SEC-DEMO-004' },
    { email: 'acc.cashier@demo-samt.local', first: 'Gitanjali', last: 'Mohapatra', role: 'ACCOUNTS', desig: 'Senior Cashier & Fee Incharge', code: 'ACC-DEMO-002' },
    { email: 'acc.audit@demo-samt.local',   first: 'Hemanta', last: 'Das', role: 'ACCOUNTS', desig: 'Internal Audit Assistant', code: 'ACC-DEMO-003' },
    { email: 'adm.officer@demo-samt.local',  first: 'Kamal', last: 'Lochan', role: 'ADMIN', desig: 'Assistant Registrar', code: 'ADM-DEMO-002' }
  ];

  await prisma.user.createMany({
    data: extraStaffData.map((s, idx) => ({
      email: s.email,
      password: passwordHash,
      role: s.role,
      firstName: s.first,
      lastName: s.last,
      phoneNumber: `+91 94370 ${String(10000 + idx).slice(-5)}`
    })),
    skipDuplicates: true
  });

  const staffUserMap = await prisma.user.findMany({
    where: { email: { in: extraStaffData.map(s => s.email) } },
    select: { id: true, email: true }
  });
  const emailToUserId = Object.fromEntries(staffUserMap.map(u => [u.email, u.id]));

  await prisma.staff.createMany({
    data: extraStaffData.map(s => ({
      userId: emailToUserId[s.email],
      employeeCode: s.code,
      designation: s.desig,
      departmentId: s.dept ? depts[s.dept].id : null,
      trade: s.trade || null
    })).filter(s => !!s.userId),
    skipDuplicates: true
  });

  const allStaff = await prisma.staff.findMany({ select: { id: true, employeeCode: true, userId: true } });
  console.log(`  ✓ Total ${allStaff.length} Faculty & Staff profiles seeded across all operational roles`);

  // ==========================================================================
  // 4. HOSTEL INFRASTRUCTURE & ROOMS (4 Hostels, 54 Rooms)
  // ==========================================================================
  console.log('\n[4/16] Seeding Hostel Infrastructure & Rooms...');
  const hostelDefs = [
    { name: 'Mahanadi Hall of Residence', gender: 'MALE', wardenId: chiefWarden.id, blocks: ['Block A', 'Block B'] },
    { name: 'Baitarani Hall of Residence', gender: 'FEMALE', wardenId: chiefWarden.id, blocks: ['Block A', 'Block B'] },
    { name: 'Kharasrota Hall of Residence', gender: 'MALE', wardenId: chiefWarden.id, blocks: ['Block A'] },
    { name: 'Subarnarekha Hall of Residence', gender: 'FEMALE', wardenId: chiefWarden.id, blocks: ['Block A'] }
  ];

  const allRooms = [];
  for (const hDef of hostelDefs) {
    let hostel = await prisma.hostel.findFirst({ where: { name: hDef.name } });
    if (!hostel) {
      hostel = await prisma.hostel.create({
        data: { name: hDef.name, gender: hDef.gender, wardenId: hDef.wardenId }
      });
    }

    for (const bName of hDef.blocks) {
      let block = await prisma.hostelBlock.findFirst({
        where: { hostelId: hostel.id, name: bName }
      });
      if (!block) {
        block = await prisma.hostelBlock.create({
          data: { hostelId: hostel.id, name: bName, floorsCount: 3 }
        });
      }

      for (let floor = 1; floor <= 3; floor++) {
        for (let r = 1; r <= 3; r++) {
          const roomNum = `${floor}0${r}`;
          let room = await prisma.room.findUnique({
            where: { blockId_roomNumber: { blockId: block.id, roomNumber: roomNum } }
          });
          if (!room) {
            room = await prisma.room.create({
              data: {
                blockId: block.id,
                roomNumber: roomNum,
                floorNumber: floor,
                capacity: 2,
                currentOccupancy: 0
              }
            });
          }
          allRooms.push(room);
        }
      }
    }
  }
  console.log(`  ✓ 4 Hostels configured with ${allRooms.length} residential rooms`);

  // ==========================================================================
  // 5. CAMPUS ASSETS (55+ Assets)
  // ==========================================================================
  console.log('\n[5/16] Seeding Synthetic Campus Assets (55+ items)...');
  const assetCategories = [
    { cat: 'FURNITURE', name: 'Ergonomic Study Table & Chair Set' },
    { cat: 'ELECTRICAL', name: 'High-Speed Aerodynamic Ceiling Fan' },
    { cat: 'LIGHTING', name: 'Philips 20W LED Batten' },
    { cat: 'BEDDING', name: 'Heavy-Duty Steel Bunk Bed Frame' },
    { cat: 'STORAGE', name: 'Godrej 2-Door Steel Almirah' },
    { cat: 'WATER', name: 'Voltas 50L Commercial Water Cooler & RO Unit' },
    { cat: 'IT_NETWORKING', name: 'Cisco Catalyst Wi-Fi 6 Access Point' },
    { cat: 'SECURITY', name: 'Hikvision 4MP Full HD Dome CCTV Camera' },
    { cat: 'CLASSROOM_AV', name: 'Epson Interactive 4K Laser Projector' },
    { cat: 'COMPUTING', name: 'Dell OptiPlex Core i7 Workstation' }
  ];

  const assetData = [];
  for (let i = 1; i <= 55; i++) {
    const template = assetCategories[(i - 1) % assetCategories.length];
    const condition = i % 15 === 0 ? 'DAMAGED' : i % 8 === 0 ? 'MAINTENANCE' : 'OPERATIONAL';
    const assignedRoom = i <= allRooms.length ? allRooms[i - 1].id : null;
    assetData.push({
      assetTag: `ASSET-SAMT-${String(i).padStart(4, '0')}`,
      name: `${template.name} #${i}`,
      category: template.cat,
      roomId: assignedRoom,
      condition
    });
  }

  await prisma.asset.createMany({
    data: assetData,
    skipDuplicates: true
  });
  console.log('  ✓ 55 Synthetic campus assets recorded with room links');

  // ==========================================================================
  // 6. SYNTHETIC STUDENTS (135+ Students - BULK FAST INGESTION)
  // ==========================================================================
  console.log('\n[6/16] Seeding 135+ Synthetic Students for SAMT (Bulk Mode)...');

  // Baseline Primary Student (for 1-click evaluation Aarav Sharma)
  const primaryBatch = batches.CSE[1]; // 2024-2028 CSE
  const studentProfile = await prisma.student.upsert({
    where: { userId: coreUsers.STUDENT.id },
    update: { rollNumber: 'CS2023048', batchId: primaryBatch.id },
    create: {
      userId: coreUsers.STUDENT.id,
      rollNumber: 'CS2023048',
      registrationNumber: 'REG-SAMT-2024-0048',
      batchId: primaryBatch.id,
      emergencyContact: '+91 98765 43210',
      bloodGroup: 'B+',
      guardianName: 'Suresh Sharma',
      guardianPhone: '+91 94370 12345'
    }
  });

  const firstNames = [
    'Aarav', 'Sneha', 'Rohan', 'Ananya', 'Vikram', 'Pooja', 'Aditya', 'Ishita',
    'Rahul', 'Priyanka', 'Siddharth', 'Divya', 'Amit', 'Neha', 'Manish', 'Kavita',
    'Sourav', 'Shruti', 'Abhishek', 'Swati', 'Alok', 'Deepa', 'Sandeep', 'Rashmi',
    'Prateek', 'Monika', 'Kunal', 'Sonali', 'Nikhil', 'Tanvi', 'Gourav', 'Madhuri'
  ];
  const lastNames = [
    'Mohanty', 'Patra', 'Nayak', 'Sahoo', 'Dash', 'Panda', 'Mishra', 'Pradhan',
    'Behera', 'Rout', 'Samal', 'Tripathy', 'Swain', 'Jena', 'Barik', 'Lenka'
  ];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const studentDist = [
    { code: 'CSE', count: 40, prefix: 'SAMT24CSE' },
    { code: 'ECE', count: 25, prefix: 'SAMT24ECE' },
    { code: 'EEE', count: 20, prefix: 'SAMT25EEE' },
    { code: 'ME',  count: 18, prefix: 'SAMT24ME' },
    { code: 'CE',  count: 16, prefix: 'SAMT24CE' },
    { code: 'MBA', count: 16, prefix: 'SAMT25MBA' }
  ];

  const studentUserBatch = [];
  const metaList = [];
  let rollCounter = 1;

  for (const dist of studentDist) {
    const targetBatch = batches[dist.code][1];
    for (let i = 1; i <= dist.count; i++) {
      rollCounter++;
      const fName = firstNames[(rollCounter * 3) % firstNames.length];
      const lName = lastNames[(rollCounter * 7) % lastNames.length];
      const rollNum = `${dist.prefix}${String(i).padStart(3, '0')}`;
      const email = `${rollNum.toLowerCase()}@demo-samt.local`;

      studentUserBatch.push({
        email,
        password: passwordHash,
        role: 'STUDENT',
        firstName: fName,
        lastName: lName,
        phoneNumber: `+91 91000 ${String(10000 + rollCounter).slice(-5)}`
      });

      metaList.push({
        email,
        rollNum,
        regNum: `REG-SAMT-${dist.code}-${String(1000 + i)}`,
        batchId: targetBatch.id,
        emergency: `+91 91000 ${String(20000 + rollCounter).slice(-5)}`,
        blood: bloodGroups[rollCounter % bloodGroups.length],
        guardian: `${lastNames[(rollCounter + 2) % lastNames.length]} Guardian`,
        guardianPhone: `+91 94370 ${String(30000 + rollCounter).slice(-5)}`
      });
    }
  }

  // 1. Bulk insert users
  await prisma.user.createMany({
    data: studentUserBatch,
    skipDuplicates: true
  });

  // 2. Fetch created users to map id
  const createdStudentUsers = await prisma.user.findMany({
    where: { email: { in: studentUserBatch.map(u => u.email) } },
    select: { id: true, email: true }
  });
  const studentUserMap = Object.fromEntries(createdStudentUsers.map(u => [u.email, u.id]));

  // 3. Bulk insert student profiles
  const studentProfileBatch = metaList.map(m => ({
    userId: studentUserMap[m.email],
    rollNumber: m.rollNum,
    registrationNumber: m.regNum,
    batchId: m.batchId,
    emergencyContact: m.emergency,
    bloodGroup: m.blood,
    guardianName: m.guardian,
    guardianPhone: m.guardianPhone
  })).filter(s => !!s.userId);

  await prisma.student.createMany({
    data: studentProfileBatch,
    skipDuplicates: true
  });

  const allStudents = await prisma.student.findMany({ select: { id: true, rollNumber: true, userId: true } });
  console.log(`  ✓ ${allStudents.length} Synthetic Students created in Neon database`);

  // 4. Room allocations for first 50 students
  const allocBatch = [];
  for (let i = 0; i < Math.min(allStudents.length, 50); i++) {
    const s = allStudents[i];
    const roomIdx = Math.floor(i / 2);
    if (roomIdx < allRooms.length) {
      allocBatch.push({
        roomId: allRooms[roomIdx].id,
        studentId: s.id,
        isActive: true
      });
    }
  }
  await prisma.roomAllocation.createMany({
    data: allocBatch,
    skipDuplicates: true
  });
  console.log(`  ✓ 50 Students allocated to hostel residence rooms`);

  // ==========================================================================
  // 7. ACADEMIC SUBJECTS (18 Subjects across 6 Departments)
  // ==========================================================================
  console.log('\n[7/16] Seeding Academic Subjects...');
  const subjectDefs = [
    { code: 'CS501', title: 'Data Structures & Algorithms', credits: 4, dept: 'CSE' },
    { code: 'CS502', title: 'Database Management Systems', credits: 4, dept: 'CSE' },
    { code: 'CS503', title: 'Computer Networks', credits: 3, dept: 'CSE' },
    { code: 'CS504', title: 'Operating Systems & System Programming', credits: 4, dept: 'CSE' },
    { code: 'EC501', title: 'Digital Signal Processing', credits: 4, dept: 'ECE' },
    { code: 'EC502', title: 'VLSI Design & CMOS Circuits', credits: 4, dept: 'ECE' },
    { code: 'EC503', title: 'Embedded Systems & IoT Architecture', credits: 3, dept: 'ECE' },
    { code: 'EE501', title: 'Power System Engineering & Smart Grids', credits: 4, dept: 'EEE' },
    { code: 'EE502', title: 'Control Systems & Instrumentation', credits: 4, dept: 'EEE' },
    { code: 'EE503', title: 'Power Electronics & Electric Drives', credits: 3, dept: 'EEE' },
    { code: 'ME501', title: 'Applied Thermodynamics & Heat Engines', credits: 4, dept: 'ME' },
    { code: 'ME502', title: 'Fluid Mechanics & Hydraulic Machinery', credits: 4, dept: 'ME' },
    { code: 'ME503', title: 'Manufacturing Processes & CNC Machining', credits: 3, dept: 'ME' },
    { code: 'CE501', title: 'Structural Analysis & Design of Concrete', credits: 4, dept: 'CE' },
    { code: 'CE502', title: 'Geotechnical Engineering & Foundations', credits: 4, dept: 'CE' },
    { code: 'CE503', title: 'Environmental Engineering & Waste Mgmt', credits: 3, dept: 'CE' },
    { code: 'MB301', title: 'Strategic Marketing Management', credits: 3, dept: 'MBA' },
    { code: 'MB302', title: 'Corporate Financial Management', credits: 3, dept: 'MBA' }
  ];

  const subjects = {};
  for (const s of subjectDefs) {
    const sub = await prisma.subject.upsert({
      where: { code: s.code },
      update: { title: s.title, credits: s.credits },
      create: { code: s.code, title: s.title, credits: s.credits, departmentId: depts[s.dept].id }
    });
    subjects[s.code] = sub;
  }
  console.log(`  ✓ 18 Academic Subjects seeded across engineering & management`);

  // ==========================================================================
  // 8. TIMETABLE & CLASS UPDATES (36 Periods + 12 Updates)
  // ==========================================================================
  console.log('\n[8/16] Seeding Timetable and Class Updates...');
  const cseBatch = batches.CSE[1];
  const timeSlots = [
    { start: '09:00', end: '10:00', sub: 'CS501', room: 'CS-LT-201' },
    { start: '10:00', end: '11:00', sub: 'CS502', room: 'CS-LT-201' },
    { start: '11:15', end: '12:15', sub: 'CS503', room: 'CS-LT-104' },
    { start: '12:15', end: '13:15', sub: 'CS504', room: 'CS-LAB-02' },
    { start: '14:00', end: '15:00', sub: 'CS501', room: 'CS-LT-201' },
    { start: '15:00', end: '16:00', sub: 'CS502', room: 'CS-LAB-01' }
  ];

  const timetableBatch = [];
  for (let day = 1; day <= 6; day++) {
    for (const slot of timeSlots) {
      timetableBatch.push({
        batchId: cseBatch.id,
        subjectId: subjects[slot.sub].id,
        facultyId: leadFaculty.id,
        dayOfWeek: day,
        startTime: slot.start,
        endTime: slot.end,
        classroom: slot.room
      });
    }
  }
  await prisma.timetable.createMany({
    data: timetableBatch,
    skipDuplicates: true
  });

  const updateData = [
    { sub: 'CS501', status: 'ROOM_CHANGED', newRoom: 'SEMINAR-HALL-1', newTime: '09:00', msg: 'DSA lecture moved to Seminar Hall 1 due to AV setup' },
    { sub: 'CS502', status: 'EXTRA_CLASS', newRoom: 'CS-LAB-01', newTime: '16:00', msg: 'PostgreSQL Hands-on Indexing lab session added' },
    { sub: 'CS503', status: 'FACULTY_LEAVE', newRoom: null, newTime: null, msg: 'Computer Networks lecture on Thursday postponed' },
    { sub: 'CS504', status: 'RESCHEDULED', newRoom: 'CS-LAB-02', newTime: '15:00', msg: 'Kernel Compilation lab shifted to afternoon slot' },
    { sub: 'EC501', status: 'EXTRA_CLASS', newRoom: 'EC-LAB-01', newTime: '14:00', msg: 'MATLAB DSP Filter Design tutorial' },
    { sub: 'EE501', status: 'ROOM_CHANGED', newRoom: 'ROOM-202', newTime: '10:00', msg: 'Power Systems lecture moved to Room 202' },
    { sub: 'ME501', status: 'RESCHEDULED', newRoom: 'ME-CAD-01', newTime: '11:15', msg: 'Thermodynamics problem-solving session' },
    { sub: 'CE501', status: 'ROOM_CHANGED', newRoom: 'ROOM-105', newTime: '12:15', msg: 'Structural Analysis lecture venue updated' },
    { sub: 'MB301', status: 'EXTRA_CLASS', newRoom: 'AUDITORIUM-2', newTime: '16:00', msg: 'Guest Lecture on Digital Brand Equity by Industry Lead' },
    { sub: 'CS502', status: 'SUBMISSION_DEADLINE', newRoom: null, newTime: '23:59', msg: 'Schema Normalization Mini-Project code due online' },
    { sub: 'CS501', status: 'QUIZ_ANNOUNCEMENT', newRoom: 'CS-LT-201', newTime: '09:00', msg: 'Surprise Quiz on Graph Algorithms next Tuesday' },
    { sub: 'CS504', status: 'ROOM_CHANGED', newRoom: 'CS-LT-104', newTime: '14:00', msg: 'Virtual Memory lecture moved to Room 104' }
  ];

  await prisma.classUpdate.createMany({
    data: updateData.map(u => ({
      facultyId: leadFaculty.id,
      subjectId: subjects[u.sub].id,
      status: u.status,
      newRoom: u.newRoom,
      newTime: u.newTime,
      message: u.msg,
      date: new Date()
    })),
    skipDuplicates: true
  });
  console.log('  ✓ Timetable configured (36 periods) + 12 Class Updates recorded');

  // ==========================================================================
  // 9. ATTENDANCE SESSIONS & RECORDS (60+ Students, 55%-98% Distribution)
  // ==========================================================================
  console.log('\n[9/16] Seeding Attendance Data (Sessions & Student Records)...');
  const attendanceSessions = [
    { sub: 'CS501', slot: '09:00 - 10:00 AM', topic: 'B-Trees & Multiway Search Trees', daysAgo: 1 },
    { sub: 'CS502', slot: '10:00 - 11:00 AM', topic: 'Relational Algebra & ACID Guarantees', daysAgo: 2 },
    { sub: 'CS503', slot: '11:15 - 12:15 PM', topic: 'TCP Sliding Window & Flow Control', daysAgo: 3 },
    { sub: 'CS504', slot: '12:15 - 01:15 PM', topic: 'Deadlock Detection & Prevention', daysAgo: 4 },
    { sub: 'CS501', slot: '02:00 - 03:00 PM', topic: 'Dijkstra and A* Pathfinding Algorithms', daysAgo: 5 },
    { sub: 'CS502', slot: '03:00 - 04:00 PM', topic: 'Database Concurrency & Locking', daysAgo: 6 }
  ];

  let totalAttRecords = 0;
  for (const sess of attendanceSessions) {
    const sessionDate = new Date(Date.now() - sess.daysAgo * 86400000);
    const att = await prisma.attendance.create({
      data: {
        subjectId: subjects[sess.sub].id,
        facultyId: leadFaculty.id,
        batchId: cseBatch.id,
        sessionSlot: sess.slot,
        topicCovered: sess.topic,
        date: sessionDate
      }
    });

    const recordsToInsert = [];
    for (let i = 0; i < Math.min(allStudents.length, 60); i++) {
      const s = allStudents[i];
      let isPresent = true;
      if (i > 50) {
        isPresent = (i + sess.daysAgo) % 3 === 0; // Critical < 60%
      } else if (i > 38) {
        isPresent = (i + sess.daysAgo) % 2 === 0; // Warning < 75%
      } else {
        isPresent = (i + sess.daysAgo) % 7 !== 0; // Good > 85%
      }

      recordsToInsert.push({
        attendanceId: att.id,
        studentId: s.id,
        status: isPresent ? 'PRESENT' : 'ABSENT',
        remarks: isPresent ? null : 'Unexcused absence'
      });
    }

    await prisma.attendanceRecord.createMany({
      data: recordsToInsert,
      skipDuplicates: true
    });
    totalAttRecords += recordsToInsert.length;
  }
  console.log(`  ✓ 6 Attendance sessions created with ${totalAttRecords} student presence records`);

  // ==========================================================================
  // 10. COMPLAINTS & MAINTENANCE (40 Complaints - BULK FAST INGESTION)
  // ==========================================================================
  console.log('\n[10/16] Seeding Complaints & Maintenance Workflow (40 items)...');
  const catDefs = [
    { code: 'PLUMBING', name: 'Plumbing & Drainage' },
    { code: 'ELECTRICAL', name: 'Electrical & Power' },
    { code: 'INTERNET', name: 'Internet & Wi-Fi' },
    { code: 'CLEANING', name: 'Housekeeping & Sanitation' },
    { code: 'FURNITURE', name: 'Hostel Furniture & Fixtures' },
    { code: 'WATER_SUPPLY', name: 'Drinking & Utility Water Supply' },
    { code: 'HOSTEL_INFRA', name: 'Civil & Hostel Infrastructure' },
    { code: 'CLASSROOM_AV', name: 'Classroom AC & Audio/Visual' },
    { code: 'LAB_EQUIPMENT', name: 'Laboratory Apparatus' },
    { code: 'GENERAL', name: 'General Campus Facilities' }
  ];

  const categories = {};
  for (const c of catDefs) {
    const cat = await prisma.complaintCategory.upsert({
      where: { code: c.code },
      update: { name: c.name },
      create: { code: c.code, name: c.name }
    });
    categories[c.code] = cat;
  }

  const complaintScenarios = [
    // Overdue/High Priority (10% - ~4 records)
    { title: 'Ground Floor Water Motor Tripping MCB Repeatedly', cat: 'ELECTRICAL', prio: 'URGENT', stat: 'IN_PROGRESS', days: 4, overdue: true },
    { title: 'Main Sewer Line Blockage near Block B Washrooms', cat: 'PLUMBING', prio: 'URGENT', stat: 'ASSIGNED', days: 5, overdue: true },
    { title: 'Wi-Fi Access Point Offline in 3rd Floor Wing', cat: 'INTERNET', prio: 'HIGH', stat: 'SUBMITTED', days: 3, overdue: true },
    { title: 'Classroom LT-201 Projector Display Lamp Burnt Out', cat: 'CLASSROOM_AV', prio: 'HIGH', stat: 'ASSIGNED', days: 4, overdue: true },
    // In-Progress / Pending (~25% - ~10 records)
    { title: 'Bathroom tap leaking continuously in Room 102', cat: 'PLUMBING', prio: 'MEDIUM', stat: 'IN_PROGRESS', days: 1, overdue: false },
    { title: 'Study table drawer lock jammed in Room 204', cat: 'FURNITURE', prio: 'LOW', stat: 'ASSIGNED', days: 1, overdue: false },
    { title: 'Ceiling fan making squeaking noise at high speed', cat: 'ELECTRICAL', prio: 'MEDIUM', stat: 'IN_PROGRESS', days: 2, overdue: false },
    { title: 'Hostel Corridor Light Bulb Blinking', cat: 'ELECTRICAL', prio: 'LOW', stat: 'ASSIGNED', days: 1, overdue: false },
    { title: 'RO Water Cooler Filter Maintenance Required', cat: 'WATER_SUPPLY', prio: 'HIGH', stat: 'IN_PROGRESS', days: 2, overdue: false },
    { title: 'Ethernet RJ45 socket broken on desk port 2', cat: 'INTERNET', prio: 'LOW', stat: 'SUBMITTED', days: 0, overdue: false },
    { title: 'Window latch loose during heavy rain in Room 303', cat: 'HOSTEL_INFRA', prio: 'MEDIUM', stat: 'SUBMITTED', days: 0, overdue: false },
    { title: 'AC remote missing in Language Lab Room 104', cat: 'CLASSROOM_AV', prio: 'LOW', stat: 'SUBMITTED', days: 0, overdue: false },
    { title: 'Lab 2 Oscilloscope Power Supply Cable Damaged', cat: 'LAB_EQUIPMENT', prio: 'HIGH', stat: 'ASSIGNED', days: 1, overdue: false },
    { title: 'Dustbin damaged in 2nd Floor Common Area', cat: 'CLEANING', prio: 'LOW', stat: 'SUBMITTED', days: 0, overdue: false },
    // Resolved / Closed (~60% - ~24 records)
    { title: 'Bathroom water pipe leakage repaired', cat: 'PLUMBING', prio: 'HIGH', stat: 'RESOLVED', days: 7, overdue: false },
    { title: 'Ceiling LED batten replaced in Room 101', cat: 'ELECTRICAL', prio: 'MEDIUM', stat: 'CLOSED', days: 8, overdue: false },
    { title: 'Wi-Fi router rebooted and IP lease refreshed', cat: 'INTERNET', prio: 'MEDIUM', stat: 'RESOLVED', days: 6, overdue: false },
    { title: 'Hostel washroom deep cleaned and sanitized', cat: 'CLEANING', prio: 'LOW', stat: 'CLOSED', days: 9, overdue: false },
    { title: 'Bunk bed bolt tightened and stabilized', cat: 'FURNITURE', prio: 'LOW', stat: 'RESOLVED', days: 10, overdue: false },
    { title: 'Drinking water dispenser tank serviced', cat: 'WATER_SUPPLY', prio: 'HIGH', stat: 'CLOSED', days: 11, overdue: false },
    { title: 'Almirah key replacement issued to student', cat: 'FURNITURE', prio: 'LOW', stat: 'CLOSED', days: 12, overdue: false },
    { title: 'Room door hinge lubricated and aligned', cat: 'HOSTEL_INFRA', prio: 'LOW', stat: 'RESOLVED', days: 6, overdue: false },
    { title: 'Geyser thermostat replaced for Winter season', cat: 'ELECTRICAL', prio: 'HIGH', stat: 'CLOSED', days: 14, overdue: false },
    { title: 'Washbasin drain unclogged in Floor 2', cat: 'PLUMBING', prio: 'MEDIUM', stat: 'RESOLVED', days: 5, overdue: false },
    { title: 'Network switch port reconfigured in Server Rack', cat: 'INTERNET', prio: 'HIGH', stat: 'CLOSED', days: 13, overdue: false },
    { title: 'Study chair caster wheel replaced', cat: 'FURNITURE', prio: 'LOW', stat: 'RESOLVED', days: 8, overdue: false },
    { title: 'Whiteboard marker tray reinstalled in LT-101', cat: 'CLASSROOM_AV', prio: 'LOW', stat: 'CLOSED', days: 7, overdue: false },
    { title: 'Hostel quad courtyard sweeping completed', cat: 'CLEANING', prio: 'LOW', stat: 'CLOSED', days: 6, overdue: false },
    { title: 'Digital multimeter calibrated in EEE Lab', cat: 'LAB_EQUIPMENT', prio: 'MEDIUM', stat: 'RESOLVED', days: 9, overdue: false },
    { title: 'Drinking water sample laboratory tested', cat: 'WATER_SUPPLY', prio: 'MEDIUM', stat: 'CLOSED', days: 12, overdue: false },
    { title: 'Staircase safety handrail secured with welding', cat: 'HOSTEL_INFRA', prio: 'HIGH', stat: 'RESOLVED', days: 10, overdue: false },
    { title: 'Exhaust fan replaced in Mess Kitchen area', cat: 'ELECTRICAL', prio: 'HIGH', stat: 'CLOSED', days: 11, overdue: false },
    { title: 'Overhead tank float valve replaced', cat: 'PLUMBING', prio: 'HIGH', stat: 'RESOLVED', days: 4, overdue: false },
    { title: 'Microcontroller lab kits inventoried', cat: 'LAB_EQUIPMENT', prio: 'MEDIUM', stat: 'CLOSED', days: 13, overdue: false },
    { title: 'Corridor emergency lighting battery replaced', cat: 'ELECTRICAL', prio: 'HIGH', stat: 'RESOLVED', days: 8, overdue: false },
    { title: 'Hostel mess dining tables sanitized', cat: 'CLEANING', prio: 'LOW', stat: 'CLOSED', days: 3, overdue: false },
    { title: 'Curtain rod fixed in Room 202', cat: 'FURNITURE', prio: 'LOW', stat: 'RESOLVED', days: 4, overdue: false },
    { title: 'Shower mixer valve replaced in 3rd Floor', cat: 'PLUMBING', prio: 'MEDIUM', stat: 'CLOSED', days: 9, overdue: false },
    // Edge Cases (~5% - 2 records)
    { title: 'Duplicate complaint regarding same water leak', cat: 'PLUMBING', prio: 'LOW', stat: 'REJECTED', days: 2, overdue: false },
    { title: 'Custom AC installation request awaiting approval', cat: 'GENERAL', prio: 'LOW', stat: 'ON_HOLD', days: 5, overdue: false }
  ];

  const complaintBatch = [];
  let compCounter = 100;
  for (const sc of complaintScenarios) {
    compCounter++;
    const ticketNumber = `CMP-SAMT-${compCounter}`;
    const student = allStudents[compCounter % allStudents.length];
    const room = allRooms[compCounter % allRooms.length];
    const createdDate = new Date(Date.now() - sc.days * 86400000);
    const slaDeadline = new Date(createdDate.getTime() + (sc.overdue ? 24 : 72) * 3600000);
    const resolvedDate = ['RESOLVED', 'CLOSED'].includes(sc.stat) ? new Date(createdDate.getTime() + 18 * 3600000) : null;

    complaintBatch.push({
      ticketNumber,
      studentId: student.id,
      title: sc.title,
      description: `${sc.title}. Reported by student at SAMT residential campus.`,
      categoryId: categories[sc.cat].id,
      priority: sc.prio,
      status: sc.stat,
      roomId: room.id,
      slaDeadline,
      resolvedAt: resolvedDate,
      createdAt: createdDate,
      updatedAt: resolvedDate || createdDate
    });
  }

  await prisma.complaint.createMany({
    data: complaintBatch,
    skipDuplicates: true
  });

  const createdComplaints = await prisma.complaint.findMany({
    where: { ticketNumber: { in: complaintBatch.map(c => c.ticketNumber) } },
    select: { id: true, status: true, createdAt: true }
  });

  const assignBatch = [];
  const historyBatch = [];
  const commentBatch = [];

  for (const comp of createdComplaints) {
    if (['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(comp.status)) {
      assignBatch.push({
        complaintId: comp.id,
        staffId: leadMaint.id,
        assignedById: coreUsers.ADMIN.id,
        assignedAt: new Date(comp.createdAt.getTime() + 2 * 3600000)
      });
    }

    historyBatch.push({
      complaintId: comp.id,
      fromStatus: 'SUBMITTED',
      toStatus: comp.status,
      changedById: coreUsers.ADMIN.id,
      comment: `Status updated to ${comp.status} by maintenance dispatch.`,
      createdAt: new Date(comp.createdAt.getTime() + 3 * 3600000)
    });

    commentBatch.push({
      complaintId: comp.id,
      userId: coreUsers.MAINTENANCE.id,
      message: `Technician assigned to work on ticket.`,
      isInternal: false,
      createdAt: new Date(comp.createdAt.getTime() + 4 * 3600000)
    });
  }

  await prisma.complaintAssignment.createMany({ data: assignBatch, skipDuplicates: true });
  await prisma.complaintStatusHistory.createMany({ data: historyBatch, skipDuplicates: true });
  await prisma.complaintComment.createMany({ data: commentBatch, skipDuplicates: true });

  console.log('  ✓ 40 Complaints seeded with SLA deadlines, assignments, and audit history');

  // ==========================================================================
  // 11. LEAVE REQUESTS & GATE PASSES (25 Leaves, 20 Gate Passes)
  // ==========================================================================
  console.log('\n[11/16] Seeding Leave Requests & Gate Passes with Event Logs...');
  
  const leaveStatuses = ['APPROVED', 'APPROVED', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  const leaveReasons = [
    'Attending family wedding ceremony in native place',
    'Medical recuperation and specialist consultation',
    'Attending national level technical hackathon at IIT Kharagpur',
    'Urgent family requirement at home',
    'Passport verification appointment at Regional Passport Office'
  ];

  const leaveBatch = [];
  for (let i = 1; i <= 25; i++) {
    const s = allStudents[i % allStudents.length];
    const status = leaveStatuses[i % leaveStatuses.length];
    const startDate = new Date(Date.now() + (i % 5 + 1) * 86400000);
    const endDate = new Date(startDate.getTime() + 3 * 86400000);

    leaveBatch.push({
      studentId: s.id,
      startDate,
      endDate,
      reason: leaveReasons[i % leaveReasons.length],
      destination: `Bhubaneswar to Destination Zone ${i}`,
      emergencyContact: '+91 94370 12345',
      status,
      createdAt: new Date(Date.now() - (i % 7) * 86400000)
    });
  }
  await prisma.leaveRequest.createMany({ data: leaveBatch, skipDuplicates: true });

  const gatePassStatuses = ['APPROVED', 'CHECKED_OUT', 'CHECKED_IN', 'PENDING', 'APPROVED', 'REJECTED'];
  const gatePassBatch = [];
  for (let i = 1; i <= 20; i++) {
    const passNumber = `GP-SAMT-2026-${String(i).padStart(4, '0')}`;
    const s = allStudents[(i + 5) % allStudents.length];
    const status = gatePassStatuses[i % gatePassStatuses.length];
    const outTime = new Date(Date.now() - (i % 3) * 3600000);
    const inTime = new Date(outTime.getTime() + 4 * 3600000);

    gatePassBatch.push({
      passNumber,
      studentId: s.id,
      type: i % 4 === 0 ? 'NIGHT_OUT' : 'DAY_OUTING',
      reason: 'Academic supplies and essential procurement from Master Canteen market',
      destination: 'Master Canteen, Bhubaneswar',
      outTimeExpected: outTime,
      inTimeExpected: inTime,
      status,
      qrCodeToken: `QR-${passNumber}-${Date.now() + i}`
    });
  }
  await prisma.gatePass.createMany({ data: gatePassBatch, skipDuplicates: true });

  const createdGatePasses = await prisma.gatePass.findMany({
    where: { passNumber: { in: gatePassBatch.map(g => g.passNumber) } },
    select: { id: true, status: true, outTimeExpected: true }
  });

  const gpApprovalBatch = [];
  const gpEventBatch = [];
  for (const gp of createdGatePasses) {
    if (['APPROVED', 'CHECKED_OUT', 'CHECKED_IN'].includes(gp.status)) {
      gpApprovalBatch.push({
        gatePassId: gp.id,
        wardenId: chiefWarden.id,
        decision: 'APPROVED',
        remarks: 'Authorized for planned outing within campus rules',
        decidedAt: new Date(gp.outTimeExpected.getTime() - 3600000)
      });
    }

    if (['CHECKED_OUT', 'CHECKED_IN'].includes(gp.status)) {
      gpEventBatch.push({
        gatePassId: gp.id,
        eventType: 'CHECK_OUT',
        securityStaffId: headSecurity.id,
        scannedAt: gp.outTimeExpected,
        isOverdue: false
      });
    }
    if (gp.status === 'CHECKED_IN') {
      gpEventBatch.push({
        gatePassId: gp.id,
        eventType: 'CHECK_IN',
        securityStaffId: headSecurity.id,
        scannedAt: new Date(gp.outTimeExpected.getTime() + 3.5 * 3600000),
        isOverdue: false
      });
    }
  }

  await prisma.gatePassApproval.createMany({ data: gpApprovalBatch, skipDuplicates: true });
  await prisma.gatePassEvent.createMany({ data: gpEventBatch, skipDuplicates: true });

  console.log('  ✓ 25 Leave Requests & 20 Gate Passes with QR security scan logs generated');

  // ==========================================================================
  // 12. CERTIFICATES & REQUESTS (5 Types, 18 Requests)
  // ==========================================================================
  console.log('\n[12/16] Seeding Certificates and Student Requests...');
  const certTypes = [
    { type: 'BONAFIDE', title: 'Bonafide Student Certificate', fee: 50.0 },
    { type: 'STUDY', title: 'Study & Medium of Instruction Certificate', fee: 100.0 },
    { type: 'CHARACTER', title: 'Student Conduct and Character Certificate', fee: 50.0 },
    { type: 'FEE_ESTIMATE', title: 'Institutional Fee Estimation Structure', fee: 0.0 },
    { type: 'NO_OBJECTION', title: 'No Objection Certificate (NOC) for Internship', fee: 100.0 }
  ];

  const certificates = {};
  for (const c of certTypes) {
    certificates[c.type] = await prisma.certificate.upsert({
      where: { type: c.type },
      update: { title: c.title, processingFee: c.fee },
      create: { type: c.type, title: c.title, processingFee: c.fee }
    });
  }

  const certStatuses = ['AVAILABLE', 'GENERATED', 'APPROVED', 'UNDER_REVIEW', 'REQUESTED', 'REJECTED'];
  const certRequestBatch = [];
  for (let i = 1; i <= 18; i++) {
    const reqNum = `REQ-CERT-SAMT-${String(i).padStart(4, '0')}`;
    const s = allStudents[i % allStudents.length];
    const cType = certTypes[i % certTypes.length].type;
    const status = certStatuses[i % certStatuses.length];

    certRequestBatch.push({
      requestNumber: reqNum,
      studentId: s.id,
      certificateId: certificates[cType].id,
      purpose: 'Official application for national internship and scholarship verification',
      status,
      reviewedById: ['APPROVED', 'GENERATED', 'AVAILABLE'].includes(status) ? adminStaff.id : null,
      documentUrl: ['GENERATED', 'AVAILABLE'].includes(status) ? `https://demo.samt.ac.in/certs/${reqNum}.pdf` : null,
      remarks: 'Documents verified with SAMT academic registry.'
    });
  }
  await prisma.certificateRequest.createMany({ data: certRequestBatch, skipDuplicates: true });
  console.log('  ✓ 5 Certificate categories ready with 18 student issuance workflows');

  // ==========================================================================
  // 13. FEE RECORDS & PAYMENTS (40 Fee Records, 25+ Payments)
  // ==========================================================================
  console.log('\n[13/16] Seeding Fee Records, Payments & Queries...');
  const feeBatch = [];
  for (let i = 0; i < Math.min(allStudents.length, 40); i++) {
    const s = allStudents[i];
    const tuition = 65000.0;
    const hostel = i < 20 ? 18000.0 : 0.0;
    const mess = i < 20 ? 15000.0 : 0.0;
    const other = 2500.0;
    const total = tuition + hostel + mess + other;

    let status = 'PAID';
    let dueAmount = 0.0;
    let dueDate = new Date(Date.now() + 30 * 86400000);

    if (i >= 36) {
      status = 'OVERDUE';
      dueAmount = total;
      dueDate = new Date(Date.now() - 15 * 86400000);
    } else if (i >= 30) {
      status = 'UNPAID';
      dueAmount = total;
      dueDate = new Date(Date.now() + 10 * 86400000);
    } else if (i >= 22) {
      status = 'PARTIALLY_PAID';
      dueAmount = 25000.0;
    }

    feeBatch.push({
      studentId: s.id,
      academicYear: '2026-2027',
      semester: 5,
      tuitionAmount: tuition,
      hostelAmount: hostel,
      messAmount: mess,
      otherAmount: other,
      totalAmount: total,
      dueAmount,
      status,
      dueDate
    });
  }
  await prisma.feeRecord.createMany({ data: feeBatch, skipDuplicates: true });

  const createdFeeRecords = await prisma.feeRecord.findMany({
    where: { academicYear: '2026-2027', semester: 5 },
    select: { id: true, status: true, totalAmount: true, dueAmount: true }
  });

  const paymentBatch = [];
  for (let i = 0; i < createdFeeRecords.length; i++) {
    const fr = createdFeeRecords[i];
    if (fr.status === 'PAID' || fr.status === 'PARTIALLY_PAID') {
      const paidAmt = fr.status === 'PAID' ? fr.totalAmount : fr.totalAmount - fr.dueAmount;
      paymentBatch.push({
        feeRecordId: fr.id,
        transactionRef: `TXN-SAMT-2026-${String(i + 1).padStart(5, '0')}`,
        amountPaid: paidAmt,
        paymentMode: i % 2 === 0 ? 'UPI' : 'NET_BANKING',
        paymentDate: new Date(Date.now() - (i % 10) * 86400000),
        verifiedById: chiefAccounts.id
      });
    }
  }
  await prisma.feePayment.createMany({ data: paymentBatch, skipDuplicates: true });

  const feeQueries = [
    { sub: 'Scholarship deduction in Semester 5 fee ledger', msg: 'My State merit scholarship deduction not reflected in tuition dues.' },
    { sub: 'Double transaction debit during online UPI payment', msg: 'Amount was deducted twice from bank account on transaction #9941.' },
    { sub: 'Mess fee adjustment for authorized vacation period', msg: 'Requesting 2-week mess fee rebate for approved industrial internship.' },
    { sub: 'Fee receipt duplicate download request', msg: 'Need signed stamped fee receipt for educational bank loan renewal.' },
    { sub: 'Hostel caution deposit query', msg: 'Clarification regarding room caution deposit rollover into final year.' },
    { sub: 'Installment payment request', msg: 'Requesting permission to pay remaining ₹15,000 balance in two installments.' }
  ];

  await prisma.feeQuery.createMany({
    data: feeQueries.map((q, idx) => ({
      studentId: allStudents[idx % allStudents.length].id,
      subject: q.sub,
      message: q.msg,
      status: idx % 2 === 0 ? 'RESOLVED' : 'OPEN',
      response: idx % 2 === 0 ? 'Resolved by Accounts Desk. Updated ledger viewable online.' : null
    })),
    skipDuplicates: true
  });
  console.log('  ✓ 40 Student fee ledgers seeded with online payment transactions and queries');

  // ==========================================================================
  // 14. MESS MENU & FEEDBACK (28 Menus, 45 Feedbacks)
  // ==========================================================================
  console.log('\n[14/16] Seeding Weekly Mess Menu & Student Feedback...');
  const mealTemplates = {
    BREAKFAST: [
      'Idli, Medu Vada, Coconut Chutney, Sambhar, Boiled Eggs / Banana, Tea & Milk',
      'Poha with Roasted Peanuts, Sev, Mint Chutney, Sprouts Salad, Coffee & Milk',
      'Aloo & Methi Paratha with Fresh Curd, Pickle, Boiled Eggs, Masala Chai',
      'Masala Dosa, Sambhar, Tomato Onion Chutney, Fresh Fruits, Tea & Milk',
      'Puri Bhaji with Chana Masala, Halwa, Boiled Eggs / Banana, Masala Chai',
      'Vegetable Upma with Roasted Cashews, Coconut Chutney, Milk & Tea',
      'Chole Bhature with Pickled Onions, Curd, Fresh Fruit Bowl, Sweet Lassi'
    ],
    LUNCH: [
      'Steamed Basmati Rice, Dal Tadka, Paneer Butter Masala, Mixed Veg, Curd, Salad',
      'Jeera Rice, Yellow Moong Dal, Egg Curry / Kadhai Paneer, Bhindi Fry, Boondi Raita',
      'Steamed Rice, Sambhar, Aloo Gobi Masala, Chicken Curry / Matar Paneer, Papad',
      'Peas Pulao, Dal Makhani, Shahi Paneer, Cabbage Poriyal, Mint Raita, Salad',
      'Steamed Rice, Chana Dal Fry, Fish Curry / Malai Kofta, Baingan Bhaja, Curd',
      'Vegetable Biryani with Mirchi Ka Salan, Onion Raita, Dal Tadka, Roasted Papad',
      'Special Sunday Feast: Mutton Biryani / Paneer Biryani, Raita, Gulab Jamun'
    ],
    SNACKS: [
      'Crispy Vegetable Samosa with Mint & Tamarind Chutney, Masala Chai',
      'Aloo Bonda / Bread Pakoda with Green Chutney, Filter Coffee',
      'Vegetable Sandwich with Cucumber, Tomato & Cheese, Sweet Lime Juice',
      'Pav Bhaji with Buttered Pav, Chopped Onions, Hot Masala Tea',
      'Pyaaz Kachori with Tangy Imli Chutney, Ginger Tea',
      'Corn & Cheese Cutlet with Tomato Ketchup, Hot Tea',
      'Special Sunday Evening: Samosa Chaat with Dahi & Sev, Masala Chai'
    ],
    DINNER: [
      'Hot Tawa Roti, Dal Fry, Seasonal Mixed Vegetable Sabzi, Rice, Kheer',
      'Butter Naan, Butter Chicken / Paneer Lababdar, Jeera Rice, Gulab Jamun',
      'Phulka Roti, Tadka Dal, Egg Bhurji / Aloo Dum, Steamed Rice, Custard',
      'Tandoori Roti, Dal Panchmel, Rajma Masala, Steamed Rice, Ice Cream',
      'Chapati, Chana Masala, Mushroom Matar, Ghee Rice, Rasgulla',
      'Laccha Paratha, Chicken Korma / Soya Chaap Masala, Pulao, Moong Dal Halwa',
      'Sunday Light Dinner: Pav Bhaji / Khichdi, Papad, Pickle, Fruit Salad'
    ]
  };

  const mealTypes = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
  const createdMenus = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const menuDate = new Date();
    menuDate.setHours(0, 0, 0, 0);
    menuDate.setDate(menuDate.getDate() + dayOffset - 2);

    for (const mType of mealTypes) {
      const items = mealTemplates[mType][dayOffset % 7];
      const menu = await prisma.messMenu.upsert({
        where: {
          date_mealType: { date: menuDate, mealType: mType }
        },
        update: { itemsDescription: items },
        create: {
          date: menuDate,
          mealType: mType,
          itemsDescription: items,
          isSpecialMeal: dayOffset % 7 === 6
        }
      });
      createdMenus.push(menu);
    }
  }

  const feedbackComments = [
    'Paneer Butter Masala was rich and tasty. Fresh hot rotis.',
    'Sambhar could use a little more tamarind and curry leaves.',
    'Puri Bhaji on Sunday morning was exceptionally well made!',
    'Cleanliness of dining tables was maintained throughout lunch.',
    'Food was served piping hot even towards the end of lunch hour.',
    'Vegetable Biryani flavor was authentic and aromatic.',
    'Dal Tadka consistency was good and not too oily.',
    'Snacks were served crisp and tea was refreshing.'
  ];

  const feedbackBatch = [];
  for (let i = 1; i <= 45; i++) {
    const s = allStudents[i % allStudents.length];
    const m = createdMenus[i % createdMenus.length];
    const rating = (i % 5) + 1;

    feedbackBatch.push({
      studentId: s.id,
      menuId: m.id,
      mealType: m.mealType,
      rating,
      foodQuality: Math.max(1, Math.min(5, rating + (i % 2 === 0 ? 0 : 1))),
      hygiene: 4,
      portion: 5,
      comments: feedbackComments[i % feedbackComments.length],
      createdAt: new Date(Date.now() - (i % 7) * 86400000)
    });
  }
  await prisma.messFeedback.createMany({ data: feedbackBatch, skipDuplicates: true });
  console.log('  ✓ 28 Mess menu periods & 45 Student feedback ratings saved');

  // ==========================================================================
  // 15. VISITORS & NOTICES (18 Visitors, 16 Campus Notices)
  // ==========================================================================
  console.log('\n[15/16] Seeding Visitors, Campus Notices & Targeted Engagement...');
  
  const visitorNames = [
    'Subash Chandra Panda', 'Minati Mohanty', 'Balaram Sahoo', 'Sujata Mishra',
    'Prasanta Kumar Dash', 'Geeta Rani Patra', 'Rabindra Nayak', 'Kiranbala Tripathy',
    'Deepak Kumar Samal', 'Mamata Rout', 'Bichitrananda Jena', 'Urmila Lenka',
    'Ashutosh Barik', 'Sabita Pradhan', 'Tushar Kanta Swain', 'Pushpalata Behera'
  ];

  const visitorBatch = [];
  for (let i = 1; i <= 18; i++) {
    const vName = visitorNames[i % visitorNames.length];
    const phone = `+91 94370 ${String(40000 + i).slice(-5)}`;
    visitorBatch.push({
      fullName: `${vName} #${i}`,
      phoneNumber: phone,
      idProofType: i % 2 === 0 ? 'AADHAAR' : 'VOTER_ID',
      idProofNumber: `SAMT-IDP-${String(1000 + i)}`
    });
  }
  await prisma.visitor.createMany({ data: visitorBatch, skipDuplicates: true });

  const createdVisitors = await prisma.visitor.findMany({ select: { id: true, phoneNumber: true } });
  const logBatch = [];
  for (let i = 0; i < createdVisitors.length; i++) {
    const v = createdVisitors[i];
    const s = allStudents[i % allStudents.length];
    const checkIn = new Date(Date.now() - (i % 4) * 3600000);
    const isOut = i % 3 !== 0;

    logBatch.push({
      visitorId: v.id,
      studentId: s.id,
      purpose: 'Parent monthly visit to provide study material and welfare check',
      vehicleNumber: `OD-02-BA-${String(1000 + i)}`,
      checkInTime: checkIn,
      checkOutTime: isOut ? new Date(checkIn.getTime() + 2 * 3600000) : null,
      securityStaffId: headSecurity.id
    });
  }
  await prisma.visitorLog.createMany({ data: logBatch, skipDuplicates: true });

  const noticeData = [
    { title: 'Mid-Semester Examination Schedule Autumn 2026', type: 'EXAMINATION', urgent: true, target: 'ALL', content: 'Autumn Mid-Sem examination will commence from 15th October 2026. Hall tickets available in student portal.' },
    { title: 'Campus Placement Drive: TCS Digital & Infosys SP', type: 'ACADEMIC', urgent: true, target: 'CSE', content: 'Final year B.Tech students are invited to register for upcoming recruitment drives before Friday 5 PM.' },
    { title: 'Annual Cultural & Technical Fest "SRUSTI-FEST 2026"', type: 'GENERAL', urgent: false, target: 'ALL', content: 'Submissions for robotics, coding, hackathons, and cultural performances are now open at student council desk.' },
    { title: 'Hostel Maintenance Inspection - Water System Sanitization', type: 'HOSTEL', urgent: false, target: 'ALL', content: 'Overhead tanks and water filtration units will undergo scheduled cleaning this Saturday 10 AM to 2 PM.' },
    { title: 'BPUT Hackathon 2026 - Innovation Challenge Guidelines', type: 'ACADEMIC', urgent: true, target: 'ALL', content: 'Teams shortlisted for the BPUT Hackathon prototype round are required to submit repository links by tomorrow.' },
    { title: 'Mess Menu Revision & Special Festival Dinner', type: 'HOSTEL', urgent: false, target: 'ALL', content: 'Special festive dinner arranged this Sunday on occasion of campus foundation day celebration.' },
    { title: 'Semester Tuition Fee Installment-2 Last Date', type: 'ACADEMIC', urgent: true, target: 'ALL', content: 'Students with outstanding second installment balances must clear dues before 20th October to avoid late fine.' },
    { title: 'Emergency Drill & Fire Safety Demonstration', type: 'EMERGENCY', urgent: true, target: 'ALL', content: 'Mandatory fire evacuation drill scheduled for all hostel wings this Thursday 4:30 PM.' },
    { title: 'Central Library Extended Night Hours for Exam Season', type: 'GENERAL', urgent: false, target: 'ALL', content: 'Central reading rooms will remain open until 2:00 AM with Wi-Fi and power backup facilities.' },
    { title: 'Notice regarding Gate Pass Curfew Timings', type: 'HOSTEL', urgent: false, target: 'ALL', content: 'Students returning on day outing gate passes must check in at security post before 8:30 PM.' },
    { title: 'Workshop on Edge AI & IoT Embedded Architecture', type: 'ACADEMIC', urgent: false, target: 'ECE', content: 'Hands-on practical workshop with ESP32 and Raspberry Pi kits at ECE Embedded Systems Laboratory.' },
    { title: 'Mechanical Engineering Society Industrial Plant Visit', type: 'ACADEMIC', urgent: false, target: 'ME', content: 'Field excursion to Paradeep Port heavy industrial complex scheduled for 3rd year ME students.' },
    { title: 'MBA Guest Lecture on Global Supply Chain Resilience', type: 'ACADEMIC', urgent: false, target: 'MBA', content: 'Distinguished lecture by VP of Operations on modern multimodal logistics and supply chain analytics.' },
    { title: 'Notice on Campus Anti-Ragging Policy & Helpline', type: 'GENERAL', urgent: false, target: 'ALL', content: 'Strict zero-tolerance policy against ragging. 24x7 toll-free internal security helpline: 1800-SAMT-OPS.' },
    { title: 'Blood Donation Camp by Red Cross Youth Wing', type: 'GENERAL', urgent: false, target: 'ALL', content: 'Annual voluntary blood donation drive at Main Auditorium in collaboration with Capital Hospital.' },
    { title: 'Notice on Wi-Fi Network Bandwidth Upgrade', type: 'GENERAL', urgent: false, target: 'ALL', content: 'Campus gigabit leased line upgrade successfully completed. Higher throughput available in hostel zones.' }
  ];

  for (const n of noticeData) {
    let notice = await prisma.notice.findFirst({ where: { title: n.title } });
    if (!notice) {
      notice = await prisma.notice.create({
        data: {
          title: n.title,
          content: n.content,
          type: n.type,
          authorId: adminStaff.id,
          isUrgent: n.urgent,
          targets: {
            create: [{ targetType: n.target }]
          }
        }
      });

      await prisma.noticeRead.upsert({
        where: {
          noticeId_userId: {
            noticeId: notice.id,
            userId: coreUsers.STUDENT.id
          }
        },
        update: {},
        create: {
          noticeId: notice.id,
          userId: coreUsers.STUDENT.id
        }
      });
    }
  }
  console.log('  ✓ 18 Visitor logs recorded and 16 Campus notices published');

  // ==========================================================================
  // 16. NOTIFICATIONS & DEMO KNOWLEDGE BASE (120+ Notifications, 8 FAQs)
  // ==========================================================================
  console.log('\n[16/16] Seeding System Notifications & DEMO KNOWLEDGE BASE...');
  
  const notificationTemplates = [
    { title: 'Gate Pass Approved', msg: 'Your day outing request to Master Canteen has been approved by Warden.', type: 'GATE_PASS' },
    { title: 'Complaint Ticket Assigned', msg: 'CMP-SAMT-101 has been assigned to maintenance technician.', type: 'COMPLAINT' },
    { title: 'Notice Published', msg: 'Mid-Semester examination schedule has been officially released.', type: 'NOTICE' },
    { title: 'Attendance Warning Alert', msg: 'Your attendance in CS504 Operating Systems has dropped below 75%.', type: 'ATTENDANCE' },
    { title: 'Fee Payment Verified', msg: 'Tuition installment verified with payment reference #TXN-SAMT-2026.', type: 'FEE' },
    { title: 'Certificate Ready for Download', msg: 'Your Bonafide Certificate request has been generated and signed.', type: 'CERTIFICATE' },
    { title: 'Visitor Arrived at Main Gate', msg: 'Your guardian has checked in at Security Post Gate 1.', type: 'VISITOR' },
    { title: 'Mess Menu Updated', msg: 'Special Sunday feast menu has been published for hostel mess.', type: 'MESS' }
  ];

  const notificationsToCreate = [];
  for (let i = 0; i < Math.min(allStudents.length, 30); i++) {
    const sUser = allStudents[i].userId;
    for (let j = 0; j < 3; j++) {
      const tmpl = notificationTemplates[(i * 3 + j) % notificationTemplates.length];
      notificationsToCreate.push({
        userId: sUser,
        title: tmpl.title,
        message: tmpl.msg,
        type: tmpl.type,
        isRead: j % 2 === 0
      });
    }
  }

  for (const staff of allStaff.slice(0, 10)) {
    notificationsToCreate.push({
      userId: staff.userId,
      title: 'Action Item Pending Authorization',
      message: 'New student gate pass and leave submissions require your review in command center.',
      type: 'APPROVAL',
      isRead: false
    });
  }

  await prisma.notification.createMany({
    data: notificationsToCreate,
    skipDuplicates: true
  });

  const kbDocs = [
    { title: 'How to Apply for Day Outing and Night Out Gate Pass', cat: 'GATE_PASS', content: 'Students can request gate passes through the CAMPUS OS portal. Day outing requests are approved automatically or reviewed by the floor warden. Night out requests require guardian phone verification.' },
    { title: 'Hostel Maintenance Complaints and SLA Guidelines', cat: 'MAINTENANCE', content: 'Emergency complaints (water supply, electrical shock risks) carry a 4-hour SLA. Standard complaints (plumbing leaks, furniture repair) have a 24-48 hour resolution window.' },
    { title: 'Academic Leave Policy and Approval Matrix', cat: 'LEAVE', content: 'Leaves exceeding 3 days must be submitted at least 48 hours prior with supporting documents. Final approval rests with the Department HOD and Hostel Warden.' },
    { title: 'Bonafide and Character Certificate Issuance Procedure', cat: 'CERTIFICATES', content: 'Digital certificates are generated with verifiable QR hashes within 2 business days. Physical stamped copies can be collected from Administrative Block Room 102.' },
    { title: 'Semester Fee Payment Methods and Verification', cat: 'FEES', content: 'Tuition and hostel fees can be paid via integrated UPI, Net Banking, or RTGS/NEFT. Transactions are auto-reconciled with the accounts ledger within 15 minutes.' },
    { title: 'Mess Timings, Menu Rules, and Feedback Submission', cat: 'MESS', content: 'Breakfast: 07:30 - 09:15 AM | Lunch: 12:30 - 02:15 PM | Snacks: 05:00 - 06:15 PM | Dinner: 07:45 - 09:30 PM. Weekly ratings determine catering performance metrics.' },
    { title: 'Campus Visitor Entry and Guest Pass Protocol', cat: 'SECURITY', content: 'All visitors must present valid government photo ID at Security Gate 1. Visiting hours in hostel common parlors are 04:00 PM to 07:00 PM on weekdays and 10:00 AM to 07:00 PM on Sundays.' },
    { title: 'Srusti Academy Campus Operations - Emergency Contacts & Help Desk', cat: 'EMERGENCY', content: 'Chief Security Officer: 1800-SAMT-OPS | Campus Medical Health Center: Ext. 108 | Warden Help Desk: Ext. 201 | IT Network Support: Ext. 404.' }
  ];

  await prisma.knowledgeDocument.createMany({
    data: kbDocs.map(d => ({
      title: d.title,
      category: d.cat,
      content: `[DEMO KNOWLEDGE BASE] ${d.content}`
    })),
    skipDuplicates: true
  });
  console.log(`  ✓ ${notificationsToCreate.length} Notifications & 8 DEMO KNOWLEDGE BASE articles saved`);

  await prisma.auditLog.create({
    data: {
      userId: coreUsers.ADMIN.id,
      action: 'UNIFIX_CAMPUS_SEED_COMPLETE',
      entity: 'DATABASE',
      entityId: 'UNIFIX_TECH_NEON_PG',
      payload: JSON.stringify({
        institution: 'UNIFIX TECH',
        city: 'Bhubaneswar',
        state: 'Odisha',
        elapsedMs: Date.now() - startTime,
        status: 'SUCCESS'
      })
    }
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n================================================================');
  console.log(`  >>> UNIFIX TECH DEMO DATASET SEEDED IN ${durationSec}s! <<<`);
  console.log('================================================================\n');
}

main()
  .catch((e) => {
    console.error('\n[Seed Critical Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
      if (pool) await pool.end();
    } catch (e) {}
    process.exit(0);
  });

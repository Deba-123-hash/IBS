import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed for Campus Life, Debugged...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Departments
  console.log('[Seed] Creating academic departments...');
  const deptCSE = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: { name: 'Computer Science & Engineering', code: 'CSE' }
  });

  const deptECE = await prisma.department.upsert({
    where: { code: 'ECE' },
    update: {},
    create: { name: 'Electronics & Communication Engineering', code: 'ECE' }
  });

  const deptME = await prisma.department.upsert({
    where: { code: 'ME' },
    update: {},
    create: { name: 'Mechanical Engineering', code: 'ME' }
  });

  // 2. Programs & Batches
  const progBTechCSE = await prisma.program.create({
    data: {
      name: 'B.Tech Computer Science & Engineering',
      degree: 'B.Tech',
      departmentId: deptCSE.id
    }
  });

  const batch2023 = await prisma.batch.create({
    data: {
      name: '2023-2027 CSE-A',
      academicYear: '2026-2027',
      currentSemester: 5,
      programId: progBTechCSE.id
    }
  });

  // 3. Demo Users
  console.log('[Seed] Creating demo user accounts...');
  
  // Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@campus.demo' },
    update: {},
    create: {
      email: 'student@campus.demo',
      password: passwordHash,
      role: 'STUDENT',
      firstName: 'Aarav',
      lastName: 'Sharma',
      phoneNumber: '+91 98765 43210'
    }
  });

  const studentProfile = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      rollNumber: 'CS2023048',
      registrationNumber: 'REG-2023-9941',
      batchId: batch2023.id,
      emergencyContact: '+91 98765 43210',
      bloodGroup: 'B+',
      guardianName: 'Suresh Sharma',
      guardianPhone: '+91 94370 12345'
    }
  });

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@campus.demo' },
    update: {},
    create: {
      email: 'admin@campus.demo',
      password: passwordHash,
      role: 'ADMIN',
      firstName: 'Rajesh',
      lastName: 'Verma',
      phoneNumber: '+91 98000 11111'
    }
  });

  await prisma.staff.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      employeeCode: 'EMP-ADM-001',
      designation: 'Campus Dean',
      departmentId: deptCSE.id
    }
  });

  // Super Admin
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@campus.demo' },
    update: {},
    create: {
      email: 'superadmin@campus.demo',
      password: passwordHash,
      role: 'SUPER_ADMIN',
      firstName: 'Dr. Anand',
      lastName: 'Choudhury',
      phoneNumber: '+91 98000 00001'
    }
  });

  await prisma.staff.upsert({
    where: { userId: superAdminUser.id },
    update: {},
    create: {
      userId: superAdminUser.id,
      employeeCode: 'EMP-SPADM-001',
      designation: 'Director General',
      departmentId: null
    }
  });

  // Warden
  const wardenUser = await prisma.user.upsert({
    where: { email: 'warden@campus.demo' },
    update: {},
    create: {
      email: 'warden@campus.demo',
      password: passwordHash,
      role: 'WARDEN',
      firstName: 'Suresh',
      lastName: 'Patel',
      phoneNumber: '+91 98000 22222'
    }
  });

  const wardenStaff = await prisma.staff.upsert({
    where: { userId: wardenUser.id },
    update: {},
    create: {
      userId: wardenUser.id,
      employeeCode: 'EMP-WAR-001',
      designation: 'Chief Warden',
      departmentId: null
    }
  });

  // Faculty
  const facultyUser = await prisma.user.upsert({
    where: { email: 'faculty@campus.demo' },
    update: {},
    create: {
      email: 'faculty@campus.demo',
      password: passwordHash,
      role: 'FACULTY',
      firstName: 'Dr. Priya',
      lastName: 'Nair',
      phoneNumber: '+91 98000 33333'
    }
  });

  await prisma.staff.upsert({
    where: { userId: facultyUser.id },
    update: {},
    create: {
      userId: facultyUser.id,
      employeeCode: 'EMP-FAC-001',
      designation: 'Associate Professor',
      departmentId: deptCSE.id
    }
  });

  // Maintenance
  const maintUser = await prisma.user.upsert({
    where: { email: 'maintenance@campus.demo' },
    update: {},
    create: {
      email: 'maintenance@campus.demo',
      password: passwordHash,
      role: 'MAINTENANCE',
      firstName: 'Ramesh',
      lastName: 'Kumar',
      phoneNumber: '+91 98000 44444'
    }
  });

  await prisma.staff.upsert({
    where: { userId: maintUser.id },
    update: {},
    create: {
      userId: maintUser.id,
      employeeCode: 'EMP-MNT-001',
      designation: 'Maintenance Lead',
      trade: 'PLUMBING'
    }
  });

  // Security
  const secUser = await prisma.user.upsert({
    where: { email: 'security@campus.demo' },
    update: {},
    create: {
      email: 'security@campus.demo',
      password: passwordHash,
      role: 'SECURITY',
      firstName: 'Devendra',
      lastName: 'Singh',
      phoneNumber: '+91 98000 55555'
    }
  });

  await prisma.staff.upsert({
    where: { userId: secUser.id },
    update: {},
    create: {
      userId: secUser.id,
      employeeCode: 'EMP-SEC-001',
      designation: 'Head Security Gate 1'
    }
  });

  // Accounts
  const accUser = await prisma.user.upsert({
    where: { email: 'accounts@campus.demo' },
    update: {},
    create: {
      email: 'accounts@campus.demo',
      password: passwordHash,
      role: 'ACCOUNTS',
      firstName: 'Meena',
      lastName: 'Iyer',
      phoneNumber: '+91 98000 66666'
    }
  });

  await prisma.staff.upsert({
    where: { userId: accUser.id },
    update: {},
    create: {
      userId: accUser.id,
      employeeCode: 'EMP-ACC-001',
      designation: 'Accounts Officer'
    }
  });

  // 4. Hostels, Blocks & Rooms
  console.log('[Seed] Creating Hostels, Blocks, and Rooms...');
  const hostel = await prisma.hostel.create({
    data: {
      name: 'Aryabhatta Hall of Residence',
      gender: 'MALE',
      wardenId: wardenStaff.id
    }
  });

  const blockB = await prisma.hostelBlock.create({
    data: {
      hostelId: hostel.id,
      name: 'Block B',
      floorsCount: 4
    }
  });

  const room304 = await prisma.room.create({
    data: {
      blockId: blockB.id,
      roomNumber: '304',
      floorNumber: 3,
      capacity: 2,
      currentOccupancy: 2
    }
  });

  await prisma.roomAllocation.create({
    data: {
      roomId: room304.id,
      studentId: studentProfile.id,
      isActive: true
    }
  });

  // 5. Complaint Categories
  console.log('[Seed] Setting up complaint categories...');
  const catPlumbing = await prisma.complaintCategory.create({
    data: { name: 'Plumbing', code: 'PLUMBING' }
  });
  await prisma.complaintCategory.create({ data: { name: 'Electrical', code: 'ELECTRICAL' } });
  await prisma.complaintCategory.create({ data: { name: 'Internet / Wi-Fi', code: 'INTERNET' } });
  await prisma.complaintCategory.create({ data: { name: 'Cleaning & Janitorial', code: 'CLEANING' } });
  await prisma.complaintCategory.create({ data: { name: 'Furniture / Carpentry', code: 'FURNITURE' } });

  // 6. Demo Complaint
  await prisma.complaint.create({
    data: {
      ticketNumber: 'CMP-2026-0042',
      studentId: studentProfile.id,
      title: 'Bathroom water pipe leakage',
      description: 'Pipe under sink broke and water is leaking onto floor',
      categoryId: catPlumbing.id,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      roomId: room304.id,
      slaDeadline: new Date(Date.now() + 24 * 3600000)
    }
  });

  console.log('[Seed] Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

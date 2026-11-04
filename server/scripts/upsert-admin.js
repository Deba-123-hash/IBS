import bcrypt from 'bcryptjs';
import prisma from '../src/config/database.js';

async function main() {
  if (!prisma) {
    console.error('DATABASE_CONNECTION_FAIL: Prisma client is null.');
    process.exit(1);
  }

  const email = process.env.DEMO_ADMIN_EMAIL || 'sahoodebatosh782@gmail';
  const rawPassword = process.env.DEMO_ADMIN_PASSWORD || 'Deba@2004';
  const normalizedEmail = email.toLowerCase().trim();

  console.log(`[Admin Setup] Processing admin account: ${normalizedEmail}`);

  // Securely hash password using existing bcrypt configuration (salt rounds 10)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  let user;
  if (existingUser) {
    console.log('[Admin Setup] Existing user located. Updating credentials and ensuring ADMIN role.');
    user = await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        firstName: existingUser.firstName || 'Debatosh',
        lastName: existingUser.lastName || 'Sahoo'
      }
    });
  } else {
    console.log('[Admin Setup] Creating new ADMIN account in Neon database.');
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        role: 'ADMIN',
        firstName: 'Debatosh',
        lastName: 'Sahoo',
        phoneNumber: '+91 94370 00782',
        isActive: true
      }
    });
  }

  // Ensure linked staff profile for administrative operations
  const staff = await prisma.staff.upsert({
    where: { userId: user.id },
    update: {
      designation: 'Campus Operations Administrator (Demo)'
    },
    create: {
      userId: user.id,
      employeeCode: 'ADM-DEBA-001',
      designation: 'Campus Operations Administrator (Demo)'
    }
  });

  // Verify the database record
  const verifiedUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { staffProfile: true }
  });

  const isHashSecure = verifiedUser.password.startsWith('$2a$') || verifiedUser.password.startsWith('$2b$');
  const passwordMatch = await bcrypt.compare(rawPassword, verifiedUser.password);

  console.log('\n========================================');
  console.log('ADMIN ACCOUNT DATABASE VERIFICATION');
  console.log('========================================');
  console.log('User Exists:', !!verifiedUser ? 'PASS' : 'FAIL');
  console.log('Email Match:', verifiedUser.email === normalizedEmail ? 'PASS' : 'FAIL');
  console.log('Role is ADMIN:', verifiedUser.role === 'ADMIN' ? 'PASS' : 'FAIL');
  console.log('Account is Active:', verifiedUser.isActive === true ? 'PASS' : 'FAIL');
  console.log('Password Is Hashed (not plaintext):', isHashSecure ? 'PASS' : 'FAIL');
  console.log('Password Hash Verified with Bcrypt:', passwordMatch ? 'PASS' : 'FAIL');
  console.log('Linked Staff Profile:', !!verifiedUser.staffProfile ? 'PASS' : 'FAIL');
  console.log('========================================\n');

  if (verifiedUser && verifiedUser.role === 'ADMIN' && isHashSecure && passwordMatch) {
    console.log('SUCCESS: Admin account established securely in Neon PostgreSQL.');
    process.exit(0);
  } else {
    console.error('FAILURE: Admin verification failed checks.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[Admin Setup Error]:', err.message);
  process.exit(1);
});

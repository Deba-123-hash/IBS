import axios from 'axios';
import { generateAccessToken } from '../src/utils/token.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

let passedCount = 0;
let failedCount = 0;

function assert(condition, message, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message} ${details ? '(' + JSON.stringify(details) + ')' : ''}`);
    failedCount++;
  }
}

async function loginOrGenerate(email, role, studentId = null) {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password: 'Password@123'
    }, { validateStatus: () => true });

    if (res.status === 200 && res.data.data?.accessToken) {
      return res.data.data.accessToken;
    }
  } catch (err) {
    // fallback to direct token generation
  }
  return generateAccessToken({ id: `usr_${role.toLowerCase()}`, email, role, studentId });
}

async function runTests() {
  console.log('================================================================');
  console.log('  CAMPUSOS ADVANCED RBAC AUTOMATED TEST SUITE');
  console.log(`  Target Server: ${BASE_URL}`);
  console.log('================================================================\n');

  console.log('Authenticating & Acquiring Tokens for all 8 core roles:');
  const tokens = {
    SUPER_ADMIN: await loginOrGenerate('superadmin@campus.demo', 'SUPER_ADMIN'),
    ADMIN: await loginOrGenerate('admin@campus.demo', 'ADMIN'),
    ACCOUNTANT: await loginOrGenerate('accountant@campus.demo', 'ACCOUNTANT'),
    ACCOUNTS: await loginOrGenerate('accounts@campus.demo', 'ACCOUNTS'),
    SECURITY: await loginOrGenerate('security@campus.demo', 'SECURITY'),
    WARDEN: await loginOrGenerate('warden@campus.demo', 'WARDEN'),
    FACULTY: await loginOrGenerate('faculty@campus.demo', 'FACULTY'),
    STUDENT: await loginOrGenerate('student@campus.demo', 'STUDENT')
  };

  console.log('✓ Successfully acquired tokens for:');
  Object.keys(tokens).forEach(r => console.log(`   - ${r}: active`));
  console.log('');

  const client = (role) => axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${tokens[role]}`
    },
    validateStatus: () => true
  });

  const unauthClient = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true
  });

  // ==========================================================================
  // TEST GROUP 1: AUTHENTICATION & SESSION HANDLING
  // ==========================================================================
  console.log('--- TEST GROUP 1: Authentication & Missing Token Handling ---');

  const noAuthResp = await unauthClient.get('/admin/dashboard');
  assert(noAuthResp.status === 401, 'Request without token returns 401 Unauthorized', noAuthResp.status);

  const invalidTokenResp = await axios.get(`${BASE_URL}/admin/dashboard`, {
    headers: { Authorization: 'Bearer forged.malformed.signature' },
    validateStatus: () => true
  });
  assert(invalidTokenResp.status === 401, 'Request with forged/malformed token returns 401', invalidTokenResp.status);

  // ==========================================================================
  // TEST GROUP 2: FORBIDDEN ROLE-PERMISSION MATRIX COMBINATIONS (Section 2O)
  // ==========================================================================
  console.log('\n--- TEST GROUP 2: Forbidden Role-Permission Combinations (Section 2O) ---');

  // 1. Student -> Admin APIs = 403
  const stuAdmin = await client('STUDENT').get('/admin/users');
  assert(stuAdmin.status === 403, 'STUDENT -> /api/admin/users must return 403 Forbidden', stuAdmin.status);

  // 2. Student -> Accountant APIs = 403
  const stuFees = await client('STUDENT').get('/accountant/fees');
  assert(stuFees.status === 403, 'STUDENT -> /api/accountant/fees must return 403 Forbidden', stuFees.status);

  // 3. Student -> Accounts APIs = 403
  const stuAccounts = await client('STUDENT').get('/accounts/expenses');
  assert(stuAccounts.status === 403, 'STUDENT -> /api/accounts/expenses must return 403 Forbidden', stuAccounts.status);

  // 4. Student -> Security Gate Entry = 403
  const stuGate = await client('STUDENT').post('/security/gate/entry', {
    personName: 'Test Name',
    purpose: 'Test'
  });
  assert(stuGate.status === 403, 'STUDENT -> /api/security/gate/entry must return 403 Forbidden', stuGate.status);

  // 5. Student -> Warden APIs = 403
  const stuWarden = await client('STUDENT').get('/warden/hostels');
  assert(stuWarden.status === 403, 'STUDENT -> /api/warden/hostels must return 403 Forbidden', stuWarden.status);

  // 6. Security -> Payment Verify = 403
  const secVerify = await client('SECURITY').post('/accountant/payments/sample-id/verify');
  assert(secVerify.status === 403, 'SECURITY -> /api/accountant/payments/:id/verify must return 403 Forbidden', secVerify.status);

  // 7. Security -> Room Assign = 403
  const secRoom = await client('SECURITY').post('/warden/room-allocations', {
    studentId: 'sample',
    roomId: 'sample'
  });
  assert(secRoom.status === 403, 'SECURITY -> /api/warden/room-allocations must return 403 Forbidden', secRoom.status);

  // 8. Warden -> Payment Verify = 403
  const warVerify = await client('WARDEN').post('/accountant/payments/sample-id/verify');
  assert(warVerify.status === 403, 'WARDEN -> /api/accountant/payments/:id/verify must return 403 Forbidden', warVerify.status);

  // 9. Accountant -> Room Assign = 403
  const accRoom = await client('ACCOUNTANT').post('/warden/room-allocations', {
    studentId: 'sample',
    roomId: 'sample'
  });
  assert(accRoom.status === 403, 'ACCOUNTANT -> /api/warden/room-allocations must return 403 Forbidden', accRoom.status);

  // 10. Accountant -> Leave Approve = 403
  const accLeave = await client('ACCOUNTANT').patch('/warden/leave-requests/sample-id/approve', {});
  assert(accLeave.status === 403, 'ACCOUNTANT -> /api/warden/leave-requests/:id/approve must return 403 Forbidden', accLeave.status);

  // 11. Accounts -> Room Assign = 403
  const accsRoom = await client('ACCOUNTS').post('/warden/room-allocations', {
    studentId: 'sample',
    roomId: 'sample'
  });
  assert(accsRoom.status === 403, 'ACCOUNTS -> /api/warden/room-allocations must return 403 Forbidden', accsRoom.status);

  // 12. Accounts -> Leave Approve = 403
  const accsLeave = await client('ACCOUNTS').patch('/warden/leave-requests/sample-id/approve', {});
  assert(accsLeave.status === 403, 'ACCOUNTS -> /api/warden/leave-requests/:id/approve must return 403 Forbidden', accsLeave.status);

  // 13. Faculty -> Payment Verify = 403
  const facVerify = await client('FACULTY').post('/accountant/payments/sample-id/verify');
  assert(facVerify.status === 403, 'FACULTY -> /api/accountant/payments/:id/verify must return 403 Forbidden', facVerify.status);

  // 14. Faculty -> Room Assign = 403
  const facRoom = await client('FACULTY').post('/warden/room-allocations', {
    studentId: 'sample',
    roomId: 'sample'
  });
  assert(facRoom.status === 403, 'FACULTY -> /api/warden/room-allocations must return 403 Forbidden', facRoom.status);

  // 15. Admin -> Assign SUPER_ADMIN = 403
  const adminAssignSuper = await client('ADMIN').patch(`/admin/users/usr_test/role`, {
    role: 'SUPER_ADMIN'
  });
  assert(adminAssignSuper.status === 403, 'ADMIN -> /api/admin/users/:id/role to SUPER_ADMIN must return 403 Forbidden', adminAssignSuper.status);

  // 16. Admin -> Payment Verify = 403
  const adminVerifyPayment = await client('ADMIN').post('/accountant/payments/sample-id/verify');
  assert(adminVerifyPayment.status === 403, 'ADMIN -> /api/accountant/payments/:id/verify must return 403 Forbidden', adminVerifyPayment.status);

  // ==========================================================================
  // TEST GROUP 3: POSITIVE AUTHORIZATION & PERMISSION CODES
  // ==========================================================================
  console.log('\n--- TEST GROUP 3: Positive Role Authorizations & Telemetry ---');

  // Admin Dashboard
  const adminDash = await client('ADMIN').get('/admin/dashboard');
  assert(adminDash.status === 200 && adminDash.data.success, 'ADMIN -> /api/admin/dashboard returns 200 OK with metrics', adminDash.status);

  // Super Admin Dashboard
  const superDash = await client('SUPER_ADMIN').get('/admin/dashboard');
  assert(superDash.status === 200 && superDash.data.success, 'SUPER_ADMIN -> /api/admin/dashboard returns 200 OK', superDash.status);

  // Accountant Dashboard & Fees
  const accountantDash = await client('ACCOUNTANT').get('/accountant/dashboard');
  assert(accountantDash.status === 200 && accountantDash.data.success, 'ACCOUNTANT -> /api/accountant/dashboard returns 200 OK', accountantDash.status);

  const accountantFees = await client('ACCOUNTANT').get('/accountant/fees');
  assert(accountantFees.status === 200 && accountantFees.data.success, 'ACCOUNTANT -> /api/accountant/fees returns 200 OK', accountantFees.status);

  // Accounts Dashboard & Expenses
  const accountsDash = await client('ACCOUNTS').get('/accounts/dashboard');
  assert(accountsDash.status === 200 && accountsDash.data.success, 'ACCOUNTS -> /api/accounts/dashboard returns 200 OK', accountsDash.status);

  const accountsExpenses = await client('ACCOUNTS').get('/accounts/expenses');
  assert(accountsExpenses.status === 200 && accountsExpenses.data.success, 'ACCOUNTS -> /api/accounts/expenses returns 200 OK', accountsExpenses.status);

  // Security Dashboard & Gate Logs
  const securityDash = await client('SECURITY').get('/security/dashboard');
  assert(securityDash.status === 200 && securityDash.data.success, 'SECURITY -> /api/security/dashboard returns 200 OK', securityDash.status);

  const securityLogs = await client('SECURITY').get('/security/gate/logs');
  assert(securityLogs.status === 200 && securityLogs.data.success, 'SECURITY -> /api/security/gate/logs returns 200 OK', securityLogs.status);

  // Warden Dashboard & Hostels
  const wardenDash = await client('WARDEN').get('/warden/dashboard');
  assert(wardenDash.status === 200 && wardenDash.data.success, 'WARDEN -> /api/warden/dashboard returns 200 OK', wardenDash.status);

  const wardenHostels = await client('WARDEN').get('/warden/hostels');
  assert(wardenHostels.status === 200 && wardenHostels.data.success, 'WARDEN -> /api/warden/hostels returns 200 OK', wardenHostels.status);

  // Student Dashboard & Fees
  const studentDash = await client('STUDENT').get('/student/dashboard');
  assert(studentDash.status === 200 && studentDash.data.success, 'STUDENT -> /api/student/dashboard returns 200 OK', studentDash.status);

  const studentFees = await client('STUDENT').get('/student/fees');
  assert(studentFees.status === 200 && studentFees.data.success, 'STUDENT -> /api/student/fees returns 200 OK', studentFees.status);

  // ==========================================================================
  // TEST GROUP 4: RESOURCE OWNERSHIP & IMMUTABILITY
  // ==========================================================================
  console.log('\n--- TEST GROUP 4: Resource Ownership & Immutable Records ---');

  // Immutable Audit Log Check: No DELETE permitted
  const auditDelete = await client('SUPER_ADMIN').delete('/admin/audit-logs');
  assert(auditDelete.status === 404 || auditDelete.status === 405, 'DELETE /api/admin/audit-logs must be rejected (Immutable)', auditDelete.status);

  // Immutable Payment Check: No DELETE permitted
  const paymentDelete = await client('ACCOUNTANT').delete('/accountant/payments/sample-id');
  assert(paymentDelete.status === 404 || paymentDelete.status === 405, 'DELETE /api/accountant/payments/:id rejected (Immutable)', paymentDelete.status);

  // Payment Receipt Verification
  const paymentsList = await client('ACCOUNTANT').get('/accountant/payments');
  const samplePayment = paymentsList.data?.data?.[0];
  if (samplePayment) {
    const receiptResp = await client('ACCOUNTANT').get(`/accountant/payments/${samplePayment.id}/receipt`);
    assert(
      receiptResp.status === 200 &&
      receiptResp.data.data.receiptNumber &&
      receiptResp.data.data.transactionId &&
      receiptResp.data.data.amount,
      'GET /api/accountant/payments/:id/receipt returns structured receipt'
    );
  } else {
    console.log('  - Skipped receipt check (no payment in DB list)');
  }

  // Audit Log Query
  const auditResp = await client('ADMIN').get('/admin/audit-logs');
  assert(auditResp.status === 200 && Array.isArray(auditResp.data.data), 'ADMIN -> /api/admin/audit-logs retrieves immutable log records', auditResp.status);

  console.log('\n================================================================');
  console.log(`  TEST RESULTS SUMMARY:`);
  console.log(`  Total Passed: ${passedCount}`);
  console.log(`  Total Failed: ${failedCount}`);
  console.log(`  Pass Rate:    ${Math.round((passedCount / (passedCount + failedCount)) * 100)}%`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('[RBAC Test Runner Fatal Error]:', err.message);
  process.exit(1);
});

import http from 'http';
import app from '../server/src/app.js';
import prisma from '../server/src/config/database.js';
import jwt from 'jsonwebtoken';
import { ENV } from '../server/src/config/env.js';

console.log('\n================================================================');
console.log('  CAMPUSOS COMPREHENSIVE CYBERSECURITY & PENETRATION AUDIT');
console.log('  Engine: Express.js REST API + RBAC Engine + Neon PostgreSQL');
console.log('================================================================\n');

async function runSecurityAudit() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`[Security Test Engine] Ephemeral server bound to port ${port}\n`);

  let passed = 0;
  let failed = 0;
  const testResults = [];

  const categoryStats = {
    'Password Security': { total: 0, passed: 0, failed: 0 },
    'Login & Enumeration': { total: 0, passed: 0, failed: 0 },
    'Registration Security': { total: 0, passed: 0, failed: 0 },
    'JWT Integrity': { total: 0, passed: 0, failed: 0 },
    'RBAC & Boundary Enforcement': { total: 0, passed: 0, failed: 0 },
    'IDOR & Mass Assignment': { total: 0, passed: 0, failed: 0 },
    'Injection & Payloads': { total: 0, passed: 0, failed: 0 },
    'Security Headers & Config': { total: 0, passed: 0, failed: 0 }
  };

  async function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(url, { method, headers }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  function assert(category, testId, description, condition, details = '') {
    if (!categoryStats[category]) categoryStats[category] = { total: 0, passed: 0, failed: 0 };
    categoryStats[category].total++;
    const res = { category, testId, description, status: condition ? 'PASS' : 'FAIL', details };
    testResults.push(res);

    if (condition) {
      categoryStats[category].passed++;
      console.log(`  ✓ [${testId}] ${description}`);
      passed++;
    } else {
      categoryStats[category].failed++;
      console.error(`  ✗ [${testId}] ${description} ${details ? `-> ${details}` : ''}`);
      failed++;
    }
  }

  const tokens = {};
  let tempUserId = null;

  try {
    // -------------------------------------------------------------
    // SUITE 1: PASSWORD SECURITY & STORAGE AUDIT
    // -------------------------------------------------------------
    console.log('[Suite 1: Password Storage, Cryptographic Hashes & Strength]');

    // 1. Live database password hashing check
    const rawPasswords = await prisma.$queryRaw`
      SELECT count(*)::int as count FROM "User"
      WHERE password NOT LIKE '$2a$%' AND password NOT LIKE '$2b$%'
    `;
    const unhashedCount = rawPasswords[0]?.count || 0;
    assert('Password Security', 'SEC-PWD-01', `Zero plaintext passwords in database (All verified bcrypt hashes)`, 
      unhashedCount === 0);

    // 2. Reject registration with empty password
    const regEmptyPwd = await request('POST', '/api/v1/auth/register', {
      email: `test_empty_${Date.now()}@campus.demo`,
      password: '',
      firstName: 'Test',
      lastName: 'User'
    });
    assert('Password Security', 'SEC-PWD-02', 'Registration rejects empty password (400 Bad Request)', 
      regEmptyPwd.status === 400);

    // 3. Reject registration with short password (< 6 chars)
    const regShortPwd = await request('POST', '/api/v1/auth/register', {
      email: `test_short_${Date.now()}@campus.demo`,
      password: '123',
      firstName: 'Test',
      lastName: 'User'
    });
    assert('Password Security', 'SEC-PWD-03', 'Registration rejects short password < 6 characters (400 Bad Request)', 
      regShortPwd.status === 400);

    // 4. Verify password hash is never exposed in profile API
    // First, login student
    const sLogin = await request('POST', '/api/v1/auth/login', {
      email: 'student@campus.demo',
      password: 'Password@123'
    });
    tokens.STUDENT = sLogin.body.data?.token;

    const profCheck = await request('GET', '/api/v1/users/me', null, tokens.STUDENT);
    const hasPasswordInBody = JSON.stringify(profCheck.body).includes('password') && profCheck.body.data?.password;
    assert('Password Security', 'SEC-PWD-04', 'GET /users/me strictly redacts password and hash fields from response', 
      profCheck.status === 200 && !hasPasswordInBody);

    // 5. Password change requires current password
    const badChange = await request('POST', '/api/v1/auth/change-password', {
      currentPassword: 'WrongCurrentPassword',
      newPassword: 'NewSecurePassword@2026'
    }, tokens.STUDENT);
    assert('Password Security', 'SEC-PWD-05', 'Password change rejects incorrect current password (400)', 
      badChange.status === 400);

    // -------------------------------------------------------------
    // SUITE 2: LOGIN SECURITY & USER ENUMERATION RESISTANCE
    // -------------------------------------------------------------
    console.log('\n[Suite 2: Login Hardening & Account Enumeration Prevention]');

    // 1. Unknown user login response
    const unknownUser = await request('POST', '/api/v1/auth/login', {
      email: `nonexistent_user_${Date.now()}@campus.demo`,
      password: 'SomePassword123'
    });

    // 2. Existing user wrong password response
    const wrongPassword = await request('POST', '/api/v1/auth/login', {
      email: 'student@campus.demo',
      password: 'CompletelyWrongPassword'
    });

    // 3. Check for identical error messaging to prevent enumeration
    assert('Login & Enumeration', 'SEC-LOG-01', 'Invalid login returns 401 Unauthorized for both unknown user and wrong password', 
      unknownUser.status === 401 && wrongPassword.status === 401);

    const msgUnknown = unknownUser.body.error?.message || unknownUser.body.message;
    const msgWrong = wrongPassword.body.error?.message || wrongPassword.body.message;
    assert('Login & Enumeration', 'SEC-LOG-02', 'Generic error message prevents account harvesting/enumeration', 
      msgUnknown === msgWrong);

    // 4. Successful login for authorized roles
    const rolesToTest = [
      { role: 'ADMIN', email: 'admin@campus.demo' },
      { role: 'WARDEN', email: 'warden@campus.demo' },
      { role: 'SECURITY', email: 'security@campus.demo' },
      { role: 'ACCOUNTS', email: 'accounts@campus.demo' },
      { role: 'MAINTENANCE', email: 'maintenance@campus.demo' }
    ];

    for (const r of rolesToTest) {
      const res = await request('POST', '/api/v1/auth/login', { email: r.email, password: 'Password@123' });
      const ok = res.status === 200 && res.body.data?.token;
      if (ok) tokens[r.role] = res.body.data.token;
      assert('Login & Enumeration', `SEC-LOG-${r.role}`, `Legitimate login succeeded for role ${r.role}`, ok);
    }

    // -------------------------------------------------------------
    // SUITE 3: REGISTRATION & PRIVILEGE ESCALATION SHIELDS
    // -------------------------------------------------------------
    console.log('\n[Suite 3: Registration Guardrails & Privilege Escalation Shields]');

    // 1. Block self-registration as SUPER_ADMIN
    const regSuper = await request('POST', '/api/v1/auth/register', {
      email: `evil_superadmin_${Date.now()}@campus.demo`,
      password: 'Password@123',
      firstName: 'Malicious',
      lastName: 'Actor',
      role: 'SUPER_ADMIN'
    });
    assert('Registration Security', 'SEC-REG-01', 'Public registration blocks SUPER_ADMIN role assignment (403 Forbidden)', 
      regSuper.status === 403);

    // 2. Block self-registration as ADMIN
    const regAdmin = await request('POST', '/api/v1/auth/register', {
      email: `evil_admin_${Date.now()}@campus.demo`,
      password: 'Password@123',
      firstName: 'Malicious',
      lastName: 'Actor',
      role: 'ADMIN'
    });
    assert('Registration Security', 'SEC-REG-02', 'Public registration blocks ADMIN role assignment (403 Forbidden)', 
      regAdmin.status === 403);

    // 3. Block self-registration as WARDEN
    const regWarden = await request('POST', '/api/v1/auth/register', {
      email: `evil_warden_${Date.now()}@campus.demo`,
      password: 'Password@123',
      firstName: 'Malicious',
      lastName: 'Actor',
      role: 'WARDEN'
    });
    assert('Registration Security', 'SEC-REG-03', 'Public registration blocks WARDEN role assignment (403 Forbidden)', 
      regWarden.status === 403);

    // 4. Block self-registration as SECURITY
    const regSec = await request('POST', '/api/v1/auth/register', {
      email: `evil_security_${Date.now()}@campus.demo`,
      password: 'Password@123',
      firstName: 'Malicious',
      lastName: 'Actor',
      role: 'SECURITY'
    });
    assert('Registration Security', 'SEC-REG-04', 'Public registration blocks SECURITY role assignment (403 Forbidden)', 
      regSec.status === 403);

    // 5. Valid student registration
    const validStudentEmail = `sec_student_${Date.now()}@campus.demo`;
    const regValid = await request('POST', '/api/v1/auth/register', {
      email: validStudentEmail,
      password: 'Password@123',
      firstName: 'Secured',
      lastName: 'Student',
      role: 'STUDENT'
    });
    assert('Registration Security', 'SEC-REG-05', 'Public registration permits legitimate STUDENT role creation (201)', 
      regValid.status === 201 && regValid.body.data?.token);
    tempUserId = regValid.body.data?.user?.id;

    // 6. Duplicate registration rejection
    const regDup = await request('POST', '/api/v1/auth/register', {
      email: validStudentEmail,
      password: 'Password@123',
      firstName: 'Duplicate',
      lastName: 'Student',
      role: 'STUDENT'
    });
    assert('Registration Security', 'SEC-REG-06', 'Registration rejects duplicate email with 409 Conflict', 
      regDup.status === 409);

    // -------------------------------------------------------------
    // SUITE 4: JWT SECURITY, EXPIRATION & SIGNATURE TAMPERING
    // -------------------------------------------------------------
    console.log('\n[Suite 4: JWT Integrity, Expiration & Signature Tampering]');

    // 1. Missing Authorization header
    const noToken = await request('GET', '/api/v1/admin/dashboard');
    assert('JWT Integrity', 'SEC-JWT-01', 'Protected route rejects missing Authorization header (401)', 
      noToken.status === 401);

    // 2. Non-Bearer token format
    const badBearer = await request('GET', '/api/v1/admin/dashboard', null, 'Basic user:pass');
    assert('JWT Integrity', 'SEC-JWT-02', 'Protected route rejects non-Bearer authorization scheme (401)', 
      badBearer.status === 401);

    // 3. Tampered JWT signature
    const legitToken = tokens.STUDENT;
    const parts = legitToken.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ role: 'SUPER_ADMIN', email: 'hacker@campus.demo' })).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    const tamperRes = await request('GET', '/api/v1/admin/dashboard', null, tamperedToken);
    assert('JWT Integrity', 'SEC-JWT-03', 'Server rejects cryptographically tampered JWT token (401)', 
      tamperRes.status === 401);

    // 4. Token signed with wrong secret key
    const forgedToken = jwt.sign({ id: 'fake_id', role: 'SUPER_ADMIN' }, 'wrong-unauthorized-secret-key', { expiresIn: '1h' });
    const forgeRes = await request('GET', '/api/v1/admin/dashboard', null, forgedToken);
    assert('JWT Integrity', 'SEC-JWT-04', 'Server rejects JWT signed with unauthorized signing secret (401)', 
      forgeRes.status === 401);

    // 5. Expired token rejection
    const expiredToken = jwt.sign({ id: 'fake_id', role: 'STUDENT' }, ENV.JWT_SECRET, { expiresIn: '-10s' });
    const expiredRes = await request('GET', '/api/v1/student/dashboard', null, expiredToken);
    assert('JWT Integrity', 'SEC-JWT-05', 'Server strictly rejects expired JWT tokens (401)', 
      expiredRes.status === 401);

    // -------------------------------------------------------------
    // SUITE 5: RBAC BOUNDARY ENFORCEMENT & PRIVILEGED APIS
    // -------------------------------------------------------------
    console.log('\n[Suite 5: Role-Based Access Control & Perimeter Enforcement]');

    // 1. Student attempting Admin Dashboard -> 403
    const sAsAdmin = await request('GET', '/api/v1/admin/dashboard', null, tokens.STUDENT);
    assert('RBAC & Boundary Enforcement', 'SEC-RBAC-01', 'STUDENT blocked from /admin/dashboard with 403 Forbidden', 
      sAsAdmin.status === 403);

    // 2. Student attempting Audit Logs -> 403
    const sAsAudit = await request('GET', '/api/v1/admin/audit-logs', null, tokens.STUDENT);
    assert('RBAC & Boundary Enforcement', 'SEC-RBAC-02', 'STUDENT blocked from /admin/audit-logs with 403 Forbidden', 
      sAsAudit.status === 403);

    // 3. Student attempting Gate Entry creation -> 403
    const sAsGate = await request('POST', '/api/v1/security/gate/entry', { passNumber: 'GP-TEST' }, tokens.STUDENT);
    assert('RBAC & Boundary Enforcement', 'SEC-RBAC-03', 'STUDENT blocked from /security/gate/entry without GATE_ENTRY permission (403)', 
      sAsGate.status === 403);

    // 4. Student attempting Gate Pass approval -> 403
    const sAsApprover = await request('POST', '/api/v1/gatepass/some_id/approve', { decision: 'APPROVED' }, tokens.STUDENT);
    assert('RBAC & Boundary Enforcement', 'SEC-RBAC-04', 'STUDENT blocked from approving gate passes with 403 Forbidden', 
      sAsApprover.status === 403);

    // 5. Admin allowed on Admin Dashboard -> 200
    const adminCheck = await request('GET', '/api/v1/admin/dashboard', null, tokens.ADMIN);
    assert('RBAC & Boundary Enforcement', 'SEC-RBAC-05', 'ADMIN granted access to /admin/dashboard with 200 OK', 
      adminCheck.status === 200);

    // 6. Security allowed on Security Dashboard -> 200
    const secCheck = await request('GET', '/api/v1/security/dashboard', null, tokens.SECURITY);
    assert('RBAC & Boundary Enforcement', 'SEC-RBAC-06', 'SECURITY granted access to /security/dashboard with 200 OK', 
      secCheck.status === 200);

    // -------------------------------------------------------------
    // SUITE 6: HORIZONTAL AUTHORIZATION (IDOR) & MASS ASSIGNMENT
    // -------------------------------------------------------------
    console.log('\n[Suite 6: Horizontal Access Control (IDOR) & Mass Assignment]');

    // 1. Mass Assignment: Attempting to escalate role via PATCH /users/me
    const massAssignRole = await request('PATCH', '/api/v1/users/me', {
      role: 'SUPER_ADMIN'
    }, tokens.STUDENT);
    assert('IDOR & Mass Assignment', 'SEC-IDOR-01', 'PATCH /users/me blocks role escalation via mass assignment (403 Forbidden)', 
      massAssignRole.status === 403);

    // 2. Mass Assignment: Attempting to flip isActive status
    const massAssignActive = await request('PATCH', '/api/v1/users/me', {
      isActive: false
    }, tokens.STUDENT);
    assert('IDOR & Mass Assignment', 'SEC-IDOR-02', 'PATCH /users/me blocks isActive tampering (403 Forbidden)', 
      massAssignActive.status === 403);

    // 3. Mass Assignment: Attempting to change email address
    const massAssignEmail = await request('PATCH', '/api/v1/users/me', {
      email: 'hacked_email@campus.demo'
    }, tokens.STUDENT);
    assert('IDOR & Mass Assignment', 'SEC-IDOR-03', 'PATCH /users/me blocks email tampering (403 Forbidden)', 
      massAssignEmail.status === 403);

    // 4. Safe legitimate profile update (phoneNumber only)
    const safeUpdate = await request('PATCH', '/api/v1/users/me', {
      phoneNumber: '+91 99999 77777'
    }, tokens.STUDENT);
    assert('IDOR & Mass Assignment', 'SEC-IDOR-04', 'PATCH /users/me permits legitimate non-privileged field update (200 OK)', 
      safeUpdate.status === 200);

    // -------------------------------------------------------------
    // SUITE 7: SQL INJECTION & MALICIOUS PAYLOAD IMMUNITY
    // -------------------------------------------------------------
    console.log('\n[Suite 7: Injection & Malicious Payload Neutralization]');

    // 1. Classic SQL injection login attempt
    const sqliLogin = await request('POST', '/api/v1/auth/login', {
      email: "admin@campus.demo' OR '1'='1",
      password: "' OR '1'='1"
    });
    assert('Injection & Payloads', 'SEC-INJ-01', 'SQL injection payload in login treated as literal string (401 Unauthorized)', 
      sqliLogin.status === 401);

    // 2. Stacked query SQL injection attempt
    const sqliStacked = await request('POST', '/api/v1/auth/login', {
      email: "student@campus.demo'; DROP TABLE \"User\";--",
      password: "Password@123"
    });
    assert('Injection & Payloads', 'SEC-INJ-02', 'Stacked SQL injection safely parameterized; database unharmed (401)', 
      sqliStacked.status === 401);

    // Verify User table is intact
    const userTableCount = await prisma.user.count();
    assert('Injection & Payloads', 'SEC-INJ-03', `User table integrity confirmed after injection tests (${userTableCount} records)`, 
      userTableCount > 0);

    // 3. Stored XSS payload in complaint
    const xssComplaint = await request('POST', '/api/v1/complaints', {
      title: '<script>alert("XSS")</script> Leaking Valve',
      description: '<img src=x onerror=alert(1)> Water damage on floor',
      category: 'PLUMBING'
    }, tokens.STUDENT);
    assert('Injection & Payloads', 'SEC-INJ-04', 'POST /complaints stores XSS safely without executing server-side', 
      xssComplaint.status === 201);

    // Clean up test complaint
    if (xssComplaint.body.data?.complaint?.id) {
      await prisma.complaintComment.deleteMany({ where: { complaintId: xssComplaint.body.data.complaint.id } }).catch(() => {});
      await prisma.complaintStatusHistory.deleteMany({ where: { complaintId: xssComplaint.body.data.complaint.id } }).catch(() => {});
      await prisma.complaint.delete({ where: { id: xssComplaint.body.data.complaint.id } }).catch(() => {});
    }

    // -------------------------------------------------------------
    // SUITE 8: SECURITY HEADERS & CORS HARDENING
    // -------------------------------------------------------------
    console.log('\n[Suite 8: Security HTTP Headers & CORS Architecture]');

    const healthCheck = await request('GET', '/health');
    assert('Security Headers & Config', 'SEC-HDR-01', 'X-Content-Type-Options: nosniff header present (MIME-sniffing protection)', 
      healthCheck.headers['x-content-type-options'] === 'nosniff');

    assert('Security Headers & Config', 'SEC-HDR-02', 'X-Frame-Options: SAMEORIGIN present (Clickjacking protection)', 
      healthCheck.headers['x-frame-options'] === 'SAMEORIGIN');

    // Clean up temporary user record
    if (tempUserId) {
      await prisma.user.delete({ where: { id: tempUserId } }).catch(() => {});
    }

    console.log('\n================================================================');
    console.log(`  CYBERSECURITY AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('================================================================\n');

    server.close();
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);

  } catch (err) {
    console.error('Security audit fatal exception:', err);
    server.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

runSecurityAudit();


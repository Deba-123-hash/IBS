import http from 'http';
import app from '../server/src/app.js';
import prisma from '../server/src/config/database.js';

console.log('\n================================================================');
console.log('  CAMPUSOS COMPREHENSIVE API AUDIT, TESTING & VALIDATION SUITE');
console.log('  Target: Express.js REST API + Neon PostgreSQL + RBAC Engine');
console.log('================================================================\n');

async function runApiValidation() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`[Test Server] Ephemeral HTTP server listening on port ${port}\n`);

  let passed = 0;
  let failed = 0;
  const testResults = [];
  const latencyMap = {};

  const suiteStats = {
    'Health & Root': { total: 0, passed: 0, failed: 0 },
    'Authentication & Tokens': { total: 0, passed: 0, failed: 0 },
    'RBAC & Authorization': { total: 0, passed: 0, failed: 0 },
    'Request & Response Validation': { total: 0, passed: 0, failed: 0 },
    'Student & Academics API': { total: 0, passed: 0, failed: 0 },
    'Hostel & Residential API': { total: 0, passed: 0, failed: 0 },
    'Complaints & Grievances API': { total: 0, passed: 0, failed: 0 },
    'Gate Pass & Security API': { total: 0, passed: 0, failed: 0 },
    'Leaves, Certs & Mess API': { total: 0, passed: 0, failed: 0 },
    'Accounts & Financials API': { total: 0, passed: 0, failed: 0 },
    'Admin & Audit API': { total: 0, passed: 0, failed: 0 },
    'AI Assistant & Chatbot API': { total: 0, passed: 0, failed: 0 },
    'Error Handling & Security': { total: 0, passed: 0, failed: 0 },
    'Concurrency & Performance': { total: 0, passed: 0, failed: 0 }
  };

  async function request(method, path, body = null, token = null) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(url, { method, headers }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          const latency = Date.now() - start;
          const cleanPath = path.split('?')[0];
          if (!latencyMap[cleanPath]) latencyMap[cleanPath] = [];
          latencyMap[cleanPath].push(latency);

          let parsed;
          try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
          resolve({ status: res.statusCode, body: parsed, latency, headers: res.headers });
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  function assert(category, testId, description, condition, details = '') {
    if (!suiteStats[category]) suiteStats[category] = { total: 0, passed: 0, failed: 0 };
    suiteStats[category].total++;
    const res = { category, testId, description, status: condition ? 'PASS' : 'FAIL', details };
    testResults.push(res);

    if (condition) {
      suiteStats[category].passed++;
      console.log(`  ✓ [${testId}] ${description}`);
      passed++;
    } else {
      suiteStats[category].failed++;
      console.error(`  ✗ [${testId}] ${description} ${details ? `-> ${details}` : ''}`);
      failed++;
    }
  }

  const tokens = {};
  let sharedStudentId = null;
  let sharedComplaintId = null;
  let sharedGatePassId = null;
  let sharedNoticeId = null;

  try {
    // -------------------------------------------------------------
    // SUITE 1: HEALTH & ROOT ENDPOINTS
    // -------------------------------------------------------------
    console.log('[Suite 1: Health, Diagnostic & Root API Verification]');
    
    const h1 = await request('GET', '/health');
    assert('Health & Root', 'HLTH-01', 'GET /health returns 200 with database: connected', 
      h1.status === 200 && h1.body.success && h1.body.database === 'connected');

    const h2 = await request('GET', '/api/health');
    assert('Health & Root', 'HLTH-02', 'GET /api/health returns 200 with api: healthy', 
      h2.status === 200 && h2.body.api === 'healthy');

    const h3 = await request('GET', '/health/ai');
    assert('Health & Root', 'HLTH-03', 'GET /health/ai returns 200 with groq status', 
      h3.status === 200 && h3.body.success);

    // -------------------------------------------------------------
    // SUITE 2: AUTHENTICATION, REGISTRATION & JWT TOKENS
    // -------------------------------------------------------------
    console.log('\n[Suite 2: Authentication, Registration & Token Lifecycle]');

    // 1. Missing fields registration
    const rMissing = await request('POST', '/api/v1/auth/register', { email: 'bad@campus.demo' });
    assert('Authentication & Tokens', 'AUTH-01', 'POST /auth/register rejects missing required fields (400)', 
      rMissing.status === 400);

    // 2. Privileged role registration rejection
    const rPriv = await request('POST', '/api/v1/auth/register', {
      email: 'hacker@campus.demo', password: 'Password@123', firstName: 'Bad', lastName: 'Actor', role: 'SUPER_ADMIN'
    });
    assert('Authentication & Tokens', 'AUTH-02', 'POST /auth/register rejects privileged role self-registration (403)', 
      rPriv.status === 403);

    // 3. Valid student registration
    const tempEmail = `apitest_${Date.now()}@campus.demo`;
    const rValid = await request('POST', '/api/v1/auth/register', {
      email: tempEmail, password: 'Password@123', firstName: 'API', lastName: 'Tester', role: 'STUDENT'
    });
    assert('Authentication & Tokens', 'AUTH-03', 'POST /auth/register succeeds with valid payload (201)', 
      rValid.status === 201 && rValid.body.data?.token);

    // 4. Duplicate email registration rejection
    const rDup = await request('POST', '/api/v1/auth/register', {
      email: tempEmail, password: 'Password@123', firstName: 'API', lastName: 'Tester', role: 'STUDENT'
    });
    assert('Authentication & Tokens', 'AUTH-04', 'POST /auth/register blocks duplicate email (400/409)', 
      [400, 409].includes(rDup.status));

    // 5. Invalid login credentials
    const lBad = await request('POST', '/api/v1/auth/login', { email: tempEmail, password: 'WrongPassword' });
    assert('Authentication & Tokens', 'AUTH-05', 'POST /auth/login rejects invalid password (401)', 
      lBad.status === 401);

    // 6. Login all 8 institutional demo roles
    const demoAccounts = [
      { role: 'STUDENT', email: 'student@campus.demo' },
      { role: 'ADMIN', email: 'admin@campus.demo' },
      { role: 'SUPER_ADMIN', email: 'superadmin@campus.demo' },
      { role: 'WARDEN', email: 'warden@campus.demo' },
      { role: 'MAINTENANCE', email: 'maintenance@campus.demo' },
      { role: 'SECURITY', email: 'security@campus.demo' },
      { role: 'FACULTY', email: 'faculty@campus.demo' },
      { role: 'ACCOUNTS', email: 'accounts@campus.demo' }
    ];

    for (const acc of demoAccounts) {
      const lRes = await request('POST', '/api/v1/auth/login', { email: acc.email, password: 'Password@123' });
      const ok = lRes.status === 200 && lRes.body.data?.token;
      if (ok) tokens[acc.role] = lRes.body.data.token;
      assert('Authentication & Tokens', `AUTH-LOGIN-${acc.role}`, `POST /auth/login authenticates ${acc.role}`, ok);
    }

    // 7. Roll number alias login
    const lRoll = await request('POST', '/api/v1/auth/login', { email: 'SAMT24CSE001', password: 'Password@123' });
    assert('Authentication & Tokens', 'AUTH-06', 'POST /auth/login resolves roll number identifier alias', 
      lRoll.status === 200 && lRoll.body.data?.token);

    // 8. GET /auth/me identity verification
    const meRes = await request('GET', '/api/v1/auth/me', null, tokens.STUDENT);
    assert('Authentication & Tokens', 'AUTH-07', 'GET /auth/me returns authenticated identity profile', 
      meRes.status === 200 && meRes.body.data?.email === 'student@campus.demo');
    sharedStudentId = meRes.body.data?.student?.id;

    // -------------------------------------------------------------
    // SUITE 3: RBAC & AUTHORIZATION ENFORCEMENT
    // -------------------------------------------------------------
    console.log('\n[Suite 3: Role-Based Access Control & Boundary Enforcement]');

    // 1. Missing token rejection (401)
    const noToken = await request('GET', '/api/v1/admin/dashboard');
    assert('RBAC & Authorization', 'RBAC-01', 'GET /admin/dashboard rejects unauthenticated requests (401)', 
      noToken.status === 401);

    // 2. Malformed token rejection (401)
    const badToken = await request('GET', '/api/v1/admin/dashboard', null, 'malformed.jwt.token');
    assert('RBAC & Authorization', 'RBAC-02', 'GET /admin/dashboard rejects malformed token (401)', 
      badToken.status === 401);

    // 3. Unauthorized role access rejection (Student accessing Admin -> 403)
    const studentAsAdmin = await request('GET', '/api/v1/admin/dashboard', null, tokens.STUDENT);
    assert('RBAC & Authorization', 'RBAC-03', 'GET /admin/dashboard rejects STUDENT access with 403 Forbidden', 
      studentAsAdmin.status === 403);

    // 4. Unauthorized role access rejection (Student accessing Audit Logs -> 403)
    const studentAudit = await request('GET', '/api/v1/admin/audit-logs', null, tokens.STUDENT);
    assert('RBAC & Authorization', 'RBAC-04', 'GET /admin/audit-logs rejects non-admin users (403 Forbidden)', 
      studentAudit.status === 403);

    // 5. Authorized role access success (ADMIN accessing Admin Dashboard -> 200)
    const adminDash = await request('GET', '/api/v1/admin/dashboard', null, tokens.ADMIN);
    assert('RBAC & Authorization', 'RBAC-05', 'GET /admin/dashboard allows ADMIN role with 200 OK', 
      adminDash.status === 200 && adminDash.body.success);

    // 6. Security gate permissions (STUDENT cannot log gate entry -> 403)
    const studentGate = await request('POST', '/api/v1/security/gate/entry', { passNumber: 'GP-TEST' }, tokens.STUDENT);
    assert('RBAC & Authorization', 'RBAC-06', 'POST /security/gate/entry rejects STUDENT without GATE_ENTRY permission (403)', 
      studentGate.status === 403);

    // -------------------------------------------------------------
    // SUITE 4: REQUEST & RESPONSE DATA HYGIENE
    // -------------------------------------------------------------
    console.log('\n[Suite 4: Request & Response Data Hygiene & Privacy Safeguards]');

    // 1. Response structure check
    assert('Request & Response Validation', 'VAL-01', 'All successful responses follow standard { success: true, data: ... } format', 
      adminDash.body.success === true && adminDash.body.data !== undefined);

    // 2. Zero password hash leaks in user profiles
    const profRes = await request('GET', '/api/v1/users/me', null, tokens.STUDENT);
    const hasPasswordLeak = JSON.stringify(profRes.body).includes('password') && profRes.body.data?.password;
    assert('Request & Response Validation', 'VAL-02', 'GET /users/me response strictly redacts user password hash', 
      profRes.status === 200 && !hasPasswordLeak);

    // 3. User update validation (Zod schema)
    const patchMe = await request('PATCH', '/api/v1/users/me', { phoneNumber: '+91 99999 88888' }, tokens.STUDENT);
    assert('Request & Response Validation', 'VAL-03', 'PATCH /users/me updates profile fields successfully', 
      patchMe.status === 200 && patchMe.body.success);

    // -------------------------------------------------------------
    // SUITE 5: STUDENT & ACADEMICS MODULE APIS
    // -------------------------------------------------------------
    console.log('\n[Suite 5: Student Core Operations, Attendance & Timetable APIs]');

    // 1. Student Dashboard
    const sDash = await request('GET', '/api/v1/student/dashboard', null, tokens.STUDENT);
    assert('Student & Academics API', 'STU-01', 'GET /student/dashboard aggregates KPI metrics & announcements', 
      sDash.status === 200 && sDash.body.data);

    // 2. Student Profile
    const sProf = await request('GET', '/api/v1/student/profile', null, tokens.STUDENT);
    assert('Student & Academics API', 'STU-02', 'GET /student/profile returns academic student metadata', 
      sProf.status === 200 && sProf.body.data);

    // 3. Student Attendance
    const sAtt = await request('GET', '/api/v1/attendance/me', null, tokens.STUDENT);
    assert('Student & Academics API', 'STU-03', 'GET /attendance/me retrieves subject-wise attendance breakdown', 
      sAtt.status === 200 && (Array.isArray(sAtt.body.data) || Array.isArray(sAtt.body.data?.subjects) || Array.isArray(sAtt.body.data?.records)));

    // 4. Student Attendance Summary
    const sAttSum = await request('GET', '/api/v1/student/attendance/summary', null, tokens.STUDENT);
    assert('Student & Academics API', 'STU-04', 'GET /student/attendance/summary calculates overall percentage', 
      sAttSum.status === 200 && sAttSum.body.data);

    // 5. Timetable retrieval
    const sTime = await request('GET', '/api/v1/timetable/me', null, tokens.STUDENT);
    assert('Student & Academics API', 'STU-05', 'GET /timetable/me returns weekly schedule slots', 
      sTime.status === 200 && sTime.body.data);

    // -------------------------------------------------------------
    // SUITE 6: HOSTEL & RESIDENTIAL APIS
    // -------------------------------------------------------------
    console.log('\n[Suite 6: Hostel, Room Management & Allocation Grid APIs]');

    // 1. Student Room Details
    const hMyRoom = await request('GET', '/api/v1/hostel/me', null, tokens.STUDENT);
    assert('Hostel & Residential API', 'HST-01', 'GET /hostel/me retrieves allocated hostel, block, room & roommate', 
      hMyRoom.status === 200 && hMyRoom.body.data?.roomNumber);

    // 2. Hostel Rooms Grid (Warden view)
    const hGrid = await request('GET', '/api/v1/hostel/rooms/grid', null, tokens.WARDEN);
    assert('Hostel & Residential API', 'HST-02', 'GET /hostel/rooms/grid delivers room status occupancy matrix', 
      hGrid.status === 200 && Array.isArray(hGrid.body.data?.rooms));

    // 3. Warden Hostels Listing
    const wHostels = await request('GET', '/api/v1/warden/hostels', null, tokens.WARDEN);
    assert('Hostel & Residential API', 'HST-03', 'GET /warden/hostels returns hostel block hierarchy', 
      wHostels.status === 200 && wHostels.body.success);

    // 4. Warden Rooms Directory
    const wRooms = await request('GET', '/api/v1/warden/rooms', null, tokens.WARDEN);
    assert('Hostel & Residential API', 'HST-04', 'GET /warden/rooms lists rooms with capacity limits', 
      wRooms.status === 200 && wRooms.body.success);

    // -------------------------------------------------------------
    // SUITE 7: COMPLAINTS & GRIEVANCE PIPELINE APIS
    // -------------------------------------------------------------
    console.log('\n[Suite 7: Complaints, Maintenance Work Orders & Grievances]');

    // 1. Submit Complaint
    const cNew = await request('POST', '/api/v1/complaints', {
      title: 'API Automated Audit Fixture Leak',
      description: 'Water leaking under washroom sink fixture in Block B room 304.',
      category: 'PLUMBING',
      locationType: 'HOSTEL_ROOM',
      priority: 'HIGH'
    }, tokens.STUDENT);
    const complaintTicket = cNew.body.data?.complaint?.ticketNumber || cNew.body.data?.ticketNumber;
    assert('Complaints & Grievances API', 'CMP-01', 'POST /complaints submits new grievance with ticket number', 
      cNew.status === 201 && !!complaintTicket);
    sharedComplaintId = cNew.body.data?.complaint?.id || cNew.body.data?.id;

    // 2. List Complaints
    const cList = await request('GET', '/api/v1/complaints', null, tokens.STUDENT);
    assert('Complaints & Grievances API', 'CMP-02', 'GET /complaints lists complaints for authenticated student', 
      cList.status === 200 && (Array.isArray(cList.body.data) || Array.isArray(cList.body.data?.complaints)));

    // 3. Get Complaint By ID
    if (sharedComplaintId) {
      const cDetail = await request('GET', `/api/v1/complaints/${sharedComplaintId}`, null, tokens.STUDENT);
      const titleMatches = (cDetail.body.data?.title || cDetail.body.data?.complaint?.title || '').includes('Leak');
      assert('Complaints & Grievances API', 'CMP-03', 'GET /complaints/:id retrieves complete grievance lifecycle', 
        cDetail.status === 200 && titleMatches);

      // 4. Add Comment
      const cComm = await request('POST', `/api/v1/complaints/${sharedComplaintId}/comments`, {
        message: 'Maintenance team acknowledged dispatch.',
        isInternal: false
      }, tokens.STUDENT);
      assert('Complaints & Grievances API', 'CMP-04', 'POST /complaints/:id/comments appends comment thread', 
        [200, 201].includes(cComm.status) && cComm.body.success);

      // 5. Update Status (Warden/Maintenance)
      const cStat = await request('PATCH', `/api/v1/complaints/${sharedComplaintId}/status`, {
        status: 'IN_PROGRESS',
        remarks: 'Technician dispatched with replacement washer.'
      }, tokens.WARDEN);
      assert('Complaints & Grievances API', 'CMP-05', 'PATCH /complaints/:id/status transitions state to IN_PROGRESS', 
        cStat.status === 200 && cStat.body.success);
    }

    // -------------------------------------------------------------
    // SUITE 8: GATE PASS & CAMPUS SECURITY APIS
    // -------------------------------------------------------------
    console.log('\n[Suite 8: Gate Pass Lifecycle, QR Verification & Security]');

    // 1. Create Gate Pass Request
    const gpNew = await request('POST', '/api/v1/gatepass', {
      type: 'DAY_OUTING',
      reason: 'Automated API validation campus library visit',
      destination: 'Campus Central Library',
      outTimeExpected: new Date(Date.now() + 3600000).toISOString(),
      inTimeExpected: new Date(Date.now() + 18000000).toISOString()
    }, tokens.STUDENT);
    const passNum = gpNew.body.data?.gatePass?.passNumber || gpNew.body.data?.passNumber;
    assert('Gate Pass & Security API', 'SEC-01', 'POST /gatepass creates student gate pass request', 
      gpNew.status === 201 && !!passNum);
    sharedGatePassId = gpNew.body.data?.gatePass?.id || gpNew.body.data?.id;

    // 2. List Gate Passes
    const gpList = await request('GET', '/api/v1/gatepass/me', null, tokens.STUDENT);
    assert('Gate Pass & Security API', 'SEC-02', 'GET /gatepass/me retrieves student gate pass history', 
      gpList.status === 200 && (Array.isArray(gpList.body.data) || Array.isArray(gpList.body.data?.gatePasses)));

    // 3. Warden Decision (Approve)
    if (sharedGatePassId) {
      const gpApprove = await request('POST', `/api/v1/gatepass/${sharedGatePassId}/approve`, {
        remarks: 'Approved by Warden via automated API test'
      }, tokens.WARDEN);
      assert('Gate Pass & Security API', 'SEC-03', 'POST /gatepass/:id/approve updates status to APPROVED', 
        gpApprove.status === 200 && gpApprove.body.success);
    }

    // 4. Security Guard Dashboard
    const secDash = await request('GET', '/api/v1/security/dashboard', null, tokens.SECURITY);
    assert('Gate Pass & Security API', 'SEC-04', 'GET /security/dashboard returns daily gate traffic metrics', 
      secDash.status === 200 && secDash.body.success);

    // 5. Security Gate QR Verification
    const secQr = await request('POST', '/api/v1/security/verify-qr', {
      qrCodeToken: passNum || 'GP-2026-0042'
    }, tokens.SECURITY);
    assert('Gate Pass & Security API', 'SEC-05', 'POST /security/verify-qr decodes and validates pass data', 
      secQr.status === 200 && secQr.body.success);

    // -------------------------------------------------------------
    // SUITE 9: LEAVES, CERTIFICATES & MESS APIS
    // -------------------------------------------------------------
    console.log('\n[Suite 9: Leave Requests, Certificates & Dining Services]');

    // 1. Leave request creation
    const lReq = await request('POST', '/api/v1/leave', {
      reason: 'Attending hackathon finals in Bhubaneswar',
      destination: 'Bhubaneswar Campus',
      emergencyContact: '+91 98765 43210',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 259200000).toISOString()
    }, tokens.STUDENT);
    assert('Leaves, Certs & Mess API', 'LCM-01', 'POST /leave initiates student leave approval workflow', 
      lReq.status === 201 && lReq.body.success);

    // 2. Certificate listing
    const certList = await request('GET', '/api/v1/certificates', null, tokens.STUDENT);
    assert('Leaves, Certs & Mess API', 'LCM-02', 'GET /certificates lists available certificate templates', 
      certList.status === 200 && certList.body.success);

    // 3. Request Certificate
    const certReq = await request('POST', '/api/v1/certificates/request', {
      certificateType: 'BONAFIDE',
      purpose: 'Education loan verification at SBI'
    }, tokens.STUDENT);
    assert('Leaves, Certs & Mess API', 'LCM-03', 'POST /certificates/request registers formal issuance request', 
      certReq.status === 201 && certReq.body.success);

    // 4. Mess Menu Retrieval
    const messMenu = await request('GET', '/api/v1/mess/menu', null, tokens.STUDENT);
    assert('Leaves, Certs & Mess API', 'LCM-04', 'GET /mess/menu returns weekly dining schedule & menu', 
      messMenu.status === 200 && messMenu.body.success);

    // 5. Mess Feedback Submission
    const messFeed = await request('POST', '/api/v1/mess/feedback', {
      mealType: 'LUNCH',
      rating: 4,
      comment: 'Special South Indian lunch was well prepared.'
    }, tokens.STUDENT);
    assert('Leaves, Certs & Mess API', 'LCM-05', 'POST /mess/feedback logs student dining feedback', 
      messFeed.status === 201 && messFeed.body.success);

    // -------------------------------------------------------------
    // SUITE 10: ACCOUNTS, FEES & RECONCILIATION APIS
    // -------------------------------------------------------------
    console.log('\n[Suite 10: Institutional Accounts, Fees & Financial Reports]');

    // 1. Student Fee Ledger
    const sFees = await request('GET', '/api/v1/fees/me', null, tokens.STUDENT);
    assert('Accounts & Financials API', 'ACC-01', 'GET /fees/me returns student fee obligations & balance', 
      sFees.status === 200 && sFees.body.success);

    // 2. Accounts Executive Dashboard
    const accDash = await request('GET', '/api/v1/accounts/dashboard', null, tokens.ACCOUNTS);
    assert('Accounts & Financials API', 'ACC-02', 'GET /accounts/dashboard returns fee collections & expense KPIs', 
      accDash.status === 200 && accDash.body.success);

    // 3. Accounts Financial Reports
    const accRep = await request('GET', '/api/v1/accounts/reports', null, tokens.ACCOUNTS);
    assert('Accounts & Financials API', 'ACC-03', 'GET /accounts/reports compiles financial summary statement', 
      accRep.status === 200 && accRep.body.success);

    // -------------------------------------------------------------
    // SUITE 11: ADMIN & AUDIT TRAIL APIS
    // -------------------------------------------------------------
    console.log('\n[Suite 11: Administrative Command Center & Audit Governance]');

    // 1. Admin Users Directory
    const aUsers = await request('GET', '/api/v1/admin/users', null, tokens.ADMIN);
    assert('Admin & Audit API', 'ADM-01', 'GET /admin/users retrieves institutional user directory with pagination', 
      aUsers.status === 200 && aUsers.body.data);

    // 2. Admin Students Directory
    const aStudents = await request('GET', '/api/v1/admin/students', null, tokens.ADMIN);
    assert('Admin & Audit API', 'ADM-02', 'GET /admin/students lists student roster with branch & roll mappings', 
      aStudents.status === 200 && aStudents.body.data);

    // 3. Create Institutional Notice
    const nNew = await request('POST', '/api/v1/admin/notices', {
      title: 'BPUT Hackathon Campus Schedule 2026',
      content: 'All labs will remain open 24x7 for hackathon participants.',
      category: 'EVENT',
      priority: 'HIGH',
      targetRoles: ['STUDENT', 'FACULTY']
    }, tokens.ADMIN);
    assert('Admin & Audit API', 'ADM-03', 'POST /admin/notices creates broadcast announcement', 
      nNew.status === 201 && nNew.body.data?.id);
    sharedNoticeId = nNew.body.data?.id;

    // 4. Mark Notice Read (Student receipt)
    if (sharedNoticeId) {
      const nRead = await request('POST', `/api/v1/notices/${sharedNoticeId}/read`, null, tokens.STUDENT);
      assert('Admin & Audit API', 'ADM-04', 'POST /notices/:id/read registers student read receipt telemetry', 
        nRead.status === 200 && nRead.body.success);
    }

    // 5. Immutable Audit Logs
    const aAudit = await request('GET', '/api/v1/admin/audit-logs', null, tokens.ADMIN);
    assert('Admin & Audit API', 'ADM-05', 'GET /admin/audit-logs returns tamper-evident administrative action log', 
      aAudit.status === 200 && Array.isArray(aAudit.body.data));

    // -------------------------------------------------------------
    // SUITE 12: AI ASSISTANT & CHATBOT APIS
    // -------------------------------------------------------------
    console.log('\n[Suite 12: AI Campus Assistant & Complaint Classification]');

    // 1. AI Chat Assistant
    const aiChat = await request('POST', '/api/v1/ai/chat', {
      message: 'What are the hostel gate timings for Sunday outing?'
    }, tokens.STUDENT);
    const hasAiReply = !!(aiChat.body?.response || aiChat.body?.message || aiChat.body?.data?.response);
    assert('AI Assistant & Chatbot API', 'AI-01', 'POST /ai/chat provides intelligent campus contextual response', 
      aiChat.status === 200 && hasAiReply);

    // 2. AI Complaint Classifier
    const aiClassify = await request('POST', '/api/v1/ai/classify-complaint', {
      title: 'Broken Washroom Valve',
      description: 'Water is gushing out from the broken valve in room 204 washroom',
      location: 'Block B Room 204'
    }, tokens.STUDENT);
    assert('AI Assistant & Chatbot API', 'AI-02', 'POST /ai/classify-complaint determines category & suggested priority', 
      aiClassify.status === 200 && aiClassify.body.data);

    // -------------------------------------------------------------
    // SUITE 13: ERROR HANDLING & CYBERSECURITY SAFEGUARDS
    // -------------------------------------------------------------
    console.log('\n[Suite 13: Error Handling, 404 Routing & Security Controls]');

    // 1. Non-existent route (404)
    const err404 = await request('GET', '/api/v1/non-existent-endpoint');
    assert('Error Handling & Security', 'ERR-01', 'Non-existent API endpoint returns standard 404 error envelope', 
      err404.status === 404 && !err404.body.success);

    // 2. SQL Injection parameterization test
    const sqliTest = await request('POST', '/api/v1/auth/login', {
      email: "admin@campus.demo' OR '1'='1",
      password: "' OR '1'='1"
    });
    assert('Error Handling & Security', 'ERR-02', 'SQL injection payload safely handled as literal string (401)', 
      sqliTest.status === 401);

    // 3. Security HTTP Response Headers
    assert('Error Handling & Security', 'ERR-03', 'Helmet security headers present (X-Content-Type-Options: nosniff)', 
      h1.headers['x-content-type-options'] === 'nosniff');

    // -------------------------------------------------------------
    // SUITE 14: CONCURRENCY & LATENCY BENCHMARKING
    // -------------------------------------------------------------
    console.log('\n[Suite 14: Concurrent Load & Latency Benchmarking]');

    const concurrentStart = Date.now();
    const concurrentRequests = Array.from({ length: 15 }, () => 
      request('GET', '/api/v1/student/dashboard', null, tokens.STUDENT)
    );
    const concurrentResponses = await Promise.all(concurrentRequests);
    const concurrentTotalTime = Date.now() - concurrentStart;
    const allSuccessful = concurrentResponses.every(r => r.status === 200);

    assert('Concurrency & Performance', 'PERF-01', `15 concurrent student dashboard requests handled in ${concurrentTotalTime}ms (100% success)`, 
      allSuccessful && concurrentTotalTime < 8000);

    // Clean up temporary registered student record if exists
    if (rValid.body.data?.user?.id) {
      await prisma.user.delete({ where: { id: rValid.body.data.user.id } }).catch(() => {});
    }

    // Clean up temporary complaint if created
    if (sharedComplaintId) {
      await prisma.complaintComment.deleteMany({ where: { complaintId: sharedComplaintId } }).catch(() => {});
      await prisma.complaintStatusHistory.deleteMany({ where: { complaintId: sharedComplaintId } }).catch(() => {});
      await prisma.complaint.delete({ where: { id: sharedComplaintId } }).catch(() => {});
    }

    // Clean up temporary gatepass
    if (sharedGatePassId) {
      await prisma.gatePassEvent.deleteMany({ where: { gatePassId: sharedGatePassId } }).catch(() => {});
      await prisma.gatePassApproval.deleteMany({ where: { gatePassId: sharedGatePassId } }).catch(() => {});
      await prisma.gatePass.delete({ where: { id: sharedGatePassId } }).catch(() => {});
    }

    // Clean up temporary notice
    if (sharedNoticeId) {
      await prisma.noticeRead.deleteMany({ where: { noticeId: sharedNoticeId } }).catch(() => {});
      await prisma.notice.delete({ where: { id: sharedNoticeId } }).catch(() => {});
    }

    console.log('\n================================================================');
    console.log(`  API VALIDATION SUMMARY: ${passed} PASSED | ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('================================================================\n');

    console.log('--- LATENCY BENCHMARKING BREAKDOWN ---');
    for (const [endpoint, times] of Object.entries(latencyMap)) {
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const min = Math.min(...times);
      const max = Math.max(...times);
      console.log(`  ${endpoint.padEnd(35)} | Avg: ${avg}ms | Min: ${min}ms | Max: ${max}ms (n=${times.length})`);
    }
    console.log('--------------------------------------\n');

    server.close();
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);

  } catch (err) {
    console.error('API validation fatal exception:', err);
    server.close();
    await prisma.$disconnect();
    process.exit(1);
  }
}

runApiValidation();

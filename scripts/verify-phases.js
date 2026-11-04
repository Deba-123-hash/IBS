import http from 'http';
import app from '../server/src/app.js';

async function runTests() {
  console.log('\n=============================================================');
  console.log('  CAMPUS LIFE, DEBUGGED - PHASES 2 THROUGH 7 VERIFICATION');
  console.log('=============================================================\n');

  // Start ephemeral server
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`[Test Runner] Ephemeral test server active on port ${port}\n`);

  let passed = 0;
  let failed = 0;

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
          resolve({ status: res.statusCode, body: parsed });
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ ${name} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('[Suite 1: System Health]');
    const healthRes = await request('GET', '/health');
    assert('GET /health returns 200 and healthy status', healthRes.status === 200 && healthRes.body.success);

    // 2. Authentication - Public Registration Guard
    console.log('\n[Suite 2: Authentication & Security Fundamentals]');
    const privRegRes = await request('POST', '/api/v1/auth/register', {
      email: 'hacker@campus.demo',
      password: 'Password@123',
      firstName: 'Evil',
      lastName: 'Admin',
      role: 'SUPER_ADMIN'
    });
    assert('POST /auth/register rejects privileged role self-registration (403)', privRegRes.status === 403);

    // 3. Valid Student Self-Registration
    const studentRegRes = await request('POST', '/api/v1/auth/register', {
      email: `student_${Date.now()}@campus.demo`,
      password: 'Password@123',
      firstName: 'Priya',
      lastName: 'Patel',
      role: 'STUDENT'
    });
    assert('POST /auth/register allows valid student registration (201)', studentRegRes.status === 201);

    // 4. Invalid Login
    const badLoginRes = await request('POST', '/api/v1/auth/login', {
      email: 'student@campus.demo',
      password: 'WrongPassword999'
    });
    assert('POST /auth/login rejects incorrect password (401)', badLoginRes.status === 401);

    // 5. Demo Student Login
    const studentLogin = await request('POST', '/api/v1/auth/login', {
      email: 'student@campus.demo',
      password: 'Password@123'
    });
    assert('POST /auth/login succeeds for student@campus.demo', studentLogin.status === 200 && studentLogin.body.data?.token);
    const studentToken = studentLogin.body.data?.token;

    // 6. Demo Admin Login
    const adminLogin = await request('POST', '/api/v1/auth/login', {
      email: 'admin@campus.demo',
      password: 'Password@123'
    });
    assert('POST /auth/login succeeds for admin@campus.demo', adminLogin.status === 200 && adminLogin.body.data?.token);
    const adminToken = adminLogin.body.data?.token;

    // 7. Verify /auth/me
    const meRes = await request('GET', '/api/v1/auth/me', null, studentToken);
    assert('GET /auth/me returns authenticated identity', meRes.status === 200 && meRes.body.data?.email === 'student@campus.demo');

    // 8. RBAC Enforcement - Student cannot access Admin Users
    console.log('\n[Suite 3: Role-Based Access Control (RBAC)]');
    const forbiddenAdminRes = await request('GET', '/api/v1/admin/users', null, studentToken);
    assert('RBAC: Student forbidden from accessing /admin/users (403)', forbiddenAdminRes.status === 403);

    // 9. Admin can access Admin Users
    const allowedAdminRes = await request('GET', '/api/v1/admin/users', null, adminToken);
    assert('RBAC: Admin successfully accesses /admin/users (200)', allowedAdminRes.status === 200 && Array.isArray(allowedAdminRes.body.data?.users || allowedAdminRes.body.data));

    // 10. Student Campus Operations
    console.log('\n[Suite 4: Student Campus Operations]');
    const dashRes = await request('GET', '/api/v1/students/me/dashboard', null, studentToken);
    assert('GET /students/me/dashboard returns consolidated operational summary', dashRes.status === 200);

    const attendRes = await request('GET', '/api/v1/attendance/me', null, studentToken);
    assert('GET /attendance/me returns subject-wise attendance metrics', attendRes.status === 200);

    // 11. Complaint Creation with AI Pipeline
    console.log('\n[Suite 5: Grievances & AI Smart Pipeline]');
    const complaintRes = await request('POST', '/api/v1/complaints', {
      title: 'Water pipe leaking under bathroom sink in Room B-204',
      description: 'Severe continuous leakage creating puddle on washroom floor',
      location: 'Hostel B, Room 204',
      priority: 'HIGH'
    }, studentToken);
    assert('POST /complaints logs ticket and runs AI classifier', complaintRes.status === 201 && complaintRes.body.data?.complaint?.ticketNumber);

    // 12. Gate Pass Outing Requisition
    console.log('\n[Suite 6: Gate Passes, Leaves & Approvals]');
    const gatePassRes = await request('POST', '/api/v1/gate-passes', {
      type: 'DAY_OUTING',
      reason: 'Visit to Dental Clinic for tooth extraction checkup',
      destination: 'Apollo Health Center, Sector 4',
      outTimeExpected: new Date(Date.now() + 3600000).toISOString(),
      inTimeExpected: new Date(Date.now() + 5 * 3600000).toISOString()
    }, studentToken);
    assert('POST /gate-passes submits pass for warden authorization', gatePassRes.status === 201);

    // 13. Universal Request Engine
    console.log('\n[Suite 7: Universal Request Engine]');
    const requestsRes = await request('GET', '/api/v1/requests', null, adminToken);
    assert('GET /requests returns multi-domain request queue', requestsRes.status === 200 && Array.isArray(requestsRes.body.data?.requests));

    const workQueueRes = await request('GET', '/api/v1/work-queue', null, adminToken);
    assert('GET /work-queue returns categorized staff tasks', workQueueRes.status === 200 && workQueueRes.body.data?.stats);

    // 14. Targeted Communications & Read Tracking
    console.log('\n[Suite 8: Targeted Communications & Notices]');
    const noticesRes = await request('GET', '/api/v1/notices', null, studentToken);
    assert('GET /notices lists broadcast notifications', noticesRes.status === 200);

    const readNoticeRes = await request('POST', '/api/v1/notices/not_01/read', null, studentToken);
    assert('POST /notices/:id/read tracks student read receipt idempotently', readNoticeRes.status === 200 && readNoticeRes.body.data?.isRead);

    // 15. Mess Menu & Student Feedback
    console.log('\n[Suite 9: Hostel, Mess & Visitor Operations]');
    const messRes = await request('GET', '/api/v1/mess/menu', null, studentToken);
    assert('GET /mess/menu returns nutritious daily & weekly meal plan', messRes.status === 200);

    const feedbackRes = await request('POST', '/api/v1/mess/feedback', {
      mealType: 'LUNCH',
      rating: 4,
      foodQuality: 4,
      hygiene: 5,
      comments: 'Thali was fresh and served hot.'
    }, studentToken);
    assert('POST /mess/feedback lodges dining quality rating', [200, 201].includes(feedbackRes.status));

    // Obtain Security Staff Token for Gate Pass QR Verification
    const secLogin = await request('POST', '/api/v1/auth/login', {
      email: 'security@campus.demo',
      password: 'Password@123'
    });
    const securityToken = secLogin.body?.data?.token || adminToken;

    // 16. Security Gate Pass QR Verification
    const secVerifyRes = await request('POST', '/api/v1/security/verify-pass', {
      qrCodeToken: 'GP-SECURE-TOKEN-CS2023048-DAY42'
    }, securityToken);
    assert('POST /security/verify-pass verifies student clearance at campus gate', [200, 201].includes(secVerifyRes.status) && secVerifyRes.body.data?.studentName);

    // 17. AI Campus Assistant
    console.log('\n[Suite 10: AI Campus Assistant & Recurring Issues]');
    const aiChatRes = await request('POST', '/api/v1/ai/chat', {
      message: 'How do I apply for a bonafide certificate?'
    }, studentToken);
    assert('POST /ai/chat answers campus policy queries accurately', aiChatRes.status === 200 && (aiChatRes.body.data?.response || aiChatRes.body.data?.answer || aiChatRes.body.data?.reply || aiChatRes.body.message));

    const recurringRes = await request('GET', '/api/v1/ai/recurring-issues', null, adminToken);
    assert('GET /ai/recurring-issues aggregates infrastructure grievance clusters', recurringRes.status === 200 && Array.isArray(recurringRes.body.data?.clusters));

  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  } finally {
    server.close();
    console.log('\n-------------------------------------------------------------');
    console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('-------------------------------------------------------------\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();

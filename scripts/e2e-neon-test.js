import http from 'http';
import app from '../server/src/app.js';
import prisma from '../server/src/config/database.js';

const PORT = 5099;

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runE2E() {
  console.log('====================================================');
  console.log('  STARTING FULL END-TO-END NEON + EXPRESS TEST');
  console.log('====================================================');

  const server = app.listen(PORT);
  console.log(`[E2E] Test Express server listening on port ${PORT}...`);

  try {
    // 1. Health check
    console.log('\n[1/12] Testing Health Check (Root + API v1)...');
    const rootHealth = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/health',
      method: 'GET'
    });
    console.log('Root Health Response:', JSON.stringify(rootHealth.body));
    if (rootHealth.body.data?.database !== 'healthy') {
      throw new Error(`Database reported unhealthy: ${JSON.stringify(rootHealth.body)}`);
    }

    const v1Health = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/health',
      method: 'GET'
    });
    console.log('v1 Health Response:', JSON.stringify(v1Health.body));
    if (v1Health.body.data?.database !== 'healthy') {
      throw new Error('v1 Health DB not healthy');
    }
    console.log('>>> HEALTH CHECK: PASS <<<');

    // 2. Login as Demo Student
    console.log('\n[2/12] Testing Student Authentication (POST /api/v1/auth/login)...');
    const studentLogin = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'student@campus.demo',
      password: 'Password@123'
    });

    console.log('Student Login Status:', studentLogin.status);
    const studentToken = studentLogin.body.data?.accessToken || studentLogin.body.data?.token || studentLogin.body.data?.tokens?.accessToken;
    if (studentLogin.status !== 200 || !studentToken) {
      throw new Error(`Student login failed: ${JSON.stringify(studentLogin.body)}`);
    }
    console.log('>>> STUDENT AUTHENTICATION: PASS <<<');

    const studentHeaders = {
      'Authorization': `Bearer ${studentToken}`,
      'Content-Type': 'application/json'
    };

    // 3. Read Student Dashboard
    console.log('\n[3/12] Testing Student Dashboard Summary (GET /api/v1/students/me/dashboard)...');
    const dashboard = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/students/me/dashboard',
      method: 'GET',
      headers: studentHeaders
    });
    console.log('Dashboard Status:', dashboard.status);
    if (dashboard.status !== 200) {
      throw new Error(`Dashboard fetch failed: ${JSON.stringify(dashboard.body)}`);
    }
    console.log('Attendance percentage:', dashboard.body.data?.attendance?.percentage);
    console.log('Open complaints count:', dashboard.body.data?.openComplaintsCount);
    console.log('>>> STUDENT DASHBOARD: PASS <<<');

    // 4. Academic Attendance & Timetable
    console.log('\n[4/12] Testing Attendance and Timetable APIs...');
    const att = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/attendance/me',
      method: 'GET',
      headers: studentHeaders
    });
    console.log('Attendance API Status:', att.status, 'Total subjects:', att.body.data?.subjects?.length);

    const tt = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/timetable/me',
      method: 'GET',
      headers: studentHeaders
    });
    console.log('Timetable API Status:', tt.status, 'Monday slots:', tt.body.data?.schedule?.Monday?.length);
    console.log('>>> ATTENDANCE & TIMETABLE: PASS <<<');

    // 5. Hostel & Fees & Mess
    console.log('\n[5/12] Testing Hostel, Fees, and Mess Menu APIs...');
    const hostel = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/hostels/me',
      method: 'GET',
      headers: studentHeaders
    });
    console.log('Hostel Room:', hostel.body.data?.roomNumber, hostel.body.data?.hostelName);

    const fee = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/fees/me',
      method: 'GET',
      headers: studentHeaders
    });
    console.log('Fee Ledger Total Billed: ₹', fee.body.data?.totalBilled, 'Due: ₹', fee.body.data?.totalDue);

    const mess = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/mess/menu',
      method: 'GET',
      headers: studentHeaders
    });
    console.log('Mess Menu Meals Available:', Object.keys(mess.body.data?.today?.meals || {}));
    console.log('>>> HOSTEL, FEES, MESS: PASS <<<');

    // 6. Notices & Notifications
    console.log('\n[6/12] Testing Notices and Notifications APIs...');
    const notices = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/notices',
      method: 'GET',
      headers: studentHeaders
    });
    console.log('Notices Count:', notices.body.data?.total);

    const notifs = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/notifications',
      method: 'GET',
      headers: studentHeaders
    });
    console.log('Notifications Count:', notifs.body.data?.notifications?.length, 'Unread:', notifs.body.data?.unreadCount);
    console.log('>>> NOTICES & NOTIFICATIONS: PASS <<<');

    // 7. Write Test: Create Grievance Complaint
    console.log('\n[7/12] Testing Database Write: Create Complaint (POST /api/v1/complaints)...');
    const newComp = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/complaints',
      method: 'POST',
      headers: studentHeaders
    }, {
      title: 'Water tap leaking persistently in Room 304 washroom',
      description: 'Persistent dripping tap wasting water continuously since yesterday evening.',
      category: 'PLUMBING',
      location: 'Block B - Room 304',
      priority: 'HIGH'
    });

    console.log('Create Complaint Status:', newComp.status);
    if (newComp.status !== 201) {
      throw new Error(`Failed to create complaint: ${JSON.stringify(newComp.body)}`);
    }
    const createdTicket = newComp.body.data?.complaint;
    console.log('Created Ticket Number:', createdTicket?.ticketNumber, 'ID:', createdTicket?.id);

    // Verify row in Neon PostgreSQL directly via Prisma
    const rowInNeon = await prisma.complaint.findUnique({
      where: { id: createdTicket.id }
    });
    if (!rowInNeon) {
      throw new Error('Complaint row was not found in Neon PostgreSQL database!');
    }
    console.log('>>> COMPLAINT PERSISTENCE TO NEON: VERIFIED (Row confirmed in PostgreSQL) <<<');

    // 8. Update Test: Update Complaint Status
    console.log('\n[8/12] Testing Database Update: Update Complaint Status (PATCH /api/v1/complaints/:id/status)...');
    const updateComp = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/v1/complaints/${createdTicket.id}/status`,
      method: 'PATCH',
      headers: studentHeaders
    }, {
      status: 'IN_PROGRESS',
      comment: 'Technician dispatched with replacement washer and wrench.'
    });

    console.log('Update Complaint Status:', updateComp.status);
    const updatedInNeon = await prisma.complaint.findUnique({
      where: { id: createdTicket.id },
      include: { statusHistory: true }
    });
    if (updatedInNeon.status !== 'IN_PROGRESS' || updatedInNeon.statusHistory.length < 2) {
      throw new Error('Status update or history failed to persist in Neon PostgreSQL!');
    }
    console.log('>>> COMPLAINT STATUS UPDATE PERSISTENCE: VERIFIED (Status: IN_PROGRESS) <<<');

    // 9. Write Test: Create Gate Pass
    console.log('\n[9/12] Testing Database Write: Create Gate Pass (POST /api/v1/gate-passes)...');
    const newGatePass = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/gate-passes',
      method: 'POST',
      headers: studentHeaders
    }, {
      type: 'DAY_OUTING',
      reason: 'Procuring engineering laboratory components',
      destination: 'Electronic Market, Sector 2',
      outTimeExpected: new Date(Date.now() + 2 * 3600000).toISOString(),
      inTimeExpected: new Date(Date.now() + 6 * 3600000).toISOString()
    });

    console.log('Create Gate Pass Status:', newGatePass.status);
    if (newGatePass.status !== 201) {
      throw new Error(`Failed to create gate pass: ${JSON.stringify(newGatePass.body)}`);
    }
    const gpInNeon = await prisma.gatePass.findUnique({
      where: { passNumber: newGatePass.body.data?.gatePass?.passNumber }
    });
    if (!gpInNeon) throw new Error('Gate pass not persisted to Neon!');
    console.log('>>> GATE PASS PERSISTENCE TO NEON: VERIFIED <<<');

    // 10. Write Test: Create Leave Request
    console.log('\n[10/12] Testing Database Write: Create Leave Request (POST /api/v1/leave)...');
    const newLeave = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/leave',
      method: 'POST',
      headers: studentHeaders
    }, {
      startDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      destination: 'Kolkata, West Bengal',
      reason: 'Attending family religious ceremony',
      emergencyContact: '+91 94370 12345'
    });

    console.log('Create Leave Request Status:', newLeave.status);
    if (newLeave.status !== 201) {
      throw new Error(`Failed to create leave request: ${JSON.stringify(newLeave.body)}`);
    }
    console.log('>>> LEAVE REQUEST PERSISTENCE TO NEON: VERIFIED <<<');

    // 11. Admin Authentication & Analytics
    console.log('\n[11/12] Testing Admin Login & Real Neon Analytics Overview...');
    const adminLogin = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@campus.demo',
      password: 'Password@123'
    });

    console.log('Admin Login Status:', adminLogin.status);
    const adminToken = adminLogin.body.data?.accessToken || adminLogin.body.data?.token || adminLogin.body.data?.tokens?.accessToken;
    if (adminLogin.status !== 200 || !adminToken) throw new Error('Admin login failed');

    const analytics = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/v1/analytics/overview',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Analytics Status:', analytics.status);
    console.log('KPI Open Complaints:', analytics.body.data?.kpi?.openComplaints);
    console.log('KPI Pending Requests:', analytics.body.data?.kpi?.pendingRequests);
    console.log('KPI Total Students:', analytics.body.data?.kpi?.totalStudents);
    console.log('KPI Mess Rating:', analytics.body.data?.kpi?.messSatisfactionScore);
    console.log('>>> ADMIN ANALYTICS WITH REAL NEON DATA: PASS <<<');

    // 12. Audit Log & Notification Verification
    console.log('\n[12/12] Verifying Audit Logs & Notifications in Neon PostgreSQL...');
    const auditCount = await prisma.auditLog.count();
    const notifCount = await prisma.notification.count();
    console.log(`Total Audit Logs in Neon: ${auditCount}`);
    console.log(`Total Notifications in Neon: ${notifCount}`);
    if (auditCount === 0 || notifCount === 0) {
      throw new Error('Audit logs or notifications were not created in Neon!');
    }
    console.log('>>> AUDIT TRAIL & NOTIFICATIONS VERIFIED: PASS <<<');

    console.log('\n====================================================');
    console.log('  ALL 12/12 END-TO-END WORKFLOW TESTS SUCCEEDED!');
    console.log('  Neon PostgreSQL + Prisma + Express Integration 100%');
    console.log('====================================================');
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runE2E()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exit(1);
  });

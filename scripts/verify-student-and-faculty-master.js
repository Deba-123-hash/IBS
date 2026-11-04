// scripts/verify-student-and-faculty-master.js
// Automated verification suite for Student, Faculty, Admin, and Technician modules

import http from 'http';

const BASE_URL = 'http://localhost:5000/api/v1';

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function login(email, password = 'Password@123') {
  const res = await request('/auth/login', { method: 'POST' }, { email, password });
  return res.data?.data?.token || res.data?.token;
}

async function runSuite() {
  console.log('===============================================================');
  console.log('  CAMPUSOS STUDENT, FACULTY & ENTERPRISE MASTER AUDIT SUITE    ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message} ${details ? '- ' + JSON.stringify(details) : ''}`);
      failed++;
    }
  }

  // 1. Student Authentication & Session
  console.log('--- SECTION 1: Student Authentication & Identity ---');
  const studentToken = await login('student@campus.demo');
  assert(!!studentToken, 'Student login successful (student@campus.demo)');

  const studentAuth = { headers: { Authorization: `Bearer ${studentToken}` } };

  const me = await request('/auth/me', studentAuth);
  assert(me.status === 200 && me.data?.data?.role === 'STUDENT', 'Student identity verified via /auth/me');

  // 2. Student Dashboard & Academic Telemetry
  console.log('\n--- SECTION 2: Student Dashboard & Academic Telemetry ---');
  const studentDash = await request('/student/dashboard', studentAuth);
  assert(studentDash.status === 200 && studentDash.data?.success, 'Student Dashboard telemetry loaded');

  const profile = await request('/student/profile', studentAuth);
  assert(profile.status === 200 && profile.data?.data?.rollNumber, `Student Profile loaded (Roll: ${profile.data?.data?.rollNumber})`);

  const attendance = await request('/student/attendance', studentAuth);
  assert(attendance.status === 200, 'Student Attendance history retrieved');

  const attSummary = await request('/student/attendance/summary', studentAuth);
  assert(attSummary.status === 200, 'Student Attendance summary calculation retrieved');

  // 3. Student Residential & Hostel Operations
  console.log('\n--- SECTION 3: Student Residential, Fees & Complaints ---');
  const hostel = await request('/student/hostel', studentAuth);
  assert(hostel.status === 200, 'Student Hostel allocation record retrieved');

  const room = await request('/student/room', studentAuth);
  assert(room.status === 200, 'Student Room details retrieved');

  const fees = await request('/student/fees', studentAuth);
  assert(fees.status === 200, 'Student Fee ledger records retrieved');

  const payments = await request('/student/payments', studentAuth);
  assert(payments.status === 200, 'Student Verified payment history retrieved');

  const complaints = await request('/student/complaints', studentAuth);
  const compList = complaints.data?.data?.complaints || complaints.data?.data || [];
  assert(complaints.status === 200 && Array.isArray(compList), `Student Complaints tracking (${compList.length} tickets)`);

  // Test Student Complaint Submission
  const newComp = await request('/student/complaints', { method: 'POST', ...studentAuth }, {
    title: 'Ceiling fan speed regulator faulty in room',
    description: 'The knob spins freely and regulator cannot change speed',
    category: 'ELECTRICAL',
    location: 'Room 304'
  });
  assert(newComp.status === 200 || newComp.status === 201, 'Student Complaint submission functional');

  // 4. Student Leave & Visitor Requests
  console.log('\n--- SECTION 4: Student Leave & Gate Pass Requests ---');
  const leaves = await request('/student/leave-requests', studentAuth);
  const leaveList = leaves.data?.data?.leaveRequests || leaves.data?.data || [];
  assert(leaves.status === 200 && Array.isArray(leaveList), `Student Leave request records (${leaveList.length} requests)`);

  const visitors = await request('/student/visitor-requests', studentAuth);
  const visList = visitors.data?.data?.visitorRequests || visitors.data?.data || [];
  assert(visitors.status === 200 && Array.isArray(visList), `Student Visitor request history (${visList.length} requests)`);

  // 5. Student Security & IDOR Enforcement
  console.log('\n--- SECTION 5: Student IDOR & RBAC Protection ---');
  // Attempt to access Admin APIs with Student Token -> Must be 403
  const badAdminAccess = await request('/admin/users', studentAuth);
  assert(badAdminAccess.status === 403, 'Student blocked from Admin user directory (403 Forbidden)');

  const badWardenAccess = await request('/warden/rooms', studentAuth);
  assert(badWardenAccess.status === 403, 'Student blocked from Warden room management (403 Forbidden)');

  const badAccountsAccess = await request('/accounts/overview', studentAuth);
  assert(badAccountsAccess.status === 403, 'Student blocked from Accounts overview (403 Forbidden)');

  // 6. Faculty Operations & Telemetry
  console.log('\n--- SECTION 6: Faculty Operations & Workstation ---');
  const facultyToken = await login('faculty@campus.demo');
  assert(!!facultyToken, 'Faculty login successful (faculty@campus.demo)');

  const facultyAuth = { headers: { Authorization: `Bearer ${facultyToken}` } };

  const facDash = await request('/faculty/dashboard', facultyAuth);
  assert(facDash.status === 200 && facDash.data?.success, 'Faculty Dashboard telemetry endpoint loaded');

  const facClasses = await request('/faculty/classes', facultyAuth);
  const classList = facClasses.data?.data || [];
  assert(facClasses.status === 200 && Array.isArray(classList) && classList.length > 0, `Faculty assigned cohorts (${classList.length} batches)`);

  const facStudents = await request('/faculty/students', facultyAuth);
  const studentRoster = facStudents.data?.data || [];
  assert(facStudents.status === 200 && Array.isArray(studentRoster) && studentRoster.length > 0, `Faculty student directory roster (${studentRoster.length} students)`);

  // Faculty Mark Attendance Action
  if (studentRoster.length > 0) {
    const markAtt = await request('/faculty/attendance', { method: 'POST', ...facultyAuth }, {
      batchId: classList[0]?.id || 'CSE-2023',
      date: new Date().toISOString(),
      attendanceRecords: [
        { studentId: studentRoster[0].id, status: 'PRESENT' }
      ]
    });
    assert(markAtt.status === 200 || markAtt.status === 201, `Faculty Mark Class Attendance functional for student ${studentRoster[0].rollNumber}`);
  }

  // 7. Faculty Security & Scope
  console.log('\n--- SECTION 7: Faculty RBAC & Scope Protection ---');
  const badFacAdmin = await request('/admin/users', facultyAuth);
  assert(badFacAdmin.status === 403, 'Faculty blocked from Super Admin user management (403 Forbidden)');

  const badFacWarden = await request('/warden/room-allocations', { method: 'POST', ...facultyAuth }, {});
  assert(badFacWarden.status === 403, 'Faculty blocked from Warden room allocation (403 Forbidden)');

  console.log('\n===============================================================');
  console.log(` FINAL AUDIT RESULT: ${passed} PASSED, ${failed} FAILED `);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Master suite execution error:', err);
  process.exit(1);
});


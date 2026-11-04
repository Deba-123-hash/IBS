// scripts/verify-master-repairs.js
// Automated verification script for all repaired modules and role workflows

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

const ROLES = [
  { role: 'WARDEN', email: 'warden@campus.demo' },
  { role: 'SUPER_ADMIN', email: 'superadmin@campus.demo' },
  { role: 'ADMIN', email: 'admin@campus.demo' },
  { role: 'STUDENT', email: 'student@campus.demo' },
  { role: 'MAINTENANCE', email: 'maintenance@campus.demo' },
  { role: 'SECURITY', email: 'security@campus.demo' },
  { role: 'ACCOUNTS', email: 'accounts@campus.demo' },
  { role: 'FACULTY', email: 'faculty@campus.demo' }
];

async function runTests() {
  console.log('====================================================');
  console.log('   CAMPUSOS MASTER INTEGRATION & ROLE AUDIT SUITE   ');
  console.log('====================================================\n');

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

  // 1. Health Check
  console.log('--- 1. API Health Check ---');
  try {
    const health = await request('/health');
    assert(health.status === 200 && health.data?.success, 'Health check endpoint returns 200 OK');
  } catch (err) {
    assert(false, 'Health check endpoint unreachable', err.message);
  }

  // 2. Role Authentication Tokens
  console.log('\n--- 2. Universal Role Authentication ---');
  const tokens = {};
  for (const { role, email } of ROLES) {
    try {
      const res = await request('/auth/login', { method: 'POST' }, {
        email,
        password: 'Password@123'
      });
      const token = res.data?.data?.token || res.data?.token || res.data?.data?.accessToken;
      tokens[role] = token;
      assert(res.status === 200 && !!token, `Login successful for ${role} (${email})`);
    } catch (err) {
      assert(false, `Login failed for ${role}`, err.message);
    }
  }

  // 3. Warden Module Endpoints
  console.log('\n--- 3. Warden Operations & Real Data Verification ---');
  const wardenAuth = { headers: { Authorization: `Bearer ${tokens['WARDEN']}` } };

  try {
    const dash = await request('/warden/dashboard', wardenAuth);
    assert(dash.status === 200 && dash.data?.success, 'Warden Dashboard telemetry endpoint');

    const rooms = await request('/warden/rooms', wardenAuth);
    const roomList = rooms.data?.data?.rooms || rooms.data?.data || [];
    assert(rooms.status === 200 && Array.isArray(roomList) && roomList.length > 0, `Warden Rooms inventory (${roomList.length} rooms retrieved)`);

    const leaves = await request('/warden/leave-requests', wardenAuth);
    const leaveList = leaves.data?.data?.leaveRequests || leaves.data?.data || [];
    assert(leaves.status === 200 && Array.isArray(leaveList), `Warden Leave requests list (${leaveList.length} records)`);

    const complaints = await request('/warden/complaints', wardenAuth);
    const compList = complaints.data?.data?.complaints || complaints.data?.data || [];
    assert(complaints.status === 200 && Array.isArray(compList), `Warden Complaints list (${compList.length} records)`);

    const students = await request('/warden/students', wardenAuth);
    const studentList = students.data?.data?.students || students.data?.data || [];
    assert(students.status === 200 && Array.isArray(studentList), `Warden Student directory (${studentList.length} records)`);

    const gatepasses = await request('/gatepass', wardenAuth);
    const gpList = gatepasses.data?.data?.gatePasses || gatepasses.data?.data || [];
    assert(gatepasses.status === 200 && Array.isArray(gpList), `Warden Gate passes list (${gpList.length} records)`);
  } catch (err) {
    assert(false, 'Warden endpoint failure', err.message);
  }

  // 4. Maintenance / Technician Module
  console.log('\n--- 4. Maintenance & Technician Operations ---');
  const staffAuth = { headers: { Authorization: `Bearer ${tokens['MAINTENANCE']}` } };

  try {
    const queue = await request('/work-queue', staffAuth);
    assert(queue.status === 200 && queue.data?.success, 'Work Queue retrieval for Maintenance Technician');

    const complaints = await request('/complaints', staffAuth);
    const list = complaints.data?.data?.complaints || complaints.data?.data || [];
    assert(complaints.status === 200 && Array.isArray(list) && list.length > 0, `Technician Complaints list (${list.length} complaints)`);

    if (list.length > 0) {
      const firstId = list[0].id;
      const addComment = await request(`/complaints/${firstId}/comments`, { method: 'POST', ...staffAuth }, {
        content: 'Diagnostic check complete. Parts in stock.'
      });
      assert(addComment.status === 200 || addComment.status === 201, `Maintenance work comment added to complaint ${firstId}`);
    }
  } catch (err) {
    assert(false, 'Technician endpoint failure', err.message);
  }

  // 5. Security Module
  console.log('\n--- 5. Security & Gate Operations ---');
  const secAuth = { headers: { Authorization: `Bearer ${tokens['SECURITY']}` } };

  try {
    const secDash = await request('/security/dashboard', secAuth);
    assert(secDash.status === 200 && secDash.data?.success, 'Security Dashboard telemetry');

    const visitors = await request('/security/visitors', secAuth);
    const visitorList = visitors.data?.data?.visitors || visitors.data?.data || [];
    assert(visitors.status === 200 && Array.isArray(visitorList), `Visitor registry retrieval (${visitorList.length} visitors)`);

    const gateLogs = await request('/security/gate/logs', secAuth);
    const logList = gateLogs.data?.data || [];
    assert(gateLogs.status === 200 && Array.isArray(logList), `Gate crossing logs retrieval (${logList.length} entries)`);

    const emergencies = await request('/security/emergency', secAuth);
    const emList = emergencies.data?.data || [];
    assert(emergencies.status === 200 && Array.isArray(emList), `Emergency alerts retrieval (${emList.length} alerts)`);

    // Test visitor creation with validated payload
    const newVisitor = await request('/security/visitors', { method: 'POST', ...secAuth }, {
      fullName: 'Dr. Alok Verma',
      phoneNumber: '9876543210',
      idProofType: 'GOVERNMENT_ID',
      idProofNumber: 'IND-DL-94819'
    });
    assert(newVisitor.status === 200 || newVisitor.status === 201, 'Security Register Visitor action functional');
  } catch (err) {
    assert(false, 'Security endpoint failure', err.message);
  }

  // 6. Accounts Module
  console.log('\n--- 6. Accounts & Treasury Operations ---');
  const accAuth = { headers: { Authorization: `Bearer ${tokens['ACCOUNTS']}` } };

  try {
    const overview = await request('/accounts/dashboard', accAuth);
    assert(overview.status === 200 && overview.data?.success, 'Accounts Treasury Overview metrics');

    const expenses = await request('/accounts/expenses', accAuth);
    const expList = expenses.data?.data?.expenses || expenses.data?.data || [];
    assert(expenses.status === 200 && Array.isArray(expList), `Operating expenses list (${expList.length} records)`);

    const reconciliations = await request('/accounts/reconciliation', accAuth);
    const recList = reconciliations.data?.data?.reconciliations || reconciliations.data?.data || [];
    assert(reconciliations.status === 200 && Array.isArray(recList), `Bank reconciliations list (${recList.length} records)`);

    const payments = await request('/accounts/transactions', accAuth);
    const payList = payments.data?.data?.transactions || payments.data?.data || [];
    assert(payments.status === 200 && Array.isArray(payList), `Financial transactions list (${payList.length} records)`);
  } catch (err) {
    assert(false, 'Accounts endpoint failure', err.message);
  }

  // 7. Admin & Audit Logs
  console.log('\n--- 7. Super Admin & Governance ---');
  const adminAuth = { headers: { Authorization: `Bearer ${tokens['SUPER_ADMIN']}` } };

  try {
    const users = await request('/admin/users', adminAuth);
    const userList = users.data?.data || [];
    assert(users.status === 200 && Array.isArray(userList) && userList.length > 0, `Admin User Directory (${userList.length} total registered accounts)`);

    const audit = await request('/admin/audit-logs', adminAuth);
    const auditList = audit.data?.data || [];
    assert(audit.status === 200 && Array.isArray(auditList), `Admin Audit Logs access (${auditList.length} logged events)`);
  } catch (err) {
    assert(false, 'Admin endpoint failure', err.message);
  }

  console.log('\n====================================================');
  console.log(` AUDIT RESULT: ${passed} PASSED, ${failed} FAILED `);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

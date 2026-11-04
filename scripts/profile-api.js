import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api/v1';

async function timeRequest(name, method, url, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const start = performance.now();
  let status, responseSize, errorMsg = null;

  try {
    const res = await fetch(API_BASE + url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    status = res.status;
    const text = await res.text();
    responseSize = text.length;
  } catch (err) {
    status = 'ERROR';
    errorMsg = err.message;
  }
  const end = performance.now();
  const duration = Math.round(end - start);

  console.log(`[${name}] ${method} ${url}`);
  console.log(`  -> Time: ${duration}ms | Status: ${status} | Size: ${responseSize ? responseSize + ' bytes' : 'N/A'}`);
  if (errorMsg) console.log(`  -> Error: ${errorMsg}`);
  return { name, method, url, duration, status, responseSize, errorMsg };
}

async function runProfiles() {
  console.log('--- API Performance Baseline ---');
  
  // 1. Admin Login
  const loginRes = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@campus.demo', password: 'Password@123' })
  });
  const loginData = await loginRes.json();
  const adminToken = loginData.data.token;

  // 2. Student Login
  const studentLoginRes = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@campus.demo', password: 'Password@123' })
  });
  const studentLoginData = await studentLoginRes.json();
  const studentToken = studentLoginData.data.token;

  // Timing logins
  await timeRequest('Admin Login', 'POST', '/auth/login', { email: 'admin@campus.demo', password: 'Password@123' });
  await timeRequest('Student Login', 'POST', '/auth/login', { email: 'student@campus.demo', password: 'Password@123' });

  // 3. Admin Dashboard
  await timeRequest('Admin Stats', 'GET', '/admin/overview', null, adminToken);
  await timeRequest('Admin Users', 'GET', '/admin/users', null, adminToken);
  
  // 4. Student Endpoints
  await timeRequest('Student Dashboard', 'GET', '/students/dashboard-summary', null, studentToken);
  await timeRequest('Student Profile', 'GET', '/students/profile', null, studentToken);
  await timeRequest('Student Attendance', 'GET', '/attendance/me', null, studentToken);
  
  console.log('--- Profiling Complete ---');
}

runProfiles().catch(console.error);

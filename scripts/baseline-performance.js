async function benchmark() {
  console.log('================================================================');
  console.log('  UNIFIX TECH — RUNTIME BASELINE PERFORMANCE TEST');
  console.log('================================================================');

  const CLIENT_BASE = 'http://localhost:5173';
  const API_BASE = 'http://localhost:5000/api/v1';

  const measureFetch = async (name, url, options = {}) => {
    const t0 = performance.now();
    try {
      const res = await fetch(url, options);
      const t1 = performance.now();
      const duration = Math.round(t1 - t0);
      console.log(`${name.padEnd(28)}: ${duration} ms (HTTP ${res.status})`);
      return { duration, status: res.status, ok: res.ok, res };
    } catch (e) {
      console.log(`${name.padEnd(28)}: ERROR (${e.message})`);
      return { duration: -1, status: 500, ok: false, error: e.message };
    }
  };

  // 1. Initial Load
  const initLoad = await measureFetch('Initial Load (Landing)', `${CLIENT_BASE}/`);
  const loginPageLoad = await measureFetch('Login Page (/loginsvg)', `${CLIENT_BASE}/loginsvg`);
  const healthCheck = await measureFetch('Backend Health (/health)', `http://localhost:5000/health`);

  // 2. Student Authentication
  const tAuthStart = performance.now();
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@campus.demo', password: 'Password@123' })
  });
  const tAuthEnd = performance.now();
  const authDuration = Math.round(tAuthEnd - tAuthStart);
  const loginData = await loginRes.json();
  const studentToken = loginData.data?.token;
  console.log(`Student Login API           : ${authDuration} ms (Role: ${loginData.data?.user?.role || 'N/A'})`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${studentToken}`
  };

  // 3. Student Services
  const dash = await measureFetch('Student Dashboard Summary', `${API_BASE}/students/dashboard-summary`, { headers: authHeaders });
  const att = await measureFetch('Student Attendance (/me)', `${API_BASE}/attendance/me`, { headers: authHeaders });
  const comp = await measureFetch('Complaints (/complaints)', `${API_BASE}/complaints`, { headers: authHeaders });
  const gp = await measureFetch('Gate Pass (/gatepass)', `${API_BASE}/gatepass`, { headers: authHeaders });
  const hostel = await measureFetch('Hostel (/hostel/me)', `${API_BASE}/hostel/me`, { headers: authHeaders });
  const fees = await measureFetch('Fees (/fees/me)', `${API_BASE}/fees/me`, { headers: authHeaders });

  // 4. Chatbot Attendance Query
  const tChat0 = performance.now();
  const chatRes = await fetch(`${API_BASE}/ai/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ message: 'What is my attendance?' })
  });
  const tChat1 = performance.now();
  const chatDuration = Math.round(tChat1 - tChat0);
  const chatData = await chatRes.json();
  console.log(`Chatbot Attendance Query    : ${chatDuration} ms (Grounded DB reply: ${chatData.message?.includes('88%') ? 'YES' : 'NO'})`);

  // 5. Admin Authentication & Dashboard
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sahoodebatosh782@gmail', password: 'Deba@2004' })
  });
  const adminLoginData = await adminLoginRes.json();
  const adminToken = adminLoginData.data?.token;
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };
  const adminDash = await measureFetch('Admin Dashboard Stats', `${API_BASE}/admin/dashboard-stats`, { headers: adminHeaders });

  console.log('\n================================================================');
  console.log('SUMMARY TABLE:');
  console.log('================================================================');
  console.log(`Initial Load        : ${initLoad.duration} ms`);
  console.log(`Login               : ${authDuration} ms`);
  console.log(`Student Dashboard   : ${dash.duration} ms`);
  console.log(`Attendance          : ${att.duration} ms`);
  console.log(`Complaints          : ${comp.duration} ms`);
  console.log(`Gate Pass           : ${gp.duration} ms`);
  console.log(`Admin Dashboard     : ${adminDash.duration} ms`);
  console.log(`Chatbot             : ${chatDuration} ms`);
  console.log('================================================================');
}

benchmark().catch(console.error);

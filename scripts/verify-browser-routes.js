import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

const BROWSER_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

class CdpSession {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.pending = new Map();
    this.consoleErrors = [];
    this.pageErrors = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          if (msg.params.type === 'error') {
            const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
            this.consoleErrors.push(text);
          }
        }
        if (msg.method === 'Runtime.exceptionThrown') {
          this.pageErrors.push(msg.params.exceptionDetails?.text || 'Exception');
        }
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function run() {
  console.log('\n================================================================');
  console.log('  CAMPHUB LIVE BROWSER NAVIGATION & RUNTIME ROUTE VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function report(id, desc, ok, extra = '') {
    if (ok) {
      console.log(`  ✓ [${id}] ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ [${id}] ${desc} ${extra ? `-> ${extra}` : ''}`);
      failed++;
    }
  }

  // 1. Launch Vite preview server
  console.log('  Starting Vite preview server on http://localhost:4173...');
  const previewProc = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    cwd: path.resolve('client'),
    shell: true,
    stdio: 'pipe'
  });

  // Give preview a moment to start
  await new Promise(r => setTimeout(r, 2500));

  // 2. Launch headless browser
  console.log('  Launching Headless Chromium on port 9230...');
  const browserProc = spawn(BROWSER_PATH, [
    '--headless=new',
    '--remote-debugging-port=9230',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const versionRes = await fetch('http://127.0.0.1:9230/json/version');
    const versionData = await versionRes.json();
    console.log(`  ✓ Chromium Debugger Connected (${versionData.Browser})\n`);

    const newTabRes = await fetch('http://127.0.0.1:9230/json/new?http://localhost:4173/', { method: 'PUT' });
    const tabData = await newTabRes.json();
    const cdp = new CdpSession(tabData.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    const navigateTo = async (pathname, waitMs = 1200) => {
      const url = `http://localhost:4173${pathname}`;
      await cdp.send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, waitMs));
      return await cdp.evaluate(`(() => {
        return {
          url: window.location.href,
          pathname: window.location.pathname,
          title: document.title,
          bodyText: document.body.innerText || '',
          hasError: document.body.innerText.includes('Something went wrong') ||
                    document.body.innerText.includes('Cannot GET')
        };
      })()`);
    };

    // Suite A: Public Pages
    console.log('[Suite A: Direct URL Navigation — Public Pages]');
    
    let info = await navigateTo('/');
    report('BR-PUB-01', 'Direct load "/" renders Campus landing page', 
      info.pathname === '/' && !info.hasError && info.bodyText.length > 100);

    info = await navigateTo('/about');
    report('BR-PUB-02', 'Direct load "/about" renders Institutional About page', 
      info.pathname === '/about' && !info.hasError);

    info = await navigateTo('/help');
    report('BR-PUB-03', 'Direct load "/help" renders Campus Support page', 
      info.pathname === '/help' && !info.hasError);

    info = await navigateTo('/login');
    report('BR-PUB-04', 'Direct load "/login" renders Secure Authentication page', 
      info.pathname === '/login' && !info.hasError && info.bodyText.includes('Sign In'));

    info = await navigateTo('/forbidden');
    report('BR-PUB-05', 'Direct load "/forbidden" renders Error 403 page', 
      info.pathname === '/forbidden' && info.bodyText.includes('403'));

    info = await navigateTo('/unauthorized');
    report('BR-PUB-06', 'Direct load "/unauthorized" alias renders Error 403 page', 
      info.pathname === '/unauthorized' && info.bodyText.includes('403'));

    // Suite B: 404 Catch-All & Direct 404
    console.log('\n[Suite B: 404 Routing & Error Fallback]');

    info = await navigateTo('/non-existent-campus-page-12345');
    report('BR-404-01', 'Arbitrary invalid path renders 404 Lost in Campus Space page', 
      info.bodyText.includes('404') && (info.bodyText.includes('Lost in Campus Digital Space') || info.bodyText.includes('Destination Not Found')));

    info = await navigateTo('/student/definitely-not-a-real-subpage');
    report('BR-404-02', 'Invalid nested student path renders 404 page', 
      info.bodyText.includes('404'));

    // Suite C: Unauthenticated Protected Route Bounces
    console.log('\n[Suite C: Unauthenticated Access & Login Bouncing]');

    // Clear any localStorage
    await cdp.evaluate(`localStorage.clear()`);

    info = await navigateTo('/student/dashboard');
    report('BR-AUTH-01', 'Unauthenticated /student/dashboard bounces to /login', 
      info.pathname === '/login');

    info = await navigateTo('/admin/dashboard');
    report('BR-AUTH-02', 'Unauthenticated /admin/dashboard bounces to /login', 
      info.pathname === '/login');

    info = await navigateTo('/warden/dashboard');
    report('BR-AUTH-03', 'Unauthenticated /warden/dashboard bounces to /login', 
      info.pathname === '/login');

    info = await navigateTo('/maintenance/dashboard');
    report('BR-AUTH-04', 'Unauthenticated /maintenance/dashboard bounces to /login', 
      info.pathname === '/login');

    info = await navigateTo('/security/dashboard');
    report('BR-AUTH-05', 'Unauthenticated /security/dashboard bounces to /login', 
      info.pathname === '/login');

    info = await navigateTo('/accountant/dashboard');
    report('BR-AUTH-06', 'Unauthenticated /accountant/dashboard bounces to /login', 
      info.pathname === '/login');

    // Suite D: Authenticated STUDENT Perspective
    console.log('\n[Suite D: Authenticated STUDENT Role Access & Boundary Enforcement]');

    await cdp.evaluate(`(() => {
      localStorage.setItem('campus_auth_token', 'mock_student_jwt_token_for_phase2');
      localStorage.setItem('campus_user', JSON.stringify({
        id: 'student-uuid-test',
        firstName: 'Aarav',
        lastName: 'Sharma',
        email: 'student.demo@campus.edu',
        role: 'STUDENT',
        permissions: ['STUDENT_READ_OWN', 'ATTENDANCE_READ_OWN', 'FEES_READ_OWN', 'COMPLAINT_READ_OWN', 'NOTICE_READ']
      }));
    })()`);

    info = await navigateTo('/student/dashboard');
    report('BR-STUDENT-01', 'STUDENT successfully accesses /student/dashboard', 
      info.pathname === '/student/dashboard' && !info.hasError);

    info = await navigateTo('/student/attendance');
    report('BR-STUDENT-02', 'STUDENT navigates directly to /student/attendance', 
      info.pathname === '/student/attendance' && !info.hasError);

    info = await navigateTo('/student/fees');
    report('BR-STUDENT-03', 'STUDENT navigates directly to /student/fees', 
      info.pathname === '/student/fees' && !info.hasError);

    info = await navigateTo('/student/payments');
    report('BR-STUDENT-04', 'STUDENT accesses /student/payments alias without error', 
      (info.pathname === '/student/payments' || info.pathname === '/student/fees') && !info.hasError);

    info = await navigateTo('/admin/dashboard');
    report('BR-STUDENT-05', 'STUDENT accessing /admin/dashboard is blocked and redirected to /403', 
      info.pathname === '/403' || info.pathname === '/forbidden');

    info = await navigateTo('/warden/dashboard');
    report('BR-STUDENT-06', 'STUDENT accessing /warden/dashboard is blocked and redirected to /403', 
      info.pathname === '/403' || info.pathname === '/forbidden');

    info = await navigateTo('/maintenance/dashboard');
    report('BR-STUDENT-07', 'STUDENT accessing /maintenance/dashboard is blocked and redirected to /403', 
      info.pathname === '/403' || info.pathname === '/forbidden');

    info = await navigateTo('/security/dashboard');
    report('BR-STUDENT-08', 'STUDENT accessing /security/dashboard is blocked and redirected to /403', 
      info.pathname === '/403' || info.pathname === '/forbidden');

    info = await navigateTo('/accountant/dashboard');
    report('BR-STUDENT-09', 'STUDENT accessing /accountant/dashboard is blocked and redirected to /403', 
      info.pathname === '/403' || info.pathname === '/forbidden');

    // Suite E: Authenticated WARDEN Perspective
    console.log('\n[Suite E: Authenticated WARDEN Role Access & Boundary Enforcement]');

    await cdp.evaluate(`(() => {
      localStorage.setItem('campus_auth_token', 'mock_warden_jwt_token_for_phase2');
      localStorage.setItem('campus_user', JSON.stringify({
        id: 'warden-uuid-test',
        firstName: 'Suresh',
        lastName: 'Patel',
        email: 'warden.demo@campus.edu',
        role: 'WARDEN',
        permissions: ['HOSTEL_MANAGE', 'HOSTEL_READ_ALL', 'ROOM_ASSIGN', 'LEAVE_APPROVE', 'COMPLAINT_READ_ALL', 'NOTICE_READ']
      }));
    })()`);

    info = await navigateTo('/warden/dashboard');
    report('BR-WARDEN-01', 'WARDEN successfully accesses /warden/dashboard', 
      info.pathname === '/warden/dashboard' && !info.hasError);

    info = await navigateTo('/warden/hostels');
    report('BR-WARDEN-02', 'WARDEN accesses /warden/hostels alias', 
      info.pathname === '/warden/hostels' && !info.hasError);

    info = await navigateTo('/security/gate-entry');
    report('BR-WARDEN-03', 'WARDEN accessing /security/gate-entry is blocked and redirected to /403', 
      info.pathname === '/403' || info.pathname === '/forbidden');

    info = await navigateTo('/admin/users');
    report('BR-WARDEN-04', 'WARDEN accessing /admin/users is blocked and redirected to /403', 
      info.pathname === '/403' || info.pathname === '/forbidden');

    // Suite F: Authenticated MAINTENANCE Perspective
    console.log('\n[Suite F: Authenticated MAINTENANCE Role Access]');

    await cdp.evaluate(`(() => {
      localStorage.setItem('campus_auth_token', 'mock_maint_jwt_token_for_phase2');
      localStorage.setItem('campus_user', JSON.stringify({
        id: 'maint-uuid-test',
        firstName: 'Ramesh',
        lastName: 'Kumar',
        email: 'maintenance.demo@campus.edu',
        role: 'MAINTENANCE',
        permissions: ['COMPLAINT_READ_ALL', 'COMPLAINT_RESOLVE', 'NOTICE_READ']
      }));
    })()`);

    info = await navigateTo('/maintenance/dashboard');
    report('BR-MAINT-01', 'MAINTENANCE successfully accesses /maintenance/dashboard', 
      info.pathname === '/maintenance/dashboard' && !info.hasError);

    info = await navigateTo('/maintenance/tickets');
    report('BR-MAINT-02', 'MAINTENANCE successfully accesses /maintenance/tickets', 
      info.pathname === '/maintenance/tickets' && !info.hasError);

    info = await navigateTo('/accountant/dashboard');
    report('BR-MAINT-03', 'MAINTENANCE accessing /accountant/dashboard is blocked and redirected to /403', 
      info.pathname === '/403' || info.pathname === '/forbidden');

    // Suite G: Authenticated SECURITY Perspective
    console.log('\n[Suite G: Authenticated SECURITY Role Access]');

    await cdp.evaluate(`(() => {
      localStorage.setItem('campus_auth_token', 'mock_sec_jwt_token_for_phase2');
      localStorage.setItem('campus_user', JSON.stringify({
        id: 'sec-uuid-test',
        firstName: 'Devendra',
        lastName: 'Singh',
        email: 'security.demo@campus.edu',
        role: 'SECURITY',
        permissions: ['GATE_ENTRY', 'GATE_LOG_READ', 'VISITOR_READ_ALL', 'NOTICE_READ']
      }));
    })()`);

    info = await navigateTo('/security/dashboard');
    report('BR-SEC-01', 'SECURITY successfully accesses /security/dashboard', 
      info.pathname === '/security/dashboard' && !info.hasError);

    info = await navigateTo('/security/gate-entry');
    report('BR-SEC-02', 'SECURITY successfully accesses /security/gate-entry', 
      info.pathname === '/security/gate-entry' && !info.hasError);

    info = await navigateTo('/warden/dashboard');
    report('BR-SEC-03', 'SECURITY accessing /warden/dashboard is blocked and redirected to /403', 
      info.pathname === '/403' || info.pathname === '/forbidden');

    // Suite H: Authenticated ADMIN Perspective
    console.log('\n[Suite H: Authenticated ADMIN Role Access]');

    await cdp.evaluate(`(() => {
      localStorage.setItem('campus_auth_token', 'mock_admin_jwt_token_for_phase2');
      localStorage.setItem('campus_user', JSON.stringify({
        id: 'admin-uuid-test',
        firstName: 'Dean',
        lastName: 'Verma',
        email: 'admin.demo@campus.edu',
        role: 'ADMIN',
        permissions: ['USER_READ_ALL', 'STUDENT_READ_ALL', 'HOSTEL_READ_ALL', 'NOTICE_CREATE', 'AUDIT_READ']
      }));
    })()`);

    info = await navigateTo('/admin/dashboard');
    report('BR-ADMIN-01', 'ADMIN successfully accesses /admin/dashboard', 
      info.pathname === '/admin/dashboard' && !info.hasError);

    info = await navigateTo('/admin/users');
    report('BR-ADMIN-02', 'ADMIN successfully accesses /admin/users', 
      info.pathname === '/admin/users' && !info.hasError);

    info = await navigateTo('/warden/dashboard');
    report('BR-ADMIN-03', 'ADMIN successfully accesses /warden/dashboard (inherited access)', 
      info.pathname === '/warden/dashboard' && !info.hasError);

    info = await navigateTo('/maintenance/dashboard');
    report('BR-ADMIN-04', 'ADMIN successfully accesses /maintenance/dashboard (inherited access)', 
      info.pathname === '/maintenance/dashboard' && !info.hasError);

    info = await navigateTo('/security/dashboard');
    report('BR-ADMIN-05', 'ADMIN successfully accesses /security/dashboard (inherited access)', 
      info.pathname === '/security/dashboard' && !info.hasError);

    cdp.close();

    console.log('\n================================================================');
    console.log(`  LIVE BROWSER TEST RESULTS: ${passed} PASSED | ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Test execution failed:', err);
    failed++;
  } finally {
    try { browserProc.kill(); } catch {}
    try { previewProc.kill(); } catch {}
    // Ensure spawned node/vite child processes terminate on Windows
    spawn('taskkill', ['/pid', previewProc.pid, '/f', '/t']);
  }

  process.exit(failed > 0 ? 1 : 0);
}

run();


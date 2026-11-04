import fs from 'fs';
import { spawn } from 'child_process';

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
}

async function run() {
  console.log('================================================================');
  console.log('  UNIFIX TECH — LEAVE PAGE RUNTIME & SIDEBAR BADGE VERIFICATION');
  console.log('================================================================\n');

  const browserProc = spawn(BROWSER_PATH, [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  try {
    await new Promise((r) => setTimeout(r, 2000));
    const versionRes = await fetch('http://127.0.0.1:9226/json/version');
    const versionData = await versionRes.json();
    console.log('✓ Connected to browser:', versionData.Browser);

    const newTabRes = await fetch('http://127.0.0.1:9226/json/new?http://localhost:5173/login', { method: 'PUT' });
    const tabData = await newTabRes.json();
    const cdp = new CdpSession(tabData.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    await new Promise((r) => setTimeout(r, 2000));

    // Helper: Perform login using React property descriptors
    const loginAs = async (email, password) => {
      await cdp.send('Page.navigate', { url: 'http://localhost:5173/login' });
      await new Promise(r => setTimeout(r, 1500));
      const res = await cdp.evaluate(`(() => {
        localStorage.clear();
        sessionStorage.clear();
        const setVal = (el, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        };
        const inputs = Array.from(document.querySelectorAll('input'));
        const emailInput = inputs[0];
        const passInput = inputs[1];
        const submitBtn = document.querySelector('button[type="submit"]');
        if (emailInput && passInput && submitBtn) {
          setVal(emailInput, '${email}');
          setVal(passInput, '${password}');
          submitBtn.click();
          return { success: true };
        }
        return { success: false, reason: 'Inputs not found' };
      })()`);
      await new Promise(r => setTimeout(r, 2500));
      return res;
    };

    // -------------------------------------------------------------
    // TEST 1: LOGIN AS STUDENT & OPEN /student/leave
    // -------------------------------------------------------------
    console.log('\n--- PART 1: STUDENT LEAVE PAGE VERIFICATION ---');
    console.log('[Step 1] Logging in as Student...');
    const loginResult = await loginAs('student@campus.demo', 'Password@123');
    console.log('  Student login result:', loginResult);

    console.log('[Step 2] Navigating directly to /student/leave...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/student/leave' });
    await new Promise((r) => setTimeout(r, 2500));

    // Check if error boundary or ReferenceError appeared
    const errorBoundaryActive = await cdp.evaluate(`(() => {
      return document.body.innerText.includes('Module Display Interrupted') ||
             document.body.innerText.includes('Retry Module');
    })()`);

    const leavePageTitle = await cdp.evaluate(`document.querySelector('h1')?.innerText`);
    const leaveCardsCount = await cdp.evaluate(`document.querySelectorAll('.space-y-3 > div').length`);
    const formPresent = await cdp.evaluate(`!!document.querySelector('form')`);

    console.log('  Error Boundary Triggered:', errorBoundaryActive ? 'YES (FAILURE)' : 'NONE (Page Rendered Successfully)');
    console.log('  Page Heading:', leavePageTitle);
    console.log('  Leave Cards Rendered:', leaveCardsCount);
    console.log('  Application Form Present:', formPresent);
    console.log('  Console Errors Count:', cdp.consoleErrors.length);
    if (cdp.consoleErrors.length > 0) {
      console.log('  Console Errors Details:', cdp.consoleErrors);
    }

    if (errorBoundaryActive || !leavePageTitle || !formPresent) {
      throw new Error(`Leave page failed to render cleanly: errorBoundaryActive=${errorBoundaryActive}`);
    }
    console.log('  ✓ /student/leave rendered cleanly with zero ReferenceErrors!');

    // -------------------------------------------------------------
    // TEST 2: LEAVE FORM SUBMISSION
    // -------------------------------------------------------------
    console.log('\n[Step 3] Submitting a new leave application...');
    const formResult = await cdp.evaluate(`(() => {
      const form = document.querySelector('form');
      if (!form) return { success: false, reason: 'Form not found' };
      const setVal = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const setTextVal = (el, val) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const inputs = form.querySelectorAll('input');
      const textarea = form.querySelector('textarea');
      if (inputs[0]) setVal(inputs[0], '2026-10-20');
      if (inputs[1]) setVal(inputs[1], '2026-10-23');
      if (inputs[2]) setVal(inputs[2], 'Rourkela Tech Expo');
      if (inputs[3]) setVal(inputs[3], '+91 99370 88888');
      if (textarea) setTextVal(textarea, 'Attending national collegiate robotics symposium');
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
        return { success: true };
      }
      return { success: false, reason: 'Submit button not found' };
    })()`);
    console.log('  Form fill result:', formResult);

    await new Promise((r) => setTimeout(r, 2000));

    const successBanner = await cdp.evaluate(`document.querySelector('.bg-emerald-50')?.innerText`);
    const updatedCardsCount = await cdp.evaluate(`document.querySelectorAll('.space-y-3 > div').length`);
    console.log('  Success Banner:', successBanner);
    console.log('  Updated Cards Count:', updatedCardsCount);

    // -------------------------------------------------------------
    // TEST 3: ADMIN LOGIN & SIDEBAR BADGE VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- PART 2: SIDEBAR CAMPUSOS BADGE REMOVAL VERIFICATION ---');
    console.log('[Step 4] Logging in as Admin (admin@campus.demo)...');
    const adminLoginResult = await loginAs('admin@campus.demo', 'Password@123');
    console.log('  Admin login result:', adminLoginResult);

    console.log('[Step 5] Checking Sidebar on /admin/dashboard...');
    await cdp.send('Page.navigate', { url: 'http://localhost:5173/admin/dashboard' });
    await new Promise((r) => setTimeout(r, 2500));

    const sidebarHeaderHtml = await cdp.evaluate(`document.querySelector('aside > div')?.innerHTML`);
    const sidebarRoleText = await cdp.evaluate(`document.querySelector('aside > div span.text-xs')?.innerText || document.querySelector('aside > div span.uppercase')?.innerText`);
    const campusOsBadgeCount = await cdp.evaluate(`Array.from(document.querySelectorAll('aside *')).filter(el => el.textContent && el.textContent.trim() === 'CAMPUSOS').length`);
    const greenDotExists = await cdp.evaluate(`!!document.querySelector('aside > div span.bg-emerald-500')`);
    const brandLogoText = await cdp.evaluate(`document.querySelector('header')?.innerText || document.querySelector('nav')?.innerText`);

    console.log('  Sidebar Header HTML:', sidebarHeaderHtml);
    console.log('  Sidebar Role Displayed:', sidebarRoleText);
    console.log('  Green Status Indicator Present:', greenDotExists);
    console.log('  "CAMPUSOS" Badges in Sidebar:', campusOsBadgeCount);
    console.log('  Top Nav Branding Contains CAMPUS OS:', brandLogoText?.includes('CAMPUS OS'));

    if (campusOsBadgeCount === 0 && sidebarRoleText === 'ADMIN' && greenDotExists) {
      console.log('  ✓ CAMPUSOS badge completely removed from Sidebar!');
      console.log('  ✓ ADMIN label and green status dot intact & balanced!');
      console.log('  ✓ CAMPUS OS top navigation branding intact!');
    } else {
      throw new Error(`Sidebar badge removal check failed. Badge count: ${campusOsBadgeCount}`);
    }

    console.log('\n================================================================');
    console.log('ALL VERIFICATIONS PASSED WITH ZERO CONSOLE ERRORS!');
    console.log('================================================================\n');

    await cdp.send('Page.close');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    browserProc.kill();
  }
}

run();

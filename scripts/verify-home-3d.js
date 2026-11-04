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
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
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

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res?.result?.value;
  }
}

async function verifyHome3D() {
  console.log('Testing Home Page 3D Digital Twin & Brand Elements...');
  const proc = spawn(BROWSER_PATH, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  try {
    await new Promise((r) => setTimeout(r, 2000));
    const newTabRes = await fetch('http://127.0.0.1:9224/json/new?http://localhost:5173/', { method: 'PUT' });
    const tabData = await newTabRes.json();
    const cdp = new CdpSession(tabData.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await new Promise((r) => setTimeout(r, 3500));

    const pageTitle = await cdp.eval('document.title');
    const brandTexts = await cdp.eval(`Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.includes('CAMPUS OS')).length`);
    const oldIbsTexts = await cdp.eval(`Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.includes('IBS')).length`);
    const oldSamtTexts = await cdp.eval(`Array.from(document.querySelectorAll('*')).filter(el => el.textContent && el.textContent.includes('SAMT')).length`);
    const canvasExists = await cdp.eval('!!document.querySelector("canvas")');
    const heroHeading = await cdp.eval('document.querySelector("h1")?.innerText');

    console.log('----------------------------------------------------');
    console.log('Page Title:', pageTitle);
    console.log('Canvas (3D Scene) Mounted:', canvasExists);
    console.log('Hero Heading:', heroHeading);
    console.log('CAMPUS OS Brand Occurrences on Page:', brandTexts);
    console.log('Old "IBS" Occurrences on Page:', oldIbsTexts);
    console.log('Old "SAMT" Occurrences on Page:', oldSamtTexts);
    console.log('----------------------------------------------------');

    if (canvasExists && pageTitle.includes('CAMPUS OS') && oldIbsTexts === 0 && oldSamtTexts === 0) {
      console.log('>>> 3D SCENE & BRANDING VERIFIED PERFECTLY! <<<');
    } else {
      console.error('Verification failed:', { canvasExists, pageTitle, oldIbsTexts, oldSamtTexts });
    }

    await cdp.send('Page.close');
  } catch (err) {
    console.error('Error during 3D verification:', err);
  } finally {
    proc.kill();
  }
}

verifyHome3D();

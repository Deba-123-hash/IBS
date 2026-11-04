import app from '../server/src/app.js';
import { EventEmitter } from 'events';
import http from 'http';

export function testRequest(app, { method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve) => {
    const socket = new EventEmitter();
    socket.remoteAddress = '127.0.0.1';
    socket.encrypted = false;
    socket.writable = true;
    socket.destroy = () => {};

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = {
      host: 'localhost',
      'content-type': 'application/json',
      ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
    };

    const res = new http.ServerResponse(req);
    res.assignSocket(socket);

    const chunks = [];
    res.write = function (chunk, encoding, cb) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      if (typeof cb === 'function') cb();
      return true;
    };

    res.end = function (chunk, encoding, cb) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      if (typeof cb === 'function') cb();
      const raw = Buffer.concat(chunks).toString('utf-8');
      let parsed;
      try { parsed = JSON.parse(raw); } catch { parsed = raw; }
      resolve({ status: res.statusCode, headers: res.getHeaders(), body: parsed });
    };

    app.handle(req, res);

    if (body !== null && body !== undefined) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      req.headers['content-length'] = Buffer.byteLength(payload).toString();
      req.push(payload);
    }
    req.push(null);
  });
}

async function run() {
  console.log('Testing in-memory request to /health...');
  const res = await testRequest(app, { method: 'GET', url: '/health' });
  console.log('Response status:', res.status);
  console.log('Response body:', res.body);

  console.log('\nTesting login for student@campus.demo...');
  const loginRes = await testRequest(app, {
    method: 'POST',
    url: '/api/v1/auth/login',
    body: { email: 'student@campus.demo', password: 'Password@123' }
  });
  console.log('Login status:', loginRes.status);
  console.log('Login token exists:', !!loginRes.body?.data?.token);
  process.exit(0);
}

run();


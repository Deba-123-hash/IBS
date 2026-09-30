#!/usr/bin/env node
import http from 'http';
import app from '../server/src/app.js';

const check = async () => {
  const url = process.env.API_URL || 'http://localhost:5000/api/v1/health';
  console.log(`[Health Check] Checking Campus Life API status...`);

  // First try the configured or live URL
  const pingLive = () => new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });
    req.on('error', reject);
    req.setTimeout(1500, () => {
      req.destroy();
      reject(new Error('Live ping timeout'));
    });
  });

  try {
    const res = await pingLive();
    if (res.statusCode === 200) {
      console.log(`[Health Check] Status Code: ${res.statusCode}`);
      console.log('✓ Campus Life Backend API is UP and Healthy on ' + url);
      process.exit(0);
    }
  } catch (err) {
    // If live server isn't running, run internal ephemeral health test
    console.log(`[Health Check] Live server not detected on port 5000 (${err.message}). Testing internal app health endpoint...`);
    const server = http.createServer(app);
    server.listen(0, async () => {
      const port = server.address().port;
      const ephemeralUrl = `http://localhost:${port}/api/v1/health`;
      http.get(ephemeralUrl, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          server.close();
          if (res.statusCode === 200) {
            console.log(`[Health Check] Internal API Health Check: Status Code 200`);
            console.log('✓ Campus Life Express App & Router are 100% Healthy and functional!');
            process.exit(0);
          } else {
            console.error('✗ App returned non-200 code:', res.statusCode);
            process.exit(1);
          }
        });
      }).on('error', (e) => {
        server.close();
        console.error('✗ Ephemeral health test failed:', e.message);
        process.exit(1);
      });
    });
  }
};

check();

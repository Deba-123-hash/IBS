import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;
const rawUrl = process.env.DATABASE_URL || '';

console.log('[PG Test] Initializing pg.Client...');

const client = new Client({
  connectionString: rawUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log('[PG Test] Connecting...');
    await client.connect();
    console.log('>>> [PG Test] CONNECTED TO NEON! <<<');
    const res = await client.query('SELECT current_database(), version(), now()');
    console.log('Database:', res.rows[0].current_database);
    console.log('Version:', res.rows[0].version.split(' ')[0] + ' ' + res.rows[0].version.split(' ')[1]);
    console.log('Server Time:', res.rows[0].now);
    
    // Check tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Public tables count:', tableRes.rows.length);
    if (tableRes.rows.length > 0) {
      console.log('Tables:', tableRes.rows.map(r => r.table_name).join(', '));
    }
  } catch (err) {
    console.log('[PG Test] Connection Error Code:', err.code);
    console.log('[PG Test] Error Name:', err.name);
    console.log('[PG Test] Error Message:', err.message);
  } finally {
    try { await client.end(); } catch(e){}
  }
}

run();

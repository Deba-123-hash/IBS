import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import ENV from './env.js';

const { Pool } = pg;

let prisma = null;
let pool = null;

const dbUrl = ENV.DATABASE_URL || process.env.DATABASE_URL || '';
const isPlaceholderDb = dbUrl.includes('ep-sample-pooler') || dbUrl.includes('dummy') || dbUrl.includes('your-neon-db');

if (dbUrl && !isPlaceholderDb) {
  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000
    });

    pool.on('error', (err) => {
      console.warn('[Database Pool Warning] Client connection reset:', err.message);
    });

    const adapter = new PrismaPg(pool);

    prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    });

    console.log('[Database] Initialized PrismaClient with Neon PostgreSQL (pg Pool active).');
  } catch (error) {
    console.error('[Database] Failed to initialize PrismaClient instance:', error.message);
    prisma = null;
  }
} else {
  console.log('[Database] Demo / Local mode active: placeholder DATABASE_URL detected.');
}

export { pool };
export default prisma;

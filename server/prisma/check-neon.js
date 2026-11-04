import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL || '';

console.log('DATABASE_URL detected:', dbUrl ? 'YES' : 'NO');
console.log('Valid format (starts with postgresql://):', dbUrl.startsWith('postgresql://') ? 'YES' : 'NO');

if (!dbUrl) {
  console.log('Error: DATABASE_URL is empty');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  },
  log: ['error']
});

async function testConnection() {
  try {
    console.log('[Neon Test] Attempting database query...');
    const result = await prisma.$queryRaw`SELECT 1 as connected, current_database() as db_name, version() as pg_version`;
    console.log('[Neon Test] Query succeeded!');
    console.log('Neon Connected: YES');
    console.log('Database Name:', result[0]?.db_name || 'unknown');
    console.log('PostgreSQL Version:', (result[0]?.pg_version || '').split(' ')[0] + ' ' + (result[0]?.pg_version || '').split(' ')[1]);
    
    // Check tables in database
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('Existing tables in public schema:', tables.length);
    if (tables.length > 0) {
      console.log('Tables:', tables.map(t => t.table_name).join(', '));
    }
  } catch (err) {
    console.log('Neon Connected: NO');
    console.log('Connection Error:', err.message ? err.message.split('\n')[0] : 'Unknown error');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
  console.error('DATABASE_URL is not defined in server/.env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('[Prisma Test] Executing SELECT 1 with PrismaClient...');
    const result = await prisma.$queryRaw`SELECT 1 as connected, current_database()::text, now()`;
    console.log('[Prisma Test] Query succeeded!', result);

    const userCount = await prisma.user.count();
    console.log('[Prisma Test] User count:', userCount);

    const tables = await prisma.$queryRaw`
      SELECT count(*)::int as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('[Prisma Test] Verified public tables via Prisma:', tables[0].table_count);
    console.log('>>> PRISMA + NEON INTEGRATION IS WORKING 100%! <<<');
  } catch (err) {
    console.error('[Prisma Test] Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

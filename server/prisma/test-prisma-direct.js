import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL || '';

console.log('Testing PrismaClient with pooled URL...');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  },
  log: ['error']
});

async function run() {
  try {
    const res = await prisma.$queryRaw`SELECT 1 as success, current_database() as db`;
    console.log('>>> PRISMA CLIENT CONNECTED TO NEON! <<<');
    console.log('Database:', res[0]?.db);
    return true;
  } catch (err) {
    console.log('Prisma query error:', err.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

run();

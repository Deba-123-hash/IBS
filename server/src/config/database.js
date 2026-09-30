import { PrismaClient } from '@prisma/client';

let prisma = null;

const dbUrl = process.env.DATABASE_URL || '';
const isPlaceholderDb = dbUrl.includes('ep-sample-pooler') || dbUrl.includes('dummy') || dbUrl.includes('your-neon-db');

if (dbUrl && !isPlaceholderDb) {
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    });
  } catch (error) {
    console.error('[Database] Failed to initialize PrismaClient instance:', error.message);
    prisma = null;
  }
} else {
  // Graceful offline/demo mode with built-in realistic mock layer
  console.log('[Database] Demo / Local mode active: placeholder DATABASE_URL detected. Utilizing high-fidelity in-memory operational state.');
}

export default prisma;

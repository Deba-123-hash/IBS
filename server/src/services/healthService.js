import prisma from '../config/database.js';
import { ENV } from '../config/env.js';

export const checkHealth = async () => {
  let dbHealthy = false;
  let dbLatencyMs = null;

  if (prisma) {
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbHealthy = true;
      dbLatencyMs = Date.now() - startTime;
    } catch (err) {
      try {
        await new Promise(r => setTimeout(r, 800));
        await prisma.$queryRaw`SELECT 1`;
        dbHealthy = true;
        dbLatencyMs = Date.now() - startTime;
      } catch (retryErr) {
        dbHealthy = false;
      }
    }
  }

  return {
    api: 'healthy',
    database: dbHealthy ? 'healthy' : 'unhealthy',
    environment: ENV.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    details: {
      provider: 'Neon Serverless PostgreSQL (Prisma ORM)',
      status: dbHealthy ? 'CONNECTED' : 'DISCONNECTED',
      latencyMs: dbLatencyMs
    }
  };
};

export default { checkHealth };

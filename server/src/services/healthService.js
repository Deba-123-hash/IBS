import prisma from '../config/database.js';
import { ENV } from '../config/env.js';

export const checkHealth = async () => {
  let dbStatus = 'DISCONNECTED';
  let dbLatencyMs = null;

  if (prisma) {
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'CONNECTED (Neon PostgreSQL)';
      dbLatencyMs = Date.now() - startTime;
    } catch (err) {
      dbStatus = `UNREACHABLE (${err.message.substring(0, 50)}...)`;
    }
  }

  return {
    status: 'UP',
    platform: 'Campus Life, Debugged - Campus Operations OS',
    tagline: 'Attendance, Mess, Hostel, Repeat: Campus Life, Debugged',
    organisation: 'Fretbox',
    environment: ENV.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      provider: 'Neon Serverless PostgreSQL (Prisma ORM)',
      status: dbStatus,
      latencyMs: dbLatencyMs
    },
    version: '1.0.0-phase1-foundation'
  };
};

export default { checkHealth };

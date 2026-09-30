import prisma from '../config/database.js';

export const logAuditEvent = async ({
  userId = null,
  action,
  entity,
  entityId = 'SYSTEM',
  ipAddress = null,
  userAgent = null,
  payload = null
}) => {
  try {
    if (prisma && prisma.auditLog) {
      return await prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId: String(entityId),
          ipAddress,
          userAgent,
          payload: payload ? (typeof payload === 'string' ? payload : JSON.stringify(payload)) : null
        }
      });
    }
  } catch (err) {
    console.warn(`[AuditLog Fallback] ${action} on ${entity} by ${userId || 'anonymous'}:`, err.message);
  }
  return null;
};

export default { logAuditEvent };

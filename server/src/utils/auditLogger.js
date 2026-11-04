import prisma from '../config/database.js';

/**
 * Creates an immutable audit log record for sensitive operations.
 * Non-blocking: logs error if database is unavailable without crashing transaction.
 * 
 * @param {Object} params
 * @param {string} [params.actorUserId] - ID of user performing the action
 * @param {string} [params.actorRole] - Role of user performing the action
 * @param {string} params.action - Canonical action name (e.g. PAYMENT_VERIFIED, ROOM_ALLOCATED)
 * @param {string} params.entity - Name of entity/table (e.g. Payment, RoomAllocation)
 * @param {string} params.entityId - ID of entity affected
 * @param {Object|string} [params.oldData] - State prior to change
 * @param {Object|string} [params.newData] - State after change
 * @param {string} [params.ipAddress] - Request IP
 * @param {string} [params.userAgent] - Request user agent
 */
export async function createAuditLog({
  actorUserId,
  actorRole,
  action,
  entity,
  entityId,
  oldData,
  newData,
  ipAddress,
  userAgent
}) {
  if (!prisma || !prisma.auditLog) return null;

  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: actorUserId || null,
        actorRole: actorRole || null,
        action,
        entity,
        entityId: String(entityId || 'N/A'),
        oldData: oldData ? (typeof oldData === 'string' ? oldData : JSON.stringify(oldData)) : null,
        newData: newData ? (typeof newData === 'string' ? newData : JSON.stringify(newData)) : null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null
      }
    });
    return log;
  } catch (err) {
    console.warn('[AuditLogger] Warning: Failed to record audit log:', err.message);
    return null;
  }
}

export default {
  createAuditLog
};

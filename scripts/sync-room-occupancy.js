import prisma, { pool } from '../server/src/config/database.js';

async function syncOccupancy() {
  console.log('[Sync] Synchronizing Room.currentOccupancy with active RoomAllocation records...');

  // 1. Update rooms that have active allocations
  const updatedRooms = await prisma.$executeRaw`
    UPDATE "Room" r
    SET "currentOccupancy" = sub.active_count
    FROM (
      SELECT "roomId", count(*)::int as active_count
      FROM "RoomAllocation"
      WHERE "isActive" = true
      GROUP BY "roomId"
    ) sub
    WHERE r.id = sub."roomId";
  `;
  console.log(`[Sync] Updated ${updatedRooms} rooms with active allocations.`);

  // 2. Ensure rooms with no active allocations have currentOccupancy = 0
  const zeroRooms = await prisma.$executeRaw`
    UPDATE "Room"
    SET "currentOccupancy" = 0
    WHERE id NOT IN (
      SELECT DISTINCT "roomId"
      FROM "RoomAllocation"
      WHERE "isActive" = true
    );
  `;
  console.log(`[Sync] Ensured rooms with 0 allocations are set to 0 (${zeroRooms} affected).`);

  // Verify
  const mismatches = await prisma.$queryRaw`
    SELECT r.id, r."roomNumber", r."currentOccupancy", count(ra.id)::int as active_allocations
    FROM "Room" r
    LEFT JOIN "RoomAllocation" ra ON r.id = ra."roomId" AND ra."isActive" = true
    GROUP BY r.id, r."roomNumber", r."currentOccupancy"
    HAVING r."currentOccupancy" != count(ra.id)
  `;
  console.log(`[Sync] Remaining discrepancies: ${mismatches.length}`);

  await prisma.$disconnect();
  await pool.end();
}

syncOccupancy().catch(console.error);


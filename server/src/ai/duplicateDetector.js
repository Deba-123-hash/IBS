import prisma from '../config/database.js';

export const checkDuplicateComplaint = async (newTitle, newDescription, roomId = null) => {
  try {
    if (!prisma || !prisma.complaint) {
      return { isDuplicate: false, similarity: 0, existingTicket: null };
    }

    // Look for active complaints in the same room or recent 7 days
    const whereClause = {
      status: { in: ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'] }
    };

    if (roomId) {
      whereClause.roomId = roomId;
    }

    const recentComplaints = await prisma.complaint.findMany({
      where: whereClause,
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    const newTokens = new Set(`${newTitle} ${newDescription}`.toLowerCase().split(/\s+/).filter(w => w.length > 3));

    for (const comp of recentComplaints) {
      const existingTokens = new Set(`${comp.title} ${comp.description}`.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      
      let matchCount = 0;
      for (const t of newTokens) {
        if (existingTokens.has(t)) matchCount++;
      }

      const similarity = matchCount / Math.max(newTokens.size, 1);

      if (similarity > 0.45 || (roomId && comp.roomId === roomId)) {
        return {
          isDuplicate: true,
          similarityScore: Math.round(similarity * 100),
          existingTicketId: comp.id,
          ticketNumber: comp.ticketNumber,
          title: comp.title
        };
      }
    }

    return { isDuplicate: false, similarityScore: 0, existingTicketId: null };
  } catch (error) {
    console.error('[Duplicate Detector Error]:', error.message);
    return { isDuplicate: false, similarityScore: 0, existingTicketId: null };
  }
};

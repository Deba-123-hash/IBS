import prisma from '../config/database.js';

class NotificationService {
  async send({ userId, title, message, type = 'SYSTEM', linkUrl = null }) {
    console.log(`[Notification Dispatch] To User: ${userId} | ${title}: ${message}`);
    
    if (!prisma || !prisma.notification) {
      return { id: `mock_notif_${Date.now()}`, userId, title, message, type, linkUrl, isRead: false, createdAt: new Date() };
    }

    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          linkUrl,
          isRead: false
        }
      });
    } catch (err) {
      console.error('[Notification Service Error]:', err.message);
      return null;
    }
  }

  async broadcastToRole(role, title, message, linkUrl = null) {
    if (!prisma || !prisma.user) return;

    try {
      const users = await prisma.user.findMany({
        where: { role, isActive: true },
        select: { id: true }
      });

      const promises = users.map(u => this.send({
        userId: u.id,
        title,
        message,
        type: 'BROADCAST',
        linkUrl
      }));

      await Promise.all(promises);
    } catch (err) {
      console.error('[Notification Broadcast Error]:', err.message);
    }
  }
}

export default new NotificationService();

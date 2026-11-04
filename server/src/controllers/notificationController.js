import { successResponse, errorResponse } from '../utils/response.js';
import prisma from '../config/database.js';

let userNotifications = [
  {
    id: 'notif_01',
    title: 'Gate Pass Approved',
    message: 'Your gate pass request GP-2026-0042 has been approved by Warden Suresh Patel. Dynamic QR code is active.',
    type: 'GATE_PASS',
    linkUrl: '/student/gate-passes',
    isRead: false,
    createdAt: '15 mins ago'
  }
];

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (prisma && userId) {
      try {
        const notifs = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        });

        const unreadCount = await prisma.notification.count({
          where: { userId, isRead: false }
        });

        return successResponse(res, {
          notifications: notifs,
          unreadCount
        }, 'Notifications inbox retrieved from database');
      } catch (dbErr) {
        console.warn('[Notification Controller] DB query failed, falling back:', dbErr.message);
      }
    }

    return successResponse(res, {
      notifications: userNotifications,
      unreadCount: userNotifications.filter(n => !n.isRead).length
    }, 'Notifications inbox retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch notifications', 'NOTIFICATION_ERROR', 500);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (prisma) {
      try {
        const updated = await prisma.notification.updateMany({
          where: { id, ...(userId ? { userId } : {}) },
          data: { isRead: true }
        });
        return successResponse(res, { count: updated.count }, 'Notification marked as read in database');
      } catch (dbErr) {
        console.warn('[Notification Controller] DB update failed, falling back:', dbErr.message);
      }
    }

    const n = userNotifications.find(item => item.id === id);
    if (n) n.isRead = true;
    return successResponse(res, { notification: n }, 'Notification marked as read');
  } catch (error) {
    return errorResponse(res, 'Failed to mark notification read', 'NOTIFICATION_UPDATE_ERROR', 500);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (prisma && userId) {
      try {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true }
        });
        return successResponse(res, { unreadCount: 0 }, 'All notifications marked as read in database');
      } catch (dbErr) {
        console.warn('[Notification Controller] DB markAllAsRead failed:', dbErr.message);
      }
    }

    userNotifications.forEach(n => { n.isRead = true; });
    return successResponse(res, { unreadCount: 0 }, 'All notifications marked as read');
  } catch (error) {
    return errorResponse(res, 'Failed to mark all notifications read', 'NOTIFICATION_UPDATE_ERROR', 500);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (prisma && userId) {
      try {
        await prisma.notification.deleteMany({
          where: { id, userId }
        });
        return successResponse(res, { id }, 'Notification deleted successfully');
      } catch (dbErr) {
        console.warn('[Notification Controller] DB delete failed:', dbErr.message);
      }
    }

    userNotifications = userNotifications.filter(n => n.id !== id);
    return successResponse(res, { id }, 'Notification deleted');
  } catch (error) {
    return errorResponse(res, 'Failed to delete notification', 'NOTIFICATION_DELETE_ERROR', 500);
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

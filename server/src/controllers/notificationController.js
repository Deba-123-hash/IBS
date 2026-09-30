import { successResponse, errorResponse } from '../utils/response.js';

let userNotifications = [
  {
    id: 'notif_01',
    title: 'Gate Pass Approved',
    message: 'Your gate pass request GP-2026-0042 has been approved by Warden Suresh Patel. Dynamic QR code is active.',
    type: 'GATE_PASS',
    linkUrl: '/student/gate-passes',
    isRead: false,
    createdAt: '15 mins ago'
  },
  {
    id: 'notif_02',
    title: 'Grievance Under Repair',
    message: 'Technician Ramesh Kumar claimed ticket CMP-2026-0042 (Bathroom leak) and is on site.',
    type: 'COMPLAINT_UPDATE',
    linkUrl: '/student/complaints',
    isRead: false,
    createdAt: '1 hour ago'
  },
  {
    id: 'notif_03',
    title: 'Mid-Sem Examination Notice',
    message: 'Controller of Examinations has published the revised Autumn 2026 schedule.',
    type: 'NOTICE',
    linkUrl: '/student/notices',
    isRead: true,
    createdAt: '3 hours ago'
  }
];

export const getNotifications = async (req, res) => {
  return successResponse(res, {
    notifications: userNotifications,
    unreadCount: userNotifications.filter(n => !n.isRead).length
  }, 'Notifications inbox retrieved');
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  const n = userNotifications.find(item => item.id === id);
  if (n) n.isRead = true;
  return successResponse(res, { notification: n }, 'Notification marked as read');
};

export const markAllAsRead = async (req, res) => {
  userNotifications.forEach(n => { n.isRead = true; });
  return successResponse(res, { unreadCount: 0 }, 'All notifications marked as read');
};

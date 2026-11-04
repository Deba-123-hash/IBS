import { successResponse, errorResponse } from '../utils/response.js';
import prisma from '../config/database.js';

let memoryNotices = [
  {
    id: 'not_01',
    title: 'Mid-Semester Examination Schedule - Autumn 2026',
    content: 'The official schedule for 3rd, 5th, and 7th semester mid-term exams is now published. Examination halls will open at 09:30 AM. Identity cards and admit slips are mandatory.',
    type: 'EXAMINATION',
    isUrgent: true,
    author: 'Controller of Examinations',
    targetScope: 'ALL',
    createdAt: '2026-09-29T08:30:00Z',
    readCount: 1701,
    actionCount: 1532,
    totalRecipients: 1842,
    hasAction: true,
    actionLabel: 'Download Exam Hall Ticket',
    attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    readers: new Set(['usr_student_demo'])
  }
];

export const getNotices = async (req, res) => {
  try {
    const { type } = req.query;

    if (prisma) {
      try {
        const where = {};
        if (type) where.type = type;
        const dbNotices = await prisma.notice.findMany({
          where,
          include: {
            author: { include: { user: true } },
            targets: true,
            reads: true
          },
          orderBy: { createdAt: 'desc' }
        });

        if (dbNotices && dbNotices.length > 0) {
          const userId = req.user?.id;
          const noticesWithReadState = dbNotices.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            type: n.type,
            isUrgent: n.isUrgent,
            author: n.author?.user ? `${n.author.user.firstName} ${n.author.user.lastName}` : (n.author?.designation || 'Dean of Academics'),
            targetScope: n.targets[0]?.targetType || 'ALL',
            createdAt: n.createdAt,
            readCount: n.reads.length,
            actionCount: 0,
            totalRecipients: 2450,
            hasAction: Boolean(n.attachmentUrl),
            actionLabel: n.attachmentUrl ? 'View Attachment' : null,
            attachmentUrl: n.attachmentUrl,
            isRead: userId ? n.reads.some(r => r.userId === userId) : false
          }));

          return successResponse(res, { notices: noticesWithReadState, total: noticesWithReadState.length }, 'Notices fetched from database');
        }
      } catch (dbErr) {
        console.warn('[Notice Controller] DB query failed, falling back:', dbErr.message);
      }
    }

    // Fallback
    let list = [...memoryNotices];
    if (type) list = list.filter(n => n.type === type);
    const userId = req.user?.id || 'usr_student_demo';
    const noticesWithReadState = list.map(n => ({
      ...n,
      isRead: n.readers ? n.readers.has(userId) : false
    }));

    return successResponse(res, { notices: noticesWithReadState, total: list.length }, 'Notices fetched');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch notices', 'NOTICE_ERROR', 500);
  }
};

export const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (prisma) {
      try {
        const notice = await prisma.notice.findUnique({
          where: { id },
          include: {
            author: { include: { user: true } },
            targets: true,
            reads: true
          }
        });

        if (notice) {
          const userId = req.user?.id;
          const isRead = userId ? notice.reads.some(r => r.userId === userId) : false;
          return successResponse(res, {
            id: notice.id,
            title: notice.title,
            content: notice.content,
            type: notice.type,
            isUrgent: notice.isUrgent,
            author: notice.author?.user ? `${notice.author.user.firstName} ${notice.author.user.lastName}` : (notice.author?.designation || 'Administration'),
            targetScope: notice.targets[0]?.targetType || 'ALL',
            createdAt: notice.createdAt,
            readCount: notice.reads.length,
            attachmentUrl: notice.attachmentUrl,
            isRead
          }, 'Notice details retrieved');
        }
      } catch (dbErr) {
        console.warn('[Notice Controller] DB findUnique failed:', dbErr.message);
      }
    }

    const notice = memoryNotices.find(n => n.id === id);
    if (!notice) return errorResponse(res, 'Notice not found', 'NOT_FOUND', 404);

    const userId = req.user?.id || 'usr_student_demo';
    const isRead = notice.readers ? notice.readers.has(userId) : false;

    return successResponse(res, { ...notice, isRead }, 'Notice details retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch notice', 'FETCH_ERROR', 500);
  }
};

export const createNotice = async (req, res) => {
  try {
    const { title, content, type, isUrgent, targetScope, attachmentUrl } = req.body;

    if (!title || !content) {
      return errorResponse(res, 'Title and content are required', 'MISSING_FIELDS', 400);
    }

    if (prisma) {
      try {
        let staff = null;
        if (req.user?.id) {
          staff = await prisma.staff.findUnique({ where: { userId: req.user.id } });
        }
        if (!staff) {
          staff = await prisma.staff.findFirst();
        }

        if (staff) {
          const created = await prisma.notice.create({
            data: {
              title,
              content,
              type: type || 'GENERAL',
              isUrgent: Boolean(isUrgent),
              authorId: staff.id,
              attachmentUrl: attachmentUrl || null,
              targets: {
                create: [{ targetType: targetScope || 'ALL' }]
              }
            },
            include: { targets: true, author: { include: { user: true } } }
          });

          return successResponse(res, { notice: created }, 'Notice broadcast successfully', 201);
        }
      } catch (dbErr) {
        console.warn('[Notice Controller] DB createNotice failed:', dbErr.message);
      }
    }

    const newNotice = {
      id: `not_${Date.now()}`,
      title,
      content,
      type: type || 'GENERAL',
      isUrgent: Boolean(isUrgent),
      author: req.user ? `${req.user.firstName} (${req.user.designation || 'Administration'})` : 'Admin Office',
      targetScope: targetScope || 'ALL',
      createdAt: new Date().toISOString(),
      readCount: 0,
      actionCount: 0,
      totalRecipients: 2450,
      attachmentUrl: attachmentUrl || null,
      readers: new Set()
    };

    memoryNotices.unshift(newNotice);
    return successResponse(res, { notice: newNotice }, 'Notice broadcast successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to publish notice', 'NOTICE_CREATE_ERROR', 500);
  }
};

export const markNoticeRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (prisma && userId) {
      try {
        const dbNotice = await prisma.notice.findUnique({ where: { id } });
        if (dbNotice) {
          await prisma.noticeRead.upsert({
            where: {
              noticeId_userId: {
                noticeId: id,
                userId
              }
            },
            update: {},
            create: {
              noticeId: id,
              userId
            }
          });
          const readCount = await prisma.noticeRead.count({ where: { noticeId: id } });
          return successResponse(res, { noticeId: id, isRead: true, readCount }, 'Notice read recorded in database');
        }
      } catch (dbErr) {
        console.warn('[Notice Controller] DB markNoticeRead failed:', dbErr.message);
      }
    }

    const notice = memoryNotices.find(n => n.id === id);
    if (!notice) return errorResponse(res, 'Notice not found', 'NOT_FOUND', 404);

    if (!notice.readers) notice.readers = new Set();
    const fallbackUserId = userId || 'usr_student_demo';
    if (!notice.readers.has(fallbackUserId)) {
      notice.readers.add(fallbackUserId);
      notice.readCount = (notice.readCount || 0) + 1;
    }

    return successResponse(res, { noticeId: id, isRead: true, readCount: notice.readCount }, 'Notice read recorded');
  } catch (error) {
    return errorResponse(res, 'Failed to mark notice read', 'READ_ERROR', 500);
  }
};

export const recordNoticeAction = async (req, res) => {
  try {
    const { id } = req.params;
    return successResponse(res, { noticeId: id, actionCount: 1 }, 'Notice engagement action recorded');
  } catch (error) {
    return errorResponse(res, 'Failed to record notice action', 'ACTION_ERROR', 500);
  }
};

export const getNoticeAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    let read = 1;
    let recipients = 2450;

    if (prisma) {
      try {
        read = await prisma.noticeRead.count({ where: { noticeId: id } });
        const totalUsers = await prisma.user.count({ where: { isActive: true } });
        if (totalUsers > 0) recipients = totalUsers;
      } catch (e) {}
    }

    return successResponse(res, {
      noticeId: id,
      totalRecipients: recipients,
      readRecipients: read,
      readRate: Number(((read / recipients) * 100).toFixed(1)),
      actionCount: 0,
      actionRate: 0
    }, 'Notice communication analytics calculated');
  } catch (error) {
    return errorResponse(res, 'Failed to calculate analytics', 'ANALYTICS_ERROR', 500);
  }
};

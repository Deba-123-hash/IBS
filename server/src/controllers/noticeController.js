import { successResponse, errorResponse } from '../utils/response.js';

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
  },
  {
    id: 'not_02',
    title: 'Hostel Maintenance Routine Water Tank Cleaning',
    content: 'Water supply to Hostel Block A and Block B will be temporarily halted between 10:00 AM and 02:00 PM this Thursday for routine bi-monthly chlorinated tank cleaning.',
    type: 'HOSTEL',
    isUrgent: false,
    author: 'Chief Warden Office',
    targetScope: 'HOSTEL_RESIDENTS',
    createdAt: '2026-09-28T14:15:00Z',
    readCount: 684,
    actionCount: 0,
    totalRecipients: 800,
    hasAction: false,
    attachmentUrl: null,
    readers: new Set()
  },
  {
    id: 'not_03',
    title: 'Smart India Hackathon Internal College Nominations',
    content: 'Student innovation teams interested in participating in the Smart India Hackathon are invited to submit project abstracts via the portal before October 10th.',
    type: 'GENERAL',
    isUrgent: false,
    author: 'Dean of Research & Innovation',
    targetScope: 'ALL',
    createdAt: '2026-09-27T11:00:00Z',
    readCount: 940,
    actionCount: 312,
    totalRecipients: 2450,
    hasAction: true,
    actionLabel: 'Submit Innovation Abstract',
    attachmentUrl: null,
    readers: new Set()
  }
];

export const getNotices = async (req, res) => {
  try {
    const { type } = req.query;
    let list = [...memoryNotices];
    if (type) list = list.filter(n => n.type === type);
    
    // Add isRead flag relative to authenticated user
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
    const { title, content, type, isUrgent, targetScope, attachmentUrl, hasAction, actionLabel } = req.body;

    if (!title || !content) {
      return errorResponse(res, 'Title and content are required', 'MISSING_FIELDS', 400);
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
      hasAction: Boolean(hasAction),
      actionLabel: actionLabel || 'View Details',
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
    const notice = memoryNotices.find(n => n.id === id);
    if (!notice) return errorResponse(res, 'Notice not found', 'NOT_FOUND', 404);

    const userId = req.user?.id || 'usr_student_demo';
    if (!notice.readers) notice.readers = new Set();

    if (!notice.readers.has(userId)) {
      notice.readers.add(userId);
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
    const notice = memoryNotices.find(n => n.id === id);
    if (!notice) return errorResponse(res, 'Notice not found', 'NOT_FOUND', 404);

    notice.actionCount = (notice.actionCount || 0) + 1;

    return successResponse(res, { noticeId: id, actionCount: notice.actionCount }, 'Notice engagement action recorded');
  } catch (error) {
    return errorResponse(res, 'Failed to record notice action', 'ACTION_ERROR', 500);
  }
};

export const getNoticeAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = memoryNotices.find(n => n.id === id);
    if (!notice) return errorResponse(res, 'Notice not found', 'NOT_FOUND', 404);

    const recipients = notice.totalRecipients || 1842;
    const read = notice.readCount || 0;
    const actions = notice.actionCount || 0;

    return successResponse(res, {
      noticeId: id,
      title: notice.title,
      totalRecipients: recipients,
      readRecipients: read,
      readRate: Number(((read / recipients) * 100).toFixed(1)),
      actionCount: actions,
      actionRate: read > 0 ? Number(((actions / read) * 100).toFixed(1)) : 0
    }, 'Notice communication analytics calculated');
  } catch (error) {
    return errorResponse(res, 'Failed to calculate analytics', 'ANALYTICS_ERROR', 500);
  }
};

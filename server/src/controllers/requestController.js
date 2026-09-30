import crypto from 'crypto';
import prisma from '../config/database.js';
import notificationService from '../notifications/notificationService.js';
import { logAuditEvent } from '../services/auditService.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Realistic mock request memory store for universal demo resilience
let memoryRequests = [
  {
    id: 'req_1028',
    requestNumber: 'REQ-1028',
    requestType: 'CERTIFICATE',
    title: 'Bonafide Certificate for Regional Passport Office',
    summary: 'Document required for renewal of tatkal passport at Bhubaneswar RPO',
    requesterName: 'Aarav Sharma',
    requesterRoll: 'CS2023048',
    department: 'Academic Section',
    assignedTo: 'Rajesh Verma (Dean Office)',
    priority: 'MEDIUM',
    status: 'UNDER_REVIEW',
    submittedAt: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    dueAt: new Date(Date.now() + 19.5 * 3600000).toISOString(),
    age: '4h 30m',
    isOverdue: false,
    timeline: [
      { status: 'SUBMITTED', actor: 'Aarav Sharma', timestamp: new Date(Date.now() - 4.5 * 3600000).toISOString(), note: 'Submitted with academic fee clearance receipt' },
      { status: 'UNDER_REVIEW', actor: 'Academic Clerk', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), note: 'Verified registry records' }
    ],
    comments: [
      { id: 'cm_1', author: 'Academic Clerk', visibility: 'PUBLIC', content: 'Verification complete with department archives. Forwarded for Dean signature.', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() }
    ],
    attachments: [
      { id: 'att_1', fileName: 'Fee_Receipt_Sem5.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', mimeType: 'application/pdf', size: 102400 }
    ]
  },
  {
    id: 'req_1032',
    requestNumber: 'REQ-1032',
    requestType: 'GATE_PASS',
    title: 'Emergency Medical Visit to Dental Clinic',
    summary: 'Consultation appointment for molar extraction checkup at Apollo Clinic',
    requesterName: 'Aarav Sharma',
    requesterRoll: 'CS2023048',
    department: 'Hostel Affairs',
    assignedTo: 'Suresh Patel (Chief Warden)',
    priority: 'HIGH',
    status: 'APPROVED',
    submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    dueAt: new Date(Date.now() + 4 * 3600000).toISOString(),
    age: '2h 00m',
    isOverdue: false,
    timeline: [
      { status: 'SUBMITTED', actor: 'Aarav Sharma', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), note: 'Outing window: 05:00 PM to 09:00 PM' },
      { status: 'APPROVED', actor: 'Suresh Patel (Warden)', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), note: 'Approved with parent verification call' }
    ],
    comments: [],
    attachments: []
  },
  {
    id: 'req_1041',
    requestNumber: 'REQ-1041',
    requestType: 'COMPLAINT',
    title: 'Severe bathroom pipe leakage in Room B-204',
    summary: 'Plumbing valve under basin cracked; continuous water seepage onto floor',
    requesterName: 'Aarav Sharma',
    requesterRoll: 'CS2023048',
    department: 'Plumbing Works',
    assignedTo: 'Ramesh Kumar (Plumber)',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    submittedAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    dueAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    age: '1d 4h',
    isOverdue: true,
    timeline: [
      { status: 'SUBMITTED', actor: 'Aarav Sharma', timestamp: new Date(Date.now() - 28 * 3600000).toISOString(), note: 'Ticket lodged from student portal' },
      { status: 'ASSIGNED', actor: 'AI Smart Router', timestamp: new Date(Date.now() - 26 * 3600000).toISOString(), note: 'Auto-routed to Estate Plumbing Team' },
      { status: 'IN_PROGRESS', actor: 'Ramesh Kumar', timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), note: 'Inspected leak; replacement brass coupling requested' }
    ],
    comments: [
      { id: 'cm_2', author: 'Ramesh Kumar', visibility: 'PUBLIC', content: 'Procuring heavy-duty CPVC valve from university hardware store.', createdAt: new Date(Date.now() - 4 * 3600000).toISOString() }
    ],
    attachments: []
  },
  {
    id: 'req_1045',
    requestNumber: 'REQ-1045',
    requestType: 'LEAVE',
    title: 'Academic Outstation Leave for National Hackathon',
    summary: 'Selected as university finalist team at Smart India Hackathon zonal round',
    requesterName: 'Pooja Hegde',
    requesterRoll: 'CS2024018',
    department: 'Hostel Affairs',
    assignedTo: 'Suresh Patel (Chief Warden)',
    priority: 'NORMAL',
    status: 'PENDING_APPROVAL',
    submittedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
    dueAt: new Date(Date.now() + 22.5 * 3600000).toISOString(),
    age: '1h 30m',
    isOverdue: false,
    timeline: [
      { status: 'SUBMITTED', actor: 'Pooja Hegde', timestamp: new Date(Date.now() - 1.5 * 3600000).toISOString(), note: 'Uploaded mentor invitation and travel tickets' }
    ],
    comments: [],
    attachments: []
  },
  {
    id: 'req_1050',
    requestNumber: 'REQ-1050',
    requestType: 'FEE_QUERY',
    title: 'Semester 3 scholarship adjustment discrepancy',
    summary: 'Post-Matric government grant credited but not reflected on student fee ledger',
    requesterName: 'Vikram Joshi',
    requesterRoll: 'ME2022091',
    department: 'Finance & Accounts',
    assignedTo: 'Meena Iyer (Senior Accountant)',
    priority: 'MEDIUM',
    status: 'UNDER_REVIEW',
    submittedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    dueAt: new Date(Date.now() + 16 * 3600000).toISOString(),
    age: '8h 00m',
    isOverdue: false,
    timeline: [
      { status: 'SUBMITTED', actor: 'Vikram Joshi', timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), note: 'Attached treasury acknowledgement copy' },
      { status: 'UNDER_REVIEW', actor: 'Meena Iyer', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), note: 'Cross-checking with State Bank treasury branch' }
    ],
    comments: [],
    attachments: []
  }
];

// Valid state transition map
const VALID_TRANSITIONS = {
  SUBMITTED: ['UNDER_REVIEW', 'ASSIGNED', 'CANCELLED', 'REJECTED'],
  UNDER_REVIEW: ['ASSIGNED', 'PENDING_APPROVAL', 'PENDING_INFORMATION', 'REJECTED', 'CANCELLED'],
  PENDING_INFORMATION: ['UNDER_REVIEW', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'PENDING_INFORMATION'],
  ASSIGNED: ['IN_PROGRESS', 'ON_HOLD', 'REJECTED', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'RESOLVED', 'REJECTED'],
  ON_HOLD: ['IN_PROGRESS', 'RESOLVED', 'REJECTED'],
  APPROVED: ['COMPLETED', 'RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: ['CLOSED']
};

export const getRequests = async (req, res) => {
  try {
    const { type, status, priority, department, search, overdue, page = 1, limit = 20 } = req.query;

    let list = [...memoryRequests];

    if (type && type !== 'ALL') {
      list = list.filter(r => r.requestType === type);
    }
    if (status && status !== 'ALL') {
      list = list.filter(r => r.status === status);
    }
    if (priority && priority !== 'ALL') {
      list = list.filter(r => r.priority === priority);
    }
    if (department && department !== 'ALL') {
      list = list.filter(r => r.department.toLowerCase().includes(department.toLowerCase()));
    }
    if (overdue === 'true') {
      list = list.filter(r => r.isOverdue);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.requestNumber.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        r.requesterRoll.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = list.slice(startIndex, startIndex + Number(limit));

    return successResponse(res, {
      requests: paginated,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }, 'Unified campus requests retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch requests', 'REQUESTS_FETCH_ERROR', 500);
  }
};

export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const reqItem = memoryRequests.find(r => r.id === id || r.requestNumber === id);

    if (!reqItem) {
      return errorResponse(res, 'Request not found', 'REQUEST_NOT_FOUND', 404);
    }

    return successResponse(res, reqItem, 'Request details retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve request', 'REQUEST_GET_ERROR', 500);
  }
};

export const createRequest = async (req, res) => {
  try {
    const { requestType, title, summary, priority, department, metadata } = req.body;

    if (!requestType || !title) {
      return errorResponse(res, 'requestType and title are required', 'MISSING_FIELDS', 400);
    }

    const prefixMap = {
      CERTIFICATE: 'CRT',
      GATE_PASS: 'GP',
      LEAVE: 'LEV',
      COMPLAINT: 'CMP',
      FEE_QUERY: 'FEE',
      VISITOR_REQUEST: 'VIS',
      OTHER: 'REQ'
    };

    const prefix = prefixMap[requestType] || 'REQ';
    const requestNumber = `${prefix}-${Date.now().toString().slice(-4)}`;

    const newReq = {
      id: `req_${Date.now()}`,
      requestNumber,
      requestType,
      title,
      summary: summary || title,
      requesterName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Aarav Sharma',
      requesterRoll: req.user?.rollNumber || 'CS2023048',
      department: department || 'General Administration',
      assignedTo: 'Unassigned',
      priority: priority || 'NORMAL',
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 48 * 3600000).toISOString(),
      age: 'Just now',
      isOverdue: false,
      metadata: metadata || {},
      timeline: [
        {
          status: 'SUBMITTED',
          actor: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Student',
          timestamp: new Date().toISOString(),
          note: 'Request initialized from universal portal'
        }
      ],
      comments: [],
      attachments: []
    };

    memoryRequests.unshift(newReq);

    await logAuditEvent({
      userId: req.user?.id,
      action: 'REQUEST_CREATED',
      entity: 'REQUEST',
      entityId: newReq.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      payload: { requestNumber, requestType, title }
    });

    notificationService.send({
      userId: req.user?.id || 'demo_user',
      title: `Request Filed: ${requestNumber}`,
      message: `Your ${requestType.toLowerCase().replace('_', ' ')} request "${title}" is now lodged.`,
      type: 'REQUEST_UPDATE',
      linkUrl: `/student/requests`
    });

    return successResponse(res, newReq, 'Request created successfully', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create request', 'REQUEST_CREATE_ERROR', 500);
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const item = memoryRequests.find(r => r.id === id || r.requestNumber === id);
    if (!item) return errorResponse(res, 'Request not found', 'REQUEST_NOT_FOUND', 404);

    const allowedNext = VALID_TRANSITIONS[item.status] || [];
    if (!allowedNext.includes(status) && req.user?.role !== 'SUPER_ADMIN') {
      return errorResponse(
        res,
        `Cannot transition from ${item.status} to ${status}. Valid transitions: [${allowedNext.join(', ')}]`,
        'INVALID_STATUS_TRANSITION',
        400
      );
    }

    const previousStatus = item.status;
    item.status = status;
    item.timeline.push({
      status,
      actor: req.user ? `${req.user.firstName} (${req.user.role})` : 'System Officer',
      timestamp: new Date().toISOString(),
      note: note || `Status transitioned to ${status}`
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'REQUEST_STATUS_CHANGED',
      entity: 'REQUEST',
      entityId: item.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      payload: { previousStatus, newStatus: status, note }
    });

    return successResponse(res, item, `Request updated to ${status}`);
  } catch (error) {
    return errorResponse(res, 'Failed to transition request status', 'STATUS_ERROR', 500);
  }
};

export const assignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, assignedTo, note } = req.body;

    const item = memoryRequests.find(r => r.id === id || r.requestNumber === id);
    if (!item) return errorResponse(res, 'Request not found', 'REQUEST_NOT_FOUND', 404);

    if (department) item.department = department;
    if (assignedTo) item.assignedTo = assignedTo;

    item.timeline.push({
      status: 'ASSIGNED',
      actor: req.user ? `${req.user.firstName} (${req.user.role})` : 'Admin',
      timestamp: new Date().toISOString(),
      note: note || `Assigned to ${assignedTo || department}`
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'REQUEST_ASSIGNED',
      entity: 'REQUEST',
      entityId: item.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      payload: { department, assignedTo }
    });

    return successResponse(res, item, 'Request assignment updated');
  } catch (error) {
    return errorResponse(res, 'Failed to assign request', 'ASSIGN_ERROR', 500);
  }
};

export const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const item = memoryRequests.find(r => r.id === id || r.requestNumber === id);
    if (!item) return errorResponse(res, 'Request not found', 'REQUEST_NOT_FOUND', 404);

    if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(item.status)) {
      return errorResponse(res, 'Cannot cancel request in completed state', 'CANNOT_CANCEL', 400);
    }

    item.status = 'CANCELLED';
    item.timeline.push({
      status: 'CANCELLED',
      actor: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Requester',
      timestamp: new Date().toISOString(),
      note: reason || 'Cancelled by requester'
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'REQUEST_CANCELLED',
      entity: 'REQUEST',
      entityId: item.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      payload: { reason }
    });

    return successResponse(res, item, 'Request cancelled');
  } catch (error) {
    return errorResponse(res, 'Failed to cancel request', 'CANCEL_ERROR', 500);
  }
};

export const addRequestComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, visibility = 'PUBLIC' } = req.body;

    if (!content) return errorResponse(res, 'Comment content is required', 'MISSING_CONTENT', 400);

    const item = memoryRequests.find(r => r.id === id || r.requestNumber === id);
    if (!item) return errorResponse(res, 'Request not found', 'REQUEST_NOT_FOUND', 404);

    const newComment = {
      id: `cm_${Date.now()}`,
      author: req.user ? `${req.user.firstName} (${req.user.role})` : 'Authorized Staff',
      visibility,
      content,
      createdAt: new Date().toISOString()
    };

    item.comments.push(newComment);

    return successResponse(res, { comment: newComment }, 'Comment logged successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to post comment', 'COMMENT_ERROR', 500);
  }
};

export const getApprovals = async (req, res) => {
  try {
    const pendingList = memoryRequests.filter(r => ['PENDING_APPROVAL', 'UNDER_REVIEW'].includes(r.status));
    return successResponse(res, { approvals: pendingList, total: pendingList.length }, 'Pending approvals fetched');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch approvals', 'APPROVALS_ERROR', 500);
  }
};

export const decideApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, remarks } = req.body; // 'APPROVE', 'REJECT', 'REQUEST_INFO'

    const item = memoryRequests.find(r => r.id === id || r.requestNumber === id);
    if (!item) return errorResponse(res, 'Request not found', 'NOT_FOUND', 404);

    let nextStatus = 'APPROVED';
    if (decision === 'REJECT') nextStatus = 'REJECTED';
    if (decision === 'REQUEST_INFO') nextStatus = 'PENDING_INFORMATION';

    item.status = nextStatus;
    item.timeline.push({
      status: nextStatus,
      actor: req.user ? `${req.user.firstName} (${req.user.role})` : 'Authority',
      timestamp: new Date().toISOString(),
      note: remarks || `Administrative decision: ${decision}`
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: decision === 'APPROVE' ? 'REQUEST_APPROVED' : decision === 'REJECT' ? 'REQUEST_REJECTED' : 'REQUEST_INFORMATION_REQUESTED',
      entity: 'REQUEST',
      entityId: item.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      payload: { decision, remarks }
    });

    return successResponse(res, item, `Request marked as ${nextStatus}`);
  } catch (error) {
    return errorResponse(res, 'Failed to process approval', 'APPROVAL_ERROR', 500);
  }
};

export const getWorkQueue = async (req, res) => {
  try {
    const { department, status } = req.query;
    let queue = [...memoryRequests];

    if (department) {
      queue = queue.filter(r => r.department.toLowerCase().includes(department.toLowerCase()));
    }
    if (status) {
      queue = queue.filter(r => r.status === status);
    }

    return successResponse(res, {
      items: queue,
      total: queue.length,
      stats: {
        total: queue.length,
        pending: queue.filter(q => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_APPROVAL'].includes(q.status)).length,
        inProgress: queue.filter(q => q.status === 'IN_PROGRESS').length,
        overdue: queue.filter(q => q.isOverdue).length
      }
    }, 'Operational work queue loaded');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch work queue', 'WORK_QUEUE_ERROR', 500);
  }
};

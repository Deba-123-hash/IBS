import prisma from '../config/database.js';
import { classifyComplaint } from '../ai/complaintClassifier.js';
import { checkDuplicateComplaint } from '../ai/duplicateDetector.js';
import notificationService from '../notifications/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

// In-memory backing store for demo reliability
let memoryComplaints = [
  {
    id: 'cmp_demo_01',
    ticketNumber: 'CMP-2026-0042',
    title: 'Severe bathroom pipe leakage in Room 304',
    description: 'Pipe under sink broke and water is actively leaking onto the washroom floor.',
    category: 'PLUMBING',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    location: 'Hostel Block B - Room 304',
    room: 'Room 304',
    assignedStaff: 'Ramesh Kumar (Plumber)',
    studentName: 'Aarav Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    slaDeadline: new Date(Date.now() + 10 * 3600000).toISOString(),
    comments: [
      { id: 'c1', sender: 'Aarav Sharma', message: 'Water is starting to enter the bedroom area.', time: '2 hours ago' },
      { id: 'c2', sender: 'Ramesh Kumar (Maintenance)', message: 'Parts requisitioned from store. En route to Block B.', time: '1 hour ago' }
    ],
    statusHistory: [
      { from: 'SUBMITTED', to: 'ASSIGNED', time: '2 hours ago', comment: 'AI auto-routed to Plumbing' },
      { from: 'ASSIGNED', to: 'IN_PROGRESS', time: '1 hour ago', comment: 'Technician claimed ticket' }
    ]
  },
  {
    id: 'cmp_demo_02',
    ticketNumber: 'CMP-2026-0038',
    title: 'Ceiling fan humming loudly and running slow',
    description: 'Regulator at max speed 5 but fan barely turns and makes vibrating screeching noise.',
    category: 'ELECTRICAL',
    priority: 'MEDIUM',
    status: 'SUBMITTED',
    location: 'Hostel Block A - Room 112',
    room: 'Room 112',
    assignedStaff: 'Unassigned',
    studentName: 'Rohan Mehra',
    photoUrl: null,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    slaDeadline: new Date(Date.now() + 24 * 3600000).toISOString(),
    comments: [],
    statusHistory: [
      { from: 'NONE', to: 'SUBMITTED', time: '5 hours ago', comment: 'Ticket lodged by student' }
    ]
  },
  {
    id: 'cmp_demo_03',
    ticketNumber: 'CMP-2026-0021',
    title: 'Wi-Fi router dead on 2nd floor corridor',
    description: 'No SSID broadcast for Campus_Hostel_B on 2nd floor since morning.',
    category: 'INTERNET',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    location: 'Hostel Block B - Floor 2 Corridor',
    room: 'Corridor 2',
    assignedStaff: 'Siddharth (IT Support)',
    studentName: 'Kunal Patel',
    photoUrl: null,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    resolvedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    comments: [
      { id: 'c3', sender: 'Siddharth (IT)', message: 'PoE power injector rebooted and firmware patched.', time: 'Yesterday' }
    ],
    statusHistory: [
      { from: 'SUBMITTED', to: 'IN_PROGRESS', time: 'Yesterday' },
      { from: 'IN_PROGRESS', to: 'RESOLVED', time: 'Yesterday' }
    ]
  }
];

export const getComplaints = async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    let list = [...memoryComplaints];

    if (prisma && prisma.complaint) {
      try {
        const dbComplaints = await prisma.complaint.findMany({
          include: {
            category: true,
            room: true,
            student: { include: { user: true } },
            assignment: { include: { staff: { include: { user: true } } } },
            comments: { include: { user: true } },
            statusHistory: true
          },
          orderBy: { createdAt: 'desc' }
        });

        if (dbComplaints.length > 0) {
          list = dbComplaints.map(c => ({
            id: c.id,
            ticketNumber: c.ticketNumber,
            title: c.title,
            description: c.description,
            category: c.category?.name || 'GENERAL',
            priority: c.priority,
            status: c.status,
            location: c.customLocation || (c.room ? `Room ${c.room.roomNumber}` : 'Campus'),
            room: c.room?.roomNumber || 'N/A',
            assignedStaff: c.assignment ? `${c.assignment.staff.user.firstName} ${c.assignment.staff.user.lastName}` : 'Unassigned',
            studentName: c.student ? `${c.student.user.firstName} ${c.student.user.lastName}` : 'Student',
            photoUrl: c.photoUrl,
            createdAt: c.createdAt.toISOString(),
            slaDeadline: c.slaDeadline?.toISOString(),
            comments: c.comments?.map(cm => ({ id: cm.id, sender: `${cm.user.firstName} ${cm.user.lastName}`, message: cm.message, time: cm.createdAt.toISOString() })) || [],
            statusHistory: c.statusHistory || []
          }));
        }
      } catch (err) {
        console.warn('[Complaint DB Query Warning]:', err.message);
      }
    }

    if (status) list = list.filter(c => c.status === status);
    if (category) list = list.filter(c => c.category.toUpperCase() === category.toUpperCase());
    if (priority) list = list.filter(c => c.priority === priority);

    return successResponse(res, { complaints: list, total: list.length }, 'Complaints retrieved successfully');
  } catch (error) {
    console.error('[Get Complaints Error]:', error);
    return errorResponse(res, 'Failed to fetch complaints', 'COMPLAINT_FETCH_ERROR', 500);
  }
};

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, priority, photoUrl } = req.body;

    if (!title || !description) {
      return errorResponse(res, 'Title and description are required', 'MISSING_FIELDS', 400);
    }

    // 1. Run AI Classifier & Smart Routing
    const aiAnalysis = await classifyComplaint(title, description, location);

    // 2. Run Duplicate Detector
    const duplicateCheck = await checkDuplicateComplaint(title, description);

    const ticketNumber = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint = {
      id: `cmp_${Date.now()}`,
      ticketNumber,
      title,
      description,
      category: category || aiAnalysis.category || 'OTHER',
      priority: priority || aiAnalysis.priority || 'MEDIUM',
      status: 'SUBMITTED',
      location: location || 'Hostel Room',
      room: location || 'Room',
      assignedStaff: aiAnalysis.suggestedTrade ? `Routed to: ${aiAnalysis.suggestedTrade} Team` : 'Unassigned',
      studentName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Aarav Sharma',
      photoUrl: photoUrl || null,
      createdAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 24 * 3600000).toISOString(),
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateInfo: duplicateCheck.isDuplicate ? duplicateCheck : null,
      comments: [],
      statusHistory: [
        { from: 'NONE', to: 'SUBMITTED', time: 'Just now', comment: `AI auto-classified as ${aiAnalysis.category} (${aiAnalysis.priority})` }
      ]
    };

    memoryComplaints.unshift(newComplaint);

    // Dispatch notification
    notificationService.send({
      userId: req.user?.id || 'demo_user',
      title: `Complaint Registered: ${ticketNumber}`,
      message: `Your grievance "${title}" has been lodged and assigned SLA tracking.`,
      type: 'COMPLAINT_UPDATE',
      linkUrl: `/student/complaints`
    });

    return successResponse(res, {
      complaint: newComplaint,
      aiAnalysis,
      duplicateCheck
    }, 'Grievance submitted successfully', 201);
  } catch (error) {
    console.error('[Create Complaint Error]:', error);
    return errorResponse(res, 'Failed to file complaint', 'COMPLAINT_CREATE_ERROR', 500);
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, resolutionPhotoUrl } = req.body;

    const ticket = memoryComplaints.find(c => c.id === id || c.ticketNumber === id);

    if (!ticket) {
      return errorResponse(res, 'Complaint ticket not found', 'NOT_FOUND', 404);
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    if (status === 'RESOLVED') {
      ticket.resolvedAt = new Date().toISOString();
      if (resolutionPhotoUrl) ticket.resolutionPhotoUrl = resolutionPhotoUrl;
    }

    ticket.statusHistory.push({
      from: oldStatus,
      to: status,
      time: 'Just now',
      comment: comment || `Status updated to ${status} by ${req.user?.firstName || 'Staff'}`
    });

    if (comment) {
      ticket.comments.push({
        id: `c_${Date.now()}`,
        sender: req.user ? `${req.user.firstName} (${req.user.role})` : 'Staff',
        message: comment,
        time: 'Just now'
      });
    }

    return successResponse(res, { complaint: ticket }, `Ticket status updated to ${status}`);
  } catch (error) {
    return errorResponse(res, 'Failed to update ticket status', 'STATUS_UPDATE_ERROR', 500);
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const ticket = memoryComplaints.find(c => c.id === id || c.ticketNumber === id);
    if (!ticket) return errorResponse(res, 'Ticket not found', 'NOT_FOUND', 404);

    const newComment = {
      id: `c_${Date.now()}`,
      sender: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Student',
      message,
      time: 'Just now'
    };

    ticket.comments.push(newComment);

    return successResponse(res, { comment: newComment }, 'Comment added successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to add comment', 'COMMENT_ERROR', 500);
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = memoryComplaints.find(c => c.id === id || c.ticketNumber === id);
    if (!ticket) return errorResponse(res, 'Complaint not found', 'NOT_FOUND', 404);
    return successResponse(res, ticket, 'Complaint details retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch complaint', 'FETCH_ERROR', 500);
  }
};

export const cancelComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = memoryComplaints.find(c => c.id === id || c.ticketNumber === id);
    if (!ticket) return errorResponse(res, 'Complaint not found', 'NOT_FOUND', 404);

    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      return errorResponse(res, 'Cannot cancel resolved complaint', 'CANNOT_CANCEL', 400);
    }

    ticket.status = 'CANCELLED';
    ticket.statusHistory.push({
      from: ticket.status,
      to: 'CANCELLED',
      time: 'Just now',
      comment: 'Cancelled by student'
    });

    return successResponse(res, ticket, 'Complaint cancelled successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to cancel complaint', 'CANCEL_ERROR', 500);
  }
};

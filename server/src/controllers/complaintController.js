import prisma from '../config/database.js';
import { classifyComplaint } from '../ai/complaintClassifier.js';
import { checkDuplicateComplaint } from '../ai/duplicateDetector.js';
import notificationService from '../notifications/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

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
    comments: [],
    statusHistory: []
  }
];

export const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, my } = req.query;
    const userId = req.user?.id;

    if (prisma && prisma.complaint) {
      try {
        const where = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;

        if (my && userId) {
          const student = await prisma.student.findFirst({ where: { userId } });
          if (student) where.studentId = student.id;
        }

        const dbComplaints = await prisma.complaint.findMany({
          where,
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

        if (dbComplaints && dbComplaints.length > 0) {
          let list = dbComplaints.map(c => ({
            id: c.id,
            ticketNumber: c.ticketNumber,
            title: c.title,
            description: c.description,
            category: c.category?.name || 'GENERAL',
            priority: c.priority,
            status: c.status,
            location: c.customLocation || (c.room ? `Room ${c.room.roomNumber}` : 'Campus'),
            room: c.room?.roomNumber || 'N/A',
            assignedStaff: c.assignment?.staff?.user ? `${c.assignment.staff.user.firstName} ${c.assignment.staff.user.lastName}` : 'Unassigned',
            studentName: c.student?.user ? `${c.student.user.firstName} ${c.student.user.lastName}` : 'Student',
            photoUrl: c.photoUrl,
            createdAt: c.createdAt.toISOString(),
            slaDeadline: c.slaDeadline?.toISOString(),
            comments: c.comments?.map(cm => ({ id: cm.id, sender: `${cm.user.firstName} ${cm.user.lastName}`, message: cm.message, time: cm.createdAt.toISOString() })) || [],
            statusHistory: c.statusHistory || []
          }));

          if (category) {
            list = list.filter(c => c.category.toUpperCase() === category.toUpperCase());
          }

          return successResponse(res, { complaints: list, total: list.length }, 'Complaints retrieved from database');
        }
      } catch (err) {
        console.warn('[Complaint DB Query Warning]:', err.message);
      }
    }

    let list = [...memoryComplaints];
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
    const userId = req.user?.id;

    if (!title || !description) {
      return errorResponse(res, 'Title and description are required', 'MISSING_FIELDS', 400);
    }

    const aiAnalysis = await classifyComplaint(title, description, location);
    const duplicateCheck = await checkDuplicateComplaint(title, description);
    const ticketNumber = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    if (prisma && userId) {
      try {
        let student = await prisma.student.findFirst({
          where: { userId },
          include: { roomAllocation: true }
        });
        if (!student) {
          student = await prisma.student.findFirst({ include: { roomAllocation: true } });
        }

        let complaintCategory = null;
        if (category) {
          complaintCategory = await prisma.complaintCategory.findFirst({
            where: { OR: [{ code: category.toUpperCase() }, { name: { contains: category, mode: 'insensitive' } }] }
          });
        }
        if (!complaintCategory) {
          complaintCategory = await prisma.complaintCategory.findFirst();
        }

        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
        const chosenPriority = validPriorities.includes(priority) ? priority : (validPriorities.includes(aiAnalysis.priority) ? aiAnalysis.priority : 'MEDIUM');

        if (student && complaintCategory) {
          const created = await prisma.$transaction(async (tx) => {
            const comp = await tx.complaint.create({
              data: {
                ticketNumber,
                studentId: student.id,
                title,
                description,
                categoryId: complaintCategory.id,
                priority: chosenPriority,
                status: 'SUBMITTED',
                roomId: student.roomAllocation?.roomId || null,
                customLocation: location || null,
                photoUrl: photoUrl || null,
                slaDeadline: new Date(Date.now() + 24 * 3600000),
                statusHistory: {
                  create: {
                    fromStatus: 'SUBMITTED',
                    toStatus: 'SUBMITTED',
                    changedById: userId,
                    comment: `Complaint registered. AI classified as ${complaintCategory.name} (${chosenPriority})`
                  }
                }
              },
              include: {
                category: true,
                statusHistory: true,
                student: { include: { user: true } }
              }
            });

            await tx.notification.create({
              data: {
                userId,
                title: `Complaint Registered: ${ticketNumber}`,
                message: `Your grievance "${title}" has been registered in the system.`,
                type: 'COMPLAINT',
                linkUrl: '/student/complaints'
              }
            });

            await tx.auditLog.create({
              data: {
                userId,
                action: 'CREATE_COMPLAINT',
                entity: 'Complaint',
                entityId: comp.id,
                payload: JSON.stringify({ ticketNumber, title, priority: chosenPriority })
              }
            });

            return comp;
          });

          return successResponse(res, {
            complaint: {
              id: created.id,
              ticketNumber: created.ticketNumber,
              title: created.title,
              description: created.description,
              category: created.category.name,
              priority: created.priority,
              status: created.status,
              createdAt: created.createdAt.toISOString()
            },
            aiAnalysis,
            duplicateCheck
          }, 'Grievance submitted and persisted to database', 201);
        }
      } catch (dbErr) {
        console.warn('[Complaint Controller] DB transaction failed, falling back:', dbErr.message);
      }
    }

    const newComplaint = {
      id: `cmp_${Date.now()}`,
      ticketNumber,
      title,
      description,
      category: category || aiAnalysis.category || 'OTHER',
      priority: priority || aiAnalysis.priority || 'MEDIUM',
      status: 'SUBMITTED',
      location: location || 'Hostel Room',
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
    const userId = req.user?.id;

    if (prisma && userId) {
      try {
        const existing = await prisma.complaint.findFirst({
          where: { OR: [{ id }, { ticketNumber: id }] },
          include: { student: true }
        });

        if (existing) {
          const updated = await prisma.$transaction(async (tx) => {
            const up = await tx.complaint.update({
              where: { id: existing.id },
              data: {
                status,
                resolvedAt: status === 'RESOLVED' ? new Date() : undefined
              }
            });

            await tx.complaintStatusHistory.create({
              data: {
                complaintId: existing.id,
                fromStatus: existing.status,
                toStatus: status,
                changedById: userId,
                comment: comment || `Status updated to ${status}`
              }
            });

            await tx.notification.create({
              data: {
                userId: existing.student.userId,
                title: `Complaint Status: ${status}`,
                message: `Ticket ${existing.ticketNumber} updated to ${status}.`,
                type: 'COMPLAINT',
                linkUrl: '/student/complaints'
              }
            });

            await tx.auditLog.create({
              data: {
                userId,
                action: 'UPDATE_COMPLAINT_STATUS',
                entity: 'Complaint',
                entityId: existing.id,
                payload: JSON.stringify({ from: existing.status, to: status, comment })
              }
            });

            return up;
          });

          return successResponse(res, { complaint: updated }, `Ticket status updated to ${status} in database`);
        }
      } catch (dbErr) {
        console.warn('[Complaint Controller] DB updateComplaintStatus failed:', dbErr.message);
      }
    }

    const ticket = memoryComplaints.find(c => c.id === id || c.ticketNumber === id);
    if (!ticket) return errorResponse(res, 'Complaint ticket not found', 'NOT_FOUND', 404);

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

    return successResponse(res, { complaint: ticket }, `Ticket status updated to ${status}`);
  } catch (error) {
    return errorResponse(res, 'Failed to update ticket status', 'STATUS_UPDATE_ERROR', 500);
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const message = req.body.message || req.body.content || req.body.note;
    const userId = req.user?.id;

    if (prisma && userId) {
      try {
        const complaint = await prisma.complaint.findFirst({
          where: { OR: [{ id }, { ticketNumber: id }] }
        });

        if (complaint) {
          const comment = await prisma.complaintComment.create({
            data: {
              complaintId: complaint.id,
              userId,
              message
            },
            include: { user: true }
          });

          return successResponse(res, {
            comment: {
              id: comment.id,
              sender: `${comment.user.firstName} ${comment.user.lastName}`,
              message: comment.message,
              time: comment.createdAt.toISOString()
            }
          }, 'Comment added to database');
        }
      } catch (dbErr) {
        console.warn('[Complaint Controller] DB addComment failed:', dbErr.message);
      }
    }

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

    if (prisma) {
      try {
        const c = await prisma.complaint.findFirst({
          where: { OR: [{ id }, { ticketNumber: id }] },
          include: {
            category: true,
            room: true,
            student: { include: { user: true } },
            assignment: { include: { staff: { include: { user: true } } } },
            comments: { include: { user: true } },
            statusHistory: true
          }
        });

        if (c) {
          return successResponse(res, {
            id: c.id,
            ticketNumber: c.ticketNumber,
            title: c.title,
            description: c.description,
            category: c.category?.name || 'GENERAL',
            priority: c.priority,
            status: c.status,
            location: c.customLocation || (c.room ? `Room ${c.room.roomNumber}` : 'Campus'),
            room: c.room?.roomNumber || 'N/A',
            assignedStaff: c.assignment?.staff?.user ? `${c.assignment.staff.user.firstName} ${c.assignment.staff.user.lastName}` : 'Unassigned',
            studentName: c.student?.user ? `${c.student.user.firstName} ${c.student.user.lastName}` : 'Student',
            photoUrl: c.photoUrl,
            createdAt: c.createdAt.toISOString(),
            slaDeadline: c.slaDeadline?.toISOString(),
            comments: c.comments?.map(cm => ({ id: cm.id, sender: `${cm.user.firstName} ${cm.user.lastName}`, message: cm.message, time: cm.createdAt.toISOString() })) || [],
            statusHistory: c.statusHistory || []
          }, 'Complaint details retrieved from database');
        }
      } catch (dbErr) {
        console.warn('[Complaint Controller] DB getComplaintById failed:', dbErr.message);
      }
    }

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
    return successResponse(res, ticket, 'Complaint cancelled successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to cancel complaint', 'CANCEL_ERROR', 500);
  }
};

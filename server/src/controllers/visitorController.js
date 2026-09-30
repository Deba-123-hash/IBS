import { successResponse, errorResponse } from '../utils/response.js';

let memoryVisitors = [
  {
    id: 'vis_01',
    requestNumber: 'VIS-2026-0012',
    fullName: 'Suresh Sharma (Parent)',
    phoneNumber: '+91 94370 12345',
    idProofType: 'AADHAAR',
    idProofNumber: 'XXXX-XXXX-9812',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2023048',
    purpose: 'Deliver academic textbooks and medicines',
    vehicleNumber: 'OD-02-BA-1982',
    expectedDate: '2026-09-30',
    checkInTime: '2026-09-30T10:30:00Z',
    checkOutTime: null,
    status: 'CHECKED_IN'
  },
  {
    id: 'vis_02',
    requestNumber: 'VIS-2026-0014',
    fullName: 'Sunita Mehra (Mother)',
    phoneNumber: '+91 98111 22334',
    idProofType: 'PAN',
    idProofNumber: 'ABCDE1234F',
    studentName: 'Rohan Mehra',
    rollNumber: 'CS2023019',
    purpose: 'Family greeting during visiting hours',
    vehicleNumber: 'DL-01-AB-1234',
    expectedDate: '2026-09-30',
    checkInTime: null,
    checkOutTime: null,
    status: 'APPROVED'
  }
];

export const getVisitors = async (req, res) => {
  try {
    const { status, search } = req.query;
    let list = [...memoryVisitors];

    if (status && status !== 'ALL') {
      list = list.filter(v => v.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.fullName.toLowerCase().includes(q) ||
        v.studentName.toLowerCase().includes(q) ||
        v.rollNumber.toLowerCase().includes(q)
      );
    }

    return successResponse(res, { visitors: list, total: list.length }, 'Visitor logs retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch visitors', 'VISITOR_FETCH_ERROR', 500);
  }
};

export const registerVisitor = async (req, res) => {
  try {
    const { fullName, phoneNumber, idProofType, idProofNumber, purpose, vehicleNumber, expectedDate } = req.body;

    if (!fullName || !phoneNumber || !purpose) {
      return errorResponse(res, 'Name, phone number, and purpose are required', 'MISSING_FIELDS', 400);
    }

    const newVisitor = {
      id: `vis_${Date.now()}`,
      requestNumber: `VIS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      phoneNumber,
      idProofType: idProofType || 'GOVT_ID',
      idProofNumber: idProofNumber || 'VERIFIED',
      studentName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Aarav Sharma',
      rollNumber: req.user?.rollNumber || 'CS2023048',
      purpose,
      vehicleNumber: vehicleNumber || 'N/A',
      expectedDate: expectedDate || new Date().toISOString().split('T')[0],
      checkInTime: null,
      checkOutTime: null,
      status: 'APPROVED' // Auto-approved for verified parents in demo
    };

    memoryVisitors.unshift(newVisitor);

    return successResponse(res, { visitor: newVisitor }, 'Visitor pass registered for security check-in', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to register visitor', 'VISITOR_ERROR', 500);
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = memoryVisitors.find(v => v.id === id || v.requestNumber === id);
    if (!visitor) return errorResponse(res, 'Visitor record not found', 'NOT_FOUND', 404);
    return successResponse(res, visitor, 'Visitor record details retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to retrieve visitor', 'FETCH_ERROR', 500);
  }
};

export const cancelVisitorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = memoryVisitors.find(v => v.id === id || v.requestNumber === id);
    if (!visitor) return errorResponse(res, 'Visitor record not found', 'NOT_FOUND', 404);

    if (visitor.status === 'CHECKED_IN') {
      return errorResponse(res, 'Cannot cancel active visitor on campus', 'CANNOT_CANCEL', 400);
    }

    visitor.status = 'CANCELLED';
    return successResponse(res, visitor, 'Visitor appointment cancelled');
  } catch (error) {
    return errorResponse(res, 'Failed to cancel visitor pass', 'CANCEL_ERROR', 500);
  }
};

export const checkInVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = memoryVisitors.find(v => v.id === id || v.requestNumber === id);
    if (!visitor) return errorResponse(res, 'Visitor record not found', 'NOT_FOUND', 404);

    visitor.status = 'CHECKED_IN';
    visitor.checkInTime = new Date().toISOString();
    return successResponse(res, visitor, `Visitor ${visitor.fullName} checked in to campus`);
  } catch (error) {
    return errorResponse(res, 'Check-in failed', 'CHECKIN_ERROR', 500);
  }
};

export const checkOutVisitor = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = memoryVisitors.find(v => v.id === id || v.requestNumber === id);
    if (!visitor) return errorResponse(res, 'Visitor record not found', 'NOT_FOUND', 404);

    visitor.status = 'CHECKED_OUT';
    visitor.checkOutTime = new Date().toISOString();
    return successResponse(res, visitor, `Visitor ${visitor.fullName} recorded exit from campus`);
  } catch (error) {
    return errorResponse(res, 'Check-out failed', 'CHECKOUT_ERROR', 500);
  }
};

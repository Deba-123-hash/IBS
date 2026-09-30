import crypto from 'crypto';
import prisma from '../config/database.js';
import notificationService from '../notifications/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

let memoryGatePasses = [
  {
    id: 'gp_01',
    passNumber: 'GP-2026-0042',
    studentName: 'Aarav Sharma',
    rollNumber: 'CS2023048',
    hostel: 'Aryabhatta Hall - Block B, Room 304',
    type: 'DAY_OUTING',
    reason: 'Visit to Dental Clinic for tooth extraction checkup',
    destination: 'Apollo Health Center, Sector 4',
    outTimeExpected: new Date(Date.now() + 1 * 3600000).toISOString(),
    inTimeExpected: new Date(Date.now() + 5 * 3600000).toISOString(),
    status: 'APPROVED',
    qrCodeToken: 'GP-SECURE-TOKEN-CS2023048-DAY42',
    approvedBy: 'Suresh Patel (Warden)',
    approvedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    events: []
  },
  {
    id: 'gp_02',
    passNumber: 'GP-2026-0039',
    studentName: 'Rohan Mehra',
    rollNumber: 'CS2023019',
    hostel: 'Aryabhatta Hall - Block A, Room 112',
    type: 'NIGHT_OUT',
    reason: 'Attending elder sister wedding ceremony in hometown',
    destination: 'Cuttack, Odisha',
    outTimeExpected: new Date(Date.now() - 24 * 3600000).toISOString(),
    inTimeExpected: new Date(Date.now() + 48 * 3600000).toISOString(),
    status: 'CHECKED_OUT',
    qrCodeToken: 'GP-SECURE-TOKEN-CS2023019-NIGHT39',
    approvedBy: 'Suresh Patel (Warden)',
    approvedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 3600000).toISOString(),
    events: [
      { eventType: 'CHECK_OUT', scannedAt: new Date(Date.now() - 24 * 3600000).toISOString(), guard: 'Devendra Singh (Gate 1)' }
    ]
  },
  {
    id: 'gp_03',
    passNumber: 'GP-2026-0045',
    studentName: 'Sneha Roy',
    rollNumber: 'EC2023091',
    hostel: 'Kalpana Chawla Hall - Block C, Room 202',
    type: 'DAY_OUTING',
    reason: 'Purchase technical textbooks at City Book Market',
    destination: 'Station Road',
    outTimeExpected: new Date(Date.now() + 2 * 3600000).toISOString(),
    inTimeExpected: new Date(Date.now() + 6 * 3600000).toISOString(),
    status: 'PENDING',
    qrCodeToken: null,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    events: []
  }
];

export const getGatePasses = async (req, res) => {
  try {
    const { status, type } = req.query;
    let list = [...memoryGatePasses];

    if (status) list = list.filter(p => p.status === status);
    if (type) list = list.filter(p => p.type === type);

    return successResponse(res, { gatePasses: list, total: list.length }, 'Gate passes fetched successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch gate passes', 'GATEPASS_FETCH_ERROR', 500);
  }
};

export const createGatePass = async (req, res) => {
  try {
    const { type, reason, destination, outTimeExpected, inTimeExpected } = req.body;

    if (!reason || !destination || !outTimeExpected || !inTimeExpected) {
      return errorResponse(res, 'All fields (reason, destination, out time, in time) are required', 'MISSING_FIELDS', 400);
    }

    const passNumber = `GP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const qrToken = `GP-TOKEN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const newPass = {
      id: `gp_${Date.now()}`,
      passNumber,
      studentName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Aarav Sharma',
      rollNumber: req.user?.rollNumber || 'CS2023048',
      hostel: 'Aryabhatta Hall - Block B, Room 304',
      type: type || 'DAY_OUTING',
      reason,
      destination,
      outTimeExpected,
      inTimeExpected,
      status: 'PENDING',
      qrCodeToken: qrToken,
      createdAt: new Date().toISOString(),
      events: []
    };

    memoryGatePasses.unshift(newPass);

    notificationService.send({
      userId: req.user?.id || 'demo_user',
      title: 'Gate Pass Requested',
      message: `Your request ${passNumber} has been sent to the Warden for authorization.`,
      type: 'GATE_PASS',
      linkUrl: '/student/gate-passes'
    });

    return successResponse(res, { gatePass: newPass }, 'Gate pass requisition submitted', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create gate pass', 'GATEPASS_CREATE_ERROR', 500);
  }
};

export const decideGatePass = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, remarks } = req.body; // 'APPROVED' or 'REJECTED'

    const pass = memoryGatePasses.find(p => p.id === id || p.passNumber === id);
    if (!pass) return errorResponse(res, 'Gate pass not found', 'NOT_FOUND', 404);

    pass.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    pass.approvedBy = req.user ? `${req.user.firstName} (Warden)` : 'Chief Warden';
    pass.approvedAt = new Date().toISOString();
    pass.remarks = remarks || '';

    return successResponse(res, { gatePass: pass }, `Gate pass ${decision.toLowerCase()} successfully`);
  } catch (error) {
    return errorResponse(res, 'Failed to update gate pass', 'GATEPASS_DECISION_ERROR', 500);
  }
};

export const getGatePassById = async (req, res) => {
  try {
    const { id } = req.params;
    const pass = memoryGatePasses.find(p => p.id === id || p.passNumber === id);
    if (!pass) return errorResponse(res, 'Gate pass not found', 'NOT_FOUND', 404);
    return successResponse(res, pass, 'Gate pass details retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch gate pass', 'FETCH_ERROR', 500);
  }
};

export const cancelGatePass = async (req, res) => {
  try {
    const { id } = req.params;
    const pass = memoryGatePasses.find(p => p.id === id || p.passNumber === id);
    if (!pass) return errorResponse(res, 'Gate pass not found', 'NOT_FOUND', 404);

    if (pass.status === 'CHECKED_OUT' || pass.status === 'CHECKED_IN') {
      return errorResponse(res, 'Cannot cancel pass in progress', 'CANNOT_CANCEL', 400);
    }

    pass.status = 'CANCELLED';
    return successResponse(res, pass, 'Gate pass cancelled successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to cancel gate pass', 'CANCEL_ERROR', 500);
  }
};

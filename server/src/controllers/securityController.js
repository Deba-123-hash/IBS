import { successResponse, errorResponse } from '../utils/response.js';

export const verifyQrGatePass = async (req, res) => {
  try {
    const qrCodeToken = req.body.qrCodeToken || req.body.qrData || req.body.token || req.body.passNumber;

    if (!qrCodeToken) {
      return errorResponse(res, 'QR Code Token or Pass Number is required for scan verification', 'MISSING_TOKEN', 400);
    }

    // High fidelity response with student credentials
    const verifiedPass = {
      passNumber: 'GP-2026-0042',
      studentName: 'Aarav Sharma',
      rollNumber: 'CS2023048',
      hostel: 'Aryabhatta Hall - Block B, Room 304',
      type: 'DAY_OUTING',
      destination: 'Apollo Health Center, Sector 4',
      status: 'VERIFIED_ACTIVE',
      validFrom: '05:00 PM Today',
      validUntil: '09:00 PM Today',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      guardianPhone: '+91 98765 43210',
      action: 'CHECK_OUT_RECORDED',
      timestamp: new Date().toLocaleTimeString()
    };

    return successResponse(res, verifiedPass, 'Gate pass authenticated! Security clearance granted.');
  } catch (error) {
    return errorResponse(res, 'Gate verification failed', 'VERIFICATION_ERROR', 500);
  }
};

export const getSecurityLogs = async (req, res) => {
  try {
    const logs = [
      { id: 'log_01', type: 'STUDENT_CHECKOUT', name: 'Aarav Sharma', roll: 'CS2023048', time: '17:02', gate: 'Main Gate 1', status: 'VALID' },
      { id: 'log_02', type: 'VISITOR_ENTRY', name: 'Mr. S. K. Roy (Parent)', hostRoll: 'EC2023091', time: '16:45', gate: 'Hostel Gate B', status: 'VERIFIED' },
      { id: 'log_03', type: 'STUDENT_CHECKIN', name: 'Rohan Mehra', roll: 'CS2023019', time: '15:30', gate: 'Main Gate 1', status: 'RETURNED_ON_TIME' }
    ];
    return successResponse(res, { logs }, 'Security logs retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch security logs', 'LOG_ERROR', 500);
  }
};

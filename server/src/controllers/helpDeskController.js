import crypto from 'crypto';
import { successResponse, errorResponse } from '../utils/response.js';

let memoryHelpDeskTickets = [];

export const createProxyRequest = async (req, res) => {
  try {
    const { studentRoll, requestType, title, details, category, destination, outTime, inTime } = req.body;

    if (!studentRoll || !requestType) {
      return errorResponse(res, 'Student roll number and request type are required', 'MISSING_FIELDS', 400);
    }

    const ticketNumber = `HLP-${requestType.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const barcode = `BARCODE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const newTicket = {
      id: `hlp_${Date.now()}`,
      ticketNumber,
      barcode,
      studentRoll,
      studentName: 'Aarav Sharma (Verified Physical ID)',
      requestType, // 'COMPLAINT', 'GATE_PASS', 'CERTIFICATE'
      title: title || `${requestType} via Help Desk`,
      details: details || '',
      category: category || 'GENERAL',
      destination: destination || 'N/A',
      outTime: outTime || null,
      inTime: inTime || null,
      loggedByStaff: req.user ? `${req.user.firstName} (${req.user.role})` : 'Help Desk Officer',
      status: 'LOGGED_PROXY',
      createdAt: new Date().toISOString()
    };

    memoryHelpDeskTickets.unshift(newTicket);

    return successResponse(res, { ticket: newTicket }, 'Proxy request logged successfully. Physical receipt generated.', 201);
  } catch (error) {
    return errorResponse(res, 'Failed to log proxy request', 'PROXY_REQ_ERROR', 500);
  }
};

export const getHelpDeskTickets = async (req, res) => {
  return successResponse(res, { tickets: memoryHelpDeskTickets }, 'Help desk tickets fetched');
};

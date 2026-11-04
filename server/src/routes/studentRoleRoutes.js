import express from 'express';
import {
  getStudentDashboard,
  getProfile,
  updateProfile,
  getAttendance,
  getAttendanceSummary,
  getMyHostel,
  getMyRoom,
  requestRoomTransfer,
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequestById,
  cancelLeaveRequest,
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  getMyFees,
  getMyFeesSummary,
  getMyPayments,
  createVisitorRequest,
  getVisitorRequests,
  cancelVisitorRequest
} from '../controllers/studentRoleController.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';
import { validate } from '../validators/index.js';
import {
  updateProfileValidator,
  createLeaveRequestValidator,
  createStudentComplaintValidator,
  studentVisitorRequestValidator
} from '../validators/roleValidators.js';

const router = express.Router();

router.use(authenticate);

// ==========================================
// Dashboard & Profile
// ==========================================
router.get('/dashboard', requirePermission('STUDENT_READ_OWN'), getStudentDashboard);
router.get('/me/dashboard', requirePermission('STUDENT_READ_OWN'), getStudentDashboard);
router.get('/dashboard-summary', requirePermission('STUDENT_READ_OWN'), getStudentDashboard);
router.get('/profile', requirePermission('STUDENT_READ_OWN'), getProfile);
router.patch('/profile', requirePermission('STUDENT_UPDATE_OWN'), validate(updateProfileValidator), updateProfile);

// ==========================================
// Attendance
// ==========================================
router.get('/attendance', requirePermission('ATTENDANCE_READ_OWN'), getAttendance);
router.get('/attendance/summary', requirePermission('ATTENDANCE_READ_OWN'), getAttendanceSummary);

// ==========================================
// Hostel & Room
// ==========================================
router.get('/hostel', requirePermission('HOSTEL_READ_OWN'), getMyHostel);
router.get('/room', requirePermission('HOSTEL_READ_OWN'), getMyRoom);
router.post('/room-transfer-request', requirePermission('ROOM_TRANSFER_REQUEST'), requestRoomTransfer);

// ==========================================
// Leave Requests
// ==========================================
router.post('/leave-requests', requirePermission('LEAVE_CREATE'), validate(createLeaveRequestValidator), createLeaveRequest);
router.get('/leave-requests', requirePermission('LEAVE_READ_OWN'), getLeaveRequests);
router.get('/leave-requests/:id', requirePermission('LEAVE_READ_OWN'), getLeaveRequestById);
router.delete('/leave-requests/:id', requirePermission('LEAVE_CREATE'), cancelLeaveRequest);

// ==========================================
// Complaints
// ==========================================
router.post('/complaints', requirePermission('COMPLAINT_CREATE'), validate(createStudentComplaintValidator), createComplaint);
router.get('/complaints', requirePermission('COMPLAINT_READ_OWN'), getComplaints);
router.get('/complaints/:id', requirePermission('COMPLAINT_READ_OWN'), getComplaintById);
router.patch('/complaints/:id', requirePermission('COMPLAINT_CREATE'), updateComplaint);

// ==========================================
// Fees & Payments
// ==========================================
router.get('/fees', requirePermission('FEES_READ_OWN'), getMyFees);
router.get('/fees/summary', requirePermission('FEES_READ_OWN'), getMyFeesSummary);
router.get('/payments', requirePermission('PAYMENT_READ_OWN'), getMyPayments);

// ==========================================
// Visitor Requests
// ==========================================
router.post('/visitor-requests', requirePermission('VISITOR_CREATE'), validate(studentVisitorRequestValidator), createVisitorRequest);
router.get('/visitor-requests', requirePermission('VISITOR_READ_OWN'), getVisitorRequests);
router.patch('/visitor-requests/:id/cancel', requirePermission('VISITOR_READ_OWN'), cancelVisitorRequest);

export default router;

import express from 'express';
import {
  getWardenDashboard,
  getHostels,
  getHostelById,
  getRooms,
  getRoomById,
  allocateRoom,
  updateAllocation,
  vacateAllocation,
  initiateRoomTransfer,
  getRoomTransfers,
  approveRoomTransfer,
  rejectRoomTransfer,
  getLeaveRequests,
  getLeaveRequestById,
  approveLeaveRequest,
  rejectLeaveRequest,
  getHostelComplaints,
  assignComplaint,
  updateComplaintStatus,
  getHostelStudents
} from '../controllers/wardenRoleController.js';
import { authenticate, requireRole, requirePermission } from '../middleware/auth.js';
import { validate } from '../validators/index.js';
import {
  roomAllocationValidator,
  roomTransferValidator,
  reviewTransferValidator,
  reviewLeaveValidator,
  assignComplaintValidator,
  updateComplaintStatusValidator
} from '../validators/roleValidators.js';

const router = express.Router();

router.use(authenticate);

// ==========================================
// Dashboard
// ==========================================
router.get('/dashboard', requireRole('WARDEN', 'ADMIN', 'SUPER_ADMIN'), getWardenDashboard);

// ==========================================
// Hostel & Room Directory
// ==========================================
router.get('/hostels', requirePermission('HOSTEL_READ_ALL'), getHostels);
router.get('/hostels/:id', requirePermission('HOSTEL_READ_ALL'), getHostelById);
router.get('/rooms', requirePermission('HOSTEL_READ_ALL'), getRooms);
router.get('/rooms/:id', requirePermission('HOSTEL_READ_ALL'), getRoomById);

// ==========================================
// Room Allocation
// ==========================================
router.post('/room-allocations', requirePermission('ROOM_ASSIGN'), validate(roomAllocationValidator), allocateRoom);
router.patch('/room-allocations/:id', requirePermission('ROOM_ASSIGN'), updateAllocation);
router.delete('/room-allocations/:id', requirePermission('ROOM_ASSIGN'), vacateAllocation);

// ==========================================
// Room Transfer
// ==========================================
router.post('/room-transfers', requirePermission('ROOM_ASSIGN'), validate(roomTransferValidator), initiateRoomTransfer);
router.get('/room-transfers', requirePermission('HOSTEL_READ_ALL'), getRoomTransfers);
router.patch('/room-transfers/:id/approve', requirePermission('ROOM_TRANSFER_APPROVE'), validate(reviewTransferValidator), approveRoomTransfer);
router.patch('/room-transfers/:id/reject', requirePermission('ROOM_TRANSFER_APPROVE'), validate(reviewTransferValidator), rejectRoomTransfer);

// ==========================================
// Leave Request Management
// ==========================================
router.get('/leave-requests', requirePermission('LEAVE_READ_ALL'), getLeaveRequests);
router.get('/leave-requests/:id', requirePermission('LEAVE_READ_ALL'), getLeaveRequestById);
router.patch('/leave-requests/:id/approve', requirePermission('LEAVE_APPROVE'), validate(reviewLeaveValidator), approveLeaveRequest);
router.patch('/leave-requests/:id/reject', requirePermission('LEAVE_REJECT'), validate(reviewLeaveValidator), rejectLeaveRequest);

// ==========================================
// Hostel Complaints
// ==========================================
router.get('/complaints', requirePermission('COMPLAINT_READ_ALL'), getHostelComplaints);
router.patch('/complaints/:id/assign', requirePermission('COMPLAINT_ASSIGN'), validate(assignComplaintValidator), assignComplaint);
router.patch('/complaints/:id/status', requirePermission('COMPLAINT_RESOLVE'), validate(updateComplaintStatusValidator), updateComplaintStatus);

// ==========================================
// Residents & Students Directory
// ==========================================
router.get('/students', requirePermission('HOSTEL_READ_ALL'), getHostelStudents);

export default router;

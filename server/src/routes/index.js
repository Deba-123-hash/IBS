import express from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import studentRoleRoutes from './studentRoleRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import timetableRoutes from './timetableRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import gatePassRoutes from './gatePassRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import requestRoutes from './requestRoutes.js';
import approvalRoutes from './approvalRoutes.js';
import workQueueRoutes from './workQueueRoutes.js';
import certificateRoutes from './certificateRoutes.js';
import messRoutes from './messRoutes.js';
import hostelRoutes from './hostelRoutes.js';
import noticeRoutes from './noticeRoutes.js';
import feeRoutes from './feeRoutes.js';
import visitorRoutes from './visitorRoutes.js';
import securityRoleRoutes from './securityRoleRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import aiRoutes from './aiRoutes.js';
import helpDeskRoutes from './helpDeskRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';
import accountantRoutes from './accountantRoutes.js';
import accountsRoutes from './accountsRoutes.js';
import wardenRoleRoutes from './wardenRoleRoutes.js';
import facultyRoutes from './facultyRoutes.js';

const router = express.Router();

// Core Phase 1 Foundation Routes
router.use('/health', healthRoutes);

// Modular Domain Endpoints
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use(['/student', '/students'], studentRoleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);
router.use('/complaints', complaintRoutes);
router.use(['/gatepass', '/gate-passes'], gatePassRoutes);
router.use(['/leave', '/leaves'], leaveRoutes);
router.use('/requests', requestRoutes);
router.use('/approvals', approvalRoutes);
router.use(['/work-queue', '/maintenance'], workQueueRoutes);
router.use('/certificates', certificateRoutes);
router.use('/mess', messRoutes);
router.use(['/hostel', '/hostels'], hostelRoutes);
router.use('/notices', noticeRoutes);
router.use('/fees', feeRoutes);
router.use('/visitors', visitorRoutes);
router.use('/security', securityRoleRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/help-desk', helpDeskRoutes);
router.use('/notifications', notificationRoutes);

// Role-Based Specialized Endpoints
router.use('/admin', adminRoutes);
router.use('/accountant', accountantRoutes);
router.use('/accounts', accountsRoutes);
router.use('/warden', wardenRoleRoutes);
router.use('/faculty', facultyRoutes);

export default router;

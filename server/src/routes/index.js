import express from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import studentRoutes from './studentRoutes.js';
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
import securityRoutes from './securityRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import aiRoutes from './aiRoutes.js';
import helpDeskRoutes from './helpDeskRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Core Phase 1 Foundation Routes
router.use('/health', healthRoutes);

// Modular Domain Endpoints
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);
router.use('/complaints', complaintRoutes);
router.use('/gate-passes', gatePassRoutes);
router.use('/leave', leaveRoutes);
router.use('/requests', requestRoutes);
router.use('/approvals', approvalRoutes);
router.use('/work-queue', workQueueRoutes);
router.use('/certificates', certificateRoutes);
router.use('/mess', messRoutes);
router.use('/hostels', hostelRoutes);
router.use('/notices', noticeRoutes);
router.use('/fees', feeRoutes);
router.use('/visitors', visitorRoutes);
router.use('/security', securityRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ai', aiRoutes);
router.use('/help-desk', helpDeskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;

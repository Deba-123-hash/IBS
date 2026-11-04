import express from 'express';
import {
  getFacultyDashboard,
  getFacultyClasses,
  getFacultyStudents,
  markFacultyAttendance,
  endorseStudentLeave
} from '../controllers/facultyController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Allow FACULTY, STAFF, ADMIN, and SUPER_ADMIN
router.use(requireRole('FACULTY', 'STAFF', 'ADMIN', 'SUPER_ADMIN'));

// Telemetry & Profile
router.get('/dashboard', getFacultyDashboard);
router.get('/classes', getFacultyClasses);
router.get('/students', getFacultyStudents);

// Attendance Actions
router.post('/attendance', markFacultyAttendance);

// Leave Endorsements
router.get('/leaves', getFacultyDashboard);
router.patch('/leaves/:id/endorse', endorseStudentLeave);

export default router;


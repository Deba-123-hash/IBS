import express from 'express';
import {
  getVisitors,
  registerVisitor,
  getVisitorById,
  cancelVisitorRequest,
  checkInVisitor,
  checkOutVisitor
} from '../controllers/visitorController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getVisitors);
router.get('/my-requests', authenticate, getVisitors);
router.post('/', authenticate, registerVisitor);
router.post('/requests', authenticate, registerVisitor);
router.get('/requests/:id', authenticate, getVisitorById);
router.patch('/requests/:id/cancel', authenticate, cancelVisitorRequest);
router.patch('/:id/check-in', authenticate, authorize('SECURITY', 'WARDEN', 'ADMIN', 'SUPER_ADMIN'), checkInVisitor);
router.patch('/:id/check-out', authenticate, authorize('SECURITY', 'WARDEN', 'ADMIN', 'SUPER_ADMIN'), checkOutVisitor);
router.get('/:id', authenticate, getVisitorById);

export default router;

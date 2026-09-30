import express from 'express';
import { getMessMenu, submitMessFeedback, getMessAnalytics } from '../controllers/messController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/menu', authenticate, getMessMenu);
router.get('/menu/week', authenticate, getMessMenu);
router.post('/feedback', authenticate, submitMessFeedback);
router.get('/feedback', authenticate, getMessAnalytics);
router.get('/feedback/me', authenticate, getMessAnalytics);
router.get('/analytics', authenticate, getMessAnalytics);

export default router;

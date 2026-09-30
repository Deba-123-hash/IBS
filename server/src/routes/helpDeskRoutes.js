import express from 'express';
import { createProxyRequest, getHelpDeskTickets } from '../controllers/helpDeskController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/proxy-request', authenticate, createProxyRequest);
router.get('/tickets', authenticate, getHelpDeskTickets);

export default router;

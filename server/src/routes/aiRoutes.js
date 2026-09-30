import express from 'express';
import {
  handleAiChat,
  handleClassifyComplaint,
  getRecurringIssues,
  getComplaintDuplicates,
  summarizeComplaint
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', authenticate, handleAiChat);
router.post('/classify-complaint', authenticate, handleClassifyComplaint);
router.post('/complaints/classify', authenticate, handleClassifyComplaint);
router.get('/complaints/:id/duplicates', authenticate, getComplaintDuplicates);
router.get('/recurring-issues', authenticate, getRecurringIssues);
router.post('/summarize', authenticate, summarizeComplaint);

export default router;

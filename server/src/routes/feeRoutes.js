import express from 'express';
import { getMyFees, submitFeeQuery } from '../controllers/feeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-fees', authenticate, getMyFees);
router.post('/queries', authenticate, submitFeeQuery);

export default router;

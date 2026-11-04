import express from 'express';
import { getWorkQueue } from '../controllers/requestController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getWorkQueue);
router.get('/dashboard', authenticate, getWorkQueue);
router.get('/stats', authenticate, (req, res, next) => {
  return getWorkQueue(req, res, next);
});

export default router;

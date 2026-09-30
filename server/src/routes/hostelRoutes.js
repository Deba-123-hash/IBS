import express from 'express';
import { getMyHostelRoom, getRoomsGrid } from '../controllers/hostelController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-room', authenticate, getMyHostelRoom);
router.get('/rooms-grid', authenticate, getRoomsGrid);

export default router;

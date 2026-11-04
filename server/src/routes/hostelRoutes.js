import express from 'express';
import { getMyHostelRoom, getRoomsGrid } from '../controllers/hostelController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authenticate, getMyHostelRoom);
router.get('/my-room', authenticate, getMyHostelRoom);
router.get('/rooms', authenticate, getRoomsGrid);
router.get('/rooms/grid', authenticate, getRoomsGrid);
router.get('/rooms-grid', authenticate, getRoomsGrid);

export default router;

import express from 'express';
import { getMyProfile, updateMyProfile, updateAvatar } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateMyProfile);
router.post('/me/avatar', authenticate, updateAvatar);

export default router;

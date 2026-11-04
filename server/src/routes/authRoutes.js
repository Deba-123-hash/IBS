import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
  getMe,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, changePassword);

export default router;

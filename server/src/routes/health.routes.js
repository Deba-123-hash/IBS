import express from 'express';
import { getHealth } from '../controllers/healthController.js';
import { isGroqConfigured } from '../services/ai/groqClient.js';

const router = express.Router();

router.get('/', getHealth);

// Safe AI health check endpoint (never leaks secrets or keys)
router.get('/ai', (req, res) => {
  return res.status(200).json({
    success: true,
    groq: isGroqConfigured() ? 'configured' : 'missing'
  });
});

export default router;

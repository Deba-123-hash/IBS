import express from 'express';
import helmet from 'helmet';
import corsMiddleware from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import apiRoutes from './routes/index.js';
import { checkHealth } from './services/healthService.js';
import { isGroqConfigured } from './services/ai/groqClient.js';
import { successResponse } from './utils/response.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS Configuration
app.use(corsMiddleware);

// Request Rate Limiting
app.use('/api/', globalLimiter);

// Request Body Parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
app.use(requestLogger);

// Root and API Level Health Endpoints
app.get(['/health', '/api/health'], async (req, res) => {
  const healthData = await checkHealth();
  if (healthData.database !== 'healthy') {
    return res.status(503).json({
      success: false,
      database: 'disconnected',
      data: healthData,
      message: 'CAMPUS OS API running with database issues'
    });
  }
  return res.status(200).json({
    success: true,
    database: 'connected',
    api: 'healthy',
    data: healthData,
    message: 'CAMPUS OS API is running'
  });
});

// Safe AI Health Endpoint
app.get(['/health/ai', '/api/health/ai'], (req, res) => {
  return res.status(200).json({
    success: true,
    groq: isGroqConfigured() ? 'configured' : 'missing'
  });
});

// API Central Routers (supporting /api/v1 and /api)
app.use(['/api/v1', '/api'], apiRoutes);

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;

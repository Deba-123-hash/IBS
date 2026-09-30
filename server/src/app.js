import express from 'express';
import helmet from 'helmet';
import corsMiddleware from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import apiRoutes from './routes/index.js';
import { checkHealth } from './services/healthService.js';
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

// Root Level Health Endpoint
app.get('/health', async (req, res) => {
  const healthData = await checkHealth();
  return successResponse(res, healthData, 'Campus Life API is running');
});

// API v1 Central Router
app.use('/api/v1', apiRoutes);

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;

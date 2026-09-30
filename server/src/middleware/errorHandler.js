import { ENV } from '../config/env.js';
import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Something went wrong on the server';

  const errorResponse = {
    code,
    message
  };

  // Attach validation details if present
  if (err.details) {
    errorResponse.details = err.details;
  }

  // Never expose stack trace in production
  if (ENV.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorResponse
  });
};

export default errorHandler;

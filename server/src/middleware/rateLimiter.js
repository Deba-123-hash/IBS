import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // max 20 login attempts per 15 minutes
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Too many authentication attempts. Please wait 15 minutes before retrying.'
    }
  }
});

export default globalLimiter;

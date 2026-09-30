import morgan from 'morgan';
import { ENV } from './env.js';

export const logger = {
  info: (...args) => console.log(`[INFO] [${new Date().toISOString()}]`, ...args),
  warn: (...args) => console.warn(`[WARN] [${new Date().toISOString()}]`, ...args),
  error: (...args) => console.error(`[ERROR] [${new Date().toISOString()}]`, ...args),
  debug: (...args) => {
    if (ENV.NODE_ENV === 'development') {
      console.log(`[DEBUG] [${new Date().toISOString()}]`, ...args);
    }
  }
};

export const morganMiddleware = morgan(
  ENV.NODE_ENV === 'production' ? 'combined' : 'dev'
);

export default logger;

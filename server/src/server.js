import app from './app.js';
import { ENV } from './config/env.js';

const PORT = ENV.PORT || 5000;

app.listen(PORT, () => {
  console.log('====================================================');
  console.log('  CAMPUS LIFE, DEBUGGED - BACKEND API SERVER');
  console.log('  Unified Campus Operations OS (Fretbox Hackathon)');
  console.log(`  Environment: ${ENV.NODE_ENV}`);
  console.log(`  Server Listening on: http://localhost:${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log('====================================================');
});

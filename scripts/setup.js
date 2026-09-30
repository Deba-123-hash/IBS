#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('  CAMPUS LIFE, DEBUGGED - ONE-STEP SETUP UTILITY');
console.log('====================================================\n');

// 1. Check for .env in server
const serverEnvPath = path.resolve('server/.env');
if (!fs.existsSync(serverEnvPath)) {
  console.log('[Setup] Creating server/.env from template...');
  fs.copyFileSync(path.resolve('server/.env.example'), serverEnvPath);
}

// 2. Check for .env in client
const clientEnvPath = path.resolve('client/.env');
if (!fs.existsSync(clientEnvPath)) {
  console.log('[Setup] Creating client/.env from template...');
  fs.copyFileSync(path.resolve('client/.env.example'), clientEnvPath);
}

console.log('[Setup] Environment configuration files verified.');
console.log('[Setup] Run "npm run dev" to launch both frontend and backend concurrently.');

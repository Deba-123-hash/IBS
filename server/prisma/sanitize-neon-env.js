import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

const rawUrl = process.env.DATABASE_URL || '';

// Clean direct URL for Prisma migrations & DDL
const directUrl = rawUrl.replace('-pooler.', '.').replace(/[?&]channel_binding=[^&]*/g, '');
const pooledUrl = rawUrl.replace(/[?&]channel_binding=[^&]*/g, '');

console.log('Sanitizing DATABASE_URL and generating DIRECT_URL for Neon...');
console.log('Has -pooler in directUrl:', directUrl.includes('-pooler'));
console.log('Has channel_binding in directUrl:', directUrl.includes('channel_binding'));

// Update server/.env and root .env with clean URLs
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace DATABASE_URL
envContent = envContent.replace(/^DATABASE_URL\s*=.*$/m, `DATABASE_URL="${directUrl}"`);

// Add DIRECT_URL if not present
if (!envContent.includes('DIRECT_URL=')) {
  envContent += `\nDIRECT_URL="${directUrl}"\n`;
} else {
  envContent = envContent.replace(/^DIRECT_URL\s*=.*$/m, `DIRECT_URL="${directUrl}"`);
}

fs.writeFileSync(envPath, envContent);
fs.writeFileSync(rootEnvPath, envContent);

console.log('Updated server/.env and .env safely with clean Neon connection strings.');

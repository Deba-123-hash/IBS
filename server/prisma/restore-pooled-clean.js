import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

let rawUrl = process.env.DATABASE_URL || '';

// If rawUrl lost -pooler, restore -pooler
if (!rawUrl.includes('-pooler')) {
  rawUrl = rawUrl.replace('.c-7.', '-pooler.c-7.');
}

// Strip channel_binding
let cleanUrl = rawUrl.replace(/[?&]channel_binding=[^&]*/g, '');
if (!cleanUrl.includes('sslmode=')) {
  cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'sslmode=require';
}

console.log('Restoring pooled URL without channel_binding...');
console.log('Contains -pooler:', cleanUrl.includes('-pooler'));
console.log('Contains channel_binding:', cleanUrl.includes('channel_binding'));

let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/^DATABASE_URL\s*=.*$/m, `DATABASE_URL="${cleanUrl}"`);
fs.writeFileSync(envPath, envContent);
fs.writeFileSync(rootEnvPath, envContent);

console.log('Saved to server/.env and root .env');

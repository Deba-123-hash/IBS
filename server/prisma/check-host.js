import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

const content = fs.readFileSync(envPath, 'utf8');
const match = content.match(/^DATABASE_URL\s*=\s*(.*)$/m);

if (match) {
  let raw = match[1].trim();
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    raw = raw.slice(1, -1);
  }
  
  try {
    const u = new URL(raw);
    console.log('Protocol:', u.protocol);
    console.log('Host:', u.host);
    console.log('Database Path:', u.pathname);
    console.log('Has Username:', !!u.username);
    console.log('Has Password:', !!u.password);
    console.log('Query Params:', u.search);
  } catch (err) {
    console.log('URL Parse Error:', err.message);
  }
} else {
  console.log('No DATABASE_URL line found');
}

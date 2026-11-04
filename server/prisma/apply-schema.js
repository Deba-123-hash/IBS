import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pg from 'pg';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;
const rawUrl = process.env.DATABASE_URL || '';

if (!rawUrl) {
  console.error('[Apply Schema] ERROR: DATABASE_URL not found in server/.env');
  process.exit(1);
}

const client = new Client({
  connectionString: rawUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log('[Apply Schema] Connecting to Neon PostgreSQL...');
    await client.connect();
    console.log('[Apply Schema] Connected successfully.');

    const sqlPath = path.resolve(__dirname, 'full_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('[Apply Schema] Executing schema DDL against Neon...');
    await client.query(sqlContent);
    console.log('[Apply Schema] Schema DDL executed successfully.');

    // Create _prisma_migrations table and mark initial migration as applied
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) NOT NULL PRIMARY KEY,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 1
      );
    `);

    const checksum = crypto.createHash('sha256').update(sqlContent).digest('hex');
    const migrationName = '20260930000000_init';

    const existing = await client.query('SELECT id FROM "_prisma_migrations" WHERE migration_name = $1', [migrationName]);
    if (existing.rows.length === 0) {
      await client.query(`
        INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, started_at, applied_steps_count)
        VALUES ($1, $2, now(), $3, $4, now(), 1);
      `, [crypto.randomUUID(), checksum, migrationName, 'Initial schema applied']);
      console.log(`[Apply Schema] Marked migration ${migrationName} as applied in _prisma_migrations.`);
    }

    // Verify all created tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`[Apply Schema] Total tables in public schema: ${tableRes.rows.length}`);
    console.log('Tables:', tableRes.rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('[Apply Schema] Error applying schema:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

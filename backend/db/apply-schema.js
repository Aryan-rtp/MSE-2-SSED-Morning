// Applies db/init.sql from inside the backend image, so a deployment does not
// need a copy of the repository. init.sql is idempotent (IF NOT EXISTS).
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const maxAttempts = 30;
const sql = await readFile(new URL('./init.sql', import.meta.url), 'utf8');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', error => console.error('PostgreSQL pool error:', error.message));

for (let attempt = 1; ; attempt++) {
  try {
    await pool.query(sql);
    console.log('Database schema is ready');
    break;
  } catch (error) {
    if (attempt === maxAttempts) {
      console.error(`Could not apply database schema: ${error.message}`);
      process.exit(1);
    }
    console.log(`Waiting to apply schema (${attempt}/${maxAttempts}): ${error.message}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

await pool.end();

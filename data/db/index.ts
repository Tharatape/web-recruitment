import Database from 'better-sqlite3';
import { join } from 'path';
import { readFileSync, mkdirSync, existsSync } from 'fs';

const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/mockup.db'
  : join(process.cwd(), 'data', 'db', 'mockup.db');

const dbDir = process.env.NODE_ENV === 'production' ? '/tmp' : join(process.cwd(), 'data', 'db');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Run schema once at module load
let schemaInitialized = false;
export function initializeDatabase() {
  if (schemaInitialized) return;
  
  const schema = readFileSync(
    join(process.cwd(), 'data', 'db', 'schema.sql'),
    'utf-8'
  );
  db.exec(schema);
  schemaInitialized = true;
}
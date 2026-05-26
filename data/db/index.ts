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

// Check if column exists
function columnExists(table: string, column: string): boolean {
  const result = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return result.some((col) => col.name === column);
}

// Run schema once at module load
let schemaInitialized = false;
export function initializeDatabase() {
  if (schemaInitialized) return;
  
  const schema = readFileSync(
    join(process.cwd(), 'data', 'db', 'schema.sql'),
    'utf-8'
  );
  db.exec(schema);

  // Add missing columns to existing tables
  if (!columnExists('activity_logs', 'action_type')) {
    db.exec('ALTER TABLE activity_logs ADD COLUMN action_type TEXT');
  }
  
  schemaInitialized = true;
}
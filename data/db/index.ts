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
  try {
    const result = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    return result.some((col) => col.name === column);
  } catch {
    return false;
  }
}

// Check if table exists
function tableExists(table: string): boolean {
  try {
    const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table) as { name: string } | undefined;
    return !!result;
  } catch {
    return false;
  }
}

// Run schema once at module load
let schemaInitialized = false;
export function initializeDatabase() {
  if (schemaInitialized) return;
  
  // Check if candidates table exists - if not, run full schema
  if (!tableExists('candidates')) {
    const schema = readFileSync(
      join(process.cwd(), 'data', 'db', 'schema.sql'),
      'utf-8'
    );
    db.exec(schema);
  } else {
    // Add missing columns to existing tables
    if (!columnExists('activity_logs', 'action_type')) {
      db.exec('ALTER TABLE activity_logs ADD COLUMN action_type TEXT');
    }
    
    if (!columnExists('candidates', 'unique_id')) {
      db.exec('ALTER TABLE candidates ADD COLUMN unique_id TEXT');
    }
  }
  
  schemaInitialized = true;
}
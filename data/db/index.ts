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
  
  // Clean up any leftover temp tables from failed migrations
  db.exec('DROP TABLE IF EXISTS candidates_new');
  db.exec('DROP TABLE IF EXISTS activity_logs_new');
  
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

    // Make recruiter_id nullable in candidates if needed
    const candCols = db.prepare('PRAGMA table_info(candidates)').all() as { name: string; notnull: number }[];
    const candRecruiterCol = candCols.find(c => c.name === 'recruiter_id');
    if (candRecruiterCol && candRecruiterCol.notnull === 1) {
      db.exec('CREATE TABLE candidates_new (id TEXT PRIMARY KEY, unique_id TEXT UNIQUE, name TEXT NOT NULL, phone TEXT NOT NULL, nid TEXT NOT NULL, email TEXT NOT NULL, position_id INTEGER NOT NULL, experience REAL NOT NULL, experience_level TEXT NOT NULL, date_applied TEXT NOT NULL, status_id INTEGER NOT NULL, recruiter_id INTEGER, age INTEGER NOT NULL, weight INTEGER NOT NULL, height INTEGER NOT NULL, bmi REAL NOT NULL, expected_salary TEXT NOT NULL, education TEXT NOT NULL, address TEXT NOT NULL, language TEXT NOT NULL, license TEXT NOT NULL, previous_employment TEXT NOT NULL, ai_summary TEXT NOT NULL, FOREIGN KEY (position_id) REFERENCES positions(id), FOREIGN KEY (status_id) REFERENCES statuses(id), FOREIGN KEY (recruiter_id) REFERENCES owners(id))');
      db.exec('INSERT INTO candidates_new SELECT * FROM candidates');
      db.exec('DROP TABLE candidates');
      db.exec('ALTER TABLE candidates_new RENAME TO candidates');
    }

    // Make recruiter_id nullable in activity_logs if needed
    const logCols = db.prepare('PRAGMA table_info(activity_logs)').all() as { name: string; notnull: number }[];
    const logRecruiterCol = logCols.find(c => c.name === 'recruiter_id');
    if (logRecruiterCol && logRecruiterCol.notnull === 1) {
      db.exec('CREATE TABLE activity_logs_new (id INTEGER PRIMARY KEY AUTOINCREMENT, candidate_id TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, recruiter_id INTEGER, status_id INTEGER NOT NULL, note TEXT, action_type TEXT, FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE, FOREIGN KEY (recruiter_id) REFERENCES owners(id), FOREIGN KEY (status_id) REFERENCES statuses(id))');
      db.exec('INSERT INTO activity_logs_new SELECT * FROM activity_logs');
      db.exec('DROP TABLE activity_logs');
      db.exec('ALTER TABLE activity_logs_new RENAME TO activity_logs');
    }
  }
  
  schemaInitialized = true;
}
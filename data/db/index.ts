import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync, readFileSync } from 'fs';

function getDbPath() {
  if (process.env.NODE_ENV === 'production') {
    const customPath = process.env.DATABASE_PATH;
    if (customPath) {
      const dir = customPath.substring(0, customPath.lastIndexOf('/'));
      try {
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      } catch {}
      return customPath;
    }
    try {
      if (!existsSync('/var/data/mockup')) mkdirSync('/var/data/mockup', { recursive: true });
    } catch {}
    return '/var/data/mockup/mockup.db';
  }
  return join(process.cwd(), 'data', 'db', 'mockup.db');
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(getDbPath());
    dbInstance.pragma('foreign_keys = ON');
  }
  return dbInstance;
}

export const db: Database.Database = new Proxy({} as Database.Database, {
  get(target, prop) {
    const instance = getDb();
    const value = (instance as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === 'function') {
      return (...args: unknown[]) => (value as (...args: unknown[]) => unknown).apply(instance, args);
    }
    return value;
  }
});

function columnExists(table: string, column: string): boolean {
  try {
    const result = getDb().prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    return result.some((col) => col.name === column);
  } catch {
    return false;
  }
}

function tableExists(table: string): boolean {
  try {
    const result = getDb().prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table) as { name: string } | undefined;
    return !!result;
  } catch {
    return false;
  }
}

let schemaInitialized = false;

export function initializeDatabase() {
  if (schemaInitialized) return;

  const database = getDb();

  database.exec('DROP TABLE IF EXISTS candidates_new');
  database.exec('DROP TABLE IF EXISTS activity_logs_new');

  if (!tableExists('candidates')) {
    const schema = readFileSync(
      join(process.cwd(), 'data', 'db', 'schema.sql'),
      'utf-8'
    );
    database.exec(schema);
  } else {
    if (!columnExists('activity_logs', 'action_type')) {
      database.exec('ALTER TABLE activity_logs ADD COLUMN action_type TEXT');
    }

    if (!columnExists('candidates', 'unique_id')) {
      database.exec('ALTER TABLE candidates ADD COLUMN unique_id TEXT');
    }

    const candCols = database.prepare('PRAGMA table_info(candidates)').all() as { name: string; notnull: number }[];
    const candRecruiterCol = candCols.find(c => c.name === 'recruiter_id');
    if (candRecruiterCol && candRecruiterCol.notnull === 1 && !columnExists('candidates', 'unique_id')) {
      database.exec('CREATE TABLE candidates_new (id TEXT PRIMARY KEY, unique_id TEXT UNIQUE, name TEXT NOT NULL, phone TEXT NOT NULL, nid TEXT NOT NULL, email TEXT NOT NULL, position_id INTEGER NOT NULL, experience REAL NOT NULL, experience_level TEXT NOT NULL, date_applied TEXT NOT NULL, status_id INTEGER NOT NULL, recruiter_id INTEGER, age INTEGER NOT NULL, weight INTEGER NOT NULL, height INTEGER NOT NULL, bmi REAL NOT NULL, expected_salary TEXT NOT NULL, education TEXT NOT NULL, address TEXT NOT NULL, language TEXT NOT NULL, license TEXT NOT NULL, previous_employment TEXT NOT NULL, ai_summary TEXT NOT NULL, FOREIGN KEY (position_id) REFERENCES positions(id), FOREIGN KEY (status_id) REFERENCES statuses(id), FOREIGN KEY (recruiter_id) REFERENCES owners(id))');
      database.exec('INSERT INTO candidates_new SELECT *, NULL FROM candidates');
      database.exec('DROP TABLE candidates');
      database.exec('ALTER TABLE candidates_new RENAME TO candidates');
    }

    const logCols = database.prepare('PRAGMA table_info(activity_logs)').all() as { name: string; notnull: number }[];
    const logRecruiterCol = logCols.find(c => c.name === 'recruiter_id');
    if (logRecruiterCol && logRecruiterCol.notnull === 1) {
      database.exec('CREATE TABLE activity_logs_new (id INTEGER PRIMARY KEY AUTOINCREMENT, candidate_id TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, recruiter_id INTEGER, status_id INTEGER NOT NULL, note TEXT, action_type TEXT, FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE, FOREIGN KEY (recruiter_id) REFERENCES owners(id), FOREIGN KEY (status_id) REFERENCES statuses(id))');
      database.exec('INSERT INTO activity_logs_new SELECT * FROM activity_logs');
      database.exec('DROP TABLE activity_logs');
      database.exec('ALTER TABLE activity_logs_new RENAME TO activity_logs');
    }
  }

  schemaInitialized = true;
}
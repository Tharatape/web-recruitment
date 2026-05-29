import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { mkdirSync, existsSync, readFileSync } from 'fs';

function getDbPath() {
  if (process.env.NODE_ENV === 'production') {
    const customPath = process.env.DATABASE_PATH;
    if (customPath) return customPath;
    return '/var/data/mockup/mockup.db';
  }
  return join(process.cwd(), 'data', 'db', 'mockup.db');
}

function ensureDirectory(): boolean {
  const dbPath = getDbPath();
  const dbDir = dirname(dbPath);
  try {
    if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    if (!ensureDirectory()) {
      throw new Error('Cannot open database - directory does not exist and cannot be created');
    }
    dbInstance = new Database(getDbPath());
    dbInstance.pragma('foreign_keys = ON');
  }
  return dbInstance;
}

function createBuildTimeDb() {
  return {
    prepare: () => ({
      all: () => [],
      get: () => null,
      run: () => ({ changes: 0, lastInsertRowid: 0 }),
    }),
    exec: () => {},
    pragma: () => {},
  } as unknown as Database.Database;
}

export const db = new Proxy({} as Database.Database, {
  get(target, prop) {
    try {
      const instance = getDb();
      const value = (instance as unknown as Record<string, unknown>)[prop as string];
      if (typeof value === 'function') {
        return (...args: unknown[]) => (value as (...args: unknown[]) => unknown).apply(instance, args);
      }
      return value;
    } catch {
      const buildDb = createBuildTimeDb();
      const value = (buildDb as unknown as Record<string, unknown>)[prop as string];
      if (typeof value === 'function') {
        return (...args: unknown[]) => (value as (...args: unknown[]) => unknown).apply(buildDb, args);
      }
      return value;
    }
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

     if (!columnExists('candidates', 'type')) {
       database.exec('ALTER TABLE candidates ADD COLUMN type TEXT');
     }

     if (!columnExists('candidates', 'department')) {
       database.exec('ALTER TABLE candidates ADD COLUMN department TEXT');
     }

     if (!columnExists('candidates', 'degree')) {
       database.exec('ALTER TABLE candidates ADD COLUMN degree TEXT');
     }

     if (!columnExists('candidates', 'major')) {
       database.exec('ALTER TABLE candidates ADD COLUMN major TEXT');
     }

     if (!columnExists('candidates', 'toeic')) {
       database.exec('ALTER TABLE candidates ADD COLUMN toeic INTEGER');
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
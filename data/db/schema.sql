-- Reference tables for static data
CREATE TABLE IF NOT EXISTS statuses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS owners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  unique_id TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  nid TEXT NOT NULL,
  email TEXT NOT NULL,
  position_id INTEGER NOT NULL,
  experience REAL NOT NULL,
  experience_level TEXT NOT NULL,
  date_applied TEXT NOT NULL,
  status_id INTEGER NOT NULL,
  recruiter_id INTEGER,
  age INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  height INTEGER NOT NULL,
  bmi REAL NOT NULL,
  expected_salary TEXT NOT NULL,
  education TEXT NOT NULL,
  address TEXT NOT NULL,
  language TEXT NOT NULL,
  license TEXT NOT NULL,
  previous_employment TEXT NOT NULL,
  ai_summary TEXT NOT NULL,
  type TEXT NOT NULL,
  department TEXT NOT NULL,
  degree TEXT NOT NULL,
  major TEXT NOT NULL,
  toeic INTEGER NOT NULL,
  FOREIGN KEY (position_id) REFERENCES positions(id),
  FOREIGN KEY (status_id) REFERENCES statuses(id),
  FOREIGN KEY (recruiter_id) REFERENCES owners(id)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  recruiter_id INTEGER,
  status_id INTEGER NOT NULL,
  note TEXT,
  action_type TEXT,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  FOREIGN KEY (recruiter_id) REFERENCES owners(id),
  FOREIGN KEY (status_id) REFERENCES statuses(id)
);

-- Job Descriptions table
CREATE TABLE IF NOT EXISTS jds (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  created_at TEXT NOT NULL,
  disabled INTEGER DEFAULT 0
);

-- JD checklist items (normalized)
CREATE TABLE IF NOT EXISTS jd_checklists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jd_id TEXT NOT NULL,
  category TEXT NOT NULL,
  criterion_order INTEGER NOT NULL,
  criterion_text TEXT,
  FOREIGN KEY (jd_id) REFERENCES jds(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_date_applied ON candidates(date_applied);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status_id);
CREATE INDEX IF NOT EXISTS idx_candidates_recruiter ON candidates(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidates_unique_id ON candidates(unique_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_candidate ON activity_logs(candidate_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
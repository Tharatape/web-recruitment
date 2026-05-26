import { db } from '../db';

export interface DbCandidate {
  id: string;
  unique_id: string;
  name: string;
  phone: string;
  nid: string;
  email: string;
  position: string;
  experience: number;
  experience_level: string;
  date_applied: string;
  status: string;
  recruiter: string;
  age: number;
  weight: number;
  height: number;
  bmi: number;
  expected_salary: string;
  education: string;
  address: string;
  language: string;
  license: string;
  previous_employment: string;
  ai_summary: string;
  logs?: DbLog[];
}

export interface DbLog {
  id: number;
  candidate_id: string;
  date: string;
  time: string;
  recruiter: string;
  status: string;
  note: string | null;
}

export function getCandidatesWithFilters(filters: {
  startDate?: string;
  endDate?: string;
  owner?: string;
  search?: string;
  position?: string[];
  status?: string[];
  limit?: number;
  offset?: number;
  includeLogs?: boolean;
}): DbCandidate[] {
  let query = `
    SELECT c.*, s.name as status, o.name as recruiter, p.name as position
    FROM candidates c
    JOIN statuses s ON c.status_id = s.id
    JOIN owners o ON c.recruiter_id = o.id
    JOIN positions p ON c.position_id = p.id
    WHERE 1=1
  `;

  const params: (string | number | null)[] = [];

  if (filters.startDate) {
    params.push(filters.startDate);
    query += ` AND c.date_applied >= ?`;
  }
  if (filters.endDate) {
    params.push(filters.endDate);
    query += ` AND c.date_applied <= ?`;
  }
  if (filters.owner) {
    params.push(filters.owner);
    query += ` AND o.name = ?`;
  }
  if (filters.status?.length) {
    query += ` AND s.name IN (${filters.status.map(() => '?').join(',')})`;
    params.push(...filters.status);
  }
  if (filters.position?.length) {
    query += ` AND p.name IN (${filters.position.map(() => '?').join(',')})`;
    params.push(...filters.position);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    query += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.nid LIKE ? OR c.unique_id LIKE ?)`;
  }

  query += ' ORDER BY c.date_applied DESC';

  if (filters.limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(filters.limit, filters.offset || 0);
  }

  const candidates = db.prepare(query).all(params) as DbCandidate[];

  if (filters.includeLogs) {
    const candidateIds = candidates.map(c => c.id);
    if (candidateIds.length > 0) {
      const logsQuery = `
        SELECT al.*, s.name as status, o.name as recruiter
        FROM activity_logs al
        JOIN statuses s ON al.status_id = s.id
        JOIN owners o ON al.recruiter_id = o.id
        WHERE al.candidate_id IN (${candidateIds.map(() => '?').join(',')})
        ORDER BY al.candidate_id, al.date DESC, al.time DESC
      `;
      const allLogs = db.prepare(logsQuery).all(candidateIds) as DbLog[];
      
      const logsByCandidate: Record<string, DbLog[]> = {};
      for (const log of allLogs) {
        if (!logsByCandidate[log.candidate_id]) {
          logsByCandidate[log.candidate_id] = [];
        }
        logsByCandidate[log.candidate_id].push(log);
      }
      
      for (const candidate of candidates) {
        candidate.logs = logsByCandidate[candidate.id] || [];
      }
    }
  }

  return candidates;
}

export function getCandidateLogs(candidateId: string): DbLog[] {
  return db.prepare(`
    SELECT al.*, s.name as status, o.name as recruiter
    FROM activity_logs al
    JOIN statuses s ON al.status_id = s.id
    JOIN owners o ON al.recruiter_id = o.id
    WHERE al.candidate_id = ?
    ORDER BY al.date DESC, al.time DESC
  `).all(candidateId) as DbLog[];
}

export function getUniqueRecruiters(): { name: string }[] {
  return db.prepare('SELECT name FROM owners ORDER BY name').all() as { name: string }[];
}

export function getUniquePositions(): { name: string }[] {
  return db.prepare('SELECT DISTINCT name FROM positions ORDER BY name').all() as { name: string }[];
}

export function getCandidateById(id: string): DbCandidate | undefined {
  return db.prepare(`
    SELECT c.*, s.name as status, o.name as recruiter, p.name as position
    FROM candidates c
    JOIN statuses s ON c.status_id = s.id
    JOIN owners o ON c.recruiter_id = o.id
    JOIN positions p ON c.position_id = p.id
    WHERE c.id = ?
  `).get(id) as DbCandidate | undefined;
}

export function getCandidateByUniqueId(uniqueId: string): DbCandidate | undefined {
  return db.prepare(`
    SELECT c.*, s.name as status, o.name as recruiter, p.name as position
    FROM candidates c
    JOIN statuses s ON c.status_id = s.id
    JOIN owners o ON c.recruiter_id = o.id
    JOIN positions p ON c.position_id = p.id
    WHERE c.unique_id = ?
  `).get(uniqueId) as DbCandidate | undefined;
}
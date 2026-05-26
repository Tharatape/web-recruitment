import { db } from '../db';

export interface DbJD {
  id: string;
  name: string;
  position: string;
  created_at: string;
  disabled: number;
  experienceChecklist: string[];
  educationChecklist: string[];
  languageChecklist: string[];
  technicalChecklist: string[];
}

interface ChecklistItem {
  category: string;
  criterion: string;
}

function parseChecklists(checklistsJson: string | null): {
  experienceChecklist: string[];
  educationChecklist: string[];
  languageChecklist: string[];
  technicalChecklist: string[];
} {
  if (!checklistsJson) {
    return { experienceChecklist: [], educationChecklist: [], languageChecklist: [], technicalChecklist: [] };
  }
  try {
    const items = JSON.parse(checklistsJson) as ChecklistItem[];
    return {
      experienceChecklist: items.filter((i) => i.category === 'experience').map((i) => i.criterion),
      educationChecklist: items.filter((i) => i.category === 'education').map((i) => i.criterion),
      languageChecklist: items.filter((i) => i.category === 'language').map((i) => i.criterion),
      technicalChecklist: items.filter((i) => i.category === 'technical').map((i) => i.criterion),
    };
  } catch {
    return { experienceChecklist: [], educationChecklist: [], languageChecklist: [], technicalChecklist: [] };
  }
}

interface DbJDRow {
  id: string;
  name: string;
  position: string;
  created_at: string;
  disabled: number;
  checklists: string | null;
}

export function getAllJDs(): DbJD[] {
   const jds = db.prepare(`
     SELECT j.*, 
       json_group_array(
         CASE WHEN jc.category IS NOT NULL 
         THEN json_object('category', jc.category, 'criterion', jc.criterion_text)
         END
       ) as checklists
     FROM jds j
     LEFT JOIN jd_checklists jc ON j.id = jc.jd_id
     GROUP BY j.id
   `).all() as DbJDRow[];

   return jds.map((jd) => {
     const parsed = parseChecklists(jd.checklists ?? null);
     return {
       id: jd.id,
       name: jd.name,
       position: jd.position,
       created_at: jd.created_at,
       disabled: jd.disabled,
       experienceChecklist: parsed.experienceChecklist,
       educationChecklist: parsed.educationChecklist,
       languageChecklist: parsed.languageChecklist,
       technicalChecklist: parsed.technicalChecklist,
     };
   });
 }

export function getJDById(id: string): DbJD | undefined {
   const jd = db.prepare(`
     SELECT j.*, 
       json_group_array(
         CASE WHEN jc.category IS NOT NULL 
         THEN json_object('category', jc.category, 'criterion', jc.criterion_text)
         END
       ) as checklists
     FROM jds j
     LEFT JOIN jd_checklists jc ON j.id = jc.jd_id
     WHERE j.id = ?
     GROUP BY j.id
   `).get(id) as DbJDRow | undefined;

   if (!jd) return undefined;

  const parsed = parseChecklists(jd.checklists ?? null);
  return {
    id: jd.id,
    name: jd.name,
    position: jd.position,
    created_at: jd.created_at,
    disabled: jd.disabled,
    experienceChecklist: parsed.experienceChecklist,
    educationChecklist: parsed.educationChecklist,
    languageChecklist: parsed.languageChecklist,
    technicalChecklist: parsed.technicalChecklist,
  };
}

export function createJD(position: string, name?: string): { lastInsertRowid: number } {
  const result = db.prepare(`
    INSERT INTO jds (id, name, position, created_at)
    VALUES (?, ?, ?, ?)
  `).run(
    `JD-${String(Date.now()).slice(-4)}`,
    name || `${position} JD`,
    position,
    new Date().toISOString().split('T')[0]
  );
  return { lastInsertRowid: Number(result.lastInsertRowid) };
}

export function deleteJD(id: string): void {
  db.prepare('DELETE FROM jds WHERE id = ?').run(id);
}

export function toggleJDDisabled(id: string, disabled: boolean): void {
  db.prepare('UPDATE jds SET disabled = ? WHERE id = ?').run(disabled ? 1 : 0, id);
}

export function updateJDChecklist(jdId: string, category: string, items: string[]): void {
  db.prepare('DELETE FROM jd_checklists WHERE jd_id = ? AND category = ?').run(jdId, category);
  const insertChecklist = db.prepare(
    'INSERT INTO jd_checklists (jd_id, category, criterion_order, criterion_text) VALUES (?, ?, ?, ?)'
  );
  const tx = db.transaction(() => {
    for (let i = 0; i < items.length; i++) {
      insertChecklist.run(jdId, category, i, items[i]);
    }
  });
  tx();
}
/**
 * Scoring constants — do not use Math.random() in this module.
 * All values represent agreed business rules for the candidate-to-JD matching engine.
 */

// ── Weighted pass-to-points conversion ───────────────────────────────────

const CATEGORY_WEIGHTS: Record<string, { itemCount: number; maxPoints: number }> = {
  experience: { itemCount: 5, maxPoints: 40 },
  education:  { itemCount: 3, maxPoints: 20 },
  language:   { itemCount: 2, maxPoints: 10 },
  technical:  { itemCount: 5, maxPoints: 30 },
};

function calculatePoints(passedCount: number, totalItems: number, maxPoints: number): number {
  return Math.round((passedCount / totalItems) * maxPoints);
}

function getExperienceScore(experience: number): number {
  return Math.min(100, Math.round(experience * 13));
}

function getTechnicalScore(experience: number): number {
  return Math.min(100, Math.round(experience * 12));
}

function getEducationScore(education?: string): number {
  const e = education ?? "";
  if (e.includes("Bachelor") || e.includes("Master")) return 85;
  if (e.includes("Degree")) return 70;
  return 55;
}

function getLanguageScore(language?: string): number {
  if (language === "Fluent") return 95;
  if (language === "Conversational") return 70;
  return 50;
}

// ── Cached full-score builder ────────────────────────────────────────────

const _scoreCache = new Map<string, number>();

export function clearScoreCache(): void {
  _scoreCache.clear();
}

/**
 * Core scoring — returns per-category points based on candidate data and JD checklists.
 * This is the single source of truth for matching scores.
 * Each category: (passedCount / totalItems) * maxPoints, clamped to maxPoints.
 * Total is the sum of all four categories, clamped to 100.
 */
function getCategoryScores(row: {
  id: string;
  experience: number;
  education?: string;
  language?: string;
  position?: string;
}, jdChecklists?: {
  experienceChecklist?: string[];
  educationChecklist?: string[];
  languageChecklist?: string[];
  technicalChecklist?: string[];
}): {
  experiencePoints: number;
  educationPoints: number;
  languagePoints: number;
  technicalPoints: number;
  total: number;
} {
  const w = CATEGORY_WEIGHTS;

  // How many checklist items the candidate "passes" in each category
  // Experience & Technical: derived from years of experience
  // Education & language: derived from candidate profile
  const expScore  = getExperienceScore(row.experience);
  const eduScore  = getEducationScore(row.education);
  const langScore = getLanguageScore(row.language);
  const techScore = getTechnicalScore(row.experience);

  // Map checklist count from JD, or use default itemCount
  const expItems = jdChecklists?.experienceChecklist?.length ?? w.experience.itemCount;
  const eduItems = jdChecklists?.educationChecklist?.length ?? w.education.itemCount;
  const langItems = jdChecklists?.languageChecklist?.length ?? w.language.itemCount;
  const techItems = jdChecklists?.technicalChecklist?.length ?? w.technical.itemCount;

  // Passed count = how many items the candidate meets (score-based proportion)
  const expPass  = Math.max(0, Math.min(expItems,  Math.round((expScore  / 100) * expItems)));
  const eduPass  = Math.max(0, Math.min(eduItems,  Math.round((eduScore  / 100) * eduItems)));
  const langPass = Math.max(0, Math.min(langItems, Math.round((langScore / 100) * langItems)));
  const techPass = Math.max(0, Math.min(techItems, Math.round((techScore / 100) * techItems)));

  // Points = proportional to passed/total, using the JD's actual checklist size
  const experiencePoints = calculatePoints(expPass,  expItems,  w.experience.maxPoints);
  const educationPoints  = calculatePoints(eduPass,  eduItems,  w.education.maxPoints);
  const languagePoints   = calculatePoints(langPass, langItems, w.language.maxPoints);
  const technicalPoints  = calculatePoints(techPass, techItems, w.technical.maxPoints);

  const total = Math.min(100, experiencePoints + educationPoints + languagePoints + technicalPoints);

  return { experiencePoints, educationPoints, languagePoints, technicalPoints, total };
}

function getMatchingScoreForRow(row: {
  id: string;
  experience: number;
  education?: string;
  language?: string;
  position?: string;
}, jdId?: string, jdChecklists?: {
  experienceChecklist?: string[];
  educationChecklist?: string[];
  languageChecklist?: string[];
  technicalChecklist?: string[];
} | { jd?: { position?: string } }): number {
  const cacheKey = jdId ? `${row.id}-${jdId}` : row.id;
  if (_scoreCache.has(cacheKey)) return _scoreCache.get(cacheKey)!;

  // Normalize jdChecklists to the checklist form
  const checklists = jdChecklists && ("experienceChecklist" in jdChecklists || "jd" in jdChecklists)
    ? ("experienceChecklist" in jdChecklists ? jdChecklists : undefined)
    : undefined;

  const scores = getCategoryScores(row, checklists);
  const score = scores.total;

  _scoreCache.set(cacheKey, score);
  return score;
}

export { getMatchingScoreForRow };

export function getTopCandidates<T extends { id: string; experience: number; education?: string; language?: string; position?: string }>(
  count: number,
  candidates: T[],
  jdId?: string,
  jdChecklists?: { jd?: { position?: string } }
): { candidate: T; score: number }[] {
  if (count <= 0 || candidates.length === 0) return [];

  const scored = candidates.map(c => ({
    candidate: c,
    score: getMatchingScoreForRow(c, jdId, jdChecklists)
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, Math.min(count, scored.length));
}

export function buildBarScores(row: {
   id: string;
   experience: number;
   education?: string;
   language?: string;
 }, jdChecklists?: {
   experienceChecklist?: string[];
   educationChecklist?: string[];
   languageChecklist?: string[];
   technicalChecklist?: string[];
 }) {
   const scores = getCategoryScores(row, jdChecklists);
   const w = CATEGORY_WEIGHTS;

   // Build display scores (0-100 scale for each category)
   const expScore  = getExperienceScore(row.experience);
   const eduScore  = getEducationScore(row.education);
   const langScore = getLanguageScore(row.language);
   const techScore = getTechnicalScore(row.experience);

   // Passed counts for checklist display
   const expPass  = Math.max(0, Math.min(jdChecklists?.experienceChecklist?.length  ?? w.experience.itemCount,  Math.round((expScore  / 100) * (jdChecklists?.experienceChecklist?.length  ?? w.experience.itemCount))));
   const eduPass  = Math.max(0, Math.min(jdChecklists?.educationChecklist?.length   ?? w.education.itemCount,   Math.round((eduScore  / 100) * (jdChecklists?.educationChecklist?.length   ?? w.education.itemCount))));
   const langPass = Math.max(0, Math.min(jdChecklists?.languageChecklist?.length    ?? w.language.itemCount,    Math.round((langScore / 100) * (jdChecklists?.languageChecklist?.length    ?? w.language.itemCount))));
   const techPass = Math.max(0, Math.min(jdChecklists?.technicalChecklist?.length   ?? w.technical.itemCount,   Math.round((techScore / 100) * (jdChecklists?.technicalChecklist?.length   ?? w.technical.itemCount))));

   const expItems  = jdChecklists?.experienceChecklist?.length  ?? w.experience.itemCount;
   const eduItems  = jdChecklists?.educationChecklist?.length   ?? w.education.itemCount;
   const langItems = jdChecklists?.languageChecklist?.length    ?? w.language.itemCount;
   const techItems = jdChecklists?.technicalChecklist?.length   ?? w.technical.itemCount;

   return {
     experience: expScore,
     education: eduScore,
     language: langScore,
     technical: techScore,
     experienceChecklist: jdChecklists?.experienceChecklist,
     educationChecklist:  jdChecklists?.educationChecklist,
     languageChecklist:   jdChecklists?.languageChecklist,
     technicalChecklist:  jdChecklists?.technicalChecklist,
     experiencePoints:  scores.experiencePoints,
     educationPoints:   scores.educationPoints,
     languagePoints:    scores.languagePoints,
     technicalPoints:   scores.technicalPoints,
     expPass, expItems,
     eduPass, eduItems,
     langPass, langItems,
     techPass, techItems,
   };
 }

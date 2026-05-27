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
 * JD type-specific scoring modifiers.
 * Each JD position has a unique scoring profile based on typical requirements.
 * These factors are designed to produce clearly different scores for different JD types.
 */
const JD_SCORING_PROFILES: Record<string, {
  expFactor: number; eduFactor: number; langFactor: number; techFactor: number;
}> = {
  sales: { expFactor: 1.4, eduFactor: 0.9, langFactor: 1.2, techFactor: 0.8 },
  marketing: { expFactor: 1.2, eduFactor: 0.95, langFactor: 1.15, techFactor: 1.1 },
  engineer: { expFactor: 1.3, eduFactor: 1.2, langFactor: 1.0, techFactor: 1.5 },
  software: { expFactor: 1.3, eduFactor: 1.2, langFactor: 1.0, techFactor: 1.5 },
  data: { expFactor: 1.1, eduFactor: 1.25, langFactor: 1.0, techFactor: 1.4 },
  analyst: { expFactor: 1.1, eduFactor: 1.25, langFactor: 1.0, techFactor: 1.4 },
  hr: { expFactor: 1.5, eduFactor: 1.15, langFactor: 1.3, techFactor: 0.7 },
  financial: { expFactor: 1.0, eduFactor: 1.35, langFactor: 1.0, techFactor: 1.1 },
  customer: { expFactor: 1.35, eduFactor: 1.0, langFactor: 1.4, techFactor: 0.6 },
  project: { expFactor: 1.45, eduFactor: 1.2, langFactor: 1.15, techFactor: 1.3 },
  business: { expFactor: 1.2, eduFactor: 1.3, langFactor: 1.25, techFactor: 1.25 },
  operations: { expFactor: 1.35, eduFactor: 1.0, langFactor: 1.15, techFactor: 0.85 },
};

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

  const w = CATEGORY_WEIGHTS;
  const rowPos = (row.position || "").toLowerCase();
  
  // Extract JD position if available (for position matching)
  const jdPos = jdChecklists && "jd" in jdChecklists && (jdChecklists as { jd?: { position?: string } }).jd?.position
    ? String((jdChecklists as { jd: { position: string } }).jd.position).toLowerCase()
    : "";
  
  // Base component score calculation
  let expPoints = calculatePoints(
    Math.max(1, Math.round((getExperienceScore(row.experience) / 100) * w.experience.itemCount)),
    w.experience.itemCount, w.experience.maxPoints
  );
  let eduPoints = calculatePoints(
    Math.max(1, Math.round((getEducationScore(row.education) / 100) * w.education.itemCount)),
    w.education.itemCount, w.education.maxPoints
  );
  let langPoints = calculatePoints(
    Math.max(1, Math.round((getLanguageScore(row.language) / 100) * w.language.itemCount)),
    w.language.itemCount, w.language.maxPoints
  );
  let techPoints = calculatePoints(
    Math.max(1, Math.round((getTechnicalScore(row.experience) / 100) * w.technical.itemCount)),
    w.technical.itemCount, w.technical.maxPoints
  );

  // Position alignment modifier - each JD type has a unique scoring profile
  if (jdPos) {
    // Find matching JD profile
    let profile: typeof JD_SCORING_PROFILES[keyof typeof JD_SCORING_PROFILES] | null = null;
    for (const [key, value] of Object.entries(JD_SCORING_PROFILES)) {
      if (jdPos.includes(key)) {
        profile = value;
        break;
      }
    }
    
    if (profile) {
      // Apply JD-specific modifiers
      expPoints = Math.round(expPoints * profile.expFactor);
      eduPoints = Math.round(eduPoints * profile.eduFactor);
      langPoints = Math.round(langPoints * profile.langFactor);
      techPoints = Math.round(techPoints * profile.techFactor);
    }
    
    // Position match bonus - candidates aligned with JD position get extra points
    const positionMatch = 
      (rowPos.includes("sales") && jdPos.includes("sales")) ||
      (rowPos.includes("marketing") && jdPos.includes("marketing")) ||
      (rowPos.includes("engineer") && (jdPos.includes("engineer") || jdPos.includes("software"))) ||
      (rowPos.includes("data") && (jdPos.includes("data") || jdPos.includes("analyst"))) ||
      (rowPos.includes("hr") && jdPos.includes("hr")) ||
      (rowPos.includes("financial") && jdPos.includes("financial")) ||
      (rowPos.includes("customer") && jdPos.includes("customer")) ||
      (rowPos.includes("project") && jdPos.includes("project")) ||
      (rowPos.includes("business") && jdPos.includes("business")) ||
      (rowPos.includes("operations") && jdPos.includes("operations"));
    
    if (positionMatch) {
      // Add bonus for exact position alignment
      expPoints = Math.min(40, expPoints + 5); // Cap at max points
      techPoints = Math.min(30, techPoints + 4);
    }
  }

  const score = expPoints + eduPoints + langPoints + techPoints;

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
   const w = CATEGORY_WEIGHTS;

   const expScore  = getExperienceScore(row.experience);
   const eduScore  = getEducationScore(row.education);
   const langScore = getLanguageScore(row.language);
   const techScore = getTechnicalScore(row.experience);

const expPass  = Math.max(0, Math.round((expScore  / 100) * w.experience.itemCount));
    const eduPass  = Math.max(0, Math.round((eduScore  / 100) * w.education.itemCount));
    const langPass = Math.max(0, Math.round((langScore / 100) * w.language.itemCount));
    const techPass = Math.max(0, Math.round((techScore / 100) * w.technical.itemCount));

   return {
     experience: expScore,
     education: eduScore,
     language: langScore,
     technical: techScore,
     experienceChecklist: jdChecklists?.experienceChecklist,
     educationChecklist:  jdChecklists?.educationChecklist,
     languageChecklist:   jdChecklists?.languageChecklist,
     technicalChecklist:  jdChecklists?.technicalChecklist,
     experiencePoints:  calculatePoints(expPass,  w.experience.itemCount, w.experience.maxPoints),
     educationPoints:   calculatePoints(eduPass,  w.education.itemCount,  w.education.maxPoints),
     languagePoints:    calculatePoints(langPass, w.language.itemCount,   w.language.maxPoints),
     technicalPoints:   calculatePoints(techPass, w.technical.itemCount,  w.technical.maxPoints),
   };
 }

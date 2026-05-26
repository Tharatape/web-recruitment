/**
 * Scoring constants — do not use Math.random() in this module.
 * All values represent agreed business rules for the candidate-to-JD matching engine.
 */

// ── Raw score derivation ──────────────────────────────────────────────────

/** Multiply years of experience by this to get a 0–100 experience score */
export const EXPERIENCE_MULTIPLIER = 13;

/** Multiply years of experience by this to get a 0–100 technical score */
export const TECHNICAL_MULTIPLIER = 12;

/** Score assigned when the education string mentions Bachelor's or Master's */
export const EDUCATION_BACHELOR_OR_MASTER = 85;

/** Score assigned when education mentions a general Degree */
export const EDUCATION_DEGREE = 70;

/** Default education score when none of the above match */
export const EDUCATION_DEFAULT = 55;

/** Score for Fluent language proficiency */
export const LANGUAGE_FLUENT = 95;

/** Score for Conversational language proficiency */
export const LANGUAGE_CONVERSATIONAL = 70;

/** Default language score (Basic / unlisted) */
export const LANGUAGE_DEFAULT = 50;

// ── Weighted pass-to-points conversion ───────────────────────────────────

export interface CategoryWeight {
  /** Number of criteria / check items in this category */
  itemCount: number;
  /** Maximum points this category can contribute to the overall score */
  maxPoints: number;
}

export const CATEGORY_WEIGHTS: Record<string, CategoryWeight> = {
  experience: { itemCount: 5, maxPoints: 40 },
  education:  { itemCount: 3, maxPoints: 20 },
  language:   { itemCount: 2, maxPoints: 10 },
  technical:  { itemCount: 5, maxPoints: 30 },
};

/** Calculate category points from passed-items count using the weight rules. */
export function calculatePoints(passedCount: number, totalItems: number, maxPoints: number): number {
  return Math.round((passedCount / totalItems) * maxPoints);
}

export function getWeightedMatchingScore(
  experiencePoints: number,
  educationPoints: number,
  languagePoints: number,
  technicalPoints: number
): number {
  return experiencePoints + educationPoints + languagePoints + technicalPoints;
}

// Helper: derive the raw 0–100 component score for a candidate row
export function getExperienceScore(experience: number): number {
  return Math.min(100, Math.round(experience * EXPERIENCE_MULTIPLIER));
}

export function getTechnicalScore(experience: number): number {
  return Math.min(100, Math.round(experience * TECHNICAL_MULTIPLIER));
}

export function getEducationScore(education?: string): number {
  const e = education ?? "";
  if (e.includes("Bachelor") || e.includes("Master")) return EDUCATION_BACHELOR_OR_MASTER;
  if (e.includes("Degree")) return EDUCATION_DEGREE;
  return EDUCATION_DEFAULT;
}

export function getLanguageScore(language?: string): number {
  if (language === "Fluent") return LANGUAGE_FLUENT;
  if (language === "Conversational") return LANGUAGE_CONVERSATIONAL;
  return LANGUAGE_DEFAULT;
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

/**
 * Compute and cache the weighted matching score for a candidate row against a specific JD.
 * The result is cached per `row.id` + `jdId` combination for the lifetime of the page session.
 * Scoring varies based on JD position alignment with candidate position.
 */
export function getMatchingScoreForRow(row: {
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

  const score = getWeightedMatchingScore(expPoints, eduPoints, langPoints, techPoints);

  _scoreCache.set(cacheKey, score);
  return score;
}

/** Return all raw sub-scores and derived points needed by CandidateExpandedView barScores. */
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

   const expPass  = Math.max(1, Math.round((expScore  / 100) * w.experience.itemCount));
   const eduPass  = Math.max(1, Math.round((eduScore  / 100) * w.education.itemCount));
   const langPass = Math.max(1, Math.round((langScore / 100) * w.language.itemCount));
   const techPass = Math.max(1, Math.round((techScore / 100) * w.technical.itemCount));

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

export interface ScoredCandidate<T extends { id: string }> {
  candidate: T;
  score: number;
}

export function getTopCandidates<T extends { id: string; experience: number; education?: string; language?: string; position?: string }>(
  count: number,
  candidates: T[],
  jdId?: string,
  jdChecklists?: { jd?: { position?: string } }
): ScoredCandidate<T>[] {
  if (count <= 0 || candidates.length === 0) return [];

  const scored = candidates.map(c => ({
    candidate: c,
    score: getMatchingScoreForRow(c, jdId, jdChecklists)
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, Math.min(count, scored.length));
}

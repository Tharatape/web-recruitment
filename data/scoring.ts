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

/**
 * Compute and cache the weighted matching score for a candidate row.
 * The result is cached per `row.id` for the lifetime of the page session.
 */
export function getMatchingScoreForRow(row: {
  id: string;
  experience: number;
  education?: string;
  language?: string;
}): number {
  if (_scoreCache.has(row.id)) return _scoreCache.get(row.id)!;

  const w = CATEGORY_WEIGHTS;
  const score = getWeightedMatchingScore(
    calculatePoints(
      Math.max(1, Math.round((getExperienceScore(row.experience) / 100) * w.experience.itemCount)),
      w.experience.itemCount, w.experience.maxPoints
    ),
    calculatePoints(
      Math.max(1, Math.round((getEducationScore(row.education) / 100) * w.education.itemCount)),
      w.education.itemCount, w.education.maxPoints
    ),
    calculatePoints(
      Math.max(1, Math.round((getLanguageScore(row.language) / 100) * w.language.itemCount)),
      w.language.itemCount, w.language.maxPoints
    ),
    calculatePoints(
      Math.max(1, Math.round((getTechnicalScore(row.experience) / 100) * w.technical.itemCount)),
      w.technical.itemCount, w.technical.maxPoints
    )
  );

  _scoreCache.set(row.id, score);
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

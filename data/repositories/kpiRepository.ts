import { db } from '../db';
import { getExperienceLabel } from '@/data/types';

interface KpiCandidate {
  id: string;
  unique_id: string;
  date_applied: string;
  position: string;
  experience: number;
  education: string;
  age: number | null;
  bmi: number | null;
  height: number | null;
  weight: number | null;
  recruiter: string | null;
  type: string | null;
  department: string | null;
  degree: string | null;
  major: string | null;
  toeic: number | null;
  status: string | null;
}

export interface CandidateDetail {
   unique_id: string;
   date_applied: string;
   position: string;
   type: string;
   department: string;
   experience: number;
   degree: string;
   major: string;
   toeic: number;
   age: number;
   bmi: number;
   weight: number;
   height: number;
   status: string;
   interview: string;
   offer: string;
   hired: string;
   recruiter: string | null;
 }

export interface KpiAggregations {
  positionDistribution: Array<{ name: string; value: number }>;
  educationDistribution: Array<{ name: string; value: number }>;
  experienceDistribution: Array<{ name: string; value: number }>;
  ageDistribution: Array<{ name: string; value: number }>;
  bmiDistribution: Array<{ name: string; value: number }>;
  heightDistribution: Array<{ name: string; value: number }>;
  totalCandidates: number;
  averageExperience: number;
}

export function getKpiCandidates(filters: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  owner?: string | null;
}): KpiCandidate[] {
  let query = `
    SELECT c.id, c.unique_id, c.date_applied, p.name as position, c.experience, c.education,
           c.age, c.bmi, c.height, c.weight, o.name as recruiter, c.type, c.department,
           c.degree, c.major, c.toeic, s.name as status
    FROM candidates c
    JOIN positions p ON c.position_id = p.id
    LEFT JOIN owners o ON c.recruiter_id = o.id
    JOIN statuses s ON c.status_id = s.id
    WHERE 1=1
  `;

  const params: (string | number | null)[] = [];

  if (filters.dateFrom) {
    params.push(filters.dateFrom);
    query += ` AND c.date_applied >= ?`;
  }
  if (filters.dateTo) {
    params.push(filters.dateTo);
    query += ` AND c.date_applied <= ?`;
  }
  if (filters.owner !== undefined) {
    if (filters.owner === null) {
      query += ` AND c.recruiter_id IS NULL`;
    } else {
      params.push(filters.owner);
      query += ` AND o.name = ?`;
    }
  }
  if (filters.search) {
    params.push(`%${filters.search}%`, `%${filters.search}%`);
    query += ` AND (p.name LIKE ? OR c.unique_id LIKE ?)`;
  }

  const candidates = db.prepare(query).all(params) as KpiCandidate[];
  return candidates;
}

export function getKpiAggregations(filters: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  owner?: string | null;
}): KpiAggregations {
  const candidates = getKpiCandidates(filters);

  // Use the already filtered candidates for aggregations
  const positionDistributionMap: Record<string, number> = {};
  for (const c of candidates) {
    positionDistributionMap[c.position] = (positionDistributionMap[c.position] || 0) + 1;
  }
  const positionDistribution = Object.entries(positionDistributionMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const educationDistributionMap: Record<string, number> = {};
  for (const c of candidates) {
    if (c.education) {
      let label: string;
      if (c.education.includes("Associate")) label = "Associate's Degree";
      else if (c.education.includes("Bachelor")) label = "Bachelor's Degree";
      else if (c.education.includes("Master")) label = "Master's Degree";
      else if (c.education.includes("Doctoral") || c.education.includes("Ph.D") || c.education.includes("Doctorate")) label = "Doctoral Degree / Ph.D.";
      else label = "Other";
      educationDistributionMap[label] = (educationDistributionMap[label] || 0) + 1;
    }
  }
  const educationDistribution = ["Associate's Degree", "Bachelor's Degree", "Master's Degree", "Doctoral Degree / Ph.D.", "Other"]
    .map((name) => ({ name, value: educationDistributionMap[name] || 0 }));

  const totalCandidates = candidates.length;
  const averageExperience = totalCandidates > 0
    ? candidates.reduce((sum, c) => sum + c.experience, 0) / totalCandidates
    : 0;

  const experienceDistributionMap: Record<string, number> = {};
  for (const c of candidates) {
    const label = getExperienceLabel(c.experience);
    experienceDistributionMap[label] = (experienceDistributionMap[label] || 0) + 1;
  }
  const experienceDistribution = Object.entries(experienceDistributionMap)
    .map(([name, value]) => ({ name, value }));

  const ageDistributionMap: Record<string, number> = {};
  for (const c of candidates) {
    if (c.age !== null) {
      let label: string;
      if (c.age < 25) label = "<25";
      else if (c.age <= 29) label = "25-29";
      else if (c.age <= 34) label = "30-34";
      else if (c.age <= 39) label = "35-39";
      else if (c.age <= 44) label = "40-44";
      else label = "45+";
      ageDistributionMap[label] = (ageDistributionMap[label] || 0) + 1;
    }
  }
  const ageDistribution = Object.entries(ageDistributionMap)
    .map(([name, value]) => ({ name, value }));

  const bmiDistributionMap: Record<string, number> = {};
  for (const c of candidates) {
    if (c.bmi !== null) {
      let label: string;
      if (c.bmi <= 23) label = "<=23";
      else label = ">23";
      bmiDistributionMap[label] = (bmiDistributionMap[label] || 0) + 1;
    }
  }
  const bmiDistribution = Object.entries(bmiDistributionMap)
    .map(([name, value]) => ({ name, value }));

  const heightDistributionMap: Record<string, number> = {};
  for (const c of candidates) {
    if (c.height !== null) {
      let label: string;
      if (c.height <= 155) label = "<=155";
      else label = ">155";
      heightDistributionMap[label] = (heightDistributionMap[label] || 0) + 1;
    }
  }
  const heightDistribution = Object.entries(heightDistributionMap)
    .map(([name, value]) => ({ name, value }));

return {
    positionDistribution,
    educationDistribution,
    experienceDistribution,
    ageDistribution,
    bmiDistribution,
    heightDistribution,
    totalCandidates,
    averageExperience,
  };
}

export function exportKpiToExcel(filters: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  owner?: string | null;
}): string {
  const candidates = getKpiCandidates(filters);

  const headers = ["Unique ID", "Date Applied", "Position", "Type", "Department", "Experience", "Degree", "Major", "TOEIC", "Age", "BMI", "Weight", "Height", "Application Status", "Owner"];
  const csvLines = [headers.join(",")];

  for (const c of candidates) {
    csvLines.push([
      c.unique_id,
      c.date_applied,
      c.position,
      c.type ?? "",
      c.department ?? "",
      c.experience,
      c.degree ?? "",
      c.major ?? "",
      c.toeic ?? "",
      c.age ?? "",
      c.bmi?.toFixed(1) ?? "",
      c.weight ?? "",
      c.height ?? "",
      c.status ?? "",
      c.recruiter ?? "",
    ].join(","));
  }

  return csvLines.join("\n");
}

export function getKpiCandidateDetails(filters: {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  owner?: string | null;
}): CandidateDetail[] {
  const candidates = getKpiCandidates(filters);
  return candidates.map(c => ({
    unique_id: c.unique_id,
    date_applied: c.date_applied,
    position: c.position,
    type: c.type ?? "",
    department: c.department ?? "",
    experience: c.experience,
    degree: c.degree ?? "",
    major: c.major ?? "",
    toeic: c.toeic ?? 0,
    age: c.age ?? 0,
    bmi: c.bmi ?? 0,
    weight: c.weight ?? 0,
    height: c.height ?? 0,
    status: c.status ?? "",
    interview: "",
    offer: "",
    hired: "",
    recruiter: c.recruiter,
  }));
}
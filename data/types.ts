export function getExperienceLabel(exp: number): string {
  return exp < 1 ? "<1 year" : exp < 3 ? "1-3 years" : exp < 5 ? "3-5 years" : exp < 10 ? "5-10 years" : "10+ years";
}

export type Status =
  | "Applied"
  | "Not Suitable"
  | "Shortlisted"
  | "1st Interview"
  | "2nd Interview"
  | "Not Selected"
  | "Selected"
  | "Offer Accepted"
  | "Offer Declined"
  | "Hired"
  | "Not Hired";

export const STATUSES: Status[] = [
  "Applied",
  "Not Suitable",
  "Shortlisted",
  "1st Interview",
  "2nd Interview",
  "Not Selected",
  "Selected",
  "Offer Accepted",
  "Offer Declined",
  "Hired",
  "Not Hired",
];

export const OWNERS = ["Sarah Mitchell", "James Carter", "Emily Davis", "Michael Brooks"] as const;

export type Owner = (typeof OWNERS)[number];

export const POSITIONS = [
  "Sales Executive",
  "Marketing Specialist",
  "Software Engineer",
  "Data Analyst",
  "HR Manager",
  "Financial Analyst",
  "Customer Service",
  "Project Manager",
  "Business Analyst",
  "Operations Manager",
];

export interface Candidate {
  id: string;
  uniqueId?: string;
  name: string;
  phone: string;
  nid: string;
  email: string;
  position: string;
  experience: number; // years
  experienceLevel: string;
  dateApplied: string;
  status: Status;
  recruiter: Owner | "";
  age: number;
  weight: number; // kg
  height: number; // cm
  bmi: number;
  expectedSalary: string;
  education: string;
  address: string;
  language: string;
  license: string;
  previousEmployment: string;
  aiSummary: string;
}

export type LogEntry = {
  date: string;
  time: string;
  recruiter: Owner | "";
  status: Status;
  note: string;
  action_type: string;
};

export interface CandidateWithLogs extends Candidate {
  logs: LogEntry[];
}

import type { Candidate, CandidateWithLogs } from "./types";
import type { Status, LogEntry } from "./types";
import { OWNERS, POSITIONS } from "./types";

const FIRST_NAMES = [
  "Emma","Liam","Sophia","Noah","Ava","William","Isabella","James","Mia","Benjamin",
  "Charlotte","Lucas","Amelia","Henry","Harper","Alexander","Evelyn","Sebastian","Abigail","Jack",
  "Emily","Aiden","Elizabeth","Owen","Sofia","Ethan","Madison","Daniel","Scarlett","Matthew",
  "Victoria","Jacob","Zoey","Michael","Riley","Joshua","Chloe","David","Penelope","Samuel",
  "Layla","Ryan","Nora","Nathan","Brooklyn","Caleb","Hannah","Dylan","Grace","Oliver",
  "Aria","Elijah","Ella","Lucas","Scarlett","Grace","Henry","Evelyn","Sebastian","Zoey",
  "Daniel","Penelope","Nathan","Brooklyn","Gavin","Leah","Miles","Stella","Adam","Hazel",
  "Finn","Chloe","Maya","Axel","Alice","Felix","Ivy","Oscar","Rosa","Theo",
  "Bella","Leo","Anna","Eli","Luna","Kai","Eva","Jasper","Lily","Silas",
  "Nora","Ezra"," Clara","Milo","Zara","Ronan","Mila","Dax","Nina","Remy",
  "Tessa","Jude","Zoe","Cole","Demi","Dallas","Freya","Reid","Elise","Asa",
  "Lina","Atlas","Myra","Kieran","Dara","Rome","Vera","Lyric","Noel","Anya",
  "Beau","Mali","Jax","Koa","Soleil","Rhett","Flora","Arlo","Wren","Cyrus",
  "Skye","Jones","Bo","Nova","Elio","Saul","Maeve","Rhys","Iris","Fox",
  "Lara","Thalia","Beck","Nina","Perry","Reese","Zara","Rafe","Mina","Frank",
  "Jess","Dean","Esther","Pace","Indie","Wynn","Opal","Cain","Jo","Faye",
  "Thiago","Alina","Finn","Raya","Micah","Leila","Dorian","Emmie","Callum","Alma",
  "Graham","Ilana","Brock","Perla","Zion","Marina","Moss","Kendra","Jensen","Nia",
  "Portia","Tate","Poppy","West","Lux","Avery","Devin","Charlee","Shepherd","Milani",
  "Wilder","Remy","Easton","Mika","Emmett","Colette","Kaysen","Valeria","Crew","Jaycee",
  "Boston","Nell","Lyric","Palmer","Clementine","Atlas","Zola","Miles","Elowen","Sage",
];

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
  "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
  "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
  "Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts",
  "Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards","Collins","Reyes",
  "Stewart","Morris","Morgan","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Fisher",
  "Reilly","Peters","Love","Bennett","Wood","Barnes","Ross","Henderson","Coleman"," Jenkins",
  "Perry","Powell","Long","Patterson","Hughes","Flores","Washington","Butler","Simmons","Foster",
  "Gonzales","Bryant","Alexander","Russell","Griffin","Diaz","Hayes","Foster","Murray","Ford",
];

const NAMES: string[] = (() => {
  const result: string[] = [];
  for (const f of FIRST_NAMES) {
    for (const l of LAST_NAMES) {
      result.push(`${f} ${l}`);
    }
  }
  return result;
})();

const educations = [
  "Bachelor's Degree, Business Administration",
  "Bachelor's Degree, Computer Science",
  "Bachelor's Degree, Information Technology",
  "Master's Degree, Human Resource Management",
  "Bachelor's Degree, Finance",
  "Bachelor's Degree, Marketing",
  "MBA, Business Administration",
  "Bachelor's Degree, Electrical Engineering",
  "Bachelor's Degree, Communication Arts",
  "Bachelor's Degree, Accounting",
  "Bachelor's Degree, Economics",
  "Bachelor's Degree, Psychology",
];

// ── Reference data pools ─────────────────────────────────────────────────
const addresses = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX",
  "Phoenix, AZ", "San Francisco, CA", "Seattle, WA", "Boston, MA",
  "Austin, TX", "Denver, CO", "Miami, FL", "Portland, OR",
  "Atlanta, GA", "Dallas, TX", "San Diego, CA",
];

const languages = [
  "English (Native), Spanish (Conversational)",
  "English (Native), French (Fluent)",
  "English (Native), Mandarin (Basic)",
  "English (Native), German (Conversational)",
  "English (Native), Japanese (Basic)",
  "English (Fluent), Portuguese (Native)",
  "English (Native), Korean (Basic)",
  "English (Native), Hindi (Conversational)",
  "English (Native)",
  "English (Fluent), Italian (Basic)",
];

const licenses = [
  "Car Driver's License",
  "Motorcycle Driver's License",
  "Car and Motorcycle Driver's License",
  "None",
];

const prevEmployments = [
  "Salesforce — Account Executive (3 years)",
  "Amazon — Operations Associate (2 years)",
  "Google — Business Analyst (4 years)",
  "Meta — Marketing Coordinator (1 year)",
  "JP Morgan Chase — Financial Analyst (5 years)",
  "Microsoft — Software Engineer (3 years)",
  "Deloitte — Management Consultant (2 years)",
  "Starbucks — Store Manager (4 years)",
  "Self-Employed — Freelance Designer (3 years)",
  "AT&T — Customer Success Representative (2 years)",
  "IBM — Project Manager (6 years)",
  "Goldman Sachs — Financial Analyst (3 years)",
  "Accenture — HR Associate (2 years)",
  "Tesla — Sales Lead (4 years)",
];

const summaries = [
  "Strong communication skills with a track record of exceeding sales targets. Recommended for next interview stage.",
  "Solid technical background and relevant project experience. Could benefit from presenting more structured answers during behavioural interviews.",
  "Excellent academic credentials with internship experience at a reputable firm. Recommended to fast-track to technical assessment.",
  "Demonstrates strong analytical thinking and meticulous attention to detail. Move forward to final round.",
  "Well-rounded profile with strong soft skills and genuine enthusiasm for the role. Consider for a fast-track interview.",
  "Average fit for the role. Key areas for growth: cross-team collaboration and public speaking. Keep as back-up candidate.",
  "Limited formal experience but shows high motivation and fast learning ability. Better suited to an entry-level or internship track.",
  "Exceptional track record across roles. Strong recommendation — highly suitable for immediate hire.",
  "Good technical foundation but lacks domain-specific industry knowledge. Suggest reskilling period before shortlisting.",
  "Meets most criteria for the role. Recommend a skills assessment before making a final hiring decision.",
  "Clear leadership experience and stakeholder management background. Well suited to a senior-level position.",
  "Strong academic record with relevant certifications. Demonstrated readiness for a mid-career move.",
];

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split("T")[0];
}

function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

// Returns a date that falls within [startDaysAgo - cluster, startDaysAgo + cluster].
function randomDateAround(startDaysAgo: number, clusterDays: number): string {
  if (clusterDays === 0) return dateDaysAgo(startDaysAgo);
  const offset = Math.floor(Math.random() * 2 * clusterDays) - clusterDays;
  return dateDaysAgo(startDaysAgo + offset);
}

// ── Build activity logs consistent with the candidate's pipeline status ──
function buildLogs(status: Status, recruiter: string): LogEntry[] {
  const logs: LogEntry[] = [];

  // Every candidate has a submitted-application record
  const appDate = randomDate(new Date(2024, 0, 1), new Date(2025, 8, 1));
  logs.push({ date: appDate, time: "09:00", status: "Applied", note: "Candidate submitted application via online portal." });

  const FUNNEL: Status[] = [
    "Applied", "Not Suitable", "Shortlisted", "1st Interview",
    "2nd Interview", "Not Selected", "Selected",
    "Offer Accepted", "Offer Declined", "Hired", "Not Hired",
  ];
  const idx = FUNNEL.indexOf(status);

  const NOTES: Partial<Record<Status, string>> = {
    "Not Suitable":    "Initial screening did not meet minimum requirements. Candidate lacks required experience.",
    "Shortlisted":     "Resume reviewed and shortlisted for first-round interview. Strong relevant background.",
    "1st Interview":   "Completed first-round video interview. Communication skills assessed. Proceed to second round.",
    "2nd Interview":   "Completed second-round interview with department head. Technical and cultural fit evaluated.",
    "Selected":        "Interview panel recommends extending an offer. Candidate ranked above the hiring threshold.",
    "Not Selected":    "After full interview cycle, candidate not selected. Decision communicated with professional feedback.",
    "Offer Accepted":  "Candidate accepted the formal offer letter. Awaiting onboarding paperwork.",
    "Offer Declined":  "Candidate declined the offer after accepting a competing opportunity. Relieved and decision recorded.",
    "Hired":           "Offer officially accepted and onboarding completed. Candidate successfully hired.",
    "Not Hired":       "Offer rescinded. Candidate did not complete background verification within the required timeframe.",
  };

  // Push one log entry for every intermediate stage the candidate passed through
  for (let i = 1; i <= idx; i++) {
    const stage = FUNNEL[i];
    const logDate = randomDate(new Date(new Date(appDate).getTime() + 2 * 86400000), new Date(2025, 10, 1));
    const hour   = Math.round(Math.random() * 9 + 9);
    const minute = String(Math.floor(Math.random() * 60)).padStart(2, "0");
    const note   = NOTES[stage] ?? `Status updated to ${stage}. Reviewed by ${recruiter}.`;
    logs.push({ date: logDate, time: `${hour}:${minute}`, status: stage, note });
  }

  return logs;
}

// ── Realistic funnel distribution (4000 candidates total) ────────────────
//    Active / screening candidates
//    Applied  1428 | Not Suitable   440 | Shortlisted   684
//    ─────────────────────────────────────────────────────  2552
//    Interview-track candidates
//    1st Interview   340 | Not Selected   256 | 2nd Interview   172 | Selected   172
//    ─────────────────────────────────────────────────────────────────────  940
//    Offer phase
//    Offer Accepted   168 | Offer Declined   84
//    ─────────────────────────────────────  252
//    Final decision
//    Hired   84 | Not Hired   80
//    ──────────────────  164
//    Total 2552+940+252+164 = 4000 candidates
const STATUS_WEIGHTS: Status[] = [
  // ─ Early pipeline ───────────────────────────────────────────────
  ...Array(1428).fill("Applied"),
  ...Array(440).fill("Not Suitable"),
  ...Array(684).fill("Shortlisted"),
  // ─ Interview phase ─────────────────────────────────────────────
  ...Array(340).fill("1st Interview"),
  ...Array(256).fill("Not Selected"),
  ...Array(172).fill("2nd Interview"),
  ...Array(172).fill("Selected"),
  // ─ Offer phase ────────────────────────────────────────────────
  ...Array(168).fill("Offer Accepted"),
  ...Array(84).fill("Offer Declined"),
  // ─ Final decision ─────────────────────────────────────────────
  ...Array(84).fill("Hired"),
  ...Array(80).fill("Not Hired"),
].slice(0, 4000);

// ── Build 4000 candidates ────────────────────────────────────────────────
// Distribution: 100-today / 400-last7d / 1500-last30d / 2000-older
const DATE_BUCKETS: { count: number; windowDays: number; cluster: number }[] = [
  { count: 100,  windowDays: 0,   cluster: 0  },   // today
  { count: 400,  windowDays: 7,   cluster: 2  },   // last 7 days
  { count: 1500, windowDays: 30,  cluster: 5  },   // last 30 days
  { count: 2000, windowDays: 365, cluster: 30 },   // older
];

function pickDateApplied(candidateIndex: number): string {
  let remaining = candidateIndex;
  for (const b of DATE_BUCKETS) {
    if (remaining < b.count) return randomDateAround(b.windowDays, b.cluster);
    remaining -= b.count;
  }
  return randomDateAround(365, 30);
}

const shuffledNames = [...NAMES].sort(() => Math.random() - 0.5).slice(0, 4000);

export const candidates: Candidate[] = shuffledNames.map((name, i) => {
  const position  = POSITIONS[i % POSITIONS.length];
  const exp         = Math.round((Math.random() * 12 + 0.5) * 2) / 2;
  const height      = Math.round(155 + Math.random() * 30);          // cm
  const weight      = Math.round(55 + Math.random() * 55);            // kg
  const bmi         = Math.round((weight / ((height / 100) ** 2)) * 10) / 10;
  const status      = STATUS_WEIGHTS[i];
  const recruiter   = OWNERS[i % OWNERS.length];

  return {
    id:                 `APP-${String(i + 1).padStart(4, "0")}`,
    name,
    phone:              `+1 (${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    nid:                `US-${String(Math.floor(Math.random() * 899 + 100)).padStart(3, "0")}-${String(Math.floor(Math.random() * 89 + 10)).padStart(2, "0")}-${String(Math.floor(Math.random() * 8999 + 1000)).padStart(4, "0")}`,
    email:    `${name.split(" ")[0].toLowerCase()}.${name.split(" ").slice(1).join("").toLowerCase()}@gmail.com`,
    position,
    experience:         exp,
    experienceLevel:    exp < 2  ? "Junior"
                     : exp < 5  ? "Mid"
                     : exp < 9  ? "Senior"
                     :             "Lead",
    dateApplied:        pickDateApplied(i),
    status,
    recruiter,
    age:                Math.round(22 + Math.random() * 18),
    height,
    weight,
    bmi,
    expectedSalary:     `$${Math.round((42000 + Math.random() * 108000) / 5000) * 5000}`,
    education:          educations[i % educations.length],
    address:            addresses[i % addresses.length],
    language:           languages[i % languages.length],
    license:            licenses[i % licenses.length],
    previousEmployment: prevEmployments[i % prevEmployments.length],
    aiSummary:          summaries[i % summaries.length],
  };
});

export const candidatesWithLogs: CandidateWithLogs[] = candidates.map((c) => ({
  ...c,
  logs: buildLogs(c.status, c.recruiter),
}));




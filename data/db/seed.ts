import { db } from './index';
import { STATUSES, OWNERS, POSITIONS } from '../types';
import type { Candidate, CandidateWithLogs, LogEntry, Status, Owner, ActionType } from '../types';

// ──────────────────────────────────────────────────────────────────────────────
// Deterministic PRNG (sfc32)
// DO NOT call Math.random() anywhere in this module.
// ──────────────────────────────────────────────────────────────────────────────
function makeRng(seed: number) {
  let a = seed | 0;
  let b = (seed * 16807) | 0;
  let c = (seed * 48271) | 0;
  return () => {
    a = (a * 1664525 + 1013904223) & 0xffffffff;
    b = (b * 2244662503 + 314606269) & 0xffffffff;
    c = (c * 3266489917 + 342684491) & 0xffffffff;
    const t = (a >>> 16) ^ b;
    return (t ^ (c >>> 16)) / 0x100000000;
  };
}

export const REF_DATE_2026_05_20 = "2026-05-20";

function daysBeforeRef(r: () => number, daysBefore: number, scatter = 0): string {
  const offset = scatter === 0 ? 0 : Math.round(r() * scatter * 2 - scatter);
  const d = new Date(REF_DATE_2026_05_20);
  d.setDate(d.getDate() - daysBefore + offset);
  return d.toISOString().split("T")[0];
}

// ─── Reference data pools ────────────────────────────────────────────────────
export const NAMES: string[] = (() => {
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
    "Nora","Ezra","Clara","Milo","Zara","Ronan","Mila","Dax","Nina","Remy",
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

function randInt(r: () => number, n: number): number {
  return Math.floor(r() * n);
}

function randFloat(r: () => number, n: number): number {
  return r() * n;
}

function pickElement<T>(arr: T[], r: () => number): T {
  const idx = Math.floor(r() * arr.length);
  const safeIdx = Math.max(0, Math.min(idx, arr.length - 1));
  return arr[safeIdx];
}

// ── Build activity logs consistent with the candidate's pipeline status ──────
const FUNNEL: Status[] = [
  "Applied", "Not Suitable", "Shortlisted", "1st Interview",
  "2nd Interview", "Not Selected", "Selected",
  "Offer Accepted", "Offer Declined", "Hired", "Not Hired",
];

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

function determineActionType(status: Status): ActionType {
  if (status === "Applied") return "Matching";
  if (status === "Not Suitable" || status === "Shortlisted" || status === "1st Interview" ||
      status === "2nd Interview" || status === "Not Selected" || status === "Selected" ||
      status === "Offer Accepted" || status === "Offer Declined" || status === "Hired" ||
      status === "Not Hired") {
    return "Change Status";
  }
  return "Change Status";
}

function buildLogs(status: Status, r: () => number, recruiter: Owner): LogEntry[] {
  const logs: LogEntry[] = [];

  const appDate = daysBeforeRef(r, 0, 365);
  logs.push({ 
    date: appDate, 
    time: "09:00", 
    recruiter, 
    status: "Applied", 
    note: "Candidate submitted application via online portal.",
    action_type: "Matching"
  });

  const idx = FUNNEL.indexOf(status);

  for (let i = 1; i <= idx; i++) {
    const stage = FUNNEL[i];
    const logDate = daysBeforeRef(r, randInt(r, 5) + 2, 10);
    const hour   = Math.round(r() * 9 + 9);
    const minute = String(randInt(r, 60)).padStart(2, "0");
    const note   = NOTES[stage] ?? `Status updated to ${stage}.`;
    logs.push({ 
      date: logDate, 
      time: `${hour}:${minute}`, 
      recruiter, 
      status: stage, 
      note,
      action_type: determineActionType(stage)
    });
  }

  return logs;
}

const STATUS_WEIGHTS: Status[] = [
  ...Array(1428).fill("Applied"),
  ...Array(440).fill("Not Suitable"),
  ...Array(684).fill("Shortlisted"),
  ...Array(340).fill("1st Interview"),
  ...Array(256).fill("Not Selected"),
  ...Array(172).fill("2nd Interview"),
  ...Array(172).fill("Selected"),
  ...Array(168).fill("Offer Accepted"),
  ...Array(84).fill("Offer Declined"),
  ...Array(84).fill("Hired"),
  ...Array(172).fill("Not Hired"),
];

const DATE_BUCKETS: { count: number; daysBefore: number; scatter: number }[] = [
  { count: 100,  daysBefore: 0,    scatter: 2  },
  { count: 400,  daysBefore: 7,    scatter: 2  },
  { count: 1500, daysBefore: 30,   scatter: 5  },
  { count: 2000, daysBefore: 365,  scatter: 30 },
];

function pickDateApplied(r: () => number, index: number): string {
  let remaining = index;
  for (const b of DATE_BUCKETS) {
    if (remaining < b.count) return daysBeforeRef(r, b.daysBefore, b.scatter);
    remaining -= b.count;
  }
  return daysBeforeRef(r, 400, 30);
}

const rng = makeRng(42);
const logRng = makeRng(137);

const SHUFFLED = (() => {
  const list = [...NAMES];
  const n = list.length;
  const perm: number[] = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm.slice(0, 4000).map((srcIdx) => list[srcIdx]);
})();

export function generateCandidates(): CandidateWithLogs[] {
  const candidates: Candidate[] = SHUFFLED.map((rawName, i) => {
    const name: string = rawName ?? `Unknown-${i + 1}`;
    const rRow = makeRng(i + 1);
    const uniqueId = String(i + 1).padStart(5, "0");

    return {
      id:                 `APP-${String(i + 1).padStart(4, "0")}`,
      uniqueId,
      name,
      phone:              `+1 (${randInt(rRow, 900) + 100}) ${randInt(rRow, 900) + 100}-${randInt(rRow, 9000) + 1000}`,
      nid:                `US-${String(randInt(rRow, 899) + 100).padStart(3, "0")}-${String(randInt(rRow, 89) + 10).padStart(2, "0")}-${String(randInt(rRow, 8999) + 1000).padStart(4, "0")}`,
      email:              `${name.split(" ")[0].toLowerCase()}.${name.split(" ").slice(1).join("").toLowerCase()}@gmail.com`,
      position:           POSITIONS[i % POSITIONS.length],
      experience:         Math.round((randFloat(rRow, 12) + 0.5) * 2) / 2,
      experienceLevel:    (() => {
        const exp = Math.round((randFloat(rRow, 12) + 0.5) * 2) / 2;
        return exp < 2  ? "Junior"
             : exp < 5  ? "Mid"
             : exp < 9  ? "Senior"
             :             "Lead";
      })(),
      dateApplied:        pickDateApplied(rRow, i),
      status:             STATUS_WEIGHTS[i],
      recruiter:          OWNERS[i % OWNERS.length],
      age:                Math.round(22 + randFloat(rRow, 18)),
      height:             Math.round(155 + randFloat(rRow, 30)),
      weight:             Math.round(55 + randFloat(rRow, 55)),
      bmi:                Math.round(((randFloat(rRow, 55) + 55) / (((Math.round(155 + randFloat(rRow, 30))) / 100) ** 2)) * 10) / 10,
      expectedSalary:     `$${Math.round((42000 + randFloat(rRow, 108000)) / 5000) * 5000}`,
      education:          pickElement(educations, rRow),
      address:            pickElement(addresses, rRow),
      language:           pickElement(languages, rRow),
      license:            pickElement(licenses, rRow),
      previousEmployment: pickElement(prevEmployments, rRow),
      aiSummary:          pickElement(summaries, rRow),
    };
  });

  return candidates.map((c) => ({
    ...c,
    logs: buildLogs(c.status, logRng, c.recruiter),
  }));
}

export function seedReferenceData() {
  const insertStatus = db.prepare('INSERT OR IGNORE INTO statuses (name) VALUES (?)');
  const insertOwner = db.prepare('INSERT OR IGNORE INTO owners (name) VALUES (?)');
  const insertPosition = db.prepare('INSERT OR IGNORE INTO positions (name) VALUES (?)');

  for (const status of STATUSES) insertStatus.run(status);
  for (const owner of OWNERS) insertOwner.run(owner);
  for (const position of POSITIONS) insertPosition.run(position);
}

export function seedCandidates(candidates: CandidateWithLogs[]) {
  const insertCandidate = db.prepare(`
    INSERT INTO candidates (
      id, unique_id, name, phone, nid, email, position_id, experience, experience_level,
      date_applied, status_id, recruiter_id, age, weight, height, bmi,
      expected_salary, education, address, language, license,
      previous_employment, ai_summary
    ) VALUES (
      @id, @uniqueId, @name, @phone, @nid, @email, 
      (SELECT id FROM positions WHERE name = @position),
      @experience, @experienceLevel, @dateApplied,
      (SELECT id FROM statuses WHERE name = @status),
      (SELECT id FROM owners WHERE name = @recruiter),
      @age, @weight, @height, @bmi,
      @expectedSalary, @education, @address, @language, @license,
      @previousEmployment, @aiSummary
    )
  `);

  const insertLog = db.prepare(`
    INSERT INTO activity_logs (
      candidate_id, date, time, recruiter_id, status_id, note, action_type
    ) VALUES (
      @candidateId, @date, @time,
      (SELECT id FROM owners WHERE name = @recruiter),
      (SELECT id FROM statuses WHERE name = @status),
      @note, @action_type
    )
  `);

  const tx = db.transaction((candidatesToInsert: CandidateWithLogs[]) => {
    for (const c of candidatesToInsert) {
      // Ensure uniqueId is generated if not present (for backwards compatibility)
      const uniqueIdValue = c.uniqueId || String(Date.now()).slice(-5).padStart(5, '0');
      insertCandidate.run({ ...c, uniqueId: uniqueIdValue });
      for (const log of c.logs) {
        insertLog.run({ ...log, candidateId: c.id });
      }
    }
  });

  tx(candidates);
}

export function seedJDs() {
  const salesExperienceChecklist = [
    "5+ years sales experience",
    "Quota achievement track record",
    "Client relationship management",
    "Negotiation skills",
    "CRM software proficiency",
  ];

  const salesEducationChecklist = [
    "Bachelor's degree in Business or related field",
    "Sales certification preferred",
    "Continuous learning mindset",
  ];

  const salesLanguageChecklist = [
    "Fluent in English",
    "Persuasive communication skills",
  ];

  const salesTechnicalChecklist = [
    "CRM platforms (Salesforce, HubSpot)",
    "Sales analytics tools",
    "Proposal writing",
    "Lead generation techniques",
    "Contract negotiation",
  ];

  const marketingExperienceChecklist = [
    "3+ years marketing experience",
    "Campaign management",
    "Digital marketing expertise",
    "Brand strategy development",
    "Market research skills",
  ];

  const marketingEducationChecklist = [
    "Bachelor's degree in Marketing or Communications",
    "Google Ads certification",
    "Creative portfolio",
  ];

  const marketingLanguageChecklist = [
    "Fluent in English",
    "Copywriting ability",
  ];

  const marketingTechnicalChecklist = [
    "Google Analytics & Ads",
    "Social media platforms",
    "Email marketing tools",
    "Adobe Creative Suite",
    "Marketing automation",
  ];

  const softwareExperienceChecklist = [
    "3+ years software development",
    "Full-stack development experience",
    "Agile/scrum methodology",
    "Code review participation",
    "Technical architecture design",
  ];

  const softwareEducationChecklist = [
    "Bachelor's degree in Computer Science or related",
    "Computer Science fundamentals",
    "Ongoing technical education",
  ];

  const softwareLanguageChecklist = [
    "Fluent in English",
    "Technical documentation skills",
  ];

  const softwareTechnicalChecklist = [
    "JavaScript/TypeScript proficiency",
    "React or Vue frameworks",
    "Node.js backend",
    "Database design (SQL/NoSQL)",
    "Cloud deployment (AWS/GCP)",
  ];

  const dataExperienceChecklist = [
    "2+ years data analysis experience",
    "SQL query writing and optimization",
    "Statistical analysis proficiency",
    "Data visualization skills",
    "Business intelligence reporting",
  ];

  const dataEducationChecklist = [
    "Bachelor's degree in Data Science, Statistics, or related",
    "Quantitative coursework",
    "Research methods background",
  ];

  const dataLanguageChecklist = [
    "Fluent in English",
    "Technical documentation skills",
  ];

  const dataTechnicalChecklist = [
    "SQL proficiency",
    "Python or R programming",
    "Tableau or Power BI",
    "Excel advanced functions",
    "Statistical analysis tools",
  ];

  const defaultExperienceChecklist = [
    "5+ years relevant experience",
    "Leadership roles demonstrated",
    "Project management skills",
    "Cross-functional collaboration",
    "Industry expertise",
  ];

  const defaultEducationChecklist = [
    "Bachelor's degree completed",
    "Relevant coursework",
    "Academic achievements",
  ];

  const defaultLanguageChecklist = [
    "Fluent in English",
    "Multilingual capabilities",
  ];

  const defaultTechnicalChecklist = [
    "Programming proficiency",
    "System architecture knowledge",
    "Cloud platforms experience",
    "Database management",
    "DevOps practices",
  ];

  const jds = [
    { id: "JD-0001", name: "Sales Executive JD", position: "Sales Executive", checklists: { experience: salesExperienceChecklist, education: salesEducationChecklist, language: salesLanguageChecklist, technical: salesTechnicalChecklist } },
    { id: "JD-0002", name: "Marketing Specialist JD", position: "Marketing Specialist", checklists: { experience: marketingExperienceChecklist, education: marketingEducationChecklist, language: marketingLanguageChecklist, technical: marketingTechnicalChecklist } },
    { id: "JD-0003", name: "Software Engineer JD", position: "Software Engineer", checklists: { experience: softwareExperienceChecklist, education: softwareEducationChecklist, language: softwareLanguageChecklist, technical: softwareTechnicalChecklist } },
    { id: "JD-0004", name: "Data Analyst JD", position: "Data Analyst", checklists: { experience: dataExperienceChecklist, education: dataEducationChecklist, language: dataLanguageChecklist, technical: dataTechnicalChecklist } },
    { id: "JD-0005", name: "HR Manager JD", position: "HR Manager", checklists: { experience: defaultExperienceChecklist, education: defaultEducationChecklist, language: defaultLanguageChecklist, technical: defaultTechnicalChecklist } },
    { id: "JD-0006", name: "Financial Analyst JD", position: "Financial Analyst", checklists: { experience: defaultExperienceChecklist, education: defaultEducationChecklist, language: defaultLanguageChecklist, technical: defaultTechnicalChecklist } },
    { id: "JD-0007", name: "Customer Service JD", position: "Customer Service", checklists: { experience: defaultExperienceChecklist, education: defaultEducationChecklist, language: defaultLanguageChecklist, technical: defaultTechnicalChecklist } },
    { id: "JD-0008", name: "Project Manager JD", position: "Project Manager", checklists: { experience: defaultExperienceChecklist, education: defaultEducationChecklist, language: defaultLanguageChecklist, technical: defaultTechnicalChecklist } },
    { id: "JD-0009", name: "Business Analyst JD", position: "Business Analyst", checklists: { experience: defaultExperienceChecklist, education: defaultEducationChecklist, language: defaultLanguageChecklist, technical: defaultTechnicalChecklist } },
    { id: "JD-0010", name: "Operations Manager JD", position: "Operations Manager", checklists: { experience: defaultExperienceChecklist, education: defaultEducationChecklist, language: defaultLanguageChecklist, technical: defaultTechnicalChecklist } },
  ];

  const insertJD = db.prepare(`
    INSERT INTO jds (id, name, position, created_at) VALUES (?, ?, ?, ?)
  `);

  const insertChecklist = db.prepare(`
    INSERT INTO jd_checklists (jd_id, category, criterion_order, criterion_text) VALUES (?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const jd of jds) {
      insertJD.run(jd.id, jd.name, jd.position, REF_DATE_2026_05_20);
      const { experience, education, language, technical } = jd.checklists;
      const all = [
        { category: 'experience', items: experience },
        { category: 'education', items: education },
        { category: 'language', items: language },
        { category: 'technical', items: technical },
      ];
      for (const { category, items } of all) {
        for (let i = 0; i < items.length; i++) {
          insertChecklist.run(jd.id, category, i, items[i]);
        }
      }
    }
  });

  tx();
}
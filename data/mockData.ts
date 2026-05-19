import type { Candidate, CandidateWithLogs } from "./types";
import type { Status, LogEntry } from "./types";
import { STATUSES, OWNERS, POSITIONS } from "./types";

const NAMES = [
  "Anong Jareonsub", "Suppasit Chaisiri", "Nattawut Leelaphan",
  "Kritsada Yimsang", "Pachara Arunsiri", "Tanakorn Wirot",
  "Chutima Srisawat", "Naphat Saengtabtim", "Waritphon Sukanya",
  "Kanokporn Kaewkla", "Piyaporn Boonmee", "Weerapat Klinhom",
  "Pansa Maneechan", "Jiratchaya Phattanasiri", "Chitsanuphong Thanarat",
  "Supawadee Phuangkrajang", "Apichaya Methathomrit", "Apinun Phongsawat",
  "Pang Nithiwat", "Witsarut Khambang", "Nattapong Promsiri",
  "Pratya Janthawong", "Benyapa Tungpanya", "Napat Laor-ngam",
  "Peerapat Kerdsiri", "Thammachat Ingsri", "Kanyawee Jitrung",
  "Rangsiman Naphatsawan", "Maturot Chompoosri", "Thanapon Pheerachai",
  "Phurinat Saetang", "Jaruda Samutthong", "Patcharin Sornsimma",
  "Tanapol Chirathivat", "Saranyu Polpat", "Meena Intarasit",
  "Chanon Moolwan", "Visarut Soontornsri", "Aunyarat Sriwattanachai",
];

const educations = [
  "Bachelor's Degree, Business Administration",
  "Bachelor's Degree, Computer Science",
  "Bachelor's Degree, Human Resources",
  "Bachelor's Degree, Finance",
  "Bachelor's Degree, Marketing",
  "Master's Degree, Business Administration",
  "Bachelor's Degree, Engineering",
  "Bachelor's Degree, Communication Arts",
];

const addresses = [
  "Bangkok, Thailand",
  "Nonthaburi, Thailand",
  "Samut Prakan, Thailand",
  "Pathum Thani, Thailand",
  "Chiang Mai, Thailand",
  "Nakhon Ratchasima, Thailand",
];

const languages = [
  "Thai (Native), English (Fluent)",
  "Thai (Native), English (Conversational)",
  "Thai (Native), English (Fluent), Japanese (Basic)",
  "Thai (Native), English (Advanced)",
  "Thai (Native), English (Conversational), Chinese (Basic)",
];

const licenses = [
  "Car Driver's License",
  "Motorcycle Driver's License",
  "Car & Motorcycle Driver's License",
  "None",
];

const prevEmployments = [
  "ABC Corporation - Sales Associate (2 years)",
  "Global Tech - Software Developer (3 years)",
  "Marketing Pro Co. - Marketing Coordinator (1.5 years)",
  "Finance Hub - Financial Analyst (4 years)",
  "HR Solutions - HR Specialist (2 years)",
  "Freelance Consultant (3 years)",
  "StartUp X - Operations Coordinator (2 years)",
  "Previous: Self-Employed",
];

const summaries = [
  "Strong communication and leadership skills. Candidate shows excellent potential for growth. Recommended for next stage.",
  "Solid technical background with relevant experience. Could improve presentation skills before the interview stage.",
  "Good academic record and internship experience. Needs more real-world exposure to senior-level responsibilities.",
  "Demonstrates strong analytical thinking and attention to detail. Recommended to move forward for deeper evaluation.",
  "Well-rounded experience with soft skills. Showed genuine interest in the role. Consider fast-tracking to interview.",
  "Average qualifications for the role. Areas for improvement: time management and teamwork. Suggested for back-up consideration.",
  "Limited experience but shows strong motivation to learn. Recommended for entry-level position or internship.",
  "Outstanding track record in previous roles. Strong recommend - highly suitable for immediate hire.",
  "Candidate has good technical skills but lacks domain-specific experience. Suggested to reskill before shortlisting.",
  "Meets most of the requirements. Recommend further technical assessment before making final decision.",
];

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split("T")[0];
}

export const candidates: Candidate[] = NAMES.map((name, i) => {
  const position = POSITIONS[i % POSITIONS.length];
  const exp = Math.round((Math.random() * 10 + 0.5) * 2) / 2;
  const height = Math.round(150 + Math.random() * 35);
  const weight = Math.round(45 + Math.random() * 50);
  const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10;

  return {
    id: `APP-${String(i + 1).padStart(4, "0")}`,
    name,
    phone: `06${Math.floor(Math.random() * 8999999 + 1000000)}`,
    nid: `${Math.floor(Math.random() * 89999999 + 10000000)}${Math.floor(Math.random() * 8999 + 1000)}${Math.floor(Math.random() * 9 + 1)}`,
    email: name.toLowerCase().replace(/\s+/g, ".").replace(/[-']/g, "") + "@email.com",
    position,
    experience: exp,
    experienceLevel: exp < 2 ? "Junior" : exp < 5 ? "Mid" : exp < 9 ? "Senior" : "Lead",
    dateApplied: randomDate(new Date(2024, 0, 1), new Date(2025, 11, 1)),
    status: STATUSES[i % STATUSES.length],
    recruiter: OWNERS[i % OWNERS.length],
    age: Math.round(20 + Math.random() * 25),
    height,
    weight,
    bmi,
    expectedSalary: `${Math.round((18000 + Math.random() * 62000) / 1000) * 1000} THB`,
    education: educations[i % educations.length],
    address: addresses[i % addresses.length],
    language: languages[i % languages.length],
    license: licenses[i % licenses.length],
    previousEmployment: prevEmployments[i % prevEmployments.length],
    aiSummary: summaries[i % summaries.length],
  };
});

export const candidatesWithLogs: CandidateWithLogs[] = candidates.map((c, i) => {
  const logs: LogEntry[] = [
    { date: c.dateApplied, time: "09:00", status: "Applied", note: "Candidate submitted application via online portal." },
  ];
  const randomStatuses: Status[] = [...STATUSES].sort(() => Math.random() - 0.5).slice(0, 1 + (i % 3));
  for (const s of randomStatuses) {
    logs.push({
      date: randomDate(new Date(2024, 1, 15), new Date(2025, 11, 1)),
      time: `${Math.round(Math.random() * 9 + 9)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      status: s,
      note: `Reviewed by ${c.recruiter}: ${s}.`,
    });
  }
  return { ...c, logs };
});

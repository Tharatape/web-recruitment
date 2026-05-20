"use client";

import { STATUSES, Status } from "@/data/types";

function getStatusStyle(status: string): string {
  const map: Record<string, string> = {
    "Applied": "bg-blue-50 text-blue-700",
    "Shortlisted": "bg-indigo-50 text-indigo-700",
    "1st Interview": "bg-purple-50 text-purple-700",
    "2nd Interview": "bg-purple-50 text-purple-700",
    "Selected": "bg-green-50 text-green-700",
    "Offer Accepted": "bg-emerald-50 text-emerald-700",
    "Offer Declined": "bg-red-50 text-red-700",
    "Hired": "bg-teal-50 text-teal-700",
    "Not Hired": "bg-gray-50 text-gray-700",
    "Not Selected": "bg-red-50 text-red-700",
    "Not Suitable": "bg-orange-50 text-orange-700",
  };
  return map[status] || "bg-gray-50 text-gray-700";
}

interface LogEntry {
  date: string;
  time: string;
  status: string;
  note: string;
}

interface CandidateExpandedViewProps {
  candidate: {
    id: string;
    name: string;
    position: string;
    age: number;
    weight: number;
    height: number;
    bmi: number;
    phone: string;
    email: string;
    expectedSalary: string;
    education?: string;
    address?: string;
    language?: string;
    license?: string;
    previousEmployment?: string;
    aiSummary: string;
    logs?: LogEntry[];
  };
  matchingScore?: number;
  extraTopRight?: React.ReactNode;
  pros?: string[];
  cons?: string[];
  barScores?: {
    experience: number;
    education: number;
    language: number;
    technical: number;
  };
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function SectionCard({ title, variant, children }: { title: string; variant?: "neutral" | "primary"; children: React.ReactNode }) {
  const v = variant || "neutral";
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
      <div className={`px-4 py-2.5 ${v === "primary" ? "bg-[var(--primary-light)] border-b border-[rgba(37,99,235,0.15)]" : "bg-[#f8fafc] border-b border-[var(--border)]"}`}>
        <span className={`text-xs font-extrabold tracking-wider uppercase ${v === "primary" ? "text-[var(--primary)]" : "text-[var(--text-secondary)]"}`}>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-[var(--foreground)]">{label}</span>
        <span className="text-xs font-bold text-[var(--text-muted)]">{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#e2e8f0] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function safeStr(val?: string): string {
  return val ?? "—";
}

export function CandidateExpandedView({ candidate, matchingScore, extraTopRight, barScores, pros, cons }: CandidateExpandedViewProps) {
  const logs = candidate.logs ?? [];
  const scoreColor = matchingScore != null
    ? (matchingScore >= 80 ? "#22c55e" : matchingScore >= 50 ? "#f59e0b" : "#ef4444")
    : "var(--text-muted)";
  const scoreLabel = matchingScore != null
    ? (matchingScore >= 80 ? "Excellent Match" : matchingScore >= 50 ? "Partial Match" : "Low Match")
    : "";

  return (
    <div className="px-5 py-4 border-t-2 border-[var(--primary)] bg-[#f8fafc]">

      {/* ── Basic Information ── */}
      <SectionCard title="Basic Information">
        <div className="relative pt-8">
          <button
            type="button"
            onClick={() => alert("View Full Screen clicked")}
            className="absolute -top-3 -right-3 px-3 py-2 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-light)] rounded-lg hover:bg-[#bfdbfe] transition-colors cursor-pointer"
          >
            View Full Screen
          </button>
          <div className="space-y-4">
            {/* Badge bar — Position + Experience label */}
            {extraTopRight && (
              <div className="flex items-center justify-end gap-2">
                {extraTopRight}
              </div>
            )}

            {/* Photo + bio + basic info + buttons */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xl shrink-0">
                    {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] font-medium">ID: {candidate.id}</p>
                    <p className="font-bold text-base text-[var(--foreground)]">{candidate.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{candidate.position}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
                  <InfoField label="Age" value={`${candidate.age} yrs`} />
                  <InfoField label="Weight" value={`${candidate.weight} kg`} />
                  <InfoField label="Height" value={`${candidate.height} cm`} />
                  <InfoField label="BMI" value={candidate.bmi.toFixed(1)} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => alert("Download CV clicked")} className="px-3 py-2 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-light)] rounded-lg hover:bg-[#bfdbfe] transition-colors cursor-pointer">View Original CV</button>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-light)] rounded-lg hover:bg-[#bfdbfe] transition-colors inline-block">View Form</a>
                </div>
              </div>

            {/* ── Contact & Background fields — merged beneath basic info grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Contact</p>
                <div className="space-y-2.5 text-sm">
                  <div>
                    <span className="text-[var(--text-secondary)]">Phone</span>
                    <p className="font-semibold mt-0.5">{safeStr(candidate.phone)}</p>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2.5">
                    <span className="text-[var(--text-secondary)]">E-Mail</span>
                    <p className="font-semibold mt-0.5">{safeStr(candidate.email)}</p>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2.5">
                    <span className="text-[var(--text-secondary)]">Expected Salary</span>
                    <p className="font-semibold mt-0.5">{safeStr(candidate.expectedSalary)}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Background</p>
                <div className="space-y-2.5 text-sm">
                  <div>
                    <span className="text-[var(--text-secondary)]">Education</span>
                    <p className="font-semibold mt-0.5">{safeStr(candidate.education)}</p>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2.5">
                    <span className="text-[var(--text-secondary)]">Address (Province)</span>
                    <p className="font-semibold mt-0.5">{safeStr(candidate.address)}</p>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2.5">
                    <span className="text-[var(--text-secondary)]">Language</span>
                    <p className="font-semibold mt-0.5">{safeStr(candidate.language)}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Employment</p>
                <div className="space-y-2.5 text-sm">
                  <div>
                    <span className="text-[var(--text-secondary)]">License No.</span>
                    <p className="font-semibold mt-0.5">{safeStr(candidate.license)}</p>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2.5">
                    <span className="text-[var(--text-secondary)]">Previous Employment</span>
                    <p className="font-semibold mt-0.5">{safeStr(candidate.previousEmployment)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Matching Score & Flat Percent ── */}
      {matchingScore !== undefined && (
        <div className="mt-4">
          <SectionCard title="Matching Score">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex flex-col items-center shrink-0">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Matching Score</p>
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${matchingScore * 2.51327} 252.65`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--foreground)]">{matchingScore}%</span>
                  </div>
                </div>
                <p className="text-xs font-semibold mt-1" style={{ color: scoreColor }}>{scoreLabel}</p>
              </div>

              {barScores && (
                <div className="flex-1 w-full min-w-0">
                  <div className="space-y-3">
                    {([
                      ["Experience", barScores.experience],
                      ["Education", barScores.education],
                      ["Language", barScores.language],
                      ["Technical", barScores.technical],
                    ] as [string, number][])
                      .map(([lbl, sc]) => (
                        <ScoreBar key={lbl} label={lbl} score={sc} />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── AI Analysis ── */}
      <div className="mt-4">
        <SectionCard title={`AI Analysis — ${candidate.name}`} variant="primary">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{candidate.aiSummary}</p>

          {/* Strengths & Growth Opportunities as two colored boxes */}
          {(pros && pros.length > 0) || (cons && cons.length > 0) ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {pros && pros.length > 0 && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold text-sm uppercase tracking-wider">Strengths</span>
                  </div>
                  <ul className="space-y-1.5">
                    {pros.map((p, i) => (
                      <li key={i} className="text-sm text-green-800 flex items-start gap-1.5">
                        <span className="text-green-500 mt-0.5 shrink-0">&#x2713;</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cons && cons.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600 font-bold text-sm uppercase tracking-wider">Growth Opportunities</span>
                  </div>
                  <ul className="space-y-1.5">
                    {cons.map((c, i) => (
                      <li key={i} className="text-sm text-red-800 flex items-start gap-1.5">
                        <span className="text-red-500 mt-0.5 shrink-0">&#x2717;</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

        </SectionCard>
      </div>

      {/* ── Log Action ── */}
      <div className="mt-4">
        <SectionCard title="Log Action" variant="primary">
          <div className="flex flex-col gap-3">
            <select className="px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer" value="" onChange={() => {}}>
              <option value="">Select Status...</option>
              {STATUSES.map((s: Status) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea
              className="px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              placeholder="Add a short note... (e.g. strong technical background, schedule next round)"
              rows={3}
            />
            <button className="self-start px-5 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors cursor-pointer">Save Log Action</button>
          </div>
        </SectionCard>

        <div className="mt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">History Log</h4>
          <div className="bg-white rounded-xl border border-[var(--border)] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] bg-[#f8fafc]">
                  <th className="text-left py-2.5 pr-4 min-w-[40px]">#</th>
                  <th className="text-left py-2.5 pr-4 min-w-[130px]">Date / Time</th>
                  <th className="text-left py-2.5 pr-4 min-w-[150px]">Status</th>
                  <th className="text-left py-2.5 pr-4">Note</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-[var(--text-muted)]">No history yet.</td>
                  </tr>
                ) : (
                  logs.map((l: LogEntry, i: number) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-3 pr-4 text-[var(--text-secondary)] text-xs font-mono align-top">#{String(i + 1).padStart(3, "0")}</td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)] whitespace-nowrap text-xs align-top">{l.date} {l.time}</td>
                      <td className="py-3 pr-4 text-xs align-top">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${getStatusStyle(l.status)}`}>{l.status}</span>
                      </td>
                      <td className="py-3 text-[var(--text-secondary)] text-xs align-top">{l.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

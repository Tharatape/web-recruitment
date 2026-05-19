"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { STATUSES } from "@/data/types";
import { candidatesWithLogs } from "@/data/mockData";

interface MatchResult {
  candidate: (typeof candidatesWithLogs)[number];
  score: number;
  matchReasons: string[];
  gaps: string[];
}

interface JDParsed {
  requiredSkills: string[];
  preferredSkills: string[];
  position: string;
  seniority: string;
}

function parseSimpleJD(text: string): JDParsed {
  const lower = text.toLowerCase();
  const skillPatterns = [
    "javascript", "typescript", "python", "java", "react", "node", "sql", "excel",
    "marketing", "sales", "finance", "hr", "project management", "data analysis",
    "communication", "leadership", "english", "accounting", "budgeting",
  ];
  const required = skillPatterns.filter((s) => lower.includes(s));
  const positionKeywords = ["software", "marketing", "sales", "finance", "hr", "data", "operations", "project", "engineer"];
  const foundPosition = positionKeywords.find(
    (k) => lower.includes(k) || (k === "data" && lower.includes("analyst"))
  );
  return {
    requiredSkills: required.slice(0, 6),
    preferredSkills: required.slice(6, 12),
    position: foundPosition ? foundPosition.charAt(0).toUpperCase() + foundPosition.slice(1) : "General",
    seniority: /senior|lead|manager/i.test(text) ? "Senior" : /junior|intern/i.test(text) ? "Junior" : "Mid",
  };
}

function simpleMatch(candidates: typeof candidatesWithLogs, jd: JDParsed): MatchResult[] {
  const skills = [...jd.requiredSkills, ...jd.preferredSkills];

  const results: MatchResult[] = candidates.map((c) => {
    const candidateText = [c.position, c.education, c.language, c.aiSummary, c.previousEmployment].join(" ").toLowerCase();
    const skillMatches = skills.filter((s) => candidateText.includes(s));
    const positionMatch = candidateText.includes(jd.position.toLowerCase());
    const expBonus = c.experience >= 3 ? 0.08 : c.experience >= 1 ? 0.03 : 0;
    const langBonus = /english.*fluent|fluent.*english/i.test(c.language) ? 0.07 : 0;
    const baseScore = (skillMatches.length / (skills.length || 1)) * 0.7 + (positionMatch ? 0.25 : 0);
    const scoreRaw = baseScore + expBonus + langBonus;
    const score = Math.min(Math.round(scoreRaw * 100), 100);

    return {
      candidate: c,
      score,
      matchReasons: [
        ...skillMatches.map((s) => `Has "${s}" skill${skillMatches.length > 1 ? "s" : ""}`),
        ...(positionMatch
          ? [`${jd.seniority === "Senior" ? c.recruiter : ""} — Matches position — ${c.position}`]
          : []),
        ...(c.experience >= 3 ? [`Strong experience: ${c.experience} YEARS`] : []),
        ...(langBonus > 0 ? ["Fluent English proficiency"] : []),
      ],
      gaps: [...jd.requiredSkills.filter((s) => !candidateText.includes(s)).slice(0, 3)],
    };
  });
  return results.sort((a, b) => b.score - a.score);
}

export default function MatchingPage() {
  const [jdText, setJdText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [matching, setMatching] = useState(false);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [jdTitle, setJdTitle] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "name" | "status">("relevance");
  const [statusFilter, setStatusFilter] = useState("");

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setJdTitle(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setJdText(ev.target?.result as string);
      reader.readAsText(file);
    }
  }

  function handleMatch() {
    if (!jdText.trim()) return;
    setMatching(true);
    setTimeout(() => {
      const jd = parseSimpleJD(jdText);
      const res = simpleMatch(candidatesWithLogs, jd);
      setMatching(false);
      setResults(res);
    }, 1200);
  }

  const sortedResults = useMemo(() => {
    let data = [...results];
    if (sortBy === "name") data.sort((a, b) => a.candidate.name.localeCompare(b.candidate.name));
    else if (sortBy === "status") data.sort((a, b) => a.score - b.score);
    else data.sort((a, b) => b.score - a.score);
    if (statusFilter) data = data.filter((r) => r.candidate.status === statusFilter);
    return data;
  }, [results, sortBy, statusFilter]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Candidate Matching</h1>

        {/* Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-72">
                <Input
                  label="JD Title"
                  placeholder="e.g., Senior Software Engineer"
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                />
              </div>
              <label className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors cursor-pointer text-center">
                <span>Upload PDF / TXT</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <Button
                size="md"
                onClick={handleMatch}
                disabled={!jdText.trim() || matching}
              >
                {matching ? "Matching..." : "Match Candidates"}
              </Button>
            </div>
            {uploadedFile && (
              <p className="text-xs font-medium text-[var(--text-secondary)]">
                Uploaded: <span className="font-semibold">{uploadedFile.name}</span> ({uploadedFile.size} bytes)
              </p>
            )}
            <textarea
              className="w-full h-44 px-3.5 py-3 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-y"
              placeholder="Paste job description here, or upload a file above..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Results */}
        {sortedResults.length > 0 && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  Matched Candidates — {sortedResults.length} results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <Dropdown
                    options={[
                      { label: "All Statuses", value: "" },
                      ...STATUSES.map((s) => ({ label: s, value: s })),
                    ]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="Filter by Status"
                    className="w-52"
                  />
                  <div className="flex gap-2">
                    {(
                      [
                        { label: "Highest Score", value: "relevance" },
                        { label: "Name A–Z", value: "name" },
                        { label: "Lowest Score", value: "status" },
                      ] as const
                    ).map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSortBy(s.value)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer border ${
                          sortBy === s.value
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-white border-[var(--border)] text-[var(--text-secondary)] hover:bg-[#f8fafc]"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {sortedResults.map((r) => {
                const badgeColor =
                  r.score >= 80 ? "bg-green-100 text-green-700" :
                  r.score >= 60 ? "bg-yellow-100 text-yellow-700" :
                  r.score >= 40 ? "bg-orange-100 text-orange-700" :
                  "bg-gray-100 text-gray-600";

                return (
                  <Card key={r.candidate.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="!p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-sm">
                            {r.candidate.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{r.candidate.name}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{r.candidate.position} · {r.candidate.recruiter}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`status-badge`}>{r.candidate.status}</span>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1.5 rounded-full text-lg font-bold ${badgeColor}`}>
                              {r.score}%
                            </span>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Match Score</p>
                          </div>
                        </div>
                      </div>
                      {r.matchReasons.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {r.matchReasons.map((m, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs font-medium bg-[#dcfce7] text-green-700 rounded-full">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-[var(--text-secondary)]">
                        <span><span className="font-semibold">NID:</span> {r.candidate.nid}</span>
                        <span><span className="font-semibold">Applied:</span> {r.candidate.dateApplied}</span>
                        <span><span className="font-semibold">Experience:</span> {r.candidate.experience} yrs</span>
                        <span><span className="font-semibold">Phone:</span> {r.candidate.phone}</span>
                        <span><span className="font-semibold">Email:</span> {r.candidate.email}</span>
                        <span><span className="font-semibold">Education:</span> {r.candidate.education}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {!matching && sortedResults.length === 0 && (
          <Card>
            <CardContent className="text-center py-16">
              <svg className="mx-auto w-16 h-16 text-[var(--text-muted)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">No matches yet</h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Upload a job description and click <span className="font-bold text-[var(--primary)]">Match Candidates</span> to see results.
              </p>
            </CardContent>
          </Card>
        )}
    </main>
  );
}

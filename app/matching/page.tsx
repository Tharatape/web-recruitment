"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { ComboBox } from "@/components/ui/ComboBox";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Table } from "@/components/ui/Table";
import { STATUSES, OWNERS } from "@/data/types";
import { CandidateExpandedView } from "@/components/CandidateExpandedView";
import { STATUS_CLASS_MAP } from "@/data/colors";
import { getMatchingScoreForRow, buildBarScores, clearScoreCache, getTopCandidates } from "@/data/scoring";
import { getExperienceLabel } from "@/data/types";
import type { DbCandidate, DbCandidateEssential } from "@/data/repositories/candidateRepository";
import type { DbJD } from "@/data/repositories/jdRepository";

function ScoringBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-700 bg-green-50 border-green-200"
      : score >= 50
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-red-700 bg-red-50 border-red-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}
    >
      {score}%
    </span>
  );
}

export default function MatchingPage() {
   const [search, setSearch] = useState("");
   const [position, setPosition] = useState<string[]>([]);
   const [expMin, setExpMin] = useState("");
   const [expMax, setExpMax] = useState("");
   const [dateRange, setDateRange] = useState("all");
   const [status, setStatus] = useState<string[]>([]);
   const [recruiter, setRecruiter] = useState("");
   const [pageSize, setPageSize] = useState(25);
   const [page, setPage] = useState(1);
   const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [scoredIds, setScoredIds] = useState<Set<string>>(new Set());
    const [selectedJdId, setSelectedJdId] = useState<string>("");
    const [selectedAiJdId, setSelectedAiJdId] = useState<string>("");
    const [aiOpinionCount, setAiOpinionCount] = useState<number>(2);
    const [paginatedCandidates, setPaginatedCandidates] = useState<DbCandidateEssential[]>([]);
    const [fullCandidates, setFullCandidates] = useState<Map<string, DbCandidate>>(new Map());
    const [allPositions, setAllPositions] = useState<string[]>([]);
  const [jds, setJds] = useState<DbJD[]>([]);
    const [aiOpinionResults, setAiOpinionResults] = useState<Array<{name: string; score: number; reasoning: string}> | null>(null);
    const [sortKey, setSortKey] = useState<string>("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [total, setTotal] = useState(0);
    const [loadingExpanded, setLoadingExpanded] = useState(false);

const fetchPaginatedData = useCallback(async (): Promise<void> => {
     try {
       const startDate = dateRange !== "all" ? new Date(Date.now() - Number(dateRange) * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : undefined;
       
       const qp = new URLSearchParams({
         limit: String(pageSize),
         offset: String((page - 1) * pageSize),
         essential: "true",
       });
       
       if (search) qp.set("search", search);
       if (startDate) qp.set("startDate", startDate);
       position.forEach(p => qp.append("position", p));
       if (expMin) qp.set("expMin", expMin);
       if (expMax) qp.set("expMax", expMax);
       status.forEach(s => qp.append("status", s));
       if (recruiter === "no-owner") qp.set("owner", "no-owner");
       else if (recruiter) qp.set("owner", recruiter);
       
       const countParams = new URLSearchParams({ countOnly: "true" });
       if (search) countParams.set("search", search);
       if (startDate) countParams.set("startDate", startDate);
       position.forEach(p => countParams.append("position", p));
       if (expMin) countParams.set("expMin", expMin);
       if (expMax) countParams.set("expMax", expMax);
       status.forEach(s => countParams.append("status", s));
       if (recruiter === "no-owner") countParams.set("owner", "no-owner");
       else if (recruiter) countParams.set("owner", recruiter);

       const [candRes, countRes, jdRes] = await Promise.all([
         fetch(`/api/candidates?${qp.toString()}`),
         fetch(`/api/candidates?${countParams.toString()}`),
         fetch('/api/jds')
       ]);

       if (!candRes.ok) {
         throw new Error(`Failed to fetch candidates: ${candRes.status}`);
       }
       if (!countRes.ok) {
         throw new Error(`Failed to fetch count: ${countRes.status}`);
       }
       if (!jdRes.ok) {
         throw new Error(`Failed to fetch JDs: ${jdRes.status}`);
       }

       const cands = await candRes.json();
       const countData = await countRes.json();
       const jdData = await jdRes.json();
       
       setPaginatedCandidates(cands);
       setTotal(countData.total || 0);
       setJds(jdData);
       
       const positions = Array.from(new Set(cands.map((c: DbCandidateEssential) => c.position)));
       setAllPositions(positions as string[]);
     } catch (error) {
       console.error("Failed to fetch data:", error);
     }
   }, [page, pageSize, search, position, expMin, expMax, dateRange, status, recruiter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchPaginatedData();
  }, [fetchPaginatedData]);

  useEffect(() => {
    const loadJds = async () => {
      try {
        const jdRes = await fetch('/api/jds');
        if (!jdRes.ok) {
          throw new Error(`Failed to fetch JDs: ${jdRes.status}`);
        }
        const jdData = await jdRes.json();
        setJds(jdData);
      } catch (error) {
        console.error("Failed to load JDs:", error);
      }
    };
    loadJds();
  }, []);

   const selectedJd = jds.find((j) => j.id === selectedJdId) || null;
   const selectedAiJd = jds.find((j) => j.id === selectedAiJdId) || null;

  const toggleId = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const isSelected = (id: string) => selectedIds.has(id);

  const sortedCandidates = (() => {
    const data = [...paginatedCandidates];
    
    if (sortKey) {
      const dir = sortDir === "asc" ? 1 : -1;
      data.sort((a, b) => {
        let valA: number | string;
        let valB: number | string;
        if (sortKey === "matchingScore") {
          valA = scoredIds.has(a.id) ? getMatchingScoreForRow(a, selectedJd?.id, selectedJd ? { jd: selectedJd } : undefined) : -1;
          valB = scoredIds.has(b.id) ? getMatchingScoreForRow(b, selectedJd?.id, selectedJd ? { jd: selectedJd } : undefined) : -1;
        } else if (sortKey === "unique_id") {
          valA = Number(a[sortKey as keyof DbCandidateEssential]) || 0;
          valB = Number(b[sortKey as keyof DbCandidateEssential]) || 0;
        } else {
          valA = (a[sortKey as keyof DbCandidateEssential] as string | number | undefined) ?? "";
          valB = (b[sortKey as keyof DbCandidateEssential] as string | number | undefined) ?? "";
          if (typeof valA === "string") valA = valA.toLowerCase();
          if (typeof valB === "string") valB = valB.toLowerCase();
        }
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }
    return data;
  })();

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleExpandedIdChange = async (id: string | null) => {
    setExpandedId(id);
    if (id && !fullCandidates.has(id)) {
      setLoadingExpanded(true);
      try {
        const res = await fetch(`/api/candidates?fullId=${id}`);
        if (!res.ok) {
          return;
        }
        const fullData = await res.json();
        if (fullData) {
          setFullCandidates(prev => new Map(prev).set(id, fullData));
        }
      } catch (error) {
        console.error("Failed to fetch candidate details:", error);
      } finally {
        setLoadingExpanded(false);
      }
    }
  };

const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Matching</h1>

        <Card className="mb-6">
          <CardContent className="!p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Input label="Search" placeholder="Name, Phone, NID, Email, Unique ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--foreground)]">Position</label>
                <MultiSelect
                  placeholder="All Positions"
                  options={allPositions.map((p) => ({ label: p, value: p }))}
                  value={position}
                  onChange={(vals) => { setPosition(vals); setPage(1); }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--foreground)]">Experience</label>
                <div className="flex gap-2">
                  <Input
                    label="Min"
                    type="number"
                    placeholder="Min"
                    min="0"
                    value={expMin}
                    onChange={(e) => { const val = Number(e.target.value); setExpMin(val < 0 ? "0" : e.target.value); setPage(1); }}
                    onInput={(e) => { const target = e.target as HTMLInputElement; if (Number(target.value) < 0) target.value = "0"; }}
                  />
                  <Input
                    label="Max"
                    type="number"
                    placeholder="Max"
                    min="0"
                    value={expMax}
                    onChange={(e) => { const val = Number(e.target.value); setExpMax(val < 0 ? "0" : e.target.value); setPage(1); }}
                    onInput={(e) => { const target = e.target as HTMLInputElement; if (Number(target.value) < 0) target.value = "0"; }}
                  />
                </div>
              </div>
<div className="flex flex-col gap-1">
                 <label className="text-sm font-semibold text-[var(--foreground)]">Date Applied</label>
                 <Dropdown
                   placeholder=""
                   options={[
                     { label: "All Time", value: "all" },
                     { label: "Last 7 days", value: "7" },
                     { label: "Last 14 days", value: "14" },
                     { label: "Last 30 days", value: "30" },
                     { label: "Last 90 days", value: "90" },
                   ]}
                   value={dateRange}
                   onChange={(v) => { setDateRange(v); setPage(1); }}
                 />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--foreground)]">Status</label>
                <MultiSelect
                  placeholder="All Status"
                  options={STATUSES.map((s) => ({ label: s, value: s }))}
                  value={status}
                  onChange={(vals) => { setStatus(vals); setPage(1); }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--foreground)]">Recruiter</label>
                <Dropdown
                   placeholder="All Recruiters"
                   options={[{ label: "No Owner", value: "no-owner" }, ...OWNERS.map((o) => ({ label: o, value: o }))]}
                   value={recruiter}
                   onChange={(v) => { setRecruiter(v); setPage(1); }}
                 />
              </div>
            </div>
{(search || position.length > 0 || expMin || expMax || dateRange !== "all" || status.length > 0 || recruiter) && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-end">
                <button
                  onClick={() => {
                    setSearch(""); setPosition([]); setExpMin(""); setExpMax(""); setDateRange("all"); setStatus([]); setRecruiter(""); setPage(1);
                  }}
                  className="text-xs font-semibold text-[var(--accent-red)] hover:underline cursor-pointer bg-transparent border-none"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="!p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1 min-w-64">
                <ComboBox
                  label="Job Description (JD)"
                  placeholder="Select JD..."
                  options={jds.filter((j) => !j.disabled).map((j) => ({ label: `${j.name} - ${j.position}`, value: j.id }))}
                  value={selectedJdId}
                  onChange={(v) => { setSelectedJdId(v); setScoredIds(new Set()); clearScoreCache(); }}
                />
              </div>
              <button
                onClick={() => setScoredIds(new Set(selectedIds))}
                disabled={!selectedJdId || selectedIds.size === 0}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Run Matching
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
            <CardContent className="!p-5">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1 min-w-64">
                  <ComboBox
                    label="AI Opinion"
                    placeholder="Select JD..."
                    options={jds.filter((j) => !j.disabled).map((j) => ({ label: `${j.name} - ${j.position}`, value: j.id }))}
                    value={selectedAiJdId}
                    onChange={(v) => setSelectedAiJdId(v)}
                  />
                </div>
                <div className="w-24">
                  <Input
                    label="Number of selections"
                    type="number"
                    min="2"
                    max="10"
                    value={aiOpinionCount}
                    onChange={(e) => setAiOpinionCount(Math.max(2, Math.min(10, Number(e.target.value))))}
                  />
                </div>
                <button
                  onClick={async () => {
                    const selected = Array.from(fullCandidates.values()).filter(c => selectedIds.has(c.id));
                    if (selected.length < aiOpinionCount) {
                      const missingIds = Array.from(selectedIds).filter(id => !fullCandidates.has(id));
                      for (const id of missingIds) {
                        const res = await fetch(`/api/candidates?fullId=${id}`);
                        const fullData = await res.json();
                        if (fullData) {
                          setFullCandidates(prev => new Map(prev).set(id, fullData));
                        }
                      }
                    }
                    const candidatesForOp = Array.from(fullCandidates.values()).filter(c => selectedIds.has(c.id));
                    if (candidatesForOp.length >= aiOpinionCount) {
                      const topCandidates = getTopCandidates(
                        aiOpinionCount,
                        candidatesForOp,
                        selectedAiJdId,
                        selectedAiJd ? { jd: selectedAiJd } : undefined
                      );
                      
const results = topCandidates.map(tc => ({
                        name: tc.candidate.name,
                        score: tc.score,
                        reasoning: `${tc.candidate.name} has the strongest profile with ${tc.candidate.experience} years of experience and a ${tc.candidate.status?.toLowerCase()} status. Their background aligns well with typical role requirements.`
                      }));
                      
                      setAiOpinionResults(results);
                    }
                    }}
                  disabled={!selectedAiJdId || selectedIds.size < aiOpinionCount}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  AI Opinion
                </button>
              </div>
              {aiOpinionResults && (
                <div className="mt-4 p-4 bg-[var(--primary-light)] rounded-lg">
                  <p className="font-semibold text-[var(--foreground)] mb-2">Top {aiOpinionResults.length} Candidates:</p>
                  <ul className="space-y-3">
                    {aiOpinionResults.map((r, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-semibold text-[var(--foreground)]">{i + 1}. {r.name} - {r.score}% match</span>
                        <p className="text-[var(--text-secondary)] mt-1">{r.reasoning}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {sortedCandidates.length} of {total} candidates
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[var(--foreground)]">Per page:</span>
            <select
              className="text-sm border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-white cursor-pointer"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

<Card>
            <Table<DbCandidateEssential>
              columns={[
                {
                  key: "checkbox",
                  header: (
                    <input
                      type="checkbox"
                      checked={sortedCandidates.length > 0 && selectedIds.size === sortedCandidates.length}
                      ref={(el: HTMLInputElement | null) => {
                        if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < sortedCandidates.length;
                      }}
                      onChange={() => {
                        if (selectedIds.size === sortedCandidates.length) setSelectedIds(new Set());
                        else setSelectedIds(new Set(sortedCandidates.map((r) => r.id)));
                      }}
                      className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                    />
                  ),
                  render: (row) => (
                    <input
                      type="checkbox"
                      checked={isSelected(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleId(row.id)}
                      className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                    />
                  ),
                  className: "w-[50px]",
                },
                {
                  key: "id",
                  header: (
                    <span
                      className="cursor-pointer hover:text-[var(--primary)] flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); handleSort("unique_id"); }}
                    >
                      ID {sortKey === "unique_id" && (sortDir === "asc" ? "▲" : "▼")}
                    </span>
                  ),
                  render: (row) => {
                    return <span className="font-mono text-xs text-[var(--text-secondary)]">{row.unique_id}</span>;
                  },
                  className: "w-[80px]",
                },
                {
                  key: "name",
                  header: (
                    <span
                      className="cursor-pointer hover:text-[var(--primary)] flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); handleSort("name"); }}
                    >
                      Name {sortKey === "name" && (sortDir === "asc" ? "▲" : "▼")}
                    </span>
                  ),
                  render: (row) => {
                    return (
                      <span className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs">
                          {row.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-semibold">{row.name}</span>
                      </span>
                    );
                  },
                },
                {
                  key: "matchingScore",
                  header: (
                    <span
                      className="cursor-pointer hover:text-[var(--primary)] flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); handleSort("matchingScore"); }}
                    >
                      Matching Score {sortKey === "matchingScore" && (sortDir === "asc" ? "▲" : "▼")}
                    </span>
                  ),
                  render: (row) => {
                    if (!scoredIds.has(row.id)) {
                      return <span className="text-[var(--text-muted)] text-xs font-medium">—</span>;
                    }
                    const score = getMatchingScoreForRow(row, selectedJd?.id, selectedJd ? { jd: selectedJd } : undefined);
                    return <ScoringBadge score={score} />;
                  },
                },
                { key: "position", header: (
                    <span
                      className="cursor-pointer hover:text-[var(--primary)] flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); handleSort("position"); }}
                    >
                      Position {sortKey === "position" && (sortDir === "asc" ? "▲" : "▼")}
                    </span>
                  ),
                },
                {
                  key: "experience",
                  header: (
                    <span
                      className="cursor-pointer hover:text-[var(--primary)] flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); handleSort("experience"); }}
                    >
                      Experience {sortKey === "experience" && (sortDir === "asc" ? "▲" : "▼")}
                    </span>
                  ),
                  render: (row) => getExperienceLabel(row.experience),
                },
                { key: "dateApplied", header: (
                    <span
                      className="cursor-pointer hover:text-[var(--primary)] flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); handleSort("date_applied"); }}
                    >
                      Date Applied {sortKey === "date_applied" && (sortDir === "asc" ? "▲" : "▼")}
                    </span>
                  ),
                },
                {
                  key: "status",
                  header: (
                    <span
                      className="cursor-pointer hover:text-[var(--primary)] flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); handleSort("status"); }}
                    >
                      Status {sortKey === "status" && (sortDir === "asc" ? "▲" : "▼")}
                    </span>
                  ),
                  render: (row) => {
                    const statusCls = STATUS_CLASS_MAP[row.status] || "";
                    return <span className={`status-badge ${statusCls}`}>{row.status}</span>;
                  },
                },
                { key: "recruiter", header: (
                    <span
                      className="cursor-pointer hover:text-[var(--primary)] flex items-center gap-1"
                      onClick={(e) => { e.stopPropagation(); handleSort("recruiter"); }}
                    >
                      Recruiter {sortKey === "recruiter" && (sortDir === "asc" ? "▲" : "▼")}
                    </span>
                  ),
                },
                {
                  key: "expand",
                  header: "",
                  className: "w-[120px]",
                  render: (row: { id: string }) => (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpandedIdChange(expandedId === row.id ? null : row.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors cursor-pointer"
                        aria-label={expandedId === row.id ? "Collapse" : "Expand"}
                      >
                        <svg
                          className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${
                            expandedId === row.id ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  ),
                },
              ]}
              data={sortedCandidates}
             keyExtractor={(row) => row.id}
             expandedId={expandedId}
 renderExpanded={(row) => {
               const fullData = fullCandidates.get(row.id);
               if (loadingExpanded) {
                 return (
                   <div className="p-6">
                     <p className="text-sm text-[var(--text-secondary)]">Loading candidate details...</p>
                   </div>
                 );
               }
               if (!fullData) return null;
               
return (
                 <CandidateExpandedView
                   candidate={{
                     id: fullData.unique_id,
                     uniqueId: fullData.unique_id,
                     name: fullData.name,
                     position: fullData.position,
                     age: fullData.age,
                     weight: fullData.weight,
                     height: fullData.height,
                     bmi: fullData.bmi,
                     phone: fullData.phone,
                     email: fullData.email,
                     expectedSalary: fullData.expected_salary,
                     education: fullData.education,
                     address: fullData.address,
                     language: fullData.language,
                     license: fullData.license,
                     previousEmployment: fullData.previous_employment,
                     aiSummary: fullData.ai_summary,
                     logs: fullData.logs,
                     type: fullData.type,
                     department: fullData.department,
                     degree: fullData.degree,
                     major: fullData.major,
                     toeic: fullData.toeic,
                   }}
                   matchingScore={scoredIds.has(row.id) ? getMatchingScoreForRow(row, selectedJd?.id, selectedJd ? { jd: selectedJd } : undefined) : undefined}
                   barScores={scoredIds.has(row.id) ? buildBarScores(row, selectedJd ? {
                     experienceChecklist: selectedJd.experienceChecklist,
                     educationChecklist: selectedJd.educationChecklist,
                     languageChecklist: selectedJd.languageChecklist,
                     technicalChecklist: selectedJd.technicalChecklist,
                   } : undefined) : undefined}
                   extraTopRight={
                     <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">
                       Position: {fullData.position} · {fullData.experience >= 5 ? `${fullData.experience} yrs (Extensive)` : `${fullData.experience} yrs (Solid)`}
                     </span>
                   }
                   pros={[
                     `${fullData.experience >= 5 ? "Extensive" : "Solid"} experience in ${fullData.position}`,
                     (fullData.education ?? "").includes("Bachelor") || (fullData.education ?? "").includes("Master") ? "Strong educational background" : "Relevant education",
                     fullData.language === "Fluent" || fullData.language === "Conversational" ? "Good communication skills" : "Basic communication ability",
                   ].filter(Boolean)}
                   cons={[
                     fullData.experience < 3 ? "Limited professional experience" : null,
                     fullData.status === "Not Suitable" ? "Does not fully match role requirements" : null,
                     fullData.bmi > 30 ? "Health flag noted" : null,
                   ].filter(Boolean) as string[]}
                 />
               );
             }}
            onRowClick={(row) => handleExpandedIdChange(expandedId === row.id ? null : row.id)}
         />
        </Card>

        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-[var(--text-secondary)]">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-white hover:bg-[#f8fafc] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-white hover:bg-[#f8fafc] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
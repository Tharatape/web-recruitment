"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Table } from "@/components/ui/Table";
import { STATUSES, OWNERS, CandidateWithLogs } from "@/data/types";
import { JD } from "@/data/mockData";
import { candidatesWithLogs } from "@/data/mockData";
import { CandidateExpandedView } from "@/components/CandidateExpandedView";
import { AdvancedJDSearch } from "@/components/AdvancedJDSearch";

import { getExperienceLabel } from "@/data/types";
import { STATUS_CLASS_MAP } from "@/data/colors";
import { getMatchingScoreForRow, buildBarScores, clearScoreCache } from "@/data/scoring";

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
  const [selectedJd, setSelectedJd] = useState<JD | null>(null);

  const toggleId = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const isSelected = (id: string) => selectedIds.has(id);

  const allPositions = Array.from(new Set(candidatesWithLogs.map((c) => c.position)));

  const filtered = useMemo(() => {
    let data = [...candidatesWithLogs];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.nid.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    if (position.length > 0) data = data.filter((c) => position.includes(c.position));
    if (expMin) data = data.filter((c) => c.experience >= Number(expMin));
    if (expMax) data = data.filter((c) => c.experience <= Number(expMax));
    if (dateRange !== "all") {
      const days = Number(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      data = data.filter((c) => c.dateApplied >= cutoff.toISOString().split("T")[0]);
    }
    if (status.length > 0) data = data.filter((c) => status.includes(c.status));
    if (recruiter) data = data.filter((c) => c.recruiter === recruiter);

    return data;
  }, [search, position, expMin, expMax, dateRange, status, recruiter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Matching</h1>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="!p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Input label="Search" placeholder="Name, Phone, NID, Email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
                  placeholder="All Time"
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
                  options={OWNERS.map((o) => ({ label: o, value: o }))}
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

        {/* Job Description (JD) */}
        <Card className="mb-6">
          <CardContent className="!p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1 min-w-64">
<AdvancedJDSearch
                    jd={selectedJd}
                    onChange={(jd) => {
                      setSelectedJd(jd);
                      setScoredIds(new Set());
                      clearScoreCache();
                    }}
                  />
              </div>
<button
                 onClick={() => setScoredIds(new Set(selectedIds))}
                 disabled={!selectedJd || selectedIds.size === 0}
                 className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
               >
                 Run Matching
               </button>
            </div>
          </CardContent>
        </Card>

        {/* Results Info + Pagination */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {paged.length} of {total} candidates
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

        {/* Table */}
        <Card>
          <Table<CandidateWithLogs>
            columns={[
              {
                key: "checkbox",
                header: (
                  <input
                    type="checkbox"
                    checked={paged.length > 0 && selectedIds.size === paged.length}
                    ref={(el: HTMLInputElement | null) => {
                      if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < paged.length;
                    }}
                    onChange={() => {
                      if (selectedIds.size === paged.length) setSelectedIds(new Set());
                      else setSelectedIds(new Set(paged.map((r) => r.id)));
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
                key: "name",
                header: "Name",
                render: (row) => {
                  const c = candidatesWithLogs.find((x) => x.id === row.id)!;
                  return (
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs">
                        {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold">{row.name}</span>
                    </span>
                  );
                },
              },
{
                  key: "matchingScore",
                  header: "Matching Score",
                  render: (row) => {
                    if (!scoredIds.has(row.id)) {
                      return <span className="text-[var(--text-muted)] text-xs font-medium">—</span>;
                    }
                    const score = getMatchingScoreForRow(row, selectedJd?.id, selectedJd ? { jd: selectedJd } : undefined);
                    return <ScoringBadge score={score} />;
                  },
                },
              { key: "position", header: "Position" },
              {
                key: "experience",
                header: "Experience",
                render: (row) => getExperienceLabel(row.experience),
              },
              { key: "dateApplied", header: "Date Applied" },
              {
                key: "status",
                header: "Status",
                render: (row) => {
                  const statusCls = STATUS_CLASS_MAP[row.status] || "";
                  return <span className={`status-badge ${statusCls}`}>{row.status}</span>;
                },
              },
              { key: "recruiter", header: "Recruiter" },
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
                         setExpandedId(expandedId === row.id ? null : row.id);
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
            data={paged}
            keyExtractor={(row) => row.id}
            expandedId={expandedId}
            renderExpanded={(row) => (
              <CandidateExpandedView
                candidate={{
                  id: row.id,
                  name: row.name,
                  position: row.position,
                  age: row.age,
                  weight: row.weight,
                  height: row.height,
                  bmi: row.bmi,
                  phone: row.phone,
                  email: row.email,
                  expectedSalary: row.expectedSalary,
                  education: row.education,
                  address: row.address,
                  language: row.language,
                  license: row.license,
                  previousEmployment: row.previousEmployment,
                  aiSummary: row.aiSummary,
                  logs: row.logs,
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
                    Position: {row.position} · {getExperienceLabel(row.experience)}
                  </span>
                }
                pros={[
                  `${row.experience >= 5 ? "Extensive" : "Solid"} experience in ${row.position}`,
                  (row.education ?? "").includes("Bachelor") || (row.education ?? "").includes("Master") ? "Strong educational background" : "Relevant education",
                  row.language === "Fluent" || row.language === "Conversational" ? "Good communication skills" : "Basic communication ability",
                ].filter(Boolean)}
                cons={[
                  row.experience < 3 ? "Limited professional experience" : null,
                  row.status === "Not Suitable" ? "Does not fully match role requirements" : null,
                  row.bmi > 30 ? "Health flag noted" : null,
                ].filter(Boolean) as string[]}
              />
            )}
            onRowClick={(row) => setExpandedId(expandedId === row.id ? null : row.id)}
          />
        </Card>

        {/* Pagination */}
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

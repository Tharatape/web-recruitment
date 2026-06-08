"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { Table } from "@/components/ui/Table";
import { STATUSES, OWNERS } from "@/data/types";
import { CandidateExpandedView } from "@/components/CandidateExpandedView";
import { STATUS_CLASS_MAP } from "@/data/colors";
import { getExperienceLabel } from "@/data/types";
import type { DbCandidate, DbCandidateEssential } from "@/data/repositories/candidateRepository";

export default function ApplicationsPage() {
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
  const [paginatedCandidates, setPaginatedCandidates] = useState<DbCandidateEssential[]>([]);
  const [fullCandidates, setFullCandidates] = useState<Map<string, DbCandidate>>(new Map());
  const [allPositions, setAllPositions] = useState<string[]>([]);
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

       const [candRes, countRes] = await Promise.all([
         fetch(`/api/candidates?${qp.toString()}`),
         fetch(`/api/candidates?${countParams.toString()}`)
       ]);

       if (!candRes.ok) {
         throw new Error(`Failed to fetch candidates: ${candRes.status}`);
       }
       if (!countRes.ok) {
         throw new Error(`Failed to fetch count: ${countRes.status}`);
       }

       const cands = await candRes.json();
       const countData = await countRes.json();
       
       setPaginatedCandidates(cands);
       setTotal(countData.total || 0);
       
       const positions = Array.from(new Set(cands.map((c: DbCandidateEssential) => c.position)));
       setAllPositions(positions as string[]);
     } catch (error) {
       console.error("Failed to fetch data:", error);
     }
   }, [page, pageSize, search, position, expMin, expMax, dateRange, status, recruiter]);

  useEffect(() => {
     
    void fetchPaginatedData();
  }, [fetchPaginatedData]);

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
      <main className="w-full px-4 py-6 sm:px-5 sm:py-7 lg:px-6 lg:py-8 lg:ml-60">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Application List</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm font-semibold text-[var(--foreground)]">Sarah Mitchell</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs sm:text-sm cursor-pointer hover:ring-2 hover:ring-[var(--primary)] transition-all" title="Profile">SM</div>
          </div>
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardContent className="!p-4 sm:!p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
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
                  onChange={setDateRange}
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
                   options={[{ label: "No Owner", value: "no-owner" }, ...OWNERS.map((r) => ({ label: r, value: r }))]}
                   value={recruiter}
                   onChange={setRecruiter}
                 />
              </div>
            </div>
            {(search || position.length > 0 || status.length > 0 || recruiter || dateRange !== "all") && (
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-5 mt-4 sm:mt-5 gap-2 sm:gap-0">
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Showing {paginatedCandidates.length} of {total} candidates
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">Per page:</span>
            <select
              className="text-xs sm:text-sm border border-[var(--border)] rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 bg-white cursor-pointer"
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
                key: "id",
                header: "ID",
                render: (row) => {
                  return <span className="font-mono text-xs text-[var(--text-secondary)]">{row.unique_id}</span>;
                },
                className: "w-[80px]",
              },
              {
                key: "name",
                header: "Name",
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
              { key: "position", header: "Position" },
              {
                key: "experience",
                header: "Experience",
                render: (row) => getExperienceLabel(row.experience),
              },
              { key: "date_applied", header: "Date Applied" },
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
            data={paginatedCandidates}
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
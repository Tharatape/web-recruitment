"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import type { CandidateDetail } from "@/data/repositories/kpiRepository";

const STATUS_TO_STAGE: Record<string, number> = {
  "Applied": 0,
  "Shortlisted": 0,
  "1st Interview": 1,
  "2nd Interview": 1,
  "Selected": 1,
  "Not Selected": 1,
  "Offer Accepted": 2,
  "Offer Declined": 2,
  "Not Suitable": 0,
  "Hired": 3,
  "Not Hired": 3,
};

const ERROR_STATUSES = ["Not Selected", "Offer Declined", "Not Hired", "Not Suitable"];

function StageIcon({ stageIndex, currentStage, isError, status }: { stageIndex: number; currentStage: number; isError: boolean; status: string }) {
  const hasCheckmark = isError ? stageIndex < currentStage : stageIndex <= currentStage;
  const hasErrorX = isError && stageIndex === currentStage;
  const isYellowStage = (stageIndex === 0 && status === "Applied") || (stageIndex === 1 && (status === "1st Interview" || status === "2nd Interview"));

  const bgColor = hasErrorX ? "#ef4444" : isYellowStage ? "#eab308" : hasCheckmark ? "#22c55e" : "transparent";

  return (
    <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: bgColor }}>
      {hasErrorX && (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {isYellowStage && (
        <div className="flex space-x-0.5">
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      )}
      {hasCheckmark && !isYellowStage && !hasErrorX && (
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}

interface LazyTableProps {
  filters: {
    dateFrom: string;
    dateTo: string;
    owner: string;
    search?: string;
  };
}

export function LazyTable({ filters }: LazyTableProps) {
  const [allCandidates, setAllCandidates] = useState<CandidateDetail[]>([]);
  const [page, setPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qp = new URLSearchParams({ type: "candidates" });
      if (filters.dateFrom) qp.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) qp.set("dateTo", filters.dateTo);
      if (filters.owner === "no-owner") qp.set("owner", "no-owner");
      else if (filters.owner) qp.set("owner", filters.owner);
      if (filters.search) qp.set("search", filters.search);

      const res = await fetch(`/api/kpi/data?${qp.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch candidates: ${res.status}`);
      }
      const data = await res.json();
      setAllCandidates(data.candidates);
      setPage(1);
    } catch (err) {
      setError(String(err));
      console.error("Failed to fetch candidates:", err);
    } finally {
      setLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo, filters.owner, filters.search]);

  useEffect(() => {
    void fetchCandidates();
  }, [fetchCandidates]);

  const candidates = allCandidates;
  const totalPages = Math.max(1, Math.ceil(candidates.length / currentPageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedCandidates = candidates.slice((page - 1) * currentPageSize, page * currentPageSize);

  if (loading) {
    return (
      <p className="text-center py-8 text-[var(--text-secondary)]">Loading...</p>
    );
  }

  if (error) {
    return (
      <p className="text-center py-8 text-[var(--accent-red)]">Error loading candidates: {error}</p>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Showing {paginatedCandidates.length} of {candidates.length} candidates
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--foreground)]">Per page:</span>
          <select
            className="text-sm border border-[var(--border)] rounded-lg px-2.5 py-1.5 bg-white cursor-pointer"
            value={currentPageSize}
            onChange={(e) => { setCurrentPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[25, 50, 100].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <Card>
        <Table
          columns={[
            { key: "unique_id", header: "Unique ID", render: (row) => <span className="font-mono text-xs text-[var(--text-secondary)]">{row.unique_id}</span>, className: "w-[100px]" },
            { key: "date_applied", header: "Date Applied" },
            { key: "position", header: "Position" },
            { key: "department", header: "Department" },
            { key: "experience", header: "Experience" },
            { key: "degree", header: "Degree" },
            { key: "major", header: "Major" },
            { key: "toeic", header: "TOEIC" },
            { key: "age", header: "Age" },
            { key: "bmi", header: "BMI" },
            { key: "weight", header: "Weight" },
            { key: "height", header: "Height" },
            { key: "application", header: "Application", render: (row) => <StageIcon stageIndex={0} currentStage={STATUS_TO_STAGE[row.status] || 0} isError={ERROR_STATUSES.includes(row.status)} status={row.status} />, className: "w-[80px] text-center" },
            { key: "interview", header: "Interview", render: (row) => <StageIcon stageIndex={1} currentStage={STATUS_TO_STAGE[row.status] || 0} isError={ERROR_STATUSES.includes(row.status)} status={row.status} />, className: "w-[80px] text-center" },
            { key: "offer", header: "Offer", render: (row) => <StageIcon stageIndex={2} currentStage={STATUS_TO_STAGE[row.status] || 0} isError={ERROR_STATUSES.includes(row.status)} status={row.status} />, className: "w-[80px] text-center" },
            { key: "hired", header: "Hired", render: (row) => <StageIcon stageIndex={3} currentStage={STATUS_TO_STAGE[row.status] || 0} isError={ERROR_STATUSES.includes(row.status)} status={row.status} />, className: "w-[80px] text-center" },
            { key: "recruiter", header: "Owner" },
          ]}
          data={paginatedCandidates}
          keyExtractor={(row) => row.unique_id}
        />
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-[var(--text-secondary)]">Page {safePage} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-white hover:bg-[#f8fafc] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-white hover:bg-[#f8fafc] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  pageSize?: number;
}

export function LazyTable({ filters, pageSize = 50 }: LazyTableProps) {
  const [allCandidates, setAllCandidates] = useState<CandidateDetail[]>([]);
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
      setDisplayedCount(pageSize);
    } catch (err) {
      setError(String(err));
      console.error("Failed to fetch candidates:", err);
    } finally {
      setLoading(false);
    }
}, [filters.dateFrom, filters.dateTo, filters.owner, filters.search, pageSize]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    void fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    if (!sentinelRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < allCandidates.length) {
          setDisplayedCount((prev) => Math.min(prev + pageSize, allCandidates.length));
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [loading, displayedCount, allCandidates.length, pageSize]);

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[var(--border)]">
              {[
                "Unique ID", "Date Applied", "Position", "Department", "Experience",
                "Degree", "Major", "TOEIC", "Age", "BMI", "Weight", "Height", "", "", ""
              ].map((header, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-[var(--border)]">
                {Array.from({ length: 15 }).map((_, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full max-w-32" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center py-8 text-[var(--accent-red)]">Error loading candidates: {error}</p>
    );
  }

  const displayedCandidates = allCandidates.slice(0, displayedCount);
  const hasMore = displayedCount < allCandidates.length;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Showing {displayedCandidates.length} of {allCandidates.length} candidates
        </p>
      </div>
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
        data={displayedCandidates}
        keyExtractor={(row) => row.unique_id}
      />
      {hasMore && (
        <div ref={sentinelRef} className="h-10 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}
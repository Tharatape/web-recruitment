"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import KpiCharts from "@/components/charts/KpiCharts";
import type { CandidateDetail, KpiAggregations } from "@/data/repositories/kpiRepository";
import { OWNERS } from "@/data/types";

export default function KpiDataPage() {
  const [tableSearch, setTableSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [owner, setOwner] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [allCandidates, setAllCandidates] = useState<CandidateDetail[]>([]);
  const [aggregations, setAggregations] = useState<KpiAggregations>({
    positionDistribution: [],
    educationDistribution: [],
    experienceDistribution: [],
    ageDistribution: [],
    bmiDistribution: [],
    heightDistribution: [],
    totalCandidates: 0,
    averageExperience: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const candidates = tableSearch
    ? allCandidates.filter(c =>
        c.position.toLowerCase().includes(tableSearch.toLowerCase()) ||
        c.unique_id.toLowerCase().includes(tableSearch.toLowerCase())
      )
    : allCandidates;

  const totalPages = Math.max(1, Math.ceil(candidates.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedCandidates = candidates.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const qp = new URLSearchParams();
        if (dateFrom) qp.set("dateFrom", dateFrom);
        if (dateTo) qp.set("dateTo", dateTo);
        if (owner === "no-owner") qp.set("owner", "no-owner");
        else if (owner) qp.set("owner", owner);

        const res = await fetch(`/api/kpi/data?${qp.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch KPI data: ${res.status}`);
        }
        const data = await res.json();
        setAllCandidates(data.candidates);
        setAggregations(data.aggregations);
        setPage(1);
      } catch (err) {
        setError(String(err));
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFrom, dateTo, owner]);

  const hasActiveFilters = dateFrom || dateTo || owner;

  const handleExport = async () => {
    const qp = new URLSearchParams();
    if (dateFrom) qp.set("dateFrom", dateFrom);
    if (dateTo) qp.set("dateTo", dateTo);
    if (owner === "no-owner") qp.set("owner", "no-owner");
    else if (owner) qp.set("owner", owner);

    const res = await fetch(`/api/kpi/export?${qp.toString()}`);
    if (res.ok) {
      const csv = await res.text();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kpi-data.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleClearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setOwner("");
    setTableSearch("");
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">KPI Data</h1>

        <Card className="mb-6">
          <CardContent className="!p-5">
            <div className="flex flex-wrap gap-4 mb-6 items-end">
              <div className="flex-1 min-w-[200px]">
                <Input
                  label="Search"
                  type="text"
                  placeholder="Position, Unique ID..."
                  value={tableSearch}
                  onChange={(e) => { setTableSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Input
                type="date"
                label="From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                label="To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
              <Dropdown
                label="Recruiter"
                placeholder="All Owners"
                options={[{ label: "No Owner", value: "no-owner" }, ...OWNERS.map((r) => ({ label: r, value: r }))]}
                value={owner}
                onChange={setOwner}
                className="w-48"
              />
              <Button variant="success" onClick={handleExport} size="sm" className="h-[38px]">
                Export to Excel
              </Button>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-[var(--accent-red)] hover:underline cursor-pointer bg-transparent border-none"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-center py-8 text-[var(--text-secondary)]">Loading...</p>
        ) : error ? (
          <p className="text-center py-8 text-[var(--accent-red)]">Error: {error}</p>
        ) : (
          <>
            <KpiCharts aggregations={aggregations} />
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Showing {paginatedCandidates.length} of {candidates.length} candidates
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
              <Table
                columns={[
                  { key: "unique_id", header: "Unique ID", render: (row) => <span className="font-mono text-xs text-[var(--text-secondary)]">{row.unique_id}</span>, className: "w-[100px]" },
                  { key: "date_applied", header: "Date Applied" },
                  { key: "position", header: "Position" },
                  { key: "type", header: "Type" },
                  { key: "department", header: "Department" },
                  { key: "experience", header: "Experience" },
                  { key: "degree", header: "Degree" },
                  { key: "major", header: "Major" },
                  { key: "toeic", header: "TOEIC" },
                  { key: "age", header: "Age" },
                  { key: "bmi", header: "BMI" },
                  { key: "weight", header: "Weight" },
                  { key: "height", header: "Height" },
                  { key: "status", header: "Application" },
                  { key: "interview", header: "Interview" },
                  { key: "offer", header: "Offer" },
                  { key: "hired", header: "Hired" },
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
        )}
      </main>
    </>
  );
}
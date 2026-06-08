"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { LazyLoadWrapper } from "@/components/LazyLoadWrapper";
import { LazyKpiCharts } from "@/components/LazyKpiCharts";
import { LazyTable } from "@/components/LazyTable";
import { OWNERS } from "@/data/types";

export default function KpiDataPage() {
  const [tableSearch, setTableSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [owner, setOwner] = useState("");

  const handleExport = async () => {
    const qp = new URLSearchParams();
    if (dateFrom) qp.set("dateFrom", dateFrom);
    if (dateTo) qp.set("dateTo", dateTo);
    if (owner === "no-owner") qp.set("owner", "no-owner");
    else if (owner) qp.set("owner", owner);

    const res = await fetch(`/api/kpi/export?${qp.toString()}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kpi-data.xlsx';
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

  const hasActiveFilters = dateFrom || dateTo || owner;

  return (
    <main className="max-w-7xl px-4 py-6 sm:px-5 sm:py-7 lg:px-6 lg:py-8 lg:ml-60">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">KPI Data</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm font-semibold text-[var(--foreground)]">Sarah Mitchell</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs sm:text-sm cursor-pointer hover:ring-2 hover:ring-[var(--primary)] transition-all" title="Profile">SM</div>
        </div>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardContent className="!p-4 sm:!p-5">
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Search"
                type="text"
                placeholder="Position, Unique ID..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
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

      <LazyLoadWrapper>
        <LazyKpiCharts dateFrom={dateFrom} dateTo={dateTo} owner={owner} />
      </LazyLoadWrapper>

      <LazyTable filters={{ dateFrom, dateTo, owner, search: tableSearch }} />
    </main>
  );
}
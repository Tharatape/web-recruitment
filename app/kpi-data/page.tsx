"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import KpiCharts from "@/components/charts/KpiCharts";
import { OWNERS } from "@/data/types";

type AggregationData = {
  positionDistribution: Array<{ name: string; value: number }>;
  educationDistribution: Array<{ name: string; value: number }>;
  experienceDistribution: Array<{ name: string; value: number }>;
  ageDistribution: Array<{ name: string; value: number }>;
  bmiDistribution: Array<{ name: string; value: number }>;
  heightDistribution: Array<{ name: string; value: number }>;
  totalCandidates: number;
  averageExperience: number;
};

const emptyAggregations: AggregationData = {
  positionDistribution: [],
  educationDistribution: [],
  experienceDistribution: [],
  ageDistribution: [],
  bmiDistribution: [],
  heightDistribution: [],
  totalCandidates: 0,
  averageExperience: 0,
};

export default function KpiDataPage() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [owner, setOwner] = useState("");
  const [aggregations, setAggregations] = useState<AggregationData>(emptyAggregations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const qp = new URLSearchParams();
        if (search) qp.set("search", search);
        if (dateFrom) qp.set("dateFrom", dateFrom);
        if (dateTo) qp.set("dateTo", dateTo);
        if (owner === "no-owner") qp.set("owner", "no-owner");
        else if (owner) qp.set("owner", owner);

        const res = await fetch(`/api/kpi/data?${qp.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch KPI data: ${res.status}`);
        }
        const data = await res.json();
        setAggregations(data.aggregations);
      } catch (err) {
        setError(String(err));
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [search, dateFrom, dateTo, owner]);

  const hasActiveFilters = search || dateFrom || dateTo || owner;

  const handleExport = async () => {
    const qp = new URLSearchParams();
    if (search) qp.set("search", search);
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
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setOwner("");
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
                  placeholder="Name, Position, Unique ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
             <Card>
               <CardHeader>
                 <CardTitle>Candidate Details</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm">
                     <thead>
                       <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
                         <th className="text-left pr-2 pb-2">Unique ID</th>
                         <th className="text-left pr-2 pb-2">Date Applied</th>
                         <th className="text-left pr-2 pb-2">Position</th>
                         <th className="text-left pr-2 pb-2">Type</th>
                         <th className="text-left pr-2 pb-2">Department</th>
                         <th className="text-left pr-2 pb-2">Experience</th>
                         <th className="text-left pr-2 pb-2">Degree</th>
                         <th className="text-left pr-2 pb-2">Major</th>
                         <th className="text-left pr-2 pb-2">TOEIC</th>
                         <th className="text-left pr-2 pb-2">Age</th>
                         <th className="text-left pr-2 pb-2">BMI</th>
                         <th className="text-left pr-2 pb-2">Weight</th>
                         <th className="text-left pr-2 pb-2">Height</th>
                         <th className="text-left pr-2 pb-2">Application</th>
                         <th className="text-left pr-2 pb-2">Interview</th>
                         <th className="text-left pr-2 pb-2">Offer</th>
                         <th className="text-left pr-2 pb-2">Hired</th>
                         <th className="text-left pr-2 pb-2">Owner</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr className="border-b border-[var(--border)]">
                         <td className="py-2 pr-2">app-00001</td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                         <td className="py-2 pr-2"></td>
                       </tr>
                     </tbody>
                   </table>
                 </div>
               </CardContent>
             </Card>
           </>
         )}
       </main>
     </>
   );
}
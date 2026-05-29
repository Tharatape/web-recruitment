"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import { BarChart } from "@/components/charts/BarChart";
import { PositionDistributionDonut } from "@/components/charts/KpiCharts";
import { StageBar } from "@/components/charts/StageBar";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { STATUSES } from "@/data/types";
import type { DashboardStats } from "@/data/db/stats";

export default function DashboardPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [owner, setOwner] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recruiters, setRecruiters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const [statsRes, recRes] = await Promise.all([
          fetch(`/api/dashboard/stats?${new URLSearchParams({ startDate, endDate, owner })}`),
          fetch('/api/dashboard/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'getRecruiters' }) })
        ]);
        
        if (!statsRes.ok) {
          throw new Error(`Failed to fetch stats: ${statsRes.status}`);
        }
        if (!recRes.ok) {
          throw new Error(`Failed to fetch recruiters: ${recRes.status}`);
        }

        const statsData = await statsRes.json();
        const recs = await recRes.json();
        setStats(statsData);
        setRecruiters(recs.map((r: { name: string }) => r.name));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate, owner]);

  const total = stats?.total || 0;
  const today = stats?.today || 0;
  const lastWeek = stats?.lastWeek || 0;
  const lastMonth = stats?.lastMonth || 0;

  const fullStatusCounts = stats?.statusCounts || {};

  const statusBarData = STATUSES.map((s) => ({
    name: s,
    value: fullStatusCounts[s] || 0,
    color: "#2563eb",
    percentage: total > 0 ? ((fullStatusCounts[s] || 0) / total * 100).toFixed(1) + "%" : "0%",
  }));

  const stageTotalsValue = stats?.stageTotals || {};
  const stageTotals: Record<string, number> = {
    "Application Stage": stageTotalsValue["Application Stage"] || 0,
    "Interview Stage": stageTotalsValue["Interview Stage"] || 0,
    "Offer Stage": stageTotalsValue["Offer Stage"] || 0,
    "Hired Stage": stageTotalsValue["Hired Stage"] || 0,
  };
  const stageData = stats?.stageData || [];
  const maxTotal = Math.max(...Object.values(stageTotals));

  const positionDist = stats?.positionDistribution || [];

  // if (loading) {
  //   return (
  //     <main className="max-w-7xl mx-auto px-6 py-8">
  //       <p className="text-center py-8">Loading...</p>
  //     </main>
  //   );
  // }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 mb-6">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Dropdown
            label="Recruiter"
            placeholder="All Owners"
            options={recruiters.map((r) => ({ label: r, value: r }))}
            value={owner}
            onChange={setOwner}
            className="w-48"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Applications", value: total },
            { label: "Today Applied", value: today },
            { label: "Last Week Applied", value: lastWeek },
            { label: "Last Month Applied", value: lastMonth },
          ].map((stat) => (
            <Card key={stat.label} className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-[var(--primary)]">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
              <CardHeader>
                <CardTitle className="mb-0">Position Distribution</CardTitle>
                <p className="text-sm text-[var(--text-secondary)] -mt-1">
                  Distribution of applications across different positions
                </p>
              </CardHeader>
              <CardContent>
                <PositionDistributionDonut data={positionDist} />
              </CardContent>
            </Card>

          <Card>
              <CardHeader>
                <CardTitle className="mb-0">Status Overview</CardTitle>
                <p className="text-sm text-[var(--text-secondary)] -mt-1">
                  Current candidate distribution across all application statuses
                </p>
              </CardHeader>
              <CardContent>
               <BarChart data={statusBarData} height={300} />
               <div className="mt-3 overflow-x-auto">
                 <table className="w-full text-sm">
                   <thead>
                     <tr className="text-[var(--text-muted)] text-xs">
                       <th className="text-left pr-4 pb-2">Status</th>
                       <th className="text-right pb-2">Count</th>
                       <th className="text-right pb-2">%</th>
                     </tr>
                   </thead>
                   <tbody>
                     {STATUSES.map((s) => {
                       const v = fullStatusCounts[s] || 0;
                       return (
                         <tr key={s} className="border-t border-[var(--border)] last:border-0">
                           <td className="py-1.5 pr-4 font-medium">{s}</td>
                           <td className="py-1.5 text-right">{v}</td>
                           <td className="py-1.5 text-right text-[var(--text-secondary)]">
                             {total > 0 ? ((v / total) * 100).toFixed(1) : 0}%
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             </CardContent>
           </Card>
        </div>

        <Card className="mb-8">
            <CardHeader>
              <CardTitle className="mb-0">Stage Performance</CardTitle>
              <p className="text-sm text-[var(--text-secondary)] -mt-1">
                Funnel visualization of candidate progression through hiring stages
              </p>
            </CardHeader>
            <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {stageData.map((stage) => (
                 <div key={stage.name} className="flex flex-col">
                   <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{stage.name}</h4>
                   <StageBar name={stage.name} segments={stage.segments} height={180} yAxisMax={maxTotal} />
                   <div className="mt-2 space-y-1">
                     {stage.segments.map((seg) => (
                       <div key={seg.name} className="flex items-center justify-between text-xs">
                         <span className="flex items-center gap-1">
                           <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: seg.color }} />
                           {seg.name}
                         </span>
                         <span className="font-medium">
                           {seg.value} ({stageTotals[stage.name] > 0 ? ((seg.value / stageTotals[stage.name]) * 100).toFixed(1) : 0}%)
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
           </CardContent>
           <div className="px-6 pb-4 border-t border-[var(--border)] pt-4">
             <div className="text-xs text-[var(--text-secondary)] opacity-70 space-y-1">
               <p><strong>Applied:</strong> Candidates who meet the initial job criteria but have not yet been selected for the next stage.</p>
               <p><strong>Shortlisted:</strong> Candidates who meet the criteria and have been selected to move forward in the Interview process.</p>
               <p><strong>Not Suitable:</strong> Candidates who do not meet the minimum requirements for the role.</p>
               <p><strong>Selected:</strong> Candidates who have successfully passed both the 1st and 2nd round interviews.</p>
               <p><strong>Not Selected:</strong> Candidates who did not pass either the 1st or 2nd round interviews.</p>
               <p><strong>Offer Accepted:</strong> Candidates who have formally accepted the job offer.</p>
               <p><strong>Offer Declined:</strong> Candidates who were extended an offer but chose not to accept it.</p>
               <p><strong>Hired:</strong> Candidates who have successfully completed the onboarding process and are officially part of the company.</p>
               <p><strong>Not Hired:</strong> Candidates who went through the process but were ultimately not chosen for the role.</p>
             </div>
           </div>
         </Card>

        <Card>
          <CardHeader>
            <CardTitle className="mb-0">Average Duration Between Stages</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] -mt-1">
              Time candidates spend transitioning between Stage Performance
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Applied → Interview", days: "12.4" },
                { label: "Interview → Offer", days: "8.2" },
                { label: "Offer → Hired", days: "5.6" },
                { label: "Applied → Hired", days: "26.2" },
              ].map((d) => (
                <div key={d.label} className="p-4 bg-[#f8fafc] rounded-xl text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    {d.label}
                  </p>
                  <p className="text-2xl font-bold text-[var(--primary)]">{d.days}</p>
                  <p className="text-xs text-[var(--text-muted)]">days avg</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
     </main>
   );
}
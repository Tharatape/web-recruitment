"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChart } from "@/components/charts/BarChart";
import { StageBar } from "@/components/charts/StageBar";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { STATUSES } from "@/data/types";
import { candidatesWithLogs } from "@/data/mockData";

export default function DashboardPage() {
  // Snapshot "now" once so the server and client each have a single stable
  // reference — `new Date()` is never called inside useMemo callbacks, which
  // prevents the server-rendered value from drifting between renders.
  const now = new Date();   // only here, not inside useMemo
  const todayStr = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [owner, setOwner] = useState("");

  const filtered = useMemo(() => {
    return candidatesWithLogs.filter((c) => {
      if (startDate && c.dateApplied < startDate) return false;
      if (endDate && c.dateApplied > endDate) return false;
      if (owner && c.recruiter !== owner) return false;
      return true;
    });
  }, [startDate, endDate, owner]);

  const total = filtered.length;
  const today = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => filtered.filter((c) => c.dateApplied === todayStr).length,
    [filtered]
  );
  const lastWeek = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => filtered.filter((c) => new Date(c.dateApplied) >= weekAgo).length,
    [filtered]
  );
  const lastMonth = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => filtered.filter((c) => new Date(c.dateApplied) >= monthAgo).length,
    [filtered]
  );

  const fullStatusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    STATUSES.forEach((s) => (map[s] = 0));
    filtered.forEach((c) => map[c.status]++);
    return map;
  }, [filtered]);

  const statusBarData = useMemo(
    () =>
      STATUSES.map((s) => ({
        name: s,
        value: fullStatusCounts[s] || 0,
        color: "#2563eb",
        percentage: total > 0 ? ((fullStatusCounts[s] || 0) / total * 100).toFixed(1) + "%" : "0%",
      })),
    [fullStatusCounts, total]
  );

  // ── Stage Performance data ─────────────────────────────────────────────
  // Funnel: each stage only counts candidates who passed the prior stage.
  // Interview bar total = Shortlisted, Offer bar = Selected, Hired bar = Offer Accepted.
  const { stageData, maxTotal, stageTotals } = useMemo(() => {
    const candidateStages = filtered.map((c) => {
      const s = new Set<string>();
      c.logs.forEach((l) => s.add(l.status));
      return s;
    });

    // Application Stage: need mutually exclusive counts
    // Applied = candidates with ONLY "Applied" (no Shortlisted, Not Suitable, or later stages)
    const appliedCount = candidateStages.filter(
      (stages) => stages.has("Applied") && !stages.has("Shortlisted") && !stages.has("Not Suitable")
    ).length;
    // Shortlisted = candidates who made it to shortlist (includes those who progressed further)
    const shortlistedCount = candidateStages.filter((stages) => stages.has("Shortlisted")).length;
    // Not Suitable = candidates rejected at screening (NOT shortlisted)
    const notSuitableCount = candidateStages.filter(
      (stages) => stages.has("Not Suitable") && !stages.has("Shortlisted")
    ).length;

    // Interview: only Shortlisted candidates
    const selectedCount = candidateStages.filter(
      (stages) => stages.has("Selected")
    ).length;
    // Not Selected = shortlisted - selected
    const notSelectedCount =
      candidateStages.filter(
        (stages) => stages.has("Shortlisted") && !stages.has("Selected")
      ).length;

    // Offer: only Selected candidates
    const offerAcceptedCount = candidateStages.filter(
      (stages) => stages.has("Offer Accepted")
    ).length;
    // Offer Declined = selected - offer accepted
    const offerDeclinedCount =
      candidateStages.filter(
        (stages) => stages.has("Selected") && !stages.has("Offer Accepted")
      ).length;

    // Hired: only Offer Accepted candidates
    const hiredHiredCount = candidateStages.filter(
      (stages) => stages.has("Hired")
    ).length;
    // Not Hired = offer accepted - hired
    const notHiredCount =
      candidateStages.filter(
        (stages) => stages.has("Offer Accepted") && !stages.has("Hired")
      ).length;

const stageTotals: Record<string, number> = {
      "Application Stage": shortlistedCount + notSuitableCount + appliedCount,
      "Interview Stage": shortlistedCount,
      "Offer Stage": selectedCount,
      "Hired Stage": offerAcceptedCount,
    };

    const data = [
      {
        name: "Application Stage",
        segments: [
          { name: "Shortlisted", value: shortlistedCount, color: "#22c55e" },
          { name: "Not Suitable", value: notSuitableCount, color: "#ef4444" },
          { name: "Applied",      value: appliedCount,       color: "#9ca3af" },
        ],
      },
      {
        name: "Interview Stage",
        segments: [
          { name: "Selected",     value: selectedCount,     color: "#22c55e" },
          { name: "Not Selected", value: notSelectedCount,  color: "#ef4444" },
        ],
      },
      {
        name: "Offer Stage",
        segments: [
          { name: "Accepted", value: offerAcceptedCount, color: "#22c55e" },
          { name: "Decline",  value: offerDeclinedCount, color: "#ef4444" },
        ],
      },
      {
        name: "Hired Stage",
        segments: [
          { name: "Hires",     value: hiredHiredCount,  color: "#22c55e" },
          { name: "Not Hired", value: notHiredCount,     color: "#ef4444" },
        ],
      },
    ];

    const maxTotal = Math.max(...Object.values(stageTotals));
    return { stageData: data, maxTotal, stageTotals };
  }, [filtered]);

  const positionDist = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((c) => (map[c.position] = (map[c.position] || 0) + 1));
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Dropdown
            label="Recruiter"
            placeholder="All Owners"
            options={[
              ...Array.from(
                new Set(candidatesWithLogs.map((c) => c.recruiter))
              ).map((r) => ({ label: r, value: r })),
            ]}
            value={owner}
            onChange={setOwner}
            className="w-48"
          />
        </div>

        {/* Summary Cards */}
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

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
{/* Position Distribution */}
           <Card>
             <CardHeader>
               <CardTitle className="mb-0">Position Distribution</CardTitle>
               <p className="text-sm text-[var(--text-secondary)] -mt-1">
                 Distribution of applications across different positions
               </p>
             </CardHeader>
             <CardContent>
               <DonutChart data={positionDist} height={260} centerLabel="Total" centerTotal={total} />
               <div className="mt-4 space-y-2">
                 {positionDist.map((p) => (
                   <div key={p.name} className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                     <span>•</span>
                     <span>{p.name}: {p.value}</span>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>

{/* Status Overview Bar */}
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

{/* Stage Performance */}
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

{/* Average Durations */}
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

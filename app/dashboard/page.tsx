"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DonutChart } from "@/components/charts/DonutChart";
import { BarChart } from "@/components/charts/BarChart";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { STATUSES, type Status } from "@/data/types";
import { candidatesWithLogs } from "@/data/mockData";

export default function DashboardPage() {
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
    () => filtered.filter((c) => c.dateApplied === new Date().toISOString().split("T")[0]).length,
    [filtered]
  );
  const lastWeek = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return filtered.filter((c) => new Date(c.dateApplied) >= weekAgo).length;
  }, [filtered]);
  const lastMonth = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    return filtered.filter((c) => new Date(c.dateApplied) >= monthAgo).length;
  }, [filtered]);

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

  const stages = useMemo(() => {
    const getCounts = (statuses: Status[]) =>
      statuses.map((s) => ({ name: s, value: fullStatusCounts[s] || 0, color: "#2563eb" }));
    return {
      application: getCounts(["Applied", "Not Suitable", "Shortlisted"]),
      interview: getCounts(["Not Selected", "Selected"]),
      offer: getCounts(["Offer Declined", "Offer Accepted"]),
      hired: getCounts(["Not Hired", "Hired"]),
    };
  }, [fullStatusCounts]);

  const positionDist = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((c) => (map[c.position] = (map[c.position] || 0) + 1));
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Dropdown
            placeholder="All Owners"
            options={[
              { label: "All Owners", value: "" },
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
            { label: "Today", value: today },
            { label: "Last Week", value: lastWeek },
            { label: "Last Month", value: lastMonth },
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
            <CardHeader><CardTitle>Position Distribution</CardTitle></CardHeader>
            <CardContent>
              <DonutChart data={positionDist} height={260} centerLabel="Total" />
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                {positionDist.map((p) => (
                  <span key={p.name} className="text-xs font-medium text-[var(--text-secondary)]">
                    {p.name}: {p.value}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Overview Bar */}
          <Card>
            <CardHeader><CardTitle>Status Overview</CardTitle></CardHeader>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {[
            { cardTitle: "Application Stage", data: stages.application },
            { cardTitle: "Interview Stage", data: stages.interview },
            { cardTitle: "Offer Stage", data: stages.offer },
            { cardTitle: "Hired Stage", data: stages.hired },
          ].map((ch) => (
            <Card key={ch.cardTitle}>
              <CardHeader><CardTitle>{ch.cardTitle}</CardTitle></CardHeader>
              <CardContent>
                <BarChart data={ch.data} height={220} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Average Durations */}
        <Card>
          <CardHeader><CardTitle>Average Duration Between Stages</CardTitle></CardHeader>
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
    </>
  );
}

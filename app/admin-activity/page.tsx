"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Table } from "@/components/ui/Table";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { OWNERS } from "@/data/types";

interface Activity {
  id: string;
  timestamp: string;
  action: string;
  recruiter: string;
  candidate: string;
  candidateId: string;
  status: string;
  actionDetail: string;
}

interface ApiActivityItem {
  id: number;
  candidate_id: string;
  candidate_unique_id: string;
  candidate_name: string;
  date: string;
  time: string;
  recruiter: string;
  status: string;
  note: string | null;
  action_type: string | null;
}

export default function AdminActivityPage() {
  const [search, setSearch] = useState("");
  const [datePeriod, setDatePeriod] = useState("");
  const [status, setStatus] = useState("");
  const [action, setAction] = useState("");
  const [recruiter, setRecruiter] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (datePeriod) params.set("days", datePeriod);
      if (status) params.set("status", status);
      if (action) params.set("action_type", action);
      if (recruiter) params.set("recruiter", recruiter);
      if (search) params.set("search", search);

      fetch(`/api/activity?${params.toString()}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch activities: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const mappedActivities: Activity[] = data.map((item: ApiActivityItem) => ({
            id: String(item.id),
            timestamp: `${item.date} ${item.time}`,
            action: item.action_type || "Matching",
            recruiter: item.recruiter || "Unknown",
            candidate: item.candidate_name || "Unknown",
            candidateId: item.candidate_unique_id || item.candidate_id || "",
            status: item.status || "",
            actionDetail: item.note || "",
          }));
          setActivities(mappedActivities);
        })
        .catch((error) => {
          console.error("Failed to fetch activities:", error);
          setActivities([]);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    fetchData();
  }, [datePeriod, status, action, recruiter, search]);

  return (
    <main className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:ml-60">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Admin Activity</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm font-semibold text-[var(--foreground)]">Sarah Mitchell</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs sm:text-sm cursor-pointer hover:ring-2 hover:ring-[var(--primary)] transition-all" title="Profile">SM</div>
        </div>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardContent className="!p-4 sm:!p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <Input
              label="Advance Search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--foreground)]">Date Period</label>
              <Dropdown
                placeholder="Select period..."
                options={[
                  { label: "Last 7 days", value: "7" },
                  { label: "Last 14 days", value: "14" },
                  { label: "Last 30 days", value: "30" },
                  { label: "Last 60 days", value: "60" },
                  { label: "Last 90 days", value: "90" },
                ]}
                value={datePeriod}
                onChange={setDatePeriod}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--foreground)]">Status</label>
              <Dropdown
                placeholder="All Statuses"
                options={[
                  { label: "Applied", value: "Applied" },
                  { label: "Not Suitable", value: "Not Suitable" },
                  { label: "Shortlisted", value: "Shortlisted" },
                  { label: "1st Interview", value: "1st Interview" },
                  { label: "2nd Interview", value: "2nd Interview" },
                  { label: "Not Selected", value: "Not Selected" },
                  { label: "Selected", value: "Selected" },
                  { label: "Offer Accepted", value: "Offer Accepted" },
                  { label: "Offer Declined", value: "Offer Declined" },
                  { label: "Hired", value: "Hired" },
                  { label: "Not Hired", value: "Not Hired" },
                ]}
                value={status}
                onChange={setStatus}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--foreground)]">Action</label>
              <Dropdown
                placeholder="All Actions"
                options={[
                  { label: "Change Status", value: "Change Status" },
                  { label: "Matching", value: "Matching" },
                  { label: "Create/Edit JD", value: "Create/Edit JD" },
                  { label: "AI Opinion", value: "AI Opinion" },
                ]}
                value={action}
                onChange={setAction}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--foreground)]">Recruiter</label>
              <Dropdown
                placeholder="All Recruiters"
                options={OWNERS.map((o) => ({ label: o, value: o }))}
                value={recruiter}
                onChange={setRecruiter}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <Card>
          <Table<Activity>
            columns={[
              { key: "timestamp", header: "Time Stamp" },
              { key: "action", header: "Action" },
              { key: "recruiter", header: "Recruiter" },
              {
                key: "candidate",
                header: "Candidate & ID",
                render: (row) => `${row.candidate} (${row.candidateId})`,
              },
              { key: "status", header: "Status" },
              { key: "actionDetail", header: "Action Detail" },
            ]}
            data={activities}
            keyExtractor={(row) => row.id}
          />
        </Card>
      )}
    </main>
  );
}
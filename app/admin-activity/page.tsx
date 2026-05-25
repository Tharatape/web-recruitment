"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Table } from "@/components/ui/Table";

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

export default function AdminActivityPage() {
  const [search, setSearch] = useState("");
  const [datePeriod, setDatePeriod] = useState("");
  const [recruiter, setRecruiter] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Admin Activity</h1>

      <Card className="mb-6">
        <CardContent className="!p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Input
              label="Advance Search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Input
              label="Start Date"
              type="date"
              value=""
              onChange={() => {}}
            />
            <Input
              label="End Date"
              type="date"
              value=""
              onChange={() => {}}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-[var(--foreground)]">Recruiter</label>
              <Dropdown
                placeholder="All Recruiters"
                options={[]}
                value={recruiter}
                onChange={setRecruiter}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
    </main>
  );
}
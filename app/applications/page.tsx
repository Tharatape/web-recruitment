"use client";

import { useState, useMemo } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Table } from "@/components/ui/Table";
import { STATUSES, OWNERS, Status } from "@/data/types";
import { candidatesWithLogs } from "@/data/mockData";

function getExperienceLabel(exp: number): string {
  return exp < 2 ? "0-1 Year" : exp < 5 ? "2-4 Years" : exp < 9 ? "5-8 Years" : "9+ Years";
}

function DownloadCVButton() {
  return (
    <button
      onClick={() => alert("Download CV clicked")}
      className="px-3.5 py-2 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-light)] rounded-lg hover:bg-[#bfdbfe] transition-colors cursor-pointer"
    >
      View Original CV
    </button>
  );
}

function ViewFormButton() {
  return (
    <a
      href="#"
      target="_blank"
      rel="noopener noreferrer"
      className="px-3.5 py-2 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-light)] rounded-lg hover:bg-[#bfdbfe] transition-colors inline-block"
    >
      View Application Form
    </a>
  );
}

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [positions, setPositions] = useState<string[]>([]);
  const [expRanges, setExpRanges] = useState<string[]>([]);
  const [dateApplied, setDateApplied] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [recruiters, setRecruiters] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allPositions = Array.from(new Set(candidatesWithLogs.map((c) => c.position)));
  const allDateApplied = Array.from(new Set(candidatesWithLogs.map((c) => c.dateApplied))).slice(0, 60);
  const expRangeOptions = ["0-1 Year", "2-4 Years", "5-8 Years", "9+ Years"];

  const toggleArray = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    arr.includes(val) ? setArr(arr.filter((v) => v !== val)) : setArr([...arr, val]);

  const filtered = useMemo(() => {
    let data = [...candidatesWithLogs];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.nid.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    if (positions.length) data = data.filter((c) => positions.includes(c.position));
    if (expRanges.length)
      data = data.filter((c) => expRanges.includes(getExperienceLabel(c.experience)));
    if (dateApplied.length) data = data.filter((c) => dateApplied.includes(c.dateApplied));
    if (statuses.length) data = data.filter((c) => statuses.includes(c.status));
    if (recruiters.length) data = data.filter((c) => recruiters.includes(c.recruiter));

    return data;
  }, [search, positions, expRanges, dateApplied, statuses, recruiters]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const expanded = paged.find((c) => c.id === expandedId);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Application List</h1>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="!p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Input label="Search" placeholder="Name, Phone, NID, Email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--foreground)]">Position</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {allPositions.map((p) => (
                    <button
                      key={p}
                      onClick={() => toggleArray(positions, setPositions, p)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer border ${
                        positions.includes(p)
                          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                          : "bg-white border-[var(--border)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--foreground)]">Experience</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {expRangeOptions.map((o) => (
                    <button
                      key={o}
                      onClick={() => toggleArray(expRanges, setExpRanges, o)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer border ${
                        expRanges.includes(o)
                          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                          : "bg-white border-[var(--border)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--foreground)]">Date Applied</label>
                <div className="flex flex-wrap gap-1.5 mt-1 max-h-[120px] overflow-y-auto">
                  {allDateApplied.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleArray(dateApplied, setDateApplied, d)}
                      className={`px-2 py-1 text-xs font-medium rounded-lg cursor-pointer border whitespace-nowrap ${
                        dateApplied.includes(d)
                          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                          : "bg-white border-[var(--border)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--foreground)]">Status</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleArray(statuses, setStatuses, s)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                        statuses.includes(s)
                          ? "bg-[var(--primary)] text-white"
                          : "bg-white border border-[var(--border)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--foreground)]">Recruiter</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {OWNERS.map((r) => (
                    <button
                      key={r}
                      onClick={() => toggleArray(recruiters, setRecruiters, r)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                        recruiters.includes(r)
                          ? "bg-[var(--primary)] text-white"
                          : "bg-white border border-[var(--border)]  text-[var(--text-secondary)]"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {(search || positions.length || statuses.length || recruiters.length) && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => {
                    setSearch(""); setPositions([]); setExpRanges([]); setDateApplied([]); setStatuses([]); setRecruiters([]); setPage(1);
                  }}
                  className="text-xs font-semibold text-[var(--accent-red)] hover:underline cursor-pointer bg-transparent border-none"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Info + Pagination */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {paged.length} of {total} candidates
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

        {/* Table */}
        <Card>
          <Table<{ id: string; name: string; position: string; experience: number; dateApplied: string; status: Status; recruiter: string }>
            columns={[
              {
                key: "name",
                header: "Name",
                render: (row) => {
                  const c = candidatesWithLogs.find((x) => x.id === row.id)!;
                  return (
                    <span className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs">
                        {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-semibold">{row.name}</span>
                    </span>
                  );
                },
              },
              { key: "position", header: "Position" },
              {
                key: "experience",
                header: "Experience",
                render: (row) => getExperienceLabel(row.experience),
              },
              { key: "dateApplied", header: "Date Applied" },
              {
                key: "status",
                header: "Status",
                render: (row) => {
                  const cls = STATUSES.map((s) => {
                    const slug = s.toLowerCase().replace(/\s+/g, "-");
                    return `status-${slug}`;
                  });
                  const idx = STATUSES.indexOf(row.status);
                  return <span className={`status-badge ${cls[idx] || ""}`}>{row.status}</span>;
                },
              },
              { key: "recruiter", header: "Recruiter" },
            ]}
            data={paged}
            onRowClick={(row) => setExpandedId(expandedId === row.id ? null : row.id)}
            rowClassName={(row) => (expandedId === row.id ? "bg-[var(--primary-light)]" : "")}
          />

          {/* Expanded Details */}
          {expanded && (
            <div className="px-5 py-4 border-t-2 border-[var(--primary)] bg-[#f8fafc] animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Candidate Info */}
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Candidate Information</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="col-span-2 flex items-center gap-4 mb-2">
                      <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xl">
                        {expanded.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">{expanded.id}</p>
                        <p className="font-bold text-base">{expanded.name}</p>
                      </div>
                    </div>
                    {[
                      ["Position", expanded.position], ["Age", `${expanded.age}`], ["Weight", `${expanded.weight} kg`],
                      ["Height", `${expanded.height} cm`], ["BMI", String(expanded.bmi)],
                    ].map(([k, v]) => (
                      <><div key={k} className="font-semibold text-[var(--text-secondary)]">{k}</div><div>{v}</div></>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <DownloadCVButton /><ViewFormButton />
                  </div>
                </section>

                {/* Contact & AI */}
                <section>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Contact & Professional Info</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                    {[
                      ["Phone", expanded.phone], ["Email", expanded.email], ["Expected Salary", expanded.expectedSalary],
                      ["Education", expanded.education], ["Address", expanded.address], ["Language", expanded.language],
                      ["License", expanded.license], ["Previous Employment", expanded.previousEmployment],
                    ].map(([k, v]) => (
                      <><div key={k} className="font-semibold text-[var(--text-secondary)]">{k}</div><div>{v}</div></>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-[var(--primary-light)] rounded-lg">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-1">AI Summary</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{expanded.aiSummary}</p>
                  </div>
                </section>
              </div>

              {/* Log Action */}
              <section className="mt-5 pt-5 border-t border-[var(--border)]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">Log Action</h3>
                <div className="flex flex-wrap gap-3 items-end">
                  <input
                    className="px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="Add a note..."
                    id={`note-${expanded.id}`}
                  />
                  <Dropdown options={STATUSES.map(s => ({ label: s, value: s }))} placeholder="Select Status..." value="" onChange={() => {}} />
                  <button className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors cursor-pointer">
                    Save Log
                  </button>
                </div>

                {/* Activity Log */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">History Log</h4>
                  <div className="overflow-y-auto max-h-48">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs font-semibold text-[var(--text-muted)] border-b border-[var(--border)]">
                          <th className="text-left py-2 pr-4">Date / Time</th>
                          <th className="text-left py-2 pr-4">Status</th>
                          <th className="text-left py-2">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expanded.logs.map((l: { date: string; time: string; status: string; note: string }, i: number) => (
                          <tr key={i} className="border-b border-[var(--border)] last:border-0">
                            <td className="py-2 pr-4 text-[var(--text-secondary)] whitespace-nowrap">
                              {l.date} {l.time}
                            </td>
                            <td className="py-2 pr-4">
                              <span className={`status-badge status-${l.status.toLowerCase().replace(/\s+/g, "-")}`}>
                                {l.status}
                              </span>
                            </td>
                            <td className="py-2 text-[var(--text-secondary)]">{l.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-[var(--text-secondary)]">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-white hover:bg-[#f8fafc] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-white hover:bg-[#f8fafc] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

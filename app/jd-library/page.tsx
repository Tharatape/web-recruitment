"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

type CriterionCounts = Record<string, number>;

interface JD {
  id: string;
  name: string;
  position: string;
  created_at: string;
  disabled?: boolean;
  experienceChecklist?: string[];
  educationChecklist?: string[];
  languageChecklist?: string[];
  technicalChecklist?: string[];
}

export default function JdLibraryPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [jdList, setJdList] = useState<JD[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<Record<string, string>>({});
  const [counts, setCounts] = useState<CriterionCounts>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchJDs = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/jds');
        if (!res.ok) {
          throw new Error(`Failed to fetch JDs: ${res.status}`);
        }
        const data = await res.json();
        setJdList(data);
      } catch (error) {
        console.error("Failed to fetch JDs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJDs();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch('/api/jds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteJD', id })
    });
    setJdList((prev) => prev.filter((jd) => jd.id !== id));
    if (expandedId === id) setExpandedId(null);
    setActiveMenuId(null);
  };

  const handleToggleDisabled = async (id: string, disabled: boolean) => {
    await fetch('/api/jds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggleDisabled', id, disabled })
    });
    setJdList((prev) =>
      prev.map((jd) => (jd.id === id ? { ...jd, disabled } : jd))
    );
    setActiveMenuId(null);
  };

  const handleSelectJd = (id: string) => {
    const jd = jdList.find((j) => j.id === id);
    if (jd) {
      const initialCounts: CriterionCounts = {};
      ["exp", "edu", "lang", "tech"].forEach((cat) => {
        const checklist = jd[`${cat}Checklist` as keyof JD] as string[] | undefined;
        if (checklist) initialCounts[`${jd.id}-${cat}`] = checklist.length;
      });
      setCounts((prev) => ({ ...prev, ...initialCounts }));
    }
    setExpandedId(id);
    setActiveMenuId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    if (files.length > 0) {
      console.log("Uploading files:", files);
      setFiles([]);
    }
  };

  const filteredJds = jdList.filter((jd) =>
    jd.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCriterionChange = (jdId: string, category: string, index: number, value: string) => {
    setCriteria((prev) => ({
      ...prev,
      [`${jdId}-${category}-${index}`]: value,
    }));
  };

  const addCriterion = (jdId: string, category: string) => {
    const key = `${jdId}-${category}`;
    const currentCount = counts[key] ?? 0;
    if (currentCount < 5) {
      setCounts((prev) => ({ ...prev, [key]: currentCount + 1 }));
    }
  };

  const removeCriterion = (jdId: string, category: string, index: number, checklistCount?: number) => {
    const key = `${jdId}-${category}`;
    const currentCount = counts[key] ?? checklistCount ?? 0;
    if (currentCount > 0) {
      setCriteria((prev) => {
        const newCriteria = { ...prev };
        for (let i = index; i < currentCount; i++) {
          const nextKey = `${jdId}-${category}-${i + 1}`;
          const currentKey = `${jdId}-${category}-${i}`;
          if (newCriteria[nextKey] !== undefined) {
            newCriteria[currentKey] = newCriteria[nextKey];
          }
          delete newCriteria[nextKey];
        }
        return newCriteria;
      });
      setCounts((prev) => ({ ...prev, [key]: currentCount - 1 }));
    }
  };

  const renderCriteria = (jd: JD, category: string, label: string, checklist: string[] | undefined) => {
    const key = `${jd.id}-${category}`;
    const count = counts[key] !== undefined ? counts[key] : (checklist ? checklist.length : 5);
    const initialValue = checklist || [];
    return (
      <div className="px-3 sm:px-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-2xs sm:text-xs font-semibold text-[var(--text-primary)]">{label}</label>
          <button
            onClick={() => addCriterion(jd.id, category)}
            disabled={count >= 5}
            className="px-2 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium text-[var(--primary)] bg-[var(--primary-light)] rounded hover:bg-[#bfdbfe] disabled:opacity-50 cursor-pointer"
          >
            + Add
          </button>
        </div>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="relative">
              <Input
                placeholder={`${label.split(" ")[0]} criterion ${i + 1}`}
                value={criteria[`${jd.id}-${category}-${i}`] || initialValue[i] || ""}
                onChange={(e) => handleCriterionChange(jd.id, category, i, e.target.value)}
                className="text-2xs sm:text-xs pr-8 sm:pr-10"
              />
              <button
                onClick={() => removeCriterion(jd.id, category, i, count)}
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-2xs sm:text-xs font-medium text-red-600 hover:bg-red-50 rounded cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="w-full px-4 py-6 sm:px-5 sm:py-7 lg:px-6 lg:py-8 lg:ml-60 lg:max-w-[calc(100vw-240px)]">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-3xl font-bold text-[var(--primary)]">JD Library</h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm font-semibold text-[var(--foreground)]">Sarah Mitchell</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs sm:text-sm" title="Profile">SM</div>
          </div>
        </div>
        <div className="w-full bg-white rounded-xl border border-[var(--border)] p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-20 sm:w-24 mb-2 sm:mb-3" />
          <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-3 sm:p-4 text-center mb-2 sm:mb-3">
            <div className="h-8 sm:h-10 bg-gray-100 rounded animate-pulse mx-auto mb-1.5 sm:mb-2" />
            <div className="h-3 sm:h-4 bg-gray-100 rounded animate-pulse w-32 sm:w-40 mx-auto mb-1.5 sm:mb-2" />
            <div className="h-7 sm:h-8 bg-gray-200 rounded animate-pulse w-24 sm:w-28 mx-auto" />
          </div>
          <div className="h-9 sm:h-10 bg-gray-200 rounded animate-pulse w-16 sm:w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl border border-[var(--border)] p-3 sm:p-4">
            <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-28 sm:w-32 mb-3 sm:mb-4" />
            <div className="h-9 sm:h-10 bg-gray-100 rounded animate-pulse mb-3 sm:mb-4" />
            <div className="space-y-1.5 sm:space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 sm:h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[var(--border)] p-4 sm:p-5">
            <div className="h-5 sm:h-6 bg-gray-200 rounded animate-pulse w-20 sm:w-24 mb-3 sm:mb-4" />
            <div className="rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center min-h-[150px] sm:min-h-[200px]">
              <span className="text-[var(--text-muted)] text-xs sm:text-sm">Loading...</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-4 py-6 sm:px-5 sm:py-7 lg:px-6 lg:py-8 lg:ml-60 lg:max-w-[calc(100vw-240px)]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-3xl font-bold text-[var(--primary)]">JD Library</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm font-semibold text-[var(--foreground)]">Sarah Mitchell</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs sm:text-sm cursor-pointer hover:ring-2 hover:ring-[var(--primary)] transition-all" title="Profile">SM</div>
        </div>
      </div>

      <div className="w-full bg-white rounded-xl border border-[var(--border)] p-3 sm:p-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2 sm:mb-3">Upload JD</h2>
        <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-3 sm:p-4 text-center mb-2 sm:mb-3">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-[var(--text-muted)] mb-1.5 sm:mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.9-7.95l.44-1.4A4 4 0 1115.44 6l1.4.44A4 4 0 0117 14h-1" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v9m-4-4l4 4 4-4" />
          </svg>
          <p className="text-[var(--text-secondary)] mb-1.5 sm:mb-2 text-xs sm:text-sm">Drop your JD files here or click to browse</p>
          <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="jd-upload" />
          <label htmlFor="jd-upload" className="inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[var(--primary)] text-white rounded-lg cursor-pointer hover:bg-[var(--primary)]/90 text-xs sm:text-sm">
            Choose Files
          </label>
        </div>
        {files.length > 0 && (
          <div className="mb-3">
            <p className="text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1">Selected files:</p>
            <ul className="text-2xs sm:text-xs text-[var(--text-secondary)]">
              {files.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={handleUpload} disabled={files.length === 0} className="text-xs sm:text-sm py-1 sm:py-1.5">
            Upload
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>JD Repository</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <Input
              placeholder="Search JDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-3 sm:mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <tbody>
                  {filteredJds.map((jd) => (
                    <React.Fragment key={jd.id}>
                      <tr>
                        <td>
                          <div className="flex items-center justify-between py-2.5 sm:py-3 px-3 sm:px-5 cursor-pointer"
                            onClick={() => handleSelectJd(jd.id)}>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className={`font-medium text-xs sm:text-sm ${jd.disabled ? "line-through text-[var(--text-muted)]" : ""}`}>{jd.name}</span>
                                <span className={`text-2xs sm:text-xs ${jd.disabled ? "line-through text-[var(--text-muted)]" : "text-[var(--text-secondary)] bg-[var(--primary-light)]"} px-1.5 sm:px-2 py-0.5 rounded`}>{jd.position}</span>
                                {!!jd.disabled && (
                                  <span className="text-2xs sm:text-xs text-[var(--text-muted)] bg-[var(--border)] px-1.5 sm:px-2 py-0.5 rounded">Disabled</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="relative" ref={(el) => { menuRefs.current[jd.id] = el; }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(activeMenuId === jd.id ? null : jd.id);
                                    }}
                                    className="p-1 sm:p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                    </svg>
                                  </button>
                                  {activeMenuId === jd.id && (
                                    <div className="absolute right-0 mt-1 w-28 sm:w-32 bg-white border border-[var(--border)] rounded-lg shadow-lg z-10">
                                      <button
                                        onClick={() => handleSelectJd(jd.id)}
                                        className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-left text-2xs sm:text-xs text-[var(--primary)] hover:bg-[var(--primary-light)]/30 rounded-lg cursor-pointer"
                                      >
                                        View JD
                                      </button>
                                      <button
                                        onClick={() => handleToggleDisabled(jd.id, !jd.disabled)}
                                        className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-left text-2xs sm:text-xs text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                                      >
                                        {jd.disabled ? "Enable JD" : "Disable JD"}
                                      </button>
                                      <button
                                        onClick={() => handleDelete(jd.id)}
                                        className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-left text-2xs sm:text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                      >
                                        Delete JD
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-xl border border-[var(--border)] p-3 sm:p-4 lg:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-3 sm:mb-4">JD Detail</h2>
          {expandedId ? (
            <div className="space-y-3 sm:space-y-4">
              {(() => {
                const jd = jdList.find((j) => j.id === expandedId);
                if (!jd) return null;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      <div className="bg-[var(--primary-light)]/20 border border-[var(--primary)] rounded-lg p-2 sm:p-2.5 text-center">
                        <p className="text-2xs sm:text-xs font-semibold text-[var(--text-secondary)] mb-0.5 sm:mb-1">Last Update</p>
                        <p className="text-2xs sm:text-xs font-bold text-[var(--primary)]">{jd.created_at}</p>
                      </div>
                      <div className="bg-[var(--primary-light)]/20 border border-[var(--primary)] rounded-lg p-2 sm:p-2.5 text-center">
                        <p className="text-2xs sm:text-xs font-semibold text-[var(--text-secondary)] mb-0.5 sm:mb-1">Last Editor</p>
                        <p className="text-2xs sm:text-xs font-bold text-[var(--primary)]">Admin User</p>
                      </div>
                      <div className="bg-[var(--primary-light)]/20 border border-[var(--primary)] rounded-lg p-2 sm:p-2.5 text-center">
                        <p className="text-2xs sm:text-xs font-semibold text-[var(--text-secondary)] mb-0.5 sm:mb-1">Version</p>
                        <p className="text-2xs sm:text-xs font-bold text-[var(--primary)]">v1.0</p>
                      </div>
                    </div>
                    {renderCriteria(jd, "exp", "Experience (max 5)", jd.experienceChecklist)}
                    {renderCriteria(jd, "edu", "Education (max 5)", jd.educationChecklist)}
                    {renderCriteria(jd, "lang", "Language (max 5)", jd.languageChecklist)}
                    {renderCriteria(jd, "tech", "Skill (max 5)", jd.technicalChecklist)}
                  </>
                );
              })()}
              <div className="flex justify-end">
                <Button onClick={() => console.log("Save criteria for", expandedId)} className="text-xs sm:text-sm">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center min-h-[150px] sm:min-h-[200px]">
              <span className="text-[var(--text-muted)] text-xs sm:text-sm">Select a JD to view details</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
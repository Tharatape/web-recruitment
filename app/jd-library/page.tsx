"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { jds, JD } from "@/data/mockData";

type CriterionCounts = Record<string, number>;

export default function JdLibraryPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [jdList, setJdList] = useState([...jds]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [criteria, setCriteria] = useState<Record<string, string>>({});
  const [counts, setCounts] = useState<CriterionCounts>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleDelete = (id: string) => {
    setJdList((prev) => prev.filter((jd) => jd.id !== id));
    if (expandedId === id) setExpandedId(null);
    setActiveMenuId(null);
  };

  const handleToggleDisabled = (id: string) => {
    setJdList((prev) =>
      prev.map((jd) => (jd.id === id ? { ...jd, disabled: !jd.disabled } : jd))
    );
    setActiveMenuId(null);
  };

  const handleEdit = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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
    const currentCount = counts[key] || 0;
    if (currentCount < 5) {
      setCounts((prev) => ({ ...prev, [key]: currentCount + 1 }));
    }
  };

  const removeCriterion = (jdId: string, category: string, index: number) => {
    const key = `${jdId}-${category}`;
    const currentCount = counts[key] || 0;
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
      <div className="px-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[var(--text-primary)]">{label}</label>
          <button
            onClick={() => addCriterion(jd.id, category)}
            disabled={count >= 5}
            className="px-2 py-1 text-xs font-medium text-[var(--primary)] bg-[var(--primary-light)] rounded hover:bg-[#bfdbfe] disabled:opacity-50 cursor-pointer"
          >
            + Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder={`${label.split(" ")[0]} criterion ${i + 1}`}
                value={criteria[`${jd.id}-${category}-${i}`] || initialValue[i] || ""}
                onChange={(e) => handleCriterionChange(jd.id, category, i, e.target.value)}
                className="text-xs flex-1"
              />
              <button
                onClick={() => removeCriterion(jd.id, category, i)}
                className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded cursor-pointer"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-[var(--primary)] mb-6">JD Library</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Upload JD</h2>
          <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center mb-4">
            <svg className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.9-7.95l.44-1.4A4 4 0 1115.44 6l1.4.44A4 4 0 0117 14h-1" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v9m-4-4l4 4 4-4" />
            </svg>
            <p className="text-[var(--text-secondary)] mb-2">Drop your JD files here or click to browse</p>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="jd-upload" />
            <label htmlFor="jd-upload" className="inline-block px-4 py-2 bg-[var(--primary)] text-white rounded-lg cursor-pointer hover:bg-[var(--primary)]/90">
              Choose Files
            </label>
          </div>
          {files.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Selected files:</p>
              <ul className="text-sm text-[var(--text-secondary)]">
                {files.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          <Button onClick={handleUpload} disabled={files.length === 0}>
            Upload
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">JD Detail</h2>
          <div className="h-64 rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center">
            <span className="text-[var(--text-muted)]">Select a JD to view details</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>JD Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search JDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {filteredJds.map((jd) => (
                    <React.Fragment key={jd.id}>
                      <tr>
                        <td>
                          <div className="flex items-center justify-between py-3 px-5">
                            <div className="flex items-center gap-3">
                              <span className={`font-medium text-sm ${jd.disabled ? "line-through text-[var(--text-muted)]" : ""}`}>{jd.name}</span>
                              <span className={`text-xs ${jd.disabled ? "line-through text-[var(--text-muted)]" : "text-[var(--text-secondary)] bg-[var(--primary-light)]"} px-2 py-0.5 rounded`}>{jd.position}</span>
                              {jd.disabled && (
                                <span className="text-xs text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded">Disabled</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(jd.id)}
                                className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors cursor-pointer"
                              >
                                <svg
                                  className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${
                                    expandedId === jd.id ? "rotate-180" : ""
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <div className="relative" ref={(el) => { menuRefs.current[jd.id] = el; }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(activeMenuId === jd.id ? null : jd.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-[#e2e8f0] transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                  </svg>
                                </button>
                                {activeMenuId === jd.id && (
                                  <div className="absolute right-0 mt-1 w-32 bg-white border border-[var(--border)] rounded-lg shadow-lg z-10">
                                    <button
                                      onClick={() => handleEdit(jd.id)}
                                      className="w-full px-3 py-2 text-left text-xs text-[var(--primary)] hover:bg-[var(--primary-light)]/30 rounded-lg cursor-pointer"
                                    >
                                      Edit JD
                                    </button>
                                    <button
                                      onClick={() => handleToggleDisabled(jd.id)}
                                      className="w-full px-3 py-2 text-left text-xs text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                                    >
                                      {jd.disabled ? "Enable JD" : "Disable JD"}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(jd.id)}
                                      className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
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
                      {expandedId === jd.id && (
                        <tr>
                          <td className="pt-4 pb-5 px-5">
                            <div className="pt-4 border-t border-[var(--border)] space-y-4">
                              {renderCriteria(jd, "exp", "Experience (max 5)", jd.experienceChecklist)}
                              {renderCriteria(jd, "edu", "Education (max 5)", jd.educationChecklist)}
                              {renderCriteria(jd, "lang", "Language (max 5)", jd.languageChecklist)}
                              {renderCriteria(jd, "tech", "Technical (max 5)", jd.technicalChecklist)}
                              <div className="flex justify-end">
                                <Button onClick={() => console.log("Save criteria for", jd.id)}>
                                  Save
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
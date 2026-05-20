"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { jds, JD } from "@/data/mockData";

interface AdvancedJDSearchProps {
  jd: JD | null;
  onChange: (jd: JD | null) => void;
}

export function AdvancedJDSearch({ jd, onChange }: AdvancedJDSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    const availableJds = jds.filter((jd) => !jd.disabled);
    if (!query) return availableJds;
    const q = query.toLowerCase();
    return availableJds.filter(
      (jd) =>
        jd.name.toLowerCase().includes(q) ||
        jd.position.toLowerCase().includes(q) ||
        jd.experienceChecklist?.some((c) => c.toLowerCase().includes(q)) ||
        jd.educationChecklist?.some((c) => c.toLowerCase().includes(q)) ||
        jd.languageChecklist?.some((c) => c.toLowerCase().includes(q)) ||
        jd.technicalChecklist?.some((c) => c.toLowerCase().includes(q))
    );
  }, [query]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (wrapperRef.current) {
      setDropdownWidth(wrapperRef.current.offsetWidth);
    }
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDropdownWidth(entry.contentRect.width);
      }
    });
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-1" ref={wrapperRef}>
      <label className="text-sm font-semibold text-[var(--foreground)] mb-1 block">
        Job Description (JD)
      </label>
      <div className="relative">
        <Input
          placeholder="Search JD by name, position, or criteria..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {jd && !jd.disabled && (
          <div className="mt-2 p-3 bg-[var(--primary-light)]/20 border border-[var(--primary)] rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-semibold text-sm text-[var(--foreground)]">{jd.name}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{jd.position}</p>
              </div>
              <button
                onClick={() => { onChange(null); setQuery(""); }}
                className="text-xs text-[var(--accent-red)] hover:underline cursor-pointer bg-transparent border-none"
              >
                Clear
              </button>
            </div>
          </div>
        )}
        {isOpen && query && filtered.length > 0 && (
          <div
            className="absolute left-0 mt-1 max-h-96 overflow-auto z-50 shadow-lg rounded-xl"
            style={{ width: dropdownWidth ? `${dropdownWidth}px` : undefined }}
          >
            <Card className="!p-0 max-h-96 overflow-auto">
              {filtered.map((jdItem) => (
                <div
                  key={jdItem.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--primary-light)]/20 transition-colors"
                >
                  <div
                    className="flex items-center px-4 py-3 cursor-pointer"
                    onClick={() => {
                      onChange(jdItem);
                      setQuery(jdItem.name);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[var(--foreground)]">{jdItem.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{jdItem.position}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
        {isOpen && query && filtered.length === 0 && (
          <div className="absolute left-0 mt-1 w-full z-50 shadow-lg rounded-xl">
            <Card className="!p-4">
              <p className="text-sm text-[var(--text-secondary)]">No JDs found matching &ldquo;{query}&rdquo;</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
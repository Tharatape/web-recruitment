"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  allowEmpty = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback(
    (val: string) => {
      onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
    },
    [value, onChange]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        className="w-full px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white text-left flex flex-wrap items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span className={selectedLabels ? "text-[var(--foreground)]" : "text-[var(--text-muted)]"}>
          {selectedLabels || placeholder}
        </span>
        <svg
          className={`ml-auto w-4 h-4 text-[var(--text-secondary)] transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 w-full bg-white border border-[var(--border)] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options
            .filter((o) => allowEmpty || o.value !== "")
            .map((option) => {
              const checked = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                    checked
                      ? "bg-[var(--primary-light)] text-[var(--primary)]"
                      : "text-[var(--foreground)] hover:bg-[#f8fafc]"
                  }`}
                  onClick={() => toggle(option.value)}
                >
                  <svg
                    className={`w-4 h-4 shrink-0 transition-all ${
                      checked
                        ? "opacity-100 text-[var(--primary)]"
                        : "opacity-0 text-[var(--primary)]"
                    }`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <span>{option.label}</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

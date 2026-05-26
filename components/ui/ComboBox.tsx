"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface ComboBoxProps {
  options: { label: string; value: string }[];
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  label?: string;
  disabled?: boolean;
}

export function ComboBox({
  options,
  placeholder = "Select...",
  value,
  onChange,
  label,
  disabled = false,
}: ComboBoxProps) {
const [query, setQuery] = useState("");
   const [isOpen, setIsOpen] = useState(false);
   const wrapperRef = useRef<HTMLDivElement>(null);
   const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);
   const querySetRef = useRef(false);

   const selectedLabel = useMemo(() => {
     const opt = options.find((o) => o.value === value);
     return opt?.label || "";
   }, [options, value]);

   const filtered = useMemo(() => {
     if (!query) return options;
     const q = query.toLowerCase();
     return options.filter((o) => o.label.toLowerCase().includes(q));
   }, [options, query]);

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

   useEffect(() => {
     if (value && !query && !querySetRef.current) {
       querySetRef.current = true;
       setQuery(selectedLabel);
     }
   }, [value, selectedLabel, query]);

  const handleSelect = (val: string, label: string) => {
    onChange(val);
    setQuery(label);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1" ref={wrapperRef}>
      {label && (
        <label className="text-sm font-semibold text-[var(--foreground)]">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          disabled={disabled}
        />
        {isOpen && (
          <div
            className="absolute left-0 mt-1 max-h-96 overflow-auto z-50 shadow-lg rounded-xl"
            style={{ width: dropdownWidth ? `${dropdownWidth}px` : undefined }}
          >
            <Card className="!p-0 max-h-96 overflow-auto">
              {filtered.length > 0 ? (
                filtered.map((opt) => (
                  <div
                    key={opt.value}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--primary-light)]/20 transition-colors cursor-pointer"
                    onMouseDown={() => handleSelect(opt.value, opt.label)}
                  >
                    <div className="flex items-center px-4 py-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-[var(--foreground)]">{opt.label}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3">
                  <p className="text-sm text-[var(--text-secondary)]">No options found</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
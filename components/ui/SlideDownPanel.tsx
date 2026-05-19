"use client";

import { useState } from "react";

interface SlideDownPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function SlideDownPanel({ children, className = "" }: SlideDownPanelProps) {
  return (
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${className}`}>
      {children}
    </div>
  );
}

export function SlideDownButton({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold bg-[var(--primary-light)] text-[var(--primary)] rounded-lg hover:bg-[#bfdbfe] transition-colors cursor-pointer"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}

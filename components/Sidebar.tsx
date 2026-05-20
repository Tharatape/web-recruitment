"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/matching", label: "Matching" },
  { href: "/jd-library", label: "JD Library" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile toggle

  const navContent = (
    <>
      <Link
        href="/dashboard"
        className="no-underline block px-5 py-3 text-xl font-bold text-white tracking-tight border-b border-white/10"
        onClick={() => setOpen(false)}
      >
        Recruit<span className="text-[#60a5fa]">AI</span>
      </Link>

      <nav className="flex flex-col gap-1 mt-4 px-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors no-underline ${
                active
                  ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
                  : "text-[var(--sidebar-text)] hover:bg-white/10"
              }`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto mx-3 mb-4">
        <p className="px-3 py-2 text-xs text-white/40">v1.0</p>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile hamburger ─────────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[var(--bg-sidebar)] text-white px-3 py-2 rounded-lg shadow-lg cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* ── Mobile overlay ──────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-60 bg-[var(--bg-sidebar)] shadow-xl flex flex-col border-r border-white/8
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {navContent}
      </aside>
    </>
  );
}

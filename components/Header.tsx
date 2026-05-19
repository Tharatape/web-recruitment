"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/matching", label: "Matching" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[var(--bg-sidebar)] shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-white tracking-tight no-underline">
          Recruit<span className="text-[#60a5fa]">AI</span>
        </Link>
        <nav className="flex items-center gap-1">
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
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

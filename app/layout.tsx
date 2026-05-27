import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { initializeDatabase, db } from '@/data/db';
import { seedReferenceData, seedCandidates, seedJDs, generateCandidates } from '@/data/db/seed';
import { getCandidateCount } from '@/data/repositories/candidateRepository';

// Auto-seed database on startup if empty
let seeded = false;
function seedDatabaseIfNeeded() {
  if (seeded) return;
  try {
    initializeDatabase();
    
    // Update existing candidates to have unique_id (for migrations)
    const candidatesWithoutUniqueId = db.prepare(
      "SELECT id FROM candidates WHERE unique_id IS NULL OR unique_id = ''"
    ).all() as { id: string }[];
    
    if (candidatesWithoutUniqueId.length > 0) {
      const maxUniqueId = db.prepare(
        "SELECT MAX(CAST(unique_id AS INTEGER)) as maxId FROM candidates WHERE unique_id IS NOT NULL AND unique_id != ''"
      ).get() as { maxId: number | null };
      const startId = (maxUniqueId.maxId || 0) + 1;
      
      for (let i = 0; i < candidatesWithoutUniqueId.length; i++) {
        const candidate = candidatesWithoutUniqueId[i];
        db.prepare('UPDATE candidates SET unique_id = ? WHERE id = ?')
          .run(String(startId + i).padStart(5, '0'), candidate.id);
      }
    }
    
    const candidateCount = getCandidateCount();
    
    // If database already has candidate data, don't re-seed
    if (candidateCount > 0) {
      seeded = true;
      return;
    }
    
    seedReferenceData();
    seedCandidates(generateCandidates());
    seedJDs();
  } catch (error) {
    console.error('Database seeding error:', error);
  }
  seeded = true;
}

seedDatabaseIfNeeded();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecruitAI — Applicant Tracking System",
  description: "AI-powered applicant tracking and matching dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[var(--background)]">
        {/* ── Sidebar ─────────────────────────────────── */}
        <Sidebar />

        {/* ── Main content ────────────────────────────── */}
        <main className="lg:ml-60">{children}</main>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { initializeDatabase, db } from '@/data/db';
import { seedReferenceData, seedCandidates, seedJDs, generateCandidates } from '@/data/db/seed';
import { getCandidateCount } from '@/data/repositories/candidateRepository';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// File-based lock for seeding to prevent race conditions during concurrent builds
let seedingLockAcquired = false;
function acquireSeedLock(): boolean {
  if (seedingLockAcquired) return false;
  const lockPath = process.env.NODE_ENV === 'production'
    ? '/tmp/mockup-seed.lock'
    : join(process.cwd(), 'data', 'db', 'seed.lock');
  try {
    if (existsSync(lockPath)) return false;
    writeFileSync(lockPath, Date.now().toString());
    seedingLockAcquired = true;
    return true;
  } catch {
    return false;
  }
}

function releaseSeedLock() {
  const lockPath = process.env.NODE_ENV === 'production'
    ? '/tmp/mockup-seed.lock'
    : join(process.cwd(), 'data', 'db', 'seed.lock');
  if (seedingLockAcquired && existsSync(lockPath)) {
    try { unlinkSync(lockPath); } catch {}
    seedingLockAcquired = false;
  }
}

// Auto-seed database on startup if empty
let seeded = false;
function seedDatabaseIfNeeded() {
  if (seeded || !acquireSeedLock()) return;
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
      releaseSeedLock();
      return;
    }
    
    seedReferenceData();
    seedCandidates(generateCandidates());
    seedJDs();
  } catch (error) {
    console.error('Database seeding error:', error);
  }
  seeded = true;
  releaseSeedLock();
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
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
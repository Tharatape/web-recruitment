import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { initializeDatabase } from "@/data/db";

initializeDatabase();

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

"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-[var(--card-bg)] rounded-xl border border-[var(--border)] shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 py-4 border-b border-[var(--border)] ${className || ""}`}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-base font-bold text-[var(--foreground)] ${className || ""}`}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-5 ${className || ""}`}>{children}</div>;
}

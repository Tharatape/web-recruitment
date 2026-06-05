"use client";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <>
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="text-left py-2 px-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-[var(--border)] last:border-0">
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="py-3 px-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full max-w-32" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="bg-white rounded-lg border border-[var(--border)] p-4 space-y-2.5">
            {Array.from({ length: 6 }).map((_, colIdx) => (
              <div key={colIdx} className="flex justify-between items-start">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className = "" }: CardSkeletonProps) {
  return (
    <div className={`bg-white rounded-xl border border-[var(--border)] p-5 ${className}`}>
      <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

interface ChartSkeletonProps {
  height?: number;
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <div
      className="w-full bg-gray-100 rounded animate-pulse"
      style={{ height }}
    />
  );
}

interface StatsCardSkeletonProps {
  count?: number;
}

export function StatsCardSkeleton({ count = 4 }: StatsCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[var(--border)] p-5">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      ))}
    </div>
  );
}
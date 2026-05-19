"use client";

import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

export function Table<T>({ columns, data, onRowClick, rowClassName }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
        No data found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f8fafc] border-b border-[var(--border)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-[var(--border)] last:border-b-0 hover:bg-[#f8fafc] transition-colors ${
                onRowClick ? "cursor-pointer" : ""
              } ${rowClassName?.(row) || ""}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

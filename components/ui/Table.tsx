"use client";

import type { ReactNode } from "react";
import { Fragment } from "react";

interface Column<T> {
  key: string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  keyExtractor?: (row: T, idx: number) => string | number;
  renderExpanded?: (row: T) => ReactNode;
  expandedId?: string | number | null;
}

export function Table<T>({
  columns,
  data,
  onRowClick,
  rowClassName,
  keyExtractor,
  renderExpanded,
  expandedId,
}: TableProps<T>) {
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
          {data.map((row, idx) => {
            const key = keyExtractor ? keyExtractor(row, idx) : idx;
            const isExpanded = expandedId != null && String(expandedId) === String(key);

            return (
              <Fragment key={key}>
                <tr
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-[var(--border)] hover:bg-[#f8fafc] transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${isExpanded ? "bg-[var(--primary-light)]" : rowClassName?.(row) || ""}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                      {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key]?.toString()}
                    </td>
                  ))}
                </tr>
                {isExpanded && renderExpanded && (
                  <tr>
                    <td colSpan={columns.length} className="p-0 border-b border-[var(--border)]">
                      {renderExpanded(row)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

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
  mobileTitleKey?: string;
}

export function Table<T>({
  columns,
  data,
  onRowClick,
  rowClassName,
  keyExtractor,
  renderExpanded,
  expandedId,
  mobileTitleKey,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
        No data found.
      </div>
    );
  }

  const getRowValue = (row: T, key: string): ReactNode => {
    const col = columns.find((c) => c.key === key);
    if (col?.render) return col.render(row);
    return (row as Record<string, unknown>)[key]?.toString() ?? "";
  };

  const mobileTitleColumn = columns.find((c) => c.key === mobileTitleKey);
  const mobileSubtitleColumns = columns.filter((c) => c.key !== mobileTitleKey);

  return (
    <>
      <div className="overflow-x-auto hidden sm:block table-container">
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

      <div className="sm:hidden space-y-3">
        {data.map((row, idx) => {
          const key = keyExtractor ? keyExtractor(row, idx) : idx;
          const titleValue = mobileTitleKey ? getRowValue(row, mobileTitleKey) : null;

          return (
            <div
              key={key}
              className="bg-white rounded-lg border border-[var(--border)] p-4 space-y-2.5"
            >
              {mobileTitleKey && (
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">
                    {mobileTitleColumn?.header || mobileTitleKey}
                  </span>
                  <span className="text-sm text-[var(--foreground)] font-medium">
                    {String(titleValue)}
                  </span>
                </div>
              )}
              {mobileSubtitleColumns.map((col) => (
                <div key={`mobile-${col.key}`} className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">
                    {col.header}
                  </span>
                  <span className="text-sm text-[var(--foreground)] font-medium max-w-[60%] text-right">
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key]?.toString() ?? "-"}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

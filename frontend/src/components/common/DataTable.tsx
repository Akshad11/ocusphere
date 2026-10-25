import React from 'react';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

export interface Column<T> {
  header: string;
  accessor?: keyof T | string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items to display matching your criteria.',
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const rows = Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : [];

  if (isLoading) {
    return <LoadingState message="Loading records..." />;
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyMessage} />;
  }

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'right') return 'text-right justify-end';
    if (align === 'center') return 'text-center justify-center';
    return 'text-left justify-start';
  };

  return (
    <div className={`w-full overflow-x-auto border border-neutral-200 rounded-lg bg-white ${className}`}>
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50/75 text-xs font-semibold text-neutral-600">
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{ width: col.width }}
                className={`px-4 py-3 whitespace-nowrap ${getAlignClass(col.align)} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 text-neutral-800">
          {rows.map((row, rIdx) => (
            <tr
              key={keyExtractor(row, rIdx)}
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-neutral-50/80 active:bg-neutral-100' : 'hover:bg-neutral-50/40'
              }`}
            >
              {columns.map((col, cIdx) => {
                let cellContent: React.ReactNode = null;
                if (col.render) {
                  cellContent = col.render(row, rIdx);
                } else if (col.accessor) {
                  const val = (row as any)[col.accessor];
                  cellContent = val !== undefined && val !== null ? String(val) : '—';
                }

                return (
                  <td
                    key={cIdx}
                    className={`px-4 py-3 text-xs md:text-sm whitespace-nowrap ${getAlignClass(col.align)} ${
                      col.className || ''
                    }`}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

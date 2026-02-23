import React from 'react';

/**
 * SkeletonTable — Loading skeleton for table data
 *
 * Shows a subtle pulsing animation while table data is loading.
 */

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export default function SkeletonTable({
  rows = 8,
  columns = 7,
}: SkeletonTableProps) {
  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg">
      <table className="w-full">
        <thead className="bg-card border-b border-border">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="px-6 py-4">
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

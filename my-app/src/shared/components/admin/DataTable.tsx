import React from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  /** Tailwind width / align utilities */
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  /** Empty state label */
  emptyLabel?: string;
  /** Render-prop để bọc row trong link (vd Next Link) */
  rowWrapper?: (row: T, children: React.ReactNode) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyLabel = 'Không có dữ liệu',
  rowWrapper,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="border border-border rounded-lg bg-surface p-12 text-center text-text-muted text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-surface overflow-hidden">
      <table className="w-full text-[13px]">
        <thead className="bg-neutral-50 border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'text-left font-semibold text-neutral-700 px-4 py-3 text-[12px] uppercase tracking-wider',
                  col.className ?? '',
                ].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const cells = columns.map((col) => (
              <td
                key={col.key}
                className={['px-4 py-3 align-middle', col.className ?? ''].join(' ')}
              >
                {col.render(row)}
              </td>
            ));
            const tr = (
              <tr
                key={getRowKey(row)}
                className="border-b border-border last:border-b-0 hover:bg-neutral-50 transition-colors"
              >
                {cells}
              </tr>
            );
            return rowWrapper ? (
              <React.Fragment key={getRowKey(row)}>
                {rowWrapper(row, tr)}
              </React.Fragment>
            ) : (
              tr
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

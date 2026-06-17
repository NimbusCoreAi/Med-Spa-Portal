import React from 'react';

export interface TableColumn<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  key: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export function Table<T>({ columns, rows, rowKey, emptyMessage = 'No data' }: TableProps<T>) {
  if (rows.length === 0) {
    return <p className="text-gray-500 text-sm py-4">{emptyMessage}</p>;
  }

  return (
    <table className="w-full border-collapse text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          {columns.map((col) => (
            <th key={col.key} className="px-3 py-2 font-semibold text-gray-700">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} className="border-b border-gray-100">
            {columns.map((col) => (
              <td key={col.key} className="px-3 py-2">
                {col.accessor(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

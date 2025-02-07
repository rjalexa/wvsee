import React, { useState } from 'react';

export type ColumnDef = {
  key: string;
  label: string;
  dataType?: string[];
  render?: (value: unknown) => React.ReactNode;
};

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

type TableData = Record<string, unknown>;

type DynamicTableProps = {
  columns: ColumnDef[];
  data: TableData[];
  loading?: boolean;
  error?: string;
  onSort?: (columnKey: string) => void;
  sortConfig?: {
    key: string;
    direction: 'asc' | 'desc';
  } | null;
};

export const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  loading = false,
  error,
  onSort,
  sortConfig
}) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const getSortIcon = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.dataType?.includes('date')) {
      return null;
    }

    if (sortConfig?.key !== columnKey) {
      return <span className="ml-1 text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="ml-1">↑</span> : 
      <span className="ml-1">↓</span>;
  };

  const renderCell = (row: TableData, column: ColumnDef) => {
    const value = row[column.key];
    if (column.render) {
      return column.render(value);
    }
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider group relative ${
                  column.dataType?.includes('date') ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                title={column.dataType ? column.dataType.join(', ') : 'unknown'}
                onClick={() => onSort?.(column.key)}
              >
                <div className="flex items-center">
                  {column.label}
                  {getSortIcon(column.key)}
                </div>
                <span className="invisible group-hover:visible absolute -bottom-6 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                  Type: {column.dataType ? column.dataType[0] : 'unknown'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {renderCell(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

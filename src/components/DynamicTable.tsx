import React from 'react';

export type ColumnDef = {
  key: string;
  label: string;
  dataType?: string[];
  render?: (value: unknown) => React.ReactNode;
};

type TableData = Record<string, unknown> & {
  _additional?: {
    id: string;
  };
};

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
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (id: string) => void;
};

export const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  loading = false,
  error,
  onSort,
  sortConfig,
  selectionMode = false,
  selectedIds = new Set(),
  onSelect
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
            {selectionMode && (
              <th scope="col" className="relative px-6 py-3 w-0">
                <span className="sr-only">Select</span>
              </th>
            )}
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
            <tr key={row._additional?.id || rowIndex} className="hover:bg-gray-50">
              {selectionMode && (
                <td className="relative w-0 px-6 py-4">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={row._additional?.id ? selectedIds.has(row._additional.id) : false}
                    onChange={() => row._additional?.id && onSelect?.(row._additional.id)}
                  />
                </td>
              )}
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

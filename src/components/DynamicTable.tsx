import React from 'react';

export type ColumnDef = {
  key: string;
  label: string;
  dataType?: string[];
  render?: (value: unknown) => React.ReactNode;
};

type TableData = Record<string, unknown>;

type DynamicTableProps = {
  columns: ColumnDef[];
  data: TableData[];
  loading?: boolean;
  error?: string;
};

export const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  loading = false,
  error
}) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider group relative"
                title={column.dataType ? column.dataType.join(', ') : 'unknown'}
              >
                {column.label}
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

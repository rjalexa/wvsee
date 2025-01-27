import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Copertine } from '@/lib/weaviate';

const columnHelper = createColumnHelper<Copertine>();

const columns = [
  columnHelper.accessor('testataName', {
    header: 'Testata Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('editionId', {
    header: 'Edition ID',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('editionDateIsoStr', {
    header: 'Date',
    cell: info => {
      const date = new Date(info.getValue());
      return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    },
  }),
  columnHelper.accessor('captionStr', {
    header: 'Caption',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('kickerStr', {
    header: 'Kicker',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('captionAIStr', {
    header: 'AI Caption',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('imageAIDeStr', {
    header: 'AI Description',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('modelAIName', {
    header: 'AI Model',
    cell: info => info.getValue(),
  }),
];

interface CopertineTableProps {
  data: Copertine[];
  currentSort: { field: keyof Copertine; order: 'asc' | 'desc' };
  onSort: (field: keyof Copertine, order: 'asc' | 'desc') => void;
}

export function CopertineTable({ data, currentSort, onSort }: CopertineTableProps) {
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: [{ id: currentSort.field, desc: currentSort.order === 'desc' }],
    },
    onSortingChange: updater => {
      const newSorting = (typeof updater === 'function' 
        ? updater([{ id: currentSort.field, desc: currentSort.order === 'desc' }]) 
        : updater) as SortingState;
      
      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        onSort(id as keyof Copertine, desc ? 'desc' : 'asc');
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableMultiSort: false,
    enableSortingRemoval: false,
    sortDescFirst: true,
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === 'asc' && '↑'}
                    {header.column.getIsSorted() === 'desc' && '↓'}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DataTable } from '@/components/DataTable';
import { CollectionData } from '@/lib/types';
import { DeleteObjectsModal } from '@/components/DeleteObjectsModal';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CollectionViewProps {
  collectionName: string;
  properties: Array<{
    name: string;
    dataType: string[];
    description?: string;
  }>;
}

export function CollectionView({ collectionName, properties }: CollectionViewProps) {
  const [data, setData] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ property: string; order: 'asc' | 'desc' } | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const OBJECTS_PER_PAGE = 250;

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = useCallback(async (loadMore = false) => {
    if (!loadMore) {
      setLoading(true);
      setData([]);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentOffset = loadMore ? offset : 0;
      const url = new URL(`/api/collection/${collectionName}`, window.location.origin);
      if (sortConfig) {
        url.searchParams.set('sortProperty', sortConfig.property);
        url.searchParams.set('sortOrder', sortConfig.order);
      }
      url.searchParams.set('limit', String(OBJECTS_PER_PAGE));
      url.searchParams.set('offset', String(currentOffset));

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to fetch data');
      }

      const newData = result.data || [];

      setData(prevData => loadMore ? [...prevData, ...newData] : newData);
      setOffset(currentOffset + newData.length);
      setCanLoadMore(newData.length === OBJECTS_PER_PAGE);
      setError(null);
    } catch (err) {
      console.error('Error in CollectionView:', {
        collectionName,
        error: err instanceof Error ? {
          name: err.name,
          message: err.message,
          cause: err.cause,
          stack: err.stack
        } : err
      });
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [collectionName, sortConfig, offset]);

  useEffect(() => {
    fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, sortConfig]);

  const handleLoadMore = () => {
    fetchData(true);
  };

  const handleDeleteClick = () => {
    if (Object.keys(rowSelection).length > 0) {
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collection/${collectionName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          objectIds: Object.keys(rowSelection)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to delete objects');
      }
      
      toast({
        title: "Objects deleted",
        description: `Successfully deleted ${Object.keys(rowSelection).length} objects.`,
      });

      setDeleteModalOpen(false);
      setRowSelection({});
      await fetchData();
    } catch (err) {
      console.error('Error deleting objects:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete objects');
      toast({
        title: "Error",
        description: "Failed to delete objects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (columnKey: string) => {
    setSortConfig(current => {
      if (current?.property === columnKey) {
        if (current.order === 'desc') {
          return { property: columnKey, order: 'asc' };
        }
        return null;
      }
      return { property: columnKey, order: 'desc' };
    });
  };

  const columns: ColumnDef<CollectionData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    ...properties.map((prop): ColumnDef<CollectionData> => ({
      accessorKey: prop.name,
      header: () => {
        return (
          <Button
            variant="ghost"
            onClick={() => handleSort(prop.name)}
            className={prop.dataType.includes('date') ? "" : "cursor-default hover:bg-transparent"}
          >
            {prop.name}
            {prop.dataType.includes('date') && <ArrowUpDown className="ml-2 h-4 w-4" />}
          </Button>
        )
      },
      cell: ({ row }) => {
        const value = row.getValue(prop.name);
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return String(value ?? '');
      },
    }))
  ];

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (loading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {Object.keys(rowSelection).length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({Object.keys(rowSelection).length})
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={scrollToBottom}>
            Bottom
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />

      {canLoadMore && (
        <div ref={bottomRef} className="mt-4 flex justify-center items-center gap-4">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
          <Button variant="outline" onClick={scrollToTop}>
            Top
          </Button>
        </div>
      )}

      <DeleteObjectsModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleDeleteConfirm}
        selectedCount={Object.keys(rowSelection).length}
      />
    </div>
  );
}

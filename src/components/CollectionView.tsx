'use client';

import { useState, useEffect } from 'react';
import { DynamicTable, ColumnDef } from '@/components/DynamicTable';
import { CollectionData } from '@/lib/weaviate';

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
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ property: string; order: 'asc' | 'desc' } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = new URL(`/api/collection/${collectionName}`, window.location.origin);
      if (sortConfig) {
        url.searchParams.set('sortProperty', sortConfig.property);
        url.searchParams.set('sortOrder', sortConfig.order);
      }
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to fetch data');
      }
      
      setData(result.data);
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
    }
  };

  useEffect(() => {
    fetchData();
  }, [collectionName, sortConfig]); // Re-fetch when sort changes

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const columns: ColumnDef[] = properties.map((prop) => ({
    key: prop.name,
    label: prop.name,
    dataType: prop.dataType,
    render: (value: unknown) => {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    },
  }));

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.dataType?.includes('date')) return;

    setSortConfig(current => {
      if (current?.property === columnKey) {
        if (current.order === 'asc') {
          return { property: columnKey, order: 'desc' };
        }
        return null;
      }
      return { property: columnKey, order: 'asc' };
    });
  };

  return (
    <DynamicTable 
      data={data} 
      columns={columns} 
      onSort={handleSort}
      sortConfig={sortConfig ? { 
        key: sortConfig.property, 
        direction: sortConfig.order 
      } : null}
    />
  );
}

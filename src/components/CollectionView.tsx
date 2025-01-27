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
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/collection/${collectionName}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const result = await response.json();
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [collectionName]);

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
    render: (value: unknown) => {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    },
  }));

  return <DynamicTable data={data} columns={columns} />;
}

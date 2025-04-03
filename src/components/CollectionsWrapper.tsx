'use client';

import { useState, useEffect } from 'react';
import { CollectionsList } from './CollectionsList';
import { CollectionInfo, getConnectionId } from '@/lib/weaviate';
import { useRouter } from 'next/navigation';

interface CollectionsWrapperProps {
  initialCollections: CollectionInfo[];
}

export function CollectionsWrapper({ initialCollections }: CollectionsWrapperProps) {
  const [collections, setCollections] = useState<CollectionInfo[]>(initialCollections);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastConnectionId, setLastConnectionId] = useState<string>(getConnectionId());
  const router = useRouter();
  
  // Check if the connection has changed and refresh if needed
  useEffect(() => {
    // This effect will run on mount and whenever the component re-renders
    // We need to check the current connection ID each time
    const checkConnectionChange = async () => {
      const currentConnectionId = getConnectionId();
      if (currentConnectionId && currentConnectionId !== lastConnectionId) {
        console.log('Connection changed, refreshing collections');
        setLastConnectionId(currentConnectionId);
        // Force a refresh with cache busting to ensure we get fresh data
        await refreshCollections(true);
      }
    };
    
    checkConnectionChange();
  }, [lastConnectionId]); // Re-run when lastConnectionId changes

  const refreshCollections = async (forceRefresh = false) => {
    try {
      setLoading(true);
      // Add a cache-busting parameter to force a fresh request
      const url = forceRefresh 
        ? `/api/collections?t=${Date.now()}&connection=${getConnectionId()}`
        : '/api/collections';
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to fetch collections');
      }

      setCollections(result.collections);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch collections');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = async () => {
    await refreshCollections();
    router.refresh(); // This will trigger a server-side revalidation
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4" role="alert">
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

  return <CollectionsList collections={collections} onDeleteSuccess={handleDeleteSuccess} />;
}

import { CollectionInfo } from '@/lib/types';
import Link from 'next/link';
import { useState } from 'react';
import { DeleteModal } from './DeleteModal';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Trash2, Database, Plus } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

type SortMethod = 'name' | 'count';
type SortDirection = 'asc' | 'desc';

interface CollectionsListProps {
  collections: CollectionInfo[];
  onDeleteSuccess: () => Promise<void>;
}

export function CollectionsList({ collections, onDeleteSuccess }: CollectionsListProps) {
  const [sortMethod, setSortMethod] = useState<SortMethod>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const { toast } = useToast();

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const toggleSort = (method: SortMethod) => {
    if (method === sortMethod) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMethod(method);
      setSortDirection('asc');
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (collectionName: string) => {
      const response = await fetch(`/api/collection/${collectionName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteCollection: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to delete collection');
      }
    },
    onSuccess: async () => {
      toast({
        title: "Collection deleted",
        description: "The collection has been successfully deleted.",
      });
      setDeleteModalOpen(false);
      await onDeleteSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete collection",
        variant: "destructive",
      });
    }
  });

  const createTestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create-test' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to create test collection');
      }

      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Collection created",
        description: "Test collection has been created with 3 sample objects.",
      });
      await onDeleteSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test collection",
        variant: "destructive",
      });
    }
  });

  const handleDeleteClick = (collectionName: string) => {
    setSelectedCollection(collectionName);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCollection) return;
    deleteMutation.mutate(selectedCollection);
  };

  const sortedCollections = [...collections].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (sortMethod === 'name') {
      return multiplier * a.name.localeCompare(b.name);
    } else {
      return multiplier * (b.count - a.count);
    }
  });

  const getBadgeVariant = (dataType?: string[]) => {
    const type = dataType?.[0];
    if (type === 'text') return 'default';
    if (type === 'int' || type === 'number') return 'secondary';
    if (type === 'date') return 'outline';
    if (type === 'blob') return 'destructive';
    return 'outline';
  };

  return (
    <div>
      {collections.length === 0 ? (
        <Card className="p-8 text-center">
          <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Collections Found</h3>
          <p className="text-muted-foreground mb-4">
            This Weaviate instance doesn&apos;t have any collections yet.
          </p>
          <Button
            onClick={() => createTestMutation.mutate()}
            disabled={createTestMutation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            {createTestMutation.isPending ? 'Creating...' : 'Create Test Collection'}
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex justify-between mb-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => createTestMutation.mutate()}
              disabled={createTestMutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              {createTestMutation.isPending ? 'Creating...' : 'Create Test Collection'}
            </Button>
            <div className="flex gap-2">
              <Button
                variant={sortMethod === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('name')}
              >
                Name
                {sortMethod === 'name' && (
                  sortDirection === 'asc' ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUp className="ml-2 h-4 w-4" />
                )}
              </Button>
              <Button
                variant={sortMethod === 'count' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('count')}
              >
                Objects
                {sortMethod === 'count' && (
                  sortDirection === 'asc' ? <ArrowDown className="ml-2 h-4 w-4" /> : <ArrowUp className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedCollections.map((collection) => (
          <Card key={collection.name} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{collection.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {collection.description || "No description"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Database className="mr-2 h-4 w-4" />
                {formatNumber(collection.count)} {collection.count === 1 ? 'object' : 'objects'}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Properties:</h4>
                <div className="flex flex-wrap gap-2">
                  {collection.properties.map((prop) => (
                    <Badge 
                      key={prop.name} 
                      variant={getBadgeVariant(prop.dataType)}
                      title={`${prop.description ? `${prop.description}\n` : ''}Type: ${prop.dataType ? prop.dataType.join(', ') : 'unknown'}`}
                      className="cursor-help"
                    >
                      {prop.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t">
              <Button asChild variant="default" size="sm">
                <Link href={`/collection/${collection.name}`}>
                  View Objects
                </Link>
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteClick(collection.name)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
          </div>
        </>
      )}

      {selectedCollection && (
        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDelete={handleDeleteConfirm}
          collectionName={selectedCollection}
        />
      )}
    </div>
  );
}

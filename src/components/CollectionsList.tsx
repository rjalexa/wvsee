import { CollectionInfo } from '@/lib/weaviate';
import Link from 'next/link';
import { useState } from 'react';

type SortMethod = 'name' | 'count';
type SortDirection = 'asc' | 'desc';

interface CollectionsListProps {
  collections: CollectionInfo[];
}

export function CollectionsList({ collections }: CollectionsListProps) {
  const [sortMethod, setSortMethod] = useState<SortMethod>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  const sortedCollections = [...collections].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    if (sortMethod === 'name') {
      return multiplier * a.name.localeCompare(b.name);
    } else {
      return multiplier * (b.count - a.count);
    }
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => toggleSort('name')}
            className={`px-4 py-2 text-sm font-medium border rounded-l-lg ${
              sortMethod === 'name'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Name {sortMethod === 'name' && (
              <span className="ml-1">
                {sortDirection === 'asc' ? '↓' : '↑'}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => toggleSort('count')}
            className={`px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-lg ${
              sortMethod === 'count'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            Objects {sortMethod === 'count' && (
              <span className="ml-1">
                {sortDirection === 'asc' ? '↓' : '↑'}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="grid gap-6">
        {sortedCollections.map((collection) => (
        <div
          key={collection.name}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {collection.name}
              </h2>
              {collection.description && (
                <p className="text-gray-600 mt-1">{collection.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {formatNumber(collection.count)} {collection.count === 1 ? 'object' : 'objects'}
              </p>
            </div>
            <Link
              href={`/collection/${collection.name}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View
            </Link>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900">Properties:</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {collection.properties.map((prop: { name: string; description?: string; dataType?: string[] }) => (
                <span
                  key={prop.name}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium hover:cursor-help ${
                    prop.dataType && prop.dataType[0] === 'text' ? 'bg-green-100 text-green-800' :
                    prop.dataType && prop.dataType[0] === 'int' ? 'bg-yellow-100 text-yellow-800' :
                    prop.dataType && prop.dataType[0] === 'date' ? 'bg-blue-100 text-blue-800' :
                    prop.dataType && prop.dataType[0] === 'blob' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                  title={`${prop.description ? `${prop.description}\n` : ''}Type: ${prop.dataType ? prop.dataType.join(', ') : 'unknown'}`}
                >
                  {prop.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

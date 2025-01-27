import { Suspense } from 'react';
import Link from 'next/link';
import { CollectionView } from '../../../components/CollectionView';
import { getCollections } from '@/lib/weaviate';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Collection View',
  description: 'View collection details and items',
};

interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function Page(props: PageProps) {
  const { name } = await props.params;
  try {
    const collections = await getCollections();
    const collectionInfo = collections.find(c => c.name === name);
    
    if (!collectionInfo) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <p>Collection not found: {name}</p>
          </div>
        </div>
      );
    }

    const formattedProperties = collectionInfo.properties.map(prop => ({
      name: prop.name,
      dataType: ['string'],
      description: undefined
    }));

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-4">
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back to Collections
            </Link>
          </div>
          <h1 className="text-3xl font-bold">
            {collectionInfo.name}
            <span className="text-gray-500 font-normal ml-2">
              ({collectionInfo.count} {collectionInfo.count === 1 ? 'object' : 'objects'})
            </span>
          </h1>
          {collectionInfo.description && (
            <p className="text-gray-600 mt-2">{collectionInfo.description}</p>
          )}
        </div>
        
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        }>
          <CollectionView 
            collectionName={name}
            properties={formattedProperties}
          />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error('Error loading collection:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p>Failed to load collection data. Please try again later.</p>
        </div>
      </div>
    );
  }
}

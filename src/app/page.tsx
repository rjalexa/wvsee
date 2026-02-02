import { getCollections } from '@/lib/weaviate';
import { getWeaviateUrl } from '@/lib/connection';
import { CollectionsWrapper } from '@/components/CollectionsWrapper';
import { WeaviateConnector } from '@/components/WeaviateConnector';
import { Suspense } from 'react';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getInitialCollections() {
  try {
    console.log('Page - Fetching initial collections');
    const collections = await getCollections();
    console.log(`Page - Successfully fetched ${collections.length} collections`);
    return collections;
  } catch (error) {
    console.error('Page - Error fetching initial collections:', error);
    return [];
  }
}

export default async function Home() {
  const weaviateUrl = getWeaviateUrl();
  const collections = await getInitialCollections().catch(() => []);
  
  return (
    <main className="py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Weaviate collections
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Connected to: {weaviateUrl}
          </p>
        </div>
        
        <WeaviateConnector initialUrl={weaviateUrl} />
        
        <Suspense>
          <CollectionsWrapper initialCollections={collections} />
        </Suspense>
      </div>
    </main>
  );
}

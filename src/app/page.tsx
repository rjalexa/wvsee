import { getCollections, getWeaviateUrl } from '@/lib/weaviate';
import { CollectionsWrapper } from '@/components/CollectionsWrapper';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getInitialCollections() {
  const collections = await getCollections();
  return collections;
}

export default async function Home() {
  return (
    <main className="py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Weaviate collections
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Connected to: {getWeaviateUrl()}
          </p>
        </div>
        
        <Suspense>
          <CollectionsWrapper initialCollections={await getInitialCollections()} />
        </Suspense>
      </div>
    </main>
  );
}

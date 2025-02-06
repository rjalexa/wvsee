import { getCollections } from '@/lib/weaviate';
import { CollectionsWrapper } from '@/components/CollectionsWrapper';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const collections = await getCollections();

  return (
    <main className="py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
        Weaviate collections
        </h1>
        
        <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      }>
        <CollectionsWrapper initialCollections={collections} />
        </Suspense>
      </div>
    </main>
  );
}

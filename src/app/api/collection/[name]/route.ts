// File: src/app/api/collection/[name]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollections, getCollectionData } from '@/lib/weaviate';

export type Copertine = {
 [key: string]: unknown;
};

export async function GET(
 request: NextRequest,
) {
 try {
   const name = request.url.split('/').pop();
   if (!name) {
     return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
   }

   const collections = await getCollections();
   const collectionInfo = collections.find((c) => c.name === name);

   if (!collectionInfo) {
     return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
   }

   const data = await getCollectionData(
     name,
     collectionInfo.properties.map((prop) => ({
       name: prop.name,
       dataType: 'string'
     }))
   );

   return NextResponse.json({ data });
 } catch (error) {
   console.error('Error fetching collection data:', error);
   return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
 }
}

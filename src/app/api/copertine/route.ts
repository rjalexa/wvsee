// File: src/app/api/copertine/route.ts
import { NextResponse } from 'next/server';
import { getCollectionData } from '@/lib/weaviate';

export type Copertine = {
 [key: string]: unknown;
};

export async function GET() {
 try {
   const data = await getCollectionData('Copertine', 
     ['title', 'author', 'year', 'publisher'].map(prop => ({
       name: prop,
       dataType: 'string'
     }))
   );
   
   return NextResponse.json({ data });
 } catch (error) {
   console.error('Error fetching Copertine data:', error);
   return NextResponse.json(
     { error: 'Failed to fetch data' },
     { status: 500 }
   );
 }
}
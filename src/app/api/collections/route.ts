import { NextResponse } from 'next/server';
import { getCollections } from '@/lib/weaviate';

export async function GET() {
  try {
    console.log('API Route - Fetching collections list');
    const collections = await getCollections();
    console.log('API Route - Successfully fetched collections');
    return NextResponse.json({ collections });
  } catch (error) {
    console.error('API Route - Error fetching collections:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      } : error,
      env: {
        weaviateUrl: process.env.WEAVIATE_URL
      }
    });
    return NextResponse.json({ 
      error: 'Failed to fetch collections',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

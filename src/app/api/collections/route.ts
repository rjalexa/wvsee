import { NextResponse } from 'next/server';
import { getCollections, getConnectionId } from '@/lib/weaviate';

export async function GET(request: Request) {
  // Add a cache-busting parameter based on the connection ID and current time
  const url = new URL(request.url);
  const connectionId = getConnectionId();
  
  // Always add a timestamp to prevent caching
  url.searchParams.set('t', Date.now().toString());
  
  if (connectionId) {
    url.searchParams.set('connection', connectionId);
  }
  
  // Log the current connection ID for debugging
  console.log(`API Route - Fetching collections with connection ID: ${connectionId}`);
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

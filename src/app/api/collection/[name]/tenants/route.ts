import { NextRequest, NextResponse } from 'next/server';
import { getTenants } from '@/lib/weaviate';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const name = pathParts[pathParts.length - 2]; // Get collection name from path
    
    if (!name) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    console.log(`API Route - Fetching tenants for collection: ${name}`);
    const tenants = await getTenants(name);
    console.log(`API Route - Found ${tenants.length} tenants for ${name}`);
    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('API Route - Error fetching tenants:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tenants',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


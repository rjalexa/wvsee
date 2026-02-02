import { NextResponse } from 'next/server';
import { getCollections, getWeaviateClient } from '@/lib/weaviate';
import { getConnectionId } from '@/lib/connection';
import weaviate from 'weaviate-client';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action !== 'create-test') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    console.log('Creating test collection...');
    const client = await getWeaviateClient();

    // Check if collection already exists
    const existingCollections = await client.collections.listAll();
    const collectionExists = Array.from(existingCollections.values()).some(
      (config) => config.name === 'Test'
    );

    if (collectionExists) {
      return NextResponse.json(
        { error: 'Collection "Test" already exists' },
        { status: 400 }
      );
    }

    // Create the test collection with a simple schema
    await client.collections.create({
      name: 'Test',
      description: 'A simple test collection for demonstration purposes',
      properties: [
        {
          name: 'name',
          dataType: weaviate.configure.dataType.TEXT,
          description: 'The name of the item',
        },
        {
          name: 'description',
          dataType: weaviate.configure.dataType.TEXT,
          description: 'A description of the item',
        },
        {
          name: 'count',
          dataType: weaviate.configure.dataType.INT,
          description: 'A numeric count value',
        },
        {
          name: 'created_at',
          dataType: weaviate.configure.dataType.DATE,
          description: 'Creation timestamp',
        },
      ],
    });

    console.log('Test collection created successfully');

    // Add a few sample objects
    const collection = client.collections.get('Test');
    await collection.data.insertMany([
      {
        name: 'First Item',
        description: 'This is the first test item',
        count: 1,
        created_at: new Date().toISOString(),
      },
      {
        name: 'Second Item',
        description: 'This is the second test item',
        count: 2,
        created_at: new Date().toISOString(),
      },
      {
        name: 'Third Item',
        description: 'This is the third test item',
        count: 3,
        created_at: new Date().toISOString(),
      },
    ]);

    console.log('Sample objects added to test collection');

    return NextResponse.json({
      success: true,
      message: 'Test collection created with 3 sample objects',
    });
  } catch (error) {
    console.error('Error creating test collection:', error);
    return NextResponse.json(
      {
        error: 'Failed to create test collection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

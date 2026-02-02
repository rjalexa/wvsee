import weaviate, { WeaviateClient } from 'weaviate-client';
import ConnectionStore from './connectionStore';
import { CollectionInfo, CollectionData } from './types';

const connectionStore = ConnectionStore.getInstance();

let clientInstance: WeaviateClient | null = null;
let currentUrl: string | null = null;

export async function getWeaviateClient(): Promise<WeaviateClient> {
  const url = connectionStore.url;

  if (!url) {
    throw new Error('Weaviate URL is not configured');
  }

  // If we have a client and the URL hasn't changed, return the existing client
  if (clientInstance && currentUrl === url) {
    return clientInstance;
  }

  // Otherwise, create a new client
  console.log(`Initializing Weaviate client for URL: ${url}`);

  try {
    // Parse the URL to get host and scheme
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = `http://${url}`;
    }

    const urlObj = new URL(formattedUrl);
    const host = urlObj.hostname;
    const port = parseInt(urlObj.port || '8080');
    const scheme = urlObj.protocol.replace(':', '');
    const apiKey = process.env.WEAVIATE_API_KEY;

    // Create connection config with API key authentication
    if (apiKey) {
      clientInstance = await weaviate.connectToCustom({
        host,
        port,
        grpcPort: 50051,
        scheme,
        authCredentials: {
          apiKey: apiKey,
        },
      });
    } else {
      // Connect without authentication
      clientInstance = await weaviate.connectToCustom({
        host,
        port,
        grpcPort: 50051,
        scheme,
      });
    }

    currentUrl = url;
    return clientInstance;
  } catch (error) {
    console.error('Failed to initialize Weaviate client:', error);
    throw error;
  }
}

export async function getCollections(): Promise<CollectionInfo[]> {
  const client = await getWeaviateClient();
  const collectionsMap = await client.collections.listAll();
  
  const result: CollectionInfo[] = [];
  
  for (const config of collectionsMap.values()) {
    const collection = client.collections.get(config.name);
    
    // Get object count
    // @ts-expect-error - The aggregate API might have changed in v3, but this works
    const response = await collection.aggregate.overAll().withTotalCount().do();
    const count = response.totalCount || 0;

    result.push({
      name: config.name,
      description: config.description,
      count,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: config.properties?.map((p: any) => ({
        name: p.name,
        dataType: [p.dataType as string],
        description: p.description
      })) || []
    });
  }
  
  return result;
}

export async function getCollectionData(
  className: string,
  properties: { name: string; dataType: string | string[] }[],
  sort?: { property: string; order: 'asc' | 'desc' } | null,
  limit: number = 100,
  offset: number = 0,
): Promise<CollectionData[]> {
  const client = await getWeaviateClient();
  const collection = client.collections.get(className);
  
  let query = collection.query.fetchObjects({
    limit,
    offset,
    returnProperties: properties.map(p => p.name),
  });

  if (sort) {
    query = collection.query.fetchObjects({
      limit,
      offset,
      returnProperties: properties.map(p => p.name),
      // @ts-expect-error - The sort API might have changed in v3, but this works
      sort: collection.sort.byProperty(sort.property, sort.order === 'asc' ? 'asc' : 'desc')
    });
  }

  const response = await query;
  
  return response.objects.map(obj => ({
    ...obj.properties,
    _additional: {
      id: obj.uuid
    }
  }));
}

export async function deleteObjects(className: string, objectIds: string[]): Promise<void> {
  const client = await getWeaviateClient();
  const collection = client.collections.get(className);
  
  await collection.data.deleteMany(
    collection.filter.byId().containsAny(objectIds)
  );
}

export async function deleteCollection(className: string): Promise<void> {
  const client = await getWeaviateClient();
  await client.collections.delete(className);
}


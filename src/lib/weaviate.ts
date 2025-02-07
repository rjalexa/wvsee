type SortConfig = {
  property: string;
  order: 'asc' | 'desc';
} | null;

export async function getCollectionData(
  className: string, 
  properties: { name: string; dataType: string | string[] }[],
  sort?: SortConfig
): Promise<CollectionData[]> {
  try {
    const sortDirective = sort ? 
      `sort: [{
        path: ["${sort.property}"],
        order: ${sort.order.toLowerCase()}
      }]` : '';

    const query = `{
      Get {
        ${className}${sortDirective ? `(${sortDirective})` : ''} {
          ${properties.map(p => p.name).join('\n')}
        }
      }
    }`;

    console.log('Executing GraphQL query:', JSON.stringify({ query }, null, 2));
    console.log(`\n*** Collection: ${className}`);
    console.log(`\tFetching data`);
    const response = await executeQuery(query);
    
    if (!response?.data?.Get) {
      throw new Error('Invalid response structure from Weaviate');
    }
    
    return response.data.Get[className] || [];
  } catch (error) {
    console.error(`Error fetching data for collection "${className}":`, error);
    throw error;
  }
}

export interface CollectionInfo {
  name: string;
  description?: string;
  count: number;
  properties: {
    name: string;
    description?: string;
    dataType?: string[];
  }[];
}

export async function deleteCollection(className: string): Promise<void> {
  console.log(`\n*** Collection: ${className}`);
  console.log(`\tDeleting collection`);
  try {
    const response = await fetch(`${WEAVIATE_URL}/v1/schema/${className}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error(`Failed to delete collection "${className}". Status: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to delete collection: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error deleting collection "${className}":`, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      } : error
    });
    throw error;
  }
}

export type { WeaviateCollection };

export interface Copertine {
  testataName: string;
  editionId: string;
  editionDateIsoStr: string;
  captionStr: string;
  kickerStr: string;
  captionAIStr: string;
  imageAIDeStr: string;
  modelAIName: string;
}

/**
 * A generic object type for Weaviate item data.
 */
export type CollectionData = Record<string, unknown>;

type WeaviateResponse = {
  data: {
    Get: Record<string, CollectionData[]>;
  };
};

type AggregateResponse = {
  data: {
    Aggregate: Record<string, { meta: { count: number } }[]>;
  };
};

type WeaviateClass = {
  class: string;
  description?: string;
  properties?: {
    name: string;
    dataType: string[];
    description?: string;
  }[];
};

type WeaviateSchemaResponse = {
  classes?: WeaviateClass[];
};

type WeaviateCollection = {
  name: string;
  description?: string;
  count: number;
  properties: string[];
};

const WEAVIATE_URL = process.env.WEAVIATE_URL;

export function getWeaviateUrl(): string {
  return WEAVIATE_URL || 'URL not configured';
}

if (!WEAVIATE_URL) {
  console.error('WEAVIATE_URL is not configured');
  throw new Error('Weaviate URL is not configured. Please check your environment variables.');
}

export async function executeQuery(queryStr: string): Promise<WeaviateResponse> {
  try {
    const response = await fetch(`${WEAVIATE_URL}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: queryStr }),
    });

    if (!response.ok) {
      console.error(`GraphQL query failed with status: ${response.status} ${response.statusText}`);
      throw new Error(`Query failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('GraphQL response:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('GraphQL query error:', {
      url: WEAVIATE_URL,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      } : error
    });
    throw error;
  }
}

export async function getObjectsByClass(className: string): Promise<CollectionData[]> {
  console.log(`\n*** Collection: ${className}`);
  console.log(`\tFetching objects`);
  const query = `
  {
    Get {
      ${className} {
        _additional {
          id
        }
      }
    }
  }`;

  const response = await executeQuery(query);
  const results = response.data.Get[className] || [];
  return results;
}

export async function getCollections(): Promise<CollectionInfo[]> {
  console.log(`Connected to Weaviate at: ${WEAVIATE_URL}`);
  try {
    const response = await fetch(`${WEAVIATE_URL}/v1/schema`);
    if (!response.ok) {
      console.error(`Failed to fetch schema. Status: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch schema: ${response.statusText}`);
    }

    const schema: WeaviateSchemaResponse = await response.json();
    const classes = schema.classes ?? [];

    const result: CollectionInfo[] = [];
    for (const weavClass of classes) {
      console.log(`\n*** Collection: ${weavClass.class}`);
      console.log(`\tFetching object count`);
      const count = await getObjectCount(weavClass.class);
      console.log(`\tFetching properties`);
      result.push({
        name: weavClass.class,
        description: weavClass.description,
        count,
        properties: weavClass.properties?.map((p) => ({
          name: p.name,
          dataType: p.dataType,
          description: p.description
        })) ?? [],
      });
    }

    return result;
  } catch (error) {
    console.error('Error fetching collections:', {
      url: WEAVIATE_URL,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      } : error
    });
    throw error;
  }
}

async function executeAggregateQuery(queryStr: string, className: string): Promise<AggregateResponse> {
  try {
    const response = await fetch(`${WEAVIATE_URL}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: queryStr }),
    });

    if (!response.ok) {
      console.error(`Query failed for collection "${className}". Status: ${response.status} ${response.statusText}`);
      throw new Error(`Query failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Query error for collection "${className}":`, {
      url: WEAVIATE_URL,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      } : error
    });
    throw error;
  }
}

async function getObjectCount(className: string): Promise<number> {
  const aggregateQuery = `
  {
    Aggregate {
      ${className} {
        meta {
          count
        }
      }
    }
  }`;

  let aggregateResponse: AggregateResponse | null = null;
  try {
    aggregateResponse = await executeAggregateQuery(aggregateQuery, className);
  } catch (error) {
    console.error(`Error fetching count for collection "${className}":`, error);
    return 0;
  }

  const aggregateData =
    aggregateResponse?.data.Aggregate[className] ?? [];

  return aggregateData[0]?.meta?.count ?? 0;
}

import { NextRequest, NextResponse } from 'next/server';
import { setWeaviateUrl, setConnectionId, getConnectionId } from '@/lib/weaviate';
import ConnectionStore from '@/lib/connectionStore';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    // Store the current connection ID for later comparison
    const currentConnectionId = getConnectionId();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (_err) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // Test connection to Weaviate and get server info
    try {
      // First check if the server is reachable
      const testResponse = await fetch(`${url}/v1/schema`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Short timeout to avoid hanging if the server is unreachable
        signal: AbortSignal.timeout(5000),
      });
      
      if (!testResponse.ok) {
        return NextResponse.json(
          { 
            error: 'Failed to connect to Weaviate',
            details: `Status: ${testResponse.status} ${testResponse.statusText}`
          },
          { status: 502 }
        );
      }
      
      // Get server info to identify the instance
      const metaResponse = await fetch(`${url}/v1/meta`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });
      
      if (!metaResponse.ok) {
        return NextResponse.json(
          { 
            error: 'Failed to get Weaviate server info',
            details: `Status: ${metaResponse.status} ${metaResponse.statusText}`
          },
          { status: 502 }
        );
      }
      
      const metaData = await metaResponse.json();
      
      // Create a unique identifier for this connection that includes server metadata
      // and also ensures uniqueness even for the same server
      const connectionStore = ConnectionStore.getInstance();
      const serverInfo = `${metaData.version || 'unknown'}|${metaData.hostname || 'unknown'}`;
      const newConnectionId = connectionStore.generateConnectionId(`${url}|${serverInfo}`);
      
      // Check if we're connecting to the same instance
      if (currentConnectionId === newConnectionId) {
        console.log('Connecting to the same Weaviate instance');
      } else {
        console.log('Connecting to a different Weaviate instance');
      }
      
      // Store the connection ID
      setConnectionId(newConnectionId);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Failed to connect to Weaviate',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 502 }
      );
    }
    
    // Update the Weaviate URL in the application
    setWeaviateUrl(url);
    
    return NextResponse.json({ 
      success: true, 
      url,
      newConnection: getConnectionId() !== currentConnectionId || !currentConnectionId
    });
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

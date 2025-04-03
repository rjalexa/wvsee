'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface WeaviateConnectorProps {
  initialUrl: string;
}

export function WeaviateConnector({ initialUrl }: WeaviateConnectorProps) {
  const [url, setUrl] = useState(initialUrl);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const router = useRouter();

  // Extract host and port from URL
  const parseUrl = (fullUrl: string): { host: string, port: number, grpcPort: number } => {
    try {
      const urlObj = new URL(fullUrl);
      return {
        host: urlObj.hostname,
        port: parseInt(urlObj.port || '8080'),
        grpcPort: 50051 // Default gRPC port
      };
    } catch {
      // If URL is invalid, return default values
      return { host: '127.0.0.1', port: 8080, grpcPort: 50051 };
    }
  };

  // Clear connection status when URL changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setConnectionStatus(null); // Clear the connection status message
  };

  // Handle click on the input field to select all text
  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select(); // Select all text when clicked
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);
      setErrorHint(null);
      
      // Format URL properly if needed
      let formattedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = `http://${url}`;
      }
      
      // Parse the URL to get host and port
      const { host, port, grpcPort } = parseUrl(formattedUrl);
      
      // Call API to update the connection
      const response = await fetch('/api/connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: formattedUrl,
          host,
          port,
          grpcPort
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Store the error details and hint
        setError(result.details || result.error || 'Failed to connect to Weaviate');
        if (result.hint) {
          setErrorHint(result.hint);
        }
        return; // Exit early
      }
      
      // Show connection status message
      if (result.newConnection) {
        setConnectionStatus('Connected to a different Weaviate instance');
      } else {
        setConnectionStatus('Connected to the same Weaviate instance');
      }
      
      // Instead of just refreshing the page, we need to force a full reload
      // to ensure all components get the updated connection
      if (result.newConnection) {
        // Force a hard reload to clear any cached data
        window.location.reload();
      } else {
        // Just refresh the page for same instance connections
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to connect:', error);
      
      // Check if the error is from our API response
      if (error instanceof Error && error.message.includes('details')) {
        try {
          // Try to parse the error message as JSON
          const errorData = JSON.parse(error.message.substring(error.message.indexOf('{')));
          setError(errorData.details || errorData.error || 'Failed to connect to Weaviate');
          setErrorHint(errorData.hint || null);
        } catch {
          // If parsing fails, just use the error message
          setError(error.message);
        }
      } else {
        setError(error instanceof Error ? error.message : 'Failed to connect to Weaviate');
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-end gap-2">
        <div className="flex-grow">
          <label htmlFor="weaviate-url" className="block text-sm font-medium text-gray-700 mb-1">
            Weaviate URL
            <span className="ml-1 text-xs text-gray-500">(Use internal Docker port, e.g., http://weaviate2025:8080 not :8090)</span>
          </label>
          <input
            type="text"
            id="weaviate-url"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={url}
            onChange={handleUrlChange}
            onClick={handleInputClick}
            placeholder="http://localhost:8080"
          />
        </div>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {connecting ? 'Connecting...' : 'Connect'}
        </button>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
          {errorHint && (
            <div className="mt-1 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              <strong>Tip:</strong> {errorHint}
            </div>
          )}
        </div>
      )}
      
      {connectionStatus && !error && (
        <div className="mt-2 text-sm text-green-600">
          {connectionStatus}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

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
        setConnectionStatus('Connected to a different Weaviate instance. Reloading...');
        // Delay reload slightly to show the success message
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setConnectionStatus('Already connected to this Weaviate instance');
        // Just refresh the data without full reload
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Connection Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <div className="flex-grow space-y-2">
            <Label htmlFor="weaviate-url">
              Weaviate URL
              <span className="ml-1 text-xs text-muted-foreground">(Use internal Docker port, e.g., http://weaviate2025:8080 not :8090)</span>
            </Label>
            <Input
              type="text"
              id="weaviate-url"
              value={url}
              onChange={handleUrlChange}
              onClick={handleInputClick}
              placeholder="http://localhost:8080"
            />
          </div>
          <Button
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {errorHint && (
                <div className="mt-1 text-xs bg-destructive/10 p-2 rounded">
                  <strong>Tip:</strong> {errorHint}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {connectionStatus && !error && (
          <Alert className="mt-4 border-green-500 text-green-700 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {connectionStatus}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * A simple server-side store for the Weaviate connection URL.
 * This ensures the URL is stored in a single place and persists across API routes.
 */

// The singleton instance that will be shared across all imports
let instance: ConnectionStore | null = null;

class ConnectionStore {
  private _url: string;
  private _connectionId: string = "";
  private _apiKey: string = "";

  private constructor(initialUrl: string) {
    this._url = initialUrl;
  }

  static getInstance(initialUrl?: string): ConnectionStore {
    if (!instance) {
      if (!initialUrl) {
        initialUrl = process.env.WEAVIATE_URL || "";
      }
      instance = new ConnectionStore(initialUrl);
    }
    return instance;
  }
  
  get url(): string {
    return this._url;
  }
  
  set url(newUrl: string) {
    this._url = newUrl;
    // Note: We can't directly modify process.env in Next.js as it's read-only
    // The singleton pattern ensures the URL is consistent across the application
  }

  get connectionId(): string {
    return this._connectionId;
  }

  set connectionId(id: string) {
    this._connectionId = id;
  }

  get apiKey(): string {
    return this._apiKey;
  }

  set apiKey(key: string) {
    this._apiKey = key;
  }

  // Reset the store (mainly for testing purposes)
  reset(initialUrl?: string): void {
    this._url = initialUrl || process.env.WEAVIATE_URL || "";
    this._connectionId = "";
    this._apiKey = "";
  }

  // Generate a unique connection ID based on the URL and a timestamp
  // This ensures that even connections to the same URL are treated as different
  // if they happen at different times
  generateConnectionId(url: string): string {
    return `${url}|${Date.now()}`;
  }
}

export default ConnectionStore;

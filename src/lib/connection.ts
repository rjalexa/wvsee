import ConnectionStore from './connectionStore';

const connectionStore = ConnectionStore.getInstance();

export function getConnectionId(): string {
  return connectionStore.connectionId;
}

export function setConnectionId(id: string): void {
  connectionStore.connectionId = id;
}

export function getWeaviateUrl(): string {
  return connectionStore.url;
}

export function setWeaviateUrl(url: string): void {
  connectionStore.url = url;
}
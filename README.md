# Copertine Viewer

A web application for viewing and managing Weaviate collections.

## Development Setup

### Local Development

The repository includes a `.env` file configured for local development:
```
WEAVIATE_HOST=localhost:8080
```

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000 and will automatically connect to your local Weaviate instance at http://localhost:8080.

## Production Deployment

### Prerequisites

- Docker and Docker Compose installed
- A running Weaviate instance in Docker with a network named `weaviate-network`

For example, if your Weaviate is running with this docker-compose.yml:
```yaml
version: '3.8'
services:
  weaviate:
    image: semitechnologies/weaviate:latest
    ports:
      - "8080:8080"
    networks:
      - weaviate-network
    # ... other Weaviate configuration ...

networks:
  weaviate-network:
    name: weaviate-network
```

### Deployment Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd copertine-viewer
   ```

2. Build and start the application:
   ```bash
   docker compose up -d
   ```

This will:
- Build the application in production mode
- Connect to the existing `weaviate-network`
- Use the Weaviate service name as host (`weaviate:8080`)
- Make the application available at http://localhost:3000

### Environment Configuration

The application uses the following environment variables:
- `WEAVIATE_HOST`: The Weaviate host (defaults to `localhost:8080` in development, `weaviate` in Docker)
- `NODE_ENV`: The Node.js environment (`development` or `production`)
- `PORT`: The port to run the application on (defaults to 3000)

### Docker Networks

The application is configured to work with a Weaviate instance running in Docker:

- In development, it connects to your local Weaviate instance at `localhost:8080`
- In production, it connects to the Weaviate service through Docker's internal network (`weaviate-network`)

Make sure your Weaviate container is running and accessible through the `weaviate-network` before deploying the application.

### Health Checks

The application includes Docker health checks that verify its availability. You can monitor the health status with:
```bash
docker compose ps
```

### Troubleshooting

1. If you can't connect to Weaviate:
   - Check if Weaviate is running: `docker ps`
   - Verify network connectivity: `docker network inspect weaviate-network`
   - Check Weaviate logs: `docker logs <weaviate-container-id>`

2. If the application isn't starting:
   - Check application logs: `docker compose logs -f copertine-viewer`
   - Verify environment variables: `docker compose config`
   - Check if ports are available: `netstat -an | grep 3000`

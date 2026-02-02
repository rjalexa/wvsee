.PHONY: help install dev build test clean docker-build docker-up docker-down docker-logs docker-restart docker-clean run-docker-prod

help:  ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development (Host)
install:  ## Install dependencies locally
	@echo "Installing dependencies..."
	pnpm install

dev:  ## Run development server on host
	@echo "Starting development server..."
	pnpm dev

build:  ## Build for production on host
	@echo "Building production assets..."
	pnpm build

test:  ## Run tests locally
	@echo "Running linter..."
	pnpm lint

clean:  ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	rm -rf .next out dist build node_modules/.cache

# Production (Docker)
docker-build:  ## Build Docker image
	@echo "Building Docker image..."
	docker compose build

docker-up:  ## Start production container (detached)
	@echo "Starting Docker container..."
	docker compose up -d

docker-down:  ## Stop production container
	@echo "Stopping Docker container..."
	docker compose down

docker-logs:  ## View container logs (follow mode)
	@echo "Showing container logs (Ctrl+C to exit)..."
	docker compose logs -f weaviate-viewer

docker-restart:  ## Restart production container
	@echo "Restarting Docker container..."
	docker compose restart weaviate-viewer

docker-clean:  ## Stop and remove container, images, and volumes
	@echo "Cleaning up Docker resources..."
	docker compose down -v
	docker rmi wvsee-weaviate-viewer 2>/dev/null || true

run-docker-prod:  ## Build and run Docker container in production
	@echo "Building and starting production container..."
	@$(MAKE) docker-build
	@$(MAKE) docker-up
	@echo ""
	@echo "✅ Container started successfully!"
	@echo "📊 Access the viewer at: http://localhost:3200"
	@echo "📝 View logs with: make docker-logs"
	@echo ""

# Combined targets
rebuild:  ## Rebuild and restart Docker container
	@echo "Rebuilding and restarting container..."
	@$(MAKE) docker-down
	@$(MAKE) docker-build
	@$(MAKE) docker-up

status:  ## Show Docker container status
	@echo "Container status:"
	@docker ps | grep -E "CONTAINER ID|weaviate-viewer" || echo "Container not running"

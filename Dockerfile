# ----------------
#  Dockerfile
# ----------------
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm and dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Set build-time environment variables
ARG WEAVIATE_URL=http://weaviate:8080
ENV WEAVIATE_URL=${WEAVIATE_URL}

# Build application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Install pnpm (needed at runtime to run the server if you rely on pnpm commands)
RUN npm install -g pnpm

# Create non-root user (build-time choice so container doesn't run as root)
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && chown -R nextjs:nodejs /app

USER nextjs

# Copy built assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the server
CMD ["node", "server.js"]

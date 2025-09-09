# Multi-stage build for production optimization
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
# Check for lockfile to determine package manager
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .

# Set build-time environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_ENVIRONMENT=production

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

# Build application
RUN npm run build

# Production image
FROM nginx:alpine AS runner

# Install security updates
RUN apk --no-cache add ca-certificates \
    && apk --no-cache update \
    && apk --no-cache upgrade

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Switch to non-root user
USER nodejs

EXPOSE 80

CMD ["/start.sh"]
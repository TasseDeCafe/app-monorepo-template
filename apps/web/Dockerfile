# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json lingui.config.js babel.config.js ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/web/ ./apps/web/

# Build args for environment-specific builds
ARG RAILWAY_ENVIRONMENT_NAME
ARG VITE_API_HOST

# Convert ARGs to ENVs so they're available during build
ENV RAILWAY_ENVIRONMENT_NAME=${RAILWAY_ENVIRONMENT_NAME}
ENV VITE_API_HOST=${VITE_API_HOST}

# Set VITE_API_HOST for preview builds if not explicitly set
RUN if [ "$RAILWAY_ENVIRONMENT_NAME" != "production" ] && [ -n "$RAILWAY_ENVIRONMENT_NAME" ] && [ -z "$VITE_API_HOST" ]; then \
      export VITE_API_HOST="https://template-appbackend-${RAILWAY_ENVIRONMENT_NAME}.up.railway.app"; \
    fi && \
    pnpm turbo run build --filter=@template-app/web

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/web/dist/ /usr/share/nginx/html/

# Copy nginx config template
COPY apps/web/nginx.conf.template /etc/nginx/nginx.conf.template

# Substitute PORT variable at runtime, then start nginx
CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

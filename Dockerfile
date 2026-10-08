# syntax=docker/dockerfile:1

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy project source
COPY . .

# Build with standalone node-server preset
ENV NITRO_PRESET=node-server
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy output from builder
COPY --from=builder /app/.output ./

# Set user for security
USER node

EXPOSE 3000

CMD ["node", "server/index.mjs"]

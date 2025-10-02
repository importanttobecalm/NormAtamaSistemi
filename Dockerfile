# Stage 1: Build client
FROM node:18-alpine AS client-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Setup server
FROM node:18-alpine AS server-setup

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Stage 3: Final runtime
FROM node:18-alpine

WORKDIR /app

# Copy built client
COPY --from=client-builder /app/client/build ./client/build

# Copy server files
COPY --from=server-setup /app/server/node_modules ./server/node_modules
COPY server/ ./server/

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/index.js"]
